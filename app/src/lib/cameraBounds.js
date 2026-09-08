export const isPositioned = (node) =>
  Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z ?? 0);

export const isFullyPositioned = (nodes) => nodes.length > 0 && nodes.every(isPositioned);

export const computeBounds = (nodes) => {
  const positionedNodes = nodes.filter(isPositioned);
  if (positionedNodes.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const node of positionedNodes) {
    const z = node.z ?? 0;
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const radius = Math.max(120, Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2);

  return { minX, maxX, minY, maxY, minZ, maxZ, centerX, centerY, centerZ, radius };
};

export const clampToBounds = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export const computeMinZoom = (bounds, width, height) => {
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  if (boundsWidth <= 0 || boundsHeight <= 0) return 0.01;
  const fitZoom = Math.min(width / boundsWidth, height / boundsHeight);
  return Math.min(fitZoom * 0.5, 1);
};

export const expandBounds = (bounds, marginRatio, marginAbsolute) => {
  const marginX = (bounds.maxX - bounds.minX) * marginRatio + marginAbsolute;
  const marginY = (bounds.maxY - bounds.minY) * marginRatio + marginAbsolute;
  const marginZ = (bounds.maxZ - bounds.minZ) * marginRatio + marginAbsolute;
  const minX = bounds.minX - marginX;
  const maxX = bounds.maxX + marginX;
  const minY = bounds.minY - marginY;
  const maxY = bounds.maxY + marginY;
  const minZ = bounds.minZ - marginZ;
  const maxZ = bounds.maxZ + marginZ;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const radius = Math.max(120, Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2);

  return { minX, maxX, minY, maxY, minZ, maxZ, centerX, centerY, centerZ, radius };
};
