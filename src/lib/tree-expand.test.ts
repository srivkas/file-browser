import { describe, expect, it } from 'vitest';
import { buildTree } from './tree';
import { filterTree } from './filter';
import { collapseAll, expandAll } from './tree-expand';

const entry = (path: string) => ({ path, file: new File(['x'], path.split('/').pop()!) });

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

const sorted = (set: ReadonlySet<string>) => [...set].sort();

describe('expandAll', () => {
  it('opens every folder in the tree, root included', () => {
    expect(sorted(expandAll(root, new Set(['r'])))).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/photos']);
  });

  it('opens only the folders the filter shows, keeping the ones already open', () => {
    const shown = filterTree(root, 'report');
    expect(sorted(expandAll(shown, new Set(['r', 'r/photos'])))).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/photos']);
    expect(sorted(expandAll(shown, new Set(['r'])))).toEqual(['r', 'r/docs', 'r/docs/deep']);
  });

  it('changes nothing when the filter matches nothing', () => {
    expect(sorted(expandAll(null, new Set(['r', 'r/docs'])))).toEqual(['r', 'r/docs']);
  });

  it('does not change the set it was given', () => {
    const open = new Set(['r']);
    expandAll(root, open);
    expect(sorted(open)).toEqual(['r']);
  });
});

describe('collapseAll', () => {
  it('leaves only the root open', () => {
    expect(sorted(collapseAll(root))).toEqual(['r']);
  });
});
