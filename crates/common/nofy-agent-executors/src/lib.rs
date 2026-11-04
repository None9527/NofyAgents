//! Optional executable adapters. Factories only bind host-installed resources;
//! compilation never connects, resolves credentials or launches a process.
#[cfg(feature = "rhai")]
pub mod code;
pub mod config;
pub mod declarative;
pub mod hooks;
pub mod http;
pub mod mcp;
pub mod process;
pub mod resources;

use nofy_agent_runtime::{Error, ToolCatalog, ToolEntry};
use nofy_tool_runtime::{ToolDispatch, ToolError};
use serde_json::Value;
use std::sync::Arc;

pub(crate) fn tool_error(code: &str, message: impl Into<String>) -> ToolError {
    ToolError::custom(code, message)
}
pub(crate) fn composition(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}
pub(crate) fn catalog(
    contract: &config::ToolContract,
    dispatch: Arc<dyn ToolDispatch>,
) -> Result<ToolCatalog, Error> {
    contract.validate()?;
    let mut catalog = ToolCatalog::new();
    catalog.insert(ToolEntry {
        definition: nofy_tool_types::ToolDefinition::function(
            &contract.name,
            Some(&contract.description),
            contract.input_schema.clone(),
        ),
        dispatch,
    })?;
    Ok(catalog)
}

pub(crate) fn validate_input(
    contract: &config::ToolContract,
    input: &Value,
) -> Result<(), ToolError> {
    nofy_agent_runtime::settings::validate_json_value(&contract.input_schema, input)
        .map_err(|e| tool_error("invalid_arguments", e.to_string()))?;
    let size = serde_json::to_vec(input)
        .map_err(|_| tool_error("invalid_arguments", "input is not JSON"))?
        .len();
    if size > contract.max_input_bytes {
        return Err(tool_error(
            "input_limit",
            "tool input exceeds configured byte limit",
        ));
    }
    Ok(())
}

pub(crate) fn output(contract: &config::ToolContract, value: Value) -> Result<Value, ToolError> {
    let value = if let Some(pointer) = &contract.output_pointer {
        value
            .pointer(pointer)
            .cloned()
            .ok_or_else(|| tool_error("output_mapping", "output pointer does not exist"))?
    } else {
        value
    };
    nofy_agent_runtime::settings::validate_json_value(&contract.output_schema, &value)
        .map_err(|e| tool_error("invalid_output", e.to_string()))?;
    Ok(value)
}
