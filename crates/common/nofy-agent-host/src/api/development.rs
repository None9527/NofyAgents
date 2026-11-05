use super::*;

/// Public capability facts only. User paths, credential values and arbitrary
/// endpoints are never probed by discovery.
pub(super) fn capabilities(host: &KernelHost) -> Value {
    #[cfg(target_os = "linux")]
    let abi = {
        // SAFETY: this version query passes no pointer and creates no ruleset.
        let version = unsafe {
            libc::syscall(
                libc::SYS_landlock_create_ruleset,
                std::ptr::null::<u8>(),
                0usize,
                1u32,
            )
        };
        (version >= 0).then_some(version as u64)
    };
    #[cfg(not(target_os = "linux"))]
    let abi: Option<u64> = None;
    json!({
        "protocol":"nofy.development-capabilities/v1",
        "contract_revision":"0.6",
        "platform":{"os":std::env::consts::OS,"arch":std::env::consts::ARCH},
        "source_projects":true,"module_repositories":true,
        "process_isolation":{"helper_configured":host.loader.helper_ready(),"landlock_abi":abi,
            "platform_supported":cfg!(target_os="linux"),"landlock_requirement":3,
            "execution_ready":"requires_explicit_resource_configuration","direct_network":"denied"},
        "command_execution":{"factory":"tool.process_tree_artifact","platform_supported":cfg!(target_os="linux"),
            "backends":[{"resource":"resource.process_tree_limits","guarantees":"cgroup aggregate quotas and PID namespace teardown","prerequisite":"delegated cgroup v2 child root"},{"resource":"resource.process_namespace_limits","guarantees":"per-process CPU/address-space limits and PID namespace teardown","prerequisite":"user/PID/mount/network namespaces"}],
            "cgroup_v2_mounted":std::path::Path::new("/sys/fs/cgroup/cgroup.controllers").is_file(),
            "delegation":"requires_explicit_configuration","check":"Configure resource.process_tree_limits with an actual delegated child root; activation checks availability."},
        "input":{"interject":true,"steering":true,"follow_up":true,"next_turn":true,"user_tool":true,"delivery":"durable_safe_boundary","modes":["all","one_at_a_time"],"configuration":"Agent.settings.input_delivery"},
        "terminal":{"resource":"resource.process_session","tool":"tool.terminal","pty":cfg!(target_os="linux"),"durable_input_receipts":true,"output":"bounded byte cursors","os_process_restart":"abandoned"},
        "outbound_mcp":{"transports":["streamable_http","stdio"],"stdio_resource":"resource.mcp_stdio","source":"tool_source.mcp"},
        "process_network":{"default":"denied","namespace_proxy":cfg!(target_os="linux"),"configuration":"resource.process_namespace_limits.network_proxy","enforcement":"isolated loopback namespace and checked host broker"},
        "session_branches":{"fork":true,"rewind":true,"tree":true,"effects":"preserved","budget":"independent operator-created root"},
        "child_agents":{"factory":"tool.skills","scoped_factory":"tool.skills_scoped","durable_child_recovery":true,"asynchronous":{"resource":"resource.agent_tasks","binding":"binding.agent_tasks","tool":"tool.agent_tasks","ownership":"parent invocation"},"messages":"tool.agent_messages"},
        "model_resilience":{"retry":"governance.budget_connected.retry","length":"stage.length","repeat":"stage.repeat","recipe":"runtime.recipe","image_fallback":"model.image_fallback","hosted_tools":"explicit provider protocol settings.hosted_tools"},
        "context":{"factory":"context.programmed","persistent_sampling":true,"manual":"context-compaction package /compact input","overflow":"model.context_fallback"},
        "credentials":{"injection":"private_cli","values_exposed":false},
        "authorization":"Each operation is authorized by the kernel. Registered factory does not imply configured resources are ready."
    })
}
