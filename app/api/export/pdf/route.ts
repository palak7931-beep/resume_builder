import { NextRequest } from 'next/server';
import { TailoringRunSchema } from '@/lib/schemas';
import { errorResponse } from '@/lib/api-response';
import { generateComparisonPdf, generateTailoredPdf } from '@/services/pdf-generator';
import { makeSafeFilename } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tailoringRun } = body as { type?: string; tailoringRun?: unknown };

    if (!type || (type !== 'tailored' && type !== 'comparison')) {
      return errorResponse('Invalid export type', 'INVALID_INPUT', undefined, 400);
    }

    if (!tailoringRun) {
      return errorResponse('Missing tailoringRun in request body', 'INVALID_INPUT', undefined, 400);
    }

    const parseResult = TailoringRunSchema.safeParse(tailoringRun);
    if (!parseResult.success) {
      return errorResponse('Invalid tailoringRun', 'INVALID_INPUT', parseResult.error.format(), 400);
    }

    const run = parseResult.data;
    if (run.status === 'failed') {
      return errorResponse('Cannot export a failed tailoring run', 'INVALID_RUN_STATUS', undefined, 400);
    }

    if (type === 'tailored' && !run.tailoredResume) {
      return errorResponse('Tailoring incomplete: tailored resume is missing', 'INVALID_RUN_STATUS', undefined, 400);
    }

    const pdfBuffer =
      type === 'tailored'
        ? await generateTailoredPdf(run)
        : await generateComparisonPdf(run);

    const safeName = makeSafeFilename(`${run.jobDescription.jobTitle || 'resume-shapeshifter'}-${type}`);
    const filename = `${safeName}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error: unknown) {
    console.error('PDF export error:', error);
    return errorResponse('Failed to generate PDF', 'PDF_GENERATION_FAILED', undefined, 500);
  }
}
