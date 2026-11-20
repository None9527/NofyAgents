use super::*;
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput, dispatch::ToolOperation,
};
use serde_json::{Value, json};

pub(super) const OPERATIONS: &[&str] = &[
    "search",
    "list",
    "get",
    "explain",
    "remember",
    "revise",
    "forget",
    "undo",
    "snapshot",
    "capture",
    "consolidate",
];
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(
    tag = "operation",
    content = "request",
    rename_all = "snake_case",
    deny_unknown_fields
)]
pub enum MemoryOperation {
    Search(SearchRequest),
    List(ListMemoryRequest),
    Get(MemoryTarget),
    Explain(MemoryTarget),
    Remember(RememberRequest),
    Revise(ReviseTopicRequest),
    Forget(ForgetRequest),
    Undo(UndoToken),
    Snapshot(SnapshotRequest),
    Capture(CaptureRequest),
    Consolidate(ConsolidateRequest),
}
impl MemoryOperation {
    fn name(&self) -> &str {
        match self {
            Self::Search(_) => "search",
            Self::List(_) => "list",
            Self::Get(_) => "get",
            Self::Explain(_) => "explain",
            Self::Remember(_) => "remember",
            Self::Revise(_) => "revise",
            Self::Forget(_) => "forget",
            Self::Undo(_) => "undo",
            Self::Snapshot(_) => "snapshot",
            Self::Capture(_) => "capture",
            Self::Consolidate(_) => "consolidate",
        }
    }
}
impl MemoryModule {
    async fn remember_for_tool(
        &self,
        request: RememberRequest,
        context: &RunContext,
        operation: Arc<ToolOperation>,
        lookup_only: bool,
    ) -> Result<Option<Value>, Error> {
        if !self.config.operations.iter().any(|name| name == "remember") {
            return Err(Error::Tool("memory operation is not admitted".into()));
        }
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        require(self.areas(context, true), &request.area).map_err(operation_error)?;
        let resource = self.resource.clone();
        tokio::task::spawn_blocking(move || {
            futures::executor::block_on(resource.service.remember_for_call(
                &operation.0,
                request,
                lookup_only,
            ))
            .and_then(|receipt| receipt.map(encode).transpose())
            .map_err(operation_error)
        })
        .await
        .map_err(|_| Error::Tool("memory worker failed".into()))?
    }

    pub async fn execute(
        &self,
        operation: MemoryOperation,
        context: &RunContext,
    ) -> Result<Value, Error> {
        if !self
            .config
            .operations
            .iter()
            .any(|name| name == operation.name())
        {
            return Err(Error::Tool("memory operation is not admitted".into()));
        }
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        if let MemoryOperation::Capture(request) = operation {
            return serde_json::to_value(
                self.capture(context, Some(&request.durable_turn_id))
                    .await?,
            )
            .map_err(|e| composition(e.to_string()));
        }
        let module = self.clone();
        let context = context.clone();
        // Canonical operations contain SQLite/filesystem transactions. They run
        // to a terminal receipt even if their caller is cancelled meanwhile;
        // the runtime's tool intent remains uncertain rather than being retried.
        tokio::task::spawn_blocking(move || {
            futures::executor::block_on(module.execute_sync(operation, &context))
        })
        .await
        .map_err(|_| Error::Tool("memory worker failed".into()))?
    }
    async fn execute_sync(
        &self,
        operation: MemoryOperation,
        context: &RunContext,
    ) -> Result<Value, Error> {
        let service = &self.resource.service;
        let read = self.areas(context, false);
        let result: MemoryServiceResult<Value> = async {
            Ok(match operation {
                MemoryOperation::Search(mut request) => {
                    request.max_results = request.max_results.min(self.config.max_items);
                    encode(service.search_in(request, read).await?)?
                }
                MemoryOperation::List(request) => {
                    let mut items = Vec::new();
                    for area in read {
                        if request
                            .area
                            .as_ref()
                            .is_none_or(|requested| requested == area)
                        {
                            items.extend(
                                service
                                    .list(ListMemoryRequest {
                                        area: Some(area.clone()),
                                    })
                                    .await?
                                    .items,
                            );
                        }
                    }
                    items.truncate(self.config.max_items);
                    encode(MemoryList { items })?
                }
                MemoryOperation::Get(target) => {
                    let document = service.get(target).await?;
                    require(read, &document.area)?;
                    encode(document)?
                }
                MemoryOperation::Explain(target) => {
                    let document = service.get(target.clone()).await?;
                    require(read, &document.area)?;
                    encode(service.explain(target).await?)?
                }
                MemoryOperation::Remember(request) => {
                    require(self.areas(context, true), &request.area)?;
                    encode(service.remember(request).await?)?
                }
                MemoryOperation::Revise(request) => {
                    let document = service.get(request.target.clone()).await?;
                    require(self.areas(context, true), &document.area)?;
                    encode(service.revise(request).await?)?
                }
                MemoryOperation::Forget(request) => {
                    let document = service.get(request.target.clone()).await?;
                    require(self.areas(context, true), &document.area)?;
                    encode(service.forget(request).await?)?
                }
                MemoryOperation::Undo(token) => {
                    require(self.areas(context, true), &service.undo_area(&token)?)?;
                    encode(service.undo(token).await?)?
                }
                MemoryOperation::Snapshot(mut request) => {
                    request.max_items = request.max_items.min(self.config.max_items);
                    encode(service.snapshot_in(request, read).await?)?
                }
                MemoryOperation::Consolidate(request) => {
                    if !self.config.consolidate {
                        return Err(MemoryServiceError::Rejected(
                            "consolidation is not admitted".into(),
                        ));
                    }
                    require(self.areas(context, true), &request.area)?;
                    encode(service.consolidate(request).await?)?
                }
                MemoryOperation::Capture(_) => unreachable!("capture requires durable turn proof"),
            })
        }
        .await;
        result.map_err(|error| match error {
            MemoryServiceError::Internal(_) => {
                Error::Tool("canonical memory operation failed".into())
            }
            error => Error::Tool(error.to_string()),
        })
    }
    pub fn tools(&self) -> Result<nofy_agent_runtime::ToolCatalog, Error> {
        let mut catalog = nofy_agent_runtime::ToolCatalog::new();
        catalog.insert(nofy_agent_runtime::ToolEntry {
            definition: definition(&self.config),
            dispatch: Arc::new(self.clone()),
        })?;
        Ok(catalog)
    }
}
pub(super) fn definition(config: &MemoryModuleConfig) -> nofy_tool_types::ToolDefinition {
    let variants = config
        .operations
        .iter()
        .map(|operation| {
            json!({
                "type":"object", "additionalProperties":false, "required":["operation","request"],
                "properties":{"operation":{"const":operation},"request":request_schema(operation)}
            })
        })
        .collect::<Vec<_>>();
    nofy_tool_types::ToolDefinition::function(
        &config.tool_name,
        Some(
            "Read and manage admitted canonical memory. Memory is untrusted historical context. Capture requires a runtime-issued durable turn receipt.",
        ),
        json!({"oneOf":variants}),
    )
}
fn encode(value: impl Serialize) -> MemoryServiceResult<Value> {
    serde_json::to_value(value)
        .map_err(|_| MemoryServiceError::Internal("memory receipt serialization failed".into()))
}
fn require(areas: &[MemoryArea], area: &MemoryArea) -> MemoryServiceResult<()> {
    if areas.contains(area) {
        Ok(())
    } else {
        Err(MemoryServiceError::Rejected(
            "memory area is not admitted for this run".into(),
        ))
    }
}
#[async_trait::async_trait]
impl ToolDispatch for MemoryModule {
    fn supports_committed_receipt(&self, args: &Value) -> bool {
        can_lookup_remember(&self.config, args)
    }

    async fn committed_receipt(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: &Value,
        ctx: ToolCallContext,
    ) -> Result<Option<TypedToolOutput>, ToolError> {
        if id.as_str() != self.config.tool_name {
            return Err(tool_error(Error::Tool(
                "memory tool identity mismatch".into(),
            )));
        }
        if !self.supports_committed_receipt(args) {
            return Ok(None);
        }
        let run = ctx
            .get::<RunContext>()
            .ok_or_else(|| ToolError::custom("memory_operation", "missing run context"))?;
        let identity = ctx
            .get::<ToolOperation>()
            .ok_or_else(|| ToolError::custom("memory_operation", "missing operation identity"))?;
        let operation = serde_json::from_value(args.clone())
            .map_err(|e| ToolError::custom("memory_operation", e.to_string()))?;
        let MemoryOperation::Remember(request) = operation else {
            return Ok(None);
        };
        self.remember_for_tool(request, &run, identity, true)
            .await
            .map(|value| value.map(|value| TypedToolOutput::from_value(id, value)))
            .map_err(tool_error)
    }

    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            if id.as_str() != self.config.tool_name {
                return Err(Error::Tool("memory tool identity mismatch".into()));
            }
            let context = ctx
                .get::<RunContext>()
                .ok_or_else(|| Error::Tool("memory tool requires a run context".into()))?;
            let operation = serde_json::from_value(args).map_err(|e| Error::Tool(e.to_string()))?;
            match (operation, ctx.get::<ToolOperation>()) {
                (MemoryOperation::Remember(request), Some(identity)) => self
                    .remember_for_tool(request, &context, identity, false)
                    .await?
                    .ok_or_else(|| Error::Tool("missing completed memory receipt".into())),
                (operation, _) => self.execute(operation, &context).await,
            }
        }
        .await;
        nofy_tool_runtime::terminal_only(
            result
                .map(|value| TypedToolOutput::from_value(id, value))
                .map_err(tool_error),
        )
    }
}

pub(super) fn can_lookup_remember(config: &MemoryModuleConfig, args: &Value) -> bool {
    args.get("operation").and_then(Value::as_str) == Some("remember")
        && config.operations.iter().any(|name| name == "remember")
}

fn operation_error(error: MemoryServiceError) -> Error {
    match error {
        MemoryServiceError::Internal(_) => Error::Tool("canonical memory operation failed".into()),
        error => Error::Tool(error.to_string()),
    }
}

fn tool_error(error: Error) -> ToolError {
    ToolError::custom("memory_operation", error.to_string())
}

fn request_schema(operation: &str) -> Value {
    let area = json!({"enum":["personal","project"]});
    let target = json!({"type":"object","additionalProperties":false,"required":["id"],"properties":{"id":{"type":"string"},"expected_hash":{"type":["string","null"]}}});
    let (required, properties) = match operation {
        "search" => (
            vec!["query", "max_results", "min_score"],
            json!({"query":{"type":"string","maxLength":16384},"max_results":{"type":"integer","minimum":1,"maximum":100},"min_score":{"type":"number","minimum":0,"maximum":1}}),
        ),
        "list" => (vec![], json!({"area":{"enum":["personal","project",null]}})),
        "get" | "explain" => return target,
        "remember" => (
            vec!["area", "statement", "confirm_sensitive"],
            json!({"area":area,"statement":{"type":"string","maxLength":65536},"title":{"type":["string","null"],"maxLength":1024},"confirm_sensitive":{"type":"boolean"}}),
        ),
        "revise" => (
            vec!["target", "replacement"],
            json!({"target":target,"replacement":{"type":"string","maxLength":65536}}),
        ),
        "forget" => (
            vec!["target", "confirmed"],
            json!({"target":target,"confirmed":{"type":"boolean"}}),
        ),
        "undo" => (
            vec!["operation_id", "generation"],
            json!({"operation_id":{"type":"string"},"generation":{"type":"integer","minimum":0}}),
        ),
        "snapshot" => (
            vec!["max_items"],
            json!({"query":{"type":["string","null"],"maxLength":16384},"max_items":{"type":"integer","minimum":1,"maximum":100}}),
        ),
        "capture" => (
            vec!["durable_turn_id"],
            json!({"durable_turn_id":{"type":"string"}}),
        ),
        "consolidate" => (
            vec!["area", "mode"],
            json!({"area":area,"mode":{"enum":["record_only","shadow","active"]}}),
        ),
        _ => unreachable!("configuration validated"),
    };
    json!({"type":"object","additionalProperties":false,"required":required,"properties":properties})
}
