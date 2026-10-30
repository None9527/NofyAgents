//! Length-salvage policy: budget resolution and the per-turn continue/exhaust
//! state machine for `stop_reason == Length` text responses.

const DEFAULT_LENGTH_CONTINUE_BUDGET: u32 = 2;

/// Injected once per turn on the first continue.
pub const LENGTH_CONTINUE_REMINDER_BODY: &str = "Your previous response exceeded the output token \
     limit and was cut off. Continue from exactly where it stopped — or if a newer user \
     message follows this note, answer that instead.";

/// Kill switch `NOFY_LENGTH_SALVAGE=0` outranks everything. Otherwise default
/// on with a two-continue budget (changelog: truncated responses continue
/// instead of failing the turn).
pub fn resolve_length_salvage_budget(env: Option<bool>) -> Option<u32> {
    if env == Some(false) {
        return None;
    }
    Some(DEFAULT_LENGTH_CONTINUE_BUDGET)
}

/// The turn loop's next step for a `Length`-stopped response.
pub enum SalvageStep {
    Continue { inject_reminder: bool },
    Exhaust,
    None,
}

/// Per-turn Length-salvage state.
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LengthSalvage {
    budget: Option<u32>,
    continues: u32,
    reminder_armed: bool,
    truncated: bool,
    exhaustion_reported: bool,
}

impl LengthSalvage {
    pub fn new(budget: Option<u32>) -> Self {
        Self {
            budget: budget.filter(|b| *b > 0),
            continues: 0,
            reminder_armed: true,
            truncated: false,
            exhaustion_reported: false,
        }
    }

    pub fn enabled(&self) -> bool {
        self.budget.is_some()
    }

    pub fn budget(&self) -> u32 {
        self.budget.unwrap_or(0)
    }

    pub fn continues(&self) -> u32 {
        self.continues
    }

    pub fn is_truncated(&self) -> bool {
        self.truncated
    }

    pub fn on_length_stop(&mut self) -> SalvageStep {
        if self.continues < self.budget() {
            self.continues += 1;
            let inject_reminder = self.reminder_armed;
            self.reminder_armed = false;
            return SalvageStep::Continue { inject_reminder };
        }
        let report_exhaustion = !self.exhaustion_reported && self.enabled();
        self.truncated = true;
        self.exhaustion_reported = true;
        if report_exhaustion {
            SalvageStep::Exhaust
        } else {
            SalvageStep::None
        }
    }
}
