import { computed, ref, shallowRef } from 'vue';

import { buildPayloadIndex } from '../lib/payloadIndex.js';
import {
  changedFilesFor,
  childSectionsFor,
  importedFilesFor,
  nodeMatchesSection,
  sectionFilesFor,
} from '../lib/sections.js';
import { usePayload } from './usePayload.js';
import { useSelection } from './useSelection.js';
import { useSettings } from './useSettings.js';
import { useViewState } from './useViewState.js';

const { payload, changes, diffMode } = usePayload();
const { selectedSection, selectedTab, deselect } = useSelection();
const { compactnessLevel } = useSettings();
const { aggregateFilter, impactOnly, showView } = useViewState();

const copied = ref(false);
const openedFile = shallowRef(null);
let copiedTimeoutId = null;

const activeSection = computed(() => selectedSection.value);
const payloadIndex = computed(() =>
  payload.value === null
    ? {
        importerCountsByTarget: new Map(),
        importedTargetsBySource: new Map(),
        importerIdsByTarget: new Map(),
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
const childSections = computed(() => {
  if (activeSection.value === null || compactnessLevel.value === 3) return [];
  const childLevelName = compactnessLevel.value === 1 ? 'groups' : 'dirs';
  return childSectionsFor(
    payload.value?.graph?.levels?.[childLevelName]?.sections ?? [],
    activeSection.value,
  );
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
const importedTargetsBySource = computed(() => payloadIndex.value.importedTargetsBySource);
const importerIdsByTarget = computed(() => payloadIndex.value.importerIdsByTarget);
const groupColors = computed(() => payloadIndex.value.groupColors);

const openDiff = (changeFile) => {
  const nextOpenedFile = { kind: 'diff', changeFile };
  openedFile.value = nextOpenedFile;
  return nextOpenedFile;
};

const openFile = (pathOrId) => {
  const fileId = typeof pathOrId === 'string' ? pathOrId : (pathOrId?.id ?? pathOrId?.path);
  if (!fileId) return null;
  const changeFiles = Array.isArray(changes.value) ? changes.value : (changes.value?.files ?? []);
  const changeFile = diffMode.value
    ? changeFiles.find((candidateFile) => candidateFile.path === fileId)
    : undefined;
  if (changeFile !== undefined) return openDiff(changeFile);
  const node = nodesById.value.get(fileId);
  if (node === undefined) return null;
  const nextOpenedFile = { kind: 'info', node };
  openedFile.value = nextOpenedFile;
  return nextOpenedFile;
};

const closeFile = () => {
  openedFile.value = null;
};

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
  childSections,
  dependentFiles,
  dependentHiddenCount,
  importedFiles,
  sectionFiles,
  tabCounts,
  importerCountsByTarget,
  importedTargetsBySource,
  importerIdsByTarget,
  groupColors,
  nodesById,
  openedFile,
  openFile,
  openDiff,
  closeFile,
  copyPaths,
  isolateBlast,
});
