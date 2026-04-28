import { describe, expect, it } from "vitest";

import {
  countryCityMetadata,
  getCountryCityMetadata,
} from "../countryCities.js";
import topoData from "../countries.topo.js";
import type { ISOCode } from "../types.js";

interface TopologyCountryGeometry {
  properties: {
    I: ISOCode;
  };
}

interface TopologyData {
  objects: {
    countries: {
      geometries: TopologyCountryGeometry[];
    };
  };
}

const countryGeometries = (topoData as unknown as TopologyData).objects
  .countries.geometries;

describe("country city metadata", () => {
  it("returns capital and largest city metadata for supported countries", () => {
    expect(getCountryCityMetadata("US")).toEqual(
      expect.objectContaining({
        capitalCity: "Washington, DC",
        largestCity: "New York City",
      }),
    );
  });

  it("accepts lowercase country codes", () => {
    expect(getCountryCityMetadata("us")?.capitalCity).toBe("Washington, DC");
  });

  it("covers every country code in the bundled topology", () => {
    const countryCodes = countryGeometries.map(
      (geometry) => geometry.properties.I,
    );

    for (const countryCode of countryCodes) {
      const metadata = getCountryCityMetadata(countryCode);

      expect(typeof metadata?.capitalCity).toBe("string");
      expect(typeof metadata?.largestCity).toBe("string");
    }
  });

  it("contains one metadata entry per bundled topology country", () => {
    expect(Object.keys(countryCityMetadata)).toHaveLength(
      countryGeometries.length,
    );
  });
});
