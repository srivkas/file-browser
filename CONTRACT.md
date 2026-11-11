# Responsibility contract

What Claude may do on its own in this repo, what needs the owner's approval, and what is forbidden. Each row names its enforcer: what stops it if Claude forgets the rule.

- **Hook**, **ESLint**, **test**, **CI** or **permission**: enforced. It stops the action even if Claude forgets.
- **Advisory**: written in `CLAUDE.md` or `.claude/rules/` only. It works only if Claude remembers.

Permission rules live in `.claude/settings.json`. `deny` beats `ask`, and `ask` beats `allow`, in every permission mode, Auto included.

## Allowed on its own

| Action | Enforcer |
| --- | --- |
| Read any file in the repo except `.env*` | Default permissions |
| Edit files in `src/` with the edit tools | Permission mode. Through the shell it is blocked: `guard-bash.mjs` sends Claude to the edit tools, so the hooks below see the change |
| Edit files in `notes/` and `prompts/` | Permission mode |
| Run `npm run check`, `test`, `lint` and `typecheck` | Permission: `allow` |
| Run `git status`, `git diff` and `git log` | Permission: `allow` |
| Push a feature branch | Permission: `allow` for `Bash(git push)` and `Bash(git push *)` |

## Needs the owner's approval

| Action | Enforcer |
| --- | --- |
| Push to `main`, which deploys the site | Permission: `ask` for `Bash(git push *main*)`, which beats the `allow` above. Also the `confirm-push-main.mjs` hook of the `file-browser-tools` plugin, and the `release-check` skill, which asks before merging |
| Install packages: `npm install`, `npm i`, `npm ci` | Permission: `ask` |
| `git commit` | Advisory: `CLAUDE.md`. The owner removed the personal `ask` rule on 2026-11-11 |
| Add an npm dependency | Permission: `ask` on the install. Adding one by editing `package.json` is advisory, and `release-check` lists new dependencies at merge time |
| Show a message when an empty folder is picked | Advisory: an open decision in `CLAUDE.md` |

## Forbidden

| Action | Enforcer |
| --- | --- |
| Reading `.env` or `.env.*` | Permission: `deny` on `Read`. Also refused `cat .env` in a test. `.gitignore` keeps them out of git |
| A forced `git push` | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| A recursive delete of `/`, the home folder, the project root or anything outside the project | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| Publishing a package with `npm`, `pnpm` or `yarn` | Hook: `.claude/hooks/guard-bash.mjs` blocks it with exit 2 |
| Writing `.env*` or anything in `dist/` with the edit tools | Hook: `.claude/hooks/guard-files.mjs` denies it in JSON |
| Network calls in the app (`fetch`, `XMLHttpRequest`, `WebSocket`) | ESLint: `no-restricted-globals` |
| `localStorage`, `sessionStorage`, `indexedDB` in the app | ESLint: `no-restricted-globals` |
| Turning a file's content into HTML | ESLint: the safety rules, kept honest by `src/safety-lint.test.ts` |
| React in `src/lib/`, in `.ts` and `.tsx` files | ESLint: `no-restricted-imports`, kept honest by `src/safety-lint.test.ts` |
| Merging code that fails the check | CI: `.github/workflows/deploy.yml` runs `npm run check` before deploying. Not attacked: trying it would deploy |
| Writing to the user's files | Advisory. The picker asks for read access (`src/lib/directory.ts`), but nothing bans write APIs |
| Hard-coded colors, sizes or spacing in CSS | Hook: `.claude/hooks/check-css-tokens.mjs` reports them right after an edit-tool edit, so Claude fixes them in the same turn. Feedback, not a block |
| Display strings outside `src/lib/format.ts` | Advisory |
| Editing installer-managed files in `_bmad/` | Advisory |

## Finishing on a red check

| Rule | Enforcer |
| --- | --- |
| Claude doesn't call a task done while `npm run check` is red | Advisory. `.claude/hooks/stop-check.mjs` enforces it, but it isn't wired in: the owner found a full check at the end of every turn too much. It was wired for the exercise 6 run, then removed |
| After three red checks in a row on the same problem, Claude stops and reports what it tried | Advisory. Wired in, `stop-check.mjs` sends Claude back twice, then lets the turn end |

## Audit

Every tool call and every session start is logged to `logs/agent-audit.jsonl`, including calls that failed and calls a guard blocked. Each line has the same fields: `time`, `session`, `event`, `tool`, `target`, `outcome` (`ok`, `failed` or `blocked`) and `reason`. Written by `.claude/hooks/audit-log.mjs` and the two guards, through `.claude/hooks/audit-file.mjs`. It records commands and paths, never file contents. Calls the permission rules or the owner refused aren't logged.

## Known gaps

- `main` has no branch protection on GitHub, so a push from outside Claude Code skips every check above except CI.
- A bare `git push` while on `main` doesn't name `main`, so neither the `ask` rule nor the plugin hook asks.
- `.claude/settings.json` is not protected: Claude can edit the hooks and permissions that limit it. The owner chose this on 2026-11-10, so Claude wires the hooks instead of the owner pasting each change by hand. In Auto mode the classifier refused one such edit, loosening the push rules; it went through in manual mode with the owner present.
- The shell-write block covers redirects, `tee`, `sed -i` and scripts that write into `src/`. Other ways to change a file, such as `eslint --fix` or `git checkout`, aren't blocked, and a shell write outside `src/` isn't checked. `guard-files.mjs` sees only the edit tools, so a shell command can still write to `.env`.
- Whether the `deny` on `.env` also stops indirect reads, such as a `python` script, wasn't tested.
- The CSS token rule is checked only after edit-tool edits, and `npm run check` doesn't read CSS.
- A change to the permission rules took effect only after a short delay: two test pushes sent right after the edit ran without asking. Test a rule change in a separate step.
