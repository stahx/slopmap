<template>
  <div
    class="theme-toggle grid grid-cols-2 gap-0.5 rounded-[7px] bg-white/5 p-0.5"
    aria-label="Background theme"
  >
    <button
      class="theme-button cursor-pointer rounded-[5px] border-0 px-[7px] py-1 text-[10.5px] font-medium"
      :class="theme === 'plain' ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'"
      type="button"
      @click="theme = 'plain'"
    >
      Plain
    </button>
    <button
      class="theme-button cursor-pointer rounded-[5px] border-0 px-[7px] py-1 text-[10.5px] font-medium"
      :class="theme === 'galaxy' ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'"
      type="button"
      @click="theme = 'galaxy'"
    >
      Galaxy
    </button>
  </div>
</template>

<script setup>
import { useSettings } from '../../composables/useSettings.js';

const { theme } = useSettings();
</script>
