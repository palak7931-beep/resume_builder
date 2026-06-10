import type { ResumeProfile, BulletRewrite } from '@/lib/types';

const SENIORITY_TERMS = [
  'senior',
  'lead',
  'led',
  'leadership',
  'architect',
  'principal',
  'director',
  'manager',
  'owner',
  'ownership',
  'managed',
  'directed',
  'strategic',
  'executive',
];

const METRIC_PATTERN = /\b\d+(?:\.\d+)?%?\b/g;
const TECH_TOKEN_PATTERN = /\b[A-Za-z0-9.+#-]{2,}\b/g;

export function detectUnsupportedClaims(
  originalBullet: string,
  tailoredBullet: string,
  resume: ResumeProfile
): string[] {
  const issues: string[] = [];
  const originalLower = originalBullet.toLowerCase();
  const tailoredLower = tailoredBullet.toLowerCase();

  const originalMetrics = new Set(originalBullet.match(METRIC_PATTERN) ?? []);
  const tailoredMetrics = new Set(tailoredBullet.match(METRIC_PATTERN) ?? []);
  const newMetrics = [...tailoredMetrics].filter((value) => !originalMetrics.has(value));

  if (newMetrics.length > 0) {
    issues.push(`Introduced new metric values: ${newMetrics.join(', ')}`);
  }

  const newSeniority = SENIORITY_TERMS.filter(
    (term) => tailoredLower.includes(term) && !originalLower.includes(term)
  );

  if (newSeniority.length > 0) {
    issues.push(`Added seniority language: ${newSeniority.join(', ')}`);
  }

  const originalTokens = new Set(
    [...(originalBullet.match(TECH_TOKEN_PATTERN) ?? [])].map((token) => token.toLowerCase())
  );
  const resumeSkillTokens = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const allowedTokens = new Set([...originalTokens, ...resumeSkillTokens]);

  const newTechTerms = [...new Set(tailoredBullet.match(TECH_TOKEN_PATTERN) ?? [])].filter(
    (token) =>
      /[A-Z0-9]|[+#.]/.test(token) &&
      !allowedTokens.has(token.toLowerCase()) &&
      token.length > 1
  );

  if (newTechTerms.length > 0) {
    issues.push(`Potential unsupported technical terms: ${newTechTerms.slice(0, 5).join(', ')}`);
  }

  return issues;
}

export function verifySkillReorder(
  tailoredSkills: string[],
  resume: ResumeProfile
): boolean {
  const resumeSkillSet = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  return tailoredSkills.every((skill) => resumeSkillSet.has(skill.toLowerCase()));
}

export function applyTruthfulnessGuardrails(
  originalBullet: string,
  rewrite: BulletRewrite,
  resume: ResumeProfile
): BulletRewrite {
  const issues = detectUnsupportedClaims(originalBullet, rewrite.tailored, resume);
  const requiresReview = rewrite.confidence === 'low' || Boolean(rewrite.riskFlag);

  const baseRewrite: BulletRewrite = {
    ...rewrite,
    userConfirmed: rewrite.userConfirmed ?? (requiresReview ? false : undefined),
  };

  if (issues.length === 0) {
    return baseRewrite;
  }

  const hasHighSeverity = issues.some((issue) =>
    /metric|seniority|unsupported technical/i.test(issue)
  );

  if (hasHighSeverity) {
    return {
      ...baseRewrite,
      tailored: originalBullet,
      confidence: 'low',
      riskFlag: `Reverted due to unsupported claim: ${issues.join('; ')}`,
      userConfirmed: false,
    };
  }

  return {
    ...baseRewrite,
    confidence: 'low',
    riskFlag: `Review for unsupported claims: ${issues.join('; ')}`,
    userConfirmed: false,
  };
}
