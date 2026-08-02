import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import InspectorTabs from './InspectorTabs.vue';

const COUNTS_FIXTURE = {
  files: 2,
  dependents: 5,
  imports: 3,
};

describe('app/src/components/InspectorTabs', () => {
  test('render', () => {
    const wrapper = shallowMount(InspectorTabs, {
      props: {
        tab: 'files',
        counts: COUNTS_FIXTURE,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Files 2');
    expect(wrapper.text()).toContain('Dependents 5');
  });

  test('emits tab change', async () => {
    const wrapper = shallowMount(InspectorTabs, {
      props: {
        tab: 'files',
        counts: COUNTS_FIXTURE,
      },
    });

    await wrapper.findAll('button')[1].trigger('click');

    expect(wrapper.emitted('update:tab')).toEqual([['dependents']]);
  });
});
