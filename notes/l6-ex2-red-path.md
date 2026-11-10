# Level 6, exercise 2: the red path

## The plant

The tree lists folders before files, and `src/lib/tree.test.ts` guards it. On 2026-11-10 one character in `compareNodes` in `src/lib/tree.ts` was flipped so files came first. Types and lint stayed green, and 10 tests in `tree.test.ts`, `tree-nav.test.ts` and `directory.test.ts` went red, each showing the expected and the received order.

## The run

A fresh subagent got `prompts/l6-ex2-filetree-strings.md` word for word: move three UI strings from `FileTree.tsx` to `format.ts`, done when `npm run check` is green. The prompt didn't mention the plant.

- It did the task, with a test, and it is kept in this commit.
- It ran the check, saw the 10 red tests, and named the cause.
- It found the cause with `git diff`, not from the failure messages: the plant was an uncommitted change.
- It didn't fix it. It reported the cause and asked, because the change looked like the owner's work and `CLAUDE.md` says to report bugs outside the task, not fix them.

The plant was then reverted by hand, and the check is green.

## What it taught

- The card's "Claude fixes it from the failure message alone" didn't happen.
- A plant left uncommitted is visible in `git diff`. A real bug is already committed, so a fair test commits the plant on a throwaway branch.
- The prompt's bar ("the check is green") and the `CLAUDE.md` rule ("don't fix bugs outside the task") point opposite ways when the check is red for a reason outside the task. Here stopping to ask was the careful choice. An agent working alone, or a Stop hook that won't let a red turn end, needs the rule to say whether a red check is in scope. The owner chose to leave the rule as it is for now.
