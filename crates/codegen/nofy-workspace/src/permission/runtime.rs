//! Public runtime adapter over the existing permission actor. Applications
//! install this as a required host policy; the old shell fire sites stay owned
//! by the old shell and must not additionally install it for the same call.
use super::types::RequestPathContext;
use super::{AccessKind, Decision, PermissionHandle};
use nofy_agent_runtime::{Admission, Error, Policy, RunContext, RunState, ToolCall};
use std::{collections::BTreeMap, path::PathBuf, sync::Arc};

/// Client aliases are resolved by host configuration, never inferred as an
/// unguarded tool. Unknown tools go through the actor's MCP/custom-tool gate.
pub struct NofyPermissionPolicy {
    handle: PermissionHandle,
    aliases: BTreeMap<String, String>,
    cwd: PathBuf,
}
impl NofyPermissionPolicy {
    pub fn new(
        handle: PermissionHandle,
        aliases: BTreeMap<String, String>,
        cwd: PathBuf,
    ) -> Result<Self, Error> {
        if !cwd.is_absolute() {
            return Err(Error::Composition(
                "permission workspace cwd must be absolute".into(),
            ));
        }
        Ok(Self {
            handle,
            aliases,
            cwd,
        })
    }
    fn access(&self, call: &ToolCall) -> AccessKind {
        self.classify(&call.name, &call.arguments, 0)
    }
    fn classify(&self, name: &str, arguments: &serde_json::Value, depth: usize) -> AccessKind {
        classify_access(name, arguments, &self.aliases, depth)
    }
}
#[async_trait::async_trait]
impl Policy for NofyPermissionPolicy {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        let update = agent_client_protocol::ToolCallUpdate::new(
            agent_client_protocol::ToolCallId::new(Arc::<str>::from(call.id.as_str())),
            agent_client_protocol::ToolCallUpdateFields::default(),
        );
        let cwd = context
            .capabilities
            .get::<nofy_tool_runtime::Cwd>()
            .map(|cwd| cwd.0.clone())
            .unwrap_or_else(|| self.cwd.clone());
        let request = self.handle.request_with_path_context(
            self.access(call),
            update,
            Some(RequestPathContext {
                real_cwd: cwd,
                display_cwd: None,
            }),
            Some(context.thread_id.clone()),
            None,
            None,
        );
        let decision = tokio::select! {biased;
            _=context.cancel.cancelled()=>Decision::Cancelled,
            decision=request=>decision,
        };
        Ok(match decision {
            Decision::Allow => Admission::Allow,
            Decision::Reject(reason)
            | Decision::PolicyDeny(reason)
            | Decision::FollowupMessage(reason) => Admission::Deny(reason),
            Decision::Ask => Admission::Pause(
                serde_json::json!({"kind":"permission_required","call_id":call.id}),
            ),
            Decision::Cancelled => {
                context.cancel.cancel();
                Admission::Pause(serde_json::json!({"kind":"cancelled"}))
            }
        })
    }
}

pub mod skill_scope;

fn classify_access(
    name: &str,
    arguments: &serde_json::Value,
    aliases: &BTreeMap<String, String>,
    depth: usize,
) -> AccessKind {
    let canonical = aliases.get(name).map(String::as_str).unwrap_or(name);
    if canonical == "use_tool"
        && depth < 8
        && let (Some(target), Some(input)) = (
            arguments
                .get("tool_name")
                .and_then(serde_json::Value::as_str),
            arguments.get("tool_input"),
        )
    {
        return classify_access(target, input, aliases, depth + 1);
    }
    let path = || {
        arguments
            .get("file_path")
            .or_else(|| arguments.get("path"))
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned)
    };
    match canonical {
        "read_file" | "read" => AccessKind::Read(path()),
        "grep" | "glob" | "list_dir" => AccessKind::Grep {
            path: path(),
            glob: arguments
                .get("glob")
                .and_then(serde_json::Value::as_str)
                .map(str::to_owned),
        },
        _ => super::access_kind_for_hub_tool(canonical, arguments).unwrap_or_else(|| {
            AccessKind::MCPTool {
                name: name.to_owned(),
                input: arguments.clone(),
            }
        }),
    }
}
