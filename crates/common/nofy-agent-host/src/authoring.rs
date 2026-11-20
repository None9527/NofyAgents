//! Local tooling for the Omni Agent. The transport and management identity are
//! outside the model's tool catalog.
use nofy_agent_client::{Toolset, authoring, operation, schema, validate};
use nofy_agent_project::repository::ModuleStore;
use nofy_agent_runtime::{
    Error, ToolCatalog, ToolEntry,
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind},
};
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput,
    dispatch::ApprovalEffect, terminal_only,
};
use nofy_tool_types::ToolDefinition;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};

pub(crate) struct AuthoringFactory(pub ModuleStore);

impl ModuleFactory for AuthoringFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.sdk_authoring".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }

    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let input = |name| {
            operation(name)
                .and_then(|descriptor| schema(&descriptor.input_schema))
                .map_err(|error| Error::Composition(error.to_string()))
        };
        let dispatch = Arc::new(AuthoringTools(self.0.clone()));
        let mut catalog = ToolCatalog::new();
        for (name, description, parameters) in [
            (
                "sdk_schema",
                "Read the input, output and guide for a Nofy SDK operation.",
                json!({"type":"object","additionalProperties":false,"required":["operation"],"properties":{"operation":{"type":"string","minLength":1,"maxLength":128}}}),
            ),
            (
                "sdk_module_template",
                "Generate a local, editable Nofy module package template. Returns source without publishing it.",
                input("module.template")?,
            ),
            (
                "sdk_module_list",
                "List versioned packages in this Nofy Host's module catalog.",
                input("module.list")?,
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

struct AuthoringTools(ModuleStore);

#[async_trait::async_trait]
impl ToolDispatch for AuthoringTools {
    fn approval_effect(&self) -> ApprovalEffect {
        ApprovalEffect::ReadOnly
    }

    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        _: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = self.execute(id.as_str(), &args).await;
        terminal_only(result.map(|result| TypedToolOutput::from_value(id, result)))
    }
}

impl AuthoringTools {
    async fn execute(&self, tool: &str, args: &Value) -> Result<Value, ToolError> {
        let invalid =
            |error: nofy_agent_client::Error| ToolError::invalid_arguments(error.to_string());
        match tool {
            "sdk_schema" => {
                let name = args["operation"]
                    .as_str()
                    .filter(|name| !name.is_empty() && name.len() <= 128);
                let name = name
                    .filter(|_| args.as_object().is_some_and(|object| object.len() == 1))
                    .ok_or_else(|| {
                        ToolError::invalid_arguments("sdk_schema expects an operation name")
                    })?;
                Ok(
                    authoring::operation_schema(Toolset::Development.sdk(), name)
                        .map_err(invalid)?
                        .data,
                )
            }
            "sdk_module_template" => Ok(authoring::module_template(args).map_err(invalid)?.data),
            "sdk_module_list" => {
                validate("module.list", args).map_err(invalid)?;
                let repository = args["repository"].as_str().map(str::to_owned);
                let after = args["after"].as_str().unwrap_or_default().to_owned();
                let limit = args["limit"].as_u64().unwrap_or(32) as usize;
                let store = self.0.clone();
                tokio::task::spawn_blocking(move || {
                    store.packages(repository.as_deref(), &after, limit)
                })
                .await
                .map_err(|_| ToolError::custom("sdk_catalog", "module catalog worker failed"))?
                .map_err(|error| ToolError::custom("sdk_catalog", error.to_string()))
            }
            _ => Err(ToolError::invalid_arguments("unknown SDK authoring tool")),
        }
    }
}
