---
title: "Product Brief: Text & Markdown preview"
status: final
created: 2026-10-22
updated: 2026-10-22
---

# Product Brief: Text & Markdown preview

_A v2 epic for file-browser, the read-only, browser-only folder viewer._

## Executive Summary

file-browser lets a person open a folder on their own computer and explore it: a tree of files, and a detail pane showing each file's size, type, dates and, for text, its line count. Until now the app has described files without ever showing what is inside them. Selecting a README tells you it has 120 lines, but not what those lines say.

This epic adds a preview pane that shows the content of text files. Markdown files appear rendered, the way GitHub shows a README: headings, lists, tables, code blocks and task lists, not raw `#` and `*` marks. Every other text file, including JSON, JavaScript, TypeScript and other code, appears as plain text with a line number beside each line.

The preview keeps the app's promises: nothing in a file makes the app send a network request or run code, and the folder stays read-only. Files over 1 MB are not previewed.

## The Problem

A person opens a local folder, such as a project repository or a folder of notes, to see what is in it. The tree shows the structure and the detail pane shows each file's details. But to read a single README or note, they have to leave the app and open the file in an editor. The app can count a file's lines but cannot show them.

Markdown makes the gap sharper. It is written to be read rendered: a README that reads well on GitHub reads poorly as raw source, full of `#`, `|` and `- [ ]`. A plain text dump would be only half a fix.

The app exists for course practice, so this is a learning goal rather than a market need. The bar is a preview that behaves the way people already expect from GitHub, without breaking any of the app's privacy and read-only rules.

## The Solution

When the user selects a file the app recognises as text, the preview pane shows its content alongside the detail pane.

- **Markdown** is shown rendered only, styled to look like GitHub's rendering of a README. It covers the common Markdown everyone writes (headings, emphasis, lists, links, images, blockquotes, code blocks) plus the three GitHub additions people expect: tables, task lists and strikethrough. Raw HTML inside Markdown is shown as plain text.
- **Every other text file** is shown as raw text in a monospace font, with its line number beside each line; long lines wrap. This includes TypeScript (`.ts`) files, which today are not treated as text, so they also gain a line count in the detail pane. A file in an unexpected encoding is still shown, even if some characters look garbled.
- **While a file is being read**, the preview pane shows "Loading…".
- **A file larger than 1 MB** is not shown; the preview pane says "File too large to preview". Size, type, dates and line count still appear in the detail pane.
- **Images in Markdown** that point to a file inside the opened folder are shown. Images that point to the web, or that cannot be found, are replaced by a placeholder; the app never fetches them.
- **Links to web addresses** in Markdown open in a new tab, so clicking a link never takes the user away from the opened folder. Links to other files in the folder do nothing (see Scope).

## Who This Serves

Someone who has opened a local folder and wants to read a README or a note without switching to an editor.

## Success Criteria

1. A real README containing headings, lists, a table, a code block and a task list looks recognisably like GitHub's rendering of it.
2. A Markdown file containing a `<script>` tag, an event-handler attribute or a `javascript:` link runs no code when previewed or clicked.
3. Previewing any file, including Markdown that references images on the web, causes no network request.
4. A `.ts` file is shown as text with line numbers.
5. The four requirements written for this epic in EARS format (rendered Markdown, numbered plain text, "Loading…", "File too large to preview") each pass their stated test.
6. A Markdown image that points to a file in the folder is shown; a missing one shows a placeholder.
7. A web link in Markdown opens in a new tab, and the folder stays open.
8. The project's check command passes.

## Scope

**In:** everything described in The Solution.

**Out:**
- Syntax highlighting of code.
- A toggle between rendered Markdown and its source.
- Footnotes, GitHub alerts (`> [!NOTE]`) and other extensions beyond tables, task lists and strikethrough.
- Rendering raw HTML written inside Markdown.
- Previews for non-text files (PDF, audio, video); other epics cover those.
- Links from one Markdown file to another file in the folder (`[setup](docs/setup.md)`). Files in the opened folder have no web address a link could open, so these links do nothing for now.
- Editing or saving files.

## Constraints

- **No network.** Nothing in a previewed file may cause a request, including remote images.
- **No code from files.** Content is displayed, never executed.
- **Nothing stored.** No preview content outlives the tab.
- **Read-only.** The folder is opened read-only and no file is written.
- **Dependencies need approval.** Any new package must be approved by the product owner before it is added, because students read and trust every dependency.
- **Framework-free core.** The rules that decide what to show, and how, stay independent of the UI framework, like the rest of the app's core. This is a course rule for every epic.

## Known Risks

- **A video file named `.ts`.** MPEG transport-stream videos also use `.ts`. Treating `.ts` as text means such a video would show as garbled characters. Accepted: the product owner rarely opens these.
