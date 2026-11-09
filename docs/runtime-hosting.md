# Explicit application stack budgets

`Agent::invoke` runs on its caller. It does not spawn a thread, create a runtime, or change cancellation and borrowed-future ownership. A current-thread Tokio runtime created on OS main uses that main thread's stack. Setting a Tokio worker stack size does not change the thread calling `Runtime::block_on`. **The bare async API remains compatible and can still overflow a small stack.**

## Recommended entry for standalone SDK applications

Applications that own process startup can use the public `nofy_agent_runtime::managed::run` helper:

```rust
use nofy_agent_runtime::managed;
use std::process::ExitCode;

fn main() -> ExitCode {
    managed::run(|| async {
        // Construct application state, Agents and their futures here.
        // Perform the same SDK calls as in a caller-owned runtime.
        Ok::<(), Box<dyn std::error::Error>>(())
    })
}
```

This additive, opt-in entry requests a 16 MiB thread and creates one current-thread Tokio runtime with its drivers enabled inside it. The factory executes within the entered runtime, so it can construct timers as well as application futures. Only the factory must be `Send + 'static`; its future and application result/error need not be `Send`.

The SDK drops the runtime before calling the application's `Termination::report` on that same thread. A `Result` error is printed and returns a failure exit code. Custom `Termination` outputs and `ExitCode` values are preserved. Thread-spawn and runtime-build failures are also reported as failures. Only `ExitCode` crosses the join. Unwinding panics are resumed on the calling thread with their original payload; aborting panics, including this workspace's dev/release panic policy, still abort the process.

Use it once from synchronous `main`, not from `#[tokio::main]` or once per Agent invocation. The caller blocks until the entry thread finishes. Join required application tasks before returning: runtime shutdown cancels outstanding async tasks and waits for already-started blocking tasks. No shutdown timeout or automatic cancellation handler is added. Cancellation must still be requested and awaited through the existing SDK control flow.

Create local state and large futures inside the factory. Do not first construct a large future on a smaller caller stack and then move it. Existing runtimes, futures borrowing caller-local data, and hosts with their own lifecycle should keep using the caller-owned async APIs.

The executable SDK example uses the public helper without the product host:

```sh
cargo run --offline -p nofy-agent-runtime --example managed_entry
```

The managed-consumer CI harness also calls this API, while keeping its complete business body and 14 scenarios unchanged. The unmodified external consumer remains a separate compatibility gate; managed success does not relabel its small-stack failure as a pass.

The Nofy resident host separately budgets its owned entry and Tokio workers. Its isolation worker dispatch still happens on OS main before the resident thread is created. This SDK helper does not alter that host integration or unrelated threads.

## Costs and limits

One process-lifetime thread and a requested 16 MiB virtual stack are added. The OS main stack remains. Thread metadata, allocator arenas and committed stack pages have additional costs; 16 MiB is neither per-invocation heap traffic nor immediate RSS. The OS controls reservation/commit behavior. Tokio blocking threads, if needed, are separate and are not covered by this entry-stack budget.

On the previously tested Linux debug build, the full existing fixture passed at explicit 8/16 MiB and failed at 1/2/4 MiB; release results differ and do not replace debug evidence. Pure Workflow and Hook chains through their current 16-level bounds passed on 16 MiB, but this does not prove every legal combination of nested Agent, tool and hook futures fits. The earlier copied 16 MiB harness passed on Linux, Windows and macOS; the public helper requires its own exact-revision native CI evidence. Do not treat this budget as an unlimited recursion guarantee.
