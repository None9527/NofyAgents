use super::*;
use std::time::Duration;

#[derive(Serialize)]
pub struct WorkChange {
    pub cursor: String,
    pub work_id: String,
    pub root_run_id: String,
    pub kind: String,
    pub native_status: Option<String>,
}

#[derive(Serialize)]
pub struct WorkChanges {
    pub changes: Vec<WorkChange>,
    pub watermark: String,
    pub more: bool,
}

#[derive(Serialize)]
pub struct SessionWorkPage {
    pub session_id: String,
    pub items: Vec<WorkNode>,
    pub next_cursor: Option<String>,
    pub watermark: String,
}

const IN_SCOPE: &str = "(
    EXISTS(SELECT 1 FROM agent_runtime_session_turns t WHERE t.run_id=c.root_id AND t.session_id=?1)
    OR EXISTS(SELECT 1 FROM agent_runtime_work_owners w WHERE w.run_id=c.root_id AND w.session_id=?1)
)";

pub(super) fn high_watermark(tx: &rusqlite::Transaction<'_>) -> Result<i64, Error> {
    tx.query_row(
        "SELECT coalesce(max(cursor),0) FROM agent_runtime_work_changes",
        [],
        |row| row.get(0),
    )
    .map_err(db_error)
}

fn parse_cursor(cursor: &str, kind: &str, scope: &str) -> Result<i64, Error> {
    let (version, mode, owner, seq): (u8, String, String, String) = serde_json::from_str(cursor)
        .map_err(|_| Error::Composition("invalid work change cursor".into()))?;
    if version != 1 || mode != kind || owner != scope {
        return Err(Error::Composition(
            "work change cursor belongs to another scope".into(),
        ));
    }
    seq.parse()
        .ok()
        .filter(|n| *n >= 0)
        .ok_or_else(|| Error::Composition("invalid work change cursor position".into()))
}

pub(super) fn cursor(kind: &str, scope: &str, value: i64) -> String {
    json!([1, kind, scope, value.to_string()]).to_string()
}

impl SqliteStore {
    pub async fn session_work_list(
        &self,
        session: &str,
        after: Option<String>,
        limit: usize,
    ) -> Result<SessionWorkPage, Error> {
        crate::system::bounded_name(session)?;
        if !(1..=64).contains(&limit) {
            return Err(Error::Composition("work page limit must be 1..=64".into()));
        }
        let session_id = session.to_owned();
        let after = match after {
            Some(cursor) => {
                let (version, owner, key): (u8, String, String) = serde_json::from_str(&cursor)
                    .map_err(|_| Error::Composition("invalid session work page cursor".into()))?;
                crate::system::bounded_name(&key)?;
                if version != 1 || owner != session_id {
                    return Err(Error::Composition(
                        "work page cursor belongs to another session".into(),
                    ));
                }
                key
            }
            None => String::new(),
        };
        self.transaction(move |tx| {
            let mut query = tx.prepare(
                "SELECT run_id FROM (
                   SELECT run_id FROM agent_runtime_session_turns WHERE session_id=?1 AND run_id>?2
                   UNION ALL SELECT run_id FROM agent_runtime_work_owners WHERE session_id=?1 AND run_id>?2
                 ) ORDER BY run_id LIMIT ?3",
            ).map_err(db_error)?;
            let runs = query.query_map(params![session_id, after, limit + 1], |row| row.get::<_, String>(0))
                .map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            let next_cursor = (runs.len() > limit).then(|| json!([1,session_id,runs[limit-1]]).to_string());
            let mut items = Vec::new();
            for run in runs.into_iter().take(limit) {
                if let Some(node) = root_node(tx, &run)? {
                    items.push(node);
                }
            }
            let watermark = cursor("session", &session_id, high_watermark(tx)?);
            Ok(SessionWorkPage { session_id, items, next_cursor, watermark })
        }).await
    }

    pub async fn wait_work(
        &self,
        session_scope: bool,
        scope: &str,
        after: Option<String>,
        work_ids: Vec<String>,
        limit: usize,
        timeout: Duration,
    ) -> Result<WorkChanges, Error> {
        crate::system::bounded_name(scope)?;
        if !(1..=64).contains(&limit) || work_ids.len() > 16 || timeout > Duration::from_secs(30) {
            return Err(Error::Composition("invalid work wait bounds".into()));
        }
        let mode = if session_scope { "session" } else { "root" };
        let mut after = after
            .as_deref()
            .map(|c| parse_cursor(c, mode, scope))
            .transpose()?
            .unwrap_or(0);
        let mut changes = self.observe();
        let deadline = tokio::time::Instant::now() + timeout;
        loop {
            let scope_id = scope.to_owned();
            let ids = work_ids.clone();
            let page = self.transaction(move |tx| {
                let max = high_watermark(tx)?;
                if after > max {
                    return Err(Error::Composition("work change cursor is ahead of the journal".into()));
                }
                let scope_clause = if session_scope { IN_SCOPE } else { "c.root_id=?1" };
                let filter = serde_json::to_string(&ids).map_err(db_error)?;
                let mut statement = tx.prepare(&format!(
                    "SELECT c.cursor,c.root_id,coalesce(w.work_id,c.run_id),c.change_kind,c.native_status
                     FROM agent_runtime_work_changes c
                     LEFT JOIN agent_runtime_work_owners w ON w.run_id=c.run_id
                     WHERE {scope_clause} AND c.cursor>?2
                     AND (?3='[]' OR coalesce(w.work_id,c.run_id) IN (SELECT value FROM json_each(?3)))
                     ORDER BY c.cursor LIMIT ?4"
                )).map_err(db_error)?;
                let mut rows = statement.query(params![scope_id, after, filter, limit+1]).map_err(db_error)?;
                let mut page = Vec::new();
                let mut last = after;
                while let Some(row) = rows.next().map_err(db_error)? {
                    if page.len() == limit {
                        return Ok((page,last,true));
                    }
                    last = row.get(0).map_err(db_error)?;
                    page.push(WorkChange {
                        cursor: cursor(mode,&scope_id,last),
                        root_run_id: row.get(1).map_err(db_error)?,
                        work_id: row.get(2).map_err(db_error)?,
                        kind: row.get(3).map_err(db_error)?,
                        native_status: row.get(4).map_err(db_error)?,
                    });
                }
                Ok((page,max,false))
            }).await?;
            after = page.1;
            if !page.0.is_empty() || tokio::time::Instant::now() >= deadline {
                return Ok(WorkChanges {
                    changes: page.0,
                    watermark: cursor(mode, scope, after),
                    more: page.2,
                });
            }
            tokio::select! {
                _ = changes.changed() => {},
                _ = tokio::time::sleep_until(deadline.min(tokio::time::Instant::now() + Duration::from_millis(400))) => {},
            }
        }
    }
}
