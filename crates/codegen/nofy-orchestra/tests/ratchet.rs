//! Budget ratchet (OC-F28 translated): the orchestra crate may only shrink.
//!
//! Day-one cap for `nofy-orchestra` (batch F): the LOC at the moment the
//! crate landed. Raising the cap requires a deliberate edit here, which is
//! the review hook — same discipline as `nofy-daemon/tests/ratchet.rs`.
//! The execution half must stay pure logic + thin layers; wiring pressure
//! belongs in the shell, not here.

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
fn orchestra_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch F execution half (project/goal/replay/barrier/
    // mount/persona/delegation/compile/caps) + their tests.
    // Cap raises are deliberate reviewed changes:
    // - 1706→1845: G4 ledger governance projection (ledger_gov.rs:
    //   event-journal replay + audit + dead-letter policy).
    let cap = 1845;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-orchestra grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
