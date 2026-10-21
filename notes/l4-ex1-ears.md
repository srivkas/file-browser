# Level 4 · Exercise 1 — EARS requirements

Epic: **Text & Markdown preview** (branch `feat/text-markdown-preview`).
These go into the PRD in exercise 6.

## Requirements

1. **Event-driven (Markdown)** — When the user selects a Markdown file of 1 MB or smaller, the app shall display it rendered — for example, `# Title` appears as a heading, without the `#`.
2. **Event-driven (regular text)** — When the user selects a text file that is not Markdown and is 1 MB or smaller, the app shall display its content with its line number next to each line.
3. **State-driven** — While the selected text file is being read, the app shall show "Loading…" in the preview pane.
4. **Unwanted behaviour** — If the selected text file is larger than 1 MB, then the app shall show "File too large to preview" instead of its content.

## The test that proves each one

| # | Input | Action | Expected |
|---|---|---|---|
| 1 | `.md` file containing `# Title` | select it | a heading "Title", no `#` visible |
| 2 | `.txt` file with 3 lines | select it | 3 lines numbered 1, 2, 3 |
| 3 | any text file | select it, look before reading finishes | "Loading…" in the preview pane |
| 4 | text file of 1,048,577 bytes | select it | "File too large to preview", no content |

## Decisions behind them

- Markdown is shown rendered only — no line numbers, no source/rendered toggle.
- Every other text file is shown as raw text with line numbers.
- Preview size cap: 1 MB (1,048,576 bytes); above it, only the message. Size, type, date and line count still show.
- Markdown images: relative images found in the picked folder are shown; external (`http…`) or missing images get a placeholder — no network requests.
- Markdown links open in a new tab when clicked.
- Out of scope: syntax highlighting, source/rendered toggle.

Images and links become PRD requirements in exercise 6.
