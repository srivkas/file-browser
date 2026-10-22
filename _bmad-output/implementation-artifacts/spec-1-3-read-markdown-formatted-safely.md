---
title: 'Story 1.3: Read Markdown formatted, safely'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '8c2e07649c073f04fb9feb0a9362502284379f53'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Markdown files show as numbered raw source; a README should read the way GitHub shows it.

**Approach:** Parse with `marked`'s lexer (GFM) inside `src/lib/markdown.ts` into an app-owned block/inline model, and render that model with React elements only. In this story every link is inert (no href kept) and every image is a placeholder — Stories 1.4 and 1.5 upgrade those. Lock the safety rules into ESLint.

## Boundaries & Constraints

**Always:** only `lib/markdown.ts` imports `marked`, lexer only; model text is display-ready; raw HTML (block or inline) becomes literal text; unknown token kinds degrade to their text; strings in `format.ts`; CSS via tokens.

**Never:** `marked.parse`/HTML output; `dangerouslySetInnerHTML`; an `href` or `src` from the file in the DOM; loading any image; syntax highlighting; footnotes, alerts, heading anchors.

## I/O & Edge-Case Matrix

| Scenario | Input | Expected model / view |
|----------|-------|------------------------|
| Heading | `# Title` | h1 "Title", no `#` |
| Emphasis | `**b** _i_ ~~s~~ `` `c` `` | strong, em, del, inline code |
| Lists | `1. a` / `- b` / nested | ol / ul, nesting kept |
| Tasks | `- [x] done`, `- [ ] todo` | disabled checkboxes, checked / unchecked |
| Table | header + 2 rows, `:-` / `-:` | 3-row table, column alignment kept |
| Code block | fenced `js` with `a<b` | monospace block, literal `a<b`, no colour |
| Quote, rule | `> q`, `---` | blockquote, hr |
| Raw HTML | `<b>hi</b>`, `<script>alert(1)</script>`, `<img src=x onerror=…>` | shown literally as text; nothing runs |
| Entities | `&amp; &copy; &#169;` | `& © ©` |
| Links | `[l](docs/a.md)`, `https://x.com`, `[x](javascript:…)` | inert span, no href |
| Images | `![logo](a.png)`, `![](https://e/b.png)` | placeholder "logo" / "Image"; no request |
| Empty / too large | 0 B / > 1 MB `.md` | unchanged from Story 1.1 |

</frozen-after-approval>

## Code Map

- `package.json` -- `marked` 18.1.1 already added (`--save-exact`, owner-approved NFR5).
- `src/lib/markdown.ts` -- new; `marked.lexer(text, { gfm: true })`. Token shapes (v18): `heading{depth,tokens}`, `paragraph{tokens}`, `text{text,tokens?}` (tight list items nest inline `tokens`), `strong/em/del{tokens}`, `codespan{text}`, `code{text}`, `blockquote{tokens}`, `list{ordered,start,items}`, `list_item{task,checked,tokens}` whose first token is `checkbox{checked}`, `table{align,header[cell],rows[[cell]]}` with `cell{tokens}`, `hr`, `html{block,text}`, `escape{text}`, `br`, `link{tokens}`, `image{text}`, `space`, `def` (skip). Numeric entities arrive decoded; named ones (`&amp;`, `&copy;`) do not.
- `src/components/TextPreview.tsx` -- route `plan === 'markdown'` to `MarkdownView` (currently `PlainTextView`).
- `src/lib/format.ts` -- add the placeholder string.
- `eslint.config.js` -- existing `no-restricted-globals` (all `src`) and lib-only `no-restricted-imports` for React; a later block for the same rule replaces the earlier one, so lib blocks must repeat the React patterns.
- `src/styles/tokens.css`, `app.css` -- add tokens; `.section-title`, `.muted` exist.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/markdown.ts` + `markdown.test.ts` -- `parseMarkdown(text): MdBlock[]`; types `MdBlock` (heading, paragraph, plain [tight-list text], raw, code, quote, list with items `{ checked: boolean | null, blocks }`, rule, table with `align`, `header`, `rows`) and `MdInline` (text, strong, em, del, code, break, link `{ children }`, image `{ alt }`); `decodeEntities` for the named set amp, lt, gt, quot, apos, nbsp, copy, reg, trade, hellip, mdash, ndash, lsquo, rsquo, ldquo, rdquo, times (others stay literal). Test every matrix row plus a hostile fixture asserting the serialized model contains no `href`, `src`, or `javascript:`.
- [x] `src/lib/format.ts` + test -- `formatImagePlaceholder(alt)` → alt, or "Image" when blank.
- [x] `src/components/MarkdownView.tsx` -- new; `useMemo` parse; maps the model to h1–h6, p, ul/ol (`start`), li with `<input type="checkbox" disabled>`, blockquote, `pre > code`, hr, table/thead/tbody with `text-align` from `align` via class, `strong`/`em`/`del`/`code`/`br`; links as `<span className="md-inert-link">`; images as `<span className="md-image-placeholder">`; raw as `<p className="md-raw">`.
- [x] `src/components/TextPreview.tsx` -- markdown plan renders `MarkdownView`.
- [x] `eslint.config.js` -- ban `dangerouslySetInnerHTML` in `src` (`no-restricted-syntax`); ban importing `marked` in `src` except `src/lib/markdown.ts` (`no-restricted-imports`), keeping the React ban in `src/lib`.
- [x] `src/styles/tokens.css` -- `--font-size-xl: 20px`, `--reading-max-width: 720px`.
- [x] `src/styles/app.css` -- `.markdown` per DESIGN.md: reading width, `--line-height-read`, h1/h2 with hairline underline, code fill on `--color-sidebar`, `pre` wrapping, table hairlines + grey header + own sideways scroll wrapper, blockquote bar, inert link dotted underline + default cursor, dashed placeholder, `md-raw` pre-wrap, alignment classes.

**Acceptance Criteria:**
- Given a Markdown file in the preview, when it renders, then there are no line numbers and the view matches the UX mock's Markdown panel.
- Given a hostile Markdown file, when previewed with the network log open, then no request is made and no script runs.
- Given `dangerouslySetInnerHTML` in any `src` file or `import … from 'marked'` outside `lib/markdown.ts`, when `npm run check` runs, then it fails.

## Implementation Notes

- Orchestrator note: a first implementation written in the orchestrating session was reverted at the owner's request so that, as the course's bmad-build expects, a fresh subagent implements from this spec alone. `marked` 18.1.1 stays installed.

- Implemented by a fresh subagent from this spec. It added `--line-height-heading: 1.25` (DESIGN.md asks for 1.25 on headings; no hard-coded values allowed) and a `no-restricted-properties` lexer-only guard, both beyond the task list.
- Review patches, applied by the same subagent: `parseMarkdown` returns null when the lexer throws and `MarkdownView` falls back to `PlainTextView`; ESLint guards widened (marked subpaths and dynamic import, `marked()`/`parser`/`use`/HTML-producing named imports, quoted `dangerouslySetInnerHTML` keys, `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`createContextualFragment`), each proven with a probe; numeric-entity comment corrected with a test; render tests via `react-dom/server` (`vite.config.ts` now includes `*.test.tsx`); placeholder `role="img"` + `aria-label`; first-child margins in `li`/`blockquote`.
- Verified in the dev server: a README with every matrix row renders like the UX mock; no `<a>`, `<img>`, `href` or `src` in the preview; no network request for the badge; no alert from `<script>`/`onerror`; 2,000 nested `>` falls back to the plain view and the app stays up. `npm run check`: 94 tests pass.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | edge | Lexer throws RangeError on deep nesting; app unmounts | high | Reproduced with 2,000 `>` (7 ms throw). Patched: null + plain-view fallback. |
| 2 | edge+blind | Hostile emphasis runs freeze the tab | medium | Measured 8.5 s at 40 KB, 53 s at 100 KB (marked itself). Owner chose to defer; deferred-work.md. |
| 3 | verification+edge+blind | Lint "lexer only" guard bypassable (`marked()`, named imports, `parser`, subpaths, dynamic import) | medium | Confirmed by probes. Patched. |
| 4 | edge | Quoted `dangerouslySetInnerHTML` key not matched | low | Direct selector addition. Patched. |
| 5 | blind | Other HTML sinks not banned | low | Direct selector additions. Patched. |
| 6 | blind | Entity comment wrong; numeric path untested | low | Confirmed: `&#38;` → `&amp;` → `&`. Patched comment + test. |
| 7 | blind+verification | Nothing renders `MarkdownView` | medium | `react-dom/server` needs no new dependency. Patched with render tests; `TextPreview` routing deferred. |
| 8 | blind | Placeholder not announced as an image | low | Patched (`role="img"`, `aria-label`). |
| 9 | blind | Nested first-child heading keeps top margin | low | Direct CSS fix. Patched. |
| 10 | blind | No prompt file | medium | Patched at commit (`prompts/l4-ex6-text-preview-1-3.md`). |
| 11 | blind | `marked` approval not recorded; exact pin | false | Approved by the owner 2026-10-22 (architecture memlog, spine Stack pins 18.1.1). |
| 12 | blind | Only 17 named entities | false | Decided in the approved spec's Design Notes. |
| 13 | blind | Raw HTML shown in body font, not monospace | low | Design choice (literal text per PRD/UX); rejected. |
| 14 | blind | Blockquote bar uses `--space-1` | false | DESIGN.md specifies `{spacing.1}` for the bar. |
| 15 | blind | Hostile-URL test fragile | low | Fixture-specific; rejected. |
| 16 | blind | Inert link not announced as a link | low | UX decision: inert links read as plain references; rejected. |
| 17 | verification | Lint rules have no automated test | low | Each rule proven by probe during implementation; a lint-fixture test would be new infrastructure. Rejected. |

## Design Notes

Named entities: the full HTML list (2,000+ names) is out of proportion for a course app; the common set covers READMEs, and an unknown one shows literally, which is safe. Links carry no href at all until Story 1.4 decides which are web links — nothing to misuse.

## Verification

**Commands:**
- `npm run check` -- expected: typecheck, lint and all tests pass.
- Temporarily add `dangerouslySetInnerHTML` to a component and `import { marked } from 'marked'` to another file -- expected: `npm run lint` fails on both; then remove them.

**Manual checks (if no CLI):**
- Dev server: preview a README with every matrix row and a hostile file; network log empty; compare with `ux-designs/.../mockups/key-preview.html`, light and dark.
