import type { GeoProjection } from "d3-geo";
import type { MapPin } from "../types.js";

const PIN_SIZE = 16;
const LABEL_OFFSET = 10;
const AVERAGE_CHARACTER_WIDTH = 6.5;
const LABEL_HEIGHT = 12;

export interface ProjectedMapPin {
  pin: MapPin;
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number;
}

function isValidCoordinate(coordinates: readonly [number, number]): boolean {
  const [longitude, latitude] = coordinates;

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function intersects(left: ProjectedMapPin, right: ProjectedMapPin): boolean {
  return !(
    left.x + left.width / 2 < right.x - right.width / 2 ||
    left.x - left.width / 2 > right.x + right.width / 2 ||
    left.y + left.height / 2 < right.y - right.height / 2 ||
    left.y - left.height / 2 > right.y + right.height / 2
  );
}

/**
 * Projects the pins into map coordinates and drops the ones whose marker and
 * caption would overlap a higher-priority pin. `mapScale` is the number of
 * screen pixels per map unit, so overlaps are judged at the rendered size.
 */
export function projectMapPins(
  pins: readonly MapPin[],
  projection: GeoProjection,
  mapScale: number,
): ProjectedMapPin[] {
  return pins
    .map((pin, index): ProjectedMapPin | undefined => {
      if (!isValidCoordinate(pin.coordinates)) return undefined;

      const point = projection([...pin.coordinates]);
      if (point == null) return undefined;

      const markerScale = 1 / mapScale;
      const width =
        (PIN_SIZE +
          LABEL_OFFSET +
          pin.caption.length * AVERAGE_CHARACTER_WIDTH) *
        markerScale;
      const height = Math.max(PIN_SIZE, LABEL_HEIGHT) * markerScale;

      return {
        pin,
        x: point[0],
        y: point[1],
        width,
        height,
        priority: pin.priority ?? pins.length - index,
      };
    })
    .filter((pin): pin is ProjectedMapPin => Boolean(pin))
    .sort((left, right) => right.priority - left.priority)
    .reduce<ProjectedMapPin[]>((accepted, pin) => {
      if (accepted.some((acceptedPin) => intersects(acceptedPin, pin)))
        return accepted;
      accepted.push(pin);
      return accepted;
    }, []);
}
