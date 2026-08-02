import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import SectionFileRow from './SectionFileRow.vue';

describe('app/src/components/SectionFileRow', () => {
  test('render', () => {
    const wrapper = shallowMount(SectionFileRow, {
      props: {
        node: { id: 'src/main.js', loc: 120 },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/main.js');
    expect(wrapper.text()).toContain('120 loc');
  });
});
