<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Principles: Initial adoption — Progressive Capability Tiers; Offline-First Core;
  Bundle Size Discipline; Accessibility First; Zero Backend Dependencies;
  Props-Based Extensibility Only; Generic Type Safety; Dual Package Compatibility;
  SSR Safety; BEM Class Naming; Performance via Stability; Test Colocation and
  Coverage; Documentation Parity
- Added sections: Technology Stack & Quality Gates; File Naming Conventions &
  Repository Layout
- Removed sections: None (replaced template placeholders)
- Templates: .specify/templates/plan-template.md — ✅ updated (Constitution Check);
  .specify/templates/spec-template.md — ✅ updated (library alignment);
  .specify/templates/tasks-template.md — ✅ updated (paths, test policy);
  .specify/templates/commands/*.md — ⚠ not present (no updates)
- Follow-up TODOs: None
-->

# react-svg-worldmap Constitution

**react-svg-worldmap** is a published React component library that renders interactive, accessible SVG world maps using **d3-geo** and **topojson-client**. The repository is a **Yarn workspace** monorepo: **`lib`** (the published npm package) and **`website`** (a Docusaurus documentation site).

## Core Principles

### I. Progressive Capability Tiers

Make simple things simple and complex things possible. The core rendering path — a colored world map from a country-value array — MUST work with a single prop (`data`) and zero required configuration. Advanced capabilities (custom projections, zoom/pan, tooltips, click handlers, style functions) MUST be opt-in and additive. No feature in an advanced tier MAY increase the complexity or required props of the basic tier.

_Rationale_: Consumers should adopt the library for the default case without reading lengthy API docs or supplying boilerplate.

### II. Offline-First Core

All functionality required to render a basic map MUST be available with no network connectivity. Geographic data (e.g. `countries.topo.ts`) MUST be bundled with the library. The library MUST NOT initiate network requests. Features that genuinely need external data (e.g. live datasets) are out of scope for the library and MUST be documented as the consumer’s responsibility.

_Rationale_: Predictable behavior in air-gapped and offline environments matches product positioning and avoids hidden runtime dependencies.

### III. Bundle Size Discipline

The core render path MUST remain lightweight. Peer dependencies (`react`, `react-dom`, `d3-geo`, `topojson-client`) MUST NOT be bundled. Every new dependency MUST be justified against bundle-size cost. Heavy optional capabilities MUST be evaluated for tree-shaking or lazy-loading before inclusion.

_Rationale_: The library is pulled into applications where bundle weight directly affects load time and UX.

### IV. Accessibility First

Every component MUST meet **WCAG 2.2 AA** at the component level. SVG elements MUST have appropriate `role`, `aria-labelledby` or `aria-label`, and `<title>` children as required by the pattern. Interactive regions MUST support keyboard navigation (Tab, Enter/Space, +/- for zoom where applicable). Focus and hover states MUST stay synchronized.

_Rationale_: Maps are visualizations; keyboard and assistive-tech users must not be excluded. Page-level landmarks remain the host app’s responsibility (see README).

### V. Zero Backend Dependencies

The library MUST NOT perform runtime calls to external APIs or servers. There MUST be no `fetch`, no async data loading inside the library, and no telemetry or “phone home” behavior.

_Rationale_: Security, privacy, and deterministic behavior in all deployment contexts.

### VI. Props-Based Extensibility Only

Behavior MUST be customized via callback props (`styleFunction`, `tooltipTextFunction`, `hrefFunction`, `onClickFunction`, etc.). The library MUST NOT use React Context, Redux, Zustand, or other global state for customization. Local component state (`useState`) is allowed for ephemeral UI (zoom, pan, hover).

_Rationale_: Predictable composition and tree-shaking-friendly APIs without implicit wiring.

### VII. Generic Type Safety

The main component and its data types MUST remain generic over `T extends number | string`. Callbacks MUST receive fully typed `CountryContext<T>`. Types MUST NOT be widened unnecessarily.

_Rationale_: Consumers get accurate inference and catch mistakes at compile time.

### VIII. Dual Package Compatibility

All code MUST remain compatible with both **ESM** and **CJS** consumers. Use **tslib** helpers. Avoid top-level await. Peer dependencies MUST NOT be bundled.

_Rationale_: Broad ecosystem compatibility without duplicate dependency copies.

### IX. SSR Safety

Hooks that access browser APIs (`window`, `ResizeObserver`, layout measurements) MUST use `useIsomorphicLayoutEffect` or equivalent guards. There MUST be no direct `window` / `document` access at module evaluation time.

_Rationale_: Safe rendering in Next.js, Remix, and other SSR environments.

### X. BEM Class Naming

CSS class names MUST follow **BEM**: block `worldmap`, elements `__`, modifiers `--`. Dynamic values MUST use inline `CSSProperties`; structural styles MUST use class names.

_Rationale_: Predictable styling hooks for consumers and consistent overrides.

### XI. Performance via Stability

Tooltip trigger refs MUST be stable across renders. `ResizeObserver` callbacks MUST be deferred via `requestAnimationFrame`. Expensive derived values (style functions, country maps) MUST use `useMemo` where appropriate.

_Rationale_: Avoids jank, unnecessary layout, and redundant work on each render.

### XII. Test Colocation and Coverage

Tests MUST live under `lib/src/__tests__/`. Every new component or utility MUST have a test file (`*.test.ts` or `*.test.tsx`). Coverage MUST NOT drop below **70%** lines, functions, and statements, and **60%** branches, before merge. Layout-dependent libraries (e.g. `react-path-tooltip`) MUST be mocked in tests.

_Rationale_: Regressions are caught early; thresholds match `vitest` configuration.

### XIII. Documentation Parity

Every new prop or behavior MUST have a corresponding **Docusaurus** example under `website/`. Public API documentation MUST stay in sync with `types.ts` (and published types).

_Rationale_: npm consumers and site readers see the same contract.

## Technology Stack & Quality Gates

| Area | Requirement |
| --- | --- |
| Language | **TypeScript 4.7+**, `strict` mode. No `any` except at unavoidable TopoJSON decode boundaries, with explicit `eslint-disable` and comment. |
| Framework | **React 16.8+**; hooks only; no class components; no HOCs. |
| Bundler | **tsup**: dual **ESM** (`index.js`) and **CJS** (`index.cjs`), declarations, source maps. |
| Tests | **Vitest** with **@testing-library/react** and **jsdom**; thresholds as in Principle XII. |
| Lint / format | **ESLint** (@typescript-eslint, jsx-a11y), **Prettier**, **cspell**; **Husky** pre-commit enforces all three. |
| Versioning | **Changesets** — every change that needs a release MUST have a changeset entry before merge. |

## File Naming Conventions & Repository Layout

| Kind | Convention |
| --- | --- |
| Components | PascalCase files and exports (e.g. `Region.tsx`, `Frame.tsx`). |
| Hooks | camelCase with `use` prefix (e.g. `useContainerWidth.ts`). |
| Constants | `SCREAMING_SNAKE_CASE` in `constants.ts`. |
| Types | Interfaces and types in `types.ts`; no complex inline types in components. |
| Tests | `*.test.tsx` or `*.test.ts` under `lib/src/__tests__/`. |
| Sub-components | `components/` subdirectory; orchestration stays in `index.tsx`. |
| Packages | `lib/` — published package; `website/` — docs and examples. |

## Governance

This constitution supersedes ad-hoc practices for **react-svg-worldmap** when they conflict. Amendments MUST be recorded in `.specify/memory/constitution.md` with an updated **Sync Impact Report**, version bump, and **Last Amended** date. **Semantic versioning** applies: **MAJOR** — incompatible principle removals or redefinitions; **MINOR** — new principles or materially expanded guidance; **PATCH** — clarifications and non-semantic edits.

**Compliance**: Pull requests MUST verify alignment with Core Principles and technology gates. Reviewers SHOULD use this file and `README.md` for runtime expectations (e.g. accessibility split with host apps). Release-blocking items include: Changesets when needed, tests and coverage for `lib/` changes, and documentation parity for API changes.

**Version**: 1.0.0 | **Ratified**: 2025-03-23 | **Last Amended**: 2025-03-23
