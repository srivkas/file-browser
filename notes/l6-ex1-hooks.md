# Level 6, homework 1: a guard hook and an audit hook

## The hooks

All three scripts live in `.claude/hooks/` and are registered in `.claude/settings.json` with `$CLAUDE_PROJECT_DIR`, so they apply to everyone who works in the repo.

| Event | Script | What it does |
| --- | --- | --- |
| `PreToolUse` on `Bash` | `guard-bash.mjs` | Blocks a forced `git push` with exit 2 and a reason on stderr, and records the block |
| `PostToolUse` | `audit-log.mjs` | Records a call that ran and worked |
| `PostToolUseFailure` | `audit-log.mjs` | Records a call that ran and failed |

`audit-file.mjs` holds the log's location, the line format and the summary, so both scripts write the same way. The log is `logs/agent-audit.jsonl`, ignored by git. It records the time, session, tool, a summary of at most 200 characters and the result, never file contents.

## What the guard blocks

The owner chose to block only a forced push: `--force`, `-f`, combined flags like `-uf`, and a `+` refspec. `--force-with-lease` is allowed, because it refuses to overwrite work someone else pushed.

Quotes are dropped before checking, so `bash -c "git push --force"` is caught. The cost: a commit message containing the literal text `git push --force` is blocked too.

## What a real session showed

- `PostToolUse` runs only after a call that succeeded. A failed or blocked call left no line, so `PostToolUseFailure` was added and the guard records its own blocks.
- A line is written after its call ends, so a command can't see its own line.

## Checked

- `npm run check` runs the hook tests too: `vite.config.ts` now includes `.claude/hooks/**/*.test.ts`, so CI runs them before every deploy. 19 tests, 13 of them from `fixtures/guard-bash.json`. Each test writes to its own temporary folder.
- In a live session on 2026-11-10: `git push --dry-run --force` was blocked and logged as `blocked`, a failing `ls` was logged as `ok: false`, and `git log` as `ok: true`.
