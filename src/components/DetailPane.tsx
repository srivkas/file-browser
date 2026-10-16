import { Fragment, useEffect, useState } from 'react';
import type { FileNode } from '../lib/tree';
import { fileType, formatBytes, formatDate, formatLineCount, formatRelativeTime } from '../lib/format';
import { relativeTime } from '../lib/time';
import { isImage, readExif, readImageDimensions, type ExifRow, type ImageDimensions } from '../lib/image';
import { canCountLines, countLines } from '../lib/text';

export function DetailPane({ node }: { node: FileNode }) {
  const { file } = node;
  return (
    <div className="details">
      <h2 className="details-title">{file.name}</h2>
      <dl className="props">
        <dt>Size</dt>
        <dd>{formatBytes(file.size)}</dd>
        <dt>Type</dt>
        <dd>{fileType(file)}</dd>
        <dt>Modified</dt>
        {/* key re-reads "now" when the selection changes */}
        <ModifiedDate key={node.path} timestamp={file.lastModified} />
        {/* key resets the count when the selection changes */}
        {canCountLines(file) && <LineCount key={node.path} file={file} />}
      </dl>
      {/* key resets image state when the selection changes */}
      {isImage(file) && <ImageDetails key={node.path} file={file} />}
    </div>
  );
}

function ModifiedDate({ timestamp }: { timestamp: number }) {
  // Captured once per file; the text doesn't update while the pane stays open.
  const [now] = useState(Date.now);
  return (
    <dd>
      {formatDate(timestamp)} <span className="muted">({formatRelativeTime(relativeTime(timestamp, now))})</span>
    </dd>
  );
}

function LineCount({ file }: { file: File }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    file.text().then(
      (text) => {
        if (!cancelled) setCount(countLines(text));
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [file]);

  // The row appears once the count is ready; unreadable files show no row.
  if (count === null) return null;
  return (
    <>
      <dt>Lines</dt>
      <dd>{formatLineCount(count)}</dd>
    </>
  );
}

interface ImageInfo {
  url: string;
  dimensions: ImageDimensions | null;
  exif: ExifRow[];
}

function ImageDetails({ file }: { file: File }) {
  const [info, setInfo] = useState<ImageInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    Promise.all([readImageDimensions(url).catch(() => null), readExif(file)]).then(([dimensions, exif]) => {
      if (!cancelled) setInfo({ url, dimensions, exif });
    });
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!info) return <p className="muted">Loading image…</p>;

  return (
    <>
      <img className="preview" src={info.url} alt={file.name} />
      <dl className="props">
        <dt>Dimensions</dt>
        <dd>{info.dimensions ? `${info.dimensions.width} × ${info.dimensions.height} px` : 'Unknown'}</dd>
      </dl>
      <h3 className="section-title">EXIF</h3>
      {info.exif.length > 0 ? (
        <dl className="props">
          {info.exif.map(([label, value]) => (
            <Fragment key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
        </dl>
      ) : (
        <p className="muted">No EXIF data.</p>
      )}
    </>
  );
}
