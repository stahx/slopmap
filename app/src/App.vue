<template>
  <div class="slopmap-app min-h-screen" :data-theme="theme" data-test="slopmap-app">
    <StarfieldCanvas />
    <IconRail />
    <TopHeader />
    <GraphStage />
    <ControlsPill />
    <InspectorPanel @select="handleSectionSelect" />
  </div>
</template>

<script setup>
import { triggerSectionClick } from './composables/useGraphInstances.js';
import { useSettings } from './composables/useSettings.js';

const { theme } = useSettings();

const handleSectionSelect = (sectionSelection) => {
  triggerSectionClick(sectionSelection.sectionId, sectionSelection.level);
};
</script>
