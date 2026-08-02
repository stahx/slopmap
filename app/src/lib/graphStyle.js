import { MUTED_COLOR, STATUS_COLORS } from './graphTokens.js';

export const blendTowardWhite = (hexColor, ratio) => {
  const blendChannel = (channelOffset) => {
    const channelValue = Number.parseInt(hexColor.slice(channelOffset, channelOffset + 2), 16);
    return Math.round(channelValue + (255 - channelValue) * ratio)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${blendChannel(1)}${blendChannel(3)}${blendChannel(5)}`;
};

export const nodeColorFor = (node, context) => {
  let baseColor;
  if (context.aggregated) {
    baseColor = context.diffMode
      ? node.status === 'normal'
        ? 'rgba(139,143,163,.5)'
        : STATUS_COLORS[node.status]
      : context.groupColors.get(node.group) || MUTED_COLOR;
  } else if (context.searchTerm && node.id.toLowerCase().includes(context.searchTerm)) {
    baseColor = '#ffffff';
  } else if (node.status !== 'normal') {
    baseColor = STATUS_COLORS[node.status];
  } else if (context.diffMode) {
    baseColor = 'rgba(139,143,163,.35)';
  } else {
    baseColor = context.groupColors.get(node.group) || MUTED_COLOR;
  }

  if (node !== context.selectedNode) return baseColor;
  return baseColor.startsWith('#')
    ? blendTowardWhite(baseColor, 0.4)
    : blendTowardWhite(MUTED_COLOR, 0.4);
};

export const nodeLabelFor = (node, context) => {
  if (context.aggregated) {
    return (
      `${node.id} · ${node.fileCount} files` +
      (node.changedCount > 0 ? ` · ${node.changedCount} changed` : '')
    );
  }

  return `${node.id} · ${node.loc} loc` + (node.status !== 'normal' ? ` · ${node.status}` : '');
};

export const nodeValueFor = (node, context) => {
  if (!context.aggregated) {
    return Math.max(1, Math.min(14, node.loc / 60));
  }
  if (context.compactnessLevel === 1) {
    return Math.max(10, Math.min(90, Math.sqrt(node.fileCount) * 2.4));
  }
  if (context.compactnessLevel === 2) {
    return Math.max(8, Math.min(70, Math.sqrt(node.fileCount) * 2));
  }
  return Math.max(4, Math.min(40, node.fileCount));
};

export const linkWidthFor = (link) => {
  if (link.kind === undefined) return 1;
  return link.kind === 'imports' ? Math.min(4, Math.log2(link.weight + 1)) : 0.2;
};

export const linkColorFor = (link) => {
  if (link.kind === 'orbit') return 'rgba(255,255,255,0.08)';
  if (link.kind === 'imports') return link.hot ? '#f08a4b' : '#3a3d55';
  return link.hot ? '#f08a4b' : '#3a3d55';
};

export const particleCountFor = (link) => {
  if (link.kind !== undefined) {
    return link.kind === 'imports' && link.hot ? 2 : 0;
  }
  return link.hot ? 2 : 0;
};
