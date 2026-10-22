import { describe, expect, it } from 'vitest';
import { decodeEntities, parseMarkdown, type MdBlock } from './markdown';
import { PREVIEW_MAX_BYTES, previewPlan } from './preview';

const text = (t: string) => ({ kind: 'text', text: t });
const plain = (t: string) => ({ kind: 'plain', children: [text(t)] });
const para = (...children: unknown[]) => [{ kind: 'paragraph', children }];
const first = (md: string) => parseMarkdown(md)?.[0];

describe('parseMarkdown', () => {
  it('turns a heading into its level and text, without the #', () => {
    expect(parseMarkdown('# Title')).toEqual([{ kind: 'heading', level: 1, children: [text('Title')] }]);
    expect(first('### Three')).toMatchObject({ kind: 'heading', level: 3 });
  });

  it('keeps strong, em, del and inline code', () => {
    expect(parseMarkdown('**b** _i_ ~~s~~ `c`')).toEqual(
      para(
        { kind: 'strong', children: [text('b')] },
        text(' '),
        { kind: 'em', children: [text('i')] },
        text(' '),
        { kind: 'del', children: [text('s')] },
        text(' '),
        { kind: 'code', text: 'c' },
      ),
    );
  });

  it('keeps ordered and unordered lists, their start and their nesting', () => {
    expect(first('3. a\n4. b')).toEqual({
      kind: 'list',
      ordered: true,
      start: 3,
      items: [
        { checked: null, blocks: [plain('a')] },
        { checked: null, blocks: [plain('b')] },
      ],
    });
    expect(first('- b\n  - c')).toEqual({
      kind: 'list',
      ordered: false,
      start: 1,
      items: [
        {
          checked: null,
          blocks: [plain('b'), { kind: 'list', ordered: false, start: 1, items: [{ checked: null, blocks: [plain('c')] }] }],
        },
      ],
    });
  });

  it('keeps paragraphs in loose list items', () => {
    expect(first('- a\n\n- b')).toMatchObject({ items: [{ blocks: para(text('a')) }, { blocks: para(text('b')) }] });
  });

  it('marks task items checked or unchecked, without the box in the text', () => {
    expect(first('- [x] done\n- [ ] todo')).toMatchObject({
      items: [
        { checked: true, blocks: [plain('done')] },
        { checked: false, blocks: [plain('todo')] },
      ],
    });
    // Loose task items put the box inside the paragraph.
    expect(first('- [x] done\n\n- [ ] todo')).toMatchObject({
      items: [
        { checked: true, blocks: para(text('done')) },
        { checked: false, blocks: para(text('todo')) },
      ],
    });
  });

  it('keeps a table with its column alignment', () => {
    expect(first('| a | b | c |\n|:-|-:|-|\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |')).toEqual({
      kind: 'table',
      align: ['left', 'right', null],
      header: [[text('a')], [text('b')], [text('c')]],
      rows: [
        [[text('1')], [text('2')], [text('3')]],
        [[text('4')], [text('5')], [text('6')]],
      ],
    });
    expect(first('| a |\n|:-:|\n| 1 |')).toMatchObject({ align: ['center'] });
  });

  it('keeps a code block literal, without its language', () => {
    expect(parseMarkdown('```js\na<b &amp;\n```')).toEqual([{ kind: 'code', text: 'a<b &amp;' }]);
    expect(parseMarkdown('`a<b &amp;`')).toEqual(para({ kind: 'code', text: 'a<b &amp;' }));
  });

  it('keeps blockquotes and rules', () => {
    expect(parseMarkdown('> q\n\n---')).toEqual([{ kind: 'quote', blocks: para(text('q')) }, { kind: 'rule' }]);
  });

  it('keeps hard line breaks', () => {
    expect(parseMarkdown('a  \nb')).toEqual(para(text('a'), { kind: 'break' }, text('b')));
  });

  it('shows raw HTML literally, block or inline', () => {
    expect(parseMarkdown('<script>alert(1)</script>')).toEqual([{ kind: 'raw', text: '<script>alert(1)</script>' }]);
    expect(parseMarkdown('<img src=x onerror=alert(1)>')).toEqual([{ kind: 'raw', text: '<img src=x onerror=alert(1)>' }]);
    expect(parseMarkdown('say <b>hi</b>')).toEqual(para(text('say '), text('<b>'), text('hi'), text('</b>')));
  });

  it('decodes entities in text', () => {
    expect(parseMarkdown('&amp; &copy; &#169;')).toEqual(para(text('& © ©')));
  });

  it('decodes numeric entities, including an encoded &', () => {
    expect(parseMarkdown('&#38; &#x26; &#60;')).toEqual(para(text('& & <')));
  });

  it('gives null when the input is too deeply nested to parse', () => {
    expect(parseMarkdown('>'.repeat(2000) + ' a')).toBeNull();
  });

  it('keeps backslash escapes literal', () => {
    expect(parseMarkdown('\\*a\\* \\&amp;')).toEqual(para(text('*'), text('a'), text('*'), text(' '), text('&'), text('amp;')));
  });

  it('turns every link into its text only', () => {
    expect(parseMarkdown('[l](docs/a.md)')).toEqual(para({ kind: 'link', children: [text('l')] }));
    expect(parseMarkdown('https://x.com')).toEqual(para({ kind: 'link', children: [text('https://x.com')] }));
    expect(parseMarkdown('[x](javascript:alert(1))')).toEqual(para({ kind: 'link', children: [text('x')] }));
    expect(parseMarkdown('[**b**](a.md)')).toEqual(para({ kind: 'link', children: [{ kind: 'strong', children: [text('b')] }] }));
  });

  it('turns every image into its alt text only', () => {
    expect(parseMarkdown('![logo](a.png)')).toEqual(para({ kind: 'image', alt: 'logo' }));
    expect(parseMarkdown('![](https://e/b.png)')).toEqual(para({ kind: 'image', alt: '' }));
    expect(parseMarkdown('![a *b* &amp; c](c.png)')).toEqual(para({ kind: 'image', alt: 'a b & c' }));
  });

  it('skips link reference definitions', () => {
    expect(parseMarkdown('[r]: https://e.com')).toEqual([]);
  });

  it('gives nothing for empty text', () => {
    expect(parseMarkdown('')).toEqual([]);
  });

  it('keeps no URL anywhere in the model of a hostile file', () => {
    const hostile = [
      '[x](javascript:alert(1)) [y](JaVaScRiPt:alert(1) "t") [z][ref] <https://evil.example/a>',
      '![a](javascript:alert(1)) ![b](https://evil.example/track.png) ![c][img] ![d](data:image/png;base64,AAAA)',
      '- [e](vbscript:msgbox) www.evil.example',
      '| [f](javascript:void(0)) |\n|-|\n| ![g](http://evil.example/g.png) |',
      '> [h](file:///etc/passwd)',
      '[ref]: javascript:alert(2)',
      '[img]: https://evil.example/i.png',
    ].join('\n\n');
    const model: MdBlock[] | null = parseMarkdown(hostile);
    expect(model).not.toBeNull();
    const json = JSON.stringify(model);
    expect(json).not.toMatch(/href/i);
    expect(json).not.toMatch(/src/i);
    expect(json).not.toMatch(/javascript:/i);
    // Only link text survives: an autolink shows its address as text, nothing else of a URL remains.
    expect(json).not.toMatch(/track\.png|i\.png|data:|vbscript|file:/i);
  });
});

describe('decodeEntities', () => {
  it('decodes the common named entities', () => {
    expect(decodeEntities('&amp;&lt;&gt;&quot;&apos;&nbsp;&copy;&reg;&trade;')).toBe('&<>"\' ©®™');
    expect(decodeEntities('&hellip;&mdash;&ndash;&lsquo;&rsquo;&ldquo;&rdquo;&times;')).toBe('…—–‘’“”×');
  });

  it('leaves unknown entities as written', () => {
    expect(decodeEntities('&hearts; &AMP; & amp;')).toBe('&hearts; &AMP; & amp;');
  });

  it('decodes once only', () => {
    expect(decodeEntities('&amp;lt;')).toBe('&lt;');
  });
});

describe('empty and too-large Markdown files', () => {
  it('keep the Story 1.1 plans', () => {
    expect(previewPlan(new File([], 'README.md'))).toBe('empty');
    expect(previewPlan(new File([new Uint8Array(PREVIEW_MAX_BYTES + 1)], 'README.md'))).toBe('too-large');
    expect(previewPlan(new File(['# a'], 'README.md'))).toBe('markdown');
  });
});
