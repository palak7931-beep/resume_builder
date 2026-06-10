import { z } from 'zod';
import {
  ContactSchema,
  ExperienceEntrySchema,
  ProjectEntrySchema,
  EducationEntrySchema,
  CertificationEntrySchema,
  ResumeProfileSchema,
  JobDescriptionProfileSchema,
  MatchScoreSchema,
  ScoreBreakdownItemSchema,
  BulletRewriteSchema,
  TailoredExperienceEntrySchema,
  TailoredProjectEntrySchema,
  TailoredResumeSchema,
  ResumeGapSchema,
  GapAnalysisSchema,
  TailoringRunStatusSchema,
  TailoringRunSchema,
} from './schemas';

// Inferred types from Zod schemas
export type Contact = z.infer<typeof ContactSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;
export type ScoreBreakdownItem = z.infer<typeof ScoreBreakdownItemSchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;
export type BulletRewrite = z.infer<typeof BulletRewriteSchema>;
export type TailoredExperienceEntry = z.infer<typeof TailoredExperienceEntrySchema>;
export type TailoredProjectEntry = z.infer<typeof TailoredProjectEntrySchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type ResumeGap = z.infer<typeof ResumeGapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type TailoringRunStatus = z.infer<typeof TailoringRunStatusSchema>;
export type TailoringRun = z.infer<typeof TailoringRunSchema>;
