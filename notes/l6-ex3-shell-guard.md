# Level 6, exercise 3: a guard on the shell

First built from the summary slide, before the Level 6 cards were read, then finished for this exercise. The audit log it started is finished in exercise 7, `l6-ex7-audit-trail.md`.

## The hooks

All three scripts live in `.claude/hooks/` and are registered in `.claude/settings.json` with `$CLAUDE_PROJECT_DIR`, so they apply to everyone who works in the repo.

| Event | Script | What it does |
| --- | --- | --- |
| `PreToolUse` on `Bash` | `guard-bash.mjs` | Blocks a forced push, a dangerous recursive delete and a publish with exit 2 and a reason on stderr, and records the block |
| `PostToolUse` | `audit-log.mjs` | Records a call that ran and worked |
| `PostToolUseFailure` | `audit-log.mjs` | Records a call that ran and failed |

`audit-file.mjs` holds the log's location, the line format and the summary, so both scripts write the same way. The log is `logs/agent-audit.jsonl`, ignored by git. It records the time, session, tool, a summary of at most 200 characters and the result, never file contents.

## What the guard blocks

- **A forced push:** `--force`, `-f`, combined flags like `-uf`, and a `+` refspec. `--force-with-lease` is allowed, because it refuses to overwrite work someone else pushed. The owner first chose this one alone; the card asks for all three.
- **A recursive delete that could reach too far:** `rm` with `-r`, `-R`, `--recursive` or a combination like `-rf`, on `/`, a path starting with `~` or holding `$HOME`, `.`, `*`, a path that normalizes to `..` or above, or an absolute path outside `$CLAUDE_PROJECT_DIR`. The owner chose this over blocking every recursive delete, because deleting `dist` or `node_modules` is common and safe.
- **A publish:** `publish` anywhere after `npm`, `pnpm` or `yarn`, so an option with a value like `--registry <url>` can't hide it. A sample caught that case on the first run.

The script is executable, with `#!/usr/bin/env node`, and matches the usual form of a command: it stops mistakes, it is not a security boundary. Quotes are dropped before checking, so `bash -c "git push --force"` is caught. The cost: a quoted mention of a blocked command, such as a commit message, is blocked too. A test loop of this session's own was blocked that way, because its text named a dangerous delete.

## What a real session showed

- `PostToolUse` runs only after a call that succeeded. A failed or blocked call left no line, so `PostToolUseFailure` was added and the guard records its own blocks.
- A line is written after its call ends, so a command can't see its own line.

## Checked

- `npm run check` runs the hook tests too: `vite.config.ts` includes `.claude/hooks/**/*.test.ts`, so CI runs them before every deploy. 38 samples in `samples/guard-bash.json`, each block checked for its own reason. Each test writes to its own temporary folder.
- By hand, as the card asks, with `CLAUDE_PROJECT_DIR` set: a dangerous sample printed its reason and exited 2; a safe one stayed silent and exited 0.
- In a live session on 2026-11-10: a forced push, a dangerous recursive delete and `npm publish --dry-run` were each refused with their reason, and `npm run check` still ran. A failing `ls` was logged as `ok: false`, and `git log` as `ok: true`.
