---
name: check-status
description: Run the project's check (typecheck, lint, tests) and summarise the uncommitted changes. Use when the user asks whether the work is ready, wants a status, asks "does it pass?", "is it green?", "what changed?", or is about to commit or push.
---

# Check status

Report whether the project is in a good state and what is waiting to be committed. Never commit, push or fix anything — this is a report.

1. Run `npm run check`.
2. Run `git status --short` and `git diff --stat` to see the uncommitted changes, including new untracked files.
3. Reply in exactly this shape:

```
Check: ✅ passed — <N> tests      (or ❌ failed at <typecheck | lint | test> — <one-line reason>)

Uncommitted changes:
- <file> — <what changed, in a few words>
- ...
(or "Nothing to commit — working tree clean.")
```

Keep it short: one line per file, no code. If the check failed, show only the first error, not the whole output.
