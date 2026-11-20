use super::*;
use nofy_agent_runtime::{
    Error, RunContext, ToolCatalog, ToolEntry,
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind},
};
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput, terminal_only,
};
use nofy_tool_types::ToolDefinition;
use std::{collections::BTreeMap, sync::Weak};

pub(crate) struct Factory(pub(crate) Weak<Authoring>);

impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.sdk_feature".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }

    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let mut catalog = ToolCatalog::new();
        let dispatch = Arc::new(Dispatch(self.0.clone()));
        let text = json!({"type":"string","minLength":1,"maxLength":4096});
        let revision = json!({"type":"object","required":["revision"],"additionalProperties":false,"properties":{"revision":{"type":"integer","minimum":1}}});
        let http = json!({"type":"object","additionalProperties":false,"required":["tool_name","description","input_schema","direct_path","catalog_path","invoke_path"],"properties":{
            "tool_name":text,"description":text,"input_schema":{"type":"object"},"direct_path":text,"catalog_path":text,"invoke_path":text}});
        let workflow_node = json!({"type":"object","additionalProperties":false,"required":["id","input"],"properties":{
            "id":text,"needs":{"type":"array","maxItems":3,"uniqueItems":true,"items":text,
                "description":"IDs of predecessor nodes. Include any node whose output your input reads."},"input":{"type":"object"}}});
        let extensions = json!({"type":"object","description":"Required when the operator asks for Workflow, Memory and Policy.","additionalProperties":false,"required":["workflow","policy"],"properties":{
            "workflow":{"type":"object","required":["description","input_schema","nodes","output"],"properties":{
                "description":text,"input_schema":{"type":"object"},
                "nodes":{"type":"array","minItems":1,"maxItems":4,"description":"Each node invokes the declared Rhai tool. {\"from\":\"input\"} forwards workflow arguments. {\"from\":\"node\",\"node\":\"earlier_id\"} reads a predecessor declared under needs.","items":workflow_node},
                "output":{"type":"object","description":"A binding such as {\"from\":\"node\",\"node\":\"selected_id\"}. The mounted feature_workflow tool wraps its workflow input in a required input field. Each node binding sees the object inside that field."}}},
            "policy":{"type":"object","required":["id","operation","decision"],"properties":{"id":text,"operation":{"const":"remember"},"decision":{"const":"ask"}}}
        }});
        let design = json!({"type":"object","additionalProperties":false,
            "required":["prompt","skill_name","skill_description","skill_body","tool_name","tool_description","tool_input_schema","tool_source","hook_source","mcp_tool"],
            "properties":{"prompt":text,"skill_name":text,"skill_description":text,"skill_body":text,"tool_name":text,
                "tool_description":text,"tool_input_schema":{"type":"object"},
                "tool_source":{"type":"string","minLength":1,"maxLength":4096,"description":"Pure Rhai script. Read fields as args.field and return a map with #{field: expression}. Values already have the types declared in the input schema."},
                "hook_source":{"type":"string","minLength":1,"maxLength":4096,"description":"Pure Rhai before_model Hook. For an observer the full source can be #{decision: \"continue\"}."},
                "mcp_tool":text,"extensions":extensions}});
        let mut http_design = design.clone();
        http_design["required"]
            .as_array_mut()
            .expect("static required fields")
            .push(json!("http"));
        http_design["properties"]["http"] = http;
        http_design["properties"]
            .as_object_mut()
            .expect("static design fields")
            .remove("extensions");
        for (name, description, parameters) in [
            (
                "sdk_feature_catalog",
                "List the registered factories and the ones available to this feature grant. Supply a factory name to get its declaration schema and dependency ports.",
                json!({"type":"object","additionalProperties":false,"properties":{"factory":{"type":"string","maxLength":128}}}),
            ),
            (
                "sdk_feature_create",
                "Compile and save your specialized Agent draft under the operator grant. Skill body and prompt are instructions you author. Each Rhai source is evaluated directly with args already bound. The last expression is the result. Supply a top-level script rather than a function definition. The granted MCP tool is exposed as facts_<mcp_tool>.",
                design,
            ),
            (
                "sdk_feature_create_http",
                "Create a specialized Agent with the operator-granted direct HTTP tool and discovered HTTP catalog. Author the prompt, named Skill, and Rhai Tool and Hook. Supply raw Rhai scripts with the result as the last expression. Rhai map literals use #{key: value}; the before_model Hook returns a map with a decision field. Include the HTTP design in the required http object. Read the grant with sdk_feature_catalog.",
                http_design,
            ),
            (
                "sdk_feature_verify",
                "Run the operator's acceptance cases against the exact draft revision. Returns actual output, successful tools and Hook execution.",
                revision.clone(),
            ),
            (
                "sdk_feature_publish",
                "Publish and activate only an exact revision whose acceptance cases passed. Returns release and generation.",
                revision,
            ),
        ] {
            catalog.insert(ToolEntry {
                definition: ToolDefinition::function(name, Some(description), parameters),
                dispatch: dispatch.clone(),
            })?;
        }
        Ok(ModuleInstance::ToolPack(catalog))
    }
}

struct Dispatch(Weak<Authoring>);

#[async_trait::async_trait]
impl ToolDispatch for Dispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let owner = self.0.upgrade().ok_or(HostError::Forbidden)?;
            let grant = owner.0.get().ok_or(HostError::Forbidden)?;
            let ctx = context.get::<RunContext>().ok_or(HostError::Forbidden)?;
            grant.authorize(&ctx.run_id).await?;
            let invalid = |error: serde_json::Error| HostError::Invalid(error.to_string());
            match id.as_str() {
                "sdk_feature_catalog" => {
                    let request: Catalog = serde_json::from_value(args).map_err(invalid)?;
                    let descriptors = grant.registry.descriptors();
                    if let Some(factory) = request.factory {
                        descriptors.into_iter().find(|descriptor| descriptor.factory == factory)
                            .map(|descriptor| json!(descriptor)).ok_or(HostError::NotFound)
                    } else {
                        Ok(json!({"registered":descriptors.iter().map(|descriptor| &descriptor.factory).collect::<Vec<_>>(),
                            "authoring":{"skill":true,"local_tool":true,"hook":true,"mcp_tool":grant.auth.mcp_tool,
                            "workflow_memory_policy":grant.auth.extensions.is_some(),"workflow_tool_input":grant.auth.extensions.as_ref().map(|_| "feature_workflow arguments are {\"input\": <value matching the declared workflow input_schema>}"),"http":grant.auth.http.as_ref().map(|http|json!({
                                "direct_path":http.direct_path,"catalog_path":http.catalog_path,"invoke_path":http.invoke_path,"discovered_tool":http.discovered_tool}))}}))
                    }
                }
                    "sdk_feature_create" | "sdk_feature_create_http" => {
                    grant
                        .design(serde_json::from_value(args).map_err(invalid)?)
                        .await
                }
                "sdk_feature_verify" => {
                    grant
                        .verify(
                            serde_json::from_value::<Revision>(args)
                                .map_err(invalid)?
                                .revision,
                        )
                        .await
                }
                "sdk_feature_publish" => {
                    grant
                        .publish(
                            serde_json::from_value::<Revision>(args)
                                .map_err(invalid)?
                                .revision,
                        )
                        .await
                }
                _ => Err(HostError::NotFound),
            }
        }
        .await;
        terminal_only(
            result
                .map(|v| TypedToolOutput::from_value(id, v))
                .map_err(|error| ToolError::custom("sdk_feature", error.to_string())),
        )
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Catalog {
    factory: Option<String>,
}
