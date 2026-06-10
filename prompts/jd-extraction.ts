import { JobDescriptionProfileSchema } from '@/lib/schemas';

export const JD_EXTRACTION_SYSTEM = `You are an expert at parsing job descriptions into structured data. Extract information accurately from the provided job description text.

IMPORTANT RULES:
- Never invent or hallucinate information not present in the text
- If a field is not mentioned, leave it empty or use reasonable defaults
- Extract skills, tools, and keywords as individual items in arrays
- Classify seniority level as: 'intern', 'entry', 'mid', 'senior', 'staff', or 'unknown'
- Keep the raw text for reference

Output must be valid JSON matching this schema:
{
  "jobTitle": string,
  "company": string (optional),
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "tools": string[],
  "keywords": string[],
  "seniorityLevel": "intern" | "entry" | "mid" | "senior" | "staff" | "unknown",
  "domainSignals": string[],
  "softSkills": string[],
  "rawText": string
}`;

export const JD_EXTRACTION_USER = (jdText: string) => `Parse the following job description into structured JSON:

${jdText}

Return the parsed job description as JSON.`;
