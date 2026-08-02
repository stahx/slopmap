import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { compactnessLevelMock } from '../../composables/useSettings.js';
import CompactnessSlider from './CompactnessSlider.vue';

vi.mock('../../composables/useSettings.js', async () => {
  const { ref } = await import('vue');
  const compactnessLevel = ref(2);

  return {
    compactnessLevelMock: compactnessLevel,
    useSettings: () => ({ compactnessLevel }),
  };
});

vi.mock('../../composables/useViewState.js', async () => {
  const { ref } = await import('vue');
  const compactnessLabel = ref('groups');

  return {
    useViewState: () => ({ compactnessLabel }),
  };
});

describe('app/src/components/CompactnessSlider', () => {
  beforeEach(() => {
    compactnessLevelMock.value = 2;
  });

  test('render', () => {
    const wrapper = shallowMount(CompactnessSlider);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('compactness');
    expect(wrapper.text()).toContain('groups');
  });

  test('writes compactness on input', async () => {
    const wrapper = shallowMount(CompactnessSlider);

    await wrapper.get('input').setValue('3');

    expect(compactnessLevelMock.value).toBe(3);
  });
});
