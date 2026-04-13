export type LabelLayer = "country" | "region";

export interface LabelCandidate {
  id: string;
  text: string;
  x: number;
  y: number;
  priority: number;
  layer: LabelLayer;
  minScale: number;
}

export interface PlacedLabel extends LabelCandidate {
  width: number;
  height: number;
}
