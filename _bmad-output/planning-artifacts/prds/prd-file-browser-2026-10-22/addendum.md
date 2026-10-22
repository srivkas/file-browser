# Addendum: Text & Markdown preview PRD

Technical depth for the architecture and dev agents, kept out of the PRD.

- **Text-file detection.** The Glossary's "list of text and code extensions" is the extension list the app already uses for line counts; the new `.ts` rule (FR-7) overrides the browser-reported type for that one extension.
- **Framework-free core.** Course rule for every epic: the logic that decides what and how to show stays independent of the UI framework, like the rest of the app's core.
- **Markdown rendering options and security research** live in the brief's addendum: `briefs/brief-file-browser-2026-10-22/addendum.md`. The choice between a library and a hand-written renderer is an architecture decision; NFR-5 requires owner approval for any new package.
- **`.ts` pitfall.** When FR-7 is built, update the matching entry under "Known pitfalls" in `CLAUDE.md`.
