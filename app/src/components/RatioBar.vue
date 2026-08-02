<script setup>
import { computed } from 'vue';

const props = defineProps({
  additions: {
    type: Number,
    required: true,
  },
  deletions: {
    type: Number,
    required: true,
  },
  remainder: {
    type: Number,
    default: null,
  },
});

const hasChangedLines = computed(
  () => props.additions !== 0 || props.deletions !== 0
);
const additionsFlex = computed(() =>
  hasChangedLines.value ? Math.max(props.additions, 1) : 0
);
const deletionsFlex = computed(() =>
  hasChangedLines.value ? Math.max(props.deletions, 1) : 0
);
const remainderFlex = computed(() =>
  props.remainder === null ? null : Math.max(props.remainder, 1)
);
</script>

<template>
  <span class="ratio-bar" aria-hidden="true">
    <span class="ratio-additions" :style="{ flex: additionsFlex }"></span>
    <span class="ratio-deletions" :style="{ flex: deletionsFlex }"></span>
    <span
      v-if="remainderFlex !== null"
      class="ratio-remainder"
      :style="{ flex: remainderFlex }"
    ></span>
  </span>
</template>

<style scoped>
.ratio-bar {
  display: flex;
  min-width: 0;
  height: 6px;
  flex: 1 1 auto;
  gap: 2px;
  overflow: hidden;
  border-radius: 3px;
}

.ratio-bar[hidden] {
  display: none;
}

.ratio-additions,
.ratio-deletions,
.ratio-remainder {
  min-width: 2px;
  opacity: 0.85;
}

.ratio-additions {
  background: #6fbf8b;
}

.ratio-deletions {
  background: #e8564a;
}

.ratio-remainder {
  background: rgba(255, 255, 255, 0.07);
}
</style>
