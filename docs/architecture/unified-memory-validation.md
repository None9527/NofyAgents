# Unified Memory Validation

> 历史原产品验收记录：下文nofy/ACP/Shell及check-unified-memory.sh命令不再在当前工程执行，也不作为新框架前置门槛。原源码与脚本已在CLEAN5b归档移出。当前记忆能力通过统一resource.memory及Host/SDK契约验收，见[记忆模块说明](../../crates/common/nofy-memory/文件说明.md)与[物理移出验收](../verification/retired-source-tree.md)；不把历史测试记作当前已运行。

This report is the release gate for the single Nofy memory system. It maps the
acceptance sequence to executable tests, keeps fault injection reproducible,
and records non-flaky performance ceilings rather than machine-specific goals.

## End-to-end acceptance

The canonical product gate drives the real `nofy` binary over ACP, with one
isolated `NOFY_HOME` shared across process restarts:

```bash
cargo build -p nofy-pager-bin --bin nofy
NOFY_BINARY="$PWD/target/debug/nofy" \
  cargo test -p nofy-shell --test memory_product_e2e -- --ignored --nocapture
```

For this gate, **memory participated** means the trusted retrieval path selected
at least one durable fact and injected that exact fact into the inference
request. It is not inferred from the assistant's wording. A successful turn
then emits `memory_reference_used` from the shell; an irrelevant turn injects
nothing and emits no reference. Likewise, a write is successful only when the
service commit finishes and the shell emits `memory_write_receipt`; model prose
is never treated as a receipt.

The binary scenarios cover explicit remember and safe receipt, same-project and
cross-process recall, irrelevant-query silence, project isolation, correction
precedence, confirmed forget, and rejected-secret writes without a false success
receipt. Linked-worktree identity, automatic-learning consent, derived-index
rebuild, and promptware quarantine remain deterministic service/model contract
tests in the same release gate rather than a second E2E harness.

The fixture path is exercised as one ordered release scenario across public
service and recovery boundaries:

| Step | Executable evidence |
|---|---|
| legacy seed, migrate, encrypted backup, restart | `migration_cutover` |
| explain, remember, revise, next-inference snapshot | `user_experience_contract`, `snapshot_injection` |
| capture, consolidate, worker restart | `capture_recovery`, `consolidation_recovery` |
| forget and destroy the recovery copy | `forget_and_retention` |
| delete and rebuild every derived index | `unified_search::deleting_indexes_and_rebuilding_preserves_result_identity_and_ignores_knowledge_files` |
| linked worktrees share project identity | `model_contract::linked_worktree_shares_project_identity` |
| automatic learning off still permits explicit writes | `user_experience_contract::disabling_automatic_learning_keeps_explicit_memory_available` |
| secrets are rejected and sensitive facts require consent | `user_experience_contract::sensitive_memory_requires_confirmation_and_secrets_are_always_rejected`, `memory_product_e2e::rejected_secret_write_never_emits_success_receipt` |
| promptware is quarantined before injection | `snapshot_injection::promptware_is_blocked_before_snapshot_injection` |

These tests share the same canonical model and public `MemoryService`; none
uses a legacy runtime backend. The release command runs all of them together:

```bash
cargo test -p nofy-memory --no-fail-fast
```

Subagents never receive the unified memory service or memory tools. The
`check-unified-memory.sh` release guard pins that construction-time invariant so
it cannot silently regress while the real-binary suite exercises the top-level
assistant.

## Fault injection

| Fault | Test seam and expected result |
|---|---|
| SQLite busy/concurrent claimant | `state_recovery::sqlite_busy_is_bounded_and_never_partially_enqueues` plus generation-fenced claims |
| worker crash | shutdown/reconciliation cases in `capture_recovery` |
| lease expiry | capture and consolidation stale-worker fencing in `state_recovery` and `capture_recovery` |
| embedding failure | `embedding_failure::embedding_failure_keeps_keyword_search_available` injects provider failure and proves FTS remains available |
| manifest/topic rename failure | rollback and restart cases in `access_policy` and `consolidation_recovery` |
| disk write interruption | atomic temp-sync, pre-rename, pre-commit and post-commit kill points in `state_recovery` |

## Performance baseline

`performance_baseline` builds observation-shaped FTS rows at 10k and 100k,
then measures store startup, top-10 keyword search, durable capture enqueue and
a 64-plan shadow consolidation batch. Seeding is excluded from timings. The
test is ignored in ordinary CI because it is a release benchmark:

```bash
cargo test -p nofy-memory --test performance_baseline -- --ignored --nocapture
```

The checked ceilings deliberately leave headroom for shared CI hosts:

| Operation | Ceiling |
|---|---:|
| startup | 2 s |
| top-10 FTS search | 1 s |
| durable capture enqueue | 250 ms |
| 64-plan consolidation scheduling batch | 5 s |

The benchmark prints the observed durations for both scales. A threshold
failure blocks release; changes to a ceiling require an architecture note and
a fresh 10k/100k run.

Observed on 2026-09-21 (macOS, debug test profile):

| Observations | Startup | Top-10 FTS | Capture enqueue | 64-plan consolidation |
|---:|---:|---:|---:|---:|
| 10,000 | <1 ms | 14 ms | 109 µs | 558 ms |
| 100,000 | <1 ms | 161 ms | 104 µs | 545 ms |
