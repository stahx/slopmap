<script setup>
defineEmits(['dismiss']);
</script>

<template>
  <div class="help-popover" role="status" @click="$emit('dismiss')">
    <div>drag rotate · scroll zoom</div>
    <div>click ball = inspector</div>
    <div>shift-less: click again to deselect</div>
  </div>
</template>

<style scoped>
.help-popover {
  position: absolute;
  bottom: 56px;
  left: 48px;
  display: flex;
  width: 230px;
  flex-direction: column;
  gap: 7px;
  padding: 12px 14px;
  color: rgba(232, 230, 223, 0.72);
  background: rgba(16, 18, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.35);
  font-size: 12px;
  line-height: 1.3;
  cursor: pointer;
}

.help-popover[hidden] {
  display: none;
}
</style>
