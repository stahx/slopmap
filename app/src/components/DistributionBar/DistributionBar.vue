<template>
  <div
    v-if="segments.length > 0"
    class="distribution-bar flex h-[7px] gap-0.5 overflow-hidden rounded-[4px]"
    aria-hidden="true"
  >
    <span
      v-for="segment in segments"
      :key="segment.key"
      class="distribution-segment min-w-0.5"
      :class="{ 'distribution-untouched opacity-45': segment.key === 'untouched' }"
      :style="{ background: segment.color, flex: segment.count }"
    ></span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';

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
    0,
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
  ].filter((segment) => segment.count > 0);
});
</script>
