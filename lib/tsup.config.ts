import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // Type: "module" in package.json => index.js (ESM) + index.cjs (CJS)
  outDir: "dist",
  external: ["react", "react-dom", "d3-geo", "react-path-tooltip"],
});
