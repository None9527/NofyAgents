//! System-event bus + presence + wake routing (FR3.10, OC-F13).
//!
//! The bus carries system events (task fired, maintenance needed, surface
//! presence changes) to subscribers by TOPIC. Presence tracks which
//! surfaces are online; wake routing delivers a wake to an ONLINE surface
//! — and when none is online, the wake is LATCHED (delivered at the next
//! presence), never dropped.

use std::collections::{BTreeMap, BTreeSet};

/// System event topics.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum Topic {
    TaskFired,
    MaintenanceNeeded,
    PresenceChanged,
    ApprovalNeeded,
}

/// One system event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SystemEvent {
    pub topic: Topic,
    pub payload: String,
    pub at: u64,
}

/// The bus: topic → subscribers.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct EventBus {
    subscribers: BTreeMap<Topic, BTreeSet<String>>,
    /// Delivery log (audit): (subscriber, event at).
    pub deliveries: Vec<(String, u64)>,
}

impl EventBus {
    pub fn subscribe(&mut self, topic: Topic, subscriber: &str) {
        self.subscribers
            .entry(topic)
            .or_default()
            .insert(subscriber.to_string());
    }

    pub fn unsubscribe(&mut self, topic: &Topic, subscriber: &str) {
        if let Some(set) = self.subscribers.get_mut(topic) {
            set.remove(subscriber);
        }
    }

    /// Publish to all subscribers of the topic. Returns the fan-out.
    pub fn publish(&mut self, event: &SystemEvent) -> Vec<String> {
        let targets: Vec<String> = self
            .subscribers
            .get(&event.topic)
            .map(|set| set.iter().cloned().collect())
            .unwrap_or_default();
        for target in &targets {
            self.deliveries.push((target.clone(), event.at));
        }
        targets
    }

    pub fn subscriber_count(&self, topic: &Topic) -> usize {
        self.subscribers.get(topic).map(|s| s.len()).unwrap_or(0)
    }
}

/// Presence: which surfaces are online.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PresenceTable {
    online: BTreeSet<String>,
}

impl PresenceTable {
    pub fn surface_online(&mut self, surface: &str, bus: &mut EventBus, at: u64) {
        self.online.insert(surface.to_string());
        bus.publish(&SystemEvent {
            topic: Topic::PresenceChanged,
            payload: format!("{surface} online"),
            at,
        });
    }

    pub fn surface_offline(&mut self, surface: &str, bus: &mut EventBus, at: u64) {
        self.online.remove(surface);
        bus.publish(&SystemEvent {
            topic: Topic::PresenceChanged,
            payload: format!("{surface} offline"),
            at,
        });
    }

    pub fn is_online(&self, surface: &str) -> bool {
        self.online.contains(surface)
    }

    pub fn online_surfaces(&self) -> Vec<String> {
        self.online.iter().cloned().collect()
    }
}

/// Wake routing outcome.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WakeOutcome {
    /// Delivered to this online surface.
    Delivered(String),
    /// No surface online: latched for the next presence.
    Latched,
}

/// The wake router.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct WakeRouter {
    /// Latched wakes awaiting a surface.
    latched: Vec<SystemEvent>,
}

impl WakeRouter {
    /// Route a wake: first online surface (deterministic order) gets it;
    /// none online = latch.
    pub fn route(&mut self, presence: &PresenceTable, event: SystemEvent) -> WakeOutcome {
        match presence.online_surfaces().first() {
            Some(surface) => WakeOutcome::Delivered(surface.clone()),
            None => {
                self.latched.push(event);
                WakeOutcome::Latched
            }
        }
    }

    /// A surface came online: drain latched wakes to it.
    pub fn drain_latched(&mut self, surface: &str) -> Vec<SystemEvent> {
        if self.latched.is_empty() {
            return Vec::new();
        }
        let _ = surface; // the drain target is recorded by the caller
        std::mem::take(&mut self.latched)
    }

    pub fn latched_count(&self) -> usize {
        self.latched.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn publish_fans_out_by_topic() {
        let mut bus = EventBus::default();
        bus.subscribe(Topic::TaskFired, "daemon");
        bus.subscribe(Topic::TaskFired, "tui");
        bus.subscribe(Topic::ApprovalNeeded, "tui");
        let event = SystemEvent {
            topic: Topic::TaskFired,
            payload: "nightly".into(),
            at: 10,
        };
        let fanout = bus.publish(&event);
        assert_eq!(fanout, vec!["daemon".to_string(), "tui".to_string()]);
        assert_eq!(bus.deliveries.len(), 2);
        assert_eq!(bus.subscriber_count(&Topic::ApprovalNeeded), 1);
    }

    #[test]
    fn unsubscribe_stops_delivery() {
        let mut bus = EventBus::default();
        bus.subscribe(Topic::MaintenanceNeeded, "cleaner");
        bus.unsubscribe(&Topic::MaintenanceNeeded, "cleaner");
        let event = SystemEvent {
            topic: Topic::MaintenanceNeeded,
            payload: "".into(),
            at: 1,
        };
        assert!(bus.publish(&event).is_empty());
    }

    #[test]
    fn presence_tracks_surfaces() {
        let mut bus = EventBus::default();
        bus.subscribe(Topic::PresenceChanged, "audit");
        let mut presence = PresenceTable::default();
        presence.surface_online("tui", &mut bus, 1);
        assert!(presence.is_online("tui"));
        presence.surface_offline("tui", &mut bus, 2);
        assert!(!presence.is_online("tui"));
        // Both transitions delivered to the subscriber.
        assert_eq!(bus.deliveries.len(), 2);
    }

    #[test]
    fn wake_routes_to_online_surface() {
        let mut bus = EventBus::default();
        let mut presence = PresenceTable::default();
        presence.surface_online("web", &mut bus, 1);
        let mut router = WakeRouter::default();
        let event = SystemEvent {
            topic: Topic::TaskFired,
            payload: "x".into(),
            at: 2,
        };
        assert_eq!(
            router.route(&presence, event),
            WakeOutcome::Delivered("web".into())
        );
        assert_eq!(router.latched_count(), 0);
    }

    #[test]
    fn drain_latched_without_anything_latched_is_empty() {
        let mut router = WakeRouter::default();
        assert!(
            router.drain_latched("tui").is_empty(),
            "nothing latched, nothing to drain"
        );
    }

    #[test]
    fn wake_latches_when_no_surface_online() {
        let presence = PresenceTable::default();
        let mut router = WakeRouter::default();
        let event = SystemEvent {
            topic: Topic::ApprovalNeeded,
            payload: "y".into(),
            at: 3,
        };
        assert_eq!(router.route(&presence, event), WakeOutcome::Latched);
        assert_eq!(router.latched_count(), 1);
        // Surface arrives: latched wakes drain, never dropped.
        let drained = router.drain_latched("tui");
        assert_eq!(drained.len(), 1);
        assert_eq!(router.latched_count(), 0);
    }
}
