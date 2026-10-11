/**
 * Builds dist/: ESM (index.js), CJS (index.cjs) and bundled declarations
 * (index.d.ts, index.d.cts). Run from the lib directory.
 */
import { copyFileSync, rmSync } from "node:fs";
import { build } from "esbuild";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";

const external = ["react", "react-dom", "d3-geo", "react-path-tooltip"];
const common = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  sourcemap: true,
  platform: "neutral",
  target: "es2020",
  jsx: "transform",
  packages: "external",
  external,
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
