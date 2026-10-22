import { describe, expect, it } from 'vitest';
import { classifyImage, classifyLink } from './links';
import { parseMarkdown, type MdInline } from './markdown';

const inert = { kind: 'inert' };
const web = (href: string) => ({ kind: 'web', href });

/** The target of the first link in a Markdown snippet, as the parser classifies it. */
function targetOf(md: string) {
  const block = parseMarkdown(md, 'proj/README.md')?.[0];
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

describe('classifyImage', () => {
  const README = 'proj/README.md';
  const GUIDE = 'proj/docs/guide.md';
  const local = (path: string) => ({ kind: 'local', path });
  const placeholder = { kind: 'placeholder' };

  it('resolves a relative path against the Markdown file\'s folder', () => {
    expect(classifyImage('images/logo.png', README)).toEqual(local('proj/images/logo.png'));
    expect(classifyImage('img/a.png', GUIDE)).toEqual(local('proj/docs/img/a.png'));
  });

  it('resolves a /-rooted path against the open folder', () => {
    expect(classifyImage('/img/a.png', GUIDE)).toEqual(local('proj/img/a.png'));
    expect(classifyImage('/a.png', README)).toEqual(local('proj/a.png'));
  });

  it('collapses . and .. segments', () => {
    expect(classifyImage('./a.png', GUIDE)).toEqual(local('proj/docs/a.png'));
    expect(classifyImage('../img/a.png', GUIDE)).toEqual(local('proj/img/a.png'));
    expect(classifyImage('img//./b/../a.png', README)).toEqual(local('proj/img/a.png'));
  });

  it('percent-decodes the path', () => {
    expect(classifyImage('my%20shot.png', README)).toEqual(local('proj/my shot.png'));
    expect(classifyImage('my shot.png', README)).toEqual(local('proj/my shot.png'));
  });

  it('drops a query or fragment', () => {
    expect(classifyImage('a.png?v=2', README)).toEqual(local('proj/a.png'));
    expect(classifyImage('a.png#part', README)).toEqual(local('proj/a.png'));
  });

  it('keeps a decoded entity as part of the name', () => {
    expect(classifyImage('a&b.png', README)).toEqual(local('proj/a&b.png'));
  });

  it('makes a path that leaves the open folder a placeholder', () => {
    expect(classifyImage('../../x.png', README)).toEqual(placeholder);
    expect(classifyImage('../x.png', README)).toEqual(placeholder);
    expect(classifyImage('/../x.png', README)).toEqual(placeholder);
    expect(classifyImage('../../../x.png', GUIDE)).toEqual(placeholder);
    expect(classifyImage('%2E%2E/%2E%2E/x.png', README)).toEqual(placeholder);
    expect(classifyImage('..%2F..%2Fx.png', README)).toEqual(placeholder);
  });

  it('makes remote addresses and other schemes placeholders', () => {
    for (const src of [
      'https://example.com/a.png',
      'http://example.com/a.png',
      'HTTPS://example.com/a.png',
      '//example.com/a.png',
      'data:image/png;base64,AAAA',
      'file:///etc/a.png',
      'blob:https://example.com/x',
      'javascript:alert(1)',
      'C:\\x.png',
      'c:/x.png',
      '\\\\server\\x.png',
      'img\\a.png',
    ]) {
      expect(classifyImage(src, README)).toEqual(placeholder);
    }
  });

  it('makes bad encoding and empty paths placeholders', () => {
    expect(classifyImage('%E0%A4%A.png', README)).toEqual(placeholder);
    expect(classifyImage('100%.png', README)).toEqual(placeholder);
    expect(classifyImage('', README)).toEqual(placeholder);
    expect(classifyImage('?v=2', README)).toEqual(placeholder);
    expect(classifyImage('#part', README)).toEqual(placeholder);
    expect(classifyImage('.', README)).toEqual(placeholder);
    expect(classifyImage('/', README)).toEqual(placeholder);
  });

  it('makes a segment that decodes to a separator, backslash or colon a placeholder', () => {
    expect(classifyImage('img%5Ca.png', README)).toEqual(placeholder);
    expect(classifyImage('C%3A/x.png', README)).toEqual(placeholder);
    expect(classifyImage('a%2Fb.png', README)).toEqual(placeholder);
    expect(classifyImage('img%2Fa.png', README)).toEqual(placeholder);
  });
});
