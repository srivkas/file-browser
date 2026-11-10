# Level 6, exercise 1: harness-ready gates

The goal: before Claude works on its own, prove that `npm run check` gives the same answer every time, so a red result always means a real problem.

## Tightened

- **Lint warnings now fail the check.** `npm run lint` is `eslint . --max-warnings 0`. Before, a warning such as `react-hooks/exhaustive-deps` passed silently. The code had no warnings, so nothing broke.
- **The hook tests are type-checked.** `tsconfig.json` covers only `src` and `vite.config.ts`, so `.claude/hooks/hooks.test.ts` ran without a type check. `tsconfig.hooks.json` now checks `.claude/hooks` with Node's types, and `npm run typecheck` runs both configs. Node's types stay out of the app's config, so app code can't use Node APIs by mistake. This added the dev dependency `@types/node` at `^24`, the Node version CI runs, approved by the owner.
- Types were already strict: `strict`, `noUnusedLocals` and `noUnusedParameters`.

## Each gate can go red

| Plant | Result | Message |
| --- | --- | --- |
| `export const planted: number = 'one'` in `src/lib/time.ts` | check exits 2 | `src/lib/time.ts(23,14): error TS2322: Type 'string' is not assignable to type 'number'.` |
| A `useEffect` that uses `name` with an empty dependency list | check exits 1 | `6:6 warning React Hook useEffect has a missing dependency: 'name'` and `ESLint found too many warnings (maximum: 0).` |

Both messages name the file, the line and what was expected, so an agent can fix them without guessing. Both plants were reverted. Three runs in a row on the result: 176 of 176 each time.

## Stability, run earlier on 2026-11-10

| Check | Result |
| --- | --- |
| `npm run check` 10 times in a row | 10 of 10 passed |
| `npx vitest run --sequence.shuffle` with seeds 1, 7, 42, 1234 and 98765 | 170 of 170 passed each time |
| The test run in another time zone (`Pacific/Kiritimati`) and language (`he_IL`) | 170 of 170 passed |
| Tests that use the current time, randomness, timers, the network or snapshots | none found |

The shuffle was confirmed to change the order: seeds 1 and 42 ran the hook tests in different orders.

## Why it is stable

- Code that depends on time takes `now` as a parameter (`.claude/rules/lib-core.md`), so tests pass a fixed value.
- Error paths are reached by mocking, not by provoking the runtime, after the stack-depth test found in the epic 1 retrospective.
- The hook tests each use their own temporary folder.

## Noticed, not changed

`formatDate` in `src/lib/format.ts` uses `toLocaleString()`, whose output depends on the machine's language and time zone. It has no test, so it can't make the check unstable, but it also isn't checked at all.
