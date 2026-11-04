# Unified Memory Architecture

> 历史产品设计参考：本文的Shell/Pager接线及check-unified-memory.sh门控随原产品移出，不是当前框架的构建或发布前提。现行resource.memory装载、授权与恢复边界见[记忆模块说明](../../crates/common/nofy-memory/文件说明.md)和[Host说明](../../crates/common/nofy-agent-host/文件说明.md)。固定的主/子Agent策略属于预设选择，不作为所有Agent的内核硬编码要求。

## Product boundary

Nofy exposes one memory capability with two user areas: `Personal`（关于我）and `Project`（当前项目）. The main assistant is the sole runtime owner. Tools, Shell lifecycle code, and Pager actions cross one public boundary: `Arc<dyn MemoryService>`. Subagents do not receive the service or memory tools.

The service supports four user intents—remember, search/explain, revise, and forget—plus capture, consolidation, snapshot, and undo operations. There is no runtime selector, dual read/write path, or alternate store.

## Canonical model and layout

Canonical data is split by scope:

- immutable observations contain captured evidence, provenance, status, and content hashes;
- topics contain curated durable facts, ownership, revisions, and expected hashes;
- tombstones record forget precedence without retaining recoverable content;
- manifests record generations and canonical fingerprints;
- SQLite FTS/vector indexes are derived data and may be deleted and rebuilt.

Repository identity resolves to a stable `ProjectId`, so worktrees of the same repository share project memory. `BranchLocal` facts are gated by ref/commit validity; `ProjectWide` facts remain available across branches of that project. Personal data never carries project validity.

## Transaction boundary

Canonical writes use staged atomic replacement and a persisted generation fence. A topic revision requires the caller's expected hash. A mismatch returns `Conflict`; it never performs last-writer-wins replacement. Index mutation follows the canonical commit and is repairable from the manifest and source objects.

Only migration staging and the atomic writer may modify canonical files. `scripts/check-unified-memory.sh` rejects legacy runtime backends/writers and direct filesystem writes to memory roots in production Shell, tools, agent, and Pager code.

## Capture and consolidation

Automatic capture is allowed only after a top-level turn has both a durable transcript receipt and a committed capture-queue receipt. It extracts supported durable facts, applies category and secret filters, then writes immutable observations. A subagent turn never creates its own capture job.

Consolidation claims observations with a fenced lease. Expired or crashed workers cannot commit after a newer claimant advances the fence. The curator may create or update system-owned topics, but cannot mutate user-owned or pinned topics. Normal capture and consolidation are quiet background work.

## Snapshot semantics

The main assistant receives a deterministic, threat-scanned snapshot with separate Personal and Project budgets. Automatic updates do not alter the current inference segment. Explicit remember, revise, forget, and undo advance the persisted generation so the next inference refreshes before sampling.

Compaction uses the same snapshot API. No component reconstructs context from legacy Markdown files. Subagents have no memory service, search, capture, or write registration; task-specific context must be explicitly frozen by the parent workflow.

## Forget, retention, and recovery

Forget commits a tombstone before derived cleanup. Reconciliation, restart, consolidation, migration recovery, and index rebuild all consult tombstones, so forgotten data cannot be resurrected. The first explicit forget also destroys the encrypted migration backup and its key. Retention may remove eligible automatic observations, but never active/pinned user topics.

At startup the service reconciles incomplete operations, lease state, manifest hashes, and derived-index fingerprints. A missing or inconsistent index is marked repairable and rebuilt from canonical objects. Failure injection covers busy SQLite, worker interruption, expired leases, embedding failure, manifest rename failure, and disk-write failure.

## Security and telemetry

Secrets are rejected before observation/topic persistence. Stored text is scanned again before prompt injection; detected prompt-injection content is replaced with a non-reversible blocked marker. Telemetry contains operation names, scopes, outcomes, durations, counters, and deterministic pseudonymous session IDs only—never statements, summaries, prompts, search queries, topic bodies, or secrets.

## Migration

Legacy sources are imported once into the canonical Personal/Project model. User profile material becomes user-owned pinned topics; session history becomes immutable observations. Migration uses staged validation and an encrypted recovery backup. The legacy root is never treated as an active store, and the backup is permanently destroyed after the first explicit forget.

## Future knowledge-source boundary

`KnowledgeBaseProvider` is a separate read-only provider interface for future external knowledge sources. It is deliberately not a memory scope and is not instantiated by the current composition root. Provider results must remain attributable and cannot be captured, revised, forgotten, consolidated, or indexed as memory unless a future explicit import workflow crosses that boundary.
