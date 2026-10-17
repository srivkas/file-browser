# Exercise 12 — codebase-memory-mcp: a code graph as an MCP server

## Install — and what the installer really did
Installed v0.12.1 with the official one-liner (`curl … install.sh | bash`), after reading the
script first: it verifies a SHA-256 checksum and installs to `~/.local/bin`. Claude Code's auto
mode refused to pipe a downloaded script into bash itself, so I ran it with `!`.

The installer detected three AI tools and configured **all of them, user-wide**:

| Where | What it added |
|---|---|
| `~/.claude.json` | MCP server, with an absolute home-folder path |
| `~/.claude/settings.json` | 6 hooks: before every Grep/Glob/Bash, after every Read, on session start, on subagent start |
| `~/.claude/skills`, `~/.claude/agents` | a skill and 3 subagents |
| Codex, VS Code / Copilot | MCP entries, skills, agents, hooks |

Lesson: one install command quietly hooked into every tool call in every project. Hooks are
invisible when they succeed — always check what an installer touched.

## Moving it to project scope
- Removed everything above with the tool's own `codebase-memory-mcp uninstall` (previewed with
  `--dry-run` first), then restored the binary, which uninstall also deletes.
- Registered it in the project's `.mcp.json` by **command name**, not path:
  `"codebase-memory-mcp": { "command": "codebase-memory-mcp", "args": [] }` —
  `.mcp.json` is committed, and `/Users/<me>/...` exists only on my machine; the bare name works
  for anyone who has it on their PATH.
- Project scope means it loads only here, and needs a one-time approval (`/mcp`).

## Who calls `isImage`?
Fresh session: `index_repository` (226 nodes, 528 edges, no files skipped), then
`trace_path(function_name: "isImage", direction: "inbound", depth: 1)`:

- `src/lib/summary.ts` → `summarizeTree`
- `src/components/DetailPane.tsx` → `DetailPane`

Checked against `grep -rn isImage src`: exactly these two calls (`summary.ts:20`,
`DetailPane.tsx:25`) — the graph was right. My own guess beforehand (`ImageDetails` plus the
tests) was wrong: the tests never call `isImage`, and `DetailPane` calls it to decide whether to
render `ImageDetails`.

## Graph vs grep
grep finds every line containing the text — the import lines and the definition too — and you
work out the callers yourself. The graph answers the question directly, with the enclosing
function, and can go further (`depth: 2` = who calls the callers). For a project this small grep is
enough; the graph pays off in a large codebase, where reading the grep hits would cost a lot of
context.
