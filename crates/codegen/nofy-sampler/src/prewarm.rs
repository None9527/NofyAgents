//! Best-effort transport prewarm: dial an origin once per pool-idle window
//! through the shared client, bounded by [`PREWARM_TIMEOUT`], carrying no
//! credentials.

use std::collections::HashMap;
use std::sync::{LazyLock, Mutex, PoisonError};
use std::time::{Duration, Instant};

use crate::shared_http::PooledClient;

const PREWARM_TIMEOUT: Duration = Duration::from_secs(15);
const DRAIN_CAP_BYTES: usize = 64 * 1024;
const MAX_TRACKED_ORIGINS: usize = 32;

enum WarmState {
    InFlight,
    Warmed(Instant),
}

static WARM_STATE: LazyLock<Mutex<HashMap<String, WarmState>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

fn warm_state() -> std::sync::MutexGuard<'static, HashMap<String, WarmState>> {
    WARM_STATE.lock().unwrap_or_else(PoisonError::into_inner)
}

#[derive(Debug)]
enum ClaimError {
    AlreadyClaimed,
    TrackerFull,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PrewarmOutcome {
    SharingDisabled,
    NoOrigin,
    ClientUnavailable,
    AlreadyClaimed,
    TrackerFull,
    Warmed,
    Truncated,
    Failed,
    TimedOut,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PrewarmReport {
    pub outcome: PrewarmOutcome,
    pub duration_ms: i64,
    pub origin: Option<String>,
}

fn elapsed_ms_since(started: Instant) -> i64 {
    i64::try_from(started.elapsed().as_millis()).unwrap_or(i64::MAX)
}

pub async fn prewarm_transport(base_url: &str) -> PrewarmReport {
    let started = Instant::now();
    let report = |outcome: PrewarmOutcome, origin: Option<String>| PrewarmReport {
        outcome,
        duration_ms: elapsed_ms_since(started),
        origin,
    };
    let Some(origin) = endpoint_origin(base_url) else {
        tracing::debug!(%base_url, "sampler transport prewarm skipped: no dialable origin");
        return report(PrewarmOutcome::NoOrigin, None);
    };
    let client = match crate::shared_http::pooled_client() {
        PooledClient::SharingDisabled => {
            return report(PrewarmOutcome::SharingDisabled, Some(origin));
        }
        PooledClient::Unavailable(error) => {
            tracing::debug!(%error, "sampler transport prewarm skipped: shared client build failed");
            return report(PrewarmOutcome::ClientUnavailable, Some(origin));
        }
        PooledClient::Ready(client) => client,
    };
    let claim = match claim_origin(&origin) {
        Ok(claim) => claim,
        Err(ClaimError::AlreadyClaimed) => {
            return report(PrewarmOutcome::AlreadyClaimed, Some(origin));
        }
        Err(ClaimError::TrackerFull) => {
            tracing::debug!(%origin, "sampler transport prewarm skipped: tracker full");
            return report(PrewarmOutcome::TrackerFull, Some(origin));
        }
    };
    let result = tokio::time::timeout(PREWARM_TIMEOUT, dial_and_drain(&client, &origin)).await;
    let elapsed_ms = elapsed_ms_since(started);
    let outcome = match result {
        Ok(Ok((status, DrainOutcome::Pooled))) => {
            claim.commit();
            tracing::info!(%origin, %status, elapsed_ms, "sampler transport prewarmed");
            PrewarmOutcome::Warmed
        }
        Ok(Ok((status, DrainOutcome::CappedUnpooled))) => {
            drop(claim);
            tracing::info!(%origin, %status, elapsed_ms, "sampler transport prewarm truncated");
            PrewarmOutcome::Truncated
        }
        Ok(Err(error)) => {
            drop(claim);
            tracing::info!(%origin, %error, elapsed_ms, "sampler transport prewarm failed");
            PrewarmOutcome::Failed
        }
        Err(_) => {
            drop(claim);
            tracing::info!(
                %origin,
                timeout_secs = PREWARM_TIMEOUT.as_secs() as i64,
                elapsed_ms,
                "sampler transport prewarm timed out"
            );
            PrewarmOutcome::TimedOut
        }
    };
    PrewarmReport {
        outcome,
        duration_ms: elapsed_ms,
        origin: Some(origin),
    }
}

#[must_use]
struct OriginClaim {
    origin: String,
    committed: bool,
}

impl OriginClaim {
    fn commit(mut self) {
        let origin = std::mem::take(&mut self.origin);
        self.committed = true;
        warm_state().insert(origin, WarmState::Warmed(Instant::now()));
    }
}

impl Drop for OriginClaim {
    fn drop(&mut self) {
        if !self.committed {
            warm_state().remove(&self.origin);
        }
    }
}

fn should_dial(state: Option<&WarmState>, now: Instant, idle_window: Duration) -> bool {
    match state {
        Some(WarmState::InFlight) => false,
        Some(WarmState::Warmed(at)) => now.duration_since(*at) >= idle_window,
        None => true,
    }
}

fn has_room_after_sweep(
    state: &mut HashMap<String, WarmState>,
    now: Instant,
    idle_window: Duration,
) -> bool {
    state.retain(|_, s| match s {
        WarmState::InFlight => true,
        WarmState::Warmed(at) => now.duration_since(*at) < idle_window,
    });
    state.len() < MAX_TRACKED_ORIGINS
}

fn claim_origin(origin: &str) -> Result<OriginClaim, ClaimError> {
    let idle_window = crate::shared_http::pool_idle_timeout();
    let now = Instant::now();
    let mut state = warm_state();
    if !should_dial(state.get(origin), now, idle_window) {
        return Err(ClaimError::AlreadyClaimed);
    }
    if state.len() >= MAX_TRACKED_ORIGINS && !has_room_after_sweep(&mut state, now, idle_window) {
        return Err(ClaimError::TrackerFull);
    }
    state.insert(origin.to_owned(), WarmState::InFlight);
    Ok(OriginClaim {
        origin: origin.to_owned(),
        committed: false,
    })
}

enum DrainOutcome {
    Pooled,
    CappedUnpooled,
}

async fn dial_and_drain(
    client: &reqwest::Client,
    origin: &str,
) -> reqwest::Result<(reqwest::StatusCode, DrainOutcome)> {
    let mut response = client.get(origin).send().await?;
    let status = response.status();
    let pools_at_handshake = response.version() >= reqwest::Version::HTTP_2;
    let mut drained = 0usize;
    while let Some(chunk) = response.chunk().await? {
        drained += chunk.len();
        if drained > DRAIN_CAP_BYTES {
            let outcome = if pools_at_handshake {
                DrainOutcome::Pooled
            } else {
                DrainOutcome::CappedUnpooled
            };
            return Ok((status, outcome));
        }
    }
    Ok((status, DrainOutcome::Pooled))
}

fn endpoint_origin(base_url: &str) -> Option<String> {
    let url = reqwest::Url::parse(base_url).ok()?;
    if !matches!(url.scheme(), "http" | "https") || !url.has_host() {
        return None;
    }
    Some(url.origin().ascii_serialization())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn endpoint_origin_extracts_scheme_host_port() {
        assert_eq!(
            endpoint_origin("https://api.example.com/v1/chat"),
            Some("https://api.example.com".into())
        );
        assert_eq!(endpoint_origin("not-a-url"), None);
        assert_eq!(endpoint_origin("file:///tmp"), None);
    }
}
