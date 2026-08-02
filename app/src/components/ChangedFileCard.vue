<script setup>
import { computed } from 'vue';

import { displayPathFor } from '../lib/sections.js';

const props = defineProps({
  changeFile: {
    type: Object,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
  },
  importerCount: {
    type: Number,
    required: true,
  },
});

const displayPath = computed(() => displayPathFor(props.changeFile.path, props.sectionId));
const isDeleted = computed(() => props.changeFile.status === 'D');
const metaText = computed(() => {
  if (!isDeleted.value) return `imported by ${props.importerCount} files`;
  return props.importerCount > 0
    ? `deleted · ${props.importerCount} files still import this`
    : 'deleted';
});
</script>

<template>
  <div class="detail-file-card">
    <div class="detail-file-primary">
      <StatusBadge :status="changeFile.status" />
      <span class="detail-file-name" :class="{ deleted: isDeleted }">{{ displayPath }}</span>
      <span
        class="detail-change-count"
        :class="changeFile.additions === 0 ? 'change-zero' : 'additions'"
        >+{{ changeFile.additions }}</span
      >
      <span
        class="detail-change-count"
        :class="changeFile.deletions === 0 ? 'change-zero' : 'deletions'"
        >−{{ changeFile.deletions }}</span
      >
    </div>
    <RatioBar
      class="detail-card-ratio"
      :additions="changeFile.additions"
      :deletions="changeFile.deletions"
      :remainder="changeFile.additions + changeFile.deletions"
      detail
    />
    <div class="detail-file-meta" :class="{ warning: isDeleted && importerCount > 0 }">
      {{ metaText }}
    </div>
  </div>
</template>

<style scoped>
.detail-file-card {
  padding: 11px 12px;
  border-radius: 9px;
}

.detail-file-card:first-child,
.detail-file-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.detail-file-primary {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.detail-file-primary[hidden] {
  display: none;
}

.detail-file-name {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  color: #e8e6df;
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-file-name.deleted {
  color: rgba(232, 230, 223, 0.55);
  text-decoration: line-through;
}

.detail-change-count {
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
}

.additions {
  color: #6fbf8b;
}

.deletions {
  color: #e8564a;
}

.change-zero {
  color: rgba(232, 230, 223, 0.3);
}

.detail-card-ratio {
  display: flex;
  height: 5px;
  gap: 2px;
  margin: 9px 0 7px 25px;
  overflow: hidden;
  border-radius: 3px;
}

.detail-card-ratio[hidden] {
  display: none;
}

.detail-file-meta {
  margin-left: 25px;
  color: rgba(232, 230, 223, 0.4);
  font-size: 11px;
}

.detail-file-meta.warning {
  color: #e8564a;
}
</style>
