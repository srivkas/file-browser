# Exercise 3 — All seven techniques in one prompt: summary line

Feature #9 from the list: a summary line — total files · images.

| Technique (slide 8) | Where it is in the prompt |
|---|---|
| 📄 Data first | `<data>` block comes first; the request comes last |
| 🎭 Give a role | `<role>` |
| 🧾 Brief once | `<brief>` — goal, reason, scope, done-when, all up front in one message |
| 🎯 Be specific | `<task>` names files, function names, return shape, placement, and the exact text |
| 🏷 XML structure | every part is in its own tag |
| 📋 Multishot | five diverse `<example>`s inside `<examples>` |
| 🎛 Dial effort, not words | run with `--effort medium`; the prompt never says "think hard" |

**Effort used for this run:** `medium` (set with `claude -p --effort medium`; nothing in the prompt asks for more thinking).

---

<!-- 📄 DATA FIRST: the material comes before any request -->
<data>
<file path="src/lib/tree.ts" excerpt="types">
export interface FileNode { kind: 'file'; name: string; path: string; file: File; }
export interface DirNode { kind: 'dir'; name: string; path: string; children: TreeNode[]; }
export type TreeNode = FileNode | DirNode;
</file>
<file path="src/lib/image.ts" excerpt="isImage">
export function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}
</file>
<file path="src/App.tsx" excerpt="toolbar">
<header className="toolbar">
  <FolderPicker onPick={handlePick} />
  {root && <span className="toolbar-title">{root.name}</span>}
</header>
</file>
<file path="src/lib/format.ts" excerpt="existing formatter style">
/** "just now", "1 day ago", "3 days ago". */
export function formatRelativeTime(time: RelativeTime): string { ... }
</file>
</data>

<!-- 🎭 GIVE A ROLE -->
<role>
You are a senior React + TypeScript engineer who keeps this codebase's split between a framework-free core (src/lib/) and thin React components.
</role>

<!-- 🧾 BRIEF ONCE: goal · reason · scope · done-when, up front, then let it run -->
<brief>
<goal>After picking a folder, the toolbar shows a one-line summary of what was loaded, e.g. "128 files · 14 images".</goal>
<reason>People pick a folder and immediately want to know whether it is the right one and how big it is — and, since the detail pane is richest for images, how many images there are to look at. Today they have to expand every folder to find out.</reason>
<scope>
- In: a counting function, a formatting function, tests for both, and the summary shown in the toolbar next to the folder name.
- Out: per-folder counts, sizes, other file categories, any change to the tree or detail pane, new dependencies, committing.
- Project rules: src/lib/ never imports React; no network, no localStorage/IndexedDB, no writes; styling only through CSS variables from src/styles/tokens.css (add a token only if no existing one fits).
- If you notice other bugs, list them in your summary — don't fix them.
</scope>
<done-when>
- Tests for both new functions pass, including every example below.
- `npm run check` is green.
- The summary appears in the toolbar after a folder is picked, and is absent before.
</done-when>
</brief>

<!-- 🎯 BE SPECIFIC -->
<task>
1. In a new file src/lib/summary.ts, add `summarizeTree(root: DirNode): { files: number; images: number }`. It counts every file at any depth (folders are not counted); `images` counts files for which `isImage(file)` is true.
2. In src/lib/format.ts, add `formatSummary(summary: { files: number; images: number }): string` returning "<files> file(s) · <images> image(s)" — singular for exactly 1, plural otherwise (including 0). format.ts stays formatting-only: no counting there.
3. In src/App.tsx, show `formatSummary(summarizeTree(root))` in the toolbar after the folder name, in a muted style (existing --color-muted).
4. Add tests in src/lib/summary.test.ts covering the examples.
</task>

<!-- 📋 MULTISHOT: 3–5 diverse examples -->
<examples>
<example name="mixed, nested">
Tree: root/ { notes.txt (text/plain), photos/ { a.jpg (image/jpeg), b.png (image/png) } }
summarizeTree → { files: 3, images: 2 }
formatSummary → "3 files · 2 images"
</example>
<example name="singulars">
Tree: root/ { cat.webp (image/webp) }
summarizeTree → { files: 1, images: 1 }
formatSummary → "1 file · 1 image"
</example>
<example name="empty, with an empty subfolder">
Tree: root/ { empty/ { } }
summarizeTree → { files: 0, images: 0 }
formatSummary → "0 files · 0 images"
</example>
<example name="no MIME type and SVG">
Tree: root/ { Makefile (type ""), logo.svg (image/svg+xml) }
summarizeTree → { files: 2, images: 1 }
formatSummary → "2 files · 1 image"
</example>
<example name="deep nesting">
Tree: root/ { a/ { b/ { c/ { deep.gif (image/gif) } } }, readme.md (text/markdown) }
summarizeTree → { files: 2, images: 1 }
formatSummary → "2 files · 1 image"
</example>
</examples>

<request>
Implement the task above. When done, reply with: the files you changed, the `npm run check` result, and any other bugs you noticed (or "none").
</request>
