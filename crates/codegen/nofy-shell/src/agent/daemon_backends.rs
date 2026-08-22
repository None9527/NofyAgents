//! Shell implementations of the agent's daemon-plane backends.
//!
//! - [`ShellForensics`] wraps `nofy_daemon::forensics::ForensicsLedger` so
//!   the agent's `daemon_forensics` tool can answer "why did it die"
//!   questions — the natural-language counterpart of `nofy forensics`.
//!   Works with the daemon down (the ledger is a plain file).
//! - [`ShellDelegation`] wraps the daemon control socket so the agent's
//!   `delegate_task` / `delegation_status` tools can submit and follow up
//!   on background runs — the natural-language counterpart of
//!   `nofy task submit` / `nofy task list`. Refusals (including the U4-06
//!   active-run fail-loud) surface verbatim.

use nofy_control_schema::methods::ControlMethod;
use nofy_tools::types::delegation::{DelegatedTaskStatus, DelegationProvider};
use nofy_tools::types::forensics::{ForensicsEntry, ForensicsProvider};

use crate::util::nofy_home::nofy_home;

/// Forensics backend over the daemon's life/death ledger file.
#[derive(Debug, Default)]
pub struct ShellForensics;

#[async_trait::async_trait]
impl ForensicsProvider for ShellForensics {
    async fn entries(&self, limit: usize) -> Result<Vec<ForensicsEntry>, String> {
        let ledger = nofy_daemon::forensics::ForensicsLedger::open(&nofy_home().join("daemon"))
            .map_err(|e| format!("open forensics ledger: {e}"))?;
        let entries = ledger.entries();
        let start = entries.len().saturating_sub(limit);
        Ok(entries[start..].iter().map(parse_entry).collect())
    }
}

/// Map one raw ledger line to the typed entry (unknown fields dropped).
fn parse_entry(v: &serde_json::Value) -> ForensicsEntry {
    ForensicsEntry {
        kind: v
            .get("kind")
            .and_then(|k| k.as_str())
            .unwrap_or("?")
            .to_string(),
        pid: v.get("pid").and_then(|p| p.as_u64()),
        dead_pid: v.get("dead_pid").and_then(|p| p.as_u64()),
        dead_kind: v
            .get("dead_kind")
            .and_then(|k| k.as_str())
            .map(String::from),
        prev_had_clean_shutdown: v.get("prev_had_clean_shutdown").and_then(|b| b.as_bool()),
    }
}

/// Delegation backend over the daemon control socket.
#[derive(Debug, Default)]
pub struct ShellDelegation;

#[async_trait::async_trait]
impl DelegationProvider for ShellDelegation {
    async fn submit(&self, task_id: &str, goal: &str, cwd: Option<&str>) -> Result<u32, String> {
        let mut client = nofy_daemon::control_client::ControlClient::connect(&nofy_home())
            .map_err(|e| format!("daemon control socket: {e} (is the daemon running?)"))?;
        // One self-contained goal = one single-task run on a plain pack id;
        // packs are optional at protocol level and resolved by the provider
        // (submit_run), so no pack payload rides the submit.
        let manifest = format!(
            "packs = [\"delegated\"]\non_fail = \"skip\"\n\n\
             [[task]]\nid = \"{id}\"\npack = \"delegated\"\ngoal = \"{goal}\"\n",
            id = escape_toml(task_id),
            goal = escape_toml(goal),
        );
        let method = ControlMethod::TaskSubmit {
            manifest,
            packs: Vec::new(),
            cwd: cwd.map(String::from),
        };
        let response = client
            .call(&method)
            .map_err(|e| format!("control call failed: {e}"))?;
        if nofy_daemon::control_client::is_error(&response) {
            return Err(format!(
                "daemon refused: {} ({})",
                response["detail"].as_str().unwrap_or("?"),
                response["code"].as_str().unwrap_or("?")
            ));
        }
        Ok(response["total"].as_u64().unwrap_or(0) as u32)
    }

    async fn status(&self) -> Result<Vec<DelegatedTaskStatus>, String> {
        let mut client = nofy_daemon::control_client::ControlClient::connect(&nofy_home())
            .map_err(|e| format!("daemon control socket: {e} (is the daemon running?)"))?;
        let response = client
            .call(&ControlMethod::TaskList)
            .map_err(|e| format!("control call failed: {e}"))?;
        if nofy_daemon::control_client::is_error(&response) {
            return Err(format!(
                "daemon refused: {} ({})",
                response["detail"].as_str().unwrap_or("?"),
                response["code"].as_str().unwrap_or("?")
            ));
        }
        Ok(response["tasks"]
            .as_array()
            .map(|tasks| {
                tasks
                    .iter()
                    .map(|t| DelegatedTaskStatus {
                        id: t["id"].as_str().unwrap_or("?").to_string(),
                        state: t["state"].as_str().unwrap_or("?").to_string(),
                        run: t["run"].as_str().unwrap_or("-").to_string(),
                    })
                    .collect()
            })
            .unwrap_or_default())
    }
}

/// Escape a string for a TOML basic string (goal text may carry quotes,
/// backslashes, newlines).
fn escape_toml(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04X}", c as u32)),
            c => out.push(c),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escape_toml_covers_specials() {
        assert_eq!(escape_toml("plain"), "plain");
        assert_eq!(escape_toml("a\"b\\c"), "a\\\"b\\\\c");
        assert_eq!(escape_toml("line1\nline2\tend"), "line1\\nline2\\tend");
        // CJK passes through untouched.
        assert_eq!(escape_toml("建一个文件"), "建一个文件");
    }

    #[test]
    fn parse_entry_maps_known_kinds() {
        let v = serde_json::json!({"kind": "startup", "pid": 7, "prev_had_clean_shutdown": false});
        let e = parse_entry(&v);
        assert_eq!(e.kind, "startup");
        assert_eq!(e.pid, Some(7));
        assert_eq!(e.prev_had_clean_shutdown, Some(false));

        let v = serde_json::json!({"kind": "unclean_death_detected", "dead_pid": 5, "dead_kind": "startup"});
        let e = parse_entry(&v);
        assert_eq!(e.dead_pid, Some(5));
        assert_eq!(e.dead_kind.as_deref(), Some("startup"));

        let e = parse_entry(&serde_json::json!({}));
        assert_eq!(e.kind, "?");
    }
}
