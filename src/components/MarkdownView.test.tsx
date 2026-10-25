import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildTree } from '../lib/tree';
import { MarkdownView } from './MarkdownView';

const file = (path: string, type: string) => ({ path, file: new File(['x'], path.split('/').pop()!, { type }) });
const root = buildTree([
  file('proj/README.md', 'text/markdown'),
  file('proj/a.png', 'image/png'),
  file('proj/docs/b.png', 'image/png'),
  file('proj/notes.txt', 'text/plain'),
])!;
const render = (text: string, filePath = 'proj/README.md') =>
  renderToStaticMarkup(<MarkdownView text={text} root={root} filePath={filePath} />);
const tagsOf = (html: string) => html.match(/<[^>]+>/g) ?? [];

describe('MarkdownView', () => {
  it('renders a web link that opens a new tab with no opener or referrer', () => {
    expect(render('[site](https://example.com)')).toContain(
      '<a class="md-web-link" href="https://example.com/" target="_blank" rel="noopener noreferrer">site</a>',
    );
    expect(render('<https://example.com>')).toContain('href="https://example.com/"');
  });

  it('renders inert links as text, with no anchor', () => {
    for (const md of ['[s](docs/setup.md)', '[h](#setup)', '[j](javascript:alert(1))', '[m](mailto:a@b.co)', '[p](//evil.example)', '[x](javascript://example.com/%0Aalert(1))']) {
      const html = render(md);
      expect(html).toContain('class="md-inert-link"');
      expect(html).not.toMatch(/<a[\s>]/i);
      expect(html).not.toMatch(/href=/i);
    }
  });

  it('renders no image, frame or non-web address for a hostile file', () => {
    const html = render(
      [
        '[x](javascript:alert(1)) [d](docs/a.md) https://x.com <https://y.com> [r][ref]',
        '![logo](a.png) ![t](https://evil.example/t.png) ![s](data:image/png;base64,AAAA)',
        '<a href="https://evil.example">a</a> <img src=x onerror=alert(1)>',
        '<iframe src="https://evil.example"></iframe>',
        '[ref]: javascript:alert(2)',
      ].join('\n\n'),
    );
    expect(html).not.toMatch(/<img[\s>]/i);
    expect(html).not.toMatch(/<iframe[\s>]/i);
    // Raw HTML shows escaped as text, so only real tags are checked for attributes.
    const tags = tagsOf(html);
    expect(tags.filter((tag) => /\bsrc=/i.test(tag))).toEqual([]);
    // The only anchors are the two http(s) autolinks, each opening a new tab safely.
    const anchors = tags.filter((tag) => /^<a[\s>]/i.test(tag));
    expect(anchors).toEqual([
      '<a class="md-web-link" href="https://x.com/" target="_blank" rel="noopener noreferrer">',
      '<a class="md-web-link" href="https://y.com/" target="_blank" rel="noopener noreferrer">',
    ]);
    expect(tags.filter((tag) => !/^<a[\s>]/i.test(tag) && /\bhref=/i.test(tag))).toEqual([]);
  });

  it('shows raw HTML escaped', () => {
    const html = render('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script');
  });

  it('renders task checkboxes disabled with their state', () => {
    const boxes = render('- [x] done\n- [ ] todo').match(/<input[^>]*>/g) ?? [];
    expect(boxes).toHaveLength(2);
    expect(boxes[0]).toMatch(/type="checkbox"/);
    expect(boxes[0]).toMatch(/disabled/);
    expect(boxes[0]).toMatch(/checked/);
    expect(boxes[1]).toMatch(/disabled/);
    expect(boxes[1]).not.toMatch(/checked/);
  });

  it('keeps an ordered list start', () => {
    expect(render('3. a\n4. b')).toContain('<ol start="3">');
  });

  it('puts alignment classes on table cells', () => {
    const html = render('| L | R | C | N |\n|:-|-:|:-:|-|\n| 1 | 2 | 3 | 4 |');
    expect(html).toContain('<th class="md-align-left">L</th>');
    expect(html).toContain('<th class="md-align-right">R</th>');
    expect(html).toContain('<td class="md-align-center">3</td>');
    expect(html).toContain('<td>4</td>');
  });

  it('shows a blank-alt image as a labelled "Image" placeholder', () => {
    expect(render('![](https://e/b.png)')).toContain(
      '<span class="md-image-placeholder" role="img" aria-label="Image">Image</span>',
    );
  });

  it('renders no src at all for a found local image in a static render', () => {
    // The blob: URL is made in an effect, which a static render never runs, so no src can appear here.
    // That the shown src is a blob: URL (and is revoked) is checked by hand in the browser.
    const html = render('![a](a.png) ![b](/docs/b.png) ![c](./docs/b.png?v=1)');
    const srcs = tagsOf(html).flatMap((tag) => [...tag.matchAll(/\bsrc="([^"]*)"/gi)].map((m) => m[1]));
    expect(srcs).toEqual([]);
    expect(html).not.toContain('a.png');
    expect(html).not.toContain('b.png');
    expect(html).not.toContain('md-image-placeholder');
  });

  it('shows placeholders for missing, non-image, escaping and remote images', () => {
    const html = render(
      '![m](missing.png) ![n](../notes.txt) ![e](../../x.png) ![r](/../x.png) ![h](https://e.com/a.png) ![p](//e.com/a.png) ![d](data:image/png;base64,AAAA) ![f](file:///a.png)',
      'proj/docs/guide.md',
    );
    expect(html.match(/class="md-image-placeholder"/g)).toHaveLength(8);
    expect(html).not.toMatch(/<img[\s>]/i);
    expect(tagsOf(html).filter((tag) => /\bsrc=/i.test(tag))).toEqual([]);
  });

  it('falls back to the plain view when the text cannot be parsed', async () => {
    // Make the parser fail on purpose instead of hoping odd input breaks it.
    vi.doMock('../lib/markdown', () => ({ parseMarkdown: () => null }));
    vi.resetModules();
    try {
      const { MarkdownView: Fresh } = await import('./MarkdownView');
      const html = renderToStaticMarkup(<Fresh text="# a" root={root} filePath="proj/README.md" />);
      expect(html).toContain('class="plain-text"');
      expect(html).not.toContain('class="markdown"');
    } finally {
      vi.doUnmock('../lib/markdown');
      vi.resetModules();
    }
  });

  it('falls back to the plain view when the text renders to nothing', () => {
    for (const md of ['   \n\n  \n', '[ref]: https://example.com\n[other]: docs/a.md']) {
      const html = render(md);
      expect(html).toContain('class="plain-text"');
      expect(html).not.toContain('class="markdown"');
    }
  });
});
