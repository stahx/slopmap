<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="legend-list">
    <div
      v-for="row in rows"
      :key="row.label"
      class="legend-row"
      :class="{ 'legend-row-untouched': row.label === 'Untouched' }"
    >
      <span class="legend-dot" :style="{ background: row.color }"></span>
      <span>{{ row.label }}</span>
      <span class="legend-count">{{ row.count }}</span>
    </div>
  </div>
</template>

<style scoped>
.legend-list {
  display: grid;
  gap: 7px;
  margin: 0;
}

.legend-list[hidden] {
  display: none;
}

.legend-row {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  color: rgba(232, 230, 223, 0.8);
  font-size: 12.5px;
  line-height: 1.3;
}

.legend-row[hidden] {
  display: none;
}

.legend-row-untouched {
  opacity: 0.5;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-count {
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
}
</style>
