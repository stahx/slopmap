<template>
  <div
    ref="stageElement"
    class="graph-stage fixed top-[var(--spacing-header)] right-[var(--spacing-inspector)] bottom-0 left-[var(--spacing-rail)] z-[1]"
    aria-hidden="true"
  >
    <div
      v-show="dimension === '3d'"
      id="graph"
      ref="host3dElement"
      class="graph-host graph-host-3d absolute inset-0 z-[1]"
    ></div>
    <div
      v-show="dimension === '2d'"
      id="graph2d"
      ref="host2dElement"
      class="graph-host graph-host-2d absolute inset-0 z-[1]"
    ></div>
    <SectionLabels v-if="isAggregatedView && dimension === '3d'" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { useGraphInstances } from '../../composables/useGraphInstances.js';
import { useMapArea } from '../../composables/useMapArea.js';
import { useSettings } from '../../composables/useSettings.js';
import { useViewState } from '../../composables/useViewState.js';

const { dimension } = useSettings();
const { isAggregatedView } = useViewState();
const { observe } = useMapArea();
const { createGraphInstances, applyView } = useGraphInstances();

const stageElement = ref(null);
const host3dElement = ref(null);
const host2dElement = ref(null);

onMounted(() => {
  if (stageElement.value === null || host3dElement.value === null || host2dElement.value === null) {
    return;
  }
  observe(stageElement.value);
  createGraphInstances(host3dElement.value, host2dElement.value);
  applyView();
});
</script>
