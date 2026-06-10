import { z } from 'zod';

// Contact information
export const ContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.string()).default([]),
});

// Experience entry
export const ExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

// Project entry
export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

// Education entry
export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  graduationDate: z.string().optional(),
});

// Certification entry
export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
});

// Resume profile
export const ResumeProfileSchema = z.object({
  contact: ContactSchema.optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceEntrySchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
  rawText: z.string().optional(),
});

// Job description profile
export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  tools: z.array(z.string()),
  keywords: z.array(z.string()),
  seniorityLevel: z.enum(['intern', 'entry', 'mid', 'senior', 'staff', 'unknown']),
  domainSignals: z.array(z.string()),
  softSkills: z.array(z.string()),
  rawText: z.string().optional(),
});

// Score breakdown item
export const ScoreBreakdownItemSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
});

// Match score
export const MatchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  preferredSkillCoverageScore: z.number().min(0).max(100).optional(),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()),
  explanation: z.string(),
  breakdown: z.array(ScoreBreakdownItemSchema).optional(),
});

// Bullet rewrite
export const BulletRewriteSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low']),
  riskFlag: z.string().optional(),
  userConfirmed: z.boolean().optional(),
});

// Tailored experience entry
export const TailoredExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(BulletRewriteSchema),
});

// Tailored project entry
export const TailoredProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  bullets: z.array(BulletRewriteSchema),
  technologies: z.array(z.string()).optional(),
});

// Tailored resume
export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string().optional(),
  tailoredSkills: z.array(z.string()),
  tailoredExperience: z.array(TailoredExperienceEntrySchema),
  tailoredProjects: z.array(TailoredProjectEntrySchema).optional(),
});

// Resume gap
export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
  category: z.enum(['skill', 'tool', 'domain', 'seniority', 'qualification']),
});

// Gap analysis
export const GapAnalysisSchema = z.object({
  gaps: z.array(ResumeGapSchema),
});

// Tailoring run status
export const TailoringRunStatusSchema = z.enum([
  'pending',
  'parsed',
  'scored',
  'tailored',
  'complete',
  'failed',
]);

// Tailoring run (aggregate root)
export const TailoringRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  resumeHash: z.string(),
  jdHash: z.string(),
  resume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalMatchScore: MatchScoreSchema,
  tailoredMatchScore: MatchScoreSchema.optional(),
  tailoredResume: TailoredResumeSchema.optional(),
  gapAnalysis: GapAnalysisSchema.optional(),
  status: TailoringRunStatusSchema,
  error: z.string().optional(),
});
