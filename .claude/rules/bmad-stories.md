# Building BMAD stories

Rules for any session that drives stories from `_bmad-output/implementation-artifacts/sprint-status.yaml`.

## Every story is coded by a fresh subagent, from its approved spec

The session that plans and orchestrates never writes a story's code itself. It hands the approved spec to a fresh subagent (or a separate `claude -p` run) and reviews what comes back.

Bad — the orchestrating session edits `src/` for the story it just planned:

```
Spec 1-1 approved. Implementing it now: editing src/lib/preview.ts …
```

Good — the orchestrator delegates and only reviews:

```
Spec 1-1 approved. Starting a fresh subagent with spec-1-1-….md as its only brief; I'll review its diff and the check.
```

Reason: codified 2026-10-25 from the epic 1 retrospective, action item 5 (`epic-1-retro-2026-10-22.md`). Stories 1.1 and 1.2 (`b2c86fd`, `8c2e076`) and a first pass of 1.3 were coded in the orchestrating session, so the code carried that session's whole context instead of only the spec, and the spec was never tested as a brief.
