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
});
