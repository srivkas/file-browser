# Level 7, exercise 10: save it as a command, with a skeptic

## The saved workflow

`.claude/workflows/component-strings.js`, from the exercise 9 script.

- **Three named phases:** `List` (one agent lists the `.tsx` files), `Check` (one agent per file, `haiku`) and `Refute` (one skeptic per finding, `sonnet`). Every agent is `rule-reviewer`, the Level 5 read-only agent (Read, Grep, Glob).
- **A schema for each answer:** files, findings (line and text), verdict (refuted and a reason).
- **The skeptic stage is a `pipeline`, not a `parallel`.** The owner's call: a finding in one file needs nothing from the others, so each file goes to its skeptics as soon as its own check is done. In exercise 9, `FolderPicker` finished first and `DetailPane` last; with a barrier, the fast files would have waited for `DetailPane`.
- **Exercise 9's fixes:** the file in a finding comes from the script, never from what the agent says it read, so `missing` lists only files whose check really failed. The return value is a complete report, confirmed and refuted findings with their reasons, so it can be copied into the repo as it is.

`eslint.config.js` now declares the runtime's helpers (`agent`, `parallel`, `pipeline`, `phase`, `log`, `args`, `budget`, `workflow`) as globals for `.claude/workflows/**/*.js`. Without that the check failed with 9 `no-undef` errors. No rule changed.

## Not run: the feature was switched off

- A fresh session had no `Workflow` tool, no `workflow-authoring` skill, and answered `Unknown command: /workflows`.
- Asked to run the saved workflow by name, this session's tool replied: "Workflow is still listed for this conversation but is switched off in this session right now, so it cannot run." The workflow from exercise 9 had run in this same session earlier.
- `~/.claude.json` still shows `tengu_workflows_enabled: true` and `workflowGate: "on"`. The cause isn't known.

So two of the three "done when" items are open. To finish them when workflows are back:

1. Plant in `src/components/PlainTextView.tsx`, on the outer `div`: `aria-label="File contents"` (real: a screen reader reads it out) and `id="Plain-Text-View"` (a look-alike: an identifier nobody sees).
2. In a fresh session, type `/component-strings`. Check the three phases by name in `/workflows`.
3. Expect `aria-label` confirmed, and `id` refuted or not reported at all. Copy the report here, then remove the plants.

## Plain `node` fails

```
$ node .claude/workflows/component-strings.js
SyntaxError: Illegal return statement
return {
^^^^^^
```

Node fails while parsing, before running a line. A workflow file is not a program: it is the body of an async function that the Claude Code workflow runtime wraps around it. Inside that function, the final `return` hands back the result and a bare `await` is allowed; at a module's top level both are illegal. Fix the `return` and the next error is `ReferenceError: phase is not defined`: the file imports nothing, because the runtime injects `agent`, `pipeline`, `phase` and the rest. ESLint said the same thing, with `no-undef`.
