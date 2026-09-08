<template>
  <nav
    class="icon-rail fixed top-0 bottom-0 left-0 z-[4] flex w-[var(--spacing-rail)] flex-col items-center gap-2 border-r border-white/7 bg-panel/95 py-3.5"
    aria-label="Map controls"
  >
    <div
      class="logo-tile flex size-[30px] flex-[0_0_auto] items-center justify-center"
      aria-label="slopmap"
    >
      <svg class="size-[30px]" viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" rx="26" fill="var(--color-panel-raised)" />
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="var(--color-accent)"
          stroke-opacity="0.25"
          stroke-width="4"
        />
        <circle cx="60" cy="60" r="15" fill="var(--color-danger-red)" />
        <circle cx="92" cy="60" r="8" fill="var(--color-accent)" />
        <circle cx="38" cy="36" r="6" fill="var(--color-accent-yellow)" />
      </svg>
    </div>
    <div class="rail-top-spacer h-2.5 flex-[0_0_auto]"></div>
    <button
      class="rail-button inline-flex size-[34px] flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border-0 p-0 font-mono text-[13px] font-medium hover:bg-white/10 hover:text-ink"
      :class="
        currentView === 'compact' ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'
      "
      type="button"
      aria-label="Compact view"
      @click="showView('compact')"
    >
      ◉
    </button>
    <button
      class="rail-button inline-flex size-[34px] flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border-0 p-0 font-mono text-[13px] font-medium hover:bg-white/10 hover:text-ink"
      :class="
        currentView === 'files' ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'
      "
      type="button"
      aria-label="Files view"
      @click="showView('files')"
    >
      ≡
    </button>
    <button
      class="rail-button inline-flex size-[34px] flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border-0 p-0 font-mono text-[13px] font-medium hover:bg-white/10 hover:text-ink"
      :class="dimension === '2d' ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'"
      type="button"
      title="2D / 3D"
      aria-label="2D / 3D"
      @click="toggleDimension"
    >
      ⌥
    </button>
    <div class="rail-flex-spacer flex-[1_1_auto]"></div>
    <HelpPopover v-if="helpVisible" @dismiss="dismissHelp" />
    <button
      class="rail-button inline-flex size-[34px] flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border-0 bg-transparent p-0 font-mono text-[13px] font-medium text-ink/45 hover:bg-white/10 hover:text-ink"
      type="button"
      aria-label="Help"
      :aria-expanded="helpVisible"
      @click="toggleHelp"
    >
      ?
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

import { useSettings } from '../../composables/useSettings.js';
import { useViewState } from '../../composables/useViewState.js';

const { dimension } = useSettings();
const { currentView, showView } = useViewState();

const helpVisible = ref(false);

const toggleDimension = () => {
  dimension.value = dimension.value === '2d' ? '3d' : '2d';
};

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value;
};

const dismissHelp = () => {
  helpVisible.value = false;
};
</script>
