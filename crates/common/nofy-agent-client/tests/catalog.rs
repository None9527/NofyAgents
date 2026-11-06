//! What every client of the operation catalog (CLI help, MCP tool listings, the
//! assembly guides) relies on: each operation says what it does, in English, and
//! says it differently from every other operation.
use nofy_agent_client::OPERATIONS;
use std::collections::BTreeMap;

#[test]
fn every_operation_has_its_own_english_summary() {
    let mut owners: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for operation in OPERATIONS.iter() {
        let summary = operation.summary.trim();
        assert!(
            summary.len() >= 20,
            "{} has no real summary: {summary:?}",
            operation.operation
        );
        assert!(
            !summary
                .chars()
                .any(|c| ('\u{4e00}'..='\u{9fff}').contains(&c)),
            "{} summary is not English",
            operation.operation
        );
        owners
            .entry(summary)
            .or_default()
            .push(&operation.operation);
    }
    let shared: Vec<_> = owners.iter().filter(|(_, ops)| ops.len() > 1).collect();
    assert!(
        shared.is_empty(),
        "operations share a summary, so neither says what it does: {shared:?}"
    );
}

#[test]
fn error_messages_say_what_is_wrong_without_echoing_the_input() {
    let secret = "do-not-print-this-value";
    let err = nofy_agent_client::validate(
        "run.events",
        &serde_json::json!({
            "run_id": "r",
            "limit": secret,
        }),
    )
    .unwrap_err();
    assert!(err.message.contains("/limit"), "{}", err.message);
    assert!(err.message.contains("expected integer"), "{}", err.message);
    assert!(
        !err.message.contains(secret) && !err.details.to_string().contains(secret),
        "the offending value must not be echoed"
    );
    let err = nofy_agent_client::validate("run.start", &serde_json::json!({})).unwrap_err();
    assert!(!err.message.ends_with("at "), "{}", err.message);
}

/// Every field a caller can set or read carries a description, because the
/// schema is the documentation that a tool listing shows. Fragments that only
/// tighten a constraint (inside if/then/else/not) are not field definitions.
#[test]
fn every_field_definition_in_the_contract_is_described() {
    use serde_json::Value;
    const CONSTRAINT: [&str; 7] = [
        "if",
        "then",
        "else",
        "not",
        "contains",
        "propertyNames",
        "dependentSchemas",
    ];
    const ONLY_LIMITS: [&str; 7] = [
        "minItems",
        "maxItems",
        "minimum",
        "maximum",
        "minLength",
        "maxLength",
        "uniqueItems",
    ];
    fn walk(node: &Value, path: &str, constraint: bool, missing: &mut Vec<String>) {
        match node {
            Value::Object(map) => {
                if let Some(Value::Object(props)) = map.get("properties")
                    && !constraint
                {
                    for (name, definition) in props {
                        let only_limits = definition
                            .as_object()
                            .is_some_and(|d| d.keys().all(|k| ONLY_LIMITS.contains(&k.as_str())));
                        let described = definition["description"]
                            .as_str()
                            .is_some_and(|text| !text.trim().is_empty());
                        if !only_limits && !described {
                            missing.push(format!("{path}/{name}"));
                        }
                    }
                }
                for (key, child) in map {
                    walk(
                        child,
                        &format!("{path}/{key}"),
                        constraint || CONSTRAINT.contains(&key.as_str()),
                        missing,
                    );
                }
            }
            Value::Array(items) => {
                for (index, child) in items.iter().enumerate() {
                    walk(child, &format!("{path}[{index}]"), constraint, missing);
                }
            }
            _ => {}
        }
    }
    let mut missing = Vec::new();
    for (name, definition) in nofy_agent_client::SCHEMAS["$defs"].as_object().unwrap() {
        walk(definition, name, false, &mut missing);
    }
    assert!(
        missing.is_empty(),
        "fields without a description ({}): {:?}",
        missing.len(),
        &missing[..missing.len().min(12)]
    );
}

#[test]
fn unknown_names_point_to_the_nearest_real_ones() {
    use nofy_agent_client::nearest;
    let names = || OPERATIONS.iter().map(|o| o.operation.as_str());
    assert_eq!(
        nearest("run.inspekt", names()).first().map(String::as_str),
        Some("run.inspect")
    );
    let fragment = nearest("inspect", names());
    assert!(
        !fragment.is_empty() && fragment.iter().all(|n| n.contains("inspect")),
        "{fragment:?}"
    );
    assert!(nearest("zzzzzzzzzz", names()).is_empty());
    assert!(nearest("", names()).is_empty());
    let error = nofy_agent_client::operation("session.strat").unwrap_err();
    assert!(
        error.message.contains("did you mean session.start"),
        "{}",
        error.message
    );
    assert_eq!(error.code, "unsupported_operation");
    assert!(
        error.details["suggestions"]
            .as_array()
            .is_some_and(|s| !s.is_empty())
    );
}
