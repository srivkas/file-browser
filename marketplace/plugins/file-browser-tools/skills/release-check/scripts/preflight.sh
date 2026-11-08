#!/usr/bin/env bash
# Git-side pre-merge checks for file-browser. Read-only apart from `git fetch`.
# Prints one PASS / FAIL / NOTE line per check; exits 1 if any check failed.
set -u

cd "$(git rev-parse --show-toplevel)" || exit 1
failed=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failed=1; }
note() { printf 'NOTE  %s\n' "$1"; }

branch=$(git branch --show-current)
if [ -n "$branch" ] && [ "$branch" != main ]; then
  pass "on feature branch $branch"
else
  fail "on '${branch:-detached HEAD}' — run from the feature branch you want to release"
fi

dirty=$(git status --porcelain)
if [ -z "$dirty" ]; then
  pass "working tree clean"
else
  fail "uncommitted changes in $(printf '%s\n' "$dirty" | wc -l | tr -d ' ') path(s) — commit or stash them first"
fi

if ! git fetch -q origin; then
  fail "git fetch origin failed"
fi

if git rev-parse -q --verify "origin/$branch" >/dev/null; then
  ahead=$(git rev-list --count "origin/$branch..HEAD")
  behind=$(git rev-list --count "HEAD..origin/$branch")
  if [ "$ahead" = 0 ] && [ "$behind" = 0 ]; then
    pass "in sync with origin/$branch"
  else
    fail "not in sync with origin/$branch (ahead $ahead, behind $behind)"
  fi
else
  fail "origin/$branch doesn't exist — push the branch first"
fi

if git merge-base --is-ancestor origin/main HEAD; then
  pass "fast-forwards main by $(git rev-list --count origin/main..HEAD) commits"
else
  fail "main has $(git rev-list --count HEAD..origin/main) commits this branch lacks — bring main in first"
fi

tracked=$(git ls-files | grep -E '^(AGENTS\.md|\.agents/|\.codex/)|(^|/)\.env($|\.)|settings\.local\.json$' || true)
if [ -z "$tracked" ]; then
  pass "no Codex copies or local secrets tracked"
else
  fail "tracked files that must stay out of git: $(printf '%s' "$tracked" | tr '\n' ' ')"
fi

deps=$(git diff origin/main..HEAD -- package.json | grep -E '^[+-] +"' || true)
if [ -z "$deps" ]; then
  pass "no package.json changes vs main"
else
  note "package.json changes vs main — the owner approves new dependencies:"
  printf '%s\n' "$deps" | sed 's/^/        /'
fi

exit "$failed"
