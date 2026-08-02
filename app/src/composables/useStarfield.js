import { onBeforeUnmount, onMounted, watch } from 'vue';

import { wrapCoordinate, wrapPosition } from '../lib/starfieldMath.js';
import { parallaxSource } from './useGraphInstances.js';
import { useSettings } from './useSettings.js';

const STAR_DEPTH_BUCKETS = [0.4, 0.7, 1];
const INITIAL_FIELD_WIDTH = globalThis.innerWidth || 1;
const INITIAL_FIELD_HEIGHT = globalThis.innerHeight || 1;

const pickDepthFactor = () =>
  STAR_DEPTH_BUCKETS[Math.floor(Math.random() * STAR_DEPTH_BUCKETS.length)];

const pickStarColor = () => {
  const colorRoll = Math.random();
  if (colorRoll < 0.6) return '#ffffff';
  if (colorRoll < 0.85) return '#aecbff';
  return '#ffd9a0';
};

const buildStar = (isBright) => ({
  xPosition: Math.random() * INITIAL_FIELD_WIDTH,
  yPosition: Math.random() * INITIAL_FIELD_HEIGHT,
  radius: isBright ? 1.8 + Math.random() * 0.8 : 0.4 + Math.random() * 1.2,
  twinklePhase: Math.random() * Math.PI * 2,
  twinkleSpeed: 0.5 + Math.random() * 1.5,
  driftX: (Math.random() - 0.5) * 0.04,
  driftY: (Math.random() - 0.5) * 0.04,
  color: pickStarColor(),
  isBright,
  depthFactor: isBright ? 1 : pickDepthFactor(),
});

const stars = Array.from({ length: 340 }, () => buildStar(false)).concat(
  Array.from({ length: 8 }, () => buildStar(true)),
);

export const useStarfield = (canvasElement) => {
  const { theme, dimension } = useSettings();
  const baseCanvas = globalThis.document.createElement('canvas');
  const baseContext = baseCanvas.getContext('2d');
  const deepCanvas = globalThis.document.createElement('canvas');
  const deepContext = deepCanvas.getContext('2d');
  const vignetteCanvas = globalThis.document.createElement('canvas');
  const vignetteContext = vignetteCanvas.getContext('2d');
  let starsContext = null;
  let starsFrameId = null;
  let starFieldWidth = globalThis.innerWidth || 1;
  let starFieldHeight = globalThis.innerHeight || 1;
  let stopThemeWatcher = null;

  const drawBaseLayer = () => {
    const pixelRatio = globalThis.devicePixelRatio || 1;
    baseCanvas.width = starFieldWidth * pixelRatio;
    baseCanvas.height = starFieldHeight * pixelRatio;
    baseContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const maxDimension = Math.max(starFieldWidth, starFieldHeight);
    const baseGradient = baseContext.createRadialGradient(
      starFieldWidth * 0.6,
      starFieldHeight * 0.38,
      0,
      starFieldWidth * 0.6,
      starFieldHeight * 0.38,
      maxDimension * 1.2,
    );
    baseGradient.addColorStop(0, '#0d1120');
    baseGradient.addColorStop(0.55, '#070911');
    baseGradient.addColorStop(1, '#04050a');
    baseContext.fillStyle = baseGradient;
    baseContext.fillRect(0, 0, starFieldWidth, starFieldHeight);
    const upperCenterX = starFieldWidth * 0.2;
    const upperCenterY = starFieldHeight * 0.24;
    const upperRadius = Math.hypot(
      Math.max(upperCenterX, starFieldWidth - upperCenterX),
      Math.max(upperCenterY, starFieldHeight - upperCenterY),
    );
    const upperTint = baseContext.createRadialGradient(
      upperCenterX,
      upperCenterY,
      0,
      upperCenterX,
      upperCenterY,
      upperRadius,
    );
    upperTint.addColorStop(0, 'rgba(110,120,200,.16)');
    upperTint.addColorStop(0.45, 'rgba(110,120,200,0)');
    upperTint.addColorStop(1, 'rgba(110,120,200,0)');
    baseContext.fillStyle = upperTint;
    baseContext.fillRect(0, 0, starFieldWidth, starFieldHeight);
    const lowerCenterX = starFieldWidth * 0.74;
    const lowerCenterY = starFieldHeight * 0.7;
    const lowerRadius = Math.hypot(
      Math.max(lowerCenterX, starFieldWidth - lowerCenterX),
      Math.max(lowerCenterY, starFieldHeight - lowerCenterY),
    );
    const lowerTint = baseContext.createRadialGradient(
      lowerCenterX,
      lowerCenterY,
      0,
      lowerCenterX,
      lowerCenterY,
      lowerRadius,
    );
    lowerTint.addColorStop(0, 'rgba(120,70,130,.14)');
    lowerTint.addColorStop(0.5, 'rgba(120,70,130,0)');
    lowerTint.addColorStop(1, 'rgba(120,70,130,0)');
    baseContext.fillStyle = lowerTint;
    baseContext.fillRect(0, 0, starFieldWidth, starFieldHeight);
  };

  const drawDeepLayer = () => {
    const pixelRatio = globalThis.devicePixelRatio || 1;
    const deepHeight = starFieldHeight * 1.6;
    deepCanvas.width = starFieldWidth * pixelRatio;
    deepCanvas.height = deepHeight * pixelRatio;
    deepContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    deepContext.clearRect(0, 0, starFieldWidth, deepHeight);
    const maxDimension = Math.max(starFieldWidth, deepHeight);
    const primaryBandHeight = starFieldHeight * 0.35;
    const primaryBandTop = deepHeight * 0.38 - primaryBandHeight / 2;
    const primaryBandGradient = deepContext.createLinearGradient(
      0,
      primaryBandTop,
      0,
      primaryBandTop + primaryBandHeight,
    );
    primaryBandGradient.addColorStop(0, 'rgba(201,215,255,0)');
    primaryBandGradient.addColorStop(0.5, 'rgba(201,215,255,0.05)');
    primaryBandGradient.addColorStop(1, 'rgba(201,215,255,0)');
    deepContext.fillStyle = primaryBandGradient;
    deepContext.fillRect(0, primaryBandTop, starFieldWidth, primaryBandHeight);
    const secondaryBandHeight = starFieldHeight * 0.18;
    const secondaryBandTop = deepHeight * 0.55 - secondaryBandHeight / 2;
    const secondaryBandGradient = deepContext.createLinearGradient(
      0,
      secondaryBandTop,
      0,
      secondaryBandTop + secondaryBandHeight,
    );
    secondaryBandGradient.addColorStop(0, 'rgba(201,215,255,0)');
    secondaryBandGradient.addColorStop(0.5, 'rgba(201,215,255,0.03)');
    secondaryBandGradient.addColorStop(1, 'rgba(201,215,255,0)');
    deepContext.fillStyle = secondaryBandGradient;
    deepContext.fillRect(0, secondaryBandTop, starFieldWidth, secondaryBandHeight);
    const nebulaBlobs = [
      {
        colorChannels: '144,133,233',
        alpha: 0.1,
        centerX: starFieldWidth * 0.25,
        centerY: deepHeight * 0.3,
        blobRadius: maxDimension * 0.38,
      },
      {
        colorChannels: '57,135,229',
        alpha: 0.08,
        centerX: starFieldWidth * 0.72,
        centerY: deepHeight * 0.58,
        blobRadius: maxDimension * 0.32,
      },
      {
        colorChannels: '213,81,129',
        alpha: 0.06,
        centerX: starFieldWidth * 0.48,
        centerY: deepHeight * 0.85,
        blobRadius: maxDimension * 0.26,
      },
      {
        colorChannels: '236,131,90',
        alpha: 0.035,
        centerX: starFieldWidth * 0.85,
        centerY: deepHeight * 0.18,
        blobRadius: maxDimension * 0.18,
      },
    ];
    for (const blob of nebulaBlobs) {
      for (const wrapOffset of [-starFieldWidth, 0, starFieldWidth]) {
        const wrappedCenterX = blob.centerX + wrapOffset;
        const gradient = deepContext.createRadialGradient(
          wrappedCenterX,
          blob.centerY,
          0,
          wrappedCenterX,
          blob.centerY,
          blob.blobRadius,
        );
        gradient.addColorStop(0, `rgba(${blob.colorChannels},${blob.alpha})`);
        gradient.addColorStop(0.45, `rgba(${blob.colorChannels},${blob.alpha})`);
        gradient.addColorStop(1, `rgba(${blob.colorChannels},0)`);
        deepContext.fillStyle = gradient;
        deepContext.fillRect(0, 0, starFieldWidth, deepHeight);
      }
    }
  };

  const drawVignetteLayer = () => {
    const pixelRatio = globalThis.devicePixelRatio || 1;
    vignetteCanvas.width = starFieldWidth * pixelRatio;
    vignetteCanvas.height = starFieldHeight * pixelRatio;
    vignetteContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    vignetteContext.clearRect(0, 0, starFieldWidth, starFieldHeight);
    const maxDimension = Math.max(starFieldWidth, starFieldHeight);
    const vignetteGradient = vignetteContext.createRadialGradient(
      starFieldWidth / 2,
      starFieldHeight / 2,
      0,
      starFieldWidth / 2,
      starFieldHeight / 2,
      maxDimension,
    );
    vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.35)');
    vignetteContext.fillStyle = vignetteGradient;
    vignetteContext.fillRect(0, 0, starFieldWidth, starFieldHeight);
  };

  const resizeStarsCanvas = () => {
    if (canvasElement.value === null || starsContext === null) return;
    const pixelRatio = globalThis.devicePixelRatio || 1;
    starFieldWidth = globalThis.innerWidth || 1;
    starFieldHeight = globalThis.innerHeight || 1;
    canvasElement.value.width = starFieldWidth * pixelRatio;
    canvasElement.value.height = starFieldHeight * pixelRatio;
    starsContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawBaseLayer();
    drawDeepLayer();
    drawVignetteLayer();
  };

  const renderStars = (timestamp) => {
    if (theme.value !== 'galaxy' || starsContext === null) {
      starsFrameId = null;
      return;
    }
    const parallaxPanX =
      dimension.value === '2d' ? parallaxSource.pan2dX * 0.6 : parallaxSource.pan3dX;
    const parallaxPanY =
      dimension.value === '2d' ? parallaxSource.pan2dY * 0.6 : parallaxSource.pan3dY;
    starsContext.clearRect(0, 0, starFieldWidth, starFieldHeight);
    starsContext.drawImage(baseCanvas, 0, 0, starFieldWidth, starFieldHeight);
    const deepHeight = starFieldHeight * 1.6;
    const deepOffsetX = wrapCoordinate(parallaxPanX * 0.25, starFieldWidth);
    const deepOffsetY = Math.round(-0.3 * starFieldHeight + parallaxPanY * 0.25);
    starsContext.drawImage(deepCanvas, deepOffsetX, deepOffsetY, starFieldWidth, deepHeight);
    starsContext.drawImage(
      deepCanvas,
      deepOffsetX - starFieldWidth,
      deepOffsetY,
      starFieldWidth,
      deepHeight,
    );
    for (const star of stars) {
      star.xPosition += star.driftX;
      star.yPosition += star.driftY;
      if (star.xPosition < 0) star.xPosition += starFieldWidth;
      if (star.xPosition > starFieldWidth) star.xPosition -= starFieldWidth;
      if (star.yPosition < 0) star.yPosition += starFieldHeight;
      if (star.yPosition > starFieldHeight) star.yPosition -= starFieldHeight;
      const screenX = wrapPosition(
        star.xPosition + parallaxPanX * star.depthFactor,
        starFieldWidth,
      );
      const screenY = wrapPosition(
        star.yPosition + parallaxPanY * star.depthFactor,
        starFieldHeight,
      );
      starsContext.globalAlpha =
        0.25 + 0.55 * Math.abs(Math.sin(star.twinklePhase + timestamp * 0.001 * star.twinkleSpeed));
      starsContext.fillStyle = star.color;
      if (star.isBright) {
        starsContext.shadowBlur = 9;
        starsContext.shadowColor = star.color;
      }
      starsContext.beginPath();
      starsContext.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
      starsContext.fill();
      if (star.isBright) starsContext.shadowBlur = 0;
    }
    starsContext.globalAlpha = 1;
    starsContext.drawImage(vignetteCanvas, 0, 0, starFieldWidth, starFieldHeight);
    starsFrameId = globalThis.requestAnimationFrame(renderStars);
  };

  const updateStarsLoop = () => {
    if (theme.value === 'galaxy' && starsFrameId === null) {
      starsFrameId = globalThis.requestAnimationFrame(renderStars);
    } else if (theme.value !== 'galaxy' && starsFrameId !== null) {
      globalThis.cancelAnimationFrame(starsFrameId);
      starsFrameId = null;
    }
  };

  onMounted(() => {
    starsContext = canvasElement.value?.getContext('2d') ?? null;
    if (starsContext === null) return;
    resizeStarsCanvas();
    globalThis.addEventListener('resize', resizeStarsCanvas);
    stopThemeWatcher = watch(theme, updateStarsLoop, { immediate: true });
  });

  onBeforeUnmount(() => {
    stopThemeWatcher?.();
    globalThis.removeEventListener('resize', resizeStarsCanvas);
    if (starsFrameId === null) return;
    globalThis.cancelAnimationFrame(starsFrameId);
    starsFrameId = null;
  });
};
