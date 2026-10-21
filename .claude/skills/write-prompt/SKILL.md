---
name: write-prompt
description: Turn a rough feature idea into a complete development prompt (6 layers, the 7 techniques where they fit, Claude 5 wording), asking the user only what the project can't tell. Run only when the user types /write-prompt.
argument-hint: <rough idea, e.g. "add a search box to the tree">
disable-model-invocation: true
---

# Write a prompt

The user's rough idea: **$ARGUMENTS**

Your job is to coach, not just generate: produce a prompt the user can run, and show them how it was built so they learn the method. **Never run the prompt and never change code** — the output is a prompt file.

## 1. Read the project first
Before asking anything, read what the project already tells you, so you only ask what only the user knows:
- `CLAUDE.md` (and any nested ones near the files involved): stack, forbidden things, conventions, the check command.
- The code the idea touches — what exists today, what could break (e.g. existing behaviour the change must keep working).
- Earlier prompts in `prompts/` for tone and conventions.

Note anything the user didn't mention but the prompt needs: features that must keep working, tricky edge cases worth a test.

## 2. Ask what only the user knows
Ask at most 3 questions, usually:
1. **Why** — the situation where they'd use this (goes into Context + reason).
2. **What "done" looks like** — the behaviour that is ambiguous from the idea alone.
3. **What's out of scope.**

Put a suggested answer under each question, based on what you read:
```
2. Filter the tree or highlight matches?
   Suggested: filter, name only — reply "ok" or change it.
```
Then **stop and wait**. If the user answers only some questions, ask again about the rest, still with the suggestion. Never treat an unanswered question as accepted, and don't write the prompt until every question has an answer.

## 3. Fill the 6 layers
Use the structure in [template.md](template.md): Role · Context + reason · Task · Scope & done · Format · Examples.

## 4. Apply the 7 techniques — only where they fit
Go through [checklist.md](checklist.md). Each technique has a "when"; skip the ones that don't apply and remember why, for the table in step 6.

## 5. Check the wording (Claude 5 style)
- Goal + "Done when", not a list of steps.
- No CRITICAL / MUST / ALWAYS — every constraint is "do X because …".
- The last "Done when" item is a check Claude can run (e.g. `npm run check`).
- Scope says what's out, and ends with "If you notice other bugs, list them — don't fix them."
- No "think step by step" — effort is a run setting (step 6).

[example.md](example.md) is a finished prompt that passes every check — match its level of detail.

## 6. Show the result
Reply with, in this order:
1. **The prompt** in a code block.
2. **Recommended run:** `--effort low | medium | high` and one line on why.
3. **Where each part came from** — a table: part of the prompt · layer · technique · source (read from the project / the user's answer to question N / added by the skill).
4. **Techniques skipped** and why, one line each.
5. **What reading the project added** — things the user didn't mention, one line each.

## 7. Save it
Ask: "Save as `prompts/<subject>.md`?" (suggest a short kebab-case subject, e.g. `search-filter`). Save only after the user agrees. Start the file with a heading and the recommended effort, then a `---` line, then the prompt — the same shape as the files already in `prompts/`.
