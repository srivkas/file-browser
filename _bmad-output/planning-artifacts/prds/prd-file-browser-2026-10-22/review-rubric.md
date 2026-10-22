# PRD Quality Review — Text & Markdown preview

## Overall verdict
A tight, decision-ready PRD for a medium-rigor course epic. Every FR has a concrete consequence a test can run, the four EARS requirements are present and marked (FR-9, FR-1, FR-2, FR-3), the safety rules have runnable tests, and the owner's trade-offs (raw HTML shown as text, `.ts` always text, only web links open) are stated with their cost. What remains is at the edges: there is no speed bound for files near the 1 MB limit, the "text file" definition is open-ended ("a common text format") and contradicted by §7.2's dotfile line, and two link behaviours that matter for safety and GitHub-likeness (bare/angle-bracket links, and what the opened tab can do back to the app) are unspecified. None blocks story writing. All are one-line fixes.

## Decision-readiness — strong
Decisions are stated as decisions, not as "considerations": Markdown is `.md`/`.markdown` only (§3), `.ts` is always text (FR-7) with the garbled-video cost accepted in §9, raw HTML is shown as text with its cost named ("READMEs that use HTML to centre a logo… look plainer than on GitHub", FR-11), checkboxes can't be clicked (FR-10), non-web links do nothing (FR-15). §7.2 lists what was deferred and §10 honestly says nothing is blocking. The memlog confirms the owner made each of these calls.

The one choice whose user-facing cost isn't named is FR-15. A relative link like `[setup](docs/setup.md)` still looks like a link, and clicking it gives no feedback. That's a deliberate deferral (§7.2), but the reader isn't told the user will see a link that doesn't work.

### Findings
- **low** Cost of dead-looking links is unstated (§4.2 FR-15). The PRD says clicking "changes nothing" but not whether the link still looks clickable, which is what the UX pass will need to decide. *Fix:* Add one line to FR-15: either "such links are shown as plain text, not as links" or "Accepted cost: these links look clickable but do nothing until the deferred link story."

## Substance over theater — strong
One protagonist, Noa, and she drives real decisions: README first, `package.json` as numbered text, the 5 MB edge case. The Vision is specific to this app ("It has never shown what a file says"). Each NFR is product-specific and NFR-1 to NFR-4 come with a test someone can run in a browser. The counter-metrics (SM-C1, SM-C2) do real work by stopping the "reads like GitHub" goal from pulling in pixel-matching or extra syntax. Nothing reads as furniture.

## Strategic coherence — adequate
The thesis is clear: read what a file says without leaving the app, GitHub-style for Markdown, without breaking the app's three promises (§1). Features follow it: plain text and rendered views first, safety rules cross-cutting, editor/code-viewer/browser features explicitly out (§6).

The metrics are weaker than the features. SM-2 ("Every requirement passes its test") is a completion gate, not a measure of whether the thesis held. SM-1 is the real thesis metric, but "A real README" is not pinned, so two testers could pick different files and get different results. For a course exercise this is acceptable, hence adequate rather than thin.

### Findings
- **low** SM-1 test file is not pinned (§8 SM-1). "A real README with headings, lists, a table, a code block and a task list" leaves the choice to the tester. *Fix:* Name one public README (or a test file kept with the exercise notes) as the SM-1 reference.
- **low** SM-2 is a completion gate, not a success metric (§8 SM-2). It measures that the work is done, not that reading files in the app is useful. *Fix:* Keep it, but label it "Done gate" rather than a primary success metric, or move it to §7.

## Done-ness clarity — adequate
This is the PRD's strongest dimension in absolute terms. Every FR has testable consequences with exact inputs and outputs: byte-exact boundaries in FR-3 (1,048,576 shown, 1,048,577 refused), path resolution examples in FR-12, concrete links in FR-14/FR-15, and a named hostile file in SM-3. The EARS requirements match `notes/l4-ex1-ears.md` in meaning and in their tests.

The gaps are at the boundaries an engineer will hit first. There is no speed or responsiveness bound anywhere, even though a 1 MB file can hold tens of thousands of lines, each needing a line number (FR-1). The Glossary's "Text file" relies on "a common text format (such as JSON or XML)", which is open-ended. Is an SVG (an XML format, but an image) a text file or an image? Today the app treats it as an image, but the PRD doesn't say so. Two link forms are unspecified: bare `https://…` addresses (GitHub turns them into links) and `<https://example.com>` (which looks like an HTML tag that FR-11 would show as text). FR-14 says a web link opens in a new tab, but not that the opened page is cut off from the app's tab. That is the one safety property NFR-2 doesn't cover.

### Findings
- **medium** No speed bound for files near the size limit (§3 Size limit, FR-1, FR-2). "Loading…" may show forever without breaking any FR, and a 1 MB file of short lines could freeze the tab. *Fix:* Add a consequence to FR-1 and FR-9: "A 1 MB text file of 20,000 lines appears within 2 seconds on a typical laptop, and the tree stays usable while it loads". The owner picks the numbers.
- **medium** "Common text format" is open-ended; SVG is ambiguous (§3 Text file, FR-6). An engineer can't tell which reported types count, and an `.svg` is both XML and an image. *Fix:* Define it as "any file that shows a line count in the detail pane today, plus `.ts` files", and add an FR-6 consequence: "An `.svg` file keeps today's image preview."
- **medium** Bare and angle-bracket web links are unspecified (§4.2 FR-11, FR-14). GitHub links `https://example.com` written as plain text and `<https://example.com>`. The PRD doesn't say whether these become links or, under FR-11, show as literal tags. *Fix:* Add one consequence to FR-14: "`<https://example.com>` is a web link; a bare `https://example.com` is [shown as a link | shown as plain text]."
- **medium** The opened tab's reach back to the app is unstated (§4.2 FR-14, §5 NFR-2). A page opened from a link can, unless prevented, redirect the original tab. That breaks "her folder stays open" (UJ-1) and the safety promise. *Fix:* Add an FR-14 consequence: "The opened page cannot change or read the app's tab, and is not told which page linked to it."
- **low** Line numbering vs. the detail pane's line count (§4.1 FR-1). It is unstated whether a final newline produces an extra empty numbered line. Today's line count says it does not. *Fix:* Add a consequence: "The last line number equals the line count shown in the detail pane."
- **low** "Loading…" for files that need no reading (§4.1 FR-2, FR-3, FR-4). It is unclear whether an over-limit or 0-byte file flashes "Loading…" first. *Fix:* State that files over the size limit and empty files show their message directly.
- **low** Case of Markdown extensions (§3 Markdown file). `README.MD` is not covered. *Fix:* Add "upper or lower case" to the definition.

## Scope honesty — adequate
Non-Goals (§6) do real work: editor, code viewer, GitHub clone and web browser are each ruled out with concrete examples (footnotes, alerts, maths). §7.2 names deferred items and says where they'd go. Open-items density is near zero, which fits a PRD marked final, and the memlog shows each former assumption was confirmed.

Two things fall short. First, §7.2's last bullet says "files whose name starts with a dot are not text files in this epic". That contradicts the Glossary rule (the browser's reported type, then the extension) for names such as `.eslintrc.json` or `.env.example.txt`, which have a real extension. It also reads as a product rule when it is really a known limitation (the memlog records it as a bug reported outside the task). Second, accessibility is not mentioned at all, not even as a non-goal, even though the PRD adds read-only checkboxes and links.

### Findings
- **medium** Dotfile line contradicts the Glossary (§7.2 vs §3 Text file). An engineer can't tell whether to add a new exclusion or leave today's behaviour. *Fix:* Reword to "Files such as `.gitignore`, whose name is only a dot and a word, are not detected as text files in this epic (known limitation, reported separately)", and add the same sentence to the Glossary entry.
- **low** Accessibility is not mentioned (§4, §6). Read-only checkboxes and dead links (FR-10, FR-15) are exactly where a screen-reader or keyboard user gets confused. *Fix:* Add one line: either a requirement ("checkboxes are announced as read-only; web links are reachable by keyboard") or an explicit non-goal.

## Downstream usability — adequate
The Glossary is present and used consistently: "size limit", "local image", "placeholder", "web link" are each defined once and reused verbatim in FRs. IDs are contiguous and every cross-reference resolves. The addendum keeps engineer detail out of the PRD and points to the brief's research.

One term collides. "Preview" is defined as the new text area, yet FR-6 and the Glossary also say "today's image preview". "Tree" is used throughout but not defined. A UX or story writer pulling FR-6 alone could read "no text preview" and "image preview" as two areas or one.

### Findings
- **low** "Image preview" and "tree" are undefined, and "preview" is overloaded (§3, FR-6). *Fix:* Add Glossary entries for "Tree" and "Image preview" ("today's image, dimensions and EXIF area; unchanged by this epic").

## Shape fit — strong
A single-user, browser-only viewer with meaningful UI. One user journey with a named protagonist serves the UX pass without over-formalizing. Capability-spec FRs carry the weight, which suits a course epic at medium rigor. The course readability rule mostly holds: no source file names, libraries or component names appear, and the example user files (`README.md`, `package.json`, `docs/guide.md`) are the allowed kind. A few phrases still lean on engineer vocabulary.

### Findings
- **low** A few engineer terms remain (§5 NFR-2, §8 SM-2, §5 NFR-5). Examples: "code hidden in tag attributes", "the project's check command passes", "third-party package". *Fix:* Change them to "code hidden inside a formatting tag", "the project's automatic checks pass" and "outside code library".

## Mechanical notes
- ID continuity clean: FR-1–FR-15, NFR-1–NFR-5, SM-1–SM-3, SM-C1–SM-C2, UJ-1. No gaps or duplicates; §4.2, §5, §7.2 and FR-12–FR-15 cross-references resolve.
- EARS markers 1–4 sit on FR-9, FR-1, FR-2, FR-3 and match `notes/l4-ex1-ears.md` (1 MB = 1,048,576 bytes; "preview pane" in the note became "preview", consistent with the Glossary).
- Assumptions Index roundtrip clean: no inline `[ASSUMPTION]` tags remain; §11 says "None open", consistent with the memlog.
- NFR-5 is left out of SM-2's "Validates" list on purpose (it's a process rule, not testable in the app). This is consistent, but worth a word in NFR-5 so it doesn't look like an omission.
- The memlog refers to "§9 Open Questions, §10 Assumptions Index", but the PRD numbers them §10 and §11 since Known Risks was restored. Only the memlog is affected.
- The addendum's pointer `briefs/brief-file-browser-2026-10-22/addendum.md` resolves.
