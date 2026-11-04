use super::*;
use nofy_agent_runtime::admission::CommitAdmission;
use std::{collections::BTreeMap, os::unix::fs::symlink};

fn definition(path: &Path, access: &str) -> ModuleDefinition {
    serde_json::from_value(json!({"reference":{"id":"project","version":"1"},
        "factory":"resource.directory","config":{"path":path,"access":access}}))
    .unwrap()
}

#[test]
fn preview_is_pure_and_rejects_unsafe_or_unknown_directory_configuration() {
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
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
        json!({"path":"/","access":"read_only"}),
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
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
    let loader = Loader::open(private.path()).unwrap();
    let policy = super::super::admission::LoaderAdmission(loader);
    let original = definition(&public.path().join("missing"), "read_only");
    let stronger = definition(&public.path().join("missing"), "read_write");
    let executable = definition(&public.path().join("missing"), "read_write_execute");
    let other = definition(public.path(), "read_only");
    let permit = policy.enter().unwrap();
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

#[test]
fn opened_descriptor_pins_the_authorized_directory_and_retargeted_aliases_fail_closed() {
    use std::os::{fd::AsFd, unix::fs::MetadataExt};
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
