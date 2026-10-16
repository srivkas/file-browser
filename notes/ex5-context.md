# Exercise 5 — What's in the context window, and where it comes from

Fresh session in `file-browser`, model Opus 5.5 (1M-token window). Measured with `/context`
before sending anything, then after one message ("What does src/lib/summary.ts do?").

| Category | Before | After | Where it comes from |
|---|---|---|---|
| System prompt | 4.4k | 4.4k | Claude Code's built-in instructions, plus environment info (folder, git status, date) |
| System tools | 17k | 17.7k | Definitions of Claude Code's built-in tools — Read, Edit, Write, Bash, Agent, … |
| MCP tools | 599 | 0 | 30 tools from the claude.ai connectors (e.g. Claude Docs); only their names load — full definitions load on demand |
| MCP server instructions | 717 | 717 | Usage instructions sent by the claude.ai Claude Docs connector |
| Memory files | 67 | 67 | Auto-memory index `~/.claude/projects/<project>/memory/MEMORY.md` (no CLAUDE.md yet) |
| Skills | 5.9k | 5.9k | Name + description of 30 skills: built-in ones (code-review, simplify, …) and ones synced from claude.ai (docx, pptx, xlsx, pdf, …) |
| Messages | 10 | 15.9k | The conversation itself — my message, the files Claude read, its answer |
| Autocompact buffer | 33k | 33k | Reserved space so Claude Code can summarise the conversation before the window fills |
| **Total used** | **28.6k (3%)** | **44.6k (4%)** | |

## Biggest category
**System tools (17k)** — the built-in tool definitions. They're what let Claude read, edit and run
commands, so this is the price of being an agent rather than a chat.

## One thing I'd cut — and why it's safe
**Skills (5.9k):** many of the 30 are claude.ai document skills (Word, PowerPoint, Excel, PDF,
morning brief) that this project never uses. Turning them off for this project
(`"syncClaudeAiSkills": false` in `.claude/settings.local.json`) saves most of that on every turn.
Safe because it's local to this project and only hides skills — nothing is deleted, other projects
keep them, and setting it back restores them.

## What grew after one message — and why
**Messages: 10 → 15.9k.** Not my one-line question: Claude read `src/lib/summary.ts` (and what it
needed around it) to answer, and every file it reads, plus its reply, stays in the conversation.
Reading files is what costs context — the question itself is almost free.
System tools moved slightly (17k → 17.7k) and MCP tools dropped to 0: the tool list is loaded
on demand, so small shifts between these two are normal.

## Q: Why did MCP tools go from 599 → 0?
Most likely the tool names moved to another category rather than disappearing.
The 30 MCP tools are "loaded on-demand": only a short list of their names is loaded up front, so
Claude knows they exist and can load one when needed. Before the message that list was counted
under *MCP tools* (599 tokens); after it, *System tools* grew by ~700 tokens (17k → 17.7k) — about
the size of that list. The line "30 tools · 0 tokens" means the tools are still available, just no
longer counted there. `/context all` shows the detailed breakdown to confirm.
Takeaway: MCP tools you don't use cost almost nothing — only their names load — unlike skills
(descriptions always load) and memory files (loaded in full).
