export const formatRelativeTime = (isoString, nowMs) => {
  const timestampMs = new Date(isoString).getTime();
  if (!Number.isFinite(timestampMs) || !Number.isFinite(nowMs)) return '';

  const elapsedSeconds = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  if (elapsedSeconds < 3600) {
    return `${Math.floor(elapsedSeconds / 60)}m ago`;
  }
  return `${Math.floor(elapsedSeconds / 3600)}h ago`;
};
