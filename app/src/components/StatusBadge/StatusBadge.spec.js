import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import StatusBadge from './StatusBadge.vue';

describe('app/src/components/StatusBadge', () => {
  test('render', () => {
    const wrapper = shallowMount(StatusBadge, {
      props: {
        status: 'M',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toBe('M');
  });

  test('variant class per status', () => {
    for (const status of ['M', 'A', 'D', 'R']) {
      const wrapper = shallowMount(StatusBadge, {
        props: { status },
      });

      expect(wrapper.classes()).toContain(`status-${status}`);
    }
  });
});
