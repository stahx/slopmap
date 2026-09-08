import { describe, expect, test } from 'vitest';

import { clampToBounds, computeBounds, computeMinZoom, expandBounds } from './cameraBounds.js';

describe('app/src/lib/cameraBounds', () => {
  test('computeBounds', () => {
    expect(computeBounds([])).toBeNull();
    expect(computeBounds([{ id: 'unpositioned' }])).toBeNull();
    expect(computeBounds([{ x: 8, y: -12 }])).toEqual({
      minX: 8,
      maxX: 8,
      minY: -12,
      maxY: -12,
      minZ: 0,
      maxZ: 0,
      centerX: 8,
      centerY: -12,
      centerZ: 0,
      radius: 120,
    });

    const bounds = computeBounds([
      { x: 0, y: 0, z: 0 },
      { x: 300, y: 400, z: 0 },
    ]);

    expect(bounds).toEqual({
      minX: 0,
      maxX: 300,
      minY: 0,
      maxY: 400,
      minZ: 0,
      maxZ: 0,
      centerX: 150,
      centerY: 200,
      centerZ: 0,
      radius: 250,
    });
  });

  test('computeMinZoom', () => {
    expect(computeMinZoom({ minX: 0, maxX: 2400, minY: 0, maxY: 1600 }, 1200, 800)).toBe(0.25);
    expect(computeMinZoom({ minX: 0, maxX: 375, minY: 0, maxY: 375 }, 1200, 800)).toBe(1);
    expect(computeMinZoom({ minX: 0, maxX: 0, minY: 0, maxY: 0 }, 1200, 800)).toBe(0.01);
  });

  test('clampToBounds', () => {
    expect(clampToBounds(-11, -10, 20)).toBe(-10);
    expect(clampToBounds(4, -10, 20)).toBe(4);
    expect(clampToBounds(21, -10, 20)).toBe(20);
  });

  test('expandBounds', () => {
    const expandedBounds = expandBounds(
      {
        minX: 0,
        maxX: 300,
        minY: -100,
        maxY: 100,
        minZ: 20,
        maxZ: 420,
        centerX: 150,
        centerY: 0,
        centerZ: 220,
        radius: 269.2582403567252,
      },
      0.25,
      10,
    );

    expect(expandedBounds).toEqual({
      minX: -85,
      maxX: 385,
      minY: -160,
      maxY: 160,
      minZ: -90,
      maxZ: 530,
      centerX: 150,
      centerY: 0,
      centerZ: 220,
      radius: Math.hypot(470, 320, 620) / 2,
    });
  });
});
