//! Instance-scoped catalog over the existing tool dispatch contract.
pub mod compose;
use crate::{Error, RunContext};
use nofy_tool_runtime::{
    Tool, ToolCallContext, ToolDispatch, ToolDyn, ToolStream, TypedToolOutput,
};
use nofy_tool_types::ToolDefinition;
use std::{collections::BTreeMap, sync::Arc};

struct TypedDispatch<T>(T);

#[async_trait::async_trait]
impl<T: Tool + 'static> ToolDispatch for TypedDispatch<T> {
    async fn call(
        &self,
        _id: nofy_tool_protocol::ToolId,
        args: serde_json::Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        ToolDyn::execute(&self.0, ctx, args).await
    }
}

impl ToolEntry {
    pub fn typed<T: Tool + 'static>(tool: T) -> Self {
        let description = Tool::description(&tool, &Default::default());
        Self {
            definition: ToolDefinition::function(
                description.name,
                Some(description.description),
                description
                    .arguments_schema
                    .unwrap_or_else(|| serde_json::json!({"type":"object"})),
            ),
            dispatch: Arc::new(TypedDispatch(tool)),
        }
    }
}

#[derive(Clone)]
pub struct ToolEntry {
    pub definition: ToolDefinition,
    pub dispatch: Arc<dyn ToolDispatch>,
}

#[derive(Clone, Default)]
pub struct ToolCatalog {
    entries: BTreeMap<String, ToolEntry>,
}

impl ToolCatalog {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn insert(&mut self, entry: ToolEntry) -> Result<(), Error> {
        if entry.dispatch.is_resumable()
            && entry
                .dispatch
                .recovery_identity()
                .is_none_or(|id| id.trim().is_empty())
        {
            return Err(Error::Composition(
                "resumable dispatch requires an immutable recovery identity".into(),
            ));
        }
        nofy_tool_protocol::ToolId::new(entry.definition.function.name.clone())
            .map_err(|e| Error::Composition(format!("invalid tool name: {e}")))?;
        validate_schema(&entry.definition.function.parameters)?;
        let name = entry.definition.function.name.clone();
        if self.entries.contains_key(&name) {
            return Err(Error::Composition(format!("duplicate tool: {name}")));
        }
        self.entries.insert(name, entry);
        Ok(())
    }

    pub fn definitions(&self) -> Vec<ToolDefinition> {
        self.entries
            .values()
            .map(|e| e.definition.clone())
            .collect()
    }

    pub fn names(&self) -> Vec<String> {
        self.entries.keys().cloned().collect()
    }

    pub fn recovery_modes(&self) -> BTreeMap<String, (bool, Option<String>)> {
        self.entries
            .iter()
            .map(|(name, entry)| {
                (
                    name.clone(),
                    (
                        entry.dispatch.is_resumable(),
                        entry.dispatch.recovery_identity(),
                    ),
                )
            })
            .collect()
    }

    pub fn get(&self, name: &str) -> Option<&ToolEntry> {
        self.entries.get(name)
    }

    pub fn extend(&mut self, other: Self) -> Result<(), Error> {
        if let Some(name) = other
            .entries
            .keys()
            .find(|name| self.entries.contains_key(*name))
        {
            return Err(Error::Composition(format!("duplicate tool: {name}")));
        }
        self.entries.extend(other.entries);
        Ok(())
    }
}

pub(crate) fn validate_schema(schema: &serde_json::Value) -> Result<(), Error> {
    crate::schema::compiled(schema).map(|_| ())
}

pub fn call_context(id: &str, context: &RunContext) -> Result<ToolCallContext, Error> {
    let mut clean = context.clone();
    clean
        .capabilities
        .remove::<crate::mailbox::UserToolInvocation>();
    let call_id = nofy_tool_protocol::ToolCallId::new(id.to_string())
        .map_err(|e| Error::Tool(e.to_string()))?;
    let mut ctx = ToolCallContext::new(call_id);
    ctx.extensions = clean.capabilities.clone();
    ctx.insert(nofy_tool_runtime::Cancellation(context.cancel.clone()));
    ctx.insert(nofy_tool_runtime::SessionContext(context.thread_id.clone()));
    ctx.insert(clean);
    Ok(ctx)
}

pub(crate) fn operation_key(
    state: &crate::RunState,
    context: &RunContext,
    call: &crate::ToolCall,
) -> Result<String, Error> {
    if let Some(operation) = crate::mailbox::command_operation(state, context, call)? {
        return Ok(operation);
    }
    serde_json::to_string(&(
        "tool",
        &context.thread_id,
        &context.run_id,
        state.model_sequence,
        &call.id,
    ))
    .map_err(|e| Error::Checkpoint(e.to_string()))
}

/// A source publishes an immutable catalog for one run. Revision identifies the
/// connection/configuration as well as schema; dispatchers must pin that binding.
#[derive(Clone)]
pub struct ToolSnapshot {
    pub revision: String,
    pub catalog: ToolCatalog,
}
#[async_trait::async_trait]
pub trait ToolSource: Send + Sync {
    async fn snapshot(&self, context: &RunContext) -> Result<ToolSnapshot, Error>;
}
