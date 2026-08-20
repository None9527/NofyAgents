//! Unit generation for the daemon install subcommand (FR1.14, OC-F4):
//! launchd plist + systemd unit, rendered deterministically from one
//! spec.
//!
//! The spec is validated BEFORE rendering: empty paths and labels with
//! shell/unit metacharacters are refused (the label lands inside unit
//! text — an unvalidated label is an injection vector).

/// What the install subcommand needs to render a unit.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UnitSpec {
    /// Absolute path to the daemon binary.
    pub bin_path: String,
    /// Service label / unit name (e.g. "nofy-daemon").
    pub label: String,
    /// Working directory for the service.
    pub working_dir: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum UnitError {
    EmptyField(&'static str),
    NotAbsolute(&'static str),
    /// Labels must stay plain identifiers.
    BadLabel(String),
}

/// Validate the spec.
pub fn validate_spec(spec: &UnitSpec) -> Result<(), UnitError> {
    for (name, value) in [
        ("bin_path", &spec.bin_path),
        ("label", &spec.label),
        ("working_dir", &spec.working_dir),
    ] {
        if value.trim().is_empty() {
            return Err(UnitError::EmptyField(match name {
                "bin_path" => "bin_path",
                "label" => "label",
                _ => "working_dir",
            }));
        }
    }
    if !spec.bin_path.starts_with('/') {
        return Err(UnitError::NotAbsolute("bin_path"));
    }
    if !spec.working_dir.starts_with('/') {
        return Err(UnitError::NotAbsolute("working_dir"));
    }
    let ok = spec
        .label
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.');
    if !ok {
        return Err(UnitError::BadLabel(spec.label.clone()));
    }
    Ok(())
}

/// Render the launchd plist.
pub fn launchd_plist(spec: &UnitSpec) -> Result<String, UnitError> {
    validate_spec(spec)?;
    Ok(format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
         <!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n\
         <plist version=\"1.0\">\n\
         <dict>\n\
         \t<key>Label</key>\n\
         \t<string>{label}</string>\n\
         \t<key>ProgramArguments</key>\n\
         \t<array>\n\
         \t\t<string>{bin}</string>\n\
         \t\t<string>daemon</string>\n\
         \t\t<string>run</string>\n\
         \t</array>\n\
         \t<key>WorkingDirectory</key>\n\
         \t<string>{dir}</string>\n\
         \t<key>KeepAlive</key>\n\
         \t<true/>\n\
         </dict>\n\
         </plist>\n",
        label = spec.label,
        bin = spec.bin_path,
        dir = spec.working_dir
    ))
}

/// Render the systemd unit.
pub fn systemd_unit(spec: &UnitSpec) -> Result<String, UnitError> {
    validate_spec(spec)?;
    Ok(format!(
        "[Unit]\n\
         Description={label} daemon\n\
         After=network.target\n\
         \n\
         [Service]\n\
         ExecStart={bin} daemon run\n\
         WorkingDirectory={dir}\n\
         Restart=always\n\
         \n\
         [Install]\n\
         WantedBy=default.target\n",
        label = spec.label,
        bin = spec.bin_path,
        dir = spec.working_dir
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn spec() -> UnitSpec {
        UnitSpec {
            bin_path: "/usr/local/bin/nofy".into(),
            label: "nofy-daemon".into(),
            working_dir: "/home/u".into(),
        }
    }

    #[test]
    fn valid_spec_renders_both_targets_deterministically() {
        let s = spec();
        let plist = launchd_plist(&s).unwrap();
        assert!(plist.contains("<string>nofy-daemon</string>"));
        assert!(plist.contains("<string>/usr/local/bin/nofy</string>"));
        let unit = systemd_unit(&s).unwrap();
        assert!(unit.contains("ExecStart=/usr/local/bin/nofy daemon run"));
        assert!(unit.contains("WorkingDirectory=/home/u"));
        // Deterministic: same spec, same bytes.
        assert_eq!(plist, launchd_plist(&s).unwrap());
        assert_eq!(unit, systemd_unit(&s).unwrap());
    }

    #[test]
    fn empty_fields_refused() {
        let mut s = spec();
        s.bin_path = "  ".into();
        assert_eq!(launchd_plist(&s), Err(UnitError::EmptyField("bin_path")));
    }

    #[test]
    fn empty_label_and_working_dir_refused() {
        let mut s = spec();
        s.label = "  ".into();
        assert_eq!(launchd_plist(&s), Err(UnitError::EmptyField("label")));
        let mut s = spec();
        s.working_dir = "".into();
        assert_eq!(systemd_unit(&s), Err(UnitError::EmptyField("working_dir")));
    }

    #[test]
    fn relative_bin_path_refused() {
        let mut s = spec();
        s.bin_path = "bin/nofy".into();
        assert_eq!(launchd_plist(&s), Err(UnitError::NotAbsolute("bin_path")));
    }

    #[test]
    fn relative_paths_refused() {
        let mut s = spec();
        s.working_dir = "relative/dir".into();
        assert_eq!(systemd_unit(&s), Err(UnitError::NotAbsolute("working_dir")));
    }

    #[test]
    fn label_metacharacters_refused() {
        for bad in ["nofy;rm", "nofy daemon", "nofy\nEvil", "nofy</string>"] {
            let s = UnitSpec { label: bad.into(), ..spec() };
            assert_eq!(launchd_plist(&s), Err(UnitError::BadLabel(bad.into())), "{bad:?} must be refused");
        }
    }
}
