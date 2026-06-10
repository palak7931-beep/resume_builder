import { z } from 'zod';
import { callLlm, LlmError, LlmConfig } from './client';

const MAX_REPAIR_ATTEMPTS = 2;

/**
 * Calls LLM and validates response against Zod schema
 * On validation failure, attempts repair with error context
 */
export async function completeStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodSchema<T>,
  config: LlmConfig = {}
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    try {
      const response = await callLlm(systemPrompt, userPrompt, config);
      
      // Strip markdown code fences if present
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(-3);
      }
      jsonText = jsonText.trim();

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.log('completeStructured_parse_error', { stage: config.stage, attempt, error: parseError instanceof Error ? parseError.message : String(parseError) });
        throw new LlmError('LLM_JSON_PARSE_ERROR', 'Failed to parse LLM response as JSON', parseError);
      }

      // Validate against schema
      const result = schema.safeParse(parsed);
      if (!result.success) {
        const errorDetails = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        console.log('completeStructured_validation_failed', { stage: config.stage, attempt, errorDetails });
        
        if (attempt < MAX_REPAIR_ATTEMPTS) {
          // Attempt repair with error context
          const repairPrompt = `${userPrompt}\n\nYour previous response had validation errors:\n${errorDetails}\n\nPlease fix these errors and return valid JSON matching the schema.`;
          userPrompt = repairPrompt;
          lastError = new LlmError('LLM_VALIDATION_FAILED', `Schema validation failed: ${errorDetails}`, result.error);
          continue;
        }
        
        throw new LlmError('LLM_VALIDATION_FAILED', `Schema validation failed after repair attempts: ${errorDetails}`, result.error);
      }

      return result.data;
    } catch (error: any) {
      if (error instanceof LlmError) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new LlmError('LLM_UNKNOWN_ERROR', 'Unknown error in structured completion');
}
