# Exercise 4 — A Claude 5–style development prompt: line count

Feature #2 from the list: line count for text files in the detail pane.

How this prompt follows slide 9:

| Old habit | What this prompt does instead |
|---|---|
| Spell out every step | Goal + done-when only; no step list |
| "Think step by step" | Effort set with `--effort medium`; nothing in the prompt about thinking |
| "Double-check your work" | A check it can run: `npm run check` |
| CRITICAL / MUST | "Use X when… because…" — every constraint carries its reason |
| Scope left implicit | In / out stated, plus "note other bugs, don't fix them" |

**Effort used for this run:** `medium`.

---

Add a line count to the detail pane for text files in this file-browser app (React + TypeScript + Vite).

Goal: when I select a text file — source code, Markdown, JSON, CSV, plain text — the detail pane shows how many lines it has, next to Size, Type and Modified. People use this to judge at a glance how big a code or data file is, which the byte size doesn't tell them well.

Done when:
- Selecting a text file shows a "Lines" row with the count, e.g. "Lines 1,204".
- Images and other binary files show no Lines row.
- The counting logic has tests, including an empty file (0 lines), a file without a trailing newline, a file with a trailing newline, and Windows line endings (\r\n).
- `npm run check` is green — that is the check that proves it works.

How to build it:
- Put the line counting and the "is this a text file" decision in src/lib/, because that folder is the framework-free core that the tests cover and it never imports React.
- Use the file's MIME type when the browser provides one, and fall back to the extension when it's empty, because the browser leaves the type blank for many code files (.ts, .tsx, .md on some systems).
- Skip counting for files over 50 MB and show nothing for them, because reading a huge file into memory would freeze the pane for a number nobody needs.
- Read the file only in the browser, the same way image details are read, because the app is read-only and makes no network calls.
- Use the existing CSS variables from src/styles/tokens.css for any styling, because all styling goes through that one tokens file.

Scope: only the Lines row. Leave the tree, the toolbar and the image section as they are, and add no dependencies. If you notice other bugs along the way, list them in your report — don't fix them.

When you're done, report the files you changed, the `npm run check` result, and the other bugs you noticed (or "none found").
