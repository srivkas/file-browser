# Input reconciliation: EARS requirements vs PRD

- **Input:** `notes/l4-ex1-ears.md` (Level 4 exercise 1: 4 EARS requirements, 4 tests, 6 decisions)
- **Target:** `prd.md` and `addendum.md` in this folder
- **Date:** 2026-10-22
- **Verdict:** All 4 EARS requirements and all 4 tests are carried into the PRD with the same trigger, response and exact strings. Five of the six decisions are reflected as-is; one decision (links) was narrowed in meaning. A few form and coverage gaps are listed below.

## 1. Requirement-by-requirement

| # | Input EARS requirement | PRD FR | Trigger | Response | Test strings | Form | Status |
|---|---|---|---|---|---|---|---|
| 1 | When the user selects a Markdown file of 1 MB or smaller, the app shall display it rendered | FR-9 | Same ("within the size limit" = ≤ 1,048,576 bytes per Glossary) | Same, plus "without line numbers" (from decision 1) | `# Title` → heading "Title", no `#` visible: exact match (FR-9 consequence 1) | When…shall | Match |
| 2 | When the user selects a text file that is not Markdown and is 1 MB or smaller, the app shall display its content with its line number next to each line | FR-1 | Same | "in the plain text view"; the line numbers are only in the Glossary definition of *Plain text view* ("a line number before each line") | `.txt` with 3 lines → numbered 1, 2, 3: exact match (FR-1 consequence 1) | When…shall | Match, with indirection (see gap G4) |
| 3 | While the selected text file is being read, the app shall show "Loading…" in the preview pane | FR-2 | Same | Same string "Loading…"; "preview pane" became "the preview" (Glossary: area inside the detail pane) | "Loading…" before reading finishes: match; adds "and no content". Input's "any text file / select it" setup is implicit, not written | While…shall | Match (see gap G3) |
| 4 | If the selected text file is larger than 1 MB, then the app shall show "File too large to preview" instead of its content | FR-3 | Same (> 1,048,576 bytes) | Same string "File too large to preview", "instead of its content" | 1,048,577 bytes → message, no content: exact match (FR-3 consequence 1). PRD adds the boundary test 1,048,576 bytes → shown in full | If…then…shall | Match |

Exact strings checked: "Loading…" (with the single ellipsis character) appears in FR-2 and UJ-1; "File too large to preview" appears in FR-3 and UJ-1; "1,048,577 bytes" in FR-3; "1,048,576 bytes" in Glossary (Size limit) and FR-3.

## 2. Decision-by-decision

| Input decision | Where in PRD | Status |
|---|---|---|
| Markdown shown rendered only: no line numbers, no source/rendered toggle | FR-9 ("without line numbers"), §7.2 (toggle out of scope), §4.2 description ("never as raw source") | Reflected |
| Every other text file shown as raw text with line numbers | FR-1 + Glossary *Plain text view* ("exactly as written… a line number before each line") | Reflected |
| Size cap 1 MB (1,048,576 bytes); above it only the message; size, type, date and line count still show | Glossary *Size limit*; FR-3 consequences 1 and 3; UJ-1 edge case | Reflected |
| Markdown images: relative images found in the folder shown; external (`http…`) or missing images get a placeholder; no network requests | FR-12 (local images), FR-12 consequence 2 (missing → placeholder), FR-13 (web images → placeholder), NFR-1 (no network) | Reflected, with coverage gaps (G2) |
| Markdown links open in a new tab when clicked | FR-14 (web links only → new tab), FR-15 (all other links do nothing) | **Narrowed** (G1) |
| Out of scope: syntax highlighting, source/rendered toggle | §6 Non-Goals ("no colour highlighting"), FR-9 consequence 3, §7.2 | Reflected |

## 3. Gaps and drift

- **G1. Link decision narrowed (meaning change).** Input: "Markdown links open in a new tab when clicked" (all links). PRD: only `http://`/`https://` links open in a new tab (FR-14); relative, `mailto:`, `#heading` and `javascript:` links do nothing (FR-15), with file-to-file links and heading jumps deferred (§7.2). This is a safer and plausibly intended refinement, and §10 says assumptions were owner-confirmed, but the input note was never updated, so the two sources disagree. Confirm with the owner and either update the note or record the refinement as a decision.
- **G2. Image coverage holes.** The "missing image → placeholder" rule exists only as an FR-12 *consequence*, not as its own EARS `shall`. Images that are neither local paths nor `http(s)://` (protocol-relative `//host/x.png`, `data:`, `file:`, absolute `/x.png`, paths escaping the folder with `../`) are not assigned a behaviour; the input's "external (`http…`)" and the Glossary's *Web image* (strictly `http://`/`https://`) both miss protocol-relative URLs, which would make a network request. NFR-1 still forbids the request, but no FR says what is displayed. Suggest: "If a Markdown file refers to an image that is not a local image in the folder, then the rendered view shall show a placeholder."
- **G3. "Loading…" vs. over-limit files unspecified.** Input test 3 says "any text file". The PRD does not say whether a file above the size limit shows "Loading…" first (e.g. while its line count is computed for the detail pane) or goes straight to "File too large to preview". Minor, but a test writer has to guess.
- **G4. Line numbers moved out of the requirement text.** Input req 2 states the line numbers in the `shall` clause; FR-1 delegates them to the Glossary term *Plain text view*. Meaning is preserved and the test still checks numbering, but the requirement sentence alone no longer states the observable behaviour.
- **G5. EARS form and subject consistency.** FR-1–FR-4 keep proper EARS form (When / While / If…then…shall). Elsewhere: FR-8 uses "When" for a condition of the file's content rather than an event, and is really unwanted-behaviour form ("If a text file contains… then the preview shall…"). FR-7 and FR-10 are ubiquitous (`The app shall…`), which is valid EARS. The system subject drifts between "the app" (input; FR-6, FR-7, FR-14, FR-15), "the preview" (FR-1–FR-5, FR-8) and "the rendered view" (FR-9–FR-13); EARS recommends one named system. FR-6 and FR-15 are negative `shall`s ("show no text preview", "do nothing"), testable only through their consequences.

## 4. Additions in the PRD not in the input (no conflict)

FR-4 (empty file → "Empty file"), FR-5 (latest selection only), FR-6 (non-text files unaffected), FR-7 (`.ts` always text; addendum notes the CLAUDE.md pitfall must be updated when built), FR-8 (garbled content, no error), FR-10 (tables, task lists, strikethrough; checkboxes not clickable), FR-11 (raw HTML shown as text), NFR-1–NFR-5, the boundary test at exactly 1,048,576 bytes, and the Glossary rule that an extension-less `README` is a text file, not Markdown. None contradict the input.

## 5. Addendum check

The addendum adds no requirement that touches the four EARS items. Its `.ts` note (update "Known pitfalls" in `CLAUDE.md` when FR-7 is built) aligns with the CLAUDE.md instruction to ask before changing the `.ts` MIME behaviour; FR-7 records that decision as made.
