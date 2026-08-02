import { onBeforeUnmount, onMounted, watch } from 'vue';

import { getGraph3dInstance, graphLabelLoopVersion } from './useGraphInstances.js';
import { useSettings } from './useSettings.js';
import { useViewState } from './useViewState.js';

export const useSectionLabels = () => {
  const { compactnessLevel, dimension } = useSettings();
  const { currentView, activeAggregate, isAggregatedView } = useViewState();
  const labelElements = new Map();
  let labelFrameId = null;

  const labelsAreActive = () => isAggregatedView.value && dimension.value === '3d';

  const renderLabels = () => {
    if (!labelsAreActive()) {
      labelFrameId = null;
      return;
    }
    const graph = getGraph3dInstance();
    if (graph !== null) {
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
    }
    labelFrameId = globalThis.requestAnimationFrame(renderLabels);
  };

  const stopLabelLoop = () => {
    if (labelFrameId === null) return;
    globalThis.cancelAnimationFrame(labelFrameId);
    labelFrameId = null;
  };

  const restartLabelLoop = () => {
    stopLabelLoop();
    if (!labelsAreActive()) return;
    labelFrameId = globalThis.requestAnimationFrame(renderLabels);
  };

  const registerLabel = (sectionId, labelElement) => {
    if (labelElement === null) {
      labelElements.delete(sectionId);
      return;
    }
    labelElement.style.visibility = 'hidden';
    labelElements.set(sectionId, labelElement);
  };

  onMounted(restartLabelLoop);

  watch(
    [currentView, compactnessLevel, dimension, activeAggregate, graphLabelLoopVersion],
    restartLabelLoop,
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    stopLabelLoop();
    labelElements.clear();
  });

  return { registerLabel };
};
