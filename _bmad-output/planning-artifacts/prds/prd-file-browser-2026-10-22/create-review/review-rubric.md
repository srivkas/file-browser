# PRD Quality Review — Text & Markdown preview

## Overall verdict
A tight, well-proportioned PRD for its stakes. The scope is clear, the safety rules come with real tests, the non-goals are explicit, and nearly every FR has a concrete check a test can run. The risk sits at the edges of the definitions. The Glossary contradicts itself on extensionless files like `README`, local-image path resolution and the "placeholder" are undefined, and two NFRs have no test even though SM-2 counts on every NFR having one. These are fixable in an hour and should be fixed before stories are cut.

## Decision-readiness — adequate
Decisions are stated as decisions, not "considerations". Examples: Markdown is identified by `.md`/`.markdown` only (§3), `.ts` is always text (FR-7), non-web links "do nothing" (FR-15), checkboxes can't be clicked (FR-10). §7.2 states what was deferred. The memlog shows the two assumptions raised during drafting were confirmed and folded in, so the empty §9 and §10 are honest, not rhetorical.

Two trade-offs are made but their cost isn't named. First, FR-11 shows all raw HTML as text, while SM-1 promises "Reads like GitHub". Many real READMEs open with `<p align="center"><img …></p>`, `<details>` or `<br>`, which GitHub renders and this preview will show as literal tags. Second, the brief names the downside of the `.ts` rule ("a video would show as garbled characters. Accepted"), but the PRD only hints at it in FR-8's consequence. A reviewer pushing back on either point would find it dodged.

### Findings
- **medium** Raw-HTML cost against "reads like GitHub" is unstated (§4.2 FR-11, §8 SM-1). The test README in SM-1 is defined to avoid HTML, so the metric passes while real READMEs with HTML headers look broken. *Fix:* Add one sentence to FR-11 or §6: "READMEs that use HTML for layout (centred logos, `<details>`) will show the tags as text. Accepted for safety." Optionally add that case to SM-C2.
- **low** `.ts` video trade-off lives only in the brief (FR-7, FR-8). *Fix:* Add a one-line "Accepted:" note under FR-7 so the PRD stands alone, as §0 promises it builds on the brief without the reader needing it.

## Substance over theater — strong
There is one protagonist (Noa), and she drives real decisions: README first, `package.json` as plain text, and the 5 MB edge case. The Vision is specific to this app ("It has never shown what a file says"). The NFRs are product-specific and NFR-1 and NFR-2 come with runnable tests. Nothing reads as furniture.

### Findings
- **low** NFR-5 is a process rule, not product behaviour (§5 NFR-5). "Any new third-party package needs the product owner's approval" can't be checked against the running app, and SM-2 already leaves it out. *Fix:* Move it to a "Constraints" line, or keep it and label it a delivery constraint.

## Strategic coherence — strong
The thesis is clear: show what a file says, GitHub-style for Markdown, without breaking the app's privacy, no-code and read-only promises (§1). §4.1 and §4.2 follow from it, and §5 carries the promises. SM-1 tests the GitHub-likeness half and SM-3 the safety half. SM-C1 and SM-C2 are well-chosen counterweights against the obvious way to over-build. SM-2 ("every requirement passes its test") is a done-check rather than a success metric. That's acceptable for a course exercise, but it is not evidence the thesis holds.

## Done-ness clarity — adequate
This is the strongest part of the PRD in form: every FR has a "Consequences (testable)" block with concrete inputs and expected outputs. Boundary tests are exact (1,048,576 vs 1,048,577 bytes, FR-3), and FR-5 is written as a race the tester can reproduce. The gaps are in the definitions the FRs depend on, and in NFRs without tests.

### Findings
- **high** Glossary contradicts itself on extensionless files (§3 "Text file", "Markdown file"). "Text file" requires, when the browser reports no type, an extension on the app's list. A file named `README` has no extension and the browser reports no type, so by that definition it is *not* a text file. Yet the "Markdown file" entry says "A file named `README` with no extension is a text file". An engineer can't tell which is done, and the same applies to `LICENSE`, `Makefile` and similar. *Fix:* Decide whether extensionless files are text files, then say so in the "Text file" entry and add an FR-1 consequence (for example, "`README` with no extension is shown in the plain text view"), or delete the README sentence.
- **high** Local-image path resolution is undefined (§3 "Local image", FR-12). `![logo](images/logo.png)` is only tested from a root-level `README.md`. The PRD doesn't say what happens when the Markdown file is in a subfolder (relative to that file, or to the folder root?), or with `../` paths, a leading `/`, or a path that points outside the opened folder. *Fix:* State "paths are resolved relative to the Markdown file's own location, as GitHub does; a path that leaves the folder shows a placeholder", and add a consequence for a Markdown file in a subfolder.
- **medium** "Placeholder" is never defined (FR-12, FR-13). Is it the image's alt text, an icon, an empty box, or a message? Do missing and web images look the same? A tester can't tell pass from fail. *Fix:* Add a Glossary entry, e.g. "Image placeholder — a box showing the image's alt text (or 'Image not shown' when it has none)", and say whether missing and web images differ.
- **medium** NFR-3 and NFR-4 have no test, yet SM-2 counts them (§5, §8 SM-2). NFR-1 and NFR-2 each have a "Test:" line, while NFR-3 ("Nothing stored") and NFR-4 ("Read-only") have none, so SM-2's "Each FR and NFR consequence above passes" can't be checked for them. *Fix:* Add tests, e.g. NFR-3: "after previewing files, the browser's site storage for the app is empty, and reopening the app shows no previous folder or preview". NFR-4: "a file's modified date is unchanged after previewing it, including after clicking its checkboxes".
- **medium** Image sources that are neither web nor local are unspecified (§3 "Web link / web image", FR-12, FR-13). `data:` images, addresses starting with `//` (which a browser reaches over the network), and other schemes fit neither category. Because NFR-1 forbids any request, `//cdn.example.com/x.png` is the one case most likely to slip through. *Fix:* Add to FR-13: "any image that is not a local image shows the placeholder", with a consequence for a `//…` address.
- **low** FR-3's promise about line count can break for very large files (FR-3 consequence 3, UJ-1 edge case). "The detail pane still shows … line count" holds for the 5 MB example, but today's line count has its own, larger cap, so a big enough file shows no line count. *Fix:* Change to "line count, as today".
- **low** Line numbering vs. trailing newline (FR-1). A 3-line file that ends with a newline must show 3 numbered lines, not 4, to match the detail pane's line count. The current example doesn't pin this down. *Fix:* Add the consequence "a file ending with a newline shows no extra empty numbered line; the last number equals the line count in the detail pane".
- **low** FR-2 is timing-dependent ("Looking at the preview before reading finishes"). For a small file, reading finishes before a person can look. *Fix:* Note that the check is done with a slow or large file (still under the size limit), or in an automated test that holds the read open.

## Scope honesty — strong
§6 Non-Goals does real work: no editor, no highlighting, no GitHub alerts/maths, no remote fetch. §7.2 names the deferrals with a reason. Open-items density is zero, and the memlog confirms that zero was reached by resolving items, not hiding them. That fits a green-light PRD. One silent omission is worth flagging.

### Findings
- **low** Front matter is unaddressed (§4.2, §6). Notes and docs often begin with a `---` YAML block. GitHub shows it as a table, while a plain renderer shows a horizontal rule and stray text. *Fix:* Add a Non-Goal line or an FR-9 consequence stating what happens.

## Downstream usability — strong
The Glossary is present and used consistently: "preview", "detail pane", "selected file", "size limit" and "text file" mean the same thing in every FR. IDs are contiguous and unique, and cross-references resolve (UJ-1 is referenced from both feature descriptions, and every SM names the FRs/NFRs it validates). Each FR reads alone. The addendum keeps implementation pointers out of the PRD, as intended. The two high Done-ness findings are also downstream risks, because the architecture step will have to invent the answers.

The PRD meets the course's non-engineer readability bar almost everywhere, with minor exceptions:

### Findings
- **low** A handful of engineer terms remain (§0, §5 NFR-2, §8 SM-2). §0 cites a repository path (`briefs/brief-file-browser-2026-10-22/brief.md`). NFR-2 says "event-handler attributes" and "`javascript:` addresses". SM-2 says "the project's check command". FR-8 says "encoding". None names a source file, library or component, so the course rule holds. *Fix (optional):* Gloss them in plain words ("hidden code tied to clicks or mouse movement", "the project's automated checks"), and refer to "the product brief of 2026-10-22" instead of the path.

## Shape fit — strong
This is a single-operator, browser-only viewer, and the PRD is shaped as a capability spec with one short journey for the UX pass. That is the right weight. It runs about 3 pages, inside the agreed 2–4. It is brownfield, and existing behaviour is cleanly separated from new behaviour (FR-6 "today's image preview", FR-7 changing the detail-pane line count for `.ts`). FR-7 settles what the project notes record as an open `.ts` decision. The brief records the owner's approval, and the addendum asks for the note to be updated.

## Mechanical notes
- **ID continuity:** FR-1–FR-15, NFR-1–NFR-5, SM-1–SM-3, SM-C1–SM-C2 and UJ-1 have no gaps and no duplicates. All cross-references resolve.
- **Glossary drift:** "Local image" is defined as one referred to "by a path inside the folder", but FR-12's consequence speaks of "an image that is not in the folder". That mixes a *missing* file with a path *outside* the folder. Use "missing local image" for the first and handle the second under the path-resolution fix above.
- **EARS traceability:** All four EARS lines from the earlier exercise appear: Markdown → FR-9, plain text → FR-1, "Loading…" → FR-2, size limit → FR-3. FR-1, FR-2, FR-3 and FR-9 keep the EARS test inputs word for word.
- **Narrowing from EARS notes:** The exercise-1 notes said "Markdown links open in a new tab when clicked". The PRD narrows this to web links only (FR-14/FR-15), which is consistent with the memlog decisions.
- **Assumptions Index roundtrip:** No inline `[ASSUMPTION]` tags and an empty index, so the roundtrip is consistent.
- **UJ protagonist:** UJ-1 names Noa, with context carried inline.
- **Required sections:** All present for medium stakes. There is no separate Constraints section; NFR-5 stands in for one.
