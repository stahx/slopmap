<script setup>
import { computed } from 'vue';

import { MUTED_COLOR, STATUS_COLORS } from '../lib/graphTokens.js';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
});

const segments = computed(() => {
  const untouchedCount = Math.max(
    props.stats.fileCount -
      props.stats.changedCount -
      props.stats.dependentCount -
      props.stats.dependencyCount,
    0
  );
  return [
    {
      key: 'changed',
      color: STATUS_COLORS.changed,
      count: props.stats.changedCount,
    },
    {
      key: 'dependent',
      color: STATUS_COLORS.dependent,
      count: props.stats.dependentCount,
    },
    {
      key: 'dependency',
      color: STATUS_COLORS.dependency,
      count: props.stats.dependencyCount,
    },
    {
      key: 'untouched',
      color: MUTED_COLOR,
      count: untouchedCount,
    },
  ];
});
</script>

<template>
  <div class="distribution-bar" aria-hidden="true">
    <span
      v-for="segment in segments"
      :key="segment.key"
      class="distribution-segment"
      :class="{ 'distribution-untouched': segment.key === 'untouched' }"
      :style="{ background: segment.color, flex: segment.count }"
    ></span>
  </div>
</template>

<style scoped>
.distribution-bar {
  display: flex;
  height: 7px;
  gap: 2px;
  overflow: hidden;
  border-radius: 4px;
}

.distribution-bar[hidden] {
  display: none;
}

.distribution-segment {
  min-width: 2px;
}

.distribution-untouched {
  opacity: 0.45;
}
</style>
