use super::*;
use nofy_agent_runtime::supervisor::jobs::*;
use nofy_interjection_core::PendingInterjection;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::path::Path;

fn message(text: &str) -> PendingInterjection<InputPart> {
    PendingInterjection {
        text: text.into(),
        attachments: vec![],
    }
}
fn agent(setup: &Setup) -> CompiledAgent {
    compile_agent(serde_json::from_value(json!({"name":"queued-agent","model":r("model"),"prompt":r("prompt"),"governance":[r("budget")],"bindings":[r("clear")],"settings":{"scope_identity":"hashed_v1"}})).unwrap(), &setup.registry).unwrap()
}
fn program(setup: &Setup, kind: &str) -> CompiledProgram {
    match kind {
        "agent" => CompiledProgram::for_agent(&agent(setup)).unwrap(),
        "tool" => CompiledProgram::for_tool(&tool(setup), call()).unwrap(),
        #[cfg(feature = "workflow")]
        "workflow" => {
            CompiledProgram::for_workflow(&graphs::graph(setup, false, false), json!({})).unwrap()
        }
        _ => panic!("unsupported test program"),
    }
}
fn submission(program: &CompiledProgram, run: &str) -> ProgramSubmission {
    ProgramSubmission::for_program(
        program,
        "thread",
        run,
        program.snapshot.is_agent().then(|| message("task")),
    )
    .unwrap()
}
fn kinds() -> Vec<&'static str> {
    #[cfg(feature = "workflow")]
    {
        vec!["agent", "tool", "workflow"]
    }
    #[cfg(not(feature = "workflow"))]
    {
        vec!["agent", "tool"]
    }
}
async fn complete(supervisor: &RunSupervisor, setup: &Setup, run: &str) -> RunState {
    match supervisor
        .execute_submitted(&setup.registry, run)
        .await
        .unwrap()
        .unwrap()
    {
        RunOutcome::Completed { state, .. } => state,
        other => panic!("{other:?}"),
    }
}
fn reject_first(sql: &rusqlite::Connection, program: &CompiledProgram) {
    let key = program.checkpoint_key("thread").replace('\'', "''");
    sql.execute_batch(&format!("CREATE TRIGGER reject_first BEFORE INSERT ON agent_runtime_checkpoints WHEN NEW.key='{key}' BEGIN SELECT RAISE(ABORT,'lost first checkpoint'); END;")).unwrap();
}
fn reject_ack(sql: &rusqlite::Connection) {
    sql.execute_batch("CREATE TRIGGER reject_ack BEFORE UPDATE OF status ON agent_runtime_jobs WHEN NEW.run_id='root' AND NEW.status='running' BEGIN SELECT RAISE(ABORT,'lost input ack'); END;").unwrap();
}

#[path = "queue/admission.rs"]
mod admission;
#[path = "queue/expiry.rs"]
mod expiry;
#[path = "queue/process.rs"]
mod process;
#[path = "queue/recovery.rs"]
mod recovery;
