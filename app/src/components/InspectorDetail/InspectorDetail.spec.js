import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import InspectorDetail from './InspectorDetail.vue';

const { mockTriggerSectionClick } = vi.hoisted(() => ({ mockTriggerSectionClick: vi.fn() }));

vi.mock('../../composables/usePayload.js', async () => {
  const { ref } = await import('vue');
  const context = ref(null);
  const diffMode = ref(false);

  return {
    usePayload: () => ({ context, diffMode }),
  };
});

vi.mock('../../composables/useSelection.js', () => ({
  useSelection: () => ({ deselect: () => {} }),
}));

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const compactnessLevel = ref(2);

  return {
    useSettings: () => ({ compactnessLevel }),
  };
});

vi.mock('../../composables/useGraphInstances.js', () => ({
  triggerSectionClick: mockTriggerSectionClick,
}));

vi.mock('../../composables/useInspector.js', async () => {
  const { ref } = await import('vue');
  const activeSection = ref({
    id: 'src/core',
    status: 'changed',
    fileCount: 2,
    loc: 80,
  });
  const selectedTab = ref('files');
  const copied = ref(false);
  const changedFiles = ref([]);
  const childSections = ref([{ id: 'src/core/internal', fileCount: 1 }]);
  const dependentFiles = ref([]);
  const dependentHiddenCount = ref(0);
  const importedFiles = ref([]);
  const sectionFiles = ref([{ id: 'src/core/main.js', group: 'src', loc: 80 }]);
  const tabCounts = ref({ files: 0, dependents: 0, imports: 0 });
  const importerCountsByTarget = ref(new Map());
  const groupColors = ref(new Map([['src', '#ffffff']]));
  const openedFile = ref(null);

  return {
    useInspector: () => ({
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
      openFile: () => {},
      openDiff: () => {},
      closeFile: () => {},
      copyPaths: () => {},
      isolateBlast: () => {},
    }),
  };
});

const GLOBAL_STUBS = {
  ChangedFileCard: true,
  DetailFooter: true,
  DetailStatTiles: true,
  DiffModal: true,
  EmptyState: true,
  FileInfoModal: true,
  InspectorRowList: true,
  InspectorTabs: true,
  PathRow: true,
};

describe('app/src/components/InspectorDetail', () => {
  test('render', () => {
    const wrapper = shallowMount(InspectorDetail, {
      global: { stubs: GLOBAL_STUBS },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/core');
  });

  test('selectChildSection', async () => {
    const wrapper = shallowMount(InspectorDetail, {
      global: { stubs: GLOBAL_STUBS },
    });

    const directoriesList = wrapper
      .find('.detail-directories')
      .findComponent({ name: 'InspectorRowList' });
    await directoriesList.vm.$emit('select', { key: 'src/core/internal' });

    expect(mockTriggerSectionClick).toHaveBeenCalledWith('src/core/internal', 3);
  });
});
