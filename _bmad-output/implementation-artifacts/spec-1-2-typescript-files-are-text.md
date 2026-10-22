---
title: 'Story 1.2: TypeScript files are text'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Chrome reports `.ts` files as `video/mp2t`, so TypeScript files get no Lines row and no preview — the most common file in the course's projects.

**Approach:** Inside `isTextFile` (the single text classifier), treat any file whose extension is `ts` as text before looking at the MIME type, so the line count and the preview change together. Test the override, and update the `.ts` entry under "Known pitfalls" in `CLAUDE.md`, which no longer describes an open decision. A real transport-stream video renamed `.ts` shows as garbled text (accepted risk).

</frozen-after-approval>

## Implementation Notes

- `src/lib/text.ts`: `isTextFile` returns true for extension `ts` before the MIME check; doc comments updated. Only `.ts` is overridden — `.mts`/`.cts` with a video type stay non-text.
- Tests: `.ts` with `video/mp2t` (and upper case) is text, can count lines, and plans `'plain'`; `.mts` with `video/mp2t` stays non-text.
- `CLAUDE.md` "Known pitfalls" `.ts` entry rewritten from an open decision to the decision taken.
- Verified in the dev server: `index.ts` (`video/mp2t`) shows Lines 2 and numbered text; a transport-stream byte sample named `clip.ts` shows garbled characters, no error.

## Review Triage Log

- blind: no `previewPlan`/`canCountLines` test for `.ts` — low, patched (assertions added).
- blind: no test for a real video named `.ts` — low, covered by the same `previewPlan` assertion (content is not inspected by the plan); verified by hand.
- blind: `isTextFile`/`TEXT_EXTENSIONS` comments outdated — low, patched.
- blind: `.mts` → false undocumented — low, patched (test comment, pitfall says "only `.ts`").
- blind: Type row still says `video/mp2t` — low, real; not in the story's intent. Deferred, reported to owner.
- blind: no prompt file — medium, patched at commit (`prompts/l4-ex6-text-preview-1-2.md`).
- blind: spec is a stub — false; the one-shot route keeps only Intent and Implementation Notes by design.
- blind: pitfall drops the searched symptom and has no source — low, patched (mentions the Lines row and the epics file).
