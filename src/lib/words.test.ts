import { describe, expect, it } from 'vitest';
import { countWords } from './words';
import { formatWordCount } from './format';

// Level 7 exercise 5: written before the feature and committed red.
// The goal that builds the feature may not change this file.

describe('countWords', () => {
  it('counts runs of non-whitespace', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('one')).toBe(1);
  });

  it('is 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  \r\n')).toBe(0);
  });

  it('treats spaces, tabs and newlines alike, and ignores repeats and edges', () => {
    expect(countWords('  a\tb\n\nc\r\nd   ')).toBe(4);
  });

  it('counts punctuation and code as part of the word it touches', () => {
    expect(countWords('const x = 1;')).toBe(4);
    expect(countWords("it's well-known, isn't it?")).toBe(4);
  });

  it('counts words in any script', () => {
    expect(countWords('שלום עולם')).toBe(2);
  });
});

describe('formatWordCount', () => {
  it('groups thousands like the line count', () => {
    expect(formatWordCount(0)).toBe('0');
    expect(formatWordCount(1204)).toBe('1,204');
  });
});
