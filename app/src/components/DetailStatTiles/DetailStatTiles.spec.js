import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import DetailStatTiles from './DetailStatTiles.vue';

describe('app/src/components/DetailStatTiles', () => {
  test('render', () => {
    const wrapper = shallowMount(DetailStatTiles, {
      props: {
        section: {
          changedCount: 2,
          downstreamTotal: 5,
          additions: 8,
          deletions: 3,
        },
        diffMode: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('files changed');
    expect(wrapper.text()).toContain('blast radius');
    expect(wrapper.text()).toContain('11');
  });
});
