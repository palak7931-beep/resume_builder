import { JobDescriptionProfileSchema } from '@/lib/schemas';
import { completeStructured } from '@/llm/structured-output';
import { truncateText } from '@/llm/client';
import { JD_EXTRACTION_SYSTEM, JD_EXTRACTION_USER } from '@/prompts/jd-extraction';
import type { JobDescriptionProfile } from '@/lib/types';

const MAX_JD_CHARS = parseInt(process.env.MAX_JD_CHARS || '16000', 10);

export async function parseJobDescription(jdText: string): Promise<JobDescriptionProfile> {
  const truncatedText = truncateText(jdText, MAX_JD_CHARS);
  
  const result = await completeStructured(
    JD_EXTRACTION_SYSTEM,
    JD_EXTRACTION_USER(truncatedText),
    JobDescriptionProfileSchema,
    { model: process.env.GROQ_MODEL_MINI, stage: 'parseJobDescription' }
  );
  
  // Deduplicate skills and keywords (case-insensitive)
  const deduplicate = (items: string[]): string[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      const lower = item.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  };
  
  result.requiredSkills = deduplicate(result.requiredSkills);
  result.preferredSkills = deduplicate(result.preferredSkills);
  result.tools = deduplicate(result.tools);
  result.keywords = deduplicate(result.keywords);
  
  // Fallback seniority classification if LLM returns unknown
  if (result.seniorityLevel === 'unknown') {
    const text = truncatedText.toLowerCase();
    if (text.includes('intern') || text.includes('internship')) {
      result.seniorityLevel = 'intern';
    } else if (text.includes('entry') || text.includes('junior')) {
      result.seniorityLevel = 'entry';
    } else if (text.includes('mid') || text.includes('intermediate')) {
      result.seniorityLevel = 'mid';
    } else if (text.includes('senior') || text.includes('sr.')) {
      result.seniorityLevel = 'senior';
    } else if (text.includes('staff') || text.includes('principal') || text.includes('lead')) {
      result.seniorityLevel = 'staff';
    }
  }
  
  return result;
}
