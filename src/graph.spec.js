import { describe, expect, test } from 'vitest';

import { buildGraph } from './graph.js';

const SOURCES = [
  {
    filePath: 'apps/web/entry.ts',
    loc: 120,
    specifiers: [
      './dep-one',
      './duplicate-dep',
      '../../packages/shared/dep-two',
      './missing',
      'external-package',
    ],
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
  ['apps/web/entry.ts\0../../packages/shared/dep-two', 'packages/shared/dep-two.ts'],
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

const CHANGES = {
  files: [
    { path: 'apps/web/entry.ts', status: 'M', additions: 10, deletions: 2 },
    { path: 'apps/web/consumer.ts', status: 'R', additions: 4, deletions: 1 },
    { path: 'apps/web/deleted.ts', status: 'D', additions: 0, deletions: 8 },
  ],
  totals: { additions: 14, deletions: 11 },
};

const COSMOS_SOURCES = [
  {
    filePath: 'apps/cosmos/section-01/changed.ts',
    loc: 100,
    specifiers: [
      './local-dependent',
      '../../section-03/dependency',
      '../../section-03/normal',
      '../../section-04/dependency',
    ],
  },
  { filePath: 'apps/cosmos/section-01/local-dependent.ts', loc: 50, specifiers: ['./changed'] },
  {
    filePath: 'apps/cosmos/section-02/dependent.ts',
    loc: 30,
    specifiers: ['../../section-01/changed'],
  },
  { filePath: 'apps/cosmos/section-03/dependency.ts', loc: 20, specifiers: [] },
  { filePath: 'apps/cosmos/section-03/normal.ts', loc: 10, specifiers: [] },
  {
    filePath: 'apps/cosmos/section-04/dependent.ts',
    loc: 40,
    specifiers: ['../../section-01/changed'],
  },
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
  [
    'apps/cosmos/section-01/changed.ts\0./local-dependent',
    'apps/cosmos/section-01/local-dependent.ts',
  ],
  [
    'apps/cosmos/section-01/changed.ts\0../../section-03/dependency',
    'apps/cosmos/section-03/dependency.ts',
  ],
  [
    'apps/cosmos/section-01/changed.ts\0../../section-03/normal',
    'apps/cosmos/section-03/normal.ts',
  ],
  [
    'apps/cosmos/section-01/changed.ts\0../../section-04/dependency',
    'apps/cosmos/section-04/dependency.ts',
  ],
  ['apps/cosmos/section-01/local-dependent.ts\0./changed', 'apps/cosmos/section-01/changed.ts'],
  [
    'apps/cosmos/section-02/dependent.ts\0../../section-01/changed',
    'apps/cosmos/section-01/changed.ts',
  ],
  [
    'apps/cosmos/section-04/dependent.ts\0../../section-01/changed',
    'apps/cosmos/section-01/changed.ts',
  ],
  ['e2e/cypress/support.ts\0../run', 'e2e/run.ts'],
]);

const COSMOS_RESOLVER = {
  resolve: (fromFile, specifier) => COSMOS_RESOLUTIONS.get(`${fromFile}\0${specifier}`) || null,
  isInternalLooking: (specifier) => specifier.startsWith('.'),
};

const COSMOS_CHANGED_FILES = new Set(['apps/cosmos/section-01/changed.ts']);

const COSMOS_CHANGES = {
  files: [
    { path: 'apps/cosmos/section-01/changed.ts', status: 'M', additions: 7, deletions: 3 },
    { path: 'apps/cosmos/section-12/deleted.ts', status: 'D', additions: 0, deletions: 4 },
  ],
  totals: { additions: 7, deletions: 7 },
};

const CAPPED_DOWNSTREAM_SOURCES = [
  { filePath: 'core/changed.ts', loc: 20, specifiers: [] },
  ...Array.from({ length: 205 }, (unusedValue, fileIndex) => ({
    filePath: `consumers/file-${String(fileIndex).padStart(3, '0')}.ts`,
    loc: 10,
    specifiers: ['../core/changed'],
  })),
];

const CAPPED_DOWNSTREAM_RESOLVER = {
  resolve: (fromFile, specifier) => (specifier === '../core/changed' ? 'core/changed.ts' : null),
  isInternalLooking: (specifier) => specifier.startsWith('.'),
};

describe('src/graph', () => {
  test('buildGraph', () => {
    const graph = buildGraph({
      sources: SOURCES,
      resolver: RESOLVER,
      changedFiles: CHANGED_FILES,
      changes: CHANGES,
    });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

    expect(nodesById.get('apps/web/entry.ts').status).toBe('changed');
    expect(nodesById.get('apps/web/consumer.ts').status).toBe('changed');
    expect(nodesById.get('apps/web/page.ts').status).toBe('dependent');
    expect(nodesById.get('apps/web/dep-one.ts').status).toBe('dependency');
    expect(nodesById.get('packages/shared/dep-two.ts').status).toBe('dependency');
    expect(nodesById.get('index.ts').status).toBe('normal');
    expect(graph.links).toEqual([
      { source: 'apps/web/entry.ts', target: 'apps/web/dep-one.ts', hot: 1 },
      { source: 'apps/web/entry.ts', target: 'packages/shared/dep-two.ts', hot: 1 },
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
      linkCount: 6,
      unresolvedCount: 1,
      changedCount: 2,
      dependentCount: 1,
      dependencyCount: 2,
    });
    expect(graph.changes).toEqual({
      files: [
        {
          path: 'apps/web/entry.ts',
          status: 'M',
          additions: 10,
          deletions: 2,
          section: 'apps/web',
          group: 'apps/web',
          rootGroup: 'apps',
        },
        {
          path: 'apps/web/consumer.ts',
          status: 'R',
          additions: 4,
          deletions: 1,
          section: 'apps/web',
          group: 'apps/web',
          rootGroup: 'apps',
        },
        {
          path: 'apps/web/deleted.ts',
          status: 'D',
          additions: 0,
          deletions: 8,
          section: 'apps/web',
          group: 'apps/web',
          rootGroup: 'apps',
        },
      ],
      totals: { additions: 14, deletions: 11 },
    });
  });

  test('buildGraph dirs', () => {
    const graph = buildGraph({
      sources: COSMOS_SOURCES,
      resolver: COSMOS_RESOLVER,
      changedFiles: COSMOS_CHANGED_FILES,
      changes: COSMOS_CHANGES,
    });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const sectionsById = new Map(
      graph.levels.dirs.sections.map((section) => [section.id, section]),
    );

    expect(nodesById.get('apps/cosmos/section-01/changed.ts').section).toBe(
      'apps/cosmos/section-01',
    );
    expect(nodesById.get('apps/cosmos/hub.ts').section).toBe('apps/cosmos');
    expect(nodesById.get('e2e/cypress/support.ts').section).toBe('e2e/cypress');
    expect(nodesById.get('e2e/run.ts').section).toBe('e2e');
    expect(nodesById.get('README.js').section).toBe('(root)');
    expect(nodesById.get('apps/cosmos/section-12/file.ts').section).toBe('apps/cosmos/(other)');
    expect(nodesById.get('apps/cosmos/section-13/file.ts').section).toBe('apps/cosmos/(other)');
    expect(
      graph.levels.dirs.sections.filter(
        (section) => section.group === 'apps/cosmos' && section.id !== 'apps/cosmos',
      ),
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
      additions: 0,
      deletions: 0,
      changedFiles: [],
      status: 'normal',
    });
    expect(graph.levels.dirs.links).toContainEqual({
      source: 'apps/cosmos',
      target: 'apps/cosmos/section-01',
      kind: 'orbit',
    });
    expect(graph.levels.dirs.links).toContainEqual({
      source: 'apps/cosmos',
      target: 'apps/cosmos/(other)',
      kind: 'orbit',
    });
    expect(graph.levels.dirs.links).toContainEqual({
      source: 'packages/ui',
      target: 'packages/ui/components',
      kind: 'orbit',
    });
    expect(graph.levels.dirs.links).toContainEqual({
      source: 'apps/cosmos/section-01',
      target: 'apps/cosmos/section-03',
      kind: 'imports',
      weight: 2,
      hot: 1,
    });
    expect(graph.levels.dirs.links).toContainEqual({
      source: 'e2e/cypress',
      target: 'e2e',
      kind: 'imports',
      weight: 1,
      hot: 0,
    });
    expect(
      graph.levels.dirs.links.some(
        (link) => link.kind === 'imports' && link.source === link.target,
      ),
    ).toBe(false);
    expect(sectionsById.get('apps/cosmos/section-01')).toMatchObject({
      fileCount: 2,
      loc: 150,
      changedCount: 1,
      dependentCount: 1,
      dependencyCount: 0,
      changedFiles: ['apps/cosmos/section-01/changed.ts'],
      status: 'changed',
      additions: 7,
      deletions: 3,
      downstream: [
        { id: 'apps/cosmos/section-02', count: 1 },
        { id: 'apps/cosmos/section-04', count: 1 },
      ],
      downstreamFiles: [
        'apps/cosmos/section-02/dependent.ts',
        'apps/cosmos/section-04/dependent.ts',
      ],
      downstreamTotal: 2,
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
    expect(sectionsById.get('apps/cosmos/(other)')).toMatchObject({
      additions: 0,
      deletions: 4,
    });
    expect(graph.changes.files[1]).toEqual({
      path: 'apps/cosmos/section-12/deleted.ts',
      status: 'D',
      additions: 0,
      deletions: 4,
      section: 'apps/cosmos/(other)',
      group: 'apps/cosmos',
      rootGroup: 'apps',
    });
  });

  test('buildGraph levels roots', () => {
    const graph = buildGraph({
      sources: SOURCES,
      resolver: RESOLVER,
      changedFiles: CHANGED_FILES,
      changes: CHANGES,
    });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const rootsById = new Map(graph.levels.roots.sections.map((section) => [section.id, section]));

    expect(graph.levels.roots.sections.map((section) => section.id)).toEqual([
      'apps',
      'packages',
      '(root)',
      'utils',
    ]);
    expect(nodesById.get('apps/web/entry.ts').rootGroup).toBe('apps');
    expect(nodesById.get('packages/shared/dep-two.ts').rootGroup).toBe('packages');
    expect(nodesById.get('index.ts').rootGroup).toBe('(root)');
    expect(rootsById.get('apps')).toMatchObject({
      group: 'apps',
      fileCount: 4,
      loc: 310,
      changedCount: 2,
      dependentCount: 1,
      dependencyCount: 1,
      additions: 14,
      deletions: 11,
      downstream: [],
      downstreamFiles: [],
      downstreamTotal: 0,
      status: 'changed',
    });
    expect(graph.levels.roots.links).toContainEqual({
      source: 'apps',
      target: 'packages',
      kind: 'imports',
      weight: 2,
      hot: 1,
    });
    expect(graph.levels.roots.links).toContainEqual({
      source: 'utils',
      target: '(root)',
      kind: 'imports',
      weight: 1,
      hot: 0,
    });
    expect(graph.levels.roots.links.some((link) => link.kind === 'orbit')).toBe(false);

    const cappedGraph = buildGraph({
      sources: COSMOS_SOURCES,
      resolver: COSMOS_RESOLVER,
      changedFiles: COSMOS_CHANGED_FILES,
      changes: COSMOS_CHANGES,
    });
    expect(cappedGraph.levels.roots.sections.map((section) => section.id)).toEqual([
      'apps',
      'e2e',
      '(root)',
      'packages',
    ]);
    expect(
      cappedGraph.levels.roots.sections.find((section) => section.id === 'apps'),
    ).toMatchObject({
      group: 'apps',
      fileCount: 17,
      additions: 7,
      deletions: 7,
      downstream: [],
      downstreamFiles: [],
      downstreamTotal: 0,
    });
    expect(
      cappedGraph.levels.roots.sections.some((section) => section.id.includes('(other)')),
    ).toBe(false);
  });

  test('buildGraph levels groups', () => {
    const graph = buildGraph({
      sources: SOURCES,
      resolver: RESOLVER,
      changedFiles: CHANGED_FILES,
      changes: CHANGES,
    });
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const groupsById = new Map(graph.levels.groups.sections.map((group) => [group.id, group]));

    expect(graph.levels.groups.sections.map((group) => group.id)).toEqual([
      'apps/web',
      'packages/shared',
      '(root)',
      'utils',
    ]);
    expect(nodesById.get('apps/web/entry.ts')).toMatchObject({
      rootGroup: 'apps',
      group: 'apps/web',
      section: 'apps/web',
    });
    expect(groupsById.get('apps/web')).toMatchObject({
      group: 'apps/web',
      fileCount: 4,
      loc: 310,
      changedCount: 2,
      dependentCount: 1,
      dependencyCount: 1,
      additions: 14,
      deletions: 11,
      changedFiles: ['apps/web/entry.ts', 'apps/web/consumer.ts'],
      downstream: [],
      downstreamFiles: [],
      downstreamTotal: 0,
      status: 'changed',
    });
    expect(groupsById.get('packages/shared')).toMatchObject({
      group: 'packages/shared',
      fileCount: 1,
      status: 'dependency',
    });
    expect(graph.levels.groups.links).toContainEqual({
      source: 'apps/web',
      target: 'packages/shared',
      kind: 'imports',
      weight: 2,
      hot: 1,
    });
    expect(graph.levels.groups.links).toContainEqual({
      source: 'utils',
      target: '(root)',
      kind: 'imports',
      weight: 1,
      hot: 0,
    });
    expect(graph.levels.groups.links.some((link) => link.kind === 'orbit')).toBe(false);
  });

  test('buildGraph caps sorted downstream files', () => {
    const graph = buildGraph({
      sources: CAPPED_DOWNSTREAM_SOURCES,
      resolver: CAPPED_DOWNSTREAM_RESOLVER,
      changedFiles: new Set(['core/changed.ts']),
    });
    const changedSection = graph.levels.dirs.sections.find((section) => section.id === 'core');

    expect(changedSection.downstreamTotal).toBe(205);
    expect(changedSection.downstreamFiles).toHaveLength(200);
    expect(changedSection.downstreamFiles[0]).toBe('consumers/file-000.ts');
    expect(changedSection.downstreamFiles.at(-1)).toBe('consumers/file-199.ts');
  });
});
