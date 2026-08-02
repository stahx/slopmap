import { ref, shallowRef } from 'vue';

import { computeDisplacement } from '../lib/displacement.js';
import { filterGraph } from '../lib/filterGraph.js';
import { AGGREGATE_PUSH_RADIUS } from '../lib/graphTokens.js';
import { usePayload } from './usePayload.js';
import { useViewState } from './useViewState.js';

const { payload, diffMode } = usePayload();
const { aggregateFilter, impactOnly, hideIsolated, isAggregatedView, activeAggregate } =
  useViewState();

const selectedNode = shallowRef(null);
const selectedSection = shallowRef(null);
const selectedTab = ref('files');
const displacedOriginals = new Map();
let graphHooks = {
  recolor: () => {},
  repaint: () => {},
};

const currentNodes = () => {
  if (isAggregatedView.value) {
    return activeAggregate.value?.sections ?? [];
  }
  if (payload.value === null) return [];
  return filterGraph({
    nodes: payload.value.graph.nodes,
    links: payload.value.graph.links,
    aggregateFilter: aggregateFilter.value,
    impactOnly: impactOnly.value,
    hideIsolated: hideIsolated.value,
    diffMode: diffMode.value,
  }).nodes;
};

const clearDisplacement = () => {
  for (const [displacedNode, original] of displacedOriginals) {
    displacedNode.x = original.x;
    displacedNode.y = original.y;
    displacedNode.fx = original.fx;
    displacedNode.fy = original.fy;
    if (original.z !== undefined) {
      displacedNode.z = original.z;
      displacedNode.fz = original.fz;
    }
  }
  displacedOriginals.clear();
};

const applyDisplacement = (originNode) => {
  const pushRadius = isAggregatedView.value ? AGGREGATE_PUSH_RADIUS : 90;
  const displacements = computeDisplacement(currentNodes(), originNode, pushRadius, 26);
  for (const displacement of displacements) {
    displacedOriginals.set(displacement.node, displacement.original);
    displacement.node.x = displacement.nextX;
    displacement.node.fx = displacement.nextX;
    displacement.node.y = displacement.nextY;
    displacement.node.fy = displacement.nextY;
    if (displacement.nextZ !== undefined) {
      displacement.node.z = displacement.nextZ;
      displacement.node.fz = displacement.nextZ;
    }
  }
};

const notifyGraph = () => {
  graphHooks.recolor();
  graphHooks.repaint();
};

const setGraphHooks = ({ recolor, repaint }) => {
  graphHooks = { recolor, repaint };
};

const selectSection = (section) => {
  clearDisplacement();
  selectedNode.value = section;
  selectedSection.value = section;
  selectedTab.value = 'files';
  applyDisplacement(section);
  notifyGraph();
};

const selectNode = (node) => {
  clearDisplacement();
  selectedNode.value = node;
  selectedSection.value = null;
  selectedTab.value = 'files';
  applyDisplacement(node);
  notifyGraph();
};

const deselect = () => {
  clearDisplacement();
  selectedNode.value = null;
  selectedSection.value = null;
  selectedTab.value = 'files';
  notifyGraph();
};

const toggleNode = (node) => {
  if (selectedNode.value === node) {
    deselect();
    return;
  }
  if (isAggregatedView.value) {
    selectSection(node);
    return;
  }
  selectNode(node);
};

export const useSelection = () => ({
  selectedNode,
  selectedSection,
  selectedTab,
  selectSection,
  selectNode,
  toggleNode,
  deselect,
  setGraphHooks,
});
