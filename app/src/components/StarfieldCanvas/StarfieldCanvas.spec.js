import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import StarfieldCanvas from './StarfieldCanvas.vue';

vi.mock('../../composables/useStarfield.js', () => ({
  useStarfield: () => {},
}));

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const theme = ref('galaxy');

  return {
    useSettings: () => ({ theme }),
  };
});

describe('app/src/components/StarfieldCanvas', () => {
  test('render', () => {
    const wrapper = shallowMount(StarfieldCanvas);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('canvas').exists()).toBe(true);
  });
});
