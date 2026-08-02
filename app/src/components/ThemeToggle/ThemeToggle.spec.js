import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { themeMock } from '../../composables/useSettings.js';
import ThemeToggle from './ThemeToggle.vue';

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const theme = ref('plain');

  return {
    themeMock: theme,
    useSettings: () => ({ theme }),
  };
});

describe('app/src/components/ThemeToggle', () => {
  beforeEach(() => {
    themeMock.value = 'plain';
  });

  test('render', () => {
    const wrapper = shallowMount(ThemeToggle);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Plain');
    expect(wrapper.text()).toContain('Galaxy');
  });

  test('writes theme on input', async () => {
    const wrapper = shallowMount(ThemeToggle);

    await wrapper.findAll('button')[1].trigger('click');

    expect(themeMock.value).toBe('galaxy');
  });
});
