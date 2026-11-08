#!/usr/bin/env bash
# Mirrors the CI deploy job (.github/workflows/deploy.yml) before anything reaches main:
# a clean `npm ci`, `npm run check` and `npm run build` on the committed HEAD, in a
# throwaway worktree — so a stale local node_modules or an out-of-sync
# package-lock.json can't hide a CI failure. The worktree is removed on exit.
set -euo pipefail

repo=$(git rev-parse --show-toplevel)
worktree=$(mktemp -d "${TMPDIR:-/tmp}/release-check.XXXXXX")
step="setup"

cleanup() {
  git -C "$repo" worktree remove --force "$worktree" 2>/dev/null || rm -rf "$worktree"
  git -C "$repo" worktree prune
}
trap cleanup EXIT
trap 'echo "FAIL  CI mirror failed at: $step"' ERR

node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" = 24 ] || echo "NOTE  local Node is $(node --version); CI uses Node 24"

git -C "$repo" worktree add -q --detach "$worktree" HEAD
cd "$worktree"

step="npm ci";        echo "== $step"; npm ci --no-audit --no-fund
step="npm run check"; echo "== $step"; npm run check
step="npm run build"; echo "== $step"; npm run build

echo "PASS  CI mirror: npm ci, check and build succeeded on $(git rev-parse --short HEAD)"
