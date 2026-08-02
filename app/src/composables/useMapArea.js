import { ref } from 'vue';

import {
  HEADER_HEIGHT,
  INSPECTOR_WIDTH,
  RAIL_WIDTH,
} from '../lib/layout.js';

const mapWidth = ref(0);
const mapHeight = ref(0);
let resizeObserver = null;
let observedElement = null;
let windowResizeListener = null;

const setSize = (width, height) => {
  mapWidth.value = Math.max(0, width);
  mapHeight.value = Math.max(0, height);
};

const readElementSize = () => {
  if (observedElement === null) return;
  const bounds = observedElement.getBoundingClientRect();
  setSize(bounds.width, bounds.height);
};

const readFallbackSize = () => {
  setSize(
    globalThis.innerWidth - RAIL_WIDTH - INSPECTOR_WIDTH,
    globalThis.innerHeight - HEADER_HEIGHT
  );
};

const disconnect = () => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (windowResizeListener !== null) {
    globalThis.removeEventListener('resize', windowResizeListener);
    windowResizeListener = null;
  }
  observedElement = null;
};

const observe = (stageElement) => {
  disconnect();
  observedElement = stageElement;
  if (typeof globalThis.ResizeObserver === 'function') {
    resizeObserver = new globalThis.ResizeObserver((entries) => {
      const stageEntry = entries.find(
        (entry) => entry.target === observedElement
      );
      if (stageEntry === undefined) return;
      setSize(stageEntry.contentRect.width, stageEntry.contentRect.height);
    });
    resizeObserver.observe(stageElement);
    readElementSize();
    return;
  }

  windowResizeListener = readFallbackSize;
  globalThis.addEventListener('resize', windowResizeListener);
  readFallbackSize();
};

export const useMapArea = () => ({
  mapWidth,
  mapHeight,
  observe,
  disconnect,
});
