# Input reconciliation: product brief → PRD

- **Input:** `briefs/brief-file-browser-2026-10-22/` (brief.md, addendum.md, .memlog.md); EARS source `notes/l4-ex1-ears.md` consulted for criterion 5.
- **Target:** `prds/prd-file-browser-2026-10-22/prd.md` + `addendum.md` (and the PRD `.memlog.md` for owner decisions).
- **Date:** 2026-10-22
- **Excluded by design (not gaps):** implementation detail in the PRD addendum (libraries, framework-free core, `.ts` pitfall note); new PRD decisions — "Empty file" message (FR-4), latest selection only (FR-5), preview inside the detail pane (Glossary), read-only checkboxes (FR-10), `mailto:` / `#anchor` links do nothing (FR-15).

## Gaps

### G1. "Looks like GitHub" weakened to "same element types" (qualitative, medium)
- **Brief:** Solution, Markdown bullet: "styled to look like GitHub's rendering of a README". Success Criteria 1: a real README "looks recognisably like GitHub's rendering of it". Memlog: "Reads nicely = looks like GitHub's Markdown rendering (GFM look)"; motivation "user loves Markdown that reads nicely".
- **PRD:** SM-1 checks only that each element has "the same form (heading as heading, table as table…)" — a structural test. SM-C1 adds "the app's own look comes first". No FR or NFR names styling at all; FR-9 only requires "formatted, not as raw symbols".
- **Effect:** A rendering with correct elements but none of GitHub's visual feel (spacing, table borders, code-block background, heading rules) passes every PRD test. SM-C1 was owner-approved, but it rules out *pixel-perfect*, while the brief asked for *recognisable likeness* — the middle ground is unstated.
- **Suggested fix:** Add to SM-1 (or FR-9) a qualitative check, e.g. "a reviewer viewing both side by side recognises the same visual style (heading weights and rules, bordered tables, shaded code blocks, checkbox list items), using the app's own tokens."

### G2. "Simplest, most standard" rendering not carried over (qualitative/constraint, medium)
- **Brief:** Memlog motivation: "wants the simplest, most standard solution, modeled on how existing tools render Markdown". Brief addendum: CommonMark is the base, GFM the superset; the three chosen additions are exactly the GFM ones.
- **PRD:** §4.2 lists elements by name but never ties them to CommonMark/GFM behaviour; the PRD addendum only points to the research. Edge cases (nested lists, lazy continuation, setext headings, indented code, autolinks, hard line breaks) are therefore undefined.
- **Effect:** A partial hand-rolled subset could satisfy every FR while diverging from what users expect from "standard" Markdown; the brief's intent of standard behaviour is lost as a requirement.
- **Suggested fix:** State in §4.2 (product language) that Markdown follows the common standard GitHub uses, so the same text renders the same way as on GitHub for the named elements; or record explicitly that a subset is acceptable.

### G3. Known risk dropped as a risk (risk, low-medium)
- **Brief:** Known Risks: an MPEG-TS video named `.ts` will show as garbled text; "Accepted: the product owner rarely opens these."
- **PRD:** No risks section. The situation survives only as an expected-behaviour test in FR-8 ("A video file renamed to `.ts` … shows garbled characters"); the acceptance rationale and owner sign-off are gone, and §10 says no open assumptions.
- **Effect:** Downstream readers (architecture, stories) see garbled output as intended design rather than an accepted trade-off, and the trade-off is not revisited if usage changes. Also, real `.ts` videos are usually over 1 MB, so most will show "File too large to preview" — neither document says so.
- **Suggested fix:** Add a short "Known Risks" (or note under FR-7) carrying the brief's risk and acceptance.

### G4. "Web image" definition narrower than "never fetches" (constraint, low-medium)
- **Brief:** Solution: "Images that point to the web … are replaced by a placeholder; the app never fetches them." Constraint: "Nothing in a previewed file may cause a request, including remote images."
- **PRD:** Glossary defines web link/image as an address starting with `http://` or `https://`; Local image = a path inside the folder. Addresses such as protocol-relative `//host/img.png`, `data:`, `blob:`, `file://` or absolute OS paths fall into neither category, so FR-12/FR-13 say nothing about them. NFR-1 still forbids requests globally, which partly backstops this.
- **Effect:** Image/link handling for these forms is unspecified; a protocol-relative URL would be a network request if treated as a path. Also unspecified: whether relative image paths resolve from the Markdown file's own directory or the folder root (brief addendum notes tools resolve from the file).
- **Suggested fix:** Define "every image that is not a local image shows a placeholder", and state the resolution base for relative paths.

### G5. Course framing and traceability thinned (context/success criterion, low)
- **Brief:** Problem: "this is a learning goal rather than a market need" (memlog: approved explicitly "including the explicit learning-goal sentence"). Success Criterion 5: the four EARS requirements each pass their stated test. Constraint rationale for dependencies: "because students read and trust every dependency".
- **PRD:** Vision and Target User never mention the course / learning context. The four EARS lines are absorbed into FR-9, FR-1, FR-2, FR-3 (memlog), but the PRD itself does not mark which FRs are the EARS requirements, and FR-1's wording differs from EARS 2. NFR-5 drops the "students" rationale. SM-2 validates NFR-1–NFR-4 only; NFR-5 has no success measure.
- **Effect:** Readers cannot trace criterion 5 to specific FRs from the PRD alone; the medium-rigor, course-practice stakes are not visible to the UX/architecture steps.
- **Suggested fix:** Tag FR-1/2/3/9 as "(EARS 2/3/4/1)", add one sentence of course context to §1 or §0, extend SM-2 to NFR-5.

## Checked and carried over (no gap)

| Brief item | PRD location |
|---|---|
| Markdown rendered only, no toggle | FR-9, §7.2 |
| Plain text, monospace, line numbers, long lines wrap | FR-1 |
| JSON/JS/TS and other code as plain text | FR-1, Glossary "Text file" |
| `.ts` treated as text, gains line count | FR-7 |
| Unexpected encoding still shown | FR-8 |
| "Loading…" | FR-2 |
| 1 MB cap, message, details still shown | FR-3, Glossary "Size limit" |
| Tables, task lists, strikethrough | FR-10 |
| Raw HTML shown as text | FR-11 |
| Local images shown, missing → placeholder | FR-12 |
| Web images → placeholder, no fetch | FR-13, NFR-1 |
| Web links open in new tab, folder stays open | FR-14 |
| Links to other folder files do nothing | FR-15, §7.2 |
| No network / no code / nothing stored / read-only / dependency approval | NFR-1 to NFR-5 |
| Out of scope: highlighting, footnotes, alerts, other extensions, non-text previews, editing | §6, §7.2 |
| Success criteria 1–4, 6–8 | SM-1, SM-2, SM-3, FR-7, FR-12, FR-14 |
| Framework-free core | PRD addendum (intentional) |
| Update CLAUDE.md `.ts` pitfall | PRD addendum (intentional) |
| Primary user | §2, UJ-1 |
