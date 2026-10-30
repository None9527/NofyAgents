mod configured_event;
mod declarative_system;
use async_trait::async_trait;
use nofy_agent_runtime::*;
use nofy_agent_runtime::{
    coding::CodingHost,
    memory::{InMemoryStore, MemoryContext, MemoryStore},
    pack::{PackBindings, PackServices, ServiceBinding},
    pipeline::Flow,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::Arc;

struct Lookup;
impl Tool for Lookup {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("lookup").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("lookup", "Lookup a business record");
        d.arguments_schema = Some(
            json!({"type":"object","properties":{"key":{"type":"string"}},"required":["key"]}),
        );
        d
    }
    async fn run(
        &self,
        context: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        Ok(
            json!({"tenant":*context.get::<String>().unwrap(),"record":args["key"],"status":"active"}),
        )
    }
}
struct LookupModel;
#[async_trait]
impl Model for LookupModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(match request.messages.last() {
            Some(Message::Tool { content, .. }) => ModelResponse {
                output: content.to_string(),
                ..Default::default()
            },
            _ => ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "lookup-1".into(),
                    name: "lookup".into(),
                    arguments: json!({"key":"alice"}),
                }],
                ..Default::default()
            },
        })
    }
}
struct EchoModel;
#[async_trait]
impl Model for EchoModel {
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        assert!(
            matches!(&request.messages[0],Message::System{content} if content.contains("Research persona")&&content.contains("Bound research skill"))
        );
        let services = context.capabilities.get::<PackServices>().unwrap();
        assert_eq!(*services.get::<String>("index").unwrap(), "approved-index");
        let text = request
            .messages
            .iter()
            .filter_map(|m| match m {
                Message::User { content } => Some(content.as_str()),
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
struct Delegate;
#[async_trait]
impl Model for Delegate {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(match request.messages.last() {
            Some(Message::Tool { content, .. }) => ModelResponse {
                output: content.to_string(),
                ..Default::default()
            },
            _ => ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "child-1".into(),
                    name: "research".into(),
                    arguments: json!({"prompt":"alice"}),
                }],
                ..Default::default()
            },
        })
    }
}
struct Source(ToolCatalog);
#[async_trait]
impl ToolSource for Source {
    async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
        Ok(ToolSnapshot {
            revision: "business-v1".into(),
            catalog: self.0.clone(),
        })
    }
}
// A second host for the SAME coding recipe, built outside nofy-shell. It uses
// explicit in-memory capabilities and the public Model/Tool contracts only.
struct StandaloneCoding {
    model: Arc<dyn Model>,
    tools: ToolCatalog,
    context: RunContext,
    messages: Vec<Message>,
    response: ModelResponse,
    steps: usize,
}
impl CodingHost for StandaloneCoding {
    type Output = String;
    type Error = Error;
    async fn model(&mut self) -> Result<Flow<String>, Error> {
        self.steps += 1;
        self.response = self
            .model
            .complete(
                ModelRequest {
                    messages: self.messages.clone(),
                    tools: self.tools.definitions(),
                    settings: json!({}),
                },
                &self.context,
            )
            .await?;
        self.messages.push(Message::Assistant {
            content: self.response.output.clone(),
            tool_calls: self.response.tool_calls.clone(),
        });
        Ok(Flow::Next)
    }
    async fn completion(&mut self) -> Result<Flow<String>, Error> {
        Ok(if self.response.tool_calls.is_empty() {
            Flow::Finish(self.response.output.clone())
        } else {
            Flow::Next
        })
    }
    async fn dispatch(&mut self) -> Result<Flow<String>, Error> {
        for call in &self.response.tool_calls {
            let entry = self
                .tools
                .get(&call.name)
                .ok_or_else(|| Error::Tool("not registered".into()))?;
            let result = entry
                .dispatch
                .call_terminal(
                    nofy_tool_protocol::ToolId::new(&call.name).unwrap(),
                    call.arguments.clone(),
                    nofy_agent_runtime::tools::call_context(&call.id, &self.context)?,
                )
                .await
                .map_err(|e| Error::Tool(e.to_string()))?;
            self.messages.push(Message::Tool {
                call_id: call.id.clone(),
                content: serde_json::to_value(result).unwrap(),
                is_error: false,
            });
        }
        Ok(Flow::Next)
    }
    async fn convergence(&mut self) -> Result<Flow<String>, Error> {
        if self.steps >= 4 {
            Err(Error::BudgetExceeded)
        } else {
            Ok(Flow::Next)
        }
    }
}
fn output(outcome: RunOutcome) -> String {
    match outcome {
        RunOutcome::Completed { output, .. } => output,
        other => panic!("{other:?}"),
    }
}
fn context(id: &str) -> RunContext {
    let mut c = RunContext::new(id, "consumer-run");
    c.capabilities.insert("tenant-42".to_string());
    c
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Error> {
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Lookup))?;
    // A host installs implementations once. A client supplies only the JSON
    // document to create and configure a new agent through public APIs.
    let mut registry = nofy_agent_runtime::registry::ModuleRegistry::default();
    registry.register_factory(Arc::new(nofy_agent_runtime::registry::PromptFactory))?;
    registry.register_factory(Arc::new(nofy_agent_runtime::recipe::LiteralStageFactory))?;
    registry.register_factory(Arc::new(nofy_agent_runtime::recipe::RecipeFactory))?;
    for (factory, instance) in [
        (
            "host.lookup-model",
            nofy_agent_runtime::registry::ModuleInstance::Model(Arc::new(LookupModel)),
        ),
        (
            "host.records",
            nofy_agent_runtime::registry::ModuleInstance::ToolSource(Arc::new(Source(
                tools.clone(),
            ))),
        ),
    ] {
        registry.register_factory(Arc::new(
            nofy_agent_runtime::registry::InstanceFactory::new(factory, "1", instance),
        ))?;
    }
    let document = serde_json::from_str(include_str!("../configured-agent.json"))
        .map_err(|e| Error::Composition(e.to_string()))?;
    let configured = nofy_agent_runtime::compile::compile_document(document, &registry)?;
    let configured_outcome = configured
        .agent
        .invoke(RunInput::new("alice"), context("configured"))
        .await?;
    assert!(
        matches!(&configured_outcome, RunOutcome::Completed { state, .. }
        if state.recipe_progress.stage_data("external-stage").is_some_and(|data| data["registered"] == true))
    );
    let workflow_document = serde_json::from_str(include_str!("../configured-workflow.json"))
        .map_err(|e| Error::Composition(e.to_string()))?;
    let workflow =
        nofy_agent_runtime::workflow::compile::compile_workflow(workflow_document, &registry)?;
    let workflow = workflow
        .snapshot
        .restore(&registry)?
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    for input in [RunInput::default(), RunInput::resume()] {
        let result = output(
            workflow
                .invoke(
                    json!({"key":"alice"}),
                    input,
                    context("configured-workflow"),
                )
                .await?,
        );
        assert!(result.contains("tenant-42") && result.contains("active"));
    }
    let hook_document = serde_json::from_str(include_str!("../configured-hook-workflow.json"))
        .map_err(|e| Error::Composition(e.to_string()))?;
    let hook_workflow =
        nofy_agent_runtime::workflow::compile::compile_workflow(hook_document, &registry)?;
    let library = nofy_agent_runtime::workflow::modules::WorkflowLibrary::new(
        std::collections::BTreeMap::from([
            ("records@1".into(), workflow.clone()),
            ("hook@1".into(), hook_workflow),
        ]),
    )?;
    registry.register_factory(Arc::new(
        nofy_agent_runtime::workflow::modules::WorkflowToolFactory(library.clone()),
    ))?;
    registry.register_factory(Arc::new(
        nofy_agent_runtime::workflow::modules::WorkflowHookFactory(library),
    ))?;
    registry.register_factory(Arc::new(nofy_agent_runtime::hooks::HookFactory::new(
        nofy_agent_runtime::hooks::EventCatalog::runtime(),
    )))?;
    configured_event::verify(&mut registry).await?;
    declarative_system::verify(&registry).await?;
    let module_document = serde_json::json!({"name":"published-consumer","tool_packs":[{"id":"published-flow","version":"1"}]});
    registry.define(serde_json::from_value(serde_json::json!({"reference":{"id":"published-flow","version":"1"},"factory":"tool.workflow","config":{"workflow":"records@1","name":"records_flow"}})).unwrap())?;
    let module = nofy_agent_runtime::tool_program::compile_tools(
        serde_json::from_value(module_document).unwrap(),
        &registry,
    )?;
    let program = nofy_agent_runtime::program::CompiledProgram::for_tool(&module, ToolCall {
        id: "program-call".into(), name: "records_flow".into(), arguments: json!({"input":{"key":"alice"}}),
    })?;
    let program = program.snapshot.restore(&registry)?
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    for input in [RunInput::default(), RunInput::resume()] {
        assert!(output(program.invoke(input, context("frozen-program")).await?).contains("tenant-42"));
    }
    let module = module
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let module_output = output(
        module
            .invoke(
                ToolCall {
                    id: "published".into(),
                    name: "records_flow".into(),
                    arguments: json!({"input":{"key":"alice"}}),
                },
                RunInput::default(),
                context("published-flow"),
            )
            .await?,
    );
    assert!(module_output.contains("tenant-42"));
    let mut hooked: nofy_agent_runtime::compile::AgentDocument =
        serde_json::from_str(include_str!("../configured-agent.json")).unwrap();
    for definition in [
        json!({"reference":{"id":"workflow-handler","version":"1"},"factory":"hook.workflow","config":{"workflow":"hook@1"}}),
        json!({"reference":{"id":"workflow-hook","version":"1"},"factory":"hook.subscription","config":{"event":"before_model"},"dependencies":{"handler":{"id":"workflow-handler","version":"1"}}}),
    ] {
        hooked
            .modules
            .push(serde_json::from_value(definition).unwrap());
    }
    hooked
        .agent
        .hooks
        .push(nofy_agent_runtime::registry::ModuleRef::new(
            "workflow-hook",
            "1",
        ));
    let hooked = nofy_agent_runtime::compile::compile_document(hooked, &registry)?;
    let hooked_output = output(
        hooked
            .agent
            .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
            .invoke(RunInput::new("alice"), context("workflow-hook"))
            .await?,
    );
    assert!(hooked_output.contains("tenant-42"));
    let configured_output = output(configured_outcome);
    assert!(configured_output.contains("tenant-42"));
    let mut c = Components::default();
    c.models.insert("business".into(), Arc::new(LookupModel));
    c.models.insert("research".into(), Arc::new(EchoModel));
    c.models.insert("delegate".into(), Arc::new(Delegate));
    c.prompts.insert(
        "business".into(),
        Arc::new(StaticPrompt("Answer business queries.".into())),
    );
    c.tool_sources
        .insert("records".into(), Arc::new(Source(tools.clone())));
    c.policies.insert(
        "approved".into(),
        Arc::new(nofy_agent_runtime::policy::AllowTools),
    );
    let store = Arc::new(InMemoryStore::default());
    store
        .append("tenant-42", "alice research evidence".into())
        .await?;
    c.context_sources.insert(
        "memory".into(),
        Arc::new(MemoryContext {
            store,
            namespace: "tenant-42".into(),
            limit: 3,
        }),
    );
    let settings = SettingsResolver::new(vec![Arc::new(StaticSettings(json!({"max_steps":4})))])
        .resolve(&context("settings"))
        .await?;
    let business = AgentBuilder::new("business")
        .model("business")
        .prompt("business")
        .tool_source("records")
        .settings(settings)
        .compile(&c)?;
    let manifest=nofy_agent_runtime::pack::parse_pack(&json!({"id":"research","persona":"Research persona","skills":["evidence"],"model_route":"research","tool_policy":"approved","services":[{"name":"index"}]})).unwrap();
    let mut bindings = PackBindings::default();
    bindings.skills.insert(
        "evidence".into(),
        Arc::new(StaticPrompt("Bound research skill".into())),
    );
    bindings.services.insert(
        ("research".into(), "index".into()),
        ServiceBinding {
            revision: "index-v1".into(),
            value: Arc::new("approved-index".to_string()),
        },
    );
    bindings.context_sources.push("memory".into());
    let research = nofy_agent_runtime::pack::compile(&manifest, &c, &bindings)?;
    let mut delegation = ToolCatalog::new();
    delegation.insert(research.as_tool("research", "Research a record"))?;
    c.tool_packs.insert("delegation".into(), delegation);
    let parent = AgentBuilder::new("parent")
        .model("delegate")
        .prompt("business")
        .tools("delegation")
        .compile(&c)?;
    let a = output(
        business
            .invoke(RunInput::new("alice"), context("business"))
            .await?,
    );
    let b = output(
        research
            .invoke(RunInput::new("alice"), context("research"))
            .await?,
    );
    let delegated = output(
        parent
            .invoke(RunInput::new("alice"), context("parent"))
            .await?,
    );
    let parallel = nofy_agent_runtime::composition::parallel(
        &[business, research],
        RunInput::new("alice"),
        context("parallel"),
    )
    .await;
    assert_eq!(parallel.len(), 2);
    assert!(parallel.iter().all(Result::is_ok));
    let mut host = StandaloneCoding {
        model: Arc::new(LookupModel),
        tools,
        context: context("coding"),
        messages: vec![Message::User {
            content: "alice".into(),
        }],
        response: ModelResponse::default(),
        steps: 0,
    };
    let coding = nofy_agent_runtime::coding::pipeline()
        .run(&mut host)
        .await?;
    assert!(a.contains("tenant-42") && coding.contains("tenant-42"));
    assert!(b.contains("research evidence") && delegated.contains("research evidence"));
    println!(
        "{}",
        json!({"status":"passed","agents":["business","research-pack","standalone-coding"],"delegation":true,"parallel":true,"configuration":true,"recipe":true,"workflow":true,"workflow_module":true,"workflow_hook":true,"program":true,"event_program":true,"declarative_system":true,"file_catalog":true})
    );
    Ok(())
}
