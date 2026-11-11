#!/usr/bin/env node
// Audit hook for PostToolUse, PostToolUseFailure and SessionStart: records each tool call that ran,
// whether it worked, and each session that starts. It never blocks: any failure is ignored.
// Calls a guard blocked never run, so the guards record those themselves.
import { readFileSync } from 'node:fs';
import { appendAudit, auditEntry } from './audit-file.mjs';

/** Whether the call failed: the failure event, or an error in the tool's response. */
export function outcomeOf(event) {
  const response = event.tool_response;
  const isError = typeof response === 'object' && response !== null && response.is_error === true;
  return event.hook_event_name === 'PostToolUseFailure' || isError ? 'failed' : 'ok';
}

function main() {
  try {
    const event = JSON.parse(readFileSync(0, 'utf8'));
    appendAudit(auditEntry(event, outcomeOf(event)), event);
  } catch {
    // An audit failure must never stop Claude's work.
  }
}

main();
