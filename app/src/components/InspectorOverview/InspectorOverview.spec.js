import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { usePayload } from '../../composables/usePayload.js';
import InspectorOverview from './InspectorOverview.vue';

vi.mock('../../composables/usePayload.js', async () => {
  const { ref } = await import('vue');
  const payload = ref({
    graph: {
      nodes: [{ id: 'src/main.js', status: 'normal' }],
      groups: [{ name: 'src', count: 1 }],
    },
  });
  const stats = ref({ fileCount: 1, linkCount: 0 });
  const diffMode = ref(false);

  return {
    usePayload: () => ({ payload, stats, diffMode }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const activeAggregate = ref(null);

  return {
    useViewState: () => ({ activeAggregate }),
  };
});

const InspectorRowListStub = {
  name: 'InspectorRowList',
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
  emits: ['select'],
  template: '<div class="inspector-row-list-stub"></div>',
};

const MOUNT_OPTIONS = {
  global: {
    stubs: {
      ChangedSectionsList: true,
      DistributionBar: true,
      InspectorRowList: InspectorRowListStub,
    },
  },
};

let diffMode;
let stats;

describe('app/src/components/InspectorOverview', () => {
  beforeEach(() => {
    ({ diffMode, stats } = usePayload());
    diffMode.value = false;
    stats.value = { fileCount: 1, linkCount: 0 };
  });

  test('render', () => {
    const wrapper = shallowMount(InspectorOverview, MOUNT_OPTIONS);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('overview');
    expect(wrapper.text()).toContain('1 files · 0 imports');
  });

  test('emits level-two selection for a group row', () => {
    const wrapper = shallowMount(InspectorOverview, MOUNT_OPTIONS);

    wrapper.findComponent({ name: 'InspectorRowList' }).vm.$emit('select', { key: 'src' });

    expect(wrapper.emitted('select')).toEqual([[{ sectionId: 'src', level: 2 }]]);
  });

  test('hides diff legend rows with a zero count', () => {
    diffMode.value = true;
    stats.value = {
      fileCount: 101,
      linkCount: 156,
      changedCount: 0,
      dependentCount: 0,
      dependencyCount: 0,
    };

    const wrapper = shallowMount(InspectorOverview, MOUNT_OPTIONS);
    const rows = wrapper.findComponent({ name: 'InspectorRowList' }).props('rows');

    expect(rows.map((row) => row.label)).toEqual(['Untouched']);
  });
});
