<template>
  <div class="compactness-setting m-0 flex items-center gap-2.5">
    <span class="compactness-label text-[11px] text-ink/40">compactness</span>
    <input
      v-model.number="compactnessLevel"
      class="compactness-input m-0 w-[150px] accent-accent"
      type="range"
      min="1"
      max="3"
      step="1"
      aria-label="Compactness"
    />
    <span class="compactness-level font-mono text-[10.5px] text-ink/45">{{
      compactnessLabel
    }}</span>
  </div>
</template>

<script setup>
import { useSettings } from '../../composables/useSettings.js';
import { useViewState } from '../../composables/useViewState.js';

const { compactnessLevel } = useSettings();
const { compactnessLabel } = useViewState();
</script>
