import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Globals: true makes expect/describe/it/vi available without imports —
    // required by @testing-library/jest-dom which calls expect.extend()
    // in its setup module before any test file is evaluated.
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        // Large TopoJSON data file — no logic to test
        "src/countries.topo.ts",
        // Pure TypeScript type declarations — no runtime code to cover
        "src/types.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    // Allow NodeNext-style .js imports to resolve to .ts/.tsx source files
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
});
