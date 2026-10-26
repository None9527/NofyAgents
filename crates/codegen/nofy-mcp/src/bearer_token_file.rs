//! Per-request token reads: rotation needs neither a watcher nor a reconnect.
//! Diagnostics name the file, never its contents.

use agent_client_protocol as acp;
use std::{
    io::{self, Read},
    path::{Path, PathBuf},
    sync::Arc,
    time::Duration,
};

pub const BEARER_TOKEN_FILE_META_KEY: &str = "nofy/mcp/bearerTokenFile";
const MAX_TOKEN_FILE_BYTES: u64 = 16 * 1024;
const TOKEN_READ_TIMEOUT: Duration = Duration::from_secs(5);

pub fn bearer_token_file_meta(configured: &str) -> acp::Meta {
    acp::Meta::from_iter([(BEARER_TOKEN_FILE_META_KEY.to_owned(), configured.into())])
}

#[derive(Debug, Clone)]
pub struct BearerTokenFile {
    path: Arc<PathBuf>,
    read_timeout: Duration,
    gate: Arc<tokio::sync::Mutex<()>>,
    read_slot: Arc<tokio::sync::Semaphore>,
}

impl BearerTokenFile {
    pub fn from_meta(meta: Option<&acp::Meta>) -> io::Result<Option<Self>> {
        let Some(value) = meta.and_then(|m| m.get(BEARER_TOKEN_FILE_META_KEY)) else {
            return Ok(None);
        };
        let configured = value.as_str().ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidInput,
                "bearer_token_file metadata must be a string",
            )
        })?;
        let path = if let Some(rest) = configured.strip_prefix("~/") {
            let home = std::env::var_os("HOME")
                .or_else(|| std::env::var_os("USERPROFILE"))
                .ok_or_else(|| {
                    io::Error::new(
                        io::ErrorKind::InvalidInput,
                        "bearer_token_file home directory is unavailable",
                    )
                })?;
            PathBuf::from(home).join(rest)
        } else {
            PathBuf::from(configured)
        };
        Self::new(path).map(Some)
    }

    pub fn new(path: PathBuf) -> io::Result<Self> {
        if !path.is_absolute() {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "bearer_token_file must be an absolute or ~/ path",
            ));
        }
        Ok(Self {
            path: Arc::new(path),
            read_timeout: TOKEN_READ_TIMEOUT,
            gate: Arc::default(),
            read_slot: Arc::new(tokio::sync::Semaphore::new(1)),
        })
    }

    pub(crate) async fn read(&self) -> io::Result<String> {
        let deadline = tokio::time::Instant::now() + self.read_timeout;
        // Serialize the check and job creation: concurrent requests cannot each
        // pin a blocking thread on a stalled mount. Rebuilt clients share this state.
        let _gate = tokio::time::timeout_at(deadline, self.gate.lock())
            .await
            .map_err(|_| self.error(io::ErrorKind::TimedOut, "read timed out"))?;
        let slot =
            self.read_slot.clone().try_acquire_owned().map_err(|_| {
                self.error(io::ErrorKind::TimedOut, "an earlier read has not returned")
            })?;
        // The blocking task owns the permit even when the async caller is
        // cancelled. A hung mount can never accumulate detached read jobs.
        let mut job = tokio::task::spawn_blocking({
            let path = self.path.clone();
            move || {
                let _slot = slot;
                read_token_file_sync(&path)
            }
        });
        let contents = match tokio::time::timeout_at(deadline, &mut job).await {
            Ok(result) => result.map_err(|_| self.error(io::ErrorKind::Other, "reader failed"))?,
            Err(_) => {
                return Err(self.error(io::ErrorKind::TimedOut, "read timed out"));
            }
        }
        .map_err(|e| self.error(e.kind(), &e.to_string()))?;
        let token = contents.trim();
        if token.is_empty() {
            return Err(self.error(io::ErrorKind::InvalidData, "file is empty"));
        }
        if http::HeaderValue::from_str(&format!("Bearer {token}")).is_err() {
            return Err(self.error(
                io::ErrorKind::InvalidData,
                "file is not a valid HTTP header",
            ));
        }
        Ok(token.to_owned())
    }

    fn error(&self, kind: io::ErrorKind, reason: &str) -> io::Error {
        io::Error::new(
            kind,
            format!("bearer_token_file {}: {reason}", self.path.display()),
        )
    }
}

fn read_token_file_sync(path: &Path) -> io::Result<String> {
    let mut contents = Vec::new();
    std::fs::File::open(path)?
        .take(MAX_TOKEN_FILE_BYTES + 1)
        .read_to_end(&mut contents)?;
    if contents.len() as u64 > MAX_TOKEN_FILE_BYTES {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "file exceeds 16 KiB",
        ));
    }
    String::from_utf8(contents)
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "file is not UTF-8"))
}

#[cfg(test)]
#[path = "bearer_token_file_tests.rs"]
mod tests;
