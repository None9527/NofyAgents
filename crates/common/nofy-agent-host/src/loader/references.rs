//! Observed declared references. A successful read never authorizes deletion.
use super::*;
use crate::KernelHost;
use nofy_agent_runtime::durable::retention::{RetentionCoverage, RetentionLimits, RetentionOrigin};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ObjectKey {
    Artifact { digest: String },
    Image { digest: String },
    Runtime { id: String, revision: String },
}
impl ObjectKey {
    pub(super) fn validate(&self) -> Result<()> {
        match self {
            Self::Artifact { digest } | Self::Image { digest } => storage::digest(digest),
            Self::Runtime { id, revision } => {
                sources::name(id)?;
                storage::digest(revision)
            }
        }
    }
}
fn samples() -> usize {
    16
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReferenceRequest {
    pub objects: Vec<ObjectKey>,
    #[serde(default = "samples")]
    pub sample_limit: usize,
}
#[derive(Serialize)]
pub struct ObjectReferences {
    pub object: ObjectKey,
    pub observed_origins: u64,
    pub counts: BTreeMap<String, u64>,
    pub samples: Vec<RetentionOrigin>,
    pub more_samples: bool,
    pub state: &'static str,
}
#[derive(Serialize)]
pub struct ReferenceReport {
    pub catalog_revision: Option<u64>,
    pub source_revision: u64,
    pub runtime: RetentionCoverage,
    pub opaque_declarations: u64,
    pub declaration_samples: Vec<RetentionOrigin>,
    pub references: Vec<ObjectReferences>,
    pub deletion_authorized: bool,
}
struct Collector {
    objects: Vec<ObjectReferences>,
    limit: usize,
    opaque: u64,
    opaque_samples: Vec<RetentionOrigin>,
}
impl Collector {
    fn observed(&mut self, origin: &RetentionOrigin, keys: BTreeSet<ObjectKey>) {
        for object in &mut self.objects {
            if keys.contains(&object.object) {
                object.observed_origins += 1;
                *object.counts.entry(origin.kind.clone()).or_default() += 1;
                if object.samples.len() < self.limit {
                    object.samples.push(origin.clone());
                } else {
                    object.more_samples = true;
                }
            }
        }
    }
    fn opaque(&mut self, origin: &RetentionOrigin) {
        self.opaque += 1;
        if self.opaque_samples.len() < self.limit {
            self.opaque_samples.push(origin.clone());
        }
    }
    fn declarations(&mut self, origin: &RetentionOrigin, definitions: &[&ModuleDefinition]) {
        let modules = match module_walk::collect_definitions(definitions) {
            Ok(m) => m,
            Err(_) => {
                self.opaque(origin);
                return;
            }
        };
        self.modules(origin, modules);
    }
    fn modules(&mut self, origin: &RetentionOrigin, modules: Vec<ModuleDefinition>) {
        let mut keys = BTreeSet::new();
        let mut unknown = false;
        for module in modules {
            if module.factory == "resource.workflow"
                && module
                    .config
                    .get("document")
                    .and_then(|d| d.get("schema_version"))
                    .is_some_and(|v| v != 1)
            {
                unknown = true;
            }
            let interested = self.objects.iter().any(|o| {
                matches!(
                    (&o.object, module.factory.as_str()),
                    (ObjectKey::Artifact { .. }, "resource.artifact")
                        | (ObjectKey::Image { .. }, "resource.process_locked")
                        | (ObjectKey::Runtime { .. }, "resource.process")
                )
            });
            if !interested {
                continue;
            }
            match key(&module) {
                Ok(Some(value)) => {
                    keys.insert(value);
                }
                Ok(None) => {}
                Err(_) => unknown = true,
            }
        }
        self.observed(origin, keys);
        if unknown {
            self.opaque(origin);
        }
    }
}
pub(super) fn key(module: &ModuleDefinition) -> Result<Option<ObjectKey>> {
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct Artifact {
        bundle: nofy_agent_runtime::artifact::ArtifactBundle,
    }
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct Digest {
        digest: String,
    }
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct Image {
        image: String,
    }
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct Runtime {
        runtime: RuntimeRef,
    }
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct RuntimeRef {
        id: String,
        revision: String,
    }
    fn parsed<T: serde::de::DeserializeOwned>(value: &serde_json::Value) -> Result<T> {
        serde_json::from_value(value.clone())
            .map_err(|_| HostError::Invalid("incomplete retained resource declaration".into()))
    }
    let key = match module.factory.as_str() {
        "resource.artifact" => ObjectKey::Artifact {
            digest: if module.config.get("digest").is_some() {
                parsed::<Digest>(&module.config)?.digest
            } else {
                parsed::<Artifact>(&module.config)?
                    .bundle
                    .digest()
                    .map_err(HostError::Runtime)?
            },
        },
        "resource.process_locked" => ObjectKey::Image {
            digest: if module.config.get("image").is_some() {
                parsed::<Image>(&module.config)?.image
            } else {
                deployment::manifest(&module.config)?.digest()?
            },
        },
        "resource.process" => {
            let r = parsed::<Runtime>(&module.config)?.runtime;
            ObjectKey::Runtime {
                id: r.id,
                revision: r.revision,
            }
        }
        _ => return Ok(None),
    };
    key.validate()?;
    Ok(Some(key))
}
impl KernelHost {
    pub async fn inspect_references(&self, request: ReferenceRequest) -> Result<ReferenceReport> {
        // A dropped HTTP/public future must not release admission while its
        // already-started catalog/SQLite blocking work is still running.
        let permit = tokio::select! {biased;
            _=self.stop.cancelled()=>return Err(HostError::Unavailable("host is shutting down".into())),
            result=self.loader.reference_work.clone().acquire_owned()=>result.map_err(storage::unavailable)?,
        };
        let host = self.clone();
        tokio::spawn(async move {
            let _permit = permit;
            host.inspect_references_inner(request).await
        })
        .await
        .map_err(storage::unavailable)?
    }
    pub(super) async fn inspect_references_inner(
        &self,
        request: ReferenceRequest,
    ) -> Result<ReferenceReport> {
        if request.objects.is_empty()
            || request.objects.len() > 16
            || !(1..=64).contains(&request.sample_limit)
        {
            return Err(HostError::Invalid(
                "reference query requires 1..=16 objects and 1..=64 samples".into(),
            ));
        }
        let mut unique = BTreeSet::new();
        for object in &request.objects {
            object.validate()?;
            if !unique.insert(object.clone()) {
                return Err(HostError::Invalid("duplicate reference object".into()));
            }
        }
        let catalog = self
            .control
            .inspect()
            .await
            .map_err(|_| HostError::Unavailable("reference catalog unavailable".into()))?;
        let catalog_revision = catalog.as_ref().map(|c| c.revision);
        let mut collector = Collector {
            objects: request
                .objects
                .into_iter()
                .map(|object| ObjectReferences {
                    object,
                    observed_origins: 0,
                    counts: BTreeMap::new(),
                    samples: Vec::new(),
                    more_samples: false,
                    state: "not_observed",
                })
                .collect(),
            limit: request.sample_limit,
            opaque: 0,
            opaque_samples: Vec::new(),
        };
        // Parsing/deep declaration hashing belongs to blocking work, not the
        // async request executor. No compile/build/restore occurs here.
        collector = tokio::task::spawn_blocking(move || {
            if let Some(catalog) = catalog {
                for (name, draft) in catalog.data.drafts {
                    let origin = RetentionOrigin {
                        kind: "draft".into(),
                        key: name,
                        slot: draft.revision.to_string(),
                    };
                    match module_walk::collect(&draft.document) {
                        Ok(modules) => collector.modules(&origin, modules),
                        Err(_) => collector.opaque(&origin),
                    }
                }
                for (id, publication) in catalog.data.publications {
                    let origin = RetentionOrigin {
                        kind: "publication".into(),
                        key: id,
                        slot: publication.created_revision.to_string(),
                    };
                    match module_walk::collect(&publication.bundle.document) {
                        Ok(modules) => collector.modules(&origin, modules),
                        Err(_) => collector.opaque(&origin),
                    }
                }
            }
            collector
        })
        .await
        .map_err(storage::unavailable)?;
        let sources = self.loader.sources.clone();
        let (source_revision, pins) =
            tokio::task::spawn_blocking(move || sources.retained_images())
                .await
                .map_err(storage::unavailable)??;
        for (id, digest) in pins {
            collector.observed(
                &RetentionOrigin {
                    kind: "acquisition".into(),
                    key: id,
                    slot: String::new(),
                },
                BTreeSet::from([ObjectKey::Image { digest }]),
            );
        }
        let inspected = self
            .store
            .inspect_retained_modules(
                RetentionLimits::default(),
                collector,
                |collector, origin, definitions| {
                    collector.declarations(origin, definitions);
                    Ok(())
                },
            )
            .await
            .map_err(|_| {
                HostError::Unavailable(
                    "retained runtime inspection failed; absence is not established".into(),
                )
            })?;
        let after = self
            .control
            .inspect()
            .await
            .map_err(|_| HostError::Unavailable("reference catalog unavailable".into()))?;
        let sources = self.loader.sources.clone();
        let (after_source, _) = tokio::task::spawn_blocking(move || sources.retained_images())
            .await
            .map_err(storage::unavailable)??;
        if after.as_ref().map(|c| c.revision) != catalog_revision {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::Conflict {
                    expected: catalog_revision,
                    actual: after.as_ref().map(|c| c.revision),
                },
            ));
        }
        if after_source != source_revision {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::Conflict {
                    expected: Some(source_revision),
                    actual: Some(after_source),
                },
            ));
        }
        let mut collector = inspected.value;
        for object in &mut collector.objects {
            object.state = if object.observed_origins > 0 {
                "referenced"
            } else if collector.opaque > 0 || inspected.coverage.opaque_compositions > 0 {
                "unknown"
            } else {
                "not_observed"
            };
        }
        Ok(ReferenceReport {
            catalog_revision,
            source_revision,
            runtime: inspected.coverage,
            opaque_declarations: collector.opaque,
            declaration_samples: collector.opaque_samples,
            references: collector.objects,
            deletion_authorized: false,
        })
    }
}
