use super::*;
use crate::registry::{
    ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind, ResourceHandle,
};
use nofy_tool_runtime::{ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tool_types::ToolDefinition;

pub struct TasksResourceFactory;
pub struct TasksBindingFactory;
pub struct TasksToolFactory;
pub struct MessagesToolFactory;
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: json!({"type":"object","additionalProperties":false}),
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies,
    }
}
impl ModuleFactory for TasksResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.agent_tasks",
            ModuleKind::Resource,
            BTreeMap::from([("children".into(), ModuleKind::ToolPack)]),
        )
    }
    fn build(
        &self,
        _: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let Some(ModuleInstance::ToolPack(children)) = deps.get("children") else {
            return Err(Error::Composition(
                "tasks require a children ToolPack".into(),
            ));
        };
        let mut identities = vec![];
        for name in children.names() {
            let entry = children.get(&name).expect("catalog name");
            if !entry.dispatch.is_resumable() {
                return Err(Error::Composition(
                    "all task children must be resumable".into(),
                ));
            }
            identities.push((
                name,
                entry.dispatch.recovery_identity().ok_or_else(|| {
                    Error::Composition("task child requires recovery identity".into())
                })?,
            ));
        }
        if identities.is_empty() {
            return Err(Error::Composition("tasks need at least one child".into()));
        }
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!(
                "agent-tasks/v1:{}",
                crate::system::content_digest(&identities)?
            ),
            Arc::new(Drivers(children.clone())),
        )?)))
    }
}
fn resource(deps: &BTreeMap<String, ModuleInstance>) -> Result<Arc<Drivers>, Error> {
    match deps.get("tasks") {
        Some(ModuleInstance::Resource(r)) => r
            .get::<Drivers>()
            .ok_or_else(|| Error::Composition("resource.agent_tasks required".into())),
        _ => Err(Error::Composition("tasks resource missing".into())),
    }
}
struct Binding(Arc<Drivers>);
impl crate::context::ContextBinding for Binding {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities.insert_arc(self.0.clone());
        Ok(())
    }
}
impl ModuleFactory for TasksBindingFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "binding.agent_tasks",
            ModuleKind::Binding,
            BTreeMap::from([("tasks".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        _: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Binding(Arc::new(Binding(resource(deps)?))))
    }
}
impl ModuleFactory for TasksToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.agent_tasks",
            ModuleKind::ToolPack,
            BTreeMap::from([("tasks".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        _: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let drivers = resource(deps)?;
        let choices = drivers
            .0
            .definitions()
            .into_iter()
            .map(|d| json!({"tool":d.function.name,"arguments_schema":d.function.parameters}))
            .collect::<Vec<_>>();
        catalog(
            "agent_tasks",
            &format!(
                "Spawn and coordinate resumable child agents. Children: {}. Tasks share parent budget; parent completion joins them. Poll results before using them.",
                json!(choices)
            ),
            task_schema(),
            Arc::new(TasksDispatch(Some(drivers))),
        )
    }
}
impl ModuleFactory for MessagesToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor("tool.agent_messages", ModuleKind::ToolPack, BTreeMap::new())
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        catalog(
            "agent_messages",
            "Send idempotent messages to a run_id or '*' broadcast within this run tree; read/wait with a cursor. Sender identity is supplied by the runtime.",
            json!({"type":"object","additionalProperties":false,"required":["action"],"properties":{"action":{"enum":["send","read","wait"]},"message_id":{"type":"string","minLength":1,"maxLength":128},"to":{"type":"string","minLength":1,"maxLength":128},"body":{},"after":{"type":"integer","minimum":0},"timeout_ms":{"type":"integer","minimum":0,"maximum":60000}}}),
            Arc::new(MessagesDispatch),
        )
    }
}
fn catalog(
    name: &str,
    description: &str,
    schema: Value,
    dispatch: Arc<dyn ToolDispatch>,
) -> Result<ModuleInstance, Error> {
    let mut tools = ToolCatalog::new();
    tools.insert(crate::ToolEntry {
        definition: ToolDefinition::function(name, Some(description), schema),
        dispatch,
    })?;
    Ok(ModuleInstance::ToolPack(tools))
}
/// Bind to the current invocation's task scope. The runtime installs it from
/// the parent Agent's declared task binding.
pub fn attached_work_tools() -> [crate::ToolEntry; 2] {
    [
        crate::ToolEntry {
            definition: ToolDefinition::function(
                "sdk_work_attached_targets",
                Some(
                    "Discover authorized drivers for attached Agent and Workflow work, with each driver's input schema.",
                ),
                json!({"type":"object","additionalProperties":false}),
            ),
            dispatch: Arc::new(TargetsDispatch),
        },
        crate::ToolEntry {
            definition: ToolDefinition::function(
                "sdk_work_task",
                Some(
                    "Spawn, poll, wait for, cancel, or list attached tasks. Discover drivers with sdk_work_attached_targets. Reuse task_id and input when retrying spawn. Inspect the execution tree with sdk_work_list.",
                ),
                task_schema(),
            ),
            dispatch: Arc::new(TasksDispatch(None)),
        },
    ]
}

fn task_schema() -> Value {
    json!({
        "type":"object",
        "additionalProperties":false,
        "required":["action"],
        "properties":{
            "action":{"enum":["spawn","poll","wait","cancel","list"]},
            "task_id":{"type":"string","minLength":1,"maxLength":128,"description":"Required for spawn, poll, wait and cancel. Pick a stable unique ID in this parent invocation."},
            "tool":{"type":"string","description":"Required for spawn. Use a driver exposed by this invocation."},
            "arguments":{"description":"Required for spawn. Pass the driver's input object."},
            "timeout_ms":{"type":"integer","minimum":0,"maximum":60000,"description":"Optional wait timeout in milliseconds. Wait defaults to 60000."}
        }
    })
}

struct TasksDispatch(Option<Arc<Drivers>>);
struct TargetsDispatch;
struct MessagesDispatch;
fn field<'a>(args: &'a Value, key: &str) -> Result<&'a str, Error> {
    args.get(key)
        .and_then(Value::as_str)
        .ok_or_else(|| Error::Tool(format!("{key} is required")))
}
fn output(
    id: nofy_tool_protocol::ToolId,
    result: Result<Value, Error>,
) -> ToolStream<TypedToolOutput> {
    let result = match result {
        Err(Error::Tool(message)) => {
            Ok(json!({"success":false,"error":{"code":"invalid_task_request","message":message}}))
        }
        result => result,
    };
    nofy_tool_runtime::terminal_only(
        result
            .map(|value| TypedToolOutput::from_value(id, value))
            .map_err(|e| nofy_tool_runtime::ToolError::custom("agent_coordination", e.to_string())),
    )
}
#[async_trait::async_trait]
impl ToolDispatch for TasksDispatch {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some("agent-tasks/v1".into())
    }
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let scope = ctx
                .get::<Scope>()
                .ok_or_else(|| Error::Composition("task scope unavailable".into()))?;
            if let Some(drivers) = &self.0
                && scope.drivers.recovery_modes() != drivers.0.recovery_modes()
            {
                return Err(Error::Composition(
                    "tool.agent_tasks and binding.agent_tasks refer to different child drivers"
                        .into(),
                ));
            }
            match field(&args, "action")? {
                "spawn" => {
                    scope
                        .spawn(
                            field(&args, "task_id")?,
                            field(&args, "tool")?,
                            args.get("arguments")
                                .cloned()
                                .ok_or_else(|| Error::Tool("arguments required".into()))?,
                            &ctx,
                        )
                        .await
                }
                "poll" => scope.read(Some(field(&args, "task_id")?), 0).await,
                "wait" => {
                    scope
                        .read(
                            Some(field(&args, "task_id")?),
                            args["timeout_ms"].as_u64().unwrap_or(60000),
                        )
                        .await
                }
                "cancel" => scope.cancel(field(&args, "task_id")?).await,
                "list" => scope.read(None, 0).await,
                _ => Err(Error::Tool("unknown task action".into())),
            }
        }
        .await;
        output(id, result)
    }
}
#[async_trait::async_trait]
impl ToolDispatch for TargetsDispatch {
    fn approval_effect(&self) -> nofy_tool_runtime::dispatch::ApprovalEffect {
        nofy_tool_runtime::dispatch::ApprovalEffect::ReadOnly
    }

    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        _: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        output(id, Ok(json!({"items": attached_work_targets(&ctx)})))
    }
}

fn attached_work_targets(ctx: &ToolCallContext) -> Value {
    let tools = ctx
        .get::<Scope>()
        .map(|scope| scope.drivers.definitions())
        .unwrap_or_default();
    let items = tools
        .into_iter()
        .map(|d| {
            json!({
                "tool": d.function.name,
                "description": d.function.description,
                "arguments_schema": d.function.parameters
            })
        })
        .collect::<Vec<_>>();
    json!(items)
}
#[async_trait::async_trait]
impl ToolDispatch for MessagesDispatch {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some("agent-messages/v1".into())
    }
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let board = ctx
                .get::<Board>()
                .ok_or_else(|| Error::Composition("message board unavailable".into()))?;
            let context = ctx
                .get::<RunContext>()
                .ok_or_else(|| Error::Composition("messages require RunContext".into()))?;
            match field(&args, "action")? {
                "send" => {
                    board
                        .send(
                            &context,
                            field(&args, "message_id")?,
                            field(&args, "to")?,
                            args.get("body")
                                .cloned()
                                .ok_or_else(|| Error::Tool("body required".into()))?,
                        )
                        .await
                }
                "read" => {
                    board
                        .read(&context, args["after"].as_u64().unwrap_or(0), 0)
                        .await
                }
                "wait" => {
                    board
                        .read(
                            &context,
                            args["after"].as_u64().unwrap_or(0),
                            args["timeout_ms"].as_u64().unwrap_or(60000),
                        )
                        .await
                }
                _ => Err(Error::Tool("unknown message action".into())),
            }
        }
        .await;
        output(id, result)
    }
}
