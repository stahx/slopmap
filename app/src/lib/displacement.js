export const computeDisplacement = (
  nodes,
  originNode,
  pushRadius,
  maxPush
) => {
  const displacements = [];
  for (const node of nodes) {
    if (node === originNode) continue;
    const deltaX = node.x - originNode.x;
    const deltaY = node.y - originNode.y;
    const deltaZ = (node.z ?? 0) - (originNode.z ?? 0);
    const distance = Math.max(Math.hypot(deltaX, deltaY, deltaZ), 1);
    if (distance >= pushRadius) continue;
    const pushDistance = ((pushRadius - distance) / pushRadius) * maxPush;
    displacements.push({
      node,
      original: {
        x: node.x,
        y: node.y,
        z: node.z,
        fx: node.fx,
        fy: node.fy,
        fz: node.fz,
      },
      nextX: node.x + (deltaX / distance) * pushDistance,
      nextY: node.y + (deltaY / distance) * pushDistance,
      nextZ:
        node.z === undefined
          ? undefined
          : node.z + (deltaZ / distance) * pushDistance,
    });
  }
  return displacements;
};
