import { describe, expect, it } from 'vitest';
import { buildTree, type DirNode, type TreeNode } from './tree';
import { filterTree, folderPaths } from './filter';

const entry = (path: string) => ({ path, file: new File(['x'], path.split('/').pop()!) });

/** Every path left in the tree, depth-first. */
const paths = (root: DirNode | null): string[] => {
  if (!root) return [];
  const out: string[] = [];
  const walk = (node: TreeNode) => {
    out.push(node.path);
    if (node.kind === 'dir') node.children.forEach(walk);
  };
  walk(root);
  return out;
};

// r/
//   docs/
//     deep/
//       Report.md
//     b.txt
//   photos/
//     cat.jpg
//   a.txt
const root = buildTree([
  entry('r/a.txt'),
  entry('r/docs/b.txt'),
  entry('r/docs/deep/Report.md'),
  entry('r/photos/cat.jpg'),
])!;

describe('filterTree', () => {
  it('keeps only x/b.txt when folder x holds a.txt and b.txt and the filter is "b"', () => {
    const x = buildTree([entry('x/a.txt'), entry('x/b.txt')])!;
    expect(paths(filterTree(x, 'b'))).toEqual(['x', 'x/b.txt']);
  });

  it('returns the same tree for a blank query', () => {
    expect(filterTree(root, '')).toBe(root);
    expect(filterTree(root, '   ')).toBe(root);
  });

  it('shows the folders above each match', () => {
    expect(paths(filterTree(root, 'report'))).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/docs/deep/Report.md']);
  });

  it('ignores case and matches anywhere in the name', () => {
    expect(paths(filterTree(root, 'PORT'))).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/docs/deep/Report.md']);
    expect(paths(filterTree(root, '.jpg'))).toEqual(['r', 'r/photos', 'r/photos/cat.jpg']);
  });

  it('keeps a matching folder even when none of its contents match', () => {
    expect(paths(filterTree(root, 'photo'))).toEqual(['r', 'r/photos']);
  });

  it('does not match on the root’s own name', () => {
    expect(filterTree(root, 'r')).not.toBeNull();
    expect(paths(filterTree(root, 'r'))).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/docs/deep/Report.md']);
  });

  it('returns null when nothing matches', () => {
    expect(filterTree(root, 'zzz')).toBeNull();
  });

  it('leaves the original tree untouched', () => {
    filterTree(root, 'b');
    expect(paths(root)).toHaveLength(8);
  });
});

describe('folderPaths', () => {
  it('lists every folder, root first', () => {
    expect(folderPaths(root)).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/photos']);
  });
});
