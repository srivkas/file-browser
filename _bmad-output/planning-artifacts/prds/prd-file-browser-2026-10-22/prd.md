---
title: "PRD: Text & Markdown preview"
status: final
created: 2026-10-22
updated: 2026-10-22
---

# PRD: Text & Markdown preview

## 0. Document Purpose

This PRD defines what the Text & Markdown preview epic of file-browser must do, in requirements a test can check. It is written for the product owner, for the UX pass, and for the architecture and story-writing steps that follow. It builds on the product brief for this epic and does not repeat its reasoning. file-browser is a course-practice app, so this is a learning goal rather than a market need. Terms in the Glossary are used exactly as defined; requirements are numbered FR-1, FR-2… and keep their numbers if sections move.

## 1. Vision

file-browser already lets a person open a folder on their computer and see its files and their details. It has never shown what a file says. This epic adds a preview: select a text file and read it, without leaving the app.

Markdown, the format most READMEs and notes are written in, is shown the way GitHub shows it: formatted headings, lists, tables and code, not raw symbols. Every other text file is shown as plain text with line numbers. The preview keeps the app's promises: nothing leaves the computer, nothing in a file can run, and nothing is changed or stored.

## 2. Target User

### 2.1 Jobs To Be Done
- Read a README or a note in a folder I already have open, without switching to an editor.
- Read Markdown formatted, as it is meant to be read, not as raw symbols.
- Glance at a code or config file's content, with line numbers to keep my place.
- Trust that previewing a file I don't know cannot leak my folder or run anything.

### 2.2 Key User Journey
- **UJ-1. Noa reads a cloned project's README before running it.**
  Noa, a student, cloned a course project and opened its folder in file-browser to see what is inside. She selects `README.md` in the tree. The preview shows "Loading…" for a moment, then the README formatted as on GitHub: a title, a setup checklist, a table of commands. She clicks a link to the project's website; it opens in a new tab and her folder stays open. She then selects `package.json` and reads it as numbered plain text. **Edge case:** she selects a 5 MB log file; the preview says "File too large to preview", and the details still show its size and line count.

## 3. Glossary
- **Folder** — the folder the user opened in file-browser. Everything the app shows comes from it.
- **Selected file** — the one file currently chosen in the tree.
- **Detail pane** — the existing area showing the selected file's name, size, type, modified date and, for text files, line count.
- **Preview** — the new area inside the detail pane, below the file details, that shows the selected file's content. It sits where the image preview sits today.
- **Text file** — a file the browser reports as text or a common text format (such as JSON or XML), or, when the browser reports no type, whose extension is on the app's list of text and code extensions. Files ending in `.ts` are always text files. A file with no extension (such as `README` or `LICENSE`) is not a text file in this epic and gets no preview. Known limitation: files whose whole name starts with a dot and has no other dot (such as `.gitignore`) are treated the same way.
- **Markdown file** — a text file whose name ends in `.md` or `.markdown`.
- **Plain text view** — the selected file's content shown exactly as written, in a monospace font, with a line number before each line.
- **Rendered view** — a Markdown file shown formatted (headings, lists, tables…) instead of as raw symbols.
- **Size limit** — 1 MB (1,048,576 bytes). Files larger than this are not shown in the preview.
- **Local image** — an image a Markdown file refers to by a path. A plain path is read from the Markdown file's own location; a path starting with `/` is read from the top of the folder. A path that leads outside the folder is not a local image.
- **Placeholder** — a bordered box showing the image's alternative text, used for any image the preview does not show.
- **Web link** — a link whose address starts with `http://` or `https://`.

## 4. Features

### 4.1 Text preview

**Description:** When the selected file is a text file, the preview shows its content below the file details. Markdown files get the rendered view (§4.2); every other text file gets the plain text view. The preview always belongs to the selected file: switching files replaces it, and content from a file that is no longer selected never appears. Files that are not text files are unaffected. Realizes UJ-1.

#### FR-1: Plain text view _(EARS requirement 2)_
When the user selects a text file that is not a Markdown file and is within the size limit, the preview shall show its content in the plain text view, with a line number before each line.

**Consequences (testable):**
- A `.txt` file with 3 lines shows 3 lines numbered 1, 2, 3.
- Content is shown exactly as written, in a monospace font; a line longer than the preview's width wraps onto the next row and keeps a single line number.
- A `package.json` and a `.ts` file are both shown in the plain text view.

#### FR-2: Loading message _(EARS requirement 3)_
While the selected text file is being read, the preview shall show "Loading…".

**Consequences (testable):**
- Before reading finishes, the preview shows "Loading…" and no content.

#### FR-3: Size limit _(EARS requirement 4)_
If the selected text file is larger than the size limit, then the preview shall show "File too large to preview" instead of its content.

**Consequences (testable):**
- A text file of 1,048,577 bytes shows "File too large to preview" and no content.
- A text file of exactly 1,048,576 bytes is shown in full.
- The detail pane still shows the file's size, type and modified date, and its line count as today.

#### FR-4: Empty file
When the user selects a text file of 0 bytes, the preview shall show "Empty file".

**Consequences (testable):**
- A 0-byte `.txt` and a 0-byte `.md` both show "Empty file" and no line numbers.

#### FR-5: Latest selection only
When the user selects a different file while the previous one is still being read, the preview shall show only the newly selected file.

**Consequences (testable):**
- Selecting a large text file and then, before it loads, a small one leaves the small file's content in the preview; the large file's content never appears.

#### FR-6: Files that are not text files
When the user selects a file that is not a text file, the app shall show no text preview.

**Consequences (testable):**
- An image still shows today's image preview, dimensions and EXIF data; this includes `.svg` images.
- A `.zip` or `.pdf` file shows only the file details.

#### FR-7: TypeScript files are text files
The app shall treat every file whose name ends in `.ts` as a text file, whatever type the browser reports.

**Consequences (testable):**
- A `.ts` file shows the plain text view and a line count in the detail pane.

#### FR-8: Unusual content is still shown
If a text file contains characters that cannot be read as text (an unexpected encoding, or binary data in a file with a text extension), then the preview shall still show the content, without an error message.

**Consequences (testable):**
- A video file renamed to `.ts` (under the size limit) shows garbled characters in the plain text view and no error.

### 4.2 Markdown rendered view

**Description:** A Markdown file is shown formatted, the way GitHub shows a README, never as raw source. The view covers common Markdown plus three GitHub additions: tables, task lists and strikethrough. Links and images follow FR-12 to FR-15 and the safety rules in §5. Realizes UJ-1.

#### FR-9: Rendered view _(EARS requirement 1)_
When the user selects a Markdown file within the size limit, the preview shall show it in the rendered view, without line numbers.

**Consequences (testable):**
- A `.md` file containing `# Title` shows a heading "Title" with no `#` visible.
- Headings, bold and italic text, ordered and unordered lists, blockquotes, code blocks, horizontal rules, links and images each appear formatted, not as raw symbols.
- Code blocks are shown in a monospace font with no colour highlighting.

#### FR-10: Tables, task lists and strikethrough
The rendered view shall show tables as tables, task list items as checkboxes, and `~~text~~` as struck-through text.

**Consequences (testable):**
- A Markdown table with a header row and two body rows appears as a 3-row table.
- `- [x] done` and `- [ ] todo` appear as one ticked and one unticked checkbox.
- Clicking a checkbox does not tick or untick it; the app never changes a file.

#### FR-11: Raw HTML is shown as text
When a Markdown file contains HTML tags, the rendered view shall show the tags as plain text and not interpret them.

**Consequences (testable):**
- `<b>hi</b>` appears literally as `<b>hi</b>`, not as bold "hi".
- `<script>alert(1)</script>` appears as text and no alert opens.
- Accepted cost: READMEs that use HTML to centre a logo or arrange images look plainer than on GitHub.

#### FR-12: Local images
When a Markdown file refers to a local image that exists in the folder, the rendered view shall show that image; if it does not exist, the rendered view shall show a placeholder.

**Consequences (testable):**
- `![logo](images/logo.png)` in `README.md` shows `images/logo.png` from the folder.
- In `docs/guide.md`, `![x](img/a.png)` shows `docs/img/a.png` and `![x](/img/a.png)` shows `img/a.png`.
- A reference to an image that is not in the folder, or that leads outside it, shows a placeholder.

#### FR-13: Other images are never loaded
When a Markdown file refers to an image that is not a local image (a web address, an address starting with `//`, or an embedded image), the rendered view shall show a placeholder instead.

**Consequences (testable):**
- `![badge](https://example.com/badge.svg)` and `![b](//example.com/b.png)` each show a placeholder, and no network request is made.

#### FR-14: Web links open in a new tab
When the user clicks a web link in the rendered view, the app shall open it in a new browser tab.

**Consequences (testable):**
- Clicking `[site](https://example.com)` opens a new tab; the original tab still shows the folder and the same selected file.
- A bare address written as `https://example.com` or `<https://example.com>` appears as a web link and behaves the same.
- The opened page cannot read or change the app's tab, and is not told which page linked to it.

#### FR-15: Other links do nothing
When the user clicks a link in the rendered view that is not a web link, the app shall do nothing.

**Consequences (testable):**
- Clicking `[setup](docs/setup.md)` changes nothing.
- Clicking a `javascript:` link runs no code and changes nothing.
- Clicking a `mailto:` link or a link to a heading in the same file (`#setup`) changes nothing.

## 5. Safety and Privacy (cross-cutting)

These apply to every requirement above and to every file the user may preview, including files written to cause harm.

- **NFR-1: No network.** Previewing any file, and clicking anything in the preview other than a web link, shall cause no network request. Test: with the browser's network log open, preview a Markdown file containing web images and links; the log stays empty.
- **NFR-2: No code from files.** Nothing in a previewed file shall run: no scripts, no code hidden in tag attributes, no `javascript:` addresses. Test: a Markdown file containing each of these opens no alert and changes nothing on the page.
- **NFR-3: Nothing stored.** No preview content shall be stored by the browser or survive closing the tab. Test: after previewing files, the browser's site-storage view for the app is empty.
- **NFR-4: Read-only.** Previewing shall never change any file in the folder. Test: after previewing every file in a test folder, every file's modified date is unchanged.
- **NFR-5: Dependencies need approval.** Any new third-party package needs the product owner's approval before it is added, because students read and trust every dependency.

## 6. Non-Goals

- Not an editor: the preview never changes, saves or creates files.
- Not a code viewer: no colour highlighting, no code folding, no search inside the file.
- Not a full GitHub clone: no footnotes, alerts (`> [!NOTE]`), diagrams, maths or emoji shortcodes.
- Not a web browser: no remote content is ever fetched.

## 7. MVP Scope

### 7.1 In Scope
- Everything in §4 and §5.

### 7.2 Out of Scope
- A toggle between the rendered view and the Markdown source.
- Clicking a link to another file in the folder to select it in the tree (deferred; a natural next story).
- Jumping to a heading from a `#heading` link (deferred).
- Previews for PDF, audio or video files (other epics).
- Files with no extension (such as `README`), and dot-named files such as `.gitignore`, are not text files in this epic (see Glossary).

## 8. Success Metrics

**Primary**
- **SM-1: Reads like GitHub.** A real README with headings, lists, a table, a code block and a task list, viewed side by side with GitHub's rendering, has every element in the same form (heading as heading, table as table…). Validates FR-9, FR-10.
- **SM-2: Every requirement passes its test.** Each FR and NFR consequence above passes; the project's check command passes. Validates FR-1–FR-15, NFR-1–NFR-4.

**Secondary**
- **SM-3: Safe against a hostile file.** A Markdown file built to attack (script tags, event handlers, `javascript:` links, web images) runs nothing and makes no request. Validates FR-11, FR-13, FR-15, NFR-1, NFR-2.

**Counter-metrics (do not optimize)**
- **SM-C1: Pixel-perfect likeness to GitHub.** Matching GitHub's exact fonts, spacing or colours is not a goal; the app's own look comes first. Counterbalances SM-1.
- **SM-C2: Markdown coverage.** Supporting more syntax than §4.2 names is not a goal if it costs safety or new dependencies. Counterbalances SM-1.

## 9. Known Risks
- **A video file named `.ts`.** Transport-stream videos also use `.ts`; under FR-7 such a video shows as garbled text (FR-8). Accepted by the product owner, who rarely opens these.

## 10. Open Questions
- None blocking. Deferred items are listed in §7.2.

## 11. Assumptions Index
- None open; every assumption was confirmed by the product owner on 2026-10-22.
