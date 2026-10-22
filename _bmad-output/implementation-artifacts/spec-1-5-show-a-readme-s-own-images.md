---
title: "Story 1.5: Show a README's own images"
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'f1555acff9a17b74b66555b96019b5c71e5338a6'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every image in a rendered README is a placeholder, even screenshots and diagrams stored in the open folder.

**Approach:** Classify each Markdown image in the core (`src/lib/links.ts`): a relative or `/`-rooted path that stays inside the folder becomes a local path; anything else stays a placeholder. The renderer looks the path up in the open folder's tree (passed down from `App` as a prop) and shows that file through a `blob:` object URL created and revoked in an effect; a missing file is a placeholder.

## Boundaries & Constraints

**Always:** the verdict is decided in `src/lib` and stored in the model; paths use the tree's `node.path` form (root folder name first, `/`-separated); the only `src` ever rendered is a `blob:` URL from `URL.createObjectURL`, revoked when the image unmounts or the file changes; the root `DirNode` travels as props (no context, no module cache); strings in `format.ts`; CSS via tokens.

**Never:** load any image from the network; a `src` built from the Markdown text; read files outside the open folder; change link handling; a lightbox, zoom or click action on images.

## I/O & Edge-Case Matrix

`README.md` sits at `proj/README.md`, `guide.md` at `proj/docs/guide.md` (`proj` is the open folder).

| Scenario | In file | Markdown | Expected |
|----------|---------|----------|----------|
| Relative | `proj/README.md` | `![logo](images/logo.png)`, file exists | `<img>` of `proj/images/logo.png`, alt "logo" |
| Relative from subfolder | `proj/docs/guide.md` | `![x](img/a.png)` | `proj/docs/img/a.png` |
| Folder-rooted | `proj/docs/guide.md` | `![x](/img/a.png)` | `proj/img/a.png` |
| Dot segments | `proj/docs/guide.md` | `![x](./a.png)`, `![x](../img/a.png)` | `proj/docs/a.png`, `proj/img/a.png` |
| Percent-encoded | `proj/README.md` | `![s](my%20shot.png)` | `proj/my shot.png` |
| Query / fragment | `proj/README.md` | `![s](a.png?v=2)`, `![s](a.png#part)` | `proj/a.png` |
| Entity in path | `proj/README.md` | `![s](a&amp;b.png)` | `proj/a&b.png` |
| Missing file | any | path inside folder, no such file | placeholder |
| Not an image | any | path to `notes.txt` | placeholder |
| Escapes folder | `proj/README.md` | `![x](../../x.png)`, `![x](/../x.png)` | placeholder |
| Remote / other schemes | any | `https://…`, `http://…`, `//…`, `data:…`, `file:…`, `C:\x.png` | placeholder; no request |
| Bad encoding / empty | any | `![x](%E0%A4%A.png)`, `![x]()` | placeholder |
| Switch away | README with images selected | select another file | every object URL it created is revoked |

</frozen-after-approval>

## Code Map

- `src/lib/markdown.ts` -- `MdInline` image is `{ kind: 'image'; alt }` (line ~16), built in `toInline` `case 'image'` (~169) from `Tokens.Image` (`href` = the raw src; marked keeps entities and percent-encoding as written; `<a b.png>` form gives an unencoded space). `parseMarkdown(text)` (~71) returns `MdBlock[] | null`; it needs the Markdown file's path to resolve images. Links already do `classifyLink(decodeEntities(t.href))` — mirror that.
- `src/lib/links.ts` -- `classifyLink` / `LinkTarget` live here; add the image verdict beside them.
- `src/lib/tree.ts` -- `DirNode`/`FileNode`; `node.path` starts with the root folder's name. No lookup helper yet.
- `src/lib/image.ts` -- `isImage(file)` (MIME starts with `image/`) — reuse.
- `src/App.tsx` (~35) renders `<DetailPane node={selected} />`; `root` state is in `App`.
- `src/components/DetailPane.tsx` -> `TextPreview` (`file` prop) -> `MarkdownView` (`text` prop); image `case` (~144) renders `span.md-image-placeholder` with `role="img"`.
- `src/components/DetailPane.tsx` `ImageDetails` shows the object-URL pattern: create in the effect, revoke in its cleanup, `cancelled` flag. ESLint `react-hooks/set-state-in-effect` rejects a synchronous `setState` in an effect body.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/links.ts` + `links.test.ts` -- `export type ImageTarget = { kind: 'local'; path: string } | { kind: 'placeholder' }`; `classifyImage(src: string, filePath: string): ImageTarget` per the matrix (scheme or `//` → placeholder; drop `?`/`#` suffix; percent-decode, failure → placeholder; resolve against the file's folder or, for a leading `/`, the root folder; collapse `.`/`..`; leaving the root → placeholder). Test every matrix row at this level.
- [x] `src/lib/tree.ts` + `tree.test.ts` -- `findFile(root: DirNode, path: string): File | null`.
- [x] `src/lib/markdown.ts` + `markdown.test.ts` -- `parseMarkdown(text, filePath)`; image becomes `{ kind: 'image'; alt; target: ImageTarget }` via `classifyImage(decodeEntities(t.href), filePath)`; update existing tests for the new parameter.
- [x] `src/App.tsx`, `DetailPane.tsx`, `TextPreview.tsx`, `MarkdownView.tsx` -- pass `root` (and the selected file's `node.path`) down as props to the image renderer.
- [x] `src/components/LocalImage.tsx` -- new: `findFile` + `isImage`; not found / not an image → the existing placeholder; else an `<img className="md-image" alt=…>` whose `blob:` URL is created in an effect and revoked in its cleanup; renders nothing until the URL is ready.
- [x] `src/components/MarkdownView.test.tsx` -- local images never render a non-`blob:` `src`; remote/escaping images still render placeholders.
- [x] `src/styles/app.css` -- `.md-image`: `max-width: 100%`, `height: auto`, never upscaled.

**Acceptance Criteria:**
- Given a README whose images exist in the folder, when it is selected, then they show at natural size, scaled down to the reading width, with the Markdown alt text.
- Given remote, `//` and `data:` images, when the README is previewed with the network log open, then no request is made.
- Given a README with images is showing, when another file is selected, then every object URL it created has been revoked.

## Implementation Notes

- Implemented by a fresh subagent from this spec; review patches applied by the same subagent.
- `App` renders `DetailPane` only when both `selected` and `root` are set. `ObjectUrlImage` stores the blob URL after the effect (`Promise.resolve().then`) with a `cancelled` flag, the same async-setState pattern as `ImageDetails`.
- Review patches: undecodable images fall back to the placeholder (`onError`); image paths are split on `/` before percent-decoding, and a decoded segment containing `/`, `\` or `:` is a placeholder (`%2F`, `%5C`, `%3A`); `findFile` compares NFC-normalized names; the static-render test no longer claims blob coverage it cannot have; the non-image test now hits an existing text file; model comment and hostile-test key check corrected.
- Verified in the dev server: found images render from `blob:` URLs, scaled to the pane; missing, non-image, escaping, remote, `data:`, `%2F` and corrupt images show placeholders; no request leaves the page's origin; every object URL created was revoked after switching files. `npm run check`: 125 tests pass.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | all three | Blob-src test passes vacuously; no test renders a found image or checks revocation | medium | Static render never runs effects. Test made honest (patch); real coverage needs a DOM env → deferred. |
| 2 | verification | `DetailPane` → `MarkdownView` path wiring untested | medium | Same DOM-env constraint. Deferred; verified by hand. |
| 3 | blind+edge | Undecodable image shows a broken icon | low | Direct `onError` fallback. Patched. |
| 4 | blind+edge | Encoded `%5C`/`%3A`/`%2F` bypass checks; `%2F` resolves a different file | medium | Confirmed from code order. Patched (split, then decode per segment). |
| 5 | edge | NFC/NFD file names don't match | low | Direct normalize. Patched. |
| 6 | blind | Non-image test hits a missing file instead | low | Confirmed path resolution. Patched. |
| 7 | blind | Model comment and `/src/i` check outdated | low | Patched. |
| 8 | blind | No prompt file | medium | Patched at commit (`prompts/l4-ex6-text-preview-1-5.md`). |
| 9 | blind | Deferred setState sidesteps the CLAUDE.md pattern | false | Same async setState-after-effect shape as `ImageDetails`; per-file reset via `key` already in place upstream. |
| 10 | blind | `root` prop drilling; use context | false | Architecture AD-9 requires props, no context. |
| 11 | blind | `findFile` per render; repeated images get separate URLs | low | Negligible for README sizes. Rejected. |
| 12 | blind | Image title dropped | low | Not in scope or UX. Rejected. |
| 13 | blind+edge | No size cap or lazy loading for local images | low | Deferred for a product decision. |
| 14 | edge | Case-insensitive name match | false | Exact match is deliberate (GitHub is case-sensitive). |

## Verification

**Commands:**
- `npm run check` -- expected: typecheck, lint and all tests pass.

**Manual checks (if no CLI):**
- Dev server: a folder with `README.md`, `docs/guide.md` and images covering the matrix; check each row, the network log, and object-URL revocation when switching files; light and dark.
