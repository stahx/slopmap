import { describe, expect, test } from 'vitest';

import { GROUP_COLORS } from './graphTokens.js';
import { buildPayloadIndex } from './payloadIndex.js';

const GRAPH_FIXTURE = {
  groups: [
    { name: 'alpha', count: 4 },
    { name: 'beta', count: 3 },
    { name: 'gamma', count: 2 },
    { name: 'delta', count: 2 },
    { name: 'epsilon', count: 1 },
    { name: 'zeta', count: 1 },
    { name: 'eta', count: 1 },
    { name: 'theta', count: 1 },
    { name: 'iota', count: 1 },
  ],
  links: [
    { source: 'alpha/a.js', target: 'beta/b.js' },
    { source: { id: 'alpha/a.js' }, target: { id: 'gamma/c.js' } },
    { source: 'delta/d.js', target: 'beta/b.js' },
  ],
};

describe('app/src/lib/payloadIndex', () => {
  test('buildPayloadIndex', () => {
    const result = buildPayloadIndex(GRAPH_FIXTURE);

    expect(result.importerCountsByTarget).toEqual(
      new Map([
        ['beta/b.js', 2],
        ['gamma/c.js', 1],
      ]),
    );
    expect(result.importedTargetsBySource).toEqual(
      new Map([
        ['alpha/a.js', new Set(['beta/b.js', 'gamma/c.js'])],
        ['delta/d.js', new Set(['beta/b.js'])],
      ]),
    );
    expect(result.groupColors).toEqual(
      new Map(
        GRAPH_FIXTURE.groups
          .slice(0, 8)
          .map((group, slotIndex) => [group.name, GROUP_COLORS[slotIndex]]),
      ),
    );
    expect(result.groupColors.has('iota')).toBe(false);
  });
});
