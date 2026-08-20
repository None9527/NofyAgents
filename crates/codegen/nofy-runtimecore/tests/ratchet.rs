//! Budget ratchet (OC-F28 translated): the runtimecore crate may only
//! shrink.
//!
//! Day-one cap for `nofy-runtimecore` (batch O3): the LOC at the moment
//! the crate landed. Raising the cap requires a deliberate edit here —
//! same discipline as `nofy-daemon/tests/ratchet.rs`.

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
fn runtimecore_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch O3 runtime cores (persistence/unitgen/
    // coldstart/envsnapshot/cwdmark/workerroute/bootcheck) + tests.
    // - 894→1128: batch P execworld.rs (docker/ssh execution worlds;
    //   FR6.10).
    // - 1128→1160: coverage-gate — tests for uncovered branches.
    let cap = 1160;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-runtimecore grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
