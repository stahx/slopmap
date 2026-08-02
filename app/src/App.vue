<script setup>
import { useSettings } from './composables/useSettings.js';

const { theme } = useSettings();

const handleSectionSelect = () => {};
</script>

<template>
  <div class="slopmap-app" :data-theme="theme" data-test="slopmap-app">
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
