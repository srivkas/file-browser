import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

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
    },
  },
  {
    // Project rule: src/lib is a framework-free core.
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['react', 'react-dom', 'react/*', 'react-dom/*'], message: 'src/lib must stay framework-free.' }] },
      ],
    },
  },
);
