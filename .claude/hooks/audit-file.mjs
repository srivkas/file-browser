// The one place that knows where the agent audit log lives and how a line looks.
// Every line has the same fields, whichever hook writes it.
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const HEAD_LENGTH = 200;
const TAIL_LENGTH = 100;

/**
 * What a tool call acted on: the command, path or pattern, never file contents. A long command
 * keeps its start and its end, because the end is often where the check or the push is.
 */
export function target(input) {
  const tool = input ?? {};
  const text = tool.command ?? tool.file_path ?? tool.notebook_path ?? tool.pattern ?? tool.url ?? tool.description;
  const value = typeof text === 'string' ? text : Object.keys(tool).join(', ');
  if (value.length <= HEAD_LENGTH + TAIL_LENGTH) return value;
  return `${value.slice(0, HEAD_LENGTH)} … ${value.slice(-TAIL_LENGTH)}`;
}

/**
 * One log line. `outcome` is `ok`, `failed` or `blocked`; `reason` says why a call was blocked.
 * For an event that isn't a tool call, `tool` is null and `target` is what the event names, if anything.
 */
export function auditEntry(event, outcome, reason = null, now = new Date()) {
  const isToolCall = typeof event.tool_name === 'string';
  return {
    time: now.toISOString(),
    session: event.session_id ?? null,
    event: event.hook_event_name ?? null,
    tool: isToolCall ? event.tool_name : null,
    target: isToolCall ? target(event.tool_input) : (event.source ?? null),
    outcome,
    reason,
  };
}

/** Appends one JSON line to logs/agent-audit.jsonl under the project. Throws if it can't write. */
export function appendAudit(entry, event) {
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? '.';
  const folder = join(projectDir, 'logs');
  mkdirSync(folder, { recursive: true });
  appendFileSync(join(folder, 'agent-audit.jsonl'), `${JSON.stringify(entry)}\n`);
}
