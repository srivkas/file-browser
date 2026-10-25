---
paths:
  - "src/**"
---

# Markdown is never turned into HTML

A file's Markdown reaches the screen only as the app's own model: `parseMarkdown` in `src/lib/markdown.ts` turns it into `MdBlock[]` with `marked.lexer`, and React components render that model as elements. Nothing from a file ever becomes an HTML string. Only `markdown.ts` may import `marked`, and only its lexer.

Bad — the file's content becomes HTML:

```tsx
import { marked } from 'marked';
<div dangerouslySetInnerHTML={{ __html: marked.parse(text) }} />
```

Good — parse to the model, render elements:

```tsx
// MarkdownView.tsx
const blocks = useMemo(() => parseMarkdown(text, filePath), [text, filePath]);
if (blocks === null) return <PlainTextView text={text} />;
// …then render each MdBlock as a React element
```

Don't work around the lint by aliasing (`const m = marked`), by a dynamic `import()`, or by another HTML sink (`srcDoc`, `Object.assign(el, { innerHTML })`) — the rule is "no HTML from files", not "pass ESLint".

Enforced by `npm run check`: `eslint.config.js` bans `dangerouslySetInnerHTML`, `innerHTML`/`outerHTML` (assigned or passed as an object key), `srcdoc`, `insertAdjacentHTML`, `document.write`, `createContextualFragment`, dynamic imports of anything but a plain string, importing `marked` outside `markdown.ts`, renaming or aliasing `marked`, and any `marked` API but the lexer. `src/safety-lint.test.ts` lints a known-bad snippet for each, so a config edit that drops one fails the check.

Reason: codified 2026-10-25 from the epic 1 retrospective, action item 3 (`epic-1-retro-2026-10-22.md`). Story 1.3 (`0da4400`) renders untrusted Markdown; the epic review found ways around the lint guards (aliasing `marked`, other HTML sinks), so the intent is written down here, not left to the lint alone.
