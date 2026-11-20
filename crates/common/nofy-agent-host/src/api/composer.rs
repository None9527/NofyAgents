//! Read real model choices and freeze a selected model as an immutable release.
use super::*;
use nofy_agent_runtime::system::{ProgramDefinition, SystemDocument, SystemFile};

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/composer/models", get(models))
        .route("/api/v1/composer/model", post(select))
        .layer(DefaultBodyLimit::max(16384))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Selection {
    release: String,
    program: String,
    model: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Configuration {
    release: String,
    program: String,
}

fn choices(document: &SystemDocument, program: &str) -> Result<(usize, String, Vec<String>)> {
    let Some(ProgramDefinition::Agent { definition }) = document.programs.get(program) else {
        return Err(HostError::Invalid(
            "this program does not expose an Agent model".into(),
        ));
    };
    let mut reference = &definition.model;
    for _ in 0..16 {
        let (index, module) = document
            .modules
            .iter()
            .enumerate()
            .find(|(_, module)| &module.reference == reference)
            .ok_or_else(|| HostError::Invalid("model component is missing".into()))?;
        if module.factory == "model.programmed" {
            let current = module.config["model"]
                .as_str()
                .ok_or_else(|| HostError::Invalid("model name is missing".into()))?
                .to_owned();
            let connection = module
                .dependencies
                .get("connection")
                .and_then(|reference| {
                    document
                        .modules
                        .iter()
                        .find(|module| &module.reference == reference)
                })
                .ok_or_else(|| HostError::Invalid("model connection is missing".into()))?;
            let models: Vec<String> = connection.config["models"]
                .as_array()
                .into_iter()
                .flatten()
                .filter_map(|value| value.as_str().map(str::to_owned))
                .collect();
            if !models.contains(&current) {
                return Err(HostError::Invalid(
                    "model is outside the configured connection".into(),
                ));
            }
            return Ok((index, current, models));
        }
        reference = module.dependencies.get("model").ok_or_else(|| {
            HostError::Invalid("this model component does not expose model selection".into())
        })?;
    }
    Err(HostError::Invalid(
        "model component chain is too deep".into(),
    ))
}

async fn models(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(request): Query<Configuration>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let bundle = host.control.export(&request.release).await?;
    let (_, current, models) = choices(&bundle.document, &request.program)?;
    Ok(Json(
        json!({"current":current,"models":models,"selectable":true}),
    ))
}

async fn select(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Selection>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    let _permit = tokio::select! {
        _ = host.stop.cancelled() => return Err(HostError::Unavailable("host is shutting down".into())),
        permit = host.loader.management_work.clone().acquire_owned() => permit.map_err(|error| HostError::Unavailable(error.to_string()))?,
    };
    let bundle = host.control.export(&request.release).await?;
    let (index, current, models) = choices(&bundle.document, &request.program)?;
    if !models.contains(&request.model) {
        return Err(HostError::Invalid(
            "model is outside the configured connection".into(),
        ));
    }
    let mut document = bundle.document;
    let system = document.name.clone();
    let release = if current == request.model {
        request.release
    } else {
        document.modules[index].config["model"] = json!(request.model);
        host.control
            .install_file(SystemFile::Source(document))
            .await?
            .bundle
            .digest
    };
    Ok(Json(
        json!({"system":system,"release":release,"program":request.program,"model_name":request.model}),
    ))
}
