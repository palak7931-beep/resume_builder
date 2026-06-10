import { NextRequest } from 'next/server';
import { parseJobDescription } from '@/services/jd-parser';
import { normalizePlainText } from '@/services/document-ingestion';
import { errorResponse, successResponse } from '@/lib/api-response';
import { LlmError } from '@/llm/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return errorResponse('Missing or invalid text field', 'INVALID_INPUT', undefined, 400);
    }

    if (text.length < 100) {
      return errorResponse('Job description text must be at least 100 characters', 'INVALID_INPUT', undefined, 400);
    }

    const normalized = normalizePlainText(text);
    const jd = await parseJobDescription(normalized.rawText);

    return successResponse(jd);
  } catch (error: any) {
    console.error('JD parsing error:', error);
    
    if (error instanceof LlmError) {
      return errorResponse(error.message, error.code, error.details, 500);
    }
    
    if (error.code === 'CONFIG_ERROR') {
      return errorResponse('Server configuration error', 'CONFIG_ERROR', undefined, 500);
    }

    return errorResponse('Failed to parse job description', 'PARSE_ERROR', error.message, 500);
  }
}
