//! The marketplace face (FR10.8, DS-P6): discovery / authoring /
//! metadata.
//!
//! Three pieces, one index:
//! - **Metadata** is complete and verified at registration (checksum
//!   required, version shaped);
//! - **Authoring** rules fail loud at submit time;
//! - **Discovery** searches the index — and nothing enters the index
//!   without passing the same gate.

use std::collections::BTreeMap;

/// Pack metadata in the index.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackMetadata {
    pub id: String,
    pub version: String,
    pub author: String,
    pub description: String,
    /// BLAKE3 hex of the pack artifact.
    pub checksum: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AuthorError {
    EmptyField(String),
    /// Version must be MAJOR.MINOR.PATCH numerals.
    BadVersion(String),
}

/// Authoring rules (fail loud at submit).
pub fn author_validate(meta: &PackMetadata) -> Result<(), AuthorError> {
    for (name, value) in [
        ("id", &meta.id),
        ("version", &meta.version),
        ("author", &meta.author),
        ("description", &meta.description),
        ("checksum", &meta.checksum),
    ] {
        if value.trim().is_empty() {
            return Err(AuthorError::EmptyField(name.to_string()));
        }
    }
    let parts: Vec<&str> = meta.version.split('.').collect();
    if parts.len() != 3 || !parts.iter().all(|p| !p.is_empty() && p.chars().all(|c| c.is_ascii_digit())) {
        return Err(AuthorError::BadVersion(meta.version.clone()));
    }
    Ok(())
}

/// Verify an artifact against its declared checksum.
pub fn verify_checksum(meta: &PackMetadata, artifact: &[u8]) -> bool {
    blake3::hash(artifact).to_hex().to_string() == meta.checksum
}

/// The market index.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct MarketIndex {
    /// (id, version) → metadata.
    entries: BTreeMap<(String, String), PackMetadata>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RegisterError {
    Authoring(AuthorError),
    Duplicate { id: String, version: String },
}

impl MarketIndex {
    /// Register a pack version. Authoring rules + duplicate check.
    pub fn register(&mut self, meta: PackMetadata) -> Result<(), RegisterError> {
        author_validate(&meta).map_err(RegisterError::Authoring)?;
        let key = (meta.id.clone(), meta.version.clone());
        if self.entries.contains_key(&key) {
            return Err(RegisterError::Duplicate {
                id: meta.id,
                version: meta.version,
            });
        }
        self.entries.insert(key, meta);
        Ok(())
    }

    /// Discovery: substring match over id + description.
    pub fn discover(&self, query: &str) -> Vec<String> {
        let query = query.to_lowercase();
        let mut hits: Vec<String> = self
            .entries
            .values()
            .filter(|meta| {
                meta.id.to_lowercase().contains(&query)
                    || meta.description.to_lowercase().contains(&query)
            })
            .map(|meta| format!("{}@{}", meta.id, meta.version))
            .collect();
        hits.sort();
        hits
    }

    pub fn get(&self, id: &str, version: &str) -> Option<&PackMetadata> {
        self.entries.get(&(id.to_string(), version.to_string()))
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn meta(id: &str, version: &str) -> PackMetadata {
        PackMetadata {
            id: id.into(),
            version: version.into(),
            author: "team".into(),
            description: format!("{id} does things"),
            checksum: "abc123".into(),
        }
    }

    #[test]
    fn authoring_rules_fail_loud() {
        let mut bad = meta("p", "1.0.0");
        bad.author = "  ".into();
        assert_eq!(author_validate(&bad), Err(AuthorError::EmptyField("author".into())));
        let mut badver = meta("p", "1.0");
        badver.version = "v1.0".into();
        assert!(matches!(author_validate(&badver), Err(AuthorError::BadVersion(_))));
        assert!(author_validate(&meta("p", "1.0.0")).is_ok());
    }

    #[test]
    fn registration_enforces_gate_and_dedup() {
        let mut index = MarketIndex::default();
        index.register(meta("reviewer", "1.0.0")).unwrap();
        assert_eq!(
            index.register(meta("reviewer", "1.0.0")),
            Err(RegisterError::Duplicate { id: "reviewer".into(), version: "1.0.0".into() })
        );
        // A new version of the same pack is fine.
        index.register(meta("reviewer", "1.1.0")).unwrap();
        assert_eq!(index.len(), 2);
        // Bad authoring never enters the index.
        let mut bad = meta("evil", "1.0.0");
        bad.checksum = "".into();
        assert!(index.register(bad).is_err());
        assert_eq!(index.len(), 2);
    }

    #[test]
    fn discovery_searches_id_and_description() {
        let mut index = MarketIndex::default();
        index.register(meta("code-review", "1.0.0")).unwrap();
        let mut writer = meta("writer", "2.0.0");
        writer.description = "writes documentation".into();
        index.register(writer).unwrap();
        assert_eq!(index.discover("review"), vec!["code-review@1.0.0".to_string()]);
        assert_eq!(index.discover("DOCUMENTATION"), vec!["writer@2.0.0".to_string()]);
        assert!(index.discover("missing").is_empty());
    }

    #[test]
    fn checksum_verification() {
        let artifact = b"pack-bytes";
        let mut meta = meta("p", "1.0.0");
        meta.checksum = blake3::hash(artifact).to_hex().to_string();
        assert!(verify_checksum(&meta, artifact));
        assert!(!verify_checksum(&meta, b"tampered"));
    }
}
