# Validation Report — Text & Markdown preview

- **PRD:** `_bmad-output/planning-artifacts/prds/prd-file-browser-2026-10-22/prd.md`
- **Rubric:** `.claude/skills/bmad-prd/assets/prd-validation-checklist.md`
- **Run at:** 2026-10-22T09:54:24Z
- **Grade:** Excellent

## Overall verdict
A tight, decision-ready PRD for a medium-rigor course epic. Every FR has a concrete consequence a test can run, the four EARS requirements are present and marked (FR-9, FR-1, FR-2, FR-3), the safety rules have runnable tests, and the owner's trade-offs (raw HTML shown as text, `.ts` always text, only web links open) are stated with their cost.

What remains is at the edges: there is no speed bound for files near the 1 MB limit, the "text file" definition is open-ended ("a common text format") and contradicted by §7.2's dotfile line, and two link behaviours that matter for safety and GitHub-likeness (bare/angle-bracket links, and what the opened tab can do back to the app) are unspecified. None blocks story writing. All are one-line fixes. Only the rubric walker ran.

## Dimension verdicts
- Decision-readiness — strong
- Substance over theater — strong
- Strategic coherence — adequate
- Done-ness clarity — adequate
- Scope honesty — adequate
- Downstream usability — adequate
- Shape fit — strong

## Findings by severity

### Critical (0)

### High (0)

### Medium (5)
**[Done-ness clarity]** — No speed bound for files near the size limit (§3 Size limit, FR-1, FR-2)
"Loading…" may show forever without breaking any FR, and a 1 MB file of short lines could freeze the tab.
Fix: Add a consequence to FR-1 and FR-9: "A 1 MB text file of 20,000 lines appears within 2 seconds on a typical laptop, and the tree stays usable while it loads". The owner picks the numbers.

**[Done-ness clarity]** — "Common text format" is open-ended; SVG is ambiguous (§3 Text file, FR-6)
An engineer can't tell which reported types count, and an `.svg` is both XML and an image.
Fix: Define it as "any file that shows a line count in the detail pane today, plus `.ts` files", and add an FR-6 consequence: "An `.svg` file keeps today's image preview."

**[Done-ness clarity]** — Bare and angle-bracket web links are unspecified (§4.2 FR-11, FR-14)
GitHub links `https://example.com` written as plain text and `<https://example.com>`. The PRD doesn't say whether these become links or, under FR-11, show as literal tags.
Fix: Add one consequence to FR-14: "`<https://example.com>` is a web link; a bare `https://example.com` is [shown as a link | shown as plain text]."

**[Done-ness clarity]** — The opened tab's reach back to the app is unstated (§4.2 FR-14, §5 NFR-2)
A page opened from a link can, unless prevented, redirect the original tab. That breaks "her folder stays open" (UJ-1) and the safety promise.
Fix: Add an FR-14 consequence: "The opened page cannot change or read the app's tab, and is not told which page linked to it."

**[Scope honesty]** — Dotfile line contradicts the Glossary (§7.2 vs §3 Text file)
"Files whose name starts with a dot are not text files" conflicts with the Glossary rule for names like `.eslintrc.json`, and reads as a product rule when it is a known limitation.
Fix: Reword to "Files such as `.gitignore`, whose name is only a dot and a word, are not detected as text files in this epic (known limitation, reported separately)", and add the same sentence to the Glossary entry.

### Low (9)
**[Decision-readiness]** — Cost of dead-looking links is unstated (§4.2 FR-15)
The PRD doesn't say whether non-web links still look clickable.
Fix: State "shown as plain text, not as links", or name the accepted cost.

**[Strategic coherence]** — SM-1 test file is not pinned (§8 SM-1)
"A real README" leaves the choice to the tester.
Fix: Name one public README or a kept test file as the reference.

**[Strategic coherence]** — SM-2 is a completion gate, not a success metric (§8 SM-2)
It measures that the work is done, not that reading files in the app is useful.
Fix: Label it "Done gate" or move it to §7.

**[Done-ness clarity]** — Line numbering vs. the detail pane's line count (§4.1 FR-1)
It is unstated whether a final newline adds an empty numbered line.
Fix: "The last line number equals the line count shown in the detail pane."

**[Done-ness clarity]** — "Loading…" for files that need no reading (§4.1 FR-2, FR-3, FR-4)
It is unclear whether an over-limit or 0-byte file flashes "Loading…" first.
Fix: State that these show their message directly.

**[Done-ness clarity]** — Case of Markdown extensions (§3 Markdown file)
`README.MD` is not covered.
Fix: Add "upper or lower case".

**[Scope honesty]** — Accessibility is not mentioned (§4, §6)
Read-only checkboxes and dead links are where screen-reader and keyboard users get confused.
Fix: Add one requirement line or an explicit non-goal.

**[Downstream usability]** — "Image preview" and "tree" are undefined, and "preview" is overloaded (§3, FR-6)
The two "preview" senses can be read as one area or two.
Fix: Add Glossary entries for "Tree" and "Image preview".

**[Shape fit]** — A few engineer terms remain (§5 NFR-2, §8 SM-2, §5 NFR-5)
Examples: "tag attributes", "check command", "third-party package".
Fix: Change them to plain-language equivalents ("code hidden inside a formatting tag", "the project's automatic checks", "outside code library").

## Mechanical notes
- ID continuity clean: FR-1–FR-15, NFR-1–NFR-5, SM-1–SM-3, SM-C1–SM-C2, UJ-1. No gaps or duplicates; all cross-references resolve.
- EARS markers 1–4 sit on FR-9, FR-1, FR-2, FR-3 and match `notes/l4-ex1-ears.md`.
- Assumptions Index roundtrip clean: no inline `[ASSUMPTION]` tags remain; §11 "None open" is consistent with the memlog.
- NFR-5 is left out of SM-2's "Validates" list on purpose (process rule). This is consistent, but worth a word in NFR-5.
- The memlog refers to §9/§10 for Open Questions/Assumptions, but the PRD uses §10/§11. Only the memlog is affected.
- The addendum's pointer to the brief addendum resolves.

## Reviewer files
- `review-rubric.md`
