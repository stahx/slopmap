import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import ChangedSectionsList from './ChangedSectionsList.vue';

const SECTION_FIXTURE = {
  id: 'src/core',
  status: 'changed',
  changedCount: 3,
};

describe('app/src/components/ChangedSectionsList', () => {
  test('render', () => {
    const wrapper = shallowMount(ChangedSectionsList, {
      props: {
        activeAggregate: { sections: [SECTION_FIXTURE] },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('src/core');
  });

  test('emits select with the section', async () => {
    const wrapper = shallowMount(ChangedSectionsList, {
      props: {
        activeAggregate: { sections: [SECTION_FIXTURE] },
      },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('select')).toEqual([[SECTION_FIXTURE]]);
  });
});
