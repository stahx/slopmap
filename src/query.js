import path from 'node:path';

export const DEFAULT_LIMIT = 30;

const byPath = (first, second) => first.localeCompare(second);

const pushTo = (map, key, value) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
};

const countBy = (items, keyOf) => {
  const counts = new Map();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()]
    .map(([section, count]) => ({ section, count }))
    .sort((first, second) => second.count - first.count || byPath(first.section, second.section));
};

const fileRow = (node) => ({
  path: node.id,
  section: node.section,
  loc: node.loc,
  importerCount: node.inDegree,
  importCount: node.outDegree,
});

const walkDepths = (startIds, adjacency) => {
  const depths = new Map();
  let frontier = [...startIds];
  let depth = 0;
  while (frontier.length > 0) {
    depth += 1;
    const nextFrontier = [];
    for (const nodeId of frontier) {
      for (const neighborId of adjacency.get(nodeId) ?? []) {
        if (depths.has(neighborId) || startIds.has(neighborId)) continue;
        depths.set(neighborId, depth);
        nextFrontier.push(neighborId);
      }
    }
    frontier = nextFrontier;
  }
  return depths;
};

export const createIndex = (graph) => {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const importsOf = new Map();
  const importersOf = new Map();
  for (const link of graph.links) {
    pushTo(importsOf, link.source, link.target);
    pushTo(importersOf, link.target, link.source);
  }
  return { graph, nodesById, importsOf, importersOf };
};

export const resolveFilePath = (index, input, cwdPrefix = '') => {
  const cleaned = path.posix.normalize(input.replaceAll('\\', '/')).replace(/^\.\//, '');
  for (const candidate of [path.posix.join(cwdPrefix, cleaned), cleaned]) {
    if (index.nodesById.has(candidate)) return { match: candidate, candidates: [] };
  }
  const candidates = [...index.nodesById.keys()]
    .filter((nodeId) => nodeId.endsWith(`/${cleaned}`))
    .sort(byPath);
  return candidates.length === 1
    ? { match: candidates[0], candidates: [] }
    : { match: null, candidates };
};

export const findFiles = (index, term, limit = DEFAULT_LIMIT) => {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = [];
  for (const node of index.nodesById.values()) {
    const lowerId = node.id.toLowerCase();
    if (!words.every((word) => lowerId.includes(word))) continue;
    const baseName = path.posix.basename(lowerId);
    const stem = baseName.replace(/\.[^.]+$/, '');
    const rank = words.includes(stem) ? 0 : words.some((word) => baseName.includes(word)) ? 1 : 2;
    ranked.push({ node, rank });
  }
  ranked.sort(
    (first, second) =>
      first.rank - second.rank ||
      second.node.inDegree - first.node.inDegree ||
      byPath(first.node.id, second.node.id),
  );
  return {
    term,
    total: ranked.length,
    files: ranked.slice(0, limit).map(({ node }) => fileRow(node)),
  };
};

export const fileContext = (index, filePath) => {
  const node = index.nodesById.get(filePath);
  return {
    path: node.id,
    section: node.section,
    group: node.group,
    loc: node.loc,
    imports: [...(index.importsOf.get(filePath) ?? [])].sort(byPath),
    importedBy: [...(index.importersOf.get(filePath) ?? [])].sort(byPath),
  };
};

export const impactOf = (index, filePaths) => {
  const startIds = new Set(filePaths);
  const dependents = [...walkDepths(startIds, index.importersOf).entries()]
    .map(([nodeId, depth]) => ({
      path: nodeId,
      depth,
      section: index.nodesById.get(nodeId).section,
    }))
    .sort((first, second) => first.depth - second.depth || byPath(first.path, second.path));
  return {
    targets: [...startIds].sort(byPath),
    total: dependents.length,
    direct: dependents.filter((dependent) => dependent.depth === 1).length,
    bySection: countBy(dependents, (dependent) => dependent.section),
    dependents,
  };
};

export const changeImpact = (index, changes) => ({
  files: changes.files.map(({ path: filePath, status, additions, deletions }) => ({
    path: filePath,
    status,
    additions,
    deletions,
  })),
  totals: changes.totals,
  ...impactOf(
    index,
    changes.files.map((file) => file.path).filter((filePath) => index.nodesById.has(filePath)),
  ),
});

export const sectionOverview = (index) => {
  const { levels, stats } = index.graph;
  const importsOut = new Map();
  const importsIn = new Map();
  for (const link of levels.dirs.links) {
    if (link.kind !== 'imports') continue;
    importsOut.set(link.source, (importsOut.get(link.source) ?? 0) + link.weight);
    importsIn.set(link.target, (importsIn.get(link.target) ?? 0) + link.weight);
  }
  return {
    files: stats.fileCount,
    imports: stats.linkCount,
    unresolved: stats.unresolvedCount,
    sections: levels.dirs.sections
      .filter((section) => section.fileCount > 0)
      .map((section) => ({
        section: section.id,
        files: section.fileCount,
        loc: section.loc,
        importsOut: importsOut.get(section.id) ?? 0,
        importsIn: importsIn.get(section.id) ?? 0,
      }))
      .sort((first, second) => second.files - first.files || byPath(first.section, second.section)),
  };
};
