//! Bounded observation of the resident ledger. Reading never enrolls a scope,
//! advances its clock, replaces limits, or settles an outstanding operation.
use super::*;
use crate::durable::{SqliteStore, db_error};
use rusqlite::params;

#[derive(Clone, Debug, Serialize)]
pub struct BudgetPage {
    pub protocol: &'static str,
    pub ledgers: Vec<BudgetSummary>,
    pub next: Option<String>,
}

impl SqliteStore {
    /// Read one ordered page of this store's original budget summaries.
    /// The cursor is opaque and must be passed back unchanged. External
    /// BudgetStore implementations are not inferred from this projection.
    pub async fn budget_page(&self, after: &str, limit: usize) -> Result<BudgetPage, Error> {
        if !(1..=64).contains(&limit) || after.len() > 512 * 1024 {
            return Err(Error::Composition("invalid budget page bounds".into()));
        }
        let after = after.to_owned();
        self.transaction(move |tx| {
            let mut statement = tx
                .prepare(
                    "SELECT key,payload FROM agent_runtime_budget_roots
                 WHERE key>?1 ORDER BY key LIMIT ?2",
                )
                .map_err(db_error)?;
            let rows = statement
                .query_map(params![after, limit + 1], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
                })
                .map_err(db_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(db_error)?;
            let next = (rows.len() > limit).then(|| rows[limit - 1].0.clone());
            let ledgers = rows
                .into_iter()
                .take(limit)
                .map(|(key, payload)| {
                    let value: BudgetSummary = serde_json::from_str(&payload).map_err(db_error)?;
                    if value.version != 1 || value.spec.scope.key() != key {
                        return Err(Error::Checkpoint("stored budget identity changed".into()));
                    }
                    Ok(value)
                })
                .collect::<Result<Vec<_>, Error>>()?;
            Ok(BudgetPage {
                protocol: "nofy.budget-page/v1",
                ledgers,
                next,
            })
        })
        .await
    }
}
