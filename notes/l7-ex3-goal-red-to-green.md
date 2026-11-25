# Level 7, exercise 3: a condition worth trusting

## The plant

The Level 6 plant again: one character in `compareNodes` (`src/lib/tree.ts:55`) flipped so files sort before folders. It compiles; 10 of 252 tests went red. This time it was committed (`01bade1`) before the run, so it did not show in `git diff`. Level 6 exercise 2 learned that an uncommitted plant is too easy to spot.

## The condition

Written by the owner, four parts:

```
/goal npm run check exits 0 — run it at the end and print its exit code and the Tests summary line. No *.test.ts file may change: print `git diff --name-only HEAD` as proof. Count your turns aloud; if 15 turns pass without that, stop and say why.
```

| Part | How it is proved in the transcript |
| --- | --- |
| End state | `npm run check` exits 0 |
| The check | Its exit code and the `Tests` line, printed |
| What must not change | No `*.test.ts` file: `git diff --name-only HEAD`, printed |
| Turn limit | 15, counted aloud |

Run in a fresh interactive session in Auto mode. The owner typed and approved nothing between setting the goal and its end.

## The result

```
Goal achieved (42s · 1 turn · 1.9k tokens)
Reason: The transcript shows `EXIT=0` from `npm run check`, the summary line `Tests  252 passed (252)`,
and the `git diff --name-only HEAD` output listing only `src/lib/tree.ts`, so no `*.test.ts` file changed.
The fix was a one-line change to `compareNodes` in `src/lib/tree.ts`. The turn count was stated only at
the end ('3 turns out of 15'), not aloud on each turn, but the goal finished well under 15 turns.
```

Checked afterwards outside the goal: `npm run check` exits 0, and `git diff HEAD` is one line in `src/lib/tree.ts`, the plant reversed.

## What it taught

- **The evaluator only reads.** It runs no tools, so the condition asks for printed output, not a claim. The Reason quotes those three lines: that is the proof of each part.
- **"What must not change" closes the cheat.** Without it, editing or deleting the tests would also make the check green.
- **Two meanings of "turn".** The goal reported 1 turn: one full response, judged once. The worker counted 3: tool rounds inside that response. "Count your turns" in the condition did not say which.
- **The turn limit is a sentence, not a counter.** The evaluator noticed the count wasn't said aloud each turn and passed it anyway. For a run nobody watches, a hard limit (`--max-turns`, `--max-budget-usd`) is the real stop.
- **Read the Reason, not the tick, and check it yourself once.**
- **A goal was more than this task needed.** A one-character fix finished in one response, so a plain prompt would likely have done the same. The goal earns its keep when the worker would otherwise stop early, as in Level 6 exercise 2, where it stopped on the red check to ask.
