//! Run lifecycle glue (batch T extraction out of `daemon.rs`): what a
//! validated run IS, how it is built at submit, and how it is rebuilt
//! after a restart. The wire protocol (`serve_connection`) stays in
//! `daemon.rs` and re-exports these so every existing path keeps working.

/// One validated run: orchestration state + the pack compositions the plan
/// was checked against (FR10 join integration).
pub struct DaemonRun {
    pub orch: crate::orchestra::OrchRun,
    pub packs: std::collections::BTreeMap<String, crate::pack::PackManifest>,
    /// Project routing (W-2): working directory every dispatched task is
    /// bound to; `None` leaves the provider in its own cwd.
    pub cwd: Option<String>,
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
    /// flushed to disk first, later events append to both. The store is
    /// shared across runs, so this run's seqs are offset to continue the
    /// global dense sequence — restarting at 1 would truncate the fold
    /// and hide later runs from crash reconciliation (W-6).
    pub fn attach_journal(
        &mut self,
        store: nofy_orchestra::taskjournal::TaskLogStore,
    ) -> std::io::Result<()> {
        let offset = store.read_events()?.last().map(|e| e.seq()).unwrap_or(0);
        for event in &mut self.journal {
            event.offset_seq(offset);
        }
        for event in &self.journal {
            store.append(event)?;
        }
        self.journal_store = Some(store);
        Ok(())
    }

    /// Adopt the durable sink WITHOUT flushing (resume path): the
    /// in-memory journal already mirrors the disk log, so only the sink
    /// handle is attached — post-resume events must persist too, or a
    /// second crash loses everything reconciled so far (W-6).
    pub fn adopt_journal_store(&mut self, store: nofy_orchestra::taskjournal::TaskLogStore) {
        self.journal_store = Some(store);
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
    /// W-5 trigger bridge: fired schedule runs awaiting provider pickup
    /// via TaskPoll. Entry = (schedule id, run id, goal, cwd).
    pub sched_runs: std::sync::Arc<
        std::sync::Mutex<std::collections::VecDeque<(String, u64, String, Option<String>)>>,
    >,
}

/// Validate a submitted plan+packs (FR10): orchestration DAG, pack plane
/// ownership (DS-P4), realm isolation (DS-P2), and pack coverage of every
/// task. Packs are optional at protocol level (the provider resolves them
/// locally); when present, they are checked fail-loud.
pub fn submit_run(
    manifest: &str,
    packs: &[serde_json::Value],
    cwd: Option<String>,
) -> Result<(DaemonRun, u32), String> {
    // W-2: a bound directory must exist — routing fails loud at submit,
    // never at dispatch.
    if let Some(dir) = &cwd {
        if !std::path::Path::new(dir).is_dir() {
            return Err(format!("task submit cwd '{dir}' is not a directory"));
        }
    }
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
            cwd,
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
    let (mut dr, _) = submit_run(&stored.manifest_toml, &stored.packs, stored.cwd.clone())?;
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
    // W-6: post-resume events must persist as well — adopt the sink
    // without re-flushing the log it already mirrors.
    dr.adopt_journal_store(stores.journal.clone());
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
        let (dr, total) = submit_run(manifest, &[], None).unwrap();
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
        assert!(submit_run(manifest, &[], None).is_err());
    }

    #[test]
    fn submit_rejects_task_referencing_undeclared_pack() {
        // The manifest itself names pack q (core validation passes), but no
        // pack manifest for q is provided: the daemon-side coverage check
        // refuses fail-loud.
        let manifest =
            "packs = [\"p\", \"q\"]\n\n[[task]]\nid = \"t1\"\npack = \"q\"\ngoal = \"g\"\n";
        let pack = serde_json::json!({"id": "p", "persona": "x"});
        let Err(err) = submit_run(manifest, &[pack], None) else { panic!("task referencing an undeclared pack must be refused") };
        assert!(
            err.contains("undeclared pack"),
            "pack coverage is checked fail-loud: {err}"
        );
    }

    #[test]
    fn record_event_degrades_loud_on_disk_failure() {
        // A failing durable sink never crashes the run: the event stays in
        // the in-memory journal, durability degrades loud (log line).
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("task_journal.jsonl")).unwrap();
        let manifest = "packs = [\"p\"]\n\n[[task]]\nid = \"t1\"\npack = \"p\"\ngoal = \"g\"\n";
        let (mut dr, _) = submit_run(manifest, &[], None).unwrap();
        dr.journal_store = Some(nofy_orchestra::taskjournal::TaskLogStore::open(
            dir.path().join("task_journal.jsonl"),
        ));
        let before = dr.journal.len();
        dr.record_event(nofy_orchestra::taskjournal::TaskEvent::Claimed {
            seq: dr.journal_next_seq(),
            task: "t1".into(),
            claimant: "provider".into(),
        });
        assert_eq!(dr.journal.len(), before + 1, "the run keeps its journal");
    }

    fn stores_at(dir: &std::path::Path) -> DaemonStores {
        DaemonStores {
            journal: nofy_orchestra::taskjournal::TaskLogStore::open(
                dir.join("task_journal.jsonl"),
            ),
            runs: crate::runstore::RunStore::open(dir.join("run_store.json")),
            scheduler: std::sync::Arc::new(std::sync::Mutex::new(
                crate::scheduler::SchedulerService::new(),
            )),
            sched_runs: std::sync::Arc::new(std::sync::Mutex::new(
                std::collections::VecDeque::new(),
            )),
        }
    }

    const ONE_TASK: &str =
        "packs = [\"p\"]\n\n[[task]]\nid = \"t1\"\npack = \"p\"\ngoal = \"g\"\n";

    #[test]
    fn resume_replays_a_resolved_escalation_to_completion() {
        // The journal carries the escalation all the way to an ALLOWED
        // resolution: resume replays it into a finished run.
        use nofy_orchestra::taskjournal::TaskEvent;
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        stores
            .runs
            .save(&crate::runstore::StoredRun {
                manifest_toml: ONE_TASK.into(),
                packs: vec![],
                cwd: None,
            })
            .unwrap();
        for event in [
            TaskEvent::Armed { seq: 1, task: "t1".into(), run: "submit".into() },
            TaskEvent::Claimed { seq: 2, task: "t1".into(), claimant: "provider".into() },
            TaskEvent::Settled { seq: 3, task: "t1".into(), ok: false },
            TaskEvent::Escalated { seq: 4, task: "t1".into(), reason: "failed".into() },
            TaskEvent::EscalationResolved { seq: 5, task: "t1".into(), allow: true },
        ] {
            stores.journal.append(&event).unwrap();
        }
        let dr = resume_run(&stores).unwrap().expect("stored run resumes");
        assert_eq!(dr.journal.len(), 5, "the disk log is the journal truth");
        assert!(dr.re_dispatch().is_empty(), "a resolved escalation leaves nothing to resume");
        assert!(dr.orch.is_done(), "allowed skip-and-continue completes the run");
    }

    #[test]
    fn resume_rearms_an_unresolved_escalation() {
        // The journal ends at Escalated: the task re-arms as running so the
        // provider re-drives it after the restart.
        use nofy_orchestra::taskjournal::TaskEvent;
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        stores
            .runs
            .save(&crate::runstore::StoredRun {
                manifest_toml: ONE_TASK.into(),
                packs: vec![],
                cwd: None,
            })
            .unwrap();
        for event in [
            TaskEvent::Armed { seq: 1, task: "t1".into(), run: "submit".into() },
            TaskEvent::Claimed { seq: 2, task: "t1".into(), claimant: "provider".into() },
            TaskEvent::Settled { seq: 3, task: "t1".into(), ok: false },
            TaskEvent::Escalated { seq: 4, task: "t1".into(), reason: "failed".into() },
        ] {
            stores.journal.append(&event).unwrap();
        }
        let dr = resume_run(&stores).unwrap().expect("stored run resumes");
        assert!(dr.orch.running.contains("t1"), "awaiting-decision work re-arms");
        assert!(
            dr.re_dispatch().is_empty(),
            "an escalated task awaits a decision, not a blind re-dispatch"
        );
    }

    #[test]
    fn submit_rejects_packs_that_collide_in_composition() {
        // Two services with the same name inside one pack: composition
        // refuses fail-loud before any run exists.
        let manifest = "packs = [\"p\"]\n\n[[task]]\nid = \"t1\"\npack = \"p\"\ngoal = \"g\"\n";
        let pack = serde_json::json!({
            "id": "p",
            "persona": "x",
            "services": [{"name": "s"}, {"name": "s"}],
        });
        let Err(err) = submit_run(manifest, &[pack], None) else { panic!("a realm collision must refuse the submit") };
        assert!(err.contains("compose"), "the composition failure is named: {err}");
    }

    #[test]
    fn resume_fails_loud_on_corrupt_plan_store() {
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        std::fs::write(dir.path().join("run_store.json"), "{ torn").unwrap();
        let Err(err) = resume_run(&stores) else { panic!("a torn plan store must refuse the resume") };
        assert!(err.contains("run store"), "the store failure is named: {err}");
    }

    #[test]
    fn resume_fails_loud_on_rejected_manifest() {
        // A stored plan that no longer validates (cyclic) must refuse the
        // resume, never drop to a silent fresh boot.
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        let cyclic = "packs = [\"p\"]\n\n[[task]]\nid = \"a\"\npack = \"p\"\ngoal = \"x\"\nneeds = [\"b\"]\n\n[[task]]\nid = \"b\"\npack = \"p\"\ngoal = \"y\"\nneeds = [\"a\"]\n";
        stores
            .runs
            .save(&crate::runstore::StoredRun {
                manifest_toml: cyclic.into(),
                packs: vec![],
                cwd: None,
            })
            .unwrap();
        assert!(resume_run(&stores).is_err());
    }

    #[test]
    fn resume_fails_loud_on_unreadable_journal() {
        let dir = tempfile::tempdir().unwrap();
        let mut stores = stores_at(dir.path());
        stores
            .runs
            .save(&crate::runstore::StoredRun {
                manifest_toml: ONE_TASK.into(),
                packs: vec![],
                cwd: None,
            })
            .unwrap();
        // The journal path occupied by a directory: read fails loud.
        std::fs::create_dir_all(dir.path().join("task_journal.jsonl")).unwrap();
        stores.journal =
            nofy_orchestra::taskjournal::TaskLogStore::open(dir.path().join("task_journal.jsonl"));
        let Err(err) = resume_run(&stores) else { panic!("an unreadable journal must refuse the resume") };
        assert!(err.contains("task journal"), "the journal failure is named: {err}");
    }

    #[test]
    fn second_run_arms_survive_crash_reconciliation_w6() {
        // W-6 regression: the durable log is shared across runs and the
        // fold demands globally dense seqs. A second run's events must be
        // offset to continue the sequence — restarting at 1 truncates the
        // fold and hides the second run's armed task from reconciliation.
        use nofy_orchestra::taskjournal::TaskEvent;
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());

        // Run A: full lifecycle, settles.
        let (mut dr_a, _) = submit_run(ONE_TASK, &[], None).unwrap();
        dr_a.attach_journal(stores.journal.clone()).unwrap();
        dr_a.record_event(TaskEvent::Claimed {
            seq: dr_a.journal_next_seq(),
            task: "t1".into(),
            claimant: "provider".into(),
        });
        dr_a.record_event(TaskEvent::Settled {
            seq: dr_a.journal_next_seq(),
            task: "t1".into(),
            ok: true,
        });

        // Run B: submits and arms, crashes before any claim.
        stores
            .runs
            .save(&crate::runstore::StoredRun {
                manifest_toml: ONE_TASK.replace("t1", "t2"),
                packs: vec![],
                cwd: None,
            })
            .unwrap();
        let (mut dr_b, _) = submit_run(&ONE_TASK.replace("t1", "t2"), &[], None).unwrap();
        dr_b.attach_journal(stores.journal.clone()).unwrap();
        drop(dr_b); // crash

        // Restart: reconciliation must see run B's armed task.
        let stores = stores_at(dir.path());
        let dr = resume_run(&stores).unwrap().expect("the leftover run resumes");
        assert_eq!(
            dr.re_dispatch(),
            vec!["t2".to_string()],
            "the second run's armed task must survive reconciliation \
             (dense seqs continue across runs)",
        );

        // Second half of W-6: post-resume events persist — a second crash
        // must not lose what reconciliation re-drove.
        let mut dr = dr;
        dr.record_event(TaskEvent::Claimed {
            seq: dr.journal_next_seq(),
            task: "t2".into(),
            claimant: "provider".into(),
        });
        let stores = stores_at(dir.path());
        let dr2 = resume_run(&stores).unwrap().expect("resume after the second crash");
        assert_eq!(
            dr2.re_dispatch(),
            vec!["t2".to_string()],
            "claimed-but-unsettled after resume stays reconcilable",
        );
    }
}
