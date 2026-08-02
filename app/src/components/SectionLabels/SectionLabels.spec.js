import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import SectionLabels from './SectionLabels.vue';

vi.mock('../../composables/useSectionLabels.js', () => ({
  useSectionLabels: () => ({ registerLabel: () => {} }),
}));

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const compactnessLevel = ref(2);

  return {
    useSettings: () => ({ compactnessLevel }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const activeAggregate = ref({
    sections: [{ id: 'src/core', group: 'src/core' }],
  });

  return {
    useViewState: () => ({ activeAggregate }),
  };
});

describe('app/src/components/SectionLabels', () => {
  test('render', () => {
    const wrapper = shallowMount(SectionLabels);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/core');
  });
});
