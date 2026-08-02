<script setup>
defineProps({
  node: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="section-file-row">
    <span class="section-file-name">{{ node.id }}</span>
    <span class="section-file-loc">{{ node.loc }} loc</span>
  </div>
</template>

<style scoped>
.section-file-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  color: #e8e6df;
  border-radius: 9px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.35;
}

.section-file-row[hidden] {
  display: none;
}

.section-file-row:first-child,
.section-file-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.section-file-name {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  color: #e8e6df;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-file-loc {
  flex: 0 0 auto;
  color: rgba(232, 230, 223, 0.3);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
}
</style>
