import { describe, expect, test } from 'vitest';

import { computeDisplacement } from './displacement.js';

describe('app/src/lib/displacement', () => {
  test('computeDisplacement', () => {
    const originNode = { x: 0, y: 0, z: 0, fx: 0, fy: 0, fz: 0 };
    const boundaryNode = { x: 180, y: 0, z: 0 };
    const nearbyNode = {
      x: 0.5,
      y: 0,
      z: 0,
      fx: 0.5,
      fy: 0,
      fz: 0,
    };
    const twoDimensionalNode = { x: 0, y: 20, fx: 0, fy: 20 };
    const results = computeDisplacement(
      [originNode, boundaryNode, nearbyNode, twoDimensionalNode],
      originNode,
      180,
      26,
    );

    expect(results).toHaveLength(2);
    expect(results[0].node).toBe(nearbyNode);
    expect(results[0].original).toEqual({
      x: 0.5,
      y: 0,
      z: 0,
      fx: 0.5,
      fy: 0,
      fz: 0,
    });
    expect(results[0].nextX).toBeCloseTo(13.4277777778);
    expect(results[0].nextY).toBe(0);
    expect(results[0].nextZ).toBe(0);
    expect(results[1].node).toBe(twoDimensionalNode);
    expect(results[1].original).toEqual({
      x: 0,
      y: 20,
      z: undefined,
      fx: 0,
      fy: 20,
      fz: undefined,
    });
    expect(results[1].nextZ).toBeUndefined();
    expect(results.some((result) => result.node === boundaryNode)).toBe(false);
  });
});
