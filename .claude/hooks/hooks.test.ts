import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import samples from './samples/guard-bash.json';
import fileSamples from './samples/guard-files.json';

const GUARD = join(import.meta.dirname, 'guard-bash.mjs');
const AUDIT = join(import.meta.dirname, 'audit-log.mjs');
const FILES = join(import.meta.dirname, 'guard-files.mjs');

// Every test gets its own project folder, so no test writes a log into the repo.
let projectDir = '';
beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'hooks-'));
});
afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

// Runs a hook the way Claude Code does: the event as JSON on stdin.
function runHook(script: string, input: unknown) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  return spawnSync('node', [script], {
    input: text,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
}

function logLines() {
  const file = join(projectDir, 'logs', 'agent-audit.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as Record<string, unknown>);
}

const bash = (command: string) => ({
  session_id: 's1',
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command },
});

describe('guard-bash', () => {
  test.each(samples)('$expect: $command', ({ command, expect: expected, reason }) => {
    const run = runHook(GUARD, bash(command));

    expect(run.status).toBe(expected === 'block' ? 2 : 0);
    if (expected === 'block') expect(run.stderr).toContain(reason);
    else expect(run.stderr).toBe('');
  });

  test('a recursive delete inside the project is allowed, and of the project itself is blocked', () => {
    expect(runHook(GUARD, bash(`rm -rf ${projectDir}/dist`)).status).toBe(0);
    expect(runHook(GUARD, bash(`rm -rf ${projectDir}`)).status).toBe(2);
    expect(runHook(GUARD, bash(`rm -rf ${projectDir}-other/dist`)).status).toBe(2);
  });

  test('a block is recorded in the audit log with its reason', () => {
    runHook(GUARD, bash('git push --force'));

    const lines = logLines();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ session: 's1', tool: 'Bash', summary: 'git push --force' });
    expect(lines[0]?.blocked).toMatch(/forced git push/);
  });

  test('an allowed command writes nothing to the log', () => {
    runHook(GUARD, bash('git push'));

    expect(logLines()).toHaveLength(0);
  });

  test('unreadable input is let through', () => {
    expect(runHook(GUARD, 'not json').status).toBe(0);
  });
});

describe('guard-files', () => {
  const write = (file_path: string) => ({
    session_id: 's1',
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: { file_path: join(projectDir, file_path), content: 'x' },
  });

  test.each(fileSamples)('$expect: $file_path', ({ file_path, expect: expected, reason }) => {
    const run = runHook(FILES, write(file_path));

    expect(run.status).toBe(0);
    if (expected === 'deny') {
      const output = JSON.parse(run.stdout).hookSpecificOutput;
      expect(output).toMatchObject({ hookEventName: 'PreToolUse', permissionDecision: 'deny' });
      expect(output.permissionDecisionReason).toContain(reason);
    } else {
      expect(run.stdout).toBe('');
    }
  });

  test('a relative path and a notebook path are checked too', () => {
    const relativeEnv = runHook(FILES, { ...write(''), tool_input: { file_path: '.env' } });
    const notebook = runHook(FILES, { ...write(''), tool_input: { notebook_path: join(projectDir, 'dist/a.ipynb') } });

    expect(JSON.parse(relativeEnv.stdout).hookSpecificOutput.permissionDecision).toBe('deny');
    expect(JSON.parse(notebook.stdout).hookSpecificOutput.permissionDecision).toBe('deny');
  });

  test('a denial is recorded in the audit log', () => {
    runHook(FILES, write('.env'));

    expect(logLines()[0]?.blocked).toMatch(/secrets/);
  });

  test('unreadable input is let through', () => {
    const run = runHook(FILES, 'not json');
    expect(run.status).toBe(0);
    expect(run.stdout).toBe('');
  });
});

describe('audit-log', () => {
  test('appends one line per call with the tool, a summary and the result, and no file contents', () => {
    const write = {
      session_id: 's1',
      hook_event_name: 'PostToolUse',
      tool_name: 'Write',
      tool_input: { file_path: 'notes/a.md', content: 'private text' },
      tool_response: { success: true },
    };
    const run = runHook(AUDIT, write);
    runHook(AUDIT, { ...write, tool_name: 'Bash', tool_input: { command: 'ls' } });

    expect(run.status).toBe(0);
    const lines = logLines();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ session: 's1', tool: 'Write', summary: 'notes/a.md', ok: true });
    expect(JSON.stringify(lines[0])).not.toContain('private text');
    expect(lines[1]?.summary).toBe('ls');
  });

  test('a call that failed is logged as not ok', () => {
    runHook(AUDIT, { hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', tool_input: { command: 'ls missing' } });
    runHook(AUDIT, { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: { is_error: true } });

    expect(logLines().map(line => line.ok)).toEqual([false, false]);
  });

  test('bad input never fails the hook', () => {
    expect(runHook(AUDIT, 'not json').status).toBe(0);
  });
});
