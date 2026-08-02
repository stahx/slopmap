import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import FilesFilters from './FilesFilters.vue';

vi.mock('../../composables/usePayload.js', async () => {
  const { ref } = await import('vue');
  const diffMode = ref(true);

  return {
    usePayload: () => ({ diffMode }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const aggregateFilter = ref({ mode: 'section', value: 'src/core' });
  const searchTerm = ref('');
  const impactOnly = ref(true);
  const hideIsolated = ref(false);

  return {
    useViewState: () => ({
      aggregateFilter,
      searchTerm,
      impactOnly,
      hideIsolated,
      clearAggregateFilter: () => {},
    }),
  };
});

describe('app/src/components/FilesFilters', () => {
  test('render', () => {
    const wrapper = shallowMount(FilesFilters);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('impact only');
    expect(wrapper.text()).toContain('src/core');
  });
});
