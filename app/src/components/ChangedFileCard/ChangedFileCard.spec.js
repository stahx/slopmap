import { shallowMount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

import ChangedFileCard from './ChangedFileCard.vue';

const CHANGE_FILE_FIXTURE = {
  path: 'src/main.js',
  status: 'M',
  additions: 4,
  deletions: 2,
};

describe('app/src/components/ChangedFileCard', () => {
  test('render', () => {
    const wrapper = shallowMount(ChangedFileCard, {
      props: {
        changeFile: CHANGE_FILE_FIXTURE,
        sectionId: 'src',
        importerCount: 3,
      },
      global: {
        stubs: {
          RatioBar: true,
          StatusBadge: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('main.js');
    expect(wrapper.text()).toContain('imported by 3 files');
  });
});
