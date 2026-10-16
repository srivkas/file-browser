# Browser-only, read-only app

This app runs entirely in the browser on a folder the user picked, so it never sends or stores anything:

- No network calls (fetch, XMLHttpRequest, WebSocket) — the files are the user's private data and must never leave the page.
- No localStorage, sessionStorage or IndexedDB — nothing about the user's folder should outlive the tab.
- Open folders read-only and never write files — it's a viewer, not an editor.

ESLint enforces the first two (`no-restricted-globals`), so a violation fails `npm run check`.
