# Deferred work

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-read-a-plain-text-file-with-line-numbers.md`
  summary: A 1 MB text file made of very short lines renders one row per line and can freeze the tab (~14 s for 1,048,576 blank lines).
  evidence: Measured in the dev server; a realistic 30,000-line 1 MB log takes ~0.6 s. Needs an owner decision (row cap with a message, or virtualization), since the UX asks for full natural height.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-read-a-plain-text-file-with-line-numbers.md`
  summary: Preview state messages use a `role="status"` element that mounts already filled, which some screen readers do not announce.
  evidence: Unverified (medium if true); settle with VoiceOver/NVDA. A reliable fix needs a persistent live region outside the keyed detail pane.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-read-a-plain-text-file-with-line-numbers.md`
  summary: Component behaviour (Loading, stale-read drop, read failure, no section for non-text files) has no automated test.
  evidence: The project has no DOM test environment; adding one needs an approved dependency. Rows were verified by hand.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-read-a-plain-text-file-with-line-numbers.md`
  summary: Pre-existing bug — `ModifiedDate` and `LineCount` in `DetailPane.tsx` are sibling elements with the same `key={node.path}`; React logs a duplicate-key error for every text file.
  evidence: Present at the baseline commit; reported, not fixed (outside the story).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-typescript-files-are-text.md`
  summary: The Type row still shows `video/mp2t` for TypeScript files that now show a Lines row and a text preview.
  evidence: `fileType()` in `src/lib/format.ts` prints the browser MIME type; the story only changed text detection. Needs an owner decision on what the Type row should say.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-read-markdown-formatted-safely.md`
  summary: A hostile Markdown file can freeze the tab while `marked.lexer` runs on the main thread (`"**a ".repeat(10000)`, 40 KB, takes ~8.5 s; 100 KB ~53 s).
  evidence: Measured with marked 18.1.1 in Node; a realistic 1 MB README lexes in ~144 ms. Owner chose to record it as a known risk (nothing runs, nothing leaves the page). A fix would parse in a Web Worker with a time budget and fall back to plain text — a separate story.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-read-markdown-formatted-safely.md`
  summary: `TextPreview` routing (Markdown plan → `MarkdownView`, read failure, stale read) still has no automated test.
  evidence: Rendering of `MarkdownView` is now covered with `renderToStaticMarkup`; `TextPreview` reads files in an effect, which static rendering cannot exercise without a DOM test environment (a new dependency).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-open-web-links-from-a-readme.md`
  summary: Web links are told apart from text by colour alone (no underline at rest), while inert links show a dotted underline — a dead link looks more link-like than a live one.
  evidence: DESIGN.md and the approved mock specify accent colour with underline on hover only; WCAG 1.4.1 asks for a non-colour cue (accent #0a64d8 vs text #1d1d1f is ~2.9:1, under the 3:1 that colour-only links need). Needs an owner/UX decision, e.g. a solid underline at rest.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-show-a-readme-s-own-images.md`
  summary: No automated test renders a found local image (`<img src="blob:…">`), checks object-URL revocation, or checks that `DetailPane` passes the tree path (`node.path`) down as `filePath`.
  evidence: Tests run in Node with static rendering, where effects never run; covering this needs a DOM test environment (jsdom or happy-dom), a new dependency that needs the owner's OK. Verified by hand in the dev server: images show via blob URLs and all created URLs were revoked on switching files.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-show-a-readme-s-own-images.md`
  summary: Local images have no size limit and no lazy loading; a README pointing at a very large image decodes it in full.
  evidence: Text previews are capped at 1 MB but images are not. Rare in READMEs; a size cap or `loading="lazy"` would need a product decision.
