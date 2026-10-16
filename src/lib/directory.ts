import { sortTree, type DirNode } from './tree';

/** Whether the browser can open a folder without the "upload files" prompt. */
export function canPickDirectory(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

/** Asks the user for a folder with read-only access and returns its tree. Null if cancelled. */
export async function pickDirectory(): Promise<DirNode | null> {
  try {
    const handle = await window.showDirectoryPicker!({ mode: 'read' });
    return readDirectoryTree(handle);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    throw error;
  }
}

/** Recursively reads a directory handle into a sorted tree. Includes empty folders. */
export async function readDirectoryTree(handle: FileSystemDirectoryHandle, parentPath = ''): Promise<DirNode> {
  const path = parentPath ? `${parentPath}/${handle.name}` : handle.name;
  const dir: DirNode = { kind: 'dir', name: handle.name, path, children: [] };

  for await (const child of handle.values()) {
    if (child.kind === 'directory') {
      dir.children.push(await readDirectoryTree(child as FileSystemDirectoryHandle, path));
    } else {
      const file = await (child as FileSystemFileHandle).getFile();
      dir.children.push({ kind: 'file', name: child.name, path: `${path}/${child.name}`, file });
    }
  }

  sortTree(dir);
  return dir;
}
