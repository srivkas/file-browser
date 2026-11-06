# release-check scripts — requirements

Both scripts run from anywhere inside the repo and work on the current branch.

| Script | Needs |
|---|---|
| `preflight.sh` | `bash`, `git` 2.20+, a remote named `origin` you can fetch from |
| `ci-mirror.sh` | `bash`, `git` 2.20+ (for `git worktree`), Node 24 with its `npm` (the version CI runs — the script notes a mismatch), network access for `npm ci`, about 300 MB free in `$TMPDIR` |
| Step 5 of the skill (deploy watch) | `gh` (GitHub CLI), logged in with access to the repo's Actions |

Nothing to install from npm: the scripts use only the repo's own `package.json` scripts.

`ci-mirror.sh` creates its worktree under `$TMPDIR` and removes it on exit, even on failure. If a run is killed hard, clean up with `git worktree prune`.
