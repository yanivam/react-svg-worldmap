import * as React from "react";

interface ZoomControlsProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls(props: ZoomControlsProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Map zoom controls"
      style={{
        position: "absolute",
        right: 12,
        bottom: 12,
        display: "inline-flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid rgba(0, 0, 0, 0.14)",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        boxShadow: "0 8px 22px rgba(0, 0, 0, 0.18)",
        zIndex: 1,
      }}>
      <button
        type="button"
        aria-label="Zoom in"
        style={{
          minWidth: 44,
          minHeight: 44,
          border: 0,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          background: "transparent",
          color: "#3c4043",
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1,
        }}
        onClick={props.onZoomIn}
        disabled={!props.canZoomIn}>
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        style={{
          minWidth: 44,
          minHeight: 44,
          border: 0,
          background: "transparent",
          color: "#3c4043",
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1,
        }}
        onClick={props.onZoomOut}
        disabled={!props.canZoomOut}>
        -
      </button>
    </div>
  );
}
