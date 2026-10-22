# Epic 1 Context: Read text and Markdown files inside the app

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A person selects a text file in the open folder and reads it in the detail pane, below the file details: plain text with line numbers, or Markdown formatted the way GitHub shows a README. The preview keeps the app's promises — nothing leaves the computer, nothing in a file runs, nothing is changed or stored. file-browser is a course base, so the code must stay small and readable for students.

## Stories

- Story 1.1: Read a plain text file with line numbers
- Story 1.2: TypeScript files are text
- Story 1.3: Read Markdown formatted, safely
- Story 1.4: Open web links from a README
- Story 1.5: Show a README's own images

## Requirements & Constraints

- Text file = browser reports a text type or common text format, or no type and the extension is on the app's text list; `.ts` is always text. Files with no extension, and dotfiles, are not text in this epic.
- Markdown file = `.md` or `.markdown`. Rendered view: headings, emphasis, lists, blockquotes, code blocks (monospace, no highlighting), rules, tables, task lists (checkboxes never toggle), strikethrough. Raw HTML shows as literal text.
- Size limit 1 MB (1,048,576 bytes): larger shows "File too large to preview"; exactly 1 MB is shown. 0 bytes shows "Empty file". While reading: "Loading…". Details (size, type, date, line count) always stay.
- Only the latest selection is ever shown; a slow earlier read never appears.
- Unreadable characters are shown as-is, no error.
- Non-text files get no preview; images keep today's image preview.
- Web links (`http`/`https`, incl. bare and `<…>` autolinks) open a new tab with no opener/referrer; every other link does nothing. Local images (relative to the Markdown file, `/` = folder top, never outside the folder) are shown; all other images are placeholders and never loaded.
- No network, no code from files, nothing stored, read-only. `marked` 18.1.1 is the only approved new dependency.

## Technical Decisions

- Functional core (`src/lib`, no React, unit-tested) + imperative shell (`src/components`). All user-visible strings in `src/lib/format.ts`.
- `isTextFile` in `text.ts` is the single text classifier for both the Lines row and the preview; `isMarkdownFile` and `splitLines` live beside it. `splitLines` uses the same rule as `countLines` (a trailing newline adds no empty line; `\r\n` counts once).
- `lib/preview.ts`: `PREVIEW_MAX_BYTES = 1_048_576`, `previewPlan(file)` → `'none' | 'too-large' | 'empty' | 'plain' | 'markdown'`, decided from size and kind before any read (`size > limit`).
- `TextPreview` is keyed by `node.path`; its read effect uses a `cancelled` flag in cleanup. Text comes only from `file.text()`; a rejected read hides the whole Preview section.
- Only `lib/markdown.ts` imports `marked` (lexer only, GFM on); it returns app-owned `MdBlock[]`/`MdInline[]` with decoded text and pre-classified links/images. `dangerouslySetInnerHTML` is banned by ESLint.
- `lib/links.ts` classifies links and images; `App` passes the root `DirNode` down as a prop; `findFile(root, path)` in `tree.ts`; image object URLs are created in an effect and revoked in cleanup.
- Styles: class names only, CSS in `app.css`, values from `tokens.css`. New tokens: `--font-mono`, `--font-size-xl`, `--line-height-read`, `--reading-max-width`.

## UX & Interaction Patterns

- Preview section below the details list: "Preview" title in the existing section-title style, hairline divider above; absent for non-text files.
- Full natural height; the detail pane scrolls; it scrolls back to the top on every new selection.
- Plain text: framed box, grey gutter, right-aligned muted line numbers (unselectable, hidden from screen readers); a wrapped line shows its number only on its first row.
- State messages are one muted line.
- Accessibility: Preview is a labelled region; state changes announced politely once; real heading/list/table semantics.

## Cross-Story Dependencies

- 1.1 lays the preview pipeline (plan → read → view) that 1.3 extends with the Markdown view; until 1.3, Markdown files show the plain view.
- 1.3 renders every link inert and every image as a placeholder; 1.4 and 1.5 upgrade those verdicts.
