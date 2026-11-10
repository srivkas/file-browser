#!/usr/bin/env node
// PreToolUse hook for the tools that edit and write: denies writes to secrets, to the harness's
// own settings and to the build output. It answers in JSON on stdout and always exits 0.
// It sees only the edit tools: a shell command that writes a file goes past it.
import { readFileSync, writeSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import process from 'node:process';
import { appendAudit, summary } from './audit-file.mjs';

const REASONS = {
  env: 'Files named .env* hold secrets. Ask the owner to change them.',
  settings: 'The harness protects its own settings, so Claude cannot remove its limits. Ask the owner to edit .claude/settings.json.',
  build: 'dist/ is build output: change the source and run the build instead.',
};

/** The reason a write to `filePath` is denied, or null when it may go ahead. */
export function denyReason(filePath, projectDir) {
  if (typeof filePath !== 'string' || filePath === '') return null;
  // macOS ignores case, so `.Claude/Settings.json` is the same file.
  const name = basename(filePath).toLowerCase();
  const path = relative(projectDir, resolve(projectDir, filePath)).toLowerCase();
  if (name.startsWith('.env')) return REASONS.env;
  if (path === '.claude/settings.json') return REASONS.settings;
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
    const entry = {
      time: new Date().toISOString(),
      session: event.session_id,
      tool: event.tool_name,
      summary: summary(input),
      blocked: reason,
    };
    appendAudit(entry, event);
  } catch {
    // The denial stands even if the log can't be written.
  }
}

main();
