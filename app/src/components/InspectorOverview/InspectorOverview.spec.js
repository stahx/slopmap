import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

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

describe('app/src/components/InspectorOverview', () => {
  test('render', () => {
    const wrapper = shallowMount(InspectorOverview, {
      global: {
        stubs: {
          ChangedSectionsList: true,
          DistributionBar: true,
          LegendList: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('overview');
    expect(wrapper.text()).toContain('1 files · 0 imports');
  });
});
