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

- Chrome reports `.ts` files as `video/mp2t`, which used to hide their Lines row. `isTextFile` now treats every `.ts` file (only `.ts`) as text before checking the MIME type (story 1.2 in `_bmad-output/planning-artifacts/epics.md`), so a real video named `.ts` shows as garbled text — accepted. The Type row still shows `video/mp2t`.
- Picking an empty folder in the Firefox/Safari fallback gives no feedback — an open decision; ask before adding a message.

<!-- /bmad:context -->

## Working on your own

- After three red checks in a row on the same problem, stop and report what you tried, instead of trying again.
- When you add or change a rule, permission or hook, update `CONTRACT.md`, which names who enforces each rule.

## Picking a tool for unattended work

Start with the lightest row that fits. Costs are from this repo's own Level 7 runs (`notes/l7-ex*.md`).

| Shape of the work | Tool | What it cost here | Don't use it when |
| --- | --- | --- | --- |
| One question, an answer a script acts on | `claude -p` with `--json-schema` and caps (`scripts/audit-json.mjs`) | $0.045–0.088 a run; the same 9-file question as the workflow below: 56.9k tokens in 17 s, about half | The work needs several turns of trying and checking |
| A finish line that printed output can prove | `/goal` with end state, proof, what must not change, and a limit | 1 turn, 1.9k–4.2k tokens, about a minute; a condition about taste: $0.71 and no verdict | Nothing printable proves the condition |
| Watching something that has no finish line | `/loop` with `.claude/loop.md` | About 115k cached tokens a tick (the whole conversation, resent) for two git commands | It changes rarely, or the session is long: lengthen the interval |
| The same question over many units | A workflow (`.claude/workflows/component-strings.js`) | 9 agents, 110.6k tokens, 9.8 s for 9 small files | There are few units: one agent that sees them all was cheaper and judged better |
