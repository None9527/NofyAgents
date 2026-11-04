//! Model-space vectors are disposable projections of the original chunk rows.
//! Triggers make existing canonical rebuild/delete paths retire every space.
use super::*;
use serde::{Deserialize, Serialize};
use std::collections::BinaryHeap;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct SemanticRow {
    pub id: String,
    pub hash: String,
    pub text: String,
    pub cached: bool,
}
pub(crate) fn normalize(vector: &[f32], dimensions: usize) -> Result<Vec<f32>, rusqlite::Error> {
    if vector.len() != dimensions || vector.iter().any(|v| !v.is_finite()) {
        return Err(rusqlite::Error::InvalidQuery);
    }
    let norm = vector
        .iter()
        .map(|v| f64::from(*v).powi(2))
        .sum::<f64>()
        .sqrt();
    if !norm.is_finite() || norm <= f64::MIN_POSITIVE {
        return Err(rusqlite::Error::InvalidQuery);
    }
    Ok(vector
        .iter()
        .map(|v| (f64::from(*v) / norm) as f32)
        .collect())
}
fn decode(bytes: &[u8], dimensions: usize) -> Result<Vec<f32>, rusqlite::Error> {
    if bytes.len() != dimensions * 4 {
        return Err(rusqlite::Error::InvalidQuery);
    }
    let vector = bytes
        .chunks_exact(4)
        .map(|b| f32::from_le_bytes([b[0], b[1], b[2], b[3]]))
        .collect::<Vec<_>>();
    if vector.iter().any(|v| !v.is_finite()) {
        return Err(rusqlite::Error::InvalidQuery);
    }
    let norm = vector
        .iter()
        .map(|v| f64::from(*v).powi(2))
        .sum::<f64>()
        .sqrt();
    if !norm.is_finite() || (norm - 1.0).abs() > 0.0001 {
        return Err(rusqlite::Error::InvalidQuery);
    }
    Ok(vector)
}
#[derive(PartialEq)]
struct Candidate {
    id: String,
    distance: f32,
}
impl Eq for Candidate {}
impl PartialOrd for Candidate {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}
impl Ord for Candidate {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.distance
            .total_cmp(&other.distance)
            .then_with(|| self.id.cmp(&other.id))
    }
}
impl MemoryIndex {
    fn semantic_schema(&self) -> Result<(), rusqlite::Error> {
        self.db.execute_batch(
            "CREATE TABLE IF NOT EXISTS semantic_vectors(
            space TEXT NOT NULL,chunk_id TEXT NOT NULL,hash TEXT NOT NULL,
            dimensions INTEGER NOT NULL,embedding BLOB NOT NULL,PRIMARY KEY(space,chunk_id));
            CREATE TRIGGER IF NOT EXISTS semantic_chunk_delete AFTER DELETE ON chunks
            BEGIN DELETE FROM semantic_vectors WHERE chunk_id=OLD.id; END;
            CREATE TRIGGER IF NOT EXISTS semantic_chunk_update AFTER UPDATE OF hash ON chunks
            WHEN OLD.hash!=NEW.hash
            BEGIN DELETE FROM semantic_vectors WHERE chunk_id=OLD.id; END;",
        )
    }
    pub(crate) fn semantic_rows(
        &self,
        space: &str,
        dimensions: usize,
        context: &UnifiedSearchContext,
    ) -> Result<Vec<SemanticRow>, rusqlite::Error> {
        self.semantic_schema()?;
        let mut statement = self.db.prepare(
            "SELECT c.id,c.hash,c.text,v.hash,v.dimensions,v.embedding
            FROM chunks c LEFT JOIN semantic_vectors v ON v.chunk_id=c.id AND v.space=?1
            WHERE c.origin='canonical' AND c.object_kind IN ('topic','observation') ORDER BY c.id",
        )?;
        let rows = statement
            .query_map([space], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, Option<usize>>(4)?,
                    row.get::<_, Option<Vec<u8>>>(5)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        let mut result = Vec::new();
        for (id, hash, text, cached_hash, cached_dimensions, bytes) in rows {
            if !self.chunk_is_eligible(&id, context) {
                continue;
            }
            let cached =
                cached_hash.as_deref() == Some(&hash) && cached_dimensions == Some(dimensions);
            if cached {
                decode(
                    bytes.as_deref().ok_or(rusqlite::Error::InvalidQuery)?,
                    dimensions,
                )?;
            }
            result.push(SemanticRow {
                id,
                hash,
                text,
                cached,
            });
        }
        Ok(result)
    }
    pub(crate) fn semantic_store(
        &mut self,
        space: &str,
        dimensions: usize,
        rows: &[SemanticRow],
        vectors: &[Vec<f32>],
    ) -> Result<usize, rusqlite::Error> {
        if rows.len() != vectors.len() {
            return Err(rusqlite::Error::InvalidQuery);
        }
        let vectors = vectors
            .iter()
            .map(|v| normalize(v, dimensions))
            .collect::<Result<Vec<_>, _>>()?;
        self.semantic_schema()?;
        let tx = self.db.transaction()?;
        let mut stored = 0;
        for (row, vector) in rows.iter().zip(vectors) {
            let bytes = vector
                .iter()
                .flat_map(|v| v.to_le_bytes())
                .collect::<Vec<_>>();
            stored+=tx.execute("INSERT INTO semantic_vectors(space,chunk_id,hash,dimensions,embedding)
                SELECT ?1,id,hash,?2,?3 FROM chunks WHERE id=?4 AND hash=?5
                ON CONFLICT(space,chunk_id) DO UPDATE SET hash=excluded.hash,dimensions=excluded.dimensions,embedding=excluded.embedding",
                params![space,dimensions,bytes,row.id,row.hash])?;
        }
        tx.commit()?;
        Ok(stored)
    }
    pub(crate) fn semantic_nearest(
        &self,
        space: &str,
        query: &[f32],
        context: &UnifiedSearchContext,
        limit: usize,
    ) -> Result<Vec<(String, f32)>, rusqlite::Error> {
        self.semantic_schema()?;
        if limit == 0 {
            return Ok(vec![]);
        }
        let query = normalize(query, query.len())?;
        let mut statement=self.db.prepare("SELECT v.chunk_id,v.embedding FROM semantic_vectors v
            JOIN chunks c ON c.id=v.chunk_id AND c.hash=v.hash WHERE v.space=?1 AND v.dimensions=?2 ORDER BY v.chunk_id")?;
        let mut rows = statement.query(params![space, query.len()])?;
        let mut nearest = BinaryHeap::new();
        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            if !self.chunk_is_eligible(&id, context) {
                continue;
            }
            let vector = decode(&row.get::<_, Vec<u8>>(1)?, query.len())?;
            let distance = vector
                .iter()
                .zip(&query)
                .map(|(a, b)| (f64::from(*a) - f64::from(*b)).powi(2))
                .sum::<f64>()
                .sqrt() as f32;
            nearest.push(Candidate { id, distance });
            if nearest.len() > limit {
                nearest.pop();
            }
        }
        let mut nearest = nearest.into_vec();
        nearest.sort();
        Ok(nearest.into_iter().map(|v| (v.id, v.distance)).collect())
    }
}

impl UnifiedMemoryIndex {
    pub(crate) fn semantic_index_mut(
        &mut self,
        area: &nofy_memory_types::MemoryArea,
    ) -> &mut MemoryIndex {
        match area {
            nofy_memory_types::MemoryArea::Personal => &mut self.personal,
            nofy_memory_types::MemoryArea::Project => &mut self.project,
        }
    }
}
