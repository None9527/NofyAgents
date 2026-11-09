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

The managed-consumer CI harness also calls this API, while keeping the existing external consumer's complete business body and 14 scenarios unchanged. Its three native jobs test the public entry contract and example before running the external consumer; a parity job checks all three evidence sets. The unmodified caller-owned consumer remains unchanged; managed success does not establish that it fits a small stack.

This SDK-only entry does not alter the Nofy resident host or unrelated threads.

## Costs and limits

One process-lifetime thread and a requested 16 MiB virtual stack are added. The OS main stack remains. Thread metadata, allocator arenas and committed stack pages have additional costs; 16 MiB is neither per-invocation heap traffic nor immediate RSS. The OS controls reservation/commit behavior. Tokio blocking threads, if needed, are separate and are not covered by this entry-stack budget.

The stack budget is a bounded, opt-in hosting choice, not an unlimited-recursion guarantee. The exact revision must pass the native Linux, macOS and Windows managed-consumer jobs before claiming cross-platform coverage. Existing caller-owned async APIs retain their original stack requirements.

## Verification

Run the entry contract and example with the pinned toolchain:

```sh
cargo test --locked -p nofy-agent-runtime --test managed_entry
cargo run --locked -p nofy-agent-runtime --example managed_entry
python3 -m unittest discover -s scripts/tests -p test_verify_agent_managed_consumer.py
```

The standalone verifier uses only the existing fixture and Python standard library.
It relocates crate paths without importing the independent-consumer verifier,
preserves the complete business source, and records the generated harness,
resolved features, dependency boundary, compiler identity, binary fingerprint, and execution logs.

```sh
python3 scripts/verify-agent-managed-consumer.py collect \
  --runner ubuntu-24.04 --output /tmp/nofy-managed-evidence --fetch
python3 scripts/verify-agent-managed-consumer.py compare /tmp/nofy-managed-platforms
```

Use `macos-latest` or `windows-latest` only on that native OS. Collection requires
a new output directory. Comparison requires exactly one artifact from each
native platform and rejects missing scenarios, changed source, feature drift,
unexpected stderr, skipped or failed stages, and mismatched compiler versions.
Source fingerprints cover workspace manifests and local crate files, including
uncommitted source changes; comparison checks them against the current checkout.
Synthetic unit-test artifacts test that validator only; they are not native
execution evidence.
