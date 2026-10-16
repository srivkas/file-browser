import type { RelativeTime } from './time';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${UNITS[unit]}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/** "just now", "1 day ago", "3 days ago". */
export function formatRelativeTime(time: RelativeTime): string {
  if (time.unit === 'now') return 'just now';
  return `${time.count} ${time.unit}${time.count === 1 ? '' : 's'} ago`;
}

export function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** Human-readable type: the browser's MIME type, else the extension. */
export function fileType(file: File): string {
  if (file.type) return file.type;
  const ext = extension(file.name);
  return ext ? `.${ext} file` : 'Unknown';
}
