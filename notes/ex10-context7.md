# Exercise 10 — context7, for the whole team

## The server
`.mcp.json` (committed) registers context7 at project scope, so everyone who clones the repo gets it.
It holds no secrets — only the public URL `https://mcp.context7.com/mcp`.
`/mcp` → context7 ✔ connected (after approving the project server once).

## The feature
Keyboard navigation in the tree (feature #1), built from `prompts/ex10-keyboard-nav.md` in a fresh
session (`claude -p --effort medium`). `npm run check`: 40 tests pass.

## Proof context7 was used — tool calls from the run's transcript
```
ToolSearch                         select:mcp__context7__resolve-library-id,mcp__context7__query-docs
mcp__context7__resolve-library-id  {"libraryName":"React","query":"React 19 refs as props, focus management, ref callback"}
mcp__context7__resolve-library-id  {"libraryName":"WAI-ARIA Authoring Practices","query":"tree view pattern keyboard interaction roving tabindex"}
mcp__context7__query-docs          {"libraryId":"/websites/react_dev_reference","query":"ref callback to focus a DOM node from a list of items, ref as a prop…"}
mcp__context7__query-docs          {"libraryId":"/w3c/wai-aria-practices","query":"tree view pattern keyboard interaction: Down/Up arrow, Right/Left arrow, …"}
```
The docs calls came **before** any file was written. What they changed in the code:
- React 19: `ref` passed as a plain prop, no `forwardRef`; ref callbacks return a cleanup function.
- WAI-ARIA tree pattern: roving tabindex (one row in the Tab order), Home/End keys, `aria-selected` only on selectable rows.

## Things to notice
- Without the explicit "use context7 … because your training data may describe older APIs", Claude may answer from memory and never call the server.
- The docs also widened the scope a little: it added Home/End because the ARIA pattern lists them — reported, not hidden.
- Reported, not fixed: hard-coded `1px` borders in app.css (against CLAUDE.md), the inline indent style in FileTree.tsx.
