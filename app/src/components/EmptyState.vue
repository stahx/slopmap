<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="detail-empty">{{ message }}</div>
</template>

<style scoped>
.detail-empty {
  padding: 11px 12px;
  color: rgba(232, 230, 223, 0.35);
  font-size: 12px;
}
</style>
