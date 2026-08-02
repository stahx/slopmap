<template>
  <Teleport to="body">
    <div
      class="file-info-backdrop fixed inset-0 z-20 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[4px]"
      @click.self="closeModal"
    >
      <section
        class="file-info-panel flex max-h-[84vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[14px] border border-ink/14 bg-panel/97 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        :aria-label="`File information for ${node.id}`"
      >
        <header class="file-info-header flex-[0_0_auto] border-b border-ink/10 px-5 py-4">
          <div class="flex items-center gap-2.5">
            <span
              class="file-info-dot size-2.5 flex-[0_0_auto] rounded-full"
              :style="{ background: nodeColor }"
            ></span>
            <div
              class="file-info-path min-w-0 flex-[1_1_auto] font-mono text-[13px] leading-[1.4] font-medium text-ink [overflow-wrap:anywhere]"
            >
              {{ node.id }}
            </div>
            <button
              class="file-info-close m-0 size-7 flex-[0_0_auto] cursor-pointer border-0 bg-transparent p-0 text-[20px] leading-none text-ink/55"
              type="button"
              aria-label="Close file information"
              @click="closeModal"
            >
              ×
            </button>
          </div>
          <div
            class="file-info-meta mt-2 flex items-center gap-2 pl-5 font-mono text-[11px] text-ink/40"
          >
            <span>{{ node.loc }} loc · {{ node.group }}</span>
            <StatusBadge v-if="diffMode && node.status !== 'normal'" :status="node.status" />
          </div>
        </header>
        <div class="file-info-body min-h-0 overflow-y-auto px-3 py-4">
          <div class="file-info-list-block">
            <div
              class="file-info-list-label mb-2 px-2 font-mono text-[10.5px] tracking-[0.08em] text-ink/35"
            >
              IMPORTS
            </div>
            <InspectorRowList :rows="importRows" @select="selectFile" />
            <EmptyState v-if="importRows.length === 0" message="no imports" />
          </div>
          <div class="file-info-list-block mt-6">
            <div
              class="file-info-list-label mb-2 px-2 font-mono text-[10.5px] tracking-[0.08em] text-ink/35"
            >
              IMPORTED BY
            </div>
            <InspectorRowList :rows="importerRows" @select="selectFile" />
            <EmptyState v-if="importerRows.length === 0" message="not imported by any files" />
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { useInspector } from '../../composables/useInspector.js';
import { usePayload } from '../../composables/usePayload.js';
import { MUTED_COLOR } from '../../lib/graphTokens.js';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const { diffMode } = usePayload();
const { importedTargetsBySource, importerIdsByTarget, groupColors, nodesById, openFile } =
  useInspector();

const nodeColor = computed(() => groupColors.value.get(props.node.group) ?? MUTED_COLOR);
const importRows = computed(() =>
  rowsForIds(importedTargetsBySource.value.get(props.node.id) ?? new Set()),
);
const importerRows = computed(() =>
  rowsForIds(importerIdsByTarget.value.get(props.node.id) ?? new Set()),
);

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  globalThis.removeEventListener('keydown', handleKeydown);
});

const rowsForIds = (fileIds) =>
  [...fileIds]
    .map((fileId) => nodesById.value.get(fileId))
    .filter((node) => node !== undefined)
    .sort((firstNode, secondNode) => firstNode.id.localeCompare(secondNode.id))
    .map((node) => ({
      key: node.id,
      label: node.id,
      color: groupColors.value.get(node.group) ?? MUTED_COLOR,
      meta: `${node.loc} loc`,
    }));

const selectFile = (row) => {
  openFile(row.key);
};

const closeModal = () => {
  emit('close');
};

const handleKeydown = (keyboardEvent) => {
  if (keyboardEvent.key === 'Escape') closeModal();
};
</script>
