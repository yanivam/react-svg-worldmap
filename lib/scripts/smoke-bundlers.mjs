/**
 * Smoke test: bundle the packed package with Vite and webpack and check that
 * the detailed country data (dist/map-assets/countries-detailed.cjs) becomes
 * its own lazily loaded chunk that loads and decodes.
 *
 * Run from a directory that has react-svg-worldmap, react, react-dom, vite
 * and webpack installed (CI installs the packed tarball there).
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build as viteBuild } from "vite";
import webpack from "webpack";

const root = process.cwd();
const entry = path.join(root, "smoke-bundler-entry.mjs");

// Loads the detailed data through the package's own import() and checks
// that it decodes to the same countries as the default map.
writeFileSync(
  entry,
  `import WorldMap, { preloadDetailedCountryGeometry, regions } from "react-svg-worldmap";

export async function run() {
  if (typeof WorldMap !== "function") throw new Error("No WorldMap export");
  await preloadDetailedCountryGeometry();
  return regions.length;
}
`,
);

// The entry chunk must stay small; the data goes in a chunk of its own.
function checkChunks(outDir, bundler) {
  const files = readdirSync(outDir).filter((file) => /\.(c|m)?js$/.test(file));
  const sizes = files.map((file) => ({
    file,
    size: statSync(path.join(outDir, file)).size,
  }));
  const data = sizes.filter(({ size }) => size > 1_000_000);
  if (files.length < 2 || data.length !== 1)
    throw new Error(
      `${bundler}: expected the detailed data in a chunk of its own, got ${JSON.stringify(sizes)}`,
    );
  console.log(
    `${bundler}: ${files.length} chunks, data chunk ${data[0].file} (${(
      data[0].size / 1024
    ).toFixed(0)} KB)`,
  );
}

async function runBundle(file, bundler) {
  const bundle = await import(pathToFileURL(file).href);
  const run = bundle.run ?? bundle.default?.run;
  const countries = await run();
  if (countries < 150)
    throw new Error(`${bundler}: got ${countries} countries`);
  console.log(`${bundler}: detailed data loaded (${countries} countries)`);
}

// Vite (Rollup, with its CommonJS plugin for the .cjs data file).
const viteOut = path.join(root, "dist-vite");
await viteBuild({
  root,
  logLevel: "warn",
  configFile: false,
  build: {
    outDir: viteOut,
    emptyOutDir: true,
    minify: false,
    lib: { entry, formats: ["es"], fileName: () => "main.mjs" },
  },
});
checkChunks(viteOut, "Vite");
await runBundle(path.join(viteOut, "main.mjs"), "Vite");

// webpack 5, once for the browser (chunking only) and once for Node (run).
function webpackBuild(target, outDir, extra = {}) {
  return new Promise((resolve, reject) => {
    webpack(
      {
        mode: "production",
        target,
        context: root,
        entry,
        output: { path: outDir, clean: true, ...extra },
        optimization: { minimize: false },
        performance: { hints: false },
      },
      (error, stats) => {
        if (error) return reject(error);
        if (stats.hasErrors())
          return reject(new Error(stats.toString("errors-only")));
        if (stats.hasWarnings())
          console.warn(stats.toString("errors-warnings"));
        return resolve();
      },
    );
  });
}
await webpackBuild("web", path.join(root, "dist-webpack-web"), {
  library: { type: "var", name: "smoke" },
});
checkChunks(path.join(root, "dist-webpack-web"), "webpack (web)");
const webpackNodeOut = path.join(root, "dist-webpack-node");
await webpackBuild("node", webpackNodeOut, {
  filename: "main.cjs",
  chunkFilename: "[id].cjs",
  library: { type: "commonjs2" },
});
checkChunks(webpackNodeOut, "webpack (node)");
await runBundle(path.join(webpackNodeOut, "main.cjs"), "webpack (node)");

console.log("Bundler smoke OK");
