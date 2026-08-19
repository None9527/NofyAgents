//! Content extraction pipeline (FR12.7): pdf / docx / image, with
//! OPTIONAL embeddings — default OFF.
//!
//! Discipline: the policy core plans the pipeline; the embeddings stage
//! EXISTS ONLY when explicitly enabled (`ExtractionPolicy::default()`
//! never contains it). No stage implies an outbound call — embeddings
//! are local-only by construction (zero-new-outbound).

/// Supported source kinds.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SourceKind {
    Pdf,
    Docx,
    Image,
    PlainText,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExtractSource {
    pub path: String,
    pub kind: SourceKind,
}

/// Extraction policy. Embeddings are OFF unless explicitly enabled.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExtractionPolicy {
    pub embeddings: bool,
}

impl Default for ExtractionPolicy {
    fn default() -> Self {
        Self { embeddings: false }
    }
}

/// One pipeline stage, in execution order.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Stage {
    /// Metadata first, always (cheap, local).
    ReadMetadata,
    /// Text extraction (pdf/docx/plain text). Images carry no text stage:
    /// they are metadata (+ optional embeddings) only.
    ExtractText,
    /// Local embeddings. Present ONLY when the policy enables it.
    LocalEmbeddings,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ExtractError {
    EmptyPath,
}

/// Plan the pipeline for one source. Deterministic stage order.
pub fn pipeline(source: &ExtractSource, policy: &ExtractionPolicy) -> Result<Vec<Stage>, ExtractError> {
    if source.path.trim().is_empty() {
        return Err(ExtractError::EmptyPath);
    }
    let mut stages = vec![Stage::ReadMetadata];
    match source.kind {
        SourceKind::Pdf | SourceKind::Docx | SourceKind::PlainText => {
            stages.push(Stage::ExtractText);
        }
        SourceKind::Image => {}
    }
    if policy.embeddings {
        stages.push(Stage::LocalEmbeddings);
    }
    Ok(stages)
}

/// The storable result of one extraction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExtractedContent {
    pub path: String,
    pub text: String,
    /// Whether an embedding was produced for this content.
    pub embedded: bool,
}

/// Fold stage outputs into the stored record. The `embedded` flag can
/// only be true when the policy enabled embeddings — the record cannot
/// claim an embedding the pipeline never planned.
pub fn content_record(source: &ExtractSource, text: &str, policy: &ExtractionPolicy) -> ExtractedContent {
    let has_text_stage = matches!(source.kind, SourceKind::Pdf | SourceKind::Docx | SourceKind::PlainText);
    ExtractedContent {
        path: source.path.clone(),
        text: if has_text_stage { text.to_string() } else { String::new() },
        embedded: policy.embeddings,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn source(kind: SourceKind) -> ExtractSource {
        ExtractSource { path: "/media/doc.pdf".into(), kind }
    }

    #[test]
    fn embeddings_default_off() {
        let policy = ExtractionPolicy::default();
        assert!(!policy.embeddings);
        for kind in [SourceKind::Pdf, SourceKind::Docx, SourceKind::Image, SourceKind::PlainText] {
            let stages = pipeline(&source(kind), &policy).unwrap();
            assert!(
                !stages.contains(&Stage::LocalEmbeddings),
                "default policy must never plan an embeddings stage ({kind:?})"
            );
        }
    }

    #[test]
    fn embeddings_only_when_enabled() {
        let policy = ExtractionPolicy { embeddings: true };
        let stages = pipeline(&source(SourceKind::Pdf), &policy).unwrap();
        assert_eq!(
            stages,
            vec![Stage::ReadMetadata, Stage::ExtractText, Stage::LocalEmbeddings]
        );
    }

    #[test]
    fn images_are_metadata_only() {
        let policy = ExtractionPolicy { embeddings: true };
        let stages = pipeline(&source(SourceKind::Image), &policy).unwrap();
        assert_eq!(stages, vec![Stage::ReadMetadata, Stage::LocalEmbeddings]);
        assert!(!stages.contains(&Stage::ExtractText));
    }

    #[test]
    fn text_sources_get_text_stage_in_fixed_order() {
        let policy = ExtractionPolicy::default();
        for kind in [SourceKind::Pdf, SourceKind::Docx, SourceKind::PlainText] {
            assert_eq!(
                pipeline(&source(kind), &policy).unwrap(),
                vec![Stage::ReadMetadata, Stage::ExtractText]
            );
        }
    }

    #[test]
    fn empty_path_fails_loud() {
        let src = ExtractSource { path: "  ".into(), kind: SourceKind::Pdf };
        assert_eq!(pipeline(&src, &ExtractionPolicy::default()), Err(ExtractError::EmptyPath));
    }

    #[test]
    fn record_cannot_claim_unplanned_embeddings() {
        let src = source(SourceKind::Pdf);
        let off = content_record(&src, "hello", &ExtractionPolicy::default());
        assert!(!off.embedded);
        assert_eq!(off.text, "hello");
        let on = content_record(&src, "hello", &ExtractionPolicy { embeddings: true });
        assert!(on.embedded);
        // Images store no text even if a string is supplied.
        let img = content_record(&source(SourceKind::Image), "ignored", &ExtractionPolicy::default());
        assert_eq!(img.text, "");
    }
}
