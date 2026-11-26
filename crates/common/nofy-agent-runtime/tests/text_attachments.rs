use nofy_agent_runtime::{
    InputPart, PendingInterjection,
    mailbox::{InputAddress, MailEnvelope, MailInput},
};

fn envelope(parts: Vec<InputPart>) -> MailEnvelope {
    MailEnvelope {
        address: InputAddress {
            root_run_id: "root".into(),
            run_id: "root".into(),
            thread_id: "thread".into(),
            agent: "agent".into(),
        },
        input_id: "input".into(),
        input: MailInput::FollowUp {
            message: PendingInterjection {
                text: String::new(),
                attachments: parts,
            },
        },
    }
}

#[test]
fn text_attachments_are_admitted_and_participate_in_receipt_identity() {
    let original = envelope(vec![InputPart::Text {
        text: "文件内容".into(),
    }]);
    original.validate().unwrap();
    let bytes = serde_json::to_vec(&original).unwrap();
    let restored: MailEnvelope = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(
        original.fingerprint().unwrap(),
        restored.fingerprint().unwrap()
    );
    let changed = envelope(vec![InputPart::Text {
        text: "其他内容".into(),
    }]);
    assert_ne!(
        original.fingerprint().unwrap(),
        changed.fingerprint().unwrap()
    );
}

#[test]
fn text_boundaries_use_bytes_and_preserve_existing_attachment_limits() {
    envelope(vec![InputPart::Text {
        text: "x".repeat(65536),
    }])
    .validate()
    .unwrap();
    assert!(
        envelope(vec![InputPart::Text {
            text: "界".repeat(21846)
        }])
        .validate()
        .is_err()
    );
    assert!(
        envelope(vec![InputPart::Text { text: "x".into() }; 9])
            .validate()
            .is_err()
    );
    assert!(envelope(vec![]).validate().is_err());
    assert!(
        envelope(vec![InputPart::Image {
            url: "file:///private.png".into()
        }])
        .validate()
        .is_err()
    );
}
