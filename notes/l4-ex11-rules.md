# Level 4 · Exercise 11 — Three mistakes that happen only once

Rules codified from the epic 1 retrospective (`epic-1-retro-2026-10-22.md`), committed in `5ab81eb`.

| Rule | File | Retro item | Enforced by the check |
|---|---|---|---|
| Every story is coded by a fresh subagent, from its approved spec | `.claude/rules/bmad-stories.md` | 5 | no |
| Markdown from a file never becomes HTML | `.claude/rules/markdown-safety.md` | 3 | **yes** — ESLint bans HTML sinks and any `marked` API but the lexer |
| Tests reach an error path by mocking, not by provoking the runtime | `.claude/rules/lib-core.md` | 2 | no |

Each rule carries a date, the reason (the commit or retro finding it came from) and a Bad / Good example.

## Not turned into rules

- Items 1, 4 and 8 are code or document tasks, not rules — they stay open in the retro.
- Item 6 (a DOM test environment) needs a new dev dependency — the owner deferred it.
- Item 7 (list every new design token in the spec) was dropped: BMAD's spec already handles gaps (Open Questions at planning, Implementation Notes during the build, `intent_gap` at review), `CLAUDE.md` already bans hard-coded CSS values, and the 1.3 "invented" token came straight from DESIGN.md. A rule that prevents no real mistake only costs tokens every session.

## Proof that a fresh agent follows a rule unprompted

The mocking rule was tested because no check catches it. A fresh subagent, told nothing about the rule, got only:

> Add a test that parseMarkdown returns null when marked fails to parse the input.

`markdown.test.ts` already held the bad pattern (`'>'.repeat(2000)`), so copying it was the easy path. The subagent mocked instead. Its reply (excerpt):

> - **Mocked failure, not odd input.** `.claude/rules/lib-core.md` says error paths are reached by making the dependency throw. Input built to break the lexer depends on stack size, library version and machine.
> - **Module mock instead of `vi.spyOn(marked, 'lexer')`.** That rule file's own example uses a spy, but a spy means importing `marked` in the test. ESLint's `no-restricted-imports` rule blocks that ("Only src/lib/markdown.ts may import marked"), and my first try failed lint on exactly that. `vi.doMock('marked', ...)` plus a fresh `import('./markdown')` gets the same deterministic throw without importing `marked` and without touching the lint config.
> - **Checked that it really tests the catch.** I briefly changed the catch to return `[]`: the new test failed, then I restored `markdown.ts`.
>
> The existing test "gives null when the input is too deeply nested to parse" in the same file (`'>'.repeat(2000)`) is exactly the stack-depth test the lib-core rule calls bad. Following CLAUDE.md I only reported it and did not remove it.

## What the test taught us about the rule

The rule's own Good example (`vi.spyOn(marked, 'lexer')`) contradicted the ESLint rule that keeps `marked` inside `markdown.ts`. The subagent found that out by failing lint, and its module-mock version is now the rule's Good example — so the next agent doesn't fail the same way.

The old stack-depth test is still in `markdown.test.ts`; the new test covers the same fallback, so it can go in a follow-up.
