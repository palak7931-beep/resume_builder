/** Deterministic scoring helpers — implemented in Phase 1. */

/**
 * Computes skill overlap score between resume skills and JD required/preferred skills
 * Uses fuzzy matching for case-insensitive comparison
 */
export function computeSkillOverlapScore(
  resumeSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): { requiredScore: number; preferredScore: number } {
  const normalizedResumeSkills = resumeSkills.map((s) => s.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase());
  const normalizedPreferredSkills = preferredSkills.map((s) => s.toLowerCase());

  // Count matches for required skills
  const requiredMatches = normalizedRequiredSkills.filter((skill) =>
    normalizedResumeSkills.some((rs) => rs.includes(skill) || skill.includes(rs))
  ).length;

  // Count matches for preferred skills
  const preferredMatches = normalizedPreferredSkills.filter((skill) =>
    normalizedResumeSkills.some((rs) => rs.includes(skill) || skill.includes(rs))
  ).length;

  const requiredScore =
    normalizedRequiredSkills.length > 0
      ? (requiredMatches / normalizedRequiredSkills.length) * 100
      : 0;

  const preferredScore =
    normalizedPreferredSkills.length > 0
      ? (preferredMatches / normalizedPreferredSkills.length) * 100
      : 0;

  return {
    requiredScore: Math.round(requiredScore),
    preferredScore: Math.round(preferredScore),
  };
}

/**
 * Computes keyword overlap score between resume text and JD keywords
 */
export function computeKeywordOverlapScore(
  resumeText: string,
  keywords: string[]
): number {
  const normalizedResumeText = resumeText.toLowerCase();
  const normalizedKeywords = keywords.map((k) => k.toLowerCase());

  const matches = normalizedKeywords.filter((keyword) =>
    normalizedResumeText.includes(keyword)
  ).length;

  return normalizedKeywords.length > 0
    ? Math.round((matches / normalizedKeywords.length) * 100)
    : 0;
}

/**
 * Computes seniority alignment score based on title and experience
 */
export function computeSeniorityScore(
  resumeTitle: string,
  resumeYears: number,
  jdSeniority: string
): number {
  const seniorityLevels = ['intern', 'entry', 'mid', 'senior', 'staff'];
  const jdIndex = seniorityLevels.indexOf(jdSeniority);

  if (jdIndex === -1) return 50; // Unknown seniority

  // Simple heuristic: match years to seniority
  const expectedYears = (jdIndex + 1) * 2; // intern=0-2, entry=2-4, mid=4-6, etc.
  const diff = Math.abs(resumeYears - expectedYears);

  // Score decreases as difference increases
  const score = Math.max(0, 100 - diff * 10);
  return Math.round(score);
}
