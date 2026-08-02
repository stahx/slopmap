import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import GraphStage from './GraphStage.vue';

vi.mock('../../composables/useGraphInstances.js', () => ({
  useGraphInstances: () => ({
    createGraphInstances: () => {},
    applyView: () => {},
  }),
}));

vi.mock('../../composables/useMapArea.js', () => ({
  useMapArea: () => ({ observe: () => {} }),
}));

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const dimension = ref('3d');

  return {
    useSettings: () => ({ dimension }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const isAggregatedView = ref(true);

  return {
    useViewState: () => ({ isAggregatedView }),
  };
});

describe('app/src/components/GraphStage', () => {
  test('render', () => {
    const wrapper = shallowMount(GraphStage, {
      global: {
        stubs: {
          SectionLabels: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('#graph').exists()).toBe(true);
    expect(wrapper.find('#graph2d').exists()).toBe(true);
  });
});
