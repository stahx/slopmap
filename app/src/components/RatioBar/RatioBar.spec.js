import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import RatioBar from './RatioBar.vue';

describe('app/src/components/RatioBar', () => {
  test('render', () => {
    const wrapper = shallowMount(RatioBar, {
      props: {
        additions: 4,
        deletions: 2,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.ratio-additions').exists()).toBe(true);
    expect(wrapper.find('.ratio-deletions').exists()).toBe(true);
  });

  test('zero deletions renders no red segment', () => {
    const wrapper = shallowMount(RatioBar, {
      props: {
        additions: 4,
        deletions: 0,
      },
    });

    expect(wrapper.find('.ratio-additions').exists()).toBe(true);
    expect(wrapper.find('.ratio-deletions').exists()).toBe(false);
  });

  test('both zero renders no colored segments', () => {
    const wrapper = shallowMount(RatioBar, {
      props: {
        additions: 0,
        deletions: 0,
      },
    });

    expect(wrapper.find('.ratio-additions').exists()).toBe(false);
    expect(wrapper.find('.ratio-deletions').exists()).toBe(false);
  });
});
