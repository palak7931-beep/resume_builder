import { describe, expect, it } from 'vitest';
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
  TailoringRunSchema,
} from './schemas';

describe('Schema validation', () => {
  describe('ContactSchema', () => {
    it('accepts valid contact info', () => {
      const result = ContactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        location: 'San Francisco, CA',
        links: ['https://linkedin.com/in/johndoe'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial contact info', () => {
      const result = ContactSchema.safeParse({
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = ContactSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ExperienceEntrySchema', () => {
    it('accepts valid experience entry', () => {
      const result = ExperienceEntrySchema.safeParse({
        company: 'Tech Corp',
        title: 'Software Engineer',
        startDate: '2020-01',
        endDate: '2022-12',
        location: 'Remote',
        bullets: ['Built features', 'Fixed bugs'],
      });
      expect(result.success).toBe(true);
    });

    it('requires company and title', () => {
      const result = ExperienceEntrySchema.safeParse({
        company: 'Tech Corp',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ProjectEntrySchema', () => {
    it('accepts valid project entry', () => {
      const result = ProjectEntrySchema.safeParse({
        name: 'My Project',
        description: 'A cool project',
        bullets: ['Feature 1', 'Feature 2'],
        technologies: ['React', 'TypeScript'],
      });
      expect(result.success).toBe(true);
    });

    it('requires name and bullets', () => {
      const result = ProjectEntrySchema.safeParse({
        name: 'My Project',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('EducationEntrySchema', () => {
    it('accepts valid education entry', () => {
      const result = EducationEntrySchema.safeParse({
        institution: 'University of Tech',
        degree: 'BS',
        field: 'Computer Science',
        graduationDate: '2020-05',
      });
      expect(result.success).toBe(true);
    });

    it('requires institution', () => {
      const result = EducationEntrySchema.safeParse({
        degree: 'BS',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CertificationEntrySchema', () => {
    it('accepts valid certification entry', () => {
      const result = CertificationEntrySchema.safeParse({
        name: 'AWS Certified Developer',
        issuer: 'Amazon',
        date: '2023-01',
      });
      expect(result.success).toBe(true);
    });

    it('requires name', () => {
      const result = CertificationEntrySchema.safeParse({
        issuer: 'Amazon',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ResumeProfileSchema', () => {
    it('accepts valid resume profile', () => {
      const result = ResumeProfileSchema.safeParse({
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Experienced developer',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Software Engineer',
            bullets: ['Built features'],
          },
        ],
        projects: [],
        education: [],
        certifications: [],
      });
      expect(result.success).toBe(true);
    });

    it('requires skills and experience arrays', () => {
      const result = ResumeProfileSchema.safeParse({
        skills: ['JavaScript'],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('JobDescriptionProfileSchema', () => {
    it('accepts valid JD profile', () => {
      const result = JobDescriptionProfileSchema.safeParse({
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        requiredSkills: ['JavaScript', 'React'],
        preferredSkills: ['TypeScript'],
        responsibilities: ['Build features'],
        qualifications: ['5 years experience'],
        tools: ['Git', 'VS Code'],
        keywords: ['frontend', 'web'],
        seniorityLevel: 'senior',
        domainSignals: ['e-commerce'],
        softSkills: ['communication'],
      });
      expect(result.success).toBe(true);
    });

    it('requires jobTitle and requiredSkills', () => {
      const result = JobDescriptionProfileSchema.safeParse({
        jobTitle: 'Software Engineer',
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        tools: [],
        keywords: [],
        seniorityLevel: 'unknown',
        domainSignals: [],
        softSkills: [],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid seniorityLevel', () => {
      const result = JobDescriptionProfileSchema.safeParse({
        jobTitle: 'Software Engineer',
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        tools: [],
        keywords: [],
        seniorityLevel: 'invalid',
        domainSignals: [],
        softSkills: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('MatchScoreSchema', () => {
    it('accepts valid match score', () => {
      const result = MatchScoreSchema.safeParse({
        overallScore: 75,
        skillCoverageScore: 80,
        preferredSkillCoverageScore: 70,
        responsibilityAlignmentScore: 75,
        keywordScore: 85,
        seniorityScore: 70,
        criticalMissingRequirements: ['Python'],
        explanation: 'Good match overall',
      });
      expect(result.success).toBe(true);
    });

    it('rejects score out of range', () => {
      const result = MatchScoreSchema.safeParse({
        overallScore: 150,
        skillCoverageScore: 80,
        responsibilityAlignmentScore: 75,
        keywordScore: 85,
        seniorityScore: 70,
        criticalMissingRequirements: [],
        explanation: 'Invalid score',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('BulletRewriteSchema', () => {
    it('accepts valid bullet rewrite', () => {
      const result = BulletRewriteSchema.safeParse({
        original: 'Built features',
        tailored: 'Developed scalable features using React',
        changeReason: 'Added technology and impact',
        keywordsAddressed: ['React', 'scalable'],
        confidence: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('accepts with riskFlag', () => {
      const result = BulletRewriteSchema.safeParse({
        original: 'Built features',
        tailored: 'Led team of 10 engineers',
        changeReason: 'Emphasized leadership',
        keywordsAddressed: ['leadership'],
        confidence: 'low',
        riskFlag: 'May overstate scope',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid confidence', () => {
      const result = BulletRewriteSchema.safeParse({
        original: 'Built features',
        tailored: 'Developed features',
        changeReason: 'Minor tweak',
        keywordsAddressed: [],
        confidence: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TailoredExperienceEntrySchema', () => {
    it('accepts valid tailored experience', () => {
      const result = TailoredExperienceEntrySchema.safeParse({
        company: 'Tech Corp',
        title: 'Software Engineer',
        bullets: [
          {
            original: 'Built features',
            tailored: 'Developed scalable features',
            changeReason: 'Added impact',
            keywordsAddressed: ['scalable'],
            confidence: 'high',
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('TailoredResumeSchema', () => {
    it('accepts valid tailored resume', () => {
      const result = TailoredResumeSchema.safeParse({
        tailoredSummary: 'Experienced developer',
        tailoredSkills: ['JavaScript', 'React'],
        tailoredExperience: [
          {
            company: 'Tech Corp',
            title: 'Software Engineer',
            bullets: [],
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ResumeGapSchema', () => {
    it('accepts valid resume gap', () => {
      const result = ResumeGapSchema.safeParse({
        name: 'Python',
        importance: 'high',
        jdEvidence: 'Required in JD',
        resumeEvidence: 'Not found in resume',
        suggestedAction: 'Learn Python',
        canSafelyAdd: false,
        category: 'skill',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid importance', () => {
      const result = ResumeGapSchema.safeParse({
        name: 'Python',
        importance: 'critical',
        jdEvidence: 'Required',
        resumeEvidence: '',
        suggestedAction: 'Learn',
        canSafelyAdd: false,
        category: 'skill',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('GapAnalysisSchema', () => {
    it('accepts valid gap analysis', () => {
      const result = GapAnalysisSchema.safeParse({
        gaps: [
          {
            name: 'Python',
            importance: 'high',
            jdEvidence: 'Required',
            resumeEvidence: '',
            suggestedAction: 'Learn',
            canSafelyAdd: false,
            category: 'skill',
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('TailoringRunSchema', () => {
    it('accepts valid tailoring run', () => {
      const result = TailoringRunSchema.safeParse({
        id: 'run-123',
        createdAt: '2024-01-01T00:00:00Z',
        resumeHash: 'abc123',
        jdHash: 'def456',
        resume: {
          skills: [],
          experience: [],
          projects: [],
          education: [],
          certifications: [],
        },
        jobDescription: {
          jobTitle: 'Software Engineer',
          requiredSkills: [],
          preferredSkills: [],
          responsibilities: [],
          qualifications: [],
          tools: [],
          keywords: [],
          seniorityLevel: 'unknown',
          domainSignals: [],
          softSkills: [],
        },
        originalMatchScore: {
          overallScore: 70,
          skillCoverageScore: 70,
          responsibilityAlignmentScore: 70,
          keywordScore: 70,
          seniorityScore: 70,
          criticalMissingRequirements: [],
          explanation: 'Base score',
        },
        status: 'complete',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = TailoringRunSchema.safeParse({
        id: 'run-123',
        createdAt: '2024-01-01T00:00:00Z',
        resumeHash: 'abc123',
        jdHash: 'def456',
        resume: {
          skills: [],
          experience: [],
          projects: [],
          education: [],
          certifications: [],
        },
        jobDescription: {
          jobTitle: 'Software Engineer',
          requiredSkills: [],
          preferredSkills: [],
          responsibilities: [],
          qualifications: [],
          tools: [],
          keywords: [],
          seniorityLevel: 'unknown',
          domainSignals: [],
          softSkills: [],
        },
        originalMatchScore: {
          overallScore: 70,
          skillCoverageScore: 70,
          responsibilityAlignmentScore: 70,
          keywordScore: 70,
          seniorityScore: 70,
          criticalMissingRequirements: [],
          explanation: 'Base score',
        },
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
