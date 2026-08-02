const sectionKeyForLevel = (level) => {
  if (level === 1) return 'rootGroup';
  if (level === 2) return 'group';
  return 'section';
};

const endpointId = (endpoint) =>
  typeof endpoint === 'object' && endpoint !== null ? endpoint.id : endpoint;

export const changeMatchesSection = (changeFile, section, level) =>
  changeFile?.[sectionKeyForLevel(level)] === section?.id;

export const nodeMatchesSection = (node, section, level) =>
  node?.[sectionKeyForLevel(level)] === section?.id;

export const displayPathFor = (path, sectionId) => {
  const sectionPrefix = `${sectionId}/`;
  return path.startsWith(sectionPrefix) ? path.slice(sectionPrefix.length) : path;
};

export const changedFilesFor = (changes, section, level) => {
  const changeFiles = Array.isArray(changes) ? changes : (changes?.files ?? []);
  return changeFiles.filter((changeFile) => changeMatchesSection(changeFile, section, level));
};

export const sectionFilesFor = (nodes, section, level) =>
  nodes
    .filter((node) => nodeMatchesSection(node, section, level))
    .sort((firstNode, secondNode) => secondNode.loc - firstNode.loc)
    .slice(0, 10);

export const importedFilesFor = (links, changedFileIds, section, level, nodeMatcher) => {
  const changedIds = new Set(changedFileIds);
  const importedIds = new Set();
  for (const link of links) {
    const sourceId = endpointId(link.source);
    if (!changedIds.has(sourceId)) continue;
    const targetId = endpointId(link.target);
    if (nodeMatcher(link.target, section, level)) continue;
    importedIds.add(targetId);
  }
  return [...importedIds].sort((firstId, secondId) => firstId.localeCompare(secondId));
};

export const sortChangedSections = (sections) =>
  sections
    .filter((section) => section.changedCount > 0)
    .slice()
    .sort(
      (firstSection, secondSection) =>
        secondSection.changedCount - firstSection.changedCount ||
        firstSection.id.localeCompare(secondSection.id),
    );
