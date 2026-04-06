# Neutral Map Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a neutral map data policy, a reviewable overrides register, and updated public documentation for the package's default world map.

**Architecture:** Keep the bundled geometry unchanged in this branch and focus on policy-first maintainership. Store the written policy in docs, keep a machine-readable register of sensitive cases in the repo, and update package-facing documentation to describe the new source hierarchy and disclaimer.

**Tech Stack:** Markdown, JSON, Yarn workspace repo documentation

---

### Task 1: Add the policy design artifacts

**Files:**

- Create: `docs/superpowers/specs/2026-04-04-neutral-map-policy-design.md`
- Create: `docs/superpowers/plans/2026-04-04-neutral-map-policy.md`

- [ ] **Step 1: Write the policy spec**

Create `docs/superpowers/specs/2026-04-04-neutral-map-policy-design.md` with:

```md
# Neutral Map Policy Design

## Goal

Define a neutral, reviewable map data policy for `react-svg-worldmap`.
```

- [ ] **Step 2: Write the implementation plan**

Create `docs/superpowers/plans/2026-04-04-neutral-map-policy.md` with this plan header and task structure.

- [ ] **Step 3: Verify the files exist**

Run: `find docs/superpowers -maxdepth 3 -type f | sort` Expected: both new files appear in the output

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-04-neutral-map-policy-design.md docs/superpowers/plans/2026-04-04-neutral-map-policy.md
git commit -m "docs: add neutral map policy design artifacts"
```

### Task 2: Add the maintainer policy and overrides register

**Files:**

- Create: `docs/map-data-policy.md`
- Create: `docs/map-data-overrides.json`

- [ ] **Step 1: Write the policy document**

Create `docs/map-data-policy.md` with sections for source hierarchy, disclaimer, dispute handling, maintenance workflow, and references.

- [ ] **Step 2: Write the overrides register**

Create `docs/map-data-overrides.json` with a top-level `version`, `defaultRepresentation`, `sourceHierarchy`, and `cases` array.

- [ ] **Step 3: Validate the JSON file**

Run: `node -e "JSON.parse(require('fs').readFileSync('docs/map-data-overrides.json','utf8')); console.log('ok')"` Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add docs/map-data-policy.md docs/map-data-overrides.json
git commit -m "docs: add map data neutrality policy"
```

### Task 3: Update public documentation

**Files:**

- Modify: `README.md`
- Modify: `lib/README.md`

- [ ] **Step 1: Update the root README**

Add a short section that links readers to `docs/map-data-policy.md`.

- [ ] **Step 2: Update the library README**

Replace the old single-source wording with:

```md
## Map Data Policy

The default map in `react-svg-worldmap` is a small-scale thematic visualization.
```

Include the source hierarchy, the neutrality disclaimer, and the corrected Natural Earth Admin 0 link.

- [ ] **Step 3: Run repo checks**

Run: `yarn lint` Expected: exit code `0` with the existing warnings only

- [ ] **Step 4: Commit**

```bash
git add README.md lib/README.md
git commit -m "docs: document neutral world map policy"
```

### Task 4: Verify the branch state

**Files:**

- Test: `docs/map-data-policy.md`
- Test: `docs/map-data-overrides.json`
- Test: `README.md`
- Test: `lib/README.md`

- [ ] **Step 1: Re-run lint**

Run: `yarn lint` Expected: pass with the existing warnings only

- [ ] **Step 2: Re-run tests for regression awareness**

Run: `yarn test` Expected: the existing single failure in `lib/src/__tests__/utils.test.ts:179` remains; no new documentation-related failures appear

- [ ] **Step 3: Review the diff**

Run: `git diff -- docs/map-data-policy.md docs/map-data-overrides.json README.md lib/README.md docs/superpowers/specs/2026-04-04-neutral-map-policy-design.md docs/superpowers/plans/2026-04-04-neutral-map-policy.md` Expected: only the planned policy and documentation changes appear

- [ ] **Step 4: Commit**

```bash
git add README.md lib/README.md docs/map-data-policy.md docs/map-data-overrides.json docs/superpowers/specs/2026-04-04-neutral-map-policy-design.md docs/superpowers/plans/2026-04-04-neutral-map-policy.md
git commit -m "docs: establish neutral map data policy"
```
