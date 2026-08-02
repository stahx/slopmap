<template>
  <InspectorRowList :rows="rows" @select="selectRow" />
</template>

<script setup>
import { computed } from 'vue';

import { useSettings } from '../../composables/useSettings.js';
import { MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';
import { sortChangedSections } from '../../lib/sections.js';

const props = defineProps({
  activeAggregate: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['select']);

const { compactnessLevel } = useSettings();

const statusColor = (status) => STATUS_COLORS[status] ?? MUTED_COLOR;
const rows = computed(() =>
  sortChangedSections(props.activeAggregate?.sections ?? []).map((section) => ({
    key: section.id,
    label: section.id,
    color: statusColor(section.status),
    count: section.changedCount,
  })),
);

const selectRow = (row) => {
  emit('select', { sectionId: row.key, level: compactnessLevel.value });
};
</script>
