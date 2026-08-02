import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import ControlsPill from './ControlsPill.vue';

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const isAggregatedView = ref(true);

  return {
    useViewState: () => ({ isAggregatedView }),
  };
});

describe('app/src/components/ControlsPill', () => {
  test('render', () => {
    const wrapper = shallowMount(ControlsPill, {
      global: {
        stubs: {
          CompactnessSlider: true,
          FilesFilters: true,
          ThemeToggle: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.controls-pill').exists()).toBe(true);
  });
});
