use super::*;
use std::sync::LazyLock;

const FALLBACK_BYTES: usize = 40;
const TITLE_BYTES: usize = 80;
const INPUT_BYTES: usize = 4096;

static TITLE_CONTROLS: LazyLock<regex::Regex> = LazyLock::new(|| {
    regex::Regex::new(concat!(
        r"(?:\x1b\]|\u{009d})(?:[^\x07\x1b]|\x1b[^\\])*(?:\x07|\x1b\\|$)",
        r"|(?:\x1b\[|\u{009b})[0-?]*[ -/]*[@-~]|\x1b[@-_]",
        r"|[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\u{009f}\u{200b}\u{200e}\u{200f}\u{202a}-\u{202e}\u{2060}-\u{2064}\u{2066}-\u{206f}\u{feff}]"
    )).expect("valid title control pattern")
});

fn normalize(input: &str, max_words: usize, max_bytes: usize) -> String {
    let clean = TITLE_CONTROLS.replace_all(input, "");
    let line = clean
        .split_whitespace()
        .take(max_words)
        .collect::<Vec<_>>()
        .join(" ");
    utf8_prefix(&line, max_bytes).trim_end().to_owned()
}

fn utf8_prefix(input: &str, max_bytes: usize) -> &str {
    let mut end = input.len().min(max_bytes);
    while !input.is_char_boundary(end) {
        end -= 1;
    }
    &input[..end]
}

pub(super) fn register(
    tx: &rusqlite::Transaction<'_>,
    session: &str,
    saved: &Saved,
    automatic: bool,
) -> Result<bool, Error> {
    let Some(input) = &saved.submission.input else {
        return Ok(false);
    };
    if tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_session_titles WHERE session_id=?1)",
            [session],
            |r| r.get::<_, bool>(0),
        )
        .map_err(db_error)?
    {
        return Ok(true);
    }
    let fallback = normalize(&input.text, 5, FALLBACK_BYTES);
    if fallback.is_empty() {
        return Ok(false);
    }
    tx.execute(
        "INSERT INTO agent_runtime_session_titles(session_id,run_id,title,pending)
         SELECT ?1,?2,?3,?4 AND NOT EXISTS(
           SELECT 1 FROM agent_runtime_session_branches WHERE session_id=?1
         ) ON CONFLICT(session_id) DO NOTHING",
        params![session, saved.submission.run_id, fallback, automatic],
    )
    .map_err(db_error)?;
    Ok(true)
}

impl SqliteStore {
    /// Display projection only. Policy and command receipts keep their original metadata.
    pub async fn project_session_titles(
        &self,
        mut rows: Vec<SessionState>,
    ) -> Result<Vec<SessionState>, Error> {
        if rows.iter().all(|row| row.display_name.is_some()) {
            return Ok(rows);
        }
        self.transaction(move |tx| {
            // Historical, read-only placements can predate the additive table.
            if !tx.query_row("SELECT EXISTS(SELECT 1 FROM sqlite_schema WHERE name='agent_runtime_session_titles')", [], |r| r.get::<_, bool>(0)).map_err(db_error)? {
                return Ok(rows);
            }
            let mut title = tx.prepare(
                "SELECT title FROM agent_runtime_session_titles WHERE session_id=?1"
            ).map_err(db_error)?;
            for row in &mut rows {
                if row.display_name.is_none() {
                    row.display_name = title.query_row([&row.session_id], |r| r.get(0))
                        .optional().map_err(db_error)?;
                }
            }
            Ok(rows)
        }).await
    }

    /// Restore fallbacks from the earliest eligible durable turn. Existing
    /// history does not schedule a new model request on startup.
    pub async fn backfill_session_title_page(
        &self,
        after: String,
    ) -> Result<Option<String>, Error> {
        self.transaction(move |tx| {
            let mut sessions = tx.prepare(
                "SELECT s.id FROM agent_runtime_sessions s
                 LEFT JOIN agent_runtime_session_titles t ON t.session_id=s.id
                 LEFT JOIN agent_runtime_session_profiles p ON p.session_id=s.id
                 WHERE s.id>?1 AND t.session_id IS NULL
                   AND json_extract(p.payload,'$.display_name') IS NULL
                 ORDER BY s.id LIMIT 64"
            ).map_err(db_error)?;
            let ids = sessions.query_map([after], |r| r.get::<_, String>(0)).map_err(db_error)?
                .collect::<Result<Vec<_>, _>>().map_err(db_error)?;
            let mut turns = tx.prepare(
                "SELECT run_id FROM agent_runtime_session_turns WHERE session_id=?1 ORDER BY sequence"
            ).map_err(db_error)?;
            for id in &ids {
                for run in turns.query_map([id], |r| r.get::<_, String>(0)).map_err(db_error)? {
                    let run = run.map_err(db_error)?;
                    if let Some((_, _, saved, _)) = load(tx, &run)?
                        && register(tx, id, &saved, false)?
                    {
                        break;
                    }
                }
            }
            Ok(ids.into_iter().last())
        }).await
    }

    /// The claim commits before the auxiliary call, so a restarted host does
    /// not automatically replay a request that might already have been billed.
    pub async fn claim_session_title(&self) -> Result<(Option<(String, String)>, bool), Error> {
        self.transaction(move |tx| {
            let claimed = tx
                .query_row(
                    "UPDATE agent_runtime_session_titles SET pending=0 WHERE session_id=(
                    SELECT t.session_id FROM agent_runtime_session_titles t
                    LEFT JOIN agent_runtime_session_profiles p ON p.session_id=t.session_id
                    WHERE t.pending=1 AND json_extract(p.payload,'$.display_name') IS NULL
                      AND EXISTS(SELECT 1 FROM agent_runtime_events e WHERE e.root_id=t.run_id
                        AND json_extract(e.payload,'$.scope.run_id')=t.run_id
                        AND json_extract(e.payload,'$.event.type')='model_completed')
                    ORDER BY t.session_id LIMIT 1
                 ) RETURNING session_id,run_id",
                    [],
                    |r| Ok((r.get(0)?, r.get(1)?)),
                )
                .optional()
                .map_err(db_error)?;
            let waiting_for_model = claimed.is_none()
                && tx
                    .query_row(
                        "SELECT EXISTS(SELECT 1 FROM agent_runtime_session_titles t
                 JOIN agent_runtime_jobs j ON j.run_id=t.run_id
                 LEFT JOIN agent_runtime_session_profiles p ON p.session_id=t.session_id
                 WHERE t.pending=1 AND json_extract(p.payload,'$.display_name') IS NULL
                   AND j.status IN ('queued','initializing','running'))",
                        [],
                        |r| r.get::<_, bool>(0),
                    )
                    .map_err(db_error)?;
            Ok((claimed, waiting_for_model))
        })
        .await
    }

    pub async fn session_title_is_current(&self, session: &str) -> Result<bool, Error> {
        let session = session.to_owned();
        self.transaction(move |tx| {
            tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_session_titles t
                 LEFT JOIN agent_runtime_session_profiles p ON p.session_id=t.session_id
                 WHERE t.session_id=?1 AND json_extract(p.payload,'$.display_name') IS NULL)",
                [session],
                |r| r.get(0),
            )
            .map_err(db_error)
        })
        .await
    }

    pub async fn finish_session_title(
        &self,
        session: String,
        run: String,
        title: String,
    ) -> Result<(), Error> {
        self.transaction(move |tx| {
            tx.execute(
                "UPDATE agent_runtime_session_titles SET title=?3 WHERE session_id=?1 AND run_id=?2 AND title<>?3
                 AND NOT EXISTS(SELECT 1 FROM agent_runtime_session_profiles
                   WHERE session_id=?1 AND json_extract(payload,'$.display_name') IS NOT NULL)",
                params![session, run, title],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
    }
}

impl RunSupervisor {
    pub async fn generate_session_title(
        &self,
        registry: &crate::registry::ModuleRegistry,
        run: &str,
        cancel: tokio_util::sync::CancellationToken,
    ) -> Result<Option<String>, Error> {
        let Some(job) = self.store.execution_job(run).await? else {
            return Ok(None);
        };
        let Some(input) = job.submission.input.as_ref() else {
            return Ok(None);
        };
        let prompt = utf8_prefix(&input.text, INPUT_BYTES).to_owned();
        let thread = job.submission.thread_id.clone();
        let plan = self.restore_job_plan(registry, &job).await?;
        let agent = plan.runtime_agent();
        // The display fallback is already persisted. A detached title request
        // must not compete with a governed turn's model budget.
        if !agent.governance_profiles().is_empty() {
            return Ok(None);
        }
        let model = agent.sampled_model()?;
        let mut context = crate::RunContext::new(thread, run);
        context.cancel = cancel;
        model.bind_scope(&mut context)?;
        let request = crate::ModelRequest {
            messages: vec![
                crate::Message::System { content: concat!(
                    "Create a concise title for an AI coding-assistant session. ",
                    "Return one line of plain text in the language of the user message. ",
                    "Aim for five words or ten CJK characters. No quotes, explanation, Markdown, or code."
                ).into() },
                crate::Message::User { content: serde_json::json!([{"text":prompt}]).to_string() },
            ],
            tools: Vec::new(),
            settings: serde_json::json!({"stream":true,"max_output_tokens":4096}),
        };
        let operation = format!("session-title:{run}");
        let response = crate::governance::sample_model(
            model,
            request,
            &context,
            &operation,
            false,
            |_| async { Ok(()) },
        )
        .await?;
        if !response.tool_calls.is_empty()
            || response.info.refusal.is_some()
            || matches!(
                response.info.stop_reason.as_deref(),
                Some("length" | "max_tokens" | "max_output_tokens")
            )
        {
            return Ok(None);
        }
        let line = response
            .output
            .lines()
            .map(str::trim)
            .find(|line| !line.is_empty())
            .unwrap_or("");
        let marker = line
            .chars()
            .take_while(|character| *character == '*')
            .count();
        let line = if (1..=3).contains(&marker)
            && line.len() > marker * 2
            && line.ends_with(&line[..marker])
            && !line[marker..line.len() - marker].contains(&line[..marker])
        {
            &line[marker..line.len() - marker]
        } else {
            line
        };
        let title = normalize(line, usize::MAX, TITLE_BYTES);
        Ok((!title.is_empty()).then_some(title))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fallback_limits_words_and_utf8_and_cleans_controls() {
        assert_eq!(
            normalize(" \u{1b}[31mOne  two\nthree four five six", 5, 40),
            "One two three four five"
        );
        let input = "会".repeat(18);
        assert_eq!(normalize(&input, 5, 40), "会".repeat(13));
        assert_eq!(normalize("\u{200b}  \n", 5, 40), "");
    }
}
