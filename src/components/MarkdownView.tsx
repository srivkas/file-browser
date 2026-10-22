import { useMemo } from 'react';
import { formatImagePlaceholder } from '../lib/format';
import { parseMarkdown, type MdAlign, type MdBlock, type MdInline } from '../lib/markdown';
import { PlainTextView } from './PlainTextView';

// Renders the app's Markdown model with React elements only: no HTML strings,
// no URLs. Links are inert text and images are placeholders.
// Text the parser cannot handle falls back to the plain view.
export function MarkdownView({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  if (blocks === null) return <PlainTextView text={text} />;
  return (
    <div className="markdown">
      <Blocks blocks={blocks} />
    </div>
  );
}

function Blocks({ blocks }: { blocks: MdBlock[] }) {
  return blocks.map((block, i) => <Block key={i} block={block} />);
}

function Block({ block }: { block: MdBlock }) {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${block.level}` as const;
      return (
        <Tag>
          <Inlines inlines={block.children} />
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p>
          <Inlines inlines={block.children} />
        </p>
      );
    case 'plain':
      return <Inlines inlines={block.children} />;
    case 'raw':
      return <p className="md-raw">{block.text}</p>;
    case 'code':
      return (
        <pre>
          <code>{block.text}</code>
        </pre>
      );
    case 'quote':
      return (
        <blockquote>
          <Blocks blocks={block.blocks} />
        </blockquote>
      );
    case 'list': {
      const items = block.items.map((item, i) => (
        <li key={i} className={item.checked === null ? undefined : 'md-task'}>
          {item.checked !== null && <input type="checkbox" checked={item.checked} disabled readOnly />}
          <Blocks blocks={item.blocks} />
        </li>
      ));
      return block.ordered ? <ol start={block.start}>{items}</ol> : <ul>{items}</ul>;
    }
    case 'rule':
      return <hr />;
    case 'table':
      return (
        <div className="md-table-wrap">
          <table>
            <thead>
              <tr>
                {block.header.map((cell, c) => (
                  <th key={c} className={alignClass(block.align[c])}>
                    <Inlines inlines={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className={alignClass(block.align[c])}>
                      <Inlines inlines={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function alignClass(align: MdAlign | undefined): string | undefined {
  return align ? `md-align-${align}` : undefined;
}

function Inlines({ inlines }: { inlines: MdInline[] }) {
  return inlines.map((inline, i) => <Inline key={i} inline={inline} />);
}

function Inline({ inline }: { inline: MdInline }) {
  switch (inline.kind) {
    case 'text':
      return inline.text;
    case 'strong':
      return (
        <strong>
          <Inlines inlines={inline.children} />
        </strong>
      );
    case 'em':
      return (
        <em>
          <Inlines inlines={inline.children} />
        </em>
      );
    case 'del':
      return (
        <del>
          <Inlines inlines={inline.children} />
        </del>
      );
    case 'code':
      return <code>{inline.text}</code>;
    case 'break':
      return <br />;
    case 'link':
      return (
        <span className="md-inert-link">
          <Inlines inlines={inline.children} />
        </span>
      );
    case 'image': {
      const label = formatImagePlaceholder(inline.alt);
      return (
        <span className="md-image-placeholder" role="img" aria-label={label}>
          {label}
        </span>
      );
    }
  }
}
