# src/components/ — React UI

- Keep components thin: they render and handle events. Any calculation or formatting goes in `src/lib/` and is imported, so it can be tested without React.
- Async work in an effect (reading a file, decoding an image) follows the pattern in `DetailPane.tsx`: a `cancelled` flag set in the cleanup, and object URLs revoked there — StrictMode runs effects twice, and a stale result must never overwrite the current file.
- Reset per-file state by giving the component `key={node.path}` rather than clearing state inside an effect — the lint rule `react-hooks/set-state-in-effect` rejects the latter.
- Class names only; styles live in `src/styles/app.css` and use the tokens.
