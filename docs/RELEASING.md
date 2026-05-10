# Releasing

## Pipeline layout

The pipeline is split into **reusable** and **per-trigger** workflows so you can run and re-run steps clearly.

### Reusable workflow (shared logic)

| Workflow | Purpose |
| --- | --- |
| **Build and test** (`build-and-test.yml`) | Checkout → install → build package → pack + smoke test (CJS/ESM) → build website. Called by both CI and Release. |

### CI (on pull request to `main`)

| Job | Purpose |
| --- | --- |
| **Test (Node 18 / 20 / 22)** | Calls “Build and test” for each Node version. |
| **Lint** | Format check, typecheck, lint, spellcheck. |
| **Changeset status** | Runs `yarn changeset status --since=origin/main` (informational only). |

Jobs run in parallel. You can re-run any single job from the Actions run page.

### Release (manual only)

| Job | Purpose |
| --- | --- |
| **Validate (build + smoke + website)** | Calls “Build and test” with Node 20. Must pass before publish. |
| **Publish to npm** | Runs only if not dry run: version check → verify package README → `npm publish`. |
| **GitHub Release** | Runs only after publish: create release and tag. |
| **Dry run summary** | Runs only when dry run is checked; adds a short summary. |

Release is triggered from **Actions → “Release” → Run workflow**. It does **not** run on push to `main`.

---

## Before you release

1. **Changelog and version**

   - In PRs that change the library, run `yarn changeset`, choose bump type, add a summary.
   - Run `yarn generate:readme` whenever package-facing README content changes.
   - When ready to release: run **`yarn version`** at the repo root. This consumes changesets, bumps `lib/package.json`, and updates `lib/CHANGELOG.md`.
   - Commit and push the version and changelog to `main`.
   - The npm package publishes `lib/README.md`, which is generated from the marked npm section in `README.md`.
   - If the optional regions package changes, verify `regions/README.md`, `regions/CHANGELOG.md`, `regions/package.json`, `targetRegionCountries`, and `npm pack --dry-run ./regions` before publishing.
   - For region data changes, follow `CONTRIBUTING.md` and verify the recorded coverage counts and source notes in `docs/map-data-policy.md`, `docs/map-data-overrides.json`, `regions/README.md`, and `CONTRIBUTING.md`.
   - Record `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./lib` and `npm --cache /private/tmp/npm-cache-codex pack --dry-run ./regions` output when generated region data changes. Latest region-data validation for the 23-country optional package: optional `@react-svg-worldmap/regions@2.1.0` includes README, CHANGELOG, license, contributing guidance, code of conduct, built JS, and type outputs. Latest gradual-disclosure validation for the core package: reduced country tier is 1,574,896 bytes source with `4000` quantization and 91.0% source reduction; detailed country tier is 2,430,645 bytes source with `10000` quantization and 86.1% source reduction. Latest zoom-control and rendering-layer validation for `react-svg-worldmap@2.1.0` keeps the core package near the previous 1.2 MB packed dry-run size after staged zoom rendering, explicit SVG layer order, bottom-right plus/minus controls, country-border strengthening for visible regions, and concise `Region, Country` region hover labels. Parse-guard tests validate the reduced tier is parsed on initial imports while the detailed tier remains unparsed until the `2x` loading path, and region provider tests validate optional region loading is deferred until `4x`. Package contents remain README, package metadata, built JS, and type outputs with no hosted tile, Google Maps, raster basemap, or other runtime map-service dependency added.
   - If bundled map geometry changes, rerun the documented topology generator, review `docs/map-data-policy.md` and `docs/map-data-overrides.json`, and record validation output including source path, country count, coordinate count, precision, optimization settings, quality-budget fixture results, and package-size impact.

2. **npm Trusted Publishing (one-time setup)**
   - Publishing uses [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No long-lived token or 2FA code needed in CI.
   - On [npm](https://www.npmjs.com/) → your package **react-svg-worldmap** → **Packages** → **react-svg-worldmap** → **Settings** → **Trusted publishing** → **Add trusted publisher** → **GitHub Actions**.
   - Set **Workflow filename** to exactly: **`release.yml`** (must match `.github/workflows/release.yml`). Save.
   - (Optional) Under **Publishing access**, you can set “Require two-factor authentication and disallow tokens” so only this workflow can publish.

---

## Release steps

1. Merge release-ready PRs to `main` (with changesets if needed).
2. On `main`, run **`yarn version`**, then commit and push.
3. In GitHub: **Actions → “Release” → Run workflow**.
4. (Optional) Check **Dry run** and run once. Only the **Validate** job runs; use this to confirm the pipeline is green.
5. Run again **without** dry run. Validate runs first; if it passes, Publish runs (and will fail if the version is already on npm), then GitHub Release runs.
6. After a successful run, the package is on npm and a GitHub Release is created.

---

## Control and re-runs

- **Publish and release run only when you start “Release” manually.**
- **Dry run** runs only Validate (same checks as CI).
- **Version check** in Publish prevents publishing an already-published version.
- You can **re-run individual jobs** (e.g. only Publish or only GitHub Release) from the workflow run page if needed.
