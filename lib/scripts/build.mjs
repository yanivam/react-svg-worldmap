/**
 * Builds dist/: ESM (index.js), CJS (index.cjs) and bundled declarations
 * (index.d.ts, index.d.cts), plus the lazily loaded detailed country data
 * (map-assets/countries-detailed.cjs). Run from the lib directory.
 */
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { build } from "esbuild";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";

const external = ["react", "react-dom", "d3-geo", "react-path-tooltip"];
const detailedAsset = "map-assets/countries-detailed.cjs";

// Keep the detailed data out of the bundles: index.js and index.cjs load it
// with import() from dist/map-assets/, so bundlers emit it as its own chunk.
const detailedAssetExternal = {
  name: "detailed-asset-external",
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /countries-detailed\.cjs$/ }, () => ({
      path: `./${detailedAsset}`,
      external: true,
    }));
  },
};

const common = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  sourcemap: true,
  platform: "neutral",
  target: "es2020",
  jsx: "transform",
  packages: "external",
  external,
  plugins: [detailedAssetExternal],
};

rmSync("dist", { recursive: true, force: true });

await build({ ...common, format: "esm", outfile: "dist/index.js" });
await build({
  ...common,
  format: "cjs",
  mainFields: ["module", "main"],
  outfile: "dist/index.cjs",
});

const bundle = await rollup({
  input: "src/index.tsx",
  external,
  plugins: [dts({ tsconfig: "tsconfig.json" })],
});
await bundle.write({ file: "dist/index.d.ts", format: "es" });
await bundle.close();
copyFileSync("dist/index.d.ts", "dist/index.d.cts");

mkdirSync("dist/map-assets", { recursive: true });
copyFileSync(`src/${detailedAsset}`, `dist/${detailedAsset}`);
