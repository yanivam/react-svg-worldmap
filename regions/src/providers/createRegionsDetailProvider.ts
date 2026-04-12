import type { DetailProvider } from "../types.js";

export function createRegionsDetailProvider(): DetailProvider {
  return {
    supports() {
      return false;
    },
    async loadRegions() {
      return {
        status: "unavailable",
        layer: "regions",
        detailLevel: "regions",
      };
    },
  };
}
