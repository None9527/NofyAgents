use clap::ArgMatches;
use nofy_agent_client::{Engine, Error, KernelClient, Result};
use serde::Deserialize;
use std::{
    collections::BTreeMap,
    io::Read,
    path::{Path, PathBuf},
    time::Duration,
};
use zeroize::Zeroizing;

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    #[serde(default)]
    profiles: BTreeMap<String, Profile>,
}
#[derive(Clone, Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Profile {
    endpoint: Option<String>,
    token_env: Option<String>,
    token_file: Option<PathBuf>,
    format: Option<String>,
    preset_dir: Option<PathBuf>,
}
pub struct Settings {
    pub engine: Engine,
    pub format: String,
    pub timeout: Duration,
}
fn env(name: &str) -> Option<String> {
    std::env::var(name).ok().filter(|s| !s.is_empty())
}
fn get(m: &ArgMatches, name: &str) -> Option<String> {
    m.get_one::<String>(name).cloned()
}
pub fn private_text(path: &Path) -> Result<Zeroizing<String>> {
    let before = path.symlink_metadata()?;
    if !before.is_file() || before.file_type().is_symlink() {
        return Err(Error::new(
            "local_input",
            "secret input must be a regular private file",
        ));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if before.permissions().mode() & 0o077 != 0 {
            return Err(Error::new(
                "local_input",
                "secret input file must not grant group or other access",
            ));
        }
    }
    let mut options = std::fs::OpenOptions::new();
    options.read(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK);
    }
    let mut file = options.open(path)?;
    if !file.metadata()?.is_file() {
        return Err(Error::new(
            "local_input",
            "secret input must be a regular file",
        ));
    }
    let mut text = Zeroizing::new(String::new());
    file.read_to_string(&mut text)?;
    if text.ends_with('\n') {
        text.pop();
        if text.ends_with('\r') {
            text.pop();
        }
    }
    Ok(text)
}
pub fn load(m: &ArgMatches, http_mcp: bool) -> Result<Settings> {
    let default_path = env("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| env("HOME").map(|p| PathBuf::from(p).join(".config")))
        .map(|p| p.join("nofy/config.toml"));
    let configured = get(m, "config")
        .map(PathBuf::from)
        .or_else(|| env("NOFY_CONFIG").map(PathBuf::from));
    let path = configured.clone().or(default_path);
    let config = match path {
        Some(path) if path.exists() || configured.is_some() => {
            toml::from_str::<Config>(&std::fs::read_to_string(path)?)
                .map_err(|_| Error::new("local_input", "invalid client TOML configuration"))?
        }
        _ => Config::default(),
    };
    let profile_name = get(m, "profile")
        .or_else(|| env("NOFY_PROFILE"))
        .unwrap_or_else(|| "local".into());
    let profile = match config.profiles.get(&profile_name) {
        Some(p) => p.clone(),
        None if profile_name == "local" && config.profiles.is_empty() => Profile::default(),
        None => {
            return Err(Error::new(
                "local_input",
                "selected client profile does not exist",
            ));
        }
    };
    if profile.token_env.is_some() && profile.token_file.is_some() {
        return Err(Error::new(
            "local_input",
            "profile must choose token_env or token_file",
        ));
    }
    let endpoint = get(m, "endpoint")
        .or(profile.endpoint)
        .or_else(|| env("NOFY_ENDPOINT"))
        .unwrap_or_else(|| "http://127.0.0.1:7331".into());
    let timeout = get(m, "timeout")
        .or_else(|| env("NOFY_TIMEOUT"))
        .unwrap_or_else(|| "30".into())
        .parse::<f64>()
        .ok()
        .filter(|n| n.is_finite() && *n > 0.0 && *n <= 86400.0)
        .ok_or_else(|| {
            Error::new(
                "local_input",
                "timeout must be positive and at most 86400 seconds",
            )
        })?;
    let timeout = Duration::from_secs_f64(timeout);
    let token = if http_mcp {
        None
    } else {
        let explicit_env = get(m, "token_env");
        let explicit_file = get(m, "token_file").map(PathBuf::from);
        let (token_env, token_file) = if explicit_env.is_some() || explicit_file.is_some() {
            (explicit_env, explicit_file)
        } else if profile.token_env.is_some() || profile.token_file.is_some() {
            (profile.token_env, profile.token_file)
        } else {
            (
                env("NOFY_TOKEN_ENV"),
                env("NOFY_TOKEN_FILE").map(PathBuf::from),
            )
        };
        if token_env.is_some() && token_file.is_some() {
            return Err(Error::new("local_input", "choose one access token source"));
        }
        if let Some(path) = token_file {
            Some(private_text(&path)?.to_string())
        } else {
            let name = token_env.unwrap_or_else(|| "NOFY_ACCESS_TOKEN".into());
            match std::env::var(&name) {
                Ok(token) => Some(token),
                Err(std::env::VarError::NotPresent) => None,
                Err(_) => {
                    return Err(Error::new(
                        "local_input",
                        "access token environment must be UTF-8",
                    ));
                }
            }
        }
    };
    let mut engine = Engine::new(KernelClient::new(&endpoint, token, timeout)?);
    let preset_dir = get(m, "preset_dir")
        .map(PathBuf::from)
        .or(profile.preset_dir)
        .or_else(|| env("NOFY_PRESET_DIR").map(PathBuf::from));
    if let Some(path) = preset_dir {
        engine = engine.with_templates(nofy_agent_project::TemplateRegistry::open(
            &std::fs::canonicalize(path)?,
        )?);
    }
    engine.offline = m.get_flag("offline");
    let format = get(m, "format")
        .or(profile.format)
        .or_else(|| env("NOFY_FORMAT"))
        .unwrap_or_else(|| "json".into());
    if !matches!(format.as_str(), "json" | "text") {
        return Err(Error::new("local_input", "format must be json or text"));
    }
    Ok(Settings {
        engine,
        format,
        timeout,
    })
}
