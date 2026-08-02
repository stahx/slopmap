import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import LegendList from './LegendList.vue';

describe('app/src/components/LegendList', () => {
  test('render', () => {
    const wrapper = shallowMount(LegendList, {
      props: {
        rows: [{ color: '#ffffff', label: 'Changed', count: 4 }],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Changed');
    expect(wrapper.text()).toContain('4');
  });
});
