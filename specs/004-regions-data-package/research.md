# Research: Optional Regions Data Package

## Decision: Define regions as first-level official subdivisions

Rationale: The feature request uses "regions" as a generic term for official local governments within a country. The 23 target countries use different first-level terms, including states, provinces, territories, cantons, departments, emirates, and equivalent local government subdivisions. First-level subdivisions give consumers a predictable layer that can be documented, validated, and extended country by country.

Alternatives considered:

- Include all local government levels: rejected because second-level counties, municipalities, and districts vary widely and would make label visibility, package size, and coverage expectations unclear.
- Use locally named concepts only: rejected because consumers need one generic API surface even when local names differ.

## Decision: Keep `@react-svg-worldmap/regions` as the optional package

Rationale: The workspace already contains an optional regions package with provider exports, package metadata, tests, and build tooling. Reusing it avoids adding a parallel package and keeps consumer migration focused on replacing placeholder data with real coverage.

Alternatives considered:

- Create a separate new package name: rejected because the existing package name already matches the requested optional data package role.
- Bundle region data in the core package: rejected because the core package must not grow for country-only consumers.

## Decision: Implement the exact 23-country first-level region coverage list

Rationale: The user provided the exact country list to break down by regions. Coverage must include United States, Canada, Mexico, Brazil, Argentina, Venezuela, Germany, Switzerland, Austria, Belgium, Bosnia and Herzegovina, Russia, India, Pakistan, United Arab Emirates, Malaysia, Iraq, Nigeria, Ethiopia, South Africa, Sudan, Australia, and Micronesia. These countries cover varied first-level subdivision terms and counts, so the coverage catalog, provider API, tests, and docs must avoid US-specific assumptions.

Alternatives considered:

- Keep only United States and Canada coverage: rejected because the requested target coverage list is broader and explicit.
- Attempt global first-level coverage in one release: rejected because source review, neutrality review, package size, and validation work should focus on the requested list.
- Encode United States-specific fields or examples as the general model: rejected because the package must support international first-level region terminology and country-specific expected counts.

## Decision: Store generated overlay paths in map-coordinate space

Rationale: The current core detail provider contract accepts renderable region paths, centroids, and bounds. Keeping region data in map-coordinate space makes the optional package simple for consumers and avoids requiring every runtime render to decode and project raw geographic data.

Alternatives considered:

- Ship raw GeoJSON only: rejected because it would move projection, sizing, and path conversion cost into every consuming map render.
- Ship both raw GeoJSON and projected paths: rejected for the starter package because it increases package size without a required consumer-facing benefit.

## Decision: Add or refine a repeatable region data generation workflow

Rationale: Real target coverage must be reviewable and reproducible. The package should record source summaries, expected region counts, coverage status, and generated output validation for every target country.

Alternatives considered:

- Hand-author region paths: rejected because real state/province boundaries are too numerous and error-prone for manual maintenance.
- Fetch remote map data at runtime: rejected because the library should remain offline and free of hosted map-service dependencies.

## Decision: Allow explicit partial or experimental status per target country

Rationale: The target list includes countries where source availability, boundary complexity, naming, and geopolitical sensitivity may vary. The package should still include coverage records for every target country, but source review may require `partial` or `experimental` status with review notes rather than overstating completeness.

Alternatives considered:

- Require every target country to be `complete` before any release: rejected because it can block useful reviewed coverage and encourages inaccurate completeness claims.
- Omit difficult target countries from coverage metadata: rejected because the user requested the exact target list and consumers need transparent status for every target country.

## Decision: Render region borders as dotted internal overlays

Rationale: Dotted borders visually separate internal region boundaries from international country boundaries and match the user request. Single-region countries should expose metadata without drawing fake internal subdivision lines.

Alternatives considered:

- Solid internal borders: rejected because they can be confused with country borders.
- Filled region choropleths: rejected for this feature because the requested value is boundary/name overlay on the existing country map.

## Decision: Reuse country-label placement concepts for region labels

Rationale: The existing map already has label visibility rules for country names. Region names should follow the same user expectation: show labels only when zoom and available area make them readable, and hide labels that would collide or crowd the map.

Alternatives considered:

- Always show every region name: rejected because dense regions and small screens would become unreadable.
- Show labels only in a side list: rejected because the requested overlay includes names on the map when zoom allows.

## Decision: Preserve core package default size and behavior

Rationale: The optional package is valuable only if country-only consumers do not pay for region data. Core changes should be limited to generic rendering/provider behavior that is already part of the map component surface.

Alternatives considered:

- Make the core package depend on the optional package: rejected because it violates the optional-package requirement.
- Auto-load region data by default: rejected because it changes default behavior and increases loaded data.

## Decision: Update zoom and sizing examples to import optional package data

Rationale: Examples are the consumer-facing proof that the optional package works. The current zoom example contains inline placeholder regions, and the sizing example does not demonstrate real region package usage. Sizing examples should stay focused on the map surface and code sample, so they must not render the visible below-map list of all regions.

Alternatives considered:

- Keep examples as placeholders until more countries exist: rejected because the request explicitly asks to use the new regions package now.
- Add a separate hidden example only: rejected because existing zoom and sizing examples are the requested surfaces.
- Keep the below-map region list in sizing examples: rejected because the user explicitly identified the printed list as unnecessary for sizing sample code.

## Decision: Treat region data as non-authoritative thematic map data

Rationale: Region boundaries and names can imply legal or administrative claims. The package must document sources, coverage status, review notes, and non-authoritative boundary language in the same spirit as the country map policy.

Alternatives considered:

- Present region boundaries as official/legal references: rejected by the project constitution and map-data policy.
- Omit source notes from package exports: rejected because maintainers and consumers need coverage transparency.
