//! Reusable declarative graphs use the original compiler and Tool/Hook hosts.
use super::{
    compile::{CompiledWorkflow, WorkflowDocument, compile_workflow},
    modules::{WorkflowHookFactory, WorkflowLibrary, WorkflowToolFactory},
};
use crate::{Error, registry::*};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{cell::Cell, collections::BTreeMap, sync::Arc};
pub struct WorkflowResourceFactory;
pub struct ConnectedWorkflowToolFactory;
pub struct ConnectedWorkflowHookFactory;
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    document: WorkflowDocument,
    #[serde(default)]
    bindings: BTreeMap<String, ModuleKind>,
}
thread_local! {static DEPTH:Cell<u8>=const {Cell::new(0)};}
struct Depth;
impl Depth {
    fn enter() -> Result<Self, Error> {
        DEPTH.with(|v| {
            if v.get() >= 16 {
                return Err(Error::Composition(
                    "nested workflow resource compilation exceeds 16".into(),
                ));
            }
            v.set(v.get() + 1);
            Ok(Self)
        })
    }
}
impl Drop for Depth {
    fn drop(&mut self) {
        DEPTH.with(|v| v.set(v.get() - 1));
    }
}
fn parsed(value: &Value) -> Result<Config, Error> {
    serde_json::from_value(value.clone())
        .map_err(|e| Error::Composition(format!("resource.workflow: {e}")))
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    schema: Value,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        dependencies,
        required_capabilities: Default::default(),
    }
}
impl ModuleFactory for WorkflowResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let kinds = [
            ModuleKind::Resource,
            ModuleKind::Model,
            ModuleKind::Prompt,
            ModuleKind::ToolPack,
            ModuleKind::Policy,
            ModuleKind::ToolSource,
            ModuleKind::ContextSource,
            ModuleKind::ContextPolicy,
            ModuleKind::Governance,
            ModuleKind::Stage,
            ModuleKind::StageSource,
            ModuleKind::Recipe,
            ModuleKind::Middleware,
            ModuleKind::Checkpointer,
            ModuleKind::Binding,
            ModuleKind::Hook,
            ModuleKind::HookHandler,
            ModuleKind::EventProducer,
        ];
        descriptor(
            "resource.workflow",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["document"],"properties":{
                "document":{"type":"object"},"bindings":{"type":"object","maxProperties":256,"additionalProperties":{"enum":kinds}}
            }}),
            Default::default(),
        )
    }
    fn config_dependencies(&self, value: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        Ok(parsed(value)?.bindings)
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(Error::Composition(
            "workflow resources must be built through ModuleRegistry".into(),
        ))
    }
    fn build_with_context(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let _depth = Depth::enter()?;
        let config = parsed(value)?;
        let scope = context.dependency_registry()?;
        let compiled = compile_workflow(config.document, &scope)?;
        context.verify_dependencies(&compiled.snapshot.modules)?;
        let identity = format!("workflow-resource-v1:{}", compiled.identity());
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(compiled),
        )?)))
    }
}
fn library(dependencies: &BTreeMap<String, ModuleInstance>) -> Result<WorkflowLibrary, Error> {
    let Some(ModuleInstance::Resource(resource)) = dependencies.get("workflow") else {
        return Err(Error::Composition(
            "workflow module requires its workflow resource".into(),
        ));
    };
    let compiled = resource
        .get::<CompiledWorkflow>()
        .ok_or_else(|| Error::Composition("workflow resource has another type".into()))?;
    WorkflowLibrary::new(BTreeMap::from([("bound".into(), (*compiled).clone())]))
}
impl ModuleFactory for ConnectedWorkflowToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.workflow_connected",
            ModuleKind::ToolPack,
            json!({"type":"object","additionalProperties":false,"required":["name"],"properties":{"name":{"type":"string","minLength":1},"description":{"type":"string"}}}),
            BTreeMap::from([("workflow".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            name: String,
            #[serde(default)]
            description: String,
        }
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        WorkflowToolFactory(library(dependencies)?).build(
            &json!({"workflow":"bound","name":config.name,"description":config.description}),
            &Default::default(),
        )
    }
}
impl ModuleFactory for ConnectedWorkflowHookFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "hook.workflow_connected",
            ModuleKind::HookHandler,
            json!({"type":"object","additionalProperties":false}),
            BTreeMap::from([("workflow".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        WorkflowHookFactory(library(dependencies)?)
            .build(&json!({"workflow":"bound"}), &Default::default())
    }
}
