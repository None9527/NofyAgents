use crate::capability::{Capability, Level, Probe};
use crate::policy::Confinement;
use std::fmt;

/// The error code a refused launch is reported under.
pub const ERROR_CODE: &str = "isolation_unavailable";

/// One requirement a backend cannot meet.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Shortfall {
    pub capability: Capability,
    pub required: Level,
    pub available: Level,
    /// The backend's own explanation, if it gave one.
    pub note: Option<String>,
}

/// A launch refused because the backend cannot enforce what the confinement needs.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Refusal {
    pub backend: String,
    pub shortfalls: Vec<Shortfall>,
}

impl fmt::Display for Refusal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{ERROR_CODE}: backend `{}` cannot enforce what the command requires: ",
            self.backend
        )?;
        for (index, shortfall) in self.shortfalls.iter().enumerate() {
            if index > 0 {
                f.write_str("; ")?;
            }
            write!(
                f,
                "{} (needs {}, has {}",
                shortfall.capability.name(),
                shortfall.required.name(),
                shortfall.available.name()
            )?;
            if let Some(note) = &shortfall.note {
                write!(f, ": {note}")?;
            }
            f.write_str(")")?;
        }
        Ok(())
    }
}

impl std::error::Error for Refusal {}

/// Decide whether a backend may run a command under a confinement. It looks
/// only at what the backend reports it enforces, never at the platform's name,
/// and refuses on the first shortfall of any kind: there is no fallback.
pub fn admit(probe: &Probe, policy: &Confinement) -> Result<(), Refusal> {
    let shortfalls: Vec<Shortfall> = policy
        .requirements()
        .into_iter()
        .filter_map(|need| {
            let available = probe.capabilities.level(need.capability);
            (available < need.minimum).then(|| Shortfall {
                capability: need.capability,
                required: need.minimum,
                available,
                note: probe.notes.get(&need.capability).cloned(),
            })
        })
        .collect();
    if shortfalls.is_empty() {
        Ok(())
    } else {
        Err(Refusal {
            backend: probe.backend.clone(),
            shortfalls,
        })
    }
}
