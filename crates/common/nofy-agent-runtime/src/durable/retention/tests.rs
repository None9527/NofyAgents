use super::*;
use crate::{
    ToolCall, ToolCatalog, ToolEntry,
    program::*,
    registry::*,
    supervisor::{RunSupervisor, jobs::ProgramSubmission},
    tool_program::*,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::json;
use std::sync::atomic::{AtomicUsize, Ordering};
#[path = "tests/admission.rs"]
mod admission;
struct Plus(Arc<AtomicUsize>);
impl Tool for Plus {
    type Args = serde_json::Value;
    type Output = serde_json::Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("plus").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("plus", "Add one")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        value: serde_json::Value,
    ) -> Result<serde_json::Value, nofy_tool_runtime::ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        let result = value
            .get("n")
            .and_then(serde_json::Value::as_u64)
            .and_then(|n| n.checked_add(1))
            .ok_or_else(|| {
                nofy_tool_runtime::ToolError::custom(
                    "input",
                    "n must be an incrementable unsigned integer",
                )
            })?;
        Ok(json!(result))
    }
}
fn program() -> (ModuleRegistry, CompiledProgram, Arc<AtomicUsize>) {
    let calls = Arc::new(AtomicUsize::new(0));
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Plus(calls.clone()))).unwrap();
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "plus-pack",
            "1",
            ModuleInstance::ToolPack(tools),
        )))
        .unwrap();
    let reference = ModuleRef::new("plus", "1");
    registry
        .define(ModuleDefinition {
            reference: reference.clone(),
            factory: "plus-pack".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    let compiled = compile_tools(
        serde_json::from_value(json!({"name":"retained-tool","tool_packs":[reference]})).unwrap(),
        &registry,
    )
    .unwrap();
    let program = CompiledProgram::for_tool(
        &compiled,
        ToolCall {
            id: "call".into(),
            name: "plus".into(),
            arguments: json!({"n":1,"payload":{"modules":[{"factory":"payload-only-pack"}]}}),
        },
    )
    .unwrap();
    (registry, program, calls)
}
async fn inventory(store: &SqliteStore) -> Result<RetentionInspection<Vec<String>>, Error> {
    store
        .inspect_retained_modules(
            RetentionLimits::default(),
            Vec::new(),
            |roots, origin, modules| {
                for module in modules {
                    if module.factory == "plus-pack" {
                        roots.push(origin.kind.clone());
                    }
                }
                Ok(())
            },
        )
        .await
}
#[tokio::test]
async fn actual_queued_and_executed_programs_are_observed_without_reexecution_or_mutation() {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let (registry, program, calls) = program();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(ProgramSubmission::for_program(&program, "thread", "queued", None).unwrap())
        .await
        .unwrap();
    let queued = inventory(&store).await.unwrap();
    assert_eq!(queued.value, vec!["job"]);
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    supervisor
        .execute_submitted(&registry, "queued")
        .await
        .unwrap();
    let before = serde_json::to_value(store.execution_record("queued").await.unwrap()).unwrap();
    let first = inventory(&store).await.unwrap();
    let second = inventory(&store).await.unwrap();
    assert!(first.value.iter().any(|v| v == "execution"));
    assert!(first.value.iter().any(|v| v == "checkpoint"));
    assert_eq!(first.coverage.opaque_compositions, 0);
    assert_eq!(first.coverage.fingerprint, second.coverage.fingerprint);
    assert_eq!(
        before,
        serde_json::to_value(store.execution_record("queued").await.unwrap()).unwrap()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1, "{before}");
    let factories = store
        .inspect_retained_modules(
            RetentionLimits::default(),
            std::collections::BTreeSet::new(),
            |set, _, modules| {
                for module in modules {
                    set.insert(module.factory.clone());
                }
                Ok(())
            },
        )
        .await
        .unwrap();
    assert!(!factories.value.contains("payload-only-pack"));
}
#[tokio::test]
async fn limits_unknown_tables_versions_and_corrupt_rows_fail_closed() {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let (registry, program, _) = program();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(ProgramSubmission::for_program(&program, "t", "q", None).unwrap())
        .await
        .unwrap();
    supervisor.execute_submitted(&registry, "q").await.unwrap();
    for limits in [
        RetentionLimits {
            max_rows: 1,
            ..Default::default()
        },
        RetentionLimits {
            max_bytes: 1,
            ..Default::default()
        },
    ] {
        assert!(
            store
                .inspect_retained_modules(limits, (), |_, _, _| Ok(()))
                .await
                .is_err()
        );
    }
    store
        .transaction(|tx| {
            tx.execute_batch("CREATE TABLE agent_runtime_future_config(payload TEXT)")
                .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    assert!(inventory(&store).await.is_err());
    store
        .transaction(|tx| {
            tx.execute_batch("DROP TABLE agent_runtime_future_config")
                .map_err(db_error)?;
            let payload: String = tx
                .query_row(
                    "SELECT payload FROM agent_runtime_jobs WHERE run_id='q'",
                    [],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            let mut value: serde_json::Value = serde_json::from_str(&payload).map_err(db_error)?;
            value["submission"]["snapshot"]["version"] = json!(99);
            tx.execute(
                "UPDATE agent_runtime_jobs SET payload=?1 WHERE run_id='q'",
                [value.to_string()],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    assert!(inventory(&store).await.is_err());
}
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn independent_read_snapshot_does_not_hold_the_writer_mutex_or_see_later_jobs() {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let (_, program, _) = program();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(ProgramSubmission::for_program(&program, "a", "a", None).unwrap())
        .await
        .unwrap();
    let entered = Arc::new(tokio::sync::Notify::new());
    let signal = entered.clone();
    let (release, wait) = std::sync::mpsc::channel();
    let reader = store.clone();
    let task = tokio::spawn(async move {
        reader
            .inspect_retained_modules(RetentionLimits::default(), 0u64, move |count, _, _| {
                *count += 1;
                if *count == 1 {
                    signal.notify_one();
                    wait.recv_timeout(Duration::from_millis(1500))
                        .map_err(|_| failure("test reader release timed out"))?;
                }
                Ok(())
            })
            .await
    });
    tokio::time::timeout(Duration::from_secs(5), entered.notified())
        .await
        .unwrap();
    let written = tokio::time::timeout(
        Duration::from_millis(700),
        supervisor
            .submit_program(ProgramSubmission::for_program(&program, "b", "b", None).unwrap()),
    )
    .await;
    release.send(()).unwrap();
    let inspected = task.await.unwrap().unwrap();
    assert!(written.is_ok(), "reader blocked WAL writer");
    written.unwrap().unwrap();
    assert_eq!(inspected.coverage.rows, 1);
    assert_eq!(inventory(&store).await.unwrap().coverage.rows, 2);
}
#[tokio::test]
async fn opaque_checkpoints_are_reported_and_payload_lookalikes_are_not_declarations() {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let payload=json!({"version":1,"composition":"opaque-native-composition","state":{"modules":[{"factory":"plus-pack"}]}}).to_string();
    let key = "private-legacy-configuration".repeat(1024);
    store
        .transaction(move |tx| {
            tx.execute(
                "INSERT INTO agent_runtime_checkpoints(key,revision,payload) VALUES(?1,1,?2)",
                params![key, payload],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    let report = inventory(&store).await.unwrap();
    assert!(report.value.is_empty());
    assert_eq!(report.coverage.opaque_compositions, 1);
    assert_eq!(report.coverage.opaque_samples[0].key.len(), 71);
    assert!(
        !serde_json::to_string(&report.coverage)
            .unwrap()
            .contains("private-legacy")
    );
}

struct Finish;
#[async_trait::async_trait]
impl crate::Model for Finish {
    async fn complete(
        &self,
        _: crate::ModelRequest,
        _: &crate::RunContext,
    ) -> Result<crate::ModelResponse, Error> {
        Ok(crate::ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn original_v1_agent_and_real_next_turn_pin_their_snapshot_not_message_lookalikes() {
    use crate::{
        compile::compile_agent,
        mailbox::{InputAddress, MailEnvelope, MailInput, MailboxSender},
        supervisor::jobs::JobSubmission,
    };
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let (mut registry, _, _) = program();
    for (id, value) in [
        ("model", ModuleInstance::Model(Arc::new(Finish))),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(crate::StaticPrompt("system".into()))),
        ),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "1", value)))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: id.into(),
                config: json!({}),
                dependencies: Default::default(),
            })
            .unwrap();
    }
    let compiled=compile_agent(serde_json::from_value(json!({"name":"legacy-agent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"plus","version":"1"}]})).unwrap(),&registry).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "legacy",
            crate::interjection::PendingInterjection {
                text: "first".into(),
                attachments: Vec::new(),
            },
        ))
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "legacy")
        .await
        .unwrap();
    let before = serde_json::to_value(store.execution_record("legacy").await.unwrap()).unwrap();
    MailboxSender::submit(&store,MailEnvelope{address:InputAddress{root_run_id:"legacy".into(),run_id:"legacy".into(),thread_id:"thread".into(),agent:"legacy-agent".into()},input_id:"next".into(),input:MailInput::NextTurn{run_id:"next-run".into(),snapshot:compiled.snapshot.clone(),message:crate::interjection::PendingInterjection{text:json!({"snapshot":{"version":99,"modules":[{"factory":"payload-only-pack"}]}}).to_string(),attachments:Vec::new()}}}).await.unwrap();
    let found = inventory(&store).await.unwrap();
    assert!(found.value.iter().any(|kind| kind == "input"));
    assert!(
        found
            .value
            .iter()
            .filter(|kind| kind.as_str() == "job")
            .count()
            >= 2
    );
    assert_eq!(
        before,
        serde_json::to_value(store.execution_record("legacy").await.unwrap()).unwrap()
    );
    assert!(matches!(
        store
            .execution_job("next-run")
            .await
            .unwrap()
            .unwrap()
            .status,
        crate::supervisor::jobs::JobStatus::Queued
    ));
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn cancelled_waiters_do_not_scan_and_started_reads_retain_their_admission() {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let (_, program, _) = program();
    RunSupervisor::new(store.clone())
        .submit_program(ProgramSubmission::for_program(&program, "t", "q", None).unwrap())
        .await
        .unwrap();
    let held = store
        .retention_work
        .clone()
        .acquire_many_owned(2)
        .await
        .unwrap();
    let calls = Arc::new(AtomicUsize::new(0));
    let count = calls.clone();
    let reader = store.clone();
    let mut queued = tokio::spawn(async move {
        reader
            .inspect_retained_modules(RetentionLimits::default(), (), move |_, _, _| {
                count.fetch_add(1, Ordering::SeqCst);
                Ok(())
            })
            .await
    });
    let waiting = tokio::time::timeout(Duration::from_millis(20), &mut queued)
        .await
        .is_err();
    queued.abort();
    let _ = queued.await;
    drop(held);
    assert!(waiting);
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let entered = Arc::new(tokio::sync::Notify::new());
    let signal = entered.clone();
    let reader = store.clone();
    let (release, wait) = std::sync::mpsc::channel();
    let task = tokio::spawn(async move {
        reader
            .inspect_retained_modules(RetentionLimits::default(), (), move |_, _, _| {
                signal.notify_one();
                wait.recv_timeout(Duration::from_millis(1500))
                    .map_err(|_| failure("test reader release timed out"))?;
                Ok(())
            })
            .await
    });
    tokio::time::timeout(Duration::from_secs(5), entered.notified())
        .await
        .unwrap();
    task.abort();
    let result = task.await;
    let permits = store.retention_work.available_permits();
    release.send(()).unwrap();
    tokio::time::timeout(Duration::from_secs(5), async {
        while store.retention_work.available_permits() != 2 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    assert!(matches!(result,Err(error) if error.is_cancelled()));
    assert_eq!(permits, 1);
}

#[tokio::test]
async fn session_titles_are_metadata_preserved_by_snapshot_copy_and_reopen() {
    use crate::durable::transport::{copy_snapshot, inspect_snapshot};

    let dir = tempfile::tempdir().unwrap();
    let source = dir.path().join("source.sqlite");
    let target = dir.path().join("target.sqlite");
    let store = SqliteStore::open(&source).unwrap();
    let (_, program, calls) = program();
    RunSupervisor::new(store.clone())
        .submit_program(ProgramSubmission::for_program(&program, "thread", "run", None).unwrap())
        .await
        .unwrap();
    let before = inventory(&store).await.unwrap();
    assert_eq!(before.value, vec!["job"]);
    let snapshot_before = inspect_snapshot(&source).unwrap();
    store
        .transaction(|tx| {
            tx.execute(
                "INSERT INTO agent_runtime_session_titles(session_id,run_id,title,pending) VALUES(?1,?2,?3,?4)",
                rusqlite::params!["session", "run", "Summarize project notes", 1],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();

    let after = inventory(&store).await.unwrap();
    assert_eq!(after.value, before.value);
    assert_eq!(
        serde_json::to_value(&after.coverage).unwrap(),
        serde_json::to_value(&before.coverage).unwrap()
    );
    let snapshot = inspect_snapshot(&source).unwrap();
    assert_ne!(snapshot.fingerprint, snapshot_before.fingerprint);
    assert_eq!(
        copy_snapshot(&source, &target, &snapshot).unwrap(),
        snapshot
    );
    let copied = inspect_snapshot_modules(&target, (), |_, _, _| Ok(())).unwrap();
    assert_eq!(copied.coverage.fingerprint, before.coverage.fingerprint);

    let reopened = SqliteStore::open(&target).unwrap();
    let title: (String, String, i64) = reopened
        .transaction(|tx| {
            tx.query_row(
                "SELECT run_id,title,pending FROM agent_runtime_session_titles WHERE session_id=?1",
                ["session"],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .map_err(db_error)
        })
        .await
        .unwrap();
    assert_eq!(title, ("run".into(), "Summarize project notes".into(), 1));
    let retained = inventory(&reopened).await.unwrap();
    assert_eq!(retained.value, before.value);
    assert_eq!(retained.coverage.fingerprint, before.coverage.fingerprint);
    assert_eq!(calls.load(Ordering::SeqCst), 0);

    // Recognizing display metadata must not allow an unknown configuration table.
    reopened
        .transaction(|tx| {
            tx.execute_batch("CREATE TABLE agent_runtime_future_config(payload TEXT)")
                .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    assert!(matches!(
        inventory(&reopened).await,
        Err(Error::Checkpoint(message)) if message == "unrecognized retained runtime table"
    ));
    assert!(matches!(
        inspect_snapshot_modules(&target, (), |_, _, _| Ok(())),
        Err(Error::Checkpoint(message)) if message == "unrecognized retained runtime table"
    ));
}

#[tokio::test]
async fn snapshots_without_session_titles_are_read_without_migration_and_reopen_additively() {
    use crate::durable::transport::inspect_snapshot;

    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("historical.sqlite");
    // Simulate a version-one snapshot made before the additive metadata table.
    drop(SqliteStore::open(&path).unwrap());
    {
        let db = Connection::open(&path).unwrap();
        db.execute_batch("DROP TABLE agent_runtime_session_titles")
            .unwrap();
    }
    let before = inspect_snapshot(&path).unwrap();
    let historical = inspect_snapshot_modules(&path, 0, |count, _, modules| {
        *count += modules.len();
        Ok(())
    })
    .unwrap();
    assert_eq!(historical.value, 0);
    assert_eq!(inspect_snapshot(&path).unwrap(), before);

    let reopened = SqliteStore::open(&path).unwrap();
    let count: i64 = reopened
        .transaction(|tx| {
            tx.query_row(
                "SELECT COUNT(*) FROM agent_runtime_session_titles",
                [],
                |row| row.get(0),
            )
            .map_err(db_error)
        })
        .await
        .unwrap();
    assert_eq!(count, 0);
    assert_eq!(
        inventory(&reopened).await.unwrap().coverage.fingerprint,
        historical.coverage.fingerprint
    );
}
