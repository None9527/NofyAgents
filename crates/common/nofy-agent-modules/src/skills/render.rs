use super::{
    definition::SkillInfo,
    substitution::{SubstitutionError, SubstitutionLimits, Substitutions},
};

impl Default for SubstitutionLimits {
    fn default() -> Self {
        Self {
            max_input_bytes: 1024 * 1024,
            max_output_bytes: 1024 * 1024,
            max_work_bytes: 64 * 1024 * 1024,
        }
    }
}
pub(super) struct SubstitutionContext<'a> {
    pub skill_dir: Option<&'a str>,
    pub session_id: Option<&'a str>,
    pub package_root: Option<&'a str>,
    pub package_data: Option<&'a str>,
}
pub(super) fn apply_substitutions_bounded(
    body: &mut String,
    args: Option<&str>,
    context: &SubstitutionContext<'_>,
    limits: SubstitutionLimits,
) -> Result<(), SubstitutionError> {
    let extra = [
        args,
        context.skill_dir,
        context.session_id,
        context.package_root,
        context.package_data,
    ]
    .into_iter()
    .flatten()
    .try_fold(0usize, |n, v| n.checked_add(v.len()))
    .ok_or(SubstitutionError::InputLimit)?;
    let mut out = Substitutions::new(body, limits, extra)?;
    let arguments = args.unwrap_or("");
    let values = arguments.split_whitespace().collect::<Vec<_>>();
    let ceiling = values
        .len()
        .max(1)
        .checked_add(20)
        .ok_or(SubstitutionError::InputLimit)?;
    let mut consumed = false;
    for indexed in [true, false] {
        let mut remaining = ceiling;
        while let Some(index) = out.next_index(indexed, remaining)? {
            let token = if indexed {
                format!("$ARGUMENTS[{index}]")
            } else {
                format!("${index}")
            };
            consumed |= out.replace(&token, values.get(index).copied().unwrap_or(""), !indexed)?;
            remaining = index;
        }
    }
    consumed |= out.replace("$ARGUMENTS", arguments, false)?;
    for (token, value) in [
        ("${SKILL_DIR}", context.skill_dir),
        ("${SESSION_ID}", context.session_id),
        ("${PACKAGE_ROOT}", context.package_root),
        ("${PACKAGE_DATA}", context.package_data),
    ] {
        if let Some(value) = value {
            out.replace(token, value, false)?;
        }
    }
    if !consumed && !arguments.is_empty() {
        out.append("\n\n**ARGUMENTS:** ")?;
        out.append(arguments)?;
    }
    *body = out.finish();
    Ok(())
}
pub(super) fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}
pub(super) fn build_skill_message_bounded(
    skill: &SkillInfo,
    body: &str,
    max: usize,
) -> Result<String, SubstitutionError> {
    let bytes = [
        skill.name.as_str(),
        skill.description.as_str(),
        skill.path.as_str(),
    ]
    .into_iter()
    .try_fold(0usize, |n, text| {
        text.chars().try_fold(n, |n, ch| {
            n.checked_add(match ch {
                '&' => 5,
                '<' | '>' => 4,
                '\"' | '\'' => 6,
                _ => ch.len_utf8(),
            })
        })
    })
    .ok_or(SubstitutionError::OutputLimit)?;
    let overhead = "<skill name=\"\" description=\"\" path=\"\">\n\n</skill>".len();
    if bytes
        .checked_add(body.len())
        .and_then(|n| n.checked_add(overhead))
        .is_none_or(|n| n > max)
    {
        return Err(SubstitutionError::OutputLimit);
    }
    let message = format!(
        "<skill name=\"{}\" description=\"{}\" path=\"{}\">\n{}\n</skill>",
        escape(&skill.name),
        escape(&skill.description),
        escape(&skill.path),
        body
    );
    if message.len() > max {
        return Err(SubstitutionError::OutputLimit);
    }
    Ok(message)
}
