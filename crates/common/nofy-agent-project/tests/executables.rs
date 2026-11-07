//! The executable flag is part of the source digest, so it must come from the
//! source and not from the machine that collected it. These tests build a fixed
//! source tree from code, declare its executable set explicitly, and pin the
//! digest as a literal: the same literal has to come out on Linux, macOS and
//! Windows. Nothing here relies on a host file mode except where a test sets one
//! on purpose to show it is ignored.
use nofy_agent_project::{repository::*, *};
use serde_json::json;
use std::{collections::BTreeMap, path::Path};

/// Every byte of the fixed tree. `data/blob.bin` is not UTF-8, so it travels as
/// base64.
const FILES: &[(&str, &[u8])] = &[
    (
        "module.json",
        br#"{"format":"nofy.module-package/v1","name":"golden","version":"1","parameters_schema":{"type":"object"},"modules":[],"exports":{}}"#,
    ),
    ("bin/run.sh", b"#!/bin/sh\nexec echo golden\n"),
    ("tools/setup.py", b"#!/usr/bin/env python3\nprint('setup')\n"),
    ("data/blob.bin", &[0, 255, 1, 2, 254]),
    ("README.md", b"# golden\n"),
];
/// The declared executable set. Everything else is not executable.
const EXECUTABLE: &[&str] = &["bin/run.sh", "tools/setup.py"];

/// The package digest of `FILES` with `EXECUTABLE` declared. Pinned from a
/// Linux run and re-derived independently from the digest rule (SHA-256 over
/// name, bytes and the executable byte of each file in path order); if any
/// platform computes another value the content address has become
/// host-dependent again.
const DECLARED_PACKAGE_DIGEST: &str =
    "0c8ad757ab6eed1e1cc14c0060f81ffb619a0f6977eaf630a4735c5afda02893";
/// The package digest of `FILES` with no declaration and `bin/run.sh` alone
/// flagged executable: the digest a Unix host has always given such a
/// directory, which a published package must keep.
const UNDECLARED_PACKAGE_DIGEST: &str =
    "3efc5db44ea4f75edd488158e8273f2a24acee7247b8bfaaa4bb5f49175d4cb3";
/// The project digest of the fixed project below with its declaration.
const DECLARED_PROJECT_DIGEST: &str =
    "44f4597c839cb400059a6367d05faf5f59ce0c2e0d04a7a0664af6364da8cecb";

fn package_in_memory(declare: bool) -> Source {
    let mut files = BTreeMap::new();
    for (path, bytes) in FILES {
        files.insert(
            (*path).to_owned(),
            File::bytes(bytes, !declare && *path == "bin/run.sh"),
        );
    }
    let mut source = Source {
        files,
        declaration: "module.json".into(),
        settings_json: None,
    };
    if declare {
        source.declare_executables(EXECUTABLE).unwrap();
    } else {
        source.refresh_manifest().unwrap();
    }
    source
}

fn write_tree(root: &Path, declaration: Option<&str>) {
    let mut names: Vec<String> = FILES.iter().map(|(path, _)| (*path).to_owned()).collect();
    for (path, bytes) in FILES {
        let full = root.join(path);
        std::fs::create_dir_all(full.parent().unwrap()).unwrap();
        std::fs::write(full, bytes).unwrap();
    }
    if let Some(text) = declaration {
        std::fs::write(root.join(EXECUTABLE_DECLARATION), text).unwrap();
        names.push(EXECUTABLE_DECLARATION.into());
    }
    names.push("source-files.json".into());
    std::fs::write(
        root.join("source-files.json"),
        serde_json::to_string(&names).unwrap(),
    )
    .unwrap();
}

/// Put every file's Unix mode at odds with `executable`, to show the modes are
/// not read. A no-op where the host has no modes.
#[cfg(unix)]
fn set_modes(root: &Path, executable: impl Fn(&str) -> bool) {
    use std::os::unix::fs::PermissionsExt;
    for (path, _) in FILES {
        let mode = if executable(path) { 0o755 } else { 0o644 };
        std::fs::set_permissions(root.join(path), std::fs::Permissions::from_mode(mode)).unwrap();
    }
}
#[cfg(not(unix))]
fn set_modes(_: &Path, _: impl Fn(&str) -> bool) {}

fn tar_entries(source: &Source) -> BTreeMap<String, u32> {
    let bytes = pack(source).unwrap();
    let mut archive = tar::Archive::new(flate2::read::GzDecoder::new(bytes.as_slice()));
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
fn a_declared_package_digests_the_same_on_every_host() {
    let literal = package_in_memory(true);
    assert_eq!(literal.digest().unwrap(), DECLARED_PACKAGE_DIGEST);
    assert_eq!(literal.executable_files(), EXECUTABLE);

    let dir = tempfile::tempdir().unwrap();
    // Hand-written bytes, not the canonical form: collection normalises both
    // files that are derived, so the digest does not depend on how they were typed.
    write_tree(dir.path(), Some(r#"[ "tools/setup.py", "bin/run.sh" ]"#));
    for mode_says_executable in [
        // modes that match the declaration, modes that contradict it, every file
        // executable, and none
        Box::new(|path: &str| EXECUTABLE.contains(&path)) as Box<dyn Fn(&str) -> bool>,
        Box::new(|path: &str| !EXECUTABLE.contains(&path)),
        Box::new(|_: &str| true),
        Box::new(|_: &str| false),
    ] {
        set_modes(dir.path(), mode_says_executable);
        let collected = load_package_directory(dir.path()).unwrap();
        assert_eq!(collected.digest().unwrap(), DECLARED_PACKAGE_DIGEST);
        assert_eq!(collected.executable_files(), EXECUTABLE);
        assert_eq!(collected.executable_origin(), ExecutableOrigin::Declared);
        assert_eq!(
            collected.raw(EXECUTABLE_DECLARATION).unwrap(),
            "[\n  \"bin/run.sh\",\n  \"tools/setup.py\"\n]\n"
        );
    }
}

#[test]
fn the_archive_mode_comes_from_the_flag_and_not_the_host() {
    let entries = tar_entries(&package_in_memory(true));
    assert_eq!(
        entries.keys().map(String::as_str).collect::<Vec<_>>(),
        [
            "README.md",
            "bin/run.sh",
            "data/blob.bin",
            "module.json",
            "source-executables.json",
            "source-files.json",
            "tools/setup.py",
        ]
    );
    for (path, mode) in entries {
        assert_eq!(
            mode,
            if EXECUTABLE.contains(&path.as_str()) {
                0o755
            } else {
                0o644
            },
            "{path}"
        );
    }
}

#[test]
fn an_undeclared_directory_keeps_the_rule_published_packages_were_made_with() {
    assert_eq!(
        package_in_memory(false).digest().unwrap(),
        UNDECLARED_PACKAGE_DIGEST
    );
    let dir = tempfile::tempdir().unwrap();
    write_tree(dir.path(), None);
    set_modes(dir.path(), |path| path == "bin/run.sh");
    let collected = load_package_directory(dir.path()).unwrap();
    if host_records_executable_bit() {
        // Unix: the mode decides, exactly as before, so the digest is unchanged.
        assert_eq!(collected.digest().unwrap(), UNDECLARED_PACKAGE_DIGEST);
        assert_eq!(collected.executable_files(), ["bin/run.sh"]);
        assert_eq!(collected.executable_origin(), ExecutableOrigin::HostMode);
    } else {
        // A host with no executable bit says so instead of pretending to know.
        assert!(collected.executable_files().is_empty());
        assert_eq!(collected.executable_origin(), ExecutableOrigin::Unavailable);
        assert_ne!(collected.digest().unwrap(), UNDECLARED_PACKAGE_DIGEST);
    }
}

#[test]
fn a_declaration_that_is_not_listed_is_refused_rather_than_ignored() {
    let dir = tempfile::tempdir().unwrap();
    write_tree(dir.path(), None);
    std::fs::write(dir.path().join(EXECUTABLE_DECLARATION), "[]").unwrap();
    let error = load_package_directory(dir.path()).unwrap_err();
    assert_eq!(error.code, "local_input");
    assert!(
        error.message.contains("does not list it"),
        "{}",
        error.message
    );
}

#[test]
fn a_malformed_declaration_is_refused() {
    for (text, expect) in [
        ("{}", "JSON array"),
        (r#"["bin/run.sh","bin/run.sh"]"#, "twice"),
        (r#"["not/there.sh"]"#, "does not list"),
        (r#"["../escape"]"#, "unsafe source path"),
        (r#"["source-executables.json"]"#, "cannot declare itself"),
    ] {
        let dir = tempfile::tempdir().unwrap();
        write_tree(dir.path(), Some(text));
        let error = load_package_directory(dir.path()).unwrap_err();
        assert_eq!(error.code, "local_input", "{text}");
        assert!(error.message.contains(expect), "{text}: {}", error.message);
    }
}

#[test]
fn flags_that_disagree_with_the_declaration_are_refused_until_the_manifest_is_refreshed() {
    let mut source = package_in_memory(true);
    source.files.get_mut("README.md").unwrap().executable = true;
    assert_eq!(complete(&source).unwrap_err().code, "local_input");
    assert!(
        pack(&source)
            .unwrap_err()
            .message
            .contains("disagrees with the executable flags of: README.md")
    );
    // The declaration follows the files when the manifest is refreshed.
    source.refresh_manifest().unwrap();
    complete(&source).unwrap();
    assert_eq!(
        source.executable_files(),
        ["README.md", "bin/run.sh", "tools/setup.py"]
    );
    assert!(
        source
            .raw(EXECUTABLE_DECLARATION)
            .unwrap()
            .contains("README.md")
    );
}

#[test]
fn refreshing_the_manifest_leaves_an_undeclared_source_exactly_as_it_was() {
    let mut source = package_in_memory(false);
    let before = source.digest().unwrap();
    source.refresh_manifest().unwrap();
    assert_eq!(source.digest().unwrap(), before);
    assert!(!source.files.contains_key(EXECUTABLE_DECLARATION));
}

#[test]
fn declaring_replaces_the_set_and_refuses_what_the_source_does_not_hold() {
    let mut source = package_in_memory(true);
    source.declare_executables(&["README.md"]).unwrap();
    assert_eq!(source.executable_files(), ["README.md"]);
    source.declare_executables::<&str>(&[]).unwrap();
    assert!(source.executable_files().is_empty());
    assert_eq!(source.raw(EXECUTABLE_DECLARATION).unwrap(), "[]\n");
    complete(&source).unwrap();
    for bad in ["missing.sh", "../escape", EXECUTABLE_DECLARATION] {
        let error = source.declare_executables(&[bad]).unwrap_err();
        assert_eq!(error.code, "local_input", "{bad}");
    }
    // Declaring the same set again from the literal source gives the pinned digest.
    source.declare_executables(EXECUTABLE).unwrap();
    assert_eq!(source.digest().unwrap(), DECLARED_PACKAGE_DIGEST);
}

#[test]
fn a_reader_that_reports_other_modes_cannot_change_a_declared_package() {
    // A Git tree reports its own modes; a declared package ignores them as well.
    for reported in [true, false] {
        let source = package_from_reader(|path| {
            let name = path;
            if name == "source-files.json" {
                let mut names: Vec<_> = FILES.iter().map(|(p, _)| (*p).to_owned()).collect();
                names.push(EXECUTABLE_DECLARATION.into());
                names.push("source-files.json".into());
                return Ok(File::text(serde_json::to_string(&names).unwrap()));
            }
            if name == EXECUTABLE_DECLARATION {
                return Ok(File::bytes(
                    serde_json::to_string(&EXECUTABLE).unwrap().as_bytes(),
                    reported,
                ));
            }
            match FILES.iter().find(|(p, _)| *p == name) {
                Some((_, bytes)) => Ok(File::bytes(bytes, reported)),
                None => Err(Error::new("not_found", "missing")),
            }
        })
        .unwrap();
        assert_eq!(source.digest().unwrap(), DECLARED_PACKAGE_DIGEST);
    }
}

/// A project directory: `load_directory` rather than the package collector.
fn project_in_memory() -> Source {
    let mut source = Source::empty("coder", "coder").unwrap();
    source.files.insert(
        "scripts/run.sh".into(),
        File::bytes(b"#!/bin/sh\n:\n", false),
    );
    source
        .files
        .insert("scripts/plain.txt".into(), File::text("plain\n"));
    source.declare_executables(&["scripts/run.sh"]).unwrap();
    source
}

#[test]
fn a_declared_project_directory_round_trips_with_the_same_digest_on_every_host() {
    let source = project_in_memory();
    assert_eq!(source.digest().unwrap(), DECLARED_PROJECT_DIGEST);
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("project");
    write_directory(&path, &source, None).unwrap();
    assert_eq!(
        load_directory(&path).unwrap().digest().unwrap(),
        DECLARED_PROJECT_DIGEST
    );
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        // A Unix host writes the bit as well, for people who run the files.
        let mode = |name: &str| path.join(name).metadata().unwrap().permissions().mode() & 0o777;
        assert_eq!(mode("scripts/run.sh"), 0o755);
        assert_eq!(mode("scripts/plain.txt"), 0o644);
        // And then ignores what the files say when it reads the directory back.
        std::fs::set_permissions(
            path.join("scripts/run.sh"),
            std::fs::Permissions::from_mode(0o600),
        )
        .unwrap();
        std::fs::set_permissions(
            path.join("scripts/plain.txt"),
            std::fs::Permissions::from_mode(0o777),
        )
        .unwrap();
    }
    let reloaded = load_directory(&path).unwrap();
    assert_eq!(reloaded.digest().unwrap(), DECLARED_PROJECT_DIGEST);
    assert_eq!(reloaded.executable_files(), ["scripts/run.sh"]);
}

#[test]
fn a_host_with_no_executable_bit_will_not_write_one_it_cannot_keep() {
    let mut undeclared = Source::empty("coder", "coder").unwrap();
    undeclared
        .files
        .insert("run.sh".into(), File::bytes(b"#!/bin/sh\n", true));
    undeclared.refresh_manifest().unwrap();
    let dir = tempfile::tempdir().unwrap();
    let result = write_directory(&dir.path().join("undeclared"), &undeclared, None);
    // Unix keeps the bit in the file mode; elsewhere nothing would keep it, so the
    // write is refused instead of silently producing a directory with another digest.
    assert_eq!(result.is_ok(), host_records_executable_bit());
    if let Err(error) = result {
        assert_eq!(error.code, "local_input");
        assert!(error.message.contains("run.sh"), "{}", error.message);
        assert!(
            error.message.contains(EXECUTABLE_DECLARATION),
            "{}",
            error.message
        );
    }
    // With the declaration the bit travels in the directory on every host.
    let mut declared = undeclared.clone();
    declared.declare_executables(&["run.sh"]).unwrap();
    let path = dir.path().join("declared");
    write_directory(&path, &declared, None).unwrap();
    assert_eq!(
        load_directory(&path).unwrap().digest().unwrap(),
        declared.digest().unwrap()
    );
}

#[test]
fn the_declaration_file_is_ordinary_content_to_the_wire_format() {
    // Nothing about the wire format changed: a File still has exactly the three
    // fields, and the declaration is one more file in `files`.
    let source = package_in_memory(true);
    let wire = serde_json::to_value(&source).unwrap();
    assert_eq!(
        wire["files"]["bin/run.sh"],
        json!({"encoding":"utf8","content":"#!/bin/sh\nexec echo golden\n","executable":true})
    );
    assert_eq!(wire["files"][EXECUTABLE_DECLARATION]["executable"], false);
    let back: Source = serde_json::from_value(wire).unwrap();
    assert_eq!(back.digest().unwrap(), DECLARED_PACKAGE_DIGEST);
}
