# Level 7, exercise 5: a real feature under a goal

## The feature and its test

A "Words" row in the detail pane, below "Lines", for text files. The behaviour that counts: a word is any run of non-whitespace, in any script, and the count is grouped like the line count ("1,204").

`src/lib/words.test.ts` was written first: 6 tests for `countWords` (from a `words.ts` that didn't exist) and `formatWordCount`. It was committed red as `d0f9d4e` ("Cannot find module './words'"). The row itself is checked in the browser: component tests here render without running effects, and the count is read in one.

## The condition

Written by the owner:

```
/goal Implement a "Words" row in the detail pane, next to "Lines", for text files. Done when npm run check exits 0 — print its exit code and the Tests summary line. src/lib/words.test.ts must not change: print `git diff --stat d0f9d4e -- src/lib/words.test.ts`, which must be empty. Don't commit. If the check is still red after 10 turns, the goal has failed — say why.
```

- The diff is against the red commit, not `HEAD`, so a commit by the worker couldn't hide a change to the test.
- The turn limit is worded as a failure, not as "or stop after N", which exercise 4 showed is reported as achieved. There's no turn-limit flag for an interactive goal. Only `claude -p` has `--max-turns` and `--max-budget-usd`.

Run in a fresh interactive session in Auto mode, with the owner away.

## The result

`Goal achieved`: 1 turn, 61 s, 4.2k tokens. The reason quoted `exit code: 0`, `Tests 258 passed (258)`, an empty diff stat, and `git status` with no commit.

Checked afterwards: `npm run check` exits 0 with 258 tests, and `git diff --stat d0f9d4e -- src/lib/words.test.ts` is empty. The changes are `src/lib/words.ts` (new, `text.match(/\S+/g)?.length ?? 0`), `formatWordCount` in `format.ts`, and `DetailPane.tsx`, where `LineCount` became `TextCounts` and reads the text once for both counts. In the browser the owner saw the row on text files and its count was right.

## What ran while I was away

The Level 6 audit log (`logs/agent-audit.jsonl`) has 13 lines for the session: reads, one Write, five Edits, the check. One line is `blocked`: the worker first tried to create `words.ts` through the shell (`cat > src/lib/words.ts <<'EOF'`), and `guard-bash.mjs` refused it with "Edit files in src/ with the Edit or Write tools, not through the shell". It then used Write. Nothing ran that the guards should have refused.

## Found on the way, not fixed

`npm run dev` logged React's "Encountered two children with the same key" for the selected file's path. In `DetailPane.tsx`, `ModifiedDate` and the count row (`LineCount` before, `TextCounts` now) are siblings in the same `<dl>`, and both get `key={node.path}`. It was there before the goal. Reported to the owner, not fixed.
