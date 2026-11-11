# Level 6, exercise 4: a guard on your files

## The hook

`.claude/hooks/guard-files.mjs` runs before `Edit`, `Write` and `NotebookEdit`, the tools that write. Its matcher is the plain list `Edit|Write|NotebookEdit`, so it doesn't run on every tool call. It denies:

| Path | Why |
| --- | --- |
| Any file whose name starts with `.env` | It holds secrets |
| `.claude/settings.json` | The harness protects its own limits |
| Anything in `dist/` | It is build output; change the source instead |

Unlike the shell guard, it answers in JSON on stdout, with `permissionDecision: "deny"` and a reason, and always exits 0. Paths are resolved against `$CLAUDE_PROJECT_DIR` and compared in lower case, because macOS treats `.Claude/Settings.json` as the same file. Denials are recorded in the audit log.

## Don't lock yourself out

The card warns that once `.claude/settings.json` is protected, Claude can't wire the later hooks. The owner first chose to protect it and add later wiring by hand, and pasted the exercise 5 hook that way. In exercise 6 the owner removed the protection, to stop pasting by hand. `.env*` and `dist/` stay protected, and `CONTRACT.md` lists the open settings file as a known gap.

## Checked

- 14 samples in `samples/guard-files.json`, plus tests for a relative path, a notebook path, the audit line and unreadable input. `npm run check`: 220 tests pass.
- By hand: `.env` printed the JSON deny; `src/lib/format.ts` printed nothing.
- In a live session on 2026-11-10: a `Write` to `.env` and an `Edit` to `.claude/settings.json` were both refused with their reason, no `.env` was created, and the settings stayed as they were.

## Known gap

The hook sees only the edit tools. A shell command such as `sed -i` or `cat >` can still write to these files, and the exercise 8 run showed Claude does edit through the shell. Recorded in `CONTRACT.md`.
