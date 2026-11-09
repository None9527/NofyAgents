//! Process entry for applications that want the SDK to own its runtime and stack.
//!
//! Existing async SDK APIs remain caller-owned. This opt-in helper does not
//! change their stack requirements or make arbitrary nesting safe.

use std::{
    future::Future,
    process::{ExitCode, Termination},
};

/// Requested stack size of the managed entry thread: 16 MiB.
///
/// This is a virtual stack reservation, not an immediate 16 MiB RSS charge.
/// Committed pages and other thread/runtime costs depend on the OS and workload.
pub const STACK_BYTES: usize = 16 * 1024 * 1024;

/// Run an application's async entry on a dedicated, explicitly sized thread.
///
/// Use from a synchronous `main`, rather than `#[tokio::main]`:
///
/// ```no_run
/// use nofy_agent_runtime::managed;
/// use std::process::ExitCode;
///
/// fn main() -> ExitCode {
///     managed::run(|| async {
///         // Construct application state and SDK futures here.
///         // Non-Send futures and errors are supported.
///         Ok::<(), Box<dyn std::error::Error>>(())
///     })
/// }
/// ```
///
/// Creates one current-thread Tokio runtime with its drivers enabled inside the
/// new thread. The factory is called within that runtime's context, so it may
/// construct timers or other runtime-dependent futures. The factory must be
/// `Send + 'static`; neither its future nor its output needs to be `Send`.
/// Do not preconstruct a large future on the calling stack and move it in.
///
/// After the application completes, the runtime is dropped and the output's
/// [`Termination::report`] runs on the same thread. Application `Result` errors
/// are therefore printed and become failure exit codes without crossing threads.
/// Thread-spawn and runtime-build errors are likewise reported as failures.
/// The entry thread is joined, never detached. Unwinding panics are resumed on
/// the caller with their original payload; `panic = "abort"` still aborts.
///
/// This blocks the caller until shutdown finishes. Join required application
/// tasks before returning: Tokio cancels outstanding async tasks on shutdown and
/// waits for already-started blocking tasks. It does not install cancellation
/// handlers or add a shutdown timeout. Use once at process entry, not once per
/// invocation, and keep caller-owned runtimes on the existing async APIs.
/// Bare async callers can still overflow a small stack. This budget is not an
/// unlimited-recursion guarantee and does not resize unrelated host threads.
pub fn run<F, Fut>(application: F) -> ExitCode
where
    F: FnOnce() -> Fut + Send + 'static,
    Fut: Future,
    Fut::Output: Termination,
{
    let thread = std::thread::Builder::new()
        .name("nofy-sdk-main".into())
        .stack_size(STACK_BYTES)
        .spawn(move || {
            let runtime = match tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
            {
                Ok(runtime) => runtime,
                Err(error) => return Err::<(), _>(error).report(),
            };
            // Call the factory only after block_on enters the managed runtime.
            let output = runtime.block_on(async { application().await });
            drop(runtime);
            output.report()
        });
    match thread {
        Ok(thread) => match thread.join() {
            Ok(code) => code,
            Err(payload) => std::panic::resume_unwind(payload),
        },
        Err(error) => Err::<(), _>(error).report(),
    }
}
