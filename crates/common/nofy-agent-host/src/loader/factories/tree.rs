//! One declaration-driven transport, not a programming Agent main loop.
use super::*;
use crate::loader::launch::RuntimeSource;
use crate::loader::process_tree::{self, sandbox::Sandbox};
mod launch;
use launch::GuestLaunch;
#[cfg(all(test, target_arch = "x86_64"))]
mod tests;

pub(in crate::loader) struct TreeArtifactFactory;
impl ModuleFactory for TreeArtifactFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = ProcessArtifactFactory.descriptor();
        descriptor.factory = "tool.process_tree_artifact".into();
        descriptor.revision = "confined-process-tree-v1".into();
        descriptor
            .dependencies
            .insert("tree".into(), ModuleKind::Resource);
        descriptor.config_schema["properties"]
            .as_object_mut()
            .expect("schema properties")
            .remove("scratch_files");
        for bound in ["max_input_bytes", "max_output_bytes"] {
            descriptor.config_schema["properties"]["contract"]["properties"][bound]["maximum"] =
                json!(8388608);
        }
        descriptor
    }
    fn config_dependencies(
        &self,
        value: &Value,
    ) -> std::result::Result<BTreeMap<String, ModuleKind>, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        let slots = config.directory_dependencies()?;
        if slots.contains_key("tree") {
            return Err(error("tree is a reserved resource slot"));
        }
        Ok(slots)
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        self.config_dependencies(value)?;
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        config.contract.validate()?;
        config.input.validate()?;
        nofy_agent_runtime::artifact::entry_path(&config.entrypoint)?;
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
        let limits = resource("tree")?
            .get::<process_tree::Config>()
            .ok_or_else(|| error("tree limits resource required"))?;
        limits.validate().map_err(error)?;
        let mut directories = BTreeMap::new();
        for (alias, slot) in &config.directories {
            let directory = resource(slot)?
                .get::<super::super::directories::Directory>()
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
}
struct TreeDispatch {
    config: ToolConfig,
    env: Arc<Environment>,
    artifact: Arc<ArtifactBundle>,
    limits: Arc<process_tree::Config>,
    directories: BTreeMap<String, Arc<super::super::directories::Directory>>,
    launch: GuestLaunch,
    sandbox: Sandbox,
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
                            let image = loader.images.materialize(&manifest, loader.cache.quarantined_bytes(lifecycle::CacheKind::Image)?)?;
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
            let output = self
                .env
                .loader
                .process_trees
                .supervise_confined(
                    (*self.limits).clone(),
                    helper,
                    process_tree::Invocation {
                        program: launch.program,
                        arguments: launch.arguments,
                        environment: launch.environment,
                        cwd: "/nofy/scratch".into(),
                        input: bytes,
                        timeout: remaining,
                        output_limit: self.config.contract.max_output_bytes,
                    },
                    cancel,
                    hold,
                    sandbox,
                )
                .await
                .map_err(tool_error)?;
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
