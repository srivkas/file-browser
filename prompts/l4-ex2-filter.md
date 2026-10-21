# Level 4 · Exercise 2 — A three-line brief: filter box

Feature #4 from the Levels 1–3 list: a filter box above the tree.
Matching is deliberately left to "like VS Code" — which of its behaviours Claude picks is the assumption to check afterwards.

```
Task: Add a filter box above the tree that works like the VS Code Explorer filter, showing the folders above each match.
Guardrails: No new dependencies; keep the keyboard navigation working as it does today.
Done when: `npm run check` is green, including a new test in `src/lib/` where folder `x` holds `a.txt` and `b.txt`, and filtering by `b` leaves only `x/b.txt`.
```
