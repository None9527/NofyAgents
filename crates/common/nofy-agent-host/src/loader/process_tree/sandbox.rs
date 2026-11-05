//! A disposable guest filesystem, built only inside the helper's namespace.
use super::*;
use std::{
    ffi::CString,
    fs::File,
    os::{
        fd::AsRawFd,
        unix::{
            ffi::OsStrExt,
            fs::{FileTypeExt, MetadataExt},
        },
    },
};

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(in crate::loader) struct Sandbox {
    pub root: PathBuf,
    pub runtime: Runtime,
    pub artifact: PathBuf,
    pub private_root: PathBuf,
    pub directories: Vec<(String, super::super::directories::Grant)>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub(in crate::loader) enum Runtime {
    Image {
        path: PathBuf,
        executable_files: Vec<String>,
    },
    Local {
        paths: Vec<super::super::local::Mount>,
    },
}
pub(in crate::loader) fn image_layout(
    manifest: &super::super::images::ImageManifest,
) -> Result<()> {
    manifest.validate()?;
    if manifest.library_dirs.iter().any(|p| p.contains(':')) {
        return Err(HostError::Invalid(
            "guest library directories cannot contain colon".into(),
        ));
    }
    if manifest.files.values().filter(|f| f.executable).count() > 256 {
        return Err(HostError::Invalid(
            "too many tree image executable files".into(),
        ));
    }
    for path in manifest.files.keys() {
        let top = path.split('/').next().unwrap_or_default();
        if matches!(top, "nofy" | "tmp" | "proc" | "sys" | "dev" | "run") {
            return Err(HostError::Invalid(
                "runtime image occupies a reserved guest root".into(),
            ));
        }
    }
    Ok(())
}
impl Sandbox {
    pub(in crate::loader) fn validate(&self) -> Result<()> {
        if !self.private_root.is_absolute()
            || !self
                .root
                .starts_with(self.private_root.join("loader/scratch"))
            || self.root == self.private_root.join("loader/scratch")
            || !self
                .artifact
                .starts_with(self.private_root.join("loader/artifacts/trees"))
            || self.artifact == self.private_root.join("loader/artifacts/trees")
            || self.directories.len() > 8
        {
            return Err(HostError::Invalid(
                "invalid private guest root boundary".into(),
            ));
        }
        let mut sources = vec![&self.root, &self.artifact, &self.private_root];
        match &self.runtime {
            Runtime::Image {
                path,
                executable_files,
            } => {
                if !path.starts_with(self.private_root.join("loader/images/trees"))
                    || *path == self.private_root.join("loader/images/trees")
                    || executable_files.is_empty()
                    || executable_files.len() > 256
                    || executable_files.iter().map(String::len).sum::<usize>() > 32768
                {
                    return Err(HostError::Invalid(
                        "invalid private guest image boundary".into(),
                    ));
                }
                sources.push(path);
                for file in executable_files {
                    nofy_agent_runtime::artifact::entry_path(file)?;
                }
            }
            Runtime::Local { paths } => {
                super::super::local::validate_paths(paths, &self.private_root)?
            }
        }
        for path in sources {
            if !path.is_absolute()
                || path.components().any(|c| {
                    !matches!(
                        c,
                        std::path::Component::RootDir | std::path::Component::Normal(_)
                    )
                })
                || path
                    .to_str()
                    .is_none_or(|s| s.len() > 4096 || s.chars().any(char::is_control))
            {
                return Err(HostError::Invalid("noncanonical guest source".into()));
            }
        }
        let mut seen = std::collections::BTreeSet::new();
        for (alias, _) in &self.directories {
            if alias.is_empty()
                || alias.len() > 32
                || !alias.as_bytes()[0].is_ascii_uppercase()
                || !alias
                    .bytes()
                    .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_')
                || !seen.insert(alias)
            {
                return Err(HostError::Invalid("invalid guest directory alias".into()));
            }
        }
        Ok(())
    }
    pub(super) fn lease(&self) -> Result<File> {
        self.validate()?;
        super::super::lifecycle::shared_file(&self.private_root.join("loader/lifecycle/lease.lock"))
    }
    pub(super) fn apply(&self) -> std::result::Result<(), Box<dyn std::error::Error>> {
        self.apply_session(false, false)
    }
    pub(in crate::loader) fn apply_session(
        &self,
        terminal: bool,
        network: bool,
    ) -> std::result::Result<(), Box<dyn std::error::Error>> {
        use landlock::{
            ABI, Access, AccessFs, CompatLevel, Compatible, PathBeneath, PathFd, Ruleset,
            RulesetAttr, RulesetCreatedAttr, RulesetStatus,
        };
        self.validate()?;
        if std::fs::canonicalize(&self.root)? != self.root
            || std::fs::read_dir(&self.root)?.next().is_some()
        {
            return Err("guest root is not canonical and empty".into());
        }
        // Pin directory grants before chroot. open validates the same FD that
        // is bound; no second pathname resolution may substitute an alias.
        let mut directories = Vec::new();
        for (alias, grant) in &self.directories {
            directories.push((alias, grant, grant.open(&self.private_root)?));
        }
        let mut local = Vec::new();
        let mut executable = Vec::new();
        let image = match &self.runtime {
            Runtime::Image {
                path,
                executable_files,
            } => {
                executable.extend(executable_files.iter().map(|p| Path::new("/").join(p)));
                Some((path, pinned(path)?))
            }
            Runtime::Local { paths } => {
                for path in paths {
                    local.push((path, path.open(&self.private_root)?));
                    if path.execute {
                        executable.push(path.path.clone());
                    }
                }
                None
            }
        };
        let artifact = pinned(&self.artifact)?;
        mount(
            None,
            Path::new("/"),
            None,
            libc::MS_REC | libc::MS_PRIVATE,
            None,
        )?;
        mount(
            Some("tmpfs"),
            &self.root,
            Some("tmpfs"),
            libc::MS_NOSUID | libc::MS_NODEV,
            Some("size=8388608,nr_inodes=4096,mode=0755"),
        )?;
        let mut entries = 0;
        if let Some((path, image)) = &image {
            for entry in std::fs::read_dir(path)? {
                let entry = entry?;
                entries += 1;
                let name = entry.file_name();
                let name = name.to_str().ok_or("non-UTF8 image root")?;
                if entries > 4096 || matches!(name, "nofy" | "tmp" | "proc" | "sys" | "dev" | "run")
                {
                    return Err("invalid image guest layout".into());
                }
                let source = relative_file(image, name)?;
                bind(&source, &self.root.join(name), true, false)?;
            }
        }
        std::fs::create_dir_all(self.root.join("nofy/directories"))?;
        bind(&artifact, &self.root.join("nofy/artifact"), true, true)?;
        let scratch = self.root.join("nofy/scratch");
        std::fs::create_dir(&scratch)?;
        mount(
            Some("tmpfs"),
            &scratch,
            Some("tmpfs"),
            libc::MS_NOSUID | libc::MS_NODEV | libc::MS_NOEXEC,
            Some("size=67108864,nr_inodes=4096,mode=0700"),
        )?;
        std::fs::create_dir(self.root.join("tmp"))?;
        let temp = pinned(&scratch)?;
        bind(&temp, &self.root.join("tmp"), false, true)?;
        // Install user-owned dependencies only after the private /tmp exists.
        // A specific /tmp/project-env may be exposed; host /tmp never is.
        for (path, file) in &local {
            bind_mount(
                file,
                &self.root.join(path.path.strip_prefix("/")?),
                true,
                !path.execute,
                true,
            )
            .map_err(|error| {
                format!(
                    "local dependency mount {} failed: {error}",
                    path.path.display()
                )
            })?;
        }
        for (alias, grant, fd) in &directories {
            use std::os::fd::AsFd;
            let source = File::from(fd.as_fd().try_clone_to_owned()?);
            let guest = Path::new("/nofy/directories").join(alias);
            let read_only = matches!(grant.access, super::super::directories::Access::ReadOnly);
            let noexec = !matches!(
                grant.access,
                super::super::directories::Access::ReadWriteExecute
            );
            bind(
                &source,
                &self.root.join(guest.strip_prefix("/")?),
                read_only,
                noexec,
            )?;
            if !noexec {
                executable.push(guest);
            }
        }
        std::fs::create_dir(self.root.join("dev"))?;
        let null = File::open("/dev/null")?;
        let meta = null.metadata()?;
        if !meta.file_type().is_char_device()
            || libc::major(meta.rdev()) != 1
            || libc::minor(meta.rdev()) != 3
        {
            return Err("unexpected null device".into());
        }
        let null_target = self.root.join("dev/null");
        File::create(&null_target)?;
        mount(
            Some(&fd_path(&null)),
            &null_target,
            None,
            libc::MS_BIND,
            None,
        )?;
        attributes(&null_target, false, true, false)?;
        if terminal {
            use std::os::unix::fs::OpenOptionsExt;
            let tty = std::fs::OpenOptions::new()
                .read(true)
                .custom_flags(libc::O_PATH | libc::O_CLOEXEC)
                .open("/dev/tty")?;
            let meta = tty.metadata()?;
            if !meta.file_type().is_char_device()
                || libc::major(meta.rdev()) != 5
                || libc::minor(meta.rdev()) != 0
            {
                return Err("unexpected controlling-terminal device".into());
            }
            let target = self.root.join("dev/tty");
            File::create(&target)?;
            mount(Some(&fd_path(&tty)), &target, None, libc::MS_BIND, None)?;
            attributes(&target, false, true, false)?;
        }
        // Root scaffold is immutable. Only explicit child mounts remain RW.
        mount(
            None,
            &self.root,
            None,
            libc::MS_REMOUNT | libc::MS_RDONLY | libc::MS_NOSUID | libc::MS_NODEV,
            None,
        )?;
        let root = cpath(&self.root)?;
        if unsafe { libc::chroot(root.as_ptr()) } != 0 {
            return Err(std::io::Error::last_os_error().into());
        }
        std::env::set_current_dir("/")?;
        drop((directories, image, local, artifact, temp, null));
        super::super::isolation::drop_capabilities()?;
        let abi = ABI::V3;
        let mut rules = Ruleset::default()
            .set_compatibility(CompatLevel::HardRequirement)
            .handle_access(AccessFs::from_all(abi))?
            .create()?;
        let read = AccessFs::ReadFile | AccessFs::ReadDir;
        rules = rules.add_rule(PathBeneath::new(PathFd::new("/")?, read))?;
        for path in executable {
            rules = rules.add_rule(PathBeneath::new(PathFd::new(path)?, AccessFs::Execute))?;
        }
        let write = read
            | AccessFs::WriteFile
            | AccessFs::Truncate
            | AccessFs::MakeReg
            | AccessFs::MakeDir
            | AccessFs::RemoveFile
            | AccessFs::RemoveDir
            | AccessFs::Refer
            | AccessFs::MakeSym;
        for path in ["/nofy/scratch", "/tmp"] {
            rules = rules.add_rule(PathBeneath::new(PathFd::new(path)?, write))?;
        }
        rules = rules.add_rule(PathBeneath::new(
            PathFd::new("/dev/null")?,
            AccessFs::ReadFile | AccessFs::WriteFile,
        ))?;
        if terminal {
            rules = rules.add_rule(PathBeneath::new(
                PathFd::new("/dev/tty")?,
                AccessFs::ReadFile | AccessFs::WriteFile,
            ))?;
        }
        for (alias, grant) in &self.directories {
            if !matches!(grant.access, super::super::directories::Access::ReadOnly) {
                rules = rules.add_rule(PathBeneath::new(
                    PathFd::new(Path::new("/nofy/directories").join(alias))?,
                    write,
                ))?;
            }
        }
        if rules.restrict_self()?.ruleset != RulesetStatus::FullyEnforced {
            return Err("guest Landlock was not fully enforced".into());
        }
        if network || terminal {
            super::filter::apply_network(network, terminal)?;
        } else {
            super::filter::apply()?;
        }
        Ok(())
    }
}
fn cpath(path: &Path) -> std::io::Result<CString> {
    CString::new(path.as_os_str().as_bytes()).map_err(|_| std::io::Error::other("NUL path"))
}
fn mount(
    source: Option<&str>,
    target: &Path,
    kind: Option<&str>,
    flags: libc::c_ulong,
    data: Option<&str>,
) -> std::io::Result<()> {
    let source = source.map(CString::new).transpose()?;
    let target = cpath(target)?;
    let kind = kind.map(CString::new).transpose()?;
    let data = data.map(CString::new).transpose()?;
    if unsafe {
        libc::mount(
            source.as_ref().map_or(std::ptr::null(), |s| s.as_ptr()),
            target.as_ptr(),
            kind.as_ref().map_or(std::ptr::null(), |s| s.as_ptr()),
            flags,
            data.as_ref()
                .map_or(std::ptr::null(), |s| s.as_ptr().cast()),
        )
    } != 0
    {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}
fn fd_path(file: &File) -> String {
    format!("/proc/self/fd/{}", file.as_raw_fd())
}
fn pinned(path: &Path) -> std::io::Result<File> {
    use std::os::unix::fs::OpenOptionsExt;
    let file = std::fs::OpenOptions::new()
        .read(true)
        .custom_flags(libc::O_PATH | libc::O_NOFOLLOW | libc::O_CLOEXEC)
        .open(path)?;
    if std::fs::read_link(fd_path(&file))? != path || !file.metadata()?.is_dir() {
        return Err(std::io::Error::other("directory source changed"));
    }
    Ok(file)
}
fn relative_file(root: &File, name: &str) -> std::io::Result<File> {
    use std::os::fd::FromRawFd;
    let name = CString::new(name)?;
    let fd = unsafe {
        libc::openat(
            root.as_raw_fd(),
            name.as_ptr(),
            libc::O_PATH | libc::O_NOFOLLOW | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return Err(std::io::Error::last_os_error());
    }
    let file = unsafe { File::from_raw_fd(fd) };
    let meta = file.metadata()?;
    if !meta.is_dir() && !meta.is_file() {
        return Err(std::io::Error::other("invalid image root entry"));
    }
    Ok(file)
}
fn bind(source: &File, target: &Path, read_only: bool, noexec: bool) -> std::io::Result<()> {
    bind_mount(source, target, read_only, noexec, false)
}
fn bind_mount(
    source: &File,
    target: &Path,
    read_only: bool,
    noexec: bool,
    recursive: bool,
) -> std::io::Result<()> {
    let directory = source.metadata()?.is_dir();
    if directory {
        std::fs::create_dir_all(target)?;
    } else {
        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent)?;
        }
        File::create(target)?;
    }
    // User-provisioned dependency roots may include locked child mounts.
    // Preserve that visible subtree and only add restrictions recursively.
    let flags = libc::MS_BIND
        | if recursive && directory {
            libc::MS_REC
        } else {
            0
        };
    mount(Some(&fd_path(source)), target, None, flags, None)?;
    attributes(target, read_only, noexec, true)
}
fn attributes(path: &Path, read_only: bool, noexec: bool, nodev: bool) -> std::io::Result<()> {
    #[repr(C)]
    struct Attr {
        set: u64,
        clear: u64,
        propagation: u64,
        userns: u64,
    }
    let attr = Attr {
        set: 2
            | if read_only { 1 } else { 0 }
            | if nodev { 4 } else { 0 }
            | if noexec { 8 } else { 0 },
        clear: 0,
        propagation: 0,
        userns: 0,
    };
    let path = cpath(path)?;
    if unsafe {
        libc::syscall(
            libc::SYS_mount_setattr,
            libc::AT_FDCWD,
            path.as_ptr(),
            0x8000u32,
            &attr,
            std::mem::size_of::<Attr>(),
        )
    } != 0
    {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}
