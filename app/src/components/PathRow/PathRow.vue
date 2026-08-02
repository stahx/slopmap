<template>
  <button
    v-if="path"
    class="path-row m-0 flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] border-0 bg-transparent px-3 py-2.5 text-left font-mono text-[12px] text-ink/70 [overflow-wrap:anywhere] hover:bg-white/4"
    type="button"
    @click="emit('select', path)"
  >
    <span
      class="path-dot size-[7px] flex-[0_0_auto] rounded-full"
      :class="
        variant === 'dependents'
          ? 'path-dot-dependents bg-accent'
          : 'path-dot-imports bg-accent-yellow'
      "
    ></span>
    <span>{{ path }}</span>
  </button>
  <div v-if="moreCount > 0" class="path-footer px-3 py-[11px] text-[12px] text-ink/35">
    + {{ moreCount }} more
  </div>
</template>

<script setup>
defineProps({
  path: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    required: true,
    validator: (variant) => ['dependents', 'imports'].includes(variant),
  },
  moreCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['select']);
</script>
