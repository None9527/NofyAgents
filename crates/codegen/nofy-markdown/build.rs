//! Serializes the syntax set at build time.
//!
//! Building two-face's `SyntaxSet` at runtime costs long enough to stall the
//! first code block a session paints (upstream measured the same effect on the
//! first `Read` render). The set is theme-independent and identical for every
//! consumer, so it is dumped here once and deserialized on first use instead.

use std::env;
use std::path::Path;

use syntect::dumps::dump_to_uncompressed_file;
use syntect::parsing::SyntaxDefinition;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=assets/Swift.sublime-syntax");
    let swift =
        SyntaxDefinition::load_from_str(include_str!("assets/Swift.sublime-syntax"), true, None)
            .expect("parse Swift.sublime-syntax");
    let mut builder = two_face::syntax::extra_newlines().into_builder();
    builder.add(swift);
    let set = builder.build();
    let out = Path::new(&env::var("OUT_DIR").expect("OUT_DIR set by cargo")).join("syntaxes.bin");
    dump_to_uncompressed_file(&set, &out).expect("dump the two-face syntax set");
}

