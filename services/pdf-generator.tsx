import type { ReactElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import { TailoringRun } from '@/lib/types';
import { TailoredResumePdfTemplate } from '@/templates/tailored-resume-pdf';
import { ComparisonPdfTemplate } from '@/templates/comparison-pdf';

async function renderPdfBuffer(document: ReactElement) {
  // @ts-expect-error React PDF types are not perfectly aligned with this renderer call.
  const output = await pdf(document).toBuffer();
  const stream = output as unknown as ReadableStream<Uint8Array>;
  const arrayBuffer = await new Response(stream).arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateTailoredPdf(run: TailoringRun) {
  return renderPdfBuffer(<TailoredResumePdfTemplate run={run} />);
}

export async function generateComparisonPdf(run: TailoringRun) {
  return renderPdfBuffer(<ComparisonPdfTemplate run={run} />);
}
