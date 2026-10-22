---
name: file-browser — Text & Markdown preview
description: Visual layer for the preview inside the detail pane. Extends the app's existing tokens in src/styles/tokens.css; only the new tokens are additions.
status: final
updated: 2026-10-22
sources:
  - ../../prds/prd-file-browser-2026-10-22/prd.md
  - ../../briefs/brief-file-browser-2026-10-22/brief.md
  - ../../../../src/styles/tokens.css
colors:
  # Existing tokens, unchanged. CSS name in comments.
  bg: '#ffffff'                # --color-bg
  sidebar: '#f5f5f7'           # --color-sidebar
  border: '#d8d8dc'            # --color-border
  text: '#1d1d1f'              # --color-text
  muted: '#6e6e73'             # --color-muted
  accent: '#0a64d8'            # --color-accent
  bg-dark: '#1e1e1e'
  sidebar-dark: '#262628'
  border-dark: '#3a3a3c'
  text-dark: '#f2f2f7'
  muted-dark: '#98989d'
  accent-dark: '#0a84ff'
typography:
  # Existing: --font-sans, --font-size-sm 12px, --font-size-md 13px, --font-size-lg 16px.
  # New: --font-mono, --font-size-xl, --line-height-read.
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'  # --font-sans
    fontSize: 13px
    lineHeight: '1.5'
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: 12px
    lineHeight: '1.5'
  md-h1:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'  # --font-sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.25'
  md-h2:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'  # --font-sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.25'
  md-h3:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'  # --font-sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.25'
rounded:
  DEFAULT: 6px                 # --radius, existing
spacing:
  # Existing --space-1..4 (4, 8, 12, 16). New: --reading-max-width.
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  reading-max-width: 720px
components:
  preview-section:
    title: 'existing .section-title style'
    divider: '1px solid {colors.border}'
    gap-above: '{spacing.4}'
  line-gutter:
    background: '{colors.sidebar}'
    foreground: '{colors.muted}'
    border-right: '1px solid {colors.border}'
    padding-x: '{spacing.2}'
    font: '{typography.mono}'
  plain-text-body:
    background: '{colors.bg}'
    foreground: '{colors.text}'
    font: '{typography.mono}'
    border: '1px solid {colors.border}'
    radius: '{rounded.DEFAULT}'
  md-code-block:
    background: '{colors.sidebar}'
    font: '{typography.mono}'
    padding: '{spacing.3}'
    radius: '{rounded.DEFAULT}'
  md-inline-code:
    background: '{colors.sidebar}'
    font: '{typography.mono}'
    padding-x: '{spacing.1}'
    radius: '{rounded.DEFAULT}'
  md-blockquote:
    border-left: '{spacing.1} solid {colors.border}'
    foreground: '{colors.muted}'
    padding-x: '{spacing.3}'
  md-table-cell:
    border: '1px solid {colors.border}'
    padding: '{spacing.1} {spacing.2}'
    header-background: '{colors.sidebar}'
  md-web-link:
    foreground: '{colors.accent}'
  md-inert-link:
    foreground: '{colors.text}'
    decoration: 'dotted underline, {colors.muted}'
  image-placeholder:
    border: '1px dashed {colors.border}'
    foreground: '{colors.muted}'
    padding: '{spacing.2} {spacing.3}'
    radius: '{rounded.DEFAULT}'
  state-message:
    foreground: '{colors.muted}'
    font: '{typography.body}'
---

## Brand & Style

The preview is a quiet reading surface inside a native-feeling desktop tool. It looks like the rest of file-browser — system fonts, grey hairlines, one blue accent — not like GitHub. Markdown reads like GitHub in *form* (a heading is a heading, a table is a table) but not in fonts, sizes or colours (PRD SM-C1). Nothing in the preview is decorative; content is the only thing that draws the eye.

## Colors

No new colours. The preview reuses the existing tokens, with their dark-mode values from `prefers-color-scheme`.

- **`{colors.text}`** — all file content.
- **`{colors.muted}`** — line numbers, state messages ("Loading…"), blockquote text, image-placeholder text, the dotted underline of inert links.
- **`{colors.sidebar}`** — quiet fills: the line-number gutter, Markdown code blocks and inline code, table header row.
- **`{colors.border}`** — hairlines: section divider, plain-text frame, table cells, blockquote bar, placeholder outline.
- **`{colors.accent}`** — only web links, and the tick of task-list checkboxes. Never used for anything that cannot be clicked.

## Typography

- **Body** (`{typography.body}`) — rendered Markdown paragraphs and lists, state messages. The app's existing 13px with a looser reading line height (new `--line-height-read: 1.5`).
- **Mono** (`{typography.mono}`) — the plain text view, its line numbers, Markdown code blocks and inline code. New token `--font-mono` (system monospace stack, no web font — nothing is fetched).
- **Markdown headings** — `md-h1` 20px (new `--font-size-xl`), `md-h2` 16px (existing `--font-size-lg`), `md-h3` to `h6` 13px semibold. `h1` and `h2` get a hairline underline, as on GitHub, so the document's structure shows at a glance.

## Layout & Spacing

- The preview sits in the detail pane below the details list (and below nothing else — non-text files have no preview). Section title "Preview" in the existing `.section-title` style, with `{spacing.4}` above.
- **Full natural height.** The preview grows to the file's full length; the whole detail pane scrolls. No inner scroll box, no `--preview-max-height` cap.
- **Rendered view** is capped at `{spacing.reading-max-width}` (720px, new token) so lines stay readable on a wide window.
- **Plain text view** uses the full pane width; long lines wrap (PRD FR-1).
- Markdown block spacing: `{spacing.3}` between blocks, `{spacing.4}` above headings.

## Shapes

One radius, the existing `{rounded.DEFAULT}` (6px), on the plain-text frame, code blocks, inline code and image placeholder. Tables and blockquotes have square corners.

## Components

- **Plain text view** — a framed box (`plain-text-body`) with a left gutter (`line-gutter`). Numbers right-aligned; the gutter is as wide as the largest number. A wrapped line shows its number only on its first row. See [mockup](mockups/key-preview.html).
- **Rendered Markdown** — headings, paragraphs, lists, blockquote (`md-blockquote`), code block (`md-code-block`, no colour highlighting, long lines wrap), inline code, horizontal rule (hairline), table (`md-table-cell`; a table wider than the pane scrolls sideways inside its own wrapper — the only sideways scroll), task-list checkbox (native checkbox, disabled, tick in `{colors.accent}`), strikethrough.
- **Web link** (`md-web-link`) — accent colour, underline on hover.
- **Inert link** (`md-inert-link`) — any link that is not a web link (file path, `#heading`, `mailto:`, `javascript:`). Text colour with a muted dotted underline and the default cursor, so it reads as "a reference" without promising an action.
- **Image placeholder** (`image-placeholder`) — dashed hairline box, inline-block, muted text: the image's alt text, or "Image" when it has none.
- **Local image** — shown at natural size, never wider than the reading width.
- **State message** (`state-message`) — one muted line in place of the content: "Loading…", "File too large to preview", "Empty file".

## Do's and Don'ts

| Do | Don't |
|---|---|
| Reuse the existing tokens; add only `--font-mono`, `--font-size-xl`, `--line-height-read`, `--reading-max-width` | Copy GitHub's fonts, colours or sizes |
| Keep accent for clickable web links only | Colour inert links or placeholders with accent |
| Let the detail pane scroll the whole preview | Nest a scroll box inside the pane (tables excepted) |
| Use system font stacks | Load a web font or any remote asset |
| 1px hairlines for every border | Shadows or elevation |
