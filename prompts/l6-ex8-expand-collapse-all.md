# Level 6, exercise 8: expand all and collapse all

Run in a fresh session, in Auto mode, from the repo root:

```
claude --permission-mode auto --effort medium
```

Then send the prompt below. Effort is medium because the change is small and the check is the judge, not extra thinking.

---

Add two buttons above the file tree, Expand all and Collapse all, so someone browsing a deep folder can open every folder at once, or get back to a clean tree, without clicking each one.

Done when:

- Expand all opens every folder in the tree. While the filter box has text, it opens every folder that is shown.
- Collapse all closes every folder except the root, and a row that was focused inside a closed folder hands focus back to the root, the way the filter already does.
- Keyboard navigation and the filter still work as before, and both buttons can be used with the keyboard.
- The folder list is calculated in `src/lib/` and tested there, the button labels live in `src/lib/format.ts`, and the styles use the tokens in `src/styles/tokens.css`.
- `npm run check` is green.

Scope: `src/components/FileTree.tsx`, `src/lib/` and `src/styles/app.css`. Leave other files as they are, and add no dependency. `folderPaths` in `src/lib/filter.ts` may already do part of the work.

Note other bugs you notice, but don't fix them. Don't commit. When you're done, report what you changed, the check's result and any bugs you noticed.
