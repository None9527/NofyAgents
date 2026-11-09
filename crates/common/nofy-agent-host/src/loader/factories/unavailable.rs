//! Honest activation refusal until a native process backend is installed.
//!
//! Shared descriptors and pure checks remain available. These functions never
//! create a command, resource owner, transport, or substitute unconfined worker.
use super::*;
use nofy_isolation::{Backend, Confinement, Processes, Unsupported, admit, current_platform};

fn refusal(factory: &str) -> Error {
    // These are minimum common requirements of every process-owning factory.
    // This is not a full policy for a future backend: native admission must also
    // validate each declaration's filesystem, network and resource constraints.
    let policy = Confinement {
        processes: Processes::Tree,
        die_with_parent: true,
        ..Confinement::default()
    };
    let probe = Unsupported::new(current_platform()).probe();
    match admit(&probe, &policy) {
        Err(refusal) => error(format!("{factory}: {refusal}")),
        // Even if the admission vocabulary changes, absence of an implementation
        // must never turn into an executable fallback.
        Ok(()) => error(format!(
            "isolation_unavailable: {factory} has no native process backend"
        )),
    }
}

pub(super) fn tree(
    _: ToolConfig,
    _: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    Err(refusal("tool.process_tree_artifact"))
}

pub(super) fn session(
    _: sessions::Config,
    _: &Value,
    _: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    Err(refusal("resource.process_session"))
}

pub(super) fn terminal(
    _: &Value,
    _: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    Err(refusal("tool.terminal"))
}

pub(super) fn stdio(
    _: &Value,
    _: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    Err(refusal("resource.mcp_stdio"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_native_implementations_refuse_with_capabilities_not_missing_factories() {
        let tree_config = serde_json::from_value(json!({
            "contract": {"name": "run"}, "entrypoint": "main"
        }))
        .unwrap();
        let session_value = json!({"entrypoint": "main"});
        let session_config = serde_json::from_value(session_value.clone()).unwrap();
        let dependencies = BTreeMap::new();
        for (factory, result) in [
            (
                "tool.process_tree_artifact",
                tree(tree_config, &dependencies),
            ),
            (
                "resource.process_session",
                session(session_config, &session_value, &dependencies),
            ),
            ("tool.terminal", terminal(&json!({}), &dependencies)),
            ("resource.mcp_stdio", stdio(&json!({}), &dependencies)),
        ] {
            let message = result
                .err()
                .expect("no native execution fallback")
                .to_string();
            for required in [
                factory,
                "isolation_unavailable",
                "unsupported",
                "tree_kill",
                "die_with_parent",
            ] {
                assert!(message.contains(required), "{message}");
            }
        }
    }
}
