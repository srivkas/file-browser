import { describe, expect, it } from 'vitest';
import { readDirectoryTree } from './directory';
import type { DirNode } from './tree';

type Fake = { kind: 'file'; name: string } | { kind: 'directory'; name: string; children: Fake[] };

/** Minimal stand-in for FileSystemDirectoryHandle / FileSystemFileHandle. */
function fakeHandle(node: Fake): unknown {
  if (node.kind === 'file') {
    return { kind: 'file', name: node.name, getFile: async () => new File(['x'], node.name) };
  }
  return {
    kind: 'directory',
    name: node.name,
    async *values() {
      for (const child of node.children) yield fakeHandle(child);
    },
  };
}

describe('readDirectoryTree', () => {
  it('reads nested folders, keeps empty ones, and sorts', async () => {
    const handle = fakeHandle({
      kind: 'directory',
      name: 'root',
      children: [
        { kind: 'file', name: 'b.txt' },
        { kind: 'directory', name: 'empty', children: [] },
        { kind: 'directory', name: 'docs', children: [{ kind: 'file', name: 'a.md' }] },
      ],
    }) as FileSystemDirectoryHandle;

    const root = await readDirectoryTree(handle);
    expect(root.children.map((c) => c.name)).toEqual(['docs', 'empty', 'b.txt']);
    const docs = root.children[0] as DirNode;
    expect(docs.children[0].path).toBe('root/docs/a.md');
    expect((root.children[1] as DirNode).children).toEqual([]);
  });
});
