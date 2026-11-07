use super::*;

#[tokio::test]
async fn hard_exit_fixture() {
    let Ok(directory) = std::env::var("NOFY_SCOPE_EXIT_FIXTURE") else {
        return;
    };
    let directory = std::path::Path::new(&directory);
    let host = resident(directory, Arc::new(AtomicUsize::new(0))).await;
    let loader = host.loader().clone();
    tokio::spawn(async move {
        let (program, rules, operation) = busy();
        loader
            .evaluate(
                &program,
                &rules,
                operation,
                &RunContext::new("exit", "exit"),
            )
            .await
    });
    let pid = started(&host, directory, 1).await[0];
    // Observe the actual confinement, not merely a spawned command line.
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let status = std::fs::read_to_string(format!("/proc/{pid}/status")).unwrap();
            if status.lines().any(|line| line == "NoNewPrivs:\t1")
                && status.lines().any(|line| line == "Seccomp:\t2")
            {
                break;
            }
            tokio::time::sleep(Duration::from_millis(2)).await;
        }
    })
    .await
    .unwrap();
    let limits = std::fs::read_to_string(format!("/proc/{pid}/limits")).unwrap();
    let stack = limits
        .lines()
        .find(|line| line.starts_with("Max stack size"))
        .unwrap();
    assert!(
        stack
            .split_whitespace()
            .filter(|part| *part == "2097152")
            .count()
            == 2
    );
    tokio::fs::write(directory.join("scope-worker-pid"), pid.to_string())
        .await
        .unwrap();
    // Skip all destructors: neither Loader shutdown nor kill_on_drop runs.
    std::process::exit(97);
}

#[tokio::test]
async fn hard_parent_exit_kills_the_confined_scope_worker_and_reopen_has_no_stale_permits() {
    if !workers_confined_and_observable() {
        return;
    }
    let dir = tempfile::tempdir().unwrap();
    let result = tokio::time::timeout(
        Duration::from_secs(20),
        tokio::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "native_capabilities::matching::process::hard_exit_fixture",
                "--nocapture",
            ])
            .env("NOFY_SCOPE_EXIT_FIXTURE", dir.path())
            .kill_on_drop(true)
            .output(),
    )
    .await
    .unwrap()
    .unwrap();
    assert_eq!(
        result.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let pid: u32 = std::fs::read_to_string(dir.path().join("scope-worker-pid"))
        .unwrap()
        .parse()
        .unwrap();
    tokio::time::timeout(Duration::from_secs(5), async {
        loop {
            let live = std::fs::read_to_string(format!("/proc/{pid}/stat"))
                .ok()
                .and_then(|stat| {
                    stat.rsplit_once(") ")
                        .map(|(_, rest)| !rest.starts_with('Z') && !rest.starts_with('X'))
                })
                .unwrap_or(false);
            if !live {
                break;
            }
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
    // An adopted zombie is stopped, not reaped by its dead parent. The normal
    // cancellation/shutdown tests separately require every PID to disappear.
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    assert_eq!(host.loader().scope_status().started, 0);
    assert_eq!(host.loader().scope_status().in_flight, 0);
    normal(&host).await;
    assert_eq!(host.loader().scope_status().started, 1);
    assert!(pids(dir.path()).is_empty());
}
