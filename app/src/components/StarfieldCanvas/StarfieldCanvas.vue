<template>
  <canvas
    v-show="theme === 'galaxy'"
    ref="canvasElement"
    class="starfield-canvas pointer-events-none fixed inset-0 z-0 block size-full"
    aria-hidden="true"
  ></canvas>
</template>

<script setup>
import { ref } from 'vue';

import { useStarfield } from '../../composables/useStarfield.js';
import { useSettings } from '../../composables/useSettings.js';

const { theme } = useSettings();

const canvasElement = ref(null);

useStarfield(canvasElement);
</script>
