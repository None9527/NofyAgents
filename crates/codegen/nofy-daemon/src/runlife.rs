//! Run lifecycle glue (batch T extraction out of `daemon.rs`): what a
//! validated run IS, how it is built at submit, and how it is rebuilt
//! after a restart. The wire protocol (`serve_connection`) stays in
//! `daemon.rs` and re-exports these so every existing path keeps working.

/// One validated run: orchestration state + the pack compositions the plan
/// was checked against (FR10 join integration).
pub struct DaemonRun {
    pub orch: crate::orchestra::OrchRun,
    pub packs: std::collections::BTreeMap<String, crate::pack::PackManifest>,
    /// P2 DAG engine (FR11.6, Q3 wiring): structural authority over the
    /// dependency shape, built fail-loud at submit.
    pub dag: nofy_orchestra::dag::Dag,
    /// `task.*` journal events (FR11.5, Q3 wiring): dense-seq lifecycle
    /// log; the fold reconciles after a crash.
    pub journal: Vec<nofy_orchestra::taskjournal::TaskEvent>,
    /// Durable journal sink (R2 wiring): None = in-memory only.
    journal_store: Option<nofy_orchestra::taskjournal::TaskLogStore>,
}

impl DaemonRun {
    /// Next dense journal seq.
    fn next_seq(&self) -> u64 {
        self.journal.last().map(|e| e.seq()).unwrap_or(0) + 1
    }

    /// Attach the durable sink (R2): existing in-memory events are
    /// flushed to disk first, later events append to both.
    pub fn attach_journal(
        &mut self,
        store: nofy_orchestra::taskjournal::TaskLogStore,
    ) -> std::io::Result<()> {
        for event in &self.journal {
            store.append(event)?;
        }
        self.journal_store = Some(store);
        Ok(())
    }

    /// Record one lifecycle event: in-memory journal + durable sink. A
    /// disk failure is logged loud (durability degraded), never silent,
    /// and never crashes the run.
    pub(crate) fn record_event(&mut self, event: nofy_orchestra::taskjournal::TaskEvent) {
        if let Some(store) = &self.journal_store {
            if let Err(e) = store.append(&event) {
                tracing::error!(?e, "task journal append failed; durability degraded");
            }
        }
        self.journal.push(event);
    }

    /// Crash reconciliation (AC-11, Q3 wiring): tasks armed/claimed but
    /// never settled must be re-dispatched.
    pub fn re_dispatch(&self) -> Vec<String> {
        nofy_orchestra::taskjournal::re_dispatch_list(&nofy_orchestra::taskjournal::fold_tasks(
            &self.journal,
        ))
    }

    /// Next dense seq, for the wire layer that journals claims/settles.
    pub(crate) fn journal_next_seq(&self) -> u64 {
        self.next_seq()
    }
}

/// Durable stores the control plane wires into a run (R2/S wiring), plus
/// the daemon-level scheduler service (batch U: recovered from its durable
/// log at boot; a non-empty log proves prior enablement).
#[derive(Debug, Clone)]
pub struct DaemonStores {
    /// task.* journal sink (R2).
    pub journal: nofy_orchestra::taskjournal::TaskLogStore,
    /// run plan store (S).
    pub runs: crate::runstore::RunStore,
    /// scheduling service shared across connections (U).
    pub scheduler: std::sync::Arc<std::sync::Mutex<crate::scheduler::SchedulerService>>,
}

/// Validate a submitted plan+packs (FR10): orchestration DAG, pack plane
/// ownership (DS-P4), realm isolation (DS-P2), and pack coverage of every
/// task. Packs are optional at protocol level (the provider resolves them
/// locally); when present, they are checked fail-loud.
pub fn submit_run(
    manifest: &str,
    packs: &[serde_json::Value],
) -> Result<(DaemonRun, u32), String> {
    let m = crate::orchestra::ProjectManifest::from_toml(manifest)
        .map_err(|e| format!("orchestration: {e:?}"))?;
    let mut pack_map = std::collections::BTreeMap::new();
    if !packs.is_empty() {
        let mut parsed = Vec::new();
        for raw in packs {
            let pm = crate::pack::parse_pack(raw).map_err(|e| format!("pack: {e:?}"))?;
            parsed.push(pm);
        }
        crate::pack::compose_packs(&parsed).map_err(|e| format!("compose: {e:?}"))?;
        for pm in &parsed {
            pack_map.insert(pm.id.clone(), pm.clone());
        }
        for t in &m.task {
            if !pack_map.contains_key(&t.pack) {
                return Err(format!("task {} references undeclared pack {}", t.id, t.pack));
            }
        }
    }
    let total = m.task.len() as u32;

    // Q3 wiring (FR11.6): build the P2 DAG engine's view of the same
    // dependency shape, fail-loud. Per-task on_fail comes from the
    // manifest's per-task `retry` budget: retry>0 = Retry, else the
    // manifest-level on_fail (Escalate/Skip).
    let dag_tasks: Vec<nofy_orchestra::dag::DagTask> = m
        .task
        .iter()
        .map(|t| nofy_orchestra::dag::DagTask {
            id: t.id.clone(),
            needs: t.needs.clone(),
            on_fail: if t.retry > 0 {
                nofy_orchestra::dag::OnFailPolicy::Retry { attempts: t.retry }
            } else {
                match m.on_fail {
                    crate::orchestra::OnFail::Escalate => nofy_orchestra::dag::OnFailPolicy::Escalate,
                    crate::orchestra::OnFail::Skip => nofy_orchestra::dag::OnFailPolicy::Skip,
                }
            },
        })
        .collect();
    let dag = nofy_orchestra::dag::Dag::build(dag_tasks).map_err(|e| format!("dag: {e:?}"))?;

    // Q3 wiring (FR11.5): arm every task in the journal at submit so a
    // crash before any dispatch still reconciles the full run.
    let journal: Vec<nofy_orchestra::taskjournal::TaskEvent> = m
        .task
        .iter()
        .enumerate()
        .map(|(i, t)| nofy_orchestra::taskjournal::TaskEvent::Armed {
            seq: (i + 1) as u64,
            task: t.id.clone(),
            run: "submit".into(),
        })
        .collect();

    Ok((
        DaemonRun {
            orch: crate::orchestra::OrchRun::new(m),
            packs: pack_map,
            dag,
            journal,
            journal_store: None,
        },
        total,
    ))
}

/// Rebuild the run after a restart (S wiring): the PLAN reloads from the
/// run store, PROGRESS replays from the durable task journal through the
/// core replay fold (FR11.3) — same journal = same state, deterministically.
/// Returns `None` when nothing is stored (fresh boot).
pub fn resume_run(stores: &DaemonStores) -> Result<Option<DaemonRun>, String> {
    let Some(stored) = stores.runs.load().map_err(|e| format!("run store: {e}"))? else {
        return Ok(None);
    };
    let (mut dr, _) = submit_run(&stored.manifest_toml, &stored.packs)?;
    let events = stores
        .journal
        .read_events()
        .map_err(|e| format!("task journal: {e}"))?;
    // Map the task.* journal onto the replay engine's event vocabulary:
    // claimed = dispatched, settled/resolved carry over; armed/escalated
    // have no replay counterpart (armed precedes dispatch; escalation is
    // implied by a failed settle under the manifest policy).
    let orch_events: Vec<nofy_orchestra::replay::OrchEvent> = events
        .iter()
        .filter_map(|event| match event {
            nofy_orchestra::taskjournal::TaskEvent::Claimed { task, .. } => {
                Some(nofy_orchestra::replay::OrchEvent::Dispatched { task: task.clone() })
            }
            nofy_orchestra::taskjournal::TaskEvent::Settled { task, ok, .. } => {
                Some(nofy_orchestra::replay::OrchEvent::Settled { task: task.clone(), ok: *ok })
            }
            nofy_orchestra::taskjournal::TaskEvent::EscalationResolved { task, allow, .. } => {
                Some(nofy_orchestra::replay::OrchEvent::EscalationResolved {
                    task: task.clone(),
                    allow: *allow,
                })
            }
            _ => None,
        })
        .collect();
    let replay = nofy_orchestra::replay::fold_orch(&dr.orch.manifest, &orch_events);
    dr.orch.succeeded = replay.succeeded;
    dr.orch.dead = replay.dead;
    dr.orch.aborted = replay.aborted;
    // Unfinished work — in flight, or awaiting an escalation decision —
    // re-arms as running so the provider re-drives it.
    dr.orch.running = replay.running;
    for task in replay.escalated {
        dr.orch.running.insert(task);
    }
    dr.journal = events; // the disk log is the journal truth
    Ok(Some(dr))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn submit_builds_p2_dag_and_arms_the_journal() {
        // Q3 wiring: submit compiles the manifest through the P2 DAG
        // engine (fail-loud) and arms every task in the task journal.
        let manifest = r#"
packs = ["p"]

[[task]]
id = "t1"
pack = "p"
goal = "first"
retry = 2

[[task]]
id = "t2"
pack = "p"
goal = "second"
needs = ["t1"]
"#;
        let (dr, total) = submit_run(manifest, &[]).unwrap();
        assert_eq!(total, 2);
        assert_eq!(dr.dag.tasks.len(), 2, "P2 DAG engine owns the dependency shape");
        // Per-task on_fail mapping: retry=2 → Retry{2}; retry=0 + default
        // on_fail=escalate → Escalate.
        let t1 = dr.dag.tasks.iter().find(|t| t.id == "t1").unwrap();
        assert_eq!(t1.on_fail, nofy_orchestra::dag::OnFailPolicy::Retry { attempts: 2 });
        let t2 = dr.dag.tasks.iter().find(|t| t.id == "t2").unwrap();
        assert_eq!(t2.on_fail, nofy_orchestra::dag::OnFailPolicy::Escalate);
        // Journal armed at submit: everything is reconcilable from the
        // very first instant.
        assert_eq!(dr.journal.len(), 2);
        assert_eq!(dr.re_dispatch(), vec!["t1".to_string(), "t2".to_string()]);
    }

    #[test]
    fn cyclic_manifest_still_fails_loud_under_wiring() {
        // Cycle refusal may fire in the manifest validator or the DAG
        // engine — either way submit must refuse, never accept.
        let manifest = r#"
packs = ["p"]

[[task]]
id = "a"
pack = "p"
goal = "x"
needs = ["b"]

[[task]]
id = "b"
pack = "p"
goal = "y"
needs = ["a"]
"#;
        assert!(submit_run(manifest, &[]).is_err());
    }
}
