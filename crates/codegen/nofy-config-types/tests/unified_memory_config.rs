use nofy_config_types::{
    MemoryCaptureConfig, MemoryCaptureRollout, MemoryConsolidationConfig, MemoryMigrationConfig,
    MemoryRetentionConfig, MemorySensitiveCategory,
};

#[test]
fn unified_subconfig_defaults_are_safe_and_operational() {
    let capture = MemoryCaptureConfig::default();
    assert_eq!(capture.rollout, MemoryCaptureRollout::RecordOnly);
    assert_eq!(capture.max_retries, 3);
    assert!(capture.validate().is_ok());

    let consolidation = MemoryConsolidationConfig::default();
    assert!(consolidation.enabled);
    assert!(consolidation.validate().is_ok());

    let retention = MemoryRetentionConfig::default();
    assert_eq!(retention.legacy_backup_days, 7);
    assert!(retention.validate().is_ok());

    let migration = MemoryMigrationConfig::default();
    assert!(migration.backup_enabled);
    assert!(migration.require_credential_store);
}

#[test]
fn capture_rollout_uses_stable_snake_case_values() {
    let rollout: MemoryCaptureRollout = serde_json::from_str(r#""record_only""#).unwrap();
    assert_eq!(rollout, MemoryCaptureRollout::RecordOnly);
    assert_eq!(
        serde_json::to_string(&MemoryCaptureRollout::Shadow).unwrap(),
        r#""shadow""#
    );
}

#[test]
fn sensitive_categories_use_stable_names() {
    let category: MemorySensitiveCategory = serde_json::from_str(r#""credentials""#).unwrap();
    assert_eq!(category, MemorySensitiveCategory::Credentials);
}

#[test]
fn invalid_capture_and_consolidation_limits_are_rejected() {
    let capture = MemoryCaptureConfig {
        lease_secs: 0,
        ..Default::default()
    };
    assert!(capture.validate().is_err());

    let capture = MemoryCaptureConfig {
        max_retries: 11,
        ..Default::default()
    };
    assert!(capture.validate().is_err());

    let consolidation = MemoryConsolidationConfig {
        batch_size: 0,
        ..Default::default()
    };
    assert!(consolidation.validate().is_err());
}

#[test]
fn invalid_retention_limits_are_rejected() {
    let retention = MemoryRetentionConfig {
        legacy_backup_days: 31,
        ..Default::default()
    };
    assert!(retention.validate().is_err());
}
