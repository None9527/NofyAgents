//! Read-only discovery plus revision-pinned calls over an admitted connection.
use super::*;
use nofy_agent_runtime::{RunContext, ToolCatalog, ToolEntry, ToolSource, tools::ToolSnapshot};
use nofy_tool_protocol::ToolId;
use nofy_tool_types::ToolDefinition;

pub struct HttpToolSourceFactory;
fn timeout() -> u64 {
    30_000
}
fn bytes() -> usize {
    1_048_576
}
#[derive(Clone, Deserialize, serde::Serialize)]
#[serde(deny_unknown_fields)]
struct Config {
    catalog_path: String,
    invoke_path: String,
    #[serde(default)]
    query: BTreeMap<String, Value>,
    #[serde(default)]
    credential_ref: Option<String>,
    #[serde(default = "timeout")]
    timeout_ms: u64,
    #[serde(default = "bytes")]
    max_input_bytes: usize,
    #[serde(default = "bytes")]
    max_output_bytes: usize,
}
impl Config {
    fn contract(&self, name: &str) -> ToolContract {
        ToolContract {
            name: name.into(),
            description: String::new(),
            effect: Default::default(),
            input_schema: json!({"type":"object"}),
            output_schema: json!({}),
            output_pointer: None,
            timeout_ms: self.timeout_ms,
            max_input_bytes: self.max_input_bytes,
            max_output_bytes: self.max_output_bytes,
        }
    }
}
impl ModuleFactory for HttpToolSourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool_source.http",
            ModuleKind::ToolSource,
            json!({"type":"object","additionalProperties":false,"required":["catalog_path","invoke_path"],"properties":{
                "catalog_path":{"type":"string","minLength":1,"maxLength":16384},
                "invoke_path":{"type":"string","minLength":1,"maxLength":16384},
                "query":{"type":"object","additionalProperties":{"type":["string","number","boolean"]}},
                "credential_ref":{"type":["string","null"],"minLength":1,"maxLength":128},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},
                "max_input_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_output_bytes":{"type":"integer","minimum":1,"maximum":16777216}
            }}),
            BTreeMap::from([("connection".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| crate::composition(e.to_string()))?;
        config.contract("catalog_list").validate()?;
        let Some(ModuleInstance::Resource(handle)) = dependencies.get("connection") else {
            return Err(crate::composition(
                "HTTP source requires its connection resource",
            ));
        };
        let resource = handle
            .get::<HttpResource>()
            .ok_or_else(|| crate::composition("HTTP source connection has another type"))?;
        for method in [Method::Get, Method::Post] {
            if !resource.config.methods.contains(&method) {
                return Err(crate::composition(
                    "HTTP source requires admitted GET and POST methods",
                ));
            }
        }
        if config
            .credential_ref
            .as_ref()
            .is_some_and(|reference| !resource.config.credential_refs.contains(reference))
        {
            return Err(crate::composition(
                "HTTP source credential reference is not admitted",
            ));
        }
        crate::http::connection::endpoint(&resource.base, &config.catalog_path)?;
        crate::http::connection::endpoint(&resource.base, &config.invoke_path)?;
        let identity = nofy_agent_runtime::system::content_digest(&(
            "http-source/v1",
            &config,
            handle.identity(),
        ))?;
        Ok(ModuleInstance::ToolSource(Arc::new(HttpSource {
            config,
            resource,
            identity,
        })))
    }
}
struct HttpSource {
    config: Config,
    resource: Arc<HttpResource>,
    identity: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Catalog {
    revision: String,
    tools: Vec<ToolDefinition>,
}
#[async_trait::async_trait]
impl ToolSource for HttpSource {
    async fn snapshot(&self, context: &RunContext) -> Result<ToolSnapshot, Error> {
        let mut contract = self.config.contract("catalog_list");
        contract.effect = config::EffectSemantics::ReadOnly;
        let query = ConnectedDispatch {
            resource: self.resource.clone(),
            config: ToolConfig {
                contract,
                path: self.config.catalog_path.clone(),
                method: Method::Get,
                input: JsonBinding::Literal {
                    value: json!(self.config.query),
                },
                credential_ref: self.config.credential_ref.clone(),
            },
        };
        let call_context = nofy_agent_runtime::tools::call_context(
            &format!("catalog_{}", self.identity),
            context,
        )?;
        // Discovery is a repeatable resource read. Business calls below use the
        // ordinary runtime tool admission, receipt and uncertain-effect rail.
        let output = nofy_agent_runtime::governance::await_resource(context, async {
            query
                .call_terminal(
                    ToolId::new("catalog_list").expect("static tool ID"),
                    json!({}),
                    call_context,
                )
                .await
                .map_err(|e| Error::Tool(e.to_string()))
        })
        .await?;
        let remote: Catalog = serde_json::from_value(output.value)
            .map_err(|e| crate::composition(format!("invalid HTTP catalog: {e}")))?;
        if remote.revision.trim().is_empty()
            || remote.revision.len() > 4096
            || remote.tools.len() > 1024
        {
            return Err(crate::composition(
                "HTTP catalog requires a bounded version and at most 1024 tools",
            ));
        }
        let revision = serde_json::to_string(&("http-source/v1", &self.identity, &remote.revision))
            .map_err(|e| crate::composition(e.to_string()))?;
        let mut catalog = ToolCatalog::new();
        for definition in remote.tools {
            let name = definition.function.name.clone();
            let mut contract = self.config.contract(&name);
            contract.input_schema = definition.function.parameters.clone();
            contract.output_schema = json!({"type":"object","required":["revision","value"],"additionalProperties":false,"properties":{"revision":{"const":remote.revision},"value":{}}});
            let fields = BTreeMap::from([
                (
                    "revision".into(),
                    JsonBinding::Literal {
                        value: json!(remote.revision),
                    },
                ),
                ("tool".into(), JsonBinding::Literal { value: json!(name) }),
                ("arguments".into(), JsonBinding::default()),
            ]);
            catalog.insert(ToolEntry {
                definition,
                dispatch: Arc::new(PinnedDispatch {
                    name,
                    inner: ConnectedDispatch {
                        resource: self.resource.clone(),
                        config: ToolConfig {
                            contract,
                            path: self.config.invoke_path.clone(),
                            method: Method::Post,
                            input: JsonBinding::Object { fields },
                            credential_ref: self.config.credential_ref.clone(),
                        },
                    },
                }),
            })?;
        }
        Ok(ToolSnapshot { revision, catalog })
    }
}
struct PinnedDispatch {
    name: String,
    inner: ConnectedDispatch,
}
#[async_trait::async_trait]
impl ToolDispatch for PinnedDispatch {
    async fn call(
        &self,
        id: ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = if id.as_str() != self.name {
            Err(crate::tool_error(
                "catalog_binding",
                "call differs from its pinned tool",
            ))
        } else {
            self.inner
                .call_terminal(id.clone(), args, context)
                .await
                .and_then(|output| {
                    output
                        .value
                        .get("value")
                        .cloned()
                        .map(|value| TypedToolOutput::from_value(id, value))
                        .ok_or_else(|| {
                            crate::tool_error("catalog_binding", "pinned result is missing")
                        })
                })
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
