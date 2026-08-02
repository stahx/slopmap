<template>
  <div class="files-controls flex items-center gap-2.5">
    <input
      v-model="searchTerm"
      class="search-input m-0 w-40 rounded-[7px] border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[11.5px] text-ink outline-none placeholder:text-ink/35 focus:border-accent/55"
      type="search"
      placeholder="filter files…"
      aria-label="Filter files"
    />
    <div class="filters m-0 flex flex-nowrap gap-2.5">
      <label
        v-if="diffMode"
        class="checkbox-label inline-flex cursor-pointer items-center gap-1.5 text-[11px] leading-[1.3] whitespace-nowrap text-ink/70"
      >
        <input v-model="impactOnly" class="m-0 accent-accent" type="checkbox" />
        <span>impact only</span>
      </label>
      <label
        class="checkbox-label inline-flex cursor-pointer items-center gap-1.5 text-[11px] leading-[1.3] whitespace-nowrap text-ink/70"
      >
        <input v-model="hideIsolated" class="m-0 accent-accent" type="checkbox" />
        <span>hide isolated</span>
      </label>
    </div>
    <div
      v-if="aggregateFilter !== null"
      class="section-filter m-0 inline-flex max-w-full items-center gap-1.5 self-auto rounded-[6px] border border-white/12 px-[7px] py-1 font-mono text-[11px] whitespace-nowrap text-ink/70"
    >
      <span>{{ aggregateFilter.value }}</span>
      <button
        class="clear-section-filter cursor-pointer border-0 bg-transparent p-0 text-ink/40"
        type="button"
        aria-label="Clear section filter"
        @click="clearAggregateFilter"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePayload } from '../../composables/usePayload.js';
import { useViewState } from '../../composables/useViewState.js';

const { diffMode } = usePayload();
const { aggregateFilter, searchTerm, impactOnly, hideIsolated, clearAggregateFilter } =
  useViewState();
</script>
