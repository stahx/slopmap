import { computed, markRaw, shallowRef } from 'vue';

const payload = shallowRef(null);

const loadDevelopmentFixture = async () => {
  const fixtureName = new URLSearchParams(location.search).get('fixture');
  const fixtureModule =
    fixtureName === 'diff'
      ? await import('../../fixtures/payload.diff.json')
      : await import('../../fixtures/payload.full.json');
  return fixtureModule.default;
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
    parsedPayload = await loadDevelopmentFixture();
  }

  payload.value = markRaw(parsedPayload);
  const { repoName, modeLabel } = parsedPayload;
  if (repoName || modeLabel) {
    document.title = ['slopmap', repoName, modeLabel]
      .filter(Boolean)
      .join(' · ');
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
