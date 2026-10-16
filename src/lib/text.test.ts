import { describe, expect, it } from 'vitest';
import { canCountLines, countLines, isTextFile, MAX_LINE_COUNT_BYTES } from './text';

describe('countLines', () => {
  it('empty file has 0 lines', () => {
    expect(countLines('')).toBe(0);
  });

  it('no trailing newline', () => {
    expect(countLines('one')).toBe(1);
    expect(countLines('one\ntwo\nthree')).toBe(3);
  });

  it('trailing newline does not add a line', () => {
    expect(countLines('one\n')).toBe(1);
    expect(countLines('one\ntwo\nthree\n')).toBe(3);
  });

  it('Windows line endings', () => {
    expect(countLines('one\r\ntwo\r\nthree')).toBe(3);
    expect(countLines('one\r\ntwo\r\nthree\r\n')).toBe(3);
  });

  it('blank lines count', () => {
    expect(countLines('\n')).toBe(1);
    expect(countLines('a\n\n\nb')).toBe(4);
  });
});

describe('isTextFile', () => {
  const file = (name: string, type = '') => new File(['x'], name, { type });

  it('uses the MIME type when present', () => {
    expect(isTextFile(file('notes.txt', 'text/plain'))).toBe(true);
    expect(isTextFile(file('data.csv', 'text/csv'))).toBe(true);
    expect(isTextFile(file('data.json', 'application/json'))).toBe(true);
    expect(isTextFile(file('feed.atom', 'application/atom+xml'))).toBe(true);
    expect(isTextFile(file('photo.png', 'image/png'))).toBe(false);
    expect(isTextFile(file('logo.svg', 'image/svg+xml'))).toBe(false);
    expect(isTextFile(file('doc.pdf', 'application/pdf'))).toBe(false);
    expect(isTextFile(file('archive.zip', 'application/zip'))).toBe(false);
  });

  it('falls back to the extension when the MIME type is blank', () => {
    expect(isTextFile(file('App.tsx'))).toBe(true);
    expect(isTextFile(file('index.ts'))).toBe(true);
    expect(isTextFile(file('README.MD'))).toBe(true);
    expect(isTextFile(file('blob.bin'))).toBe(false);
    expect(isTextFile(file('Makefile'))).toBe(false);
  });
});

describe('canCountLines', () => {
  it('skips files over 50 MB', () => {
    const sized = (size: number) => {
      const f = new File([], 'big.txt', { type: 'text/plain' });
      Object.defineProperty(f, 'size', { value: size });
      return f;
    };
    expect(canCountLines(sized(MAX_LINE_COUNT_BYTES))).toBe(true);
    expect(canCountLines(sized(MAX_LINE_COUNT_BYTES + 1))).toBe(false);
  });

  it('skips binary files', () => {
    expect(canCountLines(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).toBe(false);
  });
});
