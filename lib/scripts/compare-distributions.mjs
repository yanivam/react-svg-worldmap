import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const libRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const esmEntry = path.join(libRoot, "dist/index.js");
const cjsEntry = path.join(libRoot, "dist/index.cjs");

function fail(message) {
  console.error(`[compare-distributions] ${message}`);
  process.exit(1);
}

function getComponent(moduleNamespace) {
  return (
    (moduleNamespace &&
      moduleNamespace.__esModule &&
      moduleNamespace.default) ||
    moduleNamespace.default ||
    moduleNamespace.WorldMap ||
    moduleNamespace
  );
}

function comparableExportKeys(moduleNamespace) {
  return Object.keys(moduleNamespace)
    .filter((key) => !["__esModule", "default"].includes(key))
    .sort();
}

const esm = await import(pathToFileURL(esmEntry).href);
const cjs = require(cjsEntry);
const esmComponent = getComponent(esm);
const cjsComponent = getComponent(cjs);

if (typeof esmComponent !== "function") {
  fail(
    `ESM default export should be a component function, got ${typeof esmComponent}`,
  );
}
if (typeof cjsComponent !== "function") {
  fail(
    `CJS export should resolve to a component function, got ${typeof cjsComponent}`,
  );
}

const esmKeys = comparableExportKeys(esm);
const cjsKeys = comparableExportKeys(cjs);
if (JSON.stringify(esmKeys) !== JSON.stringify(cjsKeys)) {
  fail(`Export keys differ. ESM=${esmKeys.join(",")} CJS=${cjsKeys.join(",")}`);
}

if (JSON.stringify(esm.regions) !== JSON.stringify(cjs.regions)) {
  fail("Named export `regions` differs between ESM and CJS builds");
}

const props = {
  data: [
    { country: "US", value: 100 },
    { country: "CA", value: 50 },
    { country: "BR", value: "sample" },
  ],
  size: "sm",
  title: "Distribution comparison",
  color: "#4f83cc",
  backgroundColor: "#A0D7EB",
  borderColor: "#607d86",
};
const esmMarkup = renderToStaticMarkup(
  React.createElement(esmComponent, props),
);
const cjsMarkup = renderToStaticMarkup(
  React.createElement(cjsComponent, props),
);

if (esmMarkup !== cjsMarkup) {
  fail(
    [
      "Static render output differs between ESM and CJS builds",
      `ESM length: ${esmMarkup.length}`,
      `CJS length: ${cjsMarkup.length}`,
    ].join("\n"),
  );
}

console.log(
  JSON.stringify(
    {
      exportKeys: esmKeys,
      regions: esm.regions.length,
      markupLength: esmMarkup.length,
      status: "ESM and CJS distributions match",
    },
    null,
    2,
  ),
);
