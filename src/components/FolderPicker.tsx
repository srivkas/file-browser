import { useRef, type ChangeEvent } from 'react';
import { canPickDirectory, pickDirectory } from '../lib/directory';
import { buildTree, type DirNode } from '../lib/tree';

interface Props {
  onPick: (root: DirNode | null) => void;
}

/**
 * Opens a folder read-only via the File System Access API (Chrome, Edge).
 * Browsers without it (Firefox, Safari) fall back to a directory <input>.
 * Either way, files are only read in the page and never leave the computer.
 */
export function FolderPicker({ onPick }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleClick() {
    if (!canPickDirectory()) {
      inputRef.current?.click();
      return;
    }
    const root = await pickDirectory();
    if (root) onPick(root);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onPick(buildTree(files.map((file) => ({ path: file.webkitRelativePath, file }))));
    event.target.value = '';
  }

  return (
    <>
      <button type="button" className="button" onClick={handleClick}>
        Choose folder
      </button>
      <input ref={inputRef} type="file" hidden onChange={handleInputChange} {...{ webkitdirectory: '' }} />
    </>
  );
}
