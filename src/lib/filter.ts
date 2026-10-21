import type { DirNode, TreeNode } from './tree';

/**
 * Keeps only the entries whose name contains the query (ignoring case), plus the folders above them,
 * like the VS Code Explorer filter. The root always stays. Returns the tree unchanged for a blank
 * query, and null when nothing matches.
 */
export function filterTree(root: DirNode, query: string): DirNode | null {
  const needle = query.trim().toLowerCase();
  if (needle === '') return root;

  const keep = (node: TreeNode): TreeNode | null => {
    const matches = node.name.toLowerCase().includes(needle);
    if (node.kind === 'file') return matches ? node : null;
    const children = node.children.map(keep).filter((child) => child !== null);
    return matches || children.length > 0 ? { ...node, children } : null;
  };

  const children = root.children.map(keep).filter((child) => child !== null);
  return children.length > 0 ? { ...root, children } : null;
}

/** Paths of every folder in the tree, root included — the folders to open so all matches show. */
export function folderPaths(root: DirNode): string[] {
  const paths: string[] = [];
  const walk = (dir: DirNode) => {
    paths.push(dir.path);
    for (const child of dir.children) if (child.kind === 'dir') walk(child);
  };
  walk(root);
  return paths;
}
