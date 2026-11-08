// PreToolUse hook: a push to main deploys the live site, so the owner confirms each one.
import { readFileSync, writeSync } from 'node:fs';

const PUSH_TO_MAIN = /\bgit\b[^;&|\n]*\bpush\b[^;&|\n]*(?<![\w/-])main(?![\w/-])/;

let command = '';
try {
  command = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command ?? '';
} catch {
  // Unreadable input: stay out of the way and let the normal permission rules decide.
}

if (PUSH_TO_MAIN.test(command)) {
  const decision = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: 'A push to main deploys the live site to GitHub Pages.',
    },
  };
  writeSync(1, JSON.stringify(decision));
}
