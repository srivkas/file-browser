---
title: 'Story 1.4: Open web links from a README'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '0da4400da09c10bfcb197848a07348da0b5b2a95'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every link in a rendered README is inert, so a student cannot reach the project's website from it.

**Approach:** Classify each Markdown link in the core (`src/lib/links.ts`): only an address whose scheme is exactly `http:` or `https:` becomes a web link carrying its normalized address; everything else stays inert with no address. The renderer turns web links into anchors that open a new tab with no opener and no referrer; inert links stay as today.

## Boundaries & Constraints

**Always:** the verdict is decided in `src/lib` and stored in the model — the renderer never inspects an address; parse with the WHATWG `URL` parser, never a regex; keep only the normalized `url.href`; web links `target="_blank" rel="noopener noreferrer"`; inert links keep no address, are not focusable and do nothing.

**Never:** in-app navigation to files or `#headings` (out of scope); a link icon; changing image handling (Story 1.5); any address other than `http(s)` in the DOM.

## I/O & Edge-Case Matrix

| Scenario | Markdown | Expected |
|----------|----------|----------|
| Web link | `[site](https://example.com)` | `<a href="https://example.com/" target="_blank" rel="noopener noreferrer">site</a>` |
| Bare / angle autolink | `https://example.com`, `<https://example.com>` | web link, text is the address |
| `www.` autolink | `www.example.com` | web link to `http://www.example.com/` |
| Upper-case scheme | `[x](HTTPS://E.com)` | web link to `https://e.com/` |
| Reference link | `[x][r]` + `[r]: https://e.com` | web link |
| File path / heading | `[setup](docs/setup.md)`, `[s](#setup)` | inert, no href |
| Dangerous schemes | `javascript:`, ` javascript:` (leading space), `JaVaScRiPt:`, `data:`, `vbscript:`, `file:` | inert, no href |
| Mail | `[m](mailto:a@b.co)`, bare `a@b.co` | inert |
| Protocol-relative | `[p](//evil.example)` | inert |
| Malformed | `[b](https:)`, `[b](http://)` | inert |

</frozen-after-approval>

## Code Map

- `src/lib/markdown.ts` -- `MdInline` link is `{ kind: 'link'; children }` (line ~13); built in `toInline` `case 'link'` (~159) from `Tokens.Link`, whose `href` marked has already trimmed and resolved (reference links, autolinks; `www.` gets `http://`, bare emails get `mailto:`).
- `src/lib/links.ts` -- new; the architecture's home for link/image verdicts (images come in Story 1.5).
- `src/components/MarkdownView.tsx` -- `case 'link'` (~130) renders `span.md-inert-link`.
- `src/lib/markdown.test.ts` -- "turns every link into its text only" and the hostile test (`not.toMatch(/href/i)`) assume no link has an address; update them to the new rule.
- `src/components/MarkdownView.test.tsx` -- hostile render test asserts no `<a>` at all; narrow it to "no `<a>` except `http(s)` web links".
- `src/styles/app.css` -- focus ring pattern: `outline: var(--focus-ring-width) solid var(--color-accent)` (see `.tree-filter:focus-visible`); `.md-inert-link` exists.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/links.ts` + `links.test.ts` -- `export type LinkTarget = { kind: 'web'; href: string } | { kind: 'inert' }`; `classifyLink(href: string): LinkTarget` using `new URL(href)` (throws → inert); `web` only when `protocol` is `http:` or `https:` and `hostname` is non-empty, with `href` = `url.href`. Test every matrix row at this level.
- [x] `src/lib/markdown.ts` + `markdown.test.ts` -- link becomes `{ kind: 'link'; target: LinkTarget; children }` via `classifyLink(token.href)`; update the link and hostile tests: web links carry only `http(s)` addresses, and no `javascript:`, `data:`, `vbscript:`, `file:` or `evil.example` address survives anywhere in the model.
- [x] `src/components/MarkdownView.tsx` -- `target.kind === 'web'` → `<a className="md-web-link" href={target.href} target="_blank" rel="noopener noreferrer">`; inert unchanged.
- [x] `src/components/MarkdownView.test.tsx` -- render tests: a web link renders with exactly that `href`, `target` and `rel`; every `<a>` in the hostile sample has an `http(s)` `href`; inert links render no `<a>`.
- [x] `src/styles/app.css` -- `.md-web-link`: `--color-accent`, no underline, underline on hover, `:focus-visible` ring with the existing focus-ring tokens.

**Acceptance Criteria:**
- Given a rendered web link, when it is clicked, then a new tab opens on that address and the app tab keeps its folder, selection and scroll position.
- Given the preview, when Tab is pressed, then focus moves through web links only, in reading order, with the focus ring, and Enter opens the link in a new tab.
- Given any non-web link, when clicked, then nothing happens, no code runs and no request is made.

## Implementation Notes

- Implemented by a fresh subagent from this spec; review patches applied by the same subagent.
- Focus ring on `.md-web-link` uses a positive `outline-offset` (inline links), unlike the inset rings in the tree.
- Review patches: entities in link addresses are decoded before classification (`&amp;` in query strings, numeric `&#58;`), with `decodeEntities` now handling numeric references; http(s) URLs carrying a user name or password are inert (`https://github.com@evil.example`); tests for non-web schemes that have a host (`javascript://example.com/…`, `file://server/x`, `ftp://…`) at classifier, parser and render level; test comment and a redundant render assertion corrected.
- Verified in the dev server: four web-link forms render as `_blank` + `noopener noreferrer` anchors to the normalized address; five inert forms are unfocusable spans and clicking them changes nothing; a real click on a web link tried to open a new tab and the app tab kept its folder and selection. `npm run check` green.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | edge | Entities left raw in hrefs; `&amp;` query links open the wrong address | medium | Confirmed with marked 18.1.1. Patched. |
| 2 | edge+blind | Userinfo URLs (`https://github.com@evil.example`) disguise the host | medium | Confirmed (`hostname` is evil.example). Patched: inert. |
| 3 | verification | Protocol check untested for non-web schemes with a host | medium | Confirmed: every test input had an empty host or threw. Patched with tests at three levels. |
| 4 | blind | Entity-encoded `javascript&#58;` untested end to end | low | Patched with #1. |
| 5 | blind | Wrong test comment | low | Patched. |
| 6 | blind | Redundant, weaker render assertion | low | Patched. |
| 7 | blind | No prompt file | medium | Patched at commit (`prompts/l4-ex6-text-preview-1-4.md`). |
| 8 | blind | Web links distinguished by colour alone | medium | Real (≈2.9:1 vs text); approved design says underline on hover only. Deferred for an owner/UX decision. |
| 9 | edge | Spec says no evil.example address survives, test keeps one | false | The fixture's `<https://evil.example/a>` is a genuine web link; FR14 makes it live. Spec wording, not a code defect. |
| 10 | blind | Link text can differ from its destination | low | Inherent to links; the browser status bar shows the address (UX decision). Rejected. |
| 11 | blind | Localhost/private-network links are live | false | A README linking to `http://localhost:5173` is legitimate; FR14 covers every http(s) address. |
| 12 | blind | Inert-link focus/click behaviour untested | low | Spans carry no handler or tabindex; verified by hand. Rejected. |
| 13 | blind | Links in lists/tables/quotes untested | low | Same `toInline` path for every container. Rejected. |
| 14 | blind | `.md-web-link` not scoped under `.markdown`; no `:visited` | low | Cosmetic. Rejected. |
| 15 | verification | `hostname === ''` check is redundant | low | Harmless belt-and-braces. Rejected. |

## Verification

**Commands:**
- `npm run check` -- expected: typecheck, lint and all tests pass.

**Manual checks (if no CLI):**
- Dev server: a README with every matrix row; click a web link (new tab, app tab unchanged), click each inert link (nothing happens, network log empty); Tab through the preview; light and dark.
