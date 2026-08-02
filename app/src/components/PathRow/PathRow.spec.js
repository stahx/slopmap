import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import PathRow from './PathRow.vue';

describe('app/src/components/PathRow', () => {
  test('render', () => {
    const wrapper = shallowMount(PathRow, {
      props: {
        path: 'src/core/main.js',
        variant: 'dependents',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/core/main.js');
  });
});
