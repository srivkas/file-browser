# Level 6, exercise 11: a run with a price cap

## The script

`node scripts/audit.mjs [effort] [model]` audits `src/lib/` against `CLAUDE.md` and `.claude/rules/lib-core.md` with `claude -p` and four rails:

| Rail | Flag |
| --- | --- |
| Read-only tools | `--tools Read,Grep,Glob` and `--strict-mcp-config` |
| Turn limit | `--max-turns 15` |
| Dollar cap | `--max-budget-usd 1` |
| Machine-readable output | `--output-format json` |

It prints the tools, effort, cost, rounds and how the run ended, then the result. It exits 1 if the run's tool list, read from its `init` message, holds anything but `Read`, `Grep` and `Glob`: that list is the proof the agent could not have edited a file.

## What the rails taught

- `--tools` alone is not a read-only surface. A trial with `--tools ""` still listed the claude.ai connectors (Canva and others), which act on real accounts. `--strict-mcp-config` with no `--mcp-config` drops every MCP server; then the list is exactly `Glob, Grep, Read`.
- `--max-turns` isn't in `claude --help`, but it works: at 2, a three-step run stopped with `error_max_turns`.
- `num_turns` is not what `--max-turns` counts. The `high` run reported 20 under a limit of 15 and still succeeded. A test with three parallel reads under a limit of 2 reported `num_turns` 4 and succeeded: the three reads arrived as three messages sharing one id, so it was 2 rounds. The limit counts rounds; `num_turns` counts messages. The script now prints rounds (distinct message ids) next to `num_turns`.
- There is no budget key in `settings.json`; the cap is a headless flag only.

## Two effort levels, one task

| | `low` | `high` |
| --- | --- | --- |
| Cost | $0.10 | $0.25 |
| Time | 17 s | 39 s |
| `num_turns` | 6 | 20 |
| Findings | 6 | 7 |
| How | Pattern searches; said itself it didn't read every file | Read the files; more precise reasons |

Both found the DOM use in `image.ts` and `directory.ts` and the display formatting in `image.ts`. Only `high` found `format.ts:38`, where `extension()` computes, though `lib-core.md` says `format.ts` only formats.

**Kept: `high`**, now the script's default. For 15 cents more it found a real violation `low` missed, and an audit that misses things is worth little. `low` suits a quick, frequent check.

The violations themselves were reported, not fixed.

## Cost on the status line

`.claude/statusline.mjs`, wired as `statusLine` in `.claude/settings.json`, shows the model, the session's live cost and its length, read from the JSON Claude Code pipes in: for example `Opus 5.5 · $3.14 · 45 min`.
