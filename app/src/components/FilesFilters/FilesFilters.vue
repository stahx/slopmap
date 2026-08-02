<script setup>
import { usePayload } from '../../composables/usePayload.js';
import { useViewState } from '../../composables/useViewState.js';

const { diffMode } = usePayload();
const { aggregateFilter, searchTerm, impactOnly, hideIsolated, clearAggregateFilter } =
  useViewState();
</script>

<template>
  <div class="files-controls">
    <input
      v-model="searchTerm"
      class="search-input"
      type="search"
      placeholder="filter files…"
      aria-label="Filter files"
    />
    <div class="filters">
      <label v-if="diffMode" class="checkbox-label">
        <input v-model="impactOnly" type="checkbox" />
        <span>impact only</span>
      </label>
      <label class="checkbox-label">
        <input v-model="hideIsolated" type="checkbox" />
        <span>hide isolated</span>
      </label>
    </div>
    <div v-if="aggregateFilter !== null" class="section-filter">
      <span>{{ aggregateFilter.value }}</span>
      <button
        class="clear-section-filter"
        type="button"
        aria-label="Clear section filter"
        @click="clearAggregateFilter"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.files-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.files-controls[hidden] {
  display: none;
}

.search-input {
  width: 160px;
  margin: 0;
  padding: 6px 8px;
  color: #e8e6df;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  outline: none;
  font-family: var(--font-mono);
  font-size: 11.5px;
}

.search-input::placeholder {
  color: rgba(232, 230, 223, 0.35);
}

.search-input:focus {
  border-color: rgba(240, 138, 75, 0.55);
}

.filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin: 0;
}

.filters[hidden] {
  display: none;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(232, 230, 223, 0.7);
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
}

.checkbox-label[hidden] {
  display: none;
}

.checkbox-label input {
  margin: 0;
  accent-color: #f08a4b;
}

.section-filter {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  align-self: auto;
  gap: 6px;
  margin: 0;
  padding: 4px 7px;
  color: rgba(232, 230, 223, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  white-space: nowrap;
}

.section-filter[hidden] {
  display: none;
}

.clear-section-filter {
  padding: 0;
  color: rgba(232, 230, 223, 0.4);
  background: transparent;
  border: 0;
  cursor: pointer;
}
</style>
