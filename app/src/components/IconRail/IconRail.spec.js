import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import IconRail from './IconRail.vue';

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const dimension = ref('3d');

  return {
    useSettings: () => ({ dimension }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const currentView = ref('compact');

  return {
    useViewState: () => ({
      currentView,
      showView: () => {},
    }),
  };
});

describe('app/src/components/IconRail', () => {
  test('render', () => {
    const wrapper = shallowMount(IconRail, {
      global: {
        stubs: {
          HelpPopover: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Map controls');
    expect(wrapper.findAll('button')).toHaveLength(4);
  });
});
