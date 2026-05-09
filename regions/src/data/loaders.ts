import type { ISOCode, RegionCollectionRecord } from "react-svg-worldmap";

type RegionCollectionLoader = () => Promise<RegionCollectionRecord>;

export const regionCollectionLoaders: Record<string, RegionCollectionLoader> = {
  AE: () => import("./countries/AE.js").then((module) => module.regionCollection),
  AR: () => import("./countries/AR.js").then((module) => module.regionCollection),
  AT: () => import("./countries/AT.js").then((module) => module.regionCollection),
  AU: () => import("./countries/AU.js").then((module) => module.regionCollection),
  BA: () => import("./countries/BA.js").then((module) => module.regionCollection),
  BE: () => import("./countries/BE.js").then((module) => module.regionCollection),
  BR: () => import("./countries/BR.js").then((module) => module.regionCollection),
  CA: () => import("./countries/CA.js").then((module) => module.regionCollection),
  CH: () => import("./countries/CH.js").then((module) => module.regionCollection),
  DE: () => import("./countries/DE.js").then((module) => module.regionCollection),
  ET: () => import("./countries/ET.js").then((module) => module.regionCollection),
  FM: () => import("./countries/FM.js").then((module) => module.regionCollection),
  IN: () => import("./countries/IN.js").then((module) => module.regionCollection),
  IQ: () => import("./countries/IQ.js").then((module) => module.regionCollection),
  MX: () => import("./countries/MX.js").then((module) => module.regionCollection),
  MY: () => import("./countries/MY.js").then((module) => module.regionCollection),
  NG: () => import("./countries/NG.js").then((module) => module.regionCollection),
  PK: () => import("./countries/PK.js").then((module) => module.regionCollection),
  RU: () => import("./countries/RU.js").then((module) => module.regionCollection),
  SD: () => import("./countries/SD.js").then((module) => module.regionCollection),
  US: () => import("./countries/US.js").then((module) => module.regionCollection),
  VE: () => import("./countries/VE.js").then((module) => module.regionCollection),
  ZA: () => import("./countries/ZA.js").then((module) => module.regionCollection),
};

export async function loadRegionCollection(
  countryCode: ISOCode | string,
): Promise<RegionCollectionRecord | undefined> {
  return regionCollectionLoaders[countryCode.toUpperCase()]?.();
}

export async function loadRegionCollections(): Promise<
  Record<string, RegionCollectionRecord>
> {
  const entries = await Promise.all(
    Object.entries(regionCollectionLoaders).map(async ([countryCode, load]) => [
      countryCode,
      await load(),
    ] as const),
  );

  return Object.fromEntries(entries);
}
