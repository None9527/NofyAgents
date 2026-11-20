use super::*;
use crate::{
    program::ProgramSnapshot,
    system::{CompiledSystem, bounded_name, content_digest},
};

#[derive(Serialize)]
pub struct WorkAdmission {
    pub work_id: String,
    pub run_id: String,
    pub session_id: String,
    pub parent_work_id: String,
    pub command_id: String,
    pub release: String,
    pub program: String,
    pub kind: String,
    pub sequence: u64,
}

pub(in crate::supervisor) struct WorkOwnership {
    pub work_id: String,
    pub session_id: String,
    pub origin: String,
    pub command_id: String,
    pub kind: String,
    caller: Option<WorkCaller>,
    live_revision: u64,
}

impl WorkOwnership {
    pub(in crate::supervisor) fn admit(
        &self,
        tx: &rusqlite::Transaction<'_>,
        request: &jobs::ManagedRunRequest,
        hash: &str,
        now: u64,
    ) -> Result<(), Error> {
        if let Some(caller) = &self.caller {
            caller.check(tx, now)?;
        }
        if session_of(tx, &self.origin)?.as_deref() != Some(&self.session_id) {
            return Err(Error::Composition(
                "work origin is outside the session".into(),
            ));
        }
        let revision: u64 = tx
            .query_row(
                "SELECT coalesce(max(revision),0) FROM agent_runtime_live_versions WHERE run_id=?1",
                [&self.origin],
                |row| row.get(0),
            )
            .map_err(db_error)?;
        if revision != self.live_revision {
            return Err(Error::Checkpoint(
                "origin settings changed while admitting work".into(),
            ));
        }
        let stored: Option<(String, String)> = tx
            .query_row(
                "SELECT run_id,request_digest FROM agent_runtime_work_owners
             WHERE session_id=?1 AND command_id=?2",
                params![self.session_id, self.command_id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .optional()
            .map_err(db_error)?;
        if let Some((run, digest)) = stored {
            if run != request.run_id || digest != hash {
                return Err(Error::Checkpoint(
                    "work command ID reused with different input".into(),
                ));
            }
            if jobs::read_managed_request(tx, &run)?.is_none() {
                return Err(Error::Checkpoint(
                    "work is missing its original admission".into(),
                ));
            }
            return Ok(());
        }
        let (system, release): (String, String) = tx
            .query_row(
                "SELECT json_extract(payload,'$.system'),json_extract(payload,'$.release')
             FROM agent_runtime_managed_runs WHERE run_id=?1",
                [&self.origin],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .map_err(db_error)?;
        if request.system != system || request.release != release {
            return Err(Error::Checkpoint(
                "work target is outside the origin release".into(),
            ));
        }
        let count: u64 = tx
            .query_row(
                "SELECT COUNT(*) FROM agent_runtime_work_owners WHERE session_id=?1",
                [&self.session_id],
                |row| row.get(0),
            )
            .map_err(db_error)?;
        if count >= 64 || jobs::read_managed_request(tx, &request.run_id)?.is_some() {
            return Err(Error::Checkpoint(
                "background work capacity or run identity conflict".into(),
            ));
        }
        let active: u64 = tx.query_row(
            "SELECT COUNT(*) FROM agent_runtime_work_owners w JOIN agent_runtime_jobs j ON j.run_id=w.run_id
             WHERE w.session_id=?1 AND j.status NOT IN ('closed','cancelled','abandoned')",
            [&self.session_id],
            |row| row.get(0),
        ).map_err(db_error)?;
        if active >= 4 {
            return Err(Error::Composition(
                "session already owns four unsettled background runs".into(),
            ));
        }
        tx.execute(
            "INSERT INTO agent_runtime_work_owners(work_id,run_id,session_id,origin_run_id,command_id,request_digest,kind)
             VALUES(?1,?2,?3,?4,?5,?6,?7)",
            params![self.work_id, request.run_id, self.session_id, self.origin, self.command_id, hash, self.kind],
        ).map_err(db_error)?;
        Ok(())
    }
}

pub(super) fn session_of(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
) -> Result<Option<String>, Error> {
    tx.query_row(
        "SELECT session_id FROM agent_runtime_session_turns WHERE run_id=?1
         UNION ALL SELECT session_id FROM agent_runtime_work_owners WHERE run_id=?1",
        [run],
        |row| row.get(0),
    )
    .optional()
    .map_err(db_error)
}

pub(super) fn logical_id(tx: &rusqlite::Transaction<'_>, run: &str) -> Result<String, Error> {
    let work: Option<String> = tx
        .query_row(
            "SELECT work_id FROM agent_runtime_work_owners WHERE run_id=?1",
            [run],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    Ok(work.unwrap_or_else(|| run.to_owned()))
}

pub(super) fn resolve_run(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<String, Error> {
    let run: Option<String> = tx
        .query_row(
            "SELECT run_id FROM agent_runtime_work_owners WHERE work_id=?1",
            [id],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    Ok(run.unwrap_or_else(|| id.to_owned()))
}

impl SqliteStore {
    pub async fn work_session(&self, run: &str) -> Result<Option<String>, Error> {
        bounded_name(run)?;
        let run = run.to_owned();
        self.transaction(move |tx| session_of(tx, &run)).await
    }

    pub async fn work_root_run(&self, id: &str) -> Result<String, Error> {
        bounded_name(id)?;
        let id = id.to_owned();
        self.transaction(move |tx| resolve_run(tx, &id)).await
    }

    pub async fn locate_work(&self, id: &str) -> Result<Option<String>, Error> {
        if id.is_empty() || id.len() > 1024 {
            return Err(Error::Composition("invalid work identity".into()));
        }
        let id = id.to_owned();
        self.transaction(move |tx| {
            let root = resolve_run(tx, &id)?;
            let exists: bool = tx
                .query_row(
                    "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_runs WHERE run_id=?1)",
                    [&root],
                    |row| row.get(0),
                )
                .map_err(db_error)?;
            if exists {
                return Ok(Some(root));
            }
            let mut stmt = tx
                .prepare(
                    "SELECT root_id FROM agent_runtime_children
                 WHERE json_extract(payload,'$.run_id')=?1 LIMIT 2",
                )
                .map_err(db_error)?;
            let matches = stmt
                .query_map([id], |row| row.get::<_, String>(0))
                .map_err(db_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(db_error)?;
            if matches.len() > 1 {
                return Err(Error::Composition(
                    "work identity is ambiguous; specify its root run".into(),
                ));
            }
            Ok(matches.into_iter().next())
        })
        .await
    }
}

impl RunSupervisor {
    pub async fn start_work(
        &self,
        session: &str,
        origin: &str,
        command_id: &str,
        mut request: jobs::ManagedRunRequest,
        system: &CompiledSystem,
        caller: Option<WorkCaller>,
        live_revision: u64,
    ) -> Result<WorkAdmission, Error> {
        for field in [session, origin, command_id] {
            bounded_name(field)?;
        }
        if caller
            .as_ref()
            .is_some_and(|caller| caller.run_id() != origin)
        {
            return Err(Error::Composition(
                "work authority does not match origin".into(),
            ));
        }
        let digest = content_digest(&("nofy.background/v1", session, command_id))?;
        let work_id = format!("work:{digest}");
        let run_id = format!("work-run:{digest}");
        request.run_id.clone_from(&run_id);
        request.thread_id.clone_from(&run_id);
        let kind = match &system.program(&request.program)?.snapshot.program {
            ProgramSnapshot::Agent { .. } => "agent",
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { .. } => "workflow",
            _ => {
                return Err(Error::Composition(
                    "background work requires Agent or Workflow".into(),
                ));
            }
        };
        let ownership = WorkOwnership {
            work_id: work_id.clone(),
            origin: origin.into(),
            session_id: session.into(),
            command_id: command_id.into(),
            kind: kind.into(),
            caller,
            live_revision,
        };
        let receipt = self
            .submit_owned_work(request, system, Some(ownership))
            .await?;
        let lookup = run_id.clone();
        let parent_work_id = self
            .store
            .transaction(move |tx| {
                let origin: String = tx
                    .query_row(
                        "SELECT origin_run_id FROM agent_runtime_work_owners WHERE run_id=?1",
                        [lookup],
                        |row| row.get(0),
                    )
                    .map_err(db_error)?;
                logical_id(tx, &origin)
            })
            .await?;
        Ok(WorkAdmission {
            work_id,
            run_id,
            session_id: session.into(),
            parent_work_id,
            command_id: command_id.into(),
            release: receipt.request.release,
            program: receipt.request.program,
            kind: kind.into(),
            sequence: receipt.sequence,
        })
    }
}
