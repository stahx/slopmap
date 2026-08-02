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
        />
        <EmptyState v-if="importedFiles.length === 0" message="no cross-section imports" />
      </template>
      <template v-else>
        <SectionFileRow
          v-for="sectionFile in sectionFiles"
          :key="sectionFile.id"
          :node="sectionFile"
        />
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
  <DiffModal v-if="diffFile" :change-file="diffFile" @close="closeDiff" />
</template>

<script setup>
import { computed, shallowRef } from 'vue';

import { useInspector } from '../../composables/useInspector.js';
import { usePayload } from '../../composables/usePayload.js';
import { useSelection } from '../../composables/useSelection.js';
import { MUTED_COLOR, STATUS_COLORS } from '../../lib/graphTokens.js';

const { context, diffMode } = usePayload();
const { deselect } = useSelection();
const {
  activeSection,
  selectedTab,
  copied,
  changedFiles,
  dependentFiles,
  dependentHiddenCount,
  importedFiles,
  sectionFiles,
  tabCounts,
  importerCountsByTarget,
  copyPaths,
  isolateBlast,
} = useInspector();

const diffFile = shallowRef(null);

const statusStyle = computed(() => {
  const statusColor = STATUS_COLORS[activeSection.value?.status] ?? MUTED_COLOR;
  return {
    background: statusColor,
    boxShadow: `0 0 12px 3px ${statusColor}80`,
  };
});

const importerCountFor = (path) => importerCountsByTarget.value.get(path) ?? 0;
const openDiff = (changeFile) => {
  diffFile.value = changeFile;
};
const closeDiff = () => {
  diffFile.value = null;
};
</script>
