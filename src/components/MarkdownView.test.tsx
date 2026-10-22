import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownView } from './MarkdownView';

const render = (text: string) => renderToStaticMarkup(<MarkdownView text={text} />);

describe('MarkdownView', () => {
  it('renders no link, image or URL attribute for a hostile file', () => {
    const html = render(
      [
        '[x](javascript:alert(1)) [d](docs/a.md) https://x.com <https://y.com> [r][ref]',
        '![logo](a.png) ![t](https://evil.example/t.png) ![s](data:image/png;base64,AAAA)',
        '<a href="https://evil.example">a</a> <img src=x onerror=alert(1)>',
        '<iframe src="https://evil.example"></iframe>',
        '[ref]: javascript:alert(2)',
      ].join('\n\n'),
    );
    expect(html).not.toMatch(/<a[\s>]/i);
    expect(html).not.toMatch(/<img[\s>]/i);
    expect(html).not.toMatch(/<iframe[\s>]/i);
    // Raw HTML shows escaped as text, so only real tags are checked for attributes.
    const tags = html.match(/<[^>]+>/g) ?? [];
    expect(tags.filter((tag) => /\b(href|src)=/i.test(tag))).toEqual([]);
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

  it('falls back to the plain view when the text cannot be parsed', () => {
    const html = render('>'.repeat(2000) + ' a');
    expect(html).toContain('class="plain-text"');
    expect(html).not.toContain('class="markdown"');
  });
});
