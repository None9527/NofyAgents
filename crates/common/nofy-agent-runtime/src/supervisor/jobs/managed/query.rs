use super::*;

// Wake the current approval checkpoint or a legacy pre-execution denial that
// still needs terminal settlement.
pub(in crate::supervisor) const RUNNABLE_JOB: &str = "(
    j.status IN ('queued','initializing','running') OR (
      j.status='waiting' AND NOT EXISTS (
        SELECT 1 FROM agent_runtime_runs r WHERE r.id=j.run_id
      ) AND EXISTS (
        SELECT 1 FROM agent_runtime_session_admissions s WHERE s.run_id=j.run_id
          AND json_extract(s.payload,'$.proposal.decision')='deny'
      )
    ) OR (
      j.status='waiting' AND EXISTS (
        SELECT 1 FROM agent_runtime_runs r
        JOIN agent_runtime_threads t ON t.key=j.thread_key AND t.active_run=r.id
        WHERE r.id=j.run_id AND r.thread_key=j.thread_key
          AND json_extract(r.payload,'$.status')='paused'
          AND EXISTS (
            WITH RECURSIVE pause(reason) AS (
              SELECT r.payload -> '$.outcome.Paused.reason'
              UNION ALL
              SELECT reason -> '$.reason' FROM pause
              WHERE json_extract(reason,'$.kind') IN ('child_paused','hook_workflow_paused')
            )
            SELECT 1 FROM pause WHERE json_extract(reason,'$.kind')='approval' AND (
              EXISTS (SELECT 1 FROM agent_runtime_cancel c WHERE c.acknowledged=0
                AND json_extract(c.address,'$.root_run_id')=j.run_id
                AND json_extract(c.address,'$.run_id')=j.run_id)
              OR EXISTS (SELECT 1 FROM agent_runtime_approvals a
                WHERE a.decision IS NOT NULL
                  AND json_extract(a.payload,'$._continue_root')=j.run_id
                  AND a.run_id=json_extract(reason,'$.request.run_id')
                  AND json_extract(a.payload,'$.thread_id')=json_extract(reason,'$.request.thread_id')
                  AND json_extract(a.payload,'$.step')=json_extract(reason,'$.request.step')
                  AND json_extract(a.payload,'$.policy_id') IS json_extract(reason,'$.request.policy_id')
                  AND json_extract(a.payload,'$.call.id')=json_extract(reason,'$.request.call.id'))
            )
          )
      )
    )
)";
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
            let sql = format!("SELECT j.sequence,m.run_id FROM agent_runtime_managed_runs m JOIN agent_runtime_jobs j ON j.run_id=m.run_id WHERE j.sequence>?1 AND {RUNNABLE_JOB} AND NOT EXISTS(SELECT 1 FROM agent_runtime_jobs p WHERE p.thread_key=j.thread_key AND p.sequence<j.sequence AND p.status NOT IN ('closed','cancelled','abandoned')) ORDER BY j.sequence LIMIT ?2");
            let mut s=tx.prepare(&sql).map_err(db_error)?;
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
    /// A predecessor blocks its peers until it reaches a terminal status.
    /// Any selected recovery enters the original checkpoint protocol.
    pub async fn runnable_managed(&self, limit: usize) -> Result<Vec<ManagedRun>, Error> {
        page(limit)?;
        self.transaction(move|tx|{
            let sql = format!("SELECT m.run_id FROM agent_runtime_managed_runs m JOIN agent_runtime_jobs j ON j.run_id=m.run_id WHERE {RUNNABLE_JOB} AND NOT EXISTS(SELECT 1 FROM agent_runtime_jobs p WHERE p.thread_key=j.thread_key AND p.sequence<j.sequence AND p.status NOT IN ('closed','cancelled','abandoned')) ORDER BY j.sequence LIMIT ?1");
            let mut statement=tx.prepare(&sql).map_err(db_error)?;
            let ids=statement.query_map([limit],|r|r.get::<_,String>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            bounded_runs(tx,ids)
        }).await
    }
}
