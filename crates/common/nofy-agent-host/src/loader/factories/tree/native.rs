//! Existing Linux tree execution; declarations live in the parent module.
use super::launch::GuestLaunch;
use super::*;
use crate::loader::launch::RuntimeSource;
use crate::loader::process_tree::{self, sandbox::Sandbox};

pub(super) fn tree(
    config: ToolConfig,
    deps: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    let resource = |slot: &str| -> std::result::Result<&Arc<ResourceHandle>, Error> {
        let Some(ModuleInstance::Resource(resource)) = deps.get(slot) else {
            return Err(error(format!("missing resource {slot}")));
        };
        Ok(resource)
    };
    let env = resource("environment")?
        .get::<Environment>()
        .ok_or_else(|| error("incompatible tree environment"))?;
    let artifact = resource("artifact")?
        .get::<ArtifactBundle>()
        .ok_or_else(|| error("incompatible tree artifact"))?;
    if !artifact.files.contains_key(&config.entrypoint) {
        return Err(error("artifact entrypoint missing"));
    }
    let limits_resource = resource("tree")?;
    let limits = if let Some(limits) = limits_resource.get::<process_tree::Config>() {
        limits.validate().map_err(error)?;
        ExecutionLimits::Cgroup(limits)
    } else if let Some(limits) = limits_resource.get::<crate::loader::process_sessions::Limits>() {
        limits.validate().map_err(error)?;
        ExecutionLimits::Namespace(limits)
    } else {
        return Err(error("cgroup or namespace limits resource required"));
    };
    let mut directories = BTreeMap::new();
    for (alias, slot) in &config.directories {
        let directory = resource(slot)?
            .get::<crate::loader::directories::Directory>()
            .ok_or_else(|| error("directory resource required"))?;
        directories.insert(alias.clone(), directory);
    }
    let launch = GuestLaunch::from_runtime(&env.runtime, &config).map_err(error)?;
    let sandbox = launch
        .preflight(
            &env.loader.private_root,
            &env.runtime,
            &artifact,
            &directories,
        )
        .map_err(error)?;
    let mut catalog = nofy_agent_runtime::ToolCatalog::new();
    catalog.insert(nofy_agent_runtime::ToolEntry {
        definition: nofy_tool_types::ToolDefinition::function(
            &config.contract.name,
            Some(&config.contract.description),
            config.contract.input_schema.clone(),
        ),
        dispatch: Arc::new(TreeDispatch {
            config,
            env,
            artifact,
            limits,
            directories,
            launch,
            sandbox,
        }),
    })?;
    Ok(ModuleInstance::ToolPack(catalog))
}

struct TreeDispatch {
    config: ToolConfig,
    env: Arc<Environment>,
    artifact: Arc<ArtifactBundle>,
    limits: ExecutionLimits,
    directories: BTreeMap<String, Arc<crate::loader::directories::Directory>>,
    launch: GuestLaunch,
    sandbox: Sandbox,
}
enum ExecutionLimits {
    Cgroup(Arc<process_tree::Config>),
    Namespace(Arc<crate::loader::process_sessions::Limits>),
}
#[async_trait::async_trait]
impl ToolDispatch for TreeDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let cancel = ctx
            .get::<nofy_tool_runtime::Cancellation>()
            .map(|c| c.0.clone())
            .unwrap_or_default();
        let result = async {
            nofy_agent_runtime::settings::validate_json_value(
                &self.config.contract.input_schema,
                &args,
            )
            .map_err(tool_error)?;
            if serde_json::to_vec(&args).map_err(tool_error)?.len()
                > self.config.contract.max_input_bytes
            {
                return Err(tool_error("tree input exceeds configured byte limit"));
            }
            let bytes =
                serde_json::to_vec(&self.config.input.render(&args)?).map_err(tool_error)?;
            if bytes.len() > self.config.contract.max_input_bytes {
                return Err(tool_error("mapped tree input exceeds configured byte limit"));
            }
            let deadline = tokio::time::Instant::now()
                + Duration::from_millis(self.config.contract.timeout_ms);
            let loader = self.env.loader.clone();
            let artifact = self.artifact.clone();
            let runtime = self.env.runtime.clone();
            let dirs = self.directories.clone();
            let launch = self.launch.clone();
            let mut sandbox = self.sandbox.clone();
            let prepare = async {
                let slot = loader
                    .preparation_work
                    .clone()
                    .acquire_owned()
                    .await
                    .map_err(tool_error)?;
                tokio::task::spawn_blocking(move || -> Result<_> {
                    let _slot = slot;
                    let lease = loader.cache.shared()?;
                    let helper = loader.helper()?;
                    match (&runtime, &sandbox.runtime) {
                        (RuntimeSource::Locked(manifest), process_tree::sandbox::Runtime::Image { path, .. }) => {
                            let image = loader.images.materialize(manifest, loader.cache.quarantined_bytes(lifecycle::CacheKind::Image)?)?;
                            if image != *path {
                                return Err(HostError::Invalid("tree image cache layout changed".into()));
                            }
                        }
                        (RuntimeSource::Local(config), process_tree::sandbox::Runtime::Local { .. }) => config.preflight(&loader.private_root)?,
                        _ => return Err(HostError::Invalid("tree environment kind changed".into())),
                    }
                    let artifact = loader.artifacts.materialize(&artifact)?;
                    if artifact != sandbox.artifact {
                        return Err(HostError::Invalid("tree cache layout changed".into()));
                    }
                    let scratch = launch::scratch(&loader.scratch)?;
                    let root = scratch.path().join("root");
                    std::fs::create_dir(&root).map_err(storage::unavailable)?;
                    for directory in dirs.values() {
                        directory.prepare()?;
                    }
                    sandbox.root = root;
                    sandbox.validate()?;
                    Ok((
                        helper,
                        sandbox,
                        lifecycle::CacheUse {
                            scratch,
                            _lease: lease,
                        },
                    ))
                })
                .await
                .map_err(tool_error)?
                .map_err(tool_error)
            };
            let (helper, sandbox, hold) = tokio::select! {
                biased;
                _ = cancel.cancelled() => return Err(tool_error("tree preparation cancelled")),
                _ = tokio::time::sleep_until(deadline) => return Err(tool_error("tree preparation timed out")),
                result = prepare => result?,
            };
            let remaining = deadline.saturating_duration_since(tokio::time::Instant::now());
            if remaining.is_zero() {
                return Err(tool_error("tree preparation timed out"));
            }
            // Execution owns its cleanup independently of the caller's future.
            // Do not wrap this await in a timeout that can abandon that owner.
            let invocation = process_tree::Invocation {
                        program: launch.program,
                        arguments: launch.arguments,
                        environment: launch.environment,
                        cwd: "/nofy/scratch".into(),
                        input: bytes,
                        timeout: remaining,
                        output_limit: self.config.contract.max_output_bytes,
                    };
            let output = match &self.limits {
                ExecutionLimits::Cgroup(limits) => self.env.loader.process_trees.supervise_confined((**limits).clone(), helper, invocation, cancel, hold, sandbox).await,
                ExecutionLimits::Namespace(limits) => self.env.loader.process_sessions.supervise_namespace(helper, invocation, cancel, hold, sandbox, (**limits).clone()).await,
            }.map_err(tool_error)?;
            if !output.status.success() {
                return Err(tool_error(format!(
                    "tree process failed (code {:?}): {}",
                    output.status.code(),
                    String::from_utf8_lossy(&output.stderr)
                        .chars()
                        .take(1024)
                        .collect::<String>()
                )));
            }
            let value: Value = serde_json::from_slice(&output.stdout)
                .map_err(|_| tool_error("tree process stdout is not JSON"))?;
            let value = if let Some(pointer) = &self.config.contract.output_pointer {
                value
                    .pointer(pointer)
                    .cloned()
                    .ok_or_else(|| tool_error("output pointer missing"))?
            } else {
                value
            };
            nofy_agent_runtime::settings::validate_json_value(
                &self.config.contract.output_schema,
                &value,
            )
            .map_err(tool_error)?;
            Ok(TypedToolOutput::from_value(id, value))
        }
        .await;
        nofy_tool_runtime::terminal_only(result)
    }
}

#[cfg(all(test, target_arch = "x86_64"))]
#[path = "tests.rs"]
mod tests;
