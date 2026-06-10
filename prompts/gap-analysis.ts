export const GAP_ANALYSIS_SYSTEM = `You are an expert at identifying gaps between a resume and job requirements. Provide actionable gap analysis.

IMPORTANT RULES:
- Only flag requirements that are genuinely missing or weak
- Provide evidence from the JD for each gap
- Check resume evidence thoroughly before flagging as missing
- Suggest realistic actions to address each gap
- Classify importance as 'high', 'medium', or 'low'
- Set canSafelyAdd to false for all gaps (never auto-invent experience)

Output must be valid JSON matching this schema:
{
  "gaps": [{
    "name": string,
    "importance": "high" | "medium" | "low",
    "jdEvidence": string,
    "resumeEvidence": string,
    "suggestedAction": string,
    "canSafelyAdd": false,
    "category": "skill" | "tool" | "domain" | "seniority" | "qualification"
  }]
}`;

export const GAP_ANALYSIS_USER = (resume: any, jobDescription: any) => `Analyze gaps between this resume and job description.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

Return the gap analysis as JSON.`;
