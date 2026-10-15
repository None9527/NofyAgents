# Upstream-aligned version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make installed CLI and welcome screen report the audited upstream baseline plus Nofy revision.

**Architecture:** Store audited baseline and revision in one repository file. Reuse one build-support module in version/pager/binary build scripts; only composition builds read Git identity. Keep protocol versions single-line SemVer and inject full build identity into the binary rather than all libraries.

**Tech Stack:** Rust, Cargo build scripts, existing semver dependency, Git, PTY.

## Task 1 — Regression contract

Files: `crates/codegen/nofy-version/tests/build_metadata.rs` (new).

- [ ] Add a failing test with `assert_eq!(nofy_version::VERSION, "1.0.45+nofy.1")` when no release override is set.
- [ ] Run `CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0 cargo test --locked -p nofy-version --test build_metadata`; expect old `0.2.121` assertion failure.

## Task 2 — Shared build metadata

Files: new `crates/codegen/nofy-version/upstream-version.txt`, new `build_support.rs`; existing version/pager/pager-bin build scripts and Cargo manifests. Keep product package versions for `nofy-version` and `nofy-pager-bin` aligned with metadata; do not renumber internal crates.

- [ ] Record three lines: `1.0.45`, `2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8`, `1`.
- [ ] Add a shared parser using `semver::Version::parse`, enforce exactly three fields, full hex upstream commit and unsigned revision; emit `NOFY_VERSION`, `NOFY_UPSTREAM_VERSION`, `NOFY_UPSTREAM_COMMIT`.
- [ ] Validate `NOFY_VERSION` override; do not let it modify baseline metadata.
- [ ] For pager/binary builds obtain 12-character HEAD and clean/dirty/unknown from Git; use Git-resolved paths for checkout/worktree and packed refs. Watch source/control paths so commit, edits and new untracked files invalidate build identity. Ignore build outputs via Git ignored-path checks.
- [ ] For version library emit metadata only, without HEAD dependency. Reuse binary `VERSION_WITH_COMMIT` injection and shared formatter for full CLI identity.
- [ ] Test parser failures, overrides, clean/dirty, untracked files, detached HEAD, linked worktree, source archive, and changed/packed branch refs with temporary Git repositories.

## Task 3 — Display contract

Files: `crates/codegen/nofy-version/src/lib.rs`, `crates/codegen/nofy-pager-bin/src/main.rs`, `crates/codegen/nofy-pager/src/memory_trace.rs`; new/extended version regression tests and `crates/codegen/nofy-pager/src/views/welcome/mod.rs` badge regression.

- [ ] Export upstream constants; add `upstream_display()` returning `upstream 1.0.45 (2bdd1d6a6369)`.
- [ ] Make CLI text `format!("nofy {}\n{}\n", full_version, nofy_version::upstream_display())`.
- [ ] Keep existing welcome screen reads of shared `VERSION`; verify no separate hardcoded value is needed.
- [ ] Change diagnostic startup event to `version: Some(nofy_version::VERSION)` without changing trace enablement.
- [ ] Run version regression tests and binary version contract tests, keeping existing test override semantics.

## Task 4 — Build/install verification

- [ ] Run targeted rustfmt and `git diff --check` without formatting unrelated dirty code.
- [ ] Build `CARGO_INCREMENTAL=0 CARGO_PROFILE_DEV_DEBUG=0 cargo build --locked -p nofy-pager-bin --bin nofy`.
- [ ] Verify version of `target/debug/nofy`; verify release override then restore normal build if exercised.
- [ ] Back up `/Users/mac/.local/bin/nofy` to a task-specific nonexisting backup, install verified binary, compare hashes and run installed `nofy --version`.
- [ ] Capture welcome screen through a PTY and assert `1.0.45+nofy.1`, not old version. Check target size.
- [ ] Update design status and run GitNexus detect_changes; commit only task-owned changes after review. Preserve all unrelated dirty source and do not push.
