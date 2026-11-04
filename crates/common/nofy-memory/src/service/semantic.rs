//! Synchronous canonical snapshots and disposable, model-specific vector data.
//! Callers perform model IO between these methods, without borrowing SQLite.
use super::*;
use crate::index::semantic::SemanticRow;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SemanticChunk {
    pub(crate) area: MemoryArea,
    pub(crate) row: SemanticRow,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SemanticPlan {
    pub(crate) space: String,
    pub(crate) dimensions: usize,
    pub(crate) query: String,
    pub(crate) areas: Vec<MemoryArea>,
    pub(crate) context: UnifiedSearchContext,
    pub(crate) chunks: Vec<SemanticChunk>,
}
fn validate(space: &str, dimensions: usize) -> MemoryServiceResult<()> {
    if space.len() != 64
        || !space
            .bytes()
            .all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase())
        || !(1..=4096).contains(&dimensions)
    {
        return Err(MemoryServiceError::InvalidRequest(
            "invalid semantic vector space".into(),
        ));
    }
    Ok(())
}
impl NofyMemoryService {
    fn semantic_index(&self) -> MemoryServiceResult<UnifiedMemoryIndex> {
        self.require_enabled()?;
        let mut index = UnifiedMemoryIndex::open(
            &self.config.root,
            self.config.project_id,
            self.config.index.clone(),
            self.config.embedding_dimensions,
        )
        .map_err(internal_error)?;
        index.refresh().map_err(internal_error)?;
        Ok(index)
    }
    /// Freeze only eligible chunks in the admitted areas, before external IO.
    /// The model space must identify the complete immutable model binding.
    pub fn prepare_semantic(
        &self,
        space: &str,
        dimensions: usize,
        query: String,
        areas: &[MemoryArea],
    ) -> MemoryServiceResult<SemanticPlan> {
        validate(space, dimensions)?;
        let index = self.semantic_index()?;
        let context = self
            .query_context
            .clone()
            .unwrap_or_else(|| current_git_context(&self.config.workspace));
        let mut chunks = Vec::new();
        for (scope, area) in index
            .indexes()
            .into_iter()
            .zip([MemoryArea::Personal, MemoryArea::Project])
        {
            if !areas.contains(&area) {
                continue;
            }
            for row in scope
                .semantic_rows(space, dimensions, &context)
                .map_err(internal_error)?
            {
                chunks.push(SemanticChunk {
                    area: area.clone(),
                    row,
                });
            }
        }
        Ok(SemanticPlan {
            space: space.into(),
            dimensions,
            query,
            areas: areas.to_vec(),
            context,
            chunks,
        })
    }
    /// Validate the whole response before per-scope transactions; stale hashes
    /// cannot overwrite a new chunk or resurrect a forgotten canonical object.
    pub fn store_semantic(
        &self,
        plan: &SemanticPlan,
        chunks: &[SemanticChunk],
        vectors: &[Vec<f32>],
    ) -> MemoryServiceResult<usize> {
        validate(&plan.space, plan.dimensions)?;
        if chunks.len() != vectors.len() {
            return Err(MemoryServiceError::InvalidRequest(
                "semantic vector count mismatch".into(),
            ));
        }
        if chunks.iter().any(|chunk| !plan.areas.contains(&chunk.area)) {
            return Err(MemoryServiceError::Rejected(
                "semantic batch exceeds admitted areas".into(),
            ));
        }
        // Validate the complete response before writing either scope.
        for vector in vectors {
            crate::index::semantic::normalize(vector, plan.dimensions).map_err(internal_error)?;
        }
        let mut index = self.semantic_index()?;
        let mut stored = 0;
        for area in [MemoryArea::Personal, MemoryArea::Project] {
            let rows = chunks
                .iter()
                .zip(vectors)
                .filter(|(chunk, _)| chunk.area == area)
                .map(|(chunk, vector)| (chunk.row.clone(), vector.clone()))
                .collect::<Vec<_>>();
            if rows.is_empty() {
                continue;
            }
            let (rows, vectors): (Vec<_>, Vec<_>) = rows.into_iter().unzip();
            stored += index
                .semantic_index_mut(&area)
                .semantic_store(&plan.space, plan.dimensions, &rows, &vectors)
                .map_err(internal_error)?;
        }
        Ok(stored)
    }
    /// Apply original eligibility, FTS, weights, decay and MMR to the explicit
    /// model space. No unrelated legacy vector table participates in the query.
    pub fn search_semantic(
        &self,
        plan: &SemanticPlan,
        query_vector: &[f32],
        max_results: usize,
        min_score: f32,
    ) -> MemoryServiceResult<SearchPage> {
        validate(&plan.space, plan.dimensions)?;
        if !(1..=100).contains(&max_results)
            || !min_score.is_finite()
            || !(0.0..=1.0).contains(&min_score)
        {
            return Err(MemoryServiceError::InvalidRequest(
                "invalid semantic search bounds".into(),
            ));
        }
        crate::index::semantic::normalize(query_vector, plan.dimensions).map_err(internal_error)?;
        let index = self.semantic_index()?;
        let mut vectors: [Vec<(String, f32)>; 2] = Default::default();
        let scopes = [
            plan.areas.contains(&MemoryArea::Personal),
            plan.areas.contains(&MemoryArea::Project),
        ];
        let limit = max_results.saturating_mul(3);
        for (slot, scope) in index.indexes().into_iter().enumerate() {
            if scopes[slot] {
                vectors[slot] = scope
                    .semantic_nearest(&plan.space, query_vector, &plan.context, limit)
                    .map_err(internal_error)?;
            }
        }
        let mut config = self.config.search.clone();
        config.max_results = max_results;
        config.min_score = min_score;
        let results = crate::search::unified_search_ranked(
            &index,
            None,
            &plan.query,
            &plan.context,
            &config,
            scopes,
            Some(&vectors),
        )
        .map_err(internal_error)?;
        let hits = results
            .into_iter()
            .filter_map(|result| {
                let id = result.chunk_id.split(':').nth(1)?.to_owned();
                let bytes = std::fs::read(&result.path).ok()?;
                Some(MemoryHit {
                    target: MemoryTarget {
                        id,
                        expected_hash: Some(hash_bytes(&bytes)),
                    },
                    area: if result.source.starts_with("personal_") {
                        MemoryArea::Personal
                    } else {
                        MemoryArea::Project
                    },
                    summary: result.snippet,
                    score: result.score,
                    created_at: result.created_at,
                })
            })
            .collect();
        Ok(SearchPage { hits })
    }
}
#[cfg(test)]
mod tests;
