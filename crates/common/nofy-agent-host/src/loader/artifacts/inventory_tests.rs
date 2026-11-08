use super::*;

fn package() -> ArtifactBundle {
    ArtifactBundle {
        schema_version: 1,
        files: [
            ("root.py".into(), "root".into()),
            ("pkg/main.py".into(), "main".into()),
            ("pkg/nested/data.txt".into(), "data".into()),
        ]
        .into(),
    }
}

#[test]
fn native_component_inventory_reopens_canonical_package_unchanged() {
    let dir = tempfile::tempdir().unwrap();
    let bundle = package();
    let encoded = serde_json::to_vec(&bundle).unwrap();
    let digest = bundle.digest().unwrap();
    let store = ArtifactStore::open(dir.path()).unwrap();
    assert_eq!(store.put(bundle.clone()).unwrap().digest, digest);
    let tree = store.materialize(&bundle).unwrap();
    for (name, contents) in &bundle.files {
        let native = name.split('/').collect::<PathBuf>();
        assert_eq!(
            std::fs::read(tree.join(native)).unwrap(),
            contents.as_bytes()
        );
    }
    let reopened = ArtifactStore::open(dir.path()).unwrap();
    let loaded = reopened.get(&digest).unwrap();
    assert_eq!(serde_json::to_vec(&loaded).unwrap(), encoded);
    assert_eq!(loaded.digest().unwrap(), digest);
    assert_eq!(reopened.materialize(&loaded).unwrap(), tree);
}

#[test]
fn inventory_rejects_extra_missing_changed_and_wrong_kind_entries() {
    for damage in [
        "extra_file",
        "extra_directory",
        "missing",
        "changed",
        "wrong_kind",
    ] {
        let dir = tempfile::tempdir().unwrap();
        let store = ArtifactStore::open(dir.path()).unwrap();
        let bundle = package();
        let tree = store.trees.join(bundle.digest().unwrap());
        for (name, text) in &bundle.files {
            let path = tree.join(name);
            std::fs::create_dir_all(path.parent().unwrap()).unwrap();
            std::fs::write(path, text).unwrap();
        }
        let file = tree.join("pkg").join("main.py");
        match damage {
            "extra_file" => std::fs::write(tree.join("pkg/extra.py"), "extra").unwrap(),
            "extra_directory" => std::fs::create_dir(tree.join("pkg/extra")).unwrap(),
            "missing" => std::fs::remove_file(&file).unwrap(),
            "changed" => {
                std::fs::remove_file(&file).unwrap();
                std::fs::write(&file, "changed").unwrap();
            }
            "wrong_kind" => {
                std::fs::remove_file(&file).unwrap();
                std::fs::create_dir(&file).unwrap();
            }
            _ => unreachable!(),
        }
        assert!(store.materialize(&bundle).is_err(), "{damage}");
    }
}

#[cfg(unix)]
#[test]
fn unix_literal_backslash_and_non_utf8_are_not_portable_separators() {
    use std::os::unix::ffi::OsStringExt;
    for name in [
        std::ffi::OsString::from(r"pkg\main.py"),
        std::ffi::OsString::from_vec(vec![0xff]),
    ] {
        let dir = tempfile::tempdir().unwrap();
        let store = ArtifactStore::open(dir.path()).unwrap();
        let bundle = package();
        let tree = store.materialize(&bundle).unwrap();
        std::fs::write(tree.join(name), "main").unwrap();
        assert!(store.materialize(&bundle).is_err());
    }
}

#[cfg(unix)]
#[test]
fn inventory_rejects_symlink_directory_and_dangling_entry() {
    for directory in [true, false] {
        let dir = tempfile::tempdir().unwrap();
        let store = ArtifactStore::open(dir.path()).unwrap();
        let bundle = package();
        let tree = store.materialize(&bundle).unwrap();
        let outside = dir.path().join("outside");
        if directory {
            std::fs::create_dir(&outside).unwrap();
        }
        std::os::unix::fs::symlink(&outside, tree.join("extra")).unwrap();
        assert!(store.materialize(&bundle).is_err());
    }
}

#[test]
fn inventory_lookup_uses_native_components_without_rewriting_literal_names() {
    let files = [("pkg/main.py", "main")]
        .into_iter()
        .map(|(name, text)| (Path::new(name), text))
        .collect::<std::collections::BTreeMap<_, _>>();
    let native = PathBuf::from("pkg").join("main.py");
    assert_eq!(files.get(native.as_path()), Some(&"main"));
    #[cfg(windows)]
    {
        assert_eq!(native.to_str().unwrap(), r"pkg\main.py");
        assert_eq!(files.get(Path::new(r"pkg\main.py")), Some(&"main"));
    }
    #[cfg(unix)]
    assert_eq!(files.get(Path::new(r"pkg\main.py")), None);
}

#[cfg(unix)]
#[test]
fn declared_directory_symlink_is_not_followed() {
    let dir = tempfile::tempdir().unwrap();
    let store = ArtifactStore::open(dir.path()).unwrap();
    let bundle = ArtifactBundle {
        schema_version: 1,
        files: [("pkg/main.py".into(), "main".into())].into(),
    };
    let tree = store.trees.join(bundle.digest().unwrap());
    let outside = dir.path().join("outside");
    std::fs::create_dir(&tree).unwrap();
    std::fs::create_dir(&outside).unwrap();
    std::fs::write(outside.join("main.py"), "main").unwrap();
    std::os::unix::fs::symlink(&outside, tree.join("pkg")).unwrap();
    assert!(store.materialize(&bundle).is_err());
    assert_eq!(
        std::fs::read_to_string(outside.join("main.py")).unwrap(),
        "main"
    );
}
