<script setup>
import { useSelection } from './composables/useSelection.js';
import { useSettings } from './composables/useSettings.js';
import {
  HEADER_HEIGHT,
  INSPECTOR_WIDTH,
  RAIL_WIDTH,
} from './lib/layout.js';

const { theme } = useSettings();
const { selectSection } = useSelection();

const layoutStyle = {
  '--rail-w': `${RAIL_WIDTH}px`,
  '--header-h': `${HEADER_HEIGHT}px`,
  '--inspector-w': `${INSPECTOR_WIDTH}px`,
};

const handleSectionSelect = (section) => {
  selectSection(section);
};
</script>

<template>
  <div
    class="slopmap-app"
    :style="layoutStyle"
    :data-theme="theme"
    data-test="slopmap-app"
  >
    <IconRail />
    <TopHeader />
    <GraphStage />
    <ControlsPill />
    <InspectorPanel @select="handleSectionSelect" />
  </div>
</template>

<style scoped>
.slopmap-app {
  min-height: 100vh;
}
</style>
