import { computed, ref } from 'vue';

import { usePayload } from './usePayload.js';
import { useSettings } from './useSettings.js';

const { payload } = usePayload();
const { compactnessLevel } = useSettings();

const currentView = ref('compact');
const aggregateFilter = ref(null);
const searchTerm = ref('');
const impactOnly = ref(true);
const hideIsolated = ref(false);

const aggregateLevelNames = {
  1: 'roots',
  2: 'groups',
  3: 'dirs',
};

const isAggregatedView = computed(() => currentView.value === 'compact');
const activeAggregate = computed(
  () =>
    payload.value?.graph?.levels?.[
      aggregateLevelNames[compactnessLevel.value]
    ] ?? null
);
const compactnessLabel = computed(
  () => aggregateLevelNames[compactnessLevel.value]
);

const showView = (view) => {
  currentView.value = view === 'files' ? 'files' : 'compact';
};

const clearAggregateFilter = () => {
  aggregateFilter.value = null;
};

export const useViewState = () => ({
  currentView,
  aggregateFilter,
  searchTerm,
  impactOnly,
  hideIsolated,
  isAggregatedView,
  activeAggregate,
  compactnessLabel,
  showView,
  clearAggregateFilter,
});
