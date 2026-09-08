import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import RailButton from './RailButton.vue';

const BASE_PROPS = {
  glyph: '◉',
  label: 'Compact',
  hint: 'Roll files up into groups',
};

describe('app/src/components/IconRail/subcomponents/RailButton', () => {
  test('render', () => {
    const wrapper = shallowMount(RailButton, { props: BASE_PROPS });

    expect(wrapper.find('.rail-glyph').text()).toBe('◉');
    expect(wrapper.find('button').attributes('aria-label')).toBe('Compact');
  });

  test('shows the tooltip markup only while collapsed', () => {
    const collapsed = shallowMount(RailButton, { props: BASE_PROPS });

    expect(collapsed.find('.rail-tooltip').exists()).toBe(true);
    expect(collapsed.find('.rail-tooltip-label').text()).toBe('Compact');
    expect(collapsed.find('.rail-tooltip-hint').text()).toBe('Roll files up into groups');
    expect(collapsed.find('.rail-label').exists()).toBe(false);

    const expanded = shallowMount(RailButton, { props: { ...BASE_PROPS, expanded: true } });

    expect(expanded.find('.rail-tooltip').exists()).toBe(false);
    expect(expanded.find('.rail-label').text()).toBe('Compact');
  });

  test('emits activate on click', async () => {
    const wrapper = shallowMount(RailButton, { props: BASE_PROPS });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('activate')).toHaveLength(1);
  });
});
