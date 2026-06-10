import { NextRequest } from 'next/server';
import { tailorResume } from '@/services/tailoring-engine';
import { errorResponse, successResponse } from '@/lib/api-response';
import { LlmError } from '@/llm/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume || !jobDescription) {
      return errorResponse('Missing resume or jobDescription', 'INVALID_INPUT', undefined, 400);
    }

    const tailoredResume = await tailorResume(resume, jobDescription);

    return successResponse(tailoredResume);
  } catch (error: any) {
    console.error('Resume tailoring error:', error);
    
    if (error instanceof LlmError) {
      return errorResponse(error.message, error.code, error.details, 500);
    }
    
    if (error.code === 'CONFIG_ERROR') {
      return errorResponse('Server configuration error', 'CONFIG_ERROR', undefined, 500);
    }

    return errorResponse('Failed to tailor resume', 'TAILOR_ERROR', error.message, 500);
  }
}
