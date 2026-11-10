# Level 6, exercises 8 and 9: a feature in Auto mode, and the contract

Built before the Level 6 cards were read. Exercise 8 still needs the allow, ask and deny rules, and exercise 9 needs each "never" row tried in a session.

## The contract

`CONTRACT.md` lists what Claude may do on its own, what needs the owner's approval and what is forbidden, each row with its enforcer. It is written first, because it sets what Claude may do once nobody approves each step. `CLAUDE.md` points to it outside the BMAD-managed block, with a condition, so it isn't loaded into every session.

Writing it surfaced gaps: `main` has no branch protection on GitHub, the `ask` rule for commits lives only in the owner's personal settings, and the dependency, CSS token and read-only rules are advisory only.

## The run

On 2026-11-10 the owner ran `prompts/l6-ex8-expand-collapse-all.md` in a fresh session with `claude --permission-mode auto --effort medium`. It added Expand all and Collapse all above the tree, with the folder list in `src/lib/tree-expand.ts`, tests, labels in `format.ts` and styles from the tokens.

- 8 tool calls in about a minute and a half, all `Bash`, and no stop to ask the owner.
- The check ran once, at the end, and passed: 16 test files, 176 tests.
- It said it didn't test the buttons in the browser. The owner did, and they work.
- It listed three bugs it saw and didn't fix: UI text in `FileTree.tsx` outside `format.ts`, no focus ring of its own on the folder picker button, and focus moving to the root only on screen after filtering or collapsing. The owner chose not to fix them now.

## What the run taught

- Claude edited files through shell commands (`cat >`, `sed -i`, a `python3` script), not the edit tools. This is now a known gap in the contract.
- The audit log cuts each summary at 200 characters. The check was chained at the end of a long command, so the log hid it, and a first review wrongly concluded that the check never ran. The session's own transcript showed it.
