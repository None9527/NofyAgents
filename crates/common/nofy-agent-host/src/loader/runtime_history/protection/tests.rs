use super::*;
use nofy_agent_runtime::{
    control::{CatalogData, Publication},
    system::{SystemBundle, SystemDocument, SystemLock, content_digest},
};

fn control(root: &Path) -> Control {
    let host = storage::directory(root).unwrap();
    let lifecycle = storage::directory(&host.join("loader/lifecycle")).unwrap();
    storage::atomic(&lifecycle.join("lease.lock"), b"", 0o600, false).unwrap();
    let control = Control::open(&host, &host.join("runtime.sqlite")).unwrap();
    let _store = SqliteStore::open_placed(
        &host.join("runtime.sqlite"),
        Arc::new(control.clone()),
        None,
    )
    .unwrap();
    control.initialize().unwrap();
    control
}

/// On Windows these cases exercise the actual registry reader and relocation
/// guard, not only the host-path parser. No filesystem alias is created.
fn spellings(path: &Path) -> Vec<PathBuf> {
    let mut paths = vec![path.to_owned()];
    if cfg!(windows) {
        let text = path.to_str().unwrap();
        paths.push(text.to_ascii_lowercase().into());
        paths.push(text.to_ascii_uppercase().into());
        let plain = if let Some(tail) = text.strip_prefix(r"\\?\UNC\") {
            format!(r"\\{tail}")
        } else {
            text.strip_prefix(r"\\?\").unwrap_or(text).to_owned()
        };
        paths.push(plain.to_ascii_lowercase().into());
        paths.push(plain.to_ascii_uppercase().into());
    }
    paths
}

fn publication(path: &Path) -> CatalogView {
    let document: SystemDocument = serde_json::from_value(json!({
        "schema_version":1, "name":"directory-protection", "programs":{},
        "modules":[{
            "reference":{"id":"directory","version":"1"},
            "factory":"resource.directory",
            "config":{"path":path,"access":"read_only"}
        }]
    }))
    .unwrap();
    let lock = SystemLock {
        schema_version: 1,
        protocol: "nofy.runtime/v1".into(),
        modules: vec![],
        programs: Default::default(),
    };
    // This fixture represents the retained catalog envelope inspected by the
    // relocation guard. It is never compiled or granted execution authority.
    let digest = content_digest(&(&document, &lock)).unwrap();
    let bundle = SystemBundle {
        schema_version: 1,
        document,
        lock,
        digest,
    };
    bundle.validate().unwrap();
    CatalogView {
        revision: 1,
        data: CatalogData {
            publications: [(
                "release".into(),
                Publication {
                    created_revision: 1,
                    bundle,
                },
            )]
            .into(),
            ..Default::default()
        },
    }
}

#[test]
fn protected_registry_rejects_ancestors_descendants_and_windows_spellings() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let control = control(&dir.path().join("host"));
    let external = dir.path().join("ExternalHistory");
    std::fs::create_dir(&external).unwrap();
    let target = BackendDefinition {
        id: "external".into(),
        directory: Some(external.clone()),
    };
    check(&control.host_root, &external).unwrap();
    control.protect_bucket(&target).unwrap();
    let bucket = control.bucket(&target).unwrap();
    assert!(
        !bucket.exists(),
        "protection must survive missing/retired roots"
    );
    for path in [&external, &bucket, &bucket.join("retired")] {
        for spelling in spellings(path) {
            assert!(
                matches!(
                    check(&control.host_root, &spelling),
                    Err(HostError::Invalid(message))
                        if message == "path grant exposes external private runtime history"
                ),
                "{spelling:?}"
            );
        }
    }
    for separate in [
        external.join("unrelated"),
        dir.path().join("ExternalHistory-other"),
    ] {
        check(&control.host_root, &separate).unwrap();
    }
    let grant = json!({"path":external,"access":"read_only"});
    let result = super::super::super::directories::preflight_config(&grant, &control.host_root);
    if cfg!(windows) {
        assert!(matches!(
            result,
            Err(HostError::Unavailable(message))
                if message.contains("Windows protected-path identity")
        ));
    } else {
        assert!(matches!(
            result,
            Err(HostError::Invalid(message))
                if message == "path grant exposes external private runtime history"
        ));
    }
}

#[test]
fn relocation_guard_rejects_published_grants_overlapping_missing_private_buckets() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let control = control(&dir.path().join("host"));
    let runtimes = super::super::super::runtimes::RuntimeStore::open(
        &control.host_root.join("loader/runtimes"),
        &control.host_root,
    )
    .unwrap();
    let external = dir.path().join("ExternalHistory");
    std::fs::create_dir(&external).unwrap();
    for destination in spellings(&external) {
        let target = BackendDefinition {
            id: "external".into(),
            directory: Some(destination),
        };
        let bucket = control.bucket(&target).unwrap();
        assert!(!bucket.exists());
        for path in [&external, &bucket, &bucket.join("retired")] {
            for spelling in spellings(path) {
                assert!(
                    matches!(
                        control.preflight_grants(&target, Some(publication(&spelling)), &runtimes),
                        Err(HostError::Invalid(message))
                            if message.contains("runtime destination overlaps")
                    ),
                    "{spelling:?}"
                );
            }
        }
        control
            .preflight_grants(
                &target,
                Some(publication(&external.join("unrelated"))),
                &runtimes,
            )
            .unwrap();
    }
}

#[test]
fn lexical_windows_matching_does_not_claim_short_name_identity() {
    let syntax = nofy_host_path::Syntax::Windows;
    // This is deliberately unresolved by lexical syntax. It is why Windows
    // directory preflight must refuse authority, even for an existing canonical
    // long path: the protected short-name root may be missing or retired.
    let short = r"C:\HISTOR~1\.nofy-runtime-history\authority";
    let long = r"C:\HistoryData\.nofy-runtime-history\authority";
    assert!(!syntax.starts_with(short, long));
    assert!(!syntax.starts_with(long, short));
}
