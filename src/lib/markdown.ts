import { marked, type Token, type Tokens } from 'marked';
import { classifyLink, type LinkTarget } from './links';

// The app's own Markdown model. It holds display-ready text only and no HTML.
// Links keep their text and a verdict from links.ts: the only address in the
// model is the normalized http(s) address of a web link. Images keep their alt text.

export type MdAlign = 'left' | 'center' | 'right' | null;

export type MdInline =
  | { kind: 'text'; text: string }
  | { kind: 'strong' | 'em' | 'del'; children: MdInline[] }
  | { kind: 'code'; text: string }
  | { kind: 'break' }
  | { kind: 'link'; target: LinkTarget; children: MdInline[] }
  | { kind: 'image'; alt: string };

export interface MdListItem {
  /** true / false for a task item, null for an ordinary item. */
  checked: boolean | null;
  blocks: MdBlock[];
}

export type MdBlock =
  | { kind: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: MdInline[] }
  | { kind: 'paragraph'; children: MdInline[] }
  /** Text of a tight list item: inline content without a paragraph around it. */
  | { kind: 'plain'; children: MdInline[] }
  /** Raw HTML, shown literally. */
  | { kind: 'raw'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'quote'; blocks: MdBlock[] }
  | { kind: 'list'; ordered: boolean; start: number; items: MdListItem[] }
  | { kind: 'rule' }
  | { kind: 'table'; align: MdAlign[]; header: MdInline[][]; rows: MdInline[][][] };

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  times: '×',
};

/**
 * Decodes numeric references and the common named entities, in one pass; unknown or invalid ones stay as written.
 * The lexer decodes numeric entities in text itself, except that it re-escapes `&` (`&#38;`, `&#x26;`) as `&amp;`,
 * which the named table turns back. In link addresses the lexer decodes nothing, so both kinds are needed there.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z]+);/g, (match, name: string) => {
    if (!name.startsWith('#')) return NAMED_ENTITIES[name] ?? match;
    const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/** The file's Markdown model, or null when it cannot be parsed (e.g. nesting too deep for the lexer). */
export function parseMarkdown(text: string): MdBlock[] | null {
  try {
    return toBlocks(marked.lexer(text, { gfm: true }));
  } catch {
    return null;
  }
}

function toBlocks(tokens: Token[]): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const token of tokens) {
    const block = toBlock(token);
    if (block) blocks.push(block);
  }
  return blocks;
}

function toBlock(token: Token): MdBlock | null {
  switch (token.type) {
    case 'space':
    case 'def':
    case 'checkbox':
      return null;
    case 'heading': {
      const t = token as Tokens.Heading;
      return { kind: 'heading', level: Math.min(Math.max(t.depth, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6, children: toInlines(t.tokens) };
    }
    case 'paragraph':
      return { kind: 'paragraph', children: toInlines((token as Tokens.Paragraph).tokens) };
    case 'text': {
      const t = token as Tokens.Text;
      return { kind: 'plain', children: t.tokens ? toInlines(t.tokens) : [plainText(t.text)] };
    }
    case 'html':
      return { kind: 'raw', text: (token as Tokens.HTML).text };
    case 'code':
      return { kind: 'code', text: (token as Tokens.Code).text };
    case 'blockquote':
      return { kind: 'quote', blocks: toBlocks((token as Tokens.Blockquote).tokens) };
    case 'list': {
      const t = token as Tokens.List;
      return {
        kind: 'list',
        ordered: t.ordered,
        start: typeof t.start === 'number' ? t.start : 1,
        items: t.items.map((item) => ({
          checked: item.task ? Boolean(item.checked) : null,
          blocks: toBlocks(item.tokens),
        })),
      };
    }
    case 'hr':
      return { kind: 'rule' };
    case 'table': {
      const t = token as Tokens.Table;
      return {
        kind: 'table',
        align: t.align.map((a) => a ?? null),
        header: t.header.map((cell) => toInlines(cell.tokens)),
        rows: t.rows.map((row) => row.map((cell) => toInlines(cell.tokens))),
      };
    }
    default:
      // Unknown kinds degrade to their text.
      return 'text' in token && typeof token.text === 'string' ? { kind: 'paragraph', children: [plainText(token.text)] } : null;
  }
}

function toInlines(tokens: Token[] = []): MdInline[] {
  return tokens.flatMap(toInline);
}

function toInline(token: Token): MdInline | MdInline[] {
  switch (token.type) {
    case 'checkbox':
      return [];
    case 'text': {
      const t = token as Tokens.Text;
      // A text token can carry its own inline tokens; they replace it.
      return t.tokens ? toInlines(t.tokens) : plainText(t.text);
    }
    case 'escape':
      return { kind: 'text', text: (token as Tokens.Escape).text };
    case 'html':
      // Raw inline HTML shows literally.
      return { kind: 'text', text: (token as Tokens.Tag).text };
    case 'strong':
    case 'em':
    case 'del':
      return { kind: token.type, children: toInlines((token as Tokens.Strong).tokens) };
    case 'codespan':
      return { kind: 'code', text: (token as Tokens.Codespan).text };
    case 'br':
      return { kind: 'break' };
    case 'link': {
      const t = token as Tokens.Link;
      return { kind: 'link', target: classifyLink(decodeEntities(t.href)), children: toInlines(t.tokens) };
    }
    case 'image': {
      const t = token as Tokens.Image;
      return { kind: 'image', alt: t.tokens?.length ? flatten(toInlines(t.tokens)) : decodeEntities(t.text) };
    }
    default:
      return 'text' in token && typeof token.text === 'string' ? plainText(token.text) : [];
  }
}

function plainText(text: string): MdInline {
  return { kind: 'text', text: decodeEntities(text) };
}

/** The plain text of inline content, for image alt text. */
function flatten(inlines: MdInline[]): string {
  return inlines
    .map((inline) => {
      if (inline.kind === 'text' || inline.kind === 'code') return inline.text;
      if (inline.kind === 'image') return inline.alt;
      if (inline.kind === 'break') return ' ';
      return flatten(inline.children);
    })
    .join('');
}
