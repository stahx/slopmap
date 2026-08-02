import { computed, ref } from 'vue';

import { buildPayloadIndex } from '../lib/payloadIndex.js';
import {
  changedFilesFor,
  importedFilesFor,
  nodeMatchesSection,
  sectionFilesFor,
} from '../lib/sections.js';
import { usePayload } from './usePayload.js';
import { useSelection } from './useSelection.js';
import { useSettings } from './useSettings.js';
import { useViewState } from './useViewState.js';

const { payload, changes } = usePayload();
const { selectedSection, selectedTab, deselect } = useSelection();
const { compactnessLevel } = useSettings();
const { aggregateFilter, impactOnly, showView } = useViewState();

const copied = ref(false);
let copiedTimeoutId = null;

const activeSection = computed(() => selectedSection.value);
const payloadIndex = computed(() =>
  payload.value === null
    ? {
        importerCountsByTarget: new Map(),
        importedTargetsBySource: new Map(),
        groupColors: new Map(),
      }
    : buildPayloadIndex(payload.value.graph),
);
const nodesById = computed(
  () => new Map((payload.value?.graph?.nodes ?? []).map((node) => [node.id, node])),
);
const changedFiles = computed(() => {
  if (activeSection.value === null) return [];
  return changedFilesFor(changes.value, activeSection.value, compactnessLevel.value);
});
const dependentFiles = computed(() =>
  Array.isArray(activeSection.value?.downstreamFiles) ? activeSection.value.downstreamFiles : [],
);
const dependentHiddenCount = computed(() =>
  Math.max((activeSection.value?.downstreamTotal ?? 0) - dependentFiles.value.length, 0),
);
const importedFiles = computed(() => {
  if (activeSection.value === null) return [];
  const matchesActiveSection = (nodeOrId, section, level) =>
    nodeMatchesSection(
      typeof nodeOrId === 'object' ? nodeOrId : nodesById.value.get(nodeOrId),
      section,
      level,
    );
  return importedFilesFor(
    payload.value?.graph?.links ?? [],
    changedFiles.value.map((changeFile) => changeFile.path),
    activeSection.value,
    compactnessLevel.value,
    matchesActiveSection,
  );
});
const sectionFiles = computed(() => {
  if (activeSection.value === null) return [];
  return sectionFilesFor(
    payload.value?.graph?.nodes ?? [],
    activeSection.value,
    compactnessLevel.value,
  );
});
const tabCounts = computed(() => ({
  files: changedFiles.value.length,
  dependents: activeSection.value?.downstreamTotal ?? 0,
  imports: importedFiles.value.length,
}));
const importerCountsByTarget = computed(() => payloadIndex.value.importerCountsByTarget);

const copyPaths = async () => {
  if (activeSection.value === null) return;
  try {
    await globalThis.navigator.clipboard.writeText(
      changedFiles.value.map((changeFile) => changeFile.path).join('\n'),
    );
    copied.value = true;
    if (copiedTimeoutId !== null) globalThis.clearTimeout(copiedTimeoutId);
    copiedTimeoutId = globalThis.setTimeout(() => {
      copied.value = false;
      copiedTimeoutId = null;
    }, 1500);
  } catch {
    return;
  }
};

const isolateBlast = () => {
  if (activeSection.value === null) return;
  aggregateFilter.value = {
    mode:
      compactnessLevel.value === 1 ? 'root' : compactnessLevel.value === 2 ? 'group' : 'section',
    value: activeSection.value.id,
  };
  impactOnly.value = true;
  deselect();
  showView('files');
};

export const useInspector = () => ({
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
});
