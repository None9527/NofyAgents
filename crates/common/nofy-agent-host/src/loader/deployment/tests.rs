use super::*;

#[test]
fn deployment_parsing_has_no_package_byte_quota() {
    let original = include_bytes!("../../../examples/native-system.json");
    let expected = serde_json::to_value(DeploymentFile::from_json(original).unwrap()).unwrap();
    let mut padded = vec![b' '; 33 * 1024 * 1024];
    padded.extend_from_slice(original);
    assert_eq!(
        serde_json::to_value(DeploymentFile::from_json(&padded).unwrap()).unwrap(),
        expected
    );
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("system.json");
    std::fs::write(&path, padded).unwrap();
    assert_eq!(
        serde_json::to_value(DeploymentFile::read(&path).unwrap()).unwrap(),
        expected
    );
}

#[test]
fn sourced_declarations_reject_embedded_dependency_payloads() {
    let system: serde_json::Value =
        serde_json::from_slice(include_bytes!("../../../examples/native-system.json")).unwrap();
    let mut source =
        serde_json::json!({"format":"nofy.deployment/v2","system":system,"runtime_sources":[]});
    assert!(DeploymentFile::from_json(&serde_json::to_vec(&source).unwrap()).is_ok());
    source["runtime_images"] = serde_json::json!([]);
    assert!(DeploymentFile::from_json(&serde_json::to_vec(&source).unwrap()).is_err());
}

#[test]
fn file_entry_rejects_directories_and_fifos_without_blocking() {
    let directory = tempfile::tempdir().unwrap();
    assert!(DeploymentFile::read(directory.path()).is_err());
    #[cfg(unix)]
    {
        let fifo = directory.path().join("pipe");
        let path = std::ffi::CString::new(fifo.as_os_str().as_encoded_bytes()).unwrap();
        assert_eq!(unsafe { libc::mkfifo(path.as_ptr(), 0o600) }, 0);
        assert!(DeploymentFile::read(&fifo).is_err());
    }
    #[cfg(not(unix))]
    nofy_test_support::skip(
        "a named pipe (mkfifo)",
        "Windows has no FIFO special file; the directory case above still ran",
    );
}
