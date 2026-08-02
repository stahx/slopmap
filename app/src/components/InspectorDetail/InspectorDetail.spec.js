import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import InspectorDetail from './InspectorDetail.vue';

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
  const dependentFiles = ref([]);
  const dependentHiddenCount = ref(0);
  const importedFiles = ref([]);
  const sectionFiles = ref([{ id: 'src/core/main.js', loc: 80 }]);
  const tabCounts = ref({ files: 0, dependents: 0, imports: 0 });
  const importerCountsByTarget = ref(new Map());

  return {
    useInspector: () => ({
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
      copyPaths: () => {},
      isolateBlast: () => {},
    }),
  };
});

describe('app/src/components/InspectorDetail', () => {
  test('render', () => {
    const wrapper = shallowMount(InspectorDetail, {
      global: {
        stubs: {
          ChangedFileCard: true,
          DetailFooter: true,
          DetailStatTiles: true,
          DiffModal: true,
          EmptyState: true,
          InspectorTabs: true,
          PathRow: true,
          SectionFileRow: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/core');
  });
});
