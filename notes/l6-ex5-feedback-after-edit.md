# Level 6, exercise 5: feedback after every edit

## The rule

No hard-coded colors, sizes or spacing in CSS: only the variables in `src/styles/tokens.css`, and `1px` for hairline borders. ESLint doesn't read CSS, so before this hook only `/rule-review` found a break, and only when asked.

## The hook

`.claude/hooks/check-css-tokens.mjs` runs after `Edit` and `Write`, with `"timeout": 10` in `.claude/settings.json`. It leaves at once when the file isn't CSS, or is `tokens.css` itself, so most edits cost almost nothing. In a CSS file it reads only declaration values, so a selector like `#fab` isn't taken for a color, and it ignores comments. It reports each hex color, `rgb()`, `hsl()` or similar, and each `px`, `rem` or `em` length except `1px`, with the file, the line and the property, then exits 2.

The owner wired it into `.claude/settings.json` by hand, because exercise 4 protects that file from Claude.

## Why it didn't prevent the edit

A `PostToolUse` hook runs after the tool. The edit is already on disk, so exit 2 is feedback to Claude, not a block. That is fine here: a hard-coded color does no harm while Claude is still working, as long as it is fixed before the turn ends. Blocking it beforehand would need the hook to guess the result of an edit it hasn't seen yet.

## Checked

- Samples `samples/css/breaks-rule.css` and `samples/css/respects-rule.css`: the first returns four findings with their lines and exits 2, the second stays silent. The real `app.css` is silent too. `npm run check`: 223 tests pass.
- In a live session on 2026-11-10: Claude added `.css-hook-test { color: #ff0000; }` to `app.css`, got back `app.css:212: color uses #ff0000`, replaced it with `var(--color-accent)` in the same turn, and the hook stayed silent. The test rule was then removed.

## Known gap

Like the file guard, it sees only the edit tools. A CSS change made through the shell isn't checked, and `npm run check` doesn't read CSS either.
