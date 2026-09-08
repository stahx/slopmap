<template>
  <div class="inspector-overview flex min-h-0 flex-[1_1_auto] flex-col">
    <div
      class="overview-header flex-[0_0_auto] border-b border-white/8 px-5 py-[18px] font-mono text-[15.5px] font-semibold text-ink"
    >
      overview
    </div>
    <div class="overview-body min-h-0 flex-[1_1_auto] overflow-y-auto px-5 py-[18px]">
      <div class="distribution flex flex-col gap-3">
        <DistributionBar v-if="diffMode && stats" :stats="stats" />
        <InspectorRowList :rows="legendRows" @select="selectLegendRow" />
        <div class="overview-meta text-[11px] leading-[1.35] text-ink/35">
          {{ overviewMeta }}
        </div>
      </div>
      <div v-if="diffMode" class="changed-sections-block mt-[30px]">
        <div
          class="changed-sections-label mb-2 font-mono text-[10.5px] tracking-[0.08em] text-ink/35"
        >
          CHANGED SECTIONS
        </div>
        <ChangedSectionsList :active-aggregate="activeAggregate" @select="emit('select', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { usePayload } from '../../composables/usePayload.js';
import { useViewState } from '../../composables/useViewState.js';
import { GROUP_COLORS, MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';

const emit = defineEmits(['select']);

const { payload, stats, diffMode } = usePayload();
const { activeAggregate } = useViewState();

const untouchedCount = computed(
  () => payload.value?.graph?.nodes?.filter((node) => node.status === 'normal').length ?? 0,
);
const legendRows = computed(() => {
  if (diffMode.value) {
    return [
      {
        key: 'changed',
        color: STATUS_COLORS.changed,
        label: 'Changed',
        count: stats.value?.changedCount ?? 0,
        selectable: false,
      },
      {
        key: 'dependent',
        color: STATUS_COLORS.dependent,
        label: 'Blast radius',
        count: stats.value?.dependentCount ?? 0,
        selectable: false,
      },
      {
        key: 'dependency',
        color: STATUS_COLORS.dependency,
        label: 'Change depends on',
        count: stats.value?.dependencyCount ?? 0,
        selectable: false,
      },
      {
        key: 'normal',
        color: MUTED_COLOR,
        label: 'Untouched',
        count: untouchedCount.value,
        selectable: false,
        dimmed: true,
      },
    ].filter((row) => row.count > 0);
  }

  const groups = payload.value?.graph?.groups ?? [];
  const rows = groups.slice(0, GROUP_COLORS.length).map((group, slotIndex) => ({
    key: group.name,
    color: GROUP_COLORS[slotIndex],
    label: group.name,
    count: group.count,
  }));
  if (groups.length > GROUP_COLORS.length) {
    const otherCount = groups
      .slice(GROUP_COLORS.length)
      .reduce((totalCount, group) => totalCount + group.count, 0);
    rows.push({
      key: 'other',
      color: MUTED_COLOR,
      label: 'other',
      count: `(${otherCount})`,
      selectable: false,
    });
  }
  return rows;
});
const overviewMeta = computed(
  () => `${stats.value?.fileCount ?? 0} files · ${stats.value?.linkCount ?? 0} imports`,
);

const selectLegendRow = (row) => {
  emit('select', { sectionId: row.key, level: 2 });
};
</script>
