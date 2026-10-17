import { useRef, useState, type KeyboardEvent } from 'react';
import type { DirNode, FileNode, TreeNode } from '../lib/tree';
import { treeKeyAction, visibleRows } from '../lib/tree-nav';

interface Props {
  root: DirNode;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
}

interface TreeState {
  root: DirNode;
  open: ReadonlySet<string>;
  /** The one row in the tab order (roving tabindex). */
  focused: string;
}

const initialState = (root: DirNode): TreeState => ({ root, open: new Set([root.path]), focused: root.path });

export function FileTree({ root, selectedPath, onSelect }: Props) {
  const [saved, setState] = useState(() => initialState(root));
  // A newly picked folder starts fresh: only the root open, focus on the root.
  const state = saved.root === root ? saved : initialState(root);
  const items = useRef(new Map<string, HTMLLIElement>());

  function setOpen(path: string, open: boolean) {
    const next = new Set(state.open);
    if (open) next.add(path);
    else next.delete(path);
    setState({ ...state, open: next });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const action = treeKeyAction(visibleRows(root, state.open), state.focused, event.key, state.open);
    if (!action) return;
    event.preventDefault();
    if (action.type === 'focus') items.current.get(action.path)?.focus();
    else if (action.type === 'select') onSelect(action.node);
    else setOpen(action.path, action.type === 'open');
  }

  const rowProps: RowContext = {
    open: state.open,
    focusedPath: state.focused,
    selectedPath,
    onSelect,
    onToggle: (path) => setOpen(path, !state.open.has(path)),
    onFocusRow: (path) => {
      if (path !== state.focused) setState({ ...state, focused: path });
    },
    registerItem: (path, element) => {
      items.current.set(path, element);
      return () => {
        items.current.delete(path);
      };
    },
  };

  return (
    <ul className="tree" role="tree" onKeyDown={handleKeyDown}>
      <TreeRow node={root} depth={0} {...rowProps} />
    </ul>
  );
}

interface RowContext {
  open: ReadonlySet<string>;
  focusedPath: string;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  onToggle: (path: string) => void;
  onFocusRow: (path: string) => void;
  registerItem: (path: string, element: HTMLLIElement) => () => void;
}

interface RowProps extends RowContext {
  node: TreeNode;
  depth: number;
}

function TreeRow({ node, depth, ...context }: RowProps) {
  const { open, focusedPath, selectedPath, onSelect, onToggle, onFocusRow, registerItem } = context;
  const isDir = node.kind === 'dir';
  const isOpen = isDir && open.has(node.path);
  const selected = node.path === selectedPath;

  return (
    <li
      ref={(element) => (element ? registerItem(node.path, element) : undefined)}
      role="treeitem"
      tabIndex={node.path === focusedPath ? 0 : -1}
      aria-expanded={isDir ? isOpen : undefined}
      aria-selected={isDir ? undefined : selected}
      onFocus={(event) => {
        // Focus events bubble in React; only the row that actually got focus counts.
        if (event.target === event.currentTarget) onFocusRow(node.path);
      }}
    >
      <div
        className={`tree-row${selected ? ' is-selected' : ''}`}
        style={{ paddingInlineStart: `calc(${depth} * var(--tree-indent) + var(--space-2))` }}
        onClick={() => (isDir ? onToggle(node.path) : onSelect(node))}
      >
        <span className="tree-chevron" aria-hidden>
          {isDir ? (isOpen ? '▾' : '▸') : ''}
        </span>
        <span className="tree-icon" aria-hidden>
          {isDir ? '📁' : '📄'}
        </span>
        <span className="tree-name">{node.name}</span>
      </div>
      {isOpen && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeRow key={child.path} node={child} depth={depth + 1} {...context} />
          ))}
        </ul>
      )}
    </li>
  );
}
