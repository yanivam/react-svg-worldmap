import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  esbuildPlugins: [
    {
      name: "external-map-assets",
      setup(build) {
        build.onResolve({ filter: /map-assets\/.*\.cjs$/ }, (args) => ({
          path: args.path,
          external: true,
        }));
      },
    },
  ],
  // Type: "module" in package.json => index.js (ESM) + index.cjs (CJS)
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "d3-geo",
    "react-path-tooltip",
    /src\/map-assets\/.*\.cjs$/,
  ],
});
