import { describe, it, expect } from "vitest";
import topoData from "../countries.topo.js";

type Arc = [number, number][];
type Ring = number[];
type Polygon = Ring[];
interface Geometry {
  type: "MultiPolygon";
  arcs: Polygon[];
  properties: { N: string; I: string };
}

const topology = topoData as {
  arcs: Arc[];
  objects: { countries: { geometries: Geometry[] } };
};
const { arcs } = topology;
const { geometries } = topology.objects.countries;

const arcIndex = (ref: number) => (ref < 0 ? ~ref : ref);

const findDuplicates = <T>(values: T[]) =>
  values.filter((value, i) => values.indexOf(value) !== i);

// A ring may start at any arc and run in either direction, so compare the
// lexicographically smallest rotation of both orientations.
const ringKey = (ring: Ring) => {
  const reversed = ring
    .slice()
    .reverse()
    .map((ref) => ~ref);
  const rotations = (r: Ring) =>
    r.map((_, i) => r.slice(i).concat(r.slice(0, i)).join(","));
  return [...rotations(ring), ...rotations(reversed)].sort((a, b) =>
    a.localeCompare(b),
  )[0];
};

const polygonKey = (polygon: Polygon) => polygon.map(ringKey).join("|");

describe("countries topology", () => {
  it("has unique ISO codes", () => {
    expect(findDuplicates(geometries.map((g) => g.properties.I))).toEqual([]);
  });

  it("has unique country names", () => {
    expect(findDuplicates(geometries.map((g) => g.properties.N))).toEqual([]);
  });

  it("has no polygon listed twice, within or across countries", () => {
    const owners = new Map<string, string[]>();
    for (const g of geometries) {
      g.arcs.forEach((polygon, i) => {
        const key = polygonKey(polygon);
        owners.set(key, [...(owners.get(key) ?? []), `${g.properties.I}#${i}`]);
      });
    }
    const duplicated = [...owners.values()].filter((o) => o.length > 1);
    expect(duplicated).toEqual([]);
  });

  it("has no zero-length arcs", () => {
    const zeroLength = arcs
      .map((arc, i) => ({ arc, i }))
      .filter(({ arc }) =>
        arc.every(([x, y]) => x === arc[0]![0] && y === arc[0]![1]),
      )
      .map(({ i }) => i);
    expect(zeroLength).toEqual([]);
  });

  it("has no consecutive repeated points within an arc", () => {
    const withRepeats = arcs
      .map((arc, i) => ({ arc, i }))
      .filter(({ arc }) =>
        arc.some(
          ([x, y], j) => j > 0 && x === arc[j - 1]![0] && y === arc[j - 1]![1],
        ),
      )
      .map(({ i }) => i);
    expect(withRepeats).toEqual([]);
  });

  it("references every arc", () => {
    const used = new Set(
      geometries.flatMap((g) => g.arcs.flat(2).map(arcIndex)),
    );
    const unused = arcs.map((_, i) => i).filter((i) => !used.has(i));
    expect(unused).toEqual([]);
  });
});
