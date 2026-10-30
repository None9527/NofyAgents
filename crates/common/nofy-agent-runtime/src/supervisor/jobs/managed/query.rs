use super::*;
fn page(limit: usize) -> Result<(), Error> {
    if !(1..=256).contains(&limit) {
        return Err(Error::Composition(
            "managed page limit must be 1..=256".into(),
        ));
    }
    Ok(())
}
fn run(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<Option<ManagedRun>, Error> {
    let Some(request) = read_request(tx, id)? else {
        return Ok(None);
    };
    // Admission writes both rows atomically. Status/list polling does not load
    // an entire frozen graph; the worker verifies it before execution.
    let (sequence, status): (u64, String) = tx
        .query_row(
            "SELECT sequence,status FROM agent_runtime_jobs WHERE run_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(db_error)?;
    Ok(Some(ManagedRun {
        sequence,
        request,
        status: super::super::status(&status)?,
    }))
}
fn bounded_runs(
    tx: &rusqlite::Transaction<'_>,
    ids: Vec<String>,
) -> Result<Vec<ManagedRun>, Error> {
    let mut result = Vec::new();
    let mut bytes = 0;
    for id in ids {
        let item =
            run(tx, &id)?.ok_or_else(|| Error::Checkpoint("managed job disappeared".into()))?;
        bytes += serde_json::to_vec(&item).map_err(db_error)?.len() + 1;
        if bytes > 8 * 1024 * 1024 {
            break;
        }
        result.push(item);
    }
    Ok(result)
}

impl SqliteStore {
    pub async fn managed_queue_heads(
        &self,
        after: u64,
        limit: usize,
    ) -> Result<Vec<(u64, String)>, Error> {
        page(limit)?;
        let after = i64::try_from(after).map_err(db_error)?;
        self.transaction(move|tx|{
            let mut s=tx.prepare("SELECT j.sequence,m.run_id FROM agent_runtime_managed_runs m JOIN agent_runtime_jobs j ON j.run_id=m.run_id WHERE j.sequence>?1 AND j.status IN ('queued','initializing','running') AND NOT EXISTS(SELECT 1 FROM agent_runtime_jobs p WHERE p.thread_key=j.thread_key AND p.sequence<j.sequence AND p.status NOT IN ('closed','cancelled','abandoned')) ORDER BY j.sequence LIMIT ?2").map_err(db_error)?;
            s.query_map(params![after,limit],|r|Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)
        }).await
    }
    pub async fn managed_run(&self, run_id: &str) -> Result<Option<ManagedRun>, Error> {
        let id = run_id.to_owned();
        self.transaction(move |tx| run(tx, &id)).await
    }
    pub async fn managed_runs(&self, after: u64, limit: usize) -> Result<Vec<ManagedRun>, Error> {
        page(limit)?;
        let after = i64::try_from(after).map_err(db_error)?;
        self.transaction(move|tx|{
            let mut statement=tx.prepare("SELECT m.run_id FROM agent_runtime_managed_runs m JOIN agent_runtime_jobs j ON j.run_id=m.run_id WHERE j.sequence>?1 ORDER BY j.sequence LIMIT ?2").map_err(db_error)?;
            let ids=statement.query_map(params![after,limit],|r|r.get::<_,String>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            bounded_runs(tx,ids)
        }).await
    }
    /// A waiting predecessor blocks its peers. A recovered running job enters
    /// the original checkpoint/reconciliation protocol, never a fresh attempt.
    pub async fn runnable_managed(&self, limit: usize) -> Result<Vec<ManagedRun>, Error> {
        page(limit)?;
        self.transaction(move|tx|{
            let mut statement=tx.prepare("SELECT m.run_id FROM agent_runtime_managed_runs m JOIN agent_runtime_jobs j ON j.run_id=m.run_id WHERE j.status IN ('queued','initializing','running') AND NOT EXISTS(SELECT 1 FROM agent_runtime_jobs p WHERE p.thread_key=j.thread_key AND p.sequence<j.sequence AND p.status NOT IN ('closed','cancelled','abandoned')) ORDER BY j.sequence LIMIT ?1").map_err(db_error)?;
            let ids=statement.query_map([limit],|r|r.get::<_,String>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            bounded_runs(tx,ids)
        }).await
    }
}
