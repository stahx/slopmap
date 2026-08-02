<script setup>
const props = defineProps({
  tab: {
    type: String,
    required: true,
  },
  counts: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:tab']);

const tabDefinitions = [
  { id: 'files', label: 'Files' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'imports', label: 'Imports' },
];
</script>

<template>
  <div class="inspector-tabs" role="tablist" aria-label="Section details">
    <button
      v-for="tabDefinition in tabDefinitions"
      :key="tabDefinition.id"
      class="inspector-tab"
      :class="{ active: tabDefinition.id === props.tab }"
      type="button"
      role="tab"
      :aria-selected="tabDefinition.id === props.tab"
      @click="emit('update:tab', tabDefinition.id)"
    >
      {{ tabDefinition.label }}
      <span class="inspector-tab-count">{{ props.counts[tabDefinition.id] }}</span>
    </button>
  </div>
</template>

<style scoped>
.inspector-tabs {
  display: flex;
  flex: 0 0 auto;
  gap: 20px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.inspector-tabs[hidden] {
  display: none;
}

.inspector-tab {
  margin: 0 0 -1px;
  padding: 10px 0 11px;
  color: rgba(232, 230, 223, 0.45);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}

.inspector-tab.active {
  color: #e8e6df;
  border-bottom-color: #f08a4b;
  font-weight: 600;
}

.inspector-tab-count {
  color: rgba(232, 230, 223, 0.35);
  font-family: var(--font-mono);
  font-size: 11px;
}
</style>
