<template>
  <Teleport to="body">
    <div
      class="diff-backdrop fixed inset-0 z-20 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[4px]"
      @click.self="closeModal"
    >
      <section
        class="diff-panel flex max-h-[84vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[14px] border border-ink/14 bg-panel/97 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        :aria-label="`Diff for ${changeFile.path}`"
      >
        <header
          class="diff-header flex flex-[0_0_auto] items-center gap-2.5 border-b border-ink/10 px-4 py-[15px]"
        >
          <StatusBadge :status="changeFile.status" />
          <div
            class="diff-path min-w-0 flex-[1_1_auto] font-mono text-[13px] leading-[1.4] font-medium text-ink [overflow-wrap:anywhere]"
          >
            {{ changeFile.path }}
          </div>
          <div class="diff-counts flex flex-[0_0_auto] gap-2 font-mono text-[11px]">
            <span class="diff-additions text-success-green">+{{ changeFile.additions }}</span>
            <span class="diff-deletions text-danger-red">−{{ changeFile.deletions }}</span>
          </div>
          <button
            class="diff-close m-0 size-7 flex-[0_0_auto] cursor-pointer border-0 bg-transparent p-0 text-[20px] leading-none text-ink/55"
            type="button"
            aria-label="Close diff"
            @click="closeModal"
          >
            ×
          </button>
        </header>
        <div class="diff-body min-h-0 overflow-auto py-2.5">
          <div
            v-for="(diffLine, lineIndex) in diffLines"
            :key="lineIndex"
            class="diff-line min-w-max px-4 py-px font-mono text-[12px] leading-[1.55] whitespace-pre"
            :class="[
              `diff-${diffLine.kind}`,
              {
                'bg-success-green/8 text-success-green': diffLine.kind === 'add',
                'bg-danger-red/8 text-danger-red': diffLine.kind === 'del',
                'bg-accent-yellow/6 text-accent-yellow': diffLine.kind === 'hunk',
                'text-ink/40': diffLine.kind === 'meta',
                'text-ink/75': diffLine.kind === 'context',
              },
            ]"
          >
            {{ diffLine.text }}
          </div>
          <EmptyState v-if="diffLines.length === 0" message="diff not available" />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { parseUnifiedDiff } from '../../lib/diffFormat.js';

const props = defineProps({
  changeFile: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const diffLines = computed(() => parseUnifiedDiff(props.changeFile.patch));

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  globalThis.removeEventListener('keydown', handleKeydown);
});

const closeModal = () => {
  globalThis.removeEventListener('keydown', handleKeydown);
  emit('close');
};

const handleKeydown = (keyboardEvent) => {
  if (keyboardEvent.key === 'Escape') closeModal();
};
</script>
