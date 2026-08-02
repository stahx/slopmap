<script setup>
import { useSettings } from '../composables/useSettings.js';
import { useViewState } from '../composables/useViewState.js';

const { compactnessLevel } = useSettings();
const { compactnessLabel } = useViewState();
</script>

<template>
  <div class="compactness-setting">
    <span class="compactness-label">compactness</span>
    <input
      v-model.number="compactnessLevel"
      class="compactness-input"
      type="range"
      min="1"
      max="3"
      step="1"
      aria-label="Compactness"
    />
    <span class="compactness-level">{{ compactnessLabel }}</span>
  </div>
</template>

<style scoped>
.compactness-setting {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.compactness-setting[hidden] {
  display: none;
}

.compactness-label {
  color: rgba(232, 230, 223, 0.4);
  font-size: 11px;
}

.compactness-input {
  width: 150px;
  margin: 0;
  accent-color: #f08a4b;
}

.compactness-level {
  color: rgba(232, 230, 223, 0.45);
  font-family: var(--font-mono);
  font-size: 10.5px;
}
</style>
