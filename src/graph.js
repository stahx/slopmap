const GROUPED_ROOTS = new Set(['apps', 'packages', 'services', 'libs', 'modules']);

const groupFor = (filePath) => {
  const segments = filePath.split('/');
  if (segments.length === 1) return '(root)';
  if (GROUPED_ROOTS.has(segments[0]) && segments.length > 2) {
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0];
};

const breadthFirst = (startIds, adjacency) => {
  const visited = new Set();
  let frontier = [...startIds];
  while (frontier.length > 0) {
    const nextFrontier = [];
    for (const nodeId of frontier) {
      for (const neighborId of adjacency.get(nodeId) || []) {
        if (visited.has(neighborId) || startIds.has(neighborId)) continue;
        visited.add(neighborId);
        nextFrontier.push(neighborId);
      }
    }
    frontier = nextFrontier;
  }
  return visited;
};

export const buildGraph = ({ sources, resolver, changedFiles }) => {
  const nodesById = new Map();
  for (const source of sources) {
    nodesById.set(source.filePath, {
      id: source.filePath,
      group: groupFor(source.filePath),
      loc: source.loc,
      status: 'normal',
      inDegree: 0,
      outDegree: 0,
    });
  }

  const links = [];
  const linkKeys = new Set();
  const forwardAdjacency = new Map();
  const reverseAdjacency = new Map();
  let unresolvedCount = 0;

  for (const source of sources) {
    for (const specifier of source.specifiers) {
      const target = resolver.resolve(source.filePath, specifier);
      if (target === null) {
        if (resolver.isInternalLooking(specifier)) unresolvedCount += 1;
        continue;
      }
      if (target === source.filePath || !nodesById.has(target)) continue;
      const linkKey = `${source.filePath}\0${target}`;
      if (linkKeys.has(linkKey)) continue;
      linkKeys.add(linkKey);
      links.push({ source: source.filePath, target });
      nodesById.get(source.filePath).outDegree += 1;
      nodesById.get(target).inDegree += 1;
      if (!forwardAdjacency.has(source.filePath)) forwardAdjacency.set(source.filePath, []);
      forwardAdjacency.get(source.filePath).push(target);
      if (!reverseAdjacency.has(target)) reverseAdjacency.set(target, []);
      reverseAdjacency.get(target).push(source.filePath);
    }
  }

  const changedIds = new Set([...changedFiles].filter((filePath) => nodesById.has(filePath)));
  const dependentIds = breadthFirst(changedIds, reverseAdjacency);
  const dependencyIds = breadthFirst(changedIds, forwardAdjacency);

  for (const nodeId of changedIds) nodesById.get(nodeId).status = 'changed';
  for (const nodeId of dependentIds) {
    const node = nodesById.get(nodeId);
    if (node.status === 'normal') node.status = 'dependent';
  }
  for (const nodeId of dependencyIds) {
    const node = nodesById.get(nodeId);
    if (node.status === 'normal') node.status = 'dependency';
  }

  for (const link of links) {
    const sourceStatus = nodesById.get(link.source).status;
    const targetStatus = nodesById.get(link.target).status;
    link.hot = sourceStatus !== 'normal' && targetStatus !== 'normal' ? 1 : 0;
  }

  const groupCounts = new Map();
  for (const node of nodesById.values()) {
    groupCounts.set(node.group, (groupCounts.get(node.group) || 0) + 1);
  }
  const groups = [...groupCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count);

  return {
    nodes: [...nodesById.values()],
    links,
    groups,
    stats: {
      fileCount: nodesById.size,
      linkCount: links.length,
      unresolvedCount,
      changedCount: changedIds.size,
      dependentCount: dependentIds.size,
      dependencyCount: dependencyIds.size,
    },
  };
};
