//! Query expansion for FTS-only search mode.
//!
//! When users ask conversational queries like *"that thing we discussed about the API"*,
//! FTS5 matches every word equally — articles, pronouns, and vague references dilute
//! precision. This module extracts meaningful keywords by removing stop words.
//!
//! The pipeline:
//! ```text
//! query → lowercase → split on non-alphanumeric → remove stop words → dedup → keywords
//! ```
//!
//! When all words are stop words (e.g. "what is that?"), returns an empty vec.
//! The caller (hybrid search) falls back to the vector path in that case.

use std::collections::HashSet;
use std::sync::LazyLock;

static STOP_WORDS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    [
        // Articles & determiners
        "a",
        "an",
        "the",
        "this",
        "that",
        "these",
        "those",
        // Pronouns
        "i",
        "me",
        "my",
        "we",
        "our",
        "you",
        "your",
        "he",
        "she",
        "it",
        "they",
        "him",
        "her",
        "its",
        "them",
        "us",
        // Common verbs
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "can",
        "may",
        "might",
        // Prepositions
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "about",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        // Conjunctions
        "and",
        "or",
        "but",
        "if",
        "then",
        "because",
        "as",
        "while",
        "when",
        "where",
        "what",
        "which",
        "who",
        "how",
        "why",
        // Vague references
        "thing",
        "things",
        "stuff",
        "something",
        "anything",
        "everything",
        "one",
        "some",
        "any",
        "all",
        "each",
        "every",
        "both",
        "few",
        "more",
        // Time references
        "yesterday",
        "today",
        "tomorrow",
        "earlier",
        "later",
        "recently",
        "now",
        "just",
        "already",
        "still",
        "yet",
        // Request words
        "please",
        "help",
        "find",
        "show",
        "get",
        "tell",
        "give",
        "make",
        // Common filler
        "not",
        "no",
        "yes",
        "also",
        "too",
        "very",
        "really",
        "here",
        "there",
        "so",
        "up",
        "out",
        "like",
        "than",
        "other",
        "only",
    ]
    .into_iter()
    .collect()
});

/// Extract meaningful keywords from a conversational query by removing stop words.
///
/// Returns keywords in order of appearance, deduplicated. Words shorter than
/// 2 characters and pure-numeric tokens are filtered out. The 2-char minimum
/// preserves meaningful short terms like "go", "js", "ui", "db", "ai", "ml"
/// while stop words handle the common 2-letter noise ("is", "it", "do", "we").
///
/// Returns an empty vec when all words are stop words or the query contains
/// no meaningful content — the caller should fall back to vector search.
pub fn extract_keywords(query: &str) -> Vec<String> {
    let lowered = query.to_lowercase();
    let mut seen = HashSet::new();
    lowered
        .split(|c: char| !c.is_alphanumeric() && c != '_')
        .filter(|w| w.len() >= 2)
        .filter(|w| !STOP_WORDS.contains(w))
        .filter(|w| !w.chars().all(|c| c.is_numeric()))
        .filter(|w| seen.insert(*w))
        .map(|w| w.to_string())
        .collect()
}

/// True for CJK Unified Ideographs (basic + extension A).
pub fn is_cjk(c: char) -> bool {
    ('\u{4e00}'..='\u{9fff}').contains(&c) || ('\u{3400}'..='\u{4dbf}').contains(&c)
}

/// Substring probes for CJK fallback search (W-11).
///
/// unicode61 indexes a CJK run as one indivisible token, so sub-run queries
/// (a single character like 茶, or a partial word) never MATCH. Returns whole
/// CJK runs first (most selective), then each distinct CJK character, deduped
/// and capped so a long query cannot fan out into many scans.
pub fn cjk_probes(query: &str) -> Vec<String> {
    const MAX_PROBES: usize = 12;
    let mut probes: Vec<String> = Vec::new();
    let mut run = String::new();
    for c in query.chars() {
        if is_cjk(c) {
            run.push(c);
        } else if !run.is_empty() {
            probes.push(std::mem::take(&mut run));
        }
    }
    if !run.is_empty() {
        probes.push(run);
    }
    let mut seen: HashSet<char> = probes.iter().flat_map(|p| p.chars()).collect();
    for c in query.chars() {
        if is_cjk(c) && seen.insert(c) {
            probes.push(c.to_string());
        }
    }
    probes.truncate(MAX_PROBES);
    probes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_removes_stop_words() {
        let kw = extract_keywords("that thing we discussed about the API");
        assert_eq!(kw, vec!["discussed", "api"]);
    }

    #[test]
    fn test_all_stop_words_returns_empty() {
        let kw = extract_keywords("what is that?");
        assert!(kw.is_empty());
    }

    #[test]
    fn test_preserves_meaningful_words() {
        let kw = extract_keywords("rust programming async patterns");
        assert_eq!(kw, vec!["rust", "programming", "async", "patterns"]);
    }

    #[test]
    fn test_filters_single_char_words() {
        let kw = extract_keywords("I a x language");
        // "i" = 1 char, "a" = 1 char, "x" = 1 char → all filtered by length
        assert_eq!(kw, vec!["language"]);
    }

    #[test]
    fn test_preserves_short_meaningful_terms() {
        // 2-char terms that are meaningful in programming should survive
        let kw = extract_keywords("Go and JS patterns");
        assert_eq!(kw, vec!["go", "js", "patterns"]);
    }

    #[test]
    fn test_short_stop_words_filtered() {
        // 2-char stop words ("is", "it", "do", "we") should still be removed
        let kw = extract_keywords("is it ok to do that");
        assert_eq!(kw, vec!["ok"]);
    }

    #[test]
    fn test_filters_pure_numbers() {
        let kw = extract_keywords("port 8080 and 443 config");
        assert_eq!(kw, vec!["port", "config"]);
    }

    #[test]
    fn test_deduplicates() {
        let kw = extract_keywords("rust rust rust programming");
        assert_eq!(kw, vec!["rust", "programming"]);
    }

    #[test]
    fn test_handles_punctuation() {
        let kw = extract_keywords("what's the solution for the bug?");
        assert_eq!(kw, vec!["solution", "bug"]);
    }

    #[test]
    fn test_preserves_underscored_identifiers() {
        let kw = extract_keywords("the my_function variable");
        assert_eq!(kw, vec!["my_function", "variable"]);
    }

    #[test]
    fn test_empty_query() {
        assert!(extract_keywords("").is_empty());
    }

    #[test]
    fn test_only_punctuation() {
        assert!(extract_keywords("??? !!! ...").is_empty());
    }

    #[test]
    fn test_mixed_case() {
        let kw = extract_keywords("Rust Programming ASYNC");
        assert_eq!(kw, vec!["rust", "programming", "async"]);
    }

    #[test]
    fn test_real_conversational_queries() {
        assert_eq!(
            extract_keywords("what was the solution for the authentication bug"),
            vec!["solution", "authentication", "bug"]
        );
        assert_eq!(
            extract_keywords("how do I configure the memory system"),
            vec!["configure", "memory", "system"]
        );
        assert_eq!(
            extract_keywords("show me that database migration we talked about"),
            vec!["database", "migration", "talked"]
        );
    }

    #[test]
    fn cjk_probes_whole_run_then_chars() {
        let probes = cjk_probes("碧螺春");
        assert_eq!(probes, vec!["碧螺春"]);
    }

    #[test]
    fn cjk_probes_single_char() {
        let probes = cjk_probes("茶");
        assert_eq!(probes, vec!["茶"]);
    }

    #[test]
    fn cjk_probes_mixed_query_dedupes_run_chars() {
        let probes = cjk_probes("favorite tea 碧螺春 preferences");
        // Whole run first; its chars are not re-added individually.
        assert_eq!(probes, vec!["碧螺春"]);
    }

    #[test]
    fn cjk_probes_multiple_runs_and_gap_chars() {
        let probes = cjk_probes("记住 口令 闲庭花开");
        assert_eq!(probes, vec!["记住", "口令", "闲庭花开"]);
    }

    #[test]
    fn cjk_probes_empty_for_non_cjk() {
        assert!(cjk_probes("hello world").is_empty());
    }
}
