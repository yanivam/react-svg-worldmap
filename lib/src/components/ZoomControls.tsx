import * as React from "react";

interface ZoomControlsProps {
  canDrillIn: boolean;
  canGoBack: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onBack: () => void;
  onReset: () => void;
}

export default function ZoomControls(props: ZoomControlsProps): JSX.Element {
  return (
    <div aria-label="Map zoom controls">
      <button
        type="button"
        onClick={props.onZoomIn}
        disabled={!props.canDrillIn}>
        Zoom in
      </button>
      <button type="button" onClick={props.onZoomOut}>
        Zoom out
      </button>
      <button type="button" onClick={props.onBack} disabled={!props.canGoBack}>
        Back
      </button>
      <button type="button" onClick={props.onReset}>
        Reset
      </button>
    </div>
  );
}
