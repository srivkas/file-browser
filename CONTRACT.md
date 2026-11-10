# Responsibility contract

What Claude may do on its own in this repo, what needs the owner's approval, and what is forbidden. Each row names its enforcer: what stops it if Claude forgets the rule.

- **Hook**, **ESLint**, **test**, **CI** or **permission**: enforced. It stops the action even if Claude forgets.
- **Advisory**: written in `CLAUDE.md` or `.claude/rules/` only. It works only if Claude remembers.

## Allowed on its own

| Action | Enforcer |
| --- | --- |
| Read any file in the repo | Default permissions |
| Edit files in `src/`, `notes/` and `prompts/` | Permission mode (Auto: the classifier checks each action) |
| Run `npm run check`, `test`, `lint` and `typecheck` | Permission: `allow` in `.claude/settings.json` |
| Push a feature branch, normally | Owner's choice, recorded in Claude's memory |

## Needs the owner's approval

| Action | Enforcer |
| --- | --- |
| `git commit` and `git push` | Permission: `ask` in the owner's `~/.claude/settings.json`. Personal: a teammate doesn't get it |
| Push to `main`, which deploys the site | Hook: `confirm-push-main.mjs` asks, when the `file-browser-tools` plugin is enabled. The `release-check` skill asks before merging |
| Add an npm dependency | Advisory. `release-check` lists new dependencies, but only at merge time |
| Show a message when an empty folder is picked | Advisory: an open decision in `CLAUDE.md` |

## Forbidden

| Action | Enforcer |
| --- | --- |
| A forced `git push` | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| A recursive delete of `/`, the home folder, the project root or anything outside the project | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| Publishing a package with `npm`, `pnpm` or `yarn` | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| Editing `.env*`, `.claude/settings.json` or anything in `dist/` with the edit tools | Hook: `.claude/hooks/guard-files.mjs` denies it in JSON |
| Network calls in the app (`fetch`, `XMLHttpRequest`, `WebSocket`) | ESLint: `no-restricted-globals` |
| `localStorage`, `sessionStorage`, `indexedDB` in the app | ESLint: `no-restricted-globals` |
| Turning a file's content into HTML | ESLint: the safety rules, kept honest by `src/safety-lint.test.ts` |
| React in `src/lib/` | ESLint: `no-restricted-imports` |
| Merging code that fails the check | CI: `.github/workflows/deploy.yml` runs `npm run check` before deploying |
| Writing to the user's files | Advisory. The picker asks for read access (`src/lib/directory.ts`), but nothing bans write APIs |
| Hard-coded colors, sizes or spacing in CSS | Hook: `.claude/hooks/check-css-tokens.mjs` reports them right after an edit-tool edit, so Claude fixes them in the same turn. Feedback, not a block. Edits through the shell aren't checked |
| Display strings outside `src/lib/format.ts` | Advisory |
| Editing installer-managed files in `_bmad/` | Advisory |

## When Claude gets stuck

After three red checks in a row on the same problem, Claude stops and reports what it tried, instead of trying again. Advisory.

## Audit

Every tool call is logged to `logs/agent-audit.jsonl` (`.claude/hooks/audit-log.mjs`), including calls that failed and forced pushes the guard blocked.

## Known gaps

- `main` has no branch protection on GitHub, so a push from outside Claude Code skips every check above except CI.
- The `ask` rule for commits and pushes lives only in the owner's personal settings.
- Nothing enforces the dependency rule or the read-only rule before code is written. The CSS token rule is checked only after edit-tool edits, and `npm run check` doesn't read CSS.
- `guard-files.mjs` sees only the edit tools, so a shell command can still write to `.env` or `.claude/settings.json`.
- Claude can edit files through shell commands (`cat >`, `sed -i`, a `python3` script) instead of the edit tools. In Auto mode the classifier then judges a shell command, not a file edit, and the audit log shows the command, not which file changed. Seen in the Level 6 exercise 8 run.
