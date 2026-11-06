//! Optional host admission at durable commit boundaries, not execution policy.
use crate::{Error, registry::ModuleDefinition};

pub trait CommitAdmission: Send + Sync {
    /// Stable logical authority, independent of local paths or credentials.
    fn identity(&self) -> &str;
    /// Must be bounded and non-reentrant. Declaration-bearing transactions
    /// acquire this permit at their commit boundary and hold it through commit
    /// or rollback; ordinary reads, receipts and control-state updates do not.
    fn enter(&self) -> Result<Box<dyn CommitPermit>, Error>;
    /// Pure proof for auxiliary children inheriting an already retained root.
    /// Never execute factories or perform IO here; false requires normal admission.
    fn permits_inherited(
        &self,
        _parent: &[&ModuleDefinition],
        _kind: &str,
        _modules: &[&ModuleDefinition],
    ) -> Result<bool, Error> {
        Ok(false)
    }
}
pub trait CommitPermit: Send {
    /// Validate declared dependencies without executing factories or business IO.
    /// `draft` allows incomplete, non-executable source definitions.
    fn validate(&self, kind: &str, modules: &[&ModuleDefinition]) -> Result<(), Error>;
}
#[cfg(all(test, any(feature = "sqlite", feature = "control-file")))]
pub(crate) mod tests;

#[cfg(any(feature = "sqlite", feature = "control-file"))]
pub(crate) mod marker {
    use super::*;
    use std::{
        fs::{File, OpenOptions},
        io::{Read, Write},
        path::{Path, PathBuf},
    };

    fn failure() -> Error {
        Error::Checkpoint("managed storage requires its matching commit admission authority".into())
    }
    fn path(storage: &Path) -> PathBuf {
        let mut name = storage.as_os_str().to_owned();
        name.push(".admission");
        PathBuf::from(name)
    }
    fn expected(policy: &dyn CommitAdmission) -> Result<Vec<u8>, Error> {
        let id = policy.identity();
        if id.is_empty()
            || id.len() > 128
            || !id
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b"._-/@:".contains(&b))
        {
            return Err(failure());
        }
        Ok(format!("nofy.commit-admission/v1\n{id}\n").into_bytes())
    }
    pub(crate) fn check(storage: &Path, policy: Option<&dyn CommitAdmission>) -> Result<(), Error> {
        let path = path(storage);
        let meta = match std::fs::symlink_metadata(&path) {
            Ok(meta) => meta,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
            Err(_) => return Err(failure()),
        };
        if !meta.is_file() || meta.len() > 512 {
            return Err(failure());
        }
        let expected = expected(policy.ok_or_else(failure)?)?;
        let mut bytes = Vec::new();
        File::open(path)
            .map_err(|_| failure())?
            .take(513)
            .read_to_end(&mut bytes)
            .map_err(|_| failure())?;
        if bytes != expected {
            return Err(failure());
        }
        Ok(())
    }
    /// Caller holds the storage's original writer lock/transaction.
    pub(crate) fn install(storage: &Path, policy: &dyn CommitAdmission) -> Result<(), Error> {
        check(storage, Some(policy))?;
        let destination = path(storage);
        if destination.exists() {
            return Ok(());
        }
        let parent = storage.parent().ok_or_else(failure)?;
        let temporary = parent.join(format!(
            ".nofy-admission-{}.tmp",
            nofy_tool_protocol::ToolCallId::new_v7()
        ));
        let result = (|| {
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&temporary).map_err(|_| failure())?;
            file.write_all(&expected(policy)?).map_err(|_| failure())?;
            file.sync_all().map_err(|_| failure())?;
            match std::fs::hard_link(&temporary, &destination) {
                Ok(()) => {}
                Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                    check(storage, Some(policy))?
                }
                Err(_) => return Err(failure()),
            }
            nofy_durable_fs::sync_directory(parent).map_err(|_| failure())?;
            Ok(())
        })();
        // Only this operation's create_new temporary is removed.
        let _ = std::fs::remove_file(temporary);
        result
    }
}
