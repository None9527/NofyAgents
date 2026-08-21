//! Budget ratchet (OC-F28 translated): the scheduler crate may only shrink.
//!
//! Day-one cap for `nofy-scheduler` (E1): the LOC at the moment the crate
//! landed. Raising the cap requires a deliberate edit here, which is the
//! review hook — the same discipline as `nofy-daemon/tests/ratchet.rs`.
//! The scheduler must stay a pure state core; engine pressure belongs in
//! later batch-E steps, not in silent growth here.

use std::fs;
use std::path::Path;

fn loc(dir: &Path) -> usize {
    let mut total = 0;
    for entry in fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            total += fs::read_to_string(&path).unwrap().lines().count();
        }
    }
    total
}

#[test]
fn scheduler_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Cap raises are deliberate reviewed changes:
    // - 429→628: E2 catch-up policy (FR3.2) — `Dropped` audit event +
    //   `catch_up_events` fixed-rate latest-only proposal + 6 policy tests.
    // - 628→1083: E3 true-idle channel (FR3.3, maintenance.rs phase
    //   machine + wake latch) + E4 cron engine policy (FR3.4, cron.rs
    //   repair/watchdog/backoff/self-disable + run-lifecycle events).
    // - 1083→1661: E5 cron grammar (grammar.rs strict 5-field parse +
    //   next-fire) + runfiles.rs heartbeat/success double files +
    //   lock.rs cross-process flock + delivery.rs HOME delivery.
    // - 1661→2314: E6 one-shot timers (timer.rs clamped+monotonic
    //   revalidation) + E7 jobs↔session fence (fence.rs dual-channel) +
    //   E8 fs-trigger policy (fstrigger.rs debounce/budget/self-refusal)
    //   + E9 heartbeat projection (heartbeat.rs self-check + notepad).
    // - 2314→2579: E10 process registry (registry.rs rolling buffer +
    //   checkpoint recovery + watch fuse).
    // - 2579→2786: K5 system-event bus (eventbus.rs topics + presence +
    //   wake routing with latch, FR3.10).
    // - 2787→2886: coverage-gate — tests for uncovered branches.
    // - 2886→2942: coverage-gate — remaining scheduler gaps (fence is_active,
    //   eventbus drain, delivery list error arms, parse_log blank lines,
    //   LogStore read-error propagation).
    // - 2942→2976: W-5 trigger-bridge payload — Added/ScheduleEntry carry
    //   goal/cwd/once through the fold; delivery gains deliver_to for an
    //   explicit directory (daemon binds deliveries to its state root).
    let cap = 2976;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-scheduler grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
