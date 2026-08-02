import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import ChangedSectionsList from './ChangedSectionsList.vue';

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const compactnessLevel = ref(3);

  return {
    useSettings: () => ({ compactnessLevel }),
  };
});

const SECTION_FIXTURE = {
  id: 'src/core',
  status: 'changed',
  changedCount: 3,
};
const INSPECTOR_ROW_LIST_STUB = {
  name: 'InspectorRowList',
  props: ['rows'],
  emits: ['select'],
  template: '<div></div>',
};

describe('app/src/components/ChangedSectionsList', () => {
  test('render', () => {
    const wrapper = shallowMount(ChangedSectionsList, {
      props: {
        activeAggregate: { sections: [SECTION_FIXTURE] },
      },
      global: {
        stubs: {
          InspectorRowList: INSPECTOR_ROW_LIST_STUB,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'InspectorRowList' }).props('rows')).toEqual([
      {
        key: 'src/core',
        label: 'src/core',
        color: '#e8564a',
        count: 3,
      },
    ]);
  });

  test('emits select with the section', async () => {
    const wrapper = shallowMount(ChangedSectionsList, {
      props: {
        activeAggregate: { sections: [SECTION_FIXTURE] },
      },
      global: {
        stubs: {
          InspectorRowList: INSPECTOR_ROW_LIST_STUB,
        },
      },
    });

    wrapper.findComponent({ name: 'InspectorRowList' }).vm.$emit('select', {
      key: SECTION_FIXTURE.id,
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('select')).toEqual([[{ sectionId: SECTION_FIXTURE.id, level: 3 }]]);
  });
});
