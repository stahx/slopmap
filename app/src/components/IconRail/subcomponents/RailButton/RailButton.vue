<template>
  <div class="rail-button-wrap group relative flex flex-[0_0_auto]">
    <button
      v-bind="$attrs"
      class="rail-button inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[9px] border-0 p-0 font-mono text-[13px] font-medium hover:bg-white/10 hover:text-ink"
      :class="active ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45'"
      type="button"
      :aria-label="label"
      @click="emit('activate')"
    >
      {{ glyph }}
    </button>
    <span
      role="tooltip"
      class="rail-tooltip pointer-events-none absolute top-1/2 left-[calc(100%+14px)] z-[5] hidden w-max max-w-[230px] -translate-y-1/2 rounded-[8px] border border-white/10 bg-panel-raised px-3 py-2 shadow-[0_8px_22px_rgba(0,0,0,0.55)] group-hover:block"
    >
      <span class="rail-tooltip-label block font-sans text-[12.5px] whitespace-nowrap text-ink">{{
        label
      }}</span>
      <span
        v-if="hint"
        class="rail-tooltip-hint mt-1 block font-sans text-[11.5px] leading-[1.35] text-ink/45"
        >{{ hint }}</span
      >
    </span>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  glyph: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['activate']);
</script>

<style scoped>
.rail-tooltip[hidden] {
  display: none;
}
</style>
