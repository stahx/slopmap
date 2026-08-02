import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import HelpPopover from './HelpPopover.vue';

describe('app/src/components/HelpPopover', () => {
  test('render', () => {
    const wrapper = shallowMount(HelpPopover);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('drag rotate · scroll zoom');
  });
});
