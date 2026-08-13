//! World State: partitioned, typed, source-governed read model.
//!
//! The journal is the only truth; World State is a **derived read-side
//! projection** that organizes what the runtime currently believes about
//! reality into strongly typed entries instead of one unbounded JSON blob
//! or a chat summary. It can always be rebuilt, replaced, or discarded —
//! it must never become an implicit write path.
//!
//! ## Partitions
//!
//! Six partitions follow the RTAgent kernel design (§6): `task`,
//! `workspace`, `execution`, `agent`, `knowledge`, `governance`. Not all
//! partitions need to be populated; they are composed per deployment.
//!
//! ## Entry contract (§6.1)
//!
//! Every [`WorldStateEntry`] answers: where did it come from
//! ([`WorldStateEntry::source`], [`WorldStateEntry::authority`]), which
//! event or observation produced it ([`WorldStateEntry::source_sequence`],
//! [`WorldStateEntry::evidence`]), can it be rebuilt (yes — entries are
//! projections), is it still fresh ([`Freshness`]), and how does it
//! compare to conflicting facts ([`WorldStateEntry::status`],
//! [`WorldStateEntry::conflicts_with`]).
//!
//! ## Authority governance (§6.2)
//!
//! `observed > external > inferred > policy`. A lower-authority update
//! never silently replaces a higher-authority entry: [`WorldState::upsert`]
//! keeps the stronger entry and produces an explicit conflict state
//! instead.
//!
//! ## Uncertainty (§6.3)
//!
//! Absence of evidence is not evidence of absence. Entries can express
//! `unknown`, `stale`, `conflicted`, and `unavailable` states; a missing
//! observation must never be projected as a confirmed negative.

/// World State partitions (RTAgent kernel design §6).
///
/// Serialized as lowercase names so persisted state stays greppable and
/// host-agnostic.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Partition {
    /// Goal, pending work, blockers, completion evidence.
    Task,
    /// Changed resources, diagnostics, verification results.
    Workspace,
    /// Active tools, processes, background jobs, retries.
    Execution,
    /// Active workers, assignments, leases.
    Agent,
    /// Known facts, evidence, hypotheses, conflicts.
    Knowledge,
    /// Permissions, approvals, budgets, interruption state.
    Governance,
}

impl Partition {
    /// The stable string form (e.g. `"execution"`).
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Task => "task",
            Self::Workspace => "workspace",
            Self::Execution => "execution",
            Self::Agent => "agent",
            Self::Knowledge => "knowledge",
            Self::Governance => "governance",
        }
    }
}

impl std::fmt::Display for Partition {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Where an entry's claim to truth comes from (RTAgent §6.2).
///
/// Ordered by strength: [`Self::Observed`] > [`Self::External`] >
/// [`Self::Inferred`] > [`Self::Policy`]. Inference must not override a
/// stronger observation without producing an explicit conflict.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Authority {
    /// Directly observed by the runtime or one of its tools.
    Observed,
    /// Returned by a host truth source (e.g. git status, filesystem).
    External,
    /// Inferred by the model or a projection.
    Inferred,
    /// A governance-layer decision.
    Policy,
}

impl Authority {
    /// Strength rank; higher wins in conflict resolution.
    pub fn rank(self) -> u8 {
        match self {
            Self::Observed => 3,
            Self::External => 2,
            Self::Inferred => 1,
            Self::Policy => 0,
        }
    }

    /// The stable string form (e.g. `"observed"`).
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Observed => "observed",
            Self::External => "external",
            Self::Inferred => "inferred",
            Self::Policy => "policy",
        }
    }
}

impl std::fmt::Display for Authority {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Epistemic status of an entry (RTAgent §6.3).
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, Default, serde::Serialize, serde::Deserialize,
)]
#[serde(rename_all = "snake_case")]
pub enum EntryStatus {
    /// Directly observed and currently held to be true.
    #[default]
    Observed,
    /// Believed on inference, not direct observation.
    Inferred,
    /// The runtime does not know; this is not the same as a confirmed
    /// negative.
    Unknown,
    /// Was observed, but the freshness window has lapsed.
    Stale,
    /// A lower-authority claim contradicts this entry; both are retained.
    Conflicted,
    /// The source of truth could not be reached.
    Unavailable,
}

impl EntryStatus {
    /// The stable string form (e.g. `"stale"`).
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Observed => "observed",
            Self::Inferred => "inferred",
            Self::Unknown => "unknown",
            Self::Stale => "stale",
            Self::Conflicted => "conflicted",
            Self::Unavailable => "unavailable",
        }
    }
}

impl std::fmt::Display for EntryStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// How fresh an entry is, and when its claim expires.
///
/// `fresh_until_ms == None` means the claim does not expire on its own
/// (it stays current until superseded); `Some(ts)` means the entry must
/// be re-observed after `ts` or be treated as [`EntryStatus::Stale`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct Freshness {
    /// Unix epoch milliseconds when the underlying observation happened.
    pub observed_at_ms: u64,
    /// Unix epoch milliseconds after which the entry is stale, if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fresh_until_ms: Option<u64>,
}

impl Freshness {
    /// An observation with no expiry.
    pub fn at(observed_at_ms: u64) -> Self {
        Self {
            observed_at_ms,
            fresh_until_ms: None,
        }
    }

    /// Whether the entry is still inside its freshness window at
    /// `now_ms`. Entries without an expiry are always fresh.
    pub fn is_fresh(self, now_ms: u64) -> bool {
        self.fresh_until_ms.is_none_or(|until| now_ms < until)
    }
}

/// One typed World State entry — the §6.1 minimum contract.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct WorldStateEntry {
    /// Stable entry id (UUIDv7); referenced by `conflicts_with`.
    pub id: String,
    /// Which partition this entry belongs to.
    pub partition: Partition,
    /// What the entry is about (e.g. a path, an intent id, a budget).
    pub subject: String,
    /// What is claimed about the subject (e.g. `"modified"`,
    /// `"open_intents"`, `"soft_budget"`).
    pub predicate: String,
    /// The claim itself; typed per (partition, predicate) convention at
    /// the consumer, free-form JSON at this layer.
    #[serde(default)]
    pub value: serde_json::Value,
    /// Where the claim's truth comes from.
    pub authority: Authority,
    /// Producer identifier (e.g. `"journal"`, `"git-status"`,
    /// `"open-intent-gauge"`).
    pub source: String,
    /// Watermark of the producing source: journal seq, observation
    /// sequence, etc. Lets consumers tell whether the entry is behind the
    /// source's current position.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_sequence: Option<u64>,
    /// References to the evidence backing the claim (event seqs, file
    /// paths, command outputs).
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub evidence: Vec<String>,
    /// Optional confidence in `[0, 1]`; `None` means the producer did
    /// not quantify it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub confidence: Option<f64>,
    /// When the claim was observed and when it expires.
    pub freshness: Freshness,
    /// Epistemic status.
    #[serde(default)]
    pub status: EntryStatus,
    /// Ids of entries whose claims conflict with this one.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub conflicts_with: Vec<String>,
}

impl WorldStateEntry {
    /// Minimal constructor; everything beyond identity and the claim
    /// starts empty/default.
    pub fn new(
        partition: Partition,
        subject: impl Into<String>,
        predicate: impl Into<String>,
        value: serde_json::Value,
        authority: Authority,
        source: impl Into<String>,
    ) -> Self {
        Self {
            id: new_entry_id(),
            partition,
            subject: subject.into(),
            predicate: predicate.into(),
            value,
            authority,
            source: source.into(),
            source_sequence: None,
            evidence: Vec::new(),
            confidence: None,
            freshness: Freshness::at(crate::now_ms()),
            status: EntryStatus::default(),
            conflicts_with: Vec::new(),
        }
    }

    /// Builder: set the freshness window.
    pub fn with_freshness(mut self, freshness: Freshness) -> Self {
        self.freshness = freshness;
        self
    }

    /// Builder: set the producing source's watermark.
    pub fn with_source_sequence(mut self, seq: u64) -> Self {
        self.source_sequence = Some(seq);
        self
    }

    /// Builder: attach evidence references.
    pub fn with_evidence(mut self, evidence: Vec<String>) -> Self {
        self.evidence = evidence;
        self
    }

    /// Builder: set confidence, clamped to `[0, 1]`.
    pub fn with_confidence(mut self, confidence: f64) -> Self {
        self.confidence = Some(confidence.clamp(0.0, 1.0));
        self
    }

    /// Builder: set the epistemic status.
    pub fn with_status(mut self, status: EntryStatus) -> Self {
        self.status = status;
        self
    }

    /// The identity key of this entry within a [`WorldState`].
    pub fn key(&self) -> (Partition, &str, &str) {
        (self.partition, self.subject.as_str(), self.predicate.as_str())
    }
}

/// Generate a fresh, time-ordered World State entry id (UUIDv7).
pub fn new_entry_id() -> String {
    uuid::Uuid::now_v7().to_string()
}

/// The result of applying an entry to a [`WorldState`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UpsertOutcome {
    /// No prior entry for this key; the entry was inserted.
    Inserted,
    /// The new entry's authority was at least as strong as the prior
    /// one; it replaced it.
    Replaced,
    /// The new entry was weaker than the prior one; the prior entry was
    /// kept and marked [`EntryStatus::Conflicted`], and the challenger
    /// was retained in [`WorldState::shadow_entries`].
    Conflicted,
}

/// The partitioned read model. Keyed by (partition, subject, predicate);
/// at most one live entry per key, plus shadowed weaker challengers kept
/// for audit.
///
/// Storage is a plain vec — the model is small (tens of entries) and
/// linear scans keep serialization trivial and deterministic.
#[derive(Debug, Clone, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct WorldState {
    #[serde(default)]
    entries: Vec<WorldStateEntry>,
    /// Lower-authority challengers that lost an upsert; retained so the
    /// conflict is explicit and auditable, never silently dropped.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    shadow: Vec<WorldStateEntry>,
}

impl WorldState {
    /// An empty projection.
    pub fn new() -> Self {
        Self::default()
    }

    /// Apply an entry under authority governance (§6.2):
    ///
    /// - no prior entry → insert;
    /// - new authority rank ≥ prior rank → replace;
    /// - new authority rank < prior rank → keep the prior entry, mark it
    ///   [`EntryStatus::Conflicted`] with the challenger's id, and shadow
    ///   the challenger.
    ///
    /// Inference never silently overrides observation.
    pub fn upsert(&mut self, entry: WorldStateEntry) -> UpsertOutcome {
        match self
            .entries
            .iter_mut()
            .find(|prior| prior.key() == entry.key())
        {
            None => {
                self.entries.push(entry);
                UpsertOutcome::Inserted
            }
            Some(prior) if entry.authority.rank() >= prior.authority.rank() => {
                *prior = entry;
                UpsertOutcome::Replaced
            }
            Some(prior) => {
                prior.status = EntryStatus::Conflicted;
                prior.conflicts_with.push(entry.id.clone());
                self.shadow.push(entry);
                UpsertOutcome::Conflicted
            }
        }
    }

    /// The live entry for a key, if any.
    pub fn get(
        &self,
        partition: Partition,
        subject: &str,
        predicate: &str,
    ) -> Option<&WorldStateEntry> {
        self.entries
            .iter()
            .find(|e| e.partition == partition && e.subject == subject && e.predicate == predicate)
    }

    /// All live entries in a partition, in stable (subject, predicate)
    /// order for deterministic rendering.
    pub fn partition_entries(&self, partition: Partition) -> Vec<&WorldStateEntry> {
        let mut out: Vec<&WorldStateEntry> = self
            .entries
            .iter()
            .filter(|e| e.partition == partition)
            .collect();
        out.sort_by(|a, b| {
            (a.subject.as_str(), a.predicate.as_str())
                .cmp(&(b.subject.as_str(), b.predicate.as_str()))
        });
        out
    }

    /// Weaker challengers retained from conflicted upserts.
    pub fn shadow_entries(&self) -> &[WorldStateEntry] {
        &self.shadow
    }

    /// Number of live entries across all partitions.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Whether the projection holds nothing.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn entry(
        partition: Partition,
        subject: &str,
        predicate: &str,
        authority: Authority,
    ) -> WorldStateEntry {
        WorldStateEntry::new(partition, subject, predicate, json!(1), authority, "test")
            .with_freshness(Freshness::at(100))
    }

    #[test]
    fn partition_and_authority_serialize_as_snake_case() {
        assert_eq!(
            serde_json::to_string(&Partition::Execution).unwrap(),
            "\"execution\""
        );
        assert_eq!(
            serde_json::from_str::<Partition>("\"governance\"").unwrap(),
            Partition::Governance
        );
        assert_eq!(
            serde_json::to_string(&Authority::Observed).unwrap(),
            "\"observed\""
        );
        assert_eq!(
            serde_json::from_str::<Authority>("\"inferred\"").unwrap(),
            Authority::Inferred
        );
    }

    #[test]
    fn authority_ranks_follow_the_truth_hierarchy() {
        assert!(Authority::Observed.rank() > Authority::External.rank());
        assert!(Authority::External.rank() > Authority::Inferred.rank());
        assert!(Authority::Inferred.rank() > Authority::Policy.rank());
    }

    #[test]
    fn freshness_expiry() {
        assert!(Freshness::at(10).is_fresh(u64::MAX));
        let bounded = Freshness {
            observed_at_ms: 10,
            fresh_until_ms: Some(20),
        };
        assert!(bounded.is_fresh(19));
        assert!(!bounded.is_fresh(20));
    }

    #[test]
    fn upsert_inserts_then_replaces_at_equal_or_higher_authority() {
        let mut ws = WorldState::new();
        let out = ws.upsert(entry(
            Partition::Execution,
            "intents",
            "open_count",
            Authority::Inferred,
        ));
        assert_eq!(out, UpsertOutcome::Inserted);

        // Equal authority replaces.
        let mut replacement = entry(
            Partition::Execution,
            "intents",
            "open_count",
            Authority::Inferred,
        );
        replacement.value = json!(2);
        assert_eq!(ws.upsert(replacement), UpsertOutcome::Replaced);

        // Higher authority replaces; no conflict state left behind.
        let observed = entry(
            Partition::Execution,
            "intents",
            "open_count",
            Authority::Observed,
        );
        assert_eq!(ws.upsert(observed), UpsertOutcome::Replaced);
        let live = ws
            .get(Partition::Execution, "intents", "open_count")
            .unwrap();
        assert_eq!(live.authority, Authority::Observed);
        assert_eq!(live.status, EntryStatus::Observed);
        assert!(live.conflicts_with.is_empty());
        assert!(ws.shadow_entries().is_empty());
    }

    #[test]
    fn inference_cannot_silently_override_observation() {
        let mut ws = WorldState::new();
        ws.upsert(entry(
            Partition::Workspace,
            "src/main.rs",
            "modified",
            Authority::Observed,
        ));

        let challenger = entry(
            Partition::Workspace,
            "src/main.rs",
            "modified",
            Authority::Inferred,
        );
        let challenger_id = challenger.id.clone();
        assert_eq!(ws.upsert(challenger), UpsertOutcome::Conflicted);

        // The observation survives, explicitly marked conflicted.
        let live = ws
            .get(Partition::Workspace, "src/main.rs", "modified")
            .unwrap();
        assert_eq!(live.authority, Authority::Observed);
        assert_eq!(live.status, EntryStatus::Conflicted);
        assert_eq!(live.conflicts_with, vec![challenger_id]);

        // The challenger is retained for audit, not dropped.
        assert_eq!(ws.shadow_entries().len(), 1);
    }

    #[test]
    fn distinct_keys_do_not_interact() {
        let mut ws = WorldState::new();
        ws.upsert(entry(Partition::Task, "goal", "active", Authority::Policy));
        ws.upsert(entry(
            Partition::Governance,
            "goal",
            "active",
            Authority::Observed,
        ));
        assert_eq!(ws.len(), 2);
    }

    #[test]
    fn partition_entries_are_deterministically_ordered() {
        let mut ws = WorldState::new();
        ws.upsert(entry(Partition::Workspace, "b.rs", "modified", Authority::External));
        ws.upsert(entry(Partition::Workspace, "a.rs", "modified", Authority::External));
        ws.upsert(entry(Partition::Execution, "job", "running", Authority::Observed));

        let subjects: Vec<&str> = ws
            .partition_entries(Partition::Workspace)
            .iter()
            .map(|e| e.subject.as_str())
            .collect();
        assert_eq!(subjects, vec!["a.rs", "b.rs"]);
        assert_eq!(ws.partition_entries(Partition::Knowledge).len(), 0);
    }

    #[test]
    fn confidence_is_clamped() {
        let e = entry(Partition::Knowledge, "fact", "known", Authority::Inferred)
            .with_confidence(1.7);
        assert_eq!(e.confidence, Some(1.0));
    }

    #[test]
    fn entry_round_trips_through_json() {
        let e = entry(
            Partition::Governance,
            "budget",
            "soft_limit",
            Authority::Policy,
        )
        .with_source_sequence(42)
        .with_evidence(vec!["journal:seq=41".into()])
        .with_confidence(0.9)
        .with_status(EntryStatus::Inferred);
        let line = serde_json::to_string(&e).unwrap();
        let back: WorldStateEntry = serde_json::from_str(&line).unwrap();
        assert_eq!(back, e);
        assert_eq!(back.source_sequence, Some(42));
    }

    #[test]
    fn world_state_round_trips_through_json() {
        let mut ws = WorldState::new();
        ws.upsert(entry(Partition::Execution, "intents", "open_count", Authority::Observed));
        let line = serde_json::to_string(&ws).unwrap();
        let back: WorldState = serde_json::from_str(&line).unwrap();
        assert_eq!(back, ws);
    }
}
