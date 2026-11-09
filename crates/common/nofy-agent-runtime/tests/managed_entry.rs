use nofy_agent_runtime::managed;
use std::{
    cell::Cell,
    process::{ExitCode, Termination},
    rc::Rc,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
    time::Duration,
};

struct LocalOutput {
    value: Rc<Cell<usize>>,
    caller: std::thread::ThreadId,
    reports: Arc<AtomicUsize>,
}

impl Termination for LocalOutput {
    fn report(self) -> ExitCode {
        assert!(tokio::runtime::Handle::try_current().is_err());
        assert_ne!(std::thread::current().id(), self.caller);
        assert_eq!(self.value.get(), 42);
        self.reports.fetch_add(1, Ordering::SeqCst);
        ExitCode::SUCCESS
    }
}

#[test]
fn factory_future_and_non_send_output_stay_on_managed_runtime_thread() {
    let caller = std::thread::current().id();
    let reports = Arc::new(AtomicUsize::new(0));
    let child_reports = reports.clone();
    let code = managed::run(move || {
        assert_ne!(std::thread::current().id(), caller);
        assert_eq!(std::thread::current().name(), Some("nofy-sdk-main"));
        assert_eq!(
            tokio::runtime::Handle::current().runtime_flavor(),
            tokio::runtime::RuntimeFlavor::CurrentThread
        );
        // Construction itself requires the entered runtime, before first poll.
        let timer = tokio::time::sleep(Duration::from_millis(1));
        let value = Rc::new(Cell::new(0));
        async move {
            timer.await;
            value.set(42);
            LocalOutput {
                value,
                caller,
                reports: child_reports,
            }
        }
    });
    assert_eq!(code, ExitCode::SUCCESS);
    // report is complete before run returns; it is not a detached task.
    assert_eq!(reports.load(Ordering::SeqCst), 1);
}

struct DropFlag(Arc<AtomicBool>);

impl Drop for DropFlag {
    fn drop(&mut self) {
        self.0.store(true, Ordering::SeqCst);
    }
}

struct ShutdownOutput {
    task_dropped: Arc<AtomicBool>,
    blocking_finished: Arc<AtomicBool>,
}

impl Termination for ShutdownOutput {
    fn report(self) -> ExitCode {
        assert!(self.task_dropped.load(Ordering::SeqCst));
        assert!(self.blocking_finished.load(Ordering::SeqCst));
        assert!(tokio::runtime::Handle::try_current().is_err());
        ExitCode::SUCCESS
    }
}

#[test]
fn runtime_shutdown_finishes_before_reporting() {
    let code = managed::run(|| async {
        let task_dropped = Arc::new(AtomicBool::new(false));
        let blocking_finished = Arc::new(AtomicBool::new(false));
        let guard = DropFlag(task_dropped.clone());
        let (ready, started) = tokio::sync::oneshot::channel();
        tokio::spawn(async move {
            let _guard = guard;
            ready.send(()).unwrap();
            std::future::pending::<()>().await;
        });
        started.await.unwrap();
        let finished = blocking_finished.clone();
        tokio::task::spawn_blocking(move || {
            std::thread::sleep(Duration::from_millis(10));
            finished.store(true, Ordering::SeqCst);
        });
        ShutdownOutput {
            task_dropped,
            blocking_finished,
        }
    });
    assert_eq!(code, ExitCode::SUCCESS);
}

#[test]
fn reports_non_send_errors_and_preserves_application_exit_codes() {
    assert_eq!(
        managed::run(|| async { Err::<(), _>(Rc::new("application failed")) }),
        ExitCode::FAILURE
    );
    assert_eq!(
        managed::run(|| async { ExitCode::from(23) }),
        ExitCode::from(23)
    );
}

struct PanicOutput;

impl Termination for PanicOutput {
    fn report(self) -> ExitCode {
        std::panic::panic_any(43_u32)
    }
}

#[test]
fn resumes_factory_future_and_report_panics_with_original_payload() {
    let factory = std::panic::catch_unwind(|| {
        managed::run(|| -> std::future::Ready<()> { std::panic::panic_any(41_u32) })
    });
    let future =
        std::panic::catch_unwind(|| managed::run(|| async { std::panic::panic_any(42_u32) }));
    let report = std::panic::catch_unwind(|| managed::run(|| async { PanicOutput }));
    for (panic, expected) in [(factory, 41_u32), (future, 42_u32), (report, 43_u32)] {
        assert_eq!(*panic.unwrap_err().downcast::<u32>().unwrap(), expected);
    }
}
