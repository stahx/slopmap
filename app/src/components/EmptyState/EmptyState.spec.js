import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import EmptyState from './EmptyState.vue';

describe('app/src/components/EmptyState', () => {
  test('render', () => {
    const wrapper = shallowMount(EmptyState, {
      props: {
        message: 'nothing to display',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toBe('nothing to display');
  });
});
