//! Actual namespace/cgroup lifecycle, never an unconfined Agent tool.
#![cfg(target_os = "linux")]
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
            if let Ok(bytes) = fs::read(path) {
                if let Ok(value) = serde_json::from_slice(&bytes) {
                    return value;
                }
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
    let mut command = Command::new(HELPER);
    command.args(["__nofy_process_tree_v1", &wire]);
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
    assert_eq!(output.status.code(), Some(125));
    assert!(String::from_utf8_lossy(&output.stderr).contains("bootstrap failed"));
    assert!(!marker.exists());
    for wire in [
        "{}".to_owned(),
        json!({"parent_pid":0,"program":"/usr/bin/true","arguments":[],"environment":{},"cwd":"/"})
            .to_string(),
    ] {
        assert_eq!(
            Command::new(HELPER)
                .args(["__nofy_process_tree_v1", &wire])
                .status()
                .unwrap()
                .code(),
            Some(125)
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
