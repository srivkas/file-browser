import { isImage } from './image';
import type { DirNode } from './tree';

export interface TreeSummary {
  files: number;
  images: number;
}

/** Counts every file at any depth (folders are not counted), and how many are images. */
export function summarizeTree(root: DirNode): TreeSummary {
  const summary: TreeSummary = { files: 0, images: 0 };
  const stack: DirNode[] = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const child of dir.children) {
      if (child.kind === 'dir') {
        stack.push(child);
      } else {
        summary.files++;
        if (isImage(child.file)) summary.images++;
      }
    }
  }
  return summary;
}
