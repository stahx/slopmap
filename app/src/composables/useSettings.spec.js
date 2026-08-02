import { describe, expect, test, vi } from 'vitest';

import { parseCompactness, parseDimension, parseTheme } from './useSettings.js';

const loadSettingsWithStorage = async (storage) => {
  vi.stubGlobal('localStorage', storage);
  vi.resetModules();
  return import('./useSettings.js');
};

describe('app/src/composables/useSettings', () => {
  test('parseTheme', () => {
    expect(parseTheme('plain')).toBe('plain');
    expect(parseTheme('galaxy')).toBe('galaxy');
    expect(parseTheme('dark')).toBe('galaxy');
    expect(parseTheme(null)).toBe('galaxy');
  });

  test('parseCompactness', () => {
    expect(parseCompactness('1')).toBe(1);
    expect(parseCompactness('2')).toBe(2);
    expect(parseCompactness('3')).toBe(3);
    expect(parseCompactness(1)).toBe(1);
    expect(parseCompactness('4')).toBe(2);
    expect(parseCompactness('garbage')).toBe(2);
    expect(parseCompactness(null)).toBe(2);
  });

  test('parseDimension', () => {
    expect(parseDimension('3d')).toBe('3d');
    expect(parseDimension('2d')).toBe('2d');
    expect(parseDimension('4d')).toBe('3d');
    expect(parseDimension(undefined)).toBe('3d');
  });

  test('useSettings', async () => {
    const emptyStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };
    const emptyModule = await loadSettingsWithStorage(emptyStorage);
    const emptySettings = emptyModule.useSettings();

    expect(emptySettings.theme.value).toBe('galaxy');
    expect(emptySettings.compactnessLevel.value).toBe(2);
    expect(emptySettings.dimension.value).toBe('3d');
    expect(emptyStorage.getItem.mock.calls).toEqual([
      ['slopmap-theme'],
      ['slopmap-compactness'],
      ['slopmap-dimension'],
    ]);

    const garbageValues = new Map([
      ['slopmap-theme', 'sepia'],
      ['slopmap-compactness', 'wide'],
      ['slopmap-dimension', '4d'],
    ]);
    const garbageStorage = {
      getItem: vi.fn((storageKey) => garbageValues.get(storageKey)),
      setItem: vi.fn(),
    };
    const garbageModule = await loadSettingsWithStorage(garbageStorage);
    const garbageSettings = garbageModule.useSettings();

    expect(garbageSettings.theme.value).toBe('galaxy');
    expect(garbageSettings.compactnessLevel.value).toBe(2);
    expect(garbageSettings.dimension.value).toBe('3d');

    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new Error('storage unavailable');
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable');
      }),
    };
    const throwingModule = await loadSettingsWithStorage(throwingStorage);
    const throwingSettings = throwingModule.useSettings();

    expect(throwingSettings.theme.value).toBe('galaxy');
    expect(throwingSettings.compactnessLevel.value).toBe(2);
    expect(throwingSettings.dimension.value).toBe('3d');

    const validValues = new Map([
      ['slopmap-theme', 'plain'],
      ['slopmap-compactness', '3'],
      ['slopmap-dimension', '2d'],
    ]);
    const persistentStorage = {
      getItem: vi.fn((storageKey) => validValues.get(storageKey)),
      setItem: vi.fn(),
    };
    const persistentModule = await loadSettingsWithStorage(persistentStorage);
    const persistentSettings = persistentModule.useSettings();

    expect(persistentSettings.theme.value).toBe('plain');
    expect(persistentSettings.compactnessLevel.value).toBe(3);
    expect(persistentSettings.dimension.value).toBe('2d');

    persistentSettings.theme.value = 'galaxy';
    persistentSettings.compactnessLevel.value = 1;
    persistentSettings.dimension.value = '3d';
    const { nextTick } = await import('vue');
    await nextTick();

    expect(persistentStorage.setItem.mock.calls).toEqual([
      ['slopmap-theme', 'galaxy'],
      ['slopmap-compactness', '1'],
      ['slopmap-dimension', '3d'],
    ]);
    vi.unstubAllGlobals();
  });
});
