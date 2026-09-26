//! Privacy quartet (FR12.5, OC-F12): local / retention / forget /
//! redaction.
//!
//! - **Local**: the index never leaves the machine — structural property
//!   of this crate (no network types, no outbound calls);
//! - **Retention**: entries older than the window are dropped;
//! - **Forget**: a forgotten path is REMOVED from the index and search
//!   must not hit it afterwards (「forget 后检索不可命中」, AC-12);
//! - **Redaction**: sensitive patterns are masked before text enters the
//!   index.

use crate::fsindex::FsIndex;

/// Redaction patterns (secrets shapes).
const REDACTION_PATTERNS: &[(&str, &str)] = &[
    ("sk-", "[REDACTED:api-key]"),    // API key shapes
    ("Bearer ", "[REDACTED:bearer]"), // auth headers
    ("password=", "[REDACTED:password]"),
];

/// Redact sensitive patterns from text before indexing.
pub fn redact(text: &str) -> String {
    let mut out = text.to_string();
    for (pattern, replacement) in REDACTION_PATTERNS {
        if out.contains(pattern) {
            // Mask from the pattern to end of line (secret continues).
            let mut lines: Vec<String> = Vec::new();
            for line in out.lines() {
                if let Some(pos) = line.find(pattern) {
                    lines.push(format!("{}{}", &line[..pos], replacement));
                } else {
                    lines.push(line.to_string());
                }
            }
            out = lines.join("\n");
        }
    }
    out
}

/// Forget a path: remove from the index. Search must not hit afterwards.
pub fn forget(index: &mut FsIndex, path: &str) {
    index.remove(path);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fsindex::IndexEntry;

    fn entry(path: &str, text: &str) -> IndexEntry {
        IndexEntry {
            path: path.into(),
            size: text.len() as u64,
            mtime: 1,
            text: text.into(),
        }
    }

    #[test]
    fn forget_makes_search_miss() {
        let mut index = FsIndex::default();
        index.upsert(entry("/secret/notes.md", "private planning"));
        assert_eq!(
            index.search("private"),
            vec!["/secret/notes.md".to_string()]
        );
        forget(&mut index, "/secret/notes.md");
        assert!(
            index.search("private").is_empty(),
            "after forget, search must not hit (AC-12)"
        );
    }

    #[test]
    fn redaction_masks_secret_shapes() {
        let text = "config:\napi = sk-abc123xyz\nauth: Bearer eyJhbGciOi\nplain line";
        let redacted = redact(text);
        assert!(!redacted.contains("sk-abc123xyz"));
        assert!(!redacted.contains("eyJhbGciOi"));
        assert!(redacted.contains("[REDACTED:api-key]"));
        assert!(redacted.contains("[REDACTED:bearer]"));
        assert!(
            redacted.contains("plain line"),
            "non-sensitive lines untouched"
        );
    }

    #[test]
    fn redaction_is_idempotent() {
        let once = redact("key = sk-123");
        let twice = redact(&once);
        assert_eq!(once, twice);
    }

    #[test]
    fn clean_text_passes_through() {
        assert_eq!(redact("nothing sensitive here"), "nothing sensitive here");
    }
}
