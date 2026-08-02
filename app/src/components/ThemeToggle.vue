<script setup>
import { useSettings } from '../composables/useSettings.js';

const { theme } = useSettings();
</script>

<template>
  <div class="theme-toggle" aria-label="Background theme">
    <button
      class="theme-button"
      :class="{ active: theme === 'plain' }"
      type="button"
      @click="theme = 'plain'"
    >
      Plain
    </button>
    <button
      class="theme-button"
      :class="{ active: theme === 'galaxy' }"
      type="button"
      @click="theme = 'galaxy'"
    >
      Galaxy
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 7px;
}

.theme-toggle[hidden] {
  display: none;
}

.theme-button {
  padding: 4px 7px;
  color: rgba(232, 230, 223, 0.45);
  background: transparent;
  border: 0;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 500;
  cursor: pointer;
}

.theme-button.active {
  color: #e8e6df;
  background: rgba(255, 255, 255, 0.1);
}
</style>
