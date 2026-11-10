#!/usr/bin/env node
// PostToolUse hook for Edit and Write: checks an edited CSS file for hard-coded colors and sizes,
// which the project keeps in src/styles/tokens.css. ESLint doesn't read CSS, so nothing else checks it.
// The edit has already happened: exit 2 is feedback that Claude reads and fixes, not a block.
import { readFileSync, writeSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import process from 'node:process';

const TOKENS_FILE = 'tokens.css';
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/g;
const LENGTH = /(?<![\w-])\d*\.?\d+(?:px|rem|em)\b/g;
// The one literal the project allows: hairline borders.
const ALLOWED_LENGTHS = new Set(['1px']);

/** Blanks out comments but keeps their newlines, so line numbers stay right. */
function withoutComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
}

/** Each hard-coded value in a declaration, with its line. */
export function findLiterals(css) {
  const text = withoutComments(css);
  const findings = [];
  for (const declaration of text.matchAll(/([\w-]+)\s*:\s*([^;{}]+)[;}]/g)) {
    const [, property, value] = declaration;
    const line = text.slice(0, declaration.index).split('\n').length;
    const literals = [...value.matchAll(COLOR), ...value.matchAll(LENGTH)]
      .map(match => match[0].replace(/\($/, '(…)'))
      .filter(literal => !ALLOWED_LENGTHS.has(literal));
    for (const literal of literals) findings.push({ line, property, literal });
  }
  return findings;
}

function main() {
  let filePath;
  try {
    const event = JSON.parse(readFileSync(0, 'utf8'));
    filePath = event.tool_input?.file_path;
    // Most edits aren't CSS: leave before reading anything else.
    if (typeof filePath !== 'string' || !filePath.endsWith('.css') || basename(filePath) === TOKENS_FILE) return;
    const projectDir = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? process.cwd();
    const findings = findLiterals(readFileSync(resolve(projectDir, filePath), 'utf8'));
    if (findings.length === 0) return;

    const lines = findings.map(({ line, property, literal }) => `${filePath}:${line}: ${property} uses ${literal}`);
    const message = [
      'Hard-coded values in CSS. Use a variable from src/styles/tokens.css instead (only 1px hairline borders may be literal):',
      ...lines,
    ].join('\n');
    writeSync(2, `${message}\n`);
    process.exitCode = 2;
  } catch {
    // A file it can't read or parse is not this hook's problem: stay out of the way.
  }
}

main();
