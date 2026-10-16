---
paths:
  - "src/lib/**"
---

# src/lib/ — the framework-free core

- Never import React (or react-dom) here. This folder is plain TypeScript so it can be unit-tested without a browser and reused if the UI changes. ESLint fails the check if it happens.
- One job per file. Calculations live in their own file (e.g. `time.ts`, `summary.ts`, `text.ts`) and return data; `format.ts` only turns that data into display strings and never calculates.
- Functions that depend on the current time take `now` as a parameter, so tests give the same result every time.
- Every new function gets tests in a `*.test.ts` file next to it.
