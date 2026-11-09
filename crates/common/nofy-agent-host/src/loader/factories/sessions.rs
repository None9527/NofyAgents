//! Portable declarations for interactive processes and outbound stdio MCP.
//! Native process ownership is selected only when a declaration is built.
use super::*;
#[cfg(target_os = "linux")]
mod native;
#[cfg(not(target_os = "linux"))]
use super::unavailable as native;
#[cfg(target_os = "linux")]
pub(crate) use native::ProcessSession;

pub(in crate::loader) struct SessionFactory;
pub(in crate::loader) struct TerminalFactory;
pub(in crate::loader) struct StdioFactory;
#[derive(Clone, serde::Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub(super) struct Config {
    entrypoint: String,
    args: Vec<String>,
    directories: BTreeMap<String, String>,
    terminal: bool,
    timeout_ms: u64,
    max_output_bytes: usize,
    rows: u16,
    columns: u16,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            entrypoint: String::new(),
            args: vec![],
            directories: BTreeMap::new(),
            terminal: false,
            timeout_ms: 600000,
            max_output_bytes: 1048576,
            rows: 24,
            columns: 80,
        }
    }
}
fn schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["entrypoint"],"properties":{
        "entrypoint":{"type":"string","minLength":1,"maxLength":4096},
        "args":{"type":"array","maxItems":120,"items":{"type":"string","maxLength":4096}},
        "directories":{"type":"object","maxProperties":8,"additionalProperties":{"type":"string","minLength":1,"maxLength":128}},
        "terminal":{"type":"boolean"},"timeout_ms":{"type":"integer","minimum":1,"maximum":86400000},
        "max_output_bytes":{"type":"integer","minimum":1,"maximum":8388608},
        "rows":{"type":"integer","minimum":1,"maximum":1000},"columns":{"type":"integer","minimum":1,"maximum":1000}}})
}
impl ModuleFactory for SessionFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.process_session",
            ModuleKind::Resource,
            schema(),
            BTreeMap::from([
                ("environment".into(), ModuleKind::Resource),
                ("artifact".into(), ModuleKind::Resource),
                ("limits".into(), ModuleKind::Resource),
            ]),
        )
    }
    fn config_dependencies(
        &self,
        value: &Value,
    ) -> std::result::Result<BTreeMap<String, ModuleKind>, Error> {
        nofy_agent_runtime::settings::validate_json_value(&schema(), value)?;
        let config: Config = serde_json::from_value(value.clone()).map_err(error)?;
        let mut dependencies = BTreeMap::new();
        for (alias, slot) in config.directories {
            if alias.is_empty()
                || alias.len() > 32
                || !alias.as_bytes()[0].is_ascii_uppercase()
                || !alias
                    .bytes()
                    .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || c == b'_')
                || matches!(slot.as_str(), "environment" | "artifact" | "limits")
                || dependencies.insert(slot, ModuleKind::Resource).is_some()
            {
                return Err(error("invalid or duplicate session directory slot"));
            }
        }
        Ok(dependencies)
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        self.config_dependencies(value)?;
        let config: Config = serde_json::from_value(value.clone()).map_err(error)?;
        nofy_agent_runtime::artifact::entry_path(&config.entrypoint)?;
        native::session(config, value, deps)
    }
}
impl ModuleFactory for TerminalFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.terminal",
            ModuleKind::ToolPack,
            json!({"type":"object","additionalProperties":false,"properties":{"name":{"type":"string","pattern":"^[A-Za-z0-9_-]+$","maxLength":128},"description":{"type":"string","maxLength":4096}}}),
            BTreeMap::from([("session".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        native::terminal(value, deps)
    }
}
impl ModuleFactory for StdioFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.mcp_stdio",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false}),
            BTreeMap::from([("session".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        native::stdio(value, deps)
    }
}

pub(crate) fn terminal_schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["op"],"properties":{
        "op":{"enum":["start","poll","write","resize","close"]},"start_id":{"type":"string","minLength":1,"maxLength":128},
        "session_id":{"type":"string","pattern":"^[0-9a-f]{64}$"},"command_id":{"type":"string","minLength":1,"maxLength":128},
        "text":{"type":"string","maxLength":1048576},"eof":{"type":"boolean"},"stdout_cursor":{"type":"integer","minimum":0},"stderr_cursor":{"type":"integer","minimum":0},
        "wait_ms":{"type":"integer","minimum":0,"maximum":30000},"limit":{"type":"integer","minimum":1,"maximum":1048576},
        "rows":{"type":"integer","minimum":1,"maximum":1000},"columns":{"type":"integer","minimum":1,"maximum":1000}}})
}
