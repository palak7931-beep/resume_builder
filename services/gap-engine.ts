import { GapAnalysisSchema } from '@/lib/schemas';
import { completeStructured } from '@/llm/structured-output';
import { GAP_ANALYSIS_SYSTEM, GAP_ANALYSIS_USER } from '@/prompts/gap-analysis';
import type { GapAnalysis, ResumeProfile, JobDescriptionProfile } from '@/lib/types';

export async function analyzeGaps(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile
): Promise<GapAnalysis> {
  const result = await completeStructured(
    GAP_ANALYSIS_SYSTEM,
    GAP_ANALYSIS_USER(resume, jobDescription),
    GapAnalysisSchema,
    { model: process.env.GROQ_MODEL_MINI }
  );
  
  // Verify resume evidence for each gap
  const verifiedGaps = result.gaps.map(gap => {
    const resumeText = (resume.rawText || '').toLowerCase();
    const gapNameLower = gap.name.toLowerCase();
    
    // Check if the gap exists in resume (case-insensitive substring match)
    const hasEvidence = resumeText.includes(gapNameLower) ||
      resume.skills.some(s => s.toLowerCase().includes(gapNameLower));
    
    return {
      ...gap,
      resumeEvidence: hasEvidence ? 'Found in resume' : '',
      canSafelyAdd: false, // Always false per architecture
    };
  });
  
  return {
    gaps: verifiedGaps,
  };
}
