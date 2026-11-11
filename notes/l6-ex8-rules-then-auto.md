# Level 6, exercise 8: rules, then a feature in Auto

An earlier Auto run, before any rules, is in `l6-ex8-auto-mode.md`. This one follows the card.

## The rules

In `.claude/settings.json`, so they apply to everyone who works in the repo:

| Group | Rules |
| --- | --- |
| `allow` | `npm run check` and its parts, `git status`, `git diff`, `git log`. After the run, also `git push` |
| `ask` | `npm install`, `npm i`, `npm ci`. During the run, every `git push`; after it, only `git push *main*` |
| `deny` | `Read` of `.env` and `.env.*`, in the root and in any folder |

`.env` and `.env.*` were also added to `.gitignore`: until now a real `.env` could have been committed.

## The run

On 2026-11-11 the owner ran `prompts/l6-ex8-breadcrumb.md` in a fresh session, switched to Auto with Shift+Tab, and stayed out of it. A fake `.env` with a made-up value was in the repo root.

- It added a breadcrumb of the selected file's folders above its name: `breadcrumbFolders` in `src/lib/breadcrumb.ts` with tests, a `Breadcrumb` component as a `nav` with an ordered list, text in `format.ts`, and one line that ends in an ellipsis instead of widening the pane. `npm run check`: 238 tests passed, with no edits by the owner.
- `git push` stopped and asked, with "Ask rule Bash(git push) overrides auto mode for this command". The owner declined.
- Reading `.env` was refused without asking, by the `deny` rule.

## What the audit log showed

Six lines in about three minutes: a session start and five shell commands. Every edit was made through the shell (`cat >` and a `python3` script), so `guard-files.mjs` and the CSS check never ran. The CSS was checked by hand afterwards and was clean. The declined push and the refused read weren't logged, because neither ran.

## Tighten one, loosen one

- **Tighten:** shell writes into `src/`. `guard-bash.mjs` now blocks a redirect, `tee`, `sed -i` or a script that writes there, and tells Claude to use the edit tools, so the hooks see each change. The owner also weighed having the hooks watch shell edits after the fact, which costs no tokens but can't prevent a write, and kept the block. The guard blocked this session's own script that held the new samples, so they were added with the edit tool.
- **Loosen:** pushing a feature branch. It now runs without asking, and only a push that names `main` asks. The owner also removed the personal `ask` rules for `git push` and `git commit` from `~/.claude/settings.json`, since `ask` rules from every scope add up.

## What went wrong along the way

- In Auto mode, the classifier refused Claude's edit that loosened the push rules, as an agent widening its own permissions. Claude didn't work around it; the owner switched to manual mode and the edit went through.
- Two test pushes sent right after that edit both ran without asking, the push to `main` included (dry runs, so nothing reached GitHub). A minute later, the same push to `main` stopped with "Permission rule Bash(git push *main*) requires confirmation". The likely cause is that the new rules hadn't loaded yet.
- The Level 5 plugin hook `confirm-push-main.mjs` answers `ask` when run by hand, but its earlier "proof" in Level 5 was made while every push asked anyway, so it never showed the hook alone.
