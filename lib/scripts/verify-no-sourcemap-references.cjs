const fs = require("fs");
const path = require("path");

const libRoot = path.resolve(__dirname, "..");
const files = ["dist/index.js", "dist/index.cjs"];

for (const file of files) {
  const fullPath = path.join(libRoot, file);
  const content = fs.readFileSync(fullPath, "utf8");

  if (content.includes("sourceMappingURL")) {
    console.error(`[verify-no-sourcemap-references] ${file} references a map.`);
    process.exit(1);
  }
}

console.log("[verify-no-sourcemap-references] Published JS has no map refs.");
