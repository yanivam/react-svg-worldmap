---
"react-svg-worldmap": minor
---

Add Tier 1 geopolitical dispute metadata (Crimea, Palestinian Territories, Taiwan, Kashmir, Western Sahara, Kosovo). New exports: `disputedTerritories`, `disputeIds`, `disputesByCountryCode`, `getDisputeById`, `getDisputeByCountryCode`, and the `Dispute*` types. Callback context gains an optional `dispute` field for countries linked to a dispute. Metadata only: the default map geometry and rendering are unchanged. The map data policy now documents the Tier 1 scope, inclusion criteria, and review outcomes.
