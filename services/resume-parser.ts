import { ResumeProfileSchema } from '@/lib/schemas';
import { completeStructured } from '@/llm/structured-output';
import { truncateText } from '@/llm/client';
import { RESUME_PARSER_SYSTEM, RESUME_PARSER_USER } from '@/prompts/resume-parser';
import type { ResumeProfile } from '@/lib/types';

const MAX_RESUME_CHARS = parseInt(process.env.MAX_RESUME_CHARS || '32000', 10);

export async function parseResume(resumeText: string): Promise<ResumeProfile> {
  const truncatedText = truncateText(resumeText, MAX_RESUME_CHARS);
  
  const result = await completeStructured(
    RESUME_PARSER_SYSTEM,
    RESUME_PARSER_USER(truncatedText),
    ResumeProfileSchema,
    { model: process.env.GROQ_MODEL_MINI, stage: 'parseResume' }
  );
  
  return result;
}
