import { shallowMount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import TopHeader from './TopHeader.vue';

vi.mock('../../composables/usePayload.js', async () => {
  const { ref } = await import('vue');
  const repoName = ref('slopmap');
  const context = ref({
    branch: 'feature/component-dirs',
    baseRef: 'main',
    generatedAt: '2026-08-02T12:00:00.000Z',
  });
  const stats = ref({ fileCount: 26, linkCount: 12 });
  const changes = ref({ totals: { additions: 40, deletions: 8 } });

  return {
    usePayload: () => ({ repoName, context, stats, changes }),
  };
});

describe('app/src/components/TopHeader', () => {
  test('render', () => {
    const wrapper = shallowMount(TopHeader, {
      global: {
        stubs: {
          RatioBar: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('slopmap');
    expect(wrapper.text()).toContain('feature/component-dirs');
    expect(wrapper.text()).toContain('26 files · 12 imports');

    wrapper.unmount();
  });
});
