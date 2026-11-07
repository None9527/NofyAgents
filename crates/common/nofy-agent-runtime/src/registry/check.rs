//! Checking a module definition against its factory without building anything.
//!
//! A package written for this kernel can be wrong in ways only the kernel can
//! tell: a factory that is not installed, a configuration the factory's schema
//! refuses, a dependency port left unbound. Building the module would find them
//! all, but only once someone selects the package into an Agent. This asks the
//! same questions earlier, so the author hears about them while the package is
//! still theirs to fix.
use super::*;
use jsonschema::error::ValidationErrorKind;

/// One thing wrong with a module's configuration, located by JSON Pointer.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ConfigIssue {
    pub path: String,
    pub message: String,
}

/// What a factory says about a module definition.
#[derive(Debug, Clone, Default)]
pub struct ModuleCheck {
    /// Configuration problems, outside any placeholder.
    pub issues: Vec<ConfigIssue>,
    /// The dependency ports the module needs bound, and the kind each takes.
    pub ports: BTreeMap<String, ModuleKind>,
    /// False when the configuration holds placeholders: a factory derives some
    /// ports from the configuration it will finally get, so `ports` can then be
    /// short, though never wrong.
    pub ports_complete: bool,
}

impl ModuleRegistry {
    pub fn descriptor(&self, factory: &str) -> Option<&ModuleDescriptor> {
        self.factories.get(factory).map(|entry| &entry.descriptor)
    }

    /// Check `config` against `factory`'s schema and work out the dependency
    /// ports it needs. `is_placeholder` recognises a value that is only a
    /// stand-in, to be replaced before the module is built (a package parameter,
    /// an input port, a conditional list item); problems at or under one are not
    /// problems yet. An unknown factory is an error, not an issue.
    pub fn check_module(
        &self,
        factory: &str,
        config: &Value,
        is_placeholder: &dyn Fn(&Value) -> bool,
    ) -> Result<ModuleCheck, Error> {
        let entry = self
            .factories
            .get(factory)
            .ok_or_else(|| Error::Composition(format!("missing factory {factory}")))?;
        let validator = crate::schema::compiled(&entry.descriptor.config_schema)?;
        let mut check = ModuleCheck {
            ports: entry.descriptor.dependencies.clone(),
            ..Default::default()
        };
        for error in validator.iter_errors(config) {
            let path = error.instance_path.to_string();
            if is_unsettled(config, &path, &error.kind, is_placeholder) {
                continue;
            }
            check.issues.push(ConfigIssue {
                path,
                message: error.to_string(),
            });
        }
        // Ports a factory derives from its configuration are only known once the
        // configuration is final and valid.
        check.ports_complete =
            !contains_placeholder(config, is_placeholder) && check.issues.is_empty();
        if check.ports_complete {
            match entry.factory.config_dependencies(config) {
                Ok(derived) => {
                    for (name, kind) in derived {
                        if name.trim().is_empty()
                            || check.ports.insert(name.clone(), kind).is_some()
                        {
                            check.issues.push(ConfigIssue {
                                path: String::new(),
                                message: format!(
                                    "invalid or duplicate configuration dependency: {name}"
                                ),
                            });
                        }
                    }
                }
                Err(error) => check.issues.push(ConfigIssue {
                    path: String::new(),
                    message: error.to_string(),
                }),
            }
        }
        // A derivation that failed leaves the ports unknown as well.
        if !check.issues.is_empty() {
            check.ports_complete = false;
        }
        // A module that needs nothing else can be built here and now, which is what
        // finds a script that does not compile. Building is free of IO by contract.
        if check.ports_complete
            && check.ports.is_empty()
            && let Err(error) = entry.factory.build(config, &BTreeMap::new())
        {
            check.issues.push(ConfigIssue {
                path: String::new(),
                message: format!("the module does not build: {error}"),
            });
        }
        Ok(check)
    }
}

fn contains_placeholder(value: &Value, is_placeholder: &dyn Fn(&Value) -> bool) -> bool {
    if is_placeholder(value) {
        return true;
    }
    match value {
        Value::Object(fields) => fields
            .values()
            .any(|v| contains_placeholder(v, is_placeholder)),
        Value::Array(items) => items
            .iter()
            .any(|v| contains_placeholder(v, is_placeholder)),
        _ => false,
    }
}

/// Whether an error may disappear once the placeholders are filled in, so it is
/// not a problem yet. That is so when the value it points at is a placeholder or
/// sits under one; when it is a list with a placeholder among its items (the
/// length is not final); and, for a value with a placeholder somewhere inside it,
/// when the keyword weighs the whole value (`anyOf`, `oneOf`, `not`, uniqueness,
/// property counts). What a value's own keys and type say stays decidable: a
/// missing required key, an unexpected key and a wrong type are real.
fn is_unsettled(
    root: &Value,
    pointer: &str,
    kind: &ValidationErrorKind,
    is_placeholder: &dyn Fn(&Value) -> bool,
) -> bool {
    let mut node = root;
    if is_placeholder(node) {
        return true;
    }
    for segment in pointer.split('/').skip(1) {
        let key = segment.replace("~1", "/").replace("~0", "~");
        let next = match node {
            Value::Object(fields) => fields.get(&key),
            Value::Array(items) => key.parse::<usize>().ok().and_then(|i| items.get(i)),
            _ => None,
        };
        match next {
            Some(child) => node = child,
            None => return false,
        }
        if is_placeholder(node) {
            return true;
        }
    }
    if matches!(node, Value::Array(items) if items.iter().any(is_placeholder)) {
        return true;
    }
    let decided_by_own_keys = matches!(
        kind,
        ValidationErrorKind::Required { .. }
            | ValidationErrorKind::AdditionalProperties { .. }
            | ValidationErrorKind::Type { .. }
    );
    !decided_by_own_keys && contains_placeholder(node, is_placeholder)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    struct Probe;
    impl ModuleFactory for Probe {
        fn descriptor(&self) -> ModuleDescriptor {
            ModuleDescriptor {
                factory: "tool.probe".into(),
                revision: "1".into(),
                kind: ModuleKind::ToolPack,
                config_schema: json!({
                    "type": "object",
                    "required": ["count", "name"],
                    "additionalProperties": false,
                    "properties": {
                        "count": {"type": "integer"},
                        "name": {"type": "string"},
                        "tags": {"type": "array", "minItems": 1, "items": {"type": "string"}},
                        "mode": {"anyOf": [
                            {"type": "string"},
                            {"type": "object", "required": ["n"], "additionalProperties": false,
                             "properties": {"n": {"type": "integer"}}}
                        ]}
                    }
                }),
                input_schema: None,
                output_schema: None,
                required_capabilities: Default::default(),
                dependencies: BTreeMap::from([("connection".into(), ModuleKind::Resource)]),
            }
        }
        fn build(
            &self,
            _: &Value,
            _: &BTreeMap<String, ModuleInstance>,
        ) -> Result<ModuleInstance, Error> {
            Err(Error::Composition("a check never builds".into()))
        }
    }

    fn registry() -> ModuleRegistry {
        let mut registry = ModuleRegistry::default();
        registry.register_factory(Arc::new(Probe)).unwrap();
        registry
    }
    fn expression(value: &Value) -> bool {
        value
            .as_object()
            .is_some_and(|o| o.len() == 1 && o.keys().all(|k| k.starts_with('$')))
    }

    #[test]
    fn an_unknown_factory_is_an_error_and_a_valid_config_is_clean() {
        let registry = registry();
        assert!(
            registry
                .check_module("tool.absent", &json!({}), &expression)
                .is_err()
        );
        let check = registry
            .check_module("tool.probe", &json!({"count": 1, "name": "x"}), &expression)
            .unwrap();
        assert!(check.issues.is_empty(), "{:?}", check.issues);
        assert!(check.ports_complete);
        assert_eq!(check.ports["connection"], ModuleKind::Resource);
    }

    #[test]
    fn every_schema_problem_is_reported_with_its_path_not_just_the_first() {
        let check = registry()
            .check_module(
                "tool.probe",
                &json!({"count": "many", "extra": true}),
                &expression,
            )
            .unwrap();
        let paths: Vec<&str> = check.issues.iter().map(|i| i.path.as_str()).collect();
        assert!(paths.contains(&"/count"), "{paths:?}");
        assert!(check.issues.len() >= 3, "{:?}", check.issues);
    }

    #[test]
    fn a_placeholder_stands_in_for_whatever_the_schema_wants_there() {
        let registry = registry();
        // A parameter where an integer is wanted, an input where a string is.
        let config = json!({"count": {"$parameter": "/n"}, "name": {"$input": "name"}});
        let check = registry
            .check_module("tool.probe", &config, &expression)
            .unwrap();
        assert!(check.issues.is_empty(), "{:?}", check.issues);
        assert!(!check.ports_complete);
        // The whole config replaced by one expression is also not yet wrong.
        let whole = json!({"$setting": "/tool"});
        assert!(
            registry
                .check_module("tool.probe", &whole, &expression)
                .unwrap()
                .issues
                .is_empty()
        );
    }

    #[test]
    fn a_problem_next_to_a_placeholder_is_still_reported() {
        let config = json!({"count": {"$parameter": "/n"}, "name": 7});
        let check = registry()
            .check_module("tool.probe", &config, &expression)
            .unwrap();
        let paths: Vec<&str> = check.issues.iter().map(|i| i.path.as_str()).collect();
        assert_eq!(paths, ["/name"], "{:?}", check.issues);
    }

    #[test]
    fn a_choice_between_shapes_is_not_judged_while_a_placeholder_is_inside_it() {
        let registry = registry();
        let base = |mode: Value| json!({"count": 1, "name": "x", "mode": mode});
        // Only the second shape fits once the parameter is an integer.
        let pending = registry
            .check_module(
                "tool.probe",
                &base(json!({"n": {"$parameter": "/n"}})),
                &expression,
            )
            .unwrap();
        assert!(pending.issues.is_empty(), "{:?}", pending.issues);
        // Without a placeholder the same choice is decided, and 5 fits neither.
        let decided = registry
            .check_module("tool.probe", &base(json!(5)), &expression)
            .unwrap();
        assert_eq!(decided.issues.len(), 1, "{:?}", decided.issues);
        assert_eq!(decided.issues[0].path, "/mode");
        // A missing required key is real even while another value is pending.
        let missing = registry
            .check_module(
                "tool.probe",
                &base(json!({"m": {"$parameter": "/n"}})),
                &expression,
            )
            .unwrap();
        assert!(
            missing.issues.iter().all(|i| i.path.starts_with("/mode")),
            "{:?}",
            missing.issues
        );
    }

    #[test]
    fn a_list_with_a_conditional_item_has_no_final_length_yet() {
        // minItems 1 would fail if the only item turns out to be switched off.
        let config = json!({"count": 1, "name": "x", "tags": [{"$when": {"parameter": "/on", "value": "a"}}]});
        let check = registry()
            .check_module("tool.probe", &config, &expression)
            .unwrap();
        assert!(check.issues.is_empty(), "{:?}", check.issues);
        let empty = json!({"count": 1, "name": "x", "tags": []});
        assert!(
            !registry()
                .check_module("tool.probe", &empty, &expression)
                .unwrap()
                .issues
                .is_empty()
        );
    }
}
