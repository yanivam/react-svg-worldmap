import * as React from "react";

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const buttonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: "1px solid #777",
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
};

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: Props): JSX.Element {
  return (
    <div
      aria-label="Map zoom controls"
      role="group"
      style={{
        display: "flex",
        gap: 4,
        marginBottom: 8,
      }}>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        style={buttonStyle}>
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        style={buttonStyle}>
        -
      </button>
      <button
        type="button"
        aria-label="Reset zoom"
        onClick={onReset}
        style={{
          ...buttonStyle,
          width: 48,
          fontSize: 12,
        }}>
        Reset
      </button>
    </div>
  );
}
