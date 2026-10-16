import { describe, expect, it } from 'vitest';
import { extension, fileType, formatBytes, formatRelativeTime } from './format';
import { formatExif } from './image';

describe('formatBytes', () => {
  it('formats across units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(25 * 1024 * 1024)).toBe('25 MB');
  });
});

describe('fileType', () => {
  it('prefers MIME type and falls back to extension', () => {
    expect(fileType(new File([], 'a.png', { type: 'image/png' }))).toBe('image/png');
    expect(fileType(new File([], 'notes.MD'))).toBe('.md file');
    expect(fileType(new File([], 'Makefile'))).toBe('Unknown');
    expect(extension('.bashrc')).toBe('');
  });
});

describe('formatExif', () => {
  it('keeps readable values and drops binary data', () => {
    const rows = formatExif({
      Make: 'Canon',
      FNumber: 2.8,
      ExposureTime: 0.0012345,
      Flash: false,
      GPSVersionID: [2, 3, 0, 0],
      MakerNote: new Uint8Array(10),
      Empty: '  ',
    });
    expect(rows).toEqual([
      ['Make', 'Canon'],
      ['FNumber', '2.8'],
      ['ExposureTime', '0.0012'],
      ['Flash', 'No'],
      ['GPSVersionID', '2, 3, 0, 0'],
    ]);
  });
});

describe('formatRelativeTime', () => {
  it('pluralises and handles now', () => {
    expect(formatRelativeTime({ unit: 'now' })).toBe('just now');
    expect(formatRelativeTime({ unit: 'minute', count: 1 })).toBe('1 minute ago');
    expect(formatRelativeTime({ unit: 'day', count: 2 })).toBe('2 days ago');
    expect(formatRelativeTime({ unit: 'year', count: 2 })).toBe('2 years ago');
  });
});
