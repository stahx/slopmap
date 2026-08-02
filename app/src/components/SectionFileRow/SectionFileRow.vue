<template>
  <div
    class="section-file-row flex min-w-0 items-center gap-2.5 rounded-[9px] px-3 py-[11px] font-mono text-[12.5px] leading-[1.35] text-ink first:bg-white/5 hover:bg-white/5"
  >
    <span
      class="section-file-name min-w-0 flex-[1_1_auto] overflow-hidden text-ellipsis whitespace-nowrap text-ink"
      >{{ node.id }}</span
    >
    <span class="section-file-loc flex-[0_0_auto] font-mono text-[11px] font-medium text-ink/30"
      >{{ node.loc }} loc</span
    >
  </div>
</template>

<script setup>
defineProps({
  node: {
    type: Object,
    required: true,
  },
});
</script>
