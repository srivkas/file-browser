#!/usr/bin/env node
// PreToolUse hook for Bash: blocks the commands this project must never run. Exit 2 blocks the
// command and sends the reason on stderr to Claude; exit 0 lets it run.
// It matches the usual form of a command: it stops mistakes, it is not a security boundary.
// A blocked call never runs, so no later hook sees it: the guard records it in the audit log itself.
import { readFileSync, writeSync } from 'node:fs';
import { isAbsolute, normalize } from 'node:path';
import process from 'node:process';
import { appendAudit, summary } from './audit-file.mjs';

// Each piece of a command line between ; && || | and newlines is checked on its own.
const SEPARATORS = /;|&&|\|\||\||\n/;
// Git options that take a value as the next word, before the subcommand.
const GIT_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);
const PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn']);

const REASONS = {
  forcePush: 'A forced git push can erase commits on GitHub. Use --force-with-lease, or ask the owner to push.',
  recursiveDelete:
    'A recursive delete of the home folder, the project root or anything outside the project is blocked. Delete a folder inside the project by its path, or ask the owner.',
  publish: 'Publishing a package is the owner’s decision. Ask the owner to publish.',
};

function words(piece) {
  // Quotes are dropped so that `bash -c "git push --force"` is still caught.
  return piece.replace(/["']/g, ' ').split(/\s+/).filter(Boolean);
}

/** The index of the first word after `start` that isn't an option. */
function subcommandIndex(list, start, optionsWithValue = new Set()) {
  let next = start;
  while (next < list.length && list[next].startsWith('-')) {
    next += optionsWithValue.has(list[next]) ? 2 : 1;
  }
  return next;
}

// Short flags can be combined, as in `-uf` or `-rf`.
const hasShortFlag = (word, letters) => /^-[a-zA-Z]+$/.test(word) && [...letters].some(letter => word.includes(letter));

function isForcePush(list, i) {
  const next = subcommandIndex(list, i + 1, GIT_OPTIONS_WITH_VALUE);
  if (list[next] !== 'push') return false;
  // A refspec that starts with + forces that one branch, like --force.
  return list.slice(next + 1).some(word => word === '--force' || hasShortFlag(word, 'f') || word.startsWith('+'));
}

/** Whether deleting `target` recursively could reach the home folder, the whole project or outside it. */
export function isDangerousTarget(target, projectDir) {
  if (target.startsWith('~') || target.includes('$HOME') || target.includes('${HOME}')) return true;
  if (target === '*' || target === './*') return true;
  const path = normalize(target).replace(/(.)\/+$/, '$1');
  if (isAbsolute(path)) return !(projectDir && path.startsWith(`${projectDir.replace(/\/+$/, '')}/`));
  return path === '.' || path === '..' || path.startsWith('../');
}

function isDangerousDelete(list, i, projectDir) {
  const rest = list.slice(i + 1);
  const flags = rest.filter(word => word.startsWith('-'));
  const isRecursive = flags.some(flag => flag === '--recursive' || hasShortFlag(flag, 'rR'));
  const targets = rest.filter(word => !word.startsWith('-'));
  return isRecursive && targets.some(target => isDangerousTarget(target, projectDir));
}

// Any later `publish` counts, so options with values (`--registry <url>`) can't hide it.
// The cost: a script named exactly `publish` (`npm run publish`) is blocked too.
function isPublish(list, i) {
  return list.slice(i + 1).includes('publish');
}

/** The reason a command is blocked, or null when it may run. */
export function blockReason(command, projectDir) {
  for (const piece of command.split(SEPARATORS)) {
    const list = words(piece);
    for (let i = 0; i < list.length; i++) {
      if (list[i] === 'git' && isForcePush(list, i)) return REASONS.forcePush;
      if (list[i] === 'rm' && isDangerousDelete(list, i, projectDir)) return REASONS.recursiveDelete;
      if (PACKAGE_MANAGERS.has(list[i]) && isPublish(list, i)) return REASONS.publish;
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
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd;
  const reason = blockReason(event.tool_input?.command ?? '', projectDir);
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
