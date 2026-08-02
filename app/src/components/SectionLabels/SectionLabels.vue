<template>
  <div
    class="section-labels pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    aria-hidden="true"
  >
    <div
      v-for="section in sections"
      :key="section.id"
      :ref="(labelElement) => registerLabel(section.id, labelElement)"
      class="section-label absolute top-0 left-0 whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] [will-change:transform]"
      :class="
        isHub(section)
          ? 'section-label-hub font-label text-[13px] font-semibold text-white'
          : 'section-label-subsection font-label text-[12px] font-medium text-white/72'
      "
    >
      {{ labelText(section) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { useSectionLabels } from '../../composables/useSectionLabels.js';
import { useSettings } from '../../composables/useSettings.js';
import { useViewState } from '../../composables/useViewState.js';

const { compactnessLevel } = useSettings();
const { activeAggregate } = useViewState();
const { registerLabel } = useSectionLabels();

const sections = computed(() => activeAggregate.value?.sections ?? []);

const isHub = (section) => compactnessLevel.value !== 3 || section.id === section.group;

const labelText = (section) => (isHub(section) ? section.id : section.id.split('/').at(-1));
</script>
