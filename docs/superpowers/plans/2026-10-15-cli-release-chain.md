# CLI release chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the approved Rust/CLI version, package, verification and local installation chain without desktop changes or remote publishing.

**Architecture:** Share a pure version comparator from nofy-version. Add an independent nofy-release workspace utility that reads source metadata directly, edits only version-owned fields, and verifies real binary JSON identity before packaging/installing. Keep source revision and installed binary identity separate.

**Tech Stack:** Rust, semver, serde_json, toml_edit, sha2, temporary Git repositories, native Cargo builds.

## Task 1 — Version ordering and build identity

- [x] Add failing integration test `crates/codegen/nofy-version/tests/release_version.rs`: `assert_eq!(compare_versions("1.0.45+nofy.2", "1.0.45+nofy.10").unwrap(), Ordering::Less)`.
- [x] Run low-debug `cargo test --locked -p nofy-version --test release_version`; confirm missing comparator failure.
- [x] Add `crates/codegen/nofy-version/src/release.rs` with `compare_versions(current: &str, candidate: &str) -> Result<Ordering, String>`; parse known Nofy metadata, clear build metadata for SemVer precedence, compare numeric revisions only after precedence ties. Reject unknown metadata/overflow.
- [x] Export module from `src/lib.rs`; adapt `build_support.rs` to emit full build SHA, clean/dirty/unknown and target while preserving old display output. Run version tests.

## Task 2 — Independent source release tool

- [x] Create `crates/codegen/nofy-release/{Cargo.toml,build.rs,src/lib.rs,src/main.rs,src/workspace.rs}`; register workspace member in root Cargo.toml. Dependencies: anyhow, semver, serde, serde_json, sha2, toml_edit; tempfile for tests. Include shared parser/comparator source without depending on the guarded product library.
- [x] Seed `docs/releases/cli.json` with the actual current baseline and revision; require a meaningful `--notes` for applied bumps.
- [x] Implement `check`, `compare CURRENT CANDIDATE`, `bump revision`, `bump baseline --version V --commit SHA`. Bumps preview by default, `--apply` edits metadata, two manifests, lock entries and release record using validated transactional writes.
- [x] Test source inconsistency, numeric revisions, preview zero-write, preserved unrelated changes, repeat/baseline rollback rejection, SHA/version mismatch and write-failure rollback in temporary repositories. Use offline Cargo to update only the new tool's lock entry, never regenerate dependencies.

## Task 3 — Early machine-readable CLI contract

- [x] Update `crates/codegen/nofy-pager-bin/src/main.rs`: `version_json()` returns schemaVersion/currentVersion/fullVersion/upstreamVersion/upstreamCommit/buildCommit/worktreeState/target; currentVersion is the shared SemVer.
- [x] Extend early version dispatch to `version --json` and `version` alias; reuse one JSON writer in the async fallback branch. No configuration/model/session work before output.
- [x] Add binary unit contract tests; inspect consumers of currentVersion. Preserve standard config SemVer gating.

## Task 4 — Package, verify and install

- [x] Create `nofy-release/src/artifact.rs` with typed identity/manifest, bounded binary JSON querying, SHA-256 streaming and native target verification. Never execute cross-target artifacts.
- [x] Implement `package --out DIR [--binary PATH] [--profile dev|release] [--snapshot --allow-dirty]`: check metadata/ledger, build or inspect binary, compare source identity, refuse dirty/unknown formal releases and existing output directories; create binary, release.json and SHA256SUMS.
- [x] Implement `verify --manifest PATH` to check schema, safe local filename, version, baseline, SHA/state, target, hash, size and binary's real identity. Checksums establish integrity, not publisher authenticity.
- [x] Implement `install --manifest PATH --dest PATH [--reinstall]`: verify candidate, compare installed version, reject downgrade/equal without permission, preserve unique backup, atomic replacement, post-install identity/hash check, rollback on failure. Do not terminate running user processes.
- [x] Test clean/snapshot gates, tampering, wrong target/version, manifest traversal, overwrite refusal, successful isolated installation, downgrade/equal refusal and post-install rollback using local fixtures.

## Task 5 — Verification, docs and delivery

- [x] Add `.github/workflows/nofy-cli.yml` for native CLI tests/build/package/verify, separate from desktop. No remote Release/tag/push steps.
- [x] Document exact tool commands and compatibility change to JSON currentVersion in `docs/cli-release.md`.
- [x] Run `cargo test --locked -p nofy-release -p nofy-version` with no incremental/debug information; rustfmt only task files; check Git diff and run GitNexus detect_changes before committing task-owned hunks.
- [x] Build real nofy and verify JSON in an empty configuration directory. Run real snapshot package→verify→isolated install→version check and negative tamper/downgrade paths.
- [x] Rebuild from final implementation commit, install through nofy-release and verify default nofy hash/version. Record actual local checks; do not claim remote CI or other platforms ran.

## Local verification record

- Implementation commit: `0a7535dab34f0151780db802aece6bd1e1bf3eb5`; product `1.0.45+nofy.2`, audited upstream unchanged at `1.0.45` / `2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8`.
- 44 tests passed: 21 release-tool regressions, 9 shared-version tests, 14 binary tests. Release-tool Clippy with `-D warnings`, task-file rustfmt and diff checks passed.
- Real native arm64 macOS snapshot: `target/nofy-dist/local-0a7535da/release.json`; package → verify → isolated install → real default install passed. Existing `.1` upgraded to `.2`, so reinstall override was unnecessary.
- Default `/Users/mac/.local/bin/nofy` and `target/debug/nofy` SHA-256: `ffe844b5186c031472cfdd7b94aae271e941e0cd0ac28cf9ad9ce51adcd78b18`.
- Prior installed binary preserved at `/Users/mac/.local/bin/.nofy-previous-40156-1792072294382716000-1`.
- Empty-config JSON query made no configuration directory. Both installed fullscreen/minimal PTYs displayed `.2` and exited cleanly. Actual old `.1` artifact downgrade and corrupted manifest were rejected; original artifact still verified. Temporary corrupt manifest was removed.
- This is an explicit dirty snapshot because unrelated user changes remain. No public release, tag or push; configured remote CI and other OS targets were not executed locally. Desktop files were not changed by this task.
