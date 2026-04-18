export interface CountryViewport {
  scale: number;
  translateX: number;
  translateY: number;
}

export function getCountryViewport(
  bounds: [[number, number], [number, number]],
  viewportWidth: number,
  viewportHeight: number,
  minScale = 1,
): CountryViewport {
  const [[minX, minY], [maxX, maxY]] = bounds;
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const padding = 24;
  const availableWidth = Math.max(viewportWidth - padding * 2, 1);
  const availableHeight = Math.max(viewportHeight - padding * 2, 1);
  const fittedBaseScale = Math.min(
    availableWidth / boundsWidth,
    availableHeight / boundsHeight,
    (viewportWidth / 960) * 10,
  );
  const fittedScale = Math.max(
    1,
    fittedBaseScale / Math.max(viewportWidth / 960, 0.01),
  );
  const scale = Math.max(minScale, fittedScale);
  const baseScale = (viewportWidth / 960) * scale;
  const shiftedMinY = minY + 240;
  const shiftedMaxY = maxY + 240;

  return {
    scale,
    translateX: viewportWidth / 2 - baseScale * ((minX + maxX) / 2),
    translateY:
      viewportHeight / 2 - baseScale * ((shiftedMinY + shiftedMaxY) / 2),
  };
}
