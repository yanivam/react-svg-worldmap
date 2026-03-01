# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

## Adding a changeset (when you change the library)

1. Run **`yarn changeset`** at the repo root.
2. Choose the bump type (patch / minor / major) for `react-svg-worldmap`.
3. Write a short summary for the changelog; save the new file in `.changeset/`.

Commit the `.changeset/*.md` file(s) with your PR so the release has an entry when you version.

## Releasing (maintainer)

1. **Version**: run **`yarn version`** (runs `changeset version`).
   - Consumes all current changesets.
   - Bumps `lib/package.json` and updates `lib/CHANGELOG.md`.
2. Commit and push the version + changelog changes to `main`.
3. **Publish**: go to **Actions → "Release" → Run workflow**.
   - Step 1 (Validate) runs the same build + smoke + website as CI; then Publish and GitHub Release run.
   - Only run when you're happy with the release; it will not run on every push.
