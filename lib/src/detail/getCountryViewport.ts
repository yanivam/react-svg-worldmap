export interface CountryViewport {
  scale: number;
  translateX: number;
  translateY: number;
}

export function getCountryViewport(
  bounds: [[number, number], [number, number]],
): CountryViewport {
  const [[minX, minY], [maxX, maxY]] = bounds;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  return {
    scale: Math.min(6, Math.max(2, 480 / Math.max(width, height))),
    translateX: -minX,
    translateY: -minY,
  };
}
