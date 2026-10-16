# CLAUDE.md — file-browser

A browser-only, read-only file explorer (React + TypeScript + Vite), used as the base project for a course.

## Forbidden
- No new npm dependencies without asking first — the app is a small course base, and every dependency is code students have to read and trust.
- No network calls, no localStorage / sessionStorage / IndexedDB, no file writes — the user's files are private and must never leave or outlive the tab (details: `.claude/rules/browser-only.md`).
- No React imports in `src/lib/` — it's the framework-free core that the tests cover (details: `.claude/rules/lib-core.md`).
- No hard-coded colors, sizes or spacing in CSS — everything goes through the variables in `src/styles/tokens.css`, so theming stays in one place.
- No `git commit` / `git push` without the user's OK — they review every change first.

## Conventions
- Calculations in their own `src/lib/` file returning data; display strings only in `src/lib/format.ts`.
- Every development prompt is saved as `prompts/exN-<feature>.md` and committed with the feature it built.
- Time-dependent logic takes `now` as a parameter so tests are deterministic.
- When you notice a bug outside the task, report it — don't fix it unasked.

## Stack
React 19 · TypeScript (strict) · Vite · Vitest · ESLint (flat config) · exifr for EXIF.
Folder access: `showDirectoryPicker({ mode: 'read' })`, falling back to `<input webkitdirectory>` in Firefox/Safari.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Commands
- `npm run check` — typecheck + lint + tests; must be green before anything is done.
- `npm run dev` — local app at http://localhost:5173.
- `npm run build` — production build into `dist/`.

## Open questions
- Chrome reports `.ts` files as `video/mp2t`, so they get no Lines row — should a known code extension override that MIME type?
- An empty folder gives no feedback in the Firefox/Safari fallback (`buildTree` returns null) — show a message?
