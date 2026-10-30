use nofy_agent_runtime::{control::*, registry::*, system::*, *};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
struct EchoFactory {
    calls: Arc<AtomicUsize>,
    revision: String,
}
struct Echo {
    calls: Arc<AtomicUsize>,
    prefix: String,
}
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> std::result::Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        if let Some(path) = context.capabilities.get::<std::path::PathBuf>() {
            use std::io::Write;
            std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open(&*path)
                .unwrap()
                .write_all(b"model\n")
                .unwrap();
        }
        let system = request
            .messages
            .iter()
            .find_map(|m| match m {
                Message::System { content } => Some(content.as_str()),
                _ => None,
            })
            .unwrap_or("");
        Ok(ModelResponse {
            output: format!("{}:{system}", self.prefix),
            ..Default::default()
        })
    }
}
impl ModuleFactory for EchoFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "model.echo".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::Model,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["prefix"],"properties":{"prefix":{"type":"string"}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Model(Arc::new(Echo {
            calls: self.calls.clone(),
            prefix: config["prefix"].as_str().unwrap().into(),
        })))
    }
}
fn factories(revision: &str) -> (ModuleRegistry, Arc<AtomicUsize>) {
    let mut registry = ModuleRegistry::default();
    let calls = Arc::new(AtomicUsize::new(0));
    registry
        .register_factory(Arc::new(EchoFactory {
            calls: calls.clone(),
            revision: revision.into(),
        }))
        .unwrap();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    (registry, calls)
}
fn model() -> ModuleDefinition {
    ModuleDefinition {
        reference: r("model"),
        factory: "model.echo".into(),
        config: json!({"prefix":"actual"}),
        dependencies: Default::default(),
    }
}
fn document(text: &str) -> SystemDocument {
    serde_json::from_value(json!({"schema_version":1,"name":"portable","modules":[model(),{"reference":r("prompt"),"factory":"prompt.static","config":{"text":text}}],"programs":{"chat":{"kind":"agent","definition":{"name":"business","model":r("model"),"prompt":r("prompt")}}}})).unwrap()
}
async fn run(program: &nofy_agent_runtime::program::CompiledProgram) -> String {
    match program
        .invoke(RunInput::new("input"), RunContext::new("thread", "root"))
        .await
        .unwrap()
    {
        RunOutcome::Completed { output, .. } => output,
        other => panic!("{other:?}"),
    }
}
#[tokio::test]
async fn single_file_closes_transitive_definitions_and_runs_on_factory_only_host() {
    let (mut source, source_calls) = factories("1");
    source.define(model()).unwrap();
    let mut doc = document("first");
    doc.modules.retain(|m| m.reference != r("model"));
    let compiled = compile_system(doc, &source).unwrap();
    assert_eq!(source_calls.load(Ordering::SeqCst), 0);
    assert_eq!(compiled.bundle.document.modules.len(), 2);
    let bytes = serde_json::to_vec(&compiled.bundle).unwrap();
    let bundle: SystemBundle = serde_json::from_slice(&bytes).unwrap();
    let (target, calls) = factories("1");
    assert!(target.definition(&r("model")).is_none());
    let restored = bundle.restore(&target).unwrap();
    assert_eq!(run(restored.program("chat").unwrap()).await, "actual:first");
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert!(
        target.definition(&r("model")).is_none(),
        "loading must not partially mutate the host"
    );
    assert_eq!(
        restored.registry().definition(&r("model")).unwrap().config,
        json!({"prefix":"actual"})
    );
}
#[test]
fn definition_order_and_duplicate_identical_declarations_produce_one_lock() {
    let (registry, _) = factories("1");
    let a = compile_system(document("first"), &registry).unwrap();
    let mut d = document("first");
    d.modules.reverse();
    d.modules.push(model());
    let b = compile_system(d, &registry).unwrap();
    assert_eq!(a.bundle.digest, b.bundle.digest);
    assert_eq!(
        serde_json::to_value(a.bundle).unwrap(),
        serde_json::to_value(b.bundle).unwrap()
    );
}
#[test]
fn invalid_or_changed_factory_module_floor_and_snapshot_never_execute() {
    let (registry, calls) = factories("1");
    let bundle = compile_system(document("first"), &registry).unwrap().bundle;
    let (wrong, _) = factories("2");
    assert!(bundle.restore(&wrong).is_err());
    let mut corrupt = bundle.clone();
    corrupt
        .lock
        .programs
        .get_mut("chat")
        .unwrap()
        .composition_digest = "0".repeat(64);
    assert!(corrupt.restore(&registry).is_err());
    let mut d = document("first");
    let mut conflict = model();
    conflict.config = json!({"prefix":"different"});
    d.modules.push(conflict);
    assert!(compile_system(d, &registry).is_err());
    let mut d = document("first");
    d.modules.push(ModuleDefinition {
        reference: r("unused"),
        factory: "not-installed".into(),
        config: json!({}),
        dependencies: Default::default(),
    });
    assert!(compile_system(d, &registry).is_err());
    let mut d = document("first");
    d.required_policies.push(r("absent-floor"));
    assert!(compile_system(d, &registry).is_err());
    assert_eq!(calls.load(Ordering::SeqCst), 0);
}
#[test]
fn single_file_rejects_unknown_fields_and_unsupported_versions() {
    let (registry, _) = factories("1");
    let mut value = serde_json::to_value(document("first")).unwrap();
    value["ignored_runtime_options"] = json!({});
    assert!(serde_json::from_value::<SystemDocument>(value).is_err());
    let mut d = document("first");
    d.schema_version = 99;
    assert!(compile_system(d, &registry).is_err());
    let mut d = document("first");
    d.programs.clear();
    assert!(compile_system(d, &registry).is_err());
}
#[test]
fn semantic_diff_includes_program_modules_and_keeps_unchanged_release_empty() {
    let (registry, _) = factories("1");
    let a = compile_system(document("first"), &registry).unwrap().bundle;
    let b = compile_system(document("second"), &registry)
        .unwrap()
        .bundle;
    assert!(a.diff(Some(&a)).unwrap().changes.is_empty());
    let diff = b.diff(Some(&a)).unwrap();
    assert_eq!(diff.changes.len(), 2);
    assert!(
        diff.changes
            .iter()
            .any(|c| c.kind == SystemChangeKind::Program)
    );
    assert!(
        diff.changes
            .iter()
            .any(|c| c.kind == SystemChangeKind::Module)
    );
}
#[path = "declarative/catalog.rs"]
mod catalog;
#[cfg(all(feature = "control-file", unix))]
#[path = "declarative/file.rs"]
mod file;
#[path = "declarative/programs.rs"]
mod programs;
