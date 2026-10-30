use super::*;

struct LoggedModel(std::path::PathBuf);
#[async_trait::async_trait]
impl Model for LoggedModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        use std::io::Write;
        let mut line = serde_json::to_vec(&request).unwrap();
        line.push(b'\n');
        std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.0)
            .and_then(|mut file| file.write_all(&line))
            .map_err(|e| Error::Model(e.to_string()))?;
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
fn process_setup(path: &Path, kind: &str) -> (SqliteStore, Setup, CompiledProgram) {
    let store = SqliteStore::open(&path.join("runtime.db")).unwrap();
    let mut setup = setup(&store, false, false, false, false);
    let program = if kind == "agent" {
        install(
            &mut setup.registry,
            "logged",
            ModuleInstance::Model(Arc::new(LoggedModel(path.join("models.log")))),
        );
        let agent=compile_agent(serde_json::from_value(json!({"name":"queued-agent","model":r("logged"),"prompt":r("prompt"),"governance":[r("budget")],"bindings":[r("clear")]})).unwrap(),&setup.registry).unwrap();
        CompiledProgram::for_agent(&agent).unwrap()
    } else {
        program(&setup, kind)
    };
    (store, setup, program)
}
#[test]
fn program_job_process_worker() {
    let Ok(directory) = std::env::var("NOFY_PROGRAM_JOB_DIR") else {
        return;
    };
    let directory = std::path::PathBuf::from(directory);
    let phase = std::env::var("NOFY_PROGRAM_JOB_PHASE").unwrap();
    let kind = std::env::var("NOFY_PROGRAM_JOB_KIND").unwrap();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let (store, setup, program) = process_setup(&directory, &kind);
            let supervisor = RunSupervisor::new(store.clone());
            if phase == "submit" {
                supervisor
                    .submit_program(submission(&program, "root"))
                    .await
                    .unwrap();
                assert!(store.execution_record("root").await.unwrap().is_none());
                std::process::exit(97);
            }
            let sql = rusqlite::Connection::open(store.path()).unwrap();
            if phase == "preflight" {
                reject_first(&sql, &program);
            } else {
                sql.execute_batch("DROP TRIGGER IF EXISTS reject_first")
                    .unwrap();
            }
            if phase == "ack" {
                reject_ack(&sql);
            } else {
                sql.execute_batch("DROP TRIGGER IF EXISTS reject_ack")
                    .unwrap();
            }
            if phase == "preflight" || phase == "ack" {
                assert!(
                    supervisor
                        .execute_submitted(&setup.registry, "root")
                        .await
                        .is_err()
                );
                assert_eq!(
                    store
                        .load(&program.checkpoint_key("thread"))
                        .await
                        .unwrap()
                        .is_some(),
                    phase == "ack"
                );
                assert!(!directory.join("models.log").exists());
                assert!(!store.path().with_extension("effects").exists());
                std::process::exit(97);
            }
            let registry = if phase == "cached" {
                ModuleRegistry::default()
            } else {
                setup.registry.clone()
            };
            assert!(matches!(
                supervisor
                    .execute_submitted(&registry, "root")
                    .await
                    .unwrap(),
                Some(RunOutcome::Completed { .. })
            ));
            assert!(matches!(
                store.program_job("root").await.unwrap().unwrap().status,
                JobStatus::Closed
            ));
        });
}
#[test]
fn all_program_jobs_survive_real_process_exits_across_both_initial_commit_windows() {
    for kind in kinds() {
        let temp = tempfile::tempdir().unwrap();
        for phase in ["submit", "preflight", "ack", "run", "cached"] {
            let result = std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "queue::process::program_job_process_worker",
                    "--nocapture",
                ])
                .env("NOFY_PROGRAM_JOB_DIR", temp.path())
                .env("NOFY_PROGRAM_JOB_PHASE", phase)
                .env("NOFY_PROGRAM_JOB_KIND", kind)
                .output()
                .unwrap();
            assert_eq!(
                result.status.code(),
                Some(if matches!(phase, "submit" | "preflight" | "ack") {
                    97
                } else {
                    0
                }),
                "{kind}/{phase}: {} {}",
                String::from_utf8_lossy(&result.stdout),
                String::from_utf8_lossy(&result.stderr)
            );
        }
        let log = std::fs::read_to_string(temp.path().join(if kind == "agent" {
            "models.log"
        } else {
            "runtime.effects"
        }))
        .unwrap();
        assert_eq!(log.lines().count(), 1, "{kind}");
        if kind == "agent" {
            let request: ModelRequest = serde_json::from_str(log.trim()).unwrap();
            assert_eq!(
                request
                    .messages
                    .iter()
                    .filter(|m| matches!(m, Message::User { .. }))
                    .count(),
                1
            );
        }
    }
}
