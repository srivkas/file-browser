# Addendum: Text & Markdown preview

Technical depth for the architecture and dev agents, kept out of the brief.

## Research digest: how existing tools render Markdown (2026-10-22)

Gathered by a web-research subagent; sizes from bundlephobia, versions from npm.

### The standard
- CommonMark (spec 0.31.x) is the base. GFM is a strict superset adding tables, task lists, strikethrough, extended autolinks, and a disallowed-raw-HTML filter. https://github.github.com/gfm/
- Footnotes and GitHub alerts (`> [!NOTE]`) are GitHub.com extras, not in the GFM spec.
- Users expect: headings, lists, fenced/indented code, links, images, emphasis, blockquotes, tables, task lists, strikethrough.

### How tools do it
- Conclusion: the brief's 1 MB cap matches the industry (GitHub ~2 MB, GitLab 1 MB).
- GitHub: rendered by default with a Code toggle; cmark-gfm then aggressive sanitization; relative links/images resolve against the branch; renders Markdown only for files under ~2 MB.
- VS Code: markdown-it; preview toggle or side by side; Strict security blocks scripts, https-only resources; relative images resolve from the file.
- GitLab: CommonMark + GFM + extensions; raw HTML allowlist; text files over 1 MB not rendered (per a GitLab issue).
- Obsidian: reading view vs source/live preview; some raw HTML allowed; sanitization undocumented.
- All tools show plain text raw, in monospace, with line numbers.

### Security
- Raw HTML in Markdown is an XSS vector (`<script>`, `<img onerror>`, `javascript:` URLs).
- Rendering through React elements (no `dangerouslySetInnerHTML`) prevents HTML injection, but URLs still need a protocol allowlist (http(s), mailto, relative); React only logs a warning for `javascript:` URLs and does not block them.
- Remote images would make network requests; block them or show a placeholder.

### Implementation options

| Option | Version (Oct 2026) | min / gzip | Output | Compliance |
|---|---|---|---|---|
| Hand-rolled subset parser | n/a | ~0 | React elements | partial, chosen subset |
| marked | 18.1.1, 0 deps | 46 KB / 13.8 KB | HTML string; needs DOMPurify (+11.5 KB gzip) | CommonMark ~100%, GFM 99% |
| markdown-it | 15.0.3, 6 deps | 98 KB / 40.8 KB | HTML string | 100% CommonMark |
| react-markdown + remark-gfm | 10.1.0 + 4.0.1 (last releases early 2025) | ~44 KB gzip combined, many transitive packages | React elements, safe by default | 100% CommonMark + GFM |
| micromark + gfm extension | 4.0.3 / 3.0.0 | not measured | HTML string | 100% CommonMark + GFM |

### Uncertain
- bundlephobia sizes may differ from the actual Vite build; micromark size unmeasured.
- New-tab link behaviour of these tools is undocumented (GitHub appears to open links in the same tab; unverified).

## Implementation note: `.ts` as text

- Treating `.ts` as text resolves the open decision recorded under "Known pitfalls" in `CLAUDE.md` (Chrome reports `.ts` as `video/mp2t`). When the story that makes `.ts` text is built, update that pitfall entry so it no longer says "ask before changing it".
