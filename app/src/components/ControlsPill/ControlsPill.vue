<template>
  <div
    class="controls-pill fixed bottom-[22px] left-[calc(var(--spacing-rail)+24px)] z-3 flex items-center gap-2.5 rounded-[10px] border border-white/9 bg-panel-raised/85 px-3 py-[9px] backdrop-blur-[10px]"
  >
    <CompactnessSlider v-if="isAggregatedView" />
    <span class="controls-divider h-[18px] w-px flex-[0_0_auto] bg-white/9"></span>
    <ThemeToggle />
    <span class="controls-divider h-[18px] w-px flex-[0_0_auto] bg-white/9"></span>
    <FilesFilters v-if="!isAggregatedView" />
  </div>
</template>

<script setup>
import { useViewState } from '../../composables/useViewState.js';

const { isAggregatedView } = useViewState();
</script>
