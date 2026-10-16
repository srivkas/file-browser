import { extension } from './format';

/** Files above this size are not read for a line count. */
export const MAX_LINE_COUNT_BYTES = 50 * 1024 * 1024;

const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/ld+json',
  'application/xml',
  'application/javascript',
  'application/ecmascript',
  'application/x-javascript',
  'application/typescript',
  'application/x-sh',
  'application/x-httpd-php',
  'application/sql',
  'application/toml',
  'application/yaml',
  'application/x-yaml',
]);

/** Used only when the browser leaves the MIME type blank. */
const TEXT_EXTENSIONS = new Set([
  'txt', 'text', 'log', 'md', 'markdown', 'rst', 'adoc',
  'json', 'jsonc', 'json5', 'csv', 'tsv', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env',
  'js', 'mjs', 'cjs', 'jsx', 'ts', 'mts', 'cts', 'tsx', 'vue', 'svelte',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'py', 'rb', 'php', 'java', 'kt', 'kts', 'scala', 'go', 'rs', 'c', 'h', 'cc', 'cpp', 'cxx', 'hpp', 'hh',
  'cs', 'fs', 'swift', 'm', 'mm', 'dart', 'lua', 'pl', 'r', 'jl', 'ex', 'exs', 'erl', 'hs', 'clj', 'elm',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd', 'sql', 'graphql', 'gql', 'proto', 'tf',
  'gitignore', 'gitattributes', 'editorconfig', 'lock',
]);

/** True for files worth counting lines in: by MIME type, or by extension when the type is blank. */
export function isTextFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type) {
    return (
      type.startsWith('text/') ||
      TEXT_MIME_TYPES.has(type) ||
      ((type.endsWith('+json') || type.endsWith('+xml')) && !type.startsWith('image/'))
    );
  }
  return TEXT_EXTENSIONS.has(extension(file.name));
}

/** True when the file is text and small enough to read for a line count. */
export function canCountLines(file: File): boolean {
  return isTextFile(file) && file.size <= MAX_LINE_COUNT_BYTES;
}

/** Number of lines; a trailing newline doesn't start a new line. "\r\n" counts once. */
export function countLines(text: string): number {
  if (text === '') return 0;
  let lines = 0;
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) lines++;
  return text.endsWith('\n') ? lines : lines + 1;
}
