<script setup>
import { usePayload } from './composables/usePayload.js';

const { repoName, modeLabel, stats, diffMode } = usePayload();
</script>

<template>
  <main class="stub" data-test="slopmap-vue-stub">
    <div class="content">
      <span v-if="diffMode" class="badge">diff</span>
      <h1>{{ repoName }}</h1>
      <p>{{ modeLabel }}</p>
      <p>
        {{ stats?.fileCount ?? 0 }} files · {{ stats?.linkCount ?? 0 }} imports
      </p>
    </div>
  </main>
</template>

<style scoped>
.stub {
  align-items: center;
  background: #12142a;
  color: #f5f7ff;
  display: flex;
  font-family: var(--font-mono);
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.stub[hidden] {
  display: none;
}

.content {
  padding: 2rem;
}

.badge {
  background: #7771ff;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.65rem;
  text-transform: uppercase;
}

.badge[hidden] {
  display: none;
}

h1 {
  font-size: clamp(2rem, 7vw, 4rem);
  margin: 1rem 0 0.5rem;
}

p {
  color: #aeb4d8;
  margin: 0.4rem 0;
}
</style>
