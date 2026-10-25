---
paths:
  - "src/lib/**"
---

# src/lib/ — the framework-free core

- Never import React (or react-dom) here. This folder is plain TypeScript so it can be unit-tested without a browser and reused if the UI changes. ESLint fails the check if it happens.
- One job per file. Calculations live in their own file (e.g. `time.ts`, `summary.ts`, `text.ts`) and return data; `format.ts` only turns that data into display strings and never calculates.
- Functions that depend on the current time take `now` as a parameter, so tests give the same result every time.
- Every new function gets tests in a `*.test.ts` file next to it.

## Tests reach an error path by mocking, not by provoking the runtime

When a test needs a dependency to fail, mock it to throw. Don't feed input big or odd enough to break it by accident — that depends on stack size, the library version and the machine, so the test can pass or fail for reasons unrelated to the code.

Bad — hopes 2,000 nested quotes overflow `marked`'s stack:

```ts
expect(parseMarkdown('>'.repeat(2000) + ' a', F)).toBeNull();
```

Good — makes the lexer throw, deterministically. Tests can't import `marked` (ESLint allows it only in `markdown.ts`), so mock the module and load a fresh copy:

```ts
vi.doMock('marked', () => ({ marked: { lexer: () => { throw new Error('boom'); } } }));
vi.resetModules();
try {
  const fresh = await import('./markdown');
  expect(fresh.parseMarkdown('# a', F)).toBeNull();
} finally {
  vi.doUnmock('marked');
  vi.resetModules();
}
```

Reason: codified 2026-10-25 from the epic 1 retrospective, action item 2 (`epic-1-retro-2026-10-22.md`). The fallback test added in story 1.3 (`0da4400`, `markdown.test.ts`) relies on stack depth.
