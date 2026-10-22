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
