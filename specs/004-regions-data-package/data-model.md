# Data Model: Optional Regions Data Package

## Map Rendering Layer Stack

Represents the ordered SVG structure used by the core renderer.

Fields:

- `layerId`: Stable layer identifier. Values: `ocean`, `countries`, `regions`, `labels`, `pins`, `interaction-targets`.
- `order`: Numeric paint order. Lower values paint earlier.
- `responsibility`: One-line description of what the layer may render.
- `testId`: Stable DOM/test identifier for structural regression tests.

Validation rules:

- `ocean` MUST have the lowest order.
- `countries` MUST render after `ocean`.
- `regions` MUST render after `countries` and MUST NOT replace country fills or borders.
- `labels` and `pins` MUST render after map geometry.
- `interaction-targets` MUST align with visible country identity and geometry.

## Country Geometry Tier

Represents the generated country topology used at a zoom threshold.

Fields:

- `tier`: `reduced` or `detailed`.
- `minZoom`: Zoom threshold where the tier becomes eligible.
- `countryCode`: ISO-like country identifier used by the existing map data.
- `countryName`: Display name and title identity.
- `path`: Renderable closed SVG path.
- `bounds`: Projected bounds used for labels, fit, and pan/zoom constraints.

Validation rules:

- Reduced tier is used below `2x`.
- Detailed tier is used at or above `2x`.
- Country paths must be non-empty and closed enough to preserve sea/land visual separation.
- Russia, United States, Mexico, Nigeria, and Brazil must render in expected visible bounds and proportions.

## Region Package

Optional distributable artifact for first-level region data.

Fields:

- `packageName`: `@react-svg-worldmap/regions`.
- `version`: Package version.
- `license`: MIT.
- `coverageCatalog`: Country-level coverage records.
- `dataCollections`: Region collections by target country.

Validation rules:

- Publishes MIT license metadata and `LICENSE`.
- Does not add region data to the core package install path.
- Packed package remains below the documented compressed size target.

## Country Region Coverage

Country-level metadata for region availability.

Fields:

- `countryCode`: Stable country code.
- `countryName`: Country display name.
- `coverageStatus`: `complete`, `partial`, `experimental`, or `unavailable`.
- `expectedCount`: Expected first-level region count when known.
- `actualCount`: Records included in the package.
- `sourceNotes`: Reviewable source summary.

Validation rules:

- Every target country from FR-011 MUST be `complete`.
- Target countries MUST NOT appear as `partial`, `experimental`, or equivalent non-complete metadata.
- `expectedCount` and `actualCount` must match for target countries.

## Region Record

First-level official local government subdivision.

Fields:

- `id`: Stable package-local region identifier.
- `countryCode`: Parent country code.
- `name`: Region display name.
- `kind`: Local subdivision term where known, such as state, province, canton, department, emirate, territory, or equivalent.
- `path`: Renderable SVG boundary path in the map coordinate system.
- `sourceId`: Source feature identifier when available.

Validation rules:

- Path must be non-empty.
- Regions for a single-region country may be exposed without drawing misleading internal dotted boundaries.
- Dotted internal borders must render in the region overlay layer.

## AWS Location Pin

Example overlay data point for an AWS Region.

Fields:

- `regionCode`: AWS region code.
- `awsName`: AWS display name.
- `city`: Best-known city or fallback capital.
- `adminArea`: State, province, or equivalent when known.
- `country`: Country display name.
- `coordinates`: Longitude/latitude tuple.
- `precision`: `published-city`, `inferred-city`, `state-capital-fallback`, or `country-capital-fallback`.
- `locationPublished`: Whether the displayed pin location is published or inferred.
- `sourceUrl`: Official AWS Regions documentation URL.

Validation rules:

- Includes every AWS Region in the official documentation snapshot used by the package.
- Fallback labels must include `(location not published)`.
- Pins render above labels/map geometry and do not affect country hit targets.

## Country Hit Target Geometry

Interaction geometry and identity used for hover, tooltip, click, and accessibility behavior.

Fields:

- `countryCode`: Visible country identity.
- `countryName`: Visible country name.
- `path`: Pointer target path aligned with rendered country geometry.
- `title`: Accessible title or equivalent identity surface.

Validation rules:

- Hit target identity must match the rendered country path identity.
- Hovering United States, Mexico, Nigeria, Brazil, or unrelated country areas must not report Russia.
