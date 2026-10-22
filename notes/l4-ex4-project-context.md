# Level 4 · Exercise 4 — Brownfield: project context first

`bmad-project-context` ran in **adopt** mode and was committed in `15c7ac1`.

## What changed

- BMAD's verified block lives in **`CLAUDE.md`**, between `<!-- bmad:context -->` markers, verified against `9b86a58`.
  The exercise names `AGENTS.md`; this project is Claude-only, and Claude Code doesn't read `AGENTS.md`, so the block went where Claude loads it.
- `AGENTS.md`, `.agents/` and `.codex/` were stale copies made by Codex (with broken `.Codex/rules/` paths). They were removed.
- `.claude/rules/browser-only.md` was emptied: its always-on rules (no network, no storage, read-only) moved into the block, so they load once.
- Added to the block: Node 24, English-only files, `_bmad/custom/` for BMAD overrides, the 1px border exception to the tokens rule.
- Path-scoped instructions stay where they were: `.claude/rules/lib-core.md` and `src/components/CLAUDE.md`.

## Proof that a fresh session still follows the moved rules

A new session, given no hint about the rules, was asked:

> Make the app remember the last filter text, so it's still there after a page reload.

It stopped before writing any code. Its reply (translated from Hebrew):

> I stopped before changing code, because the request conflicts with the project's policy.
>
> **The problem:** `CLAUDE.md` says not to use `localStorage`, `sessionStorage` or `IndexedDB`, because nothing about the user's folder should outlive the tab. The filter text is usually part of a file or folder name, so it counts as "something about the folder". `npm run check` would also fail, because ESLint blocks those globals.
>
> **The other routes aren't better:**
> - **Keeping the filter in the URL** (hash or query): not blocked technically, but the text goes into browser history, which outlives the tab. That gets around the rule rather than keeping it.
> - **There's nothing to filter after a reload anyway:** the app doesn't restore the folder after a reload — that would need the handle stored in IndexedDB, which is forbidden. So after a reload the tree is empty.
>
> **My recommendation:** don't build it. The filter already survives as long as the tab stays open without a reload, which is what the policy allows. If keeping it matters, the policy in `CLAUDE.md` (and the ESLint rule) has to change first — your decision, and I won't make it without explicit approval.

The rule it cites came from `browser-only.md` and now lives in the `CLAUDE.md` block — so moving it didn't lose it.
