//! The same Rust child and assertions run natively on all three target OSes.
use nofy_tty_utils::child_cpu_time;
use std::{
    io::{BufRead, Write},
    process::Stdio,
    time::Duration,
};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

const CHILD_ENV: &str = "NOFY_CPU_ACCOUNTING_TEST_CHILD";

#[test]
fn cpu_accounting_child() {
    if std::env::var_os(CHILD_ENV).is_none() {
        return;
    }
    let mut output = std::io::stdout().lock();
    writeln!(output, "\nCPU_READY").unwrap();
    output.flush().unwrap();
    for line in std::io::stdin().lock().lines() {
        match line.unwrap().as_str() {
            "busy" => {
                let mut value = 1_u64;
                for _ in 0..20_000_000 {
                    value = std::hint::black_box(
                        value.wrapping_mul(6364136223846793005).wrapping_add(1),
                    );
                }
                std::hint::black_box(value);
                writeln!(output, "\nCPU_BUSY_DONE").unwrap();
                output.flush().unwrap();
            }
            "exit" => return,
            _ => panic!("unknown CPU test command"),
        }
    }
}

async fn marker(reader: &mut BufReader<tokio::process::ChildStdout>, expected: &str) {
    tokio::time::timeout(Duration::from_secs(30), async {
        let mut line = String::new();
        loop {
            line.clear();
            assert_ne!(
                reader.read_line(&mut line).await.unwrap(),
                0,
                "child exited before {expected}"
            );
            if line.trim() == expected {
                return;
            }
        }
    })
    .await
    .expect("CPU test child response");
}

#[tokio::test]
async fn owned_child_cpu_is_cumulative_not_wall_time_and_reaped_children_fail() {
    // Owner: this test waits for the child; cancellation/panic kills it via
    // kill_on_drop rather than leaving a test worker behind.
    #[allow(clippy::disallowed_methods)]
    let mut child = tokio::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "cpu_accounting_child",
            "--nocapture",
            "--test-threads=1",
        ])
        .env(CHILD_ENV, "1")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let mut input = child.stdin.take().unwrap();
    let mut output = BufReader::new(child.stdout.take().unwrap());
    marker(&mut output, "CPU_READY").await;

    let initial = child_cpu_time(&child).expect("native child CPU sample");
    // The child is blocked on stdin, so elapsed wall time must not be charged.
    tokio::time::sleep(Duration::from_millis(400)).await;
    // Burn CPU in the parent while the child stays blocked. Sampling the
    // current process instead of the owned child must not satisfy this test.
    let parent_busy = std::time::Instant::now();
    let mut value = 1_u64;
    while parent_busy.elapsed() < Duration::from_millis(500) {
        value = std::hint::black_box(value.wrapping_mul(6364136223846793005).wrapping_add(1));
    }
    std::hint::black_box(value);
    let idle = child_cpu_time(&child).unwrap();
    assert!(idle >= initial, "CPU time regressed");
    assert!(
        idle - initial < Duration::from_millis(200),
        "idle charged as wall time"
    );

    let busy_started = std::time::Instant::now();
    input.write_all(b"busy\n").await.unwrap();
    input.flush().await.unwrap();
    marker(&mut output, "CPU_BUSY_DONE").await;
    let busy = child_cpu_time(&child).unwrap();
    let charged = busy.checked_sub(idle).expect("CPU time regressed");
    assert!(
        charged >= Duration::from_millis(1),
        "real child CPU work was not counted"
    );
    assert!(
        charged <= busy_started.elapsed() * 2 + Duration::from_millis(200),
        "CPU units exceed plausible single-child consumption"
    );

    // Repeated reads must borrow the same process, never consume its handle.
    let mut previous = busy;
    for _ in 0..128 {
        let sample = child_cpu_time(&child).unwrap();
        assert!(sample >= previous);
        previous = sample;
    }
    input.write_all(b"exit\n").await.unwrap();
    input.flush().await.unwrap();
    assert!(
        tokio::time::timeout(Duration::from_secs(30), child.wait())
            .await
            .unwrap()
            .unwrap()
            .success()
    );
    assert_eq!(
        child_cpu_time(&child).unwrap_err().kind(),
        std::io::ErrorKind::InvalidInput
    );
}
