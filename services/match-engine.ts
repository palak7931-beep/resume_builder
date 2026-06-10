import { MatchScoreSchema } from '@/lib/schemas';
import { completeStructured } from '@/llm/structured-output';
import { MATCH_SCORING_SYSTEM, MATCH_SCORING_USER } from '@/prompts/match-scoring';
import { computeSkillOverlapScore, computeKeywordOverlapScore, computeSeniorityScore } from '@/lib/scoring';
import type { MatchScore, ResumeProfile, JobDescriptionProfile } from '@/lib/types';

export async function computeMatchScore(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile
): Promise<MatchScore> {
  // Compute deterministic scores
  const skillScores = computeSkillOverlapScore(
    resume.skills,
    jobDescription.requiredSkills,
    jobDescription.preferredSkills
  );
  
  const keywordScore = computeKeywordOverlapScore(
    resume.rawText || '',
    jobDescription.keywords
  );
  
  // Estimate years of experience from resume
  const resumeYears = estimateYearsOfExperience(resume);
  const seniorityScore = computeSeniorityScore(
    resume.contact?.name || '',
    resumeYears,
    jobDescription.seniorityLevel
  );
  
  // Use LLM for responsibility alignment and explanation
  const llmResult = await completeStructured(
    MATCH_SCORING_SYSTEM,
    MATCH_SCORING_USER(resume, jobDescription),
    MatchScoreSchema,
    { model: process.env.GROQ_MODEL_MINI }
  );
  
  // Blend deterministic and LLM scores
  const overallScore = Math.round(
    (skillScores.requiredScore * 0.35) +
    (skillScores.preferredScore * 0.10) +
    (llmResult.responsibilityAlignmentScore * 0.25) +
    (keywordScore * 0.15) +
    (seniorityScore * 0.10) +
    (llmResult.criticalMissingRequirements.length > 0 ? -10 : 0)
  );
  
  return {
    ...llmResult,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    skillCoverageScore: skillScores.requiredScore,
    preferredSkillCoverageScore: skillScores.preferredScore,
    keywordScore,
    seniorityScore,
  };
}

function estimateYearsOfExperience(resume: ResumeProfile): number {
  // Simple heuristic: count experience entries and estimate years
  // This is a rough estimate for the seniority score
  const experienceCount = resume.experience.length;
  if (experienceCount === 0) return 0;
  if (experienceCount === 1) return 2;
  if (experienceCount === 2) return 4;
  if (experienceCount === 3) return 6;
  return experienceCount * 2;
}
