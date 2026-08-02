import ForceGraph3D from '3d-force-graph';
import ForceGraph from 'force-graph';
import { isProxy, onBeforeUnmount, ref, watch } from 'vue';

import { clampToBounds, computeBounds, expandBounds } from '../lib/cameraBounds.js';
import { filterGraph } from '../lib/filterGraph.js';
import {
  linkColorFor,
  linkWidthFor,
  nodeColorFor,
  nodeLabelFor,
  nodeValueFor,
  particleCountFor,
} from '../lib/graphStyle.js';
import { AGGREGATE_PUSH_RADIUS } from '../lib/graphTokens.js';
import { buildPayloadIndex } from '../lib/payloadIndex.js';
import { azimuthDelta, wrapCoordinate } from '../lib/starfieldMath.js';
import { useMapArea } from './useMapArea.js';
import { usePayload } from './usePayload.js';
import { useSelection } from './useSelection.js';
import { useSettings } from './useSettings.js';
import { useViewState } from './useViewState.js';

const { payload, diffMode } = usePayload();
const { compactnessLevel, dimension } = useSettings();
const {
  currentView,
  aggregateFilter,
  searchTerm,
  impactOnly,
  hideIsolated,
  isAggregatedView,
  activeAggregate,
} = useViewState();
const { selectedNode, selectedSection, toggleNode, deselect, setGraphHooks } = useSelection();
const { mapWidth, mapHeight, disconnect } = useMapArea();

let graph3dInstance = null;
let graph2dInstance = null;
let cameraBounds = null;
let groupColors = new Map();
let pendingFitAfterStop = false;
let snappingBack = false;
let snapBackTimeoutId = null;
let parallaxFrameId = null;
let previousAzimuth = null;
let accumulatedPan3dX = 0;
let pan3dY = 0;
let pan2dX = 0;
let pan2dY = 0;
let stopWatchers = [];
const labelLoopVersion = ref(0);

export const parallaxSource = {
  get pan3dX() {
    return accumulatedPan3dX;
  },
  get pan3dY() {
    return pan3dY;
  },
  get pan3dOffsetX() {
    const fieldWidth = globalThis.innerWidth || mapWidth.value || 1;
    return wrapCoordinate(accumulatedPan3dX, fieldWidth);
  },
  get pan3dOffsetY() {
    return Math.round(pan3dY);
  },
  get pan2dX() {
    return pan2dX;
  },
  get pan2dY() {
    return pan2dY;
  },
};

const styleContext = () => ({
  aggregated: isAggregatedView.value,
  diffMode: diffMode.value,
  compactnessLevel: compactnessLevel.value,
  searchTerm: searchTerm.value.toLowerCase(),
  selectedNode: selectedNode.value,
  groupColors,
});

const nodeColorAccessor = (node) => nodeColorFor(node, styleContext());
const nodeLabelAccessor = (node) => nodeLabelFor(node, styleContext());
const nodeValueAccessor = (node) => nodeValueFor(node, styleContext());

const activeGraph = () => (dimension.value === '2d' ? graph2dInstance : graph3dInstance);

const refreshCameraBounds = () => {
  const graph = activeGraph();
  if (graph === null) {
    cameraBounds = null;
    return;
  }
  const bounds = computeBounds(graph.graphData().nodes);
  cameraBounds = bounds === null ? null : expandBounds(bounds, 0.25, 150);
  if (cameraBounds === null) return;
  if (dimension.value === '3d') {
    const controls = graph3dInstance.controls();
    controls.minDistance = Math.max(40, cameraBounds.radius * 0.08);
    controls.maxDistance = cameraBounds.radius * 4;
    return;
  }
  if (graph2dInstance === null) return;
  graph2dInstance.maxZoom(12);
  const width = mapWidth.value;
  const height = mapHeight.value;
  if (width <= 0 || height <= 0) return;
  const boundsWidth = cameraBounds.maxX - cameraBounds.minX;
  const boundsHeight = cameraBounds.maxY - cameraBounds.minY;
  const fitZoom = Math.min(width / boundsWidth, height / boundsHeight);
  graph2dInstance.minZoom(fitZoom * 0.5);
};

const relaxCameraLimits = () => {
  cameraBounds = null;
  if (graph3dInstance !== null) {
    const controls = graph3dInstance.controls();
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
  }
  if (graph2dInstance !== null) {
    graph2dInstance.minZoom(0.01);
    graph2dInstance.maxZoom(12);
  }
};

const assertRawGraphData = (graphData) => {
  if (!import.meta.env.DEV) return;
  const proxiedNode = graphData.nodes.find((node) => isProxy(node));
  const proxiedLink = graphData.links.find((link) => isProxy(link));
  if (
    isProxy(graphData) ||
    isProxy(graphData.nodes) ||
    isProxy(graphData.links) ||
    proxiedNode !== undefined ||
    proxiedLink !== undefined
  ) {
    throw new Error('slopmap: graphData received a Vue proxy');
  }
};

const feedGraph = (graph, graphData) => {
  if (graph === null) return;
  assertRawGraphData(graphData);
  graph.graphData(graphData);
};

const filteredFilesGraph = () => {
  if (payload.value === null) return { nodes: [], links: [] };
  return filterGraph({
    nodes: payload.value.graph.nodes,
    links: payload.value.graph.links,
    aggregateFilter: aggregateFilter.value,
    impactOnly: impactOnly.value,
    hideIsolated: hideIsolated.value,
    diffMode: diffMode.value,
  });
};

const repaint = () => {
  const graph = activeGraph();
  if (graph === null) return;
  feedGraph(graph, graph.graphData());
};

const recolor = () => {
  activeGraph()?.nodeColor(nodeColorAccessor);
};

const restartLabelLoop = () => {
  labelLoopVersion.value += 1;
};

const pin3dNodes = () => {
  if (graph3dInstance === null) return;
  for (const node of graph3dInstance.graphData().nodes) {
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z;
  }
  refreshCameraBounds();
  if (pendingFitAfterStop && dimension.value === '3d') {
    pendingFitAfterStop = false;
    graph3dInstance.zoomToFit(600);
  }
};

const pin2dNodes = () => {
  if (graph2dInstance === null) return;
  for (const node of graph2dInstance.graphData().nodes) {
    node.fx = node.x;
    node.fy = node.y;
  }
  refreshCameraBounds();
  if (pendingFitAfterStop && dimension.value === '2d') {
    pendingFitAfterStop = false;
    graph2dInstance.zoomToFit(600);
  }
};

const drawSpacedCanvasText = (canvasContext, labelText, centerX, baselineY, characterSpacing) => {
  const characters = [...labelText];
  const textWidth =
    characters.reduce(
      (totalWidth, character) => totalWidth + canvasContext.measureText(character).width,
      0,
    ) +
    characterSpacing * Math.max(characters.length - 1, 0);
  let cursorX = centerX - textWidth / 2;
  for (const character of characters) {
    canvasContext.fillText(character, cursorX, baselineY);
    cursorX += canvasContext.measureText(character).width + characterSpacing;
  }
};

const renderBlastRing = (canvasContext, globalScale) => {
  const section = selectedSection.value;
  if (
    dimension.value !== '2d' ||
    !isAggregatedView.value ||
    section === null ||
    (section.downstreamTotal || 0) === 0 ||
    section.x === undefined ||
    section.y === undefined
  ) {
    return;
  }
  canvasContext.save();
  canvasContext.beginPath();
  canvasContext.setLineDash([6 / globalScale, 5 / globalScale]);
  canvasContext.strokeStyle = 'rgba(240,138,75,.35)';
  canvasContext.lineWidth = 1 / globalScale;
  canvasContext.arc(section.x, section.y, AGGREGATE_PUSH_RADIUS, 0, Math.PI * 2);
  canvasContext.stroke();
  canvasContext.setLineDash([]);
  canvasContext.font = `500 ${10.5 / globalScale}px "IBM Plex Mono", monospace`;
  canvasContext.fillStyle = 'rgba(240,138,75,.6)';
  canvasContext.textAlign = 'left';
  drawSpacedCanvasText(
    canvasContext,
    `BLAST RADIUS · ${section.downstreamTotal} files`,
    section.x,
    section.y + AGGREGATE_PUSH_RADIUS + 18 / globalScale,
    0.6 / globalScale,
  );
  canvasContext.restore();
};

const render2dNodeLabel = (node, canvasContext, globalScale) => {
  if (node.fileCount === undefined) return;
  const isHub = compactnessLevel.value !== 3 || node.id === node.group;
  const labelText = isHub ? node.id : node.id.split('/').at(-1);
  const fontSize = 12 / globalScale;
  const verticalOffset = (Math.sqrt(nodeValueAccessor(node)) * 4) / globalScale + 12 / globalScale;
  canvasContext.font = `${isHub ? 600 : 500} ${fontSize}px "Inter", system-ui, sans-serif`;
  canvasContext.fillStyle = isHub ? '#ffffff' : 'rgba(255,255,255,.72)';
  canvasContext.textAlign = 'center';
  canvasContext.shadowColor = 'rgba(0,0,0,.9)';
  canvasContext.shadowBlur = 3;
  canvasContext.fillText(labelText, node.x, node.y + verticalOffset);
  canvasContext.shadowColor = 'transparent';
  canvasContext.shadowBlur = 0;
};

const focusFileNode = (node) => {
  if (dimension.value === '2d') {
    graph2dInstance?.centerAt(node.x, node.y, 800);
    if (graph2dInstance !== null) {
      graph2dInstance.zoom(Math.max(graph2dInstance.zoom(), 4), 800);
    }
    return;
  }
  if (graph3dInstance === null) return;
  const nodeLength = Math.hypot(node.x, node.y, node.z) || 1;
  const ratio = 1 + 140 / nodeLength;
  graph3dInstance.cameraPosition(
    { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
    node,
    800,
  );
};

const handleNodeClick = (node) => {
  const isDeselecting = selectedNode.value === node;
  toggleNode(node);
  if (isDeselecting || isAggregatedView.value) return;
  focusFileNode(node);
};

const handleBackgroundClick = () => {
  if (selectedNode.value === null && selectedSection.value === null) return;
  deselect();
};

const captureParallax = () => {
  if (dimension.value === '3d' && graph3dInstance?.camera()) {
    const cameraPosition = graph3dInstance.camera().position;
    const nextAzimuth = Math.atan2(cameraPosition.x, cameraPosition.z);
    const elevation = Math.atan2(cameraPosition.y, Math.hypot(cameraPosition.x, cameraPosition.z));
    if (previousAzimuth === null) {
      previousAzimuth = nextAzimuth;
    } else {
      const delta = azimuthDelta(previousAzimuth, nextAzimuth);
      const fieldWidth = globalThis.innerWidth || mapWidth.value;
      accumulatedPan3dX += (delta / (2 * Math.PI)) * fieldWidth * 2;
      previousAzimuth = nextAzimuth;
    }
    const fieldHeight = globalThis.innerHeight || mapHeight.value;
    pan3dY = (elevation / (Math.PI / 2)) * fieldHeight * 0.5;
  }
  parallaxFrameId = globalThis.requestAnimationFrame(captureParallax);
};

const clamp3dTarget = (controls) => {
  if (cameraBounds === null) return;
  controls.target.x = clampToBounds(controls.target.x, cameraBounds.minX, cameraBounds.maxX);
  controls.target.y = clampToBounds(controls.target.y, cameraBounds.minY, cameraBounds.maxY);
  controls.target.z = clampToBounds(controls.target.z, cameraBounds.minZ, cameraBounds.maxZ);
};

const handle2dZoomEnd = ({ k: zoomScale, x: transformX, y: transformY }) => {
  if (snappingBack) {
    snappingBack = false;
    if (snapBackTimeoutId !== null) {
      globalThis.clearTimeout(snapBackTimeoutId);
      snapBackTimeoutId = null;
    }
    return;
  }
  if (
    cameraBounds === null ||
    graph2dInstance === null ||
    zoomScale <= 0 ||
    mapWidth.value <= 0 ||
    mapHeight.value <= 0
  ) {
    return;
  }
  const centerGraphX = (mapWidth.value / 2 - transformX) / zoomScale;
  const centerGraphY = (mapHeight.value / 2 - transformY) / zoomScale;
  const clampedX = clampToBounds(centerGraphX, cameraBounds.minX, cameraBounds.maxX);
  const clampedY = clampToBounds(centerGraphY, cameraBounds.minY, cameraBounds.maxY);
  if (clampedX === centerGraphX && clampedY === centerGraphY) return;
  snappingBack = true;
  snapBackTimeoutId = globalThis.setTimeout(() => {
    snappingBack = false;
    snapBackTimeoutId = null;
  }, 400);
  graph2dInstance.centerAt(clampedX, clampedY, 350);
};

const resizeGraphs = (width, height) => {
  graph3dInstance?.width(width).height(height);
  graph2dInstance?.width(width).height(height);
  if (dimension.value === '2d') refreshCameraBounds();
};

const refreshFilesGraph = () => {
  if (currentView.value !== 'files') return;
  feedGraph(activeGraph(), filteredFilesGraph());
  relaxCameraLimits();
};

const applyView = () => {
  deselect();
  const graph = activeGraph();
  if (graph === null) return;
  if (isAggregatedView.value) {
    const aggregate = activeAggregate.value;
    feedGraph(graph, {
      nodes: aggregate?.sections ?? [],
      links: aggregate?.links ?? [],
    });
    graph.d3Force('charge').strength(-160);
    graph
      .d3Force('link')
      .distance(
        compactnessLevel.value === 1
          ? 120
          : compactnessLevel.value === 2
            ? 100
            : (link) => (link.kind === 'orbit' ? 70 : 110),
      );
  } else {
    feedGraph(graph, filteredFilesGraph());
    graph.d3Force('charge').strength(-45);
    graph.d3Force('link').distance(35);
  }
  relaxCameraLimits();
  restartLabelLoop();
  const hasSettledCoordinates = graph
    .graphData()
    .nodes.some((node) => Number.isFinite(node.x));
  if (hasSettledCoordinates) graph.zoomToFit(600);
  pendingFitAfterStop = true;
};

const registerWatchers = () => {
  stopWatchers = [
    watch(dimension, () => applyView()),
    watch([currentView, compactnessLevel], () => applyView()),
    watch([impactOnly, hideIsolated, aggregateFilter], () => refreshFilesGraph()),
    watch([searchTerm, selectedNode], () => recolor()),
    watch([mapWidth, mapHeight], ([width, height]) => resizeGraphs(width, height), {
      flush: 'post',
    }),
  ];
};

const createGraphInstances = (host3dElement, host2dElement) => {
  groupColors = buildPayloadIndex(payload.value.graph).groupColors;
  graph3dInstance = ForceGraph3D()(host3dElement)
    .backgroundColor('rgba(18,20,42,0)')
    .nodeLabel(nodeLabelAccessor)
    .nodeVal(nodeValueAccessor)
    .nodeColor(nodeColorAccessor)
    .linkWidth(linkWidthFor)
    .linkColor(linkColorFor)
    .linkOpacity(0.35)
    .linkDirectionalParticles(particleCountFor)
    .linkDirectionalParticleWidth(1.4)
    .onNodeClick(handleNodeClick)
    .onBackgroundClick(handleBackgroundClick)
    .onEngineStop(pin3dNodes);
  const controls = graph3dInstance.controls();
  controls.addEventListener('change', () => clamp3dTarget(controls));
  graph2dInstance = ForceGraph()(host2dElement)
    .backgroundColor('rgba(18,20,42,0)')
    .nodeVal(nodeValueAccessor)
    .nodeColor(nodeColorAccessor)
    .nodeLabel(nodeLabelAccessor)
    .linkColor(linkColorFor)
    .linkWidth(linkWidthFor)
    .linkDirectionalParticles(particleCountFor)
    .linkDirectionalParticleWidth(1.4)
    .onRenderFramePre(renderBlastRing)
    .nodeCanvasObjectMode(() => 'after')
    .nodeCanvasObject(render2dNodeLabel)
    .onNodeClick(handleNodeClick)
    .onBackgroundClick(handleBackgroundClick)
    .onEngineStop(pin2dNodes)
    .onZoom(({ x: transformX, y: transformY }) => {
      pan2dX = transformX;
      pan2dY = transformY;
    })
    .onZoomEnd(handle2dZoomEnd);
  setGraphHooks({ recolor, repaint });
  if (mapWidth.value > 0 && mapHeight.value > 0) {
    resizeGraphs(mapWidth.value, mapHeight.value);
  }
  registerWatchers();
  parallaxFrameId = globalThis.requestAnimationFrame(captureParallax);
};

const destroyGraphInstances = () => {
  for (const stopWatcher of stopWatchers) stopWatcher();
  stopWatchers = [];
  graph3dInstance?._destructor?.();
  graph2dInstance?._destructor?.();
  graph3dInstance = null;
  graph2dInstance = null;
  cameraBounds = null;
  snappingBack = false;
  if (snapBackTimeoutId !== null) {
    globalThis.clearTimeout(snapBackTimeoutId);
    snapBackTimeoutId = null;
  }
  disconnect();
  if (parallaxFrameId !== null) {
    globalThis.cancelAnimationFrame(parallaxFrameId);
    parallaxFrameId = null;
  }
  setGraphHooks({ recolor: () => {}, repaint: () => {} });
};

export const getGraph3dInstance = () => graph3dInstance;
export const graphLabelLoopVersion = labelLoopVersion;

export const useGraphInstances = () => {
  onBeforeUnmount(destroyGraphInstances);
  return {
    createGraphInstances,
    applyView,
    getGraph3dInstance,
    labelLoopVersion,
    parallaxSource,
  };
};
