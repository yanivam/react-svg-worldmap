# Data Model: Smooth Zoom Performance

## Zoom Interaction

Represents one user request to change map zoom.

Fields:

- `interactionType`: `zoom-in`, `zoom-out`, `reset`, or repeated zoom sequence.
- `startView`: Zoom scale, position, and visible detail level before the interaction.
- `requestedView`: The intended zoom direction or reset target.
- `firstVisibleFeedbackAt`: Time from interaction to first visible map response.
- `visibleCompletionAt`: Time from interaction to the map reaching the requested visible state.
- `finalView`: Zoom scale, position, and visible detail level after completion.

Validation rules:

- `firstVisibleFeedbackAt` must be recorded for every measured interaction.
- `visibleCompletionAt` must be greater than or equal to `firstVisibleFeedbackAt`.
- Repeated interactions must preserve the final requested direction and end in a consistent final view.

## Representative Map Scenario

Represents a repeatable map state used for performance and behavior validation.

Fields:

- `scenarioName`: Stable name for the measured scenario.
- `viewport`: Map container dimensions used for the scenario.
- `startingZoom`: Initial scale and position.
- `visibleLayers`: Country shapes, labels, pins, region overlays, and interaction targets expected to be present.
- `dataShape`: Representative country data, optional region availability, labels, and pins.
- `interactionSequence`: One or more zoom-control actions to perform.

Validation rules:

- Scenario names must be stable enough for regression reports.
- At least one scenario must cover full-world view.
- At least one scenario must cover detailed zoom with labels or pins.
- At least one scenario must cover optional region detail availability.

## Performance Measurement

Represents the result of running a zoom responsiveness scenario.

Fields:

- `scenarioName`: Scenario that produced the measurement.
- `sampleCount`: Number of interactions measured.
- `typicalFeedbackMs`: Typical click-to-visible-feedback timing.
- `maximumCompletionMs`: Worst observed click-to-visible-completion timing.
- `passFail`: Whether the scenario met the 250 ms typical and 500 ms maximum targets.
- `environmentNote`: Short note identifying the local measurement context.

Validation rules:

- `sampleCount` must be large enough to detect repeated-click regressions in the scenario.
- `typicalFeedbackMs` must meet the 250 ms target for at least 90% of measured zoom clicks.
- `maximumCompletionMs` must meet the 500 ms target for every representative measured click.
- Failing measurements must identify the scenario and timing that failed.

## Progressive Detail Layer

Represents visual detail that can appear after immediate zoom feedback.

Fields:

- `layerName`: Countries, detailed countries, labels, pins, region overlays, or interaction targets.
- `visibilityThreshold`: The zoom/detail condition where the layer is useful.
- `blocksInitialFeedback`: Whether the layer is allowed to delay first visible zoom feedback.
- `accessibilityRole`: Whether the layer contributes accessible or interactive SVG behavior.

Validation rules:

- Secondary visual detail must not block initial zoom feedback.
- Interaction targets and accessibility-bearing elements must remain consistent with visible map identity.
- Deferring a layer must not produce an incorrect final map state.

## State Transitions

```text
Idle -> Zoom Requested -> Immediate Feedback Visible -> Secondary Detail Settling -> Complete
```

Rules:

- Rapid repeated clicks may move from `Immediate Feedback Visible` back to `Zoom Requested`.
- The final state must reflect the latest accepted user action.
- A failed or unavailable optional detail layer must not prevent the map from reaching `Complete` for the core zoom state.
