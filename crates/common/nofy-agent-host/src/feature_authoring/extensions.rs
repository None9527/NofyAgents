use super::*;
use nofy_agent_runtime::{supervisor::ApprovalRequest, workflow::spec::ValueBinding};

#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeatureExtensions {
    pub memory_namespace: String,
    pub memory_project_id: String,
    pub approved_note: String,
}

impl FeatureExtensions {
    pub(super) fn valid(&self) -> bool {
        valid_name(&self.memory_namespace)
            && !self.approved_note.trim().is_empty()
            && self.approved_note.len() <= 1024
    }

    pub(super) fn authorizes(&self, request: &ApprovalRequest) -> bool {
        let args = &request.call.arguments;
        request.call.name == "memory"
            && request.policy_id.is_some()
            && args["operation"] == "remember"
            && args["request"]["area"] == "project"
            && args["request"]["statement"] == self.approved_note
            && args["request"]["confirm_sensitive"].as_bool() != Some(true)
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Design {
    workflow: Workflow,
    policy: Policy,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Workflow {
    description: String,
    input_schema: Value,
    nodes: Vec<Node>,
    output: ValueBinding,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Node {
    id: String,
    #[serde(default)]
    needs: Vec<String>,
    input: ValueBinding,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Policy {
    id: String,
    operation: String,
    decision: String,
}

impl Design {
    pub(super) fn modules(
        &self,
        grant: &FeatureExtensions,
        tool: &str,
        r: &impl Fn(&str) -> ModuleRef,
    ) -> Result<Vec<Value>> {
        let workflow = &self.workflow;
        let policy = &self.policy;
        if !(1..=4).contains(&workflow.nodes.len())
            || workflow.description.trim().is_empty()
            || workflow.description.len() > 1024
            || !workflow.input_schema.is_object()
            || !valid_name(&policy.id)
            || policy.operation != "remember"
            || policy.decision != "ask"
        {
            return Err(HostError::Invalid(
                "invalid workflow or approval policy under this grant".into(),
            ));
        }
        let nodes: Vec<_> = workflow
            .nodes
            .iter()
            .map(|node| {
                json!({
                    "id":node.id,"needs":node.needs,"input":node.input,
                    "action":{"kind":"tool","runtime":r("workflow-runtime"),"tool":tool}
                })
            })
            .collect();
        Ok(vec![
            json!({"reference":r("workflow"),"factory":"resource.workflow","config":{
                "bindings":{"calculator":"tool_pack"},
                "document":{"host":{"name":"feature-workflow-host"},"entry":r("workflow-entry"),
                    "tool_runtimes":[{"reference":r("workflow-runtime"),
                        "definition":{"name":"feature-workflow-runtime","tool_packs":[r("tool")]}}],
                    "workflows":[{"reference":r("workflow-entry"),"input_schema":workflow.input_schema,
                        "output_schema":true,"parallelism":1,"nodes":nodes,"output":workflow.output}]}},
                "dependencies":{"calculator":r("tool")}}),
            json!({"reference":r("workflow-tool"),"factory":"tool.workflow_connected",
                "config":{"name":"feature_workflow","description":workflow.description},
                "dependencies":{"workflow":r("workflow")}}),
            json!({"reference":r("memory-store"),"factory":"resource.memory","config":{
                "backend":{"namespace":grant.memory_namespace,"project_id":grant.memory_project_id,
                    "search":{"min_score":0,"text_weight":1,"vector_weight":0}},
                "grants":{"read":["project"],"write":["project"]}}}),
            json!({"reference":r("memory-tools"),"factory":"tool.memory_connected",
                "config":{"read":["project"],"write":["project"],"operations":["remember","list"]},
                "dependencies":{"connection":r("memory-store")}}),
            json!({"reference":r("memory-context"),"factory":"context.memory_connected",
                "config":{"read":["project"],"max_items":5},"dependencies":{"connection":r("memory-store")}}),
            json!({"reference":r("approval"),"factory":"policy.approval","config":{}}),
            json!({"reference":r("policy"),"factory":"policy.tool_rules","config":{
                "default":"allow","unknown_command":"deny","rules":[{"id":policy.id,"action":policy.decision,
                    "tools":["memory"],"arguments_schema":{"type":"object","required":["operation"],
                        "properties":{"operation":{"const":policy.operation}}}}]},
                "dependencies":{"approval":r("approval")}}),
        ])
    }
}
