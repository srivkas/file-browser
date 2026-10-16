export interface FileNode {
  kind: 'file';
  name: string;
  path: string;
  file: File;
}

export interface DirNode {
  kind: 'dir';
  name: string;
  path: string;
  children: TreeNode[];
}

export type TreeNode = FileNode | DirNode;

export interface FileEntry {
  /** Path relative to the picked folder's parent, e.g. "photos/2024/a.jpg". */
  path: string;
  file: File;
}

/** Turns a flat list of files with relative paths into a sorted folder tree. */
export function buildTree(entries: FileEntry[]): DirNode | null {
  if (entries.length === 0) return null;

  const rootName = entries[0].path.split('/')[0];
  const root: DirNode = { kind: 'dir', name: rootName, path: rootName, children: [] };
  const dirs = new Map<string, DirNode>([[root.path, root]]);

  for (const { path, file } of entries) {
    const parts = path.split('/').filter(Boolean);
    let parent = root;
    for (let i = 1; i < parts.length - 1; i++) {
      const dirPath = parts.slice(0, i + 1).join('/');
      let dir = dirs.get(dirPath);
      if (!dir) {
        dir = { kind: 'dir', name: parts[i], path: dirPath, children: [] };
        dirs.set(dirPath, dir);
        parent.children.push(dir);
      }
      parent = dir;
    }
    parent.children.push({ kind: 'file', name: parts[parts.length - 1], path: parts.join('/'), file });
  }

  sortTree(root);
  return root;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Folders first, then natural name order (file2 before file10). */
export function compareNodes(a: TreeNode, b: TreeNode): number {
  if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
  return collator.compare(a.name, b.name);
}

export function sortTree(dir: DirNode): void {
  dir.children.sort(compareNodes);
  for (const child of dir.children) {
    if (child.kind === 'dir') sortTree(child);
  }
}
