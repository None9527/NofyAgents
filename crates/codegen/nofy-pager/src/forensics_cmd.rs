//! `nofy forensics` — crash forensics as a question, not a file dig
//! (U8-09). The daemon records its life/death discipline in
//! `$NOFY_HOME/daemon/forensics.jsonl`; this verb renders who died, how
//! (clean shutdown vs unclean death), and whether the stuck-loop
//! protection tripped. Works with the daemon down — a crash must be
//! askable about even when nothing runs.

use anyhow::Result;

#[derive(Debug, clap::Args, Clone)]
pub struct ForensicsArgs {
    /// Emit machine-readable JSON output.
    #[arg(long)]
    pub json: bool,
    /// Show at most this many most-recent entries (default 20).
    #[arg(long, default_value = "20")]
    pub limit: usize,
}

/// Execute the forensics query against the ledger under `state_dir`.
pub fn run(args: &ForensicsArgs, state_dir: &std::path::Path) -> Result<()> {
    let ledger = nofy_daemon::forensics::ForensicsLedger::open(&state_dir.join("daemon"))
        .map_err(|e| anyhow::anyhow!("open forensics ledger: {e}"))?;
    let entries = ledger.entries();
    if args.json {
        let tail: Vec<&serde_json::Value> = entries.iter().rev().take(args.limit).collect();
        println!("{}", serde_json::to_string_pretty(&tail)?);
        return Ok(());
    }
    if entries.is_empty() {
        println!("(no forensics history — the daemon never ran here)");
        return Ok(());
    }
    let tail: Vec<&serde_json::Value> = entries.iter().rev().take(args.limit).collect();
    println!("{:<24}  {}", "EVENT", "DETAIL");
    for entry in tail.into_iter().rev() {
        let (event, detail) = render_entry(entry);
        println!("{:<24}  {}", event, detail);
    }
    // Death verdict: what the LAST lifecycle transition says.
    if let Some(verdict) = death_verdict(&entries) {
        println!();
        println!("verdict: {verdict}");
    }
    Ok(())
}

/// One entry as (event label, detail line).
fn render_entry(entry: &serde_json::Value) -> (String, String) {
    match entry.get("kind").and_then(|k| k.as_str()).unwrap_or("?") {
        "startup" => {
            let pid = entry.get("pid").and_then(|p| p.as_u64()).unwrap_or(0);
            let clean = entry
                .get("prev_had_clean_shutdown")
                .and_then(|v| v.as_bool())
                .unwrap_or(true);
            (
                "startup".to_string(),
                format!(
                    "pid {pid}; previous run {}",
                    if clean { "ended cleanly" } else { "DIED UNCLEAN" }
                ),
            )
        }
        "unclean_death_detected" => {
            let pid = entry.get("dead_pid").and_then(|p| p.as_u64()).unwrap_or(0);
            let state = entry
                .get("dead_kind")
                .and_then(|k| k.as_str())
                .unwrap_or("?");
            (
                "UNCLEAN_DEATH".to_string(),
                format!("pid {pid} died without clean shutdown (last state: {state})"),
            )
        }
        "clean_shutdown" => {
            let pid = entry.get("pid").and_then(|p| p.as_u64()).unwrap_or(0);
            ("clean_shutdown".to_string(), format!("pid {pid}"))
        }
        other => (other.to_string(), entry.to_string()),
    }
}

/// The verdict line: latest death classification, or a clean bill.
fn death_verdict(entries: &[serde_json::Value]) -> Option<String> {
    let unclean = entries
        .iter()
        .filter(|e| e.get("kind").and_then(|k| k.as_str()) == Some("unclean_death_detected"))
        .count();
    let last = entries.last()?;
    let toll = format!("{unclean} unclean death(es) on record");
    match last.get("kind").and_then(|k| k.as_str()) {
        Some("clean_shutdown") => Some(format!("last exit was clean; {toll}")),
        Some("startup") => {
            let prev_clean = last
                .get("prev_had_clean_shutdown")
                .and_then(|v| v.as_bool())
                .unwrap_or(true);
            if prev_clean {
                Some(format!("daemon running/ended cleanly; {toll}"))
            } else {
                Some(format!("PREVIOUS RUN DIED UNCLEAN (crash or kill -9); {toll}"))
            }
        }
        Some("unclean_death_detected") => Some(format!(
            "PREVIOUS RUN DIED UNCLEAN (crash or kill -9); the daemon recorded it at boot; {toll}"
        )),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(kind: &str, extra: serde_json::Value) -> serde_json::Value {
        let mut v = extra;
        v["kind"] = serde_json::Value::String(kind.to_string());
        v
    }

    #[test]
    fn render_entry_covers_all_kinds() {
        let (event, detail) = render_entry(&entry(
            "startup",
            serde_json::json!({"pid": 7, "prev_had_clean_shutdown": false}),
        ));
        assert_eq!(event, "startup");
        assert!(detail.contains("DIED UNCLEAN"), "{detail}");

        let (event, detail) = render_entry(&entry(
            "unclean_death_detected",
            serde_json::json!({"dead_pid": 5, "dead_kind": "startup"}),
        ));
        assert_eq!(event, "UNCLEAN_DEATH");
        assert!(detail.contains("pid 5") && detail.contains("startup"), "{detail}");

        let (event, _) = render_entry(&entry("clean_shutdown", serde_json::json!({"pid": 9})));
        assert_eq!(event, "clean_shutdown");
    }

    #[test]
    fn death_verdict_names_the_crash() {
        let clean_only = vec![entry("startup", serde_json::json!({"pid": 1, "prev_had_clean_shutdown": true}))];
        assert!(death_verdict(&clean_only).unwrap().contains("cleanly"));

        // Real ledger shape: a crash leaves a startup without
        // clean_shutdown, so the next boot writes BOTH the startup flag
        // and an unclean_death_detected entry (forensics.rs).
        let crashed = vec![
            entry("startup", serde_json::json!({"pid": 1, "prev_had_clean_shutdown": true})),
            entry("startup", serde_json::json!({"pid": 2, "prev_had_clean_shutdown": false})),
            entry("unclean_death_detected", serde_json::json!({"dead_pid": 1, "dead_kind": "startup", "detected_by_pid": 2})),
        ];
        let verdict = death_verdict(&crashed).unwrap();
        assert!(verdict.contains("DIED UNCLEAN"), "{verdict}");
        assert!(verdict.contains("1 unclean"), "{verdict}");

        assert!(death_verdict(&[]).is_none());
    }
}
