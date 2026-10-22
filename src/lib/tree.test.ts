import { describe, expect, it } from 'vitest';
import { buildTree, findFile, type DirNode, type TreeNode } from './tree';

const entry = (path: string) => ({ path, file: new File(['x'], path.split('/').pop()!) });
const names = (dir: DirNode) => dir.children.map((c: TreeNode) => c.name);

describe('buildTree', () => {
  it('returns null for an empty folder', () => {
    expect(buildTree([])).toBeNull();
  });

  it('nests files under their folders', () => {
    const root = buildTree([entry('root/a.txt'), entry('root/docs/b.txt'), entry('root/docs/deep/c.txt')])!;
    expect(root.name).toBe('root');
    const docs = root.children.find((c) => c.name === 'docs') as DirNode;
    expect(docs.kind).toBe('dir');
    expect(names(docs)).toEqual(['deep', 'b.txt']);
    expect((docs.children[0] as DirNode).children[0].path).toBe('root/docs/deep/c.txt');
  });

  it('sorts folders first, then names naturally', () => {
    const root = buildTree([entry('r/file10.txt'), entry('r/file2.txt'), entry('r/Beta/x'), entry('r/alpha/y')])!;
    expect(names(root)).toEqual(['alpha', 'Beta', 'file2.txt', 'file10.txt']);
  });
});

describe('findFile', () => {
  const root = buildTree([entry('proj/README.md'), entry('proj/img/a.png'), entry('proj/docs/guide.md')])!;

  it('finds a file by its tree path', () => {
    expect(findFile(root, 'proj/img/a.png')?.name).toBe('a.png');
    expect(findFile(root, 'proj/README.md')?.name).toBe('README.md');
  });

  it('returns null for a missing file, a folder, or another root', () => {
    expect(findFile(root, 'proj/img/b.png')).toBeNull();
    expect(findFile(root, 'proj/img')).toBeNull();
    expect(findFile(root, 'proj')).toBeNull();
    expect(findFile(root, 'proj/README.md/x')).toBeNull();
    expect(findFile(root, 'other/README.md')).toBeNull();
  });

  it('matches names whatever their Unicode normalization form', () => {
    const nfd = 'cafe\u0301.png';
    const nfc = 'caf\u00e9.png';
    const tree = buildTree([entry(`proj/${nfd}`)])!;
    expect(findFile(tree, `proj/${nfc}`)?.name).toBe(nfd);
    expect(findFile(root, `proj/img/${nfc}`)).toBeNull();
  });
});
