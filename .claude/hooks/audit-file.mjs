// The one place that knows where the agent audit log lives and how a line looks.
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const SUMMARY_LENGTH = 200;

/** A short description of a tool call: the command, path or pattern it used, never file contents. */
export function summary(input) {
  const tool = input ?? {};
  const text = tool.command ?? tool.file_path ?? tool.notebook_path ?? tool.pattern ?? tool.url ?? tool.description;
  const value = typeof text === 'string' ? text : Object.keys(tool).join(', ');
  return value.length > SUMMARY_LENGTH ? `${value.slice(0, SUMMARY_LENGTH)}…` : value;
}

/** Appends one JSON line to logs/agent-audit.jsonl under the project. Throws if it can't write. */
export function appendAudit(entry, event) {
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? '.';
  const folder = join(projectDir, 'logs');
  mkdirSync(folder, { recursive: true });
  appendFileSync(join(folder, 'agent-audit.jsonl'), `${JSON.stringify(entry)}\n`);
}
