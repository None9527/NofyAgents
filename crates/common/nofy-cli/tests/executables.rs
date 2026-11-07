//! `--executable` and `--no-executable` on the commands that collect a directory.
//! They run the real `nofy` binary against local projects with `--offline`, so no
//! kernel is needed. Where a test looks at a host file mode it is only to show
//! that the declared answer ignores it.
use nofy_agent_project::{
    EXECUTABLE_DECLARATION, ExecutableOrigin, File, Source, host_records_executable_bit,
    load_directory, write_directory,
};
use std::{collections::BTreeMap, path::Path, process::Command};

const TOKEN: &str = "executables-test-token-0000000000000000000001";
const OFFLINE: &str = "http://127.0.0.1:1";

struct Run {
    code: i32,
    stdout: String,
    stderr: String,
}
fn nofy(args: &[&str]) -> Run {
    let config = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(config.path(), "[profiles.local]\n").unwrap();
    let output = Command::new(env!("CARGO_BIN_EXE_nofy"))
        .env("NOFY_TOKEN_FOR_TEST", TOKEN)
        .env_remove("NOFY_CONFIG")
        .env_remove("NOFY_PROFILE")
        .args(["--endpoint", OFFLINE])
        .args([
            "--config",
            config.path().to_str().unwrap(),
            "--token-env",
            "NOFY_TOKEN_FOR_TEST",
            "--format",
            "json",
        ])
        .args(args)
        .output()
        .unwrap();
    Run {
        code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
    }
}
fn ok(args: &[&str]) -> Run {
    let run = nofy(args);
    assert_eq!(run.code, 0, "{}\n{}", run.stdout, run.stderr);
    run
}

/// A project with one script and one text file, neither declared.
fn project(root: &Path) -> String {
    let mut source = Source::empty("coder", "coder").unwrap();
    source.files.insert(
        "scripts/run.sh".into(),
        File::bytes(b"#!/bin/sh\necho run\n", false),
    );
    source
        .files
        .insert("scripts/note.txt".into(), File::text("note\n"));
    source.refresh_manifest().unwrap();
    let path = root.join("project");
    write_directory(&path, &source, None).unwrap();
    set_mode(&path.join("scripts/run.sh"), 0o755);
    path.to_str().unwrap().to_owned()
}
#[cfg(unix)]
fn set_mode(path: &Path, mode: u32) {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(mode)).unwrap();
}
#[cfg(not(unix))]
fn set_mode(_: &Path, _: u32) {}

fn archive_modes(path: &Path) -> BTreeMap<String, u32> {
    let file = std::fs::File::open(path).unwrap();
    let mut archive = tar::Archive::new(flate2::read::GzDecoder::new(file));
    archive
        .entries()
        .unwrap()
        .map(|entry| {
            let entry = entry.unwrap();
            (
                entry.path().unwrap().to_string_lossy().into_owned(),
                entry.header().mode().unwrap(),
            )
        })
        .collect()
}

#[test]
fn executable_names_the_complete_set_and_the_archive_is_the_same_whatever_the_host_says() {
    let dir = tempfile::tempdir().unwrap();
    let project = project(dir.path());
    let mut archives = vec![];
    // Modes that match the flag, then modes that contradict it.
    for (run_mode, note_mode) in [(0o755, 0o644), (0o600, 0o777)] {
        set_mode(&Path::new(&project).join("scripts/run.sh"), run_mode);
        set_mode(&Path::new(&project).join("scripts/note.txt"), note_mode);
        let archive = dir.path().join(format!("{run_mode:o}.tar.gz"));
        let run = ok(&[
            "project",
            "pack",
            &project,
            "--executable",
            "scripts/run.sh",
            "--output",
            archive.to_str().unwrap(),
        ]);
        // Declared, so there is nothing host-dependent to warn about.
        assert!(run.stderr.is_empty(), "{}", run.stderr);
        let modes = archive_modes(&archive);
        assert_eq!(modes["scripts/run.sh"], 0o755, "{modes:?}");
        assert_eq!(modes["scripts/note.txt"], 0o644, "{modes:?}");
        assert_eq!(modes[EXECUTABLE_DECLARATION], 0o644, "{modes:?}");
        archives.push(modes);
    }
    assert_eq!(archives[0], archives[1]);
}

#[test]
fn without_a_flag_the_host_decides_as_before_and_the_note_says_so() {
    let dir = tempfile::tempdir().unwrap();
    let project = project(dir.path());
    let archive = dir.path().join("plain.tar.gz");
    let run = ok(&[
        "project",
        "pack",
        &project,
        "--output",
        archive.to_str().unwrap(),
    ]);
    let modes = archive_modes(&archive);
    // No declaration is added behind the user's back.
    assert!(!modes.contains_key(EXECUTABLE_DECLARATION), "{modes:?}");
    if host_records_executable_bit() {
        assert_eq!(modes["scripts/run.sh"], 0o755);
        assert!(
            run.stderr.contains("scripts/run.sh") && run.stderr.contains("file modes"),
            "{}",
            run.stderr
        );
    } else {
        assert_eq!(modes["scripts/run.sh"], 0o644);
        assert!(
            run.stderr.contains("no executable bit") && run.stderr.contains("scripts/run.sh"),
            "{}",
            run.stderr
        );
    }
    assert_eq!(modes["scripts/note.txt"], 0o644);
}

#[test]
fn no_executable_declares_that_nothing_is() {
    let dir = tempfile::tempdir().unwrap();
    let project = project(dir.path());
    let archive = dir.path().join("none.tar.gz");
    ok(&[
        "project",
        "pack",
        &project,
        "--no-executable",
        "--output",
        archive.to_str().unwrap(),
    ]);
    let modes = archive_modes(&archive);
    assert!(modes.values().all(|mode| *mode == 0o644), "{modes:?}");
    assert!(modes.contains_key(EXECUTABLE_DECLARATION), "{modes:?}");
}

#[test]
fn a_flag_with_nothing_to_apply_to_is_an_error_not_a_silent_no_op() {
    let dir = tempfile::tempdir().unwrap();
    let project = project(dir.path());
    let archive = dir.path().join("never.tar.gz");
    let output = archive.to_str().unwrap();
    for (args, expect) in [
        (
            vec!["agent", "list", "--executable", "scripts/run.sh"],
            "--project or --directory",
        ),
        (
            vec![
                "project",
                "pack",
                &project,
                "--source-executable",
                "/nope",
                "--output",
                output,
            ],
            "matches no --source",
        ),
        (
            vec![
                "project",
                "pack",
                &project,
                "--executable",
                "scripts/missing.sh",
                "--output",
                output,
            ],
            "scripts/missing.sh",
        ),
    ] {
        let run = nofy(&args);
        assert_ne!(run.code, 0, "{args:?}");
        assert!(run.stdout.contains(expect), "{args:?}: {}", run.stdout);
    }
    assert!(!archive.exists());
    // The two flags contradict each other.
    let run = nofy(&[
        "project",
        "pack",
        &project,
        "--executable",
        "scripts/run.sh",
        "--no-executable",
        "--output",
        output,
    ]);
    assert_ne!(run.code, 0);
}

#[test]
fn a_source_file_declared_executable_is_kept_by_the_project_directory() {
    let dir = tempfile::tempdir().unwrap();
    let project = dir.path().join("project");
    let p = project.to_str().unwrap();
    ok(&["project", "init", p, "--empty", "--agent", "coder"]);
    let code = dir.path().join("method.rhai");
    std::fs::write(&code, "args.value * 2").unwrap();
    let binding = format!("/source=@{}", code.display());
    ok(&[
        "agent",
        "module",
        "add",
        "coder",
        "--project",
        p,
        "--offline",
        "--id",
        "tools/read",
        "--factory",
        "tool.rhai",
        "--slot",
        "tool_packs",
        "--source",
        &binding,
        "--source-executable",
        "/source",
    ]);
    let source = load_directory(&project).unwrap();
    let kept: Vec<_> = source
        .executable_files()
        .into_iter()
        .filter(|path| path.ends_with("method.rhai"))
        .collect();
    assert_eq!(kept.len(), 1, "{:?}", source.executable_files());
    // The directory carries the answer in a declaration, so another host reads
    // the same flag back even where the file cannot hold an executable bit.
    assert_eq!(source.executable_origin(), ExecutableOrigin::Declared);
    assert!(
        source
            .raw(EXECUTABLE_DECLARATION)
            .unwrap()
            .contains("method.rhai")
    );
}
