import * as React from "react";

export default function LiveAnnouncer({
  message,
}: {
  message: string;
}): JSX.Element {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clipPath: "inset(50%)",
      }}>
      {message}
    </div>
  );
}
