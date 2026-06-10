import { NextRequest } from 'next/server';
import { parseResume } from '@/services/resume-parser';
import { normalizePlainText, parseUploadedDocument } from '@/services/document-ingestion';
import { errorResponse, successResponse } from '@/lib/api-response';
import { LlmError } from '@/llm/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, fileBase64, fileName } = body;

    let ingestion;
    if (fileBase64 && typeof fileBase64 === 'string') {
      if (!fileName || typeof fileName !== 'string') {
        return errorResponse('Missing or invalid fileName', 'INVALID_INPUT', undefined, 400);
      }

      ingestion = await parseUploadedDocument(fileBase64, fileName);
    } else if (text && typeof text === 'string') {
      if (text.length < 100) {
        return errorResponse('Resume text must be at least 100 characters', 'INVALID_INPUT', undefined, 400);
      }

      ingestion = normalizePlainText(text);
    } else {
      return errorResponse('Missing resume text or file upload', 'INVALID_INPUT', undefined, 400);
    }

    const resume = await parseResume(ingestion.rawText);
    const responseBody = {
      resume: {
        ...resume,
        rawText: ingestion.rawText,
      },
      warnings: ingestion.warnings,
      sourceFormat: ingestion.sourceFormat,
    };

    return successResponse(responseBody);
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    
    if (error instanceof LlmError) {
      return errorResponse(error.message, error.code, error.details, 500);
    }
    
    if (error.code === 'CONFIG_ERROR') {
      return errorResponse('Server configuration error', 'CONFIG_ERROR', undefined, 500);
    }

    return errorResponse('Failed to parse resume', 'PARSE_ERROR', error.message, 500);
  }
}
