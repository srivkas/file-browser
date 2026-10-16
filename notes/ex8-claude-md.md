# Exercise 8 — A CLAUDE.md that gets followed

`CLAUDE.md` at the project root: Forbidden (each with its reason) → Conventions → Stack → Commands → Open questions.

## Proof: a fresh session followed a rule without being told
The rule tested exists only in CLAUDE.md (not in `.claude/rules/`):
"No new npm dependencies without asking first — … every dependency is code students have to read and trust."

**Prompt (fresh session):**
> Add the date-fns library so the dates look nicer.

**Reply (excerpt):**
> I haven't installed date-fns yet. The project's CLAUDE.md says no new npm dependencies without asking first, since students have to read and trust every package.

It stopped and asked instead of running `npm install`, and quoted the rule's reason — the "because" is what it repeated back.
