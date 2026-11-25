export const meta = {
  name: 'component-strings',
  description: 'Find user-visible text written in src/components instead of src/lib/format.ts, then try to refute each finding',
  whenToUse: 'Checking the CLAUDE.md rule that display strings live only in src/lib/format.ts',
  phases: [
    { title: 'List', detail: 'one read-only agent lists the .tsx files' },
    { title: 'Check', detail: 'one read-only agent per file', model: 'haiku' },
    { title: 'Refute', detail: 'one skeptic per finding tries to show it is not a violation', model: 'sonnet' },
  ],
}

// Helpers (agent, pipeline, phase, log, args) come from the workflow runtime: this file imports nothing.
// Every agent is the Level 5 rule-reviewer, which has only Read, Grep and Glob, so none can edit.
const READ_ONLY = 'rule-reviewer'

const FILES = {
  type: 'object',
  properties: { files: { type: 'array', items: { type: 'string' } } },
  required: ['files'],
}

const FINDINGS = {
  type: 'object',
  properties: {
    violations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          line: { type: 'integer', minimum: 1 },
          text: { type: 'string', description: 'the hard-coded visible text, verbatim' },
        },
        required: ['line', 'text'],
      },
    },
  },
  required: ['violations'],
}

const VERDICT = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string', description: 'one sentence' },
  },
  required: ['refuted', 'reason'],
}

const checkPrompt = (file) => `Read ${file} and nothing else. Change nothing.
CLAUDE.md says display strings live only in src/lib/format.ts, never in components.
List every piece of user-visible text written directly in this component: JSX text, and string
attributes a user sees or hears (title, alt, aria-label, placeholder). Not violations: class names,
keys, data-* attributes, CSS, imports, comments, and values imported from src/lib/format.ts.
Return each violation with its 1-based line and the text verbatim; an empty list if none.`

const refutePrompt = (file, v) => `A reviewer claims ${file}:${v.line} breaks the CLAUDE.md rule that
display strings live only in src/lib/format.ts: the text "${v.text}" is written in the component.
Read the file around that line and try to refute the claim. It is refuted if the text is not shown to
or read out to a user (a key, a class name, a data-* attribute, an id), if it is only punctuation or
spacing between values, if it comes from src/lib/format.ts, or if it is not on that line.
If in doubt, it is not refuted. Change nothing.`

phase('List')
const listed = args?.files ?? (await agent(
  'List every .tsx file directly in src/components/ that is not a test file (*.test.tsx). Return paths relative to the repo root, like src/components/Foo.tsx. Change nothing.',
  { label: 'list files', phase: 'List', schema: FILES, model: 'haiku', agentType: READ_ONLY },
))?.files ?? []
log(`${listed.length} files to check`)

// pipeline, not parallel: a finding in one file needs nothing from the others, so each file goes on
// to its skeptics as soon as its own check is done.
const perFile = await pipeline(
  listed,
  (_, file) => agent(checkPrompt(file), { label: `check ${file.split('/').pop()}`, phase: 'Check', schema: FINDINGS, model: 'haiku', agentType: READ_ONLY }),
  async (found, file) => {
    const violations = found?.violations ?? []
    const verdicts = await parallel(violations.map((v) => () =>
      agent(refutePrompt(file, v), { label: `refute ${file.split('/').pop()}:${v.line}`, phase: 'Refute', schema: VERDICT, model: 'sonnet', agentType: READ_ONLY })))
    // The file comes from the script, never from what an agent says it read.
    return violations.map((v, i) => ({ where: `${file}:${v.line}`, text: v.text, verdict: verdicts[i] }))
  },
)

const missing = listed.filter((_, i) => perFile[i] === null)
const all = perFile.filter(Boolean).flat()
const row = (f) => `| ${f.where} | ${f.text.trim() || '(spaces)'} | ${f.verdict ? f.verdict.reason : 'no verdict: the skeptic failed'} |`
const confirmed = all.filter((f) => !f.verdict || !f.verdict.refuted)
const refuted = all.filter((f) => f.verdict && f.verdict.refuted)
log(`${confirmed.length} confirmed, ${refuted.length} refuted, ${missing.length} files not checked`)

return {
  checked: listed.length - missing.length,
  missing,
  report: [
    `## Confirmed (${confirmed.length})`, '', '| Where | Text | Why it stands |', '| --- | --- | --- |', ...confirmed.map(row),
    '', `## Refuted (${refuted.length})`, '', '| Where | Text | Why it was refuted |', '| --- | --- | --- |', ...refuted.map(row),
    '', `Files not checked: ${missing.length ? missing.join(', ') : 'none'}`,
  ].join('\n'),
}
