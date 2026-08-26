//! Budget ratchet (OC-F28 translated): the stewardcore crate may only shrink.
//!
//! Day-one cap for `nofy-stewardcore` (batch I): the LOC at the moment the
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
fn stewardcore_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch I execution-surface cores (roots/fsindex/
    // fspolicy/activity/privacy/revalidate/lease/zoning/tombstone/trust)
    // + their tests.
    // - 1493→2418: batch N file-steward launch (mgmt/extract/suggestions/
    //   handoff + tests; FR12.6-12.8/12.13).
    // - 2418→2587: batch P osbridge.rs (Spotlight/Everything provider
    //   evaluation gate; FR12.10).
    // - 2587→2672: coverage-gate — tests for uncovered branches.
    // - 2672→3108: W-9 trash.rs — the on-disk recoverable-deletion store
    //   (staged copies + append-only manifest fold, fail-loud restore,
    //   deliberate empty) + its directory of tests. The cap was recorded as
    //   3077 at landing, but the W-9 tree actually measured 3108; corrected
    //   here deliberately (the ratchet still only shrinks from 3108).
    let cap = 3108;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-stewardcore grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
