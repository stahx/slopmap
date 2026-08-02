<template>
  <aside
    class="inspector-panel fixed top-0 right-0 bottom-0 z-[4] flex w-[var(--spacing-inspector)] flex-col border-l border-white/8 bg-panel/97 text-ink"
  >
    <InspectorDetail v-if="selectedSection !== null" />
    <InspectorOverview v-else @select="emit('select', $event)" />
  </aside>
</template>

<script setup>
import { useSelection } from '../../composables/useSelection.js';

const emit = defineEmits(['select']);

const { selectedSection } = useSelection();
</script>
