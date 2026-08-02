<template>
  <header
    class="app-top-header fixed top-0 right-[var(--spacing-inspector)] left-[var(--spacing-rail)] z-[3] flex h-[var(--spacing-header)] items-center gap-3.5 border-b border-white/6 bg-panel/60 px-[22px] backdrop-blur-[8px]"
  >
    <div class="header-context flex min-w-0 flex-col gap-1">
      <div class="header-repository flex min-w-0 items-center gap-[7px] whitespace-nowrap">
        <span
          class="repo-name min-w-0 overflow-hidden text-ellipsis font-mono text-[13.5px] font-semibold text-ink"
          >{{ repoName }}</span
        >
        <span class="repo-separator font-mono text-[12px] text-ink/28">/</span>
        <span
          class="context-branch min-w-0 overflow-hidden text-ellipsis font-mono text-[12px] font-medium text-accent-yellow"
          >{{ context?.branch ?? '' }}</span
        >
        <span
          v-if="context?.baseRef"
          class="context-base-wrap min-w-0 overflow-hidden text-ellipsis font-mono text-[11.5px] text-ink/30"
        >
          → <span>{{ context.baseRef }}</span>
        </span>
      </div>
      <div class="header-meta text-[11px] leading-[1.2] text-ink/35">{{ metaText }}</div>
    </div>
    <div class="header-flex-spacer flex-[1_1_auto]"></div>
    <a
      v-if="pullRequest"
      class="context-pr flex flex-[0_0_auto] items-center gap-[7px] rounded-[9px] border border-white/12 px-[11px] py-[7px] text-inherit no-underline"
      :href="pullRequest.url"
      :title="pullRequest.title"
      target="_blank"
      rel="noopener"
    >
      <span class="context-pr-number font-mono text-[12px] font-semibold text-ink"
        >#{{ pullRequest.number }}</span
      >
      <span
        class="context-pr-state rounded-[4px] border border-success-green/40 px-[5px] py-0.5 font-mono text-[9.5px] text-success-green"
      >
        {{ String(pullRequest.state ?? '').toUpperCase() }}
      </span>
      <span class="context-pr-arrow text-accent">↗</span>
    </a>
    <div
      v-if="totals"
      class="context-totals flex flex-[0_0_auto] items-center gap-2 rounded-[9px] bg-white/5 px-3 py-[7px]"
    >
      <span class="total-additions font-mono text-[12px] font-semibold text-success-green"
        >+{{ totals.additions }}</span
      >
      <span class="total-deletions font-mono text-[12px] font-semibold text-danger-red"
        >−{{ totals.deletions }}</span
      >
      <RatioBar
        class="totals-ratio w-[70px] !flex-[0_0_auto]"
        :additions="totals.additions"
        :deletions="totals.deletions"
      />
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { usePayload } from '../../composables/usePayload.js';
import { formatRelativeTime } from '../../lib/relativeTime.js';

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
