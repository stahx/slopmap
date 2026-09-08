<template>
  <nav
    class="icon-rail fixed top-0 bottom-0 left-0 z-[4] flex flex-col items-start gap-2 border-r border-white/7 bg-panel/95 py-3.5 transition-[width] duration-150"
    :class="
      expanded
        ? 'w-[188px] px-[13px] shadow-[8px_0_24px_rgba(0,0,0,0.45)]'
        : 'w-[var(--spacing-rail)] px-[13px]'
    "
    aria-label="Map controls"
  >
    <div class="logo-tile flex h-[30px] flex-[0_0_auto] items-center gap-2.5" aria-label="slopmap">
      <svg class="size-[30px] flex-[0_0_auto]" viewBox="0 0 120 120" aria-hidden="true">
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
      <span
        v-if="expanded"
        class="rail-wordmark font-mono text-[13px] font-semibold whitespace-nowrap text-ink"
        >slopmap</span
      >
    </div>
    <div class="rail-top-spacer h-2.5 flex-[0_0_auto]"></div>

    <RailButton
      v-for="railButton in railButtons"
      :key="railButton.key"
      :glyph="railButton.glyph"
      :label="railButton.label"
      :hint="railButton.hint"
      :active="railButton.active"
      :expanded="expanded"
      @activate="railButton.activate()"
    />

    <div class="rail-flex-spacer flex-[1_1_auto]"></div>
    <HelpPopover v-if="helpVisible" @dismiss="dismissHelp" />

    <RailButton
      glyph="?"
      label="Help"
      hint="Keyboard shortcuts and legend"
      :active="helpVisible"
      :expanded="expanded"
      :aria-expanded="helpVisible"
      @activate="toggleHelp"
    />
    <RailButton
      :glyph="expanded ? '«' : '»'"
      :label="expanded ? 'Collapse' : 'Expand'"
      :hint="expanded ? 'Collapse the rail' : 'Expand the rail'"
      :active="false"
      :expanded="expanded"
      @activate="toggleExpanded"
    />
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue';

import { useSettings } from '../../composables/useSettings.js';
import { useViewState } from '../../composables/useViewState.js';

const { dimension } = useSettings();
const { currentView, showView } = useViewState();

const helpVisible = ref(false);
const expanded = ref(false);

const railButtons = computed(() => [
  {
    key: 'compact',
    glyph: '◉',
    label: 'Compact',
    hint: 'Roll files up into groups',
    active: currentView.value === 'compact',
    activate: () => showView('compact'),
  },
  {
    key: 'files',
    glyph: '≡',
    label: 'Files',
    hint: 'Show every file in the graph',
    active: currentView.value === 'files',
    activate: () => showView('files'),
  },
  {
    key: 'dimension',
    glyph: '⌥',
    label: dimension.value === '2d' ? '2D canvas' : '3D orbit',
    hint: 'Switch between a 3D orbit and a flat 2D canvas',
    active: dimension.value === '2d',
    activate: () => toggleDimension(),
  },
]);

const toggleDimension = () => {
  dimension.value = dimension.value === '2d' ? '3d' : '2d';
};

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value;
};

const dismissHelp = () => {
  helpVisible.value = false;
};
</script>
