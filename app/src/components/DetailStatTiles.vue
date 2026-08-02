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

<template>
  <div class="detail-stats">
    <div
      v-for="statTile in statTiles"
      :key="statTile.label"
      class="detail-stat"
      :class="statTile.variant && `detail-stat-${statTile.variant}`"
    >
      <span class="detail-stat-value">{{ statTile.value }}</span>
      <span class="detail-stat-label">{{ statTile.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.detail-stats {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 18px;
}

.detail-stats[hidden] {
  display: none;
}

.detail-stat {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  gap: 5px;
  padding: 11px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
}

.detail-stat[hidden] {
  display: none;
}

.detail-stat-changed {
  background: rgba(232, 86, 74, 0.1);
  border-color: rgba(232, 86, 74, 0.22);
}

.detail-stat-blast {
  background: rgba(240, 138, 75, 0.1);
  border-color: rgba(240, 138, 75, 0.22);
}

.detail-stat-value {
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.1;
}

.detail-stat-changed .detail-stat-value {
  color: #e8564a;
}

.detail-stat-blast .detail-stat-value {
  color: #f08a4b;
}

.detail-stat-label {
  color: rgba(232, 230, 223, 0.4);
  font-size: 10.5px;
  white-space: nowrap;
}
</style>
