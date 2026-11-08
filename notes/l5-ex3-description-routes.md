# Level 5, exercise 3: a description that routes

## The rewrite

`release-check`'s description now opens with when to use it and the words people really type, because the key use case has to come first (descriptions are cut at 1,536 characters). What it does comes next, and the closing line says what it is not for.

## Routing test

Each request ran in a fresh `claude -p` session on 2026-11-08, without naming the skill. `Bash`, `Edit`, `Write`, `NotebookEdit` and `Agent` were disallowed and turns were capped at 2, so the runs could not merge or push. They prove which skill loaded, not that the release check completes.

| Request | Skill loaded | Expected |
| --- | --- | --- |
| `תבדקי אם הענף מוכן לעלות לאוויר` | `release-check` | yes |
| `can we put this on the site?` | `release-check` | yes |
| `אפשר למזג ל־main?` | `release-check` | yes |
| `is it green?` (look-alike) | `check-status` | not `release-check` |

## Manual-only skill

`write-prompt` has `disable-model-invocation: true`. It was made manual-only before this exercise (`6f0625d`), so this exercise verifies it rather than changes it.

- Not in the model's listing: confirmed. The context cost in the table below is a dash, which the report defines as "not in the current listing, costs nothing". A fresh session also reported the skill missing from its listing, and a request matching its job did not load it.
- `/skills` still shows about 80 tokens beside it. That screen lists every installed skill, so the number does not mean the description is loaded.
- `/write-prompt` still runs when typed: confirmed by hand on 2026-11-08, after the table below was captured.

## `/skill-doctor`

The command now opens the Stats tab of the usage report. Numbers from 2026-11-08; "Context" is the skill's listing in the system prompt on every turn, and "7d tokens" is the tokens attributed to it over the last 7 days. The runs for `release-check` include the three routing tests above.

| Skill | Context | 7d tokens | Runs | Last used |
| --- | --- | --- | --- | --- |
| `release-check` | ~250 | 90.1k | 3 | today |
| `write-prompt` | none | none | 0 | never |
