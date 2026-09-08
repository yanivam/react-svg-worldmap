import type { DisputeClassification, ISOCode } from "./types.js";

export const disputedTerritories = {
  crimea: {
    id: "crimea", name: "Crimea", tier: "tier-1", status: "disputed",
    recognizedSovereign: "Ukraine", controllingPower: "Russia",
    disputeParties: ["Ukraine", "Russia"], territories: ["Crimea"],
    sourceRationale: "United Nations General Assembly Resolution 68/262 affirms Ukraine's territorial integrity and treats Crimea's status as disputed.",
    display: { borderStyle: "dashed", labelStrategy: "metadata-only", tooltipLabel: "Crimea: disputed territory", defaultDescription: "Recognized baseline is Ukraine; current control is recorded separately." },
    reviewStatus: "active",
  },
  "palestinian-territories": {
    id: "palestinian-territories", name: "Palestinian Territories", tier: "tier-1", status: "partially-recognized",
    disputeParties: ["Israel", "Palestine"], territories: ["West Bank", "Gaza"],
    sourceRationale: "The Palestinian Territories are widely treated as a recognition-sensitive case in United Nations processes and international diplomacy.",
    display: { borderStyle: "dashed", labelStrategy: "segment", tooltipLabel: "Palestinian Territories: disputed or partially recognized", defaultDescription: "West Bank and Gaza should be distinguishable where the map scale supports it." },
    reviewStatus: "active",
  },
  taiwan: {
    id: "taiwan", name: "Taiwan", tier: "tier-1", status: "politically-sensitive",
    controllingPower: "Taiwan", disputeParties: ["China", "Taiwan"], territories: ["Taiwan"],
    sourceRationale: "Taiwan is separately governed while its international status remains politically sensitive and contested.",
    display: { borderStyle: "unchanged", labelStrategy: "metadata-only", tooltipLabel: "Taiwan: separately controlled, politically sensitive", defaultDescription: "Treat Taiwan as separately controlled without implying universal recognition." },
    reviewStatus: "active",
  },
  kashmir: {
    id: "kashmir", name: "Kashmir", tier: "tier-1", status: "disputed",
    disputeParties: ["India", "Pakistan", "China"], territories: ["Jammu and Kashmir", "Azad Kashmir", "Gilgit-Baltistan", "Aksai Chin"],
    sourceRationale: "Kashmir is a longstanding dispute involving India, Pakistan, and China, with United Nations involvement and divided control lines.",
    display: { borderStyle: "dashed", labelStrategy: "segment", tooltipLabel: "Kashmir: disputed region", defaultDescription: "Represent control segments where the map scale and geometry support them." },
    reviewStatus: "active",
  },
  "western-sahara": {
    id: "western-sahara", name: "Western Sahara", tier: "tier-1", status: "non-self-governing",
    disputeParties: ["Morocco", "Sahrawi Arab Democratic Republic"], territories: ["Western Sahara"],
    sourceRationale: "Western Sahara is listed through the United Nations decolonization framework as a non-self-governing territory.",
    display: { borderStyle: "dashed", labelStrategy: "single", tooltipLabel: "Western Sahara: disputed or non-self-governing territory", defaultDescription: "Avoid representing Western Sahara as ordinary undisputed Moroccan territory." },
    reviewStatus: "active",
  },
  kosovo: {
    id: "kosovo", name: "Kosovo", tier: "tier-1", status: "partially-recognized",
    disputeParties: ["Kosovo", "Serbia"], territories: ["Kosovo"],
    sourceRationale: "Kosovo is partially recognized internationally and remains diplomatically disputed by Serbia.",
    display: { borderStyle: "dashed", labelStrategy: "single", tooltipLabel: "Kosovo: partially recognized state", defaultDescription: "Treat Kosovo as partially recognized rather than forcing a single universal recognition model." },
    reviewStatus: "active",
  },
} as const satisfies Record<string, DisputeClassification>;

export type DisputeId = keyof typeof disputedTerritories;
export const disputeIds = Object.keys(disputedTerritories) as DisputeId[];

const disputesByCountryCode: Partial<Record<Uppercase<ISOCode>, DisputeId>> = {
  CN: "kashmir", EH: "western-sahara", IN: "kashmir", PK: "kashmir",
  PS: "palestinian-territories", TW: "taiwan", UA: "crimea", XK: "kosovo",
};

export function getDisputeById(id: DisputeId): (typeof disputedTerritories)[DisputeId] {
  return disputedTerritories[id];
}

export function getDisputeByCountryCode(countryCode: ISOCode): DisputeClassification | undefined {
  const disputeId = disputesByCountryCode[countryCode.toUpperCase() as Uppercase<ISOCode>];
  return disputeId == null ? undefined : disputedTerritories[disputeId];
}

export { disputesByCountryCode };
