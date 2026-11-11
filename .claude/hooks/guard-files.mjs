#!/usr/bin/env node
// PreToolUse hook for the tools that edit and write: denies writes to secrets and to the build
// output. It answers in JSON on stdout and always exits 0. `.claude/settings.json` was protected
// too, until the owner chose to let Claude wire the hooks instead of pasting each change by hand.
// It sees only the edit tools: a shell command that writes a file goes past it.
import { readFileSync, writeSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import process from 'node:process';
import { appendAudit, auditEntry } from './audit-file.mjs';

const REASONS = {
  env: 'Files named .env* hold secrets. Ask the owner to change them.',
  build: 'dist/ is build output: change the source and run the build instead.',
};

/** The reason a write to `filePath` is denied, or null when it may go ahead. */
export function denyReason(filePath, projectDir) {
  if (typeof filePath !== 'string' || filePath === '') return null;
  // macOS ignores case, so `.ENV` or `Dist/` is the same file.
  const name = basename(filePath).toLowerCase();
  const path = relative(projectDir, resolve(projectDir, filePath)).toLowerCase();
  if (name.startsWith('.env')) return REASONS.env;
  if (path === 'dist' || path.startsWith('dist/')) return REASONS.build;
  return null;
}

function main() {
  let event;
  try {
    event = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    // Unreadable input: let the normal permission rules decide.
    return;
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? process.cwd();
  const input = event.tool_input ?? {};
  const reason = denyReason(input.file_path ?? input.notebook_path, projectDir);
  if (!reason) return;

  const decision = {
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  };
  writeSync(1, JSON.stringify(decision));
  try {
    appendAudit(auditEntry(event, 'blocked', reason), event);
  } catch {
    // The denial stands even if the log can't be written.
  }
}

main();
