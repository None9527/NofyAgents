//! Private product entry. SDK futures are never implicitly moved to another thread.
use std::process::{ExitCode, Termination};

/// Construct the runtime and its root future inside the explicitly budgeted thread.
/// The closure returns before reporting its result, so its runtime and guards have
/// already been dropped. Only ExitCode crosses the join; errors need not be Send.
pub(crate) fn run<F, T>(stack_bytes: usize, body: F) -> ExitCode
where
    F: FnOnce() -> T + Send + 'static,
    T: Termination,
{
    match std::thread::Builder::new()
        .name("nofy-main".into())
        .stack_size(stack_bytes)
        .spawn(move || body().report())
    {
        Ok(thread) => match thread.join() {
            Ok(code) => code,
            Err(payload) => std::panic::resume_unwind(payload),
        },
        Err(error) => Err::<(), _>(error).report(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    };

    #[test]
    fn runs_on_named_thread_and_returns_success() {
        let caller = std::thread::current().id();
        assert_eq!(
            run(16 * 1024 * 1024, move || {
                assert_ne!(std::thread::current().id(), caller);
                assert_eq!(std::thread::current().name(), Some("nofy-main"));
                ExitCode::SUCCESS
            }),
            ExitCode::SUCCESS
        );
    }

    #[test]
    fn non_send_result_and_drop_before_report() {
        struct Guard(Arc<AtomicBool>);
        impl Drop for Guard {
            fn drop(&mut self) {
                self.0.store(true, Ordering::SeqCst);
            }
        }
        struct LocalResult(std::rc::Rc<()>, Arc<AtomicBool>);
        impl Termination for LocalResult {
            fn report(self) -> ExitCode {
                assert_eq!(std::rc::Rc::strong_count(&self.0), 1);
                assert!(self.1.load(Ordering::SeqCst));
                ExitCode::SUCCESS
            }
        }
        let dropped = Arc::new(AtomicBool::new(false));
        assert_eq!(
            run(16 * 1024 * 1024, move || {
                let _guard = Guard(dropped.clone());
                LocalResult(std::rc::Rc::new(()), dropped)
            }),
            ExitCode::SUCCESS
        );
    }

    #[test]
    fn panic_payload_is_preserved() {
        let panic = std::panic::catch_unwind(|| {
            run(16 * 1024 * 1024, || -> ExitCode {
                std::panic::panic_any(42usize);
            })
        })
        .unwrap_err();
        assert_eq!(*panic.downcast::<usize>().unwrap(), 42);
    }

    #[test]
    fn error_exit_is_failure() {
        assert_eq!(
            run(16 * 1024 * 1024, || Err::<(), _>("entry-test-error")),
            ExitCode::FAILURE
        );
    }
}
