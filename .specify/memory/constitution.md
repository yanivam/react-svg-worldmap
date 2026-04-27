<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Placeholder principle 1 -> I. Open Source Stewardship
- Placeholder principle 2 -> II. Political and Geopolitical Neutrality
- Placeholder principle 3 -> III. Quality Gates Are Non-Negotiable
- Placeholder principle 4 -> IV. Accessible, Lightweight React Library
- Placeholder principle 5 -> V. Release Integrity and Compatibility
Added sections:
- Project Constraints
- Development Workflow and Review Gates
Removed sections:
- Placeholder SECTION_2_NAME
- Placeholder SECTION_3_NAME
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/extensions/git/commands/*.md reviewed; no update needed
- ✅ README.md reviewed; no update needed
- ✅ docs/map-data-policy.md reviewed; no update needed
Follow-up TODOs: None
-->

# react-svg-worldmap Constitution

## Core Principles

### I. Open Source Stewardship

`react-svg-worldmap` MUST remain usable, inspectable, and maintainable as an
open-source package. Public APIs, generated package contents, documentation,
examples, and release notes MUST make user-visible behavior clear enough for
external contributors and downstream consumers to review without private
context. Contributions MUST preserve the MIT-licensed project model and MUST
not add dependencies, generated assets, or licensing terms that make the package
harder to redistribute under the published license.

Rationale: This project is a public npm package. Users need transparent source,
repeatable builds, and contribution paths that do not depend on maintainer-only
knowledge.

### II. Political and Geopolitical Neutrality

Map data, country names, region handling, and documentation MUST avoid implying
legal, diplomatic, or sovereignty endorsement. Changes that affect countries,
territories, borders, names, codes, disputed areas, or recognition-sensitive
cases MUST follow `docs/map-data-policy.md` and update
`docs/map-data-overrides.json` when the policy decision is case-specific. The
default map MUST be described as a small-scale thematic visualization, not as an
authoritative boundary reference.

Rationale: A world map component can unintentionally make political claims.
Neutrality requires documented sources, reviewable overrides, and careful
language whenever geopolitical content changes.

### III. Quality Gates Are Non-Negotiable

Code changes MUST pass formatting, linting, type checking, unit tests, package
build, package smoke tests, website build when affected, and coverage checks
before merge or release. Coverage MUST stay above 80% for lines, functions,
branches, and statements; the repository MAY enforce stricter thresholds, and
contributors MUST not lower them to pass a change. Warnings from package
managers, builds, tests, TypeScript, linting, unsupported runtimes, deprecated
dependencies, or peer dependency resolution MUST be resolved or explicitly
documented with a maintainer-approved rationale.

Rationale: This package is consumed by other applications. Hidden warnings,
unsupported dependencies, or untested behavior become downstream defects.

### IV. Accessible, Lightweight React Library

The component MUST stay focused on client-side SVG thematic visualization for
React. Public behavior MUST preserve accessibility responsibilities documented
for the SVG output, including meaningful titles and compatibility with host page
landmarks. New features MUST avoid heavyweight runtime services, hosted map API
dependencies, or avoidable bundle growth unless the plan documents why the
library's core use case cannot be met otherwise.

Rationale: The package's value is a simple, bundled, accessible map component
that works without a map platform dependency.

### V. Release Integrity and Compatibility

Published artifacts MUST match the documented package API: ESM, CJS, TypeScript
declarations, README content, and npm package contents MUST be generated and
verified before release. Breaking API, peer dependency, runtime support, or map
policy changes MUST use an appropriate semantic version change and include
consumer-facing documentation. Generated docs such as `lib/README.md` MUST stay
in sync with their source files.

Rationale: Consumers rely on package metadata, module formats, and docs matching
the release they install.

## Project Constraints

The repository is a Yarn workspace with `lib` as the published React package
and `website` as the documentation and examples site. Node `>=18` is the
minimum supported development and package runtime baseline unless a future
governance amendment changes it.

Feature plans MUST identify whether a change affects the published package,
website, map data policy, release process, or generated documentation. Plans
that touch map geometry or geopolitical naming MUST include a neutrality review.
Plans that touch package outputs MUST include build, packaging, and smoke-test
validation.

Dependencies MUST be justified by package value, maintenance status, license
compatibility, bundle impact, and support window. Out-of-support or deprecated
components MUST be replaced, upgraded, or documented with an explicit migration
plan before release.

## Development Workflow and Review Gates

Every feature specification MUST include independently testable user scenarios
and measurable success criteria. Code-bearing tasks MUST include tests unless
the plan documents that the change is documentation-only, generated-only, or
otherwise has no executable behavior.

Every implementation plan MUST pass a Constitution Check before design work and
again before implementation. The check MUST cover open-source compatibility,
geopolitical neutrality impact, quality gates, accessibility and bundle impact,
and release integrity.

Every pull request or release candidate MUST run the relevant commands from the
repository scripts, including `yarn build`, `yarn lint`, `yarn typecheck`,
`yarn format-check`, `yarn spellcheck`, and `yarn test:coverage` when code or
testable behavior changes. Generated README updates MUST be verified with
`yarn generate:readme` and a clean diff for the generated file.

## Governance

This constitution supersedes conflicting project practices, feature plans, and
task templates. Amendments require a documented change to this file, a Sync
Impact Report, and updates to affected Spec Kit templates or runtime guidance.

Versioning follows semantic versioning for governance:

- MAJOR: Removes or redefines a core principle or weakens a mandatory gate.
- MINOR: Adds a principle, section, required review area, or materially expands
  governance requirements.
- PATCH: Clarifies language without changing obligations.

Compliance review is required during specification, planning, implementation,
and release validation. A change that cannot satisfy a principle MUST document
the violation, rejected alternatives, mitigation plan, and maintainer approval
before implementation proceeds.

**Version**: 1.0.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
