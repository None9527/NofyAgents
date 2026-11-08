use super::*;
use nofy_agent_executors::{
    config::{JsonBinding, ToolContract},
    process::{ProcessToolConfig, ProcessToolFactory},
    resources::{EnvironmentGuard, ProcessEnvironment},
};
use nofy_agent_runtime::artifact::ArtifactBundle;
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, process::Stdio, time::Duration};
pub(crate) mod sessions;
pub(in crate::loader) mod tree;
#[cfg(any(not(target_os = "linux"), test))]
mod unavailable;
pub(super) use sessions::{SessionFactory, StdioFactory, TerminalFactory};
pub(super) use tree::TreeArtifactFactory;

pub(super) struct EnvironmentFactory(pub Loader);
pub(super) struct LockedEnvironmentFactory(pub Loader);
pub(super) struct LocalEnvironmentFactory(pub Loader);
pub(super) struct ProcessArtifactFactory;
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
struct RuntimeRef {
    id: String,
    revision: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct EnvironmentConfig {
    runtime: RuntimeRef,
}
#[derive(Clone)]
struct Environment {
    runtime: launch::RuntimeSource,
    loader: Loader,
    identity: String,
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
struct ToolConfig {
    contract: ToolContract,
    entrypoint: String,
    #[serde(default)]
    args: Vec<String>,
    #[serde(default)]
    scratch_files: Vec<String>,
    #[serde(default)]
    input: JsonBinding,
    #[serde(default)]
    directories: BTreeMap<String, String>,
}
impl ToolConfig {
    fn directory_dependencies(&self) -> std::result::Result<BTreeMap<String, ModuleKind>, Error> {
        let mut slots = BTreeMap::new();
        if self.directories.len() > 8 {
            return Err(error("too many directory bindings"));
        }
        for (alias, slot) in &self.directories {
            if alias.is_empty()
                || alias.len() > 32
                || !alias.as_bytes()[0].is_ascii_uppercase()
                || !alias
                    .bytes()
                    .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_')
                || slot.is_empty()
                || slot.len() > 128
                || slot.chars().any(char::is_control)
                || matches!(slot.as_str(), "environment" | "artifact")
                || slots.insert(slot.clone(), ModuleKind::Resource).is_some()
            {
                return Err(error("invalid, duplicate or reserved directory binding"));
            }
        }
        Ok(slots)
    }
}
fn error(e: impl std::fmt::Display) -> Error {
    Error::Composition(e.to_string())
}
fn tool_error(e: impl std::fmt::Display) -> ToolError {
    ToolError::custom("process_loader", e.to_string())
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    schema: Value,
    deps: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "artifact-process-v1".into(),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies: deps,
    }
}
impl ModuleFactory for EnvironmentFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.process",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["runtime"],"properties":{"runtime":{"type":"object","additionalProperties":false,"required":["id","revision"],"properties":{"id":{"type":"string","minLength":1,"maxLength":128},"revision":{"type":"string","pattern":"^[0-9a-f]{64}$"}}}}}),
            Default::default(),
        )
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let config: EnvironmentConfig = serde_json::from_value(value.clone()).map_err(error)?;
        if !self.0.helper_ready() {
            return Err(error("isolated process helper is not installed"));
        }
        let runtime = self
            .0
            .runtimes
            .find(&config.runtime.id, &config.runtime.revision)
            .map_err(error)?;
        let identity = format!(
            "process-environment-v1:{}",
            content_digest(&runtime.manifest)?
        );
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity.clone(),
            Arc::new(Environment {
                runtime: launch::RuntimeSource::Legacy(Box::new(runtime)),
                loader: self.0.clone(),
                identity,
            }),
        )?)))
    }
}
impl ModuleFactory for LockedEnvironmentFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = descriptor(
            "resource.process_locked",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["manifest"],"properties":{"manifest":images::manifest_schema()}}),
            Default::default(),
        );
        descriptor.revision = "locked-image-v1".into();
        descriptor
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        if !self.0.helper_ready() {
            return Err(error("isolated process helper is not installed"));
        }
        let manifest = deployment::manifest(value).map_err(error)?;
        let identity = format!(
            "process-image-environment-v1:{}",
            manifest.digest().map_err(error)?
        );
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity.clone(),
            Arc::new(Environment {
                runtime: launch::RuntimeSource::Locked(Arc::new(manifest)),
                loader: self.0.clone(),
                identity,
            }),
        )?)))
    }
}
impl ModuleFactory for LocalEnvironmentFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = descriptor(
            local::FACTORY,
            ModuleKind::Resource,
            local::schema(),
            Default::default(),
        );
        descriptor.revision = "local-environment-v1".into();
        descriptor
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let config = local::config(value, &self.0.private_root).map_err(error)?;
        if !self.0.helper_ready() {
            return Err(error("isolated process helper is not installed"));
        }
        let identity = format!("process-local-environment-v1:{}", content_digest(&config)?);
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity.clone(),
            Arc::new(Environment {
                runtime: launch::RuntimeSource::Local(Arc::new(config)),
                loader: self.0.clone(),
                identity,
            }),
        )?)))
    }
}
impl ModuleFactory for ProcessArtifactFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.process_artifact",
            ModuleKind::ToolPack,
            json!({"type":"object","additionalProperties":false,"required":["contract","entrypoint"],"properties":{"contract":nofy_agent_executors::config::contract_schema(),"entrypoint":{"type":"string","minLength":1,"maxLength":256},"args":{"type":"array","maxItems":128,"items":{"type":"string","maxLength":4096}},"scratch_files":{"type":"array","maxItems":16,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":256}},"input":{"$ref":"#/$defs/binding"},"directories":{"type":"object","maxProperties":8,"propertyNames":{"pattern":"^[A-Z][A-Z0-9_]{0,31}$"},"additionalProperties":{"type":"string","minLength":1,"maxLength":128}}},"$defs":{"binding":nofy_agent_executors::config::binding_schema()}}),
            [
                ("environment".into(), ModuleKind::Resource),
                ("artifact".into(), ModuleKind::Resource),
            ]
            .into(),
        )
    }
    fn config_dependencies(
        &self,
        value: &Value,
    ) -> std::result::Result<BTreeMap<String, ModuleKind>, Error> {
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        config.directory_dependencies()
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        config.directory_dependencies()?;
        config.contract.validate()?;
        config.input.validate()?;
        nofy_agent_runtime::artifact::entry_path(&config.entrypoint)?;
        if config.scratch_files.len() > 16 {
            return Err(error("too many scratch files"));
        }
        for (index, slot) in config.scratch_files.iter().enumerate() {
            nofy_agent_runtime::artifact::entry_path(slot)?;
            if config.scratch_files[..index].iter().any(|other| {
                slot == other
                    || slot.starts_with(&format!("{other}/"))
                    || other.starts_with(&format!("{slot}/"))
            }) {
                return Err(error("conflicting scratch file paths"));
            }
        }
        if config.args.len() > 128
            || config
                .args
                .iter()
                .any(|s| s.len() > 4096 || s.contains('\0'))
            || config.args.iter().map(String::len).sum::<usize>() > 65536
        {
            return Err(error("process artifact arguments exceed limits"));
        }
        let Some(ModuleInstance::Resource(env)) = deps.get("environment") else {
            return Err(error("process environment missing"));
        };
        let env = env
            .get::<Environment>()
            .ok_or_else(|| error("incompatible process environment"))?;
        let Some(ModuleInstance::Resource(artifact)) = deps.get("artifact") else {
            return Err(error("artifact resource missing"));
        };
        let artifact = artifact
            .get::<ArtifactBundle>()
            .ok_or_else(|| error("incompatible artifact resource"))?;
        if !artifact.files.contains_key(&config.entrypoint) {
            return Err(error("artifact entrypoint missing"));
        }
        let mut directories = BTreeMap::new();
        for (alias, slot) in &config.directories {
            let Some(ModuleInstance::Resource(resource)) = deps.get(slot) else {
                return Err(error("declared directory dependency missing"));
            };
            let directory = resource
                .get::<super::directories::Directory>()
                .ok_or_else(|| error("directory binding requires a directory resource"))?;
            if directory.requires_tree() {
                return Err(error(
                    "executable directory requires tool.process_tree_artifact",
                ));
            }
            directories.insert(alias.clone(), directory);
        }
        let mut tools = nofy_agent_runtime::ToolCatalog::new();
        tools.insert(nofy_agent_runtime::ToolEntry {
            definition: nofy_tool_types::ToolDefinition::function(
                &config.contract.name,
                Some(&config.contract.description),
                config.contract.input_schema.clone(),
            ),
            dispatch: Arc::new(Dispatch {
                config,
                env,
                artifact,
                directories,
            }),
        })?;
        Ok(ModuleInstance::ToolPack(tools))
    }
}
struct Dispatch {
    config: ToolConfig,
    env: Arc<Environment>,
    artifact: Arc<ArtifactBundle>,
    directories: BTreeMap<String, Arc<super::directories::Directory>>,
}
struct Guard {
    helper: PathBuf,
    profile: isolation::Profile,
}
impl EnvironmentGuard for Guard {
    fn revision(&self) -> &str {
        isolation::PROTOCOL
    }
    fn prepare(&self, command: &mut tokio::process::Command) -> std::result::Result<(), ToolError> {
        let old = command.as_std();
        let program = old.get_program().to_owned();
        let args = old
            .get_args()
            .map(std::ffi::OsStr::to_owned)
            .collect::<Vec<_>>();
        let env = old
            .get_envs()
            .filter_map(|(k, v)| v.map(|v| (k.to_owned(), v.to_owned())))
            .collect::<Vec<_>>();
        let cwd = old
            .get_current_dir()
            .map(Path::to_owned)
            .ok_or_else(|| tool_error("missing process cwd"))?;
        let mut profile = self.profile.clone();
        profile.environment = env
            .into_iter()
            .map(|(k, v)| {
                Ok((
                    k.into_string()
                        .map_err(|_| tool_error("non-UTF8 environment key"))?,
                    v.into_string()
                        .map_err(|_| tool_error("non-UTF8 environment value"))?,
                ))
            })
            .collect::<std::result::Result<_, ToolError>>()?;
        if serde_json::to_string(&profile).map_err(tool_error)?.len() > 65536 {
            return Err(tool_error("isolation profile exceeds 64 KiB"));
        }
        let confined = confine::worker_command(
            self.helper.clone(),
            &profile,
            program,
            args,
            Default::default(),
            Some(cwd),
        )
        .map_err(tool_error)?;
        let mut wrapped = confine::tokio_command(confined);
        wrapped
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);
        nofy_tty_utils::detach_command(&mut wrapped);
        *command = wrapped;
        Ok(())
    }
}
#[async_trait::async_trait]
impl ToolDispatch for Dispatch {
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
        let operation =
            async {
                let loader = self.env.loader.clone();
                // Acquire before spawning blocking IO. Cancellation drops a
                // waiting future instead of leaving unbounded blocked tasks.
                let preparation = loader
                    .preparation_work
                    .clone()
                    .acquire_owned()
                    .await
                    .map_err(tool_error)?;
                let artifact = self.artifact.clone();
                let runtime = self.env.runtime.clone();
                let slots = self.config.scratch_files.clone();
                let directories = self.directories.clone();
                let seconds = self.config.contract.timeout_ms.div_ceil(1000).clamp(1, 600) + 1;
                let (scratch, profile, helper, entry, launch) =
                    tokio::task::spawn_blocking(move || -> Result<_> {
                        let _preparation = preparation;
                        let cache_lease = loader.cache.shared()?;
                        let helper = loader.helper()?;
                        let mut launch = runtime.prepare(&loader)?;
                        if launch
                            .env
                            .keys()
                            .any(|key| key.starts_with(super::directories::ENV_PREFIX))
                        {
                            return Err(HostError::Invalid(
                                "runtime environment uses reserved directory prefix".into(),
                            ));
                        }
                        let mut grants = Vec::new();
                        for (alias, directory) in directories {
                            let grant = directory.prepare()?;
                            launch.env.insert(
                                format!("{}{alias}", super::directories::ENV_PREFIX),
                                grant
                                    .path
                                    .to_str()
                                    .ok_or_else(|| {
                                        HostError::Invalid("non-UTF8 directory root".into())
                                    })?
                                    .into(),
                            );
                            grants.push(grant);
                        }
                        if launch.env.len() > 32 {
                            return Err(HostError::Invalid(
                                "process environment exceeds binding limit".into(),
                            ));
                        }
                        let tree = loader.artifacts.materialize(&artifact)?;
                        let scratch =
                            tempfile::tempdir_in(&loader.scratch).map_err(storage::unavailable)?;
                        let mut scratch_files = Vec::new();
                        for slot in slots {
                            let path = scratch.path().join(slot);
                            storage::directory(path.parent().ok_or_else(|| {
                                HostError::Invalid("invalid scratch parent".into())
                            })?)?;
                            storage::atomic(&path, b"", 0o600, false)?;
                            scratch_files.push(path);
                        }
                        let mut read_only = launch.read_only.clone();
                        read_only.push(tree.clone());
                        let profile = isolation::Profile {
                            scratch: scratch.path().into(),
                            scratch_files,
                            read_only,
                            local_paths: launch.local_paths.clone(),
                            directories: grants,
                            private_root: loader.private_root,
                            parent_pid: std::process::id(),
                            cpu_seconds: seconds,
                            environment: Default::default(),
                            cache_lease: Some(loader.cache.lease_path()),
                        };
                        Ok((
                            lifecycle::CacheUse {
                                scratch,
                                _lease: cache_lease,
                            },
                            profile,
                            helper,
                            tree,
                            launch,
                        ))
                    })
                    .await
                    .map_err(tool_error)?
                    .map_err(tool_error)?;
                let environment = ProcessEnvironment::bind(
                    scratch.scratch.path().into(),
                    [("runtime".into(), launch.program)].into(),
                    launch.env,
                    Arc::new(Guard { helper, profile }),
                    &self.env.identity,
                )
                .map_err(tool_error)?;
                let mut command_args = launch.args;
                command_args.push(
                    entry
                        .join(&self.config.entrypoint)
                        .to_str()
                        .ok_or_else(|| tool_error("non-UTF8 entrypoint"))?
                        .into(),
                );
                command_args.extend(self.config.args.clone());
                let config = ProcessToolConfig {
                    contract: self.config.contract.clone(),
                    program: "runtime".into(),
                    args: command_args,
                    script: None,
                    cwd: Default::default(),
                    input: self.config.input.clone(),
                };
                let factory = ProcessToolFactory::new("artifact-process-v1", environment)
                    .map_err(tool_error)?;
                let ModuleInstance::ToolPack(tools) = factory
                    .build(
                        &serde_json::to_value(config).map_err(tool_error)?,
                        &Default::default(),
                    )
                    .map_err(tool_error)?
                else {
                    return Err(tool_error("invalid process factory result"));
                };
                let entry = tools
                    .get(&self.config.contract.name)
                    .ok_or_else(|| tool_error("process tool missing"))?;
                Ok(entry.dispatch.call(id, args, ctx).await)
            };
        let result = tokio::select! {biased;
            _=cancel.cancelled()=>Err(ToolError::custom("cancelled","artifact process cancelled")),
            result=tokio::time::timeout(Duration::from_millis(self.config.contract.timeout_ms),operation)=>result.unwrap_or_else(|_|Err(ToolError::custom("timeout","artifact process timed out"))),
        };
        match result {
            Ok(stream) => stream,
            Err(e) => nofy_tool_runtime::terminal_only(Err(e)),
        }
    }
}

#[cfg(all(test, target_os = "linux", target_arch = "x86_64"))]
mod tests {
    use super::*;
    #[tokio::test]
    async fn cancellation_while_waiting_for_preparation_does_not_start_blocking_work() {
        let dir = tempfile::tempdir().unwrap();
        let loader = Loader::open(dir.path()).unwrap();
        // Real ELF for a fast integrity check, never launched. If preparation
        // starts early, the deliberately absent image fails before cancellation.
        loader.set_helper(Path::new("/usr/bin/true")).unwrap();
        let image=images::RuntimeImage::capture(serde_json::from_value(json!({"id":"queue","executable":"bin/loader","files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap()).unwrap();
        let environment = LockedEnvironmentFactory(loader.clone())
            .build(&json!({"manifest":image.manifest}), &Default::default())
            .unwrap();
        let artifact = nofy_agent_runtime::artifact::ArtifactFactory
            .build(
                &json!({"bundle":{"schema_version":1,"files":{"main.py":"print('{}')"}}}),
                &Default::default(),
            )
            .unwrap();
        let ModuleInstance::ToolPack(tools) = ProcessArtifactFactory
            .build(
                &json!({"contract":{"name":"compute","timeout_ms":5000},"entrypoint":"main.py"}),
                &[
                    ("environment".into(), environment),
                    ("artifact".into(), artifact),
                ]
                .into(),
            )
            .unwrap()
        else {
            panic!("tool pack")
        };
        let held = loader
            .preparation_work
            .clone()
            .acquire_many_owned(2)
            .await
            .unwrap();
        let cancel = tokio_util::sync::CancellationToken::new();
        let mut context = ToolCallContext::default();
        context.insert(nofy_tool_runtime::Cancellation(cancel.clone()));
        let dispatch = tools.get("compute").unwrap().dispatch.clone();
        let mut pending = tokio::spawn(async move {
            dispatch
                .call_terminal(
                    nofy_tool_protocol::ToolId::new("compute").unwrap(),
                    json!({}),
                    context,
                )
                .await
        });
        assert!(
            tokio::time::timeout(Duration::from_millis(100), &mut pending)
                .await
                .is_err()
        );
        cancel.cancel();
        let error = tokio::time::timeout(Duration::from_secs(1), pending)
            .await
            .unwrap()
            .unwrap()
            .unwrap_err();
        assert!(error.to_string().contains("cancelled"), "{error}");
        assert_eq!(
            std::fs::read_dir(dir.path().join("loader/images/trees"))
                .unwrap()
                .count(),
            0
        );
        assert_eq!(
            std::fs::read_dir(dir.path().join("loader/artifacts/trees"))
                .unwrap()
                .count(),
            0
        );
        drop(held);
    }
}

#[cfg(test)]
mod catalog_tests;
