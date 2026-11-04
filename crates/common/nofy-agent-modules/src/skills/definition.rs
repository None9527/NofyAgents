//! Serializable skill values, independent of product discovery and tool output.
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SkillPackage {
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub root: Option<String>,
    #[serde(default)]
    pub data: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct SkillInfo {
    pub name: String,
    pub description: String,
    pub path: String,
    pub body: Option<String>,
    pub scope: String,
    pub paths: Option<Vec<String>>,
    pub when_to_use: Option<String>,
    pub enabled: bool,
    pub user_invocable: bool,
    pub disable_model_invocation: bool,
    pub model: Option<String>,
    pub effort: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub package: Option<SkillPackage>,
    pub metadata: std::collections::BTreeMap<String, String>,
}
impl Default for SkillInfo {
    fn default() -> Self {
        Self {
            name: String::new(),
            description: String::new(),
            path: String::new(),
            body: None,
            scope: "system".into(),
            paths: None,
            when_to_use: None,
            enabled: true,
            user_invocable: true,
            disable_model_invocation: false,
            model: None,
            effort: None,
            allowed_tools: None,
            package: None,
            metadata: Default::default(),
        }
    }
}
impl SkillInfo {
    pub fn dedup_key(&self) -> String {
        self.package.as_ref().map_or_else(
            || self.name.clone(),
            |package| format!("{}:{}", package.name, self.name),
        )
    }
    pub(super) fn validate(&self) -> Result<usize, nofy_agent_runtime::Error> {
        let error =
            || nofy_agent_runtime::Error::Composition("invalid or oversized declared skill".into());
        if self.name.trim().is_empty() || self.body.is_none() {
            return Err(error());
        }
        let mut bytes = 0usize;
        let mut check = |text: &str, max: usize| {
            if text.len() > max {
                return Err(error());
            }
            bytes = bytes.checked_add(text.len()).ok_or_else(error)?;
            Ok(())
        };
        for (text, max) in [
            (&self.name, 128),
            (&self.description, 65536),
            (&self.path, 4096),
            (&self.scope, 128),
            (self.body.as_ref().unwrap(), 1048576),
        ] {
            check(text, max)?;
        }
        for (text, max) in [
            (self.when_to_use.as_ref(), 65536),
            (self.model.as_ref(), 128),
            (self.effort.as_ref(), 128),
        ] {
            if let Some(text) = text {
                check(text, max)?;
            }
        }
        for list in [&self.paths, &self.allowed_tools].into_iter().flatten() {
            if list.len() > 1024 {
                return Err(error());
            }
            for text in list {
                check(text, 16384)?;
            }
        }
        if self.metadata.len() > 128 {
            return Err(error());
        }
        for (key, value) in &self.metadata {
            check(key, 128)?;
            check(value, 65536)?;
        }
        if let Some(package) = &self.package {
            if package.name.trim().is_empty() || package.version.trim().is_empty() {
                return Err(error());
            }
            check(&package.name, 128)?;
            check(&package.version, 256)?;
            for text in [&package.root, &package.data].into_iter().flatten() {
                check(text, 4096)?;
            }
        }
        for text in self.paths.iter().flatten() {
            let pattern = text.strip_prefix('!').unwrap_or(text);
            globset::GlobBuilder::new(pattern)
                .literal_separator(true)
                .build()
                .map_err(|_| error())?;
        }
        Ok(bytes)
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SkillInput {
    pub skill: String,
    #[serde(default)]
    pub args: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SkillOutput {
    pub success: bool,
    pub tool_result: String,
    pub skill_name: String,
    pub skill_message: Option<String>,
    pub error: Option<String>,
}

pub(super) fn active(skill: &SkillInfo, touched: &[std::path::PathBuf], cwd: Option<&str>) -> bool {
    if !skill.enabled {
        return false;
    }
    let Some(patterns) = &skill.paths else {
        return true;
    };
    if patterns.is_empty() {
        return true;
    }
    let compiled = patterns
        .iter()
        .filter_map(|raw| {
            let (negated, text) = raw
                .strip_prefix('!')
                .map_or((false, raw.as_str()), |s| (true, s));
            globset::GlobBuilder::new(text)
                .literal_separator(true)
                .build()
                .ok()
                .map(|pattern| (negated, pattern.compile_matcher()))
        })
        .collect::<Vec<_>>();
    touched.iter().any(|path| {
        let relative = cwd
            .and_then(|cwd| path.strip_prefix(cwd).ok())
            .unwrap_or(path);
        let forms = [path.to_string_lossy(), relative.to_string_lossy()];
        let mut matched = false;
        for (negated, matcher) in &compiled {
            if forms.iter().any(|form| matcher.is_match(form.as_ref())) {
                matched = !*negated;
            }
        }
        matched
    })
}
