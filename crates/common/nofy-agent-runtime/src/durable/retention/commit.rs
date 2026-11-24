//! Connection-private configuration mutation journal; no durable schema change.
use super::*;
use crate::admission::CommitPermit;

pub(crate) fn initialize(tx: &Transaction<'_>) -> Result<(), Error> {
    tx.execute_batch("CREATE TEMP TABLE nofy_retained_writes(sequence INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT NOT NULL, payload TEXT NOT NULL)").map_err(db_error)?;
    for &(kind, table, _, _, fields) in SOURCES {
        let changed = fields
            .iter()
            .map(|p| {
                format!("json_extract(OLD.payload,'{p}') IS NOT json_extract(NEW.payload,'{p}')")
            })
            .collect::<Vec<_>>()
            .join(" OR ");
        for (operation, condition) in [
            ("INSERT", String::new()),
            ("UPDATE", format!("WHEN {changed}")),
        ] {
            let condition = if kind == "input" {
                let next = "json_extract(NEW.payload,'$.input.kind')='next_turn'";
                if operation == "INSERT" {
                    format!("WHEN {next}")
                } else {
                    format!("WHEN ({changed}) AND {next}")
                }
            } else {
                condition
            };
            let key = if matches!(kind, "checkpoint" | "child") {
                "NEW.key"
            } else {
                "''"
            };
            tx.execute_batch(&format!("CREATE TEMP TRIGGER nofy_retained_{kind}_{operation} AFTER {operation} ON main.{table} {condition} BEGIN INSERT INTO nofy_retained_writes(kind,key,payload) VALUES('{kind}',{key},NEW.payload); END")).map_err(db_error)?;
        }
    }
    Ok(())
}
pub(crate) fn needed(tx: &Transaction<'_>) -> Result<bool, Error> {
    tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM temp.nofy_retained_writes)",
        [],
        |r| r.get(0),
    )
    .map_err(db_error)
}
pub(crate) fn inherited_scope(
    tx: &Transaction<'_>,
    owner: Option<&Lease>,
    policy: &dyn crate::admission::CommitAdmission,
) -> Result<Option<Vec<ModuleDefinition>>, Error> {
    let Some(owner) = owner else {
        return Ok(None);
    };
    if owner_record(tx, owner).is_err() {
        return Ok(None);
    }
    let mut parent = None;
    let mut scan = Scan::new(RetentionLimits::default());
    let mut statement=tx.prepare("SELECT kind,length(CAST(payload AS BLOB)),payload FROM temp.nofy_retained_writes ORDER BY sequence LIMIT 100001").map_err(db_error)?;
    let mut rows = statement.query([]).map_err(db_error)?;
    while let Some(row) = rows.next().map_err(db_error)? {
        let kind: String = row.get(0).map_err(db_error)?;
        if !matches!(kind.as_str(), "checkpoint" | "child") {
            return Ok(None);
        }
        account(&mut scan, row.get(1).map_err(db_error)?, 0)?;
        let payload: String = row.get(2).map_err(db_error)?;
        let mut inherited = true;
        let origin = RetentionOrigin {
            kind: kind.clone(),
            key: String::new(),
            slot: String::new(),
        };
        decode::record(&kind, &payload, &origin, &mut scan, |_, modules| {
            if !modules.is_empty() {
                if parent.is_none() {
                    parent = Some(owner_declarations(tx, owner)?);
                }
                let refs = parent
                    .as_ref()
                    .expect("loaded owner declarations")
                    .iter()
                    .collect::<Vec<_>>();
                inherited &= policy.permits_inherited(&refs, &kind, modules)?;
            }
            Ok(())
        })?;
        if !inherited {
            return Ok(None);
        }
        scan.check()?;
    }
    // Only opaque auxiliary state under an already committed supervised root
    // remains. It cannot introduce modules beyond that root's frozen closure.
    Ok(Some(parent.unwrap_or_default()))
}
pub(crate) fn validate(
    tx: &Transaction<'_>,
    permit: Option<&dyn CommitPermit>,
    owner: Option<&Lease>,
    inherited: Option<&[ModuleDefinition]>,
    policy: &dyn crate::admission::CommitAdmission,
) -> Result<(), Error> {
    if !needed(tx)? {
        return Ok(());
    }
    // Commit policies may perform bounded local dependency IO; unlike the
    // observational fold, they are not CPU-only declaration callbacks.
    let mut scan = Scan::new(RetentionLimits {
        timeout_ms: 10_000,
        ..RetentionLimits::default()
    });
    let mut statement = tx
        .prepare("SELECT kind,length(CAST(payload AS BLOB)),payload,key FROM temp.nofy_retained_writes ORDER BY sequence LIMIT 100001")
        .map_err(db_error)?;
    let mut rows = statement.query([]).map_err(db_error)?;
    let mut producers = Vec::new();
    let mut live_versions = Vec::new();
    let mut identities = Vec::new();
    while let Some(row) = rows.next().map_err(db_error)? {
        let kind: String = row.get(0).map_err(db_error)?;
        let size: u64 = row.get(1).map_err(db_error)?;
        let key: String = row.get(3).map_err(db_error)?;
        account(&mut scan, size, key.len())?;
        let payload: String = row.get(2).map_err(db_error)?;
        match kind.as_str() {
            "live_version" => live_versions.push((kind, payload, key)),
            "checkpoint" | "child" => identities.push((kind, payload, key)),
            _ => producers.push((kind, payload, key)),
        }
    }
    drop(rows);
    drop(statement);
    // Identity-only rows may refer to an already admitted job/live snapshot.
    // Validate producers in this transaction first, then resolve prior coverage
    // via O(1) indexed lookups in `agent_runtime_composition_digests`.
    if inherited.is_none() && (!live_versions.is_empty() || !identities.is_empty()) {
        schema(tx)?;
    }
    for (kind, payload, _key) in producers {
        let origin = RetentionOrigin {
            kind: kind.clone(),
            key: String::new(),
            slot: String::new(),
        };
        decode::record(&kind, &payload, &origin, &mut scan, |origin, modules| {
            validate_modules(permit, inherited, policy, &origin.kind, modules)
        })?;
        scan.check()?;
    }
    for (kind, payload, _key) in live_versions {
        if inherited.is_none()
            && let Some(digest) = live_before_composition_digest(&payload)
            && !scan.known_compositions.contains(&digest)
            && has_composition_digest(tx, &digest)?
        {
            scan.known_compositions.insert(digest);
        }
        let origin = RetentionOrigin {
            kind: kind.clone(),
            key: String::new(),
            slot: String::new(),
        };
        decode::record(&kind, &payload, &origin, &mut scan, |origin, modules| {
            validate_modules(permit, inherited, policy, &origin.kind, modules)
        })?;
        scan.check()?;
    }
    for (kind, payload, key) in identities {
        if inherited.is_none()
            && let Ok(digest) = composition_digest(&payload)
            && !scan.known_compositions.contains(&digest)
            && has_composition_digest(tx, &digest)?
        {
            scan.known_compositions.insert(digest);
        }
        let origin = RetentionOrigin {
            kind: kind.clone(),
            key: String::new(),
            slot: String::new(),
        };
        let opaque = scan.coverage.opaque_compositions;
        decode::record(&kind, &payload, &origin, &mut scan, |origin, modules| {
            validate_modules(permit, inherited, policy, &origin.kind, modules)
        })?;
        if scan.coverage.opaque_compositions > opaque
            && matches!(kind.as_str(), "checkpoint" | "child")
        {
            if !is_owned(tx, &kind, &key, &payload)? {
                certify(tx, &kind, &key, &payload, owner, &mut scan, permit)?;
            }
            covered(&mut scan, &origin, opaque);
        }
        scan.check()?;
    }
    if scan.coverage.opaque_compositions != 0 {
        let kind = scan
            .coverage
            .opaque_samples
            .first()
            .map_or("unknown", |o| o.kind.as_str());
        return Err(failure(&format!(
            "new retained {kind} composition lacks a certified declaration snapshot"
        )));
    }
    if !scan.produced_compositions.is_empty() {
        let mut insert = tx
            .prepare_cached(
                "INSERT OR IGNORE INTO agent_runtime_composition_digests(digest) VALUES(?1)",
            )
            .map_err(db_error)?;
        for digest in &scan.produced_compositions {
            insert.execute([digest]).map_err(db_error)?;
        }
    }
    tx.execute("DELETE FROM temp.nofy_retained_writes", [])
        .map_err(db_error)?;
    Ok(())
}

const NEEDS_COMPOSITION_BACKFILL_SQL: &str = "SELECT
    NOT EXISTS(SELECT 1 FROM agent_runtime_composition_digests)
    AND (
        EXISTS(SELECT 1 FROM agent_runtime_jobs)
        OR EXISTS(SELECT 1 FROM agent_runtime_runs)
        OR EXISTS(SELECT 1 FROM agent_runtime_live_versions)
        OR EXISTS(SELECT 1 FROM agent_runtime_session_seeds)
        OR EXISTS(
            SELECT 1 FROM agent_runtime_session_ops
            WHERE json_valid(payload)
              AND json_extract(payload, '$.prepared.submission.composition_digest') IS NOT NULL
        )
    )";

pub(crate) fn needs_composition_backfill(tx: &Transaction<'_>) -> Result<bool, Error> {
    tx.query_row(NEEDS_COMPOSITION_BACKFILL_SQL, [], |r| r.get(0))
        .map_err(db_error)
}

pub(crate) fn backfill_composition_digests(tx: &Transaction<'_>) -> Result<(), Error> {
    let mut insert = tx
        .prepare_cached(
            "INSERT OR IGNORE INTO agent_runtime_composition_digests(digest) VALUES(?1)",
        )
        .map_err(db_error)?;
    for sql in [
        "SELECT json_extract(payload, '$.submission.composition_digest') FROM agent_runtime_jobs WHERE json_valid(payload)",
        "SELECT json_extract(payload, '$.info.composition_digest') FROM agent_runtime_session_seeds WHERE json_valid(payload)",
        "SELECT json_extract(payload, '$.prepared.submission.composition_digest') FROM agent_runtime_session_ops WHERE json_valid(payload) AND json_extract(payload, '$.prepared.submission.composition_digest') IS NOT NULL",
    ] {
        let mut stmt = tx.prepare(sql).map_err(db_error)?;
        let mut rows = stmt.query([]).map_err(db_error)?;
        while let Some(row) = rows.next().map_err(db_error)? {
            let value: Option<String> = row.get(0).map_err(db_error)?;
            if let Some(digest) = value
                && digest.len() == 64
                && digest.bytes().all(|b| b.is_ascii_hexdigit())
            {
                insert
                    .execute([digest.to_ascii_lowercase()])
                    .map_err(db_error)?;
            }
        }
    }
    for sql in [
        "SELECT json_extract(payload, '$.composition') FROM agent_runtime_runs WHERE json_valid(payload)",
        "SELECT json_extract(payload, '$.after.composition') FROM agent_runtime_live_versions WHERE json_valid(payload)",
    ] {
        let mut stmt = tx.prepare(sql).map_err(db_error)?;
        let mut rows = stmt.query([]).map_err(db_error)?;
        while let Some(row) = rows.next().map_err(db_error)? {
            let value: Option<String> = row.get(0).map_err(db_error)?;
            if let Some(text) = value {
                let digest = format!("{:x}", Sha256::digest(text.as_bytes()));
                insert.execute([digest]).map_err(db_error)?;
            }
        }
    }
    Ok(())
}

fn has_composition_digest(tx: &Transaction<'_>, digest: &str) -> Result<bool, Error> {
    tx.prepare_cached(
        "SELECT EXISTS(SELECT 1 FROM agent_runtime_composition_digests WHERE digest=?1)",
    )
    .map_err(db_error)?
    .query_row([digest], |r| r.get(0))
    .map_err(db_error)
}

fn live_before_composition_digest(payload: &str) -> Option<String> {
    #[derive(Deserialize)]
    struct LiveBefore {
        before: LiveCheckpoint,
    }
    #[derive(Deserialize)]
    struct LiveCheckpoint {
        composition: String,
    }
    let row: LiveBefore = serde_json::from_str(payload).ok()?;
    Some(format!(
        "{:x}",
        Sha256::digest(row.before.composition.as_bytes())
    ))
}
fn composition_digest(payload: &str) -> Result<String, Error> {
    #[derive(Deserialize)]
    struct Identity {
        composition: String,
    }
    let row: Identity =
        serde_json::from_str(payload).map_err(|_| failure("invalid retained identity"))?;
    Ok(format!("{:x}", Sha256::digest(row.composition.as_bytes())))
}
pub(super) fn is_owned(
    tx: &Transaction<'_>,
    kind: &str,
    key: &str,
    payload: &str,
) -> Result<bool, Error> {
    if !matches!(kind, "checkpoint" | "child") {
        return Ok(false);
    }
    let digest = composition_digest(payload)?;
    tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_retained_owners o JOIN agent_runtime_runs r ON r.id=o.root_id WHERE o.version=1 AND o.kind=?1 AND o.key=?2 AND o.composition_digest=?3)", params![kind,key,digest], |r| r.get(0)).map_err(db_error)
}
fn certify(
    tx: &Transaction<'_>,
    kind: &str,
    key: &str,
    payload: &str,
    owner: Option<&Lease>,
    scan: &mut Scan,
    permit: Option<&dyn CommitPermit>,
) -> Result<(), Error> {
    let owner = owner
        .ok_or_else(|| failure("unowned retained identity requires a declaration snapshot"))?;
    let (root, snapshot) = owner_record(tx, owner)?;
    let origin = RetentionOrigin {
        kind: "owner".into(),
        key: String::new(),
        slot: String::new(),
    };
    decode::record(
        "execution",
        &snapshot,
        &origin,
        scan,
        |_, modules| match permit {
            Some(permit) => permit.validate("owner", modules),
            None => Ok(()),
        },
    )?;
    tx.execute("INSERT INTO agent_runtime_retained_owners(kind,key,root_id,composition_digest) VALUES(?1,?2,?3,?4) ON CONFLICT(kind,key) DO UPDATE SET root_id=excluded.root_id,composition_digest=excluded.composition_digest", params![kind,key,root,composition_digest(payload)?]).map_err(db_error)?;
    Ok(())
}
fn validate_modules(
    permit: Option<&dyn CommitPermit>,
    inherited: Option<&[ModuleDefinition]>,
    policy: &dyn crate::admission::CommitAdmission,
    kind: &str,
    modules: &[&ModuleDefinition],
) -> Result<(), Error> {
    match permit {
        Some(permit) => permit.validate(kind, modules),
        None if modules.is_empty() => Ok(()),
        None if inherited.is_some_and(|scope| {
            policy
                .permits_inherited(&scope.iter().collect::<Vec<_>>(), kind, modules)
                .unwrap_or(false)
        }) =>
        {
            Ok(())
        }
        None => Err(failure("new declarations require a commit permit")),
    }
}
fn owner_record(tx: &Transaction<'_>, owner: &Lease) -> Result<(String, String), Error> {
    tx.query_row("SELECT r.id,r.payload FROM agent_runtime_threads t JOIN agent_runtime_runs r ON r.id=t.active_run JOIN agent_runtime_leases l ON l.key=t.key WHERE t.key=?1 AND l.owner=?2 AND l.fence=?3 AND r.thread_key=t.key",params![owner.key,owner.owner,owner.fence],|r|Ok((r.get(0)?,r.get(1)?))).map_err(|_|failure("retained identity lacks a supervised root owner"))
}
fn owner_declarations(tx: &Transaction<'_>, owner: &Lease) -> Result<Vec<ModuleDefinition>, Error> {
    let (root, execution) = owner_record(tx, owner)?;
    let mut scan = Scan::new(RetentionLimits::default());
    let mut modules = Vec::new();
    let origin = RetentionOrigin {
        kind: "owner".into(),
        key: String::new(),
        slot: String::new(),
    };
    account(&mut scan, execution.len() as u64, 0)?;
    decode::record("execution", &execution, &origin, &mut scan, |_, defs| {
        modules.extend(defs.iter().map(|d| (*d).clone()));
        Ok(())
    })?;
    for (kind, table, order) in [
        ("live_version", "agent_runtime_live_versions", "revision"),
        ("session_seed", "agent_runtime_session_seeds", "run_id"),
    ] {
        let mut statement=tx.prepare(&format!("SELECT length(CAST(payload AS BLOB)),payload FROM {table} WHERE run_id=?1 ORDER BY {order} LIMIT 100001")).map_err(db_error)?;
        let mut rows = statement.query([&root]).map_err(db_error)?;
        while let Some(row) = rows.next().map_err(db_error)? {
            account(&mut scan, row.get(0).map_err(db_error)?, 0)?;
            let payload: String = row.get(1).map_err(db_error)?;
            decode::record(kind, &payload, &origin, &mut scan, |_, defs| {
                modules.extend(defs.iter().map(|d| (*d).clone()));
                Ok(())
            })?;
            scan.check()?;
        }
    }
    Ok(modules)
}
