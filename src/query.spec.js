import { describe, expect, test } from 'vitest';

import { buildGraph } from './graph.js';
import {
  changeImpact,
  createIndex,
  fileContext,
  findFiles,
  impactOf,
  resolveFilePath,
  sectionOverview,
} from './query.js';

const SOURCES = [
  { filePath: 'src/core/c.js', loc: 30, specifiers: [] },
  { filePath: 'src/core/b.js', loc: 20, specifiers: ['./c'] },
  { filePath: 'src/core/a.js', loc: 10, specifiers: ['./b', './c'] },
  { filePath: 'app/main.js', loc: 40, specifiers: ['../src/core/a'] },
  { filePath: 'app/util/index.js', loc: 5, specifiers: [] },
  { filePath: 'lib/util/index.js', loc: 5, specifiers: [] },
  { filePath: 'lib/loop/left.js', loc: 5, specifiers: ['./right'] },
  { filePath: 'lib/loop/right.js', loc: 5, specifiers: ['./left'] },
];

const RESOLUTIONS = new Map([
  ['src/core/b.js\0./c', 'src/core/c.js'],
  ['src/core/a.js\0./b', 'src/core/b.js'],
  ['src/core/a.js\0./c', 'src/core/c.js'],
  ['app/main.js\0../src/core/a', 'src/core/a.js'],
  ['lib/loop/left.js\0./right', 'lib/loop/right.js'],
  ['lib/loop/right.js\0./left', 'lib/loop/left.js'],
]);

const RESOLVER = {
  resolve: (fromFile, specifier) => RESOLUTIONS.get(`${fromFile}\0${specifier}`) || null,
  isInternalLooking: (specifier) => specifier.startsWith('.'),
};

const INDEX = createIndex(buildGraph({ sources: SOURCES, resolver: RESOLVER }));

const IMPACT_OF_C = {
  targets: ['src/core/c.js'],
  total: 3,
  direct: 2,
  bySection: [
    { section: 'src/core', count: 2 },
    { section: 'app', count: 1 },
  ],
  dependents: [
    { path: 'src/core/a.js', depth: 1, section: 'src/core' },
    { path: 'src/core/b.js', depth: 1, section: 'src/core' },
    { path: 'app/main.js', depth: 2, section: 'app' },
  ],
};

const CHANGES = {
  files: [
    { path: 'src/core/c.js', status: 'M', additions: 3, deletions: 1, patch: '@@ -1 +1 @@' },
    { path: 'README.md', status: 'A', additions: 5, deletions: 0, patch: null },
  ],
  totals: { additions: 8, deletions: 1 },
};

describe('src/query', () => {
  test('createIndex', () => {
    expect(INDEX.nodesById.size).toBe(8);
    expect(INDEX.importsOf.get('src/core/a.js')).toEqual(['src/core/b.js', 'src/core/c.js']);
    expect(INDEX.importersOf.get('src/core/c.js')).toEqual(['src/core/b.js', 'src/core/a.js']);
    expect(INDEX.importersOf.has('app/main.js')).toBe(false);
  });

  test('resolveFilePath', () => {
    const matchOf = (filePath) => ({ match: filePath, candidates: [] });
    expect(resolveFilePath(INDEX, 'src/core/a.js')).toEqual(matchOf('src/core/a.js'));
    expect(resolveFilePath(INDEX, './src/core/a.js')).toEqual(matchOf('src/core/a.js'));
    expect(resolveFilePath(INDEX, 'src\\core\\a.js')).toEqual(matchOf('src/core/a.js'));
    expect(resolveFilePath(INDEX, 'a.js', 'src/core')).toEqual(matchOf('src/core/a.js'));
    expect(resolveFilePath(INDEX, '../core/b.js', 'src/other')).toEqual(matchOf('src/core/b.js'));
    expect(resolveFilePath(INDEX, 'core/a.js')).toEqual(matchOf('src/core/a.js'));
    expect(resolveFilePath(INDEX, 'util/index.js')).toEqual({
      match: null,
      candidates: ['app/util/index.js', 'lib/util/index.js'],
    });
    expect(resolveFilePath(INDEX, 'missing.js')).toEqual({ match: null, candidates: [] });
  });

  test('findFiles', () => {
    expect(findFiles(INDEX, 'CORE')).toEqual({
      term: 'CORE',
      total: 3,
      files: [
        { path: 'src/core/c.js', section: 'src/core', loc: 30, importerCount: 2, importCount: 0 },
        { path: 'src/core/a.js', section: 'src/core', loc: 10, importerCount: 1, importCount: 2 },
        { path: 'src/core/b.js', section: 'src/core', loc: 20, importerCount: 1, importCount: 1 },
      ],
    });
    expect(findFiles(INDEX, 'a').files.map((file) => file.path)).toEqual([
      'src/core/a.js',
      'app/main.js',
      'app/util/index.js',
    ]);
    expect(findFiles(INDEX, 'util index').files.map((file) => file.path)).toEqual([
      'app/util/index.js',
      'lib/util/index.js',
    ]);
    const limited = findFiles(INDEX, 'core', 2);
    expect(limited.total).toBe(3);
    expect(limited.files).toHaveLength(2);
    expect(findFiles(INDEX, 'nothing-matches')).toEqual({
      term: 'nothing-matches',
      total: 0,
      files: [],
    });
  });

  test('fileContext', () => {
    expect(fileContext(INDEX, 'src/core/a.js')).toEqual({
      path: 'src/core/a.js',
      section: 'src/core',
      group: 'src',
      loc: 10,
      imports: ['src/core/b.js', 'src/core/c.js'],
      importedBy: ['app/main.js'],
    });
    expect(fileContext(INDEX, 'app/util/index.js')).toMatchObject({
      imports: [],
      importedBy: [],
    });
  });

  test('impactOf', () => {
    expect(impactOf(INDEX, ['src/core/c.js'])).toEqual(IMPACT_OF_C);
    expect(impactOf(INDEX, ['lib/loop/left.js']).dependents).toEqual([
      { path: 'lib/loop/right.js', depth: 1, section: 'lib/loop' },
    ]);
    expect(impactOf(INDEX, ['src/core/c.js', 'src/core/b.js'])).toMatchObject({
      targets: ['src/core/b.js', 'src/core/c.js'],
      total: 2,
      direct: 1,
      dependents: [
        { path: 'src/core/a.js', depth: 1, section: 'src/core' },
        { path: 'app/main.js', depth: 2, section: 'app' },
      ],
    });
    expect(impactOf(INDEX, ['app/main.js'])).toMatchObject({ total: 0, direct: 0, bySection: [] });
  });

  test('changeImpact', () => {
    expect(changeImpact(INDEX, CHANGES)).toEqual({
      files: [
        { path: 'src/core/c.js', status: 'M', additions: 3, deletions: 1 },
        { path: 'README.md', status: 'A', additions: 5, deletions: 0 },
      ],
      totals: { additions: 8, deletions: 1 },
      ...IMPACT_OF_C,
    });
  });

  test('sectionOverview', () => {
    expect(sectionOverview(INDEX)).toEqual({
      files: 8,
      imports: 6,
      unresolved: 0,
      sections: [
        { section: 'src/core', files: 3, loc: 60, importsOut: 0, importsIn: 1 },
        { section: 'lib/loop', files: 2, loc: 10, importsOut: 0, importsIn: 0 },
        { section: 'app', files: 1, loc: 40, importsOut: 1, importsIn: 0 },
        { section: 'app/util', files: 1, loc: 5, importsOut: 0, importsIn: 0 },
        { section: 'lib/util', files: 1, loc: 5, importsOut: 0, importsIn: 0 },
      ],
    });
  });
});
