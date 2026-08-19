//! Budget ratchet (OC-F28 translated): the memorycore crate may only shrink.
//!
//! Day-one cap for `nofy-memorycore` (batch H): the LOC at the moment the
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
fn memorycore_loc_ratchet_only_shrinks() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    // Day-one cap: batch H cores (snapshot/curator/forkrev/projstore/
    // auditstore/compact/modelops) + their tests.
    // - 1198→1788: batch O memory supplements (injection/dreaming/
    //   compleases + tests; FR4.5/FR4.13/FR9.7).
    // - 1788→1948: batch O4 seal.rs (trajectory head/tail guards +
    //   sealed-test registry; FR9.9).
    let cap = 1948;
    let got = loc(&src);
    assert!(
        got <= cap,
        "nofy-memorycore grew past its ratchet: {got} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}
