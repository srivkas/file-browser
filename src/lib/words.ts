/** Number of words: runs of non-whitespace, in any script. Punctuation counts as part of the word it touches. */
export function countWords(text: string): number {
  return text.match(/\S+/g)?.length ?? 0;
}
