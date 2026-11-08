---
description: Audit one file against the project rules, focused on one topic. Read-only.
argument-hint: <file> <topic>
arguments: [file, topic]
allowed-tools: Bash(git status --short)
disable-model-invocation: true
---

Audit `$file` against this project's rules, focusing on: $topic.

Uncommitted changes right now:

!`git status --short`

Rules for `src/lib/`:

@.claude/rules/lib-core.md

Rules for `src/components/`:

@src/components/CLAUDE.md

Apply the rules for the folder `$file` is in, plus the conventions in the project CLAUDE.md. Read the file, and change nothing.

Report each violation of $topic as `file:line`, the rule it breaks, and one sentence on why. If `$file` has uncommitted changes in the list above, say that the audit covers the working copy. If there are no violations, say so plainly.
