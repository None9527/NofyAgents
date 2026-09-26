//! Extension points are protocol-only (FR14.2): JSON-RPC over stdio or
//! HTTP+JSON, with JSON Schema contracts. IN-PROC code plugins are a
//! VERIFICATION FAILURE, not a style preference (§6 red line, restated).

/// Transport for an extension point.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Transport {
    JsonRpcStdio,
    HttpJson,
    /// The forbidden shape — present so the audit can name it.
    InProc,
}

/// One extension point descriptor.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExtensionPoint {
    pub name: String,
    pub transport: Transport,
    /// JSON Schema for the point's contract.
    pub schema_json: String,
}

/// Audit finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AuditFinding {
    /// Extension point is protocol-shaped but its schema is empty/invalid.
    MissingSchema { name: String },
    /// In-proc plugin: hard violation.
    InProcPlugin { name: String },
}

/// Audit a set of extension points. Empty findings = compliant.
pub fn audit_extension_points(points: &[ExtensionPoint]) -> Vec<AuditFinding> {
    let mut findings = Vec::new();
    for point in points {
        match point.transport {
            Transport::InProc => findings.push(AuditFinding::InProcPlugin {
                name: point.name.clone(),
            }),
            _ => {
                let schema_ok = serde_json::from_str::<serde_json::Value>(&point.schema_json)
                    .is_ok_and(|v| v.is_object());
                if !schema_ok {
                    findings.push(AuditFinding::MissingSchema {
                        name: point.name.clone(),
                    });
                }
            }
        }
    }
    findings
}

#[cfg(test)]
mod tests {
    use super::*;

    fn point(name: &str, transport: Transport, schema: &str) -> ExtensionPoint {
        ExtensionPoint {
            name: name.into(),
            transport,
            schema_json: schema.into(),
        }
    }

    const SCHEMA: &str = r#"{"type":"object","properties":{"input":{"type":"string"}}}"#;

    #[test]
    fn protocol_points_pass() {
        let points = vec![
            point("tools", Transport::JsonRpcStdio, SCHEMA),
            point("hooks", Transport::HttpJson, SCHEMA),
        ];
        assert!(audit_extension_points(&points).is_empty());
    }

    #[test]
    fn in_proc_is_a_hard_violation() {
        let points = vec![point("legacy-plugin", Transport::InProc, SCHEMA)];
        let findings = audit_extension_points(&points);
        assert_eq!(
            findings,
            vec![AuditFinding::InProcPlugin {
                name: "legacy-plugin".into()
            }]
        );
    }

    #[test]
    fn missing_or_invalid_schema_flagged() {
        let points = vec![
            point("no-schema", Transport::JsonRpcStdio, ""),
            point("bad-json", Transport::HttpJson, "{not json"),
        ];
        let findings = audit_extension_points(&points);
        assert_eq!(findings.len(), 2);
        assert!(
            findings
                .iter()
                .all(|f| matches!(f, AuditFinding::MissingSchema { .. }))
        );
    }

    #[test]
    fn mixed_audit_reports_only_violations() {
        let points = vec![
            point("ok", Transport::JsonRpcStdio, SCHEMA),
            point("bad", Transport::InProc, SCHEMA),
        ];
        let findings = audit_extension_points(&points);
        assert_eq!(findings.len(), 1);
    }
}
