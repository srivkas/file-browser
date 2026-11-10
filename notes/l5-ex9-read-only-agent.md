# Level 5, exercise 9: a read-only agent

## The agent

`.claude/agents/rule-reviewer.md` reviews named files or a pasted diff against the project rules.

- `tools: Read, Grep, Glob`: it has nothing that edits a file or runs a command, so the tool list is the policy.
- `model: sonnet` and `effort: medium`: checking code against written rules doesn't need the strongest model or the highest effort.

## Test

On 2026-11-09 a hard-coded color was planted at the end of `src/styles/app.css`. The owner delegated the file to the agent and then asked it to fix the violation, and reported that both steps worked as expected. The plant was then reverted.
