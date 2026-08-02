import { ref, watch } from 'vue';

export const parseTheme = (storedValue) =>
  storedValue === 'plain' || storedValue === 'galaxy' ? storedValue : 'galaxy';

export const parseCompactness = (storedValue) => {
  const parsedValue = Number(storedValue);
  return [1, 2, 3].includes(parsedValue) ? parsedValue : 2;
};

export const parseDimension = (storedValue) =>
  storedValue === '3d' || storedValue === '2d' ? storedValue : '3d';

const readSetting = (storageKey, parser) => {
  try {
    return parser(globalThis.localStorage.getItem(storageKey));
  } catch (storageError) {
    return parser(null);
  }
};

const persistSetting = (storageKey, value) => {
  try {
    globalThis.localStorage.setItem(storageKey, String(value));
  } catch (storageError) {}
};

const theme = ref(readSetting('slopmap-theme', parseTheme));
const compactnessLevel = ref(
  readSetting('slopmap-compactness', parseCompactness)
);
const dimension = ref(readSetting('slopmap-dimension', parseDimension));

watch(theme, (themeValue) => persistSetting('slopmap-theme', themeValue));
watch(compactnessLevel, (compactnessValue) =>
  persistSetting('slopmap-compactness', compactnessValue)
);
watch(dimension, (dimensionValue) =>
  persistSetting('slopmap-dimension', dimensionValue)
);

export const useSettings = () => ({ theme, compactnessLevel, dimension });
