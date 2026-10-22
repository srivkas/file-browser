---
status: final
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-file-browser-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/prds/prd-file-browser-2026-10-22/addendum.md
  - _bmad-output/planning-artifacts/ux-designs/ux-file-browser-2026-10-22/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-file-browser-2026-10-22/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-file-browser-2026-10-22/ARCHITECTURE-SPINE.md
---

# file-browser - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for file-browser, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: When the user selects a text file that is not Markdown and is within the size limit, the preview shows its content in the plain text view, monospace, with a line number before each line; long lines wrap and keep a single number.
FR2: While the selected text file is being read, the preview shows "Loading…" and no content.
FR3: If the selected text file is larger than 1 MB (1,048,576 bytes), the preview shows "File too large to preview"; a file of exactly 1,048,576 bytes is shown; the details (size, type, date, line count) are still shown.
FR4: A 0-byte text file (Markdown or not) shows "Empty file" and no line numbers.
FR5: When the user selects a different file while the previous one is still being read, only the newly selected file is shown.
FR6: A file that is not a text file shows no text preview; images keep today's image preview (including `.svg`); `.zip` / `.pdf` show details only.
FR7: Every file ending in `.ts` is a text file, whatever type the browser reports, and shows the plain text view and a line count.
FR8: A text file with unreadable characters (odd encoding, binary data) is still shown, without an error message.
FR9: A Markdown file (`.md`, `.markdown`) within the size limit is shown in the rendered view, without line numbers: headings, bold, italic, lists, blockquotes, code blocks (monospace, no highlighting), horizontal rules, links and images formatted, never as raw symbols.
FR10: The rendered view shows tables as tables, task list items as checkboxes that cannot be toggled, and `~~text~~` as strikethrough.
FR11: HTML tags in a Markdown file are shown as literal text and never interpreted (`<script>` runs nothing).
FR12: A local image (path relative to the Markdown file, or `/` = folder top) that exists in the folder is shown; a missing one, or one leading outside the folder, shows a placeholder.
FR13: An image that is not local (web address, `//` address, embedded image) shows a placeholder and is never loaded.
FR14: Clicking a web link (`http://` / `https://`, including bare and `<…>` autolinks) opens a new tab; the app tab keeps its folder and selection; the opened page cannot reach the app tab and gets no referrer.
FR15: Clicking any other link (file path, `#heading`, `mailto:`, `javascript:`) does nothing.

### NonFunctional Requirements

NFR1: No network — previewing any file, or clicking anything but a web link, makes no network request.
NFR2: No code from files — no scripts, event-handler attributes or `javascript:` addresses ever run.
NFR3: Nothing stored — no preview content stored by the browser or kept after the tab closes.
NFR4: Read-only — previewing never changes any file.
NFR5: Dependencies need approval — `marked` 18.1.1 approved by the owner on 2026-10-22; nothing else.

### Additional Requirements

- No starter template: brownfield app; work extends the existing `src/lib` / `src/components` split (functional core, imperative shell).
- Add `marked` 18.1.1 to `package.json`; only `src/lib/markdown.ts` may import it, and only its lexer is used (AD-5).
- `isTextFile` in `text.ts` stays the single text classifier, gains the `.ts` override; add `isMarkdownFile` and `splitLines` (AD-1, Lines convention).
- `lib/preview.ts`: `PREVIEW_MAX_BYTES` and `previewPlan(file)` decide the state before any read (AD-2).
- `TextPreview` keyed by `node.path` with a `cancelled` flag; a read failure hides the whole Preview section (AD-3, AD-4).
- `lib/markdown.ts`: `parseMarkdown(text, filePath)` → app-owned `MdBlock[]`/`MdInline[]`, decoded text, raw HTML as text (AD-5).
- `lib/links.ts`: `classifyLink` (web only for `http:`/`https:`) and `classifyImage` (local path inside the folder, percent-decoded, query/fragment dropped; else placeholder) (AD-6).
- Render rules: web links `target="_blank" rel="noopener noreferrer"`; inert links as spans; images only from `blob:` object URLs revoked in cleanup; disabled checkboxes (AD-8).
- `App` passes the root `DirNode` to `DetailPane`; `findFile(root, path)` in `tree.ts` (AD-9).
- ESLint: ban `dangerouslySetInnerHTML` in `src/` and `marked` imports outside `lib/markdown.ts`; both fail `npm run check` (AD-7).
- Hostile-Markdown fixture test asserting the model holds only text, inert links and placeholders.
- All new strings in `format.ts`; every new core file has a `*.test.ts`.
- Update the `.ts` entry under "Known pitfalls" in `CLAUDE.md` when FR7 is built (PRD addendum).
- Deployment unchanged (static GitHub Pages build).

### UX Design Requirements

UX-DR1: Add tokens `--font-mono` (system monospace stack), `--font-size-xl` (20px), `--line-height-read` (1.5), `--reading-max-width` (720px) to `tokens.css`; no new colours.
UX-DR2: Preview section below the details list with a "Preview" title in the existing `.section-title` style and a hairline divider above; absent entirely for non-text files.
UX-DR3: Preview grows to full natural height; the detail pane scrolls; no inner scroll box; the pane scrolls to the top on every new selection.
UX-DR4: Plain text view: framed box (hairline, 6px radius), grey gutter with right-aligned muted line numbers, unselectable and hidden from screen readers; wrapped lines show the number only on their first row.
UX-DR5: Rendered view capped at `--reading-max-width`; body 13px / 1.5; h1 20px and h2 16px with hairline underline, h3–h6 13px semibold; block spacing `--space-3`, `--space-4` above headings.
UX-DR6: Markdown code blocks and inline code on the sidebar fill, monospace, wrapping; blockquote with left bar and muted text; tables with hairline cells, grey header row, sideways scroll in their own wrapper only.
UX-DR7: Web links in accent colour, underline on hover, focusable; inert links in text colour with muted dotted underline, default cursor, not focusable.
UX-DR8: Image placeholder: dashed hairline box with muted alt text, or "Image" when alt is empty; local images scale down to the reading width, never up, with the Markdown alt text.
UX-DR9: State messages as one muted line: "Loading…", "File too large to preview", "Empty file"; strings in `format.ts`.
UX-DR10: Accessibility: Preview is a labelled region; state changes announced politely once; real heading/list/table semantics; disabled checkboxes announce their state; focus ring on web links.

### FR Coverage Map

FR1: Epic 1 - Plain text view with line numbers
FR2: Epic 1 - Loading message
FR3: Epic 1 - Size limit message
FR4: Epic 1 - Empty file message
FR5: Epic 1 - Latest selection only
FR6: Epic 1 - No preview for non-text files
FR7: Epic 1 - `.ts` files are text
FR8: Epic 1 - Unusual content still shown
FR9: Epic 1 - Markdown rendered view
FR10: Epic 1 - Tables, task lists, strikethrough
FR11: Epic 1 - Raw HTML as text
FR12: Epic 1 - Local images
FR13: Epic 1 - Other images never loaded
FR14: Epic 1 - Web links open a new tab
FR15: Epic 1 - Other links do nothing
NFR1–NFR5: Epic 1 - cross-cutting, checked in every story

## Epic List

### Epic 1: Read text and Markdown files inside the app
A person selects any text file in the open folder and reads it in the detail pane: plain text with line numbers, or Markdown formatted like GitHub — with local images, safe links, and nothing ever leaving the computer or running.
**FRs covered:** FR1–FR15, NFR1–NFR5, UX-DR1–UX-DR10

## Epic 1: Read text and Markdown files inside the app

A person selects any text file in the open folder and reads it in the detail pane: plain text with line numbers, or Markdown formatted like GitHub — with local images, safe links, and nothing ever leaving the computer or running. Stories are ordered; each builds only on the ones before it.

### Story 1.1: Read a plain text file with line numbers

As a student exploring a project folder,
I want to see a text file's content with line numbers below its details,
So that I can read code and config files without opening an editor.

**Acceptance Criteria:**

**Given** a folder is open
**When** I select a 3-line `.txt` file
**Then** a "Preview" section appears below the details list, after a hairline divider, showing 3 lines numbered 1, 2, 3 in a monospace font inside a framed box with a grey gutter (FR1, UX-DR2, UX-DR4)
**And** a line longer than the pane wraps and shows its number only on its first row

**Given** a text file is selected
**When** its content is still being read
**Then** the Preview section shows only "Loading…" (FR2, UX-DR9)

**Given** a text file of 1,048,577 bytes
**When** I select it
**Then** the Preview section shows "File too large to preview", the file is not read for the preview, and size, type, modified date and line count still appear above (FR3)
**And** a text file of exactly 1,048,576 bytes is shown in full

**Given** a 0-byte `.txt` or `.md` file
**When** I select it
**Then** the Preview section shows "Empty file" and no line numbers (FR4)

**Given** I select a large text file
**When** I select a small one before the first finishes loading
**Then** only the small file's content ever appears (FR5)

**Given** I select an image (including `.svg`), a `.zip` or a `.pdf`
**When** the detail pane updates
**Then** no Preview section appears; images keep today's image preview, dimensions and EXIF (FR6)

**Given** a text-extension file holding binary data
**When** I select it
**Then** its content appears as characters in the plain text view with no error message (FR8)
**And** if the read itself fails, the Preview section (title included) is not shown

**Given** the preview is showing a long file scrolled down
**When** I select another file
**Then** the detail pane is scrolled back to the top (UX-DR3)
**And** the preview has its full natural height with no inner scroll box

**Given** a screen reader
**When** I move to the preview
**Then** it is a region labelled "Preview", state changes are announced politely once, and line numbers are not read or copied with the text (UX-DR10, UX-DR4)

**Given** I have previewed every file in a test folder
**When** I check the browser's site storage and the files' modified dates
**Then** site storage for the app is empty and no modified date has changed (NFR3, NFR4)

**Implementation notes:** `isMarkdownFile` and `splitLines` in `text.ts`; `PREVIEW_MAX_BYTES` and `previewPlan` in new `preview.ts` (Markdown files use the plain view until Story 1.3); `TextPreview` and `PlainTextView` components keyed by `node.path` with a `cancelled` flag; strings in `format.ts`; tokens `--font-mono` and `--line-height-read` (UX-DR1, part). Tests for every new core function. Governed by AD-1–AD-4.

### Story 1.2: TypeScript files are text

As a student reading a TypeScript project,
I want `.ts` files to show their content and line count,
So that the most common file in my course projects isn't treated as a video.

**Acceptance Criteria:**

**Given** a `.ts` file that Chrome reports as `video/mp2t`
**When** I select it
**Then** the details show a Lines row and the Preview section shows the plain text view (FR7)

**Given** a real transport-stream video renamed `.ts`, under 1 MB
**When** I select it
**Then** it shows garbled characters in the plain text view and no error (FR8, PRD Known Risk accepted)

**Given** the `.ts` rule is in place
**When** the story is done
**Then** the `.ts` entry under "Known pitfalls" in `CLAUDE.md` no longer says to ask before changing it, and `isTextFile` has a test for the override

**Implementation notes:** the override lives inside `isTextFile` (AD-1), so the line count and preview change together.

### Story 1.3: Read Markdown formatted, safely

As a student opening a project's README,
I want Markdown shown formatted the way GitHub shows it,
So that I read headings, checklists and tables instead of raw symbols.

**Acceptance Criteria:**

**Given** a `.md` or `.markdown` file within the size limit
**When** I select it
**Then** the Preview section shows the rendered view with no line numbers: `# Title` is a heading with no `#` visible; bold, italic, ordered and unordered lists, blockquotes, horizontal rules and code blocks appear formatted; code blocks are monospace with no colour highlighting (FR9)

**Given** a Markdown table with a header and two body rows, `- [x] done`, `- [ ] todo` and `~~old~~`
**When** it is rendered
**Then** it shows a 3-row table, one ticked and one unticked checkbox, and struck-through "old" (FR10)
**And** clicking a checkbox does not change it

**Given** Markdown containing `<b>hi</b>` and `<script>alert(1)</script>`
**When** it is rendered
**Then** both appear literally as text and no alert opens (FR11, NFR2)

**Given** any link or image in the Markdown
**When** it is rendered in this story
**Then** every link is inert (text colour, dotted underline, no action on click) and every image is a dashed placeholder with its alt text or "Image" — nothing is loaded and no request is made (FR13, FR15, NFR1, UX-DR7, UX-DR8)

**Given** the rendered view
**When** I compare it with the design
**Then** it is capped at the reading width; h1 20px and h2 16px with a hairline underline; code on the sidebar fill; tables with hairline cells and a grey header row, scrolling sideways only inside their own wrapper (UX-DR5, UX-DR6)

**Given** the codebase after this story
**When** `npm run check` runs
**Then** it fails if `dangerouslySetInnerHTML` appears in `src/` or `marked` is imported outside `src/lib/markdown.ts` (AD-7)
**And** a hostile Markdown fixture (script tag, `onerror` attribute, `javascript:` link, remote image) produces a model with only text, inert links and placeholders

**Implementation notes:** add `marked` 18.1.1 (owner-approved, NFR5); `parseMarkdown(text, filePath)` in new `markdown.ts` returns app-owned `MdBlock[]`/`MdInline[]` with decoded text (AD-5); `MarkdownView` renders the model only; tokens `--font-size-xl` and `--reading-max-width` (UX-DR1 complete).

### Story 1.4: Open web links from a README

As a student reading a README,
I want web links to open in a new tab,
So that I can visit the project's website without losing my place in the folder.

**Acceptance Criteria:**

**Given** a rendered `[site](https://example.com)`, a bare `https://example.com` and `<https://example.com>`
**When** I click any of them
**Then** a new tab opens on that address and the app tab keeps its folder, selected file and scroll position (FR14)
**And** the link has `rel="noopener noreferrer"`, so the new page cannot reach the app tab or see the referrer

**Given** links to `docs/setup.md`, `#setup`, `mailto:a@b.c` and `javascript:alert(1)`
**When** I click any of them
**Then** nothing happens and no code runs; they stay inert, are not in the Tab order, and carry no `href` (FR15, NFR2)

**Given** keyboard use
**When** I press Tab through the preview
**Then** focus moves through web links only, in reading order, with the existing focus ring, and Enter opens the link in a new tab (UX-DR7, UX-DR10)

**Implementation notes:** `classifyLink` in new `links.ts` returns `web` only for exactly `http:`/`https:` schemes; `parseMarkdown` stores the verdict (AD-6); web links rendered in the accent colour (AD-8).

### Story 1.5: Show a README's own images

As a student reading a README with screenshots,
I want images stored in the folder to appear in the rendered view,
So that diagrams and screenshots read as the author intended.

**Acceptance Criteria:**

**Given** `README.md` at the folder top containing `![logo](images/logo.png)` and that file exists
**When** I select the README
**Then** the image appears, scaled down to the reading width if wider, never up, with "logo" as its alt text (FR12, UX-DR8)

**Given** `docs/guide.md` containing `![x](img/a.png)` and `![x](/img/a.png)`
**When** it is rendered
**Then** the first shows `docs/img/a.png` and the second shows `img/a.png` from the folder top (FR12)
**And** `my%20shot.png` finds `my shot.png`, and a `?v=2` or `#part` suffix is ignored

**Given** an image path that does not exist, or leads outside the folder (`../../x.png`)
**When** it is rendered
**Then** a placeholder is shown (FR12)

**Given** `https://…`, `//…` and `data:` images
**When** rendered
**Then** they stay placeholders and the browser network log shows no request (FR13, NFR1)

**Given** I switch away from a README with images
**When** the preview is replaced
**Then** every object URL it created is revoked

**Implementation notes:** `classifyImage` in `links.ts` (AD-6); `findFile(root, path)` in `tree.ts`; `App` passes the root `DirNode` to `DetailPane` as a prop (AD-9); `LocalImage` creates the object URL in an effect and revokes it in cleanup (AD-8).
