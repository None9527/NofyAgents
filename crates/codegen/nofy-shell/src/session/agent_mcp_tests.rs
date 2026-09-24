use agent_client_protocol as acp;
use nofy_agent::config::{AgentDefinition, AgentScope, McpServerRef};
use nofy_tools::types::compat::CompatConfig;

use super::{
    RematerializeParams, apply_agent_mcp_overlay, materialize_agent_mcp_servers,
    overlay_agent_mcp_servers, rematerialize_live_for_agent_seat,
};

fn http(name: &str, url: &str, value: &str) -> acp::McpServer {
    acp::McpServer::Http(
        acp::McpServerHttp::new(name, url).headers(vec![acp::HttpHeader::new("X-Token", value)]),
    )
}

fn header_value(server: &acp::McpServer) -> Option<&str> {
    match server {
        acp::McpServer::Http(server) => server
            .headers
            .iter()
            .find(|header| header.name == "X-Token")
            .map(|header| header.value.as_str()),
        _ => None,
    }
}

fn named<'a>(servers: &'a [acp::McpServer], name: &str) -> &'a acp::McpServer {
    servers
        .iter()
        .find(|server| crate::session::mcp_servers::mcp_server_name(server) == name)
        .unwrap_or_else(|| panic!("missing server {name}"))
}

fn inline(name: &str, url: &str, value: &str) -> McpServerRef {
    McpServerRef::Inline {
        name: name.to_owned(),
        config: serde_json::json!({
            "type": "http",
            "url": url,
            "headers": { "X-Token": value },
        }),
    }
}

fn definition(mcp_servers: Vec<McpServerRef>) -> AgentDefinition {
    let mut definition = AgentDefinition::default_nofy_build();
    definition.name = "seat".to_owned();
    definition.scope = AgentScope::User;
    definition.mcp_servers = mcp_servers;
    definition
}

fn diskless_compat() -> CompatConfig {
    let mut compat = CompatConfig::default();
    compat.claude.mcps = false;
    compat.cursor.mcps = false;
    compat
}

#[test]
fn overlay_wins_by_name_and_appends_new_names() {
    let mut merged = vec![http("shared", "https://base.example/mcp", "base")];
    overlay_agent_mcp_servers(
        &mut merged,
        vec![
            http("shared", "https://agent.example/mcp", "agent"),
            http("agent-only", "https://agent.example/only", "only"),
        ],
    );
    assert_eq!(2, merged.len());
    assert_eq!(Some("agent"), header_value(named(&merged, "shared")));
    assert_eq!(Some("only"), header_value(named(&merged, "agent-only")));
}

#[test]
fn named_and_inline_refs_materialize() {
    let cwd = tempfile::tempdir().unwrap();
    let base = http("base", "https://base.example/mcp", "base");
    let got = materialize_agent_mcp_servers(
        &definition(vec![
            McpServerRef::Named("base".to_owned()),
            inline("inline", "https://agent.example/mcp", "agent"),
        ]),
        std::slice::from_ref(&base),
        cwd.path(),
    );
    assert_eq!(Some("base"), header_value(named(&got, "base")));
    assert_eq!(Some("agent"), header_value(named(&got, "inline")));
}

#[test]
fn plugin_and_untrusted_project_agents_cannot_add_inline_mcp() {
    let cwd = tempfile::tempdir().unwrap();
    let mut plugin = definition(vec![inline("blocked", "https://bad.example/mcp", "bad")]);
    plugin.plugin_name = Some("plugin".to_owned());
    assert!(materialize_agent_mcp_servers(&plugin, &[], cwd.path()).is_empty());

    crate::agent::folder_trust::record_for_test(cwd.path(), false);
    let mut project = definition(vec![inline("blocked", "https://bad.example/mcp", "bad")]);
    project.scope = AgentScope::Project;
    assert!(materialize_agent_mcp_servers(&project, &[], cwd.path()).is_empty());
}

#[test]
fn disabled_config_name_cannot_be_reintroduced_by_agent_overlay() {
    let cwd = tempfile::tempdir().unwrap();
    git2::Repository::init(cwd.path()).unwrap();
    std::fs::create_dir_all(cwd.path().join(".nofy")).unwrap();
    std::fs::write(
        cwd.path().join(".nofy/config.toml"),
        "[mcp_servers.blocked]\nurl = \"https://base.example/mcp\"\nenabled = false\n",
    )
    .unwrap();
    let got = materialize_agent_mcp_servers(
        &definition(vec![inline(
            "blocked",
            "https://agent.example/mcp",
            "agent",
        )]),
        &[],
        cwd.path(),
    );
    assert!(got.is_empty());
}

#[test]
fn seat_switch_removes_old_overlay_and_preserves_unrelated_live_server() {
    let cwd = tempfile::tempdir().unwrap();
    let seat_a = definition(vec![
        inline("a-only", "https://a.example/mcp", "a"),
        inline("shared", "https://a.example/shared", "a"),
    ]);
    let seat_b = definition(vec![
        inline("b-only", "https://b.example/mcp", "b"),
        inline("shared", "https://b.example/shared", "b"),
    ]);
    let mut live = vec![http("runtime", "https://runtime.example/mcp", "runtime")];
    apply_agent_mcp_overlay(&mut live, &seat_a, cwd.path());
    let compat = diskless_compat();
    let desired = rematerialize_live_for_agent_seat(
        &live,
        &seat_a.mcp_servers,
        RematerializeParams {
            initial_client_mcp_servers: vec![],
            cwd: cwd.path(),
            parent_cwd: None,
            managed_configs: &[],
            plugin_registry: None,
            compat: &compat,
            definition: &seat_b,
        },
    );
    assert!(
        !desired
            .iter()
            .any(|server| crate::session::mcp_servers::mcp_server_name(server) == "a-only")
    );
    assert_eq!(Some("b"), header_value(named(&desired, "shared")));
    assert_eq!(Some("b"), header_value(named(&desired, "b-only")));
    assert_eq!(Some("runtime"), header_value(named(&desired, "runtime")));
}

#[test]
fn admitted_snapshot_tracks_runtime_config_updates() {
    let mut state =
        crate::session::mcp_servers::McpState::new(vec![http("a", "https://a.example/mcp", "a")]);
    let admitted = state.admitted_servers();
    let before = super::mcp_servers_for_fork(&admitted);
    assert_eq!(Some("a"), header_value(named(&before, "a")));
    assert!(
        state
            .update_configs_diff(vec![http("b", "https://b.example/mcp", "b")])
            .is_some()
    );
    let after = super::mcp_servers_for_fork(&admitted);
    assert_eq!(1, after.len());
    assert_eq!(Some("b"), header_value(named(&after, "b")));
}
