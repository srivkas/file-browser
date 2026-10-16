# Exercise 9 — A nested CLAUDE.md

`src/components/CLAUDE.md` holds conventions that only matter for React components
(thin components, the cancelled-flag effect pattern, `key` resets, class names + tokens).

## Proof it loads on demand
- **At session start:** `/context` → Memory files: 3 files (root `CLAUDE.md`, `MEMORY.md`, the always-on rule) — the nested file is not among them.
- **After Claude reads a file in the folder** ("What does src/components/FileTree.tsx do?"):
  ```
  Read 1 file
  Loaded src/components/CLAUDE.md
  ```
- The answer applied it: "It only displays the tree… this component never reads files itself" (thin components) and "Nothing is hard-coded, so it follows the CSS rule" (tokens).

## Note
After the load, `/context` still showed **3** memory files. In Claude Code 2.1.301 a nested CLAUDE.md that loads mid-session
appears to be added to the conversation (counted under Messages) rather than listed under Memory files — so the
"Loaded …" notice is the proof here, not the `/context` list.

## Bonus: a bug reported, not fixed
Without being asked, the answer also followed the "report bugs, don't fix them" convention from the root CLAUDE.md:
"the component uses role="tree" / treeitem … but there's no keyboard handler … ↑/↓/←/→ do nothing."
That's feature #1 (keyboard navigation) — a candidate for exercise 10.
