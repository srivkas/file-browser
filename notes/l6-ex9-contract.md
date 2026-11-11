# Level 6, exercise 9: your responsibility contract

`CONTRACT.md` at the repo root says what Claude may do alone, what needs the owner and what is forbidden, and names each row's enforcer: a permission rule, a hook, ESLint, a test, CI, or "advisory". It was first written for the earlier Auto run and rewritten in exercise 8. `CLAUDE.md` points to it outside the BMAD block, with a condition, so it isn't loaded into every session.

## Attacking the "never" rows

On 2026-11-11, each enforced "forbidden" row was tried in a live session. Each attempt was built so that nothing would be harmed even if the guard failed: dry runs, a folder that doesn't exist, a gitignored folder, and a temporary file that was deleted after.

| Row | Attempt | Result |
| --- | --- | --- |
| Reading `.env` | `Read` of `.env`, with no such file | Refused by the `deny` rule |
| A forced push | `git push --dry-run --force origin feat/level-6` | Blocked by `guard-bash.mjs` |
| A dangerous recursive delete | `rm -rf` of a folder outside the project that doesn't exist | Blocked by `guard-bash.mjs` |
| Publishing | `npm publish --dry-run` | Blocked by `guard-bash.mjs` |
| Writing to `dist/` | `Write` of `dist/attack-test.txt` | Denied by `guard-files.mjs` |
| Network calls, `localStorage`, HTML from a file | A temporary `src/lib/contract-attack.tsx` | ESLint errors, check red |
| React in `src/lib/` | The same file | **Passed** |
| Merging code that fails the check | Not tried | Trying it would deploy; checked by reading `deploy.yml` only |

## The row that wasn't enforced

The React ban in `eslint.config.js` named only `src/lib/**/*.ts`, so a `.tsx` file in `src/lib/` could import React. No `.tsx` file is there yet, which is why nobody noticed, but a JSX file is the likeliest place for React to slip in. The pattern is now `src/lib/**/*.{ts,tsx}`, and `src/safety-lint.test.ts` checks both extensions, so a later edit can't drop it unnoticed. The same attack on a `.tsx` file now fails lint.

The advisory rows (writes to the user's files, display strings, `_bmad/`) are marked as advisory in the contract, as the card allows.
