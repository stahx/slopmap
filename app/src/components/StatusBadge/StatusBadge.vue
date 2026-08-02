<template>
  <span
    class="status-badge inline-flex size-[17px] flex-[0_0_auto] items-center justify-center rounded-[4px] font-mono text-[9.5px] font-semibold"
    :class="[
      `status-${status}`,
      {
        'bg-accent-yellow/18 text-accent-yellow': status === 'M',
        'bg-success-green/16 text-success-green': status === 'A',
        'bg-danger-red/16 text-danger-red': status === 'D',
        'bg-[rgba(140,150,220,0.16)] text-renamed': status === 'R',
      },
    ]"
    >{{ status }}</span
  >
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>
