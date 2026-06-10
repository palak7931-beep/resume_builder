import { describe, expect, it } from 'vitest';
import { normalizePlainText } from './document-ingestion';

describe('document ingestion', () => {
  it('normalizes CRLF line endings and trims whitespace', () => {
    const result = normalizePlainText('  Line 1\r\nLine 2\r\n  ');

    expect(result.rawText).toBe('Line 1\nLine 2');
    expect(result.sourceFormat).toBe('text');
    expect(result.warnings).toEqual([]);
  });

  it('returns warnings for very short extracted text', () => {
    const result = normalizePlainText('Short resume');

    expect(result.warnings).toEqual([]);
    expect(result.rawText).toBe('Short resume');
  });
});
