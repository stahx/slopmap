<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { parseUnifiedDiff } from '../lib/diffFormat.js';

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

<template>
  <Teleport to="body">
    <div class="diff-backdrop" @click.self="closeModal">
      <section
        class="diff-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="`Diff for ${changeFile.path}`"
      >
        <header class="diff-header">
          <StatusBadge :status="changeFile.status" />
          <div class="diff-path">{{ changeFile.path }}</div>
          <div class="diff-counts">
            <span class="diff-additions">+{{ changeFile.additions }}</span>
            <span class="diff-deletions">−{{ changeFile.deletions }}</span>
          </div>
          <button class="diff-close" type="button" aria-label="Close diff" @click="closeModal">
            ×
          </button>
        </header>
        <div class="diff-body">
          <div
            v-for="(diffLine, lineIndex) in diffLines"
            :key="lineIndex"
            class="diff-line"
            :class="`diff-${diffLine.kind}`"
          >
            {{ diffLine.text }}
          </div>
          <EmptyState v-if="diffLines.length === 0" message="diff not available" />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.diff-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.diff-backdrop[hidden] {
  display: none;
}

.diff-panel {
  display: flex;
  width: 100%;
  max-width: 920px;
  max-height: 84vh;
  flex-direction: column;
  overflow: hidden;
  background: rgba(14, 16, 32, 0.97);
  border: 1px solid rgba(232, 230, 223, 0.14);
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.diff-panel[hidden] {
  display: none;
}

.diff-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  padding: 15px 16px;
  border-bottom: 1px solid rgba(232, 230, 223, 0.1);
}

.diff-header[hidden] {
  display: none;
}

.diff-path {
  min-width: 0;
  flex: 1 1 auto;
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.diff-counts {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.diff-counts[hidden] {
  display: none;
}

.diff-additions {
  color: #6fbf8b;
}

.diff-deletions {
  color: #e8564a;
}

.diff-close {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
  color: rgba(232, 230, 223, 0.55);
  background: transparent;
  border: 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.diff-body {
  min-height: 0;
  overflow: auto;
  padding: 10px 0;
}

.diff-line {
  min-width: max-content;
  padding: 1px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
}

.diff-add {
  color: #6fbf8b;
  background: rgba(111, 191, 139, 0.08);
}

.diff-del {
  color: #e8564a;
  background: rgba(232, 86, 74, 0.08);
}

.diff-hunk {
  color: #f2b52e;
  background: rgba(242, 181, 46, 0.06);
}

.diff-meta {
  color: rgba(232, 230, 223, 0.4);
}

.diff-context {
  color: rgba(232, 230, 223, 0.75);
}
</style>
