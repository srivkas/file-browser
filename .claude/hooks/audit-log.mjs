#!/usr/bin/env node
// PostToolUse and PostToolUseFailure hook: records each tool call that ran, and whether it worked.
// It never blocks: any failure is ignored. Calls the guard blocked are recorded by guard-bash.mjs.
import { readFileSync } from 'node:fs';
import { appendAudit, summary } from './audit-file.mjs';

/** The log line for one hook input. */
export function auditEntry(event, now) {
  const response = event.tool_response;
  const isError = typeof response === 'object' && response !== null && response.is_error === true;
  return {
    time: now.toISOString(),
    session: event.session_id,
    tool: event.tool_name,
    summary: summary(event.tool_input),
    ok: event.hook_event_name !== 'PostToolUseFailure' && !isError,
  };
}

function main() {
  try {
    const event = JSON.parse(readFileSync(0, 'utf8'));
    appendAudit(auditEntry(event, new Date()), event);
  } catch {
    // An audit failure must never stop Claude's work.
  }
}

main();
