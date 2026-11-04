use super::*;
use crate::{
    compile::CompilationSnapshot,
    program::{ProgramSnapshot, RunSnapshot},
    registry::ResolvedModule,
    tool_program::ToolCompilationSnapshot,
};
use serde::de::DeserializeOwned;
#[derive(Deserialize)]
struct Snapshot {
    snapshot: RunSnapshot,
}
#[derive(Deserialize)]
struct Submission {
    snapshot: RunSnapshot,
    composition_digest: String,
}
#[derive(Deserialize)]
struct Job {
    submission: Submission,
}
#[derive(Deserialize)]
struct Execution {
    snapshot: RunSnapshot,
    composition: String,
}
#[derive(Deserialize)]
struct Composition {
    composition: String,
}
#[derive(Deserialize)]
struct Checkpoint {
    version: u32,
    composition: String,
}
#[derive(Deserialize)]
struct Live {
    protocol: String,
    snapshot: RunSnapshot,
    before: Checkpoint,
    after: Checkpoint,
}
#[derive(Deserialize)]
struct Seed {
    info: crate::supervisor::jobs::SessionSeedInfo,
    snapshot: RunSnapshot,
}
#[derive(Deserialize)]
struct SessionProfile {
    protocol: String,
    policy: Option<crate::session_policy::Frozen>,
}
#[derive(Deserialize)]
struct SessionAdmission {
    policy: Option<crate::session_policy::Frozen>,
}
#[derive(Deserialize)]
struct SessionPrepared {
    policy: Option<crate::session_policy::Frozen>,
    submission: Submission,
}
#[derive(Deserialize)]
struct SessionOperation {
    prepared: Option<SessionPrepared>,
}
fn session_definitions(
    frozen: &crate::session_policy::Frozen,
) -> Result<Vec<&ModuleDefinition>, Error> {
    if crate::system::content_digest(&frozen.modules)? != frozen.identity.closure_digest {
        return Err(failure("retained session policy closure changed"));
    }
    let root = frozen
        .modules
        .iter()
        .find(|m| m.definition.reference == frozen.identity.module)
        .ok_or_else(|| failure("retained session policy root missing"))?;
    if root.factory.kind != crate::registry::ModuleKind::SessionPolicy
        || root.factory.revision != frozen.identity.factory_revision
    {
        return Err(failure("retained session policy kind/revision changed"));
    }
    Ok(resolved(&frozen.modules))
}

fn decode<T: DeserializeOwned>(payload: &str) -> Result<T, Error> {
    serde_json::from_str(payload)
        .map_err(|_| failure("unrecognized or malformed retained configuration"))
}
fn resolved(modules: &[ResolvedModule]) -> Vec<&ModuleDefinition> {
    modules.iter().map(|m| &m.definition).collect()
}
fn agent(snapshot: &CompilationSnapshot) -> Result<Vec<&ModuleDefinition>, Error> {
    if snapshot.version != 1
        || !matches!(snapshot.agent.schema_version, 1 | 2)
        || (snapshot.agent.schema_version == 1 && snapshot.agent.session_policy.is_some())
    {
        return Err(failure("unsupported retained Agent snapshot"));
    }
    Ok(resolved(&snapshot.modules))
}
fn tool(snapshot: &ToolCompilationSnapshot) -> Result<Vec<&ModuleDefinition>, Error> {
    if snapshot.version != 1 || snapshot.definition.schema_version != 1 {
        return Err(failure("unsupported retained tool snapshot"));
    }
    Ok(resolved(&snapshot.modules))
}
fn declarations(snapshot: &RunSnapshot) -> Result<Vec<&ModuleDefinition>, Error> {
    let snapshot = match snapshot {
        RunSnapshot::Agent(a) => return agent(a),
        RunSnapshot::Program(p) => p,
    };
    if snapshot.version != 2 {
        return Err(failure("unsupported retained program version"));
    }
    match &snapshot.program {
        ProgramSnapshot::Agent { snapshot } => agent(snapshot),
        ProgramSnapshot::Tool { snapshot, .. } => tool(snapshot),
        ProgramSnapshot::Event { snapshot } => {
            if snapshot.version != 1 || snapshot.definition.schema_version != 1 {
                return Err(failure("unsupported retained event snapshot"));
            }
            let mut definitions = resolved(&snapshot.modules);
            definitions.extend(tool(&snapshot.host)?);
            Ok(definitions)
        }
        #[cfg(feature = "workflow")]
        ProgramSnapshot::Workflow { snapshot, .. } => {
            if snapshot.version != 1 || snapshot.document.schema_version != 1 {
                return Err(failure("unsupported retained workflow snapshot"));
            }
            let mut definitions = resolved(&snapshot.modules);
            definitions.extend(&snapshot.document.modules);
            Ok(definitions)
        }
    }
}
pub(super) fn record(
    kind: &str,
    payload: &str,
    origin: &RetentionOrigin,
    scan: &mut Scan,
    mut visit: impl FnMut(&RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>,
) -> Result<(), Error> {
    match kind {
        "session_profile" => {
            let row: SessionProfile = decode(payload)?;
            if row.protocol != "nofy.session-profile/v1" {
                return Err(failure("unsupported retained session profile"));
            }
            if let Some(p) = row.policy {
                visit(origin, &session_definitions(&p)?)?;
            }
        }
        "session_admission" => {
            let row: SessionAdmission = decode(payload)?;
            if let Some(p) = row.policy {
                visit(origin, &session_definitions(&p)?)?;
            }
        }
        "session_operation" => {
            let row: SessionOperation = decode(payload)?;
            if let Some(p) = row.prepared {
                remember(scan, &p.submission.composition_digest)?;
                visit(origin, &declarations(&p.submission.snapshot)?)?;
                if let Some(p) = p.policy {
                    visit(origin, &session_definitions(&p)?)?;
                }
            }
        }
        "job" => {
            let row: Job = decode(payload)?;
            remember(scan, &row.submission.composition_digest)?;
            visit(origin, &declarations(&row.submission.snapshot)?)?;
        }
        "execution" => {
            let row: Execution = decode(payload)?;
            remember_text(scan, &row.composition);
            visit(origin, &declarations(&row.snapshot)?)?;
        }
        "transition" => {
            let row: Snapshot = decode(payload)?;
            visit(origin, &declarations(&row.snapshot)?)?;
        }
        "live_version" => {
            let row: Live = decode(payload)?;
            if ![
                "nofy.live/v1",
                "nofy.live/v2",
                "nofy.live/v3",
                "nofy.live/v4",
                "nofy.live/v5",
            ]
            .contains(&row.protocol.as_str())
            {
                return Err(failure("unsupported retained live protocol"));
            }
            if row.before.version != 1 || row.after.version != 1 {
                return Err(failure("unsupported retained live checkpoint version"));
            }
            visit(origin, &declarations(&row.snapshot)?)?;
            composition(
                &row.before.composition,
                &RetentionOrigin {
                    slot: "before".into(),
                    ..origin.clone()
                },
                scan,
                &mut visit,
            )?;
            remember_text(scan, &row.after.composition);
            composition(
                &row.after.composition,
                &RetentionOrigin {
                    slot: "after".into(),
                    ..origin.clone()
                },
                scan,
                &mut visit,
            )?;
        }
        "session_seed" => {
            let row: Seed = decode(payload)?;
            if row.info.protocol
                != if row.info.session_policy.is_some() {
                    "nofy.session.seed/v2"
                } else {
                    "nofy.session.seed/v1"
                }
            {
                return Err(failure("unsupported retained seed protocol"));
            }
            remember(scan, &row.info.composition_digest)?;
            visit(origin, &declarations(&row.snapshot)?)?;
        }
        "input" => {
            let row: crate::mailbox::MailEnvelope = decode(payload)?;
            if let crate::mailbox::MailInput::NextTurn { snapshot, .. } = &row.input {
                visit(origin, &agent(snapshot)?)?;
            }
        }
        "checkpoint" => {
            let row: Checkpoint = decode(payload)?;
            if row.version != 1 {
                return Err(failure("unsupported retained checkpoint version"));
            }
            composition(&row.composition, origin, scan, &mut visit)?;
        }
        "child" => {
            let row: Composition = decode(payload)?;
            composition(&row.composition, origin, scan, &mut visit)?;
        }
        _ => return Err(failure("unsupported retained source")),
    }
    Ok(())
}
fn remember(scan: &mut Scan, digest: &str) -> Result<(), Error> {
    if digest.len() != 64 || !digest.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(failure("invalid retained composition digest"));
    }
    scan.known_compositions.insert(digest.to_ascii_lowercase());
    Ok(())
}
fn remember_text(scan: &mut Scan, text: &str) {
    scan.known_compositions
        .insert(format!("{:x}", Sha256::digest(text)));
}

fn composition(
    text: &str,
    origin: &RetentionOrigin,
    scan: &mut Scan,
    visit: &mut impl FnMut(&RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>,
) -> Result<(), Error> {
    let covered = scan
        .known_compositions
        .contains(&format!("{:x}", Sha256::digest(text)));
    if binding(text, origin, visit)? {
        scan.coverage.decoded_compositions += 1;
    } else if covered {
        scan.coverage.covered_compositions += 1;
    } else {
        scan.opaque(origin.clone());
    }
    Ok(())
}
/// Only walk identity wrappers, never base Agent specs, schemas, call arguments
/// or arbitrary payload JSON. Unknown identities remain explicitly opaque.
fn binding(
    text: &str,
    origin: &RetentionOrigin,
    visit: &mut impl FnMut(&RetentionOrigin, &[&ModuleDefinition]) -> Result<(), Error>,
) -> Result<bool, Error> {
    let mut text = text.to_owned();
    let mut bytes = 0usize;
    for _ in 0..128 {
        bytes = bytes.saturating_add(text.len());
        if bytes > 64 * 1024 * 1024 {
            return Err(failure("retained composition exceeds decode limit"));
        }
        let Ok(value) = serde_json::from_str::<serde_json::Value>(&text) else {
            return Ok(false);
        };
        let Some(parts) = value.as_array() else {
            return Ok(false);
        };
        match parts.as_slice() {
            [previous, revision] if previous.is_string() && revision.is_string() => {
                let revision = revision.as_str().unwrap();
                if let Ok(value) = serde_json::from_str::<serde_json::Value>(revision) {
                    if value.get("agent").is_some() && value.get("modules").is_some() {
                        let snapshot: CompilationSnapshot = serde_json::from_value(value)
                            .map_err(|_| failure("invalid retained Agent binding"))?;
                        visit(origin, &agent(&snapshot)?)?;
                        return Ok(true);
                    }
                    if value
                        .get("definition")
                        .is_some_and(|d| d.get("name").is_some())
                        && value.get("modules").is_some()
                    {
                        let snapshot: ToolCompilationSnapshot = serde_json::from_value(value)
                            .map_err(|_| failure("invalid retained tool binding"))?;
                        visit(origin, &tool(&snapshot)?)?;
                        return Ok(true);
                    }
                }
                text = previous.as_str().unwrap().to_owned();
            }
            [previous, call]
                if previous.is_string()
                    && call.is_object()
                    && serde_json::from_value::<crate::ToolCall>(call.clone()).is_ok() =>
            {
                text = previous.as_str().unwrap().to_owned()
            }
            [previous, tag, _]
                if previous.is_string()
                    && tag.as_str().is_some_and(|s| {
                        [
                            "event-program-v1",
                            "program-tool",
                            "hooks",
                            "required_policy",
                        ]
                        .contains(&s)
                    }) =>
            {
                text = previous.as_str().unwrap().to_owned()
            }
            _ => return Ok(false),
        }
    }
    Err(failure("retained composition nesting exceeds limit"))
}
