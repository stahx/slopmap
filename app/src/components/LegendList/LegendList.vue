<template>
  <div class="legend-list m-0 grid gap-[7px]">
    <div
      v-for="row in rows"
      :key="row.label"
      class="legend-row grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 text-[12.5px] leading-[1.3] text-ink/80"
      :class="{ 'legend-row-untouched opacity-50': row.label === 'Untouched' }"
    >
      <span class="legend-dot size-2 rounded-full" :style="{ background: row.color }"></span>
      <span>{{ row.label }}</span>
      <span class="legend-count font-mono text-[12px] font-medium text-ink">{{ row.count }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});
</script>
