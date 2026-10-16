import { describe, expect, it } from 'vitest';
import { formatSummary } from './format';
import { summarizeTree } from './summary';
import type { DirNode, FileNode, TreeNode } from './tree';

const file = (path: string, type = ''): FileNode => {
  const name = path.split('/').pop()!;
  return { kind: 'file', name, path, file: new File(['x'], name, { type }) };
};
const dir = (path: string, children: TreeNode[]): DirNode => ({
  kind: 'dir',
  name: path.split('/').pop()!,
  path,
  children,
});

describe('summarizeTree + formatSummary', () => {
  it('mixed, nested', () => {
    const root = dir('root', [
      file('root/notes.txt', 'text/plain'),
      dir('root/photos', [file('root/photos/a.jpg', 'image/jpeg'), file('root/photos/b.png', 'image/png')]),
    ]);
    expect(summarizeTree(root)).toEqual({ files: 3, images: 2 });
    expect(formatSummary(summarizeTree(root))).toBe('3 files · 2 images');
  });

  it('singulars', () => {
    const root = dir('root', [file('root/cat.webp', 'image/webp')]);
    expect(summarizeTree(root)).toEqual({ files: 1, images: 1 });
    expect(formatSummary(summarizeTree(root))).toBe('1 file · 1 image');
  });

  it('empty, with an empty subfolder', () => {
    const root = dir('root', [dir('root/empty', [])]);
    expect(summarizeTree(root)).toEqual({ files: 0, images: 0 });
    expect(formatSummary(summarizeTree(root))).toBe('0 files · 0 images');
  });

  it('no MIME type and SVG', () => {
    const root = dir('root', [file('root/Makefile'), file('root/logo.svg', 'image/svg+xml')]);
    expect(summarizeTree(root)).toEqual({ files: 2, images: 1 });
    expect(formatSummary(summarizeTree(root))).toBe('2 files · 1 image');
  });

  it('deep nesting', () => {
    const root = dir('root', [
      dir('root/a', [dir('root/a/b', [dir('root/a/b/c', [file('root/a/b/c/deep.gif', 'image/gif')])])]),
      file('root/readme.md', 'text/markdown'),
    ]);
    expect(summarizeTree(root)).toEqual({ files: 2, images: 1 });
    expect(formatSummary(summarizeTree(root))).toBe('2 files · 1 image');
  });
});
