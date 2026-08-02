<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { usePayload } from '../composables/usePayload.js';
import { formatRelativeTime } from '../lib/relativeTime.js';

const { repoName, context, stats, changes } = usePayload();

const relativeTimeText = ref('');
let relativeTimeIntervalId = null;

const pullRequest = computed(() => context.value?.pullRequest ?? null);
const totals = computed(() => changes.value?.totals ?? null);
const metaText = computed(() => {
  const analyzedText = relativeTimeText.value ? ` · analyzed ${relativeTimeText.value}` : '';
  return `${stats.value?.fileCount ?? 0} files · ${stats.value?.linkCount ?? 0} imports${analyzedText}`;
});

onMounted(() => {
  refreshRelativeTime();
  relativeTimeIntervalId = window.setInterval(refreshRelativeTime, 30000);
});

onBeforeUnmount(() => {
  if (relativeTimeIntervalId !== null) {
    window.clearInterval(relativeTimeIntervalId);
  }
});

const refreshRelativeTime = () => {
  relativeTimeText.value = context.value?.generatedAt
    ? formatRelativeTime(context.value.generatedAt, Date.now())
    : '';
};
</script>

<template>
  <header class="top-header">
    <div class="header-context">
      <div class="header-repository">
        <span class="repo-name">{{ repoName }}</span>
        <span class="repo-separator">/</span>
        <span class="context-branch">{{ context?.branch ?? '' }}</span>
        <span v-if="context?.baseRef" class="context-base-wrap">
          → <span>{{ context.baseRef }}</span>
        </span>
      </div>
      <div class="header-meta">{{ metaText }}</div>
    </div>
    <div class="header-flex-spacer"></div>
    <a
      v-if="pullRequest"
      class="context-pr"
      :href="pullRequest.url"
      :title="pullRequest.title"
      target="_blank"
      rel="noopener"
    >
      <span class="context-pr-number">#{{ pullRequest.number }}</span>
      <span class="context-pr-state">
        {{ String(pullRequest.state ?? '').toUpperCase() }}
      </span>
      <span class="context-pr-arrow">↗</span>
    </a>
    <div v-if="totals" class="context-totals">
      <span class="total-additions">+{{ totals.additions }}</span>
      <span class="total-deletions">−{{ totals.deletions }}</span>
      <RatioBar class="totals-ratio" :additions="totals.additions" :deletions="totals.deletions" />
    </div>
  </header>
</template>

<style scoped>
.top-header {
  position: fixed;
  top: 0;
  right: var(--inspector-w);
  left: var(--rail-w);
  z-index: 3;
  display: flex;
  height: var(--header-h);
  align-items: center;
  gap: 14px;
  padding: 0 22px;
  background: rgba(14, 16, 32, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

.top-header[hidden] {
  display: none;
}

.header-context {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.header-context[hidden] {
  display: none;
}

.header-repository {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.header-repository[hidden] {
  display: none;
}

.repo-name {
  min-width: 0;
  overflow: hidden;
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 13.5px;
  font-weight: 600;
  text-overflow: ellipsis;
}

.repo-separator {
  color: rgba(232, 230, 223, 0.28);
  font-family: var(--font-mono);
  font-size: 12px;
}

.context-branch {
  min-width: 0;
  overflow: hidden;
  color: #f2b52e;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
}

.context-base-wrap {
  min-width: 0;
  overflow: hidden;
  color: rgba(232, 230, 223, 0.3);
  font-family: var(--font-mono);
  font-size: 11.5px;
  text-overflow: ellipsis;
}

.header-meta {
  color: rgba(232, 230, 223, 0.35);
  font-size: 11px;
  line-height: 1.2;
}

.header-flex-spacer {
  flex: 1 1 auto;
}

.context-pr {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9px;
  text-decoration: none;
}

.context-pr[hidden] {
  display: none;
}

.context-pr-number {
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.context-pr-state {
  padding: 2px 5px;
  color: #6fbf8b;
  border: 1px solid rgba(111, 191, 139, 0.4);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 9.5px;
}

.context-pr-arrow {
  color: #f08a4b;
}

.context-totals {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9px;
}

.context-totals[hidden] {
  display: none;
}

.total-additions,
.total-deletions {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.total-additions {
  color: #6fbf8b;
}

.total-deletions {
  color: #e8564a;
}

.totals-ratio {
  width: 70px;
  flex: 0 0 auto;
}
</style>
