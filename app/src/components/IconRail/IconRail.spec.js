import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import RailButton from './subcomponents/RailButton/RailButton.vue';
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

const MOUNT_OPTIONS = {
  global: {
    components: { RailButton },
    stubs: { HelpPopover: true },
  },
};

describe('app/src/components/IconRail', () => {
  test('render', () => {
    const wrapper = mount(IconRail, MOUNT_OPTIONS);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Map controls');
    expect(wrapper.findAll('button')).toHaveLength(4);
  });

  test('every button carries a tooltip label', () => {
    const wrapper = mount(IconRail, MOUNT_OPTIONS);

    expect(wrapper.findAll('.rail-tooltip-label').map((label) => label.text())).toEqual([
      'Compact',
      'Files',
      '3D orbit',
      'Help',
    ]);
  });
});
