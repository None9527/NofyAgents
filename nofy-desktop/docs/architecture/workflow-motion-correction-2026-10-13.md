# Workflow motion correction

The earlier runtime repair did not resolve workflow presentation. This correction removes its normal waiting footer; retry and failure feedback remain exceptional states.

Reference: `ref-desktop/packages/ui/src/ToolCallBlocks/renderers/execute.tsx` does not auto-open ordinary commands. `ToolLayout.tsx` keeps icons static and uses text motion for running state. `styles.css` uses a four-second sweep with the second half resting. Our previous implementation opened every running command, collapsed it on completion, and stacked header shimmer, badge pulse and waiting-footer animation.

Changes:
- Ordinary command/edit details default to a compact summary. Manual expansion survives status updates; confirmation can still open details.
- Normal running/completed badges and the redundant waiting footer are removed. Text motion has one sweep and a quiet half-cycle, with equal-color loop endpoints.
- All turn content stays in one keyed timeline. A message becoming intermediate history no longer moves into another React parent. Shared `CollapsibleRow` changes visibility without remounting content. History collapse and answer actions animate together; reduced motion bypasses transitions.

Reproduction before the fix: the staged Electron workflow failed both the duplicate-feedback assertion and the previous-message DOM-identity assertion. After the fix, DOM identity survives additional answers and completion; manual tool state survives; frame measurements show continuous collapse. Reports:
- `output/playwright/workflow-motion-2026-10-13T11-07-48.040Z/report.json` (4 scenarios)
- `output/playwright/activities-2026-10-13T11-09-38.733Z/report.json` (10)
- `output/playwright/virtual-2026-10-13T11-09-49.997Z/report.json` (11)
- `output/playwright/retry-2026-10-13T11-10-05.974Z/report.json` (6)

GitNexus: Spine/SegmentView/BlockView LOW, direct chain BlockView → SegmentView → Spine → App; newer activity/disclosure components UNKNOWN in the index, direct uses inspected. No kernel changes or commit.
