import * as React from "react";

interface Props {
  message: string;
}

export default function ZoomStatus({ message }: Props): JSX.Element {
  return (
    <div
      aria-live="polite"
      style={{
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: 1,
      }}>
      {message}
    </div>
  );
}
