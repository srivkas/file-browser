import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import samples from './samples/guard-bash.json';
import fileSamples from './samples/guard-files.json';

const GUARD = join(import.meta.dirname, 'guard-bash.mjs');
const AUDIT = join(import.meta.dirname, 'audit-log.mjs');
const FILES = join(import.meta.dirname, 'guard-files.mjs');
const CSS = join(import.meta.dirname, 'check-css-tokens.mjs');
const CSS_SAMPLES = join(import.meta.dirname, 'samples', 'css');

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
    expect(lines[0]).toMatchObject({
      session: 's1',
      event: 'PreToolUse',
      tool: 'Bash',
      target: 'git push --force',
      outcome: 'blocked',
    });
    expect(lines[0]?.reason).toMatch(/forced git push/);
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

    expect(logLines()[0]).toMatchObject({ event: 'PreToolUse', tool: 'Write', outcome: 'blocked' });
    expect(logLines()[0]?.reason).toMatch(/secrets/);
  });

  test('unreadable input is let through', () => {
    const run = runHook(FILES, 'not json');
    expect(run.status).toBe(0);
    expect(run.stdout).toBe('');
  });
});

describe('check-css-tokens', () => {
  const edited = (file_path: string) => ({ hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path } });

  test('a CSS file with hard-coded values gets each one back with its line, and exit 2', () => {
    const run = runHook(CSS, edited(join(CSS_SAMPLES, 'breaks-rule.css')));

    expect(run.status).toBe(2);
    expect(run.stderr).toContain('tokens.css');
    expect(run.stderr).toContain('breaks-rule.css:3: color uses #ff0000');
    expect(run.stderr).toContain('breaks-rule.css:4: padding uses 4px');
    expect(run.stderr).toContain('breaks-rule.css:4: padding uses 0.5rem');
    expect(run.stderr).toContain('breaks-rule.css:5: border uses rgb(…)');
    expect(run.stderr).not.toContain('uses 1px');
    expect(run.stderr).not.toContain('#fab');
  });

  test('a CSS file that uses the tokens stays silent', () => {
    const run = runHook(CSS, edited(join(CSS_SAMPLES, 'respects-rule.css')));

    expect(run.status).toBe(0);
    expect(run.stderr).toBe('');
  });

  test('other files, tokens.css itself and a missing file are left alone', () => {
    for (const file of ['src/lib/format.ts', 'src/styles/tokens.css', 'src/styles/missing.css']) {
      const run = runHook(CSS, edited(file));
      expect(run.status).toBe(0);
      expect(run.stderr).toBe('');
    }
  });
});

describe('audit-log', () => {
  const write = {
    session_id: 's1',
    hook_event_name: 'PostToolUse',
    tool_name: 'Write',
    tool_input: { file_path: 'notes/a.md', content: 'private text' },
    tool_response: { success: true },
  };

  test('appends one line per call with the event, the tool, its target and the outcome, and no file contents', () => {
    const run = runHook(AUDIT, write);
    runHook(AUDIT, { ...write, tool_name: 'Bash', tool_input: { command: 'ls' } });

    expect(run.status).toBe(0);
    const lines = logLines();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      session: 's1',
      event: 'PostToolUse',
      tool: 'Write',
      target: 'notes/a.md',
      outcome: 'ok',
      reason: null,
    });
    expect(JSON.stringify(lines[0])).not.toContain('private text');
    expect(lines[1]?.target).toBe('ls');
  });

  test('a call that failed is logged as failed', () => {
    runHook(AUDIT, { hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', tool_input: { command: 'ls missing' } });
    runHook(AUDIT, { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: { is_error: true } });

    expect(logLines().map(line => line.outcome)).toEqual(['failed', 'failed']);
  });

  test('a session start is logged, with how it started and no tool', () => {
    runHook(AUDIT, { session_id: 's2', hook_event_name: 'SessionStart', source: 'startup' });

    expect(logLines()[0]).toMatchObject({ session: 's2', event: 'SessionStart', tool: null, target: 'startup', outcome: 'ok' });
  });

  test('a long command keeps its start and its end', () => {
    const command = `${'a'.repeat(400)} && npm run check`;
    runHook(AUDIT, { ...write, tool_name: 'Bash', tool_input: { command } });

    const logged = logLines()[0]?.target as string;
    expect(logged.startsWith('a'.repeat(200))).toBe(true);
    expect(logged.endsWith('&& npm run check')).toBe(true);
    expect(logged.length).toBeLessThan(command.length);
  });

  test('every line has the same fields, whichever hook wrote it', () => {
    runHook(AUDIT, write);
    runHook(AUDIT, { session_id: 's1', hook_event_name: 'SessionStart', source: 'resume' });
    runHook(GUARD, bash('git push --force'));
    runHook(FILES, { session_id: 's1', hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: '.env' } });

    const fieldSets = new Set(logLines().map(line => Object.keys(line).join(',')));
    expect(logLines()).toHaveLength(4);
    expect([...fieldSets]).toEqual(['time,session,event,tool,target,outcome,reason']);
  });

  test('bad input, or a log it cannot write, never fails the hook', () => {
    expect(runHook(AUDIT, 'not json').status).toBe(0);

    // A file where the logs folder should be makes the write fail.
    writeFileSync(join(projectDir, 'logs'), 'not a folder');
    expect(runHook(AUDIT, write).status).toBe(0);
    expect(runHook(GUARD, bash('git push --force')).status).toBe(2);
  });
});
