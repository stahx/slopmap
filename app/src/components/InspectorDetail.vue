<script setup>
import { computed } from 'vue';

import { useInspector } from '../composables/useInspector.js';
import { usePayload } from '../composables/usePayload.js';
import { useSelection } from '../composables/useSelection.js';
import { MUTED_COLOR, STATUS_COLORS } from '../lib/graphTokens.js';

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

const statusStyle = computed(() => {
  const statusColor = STATUS_COLORS[activeSection.value?.status] ?? MUTED_COLOR;
  return {
    background: statusColor,
    boxShadow: `0 0 12px 3px ${statusColor}80`,
  };
});

const importerCountFor = (path) => importerCountsByTarget.value.get(path) ?? 0;
</script>

<template>
  <div v-if="activeSection" class="inspector-detail">
    <div class="detail-header-block">
      <div class="detail-header">
        <span class="detail-status-dot" :style="statusStyle"></span>
        <div class="detail-title">{{ activeSection.id }}</div>
        <button class="detail-close" type="button" aria-label="Deselect section" @click="deselect">
          ×
        </button>
      </div>
      <DetailStatTiles :section="activeSection" :diff-mode="diffMode" />
    </div>
    <InspectorTabs v-if="diffMode" v-model:tab="selectedTab" :counts="tabCounts" />
    <div class="detail-content">
      <template v-if="diffMode && selectedTab === 'files'">
        <ChangedFileCard
          v-for="changeFile in changedFiles"
          :key="changeFile.path"
          :change-file="changeFile"
          :section-id="activeSection.id"
          :importer-count="importerCountFor(changeFile.path)"
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
</template>

<style scoped>
.inspector-detail {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.inspector-detail[hidden] {
  display: none;
}

.detail-header-block {
  flex: 0 0 auto;
  padding: 18px 20px 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-header[hidden] {
  display: none;
}

.detail-status-dot {
  width: 11px;
  height: 11px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.detail-title {
  min-width: 0;
  flex: 1 1 auto;
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.detail-close {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
  color: rgba(232, 230, 223, 0.4);
  background: transparent;
  border: 0;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.detail-content {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 6px 8px;
}
</style>
