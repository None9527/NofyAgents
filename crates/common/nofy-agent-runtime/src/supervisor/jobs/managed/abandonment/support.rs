use super::*;

pub struct TestClock(pub AtomicU64);
impl crate::durable::Clock for TestClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
struct EffectModel {
    path: std::path::PathBuf,
    started: Arc<tokio::sync::Notify>,
    unmetered: bool,
}
#[async_trait::async_trait]
impl Model for EffectModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<crate::model::ModelRequestBound, Error> {
        assert!(
            !self.unmetered,
            "unmetered calls must not request synthetic budget bounds"
        );
        Ok(crate::model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if request
            .messages
            .iter()
            .any(|m| matches!(m,crate::Message::User{content} if content=="safe"))
        {
            return Ok(ModelResponse {
                output: "completed".into(),
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            });
        }
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .unwrap();
        file.write_all(b"model\n").unwrap();
        file.sync_all().unwrap();
        self.started.notify_one();
        std::future::pending().await
    }
}
pub fn message(text: &str) -> PendingInterjection<crate::InputPart> {
    PendingInterjection {
        text: text.into(),
        attachments: vec![],
    }
}
pub fn request(system: &CompiledSystem, run: &str, thread: &str, text: &str) -> ManagedRunRequest {
    ManagedRunRequest {
        run_id: run.into(),
        thread_id: thread.into(),
        system: "abandon-system".into(),
        release: system.bundle.digest.clone(),
        program: "chat".into(),
        input: Some(message(text)),
        parameters: None,
    }
}
pub fn abandon(id: &str, run: &str, reason: &str) -> ManagedAction {
    ManagedAction {
        command_id: id.into(),
        run_id: run.into(),
        command: ManagedCommand::Abandon {
            reason: reason.into(),
            acknowledge_unresolved: true,
        },
    }
}
pub fn build_system(
    store: &SqliteStore,
    path: &std::path::Path,
    started: Arc<tokio::sync::Notify>,
    unmetered: bool,
) -> (ModuleRegistry, CompiledSystem) {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.effect",
            "1",
            ModuleInstance::Model(Arc::new(EffectModel {
                path: path.to_owned(),
                started,
                unmetered,
            })),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(crate::model_journal::ModelJournalFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(
            declarative::BudgetResourceFactory::new(
                Arc::new(store.clone()),
                "abandon-authority",
                BudgetLimits::default(),
                1,
            )
            .unwrap(),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(declarative::ConnectedBudgetFactory))
        .unwrap();
    let r = |id: &str| json!({"id":id,"version":"1"});
    let mut source = json!({"schema_version":1,"name":"abandon-system","required_governance":[r("quota")],"modules":[
        {"reference":r("model"),"factory":"model.effect","config":{}},
        {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"act"}},
        {"reference":r("ledger"),"factory":"resource.budget","config":{}},
        {"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":1}},"dependencies":{"budget":r("ledger")}}
    ],"programs":{"chat":{"kind":"agent","definition":{"name":"abandon-agent","model":r("model"),"prompt":r("prompt")}}}});
    if unmetered {
        source
            .as_object_mut()
            .unwrap()
            .remove("required_governance");
        source["modules"].as_array_mut().unwrap().truncate(2);
        source["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":r("journal"),"factory":"binding.model_journal","config":{}}));
        source["programs"]["chat"]["definition"]["bindings"] = json!([r("journal")]);
    }
    let system = compile_system(serde_json::from_value(source).unwrap(), &registry).unwrap();
    (registry, system)
}
/// Native recovery and budget data must be byte-for-byte unchanged. Management
/// events and receipts are deliberately separate from these business facts.
pub async fn native_state(store: &SqliteStore) -> Vec<(String, String, String)> {
    store.transaction(|tx| {
        let mut query=tx.prepare("SELECT 'checkpoint',key,payload FROM agent_runtime_checkpoints UNION ALL SELECT 'budget-root',key,payload FROM agent_runtime_budget_roots UNION ALL SELECT 'budget-operation',root_key||':'||operation_key,payload FROM agent_runtime_budget_operations UNION ALL SELECT 'budget-event',CAST(id AS TEXT),payload FROM agent_runtime_budget_events ORDER BY 1,2,3").map_err(db_error)?;
        query.query_map([],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?))).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)
    }).await.unwrap()
}
