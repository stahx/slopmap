<script setup>
import { computed } from 'vue';

import { useSectionLabels } from '../composables/useSectionLabels.js';
import { useSettings } from '../composables/useSettings.js';
import { useViewState } from '../composables/useViewState.js';

const { compactnessLevel } = useSettings();
const { activeAggregate } = useViewState();
const { registerLabel } = useSectionLabels();

const sections = computed(() => activeAggregate.value?.sections ?? []);

const isHub = (section) =>
  compactnessLevel.value !== 3 || section.id === section.group;

const labelText = (section) =>
  isHub(section) ? section.id : section.id.split('/').at(-1);
</script>

<template>
  <div class="section-labels" aria-hidden="true">
    <div
      v-for="section in sections"
      :key="section.id"
      :ref="(labelElement) => registerLabel(section.id, labelElement)"
      class="section-label"
      :class="{
        'section-label-hub': isHub(section),
        'section-label-subsection': !isHub(section),
      }"
    >
      {{ labelText(section) }}
    </div>
  </div>
</template>

<style scoped>
.section-labels {
  position: absolute;
  z-index: 2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.section-label {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  will-change: transform;
}

.section-label-hub {
  color: #ffffff;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.section-label-subsection {
  color: rgba(255, 255, 255, 0.72);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 500;
}
</style>
