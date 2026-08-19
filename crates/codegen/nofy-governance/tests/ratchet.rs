//! Budget ratchet (OC-F28 translated): the governance crate may only shrink.
//!
//! Day-one cap for `nofy-governance` (batch G): the LOC at the moment the
//! crate landed. Raising the cap requires a deliberate edit here — same
//! discipline as `nofy-daemon/tests/ratchet.rs`. Governance cores stay
//! pure policy; surface wiring lives elsewhere.

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
fn governance_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch G governance cores (yolo/lifeguard/turnlease/
    // envelope/presets/cas/preauth/identity/gateway) + their tests.
    // - 1274→1761: batch O governance supplements (classifier/selfmod/
    //   guards + tests; FR5.14/FR5.15/FR9.8).
    // - 1761→1905: batch O5 hubgate.rs (Hub demoted to tool transport;
    //   FR2.11).
    let cap = 1905;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-governance grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
