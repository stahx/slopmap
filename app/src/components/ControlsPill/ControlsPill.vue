<script setup>
import { useViewState } from '../../composables/useViewState.js';

const { isAggregatedView } = useViewState();
</script>

<template>
  <div class="controls-pill">
    <CompactnessSlider v-if="isAggregatedView" />
    <span class="controls-divider"></span>
    <ThemeToggle />
    <span class="controls-divider"></span>
    <FilesFilters v-if="!isAggregatedView" />
  </div>
</template>

<style scoped>
.controls-pill {
  position: fixed;
  bottom: 22px;
  left: calc(var(--rail-w) + 24px);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: rgba(16, 18, 38, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.controls-pill[hidden] {
  display: none;
}

.controls-divider {
  width: 1px;
  height: 18px;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.09);
}
</style>
