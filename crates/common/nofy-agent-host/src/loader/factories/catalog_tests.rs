//! One catalog/validation contract on Linux, macOS and Windows.
use super::*;
use nofy_agent_runtime::registry::ModuleRegistry;

const FACTORIES: [&str; 5] = [
    "resource.mcp_stdio",
    "resource.process_namespace_limits",
    "resource.process_session",
    "tool.process_tree_artifact",
    "tool.terminal",
];

fn registry() -> (tempfile::TempDir, ModuleRegistry) {
    let dir = tempfile::tempdir().unwrap();
    let loader = Loader::open(dir.path()).unwrap();
    let mut registry = ModuleRegistry::default();
    loader.register(&mut registry).unwrap();
    (dir, registry)
}

#[test]
fn registered_process_descriptors_match_the_existing_linux_contract() {
    let (_dir, registry) = registry();
    let actual = registry
        .descriptors()
        .into_iter()
        .filter(|descriptor| FACTORIES.contains(&descriptor.factory.as_str()))
        .collect::<Vec<_>>();
    assert_eq!(
        actual.len(),
        FACTORIES.len(),
        "no factory may disappear on this OS"
    );
    // Captured from the pre-refactor host's /api/v1/modules on Linux. The same
    // complete descriptor (including revision/schema/ports) is required natively
    // on every OS, rather than regenerating an OS-specific expectation.
    let expected: Value = serde_json::from_str(include_str!("catalog.expected.json")).unwrap();
    assert_eq!(serde_json::to_value(actual).unwrap(), expected);
}

#[test]
fn pure_declaration_checks_keep_fixed_and_configuration_derived_ports() {
    let (_dir, registry) = registry();
    for (factory, config, ports) in [
        (
            "tool.process_tree_artifact",
            json!({
                "contract": {"name": "run"}, "entrypoint": "main",
                "directories": {"WORKSPACE": "project"}
            }),
            vec!["artifact", "environment", "project", "tree"],
        ),
        (
            "resource.process_session",
            json!({
                "entrypoint": "main", "directories": {"WORKSPACE": "project"}
            }),
            vec!["artifact", "environment", "limits", "project"],
        ),
        ("tool.terminal", json!({}), vec!["session"]),
        ("resource.mcp_stdio", json!({}), vec!["session"]),
        ("resource.process_namespace_limits", json!({}), vec![]),
    ] {
        let checked = registry.check_module(factory, &config, &|_| false).unwrap();
        assert!(checked.issues.is_empty(), "{factory}: {:?}", checked.issues);
        assert!(checked.ports_complete, "{factory}");
        assert_eq!(
            checked.ports.keys().map(String::as_str).collect::<Vec<_>>(),
            ports
        );
        assert!(
            checked
                .ports
                .values()
                .all(|kind| *kind == ModuleKind::Resource)
        );
    }
}

#[test]
fn invalid_configuration_is_rejected_before_native_activation() {
    let (_dir, registry) = registry();
    for (factory, config) in [
        (
            "tool.process_tree_artifact",
            json!({"contract":{"name":"run"},"entrypoint":"main","scratch_files":["out"]}),
        ),
        (
            "tool.process_tree_artifact",
            json!({"contract":{"name":"run"},"entrypoint":"main","directories":{"WORKSPACE":"tree"}}),
        ),
        (
            "resource.process_session",
            json!({"entrypoint":"main","directories":{"lowercase":"project"}}),
        ),
        (
            "resource.process_session",
            json!({"entrypoint":"main","directories":{"WORKSPACE":"limits"}}),
        ),
        (
            "resource.process_namespace_limits",
            json!({"cpu_seconds":0}),
        ),
        ("tool.terminal", json!({"unknown":true})),
        ("resource.mcp_stdio", json!({"unknown":true})),
    ] {
        let checked = registry.check_module(factory, &config, &|_| false).unwrap();
        assert!(!checked.issues.is_empty(), "{factory}: {config}");
        assert!(
            checked
                .issues
                .iter()
                .all(|issue| !issue.message.contains("isolation_unavailable"))
        );
    }
}

#[test]
fn public_factory_builds_validate_then_select_the_real_native_boundary() {
    let cases: Vec<(Box<dyn ModuleFactory>, Value, Value)> = vec![
        (
            Box::new(TreeArtifactFactory),
            json!({"contract":{"name":"run"},"entrypoint":"main"}),
            json!({}),
        ),
        (
            Box::new(SessionFactory),
            json!({"entrypoint":"main"}),
            json!({}),
        ),
        (
            Box::new(TerminalFactory),
            json!({}),
            json!({"unknown":true}),
        ),
        (Box::new(StdioFactory), json!({}), json!({"unknown":true})),
    ];
    for (factory, valid, invalid) in cases {
        let name = factory.descriptor().factory;
        let invalid_error = factory
            .build(&invalid, &BTreeMap::new())
            .err()
            .unwrap()
            .to_string();
        assert!(
            !invalid_error.contains("isolation_unavailable"),
            "{name}: {invalid_error}"
        );
        // With no bound resources Linux cannot build either. Other OSes must
        // identify the missing implementation rather than invent a transport.
        let error = factory
            .build(&valid, &BTreeMap::new())
            .err()
            .unwrap()
            .to_string();
        if std::env::consts::OS == "linux" {
            assert!(!error.contains("isolation_unavailable"), "{name}: {error}");
            assert!(error.contains("resource"), "{name}: {error}");
        } else {
            for required in [
                &name,
                "isolation_unavailable",
                "tree_kill",
                "die_with_parent",
            ] {
                assert!(error.contains(required), "{name}: {error}");
            }
        }
    }
}

#[test]
fn legacy_cgroup_declarations_validate_without_claiming_native_enforcement() {
    let (_dir, registry) = registry();
    let value = json!({"cgroup_root":"/sys/fs/cgroup/nofy-portable-declaration-test/absent"});
    let checked = registry
        .check_module(process_tree::FACTORY, &value, &|_| false)
        .unwrap();
    assert!(checked.issues.is_empty(), "{:?}", checked.issues);
    let config: process_tree::Config = serde_json::from_value(value).unwrap();
    config.validate().unwrap();
    assert!(
        config.preflight().is_err(),
        "syntax validity is not an enforcement grant"
    );
    for root in [
        "/sys/fs/cgroup",
        "/tmp/not-a-cgroup",
        "/sys/fs/cgroup/a/../b",
        "/sys/fs/cgroup/a//b",
    ] {
        let checked = registry
            .check_module(process_tree::FACTORY, &json!({"cgroup_root":root}), &|_| {
                false
            })
            .unwrap();
        assert!(!checked.issues.is_empty(), "{root}");
    }
}
