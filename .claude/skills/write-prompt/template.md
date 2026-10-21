# The 6 layers

Write the prompt as plain paragraphs in this order — the layer names are for you, not headings in the prompt.

| # | Layer | What goes in it | Keep in mind |
|---|---|---|---|
| 1 | **Role** | One line from the project's stack: "You're a developer on this <app> (<stack>)." | Short — Claude 5 doesn't need a persona. |
| 2 | **Context + reason** | What exists today (file names), and **why** the change matters — the user's situation, in their words. Project rules the task touches, each with its "because". | The reason is what lets Claude make good choices you didn't spell out. |
| 3 | **Task** | The goal in 1–2 sentences. | No steps — say what, not how. |
| 4 | **Scope & done** | "Done when:" bullets — observable behaviour, edge cases worth a test, things that must keep working — last bullet the runnable check. Then what's out of scope, "add no dependencies" if relevant, and "If you notice other bugs, list them in your report — don't fix them." | Each bullet must be checkable by looking at the app or running a command. |
| 5 | **Format** | What to report back: files changed, the check result, other bugs noticed (or "none found"). | Same ending every time, so reports are easy to compare. |
| 6 | **Examples** | Concrete input → output inside the Done-when bullets, e.g. `"READ" matches "readme.md"`, `"Lines 1,204"`. | Only when an exact format or behaviour matters. |

## Skeleton
```
You're a developer on <app> (<stack>).

<Today: what exists, file names.> <Why: the user's situation.>

<Task: the goal in 1–2 sentences.>

Done when:
- <behaviour, with an example if the format matters>
- <edge case / must keep working>
- <tests in … covering …>
- <the check command> is green.

<Rules this task touches: "Put X in Y because …".>

Scope: <what's in>. <What's out — and why if not obvious.> Add no dependencies. If you notice other bugs, list them in your report — don't fix them.

When you're done, report the files you changed, the <check> result, and the other bugs you noticed (or "none found").
```
