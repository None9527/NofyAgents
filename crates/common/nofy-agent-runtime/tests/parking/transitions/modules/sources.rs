use super::*;
use nofy_agent_runtime::{context_policy::*, memory::ContextSource};

struct Sources {
    contexts: Arc<Mutex<Vec<String>>>,
    policies: Arc<Mutex<Vec<String>>>,
    snapshots: Arc<Mutex<Vec<String>>>,
}
struct SourceModel(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for SourceModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
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
        let finished = request.messages.iter().any(
            |message| matches!(message, Message::Tool { call_id, .. } if call_id == "updated-call"),
        );
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: if finished {
                "source done".into()
            } else {
                String::new()
            },
            tool_calls: if finished {
                vec![]
            } else {
                vec![ToolCall {
                    id: "updated-call".into(),
                    name: "updated".into(),
                    arguments: json!({}),
                }]
            },
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}
struct TextContext(String, Arc<Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl ContextSource for TextContext {
    async fn contribute(&self, _: &RunState, _: &RunContext) -> Result<Vec<Message>, Error> {
        self.1.lock().unwrap().push(self.0.clone());
        Ok(vec![Message::User {
            content: format!("retrieved:{}", self.0),
        }])
    }
}
struct SourceFactory(Arc<Mutex<Vec<String>>>);
impl ModuleFactory for SourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor("source.text", ModuleKind::ContextSource, Default::default())
    }
    fn build(
        &self,
        value: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::ContextSource(Arc::new(TextContext(
            value["revision"].as_str().unwrap().into(),
            self.0.clone(),
        ))))
    }
}
struct CatalogSource(String, ToolCatalog, Arc<Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl tools::ToolSource for CatalogSource {
    async fn snapshot(&self, _: &RunContext) -> Result<tools::ToolSnapshot, Error> {
        self.2.lock().unwrap().push(self.0.clone());
        Ok(tools::ToolSnapshot {
            revision: self.0.clone(),
            catalog: self.1.clone(),
        })
    }
}
struct CatalogFactory(Arc<Mutex<Vec<String>>>);
impl ModuleFactory for CatalogFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "source.catalog",
            ModuleKind::ToolSource,
            std::collections::BTreeMap::from([("catalog".into(), ModuleKind::ToolPack)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let ModuleInstance::ToolPack(catalog) = &dependencies["catalog"] else {
            panic!("catalog")
        };
        Ok(ModuleInstance::ToolSource(Arc::new(CatalogSource(
            value["revision"].as_str().unwrap().into(),
            catalog.clone(),
            self.0.clone(),
        ))))
    }
}
struct Transform(String, Arc<Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl ContextPolicy for Transform {
    async fn plan(&self, state: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        Ok((state.steps > 0).then(|| json!({"revision":self.0})))
    }
    async fn apply(
        &self,
        state: &RunState,
        plan: &Value,
        _: &RunContext,
    ) -> Result<ContextUpdate, Error> {
        assert_eq!(plan["revision"], self.0);
        self.1.lock().unwrap().push(self.0.clone());
        let mut messages = vec![
            state.messages[0].clone(),
            Message::Assistant {
                content: format!("compacted:{}", self.0),
                tool_calls: vec![],
            },
        ];
        messages.extend_from_slice(&state.messages[1..]);
        Ok(ContextUpdate {
            messages,
            retained_from: 1,
            retained_at: 2,
            input_tokens: 0,
            output_tokens: 0,
            metadata: plan.clone(),
        })
    }
}
struct TransformFactory(Arc<Mutex<Vec<String>>>);
impl ModuleFactory for TransformFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "context.transform",
            ModuleKind::ContextPolicy,
            Default::default(),
        )
    }
    fn build(
        &self,
        value: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::ContextPolicy(Arc::new(Transform(
            value["revision"].as_str().unwrap().into(),
            self.0.clone(),
        ))))
    }
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    dependencies: std::collections::BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: json!({"type":"object","required":["revision"],"additionalProperties":false,"properties":{"revision":{"type":"string","minLength":1}}}),
        input_schema: None,
        output_schema: None,
        dependencies,
        required_capabilities: Default::default(),
    }
}
fn install(registry: &mut ModuleRegistry) -> Sources {
    let contexts = Arc::new(Mutex::new(vec![]));
    let policies = Arc::new(Mutex::new(vec![]));
    let snapshots = Arc::new(Mutex::new(vec![]));
    for factory in [
        Arc::new(SourceFactory(contexts.clone())) as Arc<dyn ModuleFactory>,
        Arc::new(TransformFactory(policies.clone())),
        Arc::new(CatalogFactory(snapshots.clone())),
        Arc::new(InstanceFactory::new(
            "tools.empty",
            "1",
            ModuleInstance::ToolPack(ToolCatalog::new()),
        )),
    ] {
        registry.register_factory(factory).unwrap();
    }
    Sources {
        contexts,
        policies,
        snapshots,
    }
}
fn source_system(
    registry: &ModuleRegistry,
    system: &CompiledSystem,
    revision: Option<&str>,
    dynamic_catalog: &str,
) -> CompiledSystem {
    let mut doc = serde_json::to_value(&system.bundle.document).unwrap();
    let modules = doc["modules"].as_array_mut().unwrap();
    modules.retain(|m| {
        !["retrieval", "transform", "catalog-source", "empty"]
            .contains(&m["reference"]["id"].as_str().unwrap())
    });
    if let Some(revision) = revision {
        modules.extend([
            json!({"reference":r("retrieval"),"factory":"source.text","config":{"revision":revision}}),
            json!({"reference":r("transform"),"factory":"context.transform","config":{"revision":revision}}),
            json!({"reference":r("empty"),"factory":"tools.empty","config":{}}),
            json!({"reference":r("catalog-source"),"factory":"source.catalog","config":{"revision":revision},"dependencies":{"catalog":r(dynamic_catalog)}}),
        ]);
    }
    let agent = &mut doc["programs"]["chat"]["definition"];
    for (field, id) in [
        ("context_sources", "retrieval"),
        ("context_policies", "transform"),
        ("tool_sources", "catalog-source"),
    ] {
        agent[field] = if revision.is_some() {
            json!([r(id)])
        } else {
            json!([])
        };
    }
    compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap()
}
fn source_update(id: &str, system: &CompiledSystem, revision: u64) -> ManagedAction {
    let mut command = update(id, system, revision, false, false);
    if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
        update.context_sources = true;
        update.context_policies = true;
        update.tool_sources = true;
    }
    command
}
async fn quota(store: &SqliteStore, system: &CompiledSystem) -> Option<BudgetSummary> {
    let reference = ModuleRef::new("budget", "1");
    let resolved = system.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("budget profile")
    };
    store
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
}

#[path = "sources/boundaries.rs"]
mod boundaries;
#[path = "sources/identities.rs"]
mod identities;
#[path = "sources/replacement.rs"]
mod replacement;
#[path = "sources/sessions.rs"]
mod sessions;
