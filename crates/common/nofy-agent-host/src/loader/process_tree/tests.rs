//! Physical controller tests run in their own transient delegated user service.
#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;
use std::{
    fs,
    process::{Command, Stdio},
    time::Duration,
};

#[test]
fn resource_validation_and_inherited_authority_are_pure_and_exact() {
    use nofy_agent_runtime::admission::CommitAdmission;
    let directory = tempfile::tempdir().unwrap();
    let loader = Loader::open(directory.path()).unwrap();
    let factory = Factory;
    let valid = json!({"cgroup_root":"/sys/fs/cgroup/absent-delegation/jobs"});
    let ModuleInstance::Resource(resource) = factory.build(&valid, &Default::default()).unwrap()
    else {
        panic!("resource")
    };
    let config = resource.get::<Config>().unwrap();
    assert_eq!(config.limits, Limits::default());
    assert!(config.preflight().is_err());
    for value in [
        json!({"cgroup_root":"/sys/fs/cgroup"}),
        json!({"cgroup_root":"/tmp/not-a-cgroup"}),
        json!({"cgroup_root":"/sys/fs/cgroup/a/../jobs"}),
        json!({"cgroup_root":"/sys/fs/cgroup/a//jobs"}),
        json!({"cgroup_root":"/sys/fs/cgroup/a/","unknown":1}),
        json!({"cgroup_root":"/sys/fs/cgroup/a","limits":{"max_processes":3}}),
        json!({"cgroup_root":"/sys/fs/cgroup/a","limits":{"max_memory_bytes":1}}),
        json!({"cgroup_root":"/sys/fs/cgroup/a","limits":{"cpu_percent":801}}),
        json!({"cgroup_root":"/sys/fs/cgroup/a","limits":{"max_processes":true}}),
        json!({"cgroup_root":"/sys/fs/cgroup/a","limits":{"unknown":1}}),
    ] {
        assert!(
            factory.build(&value, &Default::default()).is_err(),
            "{value}"
        );
    }
    let module = ModuleDefinition {
        reference: ModuleRef::new("tree", "1"),
        factory: FACTORY.into(),
        config: valid,
        dependencies: Default::default(),
    };
    let admission = admission::LoaderAdmission(loader);
    assert!(
        admission
            .permits_inherited(&[&module], "child", &[&module])
            .unwrap()
    );
    let mut upgrade = module.clone();
    upgrade.config["limits"] = json!({"max_processes":64});
    assert!(
        !admission
            .permits_inherited(&[&module], "child", &[&upgrade])
            .unwrap()
    );
    let permit = admission.enter().unwrap();
    assert!(permit.validate("publication", &[&module]).is_err());
    assert!(permit.validate("job", &[&module]).is_err());
    assert!(permit.validate("owner", &[&module]).is_ok());
    assert!(permit.validate("checkpoint", &[&module]).is_ok());
}

#[test]
fn malformed_active_lock_is_not_treated_as_a_live_owner_and_missing_intent_is_recoverable() {
    let directory = tempfile::tempdir().unwrap();
    let private = directory.path().join("journal");
    let manager = Manager::open(&private).unwrap();
    let unfinished = private.join("job-unfinished");
    fs::create_dir(&unfinished).unwrap();
    manager.recover().unwrap();
    assert!(!unfinished.exists());
    let malformed = private.join("job-invalid");
    fs::create_dir(&malformed).unwrap();
    let user_file = directory.path().join("untouched");
    fs::write(&user_file, b"preserve").unwrap();
    std::os::unix::fs::symlink(&user_file, malformed.join("active.lock")).unwrap();
    assert!(manager.recover().is_err());
    assert_eq!(fs::read(&user_file).unwrap(), b"preserve");
    assert_eq!(manager.pending().unwrap(), 1);
    // Reopen remains available to inspect state; only new tree authority fails.
    assert_eq!(Manager::open(&private).unwrap().pending().unwrap(), 1);
}

fn python(job: &Job, source: &str) -> std::process::Child {
    let mut command = Command::new("/usr/bin/python3");
    command
        .args(["-I", "-c", source])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    job.configure(&mut command).unwrap();
    command.spawn().unwrap()
}
fn wait_file(path: &Path) -> Value {
    let deadline = std::time::Instant::now() + Duration::from_secs(10);
    loop {
        if let Ok(bytes) = fs::read(path)
            && let Ok(value) = serde_json::from_slice(&bytes)
        {
            return value;
        }
        assert!(
            std::time::Instant::now() < deadline,
            "worker never wrote readiness evidence"
        );
        std::thread::sleep(Duration::from_millis(10));
    }
}
fn ready_source(path: &Path) -> String {
    format!(
        "import os,json,time\nfrom pathlib import Path\nchild=os.fork()\nif child==0:\n os.setsid()\n time.sleep(30)\n os._exit(0)\nPath({:?}).write_text(json.dumps({{'parent':os.getpid(),'child':child}}))\ntime.sleep(30)\n",
        path.to_str().unwrap()
    )
}

#[test]
fn crashed_owner_child() {
    let Ok(private) = std::env::var("NOFY_TREE_CRASH_STATE") else {
        return;
    };
    let config: Config =
        serde_json::from_str(&std::env::var("NOFY_TREE_CRASH_CONFIG").unwrap()).unwrap();
    let manager = Manager::open(Path::new(&private)).unwrap();
    let job = manager.acquire(&config).unwrap();
    let path = Path::new(&private)
        .parent()
        .unwrap()
        .join("crash-ready.json");
    let _process = python(&job, &ready_source(&path));
    wait_file(&path);
    fs::write(
        Path::new(&private)
            .parent()
            .unwrap()
            .join("crash-group.json"),
        serde_json::to_vec(&job.path()).unwrap(),
    )
    .unwrap();
    // The parent process really exits without Rust destructors. Recovery may
    // not confuse a completed run with this unknown live resource owner.
    std::process::exit(97);
}

#[test]
fn service_exercises_real_controllers_recovery_and_named_object_replacement() {
    let Ok(work) = std::env::var("NOFY_TREE_SERVICE_WORK") else {
        return;
    };
    let work = PathBuf::from(work);
    let own = fs::read_to_string("/proc/self/cgroup").unwrap();
    let relative = own
        .lines()
        .find_map(|l| l.strip_prefix("0::"))
        .unwrap()
        .trim_start_matches('/');
    let unit = Path::new("/sys/fs/cgroup").join(relative);
    let kernel = unit.join("kernel");
    fs::create_dir(&kernel).unwrap();
    fs::write(kernel.join("cgroup.procs"), "0").unwrap();
    fs::write(unit.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let root = unit.join("jobs");
    fs::create_dir(&root).unwrap();
    fs::write(root.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let config = Config {
        cgroup_root: root.clone(),
        limits: Limits {
            max_processes: 8,
            max_memory_bytes: 64 * 1024 * 1024,
            cpu_percent: 10,
        },
    };
    config.preflight().unwrap();
    let private = work.join("journal");
    let manager = Manager::open(&private).unwrap();
    let job = manager.acquire(&config).unwrap();
    assert_eq!(job.control("pids.max").unwrap().trim(), "8");
    assert_eq!(job.control("memory.max").unwrap().trim(), "67108864");
    assert_eq!(job.control("memory.swap.max").unwrap().trim(), "0");
    assert_eq!(job.control("memory.oom.group").unwrap().trim(), "1");
    assert_eq!(job.control("cpu.max").unwrap().trim(), "10000 100000");
    let path = job.path();
    let ready = work.join("pids-ready.json");
    let script = format!(
        "import subprocess,json,errno,time\nfrom pathlib import Path\nchildren=[]\nwhile True:\n try: children.append(subprocess.Popen(['/usr/bin/python3','-I','-c','import time; time.sleep(30)']))\n except OSError as e:\n  Path({:?}).write_text(json.dumps({{'errno':e.errno,'spawned':len(children)}}))\n  break\ntime.sleep(30)\n",
        ready.to_str().unwrap()
    );
    let mut process = python(&job, &script);
    let observed = wait_file(&ready);
    assert_eq!(observed["errno"], libc::EAGAIN);
    assert_eq!(job.control("pids.current").unwrap().trim(), "8");
    assert!(observed["spawned"].as_u64().unwrap() > 0);
    assert!(
        job.control("pids.events")
            .unwrap()
            .lines()
            .any(|line| line.starts_with("max ") && line != "max 0")
    );
    // A second manager may observe this tree but may not kill the live owner.
    Manager::open(&private).unwrap().recover().unwrap();
    assert!(process.try_wait().unwrap().is_none());
    job.finish().unwrap();
    assert!(!path.exists());
    assert!(!process.wait().unwrap().success());
    let job = manager.acquire(&config).unwrap();
    let mut cpu = python(
        &job,
        "import time\nend=time.monotonic()+0.6\nwhile time.monotonic()<end: pass\n",
    );
    assert!(cpu.wait().unwrap().success());
    let statistics = job.control("cpu.stat").unwrap();
    let throttled = statistics
        .lines()
        .find_map(|l| l.strip_prefix("nr_throttled "))
        .unwrap()
        .parse::<u64>()
        .unwrap();
    assert!(throttled > 0, "{statistics}");
    job.finish().unwrap();
    let job = manager.acquire(&config).unwrap();
    let mut memory = python(
        &job,
        "import time\nx=bytearray(256*1024*1024)\ntime.sleep(30)\n",
    );
    assert!(!memory.wait().unwrap().success());
    assert!(
        job.control("memory.events")
            .unwrap()
            .lines()
            .any(|line| line.starts_with("oom_kill ") && line != "oom_kill 0")
    );
    job.finish().unwrap();
    // Two physical owners are the cap across manager instances, not a sampled
    // count of process IDs or merely a per-future semaphore.
    let first = manager.acquire(&config).unwrap();
    let second = manager.acquire(&config).unwrap();
    assert!(Manager::open(&private).unwrap().acquire(&config).is_err());
    first.finish().unwrap();
    second.finish().unwrap();
    // Loss of an acquired identity cannot authorize deletion even for an empty
    // group. Restore the actual saved evidence, not a guessed replacement ID.
    let uncertain = manager.acquire(&config).unwrap();
    let group_path = uncertain.path();
    let record_path = private
        .join(group_path.file_name().unwrap())
        .join("record.json");
    let evidence = fs::read(&record_path).unwrap();
    let mut incomplete: Value = serde_json::from_slice(&evidence).unwrap();
    incomplete["group_identity"] = Value::Null;
    fs::write(&record_path, serde_json::to_vec(&incomplete).unwrap()).unwrap();
    drop(uncertain);
    assert!(manager.recover().is_err());
    assert!(manager.acquire(&config).is_err());
    assert!(group_path.is_dir());
    fs::write(record_path, evidence).unwrap();
    manager.recover().unwrap();
    assert!(!group_path.exists());
    // An actual abandoned process with a setsid descendant is recovered from
    // the original private record; no business work is redispatched.
    let output = Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "loader::process_tree::tests::crashed_owner_child",
            "--nocapture",
        ])
        .env("NOFY_TREE_CRASH_STATE", &private)
        .env(
            "NOFY_TREE_CRASH_CONFIG",
            serde_json::to_string(&config).unwrap(),
        )
        .output()
        .unwrap();
    assert_eq!(
        output.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let abandoned: PathBuf =
        serde_json::from_slice(&fs::read(work.join("crash-group.json")).unwrap()).unwrap();
    assert!(abandoned.exists());
    manager.recover().unwrap();
    assert!(!abandoned.exists());
    // Path replacement is not authority to terminate a new same-named group.
    let job = manager.acquire(&config).unwrap();
    let original = job.path();
    fs::remove_dir(&original).unwrap();
    fs::create_dir(&original).unwrap();
    let membership = fs::OpenOptions::new()
        .write(true)
        .open(original.join("cgroup.procs"))
        .unwrap();
    let mut replacement = Command::new("/usr/bin/python3");
    replacement.args(["-I", "-c", "import time; time.sleep(30)"]);
    use std::os::{fd::AsRawFd, unix::process::CommandExt};
    // Only a descriptor write between fork and exec; no allocator or path IO.
    unsafe {
        replacement.pre_exec(move || {
            if libc::write(membership.as_raw_fd(), b"0".as_ptr().cast(), 1) != 1 {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
    let mut replacement = replacement.spawn().unwrap();
    assert!(job.finish().is_err());
    assert!(manager.recover().is_err());
    assert!(original.is_dir());
    assert!(replacement.try_wait().unwrap().is_none());
    fs::write(original.join("cgroup.kill"), "1").unwrap();
    assert!(!replacement.wait().unwrap().success());
    fs::remove_dir(&original).unwrap();
    manager.recover().unwrap();
    assert!(!original.exists());
    assert_eq!(
        fs::read_dir(&root)
            .unwrap()
            .filter(|e| e.as_ref().unwrap().file_type().unwrap().is_dir())
            .count(),
        0
    );
    fs::write(
        work.join("passed.json"),
        b"{\"physical_cgroup_verified\":true}",
    )
    .unwrap();
}

#[test]
fn physical_process_tree_limits_and_crash_cleanup_run_in_a_real_delegated_user_service() {
    let directory = tempfile::tempdir().unwrap();
    let output = Command::new("systemd-run").args(["--user","--wait","--pipe","--collect","--quiet","--property","Delegate=yes",
        "--setenv"])
        .arg(format!("NOFY_TREE_SERVICE_WORK={}", directory.path().display()))
        .arg(std::env::current_exe().unwrap())
        .args(["--exact","loader::process_tree::tests::service_exercises_real_controllers_recovery_and_named_object_replacement","--nocapture"])
        .output().unwrap();
    assert!(
        output.status.success(),
        "delegated service failed: {}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        fs::read(directory.path().join("passed.json")).unwrap(),
        b"{\"physical_cgroup_verified\":true}"
    );
}
