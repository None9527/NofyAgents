//! Budget ratchet (OC-F28 translated): the marketplace crate may only shrink.
//!
//! Day-one cap for `nofy-marketplace` (batch M): the LOC at the moment the
//! crate landed. Raising the cap requires a deliberate edit here — same
//! discipline as `nofy-daemon/tests/ratchet.rs`.

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
fn marketplace_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch M marketplace cores (discovery/exemplars/
    // pluginmanifest/docker/channeladapter) + their tests.
    // - 677→825: batch P realmcheck.rs (realm isolation evaluation).
    // - 825→845: coverage-gate — tests for uncovered branches.
    let cap = 845;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-marketplace grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
