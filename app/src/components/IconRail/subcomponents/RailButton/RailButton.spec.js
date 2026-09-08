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

    expect(wrapper.find('button').text()).toBe('◉');
    expect(wrapper.find('button').attributes('aria-label')).toBe('Compact');
  });

  test('renders the tooltip label and hint', () => {
    const wrapper = shallowMount(RailButton, { props: BASE_PROPS });

    expect(wrapper.find('.rail-tooltip-label').text()).toBe('Compact');
    expect(wrapper.find('.rail-tooltip-hint').text()).toBe('Roll files up into groups');
  });

  test('omits the hint line when no hint is given', () => {
    const wrapper = shallowMount(RailButton, { props: { glyph: '?', label: 'Help' } });

    expect(wrapper.find('.rail-tooltip-label').text()).toBe('Help');
    expect(wrapper.find('.rail-tooltip-hint').exists()).toBe(false);
  });

  test('emits activate on click', async () => {
    const wrapper = shallowMount(RailButton, { props: BASE_PROPS });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('activate')).toHaveLength(1);
  });
});
