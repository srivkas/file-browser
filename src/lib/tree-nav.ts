import type { DirNode, FileNode, TreeNode } from './tree';

/** One row the tree currently shows, in screen order. */
export interface VisibleRow {
  node: TreeNode;
  /** Path of the folder that contains this row; null for the root. */
  parentPath: string | null;
}

/** Every row a user can see: the root, plus the children of each open folder, depth-first. */
export function visibleRows(root: DirNode, openPaths: ReadonlySet<string>): VisibleRow[] {
  const rows: VisibleRow[] = [];
  const walk = (node: TreeNode, parentPath: string | null) => {
    rows.push({ node, parentPath });
    if (node.kind === 'dir' && openPaths.has(node.path)) {
      for (const child of node.children) walk(child, node.path);
    }
  };
  walk(root, null);
  return rows;
}

/** What a key press in the tree should do. */
export type TreeKeyAction =
  | { type: 'focus'; path: string }
  | { type: 'open'; path: string }
  | { type: 'close'; path: string }
  | { type: 'select'; node: FileNode };

/**
 * Decides what a key does on the focused row, following the WAI-ARIA tree view pattern.
 * Returns null when the key does nothing there (so the browser keeps its default).
 */
export function treeKeyAction(
  rows: readonly VisibleRow[],
  focusedPath: string,
  key: string,
  openPaths: ReadonlySet<string>,
): TreeKeyAction | null {
  const index = rows.findIndex((row) => row.node.path === focusedPath);
  if (index === -1) return null;
  const { node, parentPath } = rows[index];
  const isOpenDir = node.kind === 'dir' && openPaths.has(node.path);
  const focus = (i: number): TreeKeyAction | null =>
    i >= 0 && i < rows.length && i !== index ? { type: 'focus', path: rows[i].node.path } : null;

  switch (key) {
    case 'ArrowDown':
      return focus(index + 1);
    case 'ArrowUp':
      return focus(index - 1);
    case 'Home':
      return focus(0);
    case 'End':
      return focus(rows.length - 1);
    case 'ArrowRight':
      if (node.kind !== 'dir') return null;
      if (!isOpenDir) return { type: 'open', path: node.path };
      return node.children.length > 0 ? { type: 'focus', path: node.children[0].path } : null;
    case 'ArrowLeft':
      if (isOpenDir) return { type: 'close', path: node.path };
      return parentPath === null ? null : { type: 'focus', path: parentPath };
    case 'Enter':
      if (node.kind === 'file') return { type: 'select', node };
      return { type: isOpenDir ? 'close' : 'open', path: node.path };
    default:
      return null;
  }
}
