# Fullscreen bottom Dock

Source baseline: public upstream 1.0.45, commit
`2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8`.
The widget and shared row-budget layout are ported from that source; Nofy adapts
its existing task/session actions rather than importing another task backend.
There is no remote Dock feature gate or new telemetry.

## Usage

Fullscreen shows nonempty Workflows, Subagents, Tasks, Watchers and Queued groups
above the composer. Workflow-owned children are excluded from Subagents.
The old top TasksPane is not also painted. Catalog and Todo keep their existing
positions. Queued rows retain their edit, delete, reorder and interject actions.

- Ctrl+G hides/restores the Dock; hide survives background task updates.
- Tab from the conversation focuses the Dock; arrows or j/k select items.
- Enter toggles a group, reveals more, or opens the selected item's viewer.
- x stops a stoppable task through the existing dispatcher; pending stops are
  not resubmitted before the existing stop timeout.
- Mouse headers toggle groups; item clicks open viewers; hovered stop controls
  check the identity that was actually painted before dispatching.
- Wheel scrolling over a group scrolls inside its own band. Headers stay fixed.
- PageUp/PageDown scroll the selected group; repeated show-more can reach rows
  beyond the expanded terminal-height budget.
- Ctrl+; focuses/toggles the existing queue body. Tab from Dock returns to prompt.

Eight rows is the normal budget, not a hard guarantee: upstream section floors
can require more. The actual terminal height has the final say. Tiny terminals
suppress optional rows to preserve the composer. Subagent fullscreen takeover
and task output viewers suppress the parent Dock.

The fullscreen control band shares upstream's one-column status/Dock gutter,
independent of conversation padding. A blank row separates live turn feedback
(including Waiting) from the Dock; normal/compact composer gaps retain upstream
rules. The visible Dock owns parked/watcher/queue cues instead of duplicating
them in the turn-status row. Explicitly hiding it restores parked/watcher cues.
Status button hit targets follow the painted row, not the Dock's bounds.

Minimal mode retains external prompt editing on Ctrl+G and the read-only
`/tasks` snapshot. Desktop, task persistence, scheduler and memory are unchanged.
This does not claim parity with unpublished upstream product versions or add
`/density`.

## Verification

Run with incremental/debug-info disabled to limit build output:

```sh
CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0 cargo test --locked -p nofy-pager --lib
CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 cargo build --locked -p nofy-pager-bin --bin nofy
CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0 PAGER_BINARY=/absolute/path/to/nofy cargo test --locked -p nofy-pager --test pty_e2e_dock -- --ignored --nocapture
```

The Dock PTY uses a local mock inference server but executes a real background
shell process. It checks bottom placement, hide/restore, resize, output viewer
and actual process termination through Dock stop. It requires no real API key.
Adapter tests cover all five groups and the stop actions for monitors, loops,
subagents and workflows; they do not claim live multi-model/network coverage.
The Waiting PTY regression additionally measures status/Dock/composer rows and
gutters during a delayed model response with a real background task. Unit tests
cover normal/compact alignment with custom scrollback padding and parked cues
across hide/restore.

2026-10-16 macOS aarch64 results: pager lib 8179 passed / 6 existing ignored;
Dock native PTY 1 passed; minimal external-editor native PTY 1 passed.
GitNexus staged scan: LOW, 34 mapped symbols, no mapped execution flows.
New Dock files are not yet in the index; the scan is not a substitute for tests.

Control-band follow-up (2026-10-16): the native Waiting geometry regression
fails against the previous `c47045c5` installation (missing pre-Dock gap) and
passes against the aligned binary. Both Dock PTYs pass, including real task
termination; the minimal external-editor PTY also passes. Pager lib: 8181 passed,
zero failures, six existing ignored; targeted rustfmt check passes. Staged impact scan:
LOW, five mapped symbols, no mapped execution flows. The existing index does
not map the new Dock adapter tests.
