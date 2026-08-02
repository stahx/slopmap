<script setup>
import { useSelection } from '../../composables/useSelection.js';

const emit = defineEmits(['select']);

const { selectedSection } = useSelection();
</script>

<template>
  <aside class="inspector-panel">
    <InspectorDetail v-if="selectedSection !== null" />
    <InspectorOverview v-else @select="emit('select', $event)" />
  </aside>
</template>

<style scoped>
.inspector-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  width: var(--inspector-w);
  flex-direction: column;
  color: #e8e6df;
  background: rgba(14, 16, 32, 0.97);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.inspector-panel[hidden] {
  display: none;
}
</style>
