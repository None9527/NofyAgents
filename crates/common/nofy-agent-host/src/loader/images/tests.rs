use super::*;
#[cfg(target_arch = "x86_64")]
fn image() -> RuntimeImage {
    RuntimeImage::capture(serde_json::from_value(serde_json::json!({"id":"loader","executable":"bin/loader","files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap()).unwrap()
}
#[test]
#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
fn images_reject_invalid_closures_paths_streams_and_elf_dependencies() {
    let image = image();
    image.validate().unwrap();
    let digest = image.manifest.digest().unwrap();
    let hash = image.manifest.files["bin/loader"].digest.clone();
    let mut missing = image.clone();
    missing.blobs.clear();
    assert!(missing.validate().is_err());
    let mut extra = image.clone();
    extra.blobs.insert("0".repeat(64), String::new());
    assert!(extra.validate().is_err());
    let mut changed = image.clone();
    changed.manifest.files.get_mut("bin/loader").unwrap().size = 0;
    assert!(changed.validate().is_err());
    let mut corrupt = image.clone();
    let mut compressed = STANDARD.decode(&corrupt.blobs[&hash]).unwrap();
    compressed.extend(b"trailing");
    corrupt
        .blobs
        .insert(hash.clone(), STANDARD.encode(compressed));
    assert!(corrupt.validate().is_err());
    let mut conflict = image.clone();
    conflict
        .manifest
        .files
        .insert("bin".into(), conflict.manifest.files["bin/loader"].clone());
    assert!(conflict.manifest.validate().is_err());
    let mut escape = image.clone();
    escape.manifest.executable = "../loader".into();
    assert!(escape.validate().is_err());
    let mut libs = image.clone();
    libs.manifest.library_dirs = vec!["missing".into()];
    assert!(libs.validate().is_err());
    let mut dynamic=RuntimeImage::capture(serde_json::from_value(serde_json::json!({"id":"dynamic","executable":"bin/python","files":{"bin/python":"/usr/bin/python3"}})).unwrap());
    assert!(dynamic.is_err());
    assert_eq!(image.manifest.digest().unwrap(), digest);
    dynamic=RuntimeImage::capture(serde_json::from_value(serde_json::json!({"id":"dynamic","executable":"bin/python","loader":"lib/loader","library_dirs":["lib"],"files":{"bin/python":"/usr/bin/python3","lib/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap());
    assert!(dynamic.is_err());
}
#[test]
#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
fn immutable_image_store_checks_reopen_cache_and_symlink_boundaries() {
    let dir = tempfile::tempdir().unwrap();
    let store = ImageStore::open(dir.path()).unwrap();
    let image = image();
    let first = store.put(image.clone()).unwrap();
    assert_eq!(first.digest, store.put(image.clone()).unwrap().digest);
    store.verify(&first.digest).unwrap();
    let object_file = dir
        .path()
        .join("objects")
        .join(format!("{}.json", first.digest));
    let mut corrupt = image.clone();
    corrupt.blobs.clear();
    std::fs::write(&object_file, serde_json::to_vec(&corrupt).unwrap()).unwrap();
    assert!(
        store.verify(&first.digest).is_err(),
        "changed bytes must invalidate a positive verification"
    );
    std::fs::write(&object_file, serde_json::to_vec(&image).unwrap()).unwrap();
    store.verify(&first.digest).unwrap();
    let reopened = ImageStore::open(dir.path()).unwrap();
    assert_eq!(reopened.list("", 1).unwrap().len(), 1);
    assert!(reopened.list(&first.digest, 1).unwrap().is_empty());
    assert!(reopened.list("", 0).is_err());
    assert_eq!(
        reopened
            .get(&first.digest)
            .unwrap()
            .manifest
            .digest()
            .unwrap(),
        first.digest
    );
    for index in 0..4 {
        std::fs::create_dir(dir.path().join("trees").join(format!(".orphan{index}"))).unwrap();
    }
    assert!(reopened.materialize(&image.manifest, 0).is_err());
    for index in 0..4 {
        std::fs::remove_dir(dir.path().join("trees").join(format!(".orphan{index}"))).unwrap();
    }
    assert!(
        reopened
            .materialize(&image.manifest, 1024 * 1024 * 1024)
            .is_err()
    );
    let tree = reopened.materialize(&image.manifest, 0).unwrap();
    std::fs::create_dir(tree.join("undeclared")).unwrap();
    assert!(reopened.materialize(&image.manifest, 0).is_err());
    std::fs::remove_dir(tree.join("undeclared")).unwrap();
    let path = tree.join("bin/loader");
    std::fs::remove_file(&path).unwrap();
    std::os::unix::fs::symlink("/usr/bin/python3", &path).unwrap();
    assert!(reopened.materialize(&image.manifest, 0).is_err());
    let object = dir
        .path()
        .join("objects")
        .join(format!("{}.json", first.digest));
    std::fs::write(object, b"{}").unwrap();
    assert!(reopened.get(&first.digest).is_err());
    assert!(store.put(image).is_err());
}
