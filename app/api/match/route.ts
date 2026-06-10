import { NextRequest } from 'next/server';
import { computeMatchScore } from '@/services/match-engine';
import { errorResponse, successResponse } from '@/lib/api-response';
import { LlmError } from '@/llm/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume || !jobDescription) {
      return errorResponse('Missing resume or jobDescription', 'INVALID_INPUT', undefined, 400);
    }

    const matchScore = await computeMatchScore(resume, jobDescription);

    return successResponse(matchScore);
  } catch (error: any) {
    console.error('Match scoring error:', error);
    
    if (error instanceof LlmError) {
      return errorResponse(error.message, error.code, error.details, 500);
    }
    
    if (error.code === 'CONFIG_ERROR') {
      return errorResponse('Server configuration error', 'CONFIG_ERROR', undefined, 500);
    }

    return errorResponse('Failed to compute match score', 'SCORE_ERROR', error.message, 500);
  }
}
