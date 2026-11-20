use crate::{HostError, Result};
use rusqlite::{Connection, OpenFlags, OptionalExtension, params};
use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::Duration,
};

#[derive(Clone)]
pub(super) struct Journal(Arc<PathBuf>);

fn storage(error: impl std::fmt::Display) -> HostError {
    HostError::Unavailable(format!("Omni evolution journal: {error}"))
}

fn open(path: &Path, create: bool) -> Result<Connection> {
    let mut flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_NOFOLLOW;
    if create {
        flags |= OpenFlags::SQLITE_OPEN_CREATE;
    }
    let conn = Connection::open_with_flags(path, flags).map_err(storage)?;
    conn.busy_timeout(Duration::from_secs(2)).map_err(storage)?;
    conn.pragma_update(None, "synchronous", "FULL")
        .map_err(storage)?;
    Ok(conn)
}

impl Journal {
    pub(super) fn new(path: PathBuf) -> Self {
        Self(Arc::new(path))
    }

    pub(super) fn initialize(&self) -> Result<()> {
        let conn = open(&self.0, true)?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS omni_prompt_evolution_v1 (
            key TEXT PRIMARY KEY, grant_digest TEXT NOT NULL,
            revision INTEGER NOT NULL CHECK (revision > 0), body TEXT NOT NULL
        );",
        )
        .map_err(storage)
    }

    async fn local<T: Send + 'static>(
        &self,
        f: impl FnOnce(Connection) -> Result<T> + Send + 'static,
    ) -> Result<T> {
        let path = self.0.clone();
        tokio::task::spawn_blocking(move || f(open(&path, false)?))
            .await
            .map_err(storage)?
    }

    pub(super) async fn load(&self, key: &str) -> Result<Option<(u64, String, String)>> {
        let key = key.to_owned();
        self.local(move |conn| {
            conn.query_row(
                "SELECT revision,grant_digest,body FROM omni_prompt_evolution_v1 WHERE key=?1",
                [key],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .optional()
            .map_err(storage)
        })
        .await
    }

    pub(super) async fn save(
        &self,
        key: &str,
        digest: &str,
        revision: Option<u64>,
        body: String,
    ) -> Result<()> {
        let key = key.to_owned();
        let digest = digest.to_owned();
        self.local(move |conn| {
            let rows = if let Some(revision) = revision {
                let next = revision.checked_add(1).ok_or_else(|| storage("revision exhausted"))?;
                conn.execute("UPDATE omni_prompt_evolution_v1 SET body=?1,revision=?2 WHERE key=?3 AND grant_digest=?4 AND revision=?5", params![body, next, key, digest, revision])
            } else {
                conn.execute("INSERT INTO omni_prompt_evolution_v1 (key,grant_digest,revision,body) VALUES (?1,?2,1,?3) ON CONFLICT(key) DO NOTHING", params![key,digest,body])
            }.map_err(storage)?;
            if rows == 1 { Ok(()) } else { Err(storage("proposal changed concurrently")) }
        }).await
    }
}
