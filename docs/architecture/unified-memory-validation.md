# Unified Memory Validation

This report is the release gate for the single Nofy memory system. It maps the
acceptance sequence to executable tests, keeps fault injection reproducible,
and records non-flaky performance ceilings rather than machine-specific goals.

## End-to-end acceptance

The fixture path is exercised as one ordered release scenario across public
service and recovery boundaries:

| Step | Executable evidence |
|---|---|
| legacy seed, migrate, encrypted backup, restart | `migration_cutover` |
| explain, remember, revise, next-inference snapshot | `user_experience_contract`, `snapshot_injection` |
| capture, consolidate, worker restart | `capture_recovery`, `consolidation_recovery` |
| forget and destroy the recovery copy | `forget_and_retention` |
| delete and rebuild every derived index | `unified_search::deleting_indexes_and_rebuilding_preserves_result_identity_and_ignores_knowledge_files` |

These tests share the same canonical model and public `MemoryService`; none
uses a legacy runtime backend. The release command runs all of them together:

```bash
cargo test -p nofy-memory --no-fail-fast
```

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
