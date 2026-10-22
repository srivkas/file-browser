import { useMemo } from 'react';
import { parseMarkdown, type MdAlign, type MdBlock, type MdInline } from '../lib/markdown';
import type { DirNode } from '../lib/tree';
import { ImagePlaceholder, LocalImage } from './LocalImage';
import { PlainTextView } from './PlainTextView';

// Renders the app's Markdown model with React elements only: no HTML strings.
// Web links open in a new tab with no opener and no referrer; every other link
// is inert text. Images inside the open folder (`root`) are shown from their
// files; every other image is a placeholder.
// Text the parser cannot handle falls back to the plain view.
export function MarkdownView({ text, root, filePath }: { text: string; root: DirNode; filePath: string }) {
  const blocks = useMemo(() => parseMarkdown(text, filePath), [text, filePath]);
  if (blocks === null) return <PlainTextView text={text} />;
  return (
    <div className="markdown">
      <Blocks blocks={blocks} root={root} />
    </div>
  );
}

function Blocks({ blocks, root }: { blocks: MdBlock[]; root: DirNode }) {
  return blocks.map((block, i) => <Block key={i} block={block} root={root} />);
}

function Block({ block, root }: { block: MdBlock; root: DirNode }) {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${block.level}` as const;
      return (
        <Tag>
          <Inlines inlines={block.children} root={root} />
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p>
          <Inlines inlines={block.children} root={root} />
        </p>
      );
    case 'plain':
      return <Inlines inlines={block.children} root={root} />;
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
          <Blocks blocks={block.blocks} root={root} />
        </blockquote>
      );
    case 'list': {
      const items = block.items.map((item, i) => (
        <li key={i} className={item.checked === null ? undefined : 'md-task'}>
          {item.checked !== null && <input type="checkbox" checked={item.checked} disabled readOnly />}
          <Blocks blocks={item.blocks} root={root} />
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
                    <Inlines inlines={cell} root={root} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className={alignClass(block.align[c])}>
                      <Inlines inlines={cell} root={root} />
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

function Inlines({ inlines, root }: { inlines: MdInline[]; root: DirNode }) {
  return inlines.map((inline, i) => <Inline key={i} inline={inline} root={root} />);
}

function Inline({ inline, root }: { inline: MdInline; root: DirNode }) {
  switch (inline.kind) {
    case 'text':
      return inline.text;
    case 'strong':
      return (
        <strong>
          <Inlines inlines={inline.children} root={root} />
        </strong>
      );
    case 'em':
      return (
        <em>
          <Inlines inlines={inline.children} root={root} />
        </em>
      );
    case 'del':
      return (
        <del>
          <Inlines inlines={inline.children} root={root} />
        </del>
      );
    case 'code':
      return <code>{inline.text}</code>;
    case 'break':
      return <br />;
    case 'link':
      if (inline.target.kind === 'web') {
        return (
          <a className="md-web-link" href={inline.target.href} target="_blank" rel="noopener noreferrer">
            <Inlines inlines={inline.children} root={root} />
          </a>
        );
      }
      return (
        <span className="md-inert-link">
          <Inlines inlines={inline.children} root={root} />
        </span>
      );
    case 'image':
      if (inline.target.kind === 'local') return <LocalImage root={root} path={inline.target.path} alt={inline.alt} />;
      return <ImagePlaceholder alt={inline.alt} />;
  }
}
