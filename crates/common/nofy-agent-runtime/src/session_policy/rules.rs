use super::*;
use serde_json::{Value, json};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Naming {
    pub prefix: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Admission {
    pub when_busy: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Routing {
    pub mode: String,
    pub keys: Vec<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct History {
    pub archive_after_idle_seconds: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RulesConfig {
    pub naming: Naming,
    pub admission: Admission,
    pub routing: Routing,
    pub history: History,
}
pub struct RulesFactory;
impl ModuleFactory for RulesFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "session_policy.rules".into(),
            revision: "1".into(),
            kind: ModuleKind::SessionPolicy,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["naming","admission","routing","history"],"properties":{
                "naming":{"type":"object","additionalProperties":false,"required":["prefix"],"properties":{"prefix":{"type":"string","maxLength":1024}}},
                "admission":{"type":"object","additionalProperties":false,"required":["when_busy"],"properties":{"when_busy":{"enum":["queue","reject"]}}},
                "routing":{"type":"object","additionalProperties":false,"required":["mode","keys"],"properties":{"mode":{"enum":["explicit","labels"]},"keys":{"type":"array","uniqueItems":true,"items":{"type":"string","minLength":1}}}},
                "history":{"type":"object","additionalProperties":false,"required":["archive_after_idle_seconds"],"properties":{"archive_after_idle_seconds":{"type":["string","null"],"pattern":"^(0|[1-9][0-9]*)$"}}}
            }}),
            input_schema: Some(input_schema()),
            output_schema: Some(proposal_schema()),
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        let config: RulesConfig =
            serde_json::from_value(config.clone()).map_err(|e| invalid(e.to_string()))?;
        if config.naming.prefix.chars().any(char::is_control)
            || (config.routing.mode == "labels" && config.routing.keys.is_empty())
            || (config.routing.mode == "explicit" && !config.routing.keys.is_empty())
            || config
                .history
                .archive_after_idle_seconds
                .as_ref()
                .is_some_and(|s| s.parse::<u64>().is_err())
        {
            return Err(invalid("invalid session routing or archive threshold"));
        }
        Ok(ModuleInstance::SessionPolicy(Arc::new(config)))
    }
}
#[async_trait::async_trait]
impl SessionPolicy for RulesConfig {
    async fn evaluate(&self, input: Input, cancel: CancellationToken) -> Result<Proposal, Error> {
        if cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        let mut result = Proposal::allow(&input);
        match input.phase {
            Phase::Create => {
                result.display_name = input.request.session_id.as_ref().map(|id| {
                    if self.naming.prefix.is_empty() {
                        id.clone()
                    } else {
                        format!("{} {id}", self.naming.prefix)
                    }
                });
            }
            Phase::AdmitTurn => {
                if input.session.as_ref().is_some_and(|s| s.busy)
                    && self.admission.when_busy == "reject"
                {
                    result.decision = Decision::Deny;
                    result.reason = "session is busy".into();
                }
            }
            Phase::Route => {
                let matches: Vec<_> = input
                    .candidates
                    .iter()
                    .filter(|s| {
                        if s.lifecycle != "open"
                            || s.archived
                            || ((s.busy || s.has_queued_input)
                                && self.admission.when_busy == "reject")
                        {
                            return false;
                        }
                        if self.routing.mode == "explicit" {
                            input.request.session_id.as_ref() == Some(&s.session_id)
                        } else {
                            self.routing.keys.iter().all(|k| {
                                input
                                    .request
                                    .labels
                                    .get(k)
                                    .is_some_and(|v| s.labels.get(k) == Some(v))
                            })
                        }
                    })
                    .collect();
                result.session_id = if matches.len() == 1 {
                    Some(matches[0].session_id.clone())
                } else {
                    None
                };
                if matches.len() > 1 {
                    result.decision = Decision::Ambiguous;
                }
                result.reason = format!("{} eligible session(s)", matches.len());
            }
            Phase::Retention => {
                if let (Some(seconds), Some(idle)) = (
                    &self.history.archive_after_idle_seconds,
                    &input.idle_since_ms,
                ) {
                    let now = input
                        .now_ms
                        .parse::<u64>()
                        .map_err(|_| invalid("invalid frozen time"))?;
                    let idle = idle
                        .parse::<u64>()
                        .map_err(|_| invalid("invalid idle time"))?;
                    let seconds = seconds
                        .parse::<u64>()
                        .map_err(|_| invalid("invalid archive threshold"))?;
                    result.archive = now.saturating_sub(idle) / 1000 >= seconds
                        && input
                            .session
                            .as_ref()
                            .is_some_and(|s| !s.busy && !s.has_queued_input);
                }
            }
        }
        result.validate(&input)?;
        Ok(result)
    }
}
