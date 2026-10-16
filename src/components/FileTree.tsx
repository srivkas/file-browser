import { useState } from 'react';
import type { DirNode, FileNode, TreeNode } from '../lib/tree';

interface Props {
  root: DirNode;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
}

export function FileTree({ root, selectedPath, onSelect }: Props) {
  return (
    <ul className="tree" role="tree">
      <TreeRow node={root} depth={0} defaultOpen selectedPath={selectedPath} onSelect={onSelect} />
    </ul>
  );
}

interface RowProps extends Omit<Props, 'root'> {
  node: TreeNode;
  depth: number;
  defaultOpen?: boolean;
}

function TreeRow({ node, depth, defaultOpen = false, selectedPath, onSelect }: RowProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isDir = node.kind === 'dir';
  const selected = node.path === selectedPath;

  return (
    <li role="treeitem" aria-expanded={isDir ? open : undefined} aria-selected={selected}>
      <button
        type="button"
        className={`tree-row${selected ? ' is-selected' : ''}`}
        style={{ paddingInlineStart: `calc(${depth} * var(--tree-indent) + var(--space-2))` }}
        onClick={() => (isDir ? setOpen(!open) : onSelect(node))}
      >
        <span className="tree-chevron" aria-hidden>
          {isDir ? (open ? '▾' : '▸') : ''}
        </span>
        <span className="tree-icon" aria-hidden>
          {isDir ? '📁' : '📄'}
        </span>
        <span className="tree-name">{node.name}</span>
      </button>
      {isDir && open && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeRow key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}
