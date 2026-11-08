use super::*;
use crate::loader::images::{EnvironmentValue, ImageManifest, RuntimeImage};

struct Fixture {
    private: tempfile::TempDir,
    public: tempfile::TempDir,
    loader: Loader,
    manifest: ImageManifest,
}
impl Fixture {
    fn new() -> Self {
        let private = tempfile::tempdir().unwrap();
        let public = tempfile::tempdir().unwrap();
        let loader = Loader::open(private.path()).unwrap();
        loader.set_helper(Path::new("/usr/bin/true")).unwrap();
        // Capture a real ELF for metadata checks. No program or missing
        // project/cgroup/image dependency may be inspected by pure build.
        let image = RuntimeImage::capture(
            serde_json::from_value(json!({
                "id":"pure-tree-launch", "executable":"bin/loader",
                "files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}
            }))
            .unwrap(),
        )
        .unwrap();
        let mut manifest = image.manifest;
        manifest.loader = Some(manifest.executable.clone());
        manifest.library_dirs = vec!["bin".into()];
        manifest.prefix_args = vec!["prefix".into(); 3];
        Self {
            private,
            public,
            loader,
            manifest,
        }
    }
    fn config(&self) -> Value {
        json!({"contract":{"name":"probe"},"entrypoint":"main.py",
            "directories":{"PROJECT":"project"}})
    }
    fn build(
        &self,
        manifest: &ImageManifest,
        config: &Value,
    ) -> std::result::Result<ModuleInstance, Error> {
        let environment = LockedEnvironmentFactory(self.loader.clone())
            .build(&json!({"manifest":manifest}), &Default::default())?;
        let artifact = nofy_agent_runtime::artifact::ArtifactFactory.build(
            &json!({"bundle":{"schema_version":1,"files":{"main.py":"print('{}')"}}}),
            &Default::default(),
        )?;
        let tree = process_tree::Factory.build(
            &json!({"cgroup_root":"/sys/fs/cgroup/absent-pure-tree/jobs"}),
            &Default::default(),
        )?;
        let project = crate::loader::directories::Factory::new(self.private.path().into()).build(
            &json!({"path":self.public.path().join("missing"),"access":"read_only"}),
            &Default::default(),
        )?;
        TreeArtifactFactory.build(
            config,
            &[
                ("environment".into(), environment),
                ("artifact".into(), artifact),
                ("tree".into(), tree),
                ("project".into(), project),
            ]
            .into(),
        )
    }
    fn untouched(&self) {
        assert!(!self.public.path().join("missing").exists());
        for kind in ["scratch", "images/trees", "artifacts/trees"] {
            assert_eq!(
                std::fs::read_dir(self.private.path().join("loader").join(kind))
                    .unwrap()
                    .count(),
                0,
                "{kind}"
            );
        }
        assert_eq!(self.loader.process_trees.pending().unwrap(), 0);
    }
}
fn literal(value: String) -> EnvironmentValue {
    EnvironmentValue::Literal { value }
}
#[test]
fn combined_launch_limits_are_rejected_during_pure_factory_build() {
    let f = Fixture::new();
    let mut accepted = Vec::new();
    for case in 0..6 {
        let mut manifest = f.manifest.clone();
        let mut config = f.config();
        match case {
            0 => config["args"] = json!(vec!["argument"; 128]),
            1 => config["args"] = json!(vec!["a".repeat(4096); 16]),
            2 => manifest.prefix_args = vec!["p".repeat(4096); 32],
            3 => {
                manifest.env = (0..32)
                    .map(|n| (format!("E{n}"), literal("value".into())))
                    .collect()
            }
            4 => {
                manifest.env = (0..9)
                    .map(|n| (format!("E{n}"), literal("e".repeat(4096))))
                    .collect()
            }
            _ => config["args"] = json!(["é".repeat(2049)]),
        }
        manifest.validate().unwrap();
        match f.build(&manifest, &config) {
            Ok(_) => accepted.push(case),
            Err(error) => assert!(
                error.to_string().contains("invalid supervised command"),
                "case {case}: {error}"
            ),
        }
        f.untouched();
    }
    assert!(
        accepted.is_empty(),
        "pure build accepted over-limit combinations: {accepted:?}"
    );
}
#[test]
fn encoded_bootstrap_limit_counts_json_escaping_and_sandbox_metadata() {
    let f = Fixture::new();
    let mut manifest = f.manifest.clone();
    manifest.env = (0..8)
        .map(|n| (format!("E{n}"), literal("\\".repeat(4078))))
        .collect();
    manifest.validate().unwrap();
    match f.build(&manifest, &f.config()) {
        Ok(_) => panic!("pure build accepted a bootstrap exceeding its wire bound"),
        Err(error) => assert!(error.to_string().contains("64KiB"), "{error}"),
    }
    f.untouched();
}
#[test]
fn boundary_valid_counts_are_accepted_without_dependency_io() {
    let f = Fixture::new();
    let mut manifest = f.manifest.clone();
    manifest.env = (0..31)
        .map(|n| (format!("E{n}"), literal("value".into())))
        .collect();
    let mut config = f.config();
    // 4 loader arguments + 3 prefix + entrypoint + 120 arguments = 128.
    config["args"] = json!(vec!["argument"; 120]);
    assert!(matches!(
        f.build(&manifest, &config).unwrap(),
        ModuleInstance::ToolPack(_)
    ));
    f.untouched();
}

#[test]
fn exact_wire_boundary_uses_encoded_bytes_not_raw_argument_lengths() {
    let mut profile = process_tree::Bootstrap {
        parent_pid: 1,
        program: "/usr/bin/true".into(),
        arguments: vec!["a".repeat(4096); 15],
        environment: BTreeMap::new(),
        cwd: "/".into(),
        sandbox: None,
        session: None,
    };
    profile.arguments.push(String::new());
    let padding = 65536 - profile.encode().unwrap().len();
    assert!(padding <= 4096);
    *profile.arguments.last_mut().unwrap() = "a".repeat(padding);
    assert_eq!(profile.encode().unwrap().len(), 65536);
    profile.arguments.last_mut().unwrap().push('a');
    assert!(profile.encode().unwrap_err().to_string().contains("64KiB"));
}

#[test]
fn pure_wire_bound_covers_actual_random_names_pid_width_and_escaped_paths() {
    let f = Fixture::new();
    let mut config = f.config();
    config["directories"] = json!({});
    let config: ToolConfig = serde_json::from_value(config).unwrap();
    let launch = GuestLaunch::build(&f.manifest, &config).unwrap();
    let artifact: ArtifactBundle = serde_json::from_value(json!({
        "schema_version":1,"files":{"main.py":"print('{}')"}
    }))
    .unwrap();
    let root = f.private.path().join("méta-\"\\root");
    let parent = root.join("loader/scratch");
    std::fs::create_dir_all(&parent).unwrap();
    let mut sandbox = launch
        .preflight(
            &root,
            &RuntimeSource::Locked(Arc::new(f.manifest.clone())),
            &artifact,
            &BTreeMap::new(),
        )
        .unwrap();
    assert_eq!(std::fs::read_dir(&parent).unwrap().count(), 0);
    let profile = |parent_pid, sandbox| process_tree::Bootstrap {
        parent_pid,
        program: launch.program.clone(),
        arguments: launch.arguments.clone(),
        environment: launch.environment.clone(),
        cwd: "/nofy/scratch".into(),
        sandbox: Some(sandbox),
        session: None,
    };
    let maximum = profile(u32::MAX, sandbox.clone()).encode().unwrap().len();
    for _ in 0..8 {
        let scratch = launch::scratch(&parent).unwrap();
        sandbox.root = scratch.path().join("root");
        for pid in [1, std::process::id(), u32::MAX] {
            let actual = profile(pid, sandbox.clone()).encode().unwrap().len();
            assert!(actual <= maximum);
            if pid == u32::MAX {
                assert_eq!(actual, maximum);
            }
        }
    }
    assert_eq!(std::fs::read_dir(&parent).unwrap().count(), 0);
    f.untouched();
}
