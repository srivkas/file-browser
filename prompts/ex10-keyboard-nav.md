# Exercise 10 — A feature built with current docs from context7: keyboard navigation

Feature #1 from the list: keyboard navigation in the tree — ↑/↓ move, →/← expand/collapse, Enter selects.
Written Claude 5–style (goal + done-when, reasons instead of MUST), with one addition for this exercise:
an explicit instruction to look up current docs through context7, and why.

**Effort used for this run:** `medium`.

---

Add keyboard navigation to the folder tree in this file-browser app (React 19 + TypeScript + Vite).

Goal: someone can browse the whole tree without a mouse. Today `src/components/FileTree.tsx` declares `role="tree"` / `treeitem`, which tells screen readers to expect arrow-key navigation, but no keys work — so keyboard and screen-reader users are stuck.

Done when:
- Clicking into the tree (or tabbing to it) focuses one row; Tab moves focus out of the tree, not row by row.
- ↓ / ↑ move to the next / previous visible row.
- → on a closed folder opens it; on an open folder it moves to its first child.
- ← on an open folder closes it; on a file or closed folder it moves to the parent folder.
- Enter on a file selects it (the detail pane shows it); on a folder it toggles it.
- The focused row is clearly visible, styled through the tokens in `src/styles/tokens.css`.
- The logic that decides "which row is next / previous / parent" has tests in `src/lib/`.
- `npm run check` is green.

Use the context7 MCP tools to read the current React documentation (refs and focus management) and the WAI-ARIA tree view pattern before you design this, because this project is on React 19 and your training data may describe older APIs (for example forwardRef, which React 19 no longer needs). Mention in your report which docs you looked up.

Work within the project's rules in CLAUDE.md. Scope: only the tree and its keyboard behaviour — leave the detail pane, toolbar and folder picker as they are, and add no dependencies. If you notice other bugs, list them in your report — don't fix them.

When you're done, report the files you changed, which docs you looked up through context7, the `npm run check` result, and the other bugs you noticed (or "none found").
