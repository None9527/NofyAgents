use nofy_agent_project::{repository::*, *};
use serde_json::{Value, json};
use std::collections::BTreeMap;

fn package(name: &str, version: &str, body: Value) -> Source {
    let mut source = Source {
        files: BTreeMap::new(),
        declaration: "module.json".into(),
        settings_json: None,
    };
    source.put_json("module.json", &json!({
        "format":"nofy.module-package/v1","name":name,"version":version,
        "parameters_schema":{"type":"object","properties":{"label":{"type":"string","default":"default"},"data":{"default":{"$ref":"https://literal.invalid/data"}}}},
        "modules":[{"reference":{"$module":"entry"},"factory":"prompt.static","config":{"text":{"$parameter":"/label"},"data":{"$parameter":"/data"},"body":body}}],"exports":{"main":"entry"}
    })).unwrap();
    source.files.insert(
        "bad.py".into(),
        File::text("this is intentionally unfinished Python (("),
    );
    source.refresh_manifest().unwrap();
    source
}
fn agent() -> Source {
    let mut source = Source::empty("coder", "coder").unwrap();
    edit(&mut source,"agent.module.add",&json!({"agent":"coder","id":"model","factory":"model.programmed","config":{},"slot":"model"}),&kinds()).unwrap();
    source
}
fn kinds() -> FactoryKinds {
    [
        ("model.programmed".into(), "model".into()),
        ("prompt.static".into(), "prompt".into()),
        ("resource.artifact".into(), "resource".into()),
    ]
    .into()
}
#[test]
fn deletion_unset_and_yank_preserve_identity_and_existing_pins() {
    let dir = tempfile::tempdir().unwrap();
    let projects = ProjectStore::open(&dir.path().join("projects")).unwrap();
    let initial = projects.put("sample", None, agent()).unwrap();
    projects.delete("sample", &initial.revision).unwrap();
    assert!(projects.get("sample").is_err());
    assert!(projects.list("", 256).unwrap().is_empty());
    let replacement = projects.put("sample", None, agent()).unwrap();
    assert_ne!(initial.revision, replacement.revision);
    assert!(projects.delete("sample", &initial.revision).is_err());
    let store = ModuleStore::open(&dir.path().join("modules")).unwrap();
    let repo = store.put("local", None, RepositoryOrigin::Managed).unwrap();
    let (repo, pin) = store
        .publish(
            "local",
            &repo.revision,
            package("prompt", "1", json!("source")),
        )
        .unwrap();
    let mut source = agent();
    use_prompt(&mut source, &pin, "shared", "value");
    store
        .set_yanked("local", "prompt", "1", &repo.revision, true)
        .unwrap();
    let yanked = store.package("local", "prompt", "1").unwrap();
    assert!(yanked.yanked);
    assert!(
        use_package(
            &mut agent(),
            &yanked,
            &json!({"agent":"coder","alias":"other"}),
            &kinds()
        )
        .is_err()
    );
    assert_eq!(
        store.hydrate(&source).unwrap().digest().unwrap(),
        store.hydrate(&source).unwrap().digest().unwrap()
    );
    assert!(
        store.garbage_collect(false).unwrap()["digests"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    let mut configured = agent();
    edit(&mut configured,"agent.module.add",&json!({"agent":"coder","id":"p","factory":"prompt.static","config":{"text":"keep","extra":1},"slot":"prompt"}),&kinds()).unwrap();
    edit(
        &mut configured,
        "agent.module.set",
        &json!({"agent":"coder","module":"p","unset":["/extra"],"set":{"/nullable":null}}),
        &kinds(),
    )
    .unwrap();
    let rendered = rendered(&configured);
    let modules = rendered["system"]["modules"].as_array().unwrap();
    let config = &modules
        .iter()
        .find(|m| m["reference"]["id"] == "p")
        .unwrap()["config"];
    assert!(config.get("extra").is_none());
    assert_eq!(config["nullable"], Value::Null);
    edit(
        &mut configured,
        "agent.delete",
        &json!({"agent":"coder"}),
        &kinds(),
    )
    .unwrap();
    assert!(agent_names(&configured).unwrap().is_empty());
}
#[test]
fn dependency_replacement_removes_old_slots_and_failed_removal_is_atomic() {
    let mut source = agent();
    edit(&mut source,"agent.module.add",&json!({"agent":"coder","id":"aggregate","factory":"resource.artifact","config":{},"dependencies":{"old":"model"}}),&kinds()).unwrap();
    edit(&mut source,"agent.module.bind",&json!({"agent":"coder","module":"aggregate","dependencies":{"new":"model"},"replace_dependencies":true}),&kinds()).unwrap();
    let doc = source.json(&source.declaration).unwrap();
    let root = doc.get("system").unwrap_or(&doc);
    let aggregate = root["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["$module"] == "aggregate")
        .unwrap();
    assert!(aggregate["dependencies"].get("old").is_none());
    assert!(aggregate["dependencies"].get("new").is_some());
    let before = source.digest().unwrap();
    assert!(edit(&mut source,"agent.module.bind",&json!({"agent":"coder","module":"aggregate","dependencies":{},"remove_dependencies":["missing"]}),&kinds()).is_err());
    assert_eq!(source.digest().unwrap(), before);
    edit(&mut source,"agent.module.bind",&json!({"agent":"coder","module":"aggregate","dependencies":{},"remove_dependencies":["new"]}),&kinds()).unwrap();
}
fn use_prompt(source: &mut Source, package: &PackageView, alias: &str, label: &str) {
    use_package(source,package,&json!({"agent":"coder","alias":alias,"parameters":{"label":label},"export":"main","slot":"prompt"}),&kinds()).unwrap();
}
fn rendered(source: &Source) -> Value {
    serde_json::from_str(
        build(source, &kinds()).unwrap()["deployment_json"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
#[test]
fn shared_pins_are_parameterized_exportable_and_survive_repository_removal() {
    let dir = tempfile::tempdir().unwrap();
    let store = ModuleStore::open(dir.path()).unwrap();
    let repo = store
        .put("shared", None, RepositoryOrigin::Managed)
        .unwrap();
    let (repo, pin) = store
        .publish(
            "shared",
            &repo.revision,
            package("prompt", "1", json!("first")),
        )
        .unwrap();
    let mut a = agent();
    let mut b = agent();
    use_prompt(&mut a, &pin, "common", "alpha");
    use_prompt(&mut b, &pin, "common", "beta");
    assert!(
        !a.files
            .keys()
            .any(|k| k.starts_with(".nofy-module-packages/"))
    );
    assert!(build(&a, &kinds()).is_err());
    let frozen = store.hydrate(&a).unwrap();
    let other = store.hydrate(&b).unwrap();
    let text = |s: &Source| {
        rendered(s)["system"]["modules"]
            .as_array()
            .unwrap()
            .iter()
            .find(|m| m["reference"]["id"] == "common.entry")
            .unwrap()["config"]
            .clone()
    };
    assert_eq!(text(&frozen)["text"], "alpha");
    assert_eq!(text(&other)["text"], "beta");
    assert_eq!(
        text(&frozen)["data"],
        json!({"$ref":"https://literal.invalid/data"})
    );
    let (_, new) = store
        .publish(
            "shared",
            &repo.revision,
            package("prompt", "2", json!("next")),
        )
        .unwrap();
    assert_ne!(new.digest, pin.digest);
    assert_eq!(rendered(&store.hydrate(&a).unwrap()), rendered(&frozen));
    assert_eq!(
        std::fs::read_dir(dir.path().join("packages"))
            .unwrap()
            .count(),
        2
    );
    let before = a.digest().unwrap();
    assert!(unuse_package(&mut a, "common").is_err());
    assert_eq!(a.digest().unwrap(), before);
    edit(
        &mut a,
        "agent.module.detach",
        &json!({"agent":"coder","module":"common.main","slot":"prompt"}),
        &kinds(),
    )
    .unwrap();
    unuse_package(&mut a, "common").unwrap();
    let current = store.get("shared").unwrap();
    store.remove("shared", &current.revision).unwrap();
    assert_eq!(
        store.package("shared", "prompt", "1").unwrap().digest,
        pin.digest
    );
    assert_eq!(rendered(&store.hydrate(&b).unwrap()), rendered(&other));
    let reopened = ModuleStore::open(dir.path()).unwrap();
    assert_eq!(
        reopened.source(&pin.digest).unwrap().digest().unwrap(),
        pin.digest
    );
    let restored = reopened
        .put("shared", None, RepositoryOrigin::Managed)
        .unwrap();
    assert_ne!(restored.revision, current.revision);
    let export = dir.path().join("export");
    write_directory(&export, &frozen, None).unwrap();
    let offline = load_directory(&export).unwrap();
    assert_eq!(rendered(&offline), rendered(&frozen));
    assert_eq!(pack(&offline).unwrap(), pack(&offline).unwrap());
    let mut corrupt = offline;
    let path = package_file(&pin.digest).unwrap();
    corrupt.files.insert(path, File::text("{}"));
    corrupt.refresh_manifest().unwrap();
    assert!(pack(&corrupt).is_err());
}
#[test]
fn immutable_versions_and_snapshot_cas_never_publish_partial_conflicts() {
    let dir = tempfile::tempdir().unwrap();
    let store = ModuleStore::open(dir.path()).unwrap();
    let repo = store
        .put(
            "r",
            None,
            RepositoryOrigin::Directory {
                host_path: dir.path().to_owned(),
            },
        )
        .unwrap();
    let old = package("alpha", "1", json!(1));
    let (repo, pins) = store
        .synchronize("r", &repo.revision, vec![old.clone()], "commit-a".into())
        .unwrap();
    let same = store
        .synchronize("r", &repo.revision, vec![old], "commit-a".into())
        .unwrap();
    assert_eq!(same.0.revision, repo.revision);
    let changed = package("alpha", "1", json!(2));
    assert_eq!(
        store
            .synchronize(
                "r",
                &repo.revision,
                vec![package("beta", "1", json!(3)), changed],
                "commit-b".into()
            )
            .unwrap_err()
            .code,
        "conflict"
    );
    assert!(store.package("r", "beta", "1").is_err());
    assert_eq!(store.get("r").unwrap().revision, repo.revision);
    assert_eq!(
        store.packages(Some("r"), "", 1).unwrap()["packages"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        store
            .synchronize("r", "0", vec![], "stale".into())
            .unwrap_err()
            .code,
        "conflict"
    );
    assert_eq!(
        store.source(&pins[0].digest).unwrap().digest().unwrap(),
        pins[0].digest
    );
}
#[test]
fn cross_package_ports_and_literals_resolve_through_the_same_graph() {
    let dir = tempfile::tempdir().unwrap();
    let store = ModuleStore::open(dir.path()).unwrap();
    let repo = store.put("r", None, RepositoryOrigin::Managed).unwrap();
    let mut resource = package("assets", "1", json!(0));
    let mut manifest = resource.json("module.json").unwrap();
    manifest["modules"] = json!([{"reference":{"$module":"entry"},"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{}}}}]);
    resource.put_json("module.json", &manifest).unwrap();
    resource.refresh_manifest().unwrap();
    let (repo, assets) = store.publish("r", &repo.revision, resource).unwrap();
    let mut consumer = package("consumer", "1", json!(0));
    let mut manifest = consumer.json("module.json").unwrap();
    manifest["inputs"] = json!({"asset":"resource"});
    manifest["modules"][0]["dependencies"] = json!({"artifact":{"$input":"asset"}});
    manifest["modules"][0]["config"]["literal"] = json!({"$literal":{"$module":"literal-data"}});
    consumer.put_json("module.json", &manifest).unwrap();
    consumer.refresh_manifest().unwrap();
    let (_, consumer) = store.publish("r", &repo.revision, consumer).unwrap();
    let mut a = agent();
    use_package(
        &mut a,
        &assets,
        &json!({"agent":"coder","alias":"assets"}),
        &kinds(),
    )
    .unwrap();
    use_package(&mut a,&consumer,&json!({"agent":"coder","alias":"consumer","bindings":{"asset":{"$module":"assets.main"}},"export":"main","slot":"prompt"}),&kinds()).unwrap();
    let native = rendered(&store.hydrate(&a).unwrap());
    let entry = native["system"]["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "consumer.entry")
        .unwrap();
    assert_eq!(entry["dependencies"]["artifact"]["id"], "assets.entry");
    assert_eq!(
        entry["config"]["literal"],
        json!({"$module":"literal-data"})
    );
    assert!(unuse_package(&mut a, "assets").is_err());
    let mut wrong = a.clone();
    use_package(&mut wrong,&consumer,&json!({"agent":"coder","alias":"consumer","replace_import":true,"bindings":{"asset":"model"}}),&kinds()).unwrap();
    assert!(build(&store.hydrate(&wrong).unwrap(), &kinds()).is_err());
    assert!(
        use_package(
            &mut a,
            &consumer,
            &json!({"agent":"coder","alias":"consumer","parameters":{"label":"changed"}}),
            &kinds()
        )
        .is_err()
    );
}
#[test]
fn directory_collection_uses_only_listed_safe_bytes_and_schemas_cannot_fetch() {
    let dir = tempfile::tempdir().unwrap();
    let source = package("simple", "1", json!(0));
    let directory = dir.path().join("source");
    write_directory(&directory, &source, None).unwrap();
    std::fs::write(directory.join("unlisted.secret"), "must not collect").unwrap();
    let collected = load_package_directory(&directory).unwrap();
    assert_eq!(collected.digest().unwrap(), source.digest().unwrap());
    assert!(!collected.files.contains_key("unlisted.secret"));
    std::fs::write(
        directory.join("module-repository.json"),
        r#"{"format":"nofy.module-repository/v1","packages":[""]}"#,
    )
    .unwrap();
    assert_eq!(load_repository_directory(&directory).unwrap().0.len(), 1);
    assert!(
        RepositoryIndex::parse(
            br#"{"format":"nofy.module-repository/v1","packages":["../outside"]}"#
        )
        .is_err()
    );
    let mut remote = source.clone();
    let mut manifest = remote.json("module.json").unwrap();
    manifest["parameters_schema"] = json!({"$ref":"http://127.0.0.1:1/schema"});
    remote.put_json("module.json", &manifest).unwrap();
    remote.refresh_manifest().unwrap();
    assert!(PackageManifest::from_source(&remote).is_err());
    #[cfg(unix)]
    {
        std::fs::remove_file(directory.join("bad.py")).unwrap();
        std::os::unix::fs::symlink("unlisted.secret", directory.join("bad.py")).unwrap();
        assert!(load_package_directory(&directory).is_err());
    }
}

/// Publish `package` into a throwaway store and return the pinned view.
fn pinned(package: Source) -> PackageView {
    let dir = tempfile::tempdir().unwrap();
    let store = ModuleStore::open(dir.path()).unwrap();
    let repo = store
        .put("shared", None, RepositoryOrigin::Managed)
        .unwrap();
    let (_, pin) = store.publish("shared", &repo.revision, package).unwrap();
    pin
}
fn with_exports(mut source: Source, exports: Value) -> Source {
    let mut manifest = source.json("module.json").unwrap();
    manifest["exports"] = exports;
    source.put_json("module.json", &manifest).unwrap();
    source.refresh_manifest().unwrap();
    source
}
fn prompt_of(source: &Source) -> Value {
    // The Agent's definition inside the system declaration; a mounted module shows
    // up as the value of its slot.
    source.json("preset.json").unwrap()["system"]["programs"]["coder"]["definition"]["prompt"]
        .clone()
}

#[test]
fn naming_the_export_is_enough_to_mount_it_because_its_kind_picks_the_slot() {
    let pin = pinned(package("prompt", "1", json!("x")));
    let mut source = agent();
    use_package(
        &mut source,
        &pin,
        &json!({"agent": "coder", "alias": "p", "export": "main"}),
        &kinds(),
    )
    .unwrap();
    assert_eq!(prompt_of(&source), json!({"$module": "p.entry"}));
}

#[test]
fn naming_the_slot_is_enough_when_the_package_has_one_export() {
    let pin = pinned(package("prompt", "1", json!("x")));
    let mut source = agent();
    use_package(
        &mut source,
        &pin,
        &json!({"agent": "coder", "alias": "p", "slot": "prompt"}),
        &kinds(),
    )
    .unwrap();
    assert_eq!(prompt_of(&source), json!({"$module": "p.entry"}));
}

#[test]
fn naming_neither_still_only_imports_the_package() {
    let pin = pinned(package("prompt", "1", json!("x")));
    let mut source = agent();
    use_package(
        &mut source,
        &pin,
        &json!({"agent": "coder", "alias": "p"}),
        &kinds(),
    )
    .unwrap();
    assert!(prompt_of(&source).is_null());
    assert!(imports(&source).unwrap().contains_key("p"));
}

#[test]
fn a_slot_alone_cannot_choose_between_several_exports_and_says_which_there_are() {
    let pin = pinned(with_exports(
        package("two", "1", json!("x")),
        json!({"main": "entry", "other": "entry"}),
    ));
    let error = use_package(
        &mut agent(),
        &pin,
        &json!({"agent": "coder", "alias": "p", "slot": "prompt"}),
        &kinds(),
    )
    .unwrap_err();
    assert_eq!(error.code, "local_input");
    assert!(
        error.message.contains("`main`") && error.message.contains("`other`"),
        "{}",
        error.message
    );
}

#[test]
fn an_export_that_is_wired_not_mounted_is_not_guessed_a_slot_and_is_explained() {
    let mut package = package("conn", "1", json!("x"));
    let mut manifest = package.json("module.json").unwrap();
    manifest["modules"][0]["factory"] = json!("resource.artifact");
    package.put_json("module.json", &manifest).unwrap();
    package.refresh_manifest().unwrap();
    let pin = pinned(package);
    let error = use_package(
        &mut agent(),
        &pin,
        &json!({"agent": "coder", "alias": "p", "export": "main"}),
        &kinds(),
    )
    .unwrap_err();
    assert_eq!(error.code, "local_input");
    assert!(
        error.message.contains("resource") && error.message.contains("port"),
        "{}",
        error.message
    );
}

#[test]
fn an_unknown_export_lists_the_ones_the_package_has() {
    let pin = pinned(package("prompt", "1", json!("x")));
    let error = use_package(
        &mut agent(),
        &pin,
        &json!({"agent": "coder", "alias": "p", "export": "nope"}),
        &kinds(),
    )
    .unwrap_err();
    assert_eq!(error.code, "not_found");
    assert!(error.message.contains("`main`"), "{}", error.message);
}

#[test]
fn a_directory_without_a_file_list_says_what_a_package_needs_and_where_to_get_one() {
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(dir.path().join("module.json"), "{}").unwrap();
    let error = load_package_directory(dir.path()).unwrap_err();
    assert_eq!(error.code, "not_found");
    assert!(
        error.message.contains("source-files.json") && error.message.contains("module init"),
        "{}",
        error.message
    );
}
