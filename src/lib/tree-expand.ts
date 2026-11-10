import type { DirNode } from './tree';
import { folderPaths } from './filter';

/**
 * The open folders after "Expand all": every folder in `shown` added to the ones already open.
 * Pass the filtered tree while the filter has text, so only the folders on screen open; folders
 * the filter hides keep whatever state they had. `shown` is null when nothing matches.
 */
export function expandAll(shown: DirNode | null, open: ReadonlySet<string>): Set<string> {
  return new Set([...open, ...(shown ? folderPaths(shown) : [])]);
}

/** The open folders after "Collapse all": only the root, so its children stay in view. */
export function collapseAll(root: DirNode): Set<string> {
  return new Set([root.path]);
}
