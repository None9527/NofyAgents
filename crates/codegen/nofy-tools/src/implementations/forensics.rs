//! `daemon_forensics` tool — autonomous crash forensics.
//!
//! Lets the agent answer "why did it die" questions from the daemon's
//! life/death discipline ledger without the user manually running
//! `nofy forensics`. Reads the injected
//! [`crate::types::forensics::ForensicsProvider`] (implemented by the shell
//! over `nofy_daemon::forensics`). Rendering mirrors the user verb: one
//! line per lifecycle entry plus a death verdict.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::types::forensics::{ForensicsAccess, ForensicsEntry};
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Input for the `daemon_forensics` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct ForensicsInput {
    /// Show at most this many most-recent ledger entries. Defaults to 20.
    #[serde(default)]
    pub limit: Option<usize>,
}

/// Query the daemon's crash-forensics ledger.
#[derive(Debug, Default)]
pub struct ForensicsTool;

impl crate::types::tool_metadata::ToolMetadata for ForensicsTool {
    fn kind(&self) -> ToolKind {
        ToolKind::Read
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Query the daemon's crash-forensics ledger: every startup, clean \
         shutdown, and detected unclean death (crash or kill -9), plus a \
         verdict on the last exit.\n\n\
         Use this proactively when:\n\
         - The user asks why nofy, the daemon, or a previous run crashed, \
         died, or restarted unexpectedly\n\
         - You suspect a prior unclean death matters to the current task \
         (e.g. interrupted work, missing artifacts)\n\n\
         Read-only; works even when the daemon is down."
    }
}

impl nofy_tool_runtime::Tool for ForensicsTool {
    type Args = ForensicsInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("daemon_forensics").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "daemon_forensics",
            crate::types::tool_metadata::ToolMetadata::sanitized_description_template(self),
        )
    }

    fn capabilities(&self) -> nofy_tool_protocol::ToolCapabilities {
        nofy_tool_protocol::ToolCapabilities {
            is_read_only: true,
            tool_scope: Some(nofy_tool_protocol::ToolScope::Read),
            ..Default::default()
        }
    }

    async fn run(
        &self,
        ctx: nofy_tool_runtime::ToolCallContext,
        input: ForensicsInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let resources = shared_resources(&ctx)?;
        let Some(access) = resources.lock().await.get::<ForensicsAccess>().cloned() else {
            return Ok(ToolOutput::Text(
                "Forensics is not available in this session.".into(),
            ));
        };
        let limit = input.limit.unwrap_or(20);
        let entries = access.0.entries(limit).await.map_err(|e| {
            nofy_tool_runtime::ToolError::execution(
                nofy_tool_protocol::ToolId::new("daemon_forensics").expect("valid"),
                format!("forensics query failed: {e}"),
            )
        })?;
        if entries.is_empty() {
            return Ok(ToolOutput::Text(
                "(no forensics history — the daemon never ran here)".into(),
            ));
        }
        let mut out = String::new();
        for entry in &entries {
            let (event, detail) = render_entry(entry);
            out.push_str(&format!("{event:<24}  {detail}\n"));
        }
        if let Some(verdict) = death_verdict(&entries) {
            out.push_str(&format!("\nverdict: {verdict}\n"));
        }
        Ok(ToolOutput::Text(out.into()))
    }
}

/// One entry as (event label, detail line). Mirrors the `nofy forensics`
/// verb rendering.
fn render_entry(entry: &ForensicsEntry) -> (String, String) {
    match entry.kind.as_str() {
        "startup" => {
            let pid = entry.pid.unwrap_or(0);
            let clean = entry.prev_had_clean_shutdown.unwrap_or(true);
            (
                "startup".to_string(),
                format!(
                    "pid {pid}; previous run {}",
                    if clean { "ended cleanly" } else { "DIED UNCLEAN" }
                ),
            )
        }
        "unclean_death_detected" => {
            let pid = entry.dead_pid.unwrap_or(0);
            let state = entry.dead_kind.as_deref().unwrap_or("?");
            (
                "UNCLEAN_DEATH".to_string(),
                format!("pid {pid} died without clean shutdown (last state: {state})"),
            )
        }
        "clean_shutdown" => {
            let pid = entry.pid.unwrap_or(0);
            ("clean_shutdown".to_string(), format!("pid {pid}"))
        }
        other => (other.to_string(), String::new()),
    }
}

/// The verdict line: latest death classification, or a clean bill. Mirrors
/// the `nofy forensics` verb verdict.
fn death_verdict(entries: &[ForensicsEntry]) -> Option<String> {
    let unclean = entries
        .iter()
        .filter(|e| e.kind == "unclean_death_detected")
        .count();
    let last = entries.last()?;
    let toll = format!("{unclean} unclean death(es) on record");
    match last.kind.as_str() {
        "clean_shutdown" => Some(format!("last exit was clean; {toll}")),
        "startup" => {
            let prev_clean = last.prev_had_clean_shutdown.unwrap_or(true);
            if prev_clean {
                Some(format!("daemon running/ended cleanly; {toll}"))
            } else {
                Some(format!("PREVIOUS RUN DIED UNCLEAN (crash or kill -9); {toll}"))
            }
        }
        "unclean_death_detected" => Some(format!(
            "PREVIOUS RUN DIED UNCLEAN (crash or kill -9); the daemon recorded it at boot; {toll}"
        )),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(kind: &str) -> ForensicsEntry {
        ForensicsEntry {
            kind: kind.to_string(),
            pid: None,
            dead_pid: None,
            dead_kind: None,
            prev_had_clean_shutdown: None,
        }
    }

    #[test]
    fn render_covers_all_kinds() {
        let mut e = entry("startup");
        e.pid = Some(7);
        e.prev_had_clean_shutdown = Some(false);
        let (event, detail) = render_entry(&e);
        assert_eq!(event, "startup");
        assert!(detail.contains("DIED UNCLEAN"), "{detail}");

        let mut e = entry("unclean_death_detected");
        e.dead_pid = Some(5);
        e.dead_kind = Some("startup".into());
        let (event, detail) = render_entry(&e);
        assert_eq!(event, "UNCLEAN_DEATH");
        assert!(detail.contains("pid 5") && detail.contains("startup"), "{detail}");

        let mut e = entry("clean_shutdown");
        e.pid = Some(9);
        let (event, _) = render_entry(&e);
        assert_eq!(event, "clean_shutdown");
    }

    #[test]
    fn verdict_names_the_crash() {
        let mut clean = entry("startup");
        clean.pid = Some(1);
        clean.prev_had_clean_shutdown = Some(true);
        assert!(death_verdict(&[clean]).unwrap().contains("cleanly"));

        // Real ledger shape: a crash leaves a startup without
        // clean_shutdown, so the next boot writes BOTH the startup flag
        // and an unclean_death_detected entry.
        let mut s1 = entry("startup");
        s1.pid = Some(1);
        s1.prev_had_clean_shutdown = Some(true);
        let mut s2 = entry("startup");
        s2.pid = Some(2);
        s2.prev_had_clean_shutdown = Some(false);
        let mut death = entry("unclean_death_detected");
        death.dead_pid = Some(1);
        death.dead_kind = Some("startup".into());
        let verdict = death_verdict(&[s1, s2, death]).unwrap();
        assert!(verdict.contains("DIED UNCLEAN"), "{verdict}");
        assert!(verdict.contains("1 unclean"), "{verdict}");

        assert!(death_verdict(&[]).is_none());
    }
}
