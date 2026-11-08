# Level 5, exercise 4: a command with arguments

## The command

`/rule-audit <file> <topic>` in `.claude/commands/rule-audit.md` audits one file against the project rules, focused on one topic, and changes nothing. It is manual-only.

- Two named arguments: `$file` and `$topic`.
- Live context: `git status --short` runs before Claude reads the command. It is read-only and pre-allowed in `allowed-tools`, so it never stops to ask.
- Files with `@`: `.claude/rules/lib-core.md` and `src/components/CLAUDE.md`.

## What the tests showed

Two fresh `claude -p` runs on 2026-11-08, with edit tools disallowed:

- Both values landed in the right places, and the run had no permission denials.
- With read tools disallowed too, the model quoted the live `git status` output.
- The `@` lines stay in the text as references. The model reported that the two files are attached to the conversation separately, so the file contents were not seen directly in the test output.

## Real use

The owner ran it three times on 2026-11-08, all in one day rather than across a week:

| File | Topic | Result |
| --- | --- | --- |
| `src/components/FileTree.tsx` | hard-coded colors or sizes | no violations |
| `src/lib/preview.ts` | imports from React | no violations |
| `src/lib/filter.ts` | display strings | no violations |

## Noticed along the way, not fixed

`src/components/FileTree.tsx` holds UI text in lines 85, 86 and 95 (`Filter`, `Filter files`, `No files match.`). The project convention says display strings live only in `src/lib/format.ts`. Whether fixed labels count is the owner's call.
