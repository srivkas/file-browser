#!/usr/bin/env node
// A read-only audit of src/lib, run headless with four rails:
//   read-only tools  --tools Read,Grep,Glob, and --strict-mcp-config so no MCP server
//                    (claude.ai connectors included) adds tools that act
//   a turn limit     --max-turns
//   a dollar cap     --max-budget-usd
//   machine output   --output-format json
// Usage: node scripts/audit.mjs [effort] [model], e.g. `node scripts/audit.mjs low`.
// Effort defaults to high: in notes/l6-ex11-price-cap.md it found a real violation low missed.
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const READ_ONLY_TOOLS = ['Glob', 'Grep', 'Read'];
const MAX_TURNS = 15;
const MAX_BUDGET_USD = 1;

const PROMPT = `Audit every file in src/lib/ against the conventions in CLAUDE.md and .claude/rules/lib-core.md:
display strings only in src/lib/format.ts, no React or DOM in src/lib, no network calls or browser storage.
Change nothing. Reply with one line per violation as file:line - rule - why, or "No violations." if there are none.`;

const [effort = 'high', model] = process.argv.slice(2);
const args = [
  '-p', PROMPT,
  '--tools', READ_ONLY_TOOLS.join(','),
  '--strict-mcp-config',
  '--max-turns', String(MAX_TURNS),
  '--max-budget-usd', String(MAX_BUDGET_USD),
  '--output-format', 'json',
  '--effort', effort,
  ...(model ? ['--model', model] : []),
];

const run = spawnSync('claude', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const out = (line) => process.stdout.write(`${line}\n`);

let messages;
try {
  const parsed = JSON.parse(run.stdout);
  messages = Array.isArray(parsed) ? parsed : [parsed];
} catch {
  out(`claude did not return JSON (exit ${run.status}):\n${run.stderr || run.stdout}`);
  process.exit(1);
}

const init = messages.find((m) => m.type === 'system' && m.subtype === 'init');
const result = messages.find((m) => m.type === 'result');

// The proof that the agent could not have edited a file: the tools it was given.
const tools = init?.tools ?? [];
const extra = tools.filter((t) => !READ_ONLY_TOOLS.includes(t));
if (!init || extra.length > 0) {
  out(`NOT READ-ONLY: the run had ${init ? extra.join(', ') : 'an unknown tool list'}`);
  process.exit(1);
}

out(`Tools:  ${tools.join(', ')}`);
out(`Effort: ${effort}${model ? `, model ${model}` : ''}`);
out(`Cost:   $${(result?.total_cost_usd ?? 0).toFixed(4)} (cap $${MAX_BUDGET_USD})`);
// --max-turns counts model rounds. num_turns counts messages, and parallel tool calls in one
// round arrive as separate messages sharing an id, so count the distinct ids instead.
const rounds = new Set(messages.filter((m) => m.type === 'assistant').map((m) => m.message?.id)).size;
out(`Turns:  ${rounds} rounds (limit ${MAX_TURNS}); num_turns ${result?.num_turns ?? '?'}`);
out(`Ended:  ${result?.subtype ?? 'no result'}`);
out('');
out(result?.result ?? '(no result text: the run stopped at a rail)');
process.exit(result?.subtype === 'success' ? 0 : 1);
