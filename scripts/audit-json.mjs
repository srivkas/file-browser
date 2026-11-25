#!/usr/bin/env node
// A read-only audit of src/lib whose answer is data, not prose.
// Same rails as scripts/audit.mjs (read-only tools, no MCP, turn limit, dollar cap, JSON out),
// plus --json-schema: Claude Code validates the findings and puts them in `structured_output`.
// The script reads only that object; it never searches Claude's text for a word.
//
// Scope: only the rules src/lib keeps today (no network, no browser storage, no React), so a
// clean tree exits 0. The violations scripts/audit.mjs found are out of scope; see
// notes/l7-ex1-headless-json.md.
//
// Usage: node scripts/audit-json.mjs [maxTurns]
// Exit:  0 no findings · 1 findings · 2 the run did not finish (cut short, error, not read-only)
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const READ_ONLY_TOOLS = ['Glob', 'Grep', 'Read'];
const MAX_BUDGET_USD = 1;
const maxTurns = Number(process.argv[2] ?? 15);

const RULES = ['no-network', 'no-browser-storage', 'no-react'];

const SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string', description: 'Path from the repo root, e.g. src/lib/format.ts' },
          line: { type: 'integer', minimum: 1 },
          rule: { type: 'string', enum: RULES },
          why: { type: 'string' },
        },
        required: ['file', 'line', 'rule', 'why'],
        additionalProperties: false,
      },
    },
  },
  required: ['findings'],
  additionalProperties: false,
};

const PROMPT = `Audit every non-test file in src/lib/ against exactly three rules from CLAUDE.md and .claude/rules/lib-core.md:
- no-network: no fetch, XMLHttpRequest or WebSocket.
- no-browser-storage: no localStorage, sessionStorage or indexedDB.
- no-react: no import from react or react-dom, no JSX.
Report nothing else, even if you notice it. Change nothing.
Return every violation with its file, 1-based line and rule; return an empty list if there are none.`;

const args = [
  '-p', PROMPT,
  '--tools', READ_ONLY_TOOLS.join(','),
  '--strict-mcp-config',
  '--max-turns', String(maxTurns),
  '--max-budget-usd', String(MAX_BUDGET_USD),
  '--output-format', 'json',
  '--json-schema', JSON.stringify(SCHEMA),
  '--effort', 'high',
];

const out = (line) => process.stdout.write(`${line}\n`);
const run = spawnSync('claude', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

let messages;
try {
  const parsed = JSON.parse(run.stdout);
  messages = Array.isArray(parsed) ? parsed : [parsed];
} catch {
  out(`NOT FINISHED: claude did not return JSON (exit ${run.status}):\n${run.stderr || run.stdout}`);
  process.exit(2);
}

const init = messages.find((m) => m.type === 'system' && m.subtype === 'init');
const result = messages.find((m) => m.type === 'result');

// --json-schema adds one tool, StructuredOutput: it is how the model hands back the object,
// and it touches no file. Anything else on the list fails the read-only proof.
const ALLOWED_TOOLS = [...READ_ONLY_TOOLS, 'StructuredOutput'];
const tools = init?.tools ?? [];
const extra = tools.filter((t) => !ALLOWED_TOOLS.includes(t));
if (!init || extra.length > 0) {
  out(`NOT READ-ONLY: the run had ${init ? extra.join(', ') : 'an unknown tool list'}`);
  process.exit(2);
}

out(`Cost: $${(result?.total_cost_usd ?? 0).toFixed(4)} (cap $${MAX_BUDGET_USD}) · turn limit ${maxTurns} · ended ${result?.subtype ?? 'no result'}`);

// A capped or failed run has no structured_output: that is "unknown", never "clean".
if (result?.subtype !== 'success' || !Array.isArray(result.structured_output?.findings)) {
  const why = result?.errors?.join('; ') ?? result?.subtype ?? 'no result message';
  out(`CUT SHORT: the audit did not finish (${why}), so the tree was not checked.`);
  process.exit(2);
}

const { findings } = result.structured_output;
if (findings.length === 0) {
  out('CLEAN: no findings.');
  process.exit(0);
}

out(`FINDINGS: ${findings.length}`);
for (const f of findings) out(`${f.file}:${f.line}  ${f.rule}  ${f.why}`);
process.exit(1);
