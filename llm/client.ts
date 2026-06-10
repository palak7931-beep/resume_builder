import Groq from 'groq-sdk';

let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

const MAX_RETRIES = 2;
const TIMEOUT_MS = 60000;

export interface LlmConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stage?: string;
}

export interface LlmResponse<T> {
  data: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LlmError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'LlmError';
  }
}

/**
 * Truncates text to fit within character limits while preserving section boundaries
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  // Try to truncate at a section boundary (common resume/JD section headers)
  const sectionHeaders = [
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'summary',
    'responsibilities',
    'qualifications',
    'requirements',
  ];

  const truncated = text.slice(0, maxChars);
  
  // Find the last complete sentence or section boundary
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('\n\n'),
    truncated.lastIndexOf('\n')
  );

  if (lastSentenceEnd > maxChars * 0.8) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }

  return truncated;
}

/**
 * Calls Groq API with retry logic and timeout
 */
export async function callLlm(
  systemPrompt: string,
  userPrompt: string,
  config: LlmConfig = {}
): Promise<string> {
  const model = config.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const stage = config.stage || 'callLlm';
  const startTime = Date.now();
  const startTimestamp = new Date(startTime).toISOString();
  console.log('llm_call_start', { stage, model, startTimestamp });
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getGroqClient();
      const response = await Promise.race([
        client.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model,
          temperature: config.temperature ?? 0.3,
          max_tokens: config.maxTokens ?? 4096,
          response_format: { type: 'json_object' },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
        ),
      ]) as any;
      const endTime = Date.now();
      const endTimestamp = new Date(endTime).toISOString();
      const durationMs = endTime - startTime;
      console.log('llm_call_end', { stage, model, startTimestamp, endTimestamp, durationMs, attempt });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LlmError('LLM_EMPTY_RESPONSE', 'LLM returned empty response');
      }

      return content;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'CONFIG_ERROR' || error.code === 'LLM_VALIDATION_FAILED') {
        throw error;
      }

      // Retry on rate limits and server errors
      if (attempt < MAX_RETRIES && (error.status === 429 || error.status >= 500)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new LlmError('LLM_UNKNOWN_ERROR', 'Unknown LLM error');
}
