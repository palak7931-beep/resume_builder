import { describe, expect, it } from 'vitest';
import { applyTruthfulnessGuardrails, detectUnsupportedClaims, verifySkillReorder } from './truthfulness';
import type { ResumeProfile, BulletRewrite } from './types';

const resume: ResumeProfile = {
  contact: { name: 'Ava Smith' },
  summary: 'Experienced software engineer',
  skills: ['React', 'Node.js', 'TypeScript'],
  experience: [
    {
      company: 'Acme Corp',
      title: 'Software Engineer',
      bullets: ['Built reusable UI components using React and TypeScript.'],
    },
  ],
  projects: [],
  education: [],
  certifications: [],
  rawText: 'Built reusable UI components using React and TypeScript.',
};

describe('truthfulness helpers', () => {
  it('detects unsupported claim metrics and seniority terms', () => {
    const issues = detectUnsupportedClaims(
      'Built reusable UI components using React and TypeScript.',
      'Led a team of 5 engineers while improving reliability by 20%.',
      resume
    );

    expect(issues.some((issue) => issue.includes('Introduced new metric values'))).toBe(true);
    expect(issues.some((issue) => issue.includes('Added seniority language'))).toBe(true);
  });

  it('flags unsupported technical terms not present in resume skills or original bullet', () => {
    const issues = detectUnsupportedClaims(
      'Built reusable UI components using React and TypeScript.',
      'Designed integrations with GraphQL and AWS.',
      resume
    );

    expect(issues.some((issue) => issue.includes('Potential unsupported technical terms'))).toBe(true);
  });

  it('reverts high-severity unsupported claims to the original bullet', () => {
    const rewrite: BulletRewrite = {
      original: 'Built reusable UI components using React and TypeScript.',
      tailored: 'Led a team of 5 engineers while improving reliability by 20%.',
      changeReason: 'Made leadership and impact more explicit.',
      keywordsAddressed: ['leadership', 'reliability'],
      confidence: 'high',
    };

    const result = applyTruthfulnessGuardrails(rewrite.original, rewrite, resume);

    expect(result.tailored).toBe(rewrite.original);
    expect(result.confidence).toBe('low');
    expect(result.riskFlag).toContain('Reverted due to unsupported claim');
    expect(result.userConfirmed).toBe(false);
  });

  it('preserves user confirmation when confidence is high and no issues are detected', () => {
    const rewrite: BulletRewrite = {
      original: 'Built reusable UI components using React and TypeScript.',
      tailored: 'Built reusable UI components using React and TypeScript.',
      changeReason: 'No change needed.',
      keywordsAddressed: ['React', 'TypeScript'],
      confidence: 'high',
    };

    const result = applyTruthfulnessGuardrails(rewrite.original, rewrite, resume);

    expect(result.userConfirmed).toBeUndefined();
    expect(result.riskFlag).toBeUndefined();
  });

  it('returns false for skill reorder when the tailored skill list adds an unknown skill', () => {
    const result = verifySkillReorder(['React', 'Node.js', 'Firebase'], resume);
    expect(result).toBe(false);
  });

  it('returns true when the tailored skill list contains only resume skills', () => {
    const result = verifySkillReorder(['TypeScript', 'React', 'Node.js'], resume);
    expect(result).toBe(true);
  });
});
