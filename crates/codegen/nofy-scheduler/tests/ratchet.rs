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
    let cap = 1083; // day-one cap (E1 event-sourced core + fold tests)
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-scheduler grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
