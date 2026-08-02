<template>
  <div class="detail-empty px-3 py-[11px] text-[12px] text-ink/35">{{ message }}</div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>
