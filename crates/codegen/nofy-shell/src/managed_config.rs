//! Managed policy artifacts on disk (`managed_config.toml` + `requirements.toml`).
//!
//! The network sync that used to fetch these artifacts from a deployment-config
//! endpoint was removed with the vendor backend; the local artifacts are still
//! read and enforced when present on disk (e.g. admin/MDM-provisioned), and the
//! identity-scoped lifecycle (orphan clear, tenant-switch purge, fail-closed gate)
//! stays intact.

use crate::auth::NofyAuth;

/// Server-synced policy artifacts. Excludes the sync marker ([`remove_managed_config_files`]
/// removes that last, only on full success).
pub const MANAGED_ARTIFACT_FILES: [&str; 4] = [
    nofy_config::MANAGED_CONFIG_FILENAME,
    nofy_config::REQUIREMENTS_FILENAME,
    nofy_config::signed_policy::SIGNATURE_SIDECAR_FILE,
    nofy_config::signed_policy::MANAGED_IDENTITY_SIDECAR_FILE,
];

/// Delete server-synced files then the marker (never `config.toml`).
fn remove_managed_config_files(home: &std::path::Path) {
    let mut artifacts_removed = true;
    for name in MANAGED_ARTIFACT_FILES {
        artifacts_removed &= remove_synced_file(home, name, "removed managed config file");
    }
    // Marker last, only on full success: crash/error leaves the detector armed for the next start.
    if artifacts_removed {
        remove_synced_file(
            home,
            nofy_config::MANAGED_CONFIG_CACHE_FILE,
            "removed managed config file",
        );
    }
    // Best-effort sweep of mid-write `.tmp` leftovers (a concurrent writer's temp may go too —
    // its rename fails and self-heals).
    let atomic_write_tmp_prefixes = [
        format!("{}.", nofy_config::MANAGED_CONFIG_CACHE_FILE),
        format!(
            "{}.",
            nofy_config::signed_policy::SIGNATURE_SIDECAR_FILE
        ),
        format!(
            "{}.",
            nofy_config::signed_policy::MANAGED_IDENTITY_SIDECAR_FILE
        ),
    ];
    if let Ok(entries) = std::fs::read_dir(home) {
        for entry in entries.flatten() {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            let is_write_tmp = name.ends_with(".tmp")
                && atomic_write_tmp_prefixes
                    .iter()
                    .any(|prefix| name.starts_with(prefix.as_str()));
            if is_write_tmp {
                let _ = std::fs::remove_file(entry.path());
            }
        }
    }
}

/// Returns whether the path is gone (removed or already absent); `false` = removal failed.
fn remove_synced_file(home: &std::path::Path, name: &str, why: &str) -> bool {
    let path = home.join(name);
    match remove_managed_path(&path) {
        Ok(true) => {
            tracing::info!(file = %path.display(), "{why}");
            true
        }
        Ok(false) => true,
        Err(e) => {
            tracing::warn!(file = %path.display(), error = %e, "failed to remove managed config file");
            false
        }
    }
}

/// Clear a directory squatting where a managed file is about to be WRITTEN — the atomic
/// rename would fail onto it forever, permanently blocking the self-heal. Best-effort:
/// the write's own error surfaces if clearing fails.
fn clear_squatting_dir(path: &std::path::Path) {
    if std::fs::symlink_metadata(path).is_ok_and(|m| m.is_dir())
        && let Err(e) = remove_managed_path(path)
    {
        tracing::warn!(error = %e, "failed to clear a directory squatting at a managed config path");
    }
}

/// Remove whatever occupies a managed artifact path — a squatting DIRECTORY too, else a
/// dir-squat would block removal and rewrite forever. Only ever called with the fixed
/// managed artifact/marker/sidecar names. `Ok(true)` = removed; `Ok(false)` = already absent.
fn remove_managed_path(path: &std::path::Path) -> std::io::Result<bool> {
    let is_dir = std::fs::symlink_metadata(path).is_ok_and(|m| m.is_dir());
    let result = if is_dir {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_file(path)
    };
    match result {
        Ok(()) => Ok(true),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Err(e) => Err(e),
    }
}

/// A team principal is eligible only if non-expired.
fn eligible_team_principal(auth: NofyAuth) -> Option<NofyAuth> {
    (auth.is_team_principal() && !crate::auth::is_expired(&auth)).then_some(auth)
}

/// The eligible team principal in `auth.json`, or `None`.
fn read_active_team_auth() -> Option<NofyAuth> {
    let home = crate::util::nofy_home::nofy_home();
    let store = crate::auth::read_auth_json(&home.join("auth.json")).ok()?;
    let team = store.values().find(|a| a.is_team_principal())?.clone();
    eligible_team_principal(team)
}

/// Whether any team principal is signed in, **ignoring expiry** (a cold-start
/// expired token is not a logout). `Err` = `auth.json` unreadable: callers must
/// NOT treat that as a logout — it would wipe enforced policy on a read blip.
fn team_principal_signed_in() -> std::io::Result<bool> {
    let home = crate::util::nofy_home::nofy_home();
    match crate::auth::read_auth_json(&home.join("auth.json")) {
        Ok(store) => Ok(store.values().any(|a| a.is_team_principal())),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Err(e) => Err(e),
    }
}

/// Clear the synced files when no principal could own them: no deployment key
/// configured and no team signed in (logout). A configured deployment key keeps
/// its files (original "never auto-deletes" behavior). Runs at startup;
/// best-effort.
///
/// **fail_closed:** when the marker or on-disk requirements opt in to fail-closed
/// (or requirements exist but are unreadable), do **not** wipe. A personal/User
/// principal (or signed-out auth) must not escape enforced policy by swapping
/// `auth.json` and letting orphan clear delete the artifacts. Non-fail-closed
/// team policy still clears on logout as before.
pub fn clear_orphan() {
    if resolve_deployment_key().is_some() {
        return;
    }
    match team_principal_signed_in() {
        Ok(true) => return,
        Ok(false) => {}
        Err(e) => {
            tracing::warn!(error = %e, "auth.json unreadable; keeping managed config until it recovers");
            return;
        }
    }
    let home = crate::util::nofy_home::nofy_home();
    let Some(_lock) = try_lock_managed_config(&home) else {
        return; // another process is working; retry next call
    };
    if nofy_config::fail_closed_policy_armed_at(&home) {
        tracing::info!(
            "keeping fail_closed managed policy on disk; no team principal present to own a clear"
        );
        return;
    }
    remove_managed_config_files(&home);
}

/// Best-effort cross-process lock serializing apply/remove of the managed-config
/// files. `None` on contention — the caller skips and retries next cycle.
fn try_lock_managed_config(home: &std::path::Path) -> Option<std::fs::File> {
    use fs2::FileExt;
    let file = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(home.join("managed_config.lock"))
        .ok()?;
    file.try_lock_exclusive().ok()?;
    Some(file)
}

/// One retry of the gate purge's lock ([`purge_prior_tenant_on_identity_change`]): a routine
/// concurrent apply shouldn't become a session-start refusal, but a wedged holder can't stall start.
const PURGE_LOCK_RETRY_DELAY: std::time::Duration = std::time::Duration::from_millis(100);

/// Deployment id reported for `deployment_key` on chat requests, credential
/// snapshots, and OTel: the **server** NofyBuildDeployment UUID (the id
/// server-side dashboards filter on) when the managed-config sync marker was
/// written by this same key (fingerprint match), else UUIDv5 of the key.
/// `None` key (team/OAuth) → `None`, never a stale marker value.
pub fn resolve_deployment_id(deployment_key: Option<&str>) -> Option<String> {
    let key = deployment_key.filter(|k| !k.is_empty())?;
    crate::config::managed_deployment_id(&deployment_key_fingerprint(key))
        .or_else(|| Some(crate::agent::config::deployment_id_from_key(key)))
}

/// Resolve deployment key from `NOFY_DEPLOYMENT_KEY` env var, then config files.
pub fn resolve_deployment_key() -> Option<String> {
    let config_val = crate::config::load_effective_config()
        .map_err(|e| tracing::warn!("failed to load config files for deployment key: {e}"))
        .ok()
        .and_then(|root| {
            root.get("endpoints")?
                .get("deployment_key")?
                .as_str()
                .map(|s| s.to_owned())
        });
    crate::agent::config::resolve_string_flag(
        None,
        "NOFY_DEPLOYMENT_KEY",
        config_val.as_deref(),
    )
    .map(|r| r.value)
}

/// One-way blake3 fingerprint of a deployment key — the deploy-key identity (see [`crate::config::ServingIdentity`]).
/// Deterministic so the same key matches its marker; the raw key is never written to disk.
fn deployment_key_fingerprint(key: &str) -> String {
    blake3::hash(key.as_bytes()).to_hex().to_string()
}

/// Whether a managed identity owns this machine, IGNORING token expiry (unlike the expiry-filtered
/// team read) so an
/// expired/backdated `auth.json` can't disarm the gate. Unreadable → present (fail-safe; the gate ANDs this
/// with [`crate::config::managed_policy_compromised_for`], which a personal user never satisfies).
fn managed_principal_present() -> bool {
    resolve_deployment_key().is_some() || team_principal_signed_in().unwrap_or(true)
}

/// The serving identity for an optional team id: a configured deployment key always
/// wins (keyed on its fingerprint), else the team, else none. The two public views
/// differ only in how the team id is resolved (expiry-filtered vs expiry-ignoring).
fn serving_identity_from(team_id: Option<String>) -> crate::config::ServingIdentity {
    use crate::config::ServingIdentity;
    if let Some(key) = resolve_deployment_key() {
        return ServingIdentity::DeploymentKey {
            fingerprint: deployment_key_fingerprint(&key),
        };
    }
    // Blank = unknown; trimmed (same rule as the marker write) so whitespace isn't identity.
    match crate::config::normalize_identity(team_id.as_deref()) {
        Some(team_id) => ServingIdentity::Team(team_id),
        None => ServingIdentity::None,
    }
}

/// The identity to check the cache against for whoever serves now: a configured deployment key wins
/// (else the active team, else none).
pub fn current_serving_identity() -> crate::config::ServingIdentity {
    serving_identity_from(read_active_team_auth().and_then(|a| a.team_id))
}

/// The client's team_id, IGNORING token expiry (the binding must survive the cold-start
/// expired window).
pub fn active_team_id_any_expiry() -> Option<String> {
    let home = crate::util::nofy_home::nofy_home();
    let store = crate::auth::read_auth_json(&home.join("auth.json")).ok()?;
    store
        .values()
        .find(|a| a.is_team_principal())
        // Blank → None, trimmed: a malformed/padded auth.json team_id must read as the SAME
        // identity everywhere it feeds — the gate, the tenant-switch purge, and the envelope
        // binding (an untrimmed id here would fail `check_fetch_identity` against a trimmed
        // signed payload forever).
        .and_then(|a| crate::config::normalize_identity(a.team_id.as_deref()))
}

/// Like [`current_serving_identity`] but IGNORING token expiry, for the enforcement gate:
/// a backdated `auth.json` must not resolve the team to `None` and relax the identity
/// checks.
fn current_serving_identity_any_expiry() -> crate::config::ServingIdentity {
    serving_identity_from(active_team_id_any_expiry())
}

fn auth_mode(
    has_deployment_key: bool,
    signed_in_team: &std::io::Result<bool>,
) -> nofy_telemetry::startup::AuthMode {
    use nofy_telemetry::startup::AuthMode;
    match (has_deployment_key, signed_in_team) {
        (true, _) => AuthMode::Deployment,
        (false, Ok(true)) => AuthMode::Team,
        (false, Ok(false)) => AuthMode::Personal,
        (false, Err(_)) => AuthMode::Unknown,
    }
}

/// Session-start managed-policy checkpoint. The network refetch was removed with
/// the vendor backend; this keeps the startup telemetry classification and lets
/// on-disk policy (admin/MDM-provisioned) continue to load through the config
/// layers. NEVER fails the session.
pub async fn ensure_managed_policy_present() {
    nofy_telemetry::startup::enter(nofy_telemetry::startup::StartupPhase::ManagedPolicy);
    let has_deployment_key = resolve_deployment_key().is_some();
    let signed_in_team = team_principal_signed_in();
    nofy_telemetry::startup::set_auth_mode(auth_mode(has_deployment_key, &signed_in_team));
}

/// Shown when a managed principal's enforced policy is missing/substituted and can't be restored.
const MANAGED_POLICY_MISSING_MSG: &str = "Managed policy is required for this account but is \
missing or could not be verified.\nReconnect and start again. If the problem persists, contact \
your administrator.";

/// Fail-closed session-start gate for managed principals. On a confirmed offline team
/// switch, first purges the prior team's artifacts ([`purge_prior_tenant_on_identity_change`]).
/// Without a signing key the user-writable marker is best-effort; root/MDM/signed cache
/// are the non-forgeable layers.
pub fn managed_policy_gate() -> Result<(), String> {
    // Lib unit tests skip: bootstrap would hit the host's real marker/auth. Pure decision
    // is unit-tested; integration tests exercise this path.
    if cfg!(test) {
        return Ok(());
    }
    // Purge first so an offline team switch isn't misread as a substituted cache.
    purge_prior_tenant_on_identity_change();
    // Raise the floor after the purge so a purged marker stays absent.
    bump_managed_rollback_floor();
    managed_policy_gate_decision(
        managed_principal_present(),
        // Expiry-ignoring: a backdated auth.json must not resolve Team→None and relax binding.
        crate::config::managed_policy_compromised_for(&current_serving_identity_any_expiry()),
    )
}

/// Purge prior team (A) artifacts on a confirmed offline team switch so the gate admits
/// team B. Detector is marker-scoped ([`crate::config::confirmed_team_switch`]): key-scoped
/// markers never purge here; config.toml blips are not switches. Under the managed-config
/// lock (one retry on contention, else skip like [`clear_orphan`]); a skip may refuse one
/// signed-build start until the next purge.
fn purge_prior_tenant_on_identity_change() {
    let crate::config::ServingIdentity::Team(team_id) = current_serving_identity_any_expiry()
    else {
        return;
    };
    // Same home for pre-check, lock, detector, and delete.
    let home = crate::util::nofy_home::nofy_home();
    // Unlocked pre-check: common no-switch start takes no lock; re-check under lock before delete.
    if crate::config::confirmed_team_switch_at(&home, &team_id).is_none() {
        return;
    }
    let Some(_lock) = try_lock_managed_config(&home).or_else(|| {
        std::thread::sleep(PURGE_LOCK_RETRY_DELAY);
        try_lock_managed_config(&home)
    }) else {
        return; // mid-apply/remove; holder owns the transition
    };
    if let Some(evicted) = crate::config::confirmed_team_switch_at(&home, &team_id) {
        tracing::warn!(
            team_id = %team_id,
            evicted_principal = %evicted,
            "identity changed; purging the prior tenant's managed config"
        );
        remove_managed_config_files(&home);
    }
}

/// Floor tick (session start), best-effort under the managed-config lock — a failed tick
/// must not refuse a session.
fn bump_managed_rollback_floor() {
    // Re-checked inside `bump_rollback_floor`; this early-out skips the lock I/O when dark.
    if !nofy_config::signed_policy::verification_active() {
        return;
    }
    let home = crate::util::nofy_home::nofy_home();
    match try_lock_managed_config(&home) {
        Some(_lock) => {
            nofy_config::bump_rollback_floor(&home);
        }
        None => tracing::debug!("managed-config lock contended; skipping the floor tick"),
    }
}

/// Pure decision behind [`managed_policy_gate`]: fail closed only when a managed principal is active AND its policy is compromised.
fn managed_policy_gate_decision(
    managed_principal_present: bool,
    policy_compromised: bool,
) -> Result<(), String> {
    if managed_principal_present && policy_compromised {
        return Err(MANAGED_POLICY_MISSING_MSG.to_string());
    }
    Ok(())
}

// Tests in a sibling file (they dwarf the module) but a child module, for private access.
#[cfg(test)]
#[path = "managed_config/tests.rs"]
mod tests;
