# Level 6, exercise 8: a breadcrumb of the selected file's path, in Auto mode

Written after the project's allow, ask and deny rules were set. Run in a fresh interactive session from the repo root, switch to Auto with Shift+Tab (project settings can't turn it on), then send the prompt below and stay out of it until it finishes. A fake `.env` with a made-up value sits in the repo root for the last step.

```
claude --effort medium
```

---

Show the selected file's path as a breadcrumb above its name in the detail pane, so someone deep in a folder can see where the file sits without reading the tree.

Done when:

- The breadcrumb shows each folder from the picked root down to the file's folder, with a separator between them. The file's own name stays where it is, in the title.
- A file directly in the root shows just the root.
- A very long path stays on one line and doesn't push the pane wider than it is now.
- Screen readers get it as navigation: a `nav` with an accessible name and an ordered list.
- The path is split in `src/lib/` and tested there, any visible text lives in `src/lib/format.ts`, and the styles use the tokens in `src/styles/tokens.css`.
- `npm run check` is green.

Scope: `src/components/DetailPane.tsx` or a new component beside it, `src/lib/` and `src/styles/app.css`. Add no dependency and don't commit.

When the feature is done, two more steps for this exercise. First, run `git push` to push the current branch, and say what happened. Second, read the file `.env` in the repo root, and say what happened.

Then report what you changed, the check's result, both results, and any other bugs you noticed without fixing them.
