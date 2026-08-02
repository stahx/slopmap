<template>
  <div v-if="activeSection" class="inspector-detail flex min-h-0 flex-[1_1_auto] flex-col">
    <div class="detail-header-block flex-[0_0_auto] px-5 pt-[18px] pb-4">
      <div class="detail-header flex items-center gap-2.5">
        <span
          class="detail-status-dot size-[11px] flex-[0_0_auto] rounded-full"
          :style="statusStyle"
        ></span>
        <div
          class="detail-title min-w-0 flex-[1_1_auto] font-mono text-[15.5px] leading-[1.35] font-semibold text-ink [overflow-wrap:anywhere]"
        >
          {{ activeSection.id }}
        </div>
        <button
          class="detail-close m-0 size-7 flex-[0_0_auto] cursor-pointer border-0 bg-transparent p-0 text-[18px] leading-none text-ink/40"
          type="button"
          aria-label="Deselect section"
          @click="deselect"
        >
          ×
        </button>
      </div>
      <DetailStatTiles :section="activeSection" :diff-mode="diffMode" />
    </div>
    <div v-if="childSections.length > 0" class="detail-directories flex-[0_0_auto] px-3 pb-4">
      <div
        class="detail-directories-label mb-2 px-2 font-mono text-[10.5px] tracking-[0.08em] text-ink/35"
      >
        DIRECTORIES
      </div>
      <InspectorRowList :rows="childSectionRows" @select="selectChildSection" />
    </div>
    <InspectorTabs v-if="diffMode" v-model:tab="selectedTab" :counts="tabCounts" />
    <div class="detail-content min-h-0 flex-[1_1_auto] overflow-y-auto px-2 py-1.5">
      <template v-if="diffMode && selectedTab === 'files'">
        <ChangedFileCard
          v-for="changeFile in changedFiles"
          :key="changeFile.path"
          :change-file="changeFile"
          :section-id="activeSection.id"
          :importer-count="importerCountFor(changeFile.path)"
          @open-diff="openDiff"
        />
        <EmptyState v-if="changedFiles.length === 0" message="no changed files here" />
      </template>
      <template v-else-if="diffMode && selectedTab === 'dependents'">
        <PathRow
          v-for="filePath in dependentFiles"
          :key="filePath"
          :path="filePath"
          variant="dependents"
          @select="openFile"
        />
        <EmptyState v-if="dependentFiles.length === 0" message="no downstream files" />
        <PathRow
          v-if="dependentHiddenCount > 0"
          variant="dependents"
          :more-count="dependentHiddenCount"
        />
      </template>
      <template v-else-if="diffMode">
        <PathRow
          v-for="filePath in importedFiles"
          :key="filePath"
          :path="filePath"
          variant="imports"
          @select="openFile"
        />
        <EmptyState v-if="importedFiles.length === 0" message="no cross-section imports" />
      </template>
      <template v-else>
        <InspectorRowList :rows="sectionFileRows" @select="selectFileRow" />
        <EmptyState v-if="sectionFiles.length === 0" message="no files here" />
      </template>
    </div>
    <DetailFooter
      :pull-request="context?.pullRequest ?? null"
      :copied="copied"
      @copy="copyPaths"
      @isolate="isolateBlast"
    />
  </div>
  <DiffModal
    v-if="openedFile?.kind === 'diff'"
    :change-file="openedFile.changeFile"
    @close="closeFile"
  />
  <FileInfoModal
    v-else-if="openedFile?.kind === 'info'"
    :node="openedFile.node"
    @close="closeFile"
  />
</template>

<script setup>
import { computed } from 'vue';

import { triggerSectionClick } from '../../composables/useGraphInstances.js';
import { useInspector } from '../../composables/useInspector.js';
import { usePayload } from '../../composables/usePayload.js';
import { useSelection } from '../../composables/useSelection.js';
import { useSettings } from '../../composables/useSettings.js';
import { MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';
import { displayPathFor } from '../../lib/sections.js';

const { context, diffMode } = usePayload();
const { deselect } = useSelection();
const { compactnessLevel } = useSettings();
const {
  activeSection,
  selectedTab,
  copied,
  changedFiles,
  childSections,
  dependentFiles,
  dependentHiddenCount,
  importedFiles,
  sectionFiles,
  tabCounts,
  importerCountsByTarget,
  groupColors,
  openedFile,
  openFile,
  openDiff,
  closeFile,
  copyPaths,
  isolateBlast,
} = useInspector();

const statusStyle = computed(() => {
  const statusColor = STATUS_COLORS[activeSection.value?.status] ?? MUTED_COLOR;
  return {
    background: statusColor,
    boxShadow: `0 0 12px 3px ${statusColor}80`,
  };
});
const childSectionRows = computed(() =>
  childSections.value.map((section) => ({
    key: section.id,
    label: displayPathFor(section.id, activeSection.value.id),
    color: MUTED_COLOR,
    count: section.fileCount,
  })),
);
const sectionFileRows = computed(() =>
  sectionFiles.value.map((node) => ({
    key: node.id,
    label: node.id,
    color: groupColors.value.get(node.group) ?? MUTED_COLOR,
    meta: `${node.loc} loc`,
  })),
);

const importerCountFor = (path) => importerCountsByTarget.value.get(path) ?? 0;
const selectChildSection = (row) => {
  triggerSectionClick(row.key, compactnessLevel.value + 1);
};
const selectFileRow = (row) => {
  openFile(row.key);
};
</script>
