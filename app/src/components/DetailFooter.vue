<script setup>
defineProps({
  pullRequest: {
    type: Object,
    default: null,
  },
  copied: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['copy', 'isolate']);
</script>

<template>
  <div class="detail-footer">
    <a
      v-if="pullRequest"
      class="open-pr"
      :href="String(pullRequest.url)"
      target="_blank"
      rel="noopener"
      >Review in PR #{{ pullRequest.number }} ↗</a
    >
    <button class="detail-action" type="button" @click="emit('copy')">
      {{ copied ? 'Copied' : 'Copy paths' }}
    </button>
    <button class="detail-action" type="button" @click="emit('isolate')">Isolate blast</button>
  </div>
</template>

<style scoped>
.detail-footer {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-footer[hidden] {
  display: none;
}

.open-pr,
.detail-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 10px;
  border-radius: 9px;
  font-size: 12.5px;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
}

.open-pr[hidden],
.detail-action[hidden] {
  display: none;
}

.open-pr {
  flex: 1 1 auto;
  color: #14162a;
  background: #f08a4b;
  border: 1px solid #f08a4b;
  font-weight: 600;
}

.detail-action {
  flex: 0 0 auto;
  color: rgba(232, 230, 223, 0.75);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 500;
}
</style>
