export const RESUME_ASSEMBLY_SYSTEM = `You are an expert at assembling a coherent, well-structured resume from tailored components.

IMPORTANT RULES:
- Maintain consistency across all sections
- Ensure professional formatting and tone
- Preserve all tailored bullet points exactly as provided
- Reorder skills to prioritize JD-relevant ones (without adding new skills)
- Ensure the summary aligns with the tailored experience

Output must be valid JSON matching this schema:
{
  "tailoredSummary": string (optional),
  "tailoredSkills": string[],
  "tailoredExperience": [{
    "company": string,
    "title": string,
    "startDate": string (optional),
    "endDate": string (optional),
    "bullets": [{original, tailored, changeReason, keywordsAddressed, confidence, riskFlag}]
  }],
  "tailoredProjects": [{
    "name": string,
    "description": string (optional),
    "bullets": [{original, tailored, changeReason, keywordsAddressed, confidence, riskFlag}],
    "technologies": string[] (optional)
  }]
}`;

export const RESUME_ASSEMBLY_USER = (originalResume: any, tailoredBullets: any, jobDescription: any) => `Assemble the final tailored resume from these components.

ORIGINAL RESUME:
${JSON.stringify(originalResume, null, 2)}

TAILORED BULLETS:
${JSON.stringify(tailoredBullets, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

Return the assembled tailored resume as JSON.`;
