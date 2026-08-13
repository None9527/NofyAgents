use std::collections::BTreeMap;

use serde::Serialize;

use super::envelope::{FacetMap, FacetValue, SessionKind};
use super::row::UnifiedRow;
use crate::session::merge::MergedSession;

pub const KIND_FACET_KEY: &str = "kind";
pub const CWD_FACET_KEY: &str = "cwd";
pub const REPO_FACET_KEY: &str = "repo";
pub const BRANCH_FACET_KEY: &str = "branch";
pub const WORKTREE_FACET_KEY: &str = "worktree";
pub const GIT_ROOT_FACET_KEY: &str = "gitRoot";
pub const SOURCE_WORKSPACE_FACET_KEY: &str = "sourceWorkspace";

#[derive(Debug, Clone)]
pub struct NormalizedItem {
    pub kind: SessionKind,
    pub cwd: String,
    pub repo_name: Option<String>,
    pub branch: Option<String>,
    pub worktree_label: Option<String>,
    pub git_root_dir: Option<String>,
    pub source_workspace_dir: Option<String>,
}

impl NormalizedItem {
    pub(crate) fn from_merged(m: &MergedSession) -> Self {
        Self {
            kind: SessionKind::Build,
            cwd: m.cwd.clone(),
            repo_name: m.repo_name.clone(),
            branch: m.branch.clone(),
            worktree_label: m.worktree_label.clone(),
            git_root_dir: m.git_root_dir.clone(),
            source_workspace_dir: m.source_workspace_dir.clone(),
        }
    }
}

pub trait FacetProvider: Send + Sync {
    fn key(&self) -> &'static str;

    fn applies_to(&self) -> &'static [SessionKind];

    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue>;
}

pub struct KindFacet;

impl FacetProvider for KindFacet {
    fn key(&self) -> &'static str {
        KIND_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build, SessionKind::Chat]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        Some(FacetValue::One(serde_json::Value::String(
            item.kind.as_str().to_owned(),
        )))
    }
}

pub struct CwdFacet;

impl FacetProvider for CwdFacet {
    fn key(&self) -> &'static str {
        CWD_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        if item.cwd.is_empty() {
            None
        } else {
            Some(FacetValue::One(serde_json::Value::String(item.cwd.clone())))
        }
    }
}

pub struct RepoFacet;

impl FacetProvider for RepoFacet {
    fn key(&self) -> &'static str {
        REPO_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        string_facet(item.repo_name.as_deref())
    }
}

pub struct BranchFacet;

impl FacetProvider for BranchFacet {
    fn key(&self) -> &'static str {
        BRANCH_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        string_facet(item.branch.as_deref())
    }
}

pub struct WorktreeFacet;

impl FacetProvider for WorktreeFacet {
    fn key(&self) -> &'static str {
        WORKTREE_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        string_facet(item.worktree_label.as_deref())
    }
}

pub struct GitRootFacet;

impl FacetProvider for GitRootFacet {
    fn key(&self) -> &'static str {
        GIT_ROOT_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        string_facet(item.git_root_dir.as_deref())
    }
}

pub struct SourceWorkspaceFacet;

impl FacetProvider for SourceWorkspaceFacet {
    fn key(&self) -> &'static str {
        SOURCE_WORKSPACE_FACET_KEY
    }
    fn applies_to(&self) -> &'static [SessionKind] {
        &[SessionKind::Build]
    }
    fn extract(&self, item: &NormalizedItem) -> Option<FacetValue> {
        string_facet(item.source_workspace_dir.as_deref())
    }
}

fn string_facet(value: Option<&str>) -> Option<FacetValue> {
    value
        .filter(|s| !s.is_empty())
        .map(|s| FacetValue::One(serde_json::Value::String(s.to_owned())))
}

#[derive(Default)]
pub struct FacetRegistry {
    providers: Vec<Box<dyn FacetProvider>>,
}

impl FacetRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with(mut self, provider: impl FacetProvider + 'static) -> Self {
        self.providers.push(Box::new(provider));
        self
    }

    pub fn provider(&self, key: &str) -> Option<&dyn FacetProvider> {
        self.providers
            .iter()
            .map(|p| p.as_ref())
            .find(|p| p.key() == key)
    }

    pub(crate) fn extract_all(&self, item: &NormalizedItem) -> FacetMap {
        let mut facets = FacetMap::new();
        for provider in &self.providers {
            if provider.applies_to().contains(&item.kind)
                && let Some(value) = provider.extract(item)
            {
                facets.insert(provider.key().to_owned(), value);
            }
        }
        facets
    }

    pub fn apply_in_memory_filters(
        &self,
        filters: &BTreeMap<String, Vec<serde_json::Value>>,
        rows: Vec<UnifiedRow>,
    ) -> Vec<UnifiedRow> {
        let active: Vec<(&dyn FacetProvider, &Vec<serde_json::Value>)> = filters
            .iter()
            .filter(|(key, _)| key.as_str() != CWD_FACET_KEY)
            .filter(|(_, allowed)| !allowed.is_empty())
            .filter_map(|(key, allowed)| self.provider(key).map(|p| (p, allowed)))
            .collect();
        if active.is_empty() {
            return rows;
        }
        rows.into_iter()
            .filter(|row| {
                active.iter().all(|(provider, allowed)| {
                    if !provider.applies_to().contains(&row.kind) {
                        return true;
                    }
                    row.facets
                        .get(provider.key())
                        .is_some_and(|value| value.intersects(allowed))
                })
            })
            .collect()
    }

    pub(crate) fn summarize_window(&self, rows: &[UnifiedRow]) -> FacetSummary {
        let mut acc: BTreeMap<String, BTreeMap<String, (serde_json::Value, usize)>> =
            BTreeMap::new();
        for row in rows {
            for (key, value) in &row.facets {
                let bucket = acc.entry(key.clone()).or_default();
                for v in value.values() {
                    let entry = bucket
                        .entry(v.to_string())
                        .or_insert_with(|| (v.clone(), 0));
                    entry.1 += 1;
                }
            }
        }
        let keys = acc
            .into_iter()
            .map(|(key, values)| FacetSummaryKey {
                key,
                values: values
                    .into_values()
                    .map(|(value, count)| FacetSummaryValue {
                        value,
                        label: None,
                        count,
                    })
                    .collect(),
            })
            .collect();
        FacetSummary {
            scope: "window",
            keys,
        }
    }
}

pub fn build_facet_registry() -> FacetRegistry {
    FacetRegistry::new()
        .with(KindFacet)
        .with(CwdFacet)
        .with(RepoFacet)
        .with(BranchFacet)
        .with(WorktreeFacet)
        .with(GitRootFacet)
        .with(SourceWorkspaceFacet)
}

#[derive(Debug, Clone, Serialize)]
pub struct FacetSummary {
    pub scope: &'static str,
    pub keys: Vec<FacetSummaryKey>,
}

#[derive(Debug, Clone, Serialize)]
pub struct FacetSummaryKey {
    pub key: String,
    pub values: Vec<FacetSummaryValue>,
}

#[derive(Debug, Clone, Serialize)]
pub struct FacetSummaryValue {
    pub value: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    pub count: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::unified_list::merged_session_to_row;

    fn local_row(session_id: &str, repo: Option<&str>, branch: Option<&str>) -> UnifiedRow {
        let m = MergedSession {
            session_id: session_id.into(),
            summary: "s".into(),
            first_prompt: None,
            updated_at: "2026-06-01T00:00:00Z".into(),
            created_at: "2026-01-01T00:00:00Z".into(),
            cwd: "/Users/me/nofy".into(),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 1,
            last_active_at: Some("2026-06-01T00:00:00Z".into()),
            branch: branch.map(Into::into),
            repo_name: repo.map(Into::into),
            worktree_label: Some("wt".into()),
            git_root_dir: None,
            git_remotes: Vec::new(),
            source_workspace_dir: None,
            last_turn_summary: None,
            session_kind: None,
        };
        merged_session_to_row(m, &build_facet_registry())
    }

    #[test]
    fn local_rows_carry_repo_and_branch_facets() {
        let reg = build_facet_registry();
        let local = NormalizedItem::from_merged(&MergedSession {
            session_id: "s".into(),
            summary: String::new(),
            first_prompt: None,
            updated_at: String::new(),
            created_at: String::new(),
            cwd: "/x".into(),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 0,
            last_active_at: None,
            branch: Some("main".into()),
            repo_name: Some("nofy".into()),
            worktree_label: None,
            git_root_dir: None,
            git_remotes: Vec::new(),
            source_workspace_dir: None,
            last_turn_summary: None,
            session_kind: None,
        });
        let lf = reg.extract_all(&local);
        assert!(matches!(lf.get(REPO_FACET_KEY), Some(FacetValue::One(_))));
        assert!(matches!(lf.get(BRANCH_FACET_KEY), Some(FacetValue::One(_))));
    }

    #[test]
    fn repo_filter_keeps_matching_local_rows() {
        let reg = build_facet_registry();
        let rows = vec![
            local_row("local-nofy", Some("nofy"), Some("main")),
            local_row("local-other", Some("other"), Some("main")),
        ];
        let mut filters = BTreeMap::new();
        filters.insert(REPO_FACET_KEY.to_owned(), vec![serde_json::json!("nofy")]);
        let kept = reg.apply_in_memory_filters(&filters, rows);
        let ids: Vec<&str> = kept.iter().map(|r| r.legacy.session_id.as_str()).collect();
        assert!(ids.contains(&"local-nofy"));
        assert!(!ids.contains(&"local-other"));
    }

    fn local_row_with_git(
        session_id: &str,
        git_root: Option<&str>,
        source_ws: Option<&str>,
    ) -> UnifiedRow {
        let m = MergedSession {
            session_id: session_id.into(),
            summary: "s".into(),
            first_prompt: None,
            updated_at: "2026-06-01T00:00:00Z".into(),
            created_at: "2026-01-01T00:00:00Z".into(),
            cwd: "/Users/me/nofy".into(),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 1,
            last_active_at: Some("2026-06-01T00:00:00Z".into()),
            branch: Some("main".into()),
            repo_name: Some("nofy".into()),
            worktree_label: None,
            git_root_dir: git_root.map(Into::into),
            git_remotes: Vec::new(),
            source_workspace_dir: source_ws.map(Into::into),
            last_turn_summary: None,
            session_kind: None,
        };
        merged_session_to_row(m, &build_facet_registry())
    }

    #[test]
    fn git_path_facets_present_for_local_rows() {
        let reg = build_facet_registry();
        let local = NormalizedItem::from_merged(&MergedSession {
            session_id: "s".into(),
            summary: String::new(),
            first_prompt: None,
            updated_at: String::new(),
            created_at: String::new(),
            cwd: "/x".into(),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 0,
            last_active_at: None,
            branch: None,
            repo_name: None,
            worktree_label: None,
            git_root_dir: Some("/Users/me/nofy".into()),
            git_remotes: Vec::new(),
            source_workspace_dir: Some("/Users/me/nofy-main".into()),
            last_turn_summary: None,
            session_kind: Some("worktree".into()),
        });
        let f = reg.extract_all(&local);
        assert!(matches!(
            f.get(GIT_ROOT_FACET_KEY),
            Some(FacetValue::One(serde_json::Value::String(s))) if s == "/Users/me/nofy"
        ));
        assert!(matches!(
            f.get(SOURCE_WORKSPACE_FACET_KEY),
            Some(FacetValue::One(serde_json::Value::String(s))) if s == "/Users/me/nofy-main"
        ));
    }

    #[test]
    fn git_root_filter_keeps_matching_local_rows() {
        let reg = build_facet_registry();
        let rows = vec![
            local_row_with_git("a", Some("/Users/me/nofy"), None),
            local_row_with_git("b", Some("/Users/me/other"), None),
        ];
        let mut filters = BTreeMap::new();
        filters.insert(
            GIT_ROOT_FACET_KEY.to_owned(),
            vec![serde_json::json!("/Users/me/nofy")],
        );
        let kept = reg.apply_in_memory_filters(&filters, rows);
        let ids: Vec<&str> = kept.iter().map(|r| r.legacy.session_id.as_str()).collect();
        assert_eq!(ids, ["a"]);
    }
}
