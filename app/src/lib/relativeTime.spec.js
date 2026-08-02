import { describe, expect, test } from 'vitest';

import { formatRelativeTime } from './relativeTime.js';

describe('app/src/lib/relativeTime', () => {
  test('formatRelativeTime', () => {
    const nowMs = Date.parse('2026-08-02T12:00:00.000Z');

    expect(formatRelativeTime('2026-08-02T11:59:45.000Z', nowMs)).toBe(
      '15s ago'
    );
    expect(formatRelativeTime('2026-08-02T11:57:31.000Z', nowMs)).toBe(
      '2m ago'
    );
    expect(formatRelativeTime('2026-08-02T06:12:00.000Z', nowMs)).toBe(
      '5h ago'
    );
    expect(formatRelativeTime('2026-08-02T12:00:05.000Z', nowMs)).toBe(
      '0s ago'
    );
    expect(formatRelativeTime('not-a-date', nowMs)).toBe('');
    expect(formatRelativeTime('2026-08-02T12:00:00.000Z', Number.NaN)).toBe('');
  });
});
