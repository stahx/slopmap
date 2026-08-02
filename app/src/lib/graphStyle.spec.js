import { describe, expect, test } from 'vitest';

import {
  blendTowardWhite,
  linkColorFor,
  linkWidthFor,
  nodeColorFor,
  nodeLabelFor,
  nodeValueFor,
  particleCountFor,
} from './graphStyle.js';

const GROUP_COLORS_FIXTURE = new Map([['alpha', '#3987e5']]);
const BASE_CONTEXT = {
  aggregated: false,
  diffMode: false,
  compactnessLevel: 2,
  searchTerm: '',
  selectedNode: null,
  groupColors: GROUP_COLORS_FIXTURE,
};

describe('app/src/lib/graphStyle', () => {
  test('blendTowardWhite', () => {
    expect(blendTowardWhite('#e8564a', 0.4)).toBe('#f19a92');
    expect(blendTowardWhite('#3987e5', 0.4)).toBe('#88b7ef');
  });

  test('nodeColorFor', () => {
    const changedSection = { id: 'alpha', group: 'alpha', status: 'changed' };
    const normalSection = { id: 'beta', group: 'beta', status: 'normal' };
    const normalFile = {
      id: 'src/alpha.js',
      group: 'alpha',
      status: 'normal',
    };

    expect(
      nodeColorFor(changedSection, {
        ...BASE_CONTEXT,
        aggregated: true,
        diffMode: true,
      }),
    ).toBe('#e8564a');
    expect(
      nodeColorFor(normalSection, {
        ...BASE_CONTEXT,
        aggregated: true,
        diffMode: true,
      }),
    ).toBe('rgba(139,143,163,.5)');
    expect(
      nodeColorFor(changedSection, {
        ...BASE_CONTEXT,
        aggregated: true,
      }),
    ).toBe('#3987e5');
    expect(
      nodeColorFor(normalSection, {
        ...BASE_CONTEXT,
        aggregated: true,
      }),
    ).toBe('#8b8fa3');
    expect(
      nodeColorFor(normalFile, {
        ...BASE_CONTEXT,
        diffMode: true,
      }),
    ).toBe('rgba(139,143,163,.35)');
    expect(
      nodeColorFor(normalFile, {
        ...BASE_CONTEXT,
        searchTerm: 'alpha',
        selectedNode: normalFile,
      }),
    ).toBe('#ffffff');
    expect(
      nodeColorFor(changedSection, {
        ...BASE_CONTEXT,
        selectedNode: changedSection,
      }),
    ).toBe('#f19a92');
    expect(
      nodeColorFor(normalSection, {
        ...BASE_CONTEXT,
        aggregated: true,
        diffMode: true,
        selectedNode: normalSection,
      }),
    ).toBe('#b9bcc8');
  });

  test('nodeLabelFor', () => {
    expect(
      nodeLabelFor(
        { id: 'alpha', fileCount: 4, changedCount: 2 },
        { ...BASE_CONTEXT, aggregated: true },
      ),
    ).toBe('alpha · 4 files · 2 changed');
    expect(nodeLabelFor({ id: 'src/a.js', loc: 120, status: 'dependent' }, BASE_CONTEXT)).toBe(
      'src/a.js · 120 loc · dependent',
    );
  });

  test('nodeValueFor', () => {
    expect(nodeValueFor({ loc: 0 }, BASE_CONTEXT)).toBe(1);
    expect(nodeValueFor({ loc: 1200 }, BASE_CONTEXT)).toBe(14);
    expect(
      nodeValueFor({ fileCount: 1 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 1 }),
    ).toBe(10);
    expect(
      nodeValueFor({ fileCount: 2000 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 1 }),
    ).toBe(90);
    expect(
      nodeValueFor({ fileCount: 1 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 2 }),
    ).toBe(8);
    expect(
      nodeValueFor({ fileCount: 2000 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 2 }),
    ).toBe(70);
    expect(
      nodeValueFor({ fileCount: 1 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 3 }),
    ).toBe(4);
    expect(
      nodeValueFor({ fileCount: 50 }, { ...BASE_CONTEXT, aggregated: true, compactnessLevel: 3 }),
    ).toBe(40);
  });

  test('linkWidthFor', () => {
    expect(linkWidthFor({})).toBe(1);
    expect(linkWidthFor({ kind: 'imports', weight: 3 })).toBe(2);
    expect(linkWidthFor({ kind: 'imports', weight: 255 })).toBe(4);
    expect(linkWidthFor({ kind: 'orbit' })).toBe(0.2);
  });

  test('linkColorFor', () => {
    expect(linkColorFor({ kind: 'orbit' })).toBe('rgba(255,255,255,0.08)');
    expect(linkColorFor({ kind: 'imports', hot: 1 })).toBe('#f08a4b');
    expect(linkColorFor({ kind: 'imports', hot: 0 })).toBe('#3a3d55');
    expect(linkColorFor({ hot: 1 })).toBe('#f08a4b');
  });

  test('particleCountFor', () => {
    expect(particleCountFor({ kind: 'imports', hot: 1 })).toBe(2);
    expect(particleCountFor({ kind: 'imports', hot: 0 })).toBe(0);
    expect(particleCountFor({ kind: 'orbit', hot: 1 })).toBe(0);
    expect(particleCountFor({ hot: 1 })).toBe(2);
  });
});
