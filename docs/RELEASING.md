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
| **Publish to npm** | Runs only if not dry run: version check → copy README → `npm publish`. |
| **GitHub Release** | Runs only after publish: create release and tag. |
| **Dry run summary** | Runs only when dry run is checked; adds a short summary. |

Release is triggered from **Actions → “Release” → Run workflow**. It does **not** run on push to `main`.

---

## Before you release

1. **Changelog and version**

   - In PRs that change the library, run `yarn changeset`, choose bump type, add a summary.
   - When ready to release: run **`yarn version`** at the repo root. This consumes changesets, bumps `lib/package.json`, and updates `lib/CHANGELOG.md`.
   - Commit and push the version and changelog to `main`.

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
