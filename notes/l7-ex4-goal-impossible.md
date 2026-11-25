# Level 7, exercise 4: make it say "impossible"

Conditions written by the owner, each run in an interactive session in Auto mode.

## A: a condition that cannot be met

Three tries before the evaluator said it.

| Condition | End | Why |
| --- | --- | --- |
| `npm run check exits 0, and at least one test fails. No file may change. Allow only 3 turns` | **Paused** after the evaluator blocked the stop 9 times in a row | The worker said in turn 2 that it can't hold: `check` chains `vitest` with `&&`. The evaluator answered every time that this was "reasoned from the && chain … never demonstrated by a run, so it is not marked impossible". The worker stopped after 3 turns; the evaluator kept sending it back. Claude Code ended it: "A hook blocked the turn from ending 9 consecutive times — overriding and ending turn", then "Goal paused · send a message to continue". The goal stayed set until `/goal clear`. |
| `src/lib contains fewer than 3 files. No file may be deleted or changed. Print ls src/lib \| wc -l as proof. Or stop after 3 turns.` | **✔ Goal achieved** (42 s, 4 turns, 2.8k tokens) | "The first clause (fewer than 3 files) is false, since the output was 28, but the 'stop after 3 turns' alternative is met." The "or" turned a failure into a tick. |
| `Print ls src/lib \| wc -l. The number it prints must be greater than 20 and less than 3.` | **✘ Goal couldn't be achieved** (30 s, 4 turns, 1.6k tokens) | "28 is not less than 3, and no number can satisfy both bounds." The first two checks already said no number could, and still answered "not yet". |

## B: a condition that cannot be judged

`The code in src/lib is beautiful and readable. No file may change. Allow only 3 turns.`

- The worker read the code, called it "mostly clean and readable", listed four spots that could read better (`markdown.ts:101`, `format.ts:23`, `filter.ts:19`, `image.ts:46`), and said itself that "beautiful and readable" is a personal judgment with no pass/fail check.
- Every check: "No file may change" holds (`git status` clean, `git diff --quiet`), "beautiful and readable" is not established, because the worker said "mostly".
- What stopped it: the evaluator, with a failed verdict on the ninth check (`failed: true`, 9 iterations, 129 s, 7.2k evaluator tokens). The 3 turns did not; the evaluator noted they were exceeded.
- Cost: $0.71 for the session, by far the most of the level so far. Judging taste meant reading the code in depth.

It failed because the worker was honest. A worker that had written "the code is beautiful and readable" would have left the evaluator nothing to weigh against it. A condition that can't be judged is decided by what the worker chooses to say.

**Not done: the rewrite of B.** The owner skipped it. The measurement was prepared: no non-test line in `src/lib` is longer than 150 characters today (the longest is 141; 2 lines exceed 120, 21 exceed 100), and `cat $(ls src/lib/*.ts | grep -v '\.test\.ts$') | awk 'length > 150' | wc -l` prints the proof.

## What it taught

- **"Impossible" needs printed proof too.** The evaluator won't take the worker's argument that a condition is impossible, any more than its word that one passed. It said "couldn't be achieved" only when a single printed number refuted the condition whatever the worker did.
- **A turn limit is text, and its wording decides the outcome.** "Allow only 3 turns" restricts, so the evaluator kept waiting for the rest and ignored it. "Or stop after 3 turns" ends the goal, and reports it as achieved. Read the reason, not the tick.
- **When nothing ends it, Claude Code does.** After 9 blocked stops in a row the goal pauses. It stays set: clear it with `/goal clear`.
- **A vague condition costs more.** B cost about twenty times what A did.
- On the dollar figure: on a Pro subscription the `$` on the status line is the API-price estimate, not a charge. It shows how much of the usage limit a run took.
