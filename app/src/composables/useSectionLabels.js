import { onBeforeUnmount, onMounted, watch } from 'vue';

import {
  getGraph3dInstance,
  graphLabelLoopVersion,
  registerGraphFrameCallback,
} from './useGraphInstances.js';
import { useSettings } from './useSettings.js';
import { useViewState } from './useViewState.js';

export const useSectionLabels = () => {
  const { compactnessLevel, dimension } = useSettings();
  const { currentView, activeAggregate, isAggregatedView } = useViewState();
  const labelElements = new Map();
  let stopGraphFrameCallback = null;

  const labelsAreActive = () => isAggregatedView.value && dimension.value === '3d';

  const hideLabels = () => {
    for (const labelElement of labelElements.values()) {
      labelElement.style.visibility = 'hidden';
    }
  };

  const renderLabels = () => {
    if (!labelsAreActive()) {
      hideLabels();
      return;
    }
    const graph = getGraph3dInstance();
    if (graph === null) {
      hideLabels();
      return;
    }
    for (const section of activeAggregate.value?.sections ?? []) {
      const labelElement = labelElements.get(section.id);
      if (labelElement === undefined) continue;
      if (section.x === undefined || section.y === undefined || section.z === undefined) {
        labelElement.style.visibility = 'hidden';
        continue;
      }
      const screenCoordinates = graph.graph2ScreenCoords(section.x, section.y, section.z);
      labelElement.style.visibility = 'visible';
      labelElement.style.transform = `translate(-50%, 8px) translate(${screenCoordinates.x}px, ${screenCoordinates.y}px)`;
    }
  };

  const registerLabel = (sectionId, labelElement) => {
    if (labelElement === null) {
      labelElements.delete(sectionId);
      return;
    }
    labelElement.style.visibility = 'hidden';
    labelElements.set(sectionId, labelElement);
  };

  onMounted(() => {
    stopGraphFrameCallback = registerGraphFrameCallback(renderLabels);
    renderLabels();
  });

  watch(
    [currentView, compactnessLevel, dimension, activeAggregate, graphLabelLoopVersion],
    renderLabels,
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    stopGraphFrameCallback?.();
    stopGraphFrameCallback = null;
    labelElements.clear();
  });

  return { registerLabel };
};
