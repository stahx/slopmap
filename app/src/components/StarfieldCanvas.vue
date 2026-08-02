<script setup>
import { ref } from 'vue';

import { useStarfield } from '../composables/useStarfield.js';
import { useSettings } from '../composables/useSettings.js';

const { theme } = useSettings();

const canvasElement = ref(null);

useStarfield(canvasElement);
</script>

<template>
  <canvas
    ref="canvasElement"
    v-show="theme === 'galaxy'"
    class="starfield-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.starfield-canvas {
  position: fixed;
  z-index: 0;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.starfield-canvas[hidden] {
  display: none;
}
</style>
