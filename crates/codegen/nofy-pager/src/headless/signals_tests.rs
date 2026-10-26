use std::pin::pin;
use std::sync::Arc;
use std::task::{Context, Poll, Waker};
use std::time::Duration;

use pretty_assertions::assert_eq;
use tokio::sync::mpsc;

use super::{
    HeadlessSignals, SignalRoute, SignalSource, forced_exit_code, route_signal, spawn_watcher,
};

#[cfg(unix)]
#[test]
fn real_process_signals_run_deferred_cleanup_and_return_mapped_codes() {
    for (signal, expected) in [
        (libc::SIGINT, 130),
        (libc::SIGTERM, 143),
        (libc::SIGHUP, 129),
    ] {
        let temp = tempfile::tempdir().unwrap();
        let mut child = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "headless::signals::tests::real_signal_child"])
            .env("NOFY_HEADLESS_SIGNAL_TEST_ROOT", temp.path())
            .stdout(std::process::Stdio::null())
            .spawn()
            .unwrap();
        let deadline = std::time::Instant::now() + Duration::from_secs(10);
        while !temp.path().join("ready").exists() {
            if let Some(status) = child.try_wait().unwrap() {
                panic!("signal helper exited before ready: {status}");
            }
            if std::time::Instant::now() >= deadline {
                let _ = child.kill();
                let _ = child.wait();
                panic!("signal helper did not become ready");
            }
            std::thread::sleep(Duration::from_millis(10));
        }
        assert_eq!(unsafe { libc::kill(child.id() as libc::pid_t, signal) }, 0);
        let status = loop {
            if let Some(status) = child.try_wait().unwrap() {
                break status;
            }
            if std::time::Instant::now() >= deadline {
                let _ = child.kill();
                let _ = child.wait();
                panic!("signal helper did not exit");
            }
            std::thread::sleep(Duration::from_millis(10));
        };
        assert_eq!(status.code(), Some(expected));
        assert_eq!(
            std::fs::read_to_string(temp.path().join("cleaned")).unwrap(),
            expected.to_string()
        );
    }
}

#[cfg(unix)]
#[tokio::test]
async fn real_signal_child() {
    let Some(root) = std::env::var_os("NOFY_HEADLESS_SIGNAL_TEST_ROOT") else {
        return;
    };
    let root = std::path::PathBuf::from(root);
    let signals = HeadlessSignals::install().await.unwrap();
    let deferred = signals.defer_exit();
    std::fs::write(root.join("ready"), b"ready").unwrap();
    deferred.signalled().await;
    let code = deferred.release().expect("real signal was parked");
    // The same release-before-cleanup handoff used by run_single_turn, in an
    // isolated process so no signal is sent to the test runner itself.
    std::fs::write(root.join("cleaned"), code.to_string()).unwrap();
    crate::app::signal_handler::force_exit(code);
}

impl SignalSource for mpsc::UnboundedReceiver<i32> {
    async fn next_code(&mut self) -> i32 {
        self.recv().await.expect("the test holds the sender")
    }
}

fn uninstalled_signals() -> HeadlessSignals {
    HeadlessSignals {
        handoff: Arc::default(),
    }
}

#[test]
fn signal_parked_while_deferred_is_claimed_on_release() {
    let signals = uninstalled_signals();
    let deferred_exit = signals.defer_exit();

    assert_eq!(SignalRoute::Pending, route_signal(&signals.handoff, 143));
    assert_eq!(Some(143), deferred_exit.release());
}

#[test]
fn deferred_turn_wakes_only_once_a_signal_is_parked() {
    let signals = uninstalled_signals();
    let deferred_exit = signals.defer_exit();
    let mut signalled = pin!(deferred_exit.signalled());
    let mut context = Context::from_waker(Waker::noop());

    assert_eq!(Poll::Pending, signalled.as_mut().poll(&mut context));
    assert_eq!(SignalRoute::Pending, route_signal(&signals.handoff, 130));
    assert_eq!(Poll::Ready(()), signalled.as_mut().poll(&mut context));
}

#[tokio::test(start_paused = true)]
async fn parked_signal_waits_for_the_turn_and_a_second_signal_exits_at_once() {
    let signals = uninstalled_signals();
    let _deferred_exit = signals.defer_exit();
    let (sender, mut received) = mpsc::unbounded_channel();
    let mut forced = pin!(forced_exit_code(&mut received, &signals.handoff));

    sender.send(143).expect("the receiver is alive");
    let during_turn_cleanup =
        tokio::time::timeout(Duration::from_secs(24 * 60 * 60), forced.as_mut()).await;
    assert_eq!(None, during_turn_cleanup.ok());

    sender.send(130).expect("the receiver is alive");
    let after_second_signal = tokio::time::timeout(Duration::from_secs(1), forced).await;
    assert_eq!(Some(130), after_second_signal.ok());
}

#[tokio::test(flavor = "current_thread")]
async fn signal_exits_while_the_run_blocks_its_only_worker() {
    let (sender, received) = mpsc::unbounded_channel();
    let (exited, exit_code) = std::sync::mpsc::channel();
    spawn_watcher(
        move || received,
        Arc::default(),
        move |code| {
            exited.send(code).expect("the test waits for the exit");
        },
    )
    .await
    .expect("the watcher starts");

    sender.send(143).expect("the watcher is listening");

    assert_eq!(Ok(143), exit_code.recv_timeout(Duration::from_secs(5)));
}

#[cfg(unix)]
#[tokio::test(flavor = "current_thread")]
async fn install_claims_every_mapped_signal() {
    let _signals = HeadlessSignals::install()
        .await
        .expect("the watcher starts");

    let unclaimed: Vec<libc::c_int> = [libc::SIGINT, libc::SIGTERM, libc::SIGHUP]
        .into_iter()
        .filter(|signal| {
            let mut action: libc::sigaction = unsafe { std::mem::zeroed() };
            assert_eq!(0, unsafe {
                libc::sigaction(*signal, std::ptr::null(), &mut action)
            });
            action.sa_sigaction == libc::SIG_DFL
        })
        .collect();

    assert_eq!(Vec::<libc::c_int>::new(), unclaimed);
}
