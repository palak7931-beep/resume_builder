export type IngestionResult = {
  rawText: string;
  sourceFormat: 'text' | 'pdf' | 'docx';
  warnings: string[];
};

export function normalizePlainText(text: string): IngestionResult {
  const normalized = text.replace(/\r\n/g, '\n').trim();

  return {
    rawText: normalized,
    sourceFormat: 'text',
    warnings: [],
  };
}

export async function parseUploadedDocument(fileBase64: string, fileName: string): Promise<IngestionResult> {
  const buffer = Buffer.from(fileBase64, 'base64');
  const sourceFormat = getSourceFormat(fileName);

  let rawText = '';
  if (sourceFormat === 'pdf') {
    rawText = await extractTextFromPdf(buffer);
  } else if (sourceFormat === 'docx') {
    rawText = await extractTextFromDocx(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }

  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  const warnings = extractIngestionWarnings(normalized, sourceFormat, fileName);

  return {
    rawText: normalized,
    sourceFormat,
    warnings,
  };
}

function getSourceFormat(fileName: string): 'pdf' | 'docx' {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (extension === 'docx') {
    return 'docx';
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

async function loadPdfParse() {
  const module = await import('pdf-parse');
  return (module as any).default ?? module;
}

async function loadMammoth() {
  const module = await import('mammoth');
  return (module as any).default ?? module;
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = await loadPdfParse();
  const data = await pdfParse(buffer as any);
  return String((data as any).text || '');
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await loadMammoth();
  const result = await mammoth.extractRawText({ buffer });
  return String(result.value || '');
}

function extractIngestionWarnings(rawText: string, sourceFormat: 'pdf' | 'docx', fileName: string): string[] {
  const warnings: string[] = [];

  if (rawText.length < 200) {
    warnings.push('Extracted text is very short; the file may contain non-text content or extraction issues.');
  }

  const weirdCharRatio = getWeirdCharacterRatio(rawText);
  if (weirdCharRatio > 0.08) {
    warnings.push('The extracted text contains unusual characters; verify the parsed output for formatting or extraction errors.');
  }

  if (sourceFormat === 'pdf' && (rawText.match(/\n/g)?.length ?? 0) > 200 && (rawText.match(/ {2,}/g)?.length ?? 0) > 20) {
    warnings.push('PDF extraction may include spacing artifacts; review the parsed text carefully.');
  }

  if (fileName.toLowerCase().includes('scan') && !rawText.match(/[A-Za-z0-9]/)) {
    warnings.push('The uploaded file appears to be a scan rather than selectable text. If the text was not extracted correctly, try a different version of the resume.');
  }

  return warnings;
}

function getWeirdCharacterRatio(text: string): number {
  const weirdChars = text.replace(/[\p{L}\p{N}\p{P}\p{Zs}\n\r\t]/gu, '');
  return text.length === 0 ? 0 : weirdChars.length / text.length;
}
