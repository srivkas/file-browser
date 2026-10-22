import { describe, expect, it } from 'vitest';
import { PREVIEW_MAX_BYTES, previewPlan } from './preview';

const sized = (name: string, size: number, type = '') => {
  const f = new File([], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('previewPlan', () => {
  it('plain text and Markdown', () => {
    expect(previewPlan(sized('notes.txt', 10, 'text/plain'))).toBe('plain');
    expect(previewPlan(sized('package.json', 10, 'application/json'))).toBe('plain');
    expect(previewPlan(sized('README.md', 10))).toBe('markdown');
    expect(previewPlan(sized('index.ts', 10, 'video/mp2t'))).toBe('plain');
  });

  it('no preview for files that are not text', () => {
    expect(previewPlan(sized('photo.png', 10, 'image/png'))).toBe('none');
    expect(previewPlan(sized('logo.svg', 10, 'image/svg+xml'))).toBe('none');
    expect(previewPlan(sized('a.zip', 10, 'application/zip'))).toBe('none');
    expect(previewPlan(sized('a.pdf', 10, 'application/pdf'))).toBe('none');
  });

  it('not-text wins over size: no message for empty or huge non-text files', () => {
    expect(previewPlan(sized('photo.png', 0, 'image/png'))).toBe('none');
    expect(previewPlan(sized('a.zip', PREVIEW_MAX_BYTES + 1, 'application/zip'))).toBe('none');
  });

  it('size limit: exactly 1 MB is shown, one byte more is not', () => {
    expect(previewPlan(sized('a.txt', PREVIEW_MAX_BYTES, 'text/plain'))).toBe('plain');
    expect(previewPlan(sized('a.txt', PREVIEW_MAX_BYTES + 1, 'text/plain'))).toBe('too-large');
    expect(previewPlan(sized('a.md', PREVIEW_MAX_BYTES + 1))).toBe('too-large');
  });

  it('empty text files, Markdown or not', () => {
    expect(previewPlan(sized('a.txt', 0, 'text/plain'))).toBe('empty');
    expect(previewPlan(sized('a.md', 0))).toBe('empty');
  });
});
