# Feature Specification: Neutral Geopolitical Disputes

**Feature Branch**: `001-geopolitical-disputes`  
**Created**: 2026-04-27  
**Status**: Draft  

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand The Project's Geopolitical Position (Priority: P1)

As a map library consumer or contributor, I need a clear public policy explaining how the project handles disputed territories so I can understand that the map does not silently endorse one side of a dispute.

**Why this priority**: The project receives recurring geopolitical comments and cannot credibly resolve individual issues without a stable public standard.

**Independent Test**: Can be fully tested by reviewing the public policy and verifying that a reader can determine the baseline sources, dispute criteria, rejection criteria, and representation rules without asking a maintainer.

**Acceptance Scenarios**:

1. **Given** a user questions why Crimea is not treated as ordinary Russian territory, **When** they read the policy, **Then** they can see that disputed territories use recognized sovereignty, control, and dispute status as separate concepts.
2. **Given** a contributor proposes marking an entire recognized country as disputed without credible backing, **When** maintainers apply the policy, **Then** the request is rejected using documented criteria rather than an ad-hoc political argument.

---

### User Story 2 - Represent Credible Disputes Transparently (Priority: P2)

As a map library consumer, I need credible territorial disputes to be visible and explainable in map data and display guidance so users can distinguish undisputed borders from disputed areas.

**Why this priority**: The core user value is a world map that is useful without hiding ambiguity or treating disputed territories as ordinary undisputed geography.

**Independent Test**: Can be fully tested by selecting a known credible dispute and verifying that the territory has a dispute classification, named parties, source rationale, and display guidance that visibly differs from undisputed territory.

**Acceptance Scenarios**:

1. **Given** a territory with credible international dispute status, **When** map data is reviewed, **Then** the territory is marked as disputed and includes recognized sovereign, controlling power where relevant, dispute parties, and source rationale.
2. **Given** a disputed boundary is displayed, **When** a consumer applies the package's default guidance, **Then** the boundary is distinguishable from an undisputed boundary.

---

### User Story 3 - Review Geopolitical Contributions Consistently (Priority: P3)

As a maintainer, I need a repeatable review process for geopolitical changes so pull requests and issues can be accepted, redirected, or rejected consistently.

**Why this priority**: Clear governance reduces repeated debates, protects maintainer time, and makes decisions auditable for an open-source community.

**Independent Test**: Can be fully tested by evaluating sample proposals against the contribution rules and verifying that maintainers reach the expected outcome with documented reasoning.

**Acceptance Scenarios**:

1. **Given** a pull request adds metadata and visible dispute treatment for a credible dispute with authoritative sources, **When** maintainers review it, **Then** the change is eligible for acceptance if it follows the documented representation rules.
2. **Given** an issue requests recognition of an uninhabited or obscure feature as a disputed territory without credible diplomatic backing, **When** maintainers review it, **Then** the issue can be closed with a policy-based explanation.
3. **Given** a proposal asks the project to silently flip sovereignty from one claimant to another, **When** maintainers review it, **Then** the proposal is redirected toward explicit dispute representation or rejected.

### Edge Cases

- A territory has credible competing sovereignty claims but no clear current controlling power; the territory is still eligible for disputed classification with control listed as unknown or not applicable.
- A contributor cites only partisan advocacy, social media, or self-published claims; the claim is rejected unless backed by credible international, legal, treaty, or state-level evidence.
- A territory is partially recognized internationally but not universally recognized; it is classified distinctly from both fully recognized and ordinary disputed territories.
- A government or user demands a localized view that differs by viewer country; the initial feature provides a single neutral global view and documents localization as out of scope.
- Existing map data contains a disputed area represented as ordinary undisputed territory; the feature must provide a migration path that preserves current consumers' ability to render a map while exposing the new dispute status.
- Source references conflict; the feature must prefer documented project policy order and record the rationale for the chosen classification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST publish a geopolitical policy that states its neutral positioning, source hierarchy, dispute classification rules, rejection criteria, and maintenance process.
- **FR-002**: The project MUST use internationally recognized baselines as the default starting point for sovereignty decisions, while separately recording credible dispute and control information where relevant.
- **FR-003**: The project MUST distinguish at least these territory statuses: recognized, disputed, and partially recognized.
- **FR-004**: The project MUST record, for each disputed or partially recognized territory, the recognized sovereign where applicable, controlling power where applicable, dispute parties, source rationale, and public display guidance.
- **FR-005**: The project MUST provide a documented way for consumers to identify disputed territories from package-provided data without manually reading policy prose.
- **FR-006**: The project MUST provide default display guidance that makes disputed borders or areas visibly different from undisputed ones.
- **FR-007**: The project MUST avoid silently changing sovereignty for a disputed territory when the appropriate outcome is explicit dispute representation.
- **FR-008**: The project MUST document criteria for rejecting non-credible or fringe territorial claims, including claims lacking credible international, legal, treaty, diplomatic, or state-level backing.
- **FR-009**: The project MUST document contributor requirements for geopolitical pull requests and issues, including required justification, source evidence, affected territories, and expected display impact.
- **FR-010**: The project MUST provide maintainers with clear review outcomes for geopolitical proposals: accept, request evidence, redirect to dispute metadata/display treatment, reject as non-credible, or defer for periodic review.
- **FR-011**: The project MUST include examples showing credible disputes, partially recognized territories, and rejected fringe claims.
- **FR-012**: The project MUST document that the initial policy provides one neutral global representation and does not provide country-specific localized map views.
- **FR-013**: The project MUST make the policy and dispute data auditable so future contributors can see the reasoning behind classifications.
- **FR-014**: The project MUST preserve backwards-compatible ordinary country usage unless a consumer explicitly reads or displays dispute-specific information.

### Constitution Requirements *(mandatory)*

- **CR-001**: Feature MUST preserve the project's MIT-compatible open-source distribution model and document any public API or package artifact changes.
- **CR-002**: Feature MUST identify whether map data, country/territory names, geopolitical boundaries, codes, disputed areas, or neutrality language are affected. If affected, requirements MUST reference `docs/map-data-policy.md` and `docs/map-data-overrides.json`.
- **CR-003**: Feature MUST define testable behavior and quality validation needed to keep coverage above the project threshold and avoid hidden package, build, TypeScript, lint, test, dependency, or runtime warnings.
- **CR-004**: Feature MUST preserve documented SVG accessibility behavior and justify any new runtime dependency or bundle-size impact.
- **CR-005**: Feature MUST identify release, README generation, package export, semantic versioning, and consumer documentation impact when applicable.

### Key Entities *(include if feature involves data)*

- **Territory**: A geographic unit represented by the package, including its display name, optional standard code, status, and relationship to disputes or recognized sovereignty.
- **Dispute Classification**: The public determination that a territory is recognized, disputed, or partially recognized, with rationale and review status.
- **Sovereignty Claim**: A claim made by a recognized state or internationally relevant actor, including source evidence and whether it is accepted as credible for project purposes.
- **Control Information**: The separately recorded description of who currently controls a territory where that differs from recognized sovereignty or is material to user understanding.
- **Display Guidance**: The project-defined user-facing representation for a territory or boundary, including whether it should appear as ordinary, visibly disputed, or dual-labeled.
- **Geopolitical Proposal**: An issue or pull request requesting a change to boundaries, names, sovereignty, dispute status, or policy language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of territories newly classified as disputed or partially recognized include source rationale, dispute parties, and display guidance before release.
- **SC-002**: Maintainers can evaluate at least 10 representative geopolitical proposals, including credible and fringe examples, with the documented policy producing the expected review outcome in each case.
- **SC-003**: A consumer reviewing package documentation can identify how disputed territories are represented and how to opt into dispute-aware display behavior in under 5 minutes.
- **SC-004**: No known credible disputed territory included in the initial feature is represented only as an ordinary undisputed territory after release.
- **SC-005**: At least 90% of reviewed contributor feedback on geopolitical issues can be answered by linking to a specific policy section, data rationale, or contribution rule.
- **SC-006**: Existing consumers who do not use dispute-specific information can continue rendering ordinary world maps without changing their current usage.

## Assumptions

- The initial feature uses a single neutral global representation and intentionally excludes viewer-location-specific localized map variants.
- The project will rely on documented, credible public sources and project policy hierarchy rather than attempting to determine geopolitical truth independently.
- The initial disputed territory set may be limited to well-known, high-impact disputes, but the classification framework must support future additions.
- The policy should be explicit that the project does not endorse any geopolitical claim.
- Existing project documents named in the constitution, including `docs/map-data-policy.md` and `docs/map-data-overrides.json`, are the expected homes for map-data policy and overrides unless planning identifies a better documented location.
