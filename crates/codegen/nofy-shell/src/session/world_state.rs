//! WorldState projection from live session sources (RTAgent Phase C1b).
//!
//! Builds a partitioned read model of the session's current reality from
//! sources the runtime already maintains:
//!
//! - **execution** — the runtime journal's live open-intent gauge and the
//!   resume-time reconciliation report (possibly-running background work,
//!   unknown-outcome side effects);
//! - **workspace** — the agent write ledger (files the agent wrote) and
//!   the hunk tracker (files modified externally after the agent wrote
//!   them);
//! - **governance** — the convergence budget state (base limit, earned
//!   extensions, turns used).
//!
//! Every entry carries authority and freshness per the §6.1 contract.
//! Sources the runtime cannot observe produce explicit `unknown` /
//! `unavailable` entries — absence of evidence is never projected as a
//! confirmed negative.

use nofy_session_journal::{
    Authority, EntryStatus, Freshness, Partition, ReconciliationReport, WorldState,
    WorldStateEntry, now_ms,
};

use crate::session::runtime_journal::RuntimeJournalHandle;
use crate::tools::tool_context::ToolContext;

/// Cap on workspace entries per predicate so a long session's ledger
/// cannot bloat the frame; the most recent writes win.
const MAX_WORKSPACE_ENTRIES: usize = 50;

/// Environment-variable gate for per-turn WorldState frame injection
/// (RTAgent Phase C2). On by default; set `NOFY_WORLD_STATE=0` to opt out.
pub(crate) const WORLD_STATE_ENV: &str = "NOFY_WORLD_STATE";

/// Whether WorldState frame injection is enabled for this process.
/// On by default; set `NOFY_WORLD_STATE=0` (or `false`) to opt out.
pub(crate) fn is_world_state_enabled() -> bool {
    std::env::var(WORLD_STATE_ENV)
        .map(|value| !(value == "0" || value.eq_ignore_ascii_case("false")))
        .unwrap_or(true)
}

/// C1c: TTL for the cached git dirty scan. The world-state frame is
/// built after every tool batch; rescanning a large repo each time is
/// too expensive, so the scan result is shared (keyed by git root) and
/// reused inside this window. Outside it the entries go stale and are
/// re-observed on the next miss.
const GIT_DIRTY_CACHE_TTL: std::time::Duration = std::time::Duration::from_secs(30);

/// C1c: cap on dirty paths collected per scan so a massively dirty repo
/// cannot stall the scan or bloat the frame; the remainder is counted in
/// [`GitDirtySnapshot::truncated`].
const GIT_DIRTY_SCAN_CAP: usize = 200;

/// One cached git dirty scan (C1c).
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct GitDirtySnapshot {
    /// Repo-relative paths of dirty entries (modified, added, untracked).
    pub paths: Vec<String>,
    /// True when the scan stopped at [`GIT_DIRTY_SCAN_CAP`].
    pub truncated: bool,
    /// Unix epoch milliseconds when the scan ran.
    pub scanned_at_ms: u64,
}

type GitDirtyCache = std::collections::HashMap<
    std::path::PathBuf,
    (std::time::Instant, std::sync::Arc<GitDirtySnapshot>),
>;

/// C1c: process-wide dirty-scan cache keyed by git root, mirroring the
/// extensions/git status cache discipline.
static GIT_DIRTY_CACHE: std::sync::LazyLock<std::sync::Mutex<GitDirtyCache>> =
    std::sync::LazyLock::new(|| std::sync::Mutex::new(GitDirtyCache::new()));

/// C1c: cached git dirty snapshot for the repo containing `cwd`.
///
/// `None` when `cwd` is not inside a git worktree or the scan fails —
/// absence of observation is projected as nothing, never as "clean".
/// The blocking scan runs off the async runtime and is budgeted by
/// `nofy-gix-status` so produce-worker spawns stay within nproc headroom.
pub(crate) async fn cached_git_dirty_snapshot(
    cwd: &std::path::Path,
) -> Option<std::sync::Arc<GitDirtySnapshot>> {
    // Cache lookup by git root (two sessions in one repo share scans).
    let git_root = {
        let repo = gix::discover(cwd).ok()?;
        repo.workdir()?.to_path_buf()
    };
    if let Some(entry) = GIT_DIRTY_CACHE.lock().unwrap().get(&git_root) {
        let (cached_at, snapshot) = entry;
        if cached_at.elapsed() < GIT_DIRTY_CACHE_TTL {
            return Some(snapshot.clone());
        }
    }
    let scan_root = git_root.clone();
    let snapshot = tokio::task::spawn_blocking(move || scan_git_dirty(&scan_root))
        .await
        .ok()
        .flatten()?;
    let snapshot = std::sync::Arc::new(snapshot);
    GIT_DIRTY_CACHE
        .lock()
        .unwrap()
        .insert(git_root, (std::time::Instant::now(), snapshot.clone()));
    Some(snapshot)
}

/// The actual scan: index-vs-worktree status including untracked paths,
/// capped at [`GIT_DIRTY_SCAN_CAP`]. Runs on a blocking thread.
fn scan_git_dirty(git_root: &std::path::Path) -> Option<GitDirtySnapshot> {
    use gix::bstr::BString;
    let repo = gix::discover(git_root).ok()?;
    let status = repo.status(gix::progress::Discard).ok()?;
    let status = nofy_gix_status::with_budgeted_thread_limit(status);
    let iter = status
        .into_index_worktree_iter(Vec::<BString>::new())
        .ok()?;
    let mut paths: Vec<String> = Vec::new();
    let mut truncated = false;
    for item in iter {
        let Ok(item) = item else {
            // A scan error mid-iteration still yields what was seen so
            // far; the frame shows partial reality rather than none.
            break;
        };
        let rela = match &item {
            gix::status::index_worktree::Item::Modification { rela_path, .. } => rela_path,
            gix::status::index_worktree::Item::DirectoryContents { entry, .. } => &entry.rela_path,
            gix::status::index_worktree::Item::Rewrite { dirwalk_entry, .. } => {
                &dirwalk_entry.rela_path
            }
        };
        paths.push(rela.to_string());
        if paths.len() >= GIT_DIRTY_SCAN_CAP {
            truncated = true;
            break;
        }
    }
    Some(GitDirtySnapshot {
        paths,
        truncated,
        scanned_at_ms: now_ms(),
    })
}

/// Project the execution partition.
///
/// `open_intent_count` is `None` when the journal is inactive: the gauge
/// does not exist, so the entry says "unknown", never "zero".
pub(crate) fn project_execution_partition(
    open_intent_count: Option<usize>,
    reconciliation: Option<&ReconciliationReport>,
) -> Vec<WorldStateEntry> {
    let mut entries = Vec::new();
    let at = now_ms();

    let mut gauge = WorldStateEntry::new(
        Partition::Execution,
        "tool_intents",
        "open_count",
        match open_intent_count {
            Some(count) => serde_json::json!(count),
            None => serde_json::Value::Null,
        },
        match open_intent_count {
            Some(_) => Authority::Observed,
            None => Authority::Inferred,
        },
        "runtime-journal-gauge",
    )
    .with_freshness(Freshness::at(at));
    if open_intent_count.is_none() {
        gauge.status = EntryStatus::Unavailable;
        gauge.evidence = vec!["runtime journal inactive; no observation".into()];
    }
    entries.push(gauge);

    if let Some(report) = reconciliation {
        for intent in &report.intents {
            use nofy_session_journal::IntentClass;
            let predicate = match intent.class {
                IntentClass::PossiblyRunning => "possibly_running",
                IntentClass::SideEffectUnknown => "outcome_unknown",
                // Read-only intents are bookkeeping artifacts; they carry
                // no claim about external reality worth projecting.
                IntentClass::ReadOnly => continue,
            };
            entries.push(
                WorldStateEntry::new(
                    Partition::Execution,
                    intent.intent_id.clone(),
                    predicate,
                    serde_json::json!({ "tool": intent.tool }),
                    // Classification from the journal alone: the work
                    // may or may not still be in flight — inferred until
                    // re-observed.
                    Authority::Inferred,
                    "resume-reconciliation",
                )
                .with_source_sequence(intent.seq)
                .with_evidence(vec![format!("journal:seq={}", intent.seq)])
                .with_freshness(Freshness::at(at)),
            );
        }
    }
    entries
}

/// One observed workspace change: a path and when it happened.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct WorkspaceChange {
    pub path: std::path::PathBuf,
    pub at: chrono::DateTime<chrono::Utc>,
}

/// Actor-level state slice for partitions whose sources live above the
/// tool context (goal tracker, todo list, subagent coordinator). The
/// injection point collects these into plain snapshots so the projector
/// stays decoupled from actor types and trivially testable.
#[derive(Debug, Clone, Default)]
pub(crate) struct WorldStateExtras {
    pub goal: Option<GoalSnapshot>,
    pub todos: Vec<TodoSnapshot>,
    pub subagents: Vec<SubagentSnapshot>,
}

/// Snapshot of the goal tracker's active orchestration.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct GoalSnapshot {
    pub goal_id: String,
    pub objective: String,
    pub status: String,
    pub phase: String,
    pub current_subagent_id: Option<String>,
    pub current_subagent_role: Option<String>,
}

/// Snapshot of one todo item (pending work).
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct TodoSnapshot {
    pub content: String,
    pub status: String,
}

/// Snapshot of one active subagent worker.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct SubagentSnapshot {
    pub id: String,
    pub agent_type: String,
    pub description: String,
    pub elapsed_ms: u64,
}

/// Cap on pending-work entries projected from the todo list.
const MAX_TODO_ENTRIES: usize = 20;

/// Project the workspace partition from agent writes and external edits.
///
/// Both lists are capped at [`MAX_WORKSPACE_ENTRIES`] most recent entries;
/// ordering is deterministic (most recent first, path as tiebreak).
pub(crate) fn project_workspace_partition(
    agent_writes: &[WorkspaceChange],
    external_edits: &[WorkspaceChange],
) -> Vec<WorldStateEntry> {
    fn project(changes: &[WorkspaceChange], predicate: &str, source: &str) -> Vec<WorldStateEntry> {
        let mut sorted: Vec<&WorkspaceChange> = changes.iter().collect();
        sorted.sort_by(|a, b| b.at.cmp(&a.at).then_with(|| a.path.cmp(&b.path)));
        sorted
            .into_iter()
            .take(MAX_WORKSPACE_ENTRIES)
            .map(|change| {
                let at_ms = u64::try_from(change.at.timestamp_millis()).unwrap_or(0);
                WorldStateEntry::new(
                    Partition::Workspace,
                    change.path.display().to_string(),
                    predicate,
                    serde_json::json!({ "at_ms": at_ms }),
                    Authority::Observed,
                    source,
                )
                .with_freshness(Freshness::at(at_ms))
            })
            .collect()
    }

    let mut entries = project(agent_writes, "agent_written", "agent-write-ledger");
    entries.extend(project(
        external_edits,
        "externally_modified",
        "hunk-tracker",
    ));
    entries
}

/// Project git dirty state into the workspace partition (C1c).
///
/// Git is a host truth source → [`Authority::External`]. Capped at
/// [`MAX_WORKSPACE_ENTRIES`] (most recent scans carry all paths anyway;
/// ordering is the scan's, deterministic for one scan).
pub(crate) fn project_git_dirty_partition(snapshot: &GitDirtySnapshot) -> Vec<WorldStateEntry> {
    snapshot
        .paths
        .iter()
        .take(MAX_WORKSPACE_ENTRIES)
        .map(|path| {
            WorldStateEntry::new(
                Partition::Workspace,
                path.clone(),
                "git_dirty",
                serde_json::json!({ "truncated_scan": snapshot.truncated }),
                Authority::External,
                "git-status",
            )
            .with_freshness(Freshness::at(snapshot.scanned_at_ms))
        })
        .collect()
}

/// Project the task partition: active goal, pending work, completion
/// evidence. Goal and todos are observed runtime state; the completion
/// evidence entry carries the D1 verification verdict so the frame can
/// answer "is the work verified?" without re-reading the journal.
pub(crate) fn project_task_partition(
    extras: &WorldStateExtras,
    verification: Option<nofy_session_journal::VerificationState>,
) -> Vec<WorldStateEntry> {
    let at = now_ms();
    let mut entries = Vec::new();
    if let Some(goal) = &extras.goal {
        entries.push(
            WorldStateEntry::new(
                Partition::Task,
                goal.goal_id.clone(),
                "active_goal",
                serde_json::json!({
                    "objective": goal.objective,
                    "status": goal.status,
                    "phase": goal.phase,
                }),
                Authority::Observed,
                "goal-tracker",
            )
            .with_freshness(Freshness::at(at)),
        );
    }
    for (index, todo) in extras.todos.iter().take(MAX_TODO_ENTRIES).enumerate() {
        // Open work only: completed/cancelled items are history, not
        // current reality.
        if matches!(todo.status.as_str(), "completed" | "cancelled") {
            continue;
        }
        entries.push(
            WorldStateEntry::new(
                Partition::Task,
                format!("todo-{}", index + 1),
                "pending_work",
                serde_json::json!({
                    "content": todo.content,
                    "status": todo.status,
                }),
                Authority::Observed,
                "todo-list",
            )
            .with_freshness(Freshness::at(at)),
        );
    }
    if let Some(state) = verification {
        use nofy_session_journal::VerificationState;
        let (verdict, value) = match state {
            VerificationState::NoMutations => ("no_mutations", serde_json::json!({})),
            VerificationState::Verified {
                last_mutation_seq,
                verification_seq,
            } => (
                "verified",
                serde_json::json!({
                    "last_mutation_seq": last_mutation_seq,
                    "verification_seq": verification_seq,
                }),
            ),
            VerificationState::Unverified { last_mutation_seq } => (
                "unverified",
                serde_json::json!({ "last_mutation_seq": last_mutation_seq }),
            ),
        };
        entries.push(
            WorldStateEntry::new(
                Partition::Task,
                "changes",
                "completion_evidence",
                value,
                // The verdict is computed from journal events — observed
                // facts, even when the verdict itself is "unverified".
                Authority::Observed,
                "runtime-journal-gauge",
            )
            .with_status(match state {
                VerificationState::Unverified { .. } => EntryStatus::Inferred,
                _ => EntryStatus::Observed,
            })
            .with_freshness(Freshness::at(at))
            .with_evidence(vec![format!("verdict:{verdict}")]),
        );
    }
    entries
}

/// Project the agent partition: active subagent workers and the goal's
/// current assignment. Both are observed coordinator state.
pub(crate) fn project_agent_partition(extras: &WorldStateExtras) -> Vec<WorldStateEntry> {
    let at = now_ms();
    let mut entries = Vec::new();
    for worker in &extras.subagents {
        entries.push(
            WorldStateEntry::new(
                Partition::Agent,
                worker.id.clone(),
                "active_worker",
                serde_json::json!({
                    "type": worker.agent_type,
                    "description": worker.description,
                    "elapsed_ms": worker.elapsed_ms,
                }),
                Authority::Observed,
                "subagent-coordinator",
            )
            .with_freshness(Freshness::at(at)),
        );
    }
    if let Some(goal) = &extras.goal
        && let Some(subagent_id) = &goal.current_subagent_id
    {
        entries.push(
            WorldStateEntry::new(
                Partition::Agent,
                subagent_id.clone(),
                "assignment",
                serde_json::json!({
                    "goal_id": goal.goal_id,
                    "role": goal.current_subagent_role,
                }),
                Authority::Observed,
                "goal-tracker",
            )
            .with_freshness(Freshness::at(at)),
        );
    }
    entries
}

/// Project the knowledge partition from what the runtime knows with
/// evidence: resume-reconciliation findings (known facts about the
/// previous segment) and the verification watermarks (evidence
/// references). Conflicts are projected separately by
/// [`project_knowledge_conflicts`] once the full state exists.
pub(crate) fn project_knowledge_partition(
    reconciliation: Option<&nofy_session_journal::ReconciliationReport>,
    verification: Option<nofy_session_journal::VerificationState>,
) -> Vec<WorldStateEntry> {
    let at = now_ms();
    let mut entries = Vec::new();
    if let Some(report) = reconciliation {
        entries.push(
            WorldStateEntry::new(
                Partition::Knowledge,
                "resume-reconciliation",
                "known_fact",
                serde_json::json!({
                    "open_total": report.open_total,
                    "unknown_outcome": report.unknown_outcome,
                    "possibly_running": report.possibly_running,
                }),
                // Classification from the journal alone — inferred until
                // re-observed.
                Authority::Inferred,
                "resume-reconciliation",
            )
            .with_evidence(vec![report.summary_line()])
            .with_freshness(Freshness::at(at)),
        );
    }
    if let Some(state) = verification {
        use nofy_session_journal::VerificationState;
        let value = match state {
            VerificationState::NoMutations => serde_json::json!({}),
            VerificationState::Verified {
                last_mutation_seq,
                verification_seq,
            } => serde_json::json!({
                "last_mutation_seq": last_mutation_seq,
                "verification_seq": verification_seq,
            }),
            VerificationState::Unverified { last_mutation_seq } => {
                serde_json::json!({ "last_mutation_seq": last_mutation_seq })
            }
        };
        entries.push(
            WorldStateEntry::new(
                Partition::Knowledge,
                "verification",
                "evidence",
                value,
                Authority::Observed,
                "runtime-journal-gauge",
            )
            .with_freshness(Freshness::at(at)),
        );
    }
    entries
}

/// Project the conflicts slice of the knowledge partition from a built
/// state's shadowed challengers — weaker claims that lost an authority
/// upsert. Called after all partitions are assembled.
pub(crate) fn project_knowledge_conflicts(state: &WorldState) -> Vec<WorldStateEntry> {
    let at = now_ms();
    state
        .shadow_entries()
        .iter()
        .map(|shadow| {
            WorldStateEntry::new(
                Partition::Knowledge,
                shadow.subject.clone(),
                "conflict",
                shadow.value.clone(),
                shadow.authority,
                shadow.source.clone(),
            )
            .with_freshness(Freshness::at(at))
            .with_status(EntryStatus::Conflicted)
            .with_evidence(vec![format!("shadowed_entry:{}", shadow.id)])
        })
        .collect()
}

/// Project the governance partition from the convergence budget state.
///
/// `base_limit` is `None` until the turn loop pins it at the first
/// consultation; until then the entry says "unknown" rather than guessing.
pub(crate) fn project_governance_partition(
    base_limit: Option<u64>,
    extensions_used: u32,
    turns_used: usize,
) -> Vec<WorldStateEntry> {
    let at = now_ms();
    let mut limit_entry = WorldStateEntry::new(
        Partition::Governance,
        "turn_budget",
        "base_limit",
        match base_limit {
            Some(limit) => serde_json::json!(limit),
            None => serde_json::Value::Null,
        },
        Authority::Policy,
        "convergence-governor",
    )
    .with_freshness(Freshness::at(at));
    if base_limit.is_none() {
        limit_entry.status = EntryStatus::Unknown;
    }
    vec![
        limit_entry,
        WorldStateEntry::new(
            Partition::Governance,
            "turn_budget",
            "extensions_used",
            serde_json::json!(extensions_used),
            Authority::Observed,
            "convergence-governor",
        )
        .with_freshness(Freshness::at(at)),
        WorldStateEntry::new(
            Partition::Governance,
            "turn_budget",
            "turns_used",
            serde_json::json!(turns_used),
            Authority::Observed,
            "turn-loop",
        )
        .with_freshness(Freshness::at(at)),
    ]
}

/// Assemble the full projection from live session sources.
///
/// Cheap by construction: every input is an in-memory read (atomics,
/// mutexes, one hunk-tracker round trip) plus the caller-collected
/// actor-state snapshots in `extras`. Safe to call at turn boundaries.
pub(crate) async fn build_world_state(
    tool_context: &ToolContext,
    runtime_journal: &RuntimeJournalHandle,
    extras: WorldStateExtras,
) -> WorldState {
    let mut state = WorldState::new();
    let verification = runtime_journal.verification_state();

    // Execution: live gauge + resume reconciliation findings.
    for entry in project_execution_partition(
        runtime_journal.open_intent_count(),
        runtime_journal.reconciliation_report().as_deref(),
    ) {
        state.upsert(entry);
    }

    // Workspace: agent write ledger (mode-independent) + external edits
    // from the hunk tracker (empty when hunk tracking is off).
    let agent_writes: Vec<WorkspaceChange> = tool_context
        .agent_write_ledger
        .lock()
        .unwrap()
        .iter()
        .map(|(path, at)| WorkspaceChange {
            path: path.clone(),
            at: *at,
        })
        .collect();
    let cutoff = chrono::Utc::now() - chrono::Duration::seconds(120);
    let external_edits: Vec<WorkspaceChange> = tool_context
        .hunk_tracker_handle
        .get_hunks_by_source(nofy_hunk_tracker::HunkSourceFilter::External)
        .await
        .into_iter()
        .filter(|hunk| {
            matches!(
                hunk.source,
                nofy_hunk_tracker::HunkSource::ExternalEditOnAgentFile
            ) && hunk.created_at >= cutoff
        })
        .map(|hunk| WorkspaceChange {
            path: hunk.path.clone(),
            at: hunk.created_at,
        })
        .collect();
    for entry in project_workspace_partition(&agent_writes, &external_edits) {
        state.upsert(entry);
    }

    // Workspace: git-level dirty state (C1c) — user edits, untracked
    // files, anything the ledger cannot see. Cached with a TTL so the
    // per-turn build stays cheap; a scan failure projects nothing.
    if let Some(snapshot) = cached_git_dirty_snapshot(tool_context.cwd.as_path()).await {
        for entry in project_git_dirty_partition(&snapshot) {
            state.upsert(entry);
        }
    }

    // Governance: convergence budget state.
    let base_limit = *tool_context.convergence_base_limit.lock().unwrap();
    let extensions_used = *tool_context.convergence_extensions_used.lock().unwrap();
    let turns_used = *tool_context.prompt_index.lock().await;
    for entry in project_governance_partition(base_limit, extensions_used, turns_used) {
        state.upsert(entry);
    }

    // Task: goal, pending work, completion evidence.
    for entry in project_task_partition(&extras, verification) {
        state.upsert(entry);
    }

    // Agent: active subagent workers + goal assignment.
    for entry in project_agent_partition(&extras) {
        state.upsert(entry);
    }

    // Knowledge: reconciliation facts + verification evidence.
    for entry in project_knowledge_partition(
        runtime_journal.reconciliation_report().as_deref(),
        verification,
    ) {
        state.upsert(entry);
    }
    // Conflicts need the assembled state (shadowed challengers), so they
    // are projected last.
    for entry in project_knowledge_conflicts(&state) {
        state.upsert(entry);
    }

    state
}

/// Render a compact, deterministic current-state frame for model-context
/// injection (RTAgent Phase C2).
///
/// The frame is a slice of reality the system maintains independently of
/// the chat text: active tool intents, changed resources, and budget
/// state. Partitions with nothing to report are omitted — absence of
/// evidence is never rendered as a confirmed negative, except for the
/// open-intent gauge, whose unobservability is itself the signal.
pub(crate) fn render_world_state_frame(state: &WorldState) -> String {
    let mut lines: Vec<String> = Vec::new();

    // Execution: gauge first, then per-intent reality claims.
    let execution = state.partition_entries(Partition::Execution);
    if !execution.is_empty() {
        let mut parts: Vec<String> = Vec::new();
        for entry in &execution {
            match entry.predicate.as_str() {
                "open_count" => {
                    if entry.status == EntryStatus::Unavailable {
                        parts.push(
                            "open tool intents: unobservable (runtime journal inactive)"
                                .to_string(),
                        );
                    } else {
                        parts.push(format!("open tool intents: {}", entry.value));
                    }
                }
                "possibly_running" => {
                    parts.push(format!(
                        "possibly still running: {} ({})",
                        tool_of(entry),
                        short_id(&entry.subject)
                    ));
                }
                "outcome_unknown" => {
                    parts.push(format!(
                        "outcome unknown: {} ({})",
                        tool_of(entry),
                        short_id(&entry.subject)
                    ));
                }
                _ => {}
            }
        }
        if !parts.is_empty() {
            lines.push(format!("execution: {}", parts.join("; ")));
        }
    }

    // Workspace: agent-written count + latest, then external edits.
    let workspace = state.partition_entries(Partition::Workspace);
    if !workspace.is_empty() {
        let written: Vec<&WorldStateEntry> = workspace
            .iter()
            .filter(|e| e.predicate == "agent_written")
            .cloned()
            .collect();
        let external: Vec<&WorldStateEntry> = workspace
            .iter()
            .filter(|e| e.predicate == "externally_modified")
            .cloned()
            .collect();
        let git_dirty: Vec<&WorldStateEntry> = workspace
            .iter()
            .filter(|e| e.predicate == "git_dirty")
            .cloned()
            .collect();
        let mut parts: Vec<String> = Vec::new();
        if !written.is_empty() {
            // Entries are sorted by subject; freshness order is carried in
            // the value. Pick the most recently written for the headline.
            let latest = written
                .iter()
                .max_by_key(|e| e.freshness.observed_at_ms)
                .map(|e| e.subject.clone())
                .unwrap_or_default();
            parts.push(format!(
                "{} agent-written file(s), latest {}",
                written.len(),
                latest
            ));
        }
        if !external.is_empty() {
            let paths: Vec<&str> = external.iter().map(|e| e.subject.as_str()).collect();
            parts.push(format!("externally modified: {}", paths.join(", ")));
        }
        if !git_dirty.is_empty() {
            // Compact: count + first paths; the full list lives in the
            // partition, the frame only needs the signal.
            let shown: Vec<&str> = git_dirty
                .iter()
                .take(5)
                .map(|e| e.subject.as_str())
                .collect();
            let more = git_dirty.len().saturating_sub(shown.len());
            parts.push(format!(
                "git dirty: {} file(s){}{}",
                git_dirty.len(),
                if shown.is_empty() {
                    String::new()
                } else {
                    format!(" ({})", shown.join(", "))
                },
                if more > 0 {
                    format!(", +{more} more")
                } else {
                    String::new()
                }
            ));
        }
        if !parts.is_empty() {
            lines.push(format!("workspace: {}", parts.join("; ")));
        }
    }

    // Governance: budget state.
    let governance = state.partition_entries(Partition::Governance);
    if !governance.is_empty() {
        let base_limit = governance
            .iter()
            .find(|e| e.predicate == "base_limit")
            .map(|e| {
                if e.status == EntryStatus::Unknown {
                    "base limit unknown".to_string()
                } else {
                    format!("base limit {}", e.value)
                }
            });
        let extensions = governance
            .iter()
            .find(|e| e.predicate == "extensions_used")
            .map(|e| format!("extensions used {}", e.value));
        let turns = governance
            .iter()
            .find(|e| e.predicate == "turns_used")
            .map(|e| format!("turns used {}", e.value));
        let parts: Vec<String> = [base_limit, extensions, turns]
            .into_iter()
            .flatten()
            .collect();
        if !parts.is_empty() {
            lines.push(format!("governance: turn budget — {}", parts.join(", ")));
        }
    }

    // Task: goal, pending work, completion evidence.
    let task = state.partition_entries(Partition::Task);
    if !task.is_empty() {
        let mut parts: Vec<String> = Vec::new();
        for entry in &task {
            match entry.predicate.as_str() {
                "active_goal" => {
                    let objective = entry
                        .value
                        .get("objective")
                        .and_then(|v| v.as_str())
                        .unwrap_or("(unknown)");
                    let status = entry
                        .value
                        .get("status")
                        .and_then(|v| v.as_str())
                        .unwrap_or("");
                    parts.push(format!("goal: {objective} [{status}]"));
                }
                "completion_evidence" => {
                    let verdict = entry
                        .evidence
                        .first()
                        .and_then(|e| e.strip_prefix("verdict:"))
                        .unwrap_or("unknown");
                    parts.push(format!("completion evidence: {verdict}"));
                }
                _ => {}
            }
        }
        let pending = task
            .iter()
            .filter(|e| e.predicate == "pending_work")
            .count();
        if pending > 0 {
            parts.push(format!("{pending} pending work item(s)"));
        }
        if !parts.is_empty() {
            lines.push(format!("task: {}", parts.join("; ")));
        }
    }

    // Agent: active workers.
    let agent = state.partition_entries(Partition::Agent);
    if !agent.is_empty() {
        let workers: Vec<String> = agent
            .iter()
            .filter(|e| e.predicate == "active_worker")
            .take(5)
            .map(|e| {
                let agent_type = e
                    .value
                    .get("type")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown");
                format!("{agent_type} ({})", short_id(&e.subject))
            })
            .collect();
        let assignments = agent.iter().filter(|e| e.predicate == "assignment").count();
        let mut parts: Vec<String> = Vec::new();
        if !workers.is_empty() {
            parts.push(format!("active workers: {}", workers.join(", ")));
        }
        if assignments > 0 {
            parts.push(format!("{assignments} goal assignment(s)"));
        }
        if !parts.is_empty() {
            lines.push(format!("agent: {}", parts.join("; ")));
        }
    }

    // Knowledge: conflicts only surface in the frame when they exist —
    // facts and evidence back the other lines already.
    let knowledge = state.partition_entries(Partition::Knowledge);
    let conflicts = knowledge
        .iter()
        .filter(|e| e.predicate == "conflict")
        .count();
    if conflicts > 0 {
        lines.push(format!(
            "knowledge: {conflicts} unresolved authority conflict(s)"
        ));
    }

    if lines.is_empty() {
        return String::new();
    }
    format!(
        "World state (runtime-maintained observation; may correct chat context):\n{}",
        lines.join("\n")
    )
}

/// First 8 chars of an entry id, for compact frame references.
fn short_id(id: &str) -> String {
    id.chars().take(8).collect()
}

/// The `tool` field of a reconciliation entry's value, or `"unknown"`.
fn tool_of(entry: &WorldStateEntry) -> String {
    entry
        .value
        .get("tool")
        .and_then(|t| t.as_str())
        .unwrap_or("unknown")
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_session_journal::{IntentClass, ReconciledIntent};
    use serde_json::json;

    fn change(path: &str, secs: i64) -> WorkspaceChange {
        WorkspaceChange {
            path: std::path::PathBuf::from(path),
            at: chrono::DateTime::from_timestamp(secs, 0).unwrap(),
        }
    }

    #[test]
    fn execution_gauge_distinguishes_zero_from_unobservable() {
        // Active journal observing zero open intents: observed zero.
        let entries = project_execution_partition(Some(0), None);
        let gauge = entries
            .iter()
            .find(|e| e.predicate == "open_count")
            .unwrap();
        assert_eq!(gauge.value, json!(0));
        assert_eq!(gauge.authority, Authority::Observed);
        assert_eq!(gauge.status, EntryStatus::Observed);

        // Inactive journal: no observation — never projected as zero.
        let entries = project_execution_partition(None, None);
        let gauge = entries
            .iter()
            .find(|e| e.predicate == "open_count")
            .unwrap();
        assert_eq!(gauge.value, serde_json::Value::Null);
        assert_eq!(gauge.status, EntryStatus::Unavailable);
    }

    #[test]
    fn execution_projects_only_reality_claims_from_reconciliation() {
        let report = ReconciliationReport {
            open_total: 3,
            read_only: 1,
            unknown_outcome: 1,
            possibly_running: 1,
            intents: vec![
                ReconciledIntent {
                    intent_id: "i1".into(),
                    seq: 5,
                    tool: Some("read_file".into()),
                    class: IntentClass::ReadOnly,
                },
                ReconciledIntent {
                    intent_id: "i2".into(),
                    seq: 6,
                    tool: Some("bash".into()),
                    class: IntentClass::PossiblyRunning,
                },
                ReconciledIntent {
                    intent_id: "i3".into(),
                    seq: 7,
                    tool: None,
                    class: IntentClass::SideEffectUnknown,
                },
            ],
        };
        let entries = project_execution_partition(Some(3), Some(&report));
        // Gauge + 2 reality claims; the read-only bookkeeping intent is
        // not projected.
        assert_eq!(entries.len(), 3);
        let running = entries
            .iter()
            .find(|e| e.predicate == "possibly_running")
            .unwrap();
        assert_eq!(running.subject, "i2");
        assert_eq!(running.authority, Authority::Inferred);
        assert_eq!(running.source_sequence, Some(6));
        let unknown = entries
            .iter()
            .find(|e| e.predicate == "outcome_unknown")
            .unwrap();
        assert_eq!(unknown.subject, "i3");
    }

    #[test]
    fn workspace_projects_writes_and_external_edits() {
        let writes = vec![change("/a.rs", 100), change("/b.rs", 200)];
        let external = vec![change("/a.rs", 300)];
        let entries = project_workspace_partition(&writes, &external);
        assert_eq!(entries.len(), 3);
        let a_written = entries
            .iter()
            .find(|e| e.subject == "/a.rs" && e.predicate == "agent_written")
            .unwrap();
        assert_eq!(a_written.authority, Authority::Observed);
        assert_eq!(a_written.value, json!({ "at_ms": 100_000 }));
        let a_external = entries
            .iter()
            .find(|e| e.predicate == "externally_modified")
            .unwrap();
        assert_eq!(a_external.subject, "/a.rs");
    }

    #[test]
    fn workspace_caps_at_most_recent_entries() {
        let writes: Vec<WorkspaceChange> = (0..(MAX_WORKSPACE_ENTRIES + 10) as i64)
            .map(|i| change(&format!("/f{i:02}.rs"), 1000 + i))
            .collect();
        let entries = project_workspace_partition(&writes, &[]);
        assert_eq!(entries.len(), MAX_WORKSPACE_ENTRIES);
        // The oldest ten (f00–f09) were dropped; the newest survived.
        let subjects: Vec<&str> = entries.iter().map(|e| e.subject.as_str()).collect();
        assert!(subjects.contains(&"/f59.rs"));
        assert!(!subjects.contains(&"/f09.rs"));
    }

    #[test]
    fn governance_marks_unpinned_budget_unknown() {
        let entries = project_governance_partition(None, 0, 3);
        let limit = entries
            .iter()
            .find(|e| e.predicate == "base_limit")
            .unwrap();
        assert_eq!(limit.status, EntryStatus::Unknown);
        assert_eq!(limit.value, serde_json::Value::Null);
        let turns = entries
            .iter()
            .find(|e| e.predicate == "turns_used")
            .unwrap();
        assert_eq!(turns.value, json!(3));
        assert_eq!(turns.authority, Authority::Observed);

        let entries = project_governance_partition(Some(40), 2, 44);
        let limit = entries
            .iter()
            .find(|e| e.predicate == "base_limit")
            .unwrap();
        assert_eq!(limit.value, json!(40));
        assert_eq!(limit.authority, Authority::Policy);
        assert_eq!(limit.status, EntryStatus::Observed);
        let ext = entries
            .iter()
            .find(|e| e.predicate == "extensions_used")
            .unwrap();
        assert_eq!(ext.value, json!(2));
    }

    #[test]
    fn frame_renders_all_three_partitions() {
        let mut state = WorldState::new();
        for entry in project_execution_partition(Some(2), None) {
            state.upsert(entry);
        }
        for entry in project_workspace_partition(
            &[change("/a.rs", 100), change("/b.rs", 200)],
            &[change("/a.rs", 300)],
        ) {
            state.upsert(entry);
        }
        for entry in project_governance_partition(Some(40), 1, 41) {
            state.upsert(entry);
        }
        let frame = render_world_state_frame(&state);
        assert!(frame.starts_with("World state (runtime-maintained observation"));
        assert!(frame.contains("execution: open tool intents: 2"));
        assert!(frame.contains("2 agent-written file(s), latest /b.rs"));
        assert!(frame.contains("externally modified: /a.rs"));
        assert!(
            frame.contains(
                "governance: turn budget — base limit 40, extensions used 1, turns used 41"
            )
        );
    }

    #[test]
    fn frame_marks_unobservable_gauge_and_unknown_budget() {
        let mut state = WorldState::new();
        for entry in project_execution_partition(None, None) {
            state.upsert(entry);
        }
        for entry in project_governance_partition(None, 0, 3) {
            state.upsert(entry);
        }
        let frame = render_world_state_frame(&state);
        assert!(frame.contains("open tool intents: unobservable (runtime journal inactive)"));
        assert!(frame.contains("base limit unknown"));
    }

    #[test]
    fn frame_is_deterministic_and_empty_state_renders_nothing() {
        assert_eq!(render_world_state_frame(&WorldState::new()), "");
        let mut a = WorldState::new();
        let mut b = WorldState::new();
        for entry in project_governance_partition(Some(40), 0, 1) {
            a.upsert(entry.clone());
            b.upsert(entry);
        }
        // Entry ids differ between a and b, but governance rendering does
        // not mention ids, so frames must match.
        assert_eq!(render_world_state_frame(&a), render_world_state_frame(&b));
    }

    #[test]
    fn frame_renders_reconciliation_reality_claims() {
        let report = ReconciliationReport {
            open_total: 2,
            read_only: 0,
            unknown_outcome: 1,
            possibly_running: 1,
            intents: vec![
                ReconciledIntent {
                    intent_id: "0192f3a4-b5c6-7d8e-9f00-112233445566".into(),
                    seq: 6,
                    tool: Some("bash".into()),
                    class: IntentClass::PossiblyRunning,
                },
                ReconciledIntent {
                    intent_id: "0192f3a4-0000-0000-0000-000000000000".into(),
                    seq: 7,
                    tool: None,
                    class: IntentClass::SideEffectUnknown,
                },
            ],
        };
        let mut state = WorldState::new();
        for entry in project_execution_partition(Some(2), Some(&report)) {
            state.upsert(entry);
        }
        let frame = render_world_state_frame(&state);
        assert!(frame.contains("possibly still running: bash (0192f3a4)"));
        assert!(frame.contains("outcome unknown: unknown (0192f3a4)"));
    }

    #[test]
    fn git_dirty_projection_uses_external_authority_and_caps() {
        let snapshot = GitDirtySnapshot {
            paths: (0..(MAX_WORKSPACE_ENTRIES + 5))
                .map(|i| format!("f{i:02}.rs"))
                .collect(),
            truncated: true,
            scanned_at_ms: 500,
        };
        let entries = project_git_dirty_partition(&snapshot);
        assert_eq!(entries.len(), MAX_WORKSPACE_ENTRIES);
        let first = &entries[0];
        assert_eq!(first.predicate, "git_dirty");
        assert_eq!(first.authority, Authority::External);
        assert_eq!(first.source, "git-status");
        assert_eq!(first.freshness.observed_at_ms, 500);
        assert_eq!(first.value, json!({ "truncated_scan": true }));
    }

    #[test]
    fn frame_renders_git_dirty_line_compact() {
        let snapshot = GitDirtySnapshot {
            paths: (0..8).map(|i| format!("src/f{i}.rs")).collect(),
            truncated: false,
            scanned_at_ms: 500,
        };
        let mut state = WorldState::new();
        for entry in project_git_dirty_partition(&snapshot) {
            state.upsert(entry);
        }
        let frame = render_world_state_frame(&state);
        assert!(frame.contains("git dirty: 8 file(s)"));
        // First five shown, remainder counted.
        assert!(frame.contains("src/f0.rs"));
        assert!(frame.contains("src/f4.rs"));
        assert!(frame.contains("+3 more"));
        assert!(!frame.contains("src/f5.rs"));
    }

    #[tokio::test]
    async fn scan_git_dirty_sees_modified_and_untracked() {
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path();
        nofy_test_utils::git::run_git(root, &["init"]);
        nofy_test_utils::git::run_git(root, &["config", "user.email", "t@t"]);
        nofy_test_utils::git::run_git(root, &["config", "user.name", "t"]);
        std::fs::write(root.join("committed.txt"), "base\n").unwrap();
        nofy_test_utils::git::run_git(root, &["add", "."]);
        nofy_test_utils::git::run_git(root, &["commit", "-m", "seed"]);
        // One modification, one untracked file.
        std::fs::write(root.join("committed.txt"), "dirty\n").unwrap();
        std::fs::write(root.join("new_file.txt"), "untracked\n").unwrap();

        let snapshot = scan_git_dirty(root).expect("scan should succeed");
        assert!(
            snapshot.paths.iter().any(|p| p == "committed.txt"),
            "modified file must be dirty: {:?}",
            snapshot.paths
        );
        assert!(
            snapshot.paths.iter().any(|p| p == "new_file.txt"),
            "untracked file must be dirty: {:?}",
            snapshot.paths
        );
        assert!(!snapshot.truncated);
    }

    #[tokio::test]
    async fn cached_snapshot_misses_outside_git_worktree() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(
            cached_git_dirty_snapshot(tmp.path()).await.is_none(),
            "a non-git directory has no dirty state to observe"
        );
    }

    fn extras_fixture() -> WorldStateExtras {
        WorldStateExtras {
            goal: Some(GoalSnapshot {
                goal_id: "g1".into(),
                objective: "refactor the parser".into(),
                status: "Active".into(),
                phase: "Executing".into(),
                current_subagent_id: Some("sub-1".into()),
                current_subagent_role: Some("worker".into()),
            }),
            todos: vec![
                TodoSnapshot {
                    content: "write tests".into(),
                    status: "pending".into(),
                },
                TodoSnapshot {
                    content: "old item".into(),
                    status: "completed".into(),
                },
                TodoSnapshot {
                    content: "fix bug".into(),
                    status: "in_progress".into(),
                },
            ],
            subagents: vec![SubagentSnapshot {
                id: "sub-1".into(),
                agent_type: "general-purpose".into(),
                description: "refactoring".into(),
                elapsed_ms: 12_000,
            }],
        }
    }

    #[test]
    fn task_partition_projects_goal_open_todos_and_evidence() {
        use nofy_session_journal::VerificationState;
        let extras = extras_fixture();
        let entries = project_task_partition(
            &extras,
            Some(VerificationState::Unverified {
                last_mutation_seq: 7,
            }),
        );
        let goal = entries
            .iter()
            .find(|e| e.predicate == "active_goal")
            .unwrap();
        assert_eq!(goal.subject, "g1");
        assert_eq!(goal.value["objective"], "refactor the parser");
        assert_eq!(goal.authority, Authority::Observed);

        // The completed todo is history, not current reality.
        let pending: Vec<_> = entries
            .iter()
            .filter(|e| e.predicate == "pending_work")
            .collect();
        assert_eq!(pending.len(), 2);
        let contents: Vec<&str> = pending
            .iter()
            .map(|e| e.value["content"].as_str().unwrap())
            .collect();
        assert!(contents.contains(&"write tests"));
        assert!(contents.contains(&"fix bug"));

        let evidence = entries
            .iter()
            .find(|e| e.predicate == "completion_evidence")
            .unwrap();
        assert_eq!(evidence.value["last_mutation_seq"], 7);
        assert_eq!(evidence.status, EntryStatus::Inferred);
        assert_eq!(evidence.evidence, vec!["verdict:unverified"]);
    }

    #[test]
    fn task_partition_without_journal_observation_has_no_evidence_entry() {
        let extras = extras_fixture();
        let entries = project_task_partition(&extras, None);
        assert!(
            entries.iter().all(|e| e.predicate != "completion_evidence"),
            "no observation means no evidence entry — never a fabricated verdict"
        );
    }

    #[test]
    fn agent_partition_projects_workers_and_assignment() {
        let extras = extras_fixture();
        let entries = project_agent_partition(&extras);
        let worker = entries
            .iter()
            .find(|e| e.predicate == "active_worker")
            .unwrap();
        assert_eq!(worker.subject, "sub-1");
        assert_eq!(worker.value["type"], "general-purpose");
        assert_eq!(worker.value["elapsed_ms"], 12_000);
        assert_eq!(worker.source, "subagent-coordinator");

        let assignment = entries
            .iter()
            .find(|e| e.predicate == "assignment")
            .unwrap();
        assert_eq!(assignment.subject, "sub-1");
        assert_eq!(assignment.value["goal_id"], "g1");
        assert_eq!(assignment.value["role"], "worker");
    }

    #[test]
    fn knowledge_partition_projects_facts_evidence_and_conflicts() {
        use nofy_session_journal::{IntentClass, ReconciledIntent, VerificationState};
        let report = ReconciliationReport {
            open_total: 1,
            read_only: 0,
            unknown_outcome: 1,
            possibly_running: 0,
            intents: vec![ReconciledIntent {
                intent_id: "i1".into(),
                seq: 5,
                tool: None,
                class: IntentClass::SideEffectUnknown,
            }],
        };
        let entries = project_knowledge_partition(
            Some(&report),
            Some(VerificationState::Verified {
                last_mutation_seq: 3,
                verification_seq: 6,
            }),
        );
        let fact = entries
            .iter()
            .find(|e| e.predicate == "known_fact")
            .unwrap();
        assert_eq!(fact.authority, Authority::Inferred);
        assert_eq!(fact.value["unknown_outcome"], 1);
        let evidence = entries.iter().find(|e| e.predicate == "evidence").unwrap();
        assert_eq!(evidence.value["verification_seq"], 6);

        // Conflicts come from shadowed challengers of a built state.
        let mut state = WorldState::new();
        state.upsert(WorldStateEntry::new(
            Partition::Workspace,
            "/a.rs",
            "modified",
            json!(true),
            Authority::Observed,
            "test",
        ));
        let challenger = WorldStateEntry::new(
            Partition::Workspace,
            "/a.rs",
            "modified",
            json!(false),
            Authority::Inferred,
            "test",
        );
        state.upsert(challenger);
        let conflicts = project_knowledge_conflicts(&state);
        assert_eq!(conflicts.len(), 1);
        assert_eq!(conflicts[0].predicate, "conflict");
        assert_eq!(conflicts[0].status, EntryStatus::Conflicted);
        assert_eq!(conflicts[0].value, json!(false));
    }

    #[test]
    fn frame_renders_task_agent_and_conflict_lines() {
        let mut state = WorldState::new();
        let extras = extras_fixture();
        for entry in project_task_partition(&extras, None) {
            state.upsert(entry);
        }
        for entry in project_agent_partition(&extras) {
            state.upsert(entry);
        }
        for entry in project_knowledge_conflicts(&state) {
            state.upsert(entry);
        }
        let frame = render_world_state_frame(&state);
        assert!(frame.contains("task: goal: refactor the parser [Active]"));
        assert!(frame.contains("2 pending work item(s)"));
        assert!(frame.contains("agent: active workers: general-purpose (sub-1)"));
        assert!(frame.contains("1 goal assignment(s)"));
        // No conflicts in this state → no knowledge line.
        assert!(!frame.contains("knowledge:"));
    }

    #[test]
    fn assembled_state_keys_are_unique_per_source() {
        let mut state = WorldState::new();
        for entry in project_execution_partition(Some(1), None) {
            state.upsert(entry);
        }
        for entry in project_governance_partition(Some(40), 0, 1) {
            state.upsert(entry);
        }
        // gauge + 3 governance entries
        assert_eq!(state.len(), 4);
        assert_eq!(state.partition_entries(Partition::Execution).len(), 1);
        assert_eq!(state.partition_entries(Partition::Governance).len(), 3);
    }
}
