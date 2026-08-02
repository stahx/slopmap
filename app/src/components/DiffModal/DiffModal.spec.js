import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import DiffModal from './DiffModal.vue';

const CHANGE_FILE_FIXTURE = {
  path: 'src/main.js',
  status: 'M',
  additions: 1,
  deletions: 1,
  patch: '@@ -1 +1 @@\n-old line\n+new line',
};

const mountDiffModal = () =>
  shallowMount(DiffModal, {
    props: {
      changeFile: CHANGE_FILE_FIXTURE,
    },
    global: {
      stubs: {
        EmptyState: true,
        StatusBadge: true,
        teleport: true,
      },
    },
  });

describe('app/src/components/DiffModal', () => {
  test('render', () => {
    const wrapper = mountDiffModal();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findAll('.diff-line')).toHaveLength(3);
    expect(wrapper.text()).toContain('+new line');

    wrapper.unmount();
  });

  test('closes on Escape', () => {
    const wrapper = mountDiffModal();

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });
});
