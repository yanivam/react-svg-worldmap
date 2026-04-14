export type LabelLayer = "country" | "region";

export type ProjectedPoint = [number, number];
export type ProjectedRing = ProjectedPoint[];
export type ProjectedPolygon = ProjectedRing[];

export interface ProjectedFeatureGeometry {
  bounds: [[number, number], [number, number]];
  polygons: ProjectedPolygon[];
}

export interface LabelCandidate {
  id: string;
  text: string;
  x: number;
  y: number;
  bounds?: [[number, number], [number, number]];
  priority: number;
  layer: LabelLayer;
  minScale: number;
}

export interface PlacedLabel extends LabelCandidate {
  width: number;
  height: number;
}
