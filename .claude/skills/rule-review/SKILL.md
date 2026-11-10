---
name: rule-review
description: Review named files against file-browser's project rules in a separate agent window, returning only the verdict. Run only when the user types /rule-review.
argument-hint: <file> [more files]
disable-model-invocation: true
context: fork
agent: rule-reviewer
---

Review these files against the project rules: $ARGUMENTS

If no files are named above, say so and stop.

1. Read each file in full.
2. Check it against the rules for its folder, plus the conventions in `CLAUDE.md`. For CSS, compare each color, size and spacing value with the tokens in `src/styles/tokens.css`. Only `1px` hairline borders may be literal.
3. Before reporting a violation, reopen the line and confirm that it says what you are about to report.

Change nothing. Return only the summary your agent instructions describe.
