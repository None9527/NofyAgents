//! Compatibility imports for the reusable output recovery policy.
pub(super) use nofy_agent_runtime::coding::length::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_on_with_two_continues() {
        assert_eq!(resolve_length_salvage_budget(None), Some(2));
        assert_eq!(resolve_length_salvage_budget(Some(true)), Some(2));
    }

    #[test]
    fn env_false_kills_salvage() {
        assert_eq!(resolve_length_salvage_budget(Some(false)), None);
    }

    #[test]
    fn two_continues_then_exhaust() {
        let mut s = LengthSalvage::new(Some(2));
        assert!(matches!(
            s.on_length_stop(),
            SalvageStep::Continue {
                inject_reminder: true
            }
        ));
        assert!(matches!(
            s.on_length_stop(),
            SalvageStep::Continue {
                inject_reminder: false
            }
        ));
        assert!(matches!(s.on_length_stop(), SalvageStep::Exhaust));
        assert!(s.is_truncated());
        assert!(matches!(s.on_length_stop(), SalvageStep::None));
    }

    #[test]
    fn disabled_never_continues() {
        let mut s = LengthSalvage::new(None);
        assert!(!s.enabled());
        assert!(matches!(s.on_length_stop(), SalvageStep::None));
    }
}
