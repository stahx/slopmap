<script setup>
import { ref } from 'vue';

import { useSettings } from '../composables/useSettings.js';
import { useViewState } from '../composables/useViewState.js';

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

<template>
  <nav class="icon-rail" aria-label="Map controls">
    <div class="logo-tile" aria-label="slopmap">s</div>
    <div class="rail-top-spacer"></div>
    <button
      class="rail-button"
      :class="{ active: currentView === 'compact' }"
      type="button"
      aria-label="Compact view"
      @click="showView('compact')"
    >
      ◉
    </button>
    <button
      class="rail-button"
      :class="{ active: currentView === 'files' }"
      type="button"
      aria-label="Files view"
      @click="showView('files')"
    >
      ≡
    </button>
    <button
      class="rail-button"
      :class="{ active: dimension === '2d' }"
      type="button"
      title="2D / 3D"
      aria-label="2D / 3D"
      @click="toggleDimension"
    >
      ⌥
    </button>
    <div class="rail-flex-spacer"></div>
    <HelpPopover v-if="helpVisible" @dismiss="dismissHelp" />
    <button
      class="rail-button"
      type="button"
      aria-label="Help"
      :aria-expanded="helpVisible"
      @click="toggleHelp"
    >
      ?
    </button>
  </nav>
</template>

<style scoped>
.icon-rail {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 4;
  display: flex;
  width: var(--rail-w);
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
  background: rgba(14, 16, 32, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.icon-rail[hidden] {
  display: none;
}

.logo-tile {
  display: flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #14162a;
  background: #f08a4b;
  border-radius: 9px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.logo-tile[hidden] {
  display: none;
}

.rail-top-spacer {
  height: 10px;
  flex: 0 0 auto;
}

.rail-flex-spacer {
  flex: 1 1 auto;
}

.rail-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: rgba(232, 230, 223, 0.45);
  background: transparent;
  border: 0;
  border-radius: 9px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.rail-button[hidden] {
  display: none;
}

.rail-button:hover,
.rail-button.active {
  color: #e8e6df;
  background: rgba(255, 255, 255, 0.1);
}
</style>
