import { useEffect, useId, useState } from 'react';
import { formatPreviewMessage, PREVIEW_TITLE } from '../lib/format';
import { previewPlan } from '../lib/preview';
import { MarkdownView } from './MarkdownView';
import { PlainTextView } from './PlainTextView';

type ReadResult = { text: string } | 'failed' | null;

export function TextPreview({ file }: { file: File }) {
  const plan = previewPlan(file);
  const needsRead = plan === 'plain' || plan === 'markdown';
  const [result, setResult] = useState<ReadResult>(null);
  const titleId = useId();

  useEffect(() => {
    if (!needsRead) return;
    let cancelled = false;
    file.text().then(
      (text) => {
        if (!cancelled) setResult({ text });
      },
      () => {
        if (!cancelled) setResult('failed');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [file, needsRead]);

  // Not a text file, or unreadable: no Preview section at all.
  if (plan === 'none' || result === 'failed') return null;

  let body;
  if (plan === 'too-large' || plan === 'empty') body = <Message text={formatPreviewMessage(plan)} />;
  else if (result === null) body = <Message text={formatPreviewMessage('loading')} />;
  else if (plan === 'markdown') body = <MarkdownView text={result.text} />;
  else body = <PlainTextView text={result.text} />;

  return (
    <section className="text-preview" aria-labelledby={titleId}>
      <h3 id={titleId} className="section-title">
        {PREVIEW_TITLE}
      </h3>
      {body}
    </section>
  );
}

// Only messages are live regions; the file's content is never read aloud on arrival.
function Message({ text }: { text: string }) {
  return (
    <p className="muted" role="status">
      {text}
    </p>
  );
}
