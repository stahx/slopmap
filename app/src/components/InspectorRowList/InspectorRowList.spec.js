import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import InspectorRowList from './InspectorRowList.vue';

const ROWS_FIXTURE = [
  { key: 'src', label: 'src', color: '#ffffff', count: 4 },
  { key: 'empty', label: 'Untouched', meta: '312 loc', selectable: false, dimmed: true },
];

describe('app/src/components/InspectorRowList', () => {
  test('renders selectable and non-selectable rows', () => {
    const wrapper = shallowMount(InspectorRowList, {
      props: { rows: ROWS_FIXTURE },
    });

    expect(wrapper.findAll('button')).toHaveLength(1);
    expect(wrapper.findAll('.inspector-row')).toHaveLength(2);
    expect(wrapper.text()).toContain('4');
    expect(wrapper.text()).toContain('312 loc');
    expect(wrapper.findAll('.inspector-row')[1].classes()).toContain('opacity-50');
    expect(wrapper.findAll('.inspector-row-dot')[1].classes()).toContain('invisible');
  });

  test('emits select for selectable rows only', async () => {
    const wrapper = shallowMount(InspectorRowList, {
      props: { rows: ROWS_FIXTURE },
    });

    await wrapper.get('button').trigger('click');
    await wrapper.findAll('.inspector-row')[1].trigger('click');

    expect(wrapper.emitted('select')).toEqual([[ROWS_FIXTURE[0]]]);
  });
});
