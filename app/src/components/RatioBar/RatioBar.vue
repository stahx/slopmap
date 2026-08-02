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
  detail: {
    type: Boolean,
    default: false,
  },
});

const additionsFlex = computed(() => props.additions);
const deletionsFlex = computed(() => props.deletions);
const remainderFlex = computed(() =>
  props.remainder === null ? null : Math.max(props.remainder, 1),
);
</script>

<template>
  <span class="ratio-bar" :class="{ 'ratio-bar-detail': detail }" aria-hidden="true">
    <span v-if="additionsFlex > 0" class="ratio-additions" :style="{ flex: additionsFlex }"></span>
    <span v-if="deletionsFlex > 0" class="ratio-deletions" :style="{ flex: deletionsFlex }"></span>
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

.ratio-bar-detail {
  height: 5px;
}

.ratio-bar-detail .ratio-additions,
.ratio-bar-detail .ratio-deletions,
.ratio-bar-detail .ratio-remainder {
  min-width: 1px;
  opacity: 1;
}
</style>
