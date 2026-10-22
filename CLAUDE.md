<!-- bmad:context -->
<!-- Verified 2026-10-22 against 9b86a58. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## file-browser

A browser-only, read-only file explorer used as the base project for a course. React 19, TypeScript (strict), Vite, Vitest, ESLint flat config, exifr for EXIF. Exercise write-ups live in `notes/`, development prompts in `prompts/`.

## Policy

- Never add an npm dependency without asking first — the app is a small course base, and every dependency is code students have to read and trust.
- Never make network calls (`fetch`, `XMLHttpRequest`, `WebSocket`) — the user's files are private and must never leave the page.
- Never use `localStorage`, `sessionStorage` or `IndexedDB` — nothing about the user's folder may outlive the tab. ESLint `no-restricted-globals` fails `npm run check` on bare uses of these and of the network globals.
- Open folders read-only and never write files — it's a viewer: `showDirectoryPicker({ mode: 'read' })`, falling back to `<input webkitdirectory>` in Firefox/Safari.
- Never `git commit` or `git push` without the user's OK — they review every change first. A push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
- Write every file in the repo in English, whatever language the conversation is in.
- Never edit installer-managed files in `_bmad/` — a reinstall regenerates them; put overrides in `_bmad/custom/`.

## Where things are

- Rules for `src/lib/`: `.claude/rules/lib-core.md` (loads when editing there).
- Rules for `src/components/`: `src/components/CLAUDE.md` (loads when editing there).

## Running and verifying

- Run `npm run check` (typecheck + lint + tests); it must be green before anything is done. CI runs it before every deploy.
- Use Node 24 — the version CI runs; no `engines` field declares it.

## Conventions that differ from defaults

- Put calculations in their own `src/lib/` file returning data, and display strings only in `src/lib/format.ts` — never in components.
- No hard-coded colors, sizes or spacing in CSS — use the variables in `src/styles/tokens.css`, so theming stays in one place. Only exception: `1px` hairline borders.
- Save every development prompt as `prompts/exN-<feature>.md` (Level 4: `prompts/l4-exN-<feature>.md`) and commit it with the feature it built.
- When you notice a bug outside the task, report it — don't fix it unasked.

## Known pitfalls

- A `.ts` file shows no Lines row because Chrome reports it as `video/mp2t` — not a `text.ts` bug. Whether a code extension should override that MIME type is an open decision; ask before changing it.
- Picking an empty folder in the Firefox/Safari fallback gives no feedback — an open decision; ask before adding a message.

<!-- /bmad:context -->
