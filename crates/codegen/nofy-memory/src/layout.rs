//! Canonical on-disk layout for unified memory.

use std::path::{Path, PathBuf};

use crate::model::{MemoryScope, ProjectId};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UnifiedMemoryLayout {
    root: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScopeLayout {
    root: PathBuf,
}

impl UnifiedMemoryLayout {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn meta_database(&self) -> PathBuf {
        self.root.join("meta.sqlite")
    }

    pub fn personal_scope(&self) -> ScopeLayout {
        ScopeLayout::new(self.root.join("personal"))
    }

    pub fn project_scope(&self, project_id: ProjectId) -> ScopeLayout {
        ScopeLayout::new(
            self.root
                .join("projects")
                .join(project_id.as_uuid().to_string()),
        )
    }

    pub fn scope(&self, scope: &MemoryScope) -> ScopeLayout {
        match scope {
            MemoryScope::Personal => self.personal_scope(),
            MemoryScope::Project(project_id) => self.project_scope(*project_id),
        }
    }
}

impl ScopeLayout {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn state_database(&self) -> PathBuf {
        self.root.join("state.sqlite")
    }

    pub fn observations_directory(&self) -> PathBuf {
        self.root.join("observations")
    }

    pub fn topics_directory(&self) -> PathBuf {
        self.root.join("topics")
    }

    pub fn archive_directory(&self) -> PathBuf {
        self.root.join("archive")
    }
}
