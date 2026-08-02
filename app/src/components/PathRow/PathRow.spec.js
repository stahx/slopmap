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

  test('emits select for a path and keeps the more footer non-interactive', async () => {
    const wrapper = shallowMount(PathRow, {
      props: {
        path: 'src/core/main.js',
        variant: 'imports',
        moreCount: 3,
      },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('select')).toEqual([['src/core/main.js']]);
    expect(wrapper.findAll('button')).toHaveLength(1);
    expect(wrapper.text()).toContain('+ 3 more');
  });
});
