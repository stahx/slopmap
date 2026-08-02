<template>
  <div
    class="inspector-tabs flex flex-[0_0_auto] gap-5 border-b border-white/8 px-5"
    role="tablist"
    aria-label="Section details"
  >
    <button
      v-for="tabDefinition in tabDefinitions"
      :key="tabDefinition.id"
      class="inspector-tab mt-0 mr-0 mb-[-1px] ml-0 cursor-pointer border-0 border-b-2 bg-transparent pt-2.5 pb-[11px] text-[12.5px]"
      :class="
        tabDefinition.id === props.tab
          ? 'active border-b-accent font-semibold text-ink'
          : 'border-transparent font-medium text-ink/45'
      "
      type="button"
      role="tab"
      :aria-selected="tabDefinition.id === props.tab"
      @click="emit('update:tab', tabDefinition.id)"
    >
      {{ tabDefinition.label }}
      <span class="inspector-tab-count font-mono text-[11px] text-ink/35">{{
        props.counts[tabDefinition.id]
      }}</span>
    </button>
  </div>
</template>

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
