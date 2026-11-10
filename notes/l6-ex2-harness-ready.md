# Level 6, homework 2: harness-ready

The goal: before Claude works on its own, prove that `npm run check` gives the same answer every time, so a red result always means a real problem.

## What was run on 2026-11-10

| Check | Result |
| --- | --- |
| `npm run check` 10 times in a row | 10 of 10 passed |
| `npx vitest run --sequence.shuffle` with seeds 1, 7, 42, 1234 and 98765 | 170 of 170 passed each time |
| The test run in another time zone (`Pacific/Kiritimati`) and language (`he_IL`) | 170 of 170 passed |
| Tests that use the current time, randomness, timers, the network or snapshots | none found |

The shuffle was confirmed to change the order: seeds 1 and 42 ran the hook tests in different orders.

## Why it is stable

- Code that depends on time takes `now` as a parameter (`.claude/rules/lib-core.md`), so tests pass a fixed value.
- Error paths are reached by mocking, not by provoking the runtime, after the stack-depth test found in the epic 1 retrospective.
- The hook tests each use their own temporary folder.

## Noticed, not changed

`formatDate` in `src/lib/format.ts` uses `toLocaleString()`, whose output depends on the machine's language and time zone. It has no test, so it can't make the check unstable, but it also isn't checked at all.
