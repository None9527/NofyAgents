//! Presentation and admission policy for the model-facing `model` argument.

/// Canonical parameter name before client-side remapping.
pub const MODEL_PARAM: &str = "model";

/// Whether a task may select a child model or must inherit the parent model.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskModelSelection {
    #[default]
    Selectable,
    Inherited,
}

/// Typed task policy merged into `ToolConfig.params` at agent construction.
#[derive(Debug, Clone, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct TaskParams {
    #[serde(default)]
    pub model_selection: TaskModelSelection,
}

crate::register_resource!("nofy_build", "TaskParams", TaskParams);

fn selection_from_params(effective_params: &serde_json::Value) -> TaskModelSelection {
    serde_json::from_value::<TaskParams>(effective_params.clone())
        .map(|params| params.model_selection)
        .unwrap_or_else(|error| {
            tracing::warn!(%error, "task params did not parse; keeping explicit model selection");
            TaskModelSelection::default()
        })
}

fn exported_input_schema(
    input_schema: &serde_json::Value,
    selection: TaskModelSelection,
) -> serde_json::Value {
    let mut schema = input_schema.clone();
    if selection == TaskModelSelection::Selectable {
        return schema;
    }
    if let Some(object) = schema.as_object_mut() {
        if let Some(properties) = object.get_mut("properties").and_then(|v| v.as_object_mut()) {
            properties.remove(MODEL_PARAM);
        }
        if let Some(required) = object.get_mut("required").and_then(|v| v.as_array_mut()) {
            required.retain(|name| name.as_str() != Some(MODEL_PARAM));
        }
    }
    schema
}

pub fn task_versioned_definition(
    client_name: &str,
    description_override: Option<&str>,
    description_template: &str,
    renderer: &crate::types::template_renderer::TemplateRenderer,
    param_map: &std::collections::HashMap<String, String>,
    input_schema: &serde_json::Value,
    effective_params: &serde_json::Value,
) -> crate::types::definition::ToolDefinition {
    let raw_description = description_override.unwrap_or(description_template);
    let description = renderer.render(raw_description).unwrap_or_else(|error| {
        crate::types::template_renderer::strip_markers_on_render_failure(raw_description, &error)
    });
    let schema = exported_input_schema(input_schema, selection_from_params(effective_params));
    let schema = if param_map.is_empty() {
        schema
    } else {
        crate::util::remap::remap_schema_properties(&schema, param_map)
    };
    crate::types::definition::ToolDefinition::function(client_name, Some(&description), schema)
}

pub fn hidden_selection_message(param_name: &str) -> String {
    format!(
        "Explicit subagent model selection is disabled for this session. Retry without the \
         {param_name} argument; the child will inherit the parent model."
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn inherited_selection_removes_model_from_schema() {
        let schema = serde_json::json!({
            "type": "object",
            "properties": { "prompt": { "type": "string" }, "model": { "type": "string" } },
            "required": ["prompt", "model"]
        });
        let hidden = exported_input_schema(&schema, TaskModelSelection::Inherited);
        assert!(hidden["properties"].get("model").is_none());
        assert_eq!(hidden["required"], serde_json::json!(["prompt"]));
        assert!(
            exported_input_schema(&schema, TaskModelSelection::Selectable)["properties"]
                .get("model")
                .is_some()
        );
    }
}
