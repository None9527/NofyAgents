//! Encrypted, short-lived legacy backups used by the one-way memory cutover.

use std::fs::{File, OpenOptions};
use std::io;
use std::path::{Path, PathBuf};

use age::secrecy::ExposeSecret;
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

const KEYRING_SERVICE: &str = "com.nofy.memory-migration";

pub trait MigrationKeyStore: Send + Sync {
    fn store(&self, key_id: &str, secret: &str) -> Result<(), String>;
    fn delete(&self, key_id: &str) -> Result<(), String>;
}

#[derive(Debug, Default, Clone, Copy)]
pub struct KeyringMigrationKeyStore;

impl MigrationKeyStore for KeyringMigrationKeyStore {
    fn store(&self, key_id: &str, secret: &str) -> Result<(), String> {
        keyring::Entry::new(KEYRING_SERVICE, key_id)
            .and_then(|entry| entry.set_password(secret))
            .map_err(|error| error.to_string())
    }

    fn delete(&self, key_id: &str) -> Result<(), String> {
        match keyring::Entry::new(KEYRING_SERVICE, key_id)
            .and_then(|entry| entry.delete_credential())
        {
            Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
            Err(error) => Err(error.to_string()),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BackupReceipt {
    pub path: PathBuf,
    pub key_id: String,
    pub delete_after: DateTime<Utc>,
}

#[derive(Debug, Error)]
pub enum BackupError {
    #[error("legacy backup I/O failed: {0}")]
    Io(#[from] io::Error),
    #[error("legacy backup encryption failed: {0}")]
    Encryption(String),
    #[error("credential store unavailable: {0}")]
    CredentialStore(String),
}

pub fn create_encrypted_backup(
    source: &Path,
    destination: &Path,
    key_store: &dyn MigrationKeyStore,
) -> Result<BackupReceipt, BackupError> {
    let key_id = format!("memory-migration-{}", Uuid::new_v4());
    let identity = age::x25519::Identity::generate();
    let secret = identity.to_string();
    key_store
        .store(&key_id, secret.expose_secret())
        .map_err(BackupError::CredentialStore)?;

    let result = write_encrypted_archive(source, destination, &identity.to_public());
    if let Err(error) = result {
        let _ = key_store.delete(&key_id);
        let _ = std::fs::remove_file(destination);
        return Err(error);
    }

    Ok(BackupReceipt {
        path: destination.to_path_buf(),
        key_id,
        delete_after: Utc::now() + Duration::days(7),
    })
}

fn write_encrypted_archive(
    source: &Path,
    destination: &Path,
    recipient: &age::x25519::Recipient,
) -> Result<(), BackupError> {
    let parent = destination.parent().ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::InvalidInput,
            "backup destination has no parent",
        )
    })?;
    std::fs::create_dir_all(parent)?;
    let output = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(destination)?;
    let encryptor = age::Encryptor::with_recipients(std::iter::once(recipient as _))
        .map_err(|error| BackupError::Encryption(error.to_string()))?;
    let encrypted = encryptor.wrap_output(output)?;
    let mut archive = tar::Builder::new(encrypted);
    let archive_name = source
        .file_name()
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "legacy root has no name"))?;
    archive.append_dir_all(archive_name, source)?;
    let encrypted = archive.into_inner()?;
    let output = encrypted.finish()?;
    output.sync_all()?;
    File::open(parent)?.sync_all()?;
    Ok(())
}

/// Forget is deliberately key-first. If credential deletion fails, ciphertext
/// remains recoverable instead of silently becoming an undecryptable orphan.
pub fn forget_legacy_backup(
    backup: &Path,
    key_id: &str,
    key_store: &dyn MigrationKeyStore,
) -> Result<(), BackupError> {
    key_store
        .delete(key_id)
        .map_err(BackupError::CredentialStore)?;
    match std::fs::remove_file(backup) {
        Ok(()) => {}
        Err(error) if error.kind() == io::ErrorKind::NotFound => {}
        Err(error) => return Err(error.into()),
    }
    if let Some(parent) = backup.parent() {
        File::open(parent)?.sync_all()?;
    }
    Ok(())
}
