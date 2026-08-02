<template>
  <div
    class="help-popover absolute bottom-14 left-12 flex w-[230px] cursor-pointer flex-col gap-[7px] rounded-[10px] border border-white/10 bg-panel-raised/96 px-3.5 py-3 text-[12px] leading-[1.3] text-ink/72 shadow-[0_12px_34px_rgba(0,0,0,0.35)]"
    role="status"
    @click="$emit('dismiss')"
  >
    <div>drag rotate · scroll zoom</div>
    <div>click ball = inspector</div>
    <div>shift-less: click again to deselect</div>
  </div>
</template>

<script setup>
defineEmits(['dismiss']);
</script>
