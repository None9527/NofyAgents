//! Persona line + template variables + default masking (FR10.4, DS-P3).
//!
//! A persona line may reference `{{variables}}`. Rendering is
//! DEFAULT-MASKED: a variable renders its value ONLY when explicitly
//! allowlisted; anything else renders as `[masked]` — a pack can never
//! exfiltrate context it was not granted. Malformed placeholders pass
//! through literally (no silent template injection).

use std::collections::{BTreeMap, BTreeSet};

/// The mask placeholder for non-allowlisted variables.
pub const MASK: &str = "[masked]";

/// Render a persona template. `vars` holds known values; `allowlist`
/// decides which of them may actually render. Deterministic.
pub fn render_persona(
    template: &str,
    vars: &BTreeMap<String, String>,
    allowlist: &BTreeSet<String>,
) -> String {
    let mut out = String::with_capacity(template.len());
    let mut rest = template;
    while let Some(open) = rest.find("{{") {
        out.push_str(&rest[..open]);
        let after_open = &rest[open + 2..];
        match after_open.find("}}") {
            Some(close) => {
                let name = after_open[..close].trim();
                if name.is_empty() {
                    // `{{}}` is malformed: literal passthrough.
                    out.push_str("{{}}");
                } else if allowlist.contains(name) {
                    match vars.get(name) {
                        Some(value) => out.push_str(value),
                        None => out.push_str(MASK), // allowlisted but unknown: mask, don't leak an error surface
                    }
                } else {
                    out.push_str(MASK);
                }
                rest = &after_open[close + 2..];
            }
            None => {
                // Unclosed `{{`: literal passthrough.
                out.push_str(&rest[open..]);
                rest = "";
            }
        }
    }
    out.push_str(rest);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vars(pairs: &[(&str, &str)]) -> BTreeMap<String, String> {
        pairs.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect()
    }

    fn allow(names: &[&str]) -> BTreeSet<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn allowlisted_variable_renders() {
        let out = render_persona(
            "You work in {{cwd}}.",
            &vars(&[("cwd", "/home/u/proj")]),
            &allow(&["cwd"]),
        );
        assert_eq!(out, "You work in /home/u/proj.");
    }

    #[test]
    fn non_allowlisted_is_masked_by_default() {
        let out = render_persona(
            "Token: {{api_token}} in {{cwd}}",
            &vars(&[("api_token", "sekrit"), ("cwd", "/w")]),
            &allow(&["cwd"]),
        );
        assert_eq!(out, "Token: [masked] in /w");
        assert!(!out.contains("sekrit"), "masked value must not leak");
    }

    #[test]
    fn empty_allowlist_masks_everything() {
        let out = render_persona("{{a}}{{b}}", &vars(&[("a", "1"), ("b", "2")]), &allow(&[]));
        assert_eq!(out, "[masked][masked]");
    }

    #[test]
    fn allowlisted_but_unknown_masks_too() {
        let out = render_persona("{{missing}}", &vars(&[]), &allow(&["missing"]));
        assert_eq!(out, MASK);
    }

    #[test]
    fn malformed_placeholders_pass_through_literally() {
        assert_eq!(
            render_persona("{{unclosed", &vars(&[]), &allow(&[])),
            "{{unclosed"
        );
        assert_eq!(render_persona("{{}}", &vars(&[]), &allow(&[])), "{{}}");
        assert_eq!(render_persona("no vars", &vars(&[]), &allow(&[])), "no vars");
    }

    #[test]
    fn rendering_is_deterministic() {
        let template = "{{x}} and {{y}} and {{x}}";
        let v = vars(&[("x", "1"), ("y", "2")]);
        let a = allow(&["x", "y"]);
        assert_eq!(
            render_persona(template, &v, &a),
            render_persona(template, &v, &a)
        );
    }
}
