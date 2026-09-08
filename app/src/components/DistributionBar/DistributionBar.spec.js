import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import DistributionBar from './DistributionBar.vue';

describe('app/src/components/DistributionBar', () => {
  test('render', () => {
    const wrapper = shallowMount(DistributionBar, {
      props: {
        stats: {
          fileCount: 12,
          changedCount: 3,
          dependentCount: 2,
          dependencyCount: 1,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findAll('.distribution-segment')).toHaveLength(4);
  });

  test('drops segments with a zero count', () => {
    const wrapper = shallowMount(DistributionBar, {
      props: {
        stats: {
          fileCount: 101,
          changedCount: 0,
          dependentCount: 0,
          dependencyCount: 0,
        },
      },
    });

    expect(wrapper.findAll('.distribution-segment')).toHaveLength(1);
  });

  test('hides the bar when every count is zero', () => {
    const wrapper = shallowMount(DistributionBar, {
      props: {
        stats: {
          fileCount: 0,
          changedCount: 0,
          dependentCount: 0,
          dependencyCount: 0,
        },
      },
    });

    expect(wrapper.find('.distribution-bar').exists()).toBe(false);
  });
});
