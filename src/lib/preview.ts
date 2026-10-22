import { isMarkdownFile, isTextFile } from './text';

/** Text files above this size are not previewed (1 MB). */
export const PREVIEW_MAX_BYTES = 1_048_576;

export type PreviewPlan = 'none' | 'too-large' | 'empty' | 'markdown' | 'plain';

/** What the preview shows for a file, decided from its size and kind before any read. */
export function previewPlan(file: File): PreviewPlan {
  if (!isTextFile(file)) return 'none';
  if (file.size > PREVIEW_MAX_BYTES) return 'too-large';
  if (file.size === 0) return 'empty';
  return isMarkdownFile(file) ? 'markdown' : 'plain';
}
