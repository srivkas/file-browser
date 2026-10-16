import { describe, expect, it } from 'vitest';
import { relativeTime } from './time';

describe('relativeTime', () => {
  const now = new Date(2026, 9, 16, 10, 0, 0).getTime();
  const at = (...args: [number, number, number, number, number, number]) => new Date(...args).getTime();
  const DAY = 24 * 3600_000;

  it('picks the largest whole unit', () => {
    expect(relativeTime(at(2026, 9, 16, 9, 59, 30), now)).toEqual({ unit: 'now' });
    expect(relativeTime(at(2026, 9, 16, 9, 59, 0), now)).toEqual({ unit: 'minute', count: 1 });
    expect(relativeTime(at(2026, 9, 16, 9, 15, 0), now)).toEqual({ unit: 'minute', count: 45 });
    expect(relativeTime(at(2026, 9, 16, 7, 0, 0), now)).toEqual({ unit: 'hour', count: 3 });
    expect(relativeTime(at(2026, 9, 15, 10, 0, 0), now)).toEqual({ unit: 'day', count: 1 });
    expect(relativeTime(at(2026, 9, 13, 17, 16, 49), now)).toEqual({ unit: 'day', count: 2 });
    expect(relativeTime(at(2026, 7, 1, 10, 0, 0), now)).toEqual({ unit: 'month', count: 2 });
    expect(relativeTime(at(2024, 2, 10, 10, 0, 0), now)).toEqual({ unit: 'year', count: 2 });
  });

  it('never returns 12 months', () => {
    expect(relativeTime(now - 364 * DAY, now)).toEqual({ unit: 'month', count: 11 });
    expect(relativeTime(now - 365 * DAY, now)).toEqual({ unit: 'year', count: 1 });
  });

  it('treats future times as now', () => {
    expect(relativeTime(at(2026, 9, 17, 10, 0, 0), now)).toEqual({ unit: 'now' });
  });
});
