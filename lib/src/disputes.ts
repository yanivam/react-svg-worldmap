import type { DisputeClassification, ISOCode } from "./types.js";

export const disputedTerritories = {
  crimea: {
    id: "crimea",
    name: "Crimea",
    tier: "tier-1",
    status: "disputed",
    recognizedSovereign: "Ukraine",
    controllingPower: "Russia",
    disputeParties: ["Ukraine", "Russia"],
    territories: ["Crimea"],
    sourceRationale:
      "United Nations General Assembly Resolution 68/262 affirms Ukraine's territorial integrity and treats Crimea's status as disputed.",
    unStanding:
      "UN General Assembly resolution 68/262 (2014) affirms Ukraine's territorial integrity within its internationally recognized borders and calls on states not to recognize any alteration of the status of Crimea.",
    display: {
      borderStyle: "dashed",
      labelStrategy: "metadata-only",
      tooltipLabel: "Crimea: disputed territory",
      defaultDescription:
        "Recognized baseline is Ukraine; current control is recorded separately.",
    },
    reviewStatus: "active",
  },
  "palestinian-territories": {
    id: "palestinian-territories",
    name: "Palestinian Territories",
    tier: "tier-1",
    status: "partially-recognized",
    disputeParties: ["Israel", "Palestine"],
    territories: ["West Bank", "Gaza"],
    sourceRationale:
      "The Palestinian Territories are widely treated as a recognition-sensitive case in United Nations processes and international diplomacy.",
    unStanding:
      "UN General Assembly resolution 67/19 (2012) accorded Palestine non-member observer State status. UN resolutions, including Security Council resolution 2334 (2016), refer to the West Bank, including East Jerusalem, and Gaza as occupied Palestinian territory.",
    display: {
      borderStyle: "dashed",
      labelStrategy: "segment",
      tooltipLabel: "Palestinian Territories: disputed or partially recognized",
      defaultDescription:
        "West Bank and Gaza should be distinguishable where the map scale supports it.",
    },
    reviewStatus: "active",
  },
  taiwan: {
    id: "taiwan",
    name: "Taiwan",
    tier: "tier-1",
    status: "politically-sensitive",
    controllingPower: "Taiwan",
    disputeParties: ["China", "Taiwan"],
    territories: ["Taiwan"],
    sourceRationale:
      "Taiwan is separately governed while its international status remains politically sensitive and contested.",
    unStanding:
      "UN General Assembly resolution 2758 (1971) recognized the representatives of the People's Republic of China as the only lawful representatives of China to the United Nations. Taiwan is not a UN member.",
    display: {
      borderStyle: "unchanged",
      labelStrategy: "metadata-only",
      tooltipLabel: "Taiwan: separately controlled, politically sensitive",
      defaultDescription:
        "Treat Taiwan as separately controlled without implying universal recognition.",
    },
    reviewStatus: "active",
  },
  kashmir: {
    id: "kashmir",
    name: "Kashmir",
    tier: "tier-1",
    status: "disputed",
    disputeParties: ["India", "Pakistan", "China"],
    territories: [
      "Jammu and Kashmir",
      "Azad Kashmir",
      "Gilgit-Baltistan",
      "Aksai Chin",
      "Siachen Glacier",
    ],
    sourceRationale:
      "Kashmir is a longstanding dispute involving India, Pakistan, and China, with United Nations involvement and divided control lines.",
    unStanding:
      "On the UN Security Council agenda as the India-Pakistan question since 1948 (resolution 47). The UN Military Observer Group in India and Pakistan (UNMOGIP) observes the ceasefire line.",
    display: {
      borderStyle: "dashed",
      labelStrategy: "segment",
      tooltipLabel: "Kashmir: disputed region",
      defaultDescription:
        "Represent control segments where the map scale and geometry support them.",
    },
    reviewStatus: "active",
  },
  "western-sahara": {
    id: "western-sahara",
    name: "Western Sahara",
    tier: "tier-1",
    status: "non-self-governing",
    disputeParties: ["Morocco", "Sahrawi Arab Democratic Republic"],
    territories: ["Western Sahara"],
    sourceRationale:
      "Western Sahara is listed through the United Nations decolonization framework as a non-self-governing territory.",
    unStanding:
      "Listed by the United Nations as a Non-Self-Governing Territory. The UN Mission for the Referendum in Western Sahara (MINURSO) was established by Security Council resolution 690 (1991).",
    display: {
      borderStyle: "dashed",
      labelStrategy: "single",
      tooltipLabel: "Western Sahara: disputed or non-self-governing territory",
      defaultDescription:
        "Avoid representing Western Sahara as ordinary undisputed Moroccan territory.",
    },
    reviewStatus: "active",
  },
  kosovo: {
    id: "kosovo",
    name: "Kosovo",
    tier: "tier-1",
    status: "partially-recognized",
    disputeParties: ["Kosovo", "Serbia"],
    territories: ["Kosovo"],
    sourceRationale:
      "Kosovo is partially recognized internationally and remains diplomatically disputed by Serbia.",
    unStanding:
      "UN Security Council resolution 1244 (1999) remains in force. Kosovo is not a UN member. The International Court of Justice advisory opinion of 2010 found that its declaration of independence did not violate international law.",
    display: {
      borderStyle: "dashed",
      labelStrategy: "single",
      tooltipLabel: "Kosovo: partially recognized state",
      defaultDescription:
        "Treat Kosovo as partially recognized rather than forcing a single universal recognition model.",
    },
    reviewStatus: "active",
  },
} as const satisfies Record<string, DisputeClassification>;

export type DisputeId = keyof typeof disputedTerritories;

export const disputeIds = Object.keys(disputedTerritories) as DisputeId[];

const disputesByCountryCode: Partial<Record<Uppercase<ISOCode>, DisputeId>> = {
  CN: "kashmir",
  EH: "western-sahara",
  IN: "kashmir",
  PK: "kashmir",
  PS: "palestinian-territories",
  TW: "taiwan",
  UA: "crimea",
  XK: "kosovo",
};

export function getDisputeById(
  id: DisputeId,
): (typeof disputedTerritories)[DisputeId] {
  return disputedTerritories[id];
}

export function getDisputeByCountryCode(
  countryCode: ISOCode,
): DisputeClassification | undefined {
  const disputeId =
    disputesByCountryCode[countryCode.toUpperCase() as Uppercase<ISOCode>];
  return disputeId == null ? undefined : disputedTerritories[disputeId];
}

export { disputesByCountryCode };
