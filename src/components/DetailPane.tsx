import { Fragment, useEffect, useState } from 'react';
import type { FileNode } from '../lib/tree';
import { fileType, formatBytes, formatDate } from '../lib/format';
import { isImage, readExif, readImageDimensions, type ExifRow, type ImageDimensions } from '../lib/image';

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
        <dd>{formatDate(file.lastModified)}</dd>
      </dl>
      {/* key resets image state when the selection changes */}
      {isImage(file) && <ImageDetails key={node.path} file={file} />}
    </div>
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
