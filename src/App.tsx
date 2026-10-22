import { useState } from 'react';
import type { DirNode, FileNode } from './lib/tree';
import { FolderPicker } from './components/FolderPicker';
import { FileTree } from './components/FileTree';
import { DetailPane } from './components/DetailPane';
import { formatSummary } from './lib/format';
import { summarizeTree } from './lib/summary';

export function App() {
  const [root, setRoot] = useState<DirNode | null>(null);
  const [selected, setSelected] = useState<FileNode | null>(null);

  function handlePick(picked: DirNode | null) {
    setRoot(picked);
    setSelected(null);
  }

  return (
    <div className="app">
      <header className="toolbar">
        <FolderPicker onPick={handlePick} />
        {root && <span className="toolbar-title">{root.name}</span>}
        {root && <span className="toolbar-summary">{formatSummary(summarizeTree(root))}</span>}
      </header>
      <main className="panes">
        <nav className="tree-pane" aria-label="Folder contents">
          {root ? (
            <FileTree root={root} selectedPath={selected?.path ?? null} onSelect={setSelected} />
          ) : (
            <p className="empty">Choose a folder to start.</p>
          )}
        </nav>
        {/* key starts each selection scrolled to the top */}
        <section key={selected?.path} className="detail-pane" aria-label="File details">
          {selected && root ? <DetailPane node={selected} root={root} /> : <p className="empty">Select a file to see its details.</p>}
        </section>
      </main>
    </div>
  );
}
