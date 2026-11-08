use super::*;
use nofy_agent_runtime::admission::CommitAdmission;
use std::collections::BTreeMap;

mod syntax;

fn definition(path: &Path, access: &str) -> ModuleDefinition {
    serde_json::from_value(json!({"reference":{"id":"project","version":"1"},
        "factory":"resource.directory","config":{"path":path,"access":access}}))
    .unwrap()
}

#[test]
fn preview_is_pure_and_rejects_unsafe_or_unknown_directory_configuration() {
    let private = nofy_test_support::canonical_tempdir().unwrap();
    let public = nofy_test_support::canonical_tempdir().unwrap();
    let factory = Factory::new(private.path().into());
    let missing = public.path().join("missing");
    assert!(
        factory
            .build(
                &json!({"path":missing,"access":"read_only"}),
                &BTreeMap::new()
            )
            .is_ok()
    );
    assert!(!missing.exists());
    for value in [
        json!({"path":public.path().ancestors().last().unwrap(),"access":"read_only"}),
        json!({"path":"relative","access":"read_only"}),
        json!({"path":private.path(),"access":"read_only"}),
        json!({"path":private.path().join("catalog"),"access":"read_only"}),
        json!({"path":private.path().parent().unwrap(),"access":"read_only"}),
        json!({"path":"/proc/self/fd/3","access":"read_only"}),
        json!({"path":public.path().join("../other"),"access":"read_only"}),
        json!({"path":public.path(),"access":"write"}),
        json!({"path":public.path(),"access":"read_only","unknown":true}),
    ] {
        assert!(factory.build(&value, &BTreeMap::new()).is_err(), "{value}");
    }
}

#[test]
fn unavailable_directory_blocks_new_authority_but_not_owned_receipts_or_pure_inheritance() {
    let private = nofy_test_support::canonical_tempdir().unwrap();
    let public = nofy_test_support::canonical_tempdir().unwrap();
    let loader = Loader::open(private.path()).unwrap();
    let policy = super::super::admission::LoaderAdmission(loader);
    let original = definition(&public.path().join("missing"), "read_only");
    let stronger = definition(&public.path().join("missing"), "read_write");
    let executable = definition(&public.path().join("missing"), "read_write_execute");
    let other = definition(public.path(), "read_only");
    let permit = policy.enter().unwrap();
    for kind in ["publication", "job"] {
        let admitted = permit.validate(kind, &[&other]);
        if cfg!(windows) {
            assert!(admitted.is_err(), "{kind}");
        } else {
            admitted.unwrap();
        }
    }
    for kind in ["publication", "job"] {
        assert!(permit.validate(kind, &[&original]).is_err(), "{kind}");
    }
    for kind in ["owner", "checkpoint", "child", "execution"] {
        permit.validate(kind, &[&original]).unwrap();
    }
    for kind in ["checkpoint", "child"] {
        assert!(
            policy
                .permits_inherited(&[&original], kind, &[&original])
                .unwrap()
        );
        for changed in [&stronger, &executable, &other] {
            assert!(
                !policy
                    .permits_inherited(&[&original], kind, &[changed])
                    .unwrap()
            );
        }
        assert!(!policy.permits_inherited(&[], kind, &[&original]).unwrap());
        assert!(
            !policy
                .permits_inherited(&[&stronger], kind, &[&executable])
                .unwrap()
        );
    }
    assert!(!public.path().join("missing").exists());
}

/// `Grant::open` hands the opened directory to Landlock and exists on Linux only;
/// `unit_directory_and_local_mount_descriptors` (platform_skips.rs) stands in for
/// this test elsewhere.
#[cfg(target_os = "linux")]
#[test]
fn opened_descriptor_pins_the_authorized_directory_and_retargeted_aliases_fail_closed() {
    use std::os::{
        fd::AsFd,
        unix::fs::{MetadataExt, symlink},
    };
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
    let root = public.path().join("project");
    std::fs::create_dir(&root).unwrap();
    let grant = Grant {
        path: root.clone(),
        access: Access::ReadWrite,
    };
    let descriptor = grant.open(private.path()).unwrap();
    let file = std::fs::File::from(descriptor.as_fd().try_clone_to_owned().unwrap());
    let original = file.metadata().unwrap().ino();
    std::fs::rename(&root, public.path().join("moved")).unwrap();
    symlink(private.path(), &root).unwrap();
    assert!(grant.preflight(private.path()).is_err());
    assert!(grant.open(private.path()).is_err());
    assert_eq!(file.metadata().unwrap().ino(), original);
    assert_ne!(original, std::fs::metadata(private.path()).unwrap().ino());
}

#[test]
fn canonical_directory_preflight_checks_existing_directory_and_prepare_rechecks() {
    let private = nofy_test_support::canonical_tempdir().unwrap();
    let public = nofy_test_support::canonical_tempdir().unwrap();
    let path = public.path().join("project");
    std::fs::create_dir(&path).unwrap();
    let path = std::fs::canonicalize(path).unwrap();
    for access in [
        Access::ReadOnly,
        Access::ReadWrite,
        Access::ReadWriteExecute,
    ] {
        let directory = Directory {
            grant: Grant {
                path: path.clone(),
                access,
            },
            private_root: private.path().to_owned(),
        };
        assert_eq!(directory.declaration().path, path);
        assert_eq!(
            directory.requires_tree(),
            matches!(access, Access::ReadWriteExecute)
        );
        if cfg!(windows) {
            assert!(matches!(
                directory.prepare(),
                Err(HostError::Unavailable(message))
                    if message.contains("Windows protected-path identity")
            ));
        } else {
            assert_eq!(directory.prepare().unwrap().path, path);
        }
        assert_eq!(directory.declaration().path, path);
        assert_eq!(std::fs::canonicalize(&path).unwrap(), path);
        assert!(path.is_dir());
        assert_eq!(std::fs::read_dir(&path).unwrap().count(), 0);
    }
    let grant = Grant {
        path: path.clone(),
        access: Access::ReadOnly,
    };
    if cfg!(windows) {
        assert!(matches!(
            grant.preflight(private.path()),
            Err(HostError::Unavailable(message))
                if message.contains("Windows protected-path identity")
        ));
    } else {
        grant.preflight(private.path()).unwrap();
    }
    std::fs::remove_dir(&path).unwrap();
    assert!(grant.validate(private.path()).is_ok());
    assert!(grant.preflight(private.path()).is_err());
    // Declaration is still pure, but a replacement file is not a directory.
    std::fs::write(&path, b"not a directory").unwrap();
    assert!(grant.validate(private.path()).is_ok());
    assert!(grant.preflight(private.path()).is_err());
}

#[test]
fn pure_preview_does_not_read_private_storage_or_create_a_missing_directory() {
    let root = nofy_test_support::canonical_tempdir().unwrap();
    let private = root.path().join("private-missing");
    let public = root.path().join("public-missing");
    let factory = Factory::new(private.clone());
    for access in ["read_only", "read_write", "read_write_execute"] {
        factory
            .build(&json!({"path":public,"access":access}), &BTreeMap::new())
            .unwrap();
    }
    assert!(!private.exists());
    assert!(!public.exists());
}

/// Creating symlinks is an unconditional Unix capability. Windows needs a
/// privilege or developer mode, so this is not a silently skipped Windows test;
/// Windows reparse-point execution coverage remains a separate native follow-up.
#[cfg(unix)]
#[test]
fn preflight_rejects_final_and_ancestor_symlinks_even_to_public_directories() {
    use std::os::unix::fs::symlink;
    let private = nofy_test_support::canonical_tempdir().unwrap();
    let public = nofy_test_support::canonical_tempdir().unwrap();
    let project = public.path().join("project");
    std::fs::create_dir(&project).unwrap();
    let child = project.join("child");
    std::fs::create_dir(&child).unwrap();
    let alias = public.path().join("alias");
    symlink(&project, &alias).unwrap();
    for path in [&alias, &alias.join("child")] {
        let grant = Grant {
            path: path.to_owned(),
            access: Access::ReadOnly,
        };
        grant.validate(private.path()).unwrap();
        assert!(grant.preflight(private.path()).is_err());
    }
    std::fs::remove_file(&alias).unwrap();
    symlink(private.path(), &alias).unwrap();
    let grant = Grant {
        path: alias,
        access: Access::ReadOnly,
    };
    grant.validate(private.path()).unwrap();
    assert!(grant.preflight(private.path()).is_err());
}
