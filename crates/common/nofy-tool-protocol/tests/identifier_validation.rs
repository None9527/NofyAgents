//! Tool identity validation and serialization invariants.

use std::str::FromStr;

use nofy_tool_protocol::{IdError, ToolCallId, ToolId};

#[test]
fn tool_id_accepts_bare_and_namespaced_names() {
    let bare = ToolId::new("read_file").unwrap();
    assert_eq!(bare.as_str(), "read_file");

    let namespaced = ToolId::new("NofyBuild:read_file").unwrap();
    assert_eq!(namespaced.as_str(), "NofyBuild:read_file");

    assert_eq!(
        ToolId::from_str("github:list_repos").unwrap().as_str(),
        "github:list_repos"
    );
}

#[test]
fn tool_id_rejects_empty() {
    assert_eq!(ToolId::new("").unwrap_err(), IdError::Empty);
}

#[test]
fn tool_id_rejects_more_than_one_separator() {
    let err = ToolId::new("foo:bar:baz").unwrap_err();
    assert_eq!(
        err,
        IdError::InvalidFormat {
            value: "foo:bar:baz".to_owned()
        }
    );
}

#[test]
fn tool_id_rejects_disallowed_characters() {
    for bad in [
        "foo bar",
        "foo!bar",
        "foo/bar",
        "foo.bar",
        "foo:bar baz",
        " foo",
        "foo ",
        "foo\tbar",
        "foo\u{00e9}bar",
        "f\u{00f6}\u{00f6}bar",
    ] {
        let err = ToolId::new(bad).unwrap_err();
        assert!(
            matches!(err, IdError::InvalidFormat { ref value } if value == bad),
            "expected InvalidFormat for {bad:?}, got {err:?}"
        );
    }
}

#[test]
fn tool_id_accepts_digits_only_and_other_boundary_inputs() {
    assert_eq!(ToolId::new("123").unwrap().as_str(), "123");
    assert_eq!(ToolId::new("v2:42").unwrap().as_str(), "v2:42");
    assert_eq!(ToolId::new("a").unwrap().as_str(), "a");
    assert_eq!(ToolId::new("a:b").unwrap().as_str(), "a:b");
    assert_eq!(ToolId::new("-_-").unwrap().as_str(), "-_-");
}

#[test]
fn tool_id_rejects_empty_segments_around_separator() {
    for bad in [":foo", "foo:", ":"] {
        let err = ToolId::new(bad).unwrap_err();
        assert!(
            matches!(err, IdError::InvalidFormat { ref value } if value == bad),
            "expected InvalidFormat for {bad:?}, got {err:?}"
        );
    }
}

#[test]
fn tool_id_try_from_string_works() {
    let id: ToolId = "NofyBuild:read_file".to_owned().try_into().unwrap();
    assert_eq!(id.as_str(), "NofyBuild:read_file");
}

#[test]
fn tool_call_id_uuid_v7_helper_is_unique_and_valid_uuid() {
    let a = ToolCallId::new_v7();
    let b = ToolCallId::new_v7();
    assert_ne!(a, b, "two consecutive v7 ids must differ");
    for id in [&a, &b] {
        let parsed = uuid::Uuid::parse_str(id.as_str()).expect("parse uuid");
        assert_eq!(
            parsed.get_version_num(),
            7,
            "expected UUID v7, got {parsed}"
        );
    }
}

#[test]
fn tool_identity_interfaces_and_serde_preserve_values() {
    let id = ToolId::new("files:read").unwrap();
    assert_eq!(id.to_string(), "files:read");
    assert_eq!(id.as_ref(), "files:read");
    assert_eq!(id.clone().into_inner(), "files:read");
    let encoded = serde_json::to_string(&id).unwrap();
    assert_eq!(serde_json::from_str::<ToolId>(&encoded).unwrap(), id);
    for bad in ["", "files:read:extra", "files/read", "read file", ":read"] {
        let encoded = serde_json::to_string(bad).unwrap();
        assert!(serde_json::from_str::<ToolId>(&encoded).is_err());
    }
}

#[test]
fn invocation_identity_is_nonempty_and_serde_validated() {
    assert_eq!(ToolCallId::new("").unwrap_err(), IdError::Empty);
    let id = ToolCallId::new("run-1/call-2").unwrap();
    assert_eq!(id.to_string(), "run-1/call-2");
    assert_eq!(id.as_ref(), "run-1/call-2");
    assert_eq!(id.clone().into_inner(), "run-1/call-2");
    let encoded = serde_json::to_string(&id).unwrap();
    assert_eq!(serde_json::from_str::<ToolCallId>(&encoded).unwrap(), id);
    assert!(serde_json::from_str::<ToolCallId>("\"\"").is_err());
}
