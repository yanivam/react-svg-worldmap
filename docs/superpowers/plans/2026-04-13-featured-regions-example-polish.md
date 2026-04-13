# Featured Regions Example Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class regions showcase example, fix label placement during zoom and drill-down, and replace the current zoom controls with an accessible 3-part in-map control.

**Architecture:** Keep the changes phase-1-sized by extending the existing drill-down map instead of introducing a new map shell. The core library will own label positioning and zoom control semantics, while the website only adds a featured example and reorders examples navigation/docs.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Docusaurus

---

### Task 1: Lock the desired zoom-control and label behavior in tests

**Files:**

- Modify: `lib/src/__tests__/WorldMap.test.tsx`

- [ ] **Step 1: Write failing tests for the accessible 3-part zoom control and label transform**

Add tests that assert:

```tsx
it("renders a three-part zoom control in regions mode", async () => {
  render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );

  expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  expect(screen.getByText("Zoom 1x")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeEnabled();
});

it("renders automatic labels inside the zoomed map transform", async () => {
  const { container } = render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );

  await userEvent.click(screen.getByLabelText("United States"));

  const transformedGroup = container.querySelector("svg > g");
  expect(transformedGroup?.querySelector("text")).not.toBeNull();
});
```

- [ ] **Step 2: Run the focused test file to verify it fails**

Run: `yarn workspace react-svg-worldmap test lib/src/__tests__/WorldMap.test.tsx` Expected: FAIL because the current control is four buttons and labels render in a separate group

- [ ] **Step 3: Implement the minimum core changes**

Update the map component and zoom control component so that:

```tsx
<ZoomControls
  zoomLevelLabel={`Zoom ${scale}x`}
  canZoomOut={scale > 1 || drilldown.canGoBack}
  canZoomIn={effectiveDetailLevel === "regions"}
  onZoomOut={handleZoomOut}
  onZoomIn={handleZoomIn}
/>
```

And move automatic labels into the same transformed `<g>` as the map paths.

- [ ] **Step 4: Re-run the focused test file**

Run: `yarn workspace react-svg-worldmap test lib/src/__tests__/WorldMap.test.tsx` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/src/components/ZoomControls.tsx lib/src/index.tsx lib/src/__tests__/WorldMap.test.tsx
git commit -m "feat: polish drill-down zoom controls and label placement"
```

### Task 2: Tighten label visibility and zoom/back behavior

**Files:**

- Modify: `lib/src/index.tsx`
- Modify: `lib/src/__tests__/WorldMap.test.tsx`

- [ ] **Step 1: Write failing tests for back-to-countries and visible label behavior**

Add tests that assert:

```tsx
it("returns to country level from the dedicated back control", async () => {
  render(
    <WorldMap data={DATA} detailLevel="regions" detailProvider={provider} />,
  );

  await userEvent.click(screen.getByLabelText("United States"));
  await userEvent.click(
    screen.getByRole("button", { name: "Back to countries" }),
  );

  expect(screen.queryByText("California")).not.toBeInTheDocument();
  expect(screen.getByText("Zoom 1x")).toBeInTheDocument();
});

it("does not render automatic labels outside the active transformed viewport", () => {
  const { container } = render(<WorldMap data={DATA} size={400} />);
  const labels = Array.from(container.querySelectorAll("text"));
  expect(labels.every((label) => label.closest("g") != null)).toBe(true);
});
```

- [ ] **Step 2: Run the focused test file to verify it fails**

Run: `yarn workspace react-svg-worldmap test lib/src/__tests__/WorldMap.test.tsx` Expected: FAIL because the current back/reset behavior and label filtering are incomplete

- [ ] **Step 3: Implement the minimal behavior**

Update `lib/src/index.tsx` so that:

```ts
const handleZoomOut = () => {
  if (scale > 1) {
    setScale(Math.max(1, scale / 2));
    setTranslateX(scale <= 2 ? 0 : translateX / 2);
    setTranslateY(scale <= 2 ? 0 : translateY / 2);
    return;
  }

  drilldown.reset();
};
```

Also filter automatic labels to the visible viewport before rendering them.

- [ ] **Step 4: Re-run the focused test file**

Run: `yarn workspace react-svg-worldmap test lib/src/__tests__/WorldMap.test.tsx` Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/src/index.tsx lib/src/__tests__/WorldMap.test.tsx
git commit -m "feat: refine drill-down zoom out and label visibility"
```

### Task 3: Add and promote the featured regions example

**Files:**

- Modify: `website/docusaurus.config.js`
- Modify: `docs/examples.md`
- Modify: `website/src/components/RegionsDrilldown.tsx`
- Modify: `website/src/pages/examples/regions-drilldown.tsx`
- Modify: `website/src/pages/examples/styles.module.css`

- [ ] **Step 1: Write the example-facing changes**

Update the example so it:

```tsx
<WorldMap
  data={data}
  title="Regions drill-down"
  detailLevel="regions"
  detailProvider={provider}
  size="xl"
/>
```

And make `/examples/regions-drilldown` the first item in both the navbar dropdown and the docs examples list.

- [ ] **Step 2: Run website typecheck**

Run: `yarn typecheck` Expected: PASS

- [ ] **Step 3: Build the packages**

Run: `yarn build:package` Expected: PASS

Run: `yarn workspace @react-svg-worldmap/regions build` Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add website/docusaurus.config.js docs/examples.md website/src/components/RegionsDrilldown.tsx website/src/pages/examples/regions-drilldown.tsx website/src/pages/examples/styles.module.css
git commit -m "feat: promote the regions drill-down showcase example"
```

### Task 4: Final verification

**Files:**

- Test: `lib/src/__tests__/WorldMap.test.tsx`
- Test: `docs/examples.md`
- Test: `website/docusaurus.config.js`

- [ ] **Step 1: Run the full verification set**

Run: `yarn test` Expected: PASS

Run: `yarn build:package` Expected: PASS

Run: `yarn workspace @react-svg-worldmap/regions build` Expected: PASS

Run: `yarn typecheck` Expected: PASS

- [ ] **Step 2: Review the final diff**

Run: `git diff --stat main...HEAD` Expected: shows only the phase 1 showcase-example and zoom/label polish changes on top of the current branch
