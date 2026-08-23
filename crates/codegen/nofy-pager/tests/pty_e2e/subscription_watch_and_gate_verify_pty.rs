// Per-test-case module for the `pty_e2e` integration test crate.
//
// End-to-end coverage for free→paid subscription auto-detection
// (`src/app/subscription.rs`).
#[allow(unused_imports)]
use super::common::*;

/// Distinctive gate copy (unlikely to collide with welcome chrome).
const GATE_MSG: &str = "ZZSUBGATEMSG";

/// A tier in the shell's `QUALIFYING_TIERS` list.
const PAID_TIER: &str = "SuperNofyPro";

/// Display name delivered via `/settings` `subscription_tier_display`.
const PAID_TIER_DISPLAY: &str = "SuperNofy Pro";

/// Count of live subscription checks the client made against the mock
/// (`GET /v1/user?include=subscription`). Plain `/v1/user` enrichment
/// fetches are deliberately excluded.
fn user_check_count(content: &ContentController) -> usize {
    content
        .requests()
        .iter()
        .filter(|e| e.path.starts_with("/v1/user?") && e.path.contains("include=subscription"))
        .count()
}

/// Count of `GET /v1/settings` fetches (the qualifying-tier check refetches
/// settings, so a post-upgrade increase marks detection completing).
fn settings_count(content: &ContentController) -> usize {
    content
        .requests()
        .iter()
        .filter(|e| e.path == "/v1/settings")
        .count()
}

/// Pump the PTY until `cond` holds or `timeout` elapses (panics with a
/// screen dump on timeout).
fn pump_until(
    harness: &mut PtyHarness,
    timeout: Duration,
    mut cond: impl FnMut() -> bool,
    what: &str,
) {
    let deadline = Instant::now() + timeout;
    while !cond() {
        assert!(
            Instant::now() < deadline,
            "timed out waiting for {what}\nscreen:\n{}",
            harness.screen_contents()
        );
        harness.update(Duration::from_millis(100));
    }
}

/// Spawn the pager with session auth (see [`seed_session_credential`]) plus
/// `extra_env`. Does NOT wait for the welcome screen — gate tests assert on
/// the very first paint.
fn spawn_subscription_pager(
    content: &ContentController,
    oauth_user: &str,
    extra_env: &[EnvOp<'_>],
) -> PtyHarness {
    seed_session_credential(content, oauth_user);
    let mut overrides = Vec::from(session_credential_ops());
    overrides.extend_from_slice(extra_env);

    let binary = pager_binary().expect("resolve pager binary");
    PtyHarness::spawn_with_content_env_ops_in_dir(
        &binary,
        DEFAULT_ROWS,
        DEFAULT_COLS,
        content,
        &[],
        &overrides,
        Some(content.home()),
    )
    .expect("spawn pager with subscription session auth")
}

/// [`spawn_subscription_pager`] driven into a live session
/// (welcome → prompt → mock response).
fn spawn_subscription_session(
    content: &ContentController,
    oauth_user: &str,
    extra_env: &[EnvOp<'_>],
) -> PtyHarness {
    let mut harness = spawn_subscription_pager(content, oauth_user, extra_env);
    harness
        .wait_for_text(WELCOME_SCREEN_SENTINEL, WELCOME_TIMEOUT)
        .expect("welcome text");
    harness
        .inject_keys(format!("{PROMPT}\r").as_bytes())
        .expect("submit prompt to enter session");
    harness
        .wait_for_text(MOCK_RESPONSE_SENTINEL, Duration::from_secs(30))
        .expect("session response");
    harness
}

/// Watch cadence while free, upgrade detection, then dormancy once paid.
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore = "PTY e2e; run the owning pty_e2e_* Cargo test with --ignored (see Cargo.toml)"]
async fn subscription_watch_polls_free_tier_then_goes_dormant_after_upgrade() {
    let content = ContentController::start_with_models(vec![MockModel::new("grok-3")])
        .await
        .expect("start content");
    content.set_response(format!("{MOCK_RESPONSE_SENTINEL} watch cadence."));
    // Free tier: the mock's /v1/user returns no subscription tier by default.
    let mut harness = spawn_subscription_session(
        &content,
        "pty-subwatch",
        &[EnvOp::set("NOFY_SUBSCRIPTION_WATCH_INTERVAL_SECS", "1")],
    );

    // While free, the watch fires repeatedly at the (test-shrunk) cadence.
    pump_until(
        &mut harness,
        Duration::from_secs(30),
        || user_check_count(&content) >= 3,
        ">=3 live subscription checks while on the free tier",
    );

    // Server-side upgrade: the live tier flips to a qualifying value and
    // settings now carry the paid display tier.
    let settings_before = settings_count(&content);
    content.server().set_user_subscription_tier(Some(PAID_TIER));
    content.server().set_settings(json!({
        "allow_access": true,
        "subscription_tier_display": PAID_TIER_DISPLAY,
    }));

    // Detection: the qualifying check refetches /v1/settings (that's how the
    // paid display tier reaches the client and disarms the watch).
    pump_until(
        &mut harness,
        Duration::from_secs(30),
        || settings_count(&content) > settings_before,
        "settings refetch after the qualifying tier was detected",
    );

    // Dormancy: once the paid tier lands, a full 6s quiet window (>=6
    // would-be ticks at the 1s cadence) passes with zero new checks.
    let deadline = Instant::now() + Duration::from_secs(60);
    loop {
        let base = user_check_count(&content);
        let window_end = Instant::now() + Duration::from_secs(6);
        while Instant::now() < window_end {
            harness.update(Duration::from_millis(200));
        }
        if user_check_count(&content) == base {
            break;
        }
        assert!(
            Instant::now() < deadline,
            "watch never went dormant after the upgrade (checks still firing)\nscreen:\n{}",
            harness.screen_contents()
        );
    }

    harness.quit().expect("clean quit");
}

/// A genuinely-free user gated at startup still gets the paywall — but only
/// after a live subscription check confirmed the block (the gate is never
/// painted straight from the stale source).
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore = "PTY e2e; run the owning pty_e2e_* Cargo test with --ignored (see Cargo.toml)"]
async fn startup_gate_shows_paywall_for_free_user_after_live_check() {
    let content = ContentController::start().await.expect("start content");
    // Explicit deny + gate copy. Absent allow_access now fails open.
    content.server().set_settings(json!({
        "allow_access": false,
        "gate_message": GATE_MSG,
        "gate_url": "https://nofy.com/supernofy?referrer=nofy-build",
        "gate_label": "Subscribe",
    }));

    let mut harness = spawn_subscription_pager(&content, "pty-subgate-free", &[]);

    harness
        .wait_for_text(WELCOME_SCREEN_SENTINEL, WELCOME_TIMEOUT)
        .expect("welcome text");
    // The verified gate renders. Normally the check response resolves the
    // deferral within seconds; the budget also covers the 30s hung-check
    // safety net under full-suite contention.
    harness
        .wait_for_text(GATE_MSG, Duration::from_secs(45))
        .expect("gate copy renders for a genuinely-free user");

    assert!(
        user_check_count(&content) >= 1,
        "a live subscription check must run before the paywall is shown; requests: {:?}",
        content
            .requests()
            .iter()
            .map(|e| e.path.clone())
            .collect::<Vec<_>>()
    );

    harness.quit().expect("clean quit");
}

/// Verify-before-paywall: a user who ALREADY subscribed never sees a
/// paywall flash when a stale gated settings snapshot reaches the client.
///
/// The stale snapshot is delivered via the `/new` settings refresh — the
/// only active `/v1/settings` consumer at that point (watch disabled via
/// env, announcements poll at its 5-min default, gate poll only runs while
/// gated, startup fetches settled). Queueing it at startup instead races
/// the shell's concurrent startup fetches: a slow gated fetch landing after
/// the verify check stores fresh settings can legitimately re-carry the
/// gate — a time-travel artifact of the scripted one-shot, not a client
/// bug (observed as a flake).
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore = "PTY e2e; run the owning pty_e2e_* Cargo test with --ignored (see Cargo.toml)"]
async fn stale_gate_push_never_flashes_paywall_for_subscribed_user() {
    let content = ContentController::start().await.expect("start content");
    // Live tier: already paid; steady settings allow access.
    content.server().set_user_subscription_tier(Some(PAID_TIER));
    content.server().set_settings(json!({
        "allow_access": true,
        "subscription_tier_display": PAID_TIER_DISPLAY,
    }));
    content.set_response(format!("{MOCK_RESPONSE_SENTINEL} paid path."));

    // Watch disabled so the deferral's own VerifyPendingGate is the only
    // subscription-check traffic (deferral does not depend on the watch).
    let mut harness = spawn_subscription_session(
        &content,
        "pty-subgate-paid",
        &[EnvOp::set("NOFY_SUBSCRIPTION_WATCH_INTERVAL_SECS", "0")],
    );

    // Let startup fetches fully settle so the scripted one-shot below can
    // only be consumed by the /new refresh.
    harness.update(Duration::from_secs(2));
    let checks_before = user_check_count(&content);

    // One stale gated snapshot: the "remote settings stale moment".
    content.enqueue_response(
        "/v1/settings",
        ScriptedResponse::json(
            200,
            json!({ "allow_access": false, "gate_message": GATE_MSG }),
        ),
    );
    harness.inject_keys(b"/new\r").expect("run /new");

    // Sample the screen across the deferral window: the gate copy must
    // never appear. The deferred gate could only surface via a gated check
    // result (impossible — the live tier is paid and the fresh settings
    // allow) or the 30s hung-check net, which the resolving check disarms.
    let end = Instant::now() + Duration::from_secs(8);
    while Instant::now() < end {
        harness.update(Duration::from_millis(150));
        assert!(
            !harness.contains_text(GATE_MSG),
            "paywall flashed for an already-subscribed user\nscreen:\n{}",
            harness.screen_contents()
        );
    }

    // Positive anchors: the deferral's live check actually ran, and the
    // session is fully usable (prompt round-trips).
    assert!(
        user_check_count(&content) > checks_before,
        "expected a live subscription check for the deferred gate; requests: {:?}",
        content
            .requests()
            .iter()
            .map(|e| e.path.clone())
            .collect::<Vec<_>>()
    );
    content.set_response(format!("{MOCK_RESPONSE_SENTINEL} still usable."));
    harness
        .inject_keys(format!("{PROMPT}\r").as_bytes())
        .expect("submit prompt");
    harness
        .wait_for_text(MOCK_RESPONSE_SENTINEL, Duration::from_secs(30))
        .expect("session usable for the subscribed user");

    harness.quit().expect("clean quit");
}
