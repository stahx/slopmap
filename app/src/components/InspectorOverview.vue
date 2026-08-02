<script setup>
import { computed } from 'vue';

import { usePayload } from '../composables/usePayload.js';
import { useViewState } from '../composables/useViewState.js';
import {
  GROUP_COLORS,
  MUTED_COLOR,
  STATUS_COLORS,
} from '../lib/graphTokens.js';

const emit = defineEmits(['select']);

const { payload, stats, diffMode } = usePayload();
const { activeAggregate } = useViewState();

const untouchedCount = computed(
  () =>
    payload.value?.graph?.nodes?.filter((node) => node.status === 'normal')
      .length ?? 0
);
const legendRows = computed(() => {
  if (diffMode.value) {
    return [
      {
        color: STATUS_COLORS.changed,
        label: 'Changed',
        count: stats.value?.changedCount ?? 0,
      },
      {
        color: STATUS_COLORS.dependent,
        label: 'Blast radius',
        count: stats.value?.dependentCount ?? 0,
      },
      {
        color: STATUS_COLORS.dependency,
        label: 'Change depends on',
        count: stats.value?.dependencyCount ?? 0,
      },
      {
        color: MUTED_COLOR,
        label: 'Untouched',
        count: untouchedCount.value,
      },
    ];
  }

  const groups = payload.value?.graph?.groups ?? [];
  const rows = groups.slice(0, GROUP_COLORS.length).map((group, slotIndex) => ({
    color: GROUP_COLORS[slotIndex],
    label: group.name,
    count: group.count,
  }));
  if (groups.length > GROUP_COLORS.length) {
    const otherCount = groups
      .slice(GROUP_COLORS.length)
      .reduce((totalCount, group) => totalCount + group.count, 0);
    rows.push({
      color: MUTED_COLOR,
      label: 'other',
      count: `(${otherCount})`,
    });
  }
  return rows;
});
const overviewMeta = computed(
  () =>
    `${stats.value?.fileCount ?? 0} files · ${stats.value?.linkCount ?? 0} imports`
);
</script>

<template>
  <div class="inspector-overview">
    <div class="overview-header">overview</div>
    <div class="overview-body">
      <div class="distribution">
        <DistributionBar v-if="diffMode && stats" :stats="stats" />
        <LegendList :rows="legendRows" />
        <div class="overview-meta">{{ overviewMeta }}</div>
      </div>
      <div v-if="diffMode" class="changed-sections-block">
        <div class="changed-sections-label">CHANGED SECTIONS</div>
        <ChangedSectionsList
          :active-aggregate="activeAggregate"
          @select="emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.inspector-overview {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.inspector-overview[hidden] {
  display: none;
}

.overview-header {
  flex: 0 0 auto;
  padding: 18px 20px;
  color: #e8e6df;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-size: 15.5px;
  font-weight: 600;
}

.overview-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 18px 20px;
}

.distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution[hidden] {
  display: none;
}

.overview-meta {
  color: rgba(232, 230, 223, 0.35);
  font-size: 11px;
  line-height: 1.35;
}

.changed-sections-block {
  margin-top: 30px;
}

.changed-sections-label {
  margin-bottom: 8px;
  color: rgba(232, 230, 223, 0.35);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
}
</style>
