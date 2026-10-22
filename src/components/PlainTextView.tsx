import type { CSSProperties } from 'react';
import { splitLines } from '../lib/text';

export function PlainTextView({ text }: { text: string }) {
  const lines = splitLines(text);
  // The gutter is as wide as the largest line number.
  const style = { '--gutter-digits': String(lines.length).length } as CSSProperties;
  return (
    <div className="plain-text" style={style}>
      {lines.map((line, i) => (
        <div className="plain-text-row" key={i}>
          <span className="plain-text-num" aria-hidden="true">
            {i + 1}
          </span>
          <span className="plain-text-line">{line}</span>
        </div>
      ))}
    </div>
  );
}
