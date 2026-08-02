import { GROUP_COLORS } from './graphTokens.js';

const endpointId = (endpoint) =>
  typeof endpoint === 'object' && endpoint !== null ? endpoint.id : endpoint;

export const buildPayloadIndex = (graph) => {
  const importerCountsByTarget = new Map();
  const importedTargetsBySource = new Map();
  const importerIdsByTarget = new Map();
  const groupColors = new Map(
    graph.groups
      .slice(0, GROUP_COLORS.length)
      .map((group, slotIndex) => [group.name, GROUP_COLORS[slotIndex]]),
  );

  for (const link of graph.links) {
    const sourceId = endpointId(link.source);
    const targetId = endpointId(link.target);
    importerCountsByTarget.set(targetId, (importerCountsByTarget.get(targetId) ?? 0) + 1);
    if (!importedTargetsBySource.has(sourceId)) {
      importedTargetsBySource.set(sourceId, new Set());
    }
    importedTargetsBySource.get(sourceId).add(targetId);
    if (!importerIdsByTarget.has(targetId)) {
      importerIdsByTarget.set(targetId, new Set());
    }
    importerIdsByTarget.get(targetId).add(sourceId);
  }

  return {
    importerCountsByTarget,
    importedTargetsBySource,
    importerIdsByTarget,
    groupColors,
  };
};
