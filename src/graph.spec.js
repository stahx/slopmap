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

const COSMOS_SOURCES = [
  {
    filePath: 'apps/cosmos/section-01/changed.ts',
    loc: 100,
    specifiers: ['./local-dependent', '../../section-03/dependency', '../../section-03/normal', '../../section-04/dependency'],
  },
  { filePath: 'apps/cosmos/section-01/local-dependent.ts', loc: 50, specifiers: ['./changed'] },
  { filePath: 'apps/cosmos/section-02/dependent.ts', loc: 30, specifiers: ['../../section-01/changed'] },
  { filePath: 'apps/cosmos/section-03/dependency.ts', loc: 20, specifiers: [] },
  { filePath: 'apps/cosmos/section-03/normal.ts', loc: 10, specifiers: [] },
  { filePath: 'apps/cosmos/section-04/dependent.ts', loc: 40, specifiers: ['../../section-01/changed'] },
  { filePath: 'apps/cosmos/section-04/dependency.ts', loc: 60, specifiers: [] },
  { filePath: 'apps/cosmos/section-05/file.ts', loc: 5, specifiers: [] },
  { filePath: 'apps/cosmos/section-06/file.ts', loc: 6, specifiers: [] },
  { filePath: 'apps/cosmos/section-07/file.ts', loc: 7, specifiers: [] },
  { filePath: 'apps/cosmos/section-08/file.ts', loc: 8, specifiers: [] },
  { filePath: 'apps/cosmos/section-09/file.ts', loc: 9, specifiers: [] },
  { filePath: 'apps/cosmos/section-10/file.ts', loc: 10, specifiers: [] },
  { filePath: 'apps/cosmos/section-11/file.ts', loc: 11, specifiers: [] },
  { filePath: 'apps/cosmos/section-12/file.ts', loc: 12, specifiers: [] },
  { filePath: 'apps/cosmos/section-13/file.ts', loc: 13, specifiers: [] },
  { filePath: 'apps/cosmos/hub.ts', loc: 7, specifiers: [] },
  { filePath: 'e2e/cypress/support.ts', loc: 8, specifiers: ['../run'] },
  { filePath: 'e2e/run.ts', loc: 9, specifiers: [] },
  { filePath: 'README.js', loc: 11, specifiers: [] },
  { filePath: 'packages/ui/components/Button.ts', loc: 12, specifiers: [] },
];

const COSMOS_RESOLUTIONS = new Map([
  ['apps/cosmos/section-01/changed.ts\0./local-dependent', 'apps/cosmos/section-01/local-dependent.ts'],
  ['apps/cosmos/section-01/changed.ts\0../../section-03/dependency', 'apps/cosmos/section-03/dependency.ts'],
  ['apps/cosmos/section-01/changed.ts\0../../section-03/normal', 'apps/cosmos/section-03/normal.ts'],
  ['apps/cosmos/section-01/changed.ts\0../../section-04/dependency', 'apps/cosmos/section-04/dependency.ts'],
  ['apps/cosmos/section-01/local-dependent.ts\0./changed', 'apps/cosmos/section-01/changed.ts'],
  ['apps/cosmos/section-02/dependent.ts\0../../section-01/changed', 'apps/cosmos/section-01/changed.ts'],
  ['apps/cosmos/section-04/dependent.ts\0../../section-01/changed', 'apps/cosmos/section-01/changed.ts'],
  ['e2e/cypress/support.ts\0../run', 'e2e/run.ts'],
]);

const COSMOS_RESOLVER = {
  resolve: (fromFile, specifier) => COSMOS_RESOLUTIONS.get(`${fromFile}\0${specifier}`) || null,
  isInternalLooking: (specifier) => specifier.startsWith('.'),
};

const COSMOS_CHANGED_FILES = new Set(['apps/cosmos/section-01/changed.ts']);

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

  test('buildGraph cosmos', () => {
    const graph = buildGraph({
      sources: COSMOS_SOURCES,
      resolver: COSMOS_RESOLVER,
      changedFiles: COSMOS_CHANGED_FILES,
    });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const sectionsById = new Map(graph.cosmos.sections.map((section) => [section.id, section]));

    expect(nodesById.get('apps/cosmos/section-01/changed.ts').section).toBe('apps/cosmos/section-01');
    expect(nodesById.get('apps/cosmos/hub.ts').section).toBe('apps/cosmos');
    expect(nodesById.get('e2e/cypress/support.ts').section).toBe('e2e/cypress');
    expect(nodesById.get('e2e/run.ts').section).toBe('e2e');
    expect(nodesById.get('README.js').section).toBe('(root)');
    expect(nodesById.get('apps/cosmos/section-12/file.ts').section).toBe('apps/cosmos/(other)');
    expect(nodesById.get('apps/cosmos/section-13/file.ts').section).toBe('apps/cosmos/(other)');
    expect(
      graph.cosmos.sections.filter(
        (section) => section.group === 'apps/cosmos' && section.id !== 'apps/cosmos'
      )
    ).toHaveLength(12);
    expect(sectionsById.has('apps/cosmos/section-12')).toBe(false);
    expect(sectionsById.has('apps/cosmos/section-13')).toBe(false);
    expect(sectionsById.get('apps/cosmos/(other)')).toMatchObject({ fileCount: 2, loc: 25 });
    expect(sectionsById.get('packages/ui')).toEqual({
      id: 'packages/ui',
      group: 'packages/ui',
      fileCount: 0,
      loc: 0,
      changedCount: 0,
      dependentCount: 0,
      dependencyCount: 0,
      changedFiles: [],
      status: 'normal',
    });
    expect(graph.cosmos.links).toContainEqual({
      source: 'apps/cosmos',
      target: 'apps/cosmos/section-01',
      kind: 'orbit',
    });
    expect(graph.cosmos.links).toContainEqual({
      source: 'apps/cosmos',
      target: 'apps/cosmos/(other)',
      kind: 'orbit',
    });
    expect(graph.cosmos.links).toContainEqual({
      source: 'packages/ui',
      target: 'packages/ui/components',
      kind: 'orbit',
    });
    expect(graph.cosmos.links).toContainEqual({
      source: 'apps/cosmos/section-01',
      target: 'apps/cosmos/section-03',
      kind: 'imports',
      weight: 2,
      hot: 1,
    });
    expect(graph.cosmos.links).toContainEqual({
      source: 'e2e/cypress',
      target: 'e2e',
      kind: 'imports',
      weight: 1,
      hot: 0,
    });
    expect(
      graph.cosmos.links.some(
        (link) => link.kind === 'imports' && link.source === link.target
      )
    ).toBe(false);
    expect(sectionsById.get('apps/cosmos/section-01')).toMatchObject({
      fileCount: 2,
      loc: 150,
      changedCount: 1,
      dependentCount: 1,
      dependencyCount: 0,
      changedFiles: ['apps/cosmos/section-01/changed.ts'],
      status: 'changed',
    });
    expect(sectionsById.get('apps/cosmos/section-03')).toMatchObject({
      loc: 30,
      dependencyCount: 2,
      status: 'dependency',
    });
    expect(sectionsById.get('apps/cosmos/section-04')).toMatchObject({
      loc: 100,
      dependentCount: 1,
      dependencyCount: 1,
      status: 'dependent',
    });
  });
});
