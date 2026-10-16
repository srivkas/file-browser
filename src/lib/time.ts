const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type TimeUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';

/** How long ago something happened, in the largest whole unit. 'now' is under a minute, or in the future. */
export type RelativeTime = { unit: 'now' } | { unit: TimeUnit; count: number };

/** Elapsed time from `timestamp` to `now` (both ms since epoch). */
export function relativeTime(timestamp: number, now: number): RelativeTime {
  const elapsed = now - timestamp;
  if (elapsed < MINUTE) return { unit: 'now' };
  if (elapsed < HOUR) return { unit: 'minute', count: Math.floor(elapsed / MINUTE) };
  if (elapsed < DAY) return { unit: 'hour', count: Math.floor(elapsed / HOUR) };
  const days = Math.floor(elapsed / DAY);
  if (days < 30) return { unit: 'day', count: days };
  // Months are 30 days; capped so 360–364 days never reads as "12 months".
  if (days < 365) return { unit: 'month', count: Math.min(11, Math.floor(days / 30)) };
  return { unit: 'year', count: Math.floor(days / 365) };
}
