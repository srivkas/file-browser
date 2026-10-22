import { describe, expect, it } from 'vitest';
import { classifyLink } from './links';
import { parseMarkdown, type MdInline } from './markdown';

const inert = { kind: 'inert' };
const web = (href: string) => ({ kind: 'web', href });

/** The target of the first link in a Markdown snippet, as the parser classifies it. */
function targetOf(md: string) {
  const block = parseMarkdown(md)?.[0];
  const link = block && 'children' in block ? block.children.find((i: MdInline) => i.kind === 'link') : undefined;
  return link?.kind === 'link' ? link.target : undefined;
}

describe('classifyLink', () => {
  it('makes an http(s) address a web link with its normalized href', () => {
    expect(classifyLink('https://example.com')).toEqual(web('https://example.com/'));
    expect(classifyLink('http://example.com/a?b=1#c')).toEqual(web('http://example.com/a?b=1#c'));
  });

  it('lower-cases an upper-case scheme and host', () => {
    expect(classifyLink('HTTPS://E.com')).toEqual(web('https://e.com/'));
  });

  it('keeps file paths and #headings inert', () => {
    expect(classifyLink('docs/setup.md')).toEqual(inert);
    expect(classifyLink('#setup')).toEqual(inert);
    expect(classifyLink('/README.md')).toEqual(inert);
    expect(classifyLink('')).toEqual(inert);
  });

  it('keeps dangerous schemes inert, whatever their case or spacing', () => {
    for (const href of [
      'javascript:alert(1)',
      ' javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'java\tscript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox',
      'file:///etc/passwd',
      'javascript://example.com/%0Aalert(1)',
      'file://server/x',
      'ftp://evil.example/a',
    ]) {
      expect(classifyLink(href)).toEqual(inert);
    }
  });

  it('keeps mail addresses inert', () => {
    expect(classifyLink('mailto:a@b.co')).toEqual(inert);
  });

  it('keeps protocol-relative addresses inert', () => {
    expect(classifyLink('//evil.example')).toEqual(inert);
  });

  it('keeps addresses with a user name or password inert', () => {
    expect(classifyLink('https://github.com@evil.example')).toEqual(inert);
    expect(classifyLink('https://user:pass@example.com/')).toEqual(inert);
    expect(classifyLink('http://:pass@example.com/')).toEqual(inert);
  });

  it('keeps malformed web addresses inert', () => {
    expect(classifyLink('https:')).toEqual(inert);
    expect(classifyLink('http://')).toEqual(inert);
  });
});

describe('links in Markdown', () => {
  it('classifies every row of the matrix', () => {
    expect(targetOf('[site](https://example.com)')).toEqual(web('https://example.com/'));
    expect(targetOf('https://example.com')).toEqual(web('https://example.com/'));
    expect(targetOf('<https://example.com>')).toEqual(web('https://example.com/'));
    expect(targetOf('www.example.com')).toEqual(web('http://www.example.com/'));
    expect(targetOf('[x](HTTPS://E.com)')).toEqual(web('https://e.com/'));
    expect(targetOf('[x][r]\n\n[r]: https://e.com')).toEqual(web('https://e.com/'));
    expect(targetOf('[setup](docs/setup.md)')).toEqual(inert);
    expect(targetOf('[s](#setup)')).toEqual(inert);
    expect(targetOf('[x](javascript:alert(1))')).toEqual(inert);
    expect(targetOf('[x]( javascript:alert(1))')).toEqual(inert);
    expect(targetOf('[x](JaVaScRiPt:alert(1))')).toEqual(inert);
    expect(targetOf('[x](data:text/html,hi)')).toEqual(inert);
    expect(targetOf('[x](vbscript:msgbox)')).toEqual(inert);
    expect(targetOf('[x](file:///etc/passwd)')).toEqual(inert);
    expect(targetOf('[x](javascript://example.com/%0Aalert(1))')).toEqual(inert);
    expect(targetOf('[x](https://github.com@evil.example)')).toEqual(inert);
    expect(targetOf('[m](mailto:a@b.co)')).toEqual(inert);
    expect(targetOf('a@b.co')).toEqual(inert);
    expect(targetOf('[p](//evil.example)')).toEqual(inert);
    expect(targetOf('[b](https:)')).toEqual(inert);
    expect(targetOf('[b](http://)')).toEqual(inert);
  });

  it('decodes entities in the address before classifying it', () => {
    expect(targetOf('[x](https://a.com/?a=1&amp;b=2)')).toEqual(web('https://a.com/?a=1&b=2'));
    expect(targetOf('<https://a.com/?a=1&amp;b=2>')).toEqual(web('https://a.com/?a=1&b=2'));
    expect(targetOf('[y](javascript&#58;alert(1))')).toEqual(inert);
    expect(targetOf('[y](javascript&#x3A;alert(1))')).toEqual(inert);
  });
});
