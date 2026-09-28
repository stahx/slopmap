import { describe, expect, test } from 'vitest';

import {
  formatChanges,
  formatContext,
  formatImpact,
  formatOverview,
  formatQuery,
} from './queryFormat.js';

const IMPACT = {
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

const NO_IMPACT = { targets: ['x.js'], total: 0, direct: 0, bySection: [], dependents: [] };

const CHANGE_FILES = [
  { path: 'src/core/c.js', status: 'M', additions: 3, deletions: 1 },
  { path: 'README.md', status: 'A', additions: 5, deletions: 0 },
];

const IMPACT_LINES = [
  'direct (2):',
  '  src/core/a.js',
  '  src/core/b.js',
  'depth 2 (1):',
  '  app/main.js',
];

describe('src/queryFormat', () => {
  test('formatQuery', () => {
    expect(formatQuery({ term: 'zzz', total: 0, files: [] })).toBe('no source files match "zzz"');
    expect(
      formatQuery({
        term: 'core',
        total: 3,
        files: [
          { path: 'src/core/c.js', section: 'src/core', loc: 30, importerCount: 2, importCount: 0 },
          { path: 'src/core/a.js', section: 'src/core', loc: 10, importerCount: 1, importCount: 1 },
        ],
      }),
    ).toBe(
      [
        '3 files match "core" (showing 2, raise --limit)',
        '  src/core/c.js  [src/core]  30 loc, 2 importers, 0 imports',
        '  src/core/a.js  [src/core]  10 loc, 1 importer, 1 import',
      ].join('\n'),
    );
  });

  test('formatContext', () => {
    expect(
      formatContext(
        {
          path: 'src/core/a.js',
          section: 'src/core',
          group: 'src',
          loc: 10,
          imports: ['src/core/b.js', 'src/core/c.js'],
          importedBy: [],
        },
        1,
      ),
    ).toBe(
      [
        'src/core/a.js  [src/core]  10 loc',
        'imports (2):',
        '  src/core/b.js',
        '  ... 1 more (raise --limit)',
        'imported by: none',
      ].join('\n'),
    );
  });

  test('formatImpact', () => {
    expect(formatImpact(NO_IMPACT, 30)).toBe('x.js: nothing imports it');
    expect(formatImpact({ ...NO_IMPACT, targets: ['x.js', 'y.js'] }, 30)).toBe(
      '2 files: nothing imports it',
    );
    expect(formatImpact(IMPACT, 30)).toBe(
      [
        'src/core/c.js: 3 dependents (2 direct) across 2 sections',
        '  by section: src/core 2, app 1',
        ...IMPACT_LINES,
      ].join('\n'),
    );
    expect(formatImpact(IMPACT, 1)).toBe(
      [
        'src/core/c.js: 3 dependents (2 direct) across 2 sections',
        '  by section: src/core 2, +1 more',
        'direct (2):',
        '  src/core/a.js',
        '  ... 2 more (raise --limit)',
      ].join('\n'),
    );
  });

  test('formatChanges', () => {
    expect(formatChanges({ mode: 'vs master', files: [], totals: null, ...NO_IMPACT }, 30)).toBe(
      'changes vs master: nothing changed',
    );
    expect(
      formatChanges(
        {
          mode: 'vs master',
          files: CHANGE_FILES,
          totals: { additions: 8, deletions: 1 },
          ...IMPACT,
        },
        30,
      ),
    ).toBe(
      [
        'changes vs master: 2 files, +8 -1',
        '  M  src/core/c.js  +3 -1',
        '  A  README.md  +5 -0',
        'blast radius: 3 dependents (2 direct) across 2 sections',
        '  by section: src/core 2, app 1',
        ...IMPACT_LINES,
      ].join('\n'),
    );
    expect(
      formatChanges(
        { mode: 'in working tree', files: CHANGE_FILES.slice(1), totals: null, ...NO_IMPACT },
        30,
      ),
    ).toBe(
      [
        'changes in working tree: 1 file',
        '  A  README.md  +5 -0',
        'blast radius: nothing imports the changed files',
      ].join('\n'),
    );
  });

  test('formatOverview', () => {
    expect(
      formatOverview({
        files: 8,
        imports: 6,
        unresolved: 0,
        sections: [
          { section: 'src/core', files: 3, loc: 60, importsOut: 0, importsIn: 1 },
          { section: 'app', files: 1, loc: 40, importsOut: 1, importsIn: 0 },
        ],
      }),
    ).toBe(
      [
        '8 source files, 6 imports, 0 unresolved',
        'sections (files, loc, imports out / in):',
        '  src/core: 3 files, 60 loc, out 0 / in 1',
        '  app: 1 file, 40 loc, out 1 / in 0',
      ].join('\n'),
    );
  });
});
