import { useEffect, useState } from 'react';
import { formatImagePlaceholder } from '../lib/format';
import { isImage } from '../lib/image';
import { findFile, type DirNode } from '../lib/tree';

// An image from the open folder, shown through a blob: URL made from the file
// itself; the Markdown text never becomes a src. A path with no file, or a file
// that is not an image or cannot be decoded, shows the placeholder.
export function LocalImage({ root, path, alt }: { root: DirNode; path: string; alt: string }) {
  const file = findFile(root, path);
  if (!file || !isImage(file)) return <ImagePlaceholder alt={alt} />;
  return <ObjectUrlImage file={file} alt={alt} />;
}

export function ImagePlaceholder({ alt }: { alt: string }) {
  const label = formatImagePlaceholder(alt);
  return (
    <span className="md-image-placeholder" role="img" aria-label={label}>
      {label}
    </span>
  );
}

function ObjectUrlImage({ file, alt }: { file: File; alt: string }) {
  const [shown, setShown] = useState<{ file: File; url: string } | null>(null);
  const [failed, setFailed] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    // Set after the effect, not inside it (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => {
      if (!cancelled) setShown({ file, url });
    });
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Nothing until this file's URL is ready; a URL of an earlier file is never shown.
  if (failed === file) return <ImagePlaceholder alt={alt} />;
  if (shown?.file !== file) return null;
  // A file the browser cannot decode (HEIC, TIFF, corrupt bytes) falls back to the placeholder.
  return <img className="md-image" src={shown.url} alt={alt} onError={() => setFailed(file)} />;
}
