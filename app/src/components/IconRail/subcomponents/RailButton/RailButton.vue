<template>
  <div class="rail-button-wrap group relative flex w-full flex-[0_0_auto]">
    <button
      v-bind="$attrs"
      class="rail-button inline-flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-[9px] border-0 font-mono text-[13px] font-medium hover:bg-white/10 hover:text-ink"
      :class="[
        active ? 'active bg-white/10 text-ink' : 'bg-transparent text-ink/45',
        expanded ? 'justify-start px-2.5' : 'justify-center px-0',
      ]"
      type="button"
      :aria-label="label"
      @click="emit('activate')"
    >
      <span class="rail-glyph w-4 flex-[0_0_auto] text-center">{{ glyph }}</span>
      <span v-if="expanded" class="rail-label truncate font-sans text-[12.5px]">{{ label }}</span>
    </button>
    <span
      v-if="!expanded"
      role="tooltip"
      class="rail-tooltip pointer-events-none absolute top-1/2 left-[calc(100%+16px)] z-[5] hidden max-w-[210px] -translate-y-1/2 rounded-[7px] border border-white/10 bg-panel-raised px-2.5 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.55)] group-hover:block"
    >
      <span class="rail-tooltip-label block font-sans text-[12px] whitespace-nowrap text-ink">{{
        label
      }}</span>
      <span v-if="hint" class="rail-tooltip-hint mt-0.5 block font-sans text-[11px] text-ink/45">{{
        hint
      }}</span>
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
  expanded: {
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
