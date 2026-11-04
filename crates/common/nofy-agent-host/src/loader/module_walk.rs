//! Walk only declared module positions, retaining untouched nested JSON exactly.
use super::*;

pub(super) fn visit(
    document: &mut SystemDocument,
    visitor: &mut impl FnMut(&mut ModuleDefinition) -> Result<()>,
) -> Result<()> {
    let mut count = 0;
    for module in &mut document.modules {
        nested(module, 0, &mut count, visitor)?;
    }
    for program in document.programs.values_mut() {
        if let ProgramDefinition::Workflow { document, .. } = program {
            for module in &mut document.modules {
                nested(module, 0, &mut count, visitor)?;
            }
        }
    }
    Ok(())
}

fn nested(
    module: &mut ModuleDefinition,
    depth: usize,
    count: &mut usize,
    visitor: &mut impl FnMut(&mut ModuleDefinition) -> Result<()>,
) -> Result<()> {
    *count += 1;
    if *count > 4096 {
        return Err(HostError::Invalid(
            "deployment exceeds 4096 total modules".into(),
        ));
    }
    visitor(module)?;
    if module.factory != "resource.workflow" {
        return Ok(());
    }
    if depth >= 16 {
        return Err(HostError::Invalid(
            "nested workflow resources exceed 16".into(),
        ));
    }
    let document = module
        .config
        .get_mut("document")
        .filter(|v| v.is_object())
        .ok_or_else(|| HostError::Invalid("resource.workflow requires a document object".into()))?;
    let Some(modules) = document.get_mut("modules") else {
        return Ok(());
    };
    let modules = modules
        .as_array_mut()
        .ok_or_else(|| HostError::Invalid("workflow modules must be an array".into()))?;
    for raw in modules {
        let mut child: ModuleDefinition =
            serde_json::from_value(raw.clone()).map_err(|e| HostError::Invalid(e.to_string()))?;
        let before = serde_json::to_value(&child).map_err(storage::unavailable)?;
        nested(&mut child, depth + 1, count, visitor)?;
        let after = serde_json::to_value(child).map_err(storage::unavailable)?;
        // Serializing an unchanged definition would insert omitted defaults and
        // silently change the identity of an already frozen workflow resource.
        if before != after {
            *raw = after;
        }
    }
    Ok(())
}

pub(super) fn collect(document: &SystemDocument) -> Result<Vec<ModuleDefinition>> {
    let mut document = document.clone();
    let mut modules = Vec::new();
    visit(&mut document, &mut |module| {
        modules.push(module.clone());
        Ok(())
    })?;
    Ok(modules)
}
pub(super) fn collect_definitions(
    definitions: &[&ModuleDefinition],
) -> Result<Vec<ModuleDefinition>> {
    let mut modules = Vec::new();
    let mut count = 0;
    let mut seen = std::collections::BTreeSet::new();
    for definition in definitions {
        let identity = nofy_agent_runtime::system::content_digest(definition)?;
        if !seen.insert(identity) {
            continue;
        }
        let mut module = (*definition).clone();
        nested(&mut module, 0, &mut count, &mut |module| {
            modules.push(module.clone());
            Ok(())
        })?;
    }
    Ok(modules)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    fn system() -> SystemDocument {
        serde_json::from_value(json!({"schema_version":1,"name":"unchanged","modules":[{
            "reference":{"id":"outer","version":"1"},"factory":"resource.workflow",
            "config":{"document":{"modules":[{"reference":{"id":"inner","version":"1"},
                "factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"main.sh":"exit 0"}}}}]}}
        }],"programs":{}})).unwrap()
    }
    #[test]
    fn unchanged_nested_json_keeps_identity_and_arbitrary_config_is_not_traversed() {
        let mut document = system();
        let before = serde_json::to_value(&document).unwrap();
        visit(&mut document, &mut |_| Ok(())).unwrap();
        assert_eq!(serde_json::to_value(&document).unwrap(), before);
        assert_eq!(collect(&document).unwrap().len(), 2);
        document.modules[0].factory = "resource.other".into();
        assert_eq!(collect(&document).unwrap().len(), 1);
    }
    #[test]
    fn nesting_and_total_module_limits_fail_closed_without_poisoning_next_walk() {
        let mut document = system();
        let mut root = document.modules[0].clone();
        for _ in 0..16 {
            root.config = json!({"document":{"modules":[root.clone()]}});
        }
        document.modules = vec![root];
        assert!(collect(&document).is_err());
        let mut document = system();
        document.modules = vec![document.modules[0].clone(); 2049];
        assert!(collect(&document).is_err());
        assert_eq!(collect(&system()).unwrap().len(), 2);
    }
}
