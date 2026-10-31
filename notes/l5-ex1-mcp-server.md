# Level 5 · Exercise 1 — Your own MCP server

A small stdio MCP server for this repo: `mcp/file-browser-server.ts`, run with `node --experimental-strip-types` (Node 22.6+), registered in the project `.mcp.json`. Dependencies: `@modelcontextprotocol/sdk` 1.x and `zod`.

## The three primitives

| Primitive | Name | Who triggers it | What it does |
|---|---|---|---|
| Tool | `largest_files` | the model | The largest files in the repo with exact sizes, biggest first; optional `limit` (1–50) and `extension` |
| Resource | `file-browser://design-tokens` | the user, with `@file-browser:file-browser://design-tokens` | Every CSS variable in `src/styles/tokens.css` with its value |
| Prompt | `check_rules` | the user, as `/mcp__file-browser__check_rules <file>` | Reviews one file against `CLAUDE.md` and `.claude/rules/` |

All read-only: no writes, no programs, no network. The prompt refuses any path that resolves outside the project, symlinks included. Walks skip `.git`, `node_modules`, `dist`, `.agents/` and `.codex/`.

## Registration

```json
"file-browser": {
  "command": "node",
  "args": ["--experimental-strip-types", "mcp/file-browser-server.ts"],
  "env": { "FB_PROJECT_ROOT": "${FB_PROJECT_ROOT:-.}" }
}
```

`claude mcp get file-browser` reports `Scope: Project config (shared via .mcp.json)`. The one setting, the project root, comes from an environment variable with a default; nothing secret is in `.mcp.json`.

## Bad input is rejected by the schema

Checked with an MCP client over stdio — each was refused with `-32602 Input validation error` before the handler ran:

- `largest_files { limit: 0 }` — "expected number to be >=1"
- `largest_files { limit: "ten" }` — "expected number, received string"
- `largest_files { extension: ".md" }` — "An extension without the dot, like md or ts."
- `check_rules { file: "" }` — "expected string to have >=1 characters"

## What it took for Claude to call the tool on its own

1. **First try:** asked "what are the biggest markdown files in the repo?" — Claude searched and ran shell commands instead.
2. **Sharper tool description** (what, when, the words people type, "instead of ls, du or find") — no change.
3. **Server instructions** — Claude called `largest_files`.

Why: with many MCP tools connected (`codebase-memory-mcp` alone brings 17), Claude Code defers them — the model sees only tool names until it searches for one, so a tool's description isn't in front of it when it decides. A server's `instructions` always sit in the system prompt. So a server needs three layers: a clear tool name, instructions that say when to come to this server, and a tool description for once it's loaded.

## Gaps

- `npm run check`'s typecheck covers only `src/`; the server is linted but not type-checked (that would need `@types/node`).
