const GROUPED_ROOTS = new Set(['apps', 'packages', 'services', 'libs', 'modules']);

const groupFor = (filePath) => {
  const segments = filePath.split('/');
  if (segments.length === 1) return '(root)';
  if (GROUPED_ROOTS.has(segments[0]) && segments.length > 2) {
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0];
};

const sectionFor = (filePath) => {
  const segments = filePath.split('/');
  if (segments.length === 1) return '(root)';
  if (GROUPED_ROOTS.has(segments[0])) {
    const hub = `${segments[0]}/${segments[1]}`;
    return segments.length >= 4 ? `${hub}/${segments[2]}` : hub;
  }
  return segments.length >= 3 ? `${segments[0]}/${segments[1]}` : segments[0];
};

const rootOf = (filePath) => filePath.includes('/') ? filePath.split('/')[0] : '(root)';

const createSectionRecord = (sectionId, groupName) => ({
  id: sectionId,
  group: groupName,
  fileCount: 0,
  loc: 0,
  changedCount: 0,
  dependentCount: 0,
  dependencyCount: 0,
  changedFiles: [],
  status: 'normal',
});

const buildAggregate = (nodesById, links, sectionOf) => {
  const sectionRecordsById = new Map();
  for (const node of nodesById.values()) {
    const sectionId = sectionOf(node.id);
    if (!sectionRecordsById.has(sectionId)) {
      sectionRecordsById.set(sectionId, createSectionRecord(sectionId, sectionId));
    }
    const section = sectionRecordsById.get(sectionId);
    section.fileCount += 1;
    section.loc += node.loc;
    if (node.status === 'changed') {
      section.changedCount += 1;
      if (section.changedFiles.length < 100) section.changedFiles.push(node.id);
    } else if (node.status === 'dependent') {
      section.dependentCount += 1;
    } else if (node.status === 'dependency') {
      section.dependencyCount += 1;
    }
  }

  const sections = [...sectionRecordsById.values()];
  for (const section of sections) {
    section.status = section.changedCount > 0
      ? 'changed'
      : section.dependentCount > 0
        ? 'dependent'
        : section.dependencyCount > 0
          ? 'dependency'
          : 'normal';
  }

  const importLinksByKey = new Map();
  for (const link of links) {
    const sourceSection = sectionOf(link.source);
    const targetSection = sectionOf(link.target);
    if (sourceSection === targetSection) continue;
    const importKey = `${sourceSection}\0${targetSection}`;
    if (!importLinksByKey.has(importKey)) {
      importLinksByKey.set(importKey, {
        source: sourceSection,
        target: targetSection,
        kind: 'imports',
        weight: 0,
        hot: 0,
      });
    }
    const importLink = importLinksByKey.get(importKey);
    importLink.weight += 1;
    if (link.hot) importLink.hot = 1;
  }

  return { sections, links: [...importLinksByKey.values()] };
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

  for (const node of nodesById.values()) {
    node.section = sectionFor(node.id);
    node.rootGroup = rootOf(node.id);
  }

  const sectionCountsByGroup = new Map();
  for (const node of nodesById.values()) {
    if (!sectionCountsByGroup.has(node.group)) sectionCountsByGroup.set(node.group, new Map());
    const sectionCounts = sectionCountsByGroup.get(node.group);
    sectionCounts.set(node.section, (sectionCounts.get(node.section) || 0) + 1);
  }

  const droppedSectionsByGroup = new Map();
  for (const [groupName, sectionCounts] of sectionCountsByGroup) {
    const otherSectionId = `${groupName}/(other)`;
    const subsectionCounts = [...sectionCounts.entries()]
      .filter(([sectionId]) => sectionId !== groupName && sectionId !== otherSectionId)
      .sort((firstSection, secondSection) => secondSection[1] - firstSection[1]);
    droppedSectionsByGroup.set(
      groupName,
      new Set(subsectionCounts.slice(11).map(([sectionId]) => sectionId))
    );
  }

  for (const node of nodesById.values()) {
    if (droppedSectionsByGroup.get(node.group).has(node.section)) {
      node.section = `${node.group}/(other)`;
    }
  }

  for (const link of links) {
    const sourceStatus = nodesById.get(link.source).status;
    const targetStatus = nodesById.get(link.target).status;
    link.hot = sourceStatus !== 'normal' && targetStatus !== 'normal' ? 1 : 0;
  }

  const dirs = buildAggregate(nodesById, links, (filePath) => nodesById.get(filePath).section);
  const dirSectionsById = new Map(dirs.sections.map((section) => [section.id, section]));
  const groupsWithSubsections = new Set();
  for (const node of nodesById.values()) {
    dirSectionsById.get(node.section).group = node.group;
    if (node.section !== node.group) groupsWithSubsections.add(node.group);
  }

  for (const groupName of groupsWithSubsections) {
    if (!dirSectionsById.has(groupName)) {
      const hubSection = createSectionRecord(groupName, groupName);
      dirSectionsById.set(groupName, hubSection);
      dirs.sections.push(hubSection);
    }
  }

  const orbitLinks = dirs.sections
    .filter((section) => section.id !== section.group)
    .map((section) => ({ source: section.group, target: section.id, kind: 'orbit' }));
  dirs.links = [...orbitLinks, ...dirs.links];
  const roots = buildAggregate(nodesById, links, rootOf);
  const groups = buildAggregate(nodesById, links, groupFor);

  const groupCounts = new Map();
  for (const node of nodesById.values()) {
    groupCounts.set(node.group, (groupCounts.get(node.group) || 0) + 1);
  }
  const groupSummaries = [...groupCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count);

  return {
    nodes: [...nodesById.values()],
    links,
    groups: groupSummaries,
    levels: { roots, groups, dirs },
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
