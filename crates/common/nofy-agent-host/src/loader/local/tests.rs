use super::*;
use crate::loader::{admission::LoaderAdmission, factories::*};
use nofy_agent_runtime::{admission::CommitAdmission, registry::*};
use serde_json::{Value, json};

fn declaration(program: &Path, root: &Path) -> Value {
    json!({"executable":program,"paths":[{"path":root,"execute":true}]})
}

#[test]
fn local_environment_build_is_pure_for_both_execution_factories() {
    let private = tempfile::tempdir().unwrap();
    let loader = Loader::open(private.path()).unwrap();
    loader.set_helper(Path::new("/usr/bin/true")).unwrap();
    let value = declaration(
        Path::new("/not-installed/bin/runtime"),
        Path::new("/not-installed"),
    );
    let environment = LocalEnvironmentFactory(loader.clone())
        .build(&value, &Default::default())
        .unwrap();
    let artifact = nofy_agent_runtime::artifact::ArtifactFactory
        .build(
            &json!({"bundle":{"schema_version":1,"files":{"main.py":"print('{}')"}}}),
            &Default::default(),
        )
        .unwrap();
    let deps: std::collections::BTreeMap<_, _> = [
        ("environment".into(), environment),
        ("artifact".into(), artifact),
    ]
    .into();
    let tool = json!({"contract":{"name":"compute"},"entrypoint":"main.py"});
    assert!(matches!(
        ProcessArtifactFactory.build(&tool, &deps).unwrap(),
        ModuleInstance::ToolPack(_)
    ));
    let mut tree_deps = deps.clone();
    tree_deps.insert(
        "tree".into(),
        process_tree::Factory
            .build(
                &json!({"cgroup_root":"/sys/fs/cgroup/not-installed/jobs"}),
                &Default::default(),
            )
            .unwrap(),
    );
    assert!(matches!(
        TreeArtifactFactory.build(&tool, &tree_deps).unwrap(),
        ModuleInstance::ToolPack(_)
    ));
    for path in ["scratch", "images/trees", "artifacts/trees"] {
        assert_eq!(
            std::fs::read_dir(private.path().join("loader").join(path))
                .unwrap()
                .count(),
            0
        );
    }
    assert!(
        config(&value, private.path())
            .unwrap()
            .preflight(private.path())
            .is_err()
    );
}

#[test]
fn normalized_paths_and_explicit_execution_are_required_not_versions_or_hashes() {
    let private = tempfile::tempdir().unwrap();
    let base = declaration(Path::new("/usr/bin/true"), Path::new("/usr"));
    config(&base, private.path())
        .unwrap()
        .preflight(private.path())
        .unwrap();
    for path in [
        "/",
        "/tmp",
        "/nofy/x",
        "/proc/self",
        "/sys",
        "/dev/null",
        "/run",
        "/usr/../lib",
        "/usr//lib",
        "relative",
    ] {
        let mut value = base.clone();
        value["paths"][0]["path"] = json!(path);
        assert!(config(&value, private.path()).is_err(), "{path}");
    }
    for extra in [json!({"path":"/usr"}), json!({"path":"/usr/lib"})] {
        let mut value = base.clone();
        value["paths"].as_array_mut().unwrap().push(extra);
        assert!(config(&value, private.path()).is_err());
    }
    let mut noexec = base.clone();
    noexec["paths"][0]["execute"] = json!(false);
    assert!(config(&noexec, private.path()).is_err());
    for field in ["version", "digest", "install"] {
        let mut value = base.clone();
        value[field] = json!("not-a-contract-field");
        assert!(config(&value, private.path()).is_err());
    }
    for env in [
        json!({"NOFY_DIRECTORY_PROJECT":"override"}),
        json!({"BAD=NAME":"value"}),
        json!({"9NAME":"value"}),
        json!({"NAME":"value\u{0}"}),
    ] {
        let mut value = base.clone();
        value["env"] = env;
        assert!(config(&value, private.path()).is_err());
    }
}

#[test]
fn dependency_files_may_change_and_need_no_installer_or_content_lock() {
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
    let dependency = public.path().join("user-package.py");
    std::fs::write(&dependency, b"first user-installed version").unwrap();
    let mut value = declaration(Path::new("/usr/bin/true"), Path::new("/usr"));
    value["paths"]
        .as_array_mut()
        .unwrap()
        .push(json!({"path":dependency}));
    let config = config(&value, private.path()).unwrap();
    config.preflight(private.path()).unwrap();
    let identity = nofy_agent_runtime::system::content_digest(&config).unwrap();
    std::fs::write(
        &dependency,
        b"updated independently by the user, no re-lock",
    )
    .unwrap();
    config.preflight(private.path()).unwrap();
    assert_eq!(
        identity,
        nofy_agent_runtime::system::content_digest(&config).unwrap()
    );
    std::fs::remove_file(&dependency).unwrap();
    assert!(config.preflight(private.path()).is_err());
}

#[test]
fn opened_dependency_is_pinned_and_aliases_cannot_expose_private_state() {
    use std::os::unix::fs::{MetadataExt, symlink};
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
    let path = public.path().join("dependency");
    let alias = public.path().join("alias");
    std::fs::write(&path, b"user module").unwrap();
    let mount = Mount {
        path: alias.clone(),
        execute: false,
    };
    symlink(&path, &alias).unwrap();
    let pinned = mount.open(private.path()).unwrap();
    let inode = pinned.metadata().unwrap().ino();
    std::fs::remove_file(&alias).unwrap();
    symlink(private.path(), &alias).unwrap();
    assert!(mount.open(private.path()).is_err());
    assert_eq!(pinned.metadata().unwrap().ino(), inode);
    let pipe = public.path().join("pipe");
    let name = std::ffi::CString::new(pipe.to_str().unwrap()).unwrap();
    assert_eq!(unsafe { libc::mkfifo(name.as_ptr(), 0o600) }, 0);
    assert!(
        Mount {
            path: pipe,
            execute: false
        }
        .open(private.path())
        .is_err()
    );
}

#[test]
fn missing_environment_blocks_new_authority_not_receipts_and_inheritance_is_exact() {
    let private = tempfile::tempdir().unwrap();
    let loader = Loader::open(private.path()).unwrap();
    let value = declaration(
        Path::new("/not-installed/bin/runtime"),
        Path::new("/not-installed"),
    );
    let mut module: ModuleDefinition = serde_json::from_value(json!({
        "reference":{"id":"local","version":"1"},"factory":FACTORY,"config":value}))
    .unwrap();
    let admission = LoaderAdmission(loader);
    let permit = admission.enter().unwrap();
    for kind in ["publication", "job"] {
        assert!(permit.validate(kind, &[&module]).is_err());
    }
    for kind in ["draft", "checkpoint", "child"] {
        permit.validate(kind, &[&module]).unwrap();
    }
    assert!(
        admission
            .permits_inherited(&[&module], "child", &[&module])
            .unwrap()
    );
    let parent = module.clone();
    module.config["prefix_args"] = json!(["a different environment"]);
    assert!(
        !admission
            .permits_inherited(&[&parent], "child", &[&module])
            .unwrap()
    );
}

#[test]
fn an_executable_symlink_cannot_escape_its_execution_roots() {
    use std::os::unix::fs::symlink;
    let private = tempfile::tempdir().unwrap();
    let public = tempfile::tempdir().unwrap();
    let program = public.path().join("program");
    symlink("/usr/bin/true", &program).unwrap();
    let value = declaration(&program, public.path());
    assert!(
        config(&value, private.path())
            .unwrap()
            .preflight(private.path())
            .is_err()
    );
    std::fs::remove_file(&program).unwrap();
    symlink(private.path().join("secret"), &program).unwrap();
    std::fs::write(private.path().join("secret"), b"not a runtime").unwrap();
    assert!(
        config(&value, private.path())
            .unwrap()
            .preflight(private.path())
            .is_err()
    );
}
