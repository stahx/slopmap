<template>
  <div class="detail-stats mt-[18px] flex flex-nowrap gap-2.5">
    <div
      v-for="statTile in statTiles"
      :key="statTile.label"
      class="detail-stat flex min-w-0 flex-[1_1_0] flex-col gap-[5px] rounded-[9px] border p-[11px]"
      :class="{
        'detail-stat-changed border-danger-red/22 bg-danger-red/10': statTile.variant === 'changed',
        'detail-stat-blast border-accent/22 bg-accent/10': statTile.variant === 'blast',
        'border-white/8 bg-white/4': !statTile.variant,
      }"
    >
      <span
        class="detail-stat-value font-mono text-[18px] leading-[1.1] font-semibold"
        :class="{
          'text-danger-red': statTile.variant === 'changed',
          'text-accent': statTile.variant === 'blast',
          'text-ink': !statTile.variant,
        }"
        >{{ statTile.value }}</span
      >
      <span class="detail-stat-label whitespace-nowrap text-[10.5px] text-ink/40">{{
        statTile.label
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  diffMode: {
    type: Boolean,
    required: true,
  },
});

const statTiles = computed(() => {
  if (!props.diffMode) {
    return [
      { value: props.section.fileCount, label: 'files', variant: '' },
      { value: props.section.loc, label: 'loc', variant: '' },
    ];
  }
  return [
    {
      value: props.section.changedCount,
      label: 'files changed',
      variant: 'changed',
    },
    {
      value: props.section.downstreamTotal ?? 0,
      label: 'blast radius',
      variant: 'blast',
    },
    {
      value: (props.section.additions ?? 0) + (props.section.deletions ?? 0),
      label: 'lines touched',
      variant: '',
    },
  ];
});
</script>
