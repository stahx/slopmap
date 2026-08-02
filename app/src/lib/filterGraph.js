export const idOf = (endpoint) =>
  typeof endpoint === 'object' && endpoint !== null ? endpoint.id : endpoint;

export const filterGraph = ({
  nodes,
  links,
  aggregateFilter,
  impactOnly,
  hideIsolated,
  diffMode,
}) => {
  let filteredNodes = nodes;
  if (aggregateFilter !== null) {
    filteredNodes = filteredNodes.filter((node) => {
      if (aggregateFilter.mode === 'root') {
        return node.rootGroup === aggregateFilter.value;
      }
      if (aggregateFilter.mode === 'group') {
        return node.group === aggregateFilter.value;
      }
      return node.section === aggregateFilter.value;
    });
  }
  if (diffMode && impactOnly) {
    filteredNodes = filteredNodes.filter((node) => node.status !== 'normal');
  }

  let keptNodeIds = new Set(filteredNodes.map((node) => node.id));
  let filteredLinks = links.filter(
    (link) => keptNodeIds.has(idOf(link.source)) && keptNodeIds.has(idOf(link.target)),
  );
  if (hideIsolated) {
    const linkedNodeIds = new Set();
    for (const link of filteredLinks) {
      linkedNodeIds.add(idOf(link.source));
      linkedNodeIds.add(idOf(link.target));
    }
    filteredNodes = filteredNodes.filter((node) => linkedNodeIds.has(node.id));
    keptNodeIds = new Set(filteredNodes.map((node) => node.id));
    filteredLinks = filteredLinks.filter(
      (link) => keptNodeIds.has(idOf(link.source)) && keptNodeIds.has(idOf(link.target)),
    );
  }

  return { nodes: filteredNodes, links: filteredLinks };
};
