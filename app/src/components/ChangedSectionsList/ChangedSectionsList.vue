<template>
  <div class="changed-sections flex flex-col gap-0.5">
    <button
      v-for="section in changedSections"
      :key="section.id"
      class="changed-section-row grid w-full cursor-pointer grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[8px] border-0 bg-transparent px-2 py-2.5 text-left font-mono text-[12.5px] text-ink/78 hover:bg-white/5 hover:text-ink"
      type="button"
      @click="emit('select', section)"
    >
      <span
        class="changed-section-dot size-2 rounded-full"
        :style="{ background: statusColor(section.status) }"
      ></span>
      <span class="changed-section-id min-w-0 [overflow-wrap:anywhere]">{{ section.id }}</span>
      <span class="changed-section-count text-[12px] text-ink">{{ section.changedCount }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';
import { sortChangedSections } from '../../lib/sections.js';

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
