//! Budget ratchet (OC-F28 translated): control-plane crates may only shrink.
//!
//! The caps are the LOC at the moment the ratchet landed; raising a cap
//! requires a deliberate edit here, which is the review hook. Shrinking is
//! always free. This is the mechanical half of "daemon stays a thin
//! orchestrator" — growth pressure shows up as a red test, not a slow slide.

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
fn control_plane_loc_ratchet_only_shrinks() {
    let base = Path::new(env!("CARGO_MANIFEST_DIR")).join("..");
    // Cap raises are deliberate reviewed changes:
    // - daemon 3565→3707: provider search poll/answer seam (shell provider
    //   loop integration) + its wire-level test.
    // - schema 277→312: additive `sessions` field on SearchResult/Search +
    //   the additive-wire drift gate.
    let caps = [
        ("nofy-daemon", 3707),
        ("nofy-channel", 544),
        ("nofy-control-schema", 312),
        ("nofy-session-registry", 132),
    ];
    for (name, cap) in caps {
        let got = loc(&base.join(name).join("src"));
        assert!(
            got <= cap,
            "{name} grew past its ratchet: {got} > {cap}. \
             Shrink it, or raise the cap deliberately in tests/ratchet.rs."
        );
    }
}
