# Level 6, exercise 7: the audit trail

## One line format

The log started in exercise 3 had three shapes: `ok` lines, `blocked` lines, and blocked lines from manual runs with no `session`. No line said which event wrote it. Now every hook builds its line through `auditEntry` in `.claude/hooks/audit-file.mjs`:

```json
{ "time": "…", "session": "…", "event": "PostToolUse", "tool": "Bash", "target": "npm run check", "outcome": "ok", "reason": null }
```

- `outcome` is `ok`, `failed` or `blocked`, and `reason` holds the guard's reason for a block.
- `target` is the command, path or pattern, never file contents. A command longer than 300 characters keeps its first 200 and last 100, because in exercise 8 the check sat at the end of a long command and the old 200-character cut hid it.
- For an event that isn't a tool call, `tool` is null and `target` is what the event names: for `SessionStart`, how the session started.

## Events

| Event | Written by |
| --- | --- |
| `PostToolUse` and `PostToolUseFailure` | `audit-log.mjs` |
| `SessionStart`, the event that isn't a tool call | `audit-log.mjs` |
| `PreToolUse`, for blocked calls only | `guard-bash.mjs` and `guard-files.mjs` |

The old log, in the old shapes, moved to `logs/agent-audit-old.jsonl`, so the new one starts clean.

## Checked

- Tests: the same fields from every hook, a session start, a long command keeping its end, a failed call, and that bad input or a log it can't write still exits 0 while a guard still blocks. `npm run check`: 233 tests pass.
- After a real session on 2026-11-10, including a `claude -p` run for a session start, every line parsed as JSON with the same seven fields. From the log alone: the file written was `.claude/settings.json`, and the commands that ran were the `mv` of the old log and the `claude -p` run.

## Known gap

A file edited through the shell shows up only as the command that edited it, not as a written file.
