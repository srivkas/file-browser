// In its own file so these tests, which each start npm, run in parallel with the other hook tests.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test } from 'vitest';

const STOP = join(import.meta.dirname, 'stop-check.mjs');

// Each test gets a tiny project whose check passes or fails by CHECK_EXIT, and can be made slow by CHECK_SLEEP_MS.
let projectDir = '';
beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'stop-'));
  const check =
    "node -e \"setTimeout(() => { console.error('FAIL tree order'); process.exit(Number(process.env.CHECK_EXIT ?? 0)); }, Number(process.env.CHECK_SLEEP_MS ?? 0))\"";
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ name: 'sample', scripts: { check } }));
  writeFileSync(join(projectDir, '.gitignore'), 'logs/\n');
  spawnSync('git', ['init', '-q'], { cwd: projectDir });
});
afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

// Runs the hook the way Claude Code does when Claude tries to end its turn.
function stop(active: boolean, env: Record<string, string> = {}) {
  const run = spawnSync('node', [STOP], {
    input: JSON.stringify({ session_id: 's1', hook_event_name: 'Stop', stop_hook_active: active }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir, ...env },
  });
  return { status: run.status, decision: run.stdout ? JSON.parse(run.stdout) : null };
}

const red = { CHECK_EXIT: '1' };

test('a green check lets the turn end', () => {
  expect(stop(false)).toEqual({ status: 0, decision: null });
});

test('a red check sends Claude back with the failure, twice, then lets the turn end', () => {
  const first = stop(false, red);
  expect(first.status).toBe(0);
  expect(first.decision).toMatchObject({ decision: 'block' });
  expect(first.decision.reason).toContain('block 1 of 2');
  expect(first.decision.reason).toContain('FAIL tree order');
  expect(stop(true, red).decision.reason).toContain('block 2 of 2');
  expect(stop(true, red).decision).toBeNull();
});

test('a new stop after the user answers starts the count again', () => {
  stop(false, red);
  stop(true, red);

  expect(stop(false, red).decision.reason).toContain('block 1 of 2');
});

test('nothing changed since the last green run: the check is skipped', () => {
  stop(false);

  // The check would fail now, but the files are as they were when it passed.
  expect(stop(false, red).decision).toBeNull();
  writeFileSync(join(projectDir, 'new.txt'), 'changed');
  expect(stop(false, red).decision).toMatchObject({ decision: 'block' });
});

test('a check that runs out of time lets the turn end', () => {
  expect(stop(false, { ...red, CHECK_SLEEP_MS: '1000', STOP_CHECK_TIMEOUT_MS: '200' }).decision).toBeNull();
});

test('bad input lets the turn end', () => {
  const run = spawnSync('node', [STOP], { input: 'not json', encoding: 'utf8' });
  expect(run.status).toBe(0);
  expect(run.stdout).toBe('');
});
