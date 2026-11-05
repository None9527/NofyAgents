//! Observational retention inventory, not authority to delete external data.
use super::*;
use crate::registry::ModuleDefinition;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
pub(super) mod commit;
mod decode;
#[cfg(test)]
mod tests;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RetentionLimits {
    pub max_rows: u64,
    pub max_bytes: u64,
    pub timeout_ms: u64,
}
impl Default for RetentionLimits {
    fn default() -> Self {
        Self {
            max_rows: 100_000,
            max_bytes: 256 * 1024 * 1024,
            timeout_ms: 2000,
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(deny_unknown_fields)]
pub struct RetentionOrigin {
    pub kind: String,
    pub key: String,
    pub slot: String,
}
#[derive(Clone, Debug, Serialize)]
pub struct RetentionCoverage {
    pub rows: u64,
    pub bytes: u64,
    pub fingerprint: String,
    pub opaque_compositions: u64,
    pub decoded_compositions: u64,
    pub covered_compositions: u64,
    pub opaque_samples: Vec<RetentionOrigin>,
}
pub struct RetentionInspection<T> {
    pub value: T,
    pub coverage: RetentionCoverage,
}
struct Scan {
    coverage: RetentionCoverage,
    hash: Sha256,
    start: std::time::Instant,
    limits: RetentionLimits,
    unbounded: bool,
    known_compositions: std::collections::BTreeSet<String>,
}
impl Scan {
    fn new(limits: RetentionLimits) -> Self {
        Self {
            coverage: RetentionCoverage {
                rows: 0,
                bytes: 0,
                fingerprint: String::new(),
                opaque_compositions: 0,
                decoded_compositions: 0,
                covered_compositions: 0,
                opaque_samples: Vec::new(),
            },
            hash: Sha256::new(),
            start: std::time::Instant::now(),
            limits,
            unbounded: false,
            known_compositions: Default::default(),
        }
    }
    fn check(&self) -> Result<(), Error> {
        if self.unbounded {
            return Ok(());
        }
        if self.coverage.rows > self.limits.max_rows
            || self.coverage.bytes > self.limits.max_bytes
            || self.start.elapsed().as_millis() > u128::from(self.limits.timeout_ms)
        {
            return Err(failure("retention inspection exceeded its limits"));
        }
        Ok(())
    }
    fn opaque(&mut self, origin: RetentionOrigin) {
        self.coverage.opaque_compositions += 1;
        if self.coverage.opaque_samples.len() < 16 {
            self.coverage.opaque_samples.push(origin);
        }
    }
}
/// Administrative snapshot fold without the interactive GC scan quotas. The
/// caller owns the physical snapshot and fences configuration writers. Only
/// typed declaration positions are decoded; histories are never rewritten.
pub fn inspect_snapshot_modules<T>(
    path: &Path,
    initial: T,
    mut visit: impl FnMut(&mut T, &RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>,
) -> Result<RetentionInspection<T>, Error> {
    let mut db = super::transport::readonly(path)?;
    let tx = db
        .transaction_with_behavior(TransactionBehavior::Deferred)
        .map_err(db_error)?;
    schema(&tx)?;
    let mut scan = Scan::new(RetentionLimits::default());
    scan.unbounded = true;
    let mut value = initial;
    read_sources(&tx, &mut scan, |origin, modules| {
        visit(&mut value, origin, modules)
    })?;
    tx.commit().map_err(db_error)?;
    scan.coverage.fingerprint = format!("{:x}", scan.hash.finalize());
    Ok(RetentionInspection {
        value,
        coverage: scan.coverage,
    })
}
fn failure(message: &str) -> Error {
    Error::Checkpoint(message.into())
}

impl SqliteStore {
    /// A bounded fold over known configuration-bearing durable records. The
    /// callback receives declarations only, never messages or tool results.
    /// It must be CPU-bounded and free of IO; this is not a deletion fence.
    pub async fn inspect_retained_modules<T: Send + 'static>(
        &self,
        limits: RetentionLimits,
        initial: T,
        mut visit: impl FnMut(&mut T, &RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>
        + Send
        + 'static,
    ) -> Result<RetentionInspection<T>, Error> {
        if !(1..=100_000).contains(&limits.max_rows)
            || !(1..=256 * 1024 * 1024).contains(&limits.max_bytes)
            || !(1..=2000).contains(&limits.timeout_ms)
        {
            return Err(failure("invalid retention limits"));
        }
        let permit = self
            .retention_work
            .clone()
            .acquire_owned()
            .await
            .map_err(|_| failure("retention admission unavailable"))?;
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let _permit = permit;
            let location = store.location()?;
            let mut connection = Connection::open_with_flags(
                &location.path,
                rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY
                    | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
            )
            .map_err(|_| failure("retention database unavailable"))?;
            connection
                .busy_timeout(Duration::from_millis(100))
                .map_err(|_| failure("retention read timeout unavailable"))?;
            connection
                .pragma_update(None, "query_only", true)
                .map_err(|_| failure("retention query-only mode unavailable"))?;
            // SAFETY: this connection is owned by this blocking task only. The
            // C limit prevents SQLite itself materializing an oversized value.
            unsafe {
                rusqlite::ffi::sqlite3_limit(
                    connection.handle(),
                    rusqlite::ffi::SQLITE_LIMIT_LENGTH,
                    64 * 1024 * 1024,
                );
            }
            let tx = connection
                .transaction_with_behavior(TransactionBehavior::Deferred)
                .map_err(|_| failure("retention read snapshot unavailable"))?;
            schema(&tx)?;
            let mut scan = Scan::new(limits);
            let mut value = initial;
            read_sources(&tx, &mut scan, |origin, modules| {
                visit(&mut value, origin, modules)
            })?;
            tx.commit()
                .map_err(|_| failure("retention read snapshot failed"))?;
            scan.coverage.fingerprint = format!("{:x}", scan.hash.finalize());
            Ok(RetentionInspection {
                value,
                coverage: scan.coverage,
            })
        })
        .await
        .map_err(|_| failure("retention read task failed"))?
    }
}
// The reader and connection-private mutation journal share this source list.
type Source = (
    &'static str,
    &'static str,
    &'static str,
    &'static str,
    &'static [&'static str],
);
const SOURCES: &[Source] = &[
    (
        "approval_grant",
        "agent_runtime_approval_grants",
        "grant_id",
        "grant_id",
        &["$"],
    ),
    (
        "session_branch",
        "agent_runtime_session_branches",
        "session_id",
        "session_id",
        &["$"],
    ),
    (
        "session_profile",
        "agent_runtime_session_profiles",
        "session_id",
        "session_id",
        &["$.protocol", "$.policy"],
    ),
    (
        "session_admission",
        "agent_runtime_session_admissions",
        "run_id",
        "run_id",
        &["$.policy"],
    ),
    (
        "session_operation",
        "agent_runtime_session_ops",
        "command_id",
        "command_id",
        &["$.prepared.policy", "$.prepared.submission.snapshot"],
    ),
    (
        "job",
        "agent_runtime_jobs",
        "run_id",
        "run_id",
        &["$.submission.snapshot", "$.submission.composition_digest"],
    ),
    (
        "execution",
        "agent_runtime_runs",
        "id",
        "id",
        &["$.snapshot", "$.composition"],
    ),
    (
        "input",
        "agent_runtime_mailbox",
        "CAST(sequence AS TEXT)",
        "sequence",
        &["$.input"],
    ),
    (
        "transition",
        "agent_runtime_transition_proposals",
        "command_id",
        "command_id",
        &["$.snapshot"],
    ),
    (
        "live_version",
        "agent_runtime_live_versions",
        "run_id || '@' || revision",
        "run_id,revision",
        &[
            "$.protocol",
            "$.snapshot",
            "$.before.composition",
            "$.after.composition",
        ],
    ),
    (
        "session_seed",
        "agent_runtime_session_seeds",
        "run_id",
        "run_id",
        &["$.info", "$.snapshot"],
    ),
    (
        "checkpoint",
        "agent_runtime_checkpoints",
        "key",
        "key",
        &["$.version", "$.composition"],
    ),
    (
        "child",
        "agent_runtime_children",
        "key",
        "key",
        &["$.composition"],
    ),
];
fn read_sources(
    tx: &Transaction<'_>,
    scan: &mut Scan,
    mut visit: impl FnMut(&RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>,
) -> Result<(), Error> {
    // Provenance is part of the reference cut, not an invisible cached hint.
    let limit = if scan.unbounded {
        String::new()
    } else {
        format!(" LIMIT {}", scan.limits.max_rows + 1)
    };
    let mut proof = tx.prepare(&format!("SELECT version,kind,key,root_id,composition_digest FROM agent_runtime_retained_owners ORDER BY kind,key{limit}")).map_err(db_error)?;
    let mut rows = proof.query([]).map_err(db_error)?;
    while let Some(row) = rows.next().map_err(db_error)? {
        let version: u32 = row.get(0).map_err(db_error)?;
        let kind: String = row.get(1).map_err(db_error)?;
        let key: String = row.get(2).map_err(db_error)?;
        let root: String = row.get(3).map_err(db_error)?;
        let digest: String = row.get(4).map_err(db_error)?;
        if version != 1
            || !matches!(kind.as_str(), "checkpoint" | "child")
            || digest.len() != 64
            || !digest.bytes().all(|b| b.is_ascii_hexdigit())
        {
            return Err(failure("unrecognized retained provenance"));
        }
        account(
            scan,
            (kind.len() + root.len() + digest.len()) as u64,
            key.len(),
        )?;
        for part in [
            b"retained-owner-v1".as_slice(),
            kind.as_bytes(),
            key.as_bytes(),
            root.as_bytes(),
            digest.as_bytes(),
        ] {
            scan.hash.update((part.len() as u64).to_be_bytes());
            scan.hash.update(part);
        }
    }
    drop(rows);
    drop(proof);
    for &(kind, table, key, order, _) in SOURCES {
        let limit = if scan.unbounded {
            String::new()
        } else {
            format!(
                " LIMIT {}",
                scan.limits.max_rows.saturating_sub(scan.coverage.rows) + 1
            )
        };
        let sql = format!(
            "SELECT {key},length(CAST(payload AS BLOB)),payload FROM {table} ORDER BY {order}{limit}"
        );
        let mut statement = tx
            .prepare(&sql)
            .map_err(|_| failure("retention source unavailable"))?;
        let mut rows = statement
            .query([])
            .map_err(|_| failure("retention source read failed"))?;
        while let Some(row) = rows
            .next()
            .map_err(|_| failure("retention source read failed"))?
        {
            let key: String = row.get(0).map_err(|_| failure("invalid retention key"))?;
            let size: u64 = row
                .get(1)
                .map_err(|_| failure("invalid retention row size"))?;
            account(scan, size, key.len())?;
            let payload: String = row
                .get(2)
                .map_err(|_| failure("retention payload unavailable"))?;
            for part in [kind.as_bytes(), key.as_bytes(), payload.as_bytes()] {
                scan.hash.update((part.len() as u64).to_be_bytes());
                scan.hash.update(part);
            }
            let origin = RetentionOrigin {
                kind: kind.into(),
                key: format!("sha256:{:x}", Sha256::digest(key.as_bytes())),
                slot: String::new(),
            };
            let opaque = scan.coverage.opaque_compositions;
            decode::record(kind, &payload, &origin, scan, &mut visit)?;
            if scan.coverage.opaque_compositions > opaque
                && commit::is_owned(tx, kind, &key, &payload)?
            {
                covered(scan, &origin, opaque);
            }
            scan.check()?;
        }
    }
    Ok(())
}
fn covered(scan: &mut Scan, origin: &RetentionOrigin, previous: u64) {
    scan.coverage.covered_compositions += scan.coverage.opaque_compositions - previous;
    scan.coverage.opaque_compositions = previous;
    if scan.coverage.opaque_samples.last() == Some(origin) {
        scan.coverage.opaque_samples.pop();
    }
}
fn account(scan: &mut Scan, size: u64, key_bytes: usize) -> Result<(), Error> {
    scan.check()?;
    let bytes = size.saturating_add(key_bytes as u64);
    if size > 64 * 1024 * 1024
        || !scan.unbounded
            && (scan.coverage.rows >= scan.limits.max_rows
                || scan.coverage.bytes.saturating_add(bytes) > scan.limits.max_bytes)
    {
        return Err(failure("retention row/count/byte limit exceeded"));
    }
    scan.coverage.rows += 1;
    scan.coverage.bytes += bytes;
    Ok(())
}
fn schema(tx: &Transaction<'_>) -> Result<(), Error> {
    let versions = tx
        .prepare("SELECT version FROM agent_runtime_schema LIMIT 2")
        .map_err(|_| failure("retention schema unavailable"))?
        .query_map([], |r| r.get::<_, u32>(0))
        .map_err(|_| failure("retention schema unavailable"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|_| failure("retention schema unavailable"))?;
    if versions != [1] {
        return Err(failure("unsupported retention schema"));
    }
    const KNOWN: &[&str] = &[
        "schema",
        "checkpoints",
        "leases",
        "runs",
        "threads",
        "children",
        "events",
        "event_receipts",
        "budget_roots",
        "budget_operations",
        "budget_events",
        "mailbox",
        "cancel",
        "reconciliations",
        "jobs",
        "approvals",
        "approval_grants",
        "managed_runs",
        "managed_actions",
        "abandoned_runs",
        "parks",
        "transition_proposals",
        "live_versions",
        "sessions",
        "session_turns",
        "session_commands",
        "session_seeds",
        "session_profiles",
        "session_admissions",
        "session_ops",
        "session_branches",
        "retained_owners",
    ];
    let mut statement = tx
        .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND lower(name) GLOB 'agent_runtime_*'",
        )
        .map_err(|_| failure("retention table inventory unavailable"))?;
    let mut names = statement
        .query([])
        .map_err(|_| failure("retention table inventory unavailable"))?;
    while let Some(row) = names
        .next()
        .map_err(|_| failure("retention table inventory unavailable"))?
    {
        let name: String = row
            .get(0)
            .map_err(|_| failure("retention table inventory unavailable"))?;
        if !name
            .to_ascii_lowercase()
            .strip_prefix("agent_runtime_")
            .is_some_and(|n| KNOWN.contains(&n))
        {
            return Err(failure("unrecognized retained runtime table"));
        }
    }
    Ok(())
}
