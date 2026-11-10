// PreToolUse hook for Bash: blocks a forced git push, which can erase commits on GitHub.
// Exit 2 blocks the command and sends the message on stderr to Claude; exit 0 lets it run.
// A blocked call never runs, so no later hook sees it: the guard records it in the audit log itself.
import { readFileSync, writeSync } from 'node:fs';
import process from 'node:process';
import { appendAudit, summary } from './audit-file.mjs';

// Each piece of a command line between ; && || | and newlines is checked on its own.
const SEPARATORS = /;|&&|\|\||\||\n/;
// Git options that take a value as the next word, before the subcommand.
const GIT_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

function words(piece) {
  // Quotes are dropped so that `bash -c "git push --force"` is still caught.
  return piece.replace(/["']/g, ' ').split(/\s+/).filter(Boolean);
}

function isForceFlag(word) {
  if (word === '--force') return true;
  // Short flags can be combined, as in `-uf`.
  return /^-[a-zA-Z]+$/.test(word) && word.includes('f');
}

/** The reason a command is blocked, or null when it may run. */
export function blockReason(command) {
  for (const piece of command.split(SEPARATORS)) {
    const list = words(piece);
    for (let i = 0; i < list.length; i++) {
      if (list[i] !== 'git') continue;
      let next = i + 1;
      while (next < list.length && list[next].startsWith('-')) {
        next += GIT_OPTIONS_WITH_VALUE.has(list[next]) ? 2 : 1;
      }
      if (list[next] !== 'push') continue;
      const rest = list.slice(next + 1);
      // A refspec that starts with + forces that one branch, like --force.
      if (rest.some(word => isForceFlag(word) || word.startsWith('+'))) {
        return 'A forced git push can erase commits on GitHub. Use --force-with-lease, or ask the owner to push.';
      }
    }
  }
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
  const reason = blockReason(event.tool_input?.command ?? '');
  if (!reason) return;

  writeSync(2, `${reason}\n`);
  process.exitCode = 2;
  try {
    const entry = {
      time: new Date().toISOString(),
      session: event.session_id,
      tool: event.tool_name,
      summary: summary(event.tool_input),
      blocked: reason,
    };
    appendAudit(entry, event);
  } catch {
    // The block stands even if the log can't be written.
  }
}

main();
