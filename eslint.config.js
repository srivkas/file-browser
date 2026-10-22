import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const REACT_BAN = { group: ['react', 'react-dom', 'react/*', 'react-dom/*'], message: 'src/lib must stay framework-free.' };
const MARKED_BAN = { group: ['marked', 'marked/*'], message: 'Only src/lib/markdown.ts may import marked.' };
const MARKED_SUBPATH_BAN = { group: ['marked/*'], message: 'Import marked itself, lexer only.' };

const NO_HTML = 'Render with React elements, never HTML strings.';
// Project rule: nothing from a file is ever turned into HTML, and marked is never loaded dynamically.
const SAFETY_SYNTAX = [
  { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: NO_HTML },
  { selector: "Property[key.name='dangerouslySetInnerHTML']", message: NO_HTML },
  { selector: "Property[key.value='dangerouslySetInnerHTML']", message: NO_HTML },
  { selector: 'AssignmentExpression[left.property.name=/^(inner|outer)HTML$/]', message: NO_HTML },
  { selector: 'AssignmentExpression[left.property.value=/^(inner|outer)HTML$/]', message: NO_HTML },
  { selector: "CallExpression[callee.property.name='insertAdjacentHTML']", message: NO_HTML },
  { selector: "CallExpression[callee.object.name='document'][callee.property.name=/^write(ln)?$/]", message: NO_HTML },
  { selector: "CallExpression[callee.property.name='createContextualFragment']", message: NO_HTML },
  { selector: 'ImportExpression[source.value=/^marked(\\W|$)/]', message: 'Only src/lib/markdown.ts may import marked, statically.' },
];
const LEXER_ONLY = 'Use marked.lexer only; never produce HTML.';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Project rule: no network calls and no browser persistence.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No network calls in this app.' },
        { name: 'XMLHttpRequest', message: 'No network calls in this app.' },
        { name: 'WebSocket', message: 'No network calls in this app.' },
        { name: 'localStorage', message: 'No persistent storage in this app.' },
        { name: 'sessionStorage', message: 'No persistent storage in this app.' },
        { name: 'indexedDB', message: 'No persistent storage in this app.' },
      ],
      'no-restricted-syntax': ['error', ...SAFETY_SYNTAX],
      'no-restricted-imports': ['error', { patterns: [MARKED_BAN] }],
    },
  },
  {
    // Project rule: src/lib is a framework-free core.
    // A later block replaces the rule, so every lib block repeats the React ban.
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [MARKED_BAN, REACT_BAN] }],
    },
  },
  {
    // The one file allowed to use marked, and only its lexer.
    // Later blocks replace these rules, so this one repeats the src and lib bans.
    files: ['src/lib/markdown.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'marked', importNames: ['parse', 'parseInline', 'parser', 'Parser', 'Renderer', 'Marked'], message: LEXER_ONLY }],
          patterns: [MARKED_SUBPATH_BAN, REACT_BAN],
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'marked', property: 'parse', message: LEXER_ONLY },
        { object: 'marked', property: 'parseInline', message: LEXER_ONLY },
        { object: 'marked', property: 'parser', message: LEXER_ONLY },
        { object: 'marked', property: 'use', message: LEXER_ONLY },
      ],
      'no-restricted-syntax': ['error', ...SAFETY_SYNTAX, { selector: "CallExpression[callee.name='marked']", message: LEXER_ONLY }],
    },
  },
);
