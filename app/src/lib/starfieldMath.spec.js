import { describe, expect, test } from 'vitest';

import { azimuthDelta, wrapCoordinate, wrapPosition } from './starfieldMath.js';

describe('app/src/lib/starfieldMath', () => {
  test('wrapCoordinate', () => {
    expect(wrapCoordinate(-10, 100)).toBe(90);
    expect(wrapCoordinate(110, 100)).toBe(10);
    expect(wrapCoordinate(-10.4, 100)).toBe(90);
    expect(wrapCoordinate(110.6, 100)).toBe(11);
  });

  test('wrapPosition', () => {
    expect(wrapPosition(-10.4, 100)).toBeCloseTo(89.6);
    expect(wrapPosition(110.6, 100)).toBeCloseTo(10.6);
  });

  test('azimuthDelta', () => {
    expect(azimuthDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6);
    expect(azimuthDelta(-3, 3)).toBeCloseTo(6 - 2 * Math.PI);
    expect(azimuthDelta(0.5, 1.25)).toBe(0.75);
  });
});
