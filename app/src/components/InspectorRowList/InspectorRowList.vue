<template>
  <div class="inspector-row-list flex flex-col gap-0.5">
    <component
      :is="row.selectable === false ? 'div' : 'button'"
      v-for="row in rows"
      :key="row.key"
      class="inspector-row grid w-full grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[8px] px-2 py-2.5 text-left font-mono text-[12.5px] leading-[1.3] text-ink/80"
      :class="{
        'cursor-pointer border-0 bg-transparent hover:bg-white/5 hover:text-ink':
          row.selectable !== false,
        'opacity-50': row.dimmed,
      }"
      :type="row.selectable === false ? undefined : 'button'"
      @click="selectRow(row)"
    >
      <span
        class="inspector-row-dot size-2 rounded-full"
        :class="{ invisible: !row.color }"
        :style="row.color ? { background: row.color } : undefined"
      ></span>
      <span class="inspector-row-label min-w-0 [overflow-wrap:anywhere]">{{ row.label }}</span>
      <span
        v-if="row.count !== undefined && row.count !== null"
        class="inspector-row-count text-right text-[12px] font-medium text-ink"
        >{{ row.count }}</span
      >
      <span
        v-else-if="row.meta"
        class="inspector-row-meta text-right text-[11px] font-medium whitespace-nowrap text-ink/30"
        >{{ row.meta }}</span
      >
    </component>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['select']);

const selectRow = (row) => {
  if (row.selectable === false) return;
  emit('select', row);
};
</script>
