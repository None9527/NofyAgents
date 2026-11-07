use nofy_agent_project::*;
use serde_json::{Value, json};
use std::collections::BTreeMap;
fn kinds() -> FactoryKinds {
    [
        ("model.example".into(), "model".into()),
        ("prompt.static".into(), "prompt".into()),
        ("tool.rhai".into(), "tool_pack".into()),
        ("session_policy.rules".into(), "session_policy".into()),
    ]
    .into()
}
fn add(s: &mut Source, id: &str, factory: &str, slot: Option<&str>, config: Value) {
    let mut input = json!({"agent":"coder","id":id,"factory":factory,"config":config});
    if let Some(slot) = slot {
        input["slot"] = json!(slot);
    }
    edit(s, "agent.module.add", &input, &kinds()).unwrap();
}
fn complete_source() -> Source {
    let mut s = Source::empty("coder", "coder").unwrap();
    add(&mut s, "model", "model.example", Some("model"), json!({}));
    add(
        &mut s,
        "prompt",
        "prompt.static",
        Some("prompt"),
        json!({"text":"hello"}),
    );
    s
}
#[test]
fn edits_preserve_literal_data_and_recompute_dependency_versions() {
    let mut source = complete_source();
    let literal = json!({"$file":"/must/not/be/read"});
    add(
        &mut source,
        "worker",
        "tool.rhai",
        Some("tools"),
        json!({"source":"args","literal":literal,"huge":18446744073709551615u64}),
    );
    edit(
        &mut source,
        "agent.module.bind",
        &json!({"agent":"coder","module":"worker","dependencies":{"prompt":"prompt"}}),
        &kinds(),
    )
    .unwrap();
    let first: Value = serde_json::from_str(
        build(&source, &kinds()).unwrap()["deployment_json"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    let worker = first["system"]["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "worker")
        .unwrap();
    assert_eq!(worker["config"]["literal"], literal);
    assert_eq!(worker["config"]["huge"], json!(u64::MAX));
    let old = worker["reference"].clone();
    edit(
        &mut source,
        "agent.module.set",
        &json!({"agent":"coder","module":"prompt","set":{"/text":"updated"}}),
        &kinds(),
    )
    .unwrap();
    let second: Value = serde_json::from_str(
        build(&source, &kinds()).unwrap()["deployment_json"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    let worker = second["system"]["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "worker")
        .unwrap();
    assert_ne!(worker["reference"], old);
    assert!(
        second["system"]["programs"]["coder"]["definition"]["tool_packs"]
            .as_array()
            .unwrap()
            .contains(&worker["reference"])
    );
    let before = source.digest().unwrap();
    assert_eq!(
        edit(
            &mut source,
            "agent.module.remove",
            &json!({"agent":"coder","module":"prompt"}),
            &kinds()
        )
        .unwrap_err()
        .code,
        "conflict"
    );
    assert_eq!(source.digest().unwrap(), before);
}
#[test]
fn source_binding_and_session_slot_are_explicit_and_pack_does_not_require_a_model() {
    let mut source = Source::empty("coder", "coder").unwrap();
    edit(&mut source,"agent.module.add",&json!({"agent":"coder","id":"session","factory":"session_policy.rules","slot":"session","config":{},"sources":{"modules/policy.rhai":{"encoding":"utf8","content":"#{decision: \"allow\"}"}},"source_bindings":{"/source":"modules/policy.rhai"}}),&kinds()).unwrap();
    let doc = source.json("preset.json").unwrap();
    assert_eq!(
        doc["system"]["programs"]["coder"]["definition"]["schema_version"],
        2
    );
    assert_eq!(build(&source, &kinds()).unwrap_err().code, "incomplete");
    source
        .files
        .insert("binary.dat".into(), File::bytes(&[0, 255, 1, 2], true));
    source.refresh_manifest().unwrap();
    let bytes = pack(&source).unwrap();
    let reader = flate2::read::GzDecoder::new(bytes.as_slice());
    let mut archive = tar::Archive::new(reader);
    let mut files = BTreeMap::new();
    for entry in archive.entries().unwrap() {
        use std::io::Read;
        let mut entry = entry.unwrap();
        let name = entry.path().unwrap().to_string_lossy().into_owned();
        let mut bytes = vec![];
        entry.read_to_end(&mut bytes).unwrap();
        files.insert(name, (bytes, entry.header().mode().unwrap()));
    }
    assert_eq!(files["binary.dat"], (vec![0, 255, 1, 2], 0o755));
    assert!(!files.contains_key(".nofy-source.lock"));
    assert_eq!(pack(&source).unwrap(), bytes);
}
#[test]
fn local_compare_before_write_preserves_unlisted_files_and_rejects_symlinks() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("project");
    let source = Source::empty("coder", "coder").unwrap();
    write_directory(&path, &source, None).unwrap();
    std::fs::write(path.join("user.env"), b"unlisted").unwrap();
    let before = load_directory(&path).unwrap();
    let digest = before.digest().unwrap();
    let mut updated = before.clone();
    updated.files.insert("new.txt".into(), File::text("new"));
    updated.refresh_manifest().unwrap();
    write_directory(&path, &updated, Some(&digest)).unwrap();
    assert_eq!(std::fs::read(path.join("user.env")).unwrap(), b"unlisted");
    assert_eq!(
        write_directory(&path, &before, Some(&digest))
            .unwrap_err()
            .code,
        "conflict"
    );
    assert_eq!(
        load_directory(&path).unwrap().digest().unwrap(),
        updated.digest().unwrap()
    );
    #[cfg(unix)]
    {
        std::fs::remove_file(path.join("new.txt")).unwrap();
        std::os::unix::fs::symlink(path.join("user.env"), path.join("new.txt")).unwrap();
        assert!(load_directory(&path).is_err());
    }
    let mut bad = source.clone();
    bad.files.insert("../escape".into(), File::text("bad"));
    assert!(pack(&bad).is_err());
}
#[test]
fn managed_projects_lock_compare_and_reopen_without_replacing_conflicting_writers() {
    let dir = tempfile::tempdir().unwrap();
    let store = ProjectStore::open(dir.path()).unwrap();
    let source = Source::empty("coder", "coder").unwrap();
    let initial = store.put("coder", None, source.clone()).unwrap();
    assert_eq!(initial.revision, "0");
    let a = store.clone();
    let b = store.clone();
    let change = |text: &str| {
        let mut source = source.clone();
        source.files.insert("notes.txt".into(), File::text(text));
        source.refresh_manifest().unwrap();
        source
    };
    let left = change("left");
    let right = change("right");
    let x = std::thread::spawn(move || a.put("coder", Some("0"), left));
    let y = std::thread::spawn(move || b.put("coder", Some("0"), right));
    let results = [x.join().unwrap(), y.join().unwrap()];
    assert_eq!(results.iter().filter(|r| r.is_ok()).count(), 1);
    let store = ProjectStore::open(dir.path()).unwrap();
    assert_eq!(store.get("coder").unwrap().revision, "1");
    assert!(store.put("coder", None, source).is_err());
}

#[test]
fn source_paths_cannot_overwrite_transaction_files_or_form_file_directory_collisions() {
    let source = Source::empty("coder", "coder").unwrap();
    for path in [".nofy-source.lock", ".nofy-source-transaction/before.json"] {
        let mut bad = source.clone();
        bad.files
            .insert(path.into(), File::text("cannot overwrite"));
        assert!(bad.validate().is_err());
    }
    let mut bad = source.clone();
    bad.files.insert("parent".into(), File::text("file"));
    bad.files.insert("parent/child".into(), File::text("child"));
    assert!(pack(&bad).is_err());
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("project");
    write_directory(&path, &source, None).unwrap();
    let journal = path.join(".nofy-source-transaction");
    std::fs::create_dir(&journal).unwrap();
    std::fs::write(
        journal.join("before.json"),
        serde_json::to_vec(&source).unwrap(),
    )
    .unwrap();
    assert_eq!(
        load_directory(&path).unwrap().digest().unwrap(),
        source.digest().unwrap()
    );
    assert!(!journal.exists());
}

#[test]
fn immutable_template_reads_do_not_create_writable_sidecars() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("template");
    let source = Source::empty("coder", "coder").unwrap();
    write_directory(&path, &source, None).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o555)).unwrap();
    }
    let loaded = load_directory(&path).unwrap();
    assert_eq!(loaded.digest().unwrap(), source.digest().unwrap());
    assert!(!path.join(".nofy-source.lock").exists());
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755)).unwrap();
    }
}

#[test]
fn source_archive_preserves_invalid_module_json_and_non_utf8_program_bytes() {
    let mut source = Source::empty("coder", "coder").unwrap();
    source
        .files
        .insert("module.py".into(), File::bytes(&[255, 254, 0, 42], false));
    source
        .files
        .insert("module.json".into(), File::text("{broken module JSON"));
    source
        .files
        .insert("settings.json".into(), File::text("{unfinished settings"));
    let mut declaration = source.json("preset.json").unwrap();
    declaration["system"]["modules"] = json!([
        {"reference":{"$module":"code"},"factory":"resource.artifact","config":{"source":{"$file":"module.py"},"data":{"$json":{"path":"module.json"}}}}
    ]);
    source.put_json("preset.json", &declaration).unwrap();
    source.refresh_manifest().unwrap();
    let bytes = pack(&source).unwrap();
    let mut archive = tar::Archive::new(flate2::read::GzDecoder::new(bytes.as_slice()));
    let mut found = std::collections::BTreeMap::new();
    for entry in archive.entries().unwrap() {
        use std::io::Read;
        let mut entry = entry.unwrap();
        let path = entry.path().unwrap().to_string_lossy().into_owned();
        let mut bytes = vec![];
        entry.read_to_end(&mut bytes).unwrap();
        found.insert(path, bytes);
    }
    assert_eq!(found["module.py"], vec![255, 254, 0, 42]);
    assert_eq!(found["module.json"], b"{broken module JSON");
    assert_eq!(found["settings.json"], b"{unfinished settings");
}
#[test]
fn coding_template_renders_in_rust_without_executing_project_scripts() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../presets")
        .canonicalize()
        .unwrap();
    let registry = TemplateRegistry::open(&root).unwrap();
    let mut source = registry
        .get("coding", Some("0.1.0"), Some("coder"))
        .unwrap();
    source.settings_json=Some(json!({"workspace":"/project","model":"configured-model","connection":{"base_url":"http://127.0.0.1:9000/v1/","models":["configured-model"],"allow_insecure_http":true},"terminal_enabled":false,"environment":{"program":"/usr/bin/python3"}}).to_string());
    let value: Value = serde_json::from_str(
        build(&source, &FactoryKinds::new()).unwrap()["deployment_json"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    assert_eq!(
        value["system"]["programs"]["coder"]["definition"]["name"],
        "coder"
    );
    assert!(
        !value["system"]["modules"]
            .as_array()
            .unwrap()
            .iter()
            .any(|m| m["reference"]["id"] == "command")
    );
    assert_eq!(
        value["system"]["modules"]
            .as_array()
            .unwrap()
            .iter()
            .find(|m| m["reference"]["id"] == "provider")
            .unwrap()["config"]["header_credentials"]["authorization"]["reference"],
        "MODEL_KEY"
    );
    assert!(pack(&source).is_ok());
}

fn fresh_coding_preset() -> Source {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../presets")
        .canonicalize()
        .unwrap();
    TemplateRegistry::open(&root)
        .unwrap()
        .get("coding", Some("0.1.0"), Some("coder"))
        .unwrap()
}
fn missing_paths(source: &Source) -> Vec<String> {
    inspect(source, &FactoryKinds::new()).unwrap()["missing_settings"]
        .as_array()
        .unwrap()
        .iter()
        .map(|m| m["path"].as_str().unwrap().to_owned())
        .collect()
}

#[test]
fn a_fresh_preset_reports_every_setting_it_needs_at_once_not_the_first() {
    let source = fresh_coding_preset();
    let report = inspect(&source, &FactoryKinds::new()).unwrap();
    // The renderer still stops at the first gap, as it always did...
    assert_eq!(report["issue"]["message"], "missing setting /connection");
    // ...and the report carries the whole closure behind it, with what each is.
    let paths = missing_paths(&source);
    for needed in ["/connection", "/model", "/workspace", "/environment"] {
        assert!(
            paths.iter().any(|p| p == needed),
            "{needed} not in {paths:?}"
        );
    }
    let connection = report["missing_settings"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["path"] == "/connection")
        .unwrap();
    assert_eq!(connection["type"], "object");
    assert!(!connection["description"].as_str().unwrap().is_empty());
}

#[test]
fn supplying_exactly_what_was_listed_completes_the_declaration() {
    let mut source = fresh_coding_preset();
    // Command execution is on by default and then needs a process tree too; the
    // report lists that, and switching it off is the smaller way to finish.
    assert!(missing_paths(&source).iter().any(|p| p == "/process_tree"));
    source.settings_json = Some(
        json!({
            "workspace": "/project", "model": "m", "terminal_enabled": false,
            "connection": {"base_url": "http://127.0.0.1:9000/v1/", "models": ["m"],
                "header_credentials": {"authorization": {"prefix": "Bearer ", "reference": "K"}}},
            "environment": {"executable": "/usr/bin/python3", "env": {}, "paths": []}
        })
        .to_string(),
    );
    let report = inspect(&source, &FactoryKinds::new()).unwrap();
    assert_eq!(report["status"], "complete", "{report}");
    assert!(report["missing_settings"].as_array().unwrap().is_empty());
}

#[test]
fn a_setting_only_a_switched_off_branch_reads_is_not_asked_for() {
    let mut source = fresh_coding_preset();
    source.settings_json = Some(json!({"terminal_enabled": false}).to_string());
    let paths = missing_paths(&source);
    assert!(!paths.iter().any(|p| p == "/process_tree"), "{paths:?}");
    assert!(paths.iter().any(|p| p == "/connection"), "{paths:?}");
}

#[test]
fn a_complete_source_reports_no_missing_settings() {
    let report = inspect(&complete_source(), &kinds()).unwrap();
    assert_eq!(report["missing_settings"], json!([]));
}

#[test]
fn alternatives_that_are_all_missing_are_reported_as_any_of_not_as_two_demands() {
    let mut source = Source {
        files: BTreeMap::new(),
        declaration: "preset.json".into(),
        settings_json: None,
    };
    source
        .put_json(
            "preset.json",
            &json!({"format": "nofy.preset/v1", "system": {
                "name": "x", "schema_version": 1, "modules": [], "programs": {},
                "marker": {"$coalesce": [{"$setting": "/first"}, {"$setting": "/second"}]}
            }}),
        )
        .unwrap();
    source.refresh_manifest().unwrap();
    let report = inspect(&source, &FactoryKinds::new()).unwrap();
    let missing = report["missing_settings"].as_array().unwrap();
    assert_eq!(missing.len(), 1, "{missing:?}");
    assert_eq!(missing[0]["any_of"], json!(["/first", "/second"]));
    // Supplying either one is enough.
    source.settings_json = Some(json!({"second": 1}).to_string());
    let after = inspect(&source, &FactoryKinds::new()).unwrap();
    assert!(
        after["missing_settings"].as_array().unwrap().is_empty(),
        "{after}"
    );
}

#[test]
fn the_report_says_whether_its_list_is_the_whole_closure() {
    // A fresh preset: the walk reaches a render that works, so the list is whole.
    let report = inspect(&fresh_coding_preset(), &FactoryKinds::new()).unwrap();
    assert_eq!(report["missing_settings_complete"], true, "{report}");
    // A complete source has nothing missing, trivially whole.
    assert_eq!(
        inspect(&complete_source(), &kinds()).unwrap()["missing_settings_complete"],
        true
    );
}
