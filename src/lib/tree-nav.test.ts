import { describe, expect, it } from 'vitest';
import { buildTree } from './tree';
import { treeKeyAction, visibleRows } from './tree-nav';

const entry = (path: string) => ({ path, file: new File(['x'], path.split('/').pop()!) });

// r/
//   docs/
//     deep/
//       c.txt
//     b.txt
//   empty/   (made empty below)
//   a.txt
const root = buildTree([
  entry('r/a.txt'),
  entry('r/docs/b.txt'),
  entry('r/docs/deep/c.txt'),
  entry('r/empty/x'),
])!;
const empty = root.children.find((c) => c.name === 'empty');
if (empty?.kind === 'dir') empty.children = [];

const paths = (open: string[]) => visibleRows(root, new Set(open)).map((row) => row.node.path);
const act = (focused: string, key: string, open: string[]) => {
  const openPaths = new Set(open);
  return treeKeyAction(visibleRows(root, openPaths), focused, key, openPaths);
};

describe('visibleRows', () => {
  it('shows only the root when nothing is open', () => {
    expect(paths([])).toEqual(['r']);
  });

  it('lists children of open folders depth-first, skipping closed ones', () => {
    expect(paths(['r'])).toEqual(['r', 'r/docs', 'r/empty', 'r/a.txt']);
    expect(paths(['r', 'r/docs'])).toEqual(['r', 'r/docs', 'r/docs/deep', 'r/docs/b.txt', 'r/empty', 'r/a.txt']);
  });

  it('hides an open folder whose parent is closed', () => {
    expect(paths(['r', 'r/docs/deep'])).toEqual(['r', 'r/docs', 'r/empty', 'r/a.txt']);
  });

  it('records each row’s parent folder', () => {
    const rows = visibleRows(root, new Set(['r', 'r/docs']));
    expect(rows.map((row) => row.parentPath)).toEqual([null, 'r', 'r/docs', 'r/docs', 'r', 'r']);
  });
});

describe('treeKeyAction', () => {
  const open = ['r', 'r/docs'];

  it('moves down and up through visible rows', () => {
    expect(act('r/docs', 'ArrowDown', open)).toEqual({ type: 'focus', path: 'r/docs/deep' });
    expect(act('r/docs/b.txt', 'ArrowDown', open)).toEqual({ type: 'focus', path: 'r/empty' });
    expect(act('r/empty', 'ArrowUp', open)).toEqual({ type: 'focus', path: 'r/docs/b.txt' });
  });

  it('stops at the first and last row', () => {
    expect(act('r', 'ArrowUp', open)).toBeNull();
    expect(act('r/a.txt', 'ArrowDown', open)).toBeNull();
  });

  it('jumps to the first and last row with Home and End', () => {
    expect(act('r/docs/b.txt', 'Home', open)).toEqual({ type: 'focus', path: 'r' });
    expect(act('r/docs/b.txt', 'End', open)).toEqual({ type: 'focus', path: 'r/a.txt' });
    expect(act('r', 'Home', open)).toBeNull();
  });

  it('ArrowRight opens a closed folder, then moves to its first child', () => {
    expect(act('r/docs', 'ArrowRight', ['r'])).toEqual({ type: 'open', path: 'r/docs' });
    expect(act('r/docs', 'ArrowRight', open)).toEqual({ type: 'focus', path: 'r/docs/deep' });
  });

  it('ArrowRight does nothing on a file or an open empty folder', () => {
    expect(act('r/a.txt', 'ArrowRight', open)).toBeNull();
    expect(act('r/empty', 'ArrowRight', ['r', 'r/empty'])).toBeNull();
  });

  it('ArrowLeft closes an open folder', () => {
    expect(act('r/docs', 'ArrowLeft', open)).toEqual({ type: 'close', path: 'r/docs' });
  });

  it('ArrowLeft on a file or closed folder moves to the parent', () => {
    expect(act('r/docs/b.txt', 'ArrowLeft', open)).toEqual({ type: 'focus', path: 'r/docs' });
    expect(act('r/docs/deep', 'ArrowLeft', open)).toEqual({ type: 'focus', path: 'r/docs' });
  });

  it('ArrowLeft does nothing on a closed root', () => {
    expect(act('r', 'ArrowLeft', [])).toBeNull();
  });

  it('Enter selects a file and toggles a folder', () => {
    const action = act('r/a.txt', 'Enter', open);
    expect(action?.type).toBe('select');
    expect(action?.type === 'select' && action.node.path).toBe('r/a.txt');
    expect(act('r/docs', 'Enter', open)).toEqual({ type: 'close', path: 'r/docs' });
    expect(act('r/empty', 'Enter', open)).toEqual({ type: 'open', path: 'r/empty' });
  });

  it('ignores other keys and unknown rows', () => {
    expect(act('r/docs', 'a', open)).toBeNull();
    expect(act('r/missing', 'ArrowDown', open)).toBeNull();
  });
});
