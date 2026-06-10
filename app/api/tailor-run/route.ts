import { NextRequest } from 'next/server';
import { parseResume } from '@/services/resume-parser';
import { parseJobDescription } from '@/services/jd-parser';
import { computeMatchScore } from '@/services/match-engine';
import { tailorResume } from '@/services/tailoring-engine';
import { analyzeGaps } from '@/services/gap-engine';
import { normalizePlainText } from '@/services/document-ingestion';
import { hashContent } from '@/lib/hash';
import { TailoringRunSchema } from '@/lib/schemas';
import { errorResponse, successResponse } from '@/lib/api-response';
import { LlmError } from '@/llm/client';
import { mockTailoringRun } from '@/lib/mock-data';
import type { TailoringRun } from '@/lib/types';

const MAX_RESUME_CHARS = parseInt(process.env.MAX_RESUME_CHARS || '32000', 10);
const MAX_JD_CHARS = parseInt(process.env.MAX_JD_CHARS || '16000', 10);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let llmCalls = 0;

  try {
    const body = await request.json();
    const { resumeText, jdText } = body;

    if (!resumeText || !jdText) {
      return errorResponse('Missing resumeText or jdText', 'INVALID_INPUT', undefined, 400);
    }

    if (resumeText.length < 100 || jdText.length < 100) {
      return errorResponse('Both resume and JD must be at least 100 characters', 'INVALID_INPUT', undefined, 400);
    }

    if (resumeText.length > MAX_RESUME_CHARS) {
      return errorResponse(`Resume text exceeds ${MAX_RESUME_CHARS} character limit`, 'INVALID_INPUT', undefined, 400);
    }

    if (jdText.length > MAX_JD_CHARS) {
      return errorResponse(`Job description text exceeds ${MAX_JD_CHARS} character limit`, 'INVALID_INPUT', undefined, 400);
    }

    // Normalize inputs
    const normalizedResume = normalizePlainText(resumeText);
    const normalizedJD = normalizePlainText(jdText);

    // Generate hashes
    const resumeHash = hashContent(normalizedResume.rawText);
    const jdHash = hashContent(normalizedJD.rawText);

    // Provide a local fallback when the Groq API key is not configured.
    if (!process.env.GROQ_API_KEY?.trim()) {
      console.warn('GROQ_API_KEY not set; returning local mock tailoring run.');
      const fallbackRun: TailoringRun = {
        ...mockTailoringRun,
        id: `mock-${Date.now()}`,
        createdAt: new Date().toISOString(),
        resumeHash,
        jdHash,
        resume: {
          ...mockTailoringRun.resume,
          rawText: normalizedResume.rawText,
        },
        jobDescription: {
          ...mockTailoringRun.jobDescription,
          rawText: normalizedJD.rawText,
        },
      };

      return successResponse(fallbackRun);
    }

    // Parse resume and JD in parallel
    llmCalls += 2;
    const [resume, jobDescription] = await Promise.all([
      parseResume(normalizedResume.rawText),
      parseJobDescription(normalizedJD.rawText),
    ]);

    // Compute original match score
    llmCalls += 1;
    const originalMatchScore = await computeMatchScore(resume, jobDescription);

    // Analyze gaps
    llmCalls += 1;
    const gapAnalysis = await analyzeGaps(resume, jobDescription);

    // Tailor resume
    llmCalls += 1;
    const tailoredResume = await tailorResume(resume, jobDescription);

    // Compute tailored match score
    llmCalls += 1;
    const tailoredMatchScore = await computeMatchScore(
      { ...resume, skills: tailoredResume.tailoredSkills },
      jobDescription
    );

    // Build TailoringRun
    const tailoringRun: TailoringRun = {
      id: `${resumeHash.slice(0, 8)}-${jdHash.slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      resumeHash,
      jdHash,
      resume,
      jobDescription,
      originalMatchScore,
      tailoredMatchScore,
      tailoredResume,
      gapAnalysis,
      status: 'complete',
    };

    // Validate against schema
    const validationResult = TailoringRunSchema.safeParse(tailoringRun);
    if (!validationResult.success) {
      console.error('TailoringRun validation failed:', validationResult.error);
      return errorResponse('Internal validation error', 'VALIDATION_ERROR', undefined, 500);
    }

    // Log completion
    const durationMs = Date.now() - startTime;
    console.log('tailor_run_complete', {
      runId: tailoringRun.id,
      durationMs,
      originalScore: originalMatchScore.overallScore,
      tailoredScore: tailoredMatchScore.overallScore,
      bulletCount: tailoredResume.tailoredExperience.reduce((acc, exp) => acc + exp.bullets.length, 0),
      gapCount: gapAnalysis.gaps.length,
      llmCalls,
    });

    return successResponse(tailoringRun);
  } catch (error: any) {
    console.error('Tailor run error:', error);
    
    if (error instanceof LlmError) {
      return errorResponse(error.message, error.code, error.details, 500);
    }
    
    if (error.code === 'CONFIG_ERROR') {
      return errorResponse('Server configuration error', 'CONFIG_ERROR', undefined, 500);
    }

    return errorResponse('Failed to complete tailoring run', 'TAILOR_RUN_ERROR', error.message, 500);
  }
}
