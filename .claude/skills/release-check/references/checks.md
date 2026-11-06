# What each check means, and how to fix a FAIL

Read this when a check fails or the owner asks why a check exists.

## On a feature branch

**Why:** the skill releases a branch *into* `main`; run from `main` there's nothing to compare.
**Fix:** `git switch <feature-branch>`.

## Working tree clean

**Why:** the CI mirror and the deploy use the committed `HEAD`. Uncommitted edits would pass locally and never ship — or ship half.
**Fix:** ask the owner to commit (with their OK) or stash the changes. Never commit on your own.

## In sync with origin/&lt;branch&gt;

**Why:** what's on GitHub is what the owner reviewed; a local-only commit would reach `main` unseen.
- *Ahead* — offer to push the branch (owner's OK).
- *Behind* — someone pushed to the branch; `git pull --ff-only`, then rerun the check.
- *Missing* — the branch was never pushed; offer `git push -u origin <branch>`.

## Fast-forwards main

**Why:** `main` is updated by fast-forward only, so the deployed commit is byte-for-byte the one this check tested. If `main` has commits the branch lacks, a merge would create a new, untested commit.
**Fix:** the owner decides how to bring `main` in (merge or rebase). Then rerun the whole check — the CI mirror must run on the result.

## No Codex copies or local secrets tracked

**Why:** `AGENTS.md`, `.agents/` and `.codex/` are copies the ChatGPT app's Codex sync writes into the repo; the repo is Claude-only and ignores them. `.env*` files and `.claude/settings.local.json` are per-machine.
**Fix:** `git rm --cached <path>`, confirm it's covered by `.gitignore`, commit with the owner's OK.

## package.json changes vs main (NOTE, not FAIL)

**Why:** `CLAUDE.md`: no new npm dependency without the owner's OK — every dependency is code students read and trust. Moves between `dependencies` and `devDependencies` show up here too.
**What to report:** each added, removed or moved package, and whether the app bundle uses it (app code imports it) or only tooling does (it belongs in `devDependencies`).

## CI mirror: npm ci / check / build

**Why:** CI starts from an empty machine and installs exactly what `package-lock.json` says; `npm ci` fails if the lockfile doesn't match `package.json`. A local `node_modules` built up over months can hide that.
- *`npm ci` failed, lockfile out of sync* — run `npm install` in the main checkout, check that `package-lock.json` changed, commit both files together (owner's OK).
- *`npm run check` failed* — the failure is real; show the failing test or lint error. Fix on the feature branch, never on `main`.
- *`npm run build` failed* — usually a type or import error the dev server tolerated; show the build output.

## Deploy run

**Why:** a release isn't done until the site serves it. The run can still fail after merge (a GitHub Pages hiccup, a missing permission).
**Fix:** `gh run view <id> --log-failed`. A transient Pages failure can be retried with `gh run rerun <id>` (owner's OK); anything else is a bug to fix on a new branch. Until a run succeeds, the site keeps the previous version.
