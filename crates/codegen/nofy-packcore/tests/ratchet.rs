//! Budget ratchet (OC-F28 translated): the packcore crate may only shrink.
//!
//! Day-one cap for `nofy-packcore` (integration batch Q0a): the LOC at
//! the moment the crate landed (moved verbatim from nofy-daemon).
//! Raising the cap requires a deliberate edit here.

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
fn packcore_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: pack.rs moved verbatim from nofy-daemon (Q0a).
    let cap = 283;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-packcore grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
