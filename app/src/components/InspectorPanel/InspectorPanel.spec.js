import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import InspectorPanel from './InspectorPanel.vue';

vi.mock('../../composables/useSelection.js', async () => {
  const { ref } = await import('vue');
  const selectedSection = ref(null);

  return {
    useSelection: () => ({ selectedSection }),
  };
});

describe('app/src/components/InspectorPanel', () => {
  test('render', () => {
    const wrapper = shallowMount(InspectorPanel, {
      global: {
        stubs: {
          InspectorDetail: true,
          InspectorOverview: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('aside').exists()).toBe(true);
  });
});
