<template>
  <div class="detail-footer flex flex-[0_0_auto] gap-2 border-t border-white/8 px-[18px] py-3.5">
    <a
      v-if="pullRequest"
      class="open-pr m-0 inline-flex flex-[1_1_auto] cursor-pointer items-center justify-center rounded-[9px] border border-accent bg-accent p-2.5 text-[12.5px] leading-[1.2] font-semibold text-on-accent no-underline"
      :href="String(pullRequest.url)"
      target="_blank"
      rel="noopener"
      >Review in PR #{{ pullRequest.number }} ↗</a
    >
    <button
      class="detail-action m-0 inline-flex flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border border-white/12 bg-transparent p-2.5 text-[12.5px] leading-[1.2] font-medium text-ink/75"
      type="button"
      @click="emit('copy')"
    >
      {{ copied ? 'Copied' : 'Copy paths' }}
    </button>
    <button
      class="detail-action m-0 inline-flex flex-[0_0_auto] cursor-pointer items-center justify-center rounded-[9px] border border-white/12 bg-transparent p-2.5 text-[12.5px] leading-[1.2] font-medium text-ink/75"
      type="button"
      @click="emit('isolate')"
    >
      Isolate blast
    </button>
  </div>
</template>

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
