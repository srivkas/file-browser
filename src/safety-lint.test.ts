import { describe, expect, it } from 'vitest';
import { ESLint } from 'eslint';

// Pins the ESLint safety rules from .claude/rules/markdown-safety.md: each snippet
// is code the rules must reject, linted with the project's own eslint.config.js.
// If a config edit drops a rule, its snippet passes lint and this test fails.

const eslint = new ESLint();

async function errorsFor(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.severity === 2).map((m) => `${m.ruleId}: ${m.message}`);
}

const MARKDOWN = 'src/lib/markdown.ts';
const COMPONENT = 'src/components/Example.tsx';

describe('ESLint safety rules', () => {
  it('lets markdown.ts use the lexer', async () => {
    expect(await errorsFor("import { marked } from 'marked';\nexport const t = marked.lexer('# a');\n", MARKDOWN)).toEqual([]);
  });

  const blockedInMarkdown: [string, string][] = [
    ['marked.parse', "import { marked } from 'marked';\nexport const h = marked.parse('# a');\n"],
    ['an aliased import', "import { marked as m } from 'marked';\nexport const h = m.parse('# a');\n"],
    ['a namespace import', "import * as md from 'marked';\nexport const h = md.marked.parse('# a');\n"],
    ['a default import', "import md from 'marked';\nexport const h = md.parse('# a');\n"],
    ['an alias variable', "import { marked } from 'marked';\nconst m = marked;\nexport const h = m.parse('# a');\n"],
    ['destructuring', "import { marked } from 'marked';\nconst { parse } = marked;\nexport const h = parse('# a');\n"],
    ['marked.marked', "import { marked } from 'marked';\nexport const h = marked.marked('# a');\n"],
    ['marked.Parser', "import { marked } from 'marked';\nexport const p = marked.Parser;\n"],
    ['marked.Marked', "import { marked } from 'marked';\nexport const k = new marked.Marked();\n"],
    ['marked.Renderer', "import { marked } from 'marked';\nexport const r = new marked.Renderer();\n"],
    ['a computed property', "import { marked } from 'marked';\nexport const h = marked['parse']('# a');\n"],
  ];
  it.each(blockedInMarkdown)('rejects %s in markdown.ts', async (_, code) => {
    expect(await errorsFor(code, MARKDOWN)).not.toEqual([]);
  });

  const blockedInComponents: [string, string][] = [
    ['dangerouslySetInnerHTML', "export const A = () => <div dangerouslySetInnerHTML={{ __html: 'x' }} />;\n"],
    ['an innerHTML assignment', "export function f(el: HTMLElement) { el.innerHTML = 'x'; }\n"],
    ['Object.assign with innerHTML', "export function f(el: HTMLElement) { Object.assign(el, { innerHTML: 'x' }); }\n"],
    ['Object.assign with outerHTML', "export function f(el: HTMLElement) { Object.assign(el, { 'outerHTML': 'x' }); }\n"],
    ['insertAdjacentHTML', "export function f(el: HTMLElement) { el.insertAdjacentHTML('beforeend', 'x'); }\n"],
    ['document.write', "export function f() { document.write('x'); }\n"],
    ['an iframe srcDoc', "export const A = () => <iframe srcDoc=\"<b>x</b>\" />;\n"],
    ['a srcdoc attribute', "export function f(el: HTMLElement) { el.setAttribute('srcdoc', 'x'); }\n"],
    ['importing marked outside markdown.ts', "import { marked } from 'marked';\nexport const t = marked.lexer('# a');\n"],
    ['a dynamic import of marked', "export const m = () => import('marked');\n"],
    ['a template-literal dynamic import', 'const lib = "marked";\nexport const m = () => import(`${lib}`);\n'],
  ];
  it.each(blockedInComponents)('rejects %s in a component', async (_, code) => {
    expect(await errorsFor(code, COMPONENT)).not.toEqual([]);
  });
});
