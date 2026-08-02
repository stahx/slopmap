import { describe, expect, test } from 'vitest';

import { filterGraph, idOf } from './filterGraph.js';

const NODES_FIXTURE = [
  {
    id: 'src/a.js',
    rootGroup: 'src',
    group: 'src',
    section: 'src',
    status: 'changed',
  },
  {
    id: 'src/lib/b.js',
    rootGroup: 'src',
    group: 'src/lib',
    section: 'src/lib',
    status: 'normal',
  },
  {
    id: 'test/c.js',
    rootGroup: 'test',
    group: 'test',
    section: 'test',
    status: 'dependent',
  },
  {
    id: 'docs/d.md',
    rootGroup: 'docs',
    group: 'docs',
    section: 'docs',
    status: 'normal',
  },
];
const LINKS_FIXTURE = [
  { source: 'src/a.js', target: 'src/lib/b.js' },
  { source: { id: 'src/lib/b.js' }, target: { id: 'test/c.js' } },
];

const filterFixture = (overrides = {}) =>
  filterGraph({
    nodes: NODES_FIXTURE,
    links: LINKS_FIXTURE,
    aggregateFilter: null,
    impactOnly: false,
    hideIsolated: false,
    diffMode: false,
    ...overrides,
  });

describe('app/src/lib/filterGraph', () => {
  test('idOf', () => {
    expect(idOf('src/a.js')).toBe('src/a.js');
    expect(idOf({ id: 'src/b.js' })).toBe('src/b.js');
  });

  test('filterGraph aggregate filters', () => {
    expect(
      filterFixture({
        aggregateFilter: { mode: 'root', value: 'src' },
      }).nodes,
    ).toEqual([NODES_FIXTURE[0], NODES_FIXTURE[1]]);
    expect(
      filterFixture({
        aggregateFilter: { mode: 'group', value: 'src/lib' },
      }).nodes,
    ).toEqual([NODES_FIXTURE[1]]);
    expect(
      filterFixture({
        aggregateFilter: { mode: 'section', value: 'test' },
      }).nodes,
    ).toEqual([NODES_FIXTURE[2]]);
  });

  test('filterGraph impactOnly', () => {
    expect(filterFixture({ impactOnly: true, diffMode: true }).nodes).toEqual([
      NODES_FIXTURE[0],
      NODES_FIXTURE[2],
    ]);
    expect(filterFixture({ impactOnly: true }).nodes).toEqual(NODES_FIXTURE);
  });

  test('filterGraph hideIsolated', () => {
    const result = filterFixture({
      aggregateFilter: { mode: 'root', value: 'src' },
      hideIsolated: true,
    });

    expect(result.nodes).toEqual([NODES_FIXTURE[0], NODES_FIXTURE[1]]);
    expect(result.links).toEqual([LINKS_FIXTURE[0]]);
    expect(filterFixture({ hideIsolated: true }).nodes).toEqual(NODES_FIXTURE.slice(0, 3));
  });
});
