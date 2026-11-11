#!/usr/bin/env node
// Stop hook: runs `npm run check` when Claude tries to end its turn, and sends it back to work
// while the check is red, with the failure as the reason. "Done" stops being Claude's opinion.
//
// It never traps the session: after MAX_BLOCKS blocks in a row it lets the turn end, so Claude
// stops and reports, as CLAUDE.md asks. A check that runs out of time, or any error in this hook,
// lets the turn end too. It skips the check when nothing changed since the last green run.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const MAX_BLOCKS = 2;
// Below the 10 seconds the hook is given in .claude/settings.json, so the hook can still answer.
const CHECK_TIMEOUT_MS = Number(process.env.STOP_CHECK_TIMEOUT_MS ?? 9000);
const OUTPUT_LINES = 40;

function git(projectDir, args) {
  const run = spawnSync('git', args, { cwd: projectDir, encoding: 'utf8' });
  return run.status === 0 ? run.stdout : '';
}

/** A hash of the working tree: the commit, the changes on top of it and the untracked files. */
export function fingerprint(projectDir) {
  const hash = createHash('sha256');
  hash.update(git(projectDir, ['rev-parse', 'HEAD']));
  hash.update(git(projectDir, ['diff', 'HEAD', '--binary']));
  for (const file of git(projectDir, ['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean)) {
    hash.update(file);
    try {
      hash.update(readFileSync(join(projectDir, file)));
    } catch {
      // A file that vanished between the listing and the read changes nothing here.
    }
  }
  return hash.digest('hex');
}

function readState(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function lastLines(text) {
  // eslint-disable-next-line no-control-regex -- removes the terminal's color codes
  const plain = text.replace(/\x1b\[[0-9;]*m/g, '');
  return plain.trimEnd().split('\n').slice(-OUTPUT_LINES).join('\n');
}

function main() {
  const event = JSON.parse(readFileSync(0, 'utf8'));
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? process.cwd();
  const stateFile = join(projectDir, 'logs', 'stop-check.json');
  const state = readState(stateFile);
  const save = () => {
    mkdirSync(join(projectDir, 'logs'), { recursive: true });
    writeFileSync(stateFile, JSON.stringify(state));
  };

  const current = fingerprint(projectDir);
  if (current === state.lastGreen) return;

  // A stop that doesn't follow one of our blocks starts the count again.
  const blocks = event.stop_hook_active ? (state.blocks ?? 0) : 0;
  const check = spawnSync('npm', ['run', 'check'], { cwd: projectDir, encoding: 'utf8', timeout: CHECK_TIMEOUT_MS });
  if (check.error) return;

  if (check.status === 0) {
    state.lastGreen = current;
    state.blocks = 0;
    save();
    return;
  }

  if (blocks >= MAX_BLOCKS) {
    state.blocks = 0;
    save();
    return;
  }

  state.blocks = blocks + 1;
  save();
  const reason = [
    `npm run check is red (block ${blocks + 1} of ${MAX_BLOCKS}). Fix it before you finish.`,
    'A red check is part of your task even when your own change didn’t cause it.',
    `If it is still red after ${MAX_BLOCKS} tries, stop and report what you tried.`,
    '',
    lastLines(`${check.stdout}\n${check.stderr}`),
  ].join('\n');
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
}

try {
  main();
} catch {
  // Any error in this hook lets the turn end: it must never trap the session.
}
