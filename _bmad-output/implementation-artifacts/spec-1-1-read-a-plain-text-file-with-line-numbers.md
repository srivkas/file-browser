---
title: 'Story 1.1: Read a plain text file with line numbers'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '7d767203c27b7b43dd5c4aacc7d81bbd8f84750c'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Selecting a text file shows only its details; the app never shows what the file says.

**Approach:** Add a Preview section below the details for every text file: a plan decided from size and kind before reading, a keyed reader component, and a plain text view with a line-number gutter. Markdown files use the plain view until Story 1.3.

## Boundaries & Constraints

**Always:** decisions in `src/lib` (no React) with tests; strings only in `format.ts`; CSS only via tokens; `isTextFile` stays the single classifier; read only with `file.text()`; `key={node.path}` + `cancelled` flag; a rejected read hides the whole section.

**Never:** add `marked` or render Markdown (Story 1.3); change `isTextFile`'s result for any file (`.ts` is Story 1.2); an inner scroll box; touch the image preview; network or storage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Plain text | 3-line `.txt` | Rows 1, 2, 3, monospace, framed, grey gutter | N/A |
| Markdown for now | `.md` ≤ 1 MB | Plain view with numbers | N/A |
| Reading | read pending | Only "Loading…" | N/A |
| Over limit | 1,048,577 B | "File too large to preview"; not read for the preview; details + Lines row stay | N/A |
| At limit | 1,048,576 B | Shown in full | N/A |
| Empty | 0 B `.txt` / `.md` | "Empty file", no numbers | N/A |
| Not text | image, `.svg`, `.zip`, `.pdf` | No Preview section; image preview unchanged | N/A |
| Binary content | text extension, binary bytes | Replacement characters shown, no error | N/A |
| Read fails | `file.text()` rejects | No Preview section at all | silent |
| Fast switch | big file then small before load | Only the small file ever appears | stale result dropped |
| Trailing newline | `"a\nb\n"` | 2 rows (same rule as `countLines`) | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/text.ts` -- `isTextFile` (reuse, unchanged), `countLines` (rule to mirror); add `isMarkdownFile`, `splitLines`.
- `src/lib/format.ts` -- `extension()` (reuse for `isMarkdownFile`); add preview strings.
- `src/lib/preview.ts` -- new: `PREVIEW_MAX_BYTES`, `previewPlan`.
- `src/components/DetailPane.tsx` -- mounts sub-parts with `key={node.path}`; `LineCount` shows the read + `cancelled` pattern to copy. Do not change `ImageDetails`.
- `src/App.tsx` -- owns `.detail-pane`, the scroll container.
- `src/styles/app.css` -- `.section-title`, `.muted` exist; `.preview` is the image class (don't reuse the name).
- `src/styles/tokens.css` -- add tokens here only.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/text.ts` + `text.test.ts` -- add `isMarkdownFile(file)` (`isTextFile` and extension `md`/`markdown`) and `splitLines(text)` (split on `\r?\n`, drop the one empty item after a trailing newline, `''` → `[]`, `'\n'` → `['']`) -- one line rule for gutter and Lines row.
- [x] `src/lib/preview.ts` + `preview.test.ts` -- `PREVIEW_MAX_BYTES = 1_048_576`; `previewPlan(file)` → `'none'` (not text) / `'too-large'` (`size > max`) / `'empty'` (size 0) / `'markdown'` / `'plain'` -- state before reading.
- [x] `src/lib/format.ts` + test -- `PREVIEW_TITLE = 'Preview'` and `formatPreviewMessage(kind)` for `'loading' | 'too-large' | 'empty'` → "Loading…", "File too large to preview", "Empty file".
- [x] `src/components/TextPreview.tsx` -- new: plan; `none` → null; messages for `too-large`/`empty`; otherwise read with `cancelled` flag, "Loading…" until done, `PlainTextView` for `plain` and `markdown`, null on rejection. Renders `<section aria-labelledby>` with an `h3.section-title` "Preview"; messages are `<p className="muted" role="status">`.
- [x] `src/components/PlainTextView.tsx` -- new: one row per `splitLines` item; number cell `aria-hidden` and unselectable; text cell `pre-wrap`, wrapping anywhere; gutter width from the digit count via a CSS custom property.
- [x] `src/components/DetailPane.tsx` -- mount `<TextPreview key={node.path} file={file} />` after the details list.
- [x] `src/App.tsx` -- `key={selected?.path}` on the `.detail-pane` section so each selection starts scrolled to the top.
- [x] `src/styles/tokens.css` -- add `--font-mono` (system monospace stack) and `--line-height-read: 1.5`.
- [x] `src/styles/app.css` -- `.text-preview` (hairline top divider, `--space-4` gap), `.plain-text` (frame, radius, mono, `--font-size-sm`, `--line-height-read`), `.plain-text-row`, `.plain-text-num` (sidebar fill, muted, right-aligned, hairline right border, `user-select: none`), `.plain-text-line`.

**Acceptance Criteria:**
- Given a long file scrolled down, when another file is selected, then the detail pane is at the top and the preview has full natural height with no inner scroll box.
- Given a screen reader, then the preview is a region named "Preview", state messages are announced once, and line numbers are neither read nor copied.
- Given any file, when previewed, then no network request is made, site storage stays empty and no file changes.

## Implementation Notes

- Implemented directly in this session (no implementation subagent).
- `TextPreview` uses `key={`${node.path}#text`}`: React flagged a duplicate sibling key with `ImageDetails` (`key={node.path}`) on image files. Behaviour as specified.
- Review patches: `useId` for the heading id; `--tab-size: 4` token on `.plain-text-line`; tests pinning that "not text" wins over size in `previewPlan`.
- Component rows of the I/O matrix (Loading, fast switch, read failure, binary, scroll-to-top, copy without numbers, no section for image/zip) have no automated test — the project has no DOM test environment and adding one needs a new dependency. Verified by hand in the dev server with a scripted test folder; all rows behaved as specified, light and dark.
- Measured: a 30,000-line 1 MB log renders in ~0.6 s; a 1 MB file of only newlines (1,048,576 rows) takes ~14 s. Deferred, see deferred-work.md.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | blind | No `prompts/l4-exN-*.md` for this work | medium | CLAUDE.md requires it with the feature commit; added at commit time (patch). |
| 2 | blind | File read twice (LineCount + preview) | low | Real, but recorded as Deferred in the architecture spine; rejected here. |
| 3 | blind | Outer `.detail-pane` key makes inner keys redundant | low | True and harmless; AD-3 keeps the per-component key. Rejected. |
| 4 | blind | `role="status"` mounted already filled may not be announced | maybe-false | Needs a screen-reader check; a reliable fix needs a live region outside the keyed pane. Defer (medium, unverified). |
| 5 | blind+verification | No tests for component-level matrix rows | medium | No DOM test env; needs a dependency. Defer; verified by hand. |
| 6 | blind+edge | 1 MB of very short lines builds a huge DOM | medium | Measured 14 s for 1,048,576 blank lines; 0.6 s for a realistic 30k-line log. Architecture deferred this; defer with measurement. |
| 7 | blind | No `tab-size`; tabs render 8 wide | low | Real, direct fix. Patched (`--tab-size`). |
| 8 | blind | Hard-coded heading id | low | Direct fix. Patched (`useId`). |
| 9 | blind+edge | Lone `\r` (classic Mac) not a line break | low | Rare; fix must change `countLines` too. Rejected. |
| 10 | blind | `text/markdown` without `.md` not Markdown | false | PRD defines Markdown by extension. |
| 11 | blind | Duplicate sibling keys `ModifiedDate`/`LineCount` | low | Pre-existing in baseline. Defer, reported to owner. |
| 12 | edge | BOM-only file shows an empty frame | low | Rare; adds a branch. Rejected. |
| 13 | edge | Non-UTF-8 shows replacement characters | false | That is FR8's required behaviour. |
| 14 | edge | Key differs from spec text | false | Deviation documented in Implementation Notes; behaviour matches. |
| 15 | verification | `previewPlan` precedence of not-text over size unpinned | medium | Patched: two assertions added. |

## Design Notes

Messages, not content, are live regions: making the whole section `aria-live` would read a 1 MB file aloud. Rows are block elements so a copied selection keeps its line breaks.

## Verification

**Commands:**
- `npm run check` -- expected: typecheck, lint and all tests pass.

**Manual checks (if no CLI):**
- In the dev server, open a folder with a `.txt`, a long-line file, a 0-byte file, a >1 MB `.log` and an image; check each row of the I/O matrix, in light and dark mode.
