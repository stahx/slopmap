import { computed, markRaw, shallowRef } from 'vue';

import diffFixture from '../../fixtures/payload.diff.json';
import fullFixture from '../../fixtures/payload.full.json';

const payload = shallowRef(null);

const loadDevelopmentFixture = () => {
  const fixtureName = new URLSearchParams(location.search).get('fixture');
  return fixtureName === 'diff' ? diffFixture : fullFixture;
};

export const loadPayload = async () => {
  const payloadElement = document.getElementById('slopmap-payload');
  if (payloadElement === null) {
    throw new Error('slopmap: payload element not found');
  }

  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payloadElement.textContent);
  } catch (parseError) {
    if (!import.meta.env.DEV) throw parseError;
    parsedPayload = loadDevelopmentFixture();
  }

  payload.value = markRaw(parsedPayload);
  const { repoName, modeLabel } = parsedPayload;
  if (repoName || modeLabel) {
    document.title = ['slopmap', repoName, modeLabel].filter(Boolean).join(' · ');
  }
  return payload.value;
};

export const usePayload = () => {
  const repoName = computed(() => payload.value?.repoName ?? '');
  const modeLabel = computed(() => payload.value?.modeLabel ?? '');
  const context = computed(() => payload.value?.context ?? null);
  const stats = computed(() => payload.value?.graph?.stats ?? null);
  const changes = computed(() => payload.value?.changes ?? null);
  const diffMode = computed(() => changes.value?.totals != null);

  return { payload, repoName, modeLabel, context, stats, changes, diffMode };
};
