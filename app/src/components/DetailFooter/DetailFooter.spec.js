import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import DetailFooter from './DetailFooter.vue';

const writeTextMock = vi.fn();

describe('app/src/components/DetailFooter', () => {
  beforeEach(() => {
    writeTextMock.mockReset();
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });
  });

  test('render', () => {
    const wrapper = shallowMount(DetailFooter, {
      props: {
        copied: false,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Copy paths');
  });

  test('copy button swap state', async () => {
    const wrapper = shallowMount(DetailFooter, {
      props: {
        copied: false,
      },
    });
    const copyButton = wrapper.findAll('.detail-action')[0];

    await copyButton.trigger('click');
    expect(wrapper.emitted('copy')).toHaveLength(1);

    await wrapper.setProps({ copied: true });
    expect(copyButton.text()).toBe('Copied');
  });
});
