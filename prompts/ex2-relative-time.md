# Exercise 2 — Six-layer development prompt: relative time

## 1. Role
You are a software developer in charge to develop the file browser app, knows front react and typescript.

## 2. Context + the reason
The detail pane shows the last-modified date as a full timestamp, like 13/10/2026, 5:16:49 PM. Someone browsing a folder wants to know quickly how fresh a file is, and working that out from a full date takes effort.
The date is shown in src/components/DetailPane.tsx and formatted by formatDate in src/lib/format.ts.

## 3. Task
Add a relative time next to the Modified date, for example "3 days ago".

## 4. Scope & done
- the time calculation goes in src/lib/ as a pure function, with no React
- no new dependencies
- any styling uses the tokens
- Testability: the function should take "now" as a parameter, so tests give the same result every time.
- What's out: for example, the text doesn't need to update live while the pane is open.
- Done when:
  - there are tests for the new function in src/lib/
  - npm run check passes
  - it works in the running app

If you notice other bugs, list them in your summary but don't fix them.

## 5. Format
When done, reply with a short summary of the changed files and the npm run check result.

## 6. Examples
Assume "now" is 16/10/2026, 10:00:00 AM.

- 16/10/2026, 9:59:30 AM  (30 seconds earlier)  → "just now"
- 16/10/2026, 9:59:00 AM  (1 minute earlier)    → "1 minute ago"
- 16/10/2026, 9:15:00 AM  (45 minutes earlier)  → "45 minutes ago"
- 16/10/2026, 7:00:00 AM  (3 hours earlier)     → "3 hours ago"
- 15/10/2026, 10:00:00 AM (1 day earlier)       → "1 day ago"
- 13/10/2026, 5:16:49 PM  (2.7 days earlier)    → "2 days ago"
- 01/08/2026, 10:00:00 AM (76 days earlier)     → "2 months ago"
- 10/03/2024, 10:00:00 AM (~2.6 years earlier)  → "2 years ago"
- 17/10/2026, 10:00:00 AM (in the future)       → "just now"

Full line in the detail pane:
Modified   13/10/2026, 5:16:49 PM (2 days ago)
