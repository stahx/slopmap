<template>
  <button
    class="detail-file-card m-0 block w-full cursor-pointer rounded-[9px] border-0 bg-transparent px-3 py-[11px] text-left text-inherit hover:bg-white/5"
    type="button"
    @click="emit('open-diff', changeFile)"
  >
    <div class="detail-file-primary flex min-w-0 items-center gap-2">
      <StatusBadge :status="changeFile.status" />
      <span
        class="detail-file-name min-w-0 flex-[1_1_auto] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12.5px] font-medium"
        :class="isDeleted ? 'deleted text-ink/55 line-through' : 'text-ink'"
        >{{ displayPath }}</span
      >
      <span
        class="detail-change-count flex-[0_0_auto] font-mono text-[11px] font-medium"
        :class="
          changeFile.additions === 0 ? 'change-zero text-ink/30' : 'additions text-success-green'
        "
        >+{{ changeFile.additions }}</span
      >
      <span
        class="detail-change-count flex-[0_0_auto] font-mono text-[11px] font-medium"
        :class="
          changeFile.deletions === 0 ? 'change-zero text-ink/30' : 'deletions text-danger-red'
        "
        >−{{ changeFile.deletions }}</span
      >
    </div>
    <RatioBar
      class="detail-card-ratio mt-[9px] mb-[7px] ml-[25px]"
      :additions="changeFile.additions"
      :deletions="changeFile.deletions"
      :remainder="changeFile.additions + changeFile.deletions"
      detail
    />
    <div
      class="detail-file-meta ml-[25px] text-[11px]"
      :class="isDeleted && importerCount > 0 ? 'warning text-danger-red' : 'text-ink/40'"
    >
      {{ metaText }}
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

import { displayPathFor } from '../../lib/sections.js';

const props = defineProps({
  changeFile: {
    type: Object,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
  },
  importerCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['open-diff']);

const displayPath = computed(() => displayPathFor(props.changeFile.path, props.sectionId));
const isDeleted = computed(() => props.changeFile.status === 'D');
const metaText = computed(() => {
  if (!isDeleted.value) return `imported by ${props.importerCount} files`;
  return props.importerCount > 0
    ? `deleted · ${props.importerCount} files still import this`
    : 'deleted';
});
</script>
