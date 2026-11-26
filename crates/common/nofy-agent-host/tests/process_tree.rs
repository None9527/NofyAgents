//! Actual namespace/cgroup lifecycle, never an unconfined Agent tool.
#![cfg(target_os = "linux")]
#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    loader::process_tree::{Config, Invocation, Limits, Manager},
};
use serde_json::{Value, json};
use std::{
    fs,
    os::fd::{AsRawFd, FromRawFd, OwnedFd},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tokio_util::sync::CancellationToken;

const HELPER: &str = env!("CARGO_BIN_EXE_nofy-agent-host");
/// How long a freshly started kernel may take to print its listening line. A
/// kernel that dies still fails at once (its stderr closes); this only bounds a
/// slow start. 10 s was enough on a 16-core machine and failed on a loaded
/// 4-vCPU runner that ran several of these tests at once.
const KERNEL_START: Duration = Duration::from_secs(60);
#[path = "process_tree/confined.rs"]
mod confined;
#[path = "support/dependencies.rs"]
mod dependencies;
fn invocation(work: &Path, source: String) -> Invocation {
    Invocation {
        program: "/usr/bin/python3".into(),
        arguments: vec!["-I".into(), "-c".into(), source],
        environment: [("ONLY_DECLARED".into(), "yes".into())].into(),
        cwd: work.into(),
        input: Vec::new(),
        timeout: Duration::from_secs(20),
        output_limit: 4096,
    }
}
struct Held {
    scratch: tempfile::TempDir,
    dropped: Arc<AtomicBool>,
}
impl Drop for Held {
    fn drop(&mut self) {
        assert!(self.scratch.path().join("owned").is_file());
        self.dropped.store(true, Ordering::SeqCst);
    }
}
fn held(work: &Path) -> (Held, PathBuf, Arc<AtomicBool>) {
    let scratch = tempfile::tempdir_in(work).unwrap();
    fs::write(scratch.path().join("owned"), b"real held scratch").unwrap();
    let path = scratch.path().to_path_buf();
    let dropped = Arc::new(AtomicBool::new(false));
    (
        Held {
            scratch,
            dropped: dropped.clone(),
        },
        path,
        dropped,
    )
}
fn source(work: &Path) -> String {
    format!(
        r#"import os,json,time
from pathlib import Path
work=Path({:?})
def host():
 return int(next(l for l in Path('/proc/self/status').read_text().splitlines() if l.startswith('NSpid:')).split()[1])
child=os.fork()
if child==0:
 os.setsid()
 grand=os.fork()
 if grand: os._exit(0)
 (work/'grand.json').write_text(json.dumps({{'host':host(),'pid':os.getpid(),'sid':os.getsid(0)}}))
 while True: time.sleep(.02)
os.waitpid(child,0)
while not (work/'grand.json').exists(): time.sleep(.01)
(work/'ready.json').write_text(json.dumps({{'host':host(),'pid':os.getpid(),'ppid':os.getppid(),'declared':os.environ.get('ONLY_DECLARED')}}))
while not (work/'finish').exists(): time.sleep(.01)
print('main-finished',flush=True)
"#,
        work.to_str().unwrap()
    )
}
async fn wait_json(path: &Path) -> Value {
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            if let Ok(bytes) = fs::read(path)
                && let Ok(value) = serde_json::from_slice(&bytes)
            {
                return value;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap_or_else(|_| panic!("missing actual worker evidence {}", path.display()))
}
async fn idle(manager: &Manager) {
    tokio::time::timeout(Duration::from_secs(10), async {
        while manager.active() != 0 {
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("physical supervisor still owns resources");
    assert_eq!(manager.pending().unwrap(), 0);
}
fn only_group(root: &Path) -> PathBuf {
    let dirs: Vec<_> = fs::read_dir(root)
        .unwrap()
        .filter_map(|e| {
            let e = e.unwrap();
            e.file_type().unwrap().is_dir().then(|| e.path())
        })
        .collect();
    assert_eq!(dirs.len(), 1, "{dirs:?}");
    dirs[0].clone()
}
fn witnesses(group: &Path) -> Vec<OwnedFd> {
    let pids = fs::read_to_string(group.join("cgroup.procs")).unwrap();
    let fds: Vec<_> = pids
        .split_whitespace()
        .map(|p| {
            let pid: i32 = p.parse().unwrap();
            let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) } as i32;
            assert!(
                fd >= 0,
                "pidfd for actual live {pid}: {}",
                std::io::Error::last_os_error()
            );
            unsafe { OwnedFd::from_raw_fd(fd) }
        })
        .collect();
    assert!(
        fds.len() >= 4,
        "outer/init/main/double-fork descendant must be real"
    );
    fds
}
async fn all_dead(fds: &[OwnedFd]) {
    tokio::time::timeout(Duration::from_secs(5), async {
        loop {
            if fds.iter().all(|fd| {
                let mut poll = libc::pollfd {
                    fd: fd.as_raw_fd(),
                    events: libc::POLLIN,
                    revents: 0,
                };
                unsafe { libc::poll(&mut poll, 1, 0) == 1 && poll.revents & libc::POLLIN != 0 }
            }) {
                return;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("a pinned descendant survived lifecycle termination");
}
fn start(
    manager: &Manager,
    config: &Config,
    work: &Path,
    timeout: Duration,
) -> (
    tokio::task::JoinHandle<nofy_agent_host::Result<nofy_agent_host::loader::process_tree::Output>>,
    CancellationToken,
    PathBuf,
    Arc<AtomicBool>,
) {
    let manager = manager.clone();
    let config = config.clone();
    let cancel = CancellationToken::new();
    let (hold, path, dropped) = held(work);
    let mut command = invocation(work, source(work));
    command.timeout = timeout;
    let child_cancel = cancel.clone();
    let task = tokio::spawn(async move {
        manager
            .supervise(config, HELPER.into(), command, child_cancel, hold)
            .await
    });
    (task, cancel, path, dropped)
}
fn workspace(work: &Path, name: &str) -> PathBuf {
    let path = work.join(name);
    fs::create_dir(&path).unwrap();
    path
}

async fn lifecycle(work: &Path, config: Config) {
    let manager = Manager::open(&work.join("journal")).unwrap();
    // Normal root exit must not wait for a background pipe-holding daemon.
    for mode in ["normal", "cancel", "abandon", "timeout"] {
        let w = workspace(work, mode);
        let timeout = if mode == "timeout" {
            Duration::from_secs(3)
        } else {
            Duration::from_secs(20)
        };
        let (task, cancel, scratch, dropped) = start(&manager, &config, &w, timeout);
        let ready = wait_json(&w.join("ready.json")).await;
        let grand = wait_json(&w.join("grand.json")).await;
        assert_eq!(ready["pid"], 2);
        assert_eq!(ready["ppid"], 1);
        assert_eq!(ready["declared"], "yes");
        assert!(grand["pid"].as_u64().unwrap() > 2);
        assert_ne!(grand["host"], grand["pid"]);
        let group = only_group(&config.cgroup_root);
        let fds = witnesses(&group);
        assert!(scratch.join("owned").is_file());
        assert!(!dropped.load(Ordering::SeqCst));
        match mode {
            "normal" => {
                fs::write(w.join("finish"), b"exit root").unwrap();
                let output = task.await.unwrap().unwrap();
                assert!(output.status.success(), "{:?}", output);
                assert_eq!(output.stdout, b"main-finished\n");
            }
            "cancel" => {
                cancel.cancel();
                assert!(
                    task.await
                        .unwrap()
                        .unwrap_err()
                        .to_string()
                        .contains("cancelled")
                );
            }
            "abandon" => {
                task.abort();
                assert!(task.await.unwrap_err().is_cancelled());
            }
            "timeout" => {
                assert!(
                    task.await
                        .unwrap()
                        .unwrap_err()
                        .to_string()
                        .contains("timed out")
                );
            }
            _ => unreachable!(),
        }
        idle(&manager).await;
        all_dead(&fds).await;
        assert!(!group.exists());
        assert!(!scratch.exists());
        assert!(dropped.load(Ordering::SeqCst));
    }
    // Failure is observable, but cannot release the owner or cached scratch.
    let w = workspace(work, "cleanup-fault");
    let (task, cancel, scratch, dropped) = start(&manager, &config, &w, Duration::from_secs(20));
    wait_json(&w.join("ready.json")).await;
    let group = only_group(&config.cgroup_root);
    let fds = witnesses(&group);
    let record = only_group(&work.join("journal"));
    let unexpected = record.join("unknown-evidence");
    fs::write(&unexpected, b"must not be deleted by the manager").unwrap();
    cancel.cancel();
    assert!(
        task.await
            .unwrap()
            .unwrap_err()
            .to_string()
            .contains("resources retained")
    );
    all_dead(&fds).await;
    assert!(record.join("record.json").is_file());
    assert!(scratch.exists());
    assert!(!dropped.load(Ordering::SeqCst));
    assert_eq!(manager.active(), 1);
    assert_eq!(manager.pending().unwrap(), 1);
    assert_eq!(
        fs::read(&unexpected).unwrap(),
        b"must not be deleted by the manager"
    );
    fs::remove_file(&unexpected).unwrap();
    idle(&manager).await;
    assert!(!scratch.exists());
    assert!(dropped.load(Ordering::SeqCst));

    // Admission is bounded before any blocking acquisition is scheduled.
    let first = workspace(work, "parallel-first");
    let second = workspace(work, "parallel-second");
    let (a, ac, _, _) = start(&manager, &config, &first, Duration::from_secs(20));
    let (b, bc, _, _) = start(&manager, &config, &second, Duration::from_secs(20));
    wait_json(&first.join("ready.json")).await;
    wait_json(&second.join("ready.json")).await;
    assert_eq!(manager.active(), 2);
    assert_eq!(manager.pending().unwrap(), 2);
    let fds: Vec<_> = fs::read_dir(&config.cgroup_root)
        .unwrap()
        .filter_map(|e| {
            let e = e.unwrap();
            e.file_type()
                .unwrap()
                .is_dir()
                .then(|| witnesses(&e.path()))
        })
        .flatten()
        .collect();
    let third = invocation(work, "raise Exception('must not execute')".into());
    assert!(
        manager
            .supervise(
                config.clone(),
                HELPER.into(),
                third,
                CancellationToken::new(),
                ()
            )
            .await
            .unwrap_err()
            .to_string()
            .contains("two supervised owners")
    );
    ac.cancel();
    bc.cancel();
    assert!(a.await.unwrap().is_err());
    assert!(b.await.unwrap().is_err());
    idle(&manager).await;
    all_dead(&fds).await;

    // Cancellation while the real acquisition journal is locked still leaves
    // its background owner holding scratch until the in-flight IO returns.
    let catalog = fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(work.join("journal/catalog.lock"))
        .unwrap();
    fs2::FileExt::lock_exclusive(&catalog).unwrap();
    let w = workspace(work, "waiting-acquisition");
    let (task, cancel, scratch, dropped) = start(&manager, &config, &w, Duration::from_secs(20));
    tokio::time::timeout(Duration::from_secs(2), async {
        while manager.active() == 0 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    tokio::time::sleep(Duration::from_millis(50)).await;
    cancel.cancel();
    tokio::time::sleep(Duration::from_millis(50)).await;
    assert!(!task.is_finished());
    assert!(scratch.exists());
    assert!(!dropped.load(Ordering::SeqCst));
    fs2::FileExt::unlock(&catalog).unwrap();
    assert!(
        task.await
            .unwrap()
            .unwrap_err()
            .to_string()
            .contains("cancelled before launch")
    );
    idle(&manager).await;
    assert!(!w.join("ready.json").exists());
    assert!(!scratch.exists());

    for stream in ["stdout", "stderr"] {
        let src = format!("import sys\nsys.{stream}.write('x'*100000)\nsys.{stream}.flush()\n");
        let result = manager
            .supervise(
                config.clone(),
                HELPER.into(),
                invocation(work, src),
                CancellationToken::new(),
                (),
            )
            .await;
        assert!(result.unwrap_err().to_string().contains("output exceeds"));
        idle(&manager).await;
    }
    let mut env = invocation(work, String::new());
    env.program = "/usr/bin/env".into();
    env.arguments.clear();
    let output = manager
        .supervise(
            config.clone(),
            HELPER.into(),
            env,
            CancellationToken::new(),
            (),
        )
        .await
        .unwrap();
    assert!(output.status.success());
    assert_eq!(output.stdout, b"ONLY_DECLARED=yes\n");
    idle(&manager).await;
    let orphan_burst = "import os,time\nfor i in range(80):\n child=os.fork()\n if child==0:\n  if os.fork(): os._exit(0)\n  os._exit(0)\n os.waitpid(child,0)\n time.sleep(.002)\nprint('orphans-reaped')\n";
    let output = manager
        .supervise(
            config.clone(),
            HELPER.into(),
            invocation(work, orphan_burst.into()),
            CancellationToken::new(),
            (),
        )
        .await
        .unwrap();
    assert!(output.status.success(), "{output:?}");
    assert_eq!(output.stdout, b"orphans-reaped\n");
    idle(&manager).await;
    let mut short = invocation(work, "import os;os._exit(0)".into());
    short.input = vec![b'x'; 8 * 1024 * 1024];
    assert!(
        manager
            .supervise(
                config.clone(),
                HELPER.into(),
                short,
                CancellationToken::new(),
                ()
            )
            .await
            .unwrap()
            .status
            .success()
    );
    idle(&manager).await;
    let mut missing = invocation(work, String::new());
    missing.program = work.join("no-executable");
    let output = manager
        .supervise(
            config.clone(),
            HELPER.into(),
            missing,
            CancellationToken::new(),
            (),
        )
        .await
        .unwrap();
    assert_eq!(output.status.code(), Some(127));
    assert!(String::from_utf8_lossy(&output.stderr).contains("exec failed"));
    idle(&manager).await;

    let cancel = CancellationToken::new();
    cancel.cancel();
    let w = workspace(work, "never-started");
    let error = manager
        .supervise(
            config.clone(),
            HELPER.into(),
            invocation(&w, source(&w)),
            cancel,
            (),
        )
        .await
        .unwrap_err();
    assert!(error.to_string().contains("cancelled before"));
    idle(&manager).await;
    assert!(!w.join("ready.json").exists());

    // Hard parent death is tested without calling Manager.shutdown or recovery
    // until every pinned process has died and cgroup population is already 0.
    let crash = workspace(work, "crash");
    let mut owner = tokio::process::Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "hard_exit_owner", "--nocapture"])
        .env("NOFY_TREE_LIFECYCLE_CRASH", &crash)
        .env(
            "NOFY_TREE_LIFECYCLE_CONFIG",
            serde_json::to_string(&config).unwrap(),
        )
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::inherit())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    wait_json(&crash.join("ready.json")).await;
    let group: PathBuf =
        serde_json::from_value(wait_json(&crash.join("group.json")).await).unwrap();
    let fds = witnesses(&group);
    fs::write(crash.join("exit-owner"), b"hard exit now").unwrap();
    assert_eq!(owner.wait().await.unwrap().code(), Some(91));
    all_dead(&fds).await;
    assert!(
        fs::read_to_string(group.join("cgroup.events"))
            .unwrap()
            .lines()
            .any(|s| s == "populated 0")
    );
    let recovered = Manager::open(&crash.join("journal")).unwrap();
    assert_eq!(recovered.pending().unwrap(), 0);
    assert!(!group.exists());

    // Exercise the real KernelHost shutdown/drain wiring, not only Manager.
    let auth = Authorizer::new(vec![(
        "process-tree-test-token-not-a-real-secret".into(),
        [Scope::Read].into(),
    )])
    .unwrap();
    let host = KernelHost::open(&work.join("host"), Default::default(), auth)
        .await
        .unwrap();
    let w = workspace(work, "shutdown");
    let (task, _, scratch, dropped) = start(
        &host.loader().process_trees,
        &config,
        &w,
        Duration::from_secs(20),
    );
    wait_json(&w.join("ready.json")).await;
    let fds = witnesses(&only_group(&config.cgroup_root));
    host.shutdown();
    host.run_worker(CancellationToken::new(), 1).await.unwrap();
    assert!(
        task.await
            .unwrap()
            .unwrap_err()
            .to_string()
            .contains("cancelled")
    );
    assert_eq!(host.loader().process_trees.active(), 0);
    assert!(!scratch.exists());
    assert!(dropped.load(Ordering::SeqCst));
    all_dead(&fds).await;
    assert!(
        host.loader()
            .process_trees
            .supervise(
                config.clone(),
                HELPER.into(),
                invocation(&w, source(&w)),
                CancellationToken::new(),
                ()
            )
            .await
            .is_err()
    );
    idle(&manager).await;
    manager.drain().await.unwrap();
    fs::write(work.join("passed.json"), serde_json::to_vec(&json!({"pid_namespace":true,"normal_cancel_abandon_timeout":true,"physical_return":true,"cleanup_fault_retains_resources":true,"hard_parent_death_before_recovery":true,"host_shutdown_drained":true})).unwrap()).unwrap();
}

#[test]
fn delegated_lifecycle() {
    let Ok(work) = std::env::var("NOFY_TREE_LIFECYCLE_WORK") else {
        return;
    };
    let work = PathBuf::from(work);
    let own = fs::read_to_string("/proc/self/cgroup").unwrap();
    let unit = Path::new("/sys/fs/cgroup").join(
        own.lines()
            .find_map(|l| l.strip_prefix("0::"))
            .unwrap()
            .trim_start_matches('/'),
    );
    fs::create_dir(unit.join("kernel")).unwrap();
    fs::write(unit.join("kernel/cgroup.procs"), "0").unwrap();
    fs::write(unit.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let root = unit.join("jobs");
    fs::create_dir(&root).unwrap();
    fs::write(root.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let config = Config {
        cgroup_root: root,
        limits: Limits::default(),
    };
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()
        .unwrap();
    runtime.block_on(lifecycle(&work, config));
}
#[test]
fn hard_exit_owner() {
    let Ok(work) = std::env::var("NOFY_TREE_LIFECYCLE_CRASH") else {
        return;
    };
    let work = PathBuf::from(work);
    let config: Config =
        serde_json::from_str(&std::env::var("NOFY_TREE_LIFECYCLE_CONFIG").unwrap()).unwrap();
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()
        .unwrap();
    runtime.block_on(async {
        let manager = Manager::open(&work.join("journal")).unwrap();
        let (task, _, _, _) = start(&manager, &config, &work, Duration::from_secs(20));
        wait_json(&work.join("ready.json")).await;
        fs::write(
            work.join("group.json"),
            serde_json::to_vec(&only_group(&config.cgroup_root)).unwrap(),
        )
        .unwrap();
        tokio::time::timeout(Duration::from_secs(10), async {
            while !work.join("exit-owner").exists() {
                tokio::time::sleep(Duration::from_millis(10)).await;
            }
        })
        .await
        .unwrap();
        assert!(!task.is_finished());
        std::process::exit(91);
    });
}
#[test]
fn real_namespace_lifecycle_runs_under_separate_delegation() {
    let directory = tempfile::tempdir().unwrap();
    let output = Command::new("systemd-run")
        .args([
            "--user",
            "--wait",
            "--pipe",
            "--collect",
            "--quiet",
            "--property",
            "Delegate=yes",
            "--setenv",
        ])
        .arg(format!(
            "NOFY_TREE_LIFECYCLE_WORK={}",
            directory.path().display()
        ))
        .arg(std::env::current_exe().unwrap())
        .args(["--exact", "delegated_lifecycle", "--nocapture"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let evidence: Value =
        serde_json::from_slice(&fs::read(directory.path().join("passed.json")).unwrap()).unwrap();
    assert!(evidence.as_object().unwrap().values().all(|v| v == true));
}

#[test]
fn bootstrap_failure_never_executes_the_program() {
    use std::os::unix::process::CommandExt;
    let directory = tempfile::tempdir().unwrap();
    let marker = directory.path().join("must-not-exist");
    let wire = json!({"parent_pid":std::process::id(),"program":"/usr/bin/python3","arguments":["-I","-c",format!("open({:?},'w').write('unconfined')",marker.to_str().unwrap())],"environment":{},"cwd":directory.path()}).to_string();
    // Raw inline JSON on argv[2] is strictly refused fail-closed.
    let raw_argv = Command::new(HELPER)
        .args(["__nofy_process_tree_v1", &wire])
        .output()
        .unwrap();
    assert_eq!(
        raw_argv.status.code(),
        Some(nofy_isolation::RUNNER_FAILURE_EXIT_CODE)
    );
    let raw_stderr = String::from_utf8_lossy(&raw_argv.stderr);
    assert!(
        raw_stderr.contains(nofy_isolation::RUNNER_FAILURE_MARKER),
        "{raw_stderr}"
    );
    assert!(!marker.exists());

    let mut command = Command::new(HELPER);
    let bootstrap_arg =
        nofy_agent_host::loader::isolation::attach_profile_fd(&mut command, wire.as_bytes())
            .unwrap();
    command.arg("__nofy_process_tree_v1").arg(&bootstrap_arg);
    unsafe {
        command.pre_exec(|| {
            let mut filter = [
                libc::sock_filter {
                    code: (libc::BPF_LD | libc::BPF_W | libc::BPF_ABS) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0,
                },
                libc::sock_filter {
                    code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 1,
                    k: libc::SYS_unshare as u32,
                },
                libc::sock_filter {
                    code: (libc::BPF_RET | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0x00050000 | libc::EPERM as u32,
                },
                libc::sock_filter {
                    code: (libc::BPF_RET | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0x7fff0000,
                },
            ];
            let program = libc::sock_fprog {
                len: filter.len() as u16,
                filter: filter.as_mut_ptr(),
            };
            if libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0
                || libc::prctl(libc::PR_SET_SECCOMP, 2, &program as *const libc::sock_fprog) != 0
            {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
    let output = command.output().unwrap();
    assert_eq!(
        output.status.code(),
        Some(nofy_isolation::RUNNER_FAILURE_EXIT_CODE)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains(nofy_isolation::RUNNER_FAILURE_MARKER),
        "{stderr}"
    );
    assert!(stderr.contains("bootstrap failed"), "{stderr}");
    assert!(!marker.exists());
    for wire in [
        "{}".to_owned(),
        json!({"parent_pid":0,"program":"/usr/bin/true","arguments":[],"environment":{},"cwd":"/"})
            .to_string(),
    ] {
        let mut bad = Command::new(HELPER);
        let arg = nofy_agent_host::loader::isolation::attach_profile_fd(&mut bad, wire.as_bytes())
            .unwrap();
        let output = bad.arg("__nofy_process_tree_v1").arg(arg).output().unwrap();
        assert_eq!(
            output.status.code(),
            Some(nofy_isolation::RUNNER_FAILURE_EXIT_CODE)
        );
        assert!(
            String::from_utf8_lossy(&output.stderr).contains(nofy_isolation::RUNNER_FAILURE_MARKER)
        );
    }
}

#[tokio::test]
async fn invalid_commands_and_unknown_journals_cannot_report_a_successful_drain() {
    let directory = tempfile::tempdir().unwrap();
    let manager = Manager::open(&directory.path().join("journal")).unwrap();
    let config = Config {
        cgroup_root: "/sys/fs/cgroup/absent-delegation/jobs".into(),
        limits: Limits::default(),
    };
    let mut command = invocation(directory.path(), "print('must not run')".into());
    command.program = "python3".into();
    assert!(
        manager
            .supervise(
                config.clone(),
                HELPER.into(),
                command,
                CancellationToken::new(),
                ()
            )
            .await
            .unwrap_err()
            .to_string()
            .contains("invalid supervised command")
    );
    let mut command = invocation(directory.path(), String::new());
    command.input.resize(8 * 1024 * 1024 + 1, 0);
    assert!(
        manager
            .supervise(config, HELPER.into(), command, CancellationToken::new(), ())
            .await
            .is_err()
    );
    assert_eq!(manager.active(), 0);
    assert_eq!(manager.pending().unwrap(), 0);
    let pending = directory.path().join("journal/job-unknown");
    fs::create_dir(&pending).unwrap();
    fs::write(pending.join("record.json"), b"invalid actual journal").unwrap();
    assert!(manager.drain().await.is_err());
    assert_eq!(
        fs::read(pending.join("record.json")).unwrap(),
        b"invalid actual journal"
    );
    assert_eq!(manager.pending().unwrap(), 1);
}

#[test]
fn single_process_isolation_blocks_signal_escapes_and_hides_profile_from_cmdline() {
    let dir = tempfile::tempdir().unwrap();
    let private_root = fs::canonicalize(dir.path()).unwrap();
    let scratch = private_root.join("scratch");
    fs::create_dir(&scratch).unwrap();
    let mut read_only = Vec::new();
    for path in ["/usr", "/lib", "/lib64", "/etc/ld.so.cache"] {
        let p = Path::new(path);
        if p.exists() {
            read_only.push(fs::canonicalize(p).unwrap());
        }
    }
    let profile = json!({
        "scratch": scratch,
        "scratch_files": [],
        "read_only": read_only,
        "private_root": private_root,
        "parent_pid": std::process::id(),
        "cpu_seconds": 5,
        "environment": {
            "NOFY_TEST_VAR": "test",
            "NOFY_REDTEAM_SECRET": "top-secret-value-xyz"
        }
    });
    let wire = profile.to_string();

    // 1. Passing raw Profile JSON on argv[2] must be refused fail-closed.
    let raw_argv = Command::new(HELPER)
        .arg(nofy_agent_host::loader::isolation::WORKER_ARG)
        .arg(&wire)
        .arg("--probe")
        .env_clear()
        .output()
        .unwrap();
    assert_eq!(
        raw_argv.status.code(),
        Some(nofy_isolation::RUNNER_FAILURE_EXIT_CODE)
    );
    assert!(
        String::from_utf8_lossy(&raw_argv.stderr).contains(nofy_isolation::RUNNER_FAILURE_MARKER),
        "{}",
        String::from_utf8_lossy(&raw_argv.stderr)
    );

    // 2. Passing Profile via read-only sealed FD delivers environment without leaking
    // into argv/cmdline, closes the FD before exec, and blocks signal/metadata syscalls.
    #[cfg(target_arch = "x86_64")]
    let extra_x86_64: &[i64] = &[libc::SYS_utime, libc::SYS_utimes, libc::SYS_futimesat];
    #[cfg(not(target_arch = "x86_64"))]
    let extra_x86_64: &[i64] = &[];
    let script = format!(
        r#"import ctypes, errno, hashlib, json, os, signal, sys
libc = ctypes.CDLL(None, use_errno=True)
secret = os.environ.get('NOFY_TEST_VAR', '')
assert hashlib.sha256(secret.encode()).hexdigest() == {expected_hash:?}, secret
profile_fd = int(sys.argv[1])
try:
    os.fstat(profile_fd)
    raise AssertionError('profile fd leaked into guest')
except OSError as exc:
    assert exc.errno == errno.EBADF, exc

def assert_eperm(nr, *args):
    ctypes.set_errno(0)
    res = libc.syscall(ctypes.c_long(nr), *(ctypes.c_long(a) for a in args))
    assert res == -1 and ctypes.get_errno() == errno.EPERM, (nr, res, ctypes.get_errno())

# Construct a siginfo_t buffer with si_code = SI_QUEUE (-1) targeting parent PID.
siginfo = ctypes.create_string_buffer(128)
ctypes.memmove(ctypes.addressof(siginfo), ctypes.c_int(signal.SIGKILL).value.to_bytes(4, 'little', signed=True), 4)
ctypes.memmove(ctypes.addressof(siginfo) + 8, (-1).to_bytes(4, 'little', signed=True), 4)
ppid = os.getppid()
assert_eperm({rt_sigqueueinfo}, ppid, signal.SIGKILL, ctypes.addressof(siginfo))
assert_eperm({rt_tgsigqueueinfo}, ppid, ppid, signal.SIGKILL, ctypes.addressof(siginfo))
assert_eperm(424, 0, signal.SIGKILL, 0, 0)
assert_eperm({setpriority}, 0, 0, 10)
assert_eperm({userfaultfd}, 0)
for nr in {extra_x86_64:?}:
    assert_eperm(nr, 0, 0, 0)
print(json.dumps({{"ok": True}}))
"#,
        expected_hash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        rt_sigqueueinfo = libc::SYS_rt_sigqueueinfo,
        rt_tgsigqueueinfo = libc::SYS_rt_tgsigqueueinfo,
        setpriority = libc::SYS_setpriority,
        userfaultfd = libc::SYS_userfaultfd,
        extra_x86_64 = extra_x86_64,
    );

    let mut command = Command::new(HELPER);
    let profile_arg =
        nofy_agent_host::loader::isolation::attach_profile_fd(&mut command, wire.as_bytes())
            .unwrap();
    let profile_fd: i32 = profile_arg
        .to_str()
        .unwrap()
        .strip_prefix("fd:")
        .unwrap()
        .parse()
        .unwrap();
    command
        .arg(nofy_agent_host::loader::isolation::WORKER_ARG)
        .arg(&profile_arg)
        .arg("/usr/bin/python3")
        .args(["-I", "-S", "-c", &script])
        .arg(profile_fd.to_string())
        .env_clear();
    let joined_args: String = command
        .get_args()
        .map(|a| a.to_string_lossy())
        .collect::<Vec<_>>()
        .join(" ");
    assert!(!joined_args.contains("NOFY_REDTEAM_SECRET"));
    assert!(!joined_args.contains("top-secret-value-xyz"));
    assert!(!joined_args.contains("parent_pid"));
    assert!(!joined_args.contains(private_root.to_str().unwrap()));

    let output = command.output().unwrap();
    assert!(
        output.status.success(),
        "stdout={} stderr={}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let value: Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["ok"], true);
}

#[test]
fn pivot_root_failure_is_fail_closed_and_never_falls_back_to_chroot() {
    use std::os::unix::process::CommandExt;
    let dir = tempfile::tempdir().unwrap();
    let private_root = fs::canonicalize(dir.path()).unwrap();
    let root = private_root.join("loader/scratch/job");
    let artifact = private_root.join("loader/artifacts/trees/art");
    let lifecycle = private_root.join("loader/lifecycle");
    fs::create_dir_all(&root).unwrap();
    fs::create_dir_all(&artifact).unwrap();
    fs::create_dir_all(&lifecycle).unwrap();
    fs::write(lifecycle.join("lease.lock"), b"").unwrap();
    let marker = private_root.join("must-not-run");
    let mut local_paths = Vec::new();
    for (path, execute) in [
        ("/usr", true),
        ("/lib", true),
        ("/lib64", true),
        ("/etc/ld.so.cache", false),
    ] {
        if Path::new(path).exists() {
            local_paths.push(json!({"path": path, "execute": execute}));
        }
    }
    let wire = json!({
        "parent_pid": std::process::id(),
        "program": "/usr/bin/python3",
        "arguments": ["-I", "-c", format!("open({:?}, 'w').write('escaped')", marker.to_str().unwrap())],
        "environment": {},
        "cwd": "/tmp",
        "sandbox": {
            "root": root,
            "runtime": {"kind": "local", "paths": local_paths},
            "artifact": artifact,
            "private_root": private_root,
            "directories": []
        }
    })
    .to_string();
    let mut command = Command::new(HELPER);
    let bootstrap_arg =
        nofy_agent_host::loader::isolation::attach_profile_fd(&mut command, wire.as_bytes())
            .unwrap();
    command.arg("__nofy_process_tree_v1").arg(&bootstrap_arg);
    unsafe {
        command.pre_exec(|| {
            let mut filter = [
                libc::sock_filter {
                    code: (libc::BPF_LD | libc::BPF_W | libc::BPF_ABS) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0,
                },
                libc::sock_filter {
                    code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 1,
                    k: libc::SYS_pivot_root as u32,
                },
                libc::sock_filter {
                    code: (libc::BPF_RET | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0x00050000 | libc::EPERM as u32,
                },
                libc::sock_filter {
                    code: (libc::BPF_RET | libc::BPF_K) as u16,
                    jt: 0,
                    jf: 0,
                    k: 0x7fff0000,
                },
            ];
            let program = libc::sock_fprog {
                len: filter.len() as u16,
                filter: filter.as_mut_ptr(),
            };
            if libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0
                || libc::prctl(libc::PR_SET_SECCOMP, 2, &program as *const libc::sock_fprog) != 0
            {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
    let output = command.output().unwrap();
    assert_eq!(
        output.status.code(),
        Some(nofy_isolation::RUNNER_FAILURE_EXIT_CODE)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains(nofy_isolation::RUNNER_FAILURE_MARKER),
        "{stderr}"
    );
    assert!(
        stderr.contains("required tree confinement failed"),
        "{stderr}"
    );
    assert!(!marker.exists());
}

#[test]
fn delegated_hardening() {
    let Ok(work) = std::env::var("NOFY_TREE_HARDENING_WORK") else {
        return;
    };
    let work = PathBuf::from(work);
    let own = fs::read_to_string("/proc/self/cgroup").unwrap();
    let unit = Path::new("/sys/fs/cgroup").join(
        own.lines()
            .find_map(|l| l.strip_prefix("0::"))
            .unwrap()
            .trim_start_matches('/'),
    );
    fs::create_dir(unit.join("kernel")).unwrap();
    fs::write(unit.join("kernel/cgroup.procs"), "0").unwrap();
    fs::write(unit.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let root = unit.join("jobs");
    fs::create_dir(&root).unwrap();
    fs::write(root.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let config = Config {
        cgroup_root: root,
        limits: Limits::default(),
    };
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES)
        .enable_all()
        .build()
        .unwrap();
    runtime.block_on(async {
        const TOKEN: &str = "hardening-test-access-not-a-real-secret";
        let auth = Authorizer::new(vec![(
            TOKEN.into(),
            [
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Resources,
                Scope::Execute,
            ]
            .into(),
        )])
        .unwrap();
        let host = KernelHost::open(&work.join("state"), Default::default(), auth)
            .await
            .unwrap()
            .with_loader_helper(Path::new(HELPER))
            .unwrap();
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let server = tokio::spawn(axum::serve(listener, host.router()).into_future());
        let stop = CancellationToken::new();
        let worker_host = host.clone();
        let worker_stop = stop.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await });

        let project = workspace(&work, "project");
        fs::create_dir_all(project.join(".git/hooks")).unwrap();
        fs::create_dir_all(project.join(".vscode")).unwrap();
        fs::create_dir_all(project.join(".claude/commands")).unwrap();
        fs::write(project.join(".git/hooks/pre-commit"), b"#!/bin/sh\necho orig\n").unwrap();
        fs::write(project.join(".git/config"), b"[core]\n\tbare = false\n").unwrap();
        fs::write(project.join(".bashrc"), b"# orig bashrc\n").unwrap();
        fs::write(project.join(".vscode/settings.json"), b"{\"safe\":true}\n").unwrap();
        fs::write(project.join(".mcp.json"), b"{\"mcpServers\":{}}\n").unwrap();
        fs::write(project.join(".claude/commands/check.md"), b"orig\n").unwrap();

        let local_paths: Vec<Value> = [
            ("/usr", true),
            ("/lib", true),
            ("/lib64", true),
            ("/etc/ld.so.cache", false),
        ]
        .into_iter()
        .filter(|(p, _)| Path::new(p).exists())
        .map(|(p, execute)| json!({"path": p, "execute": execute}))
        .collect();

        let build_doc = |dir: &Path, code: &str| {
            let r = |id: &str| json!({"id": id, "version": "1"});
            json!({
                "schema_version": 1,
                "name": "hardening-system",
                "modules": [
                    {"reference": r("code"), "factory": "resource.artifact", "config": {"bundle": {"schema_version": 1, "files": {"main.py": code}}}},
                    {"reference": r("env"), "factory": "resource.process_local", "config": {"executable": "/usr/bin/python3", "prefix_args": ["-S", "-s", "-B"], "env": {"PATH": "/usr/bin:/bin"}, "paths": local_paths}},
                    {"reference": r("limits"), "factory": "resource.process_tree_limits", "config": {"cgroup_root": config.cgroup_root}},
                    {"reference": r("project"), "factory": "resource.directory", "config": {"path": dir, "access": "read_write"}},
                    {"reference": r("tool"), "factory": "tool.process_tree_artifact", "config": {"contract": {"name": "probe", "timeout_ms": 30000}, "entrypoint": "main.py", "directories": {"PROJECT": "project"}}, "dependencies": {"environment": r("env"), "artifact": r("code"), "tree": r("limits"), "project": r("project")}}
                ],
                "programs": {
                    "probe": {
                        "kind": "tool",
                        "definition": {"name": "probe", "tool_packs": [r("tool")]},
                        "call": {"id": "probe", "name": "probe", "arguments": {}}
                    }
                }
            })
        };

        let run_doc = |base: String, doc: Value, id: String| async move {
            let client = reqwest::Client::new();
            let imported: Value = client
                .post(format!("{base}/api/v1/import"))
                .bearer_auth(TOKEN)
                .json(&doc)
                .send()
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            let release = imported["bundle"]["digest"].clone();
            let submit = client
                .post(format!("{base}/api/v1/runs"))
                .bearer_auth(TOKEN)
                .json(&json!({"run_id": id, "thread_id": id, "system": "hardening-system", "release": release, "program": "probe"}))
                .send()
                .await
                .unwrap();
            assert!(submit.status().is_success());
            tokio::time::timeout(Duration::from_secs(30), async {
                loop {
                    let record: Value = client
                        .get(format!("{base}/api/v1/runs/{id}"))
                        .bearer_auth(TOKEN)
                        .send()
                        .await
                        .unwrap()
                        .json()
                        .await
                        .unwrap();
                    if record["execution"]["status"].as_str().is_some_and(|s| {
                        matches!(s, "completed" | "failed" | "cancelled" | "uncertain" | "paused")
                    }) && matches!(
                        record["run"]["status"].as_str(),
                        Some("waiting" | "closed" | "cancelled" | "abandoned")
                    ) {
                        return record;
                    }
                    tokio::time::sleep(Duration::from_millis(20)).await;
                }
            })
            .await
            .unwrap()
        };

        #[cfg(target_arch = "x86_64")]
        let extra_x86_64: &[i64] = &[
            libc::SYS_chown,
            libc::SYS_lchown,
            libc::SYS_utime,
            libc::SYS_utimes,
            libc::SYS_futimesat,
        ];
        #[cfg(not(target_arch = "x86_64"))]
        let extra_x86_64: &[i64] = &[];
        let probe_code = format!(
            r#"import ctypes, errno, json, os
from pathlib import Path
root = Path(os.environ['NOFY_DIRECTORY_PROJECT'])
def refused(fn):
    try:
        fn()
        return False
    except OSError:
        return True

# Normal file in writable project succeeds.
(root / 'allowed.txt').write_text('ok')

# Existing MANDATORY_PROTECTED files and dirs are read-only and cannot be overwritten/removed/renamed.
for rel in ['.git/config', '.bashrc', '.mcp.json']:
    p = root / rel
    assert p.read_text(), rel
    assert refused(lambda p=p: p.write_text('pwned')), f'write {{rel}}'
    assert refused(lambda p=p: p.unlink()), f'unlink {{rel}}'
    assert refused(lambda p=p: p.rename(root / (p.name + '.moved'))), f'rename {{rel}}'
for rel, child in [('.git/hooks', 'post-checkout'), ('.vscode', 'tasks.json'), ('.claude/commands', 'evil.md')]:
    d = root / rel
    assert refused(lambda d=d, c=child: (d / c).write_text('pwned')), f'create {{rel}}/{{child}}'
    assert refused(lambda d=d: d.rmdir()), f'rmdir {{rel}}'
assert refused(lambda: (root / '.git/hooks/pre-commit').write_text('pwned'))

# Seccomp denies metadata/fallocate/userfaultfd syscalls even on writable files.
libc = ctypes.CDLL(None, use_errno=True)
def assert_eperm(nr, *args):
    ctypes.set_errno(0)
    res = libc.syscall(ctypes.c_long(nr), *(ctypes.c_long(a) for a in args))
    assert res == -1 and ctypes.get_errno() == errno.EPERM, (nr, res, ctypes.get_errno())

fd = os.open('/tmp/meta-test', os.O_CREAT | os.O_RDWR, 0o600)
path_b = ctypes.create_string_buffer(b'/tmp/meta-test')
attr_b = ctypes.create_string_buffer(b'user.nofy')
val_b = ctypes.create_string_buffer(b'1')
assert_eperm({fchmod}, fd, 0o777)
assert_eperm({fchmodat}, -100, ctypes.addressof(path_b), 0o777, 0)
assert_eperm(452, -100, ctypes.addressof(path_b), 0o777, 0)
assert_eperm({setxattr}, ctypes.addressof(path_b), ctypes.addressof(attr_b), ctypes.addressof(val_b), 1, 0)
assert_eperm({lsetxattr}, ctypes.addressof(path_b), ctypes.addressof(attr_b), ctypes.addressof(val_b), 1, 0)
assert_eperm({fsetxattr}, fd, ctypes.addressof(attr_b), ctypes.addressof(val_b), 1, 0)
assert_eperm({removexattr}, ctypes.addressof(path_b), ctypes.addressof(attr_b))
assert_eperm({lremovexattr}, ctypes.addressof(path_b), ctypes.addressof(attr_b))
assert_eperm({fremovexattr}, fd, ctypes.addressof(attr_b))
assert_eperm(463, -100, ctypes.addressof(path_b), 0, ctypes.addressof(attr_b), 0, 0)
assert_eperm(466, -100, ctypes.addressof(path_b), 0, ctypes.addressof(attr_b), 0)
assert_eperm({fallocate}, fd, 0, 0, 4096)
assert_eperm({userfaultfd}, 0)
for nr in {extra_x86_64:?}:
    assert_eperm(nr, ctypes.addressof(path_b), 0, 0)
os.close(fd)
print(json.dumps({{"hardened": True}}))
"#,
            fchmod = libc::SYS_fchmod,
            fchmodat = libc::SYS_fchmodat,
            setxattr = libc::SYS_setxattr,
            lsetxattr = libc::SYS_lsetxattr,
            fsetxattr = libc::SYS_fsetxattr,
            removexattr = libc::SYS_removexattr,
            lremovexattr = libc::SYS_lremovexattr,
            fremovexattr = libc::SYS_fremovexattr,
            fallocate = libc::SYS_fallocate,
            userfaultfd = libc::SYS_userfaultfd,
            extra_x86_64 = extra_x86_64,
        );

        let record = run_doc(base.clone(), build_doc(&project, &probe_code), "hardening-main".into()).await;
        assert_eq!(record["execution"]["status"], "completed", "{record}");
        let raw_out: Value = serde_json::from_str(
            record["execution"]["outcome"]["Completed"]["output"]
                .as_str()
                .unwrap(),
        )
        .unwrap();
        let out = raw_out.get("value").cloned().unwrap_or(raw_out);
        assert_eq!(out["hardened"], true, "{out}");
        assert_eq!(fs::read(project.join("allowed.txt")).unwrap(), b"ok");
        assert_eq!(fs::read(project.join(".bashrc")).unwrap(), b"# orig bashrc\n");
        assert_eq!(fs::read(project.join(".git/config")).unwrap(), b"[core]\n\tbare = false\n");
        assert!(!project.join(".git/hooks/post-checkout").exists());
        idle(&host.loader().process_trees).await;

        // A symlink at a MANDATORY_PROTECTED path must fail closed without executing the guest.
        let symlink_project = workspace(&work, "symlink-project");
        let outside = work.join("outside-target");
        fs::write(&outside, b"host-secret").unwrap();
        std::os::unix::fs::symlink(&outside, symlink_project.join(".bashrc")).unwrap();
        let bad_code = "import os\nfrom pathlib import Path\nPath(os.environ['NOFY_DIRECTORY_PROJECT'], 'ran').write_text('bad')\nprint('{}')\n";
        let failed = run_doc(base.clone(), build_doc(&symlink_project, bad_code), "hardening-symlink".into()).await;
        assert!(
            failed["execution"].to_string().contains("required tree confinement failed"),
            "{failed}"
        );
        assert!(!symlink_project.join("ran").exists());
        idle(&host.loader().process_trees).await;

        host.shutdown();
        stop.cancel();
        worker.await.unwrap().unwrap();
        server.abort();
        fs::write(work.join("hardening-passed.json"), b"{\"passed\":true}").unwrap();
    });
}

#[test]
fn real_process_tree_hardening_runs_in_separate_delegation() {
    let directory = tempfile::tempdir().unwrap();
    let output = Command::new("systemd-run")
        .args([
            "--user",
            "--wait",
            "--pipe",
            "--collect",
            "--quiet",
            "--property",
            "Delegate=yes",
            "--setenv",
        ])
        .arg(format!(
            "NOFY_TREE_HARDENING_WORK={}",
            directory.path().display()
        ))
        .arg(std::env::current_exe().unwrap())
        .args(["--exact", "delegated_hardening", "--nocapture"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        fs::read(directory.path().join("hardening-passed.json")).unwrap(),
        b"{\"passed\":true}"
    );
}
