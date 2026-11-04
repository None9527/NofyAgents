use super::*;
fn skill(body: &str) -> SkillInfo {
    SkillInfo {
        name: "review".into(),
        description: "Review code".into(),
        path: "/assets/review/SKILL.md".into(),
        body: Some(body.into()),
        ..Default::default()
    }
}
fn frozen(skill: SkillInfo) -> FrozenSkills {
    FrozenSkills {
        skills: vec![skill],
        ..Default::default()
    }
}
#[test]
fn generic_package_and_session_substitution_need_no_product_manager() {
    let mut value =
        skill("$ARGUMENTS[1] $0 ${SKILL_DIR} ${SESSION_ID} ${PACKAGE_ROOT} ${PACKAGE_DATA}");
    value.package = Some(SkillPackage {
        name: "coding".into(),
        version: "1".into(),
        root: Some("/assets".into()),
        data: Some("/state/coding".into()),
    });
    let output = frozen(value)
        .invoke(
            "coding:review",
            Some("first second"),
            false,
            &RunContext::new("session", "run"),
        )
        .unwrap();
    assert!(
        output
            .skill_message
            .unwrap()
            .contains("second first /assets/review session /assets /state/coding")
    );
}
#[test]
fn independent_user_and_model_invocation_flags() {
    let mut value = skill("Read code");
    value.user_invocable = false;
    let bundle = frozen(value);
    assert!(
        bundle
            .invoke("review", None, false, &RunContext::new("s", "r"))
            .is_ok()
    );
    assert!(
        bundle
            .invoke("review", None, true, &RunContext::new("s", "r"))
            .is_err()
    );
}
#[test]
fn expansion_failure_is_atomic_and_every_render_is_bounded() {
    let original = "$ARGUMENTS".repeat(100);
    let mut body = original.clone();
    let context = SubstitutionContext {
        skill_dir: None,
        session_id: None,
        package_root: None,
        package_data: None,
    };
    let limits = SubstitutionLimits {
        max_input_bytes: 4096,
        max_output_bytes: 2048,
        max_work_bytes: 65536,
    };
    assert_eq!(
        apply_substitutions_bounded(&mut body, Some(&"x".repeat(100)), &context, limits),
        Err(SubstitutionError::OutputLimit)
    );
    assert_eq!(body, original);
    assert!(
        frozen(skill("$ARGUMENTS"))
            .invoke(
                "review",
                Some(&"界".repeat(22000)),
                false,
                &RunContext::new("s", "r")
            )
            .unwrap_err()
            .to_string()
            .contains("64 KiB")
    );
}
#[test]
fn message_limit_counts_actual_escaped_utf8_bytes() {
    let mut value = skill("界");
    value.description = "&<\"'".into();
    let output = build_skill_message_bounded(&value, "界", 4096).unwrap();
    assert_eq!(
        build_skill_message_bounded(&value, "界", output.len()).unwrap(),
        output
    );
    assert_eq!(
        build_skill_message_bounded(&value, "界", output.len() - 1),
        Err(SubstitutionError::OutputLimit)
    );
}
#[tokio::test]
async fn listing_is_bounded_escaped_and_reports_omissions_not_partial_bodies() {
    let mut value = skill("SECRET BODY");
    value.description = "<&>".repeat(400);
    let mut bundle = frozen(value);
    bundle.max_listing_bytes = 256;
    let messages = bundle
        .contribute(&RunState::default(), &RunContext::new("s", "r"))
        .await
        .unwrap();
    let Message::User { content } = &messages[0] else {
        panic!("listing")
    };
    assert!(content.len() <= 256);
    assert!(content.contains("<omitted count=\"1\""));
    assert!(!content.contains("SECRET BODY"));
    bundle.skills[0].description = "<&>".into();
    let content = bundle.listing(&[]).unwrap().unwrap();
    assert!(content.contains("&lt;&amp;&gt;"));
}
#[tokio::test]
async fn conditional_activation_uses_explicit_paths_and_successful_generic_calls_only() {
    let mut value = skill("Review");
    value.paths = Some(vec!["src/**".into(), "!src/generated/**".into()]);
    let mut bundle = frozen(value);
    bundle.cwd = Some("/project".into());
    let mut context = RunContext::new("s", "r");
    assert!(
        bundle
            .contribute(&RunState::default(), &context)
            .await
            .unwrap()
            .is_empty()
    );
    context
        .capabilities
        .insert(SkillPathContext(vec![PathBuf::from(
            "/project/src/generated/a.rs",
        )]));
    assert!(
        bundle
            .contribute(&RunState::default(), &context)
            .await
            .unwrap()
            .is_empty()
    );
    let mut state = RunState {
        messages: vec![
            Message::Assistant {
                content: String::new(),
                tool_calls: vec![ToolCall {
                    id: "read".into(),
                    name: "read".into(),
                    arguments: json!({"path":"src/lib.rs"}),
                }],
            },
            Message::Tool {
                call_id: "read".into(),
                content: json!({}),
                is_error: true,
            },
        ],
        ..Default::default()
    };
    assert!(
        bundle
            .contribute(&state, &context)
            .await
            .unwrap()
            .is_empty()
    );
    let Message::Tool { is_error, .. } = &mut state.messages[1] else {
        unreachable!()
    };
    *is_error = false;
    assert!(
        !bundle
            .contribute(&state, &context)
            .await
            .unwrap()
            .is_empty()
    );
}
#[test]
fn matching_budget_and_unknown_declaration_fields_fail_explicitly() {
    let mut value = skill("Review");
    value.paths = Some(vec!["src/**".into(); 1024]);
    let bundle = frozen(value);
    bundle.validate().unwrap();
    assert!(
        bundle
            .active_skills(&vec![PathBuf::from("src/a"); 2000])
            .unwrap_err()
            .to_string()
            .contains("matching budget")
    );
    assert!(
        serde_json::from_value::<FrozenSkills>(json!({"skills":[],"ambient_discovery":true}))
            .is_err()
    );
}
