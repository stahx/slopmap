export const wrapCoordinate = (value, size) =>
  Math.round(((value % size) + size) % size);

export const azimuthDelta = (previous, next) => {
  let delta = next - previous;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
};
