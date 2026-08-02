<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">{{ status }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 600;
}

.status-badge[hidden] {
  display: none;
}

.status-M {
  color: #f2b52e;
  background: rgba(242, 181, 46, 0.18);
}

.status-A {
  color: #6fbf8b;
  background: rgba(111, 191, 139, 0.16);
}

.status-D {
  color: #e8564a;
  background: rgba(232, 86, 74, 0.16);
}

.status-R {
  color: #8b93dc;
  background: rgba(140, 150, 220, 0.16);
}
</style>
