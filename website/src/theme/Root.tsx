import React from "react";

// Docusaurus Root wrapper — renders once around the entire app.
// The skip link is the very first focusable element on every page,
// satisfying WCAG 2.4.1 (Bypass Blocks). It is visually hidden until
// focused via keyboard, then slides into view.
export default function Root({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {children}
    </>
  );
}
