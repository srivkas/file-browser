// Decides what a Markdown link may do. Only an http(s) address with a host and
// no user name or password (`https://github.com@evil.example` opens evil.example)
// becomes a web link, and only its normalized form is kept; everything else
// (file paths, #headings, mailto:, javascript:, data:, malformed addresses)
// is inert and keeps no address at all.

export type LinkTarget = { kind: 'web'; href: string } | { kind: 'inert' };

const WEB_PROTOCOLS = new Set(['http:', 'https:']);

export function classifyLink(href: string): LinkTarget {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { kind: 'inert' };
  }
  if (!WEB_PROTOCOLS.has(url.protocol) || url.hostname === '') return { kind: 'inert' };
  if (url.username !== '' || url.password !== '') return { kind: 'inert' };
  return { kind: 'web', href: url.href };
}

// Decides where a Markdown image may come from. Only a path inside the open
// folder becomes a local image: relative to the Markdown file's folder, or to
// the open folder itself when it starts with `/`. Anything with a scheme
// (`https:`, `data:`, `file:`, `C:`), a `//` address, a backslash, bad
// percent-encoding, a segment that decodes to `/`, `\` or `:`, or a path
// that climbs out of the folder is a placeholder and is never loaded.

export type ImageTarget = { kind: 'local'; path: string } | { kind: 'placeholder' };

const PLACEHOLDER: ImageTarget = { kind: 'placeholder' };
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Classifies an image source (entities already decoded) found in the Markdown file at `filePath`,
 * a tree path such as `proj/docs/guide.md`. A local verdict holds a tree path such as `proj/img/a.png`.
 */
export function classifyImage(src: string, filePath: string): ImageTarget {
  if (SCHEME.test(src) || src.startsWith('//') || src.includes('\\')) return PLACEHOLDER;

  const end = src.search(/[?#]/);
  const path = end === -1 ? src : src.slice(0, end);
  if (path === '') return PLACEHOLDER;

  const fileParts = filePath.split('/');
  const parts = path.startsWith('/') ? fileParts.slice(0, 1) : fileParts.slice(0, -1);
  // Split first, then decode each segment, so an encoded `/` (`%2F`) can never become a separator.
  for (const raw of path.split('/')) {
    let segment: string;
    try {
      segment = decodeURIComponent(raw);
    } catch {
      return PLACEHOLDER;
    }
    if (/[/\\:]/.test(segment)) return PLACEHOLDER;
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      // The root folder itself can never be left.
      if (parts.length <= 1) return PLACEHOLDER;
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  // Only the root folder is left: no file named.
  if (parts.length <= 1) return PLACEHOLDER;
  return { kind: 'local', path: parts.join('/') };
}
