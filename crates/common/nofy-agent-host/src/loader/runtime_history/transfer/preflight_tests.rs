use super::*;
use std::io::{Error, ErrorKind};

fn queries(path: &str) -> Vec<PathBuf> {
    let mut queried = Vec::new();
    preflight_directory_with(Path::new(path), |candidate| {
        queried.push(candidate.to_owned());
        Err(Error::from(ErrorKind::NotFound))
    })
    .unwrap();
    queried
}

#[test]
fn native_component_queries_preserve_complete_roots_and_every_ancestor() {
    #[cfg(windows)]
    let cases: &[(&str, &[&str])] = &[
        (r"C:\one\two", &[r"C:\", r"C:\one", r"C:\one\two"]),
        (r"C:\", &[r"C:\"]),
        (
            r"\\?\C:\one\two",
            &[r"\\?\C:\", r"\\?\C:\one", r"\\?\C:\one\two"],
        ),
        (r"\\?\C:\", &[r"\\?\C:\"]),
        (
            r"\\server\share\one\two",
            &[
                r"\\server\share\",
                r"\\server\share\one",
                r"\\server\share\one\two",
            ],
        ),
        (r"\\server\share\", &[r"\\server\share\"]),
        (r"\\server\share", &[r"\\server\share\"]),
        (
            r"\\?\UNC\server\share\one\two",
            &[
                r"\\?\UNC\server\share\",
                r"\\?\UNC\server\share\one",
                r"\\?\UNC\server\share\one\two",
            ],
        ),
        (r"\\?\UNC\server\share\", &[r"\\?\UNC\server\share\"]),
        // Verbatim paths do not synthesize an implicit RootDir.
        (r"\\?\UNC\server\share", &[r"\\?\UNC\server\share"]),
        (r"C:", &[r"C:"]),
        (r"C:relative", &[r"C:", r"C:relative"]),
        (r"\\?\C:", &[r"\\?\C:"]),
        // Non-disk/share namespaces retain their original query sequence.
        (
            r"\\.\device\child",
            &[r"\\.\device", r"\\.\device\", r"\\.\device\child"],
        ),
        (
            r"\\?\GLOBALROOT\Device",
            &[
                r"\\?\GLOBALROOT",
                r"\\?\GLOBALROOT\",
                r"\\?\GLOBALROOT\Device",
            ],
        ),
    ];
    #[cfg(not(windows))]
    let cases: &[(&str, &[&str])] = &[
        ("/one/two", &["/", "/one", "/one/two"]),
        ("/", &["/"]),
        ("relative/child", &["relative", "relative/child"]),
        (
            "/missing/../existing",
            &["/", "/missing", "/missing/..", "/missing/../existing"],
        ),
    ];
    for (path, expected) in cases {
        let actual = queries(path);
        // Compare raw spellings, not Path equality (which normalizes components).
        assert_eq!(
            actual.iter().map(|p| p.as_os_str()).collect::<Vec<_>>(),
            expected
                .iter()
                .map(std::ffi::OsStr::new)
                .collect::<Vec<_>>(),
            "{path}"
        );
    }
}

#[test]
fn canonical_tempdir_and_missing_tail_are_preflighted_without_creation() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    #[cfg(windows)]
    assert!(matches!(
        dir.path().components().next(),
        Some(Component::Prefix(prefix)) if matches!(prefix.kind(), std::path::Prefix::VerbatimDisk(_))
    ));
    preflight_directory_with(dir.path(), |p| p.symlink_metadata()).unwrap();
    let missing = dir.path().join("absent").join("child");
    preflight_directory_with(&missing, |p| p.symlink_metadata()).unwrap();
    assert!(!missing.exists());
}

#[test]
fn real_file_components_are_rejected() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let file = dir.path().join("file");
    std::fs::write(&file, b"not a directory").unwrap();
    for path in [file.clone(), file.join("child")] {
        assert!(matches!(
            preflight_directory_with(&path, |p| p.symlink_metadata()),
            Err(HostError::Invalid(_))
        ));
    }
}

#[test]
fn real_directory_symlink_components_are_rejected() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let target = dir.path().join("target");
    let link = dir.path().join("link");
    std::fs::create_dir(&target).unwrap();
    #[cfg(unix)]
    std::os::unix::fs::symlink(&target, &link).unwrap();
    #[cfg(windows)]
    std::os::windows::fs::symlink_dir(&target, &link)
        .expect("native acceptance requires directory symlink creation; no privilege skip");
    assert!(link.symlink_metadata().unwrap().file_type().is_symlink());
    for path in [link.clone(), link.join("child")] {
        assert!(matches!(
            preflight_directory_with(&path, |p| p.symlink_metadata()),
            Err(HostError::Invalid(_))
        ));
    }
}

#[test]
fn permission_and_unexpected_io_errors_propagate_even_after_missing_components() {
    for error in [
        Error::new(ErrorKind::PermissionDenied, "preflight permission sentinel"),
        Error::other("preflight unexpected sentinel"),
        Error::from_raw_os_error(1),
    ] {
        let expected = error.to_string();
        let mut error = Some(error);
        let mut count = 0;
        let result = preflight_directory_with(Path::new("missing/child/later"), |_| {
            count += 1;
            if count == 1 {
                Err(Error::from(ErrorKind::NotFound))
            } else {
                Err(error.take().unwrap())
            }
        });
        assert_eq!(
            count, 2,
            "must continue after NotFound, stop on other errors"
        );
        match result {
            Err(HostError::Unavailable(message)) => {
                assert!(message.contains(&expected), "{message}")
            }
            other => panic!("expected propagated storage error, got {other:?}"),
        }
    }
}

#[test]
fn a_missing_component_does_not_hide_a_later_unsafe_component() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let file = dir.path().join("file");
    std::fs::write(&file, b"not a directory").unwrap();
    let mut count = 0;
    let result = preflight_directory_with(Path::new("missing/../file"), |_| {
        count += 1;
        if count < 3 {
            Err(Error::from(ErrorKind::NotFound))
        } else {
            file.symlink_metadata()
        }
    });
    assert_eq!(count, 3);
    assert!(matches!(result, Err(HostError::Invalid(_))));
}

#[cfg(windows)]
#[test]
fn real_directory_junction_components_are_rejected() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let target = dir.path().join("junction-target");
    let link = dir.path().join("junction");
    std::fs::create_dir(&target).unwrap();
    let output = std::process::Command::new("cmd.exe")
        .args(["/D", "/C", "mklink", "/J"])
        .arg(&link)
        .arg(&target)
        .output()
        .expect("create native junction without changing privileges");
    assert!(
        output.status.success(),
        "junction creation failed: {} {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    for path in [link.clone(), link.join("child")] {
        assert!(matches!(
            preflight_directory_with(&path, |p| p.symlink_metadata()),
            Err(HostError::Invalid(_))
        ));
    }
}

#[test]
fn complete_root_metadata_is_never_skipped() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let file = dir.path().join("file");
    std::fs::write(&file, b"not a directory").unwrap();
    let root = dir.path().ancestors().last().unwrap();
    let mut queried = Vec::new();
    let result = preflight_directory_with(root, |candidate| {
        queried.push(candidate.to_owned());
        file.symlink_metadata()
    });
    assert_eq!(queried, vec![root.to_owned()]);
    assert!(matches!(result, Err(HostError::Invalid(_))));
}
