# Feature Specification: Shared Core Map Assets

**Feature Branch**: `006-shared-map-assets`  
**Created**: 2026-05-10  
**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Smaller Core Package Without New Required Packages (Priority: P1)

A package consumer installs the core world map package and gets the same country-level map behavior with a smaller published artifact footprint. Country map data remains included in the core package so existing users do not need to install or configure another package.

**Why this priority**: The package currently ships large country geometry in both module outputs. Reducing duplicated data improves install size and reviewability without breaking the core promise that country maps work from the core package alone.

**Independent Test**: Can be tested by building and packing the core package, then confirming the package contents include the country-level map assets inside the same package, the packed and unpacked sizes improve against the current baseline, and existing import examples continue to render a country-only map.

**Acceptance Scenarios**:

1. **Given** a consumer installs only the core package, **When** they render an existing country-level map, **Then** the map renders without installing the optional regions package or any new country-map package.
2. **Given** the core package is packed for release, **When** the package contents are inspected, **Then** country-level map assets are present in the core package and are not duplicated unnecessarily across public module entry points.
3. **Given** a consumer uses the documented default import, named exports, or CommonJS require entry point, **When** they upgrade to this release, **Then** the same public entry points remain available.

---

### User Story 2 - Clear Published Source Map Policy (Priority: P2)

A package maintainer can produce release artifacts that either include source maps intentionally or avoid source-map references that point to unpublished files. Consumers should not see avoidable missing-source-map warnings from the package.

**Why this priority**: The current build creates large local source maps but does not publish them. The release artifact should be explicit and warning-free so consumers understand what debugging support is available.

**Independent Test**: Can be tested by packing and smoke-installing the package, then confirming the packed files do not reference missing source-map files unless those maps are intentionally included.

**Acceptance Scenarios**:

1. **Given** the package is packed for release, **When** a consumer inspects the published JavaScript files, **Then** source-map references are consistent with the files included in the package.
2. **Given** a consumer imports the package in a typical build or test environment, **When** warnings are collected, **Then** no warning is caused by missing package source-map files.

---

### User Story 3 - Risk And Performance Understanding Before Shipping (Priority: P3)

A maintainer can compare the new artifact structure against the current release baseline and understand compatibility, performance, and packaging risks before deciding whether to ship.

**Why this priority**: Changing package artifact layout can affect bundlers, module resolution, lazy loading, and debugging. The feature is only valuable if the team understands what can go wrong and has validation evidence.

**Independent Test**: Can be tested by reviewing a release-readiness report that records package sizes, import compatibility results, map rendering behavior, and any known tradeoffs or unresolved risks.

**Acceptance Scenarios**:

1. **Given** release validation is complete, **When** maintainers review the results, **Then** they can see before/after packed size, unpacked size, and user-visible behavior impact for the core package.
2. **Given** compatibility validation is complete, **When** maintainers review supported import paths and example builds, **Then** they can identify whether the feature is shippable or requires follow-up.
3. **Given** performance validation is complete, **When** maintainers compare map startup and zoom behavior to the current baseline, **Then** they can see whether loading shared map assets causes meaningful regressions.

### Edge Cases

- Consumers who install only the core package must not lose country-level map rendering.
- Consumers who also install the optional regions package must keep the same opt-in region behavior; region data must remain separate and optional.
- Existing ESM, CommonJS, TypeScript, website, and package smoke scenarios must continue to work.
- Server-side rendering and test environments must not fail because a shared map asset cannot be resolved.
- Lazy or shared map asset loading must report failures gracefully where the current map would otherwise render.
- The release package must not include large local debugging artifacts unless they are explicitly part of the source-map policy.
- If a size reduction approach improves unpacked size but worsens startup, zoom responsiveness, or consumer compatibility, the tradeoff must be documented before shipping.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The core package MUST continue to include country-level map data in the same published package.
- **FR-002**: The core package MUST NOT require consumers to install a new optional package for country-level maps.
- **FR-003**: The optional regions package MUST remain separate and optional.
- **FR-004**: Existing documented import and require entry points MUST continue to work without consumer code changes.
- **FR-005**: The release artifact MUST reduce unnecessary duplication of large country-level map data between public module entry points.
- **FR-006**: The release artifact MUST define and enforce a source-map policy: either publish referenced maps intentionally or remove references to maps that are not published.
- **FR-007**: The release artifact MUST avoid missing-source-map warnings in consumer build and test environments.
- **FR-008**: The package contents MUST be inspectable so maintainers can identify which files carry country-level map data and how much each contributes to packed and unpacked size.
- **FR-009**: Validation MUST compare current and proposed core package packed size, unpacked size, and package file count.
- **FR-010**: Validation MUST cover country-only rendering, zoomed detailed country rendering, and optional region rendering after the artifact changes.
- **FR-011**: Validation MUST cover both modern import usage and CommonJS require usage.
- **FR-012**: Validation MUST include the documentation website or equivalent example build that consumes the package through the workspace release shape.
- **FR-013**: Validation MUST identify startup, lazy-loading, or zoom responsiveness regressions that could be user-visible.
- **FR-014**: If shared map assets cannot be loaded in a supported environment, the package MUST fail in a diagnosable way rather than silently rendering incorrect geography.
- **FR-015**: Documentation MUST explain the package-size change, source-map policy, and backward-compatibility implications for consumers.
- **FR-016**: Release notes MUST describe whether this change is patch, minor, or major in consumer impact and why.
- **FR-017**: Maintainers MUST receive a shippability summary that lists known risks, mitigations, and any follow-up work before release.

### Constitution Requirements _(mandatory)_

- **CR-001**: Feature MUST preserve the project's MIT-compatible open-source distribution model and document any public API or package artifact changes.
- **CR-002**: Feature MUST identify whether map data, country/territory names, geopolitical boundaries, codes, disputed areas, or neutrality language are affected. If affected, requirements MUST reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **CR-003**: Feature MUST define testable behavior and quality validation needed to keep coverage above the project threshold and avoid hidden package, build, TypeScript, lint, test, dependency, or runtime warnings.
- **CR-004**: Feature MUST preserve documented SVG accessibility behavior and justify any new runtime dependency or bundle-size impact.
- **CR-005**: Feature MUST identify release, README generation, package export, semantic versioning, and consumer documentation impact when applicable.

### Key Entities _(include if feature involves data)_

- **Core Package Artifact**: The published package that consumers install for country-level maps; includes public entry points, type declarations, documentation, and country-level map assets.
- **Country Map Asset**: The bundled country-level reduced or detailed map data needed for the core map experience; remains inside the core package.
- **Source Map Policy**: The release rule that determines whether generated source maps are published, omitted, or dereferenced from published files.
- **Compatibility Scenario**: A representative consumer usage path, such as default import, named export import, CommonJS require, TypeScript type usage, website example build, and optional region provider usage.
- **Release Readiness Report**: A maintainer-facing summary of package sizes, compatibility results, performance observations, source-map behavior, and known risks.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The core package unpacked size is reduced by at least 25% from the current `10.5 MB` baseline while keeping country-level maps in the same package.
- **SC-002**: The core package packed size does not increase above the current `1.2 MB` baseline.
- **SC-003**: The package contents inspection shows no unnecessary duplicate copy of the same large country-level map data across public module entry points.
- **SC-004**: Existing documented import, require, and TypeScript consumption smoke tests pass without consumer code changes.
- **SC-005**: Country-only rendering, zoomed detailed-country rendering, and optional-region rendering all pass the existing representative behavior tests.
- **SC-006**: Published JavaScript files do not reference missing source-map files, or the referenced source maps are included intentionally and documented.
- **SC-007**: The documentation website or equivalent release example build completes with no package-size, module-resolution, source-map, or Browserslist warnings introduced by this feature.
- **SC-008**: Representative zoom responsiveness remains within the existing visible-feedback and completion targets recorded for the smooth zoom feature.
- **SC-009**: A release-readiness summary records at least three risk areas considered, including consumer module compatibility, map asset loading behavior, and debugging/source-map behavior.

## Assumptions

- The feature targets the core package artifact only; it does not move country-level maps to a new optional package.
- The optional regions package remains opt-in and continues to provide only region-level detail.
- Current public imports and package names are preserved.
- Size baselines are the latest dry-run figures from the `2.1.0` release cleanup: core package `1.2 MB` packed and `10.5 MB` unpacked.
- Map geometry content, naming, and neutrality policy are not expected to change; any accidental map-data change must be reviewed against `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- A shippable implementation may choose any package-internal asset layout that meets the compatibility and validation requirements.
