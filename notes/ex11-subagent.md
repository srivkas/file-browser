# Exercise 11 — Hand a read-heavy job to a subagent

The job: find every place in `src/` that touches the File System Access API or `File` objects
(showDirectoryPicker, FileSystemDirectoryHandle, getFile, File, webkitdirectory), returned as a
short `file:line — what it does` list. `src/` is ~43 KB, so this means reading every file.

Ran the same job in two fresh sessions and measured **Messages** with `/context`:

| | Before | After |
|---|---|---|
| Delegated to a subagent (Explore) | 10 | **18.9k** |
| Main session read the files itself | 10 | **31.1k** |

## Reading the numbers
- About 15–16k of each "after" is the fixed cost of any first turn (system reminders, tool list,
  git status). Exercise 5 saw the same: one question about one small file → 15.9k.
- So the subagent version added only ~3k (its short answer plus the handoff), while reading
  directly added ~15k — every file the main session read stays in its context for the rest of
  the conversation.
- The subagent still read all the files, in its own separate context window, which is thrown
  away when it finishes. Only its summary comes back.

## The prompt detail that mattered
"I want to keep this session's context small, so don't read the files yourself." — a reason,
not just an order, so Claude delegates instead of peeking at the files first.

## When a subagent is a waste
A small lookup in one or two files you already know: the subagent starts with no context and
the handoff costs more than just reading them — and you often need the file contents in the main
session anyway to edit them.

## What the subagent returned
The whole answer that came back into the main session (~3k tokens, out of ~43 KB read):

**Picking the folder**
- `src/lib/fs-access.d.ts:1-8` — type declarations for `window.showDirectoryPicker` and its `{ mode }` option.
- `src/lib/directory.ts:5` — `canPickDirectory()` checks whether `showDirectoryPicker` exists (Chromium).
- `src/lib/directory.ts:11` — `pickDirectory()` calls `showDirectoryPicker({ mode: 'read' })`; returns null on cancel.
- `src/lib/directory.ts:20-29` — `readDirectoryTree()` walks every level with `handle.values()` and calls `getFile()` (line 28).
- `src/components/FolderPicker.tsx:18-23` — button uses `pickDirectory()` when supported, otherwise clicks the hidden input.
- `src/components/FolderPicker.tsx:37` — hidden `<input type="file" webkitdirectory>`, the Firefox/Safari fallback.
- `src/components/FolderPicker.tsx:27-28` — passes each `File` with its `webkitRelativePath` to `buildTree`.

**The tree**
- `src/lib/tree.ts:5,20` — `FileNode.file` / `FileEntry.file` typed as `File`; `buildTree` (24-48) stores them.

**Reading metadata**
- `src/components/DetailPane.tsx:12,15,17,20` — shows name, size, type and lastModified.
- `src/lib/format.ts:44-47` — `fileType()` uses `file.type`, falling back to the extension.
- `src/lib/image.ts:10-11` — `isImage()` checks `file.type.startsWith('image/')`.
- `src/lib/summary.ts:20` — `isImage(child.file)` to count images.
- `src/lib/text.ts:35-50` — `isTextFile()` / `canCountLines()` check type, name and size.

**Reading file contents**
- `src/components/DetailPane.tsx:45` — `LineCount` reads the file with `file.text()`.
- `src/components/DetailPane.tsx:77,83` — `ImageDetails` creates and revokes a blob URL.
- `src/lib/image.ts:15-21` — `readImageDimensions()` loads the blob URL into an `Image`.
- `src/lib/image.ts:25-27` — `readExif()` passes the `File` to `exifr.parse`.

**Tests**
- `src/lib/directory.test.ts:7-31` — fake handles with `kind`, `values()` and `getFile()`.
- `src/lib/{format,summary,text,tree,tree-nav}.test.ts` — `new File(...)` as test data.

Conclusion it reached: everything opens folders read-only and only reads files.
