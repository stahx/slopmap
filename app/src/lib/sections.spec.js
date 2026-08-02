import { describe, expect, test } from 'vitest';

import {
  changeMatchesSection,
  changedFilesFor,
  childSectionsFor,
  displayPathFor,
  importedFilesFor,
  nodeMatchesSection,
  sectionFilesFor,
  sortChangedSections,
} from './sections.js';

const SECTION_FIXTURE = { id: 'apps/web' };
const CHANGES_FIXTURE = [
  {
    path: 'apps/web/src/main.js',
    rootGroup: 'apps',
    group: 'apps/web',
    section: 'apps/web/src',
  },
  {
    path: 'apps/api/src/main.js',
    rootGroup: 'apps',
    group: 'apps/api',
    section: 'apps/api/src',
  },
];
const NODES_FIXTURE = [
  {
    id: 'apps/web/src/small.js',
    rootGroup: 'apps',
    group: 'apps/web',
    section: 'apps/web/src',
    loc: 20,
  },
  {
    id: 'apps/web/src/large.js',
    rootGroup: 'apps',
    group: 'apps/web',
    section: 'apps/web/src',
    loc: 120,
  },
  {
    id: 'apps/api/src/main.js',
    rootGroup: 'apps',
    group: 'apps/api',
    section: 'apps/api/src',
    loc: 80,
  },
];

describe('app/src/lib/sections', () => {
  test('changeMatchesSection', () => {
    expect(changeMatchesSection(CHANGES_FIXTURE[0], { id: 'apps' }, 1)).toBe(true);
    expect(changeMatchesSection(CHANGES_FIXTURE[0], SECTION_FIXTURE, 2)).toBe(true);
    expect(changeMatchesSection(CHANGES_FIXTURE[0], { id: 'apps/web/src' }, 3)).toBe(true);
    expect(changeMatchesSection(CHANGES_FIXTURE[1], SECTION_FIXTURE, 2)).toBe(false);
  });

  test('nodeMatchesSection', () => {
    expect(nodeMatchesSection(NODES_FIXTURE[0], { id: 'apps' }, 1)).toBe(true);
    expect(nodeMatchesSection(NODES_FIXTURE[0], SECTION_FIXTURE, 2)).toBe(true);
    expect(nodeMatchesSection(NODES_FIXTURE[0], { id: 'apps/web/src' }, 3)).toBe(true);
    expect(nodeMatchesSection(NODES_FIXTURE[2], SECTION_FIXTURE, 2)).toBe(false);
  });

  test('displayPathFor', () => {
    expect(displayPathFor('apps/web/src/main.js', 'apps/web')).toBe('src/main.js');
    expect(displayPathFor('apps/web', 'apps/web')).toBe('apps/web');
    expect(displayPathFor('apps/website/main.js', 'apps/web')).toBe('apps/website/main.js');
  });

  test('changedFilesFor', () => {
    expect(changedFilesFor(CHANGES_FIXTURE, SECTION_FIXTURE, 2)).toEqual([CHANGES_FIXTURE[0]]);
    expect(changedFilesFor({ files: CHANGES_FIXTURE }, { id: 'apps' }, 1)).toEqual(CHANGES_FIXTURE);
  });

  test('sectionFilesFor', () => {
    const extraNodes = [];
    for (let nodeIndex = 0; nodeIndex < 10; nodeIndex += 1) {
      extraNodes.push({
        id: `apps/web/generated-${nodeIndex}.js`,
        rootGroup: 'apps',
        group: 'apps/web',
        section: 'apps/web/generated',
        loc: 100 - nodeIndex,
      });
    }
    const result = sectionFilesFor([...NODES_FIXTURE, ...extraNodes], SECTION_FIXTURE, 2);

    expect(result).toHaveLength(10);
    expect(result[0]).toBe(NODES_FIXTURE[1]);
    expect(result.at(-1).loc).toBe(92);
  });

  test('childSectionsFor', () => {
    const childSections = [
      { id: 'apps/web/components', fileCount: 3 },
      { id: 'apps/web/src', fileCount: 8 },
      { id: 'apps/web/tests', fileCount: 3 },
      { id: 'apps/web', fileCount: 20 },
      { id: 'apps/website/src', fileCount: 12 },
    ];

    expect(childSectionsFor(childSections, SECTION_FIXTURE)).toEqual([
      childSections[1],
      childSections[0],
      childSections[2],
    ]);
    expect(childSectionsFor(childSections, null)).toEqual([]);
  });

  test('importedFilesFor', () => {
    const nodesById = new Map(NODES_FIXTURE.map((node) => [node.id, node]));
    nodesById.set('packages/shared.js', {
      id: 'packages/shared.js',
      rootGroup: 'packages',
      group: 'packages',
      section: 'packages',
      loc: 30,
    });
    nodesById.set('packages/types.js', {
      id: 'packages/types.js',
      rootGroup: 'packages',
      group: 'packages',
      section: 'packages',
      loc: 25,
    });
    const links = [
      {
        source: 'apps/web/src/main.js',
        target: 'packages/types.js',
      },
      {
        source: { id: 'apps/web/src/main.js' },
        target: { ...nodesById.get('packages/shared.js') },
      },
      {
        source: 'apps/web/src/main.js',
        target: 'packages/types.js',
      },
      {
        source: 'apps/web/src/main.js',
        target: 'apps/web/src/small.js',
      },
      {
        source: 'apps/api/src/main.js',
        target: 'packages/shared.js',
      },
    ];
    const matchesSection = (nodeOrId, section, level) =>
      nodeMatchesSection(
        typeof nodeOrId === 'object' ? nodeOrId : nodesById.get(nodeOrId),
        section,
        level,
      );

    expect(
      importedFilesFor(links, ['apps/web/src/main.js'], SECTION_FIXTURE, 2, matchesSection),
    ).toEqual(['packages/shared.js', 'packages/types.js']);
  });

  test('sortChangedSections', () => {
    const sections = [
      { id: 'zeta', changedCount: 2 },
      { id: 'alpha', changedCount: 2 },
      { id: 'beta', changedCount: 4 },
      { id: 'empty', changedCount: 0 },
    ];

    expect(sortChangedSections(sections)).toEqual([sections[2], sections[1], sections[0]]);
    expect(sections[0].id).toBe('zeta');
  });
});
