use super::*;

/// Fail closed only for a managed principal AND compromised policy; every other combination proceeds.
#[test]
fn gate_blocks_only_managed_principal_with_compromised_policy() {
    // The one blocking case.
    assert!(
        managed_policy_gate_decision(true, true).is_err(),
        "managed principal + compromised policy must fail closed"
    );
    // Policy intact / opted-out → proceed even for a managed principal.
    assert!(managed_policy_gate_decision(true, false).is_ok());
    // No managed principal → nothing to enforce.
    assert!(managed_policy_gate_decision(false, true).is_ok());
    assert!(managed_policy_gate_decision(false, false).is_ok());
}

#[test]
fn remove_managed_config_files_tolerates_partial_existence() {
    let dir = tempfile::tempdir().unwrap();
    let home = dir.path();
    // Only two of the four artifacts exist; one of them is a squatting DIRECTORY.
    std::fs::write(home.join("requirements.toml"), "[features]\n").unwrap();
    std::fs::create_dir(home.join("managed_config.toml")).unwrap();
    std::fs::write(home.join("managed_config.toml").join("junk"), "x").unwrap();

    remove_managed_config_files(home);

    for f in [
        "requirements.toml",
        "managed_config.toml",
        "managed_config_cache.json",
        "managed_config.sig.json",
    ] {
        assert!(
            !home.join(f).exists(),
            "{f} must be gone after the purge (absent ones tolerated, dir squat removed)"
        );
    }
}

#[test]
fn marker_is_not_a_managed_artifact() {
    assert!(
        !MANAGED_ARTIFACT_FILES.contains(&nofy_config::MANAGED_CONFIG_CACHE_FILE),
        "the marker must be removed last, never as part of the artifact loop"
    );
    // Pin the composed contents: the purge loops, tmp-prefix sweep, and eviction all
    // derive from these names, so a constant silently changing value would re-point
    // them all at once.
    assert_eq!(
        MANAGED_ARTIFACT_FILES,
        [
            "managed_config.toml",
            "requirements.toml",
            "managed_config.sig.json",
            "managed_identity.sig.json"
        ],
        "the artifact list is load-bearing for every derived loop; change it deliberately"
    );
}

/// Error prefixes re-arm the detector like crash prefixes: when an artifact removal
/// FAILS, the marker must survive, so the next start re-runs the purge instead of
/// leaving the prior tenant's policy live with the detector disarmed.
#[cfg(unix)]
#[test]
fn purge_keeps_marker_when_an_artifact_removal_fails() {
    use std::os::unix::fs::PermissionsExt;
    let dir = tempfile::tempdir().unwrap();
    let home = dir.path();
    for name in MANAGED_ARTIFACT_FILES {
        std::fs::write(home.join(name), "x").unwrap();
    }
    std::fs::write(home.join(nofy_config::MANAGED_CONFIG_CACHE_FILE), "{}").unwrap();

    // Make one artifact unremovable: squat it with a dir whose read-only subdir
    // holds a file — `remove_dir_all` can't unlink inside the read-only subdir.
    let squat = home.join("requirements.toml");
    std::fs::remove_file(&squat).unwrap();
    let locked_subdir = squat.join("locked");
    std::fs::create_dir_all(&locked_subdir).unwrap();
    std::fs::write(locked_subdir.join("pin"), "x").unwrap();
    let readonly = std::fs::Permissions::from_mode(0o555);
    std::fs::set_permissions(&locked_subdir, readonly).unwrap();
    if std::fs::remove_dir_all(&squat).is_ok() {
        // The fault can't be injected: read-only perms don't block removal (root/CI edge).
        eprintln!("skipping: permissions not enforced (running as root?)");
        return;
    }

    remove_managed_config_files(home);
    assert!(
        home.join(nofy_config::MANAGED_CONFIG_CACHE_FILE).exists(),
        "a failed artifact removal must keep the marker (detector stays armed)"
    );

    // Clear the fault: the next purge converges and only then drops the marker.
    std::fs::set_permissions(&locked_subdir, std::fs::Permissions::from_mode(0o755)).unwrap();
    remove_managed_config_files(home);
    for name in MANAGED_ARTIFACT_FILES {
        assert!(!home.join(name).exists(), "{name} must be purged");
    }
    assert!(
        !home.join(nofy_config::MANAGED_CONFIG_CACHE_FILE).exists(),
        "with every artifact removed, the marker goes last"
    );
}

#[test]
fn auth_mode_classification() {
    use nofy_telemetry::startup::AuthMode;
    let err = || std::io::Error::other("unreadable");
    assert_eq!(auth_mode(true, &Ok(true)), AuthMode::Deployment);
    assert_eq!(auth_mode(true, &Err(err())), AuthMode::Deployment);
    assert_eq!(auth_mode(false, &Ok(true)), AuthMode::Team);
    assert_eq!(auth_mode(false, &Ok(false)), AuthMode::Personal);
    assert_eq!(auth_mode(false, &Err(err())), AuthMode::Unknown);
}
