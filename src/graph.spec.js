import { describe, expect, test } from 'vitest';

import { buildGraph } from './graph.js';

const SOURCES = [
  {
    filePath: 'apps/web/entry.ts',
    loc: 120,
    specifiers: ['./dep-one', './duplicate-dep', './missing', 'external-package'],
  },
  {
    filePath: 'apps/web/dep-one.ts',
    loc: 80,
    specifiers: ['../../packages/shared/dep-two'],
  },
  { filePath: 'packages/shared/dep-two.ts', loc: 40, specifiers: [] },
  { filePath: 'apps/web/consumer.ts', loc: 60, specifiers: ['./entry'] },
  { filePath: 'apps/web/page.ts', loc: 50, specifiers: ['./consumer'] },
  { filePath: 'index.ts', loc: 20, specifiers: [] },
  { filePath: 'utils/tool.ts', loc: 30, specifiers: ['../index'] },
];

const RESOLUTIONS = new Map([
  ['apps/web/entry.ts\0./dep-one', 'apps/web/dep-one.ts'],
  ['apps/web/entry.ts\0./duplicate-dep', 'apps/web/dep-one.ts'],
  ['apps/web/dep-one.ts\0../../packages/shared/dep-two', 'packages/shared/dep-two.ts'],
  ['apps/web/consumer.ts\0./entry', 'apps/web/entry.ts'],
  ['apps/web/page.ts\0./consumer', 'apps/web/consumer.ts'],
  ['utils/tool.ts\0../index', 'index.ts'],
]);

const RESOLVER = {
  resolve: (fromFile, specifier) => RESOLUTIONS.get(`${fromFile}\0${specifier}`) || null,
  isInternalLooking: (specifier) => specifier.startsWith('.'),
};

const CHANGED_FILES = new Set(['apps/web/entry.ts', 'apps/web/consumer.ts']);

describe('src/graph', () => {
  test('buildGraph', () => {
    const graph = buildGraph({ sources: SOURCES, resolver: RESOLVER, changedFiles: CHANGED_FILES });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

    expect(nodesById.get('apps/web/entry.ts').status).toBe('changed');
    expect(nodesById.get('apps/web/consumer.ts').status).toBe('changed');
    expect(nodesById.get('apps/web/page.ts').status).toBe('dependent');
    expect(nodesById.get('apps/web/dep-one.ts').status).toBe('dependency');
    expect(nodesById.get('packages/shared/dep-two.ts').status).toBe('dependency');
    expect(nodesById.get('index.ts').status).toBe('normal');
    expect(graph.links).toEqual([
      { source: 'apps/web/entry.ts', target: 'apps/web/dep-one.ts', hot: 1 },
      { source: 'apps/web/dep-one.ts', target: 'packages/shared/dep-two.ts', hot: 1 },
      { source: 'apps/web/consumer.ts', target: 'apps/web/entry.ts', hot: 1 },
      { source: 'apps/web/page.ts', target: 'apps/web/consumer.ts', hot: 1 },
      { source: 'utils/tool.ts', target: 'index.ts', hot: 0 },
    ]);
    expect(graph.groups).toEqual([
      { name: 'apps/web', count: 4 },
      { name: 'packages/shared', count: 1 },
      { name: '(root)', count: 1 },
      { name: 'utils', count: 1 },
    ]);
    expect(graph.stats).toEqual({
      fileCount: 7,
      linkCount: 5,
      unresolvedCount: 1,
      changedCount: 2,
      dependentCount: 1,
      dependencyCount: 2,
    });
  });
});
