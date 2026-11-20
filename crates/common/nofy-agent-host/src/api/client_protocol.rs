//! Browser-safe projection of durable events. No command or execution authority
//! lives here: all admission, receipts and scope checks stay in the kernel.
use super::*;
use nofy_agent_runtime::events::EventEnvelope;
use serde::Serialize;

const CONTRACT: &str = include_str!("../../../nofy-agent-client/contracts/http-client.json");

pub(super) async fn describe(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let contract = serde_json::from_str(CONTRACT)
        .map_err(|_| HostError::Unavailable("invalid embedded client protocol".into()))?;
    Ok(Json(contract))
}

#[derive(Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "snake_case")]
pub(super) enum EventEncoding {
    #[default]
    Native,
    Exact,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct EventPage {
    #[serde(default = "zero")]
    after: String,
    #[serde(default = "limit")]
    pub limit: usize,
    #[serde(default)]
    pub encoding: EventEncoding,
}
fn zero() -> String {
    "0".into()
}
fn limit() -> usize {
    100
}
impl EventPage {
    fn parse_cursor(&self, value: &str) -> Result<u64> {
        let cursor = value
            .parse::<u64>()
            .ok()
            .filter(|cursor| *cursor <= i64::MAX as u64)
            .filter(|cursor| {
                !matches!(self.encoding, EventEncoding::Exact) || cursor.to_string() == value
            })
            .ok_or_else(|| HostError::Invalid("invalid event cursor".into()))?;
        Ok(cursor)
    }
    pub(super) fn cursor(&self) -> Result<u64> {
        if !(1..=1000).contains(&self.limit) {
            return Err(HostError::Invalid(
                "event page limit must be 1..=1000".into(),
            ));
        }
        self.parse_cursor(&self.after)
    }
    pub(super) fn resume_after(&self, headers: &HeaderMap) -> Result<u64> {
        let after = self.cursor()?;
        match headers.get("last-event-id") {
            Some(value) => self.parse_cursor(
                value
                    .to_str()
                    .map_err(|_| HostError::Invalid("invalid Last-Event-ID".into()))?,
            ),
            None => Ok(after),
        }
    }
}

/// Native JSON is a text carrier rather than a recursively rewritten payload:
/// runtime u64s and arbitrary business JSON survive a JavaScript round trip.
#[derive(Serialize)]
pub(super) struct ExactEvent {
    protocol: &'static str,
    cursor: String,
    event_json: String,
}
pub(super) fn exact_event(
    event: &EventEnvelope,
) -> std::result::Result<ExactEvent, serde_json::Error> {
    Ok(ExactEvent {
        protocol: "nofy.event/v1",
        cursor: event.cursor.to_string(),
        event_json: serde_json::to_string(event)?,
    })
}
pub(super) fn exact_page(events: &[EventEnvelope], after: u64) -> Result<Value> {
    let projected = events
        .iter()
        .map(exact_event)
        .collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|_| HostError::Unavailable("event projection failed".into()))?;
    Ok(json!({
        "protocol":"nofy.events/v1", "events":projected,
        "next_cursor":events.last().map_or(after, |event| event.cursor).to_string()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_agent_runtime::events::{EventScope, RunEvent};

    fn page(after: &str) -> EventPage {
        EventPage {
            after: after.into(),
            limit: 100,
            encoding: EventEncoding::Exact,
        }
    }
    #[test]
    fn exact_cursor_rejects_aliases_and_overflow() {
        for invalid in [
            "",
            "01",
            "+1",
            "-1",
            "1.0",
            " 1",
            "1e3",
            "9223372036854775808",
            "18446744073709551616",
        ] {
            assert!(page(invalid).cursor().is_err(), "{invalid}");
        }
        assert_eq!(page("9007199254740993").cursor().unwrap(), 9007199254740993);
        assert_eq!(
            page("9223372036854775807").cursor().unwrap(),
            i64::MAX as u64
        );
        assert!(
            EventPage {
                limit: 0,
                ..page("0")
            }
            .cursor()
            .is_err()
        );
        assert!(
            EventPage {
                limit: 1001,
                ..page("0")
            }
            .cursor()
            .is_err()
        );
    }
    #[test]
    fn resume_header_wins_without_rounding() {
        let mut headers = HeaderMap::new();
        headers.insert("last-event-id", "9007199254740993".parse().unwrap());
        assert_eq!(page("7").resume_after(&headers).unwrap(), 9007199254740993);
        headers.insert("last-event-id", "01".parse().unwrap());
        assert!(page("7").resume_after(&headers).is_err());
    }
    #[test]
    fn exact_projection_preserves_large_native_values_and_empty_cursor() {
        let event = EventEnvelope {
            version: 1,
            cursor: 9007199254740993,
            timestamp_ms: u64::MAX,
            scope: EventScope {
                root_run_id: "r".into(),
                run_id: "r".into(),
                thread_id: "t".into(),
                parent_run_id: None,
                node_id: None,
                agent: "a".into(),
            },
            event: RunEvent::RunStarted { resume: false },
        };
        let result = exact_page(&[event], 0).unwrap();
        assert_eq!(result["next_cursor"], "9007199254740993");
        assert_eq!(result["events"][0]["cursor"], "9007199254740993");
        let native: Value =
            serde_json::from_str(result["events"][0]["event_json"].as_str().unwrap()).unwrap();
        assert_eq!(native["timestamp_ms"].as_u64(), Some(u64::MAX));
        assert_eq!(
            exact_page(&[], 9007199254740993).unwrap()["next_cursor"],
            "9007199254740993"
        );
    }
    #[test]
    fn discovery_describes_only_implemented_transports_and_exact_schema() {
        let contract: Value = serde_json::from_str(CONTRACT).unwrap();
        assert_eq!(contract["transports"], json!(["http-sse"]));
        assert_eq!(contract["events"]["query"]["encoding"], "exact");
        assert_eq!(contract["events"]["cursor_max"], i64::MAX.to_string());
        assert_eq!(contract["authentication"]["token_in_url"], false);
    }
}
