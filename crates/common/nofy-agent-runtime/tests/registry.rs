use nofy_agent_runtime::compile::{AgentDefinition, compile_agent};
use nofy_agent_runtime::registry::*;
use nofy_agent_runtime::*;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

struct Echo;
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let text = request
            .messages
            .iter()
            .filter_map(|message| match message {
                Message::System { content } => Some(content.clone()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n");
        Ok(ModelResponse {
            output: text,
            ..Default::default()
        })
    }
}

fn define(registry: &mut ModuleRegistry, id: &str, version: &str, factory: &str, config: Value) {
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new(id, version),
            factory: factory.into(),
            config,
            dependencies: BTreeMap::new(),
        })
        .unwrap();
}

fn registry(store: Arc<InMemoryCheckpointer>) -> ModuleRegistry {
    let mut registry = ModuleRegistry::default();
    registry.register_factory(Arc::new(PromptFactory)).unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "native.echo",
            "impl-v1",
            ModuleInstance::Model(Arc::new(Echo)),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "native.store",
            "impl-v1",
            ModuleInstance::Checkpointer(store),
        )))
        .unwrap();
    define(&mut registry, "model", "1", "native.echo", json!({}));
    define(&mut registry, "store", "1", "native.store", json!({}));
    registry
}

fn definition() -> AgentDefinition {
    serde_json::from_value(json!({
        "schema_version":1, "name":"config-agent",
        "model":{"id":"model","version":"1"},
        "prompt":{"id":"system","version":"1"},
        "checkpointer":{"id":"store","version":"1"}
    }))
    .unwrap()
}

fn output(result: RunOutcome) -> String {
    match result {
        RunOutcome::Completed { output, .. } => output,
        other => panic!("{other:?}"),
    }
}

#[tokio::test]
async fn configuration_compiles_and_published_prompt_versions_do_not_mutate_old_agents() {
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    define(
        &mut registry,
        "system",
        "1",
        "prompt.template",
        json!({"template":"Hello {{name}}; tools: {{tools}}", "values":{"name":"Alice"}}),
    );
    let first = compile_agent(definition(), &registry).unwrap();
    define(
        &mut registry,
        "system",
        "2",
        "prompt.template",
        json!({"template":"Second version"}),
    );
    let mut next = definition();
    next.prompt.version = "2".into();
    let second = compile_agent(next, &registry).unwrap();
    assert_eq!(
        output(
            first
                .agent
                .invoke(RunInput::new("test"), RunContext::new("old", "1"))
                .await
                .unwrap()
        ),
        "Hello Alice; tools: "
    );
    assert_eq!(
        output(
            second
                .agent
                .invoke(RunInput::new("test"), RunContext::new("new", "2"))
                .await
                .unwrap()
        ),
        "Second version"
    );
    let serialized = serde_json::to_value(&first.snapshot).unwrap();
    assert!(serialized.to_string().contains("impl-v1"));
    assert_eq!(serialized["modules"].as_array().unwrap().len(), 3);
    let repeated = compile_agent(definition(), &registry).unwrap();
    assert_eq!(serialized, serde_json::to_value(repeated.snapshot).unwrap());
}

#[tokio::test]
async fn replaced_middleware_implementation_cannot_resume_an_old_checkpoint() {
    struct Append(&'static str);
    #[async_trait::async_trait]
    impl nofy_agent_runtime::agent::Middleware for Append {
        async fn before_model(
            &self,
            request: &mut ModelRequest,
            _: &RunContext,
        ) -> Result<(), Error> {
            request.messages.push(Message::System {
                content: self.0.into(),
            });
            Ok(())
        }
    }
    let store = Arc::new(InMemoryCheckpointer::default());
    let create = |revision, text| {
        let mut registry = registry(store.clone());
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "native.middleware",
                revision,
                ModuleInstance::Middleware(Arc::new(Append(text))),
            )))
            .unwrap();
        define(
            &mut registry,
            "middleware",
            "1",
            "native.middleware",
            json!({}),
        );
        define(
            &mut registry,
            "system",
            "1",
            "prompt.template",
            json!({"template":"base"}),
        );
        let mut definition = definition();
        definition
            .middleware
            .push(ModuleRef::new("middleware", "1"));
        compile_agent(definition, &registry).unwrap()
    };
    let first = create("impl1", "old middleware");
    assert!(
        output(
            first
                .agent
                .invoke(RunInput::new("test"), RunContext::new("same", "1"))
                .await
                .unwrap()
        )
        .contains("old middleware")
    );
    let next = create("impl2", "new middleware");
    let error = next
        .agent
        .invoke(RunInput::resume(), RunContext::new("same", "2"))
        .await
        .unwrap_err();
    assert!(error.to_string().contains("composition/version mismatch"));
    assert!(
        output(
            next.agent
                .invoke(RunInput::new("test"), RunContext::new("new", "2"))
                .await
                .unwrap()
        )
        .contains("new middleware")
    );
}

struct WrappedPrompt {
    builds: Arc<AtomicUsize>,
    wrong_kind: bool,
}
impl ModuleFactory for WrappedPrompt {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "wrapped".into(),
            revision: "1".into(),
            kind: ModuleKind::Prompt,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: Some(json!({"type":"string"})),
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([("base".into(), ModuleKind::Prompt)]),
        }
    }
    fn build(
        &self,
        _: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        self.builds.fetch_add(1, Ordering::SeqCst);
        if self.wrong_kind {
            return Ok(ModuleInstance::Model(Arc::new(Echo)));
        }
        Ok(dependencies["base"].clone())
    }
}

fn wrapped(registry: &mut ModuleRegistry, id: &str, base: &str) {
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new(id, "1"),
            factory: "wrapped".into(),
            config: json!({}),
            dependencies: BTreeMap::from([("base".into(), ModuleRef::new(base, "1"))]),
        })
        .unwrap();
}

#[test]
fn dependency_graph_validates_before_building_and_detects_cycles_missing_and_wrong_kinds() {
    for bad in ["cycle", "missing", "kind", "config", "root-kind"] {
        let count = Arc::new(AtomicUsize::new(0));
        let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
        registry
            .register_factory(Arc::new(WrappedPrompt {
                builds: count.clone(),
                wrong_kind: false,
            }))
            .unwrap();
        define(
            &mut registry,
            "base",
            "1",
            "prompt.template",
            json!({"template":"ok"}),
        );
        wrapped(&mut registry, "valid", "base");
        match bad {
            "cycle" => {
                wrapped(&mut registry, "system", "other");
                wrapped(&mut registry, "other", "system");
            }
            "missing" => wrapped(&mut registry, "system", "absent"),
            "kind" => wrapped(&mut registry, "system", "model"),
            "config" => define(
                &mut registry,
                "system",
                "1",
                "prompt.template",
                json!({"template":9}),
            ),
            "root-kind" => define(&mut registry, "system", "1", "native.echo", json!({})),
            _ => unreachable!(),
        }
        let result = registry.resolve_typed(&[
            (ModuleRef::new("valid", "1"), ModuleKind::Prompt),
            (ModuleRef::new("system", "1"), ModuleKind::Prompt),
        ]);
        assert!(result.is_err(), "{bad}");
        assert_eq!(count.load(Ordering::SeqCst), 0, "{bad}");
    }
}

#[tokio::test]
async fn dependency_factory_uses_only_explicit_bindings_and_memoizes_shared_dependencies() {
    let count = Arc::new(AtomicUsize::new(0));
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    registry
        .register_factory(Arc::new(WrappedPrompt {
            builds: count.clone(),
            wrong_kind: false,
        }))
        .unwrap();
    define(
        &mut registry,
        "base",
        "1",
        "prompt.template",
        json!({"template":"from dependency"}),
    );
    wrapped(&mut registry, "system", "base");
    let result = compile_agent(definition(), &registry).unwrap();
    assert_eq!(
        output(
            result
                .agent
                .invoke(RunInput::new("test"), RunContext::new("thread", "1"))
                .await
                .unwrap()
        ),
        "from dependency"
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
    let resolved = registry
        .resolve(&[ModuleRef::new("system", "1"), ModuleRef::new("system", "1")])
        .unwrap();
    assert_eq!(resolved.instances.len(), 2);
    assert_eq!(count.load(Ordering::SeqCst), 2);
}

#[test]
fn immutable_versions_bad_schemas_and_unknown_options_fail_explicitly() {
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    assert!(registry.register_factory(Arc::new(PromptFactory)).is_err());
    assert!(
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new("model", "1"),
                factory: "native.echo".into(),
                config: json!({}),
                dependencies: BTreeMap::new()
            })
            .is_err()
    );
    define(
        &mut registry,
        "system",
        "1",
        "prompt.template",
        json!({"template":"ok","ignored":true}),
    );
    let error = compile_agent(definition(), &registry)
        .err()
        .unwrap()
        .to_string();
    assert!(error.contains("system") && error.contains("config"));
    for patch in [json!({"hook_typo":[]}), json!({"settings":{"max_step":4}})] {
        let mut value = serde_json::to_value(definition()).unwrap();
        value
            .as_object_mut()
            .unwrap()
            .extend(patch.as_object().unwrap().clone());
        assert!(serde_json::from_value::<AgentDefinition>(value).is_err());
    }
    let mut future = definition();
    future.schema_version = 2;
    assert!(compile_agent(future, &registry).is_err());
}

#[test]
fn faulty_factories_cannot_masquerade_as_another_kind() {
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    registry
        .register_factory(Arc::new(WrappedPrompt {
            builds: Arc::new(AtomicUsize::new(0)),
            wrong_kind: true,
        }))
        .unwrap();
    define(
        &mut registry,
        "base",
        "1",
        "prompt.template",
        json!({"template":"ok"}),
    );
    wrapped(&mut registry, "system", "base");
    assert!(
        compile_agent(definition(), &registry)
            .err()
            .unwrap()
            .to_string()
            .contains("wrong kind")
    );
}

#[test]
fn remote_schema_references_are_rejected_without_fetching() {
    struct Remote;
    impl ModuleFactory for Remote {
        fn descriptor(&self) -> ModuleDescriptor {
            ModuleDescriptor {
                factory: "remote".into(),
                revision: "1".into(),
                kind: ModuleKind::Prompt,
                config_schema: json!({"$ref":"https://example.invalid/schema"}),
                input_schema: None,
                output_schema: None,
                required_capabilities: Default::default(),
                dependencies: BTreeMap::new(),
            }
        }
        fn build(
            &self,
            _: &Value,
            _: &BTreeMap<String, ModuleInstance>,
        ) -> Result<ModuleInstance, Error> {
            panic!("must not build")
        }
    }
    assert!(
        ModuleRegistry::default()
            .register_factory(Arc::new(Remote))
            .is_err()
    );
}

#[tokio::test]
async fn client_document_is_isolated_and_cannot_replace_host_definitions() {
    use nofy_agent_runtime::compile::{AgentDocument, compile_document};
    let host = registry(Arc::new(InMemoryCheckpointer::default()));
    let body = json!({
        "schema_version":1,
        "modules":[{
            "reference":{"id":"system","version":"1"},
            "factory":"prompt.template", "config":{"template":"configured by client"}
        }],
        "agent":serde_json::to_value(definition()).unwrap()
    });
    let document: AgentDocument = serde_json::from_value(body).unwrap();
    let compiled = compile_document(document.clone(), &host).unwrap();
    assert_eq!(
        output(
            compiled
                .agent
                .invoke(RunInput::new("test"), RunContext::new("client", "1"))
                .await
                .unwrap()
        ),
        "configured by client"
    );
    assert!(host.resolve(&[ModuleRef::new("system", "1")]).is_err());
    let mut bad = document.clone();
    bad.modules[0].reference = ModuleRef::new("model", "1");
    assert!(compile_document(bad, &host).is_err());
    // A second client can compile the same document independently.
    assert!(compile_document(document, &host).is_ok());
}

#[test]
fn required_host_adapters_are_checked_before_factory_construction() {
    struct Requires(WrappedPrompt);
    impl ModuleFactory for Requires {
        fn descriptor(&self) -> ModuleDescriptor {
            let mut descriptor = self.0.descriptor();
            descriptor
                .required_capabilities
                .insert("approved-context-adapter".into());
            descriptor
        }
        fn build(
            &self,
            config: &Value,
            deps: &BTreeMap<String, ModuleInstance>,
        ) -> Result<ModuleInstance, Error> {
            self.0.build(config, deps)
        }
    }
    let count = Arc::new(AtomicUsize::new(0));
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    registry
        .register_factory(Arc::new(Requires(WrappedPrompt {
            builds: count.clone(),
            wrong_kind: false,
        })))
        .unwrap();
    define(
        &mut registry,
        "base",
        "1",
        "prompt.template",
        json!({"template":"ok"}),
    );
    wrapped(&mut registry, "system", "base");
    assert!(
        compile_agent(definition(), &registry)
            .err()
            .unwrap()
            .to_string()
            .contains("uninstalled capabilities")
    );
    assert_eq!(count.load(Ordering::SeqCst), 0);
    registry
        .provide_capability("approved-context-adapter")
        .unwrap();
    assert!(compile_agent(definition(), &registry).is_ok());
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn static_prompt_factory_preserves_literal_template_syntax() {
    let mut registry = registry(Arc::new(InMemoryCheckpointer::default()));
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    define(
        &mut registry,
        "system",
        "1",
        "prompt.static",
        json!({"text":"Literal {{tools}} and {{name}}"}),
    );
    let compiled = compile_agent(definition(), &registry).unwrap();
    assert_eq!(
        output(
            compiled
                .agent
                .invoke(RunInput::new("test"), RunContext::new("literal", "1"))
                .await
                .unwrap()
        ),
        "Literal {{tools}} and {{name}}"
    );
}
