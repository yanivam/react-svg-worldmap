import * as React from "react";

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const buttonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: 0,
  background: "#fff",
  color: "#1f2933",
  cursor: "pointer",
  fontSize: 22,
  fontWeight: 600,
  lineHeight: 1,
  padding: 0,
};

const controlGroupStyle: React.CSSProperties = {
  position: "absolute",
  right: 12,
  bottom: 12,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid rgba(38, 50, 56, 0.28)",
  borderRadius: 4,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(31, 41, 51, 0.22)",
};

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: Props): JSX.Element {
  return (
    <div
      aria-label="Map zoom controls"
      data-placement="bottom-right"
      role="group"
      style={controlGroupStyle}>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        style={{
          ...buttonStyle,
          borderBottom: "1px solid rgba(38, 50, 56, 0.16)",
        }}>
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        style={{
          ...buttonStyle,
          borderBottom: "1px solid rgba(38, 50, 56, 0.16)",
        }}>
        -
      </button>
      <button
        type="button"
        aria-label="Reset zoom"
        title="Reset zoom"
        onClick={onResetZoom}
        style={buttonStyle}>
        <svg
          aria-hidden="true"
          focusable="false"
          height="18"
          viewBox="0 0 24 24"
          width="18">
          <path
            d="M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5M9.5 20v-5.5h5V20"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  );
}
