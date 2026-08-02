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
</script>

<template>
  <div v-if="path" class="path-row">
    <span class="path-dot" :class="`path-dot-${variant}`"></span>
    <span>{{ path }}</span>
  </div>
  <div v-if="moreCount > 0" class="path-footer">+ {{ moreCount }} more</div>
</template>

<style scoped>
.path-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: rgba(232, 230, 223, 0.7);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.path-row[hidden] {
  display: none;
}

.path-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.path-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.path-dot-dependents {
  background: #f08a4b;
}

.path-dot-imports {
  background: #f2b52e;
}

.path-footer {
  padding: 11px 12px;
  color: rgba(232, 230, 223, 0.35);
  font-size: 12px;
}
</style>
