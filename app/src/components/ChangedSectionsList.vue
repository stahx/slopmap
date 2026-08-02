<script setup>
import { computed } from 'vue';

import { MUTED_COLOR, STATUS_COLORS } from '../lib/graphTokens.js';
import { sortChangedSections } from '../lib/sections.js';

const props = defineProps({
  activeAggregate: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['select']);

const changedSections = computed(() => sortChangedSections(props.activeAggregate?.sections ?? []));

const statusColor = (status) => STATUS_COLORS[status] ?? MUTED_COLOR;
</script>

<template>
  <div class="changed-sections">
    <button
      v-for="section in changedSections"
      :key="section.id"
      class="changed-section-row"
      type="button"
      @click="emit('select', section)"
    >
      <span class="changed-section-dot" :style="{ background: statusColor(section.status) }"></span>
      <span class="changed-section-id">{{ section.id }}</span>
      <span class="changed-section-count">{{ section.changedCount }}</span>
    </button>
  </div>
</template>

<style scoped>
.changed-sections {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.changed-sections[hidden] {
  display: none;
}

.changed-section-row {
  display: grid;
  width: 100%;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  color: rgba(232, 230, 223, 0.78);
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.changed-section-row[hidden] {
  display: none;
}

.changed-section-row:hover {
  color: #e8e6df;
  background: rgba(255, 255, 255, 0.05);
}

.changed-section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.changed-section-id {
  min-width: 0;
  overflow-wrap: anywhere;
}

.changed-section-count {
  color: #e8e6df;
  font-size: 12px;
}
</style>
