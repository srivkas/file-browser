---
name: file-browser — Text & Markdown preview
status: final
updated: 2026-10-22
sources:
  - ../../prds/prd-file-browser-2026-10-22/prd.md
  - ../../prds/prd-file-browser-2026-10-22/addendum.md
  - ../../briefs/brief-file-browser-2026-10-22/brief.md
---

# Text & Markdown preview — Experience Spine

## Foundation

Desktop web browser, single surface. No UI system: React components styled by the app's own tokens (`src/styles/tokens.css`). `DESIGN.md` is the visual identity reference; this file is the behaviour. Product rules (what counts as a text file, the size limit, link and image rules, safety) are defined in the PRD and referenced by FR/NFR number, not repeated. The mock at [mockups/key-preview.html](mockups/key-preview.html) illustrates the composition; this spine and `DESIGN.md` win on conflict.

## Information Architecture

No new surface. The preview is a new section of the existing detail pane.

| Surface | Reached from | Purpose |
|---|---|---|
| Detail pane → details list | Selecting a file in the tree (unchanged) | Name, size, type, modified date, line count |
| Detail pane → Preview section | Selecting a text file (PRD Glossary) | Read the file: rendered view for Markdown (FR-9), plain text view for the rest (FR-1) |
| Detail pane → image preview | Selecting an image (unchanged, FR-6) | Today's image, dimensions, EXIF |

Order inside the pane, top to bottom: file name → details list → "Preview" section title → preview content. A file that is not a text file shows no Preview section at all — not an empty one.

## Voice and Tone

Short, neutral, no apology, no exclamation marks, sentence case. Every string lives in `src/lib/format.ts`.

| String | Where |
|---|---|
| "Preview" | Section title |
| "Loading…" | While reading (FR-2) |
| "File too large to preview" | Over the size limit (FR-3) |
| "Empty file" | 0-byte text file (FR-4) |
| alt text, or "Image" | Image placeholder (FR-12, FR-13) |

| Do | Don't |
|---|---|
| "File too large to preview" | "Oops! This file is too big 😕" |
| "Empty file" | "This file has no content to display." |

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md.Components`.

| Component | Behaviour |
|---|---|
| Preview section | Always belongs to the selected file. Selecting another file replaces it at once; an older file's content never appears (FR-5). The detail pane scroll returns to the top on every new selection. |
| Plain text view | Content exactly as written (FR-1). Long lines wrap. Line numbers cannot be selected, so selecting and copying text copies only the file's content. |
| Rendered view | Markdown formatted, no line numbers (FR-9, FR-10). Raw HTML appears as literal text (FR-11). Text is selectable and copyable. |
| Web link | Opens in a new tab; the app tab keeps its folder and selection (FR-14). The browser's own status bar shows the address on hover; no extra icon. |
| Inert link | Any non-web link. Click does nothing (FR-15). Not in the Tab order, default cursor, so it never feels like a broken button. |
| Task-list checkbox | Shown ticked or unticked; disabled, so clicking changes nothing (FR-10). |
| Local image | Shown when found in the folder (FR-12); scales down to the reading width, never up. |
| Image placeholder | Shown for any image not displayed (FR-12, FR-13). Not clickable. |
| Wide table | Scrolls sideways inside its own wrapper; the rest of the preview does not move. |

## State Patterns

One state at a time in the preview section; the details list above is never affected.

| State | Trigger | Preview shows |
|---|---|---|
| Loading | Text file selected, not yet read | "Loading…" (FR-2) |
| Plain text | Non-Markdown text file ≤ 1 MB | Numbered lines (FR-1) |
| Rendered | Markdown file ≤ 1 MB | Formatted document (FR-9) |
| Too large | Text file > 1 MB | "File too large to preview"; size, type, date and line count still shown above (FR-3) |
| Empty | 0-byte text file (Markdown or not) | "Empty file", no line numbers (FR-4) |
| Unusual content | Unreadable characters | Shown as-is in the same view, no error (FR-8) |
| Not a text file | Image, archive, PDF, no extension… | No Preview section (FR-6) |

## Interaction Primitives

- **Mouse:** select in the tree (unchanged); click web links; select text to copy.
- **Keyboard:** `Tab` moves through web links in the preview in reading order; `Enter` on a web link opens it in a new tab. Inert links, checkboxes and placeholders are skipped. The detail pane scrolls with the usual browser keys once it has focus.
- **Nothing edits.** No double-click to edit, no context menu of our own, no drag.

## Accessibility Floor

- The Preview section is a labelled region ("Preview"), so screen-reader users can jump to it.
- State changes (Loading → content, Too large, Empty) are announced politely, once, not on every keystroke in the tree.
- Rendered Markdown keeps real structure: headings are headings, lists are lists, tables are tables with header cells, so screen-reader navigation by heading works.
- Line numbers are hidden from screen readers; the file's text is read without them.
- Disabled checkboxes announce their state ("checked" / "not checked").
- Image placeholder exposes the alt text; a local image uses the Markdown alt text as its `alt`.
- Web links are focusable with the existing focus ring (`--focus-ring-width`, `{colors.accent}`).
- Contrast: all new elements use existing text/muted/accent tokens on bg/sidebar, the same pairs the app already uses.

## Safety as experience

The PRD's NFR-1 to NFR-4 are invisible when they work. The UX promise: a hostile file looks *plain*, never broken — tags show as text, remote images show as placeholders, dangerous links are inert. No warning banners, because there is nothing for the user to decide.

## Key Flows

### Flow 1 — Noa reads a cloned project's README (PRD UJ-1)

1. Noa, a student, opens a cloned course project's folder in file-browser.
2. She selects `README.md` in the tree. The details appear; the Preview section shows "Loading…" for a moment.
3. The README appears formatted: a title with a hairline under it, a setup checklist with ticked and unticked boxes, a table of commands, a code block in monospace. The project's CI badge, a web image, appears as a small dashed box labelled "build status".
4. A link to `docs/setup.md` looks like a reference, not a button; she doesn't try it.
5. **Climax:** She clicks the link to the project's website. It opens in a new tab — and when she comes back, her folder, her selection and her place in the README are exactly where she left them.
6. She selects `package.json`. The pane jumps to the top and shows numbered monospace lines.

Edge: she selects a 5 MB log file. The Preview section says "File too large to preview"; the details above still show its size and line count.

### Flow 2 — Noa clicks quickly through the tree

1. Noa presses the arrow keys down the tree past a large log, a `.ts` file and a note.
2. Each selection replaces the preview at once; she may see "Loading…" briefly.
3. **Climax:** She stops on the note, and only the note appears — never a flash of the log she passed over (FR-5).

## Responsive & Platform

Desktop browsers only, as today. The tree pane keeps its fixed width; the preview fills what is left. Light and dark follow the system setting through the existing tokens. Chrome/Edge and the Firefox/Safari folder-input fallback behave the same — the preview reads files already picked.

## Inspiration & Anti-patterns

- **Lifted from GitHub:** the *form* of rendered Markdown — heading rules, table borders, checkbox lists, grey code blocks.
- **Lifted from macOS Quick Look:** read-only, instant, no chrome.
- **Rejected:** syntax colouring, a raw/rendered toggle, an inner scroll box, a "this content was blocked" banner, jump-to-heading (all out of scope or rejected in the PRD).
