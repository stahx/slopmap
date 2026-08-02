<template>
  <span
    class="ratio-bar flex min-w-0 flex-[1_1_auto] gap-0.5 overflow-hidden rounded-[3px]"
    :class="detail ? 'ratio-bar-detail h-[5px]' : 'h-1.5'"
    aria-hidden="true"
  >
    <span
      v-if="additionsFlex > 0"
      class="ratio-additions bg-success-green"
      :class="detail ? 'min-w-px opacity-100' : 'min-w-0.5 opacity-85'"
      :style="{ flex: additionsFlex }"
    ></span>
    <span
      v-if="deletionsFlex > 0"
      class="ratio-deletions bg-danger-red"
      :class="detail ? 'min-w-px opacity-100' : 'min-w-0.5 opacity-85'"
      :style="{ flex: deletionsFlex }"
    ></span>
    <span
      v-if="remainderFlex !== null"
      class="ratio-remainder bg-white/7"
      :class="detail ? 'min-w-px opacity-100' : 'min-w-0.5 opacity-85'"
      :style="{ flex: remainderFlex }"
    ></span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  additions: {
    type: Number,
    required: true,
  },
  deletions: {
    type: Number,
    required: true,
  },
  remainder: {
    type: Number,
    default: null,
  },
  detail: {
    type: Boolean,
    default: false,
  },
});

const additionsFlex = computed(() => props.additions);
const deletionsFlex = computed(() => props.deletions);
const remainderFlex = computed(() =>
  props.remainder === null ? null : Math.max(props.remainder, 1),
);
</script>
