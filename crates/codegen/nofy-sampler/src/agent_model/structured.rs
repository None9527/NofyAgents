use super::*;
pub const TOOL: &str = "StructuredOutput";
pub fn tool_schema(schema: &Value) -> Value {
    // Keep the answer schema at its own resource root when validating it.
    // Embedding it here would change the meaning of local refs such as '#'.
    json!({"type":"object","properties":{"value":{"description":format!("The final answer must match this JSON schema: {schema}")}},"required":["value"],"additionalProperties":false})
}

/// Finalization is a pure protocol operation. Real tools are returned to the
/// runtime's guarded dispatcher, never executed inside the model adapter.
pub fn finalize(
    schema: &Value,
    response: &ConversationResponse,
) -> Result<Option<(Value, Option<String>)>, String> {
    let calls = response.tool_calls();
    let finalizers: Vec<_> = calls.iter().filter(|call| call.name == TOOL).collect();
    let (value, call_id) = if !finalizers.is_empty() {
        if finalizers.len() != 1 || calls.len() != 1 {
            return Err("structured finalization must be the only tool call".into());
        }
        let arguments: Value = serde_json::from_str(&finalizers[0].arguments)
            .map_err(|e| format!("invalid structured arguments: {e}"))?;
        nofy_agent_runtime::settings::validate_json_value(&tool_schema(schema), &arguments)
            .map_err(|e| e.to_string())?;
        (
            arguments["value"].clone(),
            Some(finalizers[0].id.to_string()),
        )
    } else if !calls.is_empty() {
        return Ok(None);
    } else {
        (
            serde_json::from_str(&response.assistant_text())
                .map_err(|e| format!("answer is not JSON: {e}"))?,
            None,
        )
    };
    nofy_agent_runtime::settings::validate_json_value(schema, &value).map_err(|e| e.to_string())?;
    Ok(Some((value, call_id)))
}

pub fn repair_items(response: &ConversationResponse, error: &str) -> Vec<ConversationItem> {
    let mut items = response.items.clone();
    for call in response.tool_calls() {
        items.push(ConversationItem::tool_result(
            call.id.to_string(),
            format!("Not executed: invalid structured finalization. {error}"),
        ));
    }
    items.push(ConversationItem::system_reminder(format!("Final-answer validation failed: {error}. Correct the answer to match the declared JSON schema. No real tool in the invalid finalization batch was executed.")));
    items
}
