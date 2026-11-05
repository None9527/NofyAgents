//! Polling must not repeatedly deserialize or transfer implementation snapshots.
use super::*;
use serde_json::{Value, json};

impl SqliteStore {
    pub async fn execution_status(&self, run: &str) -> Result<Value, Error> {
        crate::system::bounded_name(run)?;
        let id = run.to_owned();
        self.transaction(move |tx| {
            let execution: Option<Value> = tx.query_row(
                "SELECT json_extract(payload,'$.run_id'), json_extract(payload,'$.status'),
                substr(json_extract(payload,'$.error'),1,4096), length(CAST(json_extract(payload,'$.error') AS BLOB)),
                substr(json_extract(payload,'$.outcome.Completed.output'),1,4096),
                length(CAST(json_extract(payload,'$.outcome.Completed.output') AS BLOB))
                FROM agent_runtime_runs WHERE id=?1", [&id], |row| {
                    let owner: String = row.get(0)?;
                    let status: String = row.get(1)?;
                    let error: Option<String> = row.get(2)?;
                    let error_bytes: Option<u64> = row.get(3)?;
                    let preview: Option<String> = row.get(4)?;
                    let bytes: Option<u64> = row.get(5)?;
                    Ok(json!({"run_id":owner,"status":status,"error":error,"error_bytes":error_bytes,
                        "error_truncated":error_bytes.is_some_and(|n| n > error.as_ref().map_or(0, |s| s.len() as u64)),
                        "output":preview.as_ref().map(|text| json!({"preview":text,"bytes":bytes,"truncated":bytes.is_some_and(|n| n > text.len() as u64)}))}))
                }).optional().map_err(db_error)?;
            if execution.as_ref().is_some_and(|e| e["run_id"] != id) {
                return Err(Error::Checkpoint("execution status owner changed".into()));
            }
            let live_revision: Option<u64> = tx.query_row(
                "SELECT revision FROM agent_runtime_live_versions WHERE run_id=?1 ORDER BY revision DESC LIMIT 1", [&id], |r| r.get(0)
            ).optional().map_err(db_error)?;
            let mut statement = tx.prepare("SELECT json_extract(payload,'$.status'), count(*) FROM agent_runtime_children WHERE root_id=?1 GROUP BY json_extract(payload,'$.status')").map_err(db_error)?;
            let counts = statement.query_map([&id], |row| Ok((row.get::<_,String>(0)?, row.get::<_,u64>(1)?))).map_err(db_error)?
                .collect::<Result<std::collections::BTreeMap<_,_>,_>>().map_err(db_error)?;
            Ok(json!({"execution":execution,"live":live_revision.map(|revision|json!({"revision":revision})),"children_summary":{"by_status":counts}}))
        }).await
    }
}
