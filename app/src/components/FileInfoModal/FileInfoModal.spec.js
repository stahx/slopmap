import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import InspectorRowList from '../InspectorRowList/InspectorRowList.vue';
import FileInfoModal from './FileInfoModal.vue';

const { openFileMock } = vi.hoisted(() => ({ openFileMock: vi.fn() }));

vi.mock('../../composables/usePayload.js', async () => {
  const { ref } = await import('vue');
  const diffMode = ref(true);

  return {
    usePayload: () => ({ diffMode }),
  };
});

vi.mock('../../composables/useInspector.js', async () => {
  const { ref } = await import('vue');
  const nodes = [
    { id: 'src/main.js', group: 'src', loc: 120, status: 'dependent' },
    { id: 'lib/import.js', group: 'lib', loc: 40, status: 'normal' },
    { id: 'app/importer.js', group: 'app', loc: 70, status: 'normal' },
  ];

  return {
    useInspector: () => ({
      importedTargetsBySource: ref(new Map([['src/main.js', new Set(['lib/import.js'])]])),
      importerIdsByTarget: ref(new Map([['src/main.js', new Set(['app/importer.js'])]])),
      groupColors: ref(
        new Map([
          ['src', '#ffffff'],
          ['lib', '#eeeeee'],
          ['app', '#dddddd'],
        ]),
      ),
      nodesById: ref(new Map(nodes.map((node) => [node.id, node]))),
      openFile: openFileMock,
    }),
  };
});

const NODE_FIXTURE = { id: 'src/main.js', group: 'src', loc: 120, status: 'dependent' };

const mountFileInfoModal = () =>
  mount(FileInfoModal, {
    props: { node: NODE_FIXTURE },
    global: {
      components: {
        InspectorRowList,
      },
      stubs: {
        EmptyState: true,
        StatusBadge: true,
        teleport: true,
      },
    },
  });

describe('app/src/components/FileInfoModal', () => {
  beforeEach(() => {
    openFileMock.mockClear();
  });

  test('renders relationships and retargets from a row', async () => {
    const wrapper = mountFileInfoModal();

    expect(wrapper.text()).toContain('src/main.js');
    expect(wrapper.text()).toContain('120 loc · src');
    expect(wrapper.text()).toContain('lib/import.js');
    expect(wrapper.text()).toContain('app/importer.js');
    expect(wrapper.findComponent({ name: 'StatusBadge' }).exists()).toBe(true);

    await wrapper.findAll('.inspector-row')[0].trigger('click');

    expect(openFileMock).toHaveBeenCalledWith('lib/import.js');
    wrapper.unmount();
  });

  test('closes on Escape', () => {
    const wrapper = mountFileInfoModal();

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });
});
