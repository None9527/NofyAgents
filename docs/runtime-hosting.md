# Explicit application stack budgets

`Agent::invoke` runs on its caller. It does not spawn a thread, create a runtime, or change cancellation and borrowed-future ownership. A current-thread Tokio runtime created on OS main uses that main thread's stack. Setting a Tokio worker stack size does not change the thread calling `Runtime::block_on`.

Applications that own process startup can choose an explicit entry thread. The SDK-only `managed_entry` example creates a 16 MiB thread, constructs one current-thread Tokio runtime inside it, then creates and invokes an Agent there:

```sh
cargo run --offline -p nofy-agent-runtime --example managed_entry
```

The example uses only the SDK and its existing Tokio/async-trait dependencies, not the product host. It is an opt-in integration example, not a new SDK API or an implicit fix for callers. The application result is reported after the runtime and application guards drop. Only `ExitCode` crosses the join; the application error type need not become `Send`. The parent joins rather than detaching, and resumes a child panic. Cancellation must still be requested and awaited by the application using its existing SDK control flow.

Create the runtime, local application data and futures inside the managed closure. Do not construct a large future first on a smaller calling stack and then move it. An existing runtime or a future borrowing caller-local data needs a caller-owned integration design; do not nest another runtime or silently move its work to this example's thread.

The Nofy resident host budgets its owned entry and Tokio workers explicitly. Its isolation worker dispatch still happens on OS main before the resident thread is created. SDK consumers retain their existing thread ownership.

## Costs and limits

One process-lifetime thread and a requested 16 MiB virtual stack are added by this opt-in pattern. The OS main stack remains. Thread metadata, allocator arenas and committed stack pages have additional costs; 16 MiB is neither per-invocation heap traffic nor immediate RSS. Existing Tokio worker threads are separate and their budgets remain separate.

The unmodified external consumer remains the default compatibility test. Its 1 MiB debug pressure failure is not relabeled as a pass by the managed example. On the tested Linux debug build, the full existing fixture passed at explicit 8/16 MiB and failed at 1/2/4 MiB; release results differ and do not replace debug evidence. Pure Workflow and Hook chains through their current 16-level bounds passed on 16 MiB, but this does not prove every legal combination of nested Agent, tool and hook futures fits. Native Windows and macOS validation remain separate requirements. Do not treat this budget as an unlimited recursion guarantee.
