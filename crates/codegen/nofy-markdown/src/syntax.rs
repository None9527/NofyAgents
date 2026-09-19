//! Syntax highlighting support using syntect.
//!
//! This module provides the `Syntect` struct which holds the syntax definitions
//! and theme for code block highlighting.

use std::io::Cursor;
use std::path::Path;
use std::sync::{Arc, OnceLock};

use syntect::{
    dumps::from_uncompressed_data,
    easy::HighlightLines,
    highlighting::{Theme as SyntectTheme, ThemeSet},
    parsing::{SyntaxReference, SyntaxSet},
};

/// Syntax highlighting configuration.
///
/// Holds the theme and syntax definitions for code highlighting.
/// Create one instance and pass it to the markdown renderer.
pub struct Syntect {
    /// The color theme for syntax highlighting.
    pub theme: SyntectTheme,
    /// The syntax definitions (supports 250+ languages via two-face).
    ///
    /// Shared by every `Syntect` in the process: the set does not depend on the
    /// theme, and a `SyntaxSet` clone copies each syntax's serialized contexts
    /// (`SyntaxReference` holds them in a `Vec<u8>`), so one set per theme would
    /// duplicate megabytes for no benefit. Callers keep passing `&syn.syntax_set`;
    /// deref coercion hands them the `&SyntaxSet` they expect.
    pub syntax_set: Arc<SyntaxSet>,
}

impl Syntect {
    /// Create a new Syntect instance from theme bytes.
    ///
    /// The theme bytes should be a TextMate `.tmTheme` file.
    /// Uses two-face's extended syntax set with 250+ languages, deserialized
    /// from the build-time dump (see `build.rs`) and shared across instances.
    ///
    /// # Example
    ///
    /// ```ignore
    /// let syntect = Syntect::new(include_bytes!("assets/tokyo-night.tmTheme"));
    /// ```
    pub fn new(theme_bytes: &[u8]) -> Self {
        let mut cursor = Cursor::new(theme_bytes);
        let theme = ThemeSet::load_from_reader(&mut cursor).expect("Failed to load theme");
        Self {
            theme,
            syntax_set: shared_syntax_set(),
        }
    }

    /// Find a syntax definition by file path extension.
    pub fn find_syntax_by_file_path(&self, file_path: &Path) -> Option<&SyntaxReference> {
        let ext = file_path.extension()?.to_str()?;
        if is_swift_token(ext) {
            return patched_swift(&self.syntax_set);
        }
        self.syntax_set.find_syntax_by_extension(ext)
    }

    /// Find a syntax definition by language token (e.g., "rust", "python").
    pub fn find_syntax_by_token(&self, token: &str) -> Option<&SyntaxReference> {
        if is_swift_token(token) {
            return patched_swift(&self.syntax_set);
        }
        self.syntax_set.find_syntax_by_token(token)
    }

    /// Create a highlighter for the given file path.
    pub fn highlight_lines_by_file_path(&self, file_path: &Path) -> Option<HighlightLines<'_>> {
        Some(HighlightLines::new(
            self.find_syntax_by_file_path(file_path)?,
            &self.theme,
        ))
    }

    /// Create a highlighter for the given language token.
    pub fn highlight_lines_for_token(&self, token: &str) -> Option<HighlightLines<'_>> {
        Some(HighlightLines::new(
            self.find_syntax_by_token(token)?,
            &self.theme,
        ))
    }

    /// Highlighter for a fenced code block *info* string: a normal language token
    /// (e.g. `rust`, `python`), or a **line-range citation** of the form
    /// `lineStart:lineEnd:path/to/file.ext` where the syntax is resolved the same
    /// way as [`Syntect::highlight_lines_by_file_path`] (see
    /// [`Syntect::find_syntax_by_file_path`]).
    ///
    /// If the string matches the citation form but no syntax is found for the
    /// path, this falls back to [`Syntect::find_syntax_by_token`] with the full
    /// `fence_info` string, so plain ` ```lang` blocks keep working and odd
    /// citations degrade like the pre-citation code path.
    pub fn highlight_lines_for_fence_info(&self, fence_info: &str) -> Option<HighlightLines<'_>> {
        Some(HighlightLines::new(
            self.find_syntax_for_fence_info(fence_info)?,
            &self.theme,
        ))
    }

    /// Resolve the [`SyntaxReference`] for a fenced code block *info* string,
    /// using the SAME rules as [`Syntect::highlight_lines_for_fence_info`]:
    /// a `lineStart:lineEnd:path` citation resolves by file path, otherwise
    /// (or if the path has no known syntax) it falls back to a language token.
    ///
    /// Exposed so the incremental open-code highlighter can build its own
    /// resumable `ParseState`/`HighlightState` against exactly the syntax the
    /// batch `HighlightLines` path would have used — keeping the two
    /// byte-identical.
    pub(crate) fn find_syntax_for_fence_info(&self, fence_info: &str) -> Option<&SyntaxReference> {
        if let Some((_, _, path)) = parse_line_citation_fence_info(fence_info)
            && let Some(s) = self.find_syntax_by_file_path(Path::new(path))
        {
            return Some(s);
        }
        self.find_syntax_by_token(fence_info)
    }
}

/// ```text
/// lineStart:lineEnd:path/to/file.ext
/// ```
///
/// The path is the segment after the **second** colon; it is then parsed with
/// [`Path::new`]. Paths with extra colons in the first two segments (e.g. some
/// Windows `C:...` forms) are not supported; use a repo-relative or
/// forward-slash form.
fn parse_line_citation_fence_info(info: &str) -> Option<(&str, &str, &str)> {
    let mut it = info.splitn(3, ':');
    let start = it.next()?;
    let end = it.next()?;
    let path = it.next()?;
    if start.is_empty() || !start.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    if end.is_empty() || !end.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    if path.is_empty() {
        return None;
    }
    Some((start, end, path))
}

/// Syntax highlight code, returning raw styled segments per line.
///
/// `fence_info` is the fenced code block *info* string (language tag or
/// `lineStart:lineEnd:path` citation form); see
/// [`Syntect::highlight_lines_for_fence_info`]. Lives here (not in `parse`)
/// so both the parser and the streaming highlighter caches depend one-way on
/// `syntax`.
pub(crate) fn syntax_highlight_raw(
    syntect: Option<&Syntect>,
    fence_info: &str,
    text: &str,
) -> Option<Vec<Vec<(syntect::highlighting::Style, String)>>> {
    use syntect::util::LinesWithEndings;

    let syn = syntect?;
    let mut hl = syn.highlight_lines_for_fence_info(fence_info)?;
    let mut lines = Vec::new();
    for line in LinesWithEndings::from(text) {
        let highlighted = hl.highlight_line(line, &syn.syntax_set).ok()?;
        lines.push(
            highlighted
                .into_iter()
                .map(|(s, t)| (s, t.to_string()))
                .collect(),
        );
    }
    Some(lines)
}

/// The process-wide syntax set, deserialized once from the build-time dump.
///
/// `Syntect::new` is called per theme (nofy-night / tokyo-night / nofy-day), so
/// without this the same 250+ language set would be built — and then held — once
/// per theme.
fn is_swift_token(token: &str) -> bool {
    token.eq_ignore_ascii_case("swift")
}

fn patched_swift(set: &SyntaxSet) -> Option<&SyntaxReference> {
    // Last `.swift` wins: the patched grammar is appended after two-face's Swift.
    set.syntaxes().iter().rev().find(|syntax| {
        syntax
            .file_extensions
            .iter()
            .any(|ext| ext.eq_ignore_ascii_case("swift"))
    })
}

fn shared_syntax_set() -> Arc<SyntaxSet> {
    static SYNTAX_SET: OnceLock<Arc<SyntaxSet>> = OnceLock::new();
    SYNTAX_SET
        .get_or_init(|| {
            Arc::new(
                from_uncompressed_data(include_bytes!(concat!(env!("OUT_DIR"), "/syntaxes.bin")))
                    .expect("syntax set dumped by build.rs"),
            )
        })
        .clone()
}

/// Get a shared Syntect instance for tests.
///
/// This loads the tokyo-night theme bundled with the crate.
/// Uses a static OnceLock for efficiency in test runs.
#[cfg(any(test, fuzzing))]
#[allow(dead_code)]
pub fn test_syntect() -> &'static Syntect {
    static TEST_SYNTECT: OnceLock<Syntect> = OnceLock::new();
    TEST_SYNTECT.get_or_init(|| Syntect::new(include_bytes!("../assets/tokyo-night.tmTheme")))
}

#[cfg(test)]
mod tests {
    use super::parse_line_citation_fence_info;

    /// The set is theme-independent, so every `Syntect` must share one copy, and
    /// the build-time dump must round-trip (syntect skips some fields when
    /// serializing, so this also pins that nothing we rely on is lost).
    #[test]
    fn syntax_set_is_shared_and_survives_the_dump_round_trip() {
        let a = super::Syntect::new(include_bytes!("../assets/tokyo-night.tmTheme"));
        let b = super::Syntect::new(include_bytes!("../assets/tokyo-night.tmTheme"));
        assert!(
            std::sync::Arc::ptr_eq(&a.syntax_set, &b.syntax_set),
            "one shared set per process; a set per theme would duplicate it for nothing"
        );
        assert!(
            a.syntax_set.find_syntax_by_token("rust").is_some(),
            "the dumped set must still resolve syntaxes"
        );
        assert!(
            a.find_syntax_by_token("swift").is_some(),
            "patched Swift grammar must be in the dumped set"
        );
        // Compared against a runtime-built set rather than a magic count: the
        // invariant is "the dump loses nothing", and a constant would silently
        // rot on every two-face bump. This is the only place that pays the
        // runtime build, which is exactly what production no longer does.
        let runtime = two_face::syntax::extra_newlines();
        assert_eq!(
            a.syntax_set.syntaxes().len(),
            runtime.syntaxes().len() + 1,
            "the dumped set carries two-face plus the last-wins patched Swift"
        );
    }

    #[test]
    fn line_citation_fence_parses_start_end_path() {
        assert_eq!(
            parse_line_citation_fence_info("37:65:crates/example/src/tools/read.rs"),
            Some(("37", "65", "crates/example/src/tools/read.rs"))
        );
    }

    #[test]
    fn line_citation_rejects_non_numeric_line() {
        assert_eq!(parse_line_citation_fence_info("37:ab:file.rs"), None);
    }

    #[test]
    fn line_citation_rejects_plain_lang_token() {
        assert_eq!(parse_line_citation_fence_info("rust"), None);
        assert_eq!(parse_line_citation_fence_info(""), None);
    }

    #[test]
    fn highlight_lines_for_fence_info_resolves_citation_path_to_rust() {
        let s = super::test_syntect();
        assert!(
            s.highlight_lines_for_fence_info("37:65:crates/codegen/nofy-markdown/src/parse.rs")
                .is_some()
        );
    }

    #[test]
    fn highlight_lines_for_fence_info_still_accepts_rust_token() {
        let s = super::test_syntect();
        assert!(s.highlight_lines_for_fence_info("rust").is_some());
    }
}
