# Memory Product E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close Nofy's single-memory-system product loop so durable writes acknowledge only after commit, query-scoped memory references are trustworthy and quiet, and the real `nofy` binary proves the behavior end to end.

**Architecture:** Keep `nofy-memory` as the only store and service. Extend its frozen snapshot with safe reference descriptors, let the shell own turn-scoped participation state and trusted session updates, and let the Rust pager render those updates after the answer. Tool output keeps opaque mutation coordinates model-facing while exposing only human-safe receipts. Product E2E tests drive the real ACP binary with an isolated `NOFY_HOME` and deterministic mock inference server.

**Tech Stack:** Rust, Tokio, ACP, serde/schemars, `nofy-memory`, `nofy-shell`, `nofy-pager`, `nofy-test-support`.

---

## Task 1: Make frozen snapshots carry safe references

**Files:**
- Modify: `crates/codegen/nofy-tools/src/types/memory_service.rs`
- Modify: `crates/codegen/nofy-memory/src/service.rs`
- Test: `crates/codegen/nofy-memory/tests/snapshot_injection.rs`

- [ ] Add a failing snapshot test asserting that every injected item has a safe display descriptor containing area label, summary, and source kind/time, but no path, hash, revision, operation ID, or raw storage metadata.
- [ ] Introduce a serializable `MemoryReference` DTO and add `references: Vec<MemoryReference>` to `MemorySnapshot` with `#[serde(default)]` compatibility.
- [ ] Populate references from the exact ranked, filtered items used to build snapshot content; never reconstruct them from model text.
- [ ] Run `cargo test -p nofy-memory --test snapshot_injection` and expect all tests to pass.
- [ ] Commit as `feat(memory): add safe snapshot references` after `gitnexus_detect_changes(scope: staged)`.

## Task 2: Remove internal storage coordinates from model context

**Files:**
- Modify: `crates/codegen/nofy-shell/src/session/helpers/memory_context.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_tests/memory_config_tests.rs`

- [ ] Change the formatter test to assert that generation and content hash are absent while the non-authoritative safety instruction remains.
- [ ] Render only threat-scanned content inside the memory context tags; retain generation/hash in process state rather than prompt text.
- [ ] Update snapshot fixtures with safe references.
- [ ] Run `cargo test -p nofy-shell memory_context --lib` and the focused memory config tests.
- [ ] Commit as `fix(memory): hide snapshot internals from prompts` after staged change detection.

## Task 3: Split mutation output into trusted receipt and model coordinates

**Files:**
- Modify: `crates/codegen/nofy-tools/src/types/output.rs`
- Modify: `crates/codegen/nofy-tools/src/implementations/memory/write_tool.rs`
- Test: `crates/codegen/nofy-tools/src/implementations/memory/tests.rs`

- [ ] Add failing tests for remember/revise/forget/undo outputs: public receipt is concise Chinese UX text; opaque target/hash/undo fields remain available to the model/tool loop; public serialization never contains file paths.
- [ ] Add a typed `MemoryWriteOutput` variant carrying `public_receipt`, mutation kind, safe scope/summary, and private model coordinates.
- [ ] Implement `ToolOutput::model_output()` so the inference loop receives coordinates required for revise/forget/undo without forcing them into the user receipt.
- [ ] Return the typed variant from `MemoryWriteImpl::run` only after the service future succeeds. Use `已记住到“{area}”：{summary}。撤销` for remember; never emit optimistic success on errors.
- [ ] Run `cargo test -p nofy-tools memory --lib`.
- [ ] Commit as `feat(memory): separate receipts from mutation coordinates` after staged change detection.

## Task 4: Add trusted turn-level memory session updates

**Files:**
- Modify: `crates/codegen/nofy-shell/src/extensions/notification.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/turn.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/tool_calls.rs`
- Modify: `crates/codegen/nofy-shell/src/session/acp_session_impl/updates.rs`
- Test: `crates/codegen/nofy-shell/src/extensions/notification.rs`
- Test: `crates/codegen/nofy-shell/src/session/acp_session_tests/memory_config_tests.rs`

- [ ] Add serialization tests for `MemoryReferenceUsed { references }` and `MemoryWriteReceipt { ... }` updates, ensuring safe fields only.
- [ ] Make first-turn snapshot preparation return both formatted context and the exact safe references injected for that query.
- [ ] Store references only for the active turn, clear them on retry/cancellation/new prompt, and emit `MemoryReferenceUsed` after response completion only when the list is non-empty.
- [ ] Detect successful typed `MemoryWriteOutput` in the tool completion path and queue `MemoryWriteReceipt`; emit it after assistant body completion so ordering is deterministic.
- [ ] Do not emit either update in subagent sessions.
- [ ] Run `cargo test -p nofy-shell memory --lib`.
- [ ] Commit as `feat(memory): emit trusted product receipts and references` after staged change detection.

## Task 5: Render receipts and references in the Rust pager

**Files:**
- Modify: `crates/codegen/nofy-pager/src/app/acp_handler/session_notification.rs`
- Modify: `crates/codegen/nofy-pager/src/app/session_event.rs`
- Modify: `crates/codegen/nofy-pager/src/views/conversation.rs`
- Test: adjacent pager unit tests in the same modules

- [ ] Add failing reducer/render tests proving reference and receipt rows appear after assistant content, collapse duplicate references, and omit internal IDs.
- [ ] Render `基于记忆：{area} · {summary}` as a low-emphasis expandable session event.
- [ ] Render `已记住到“{area}”：{summary}。撤销` as a durable-write receipt and wire the existing undo action through the opaque update payload without displaying it.
- [ ] Ignore automatic capture/dream updates in normal conversation chrome.
- [ ] Run `cargo test -p nofy-pager session_notification` and relevant conversation tests.
- [ ] Commit as `feat(pager): render quiet memory provenance` after staged change detection.

## Task 6: Extend the ACP test client to observe trusted updates

**Files:**
- Modify: `crates/codegen/nofy-test-support/src/acp_client.rs`
- Test: `crates/codegen/nofy-test-support/src/acp_client.rs`

- [ ] Add a failing test showing custom Nofy session updates can be captured without weakening existing message-text assertions.
- [ ] Decode and retain safe memory reference/receipt updates in `TestAcpClient` with typed accessors.
- [ ] Keep unknown extension updates forward-compatible and non-fatal.
- [ ] Run `cargo test -p nofy-test-support --lib`.
- [ ] Commit as `test(memory): capture trusted ACP memory updates` after staged change detection.

## Task 7: Add real-binary memory product E2E

**Files:**
- Create: `crates/codegen/nofy-shell/tests/memory_product_e2e.rs`
- Modify: `crates/codegen/nofy-shell/Cargo.toml` only if an explicit test target is required
- Delete: `crates/codegen/nofy-shell/tests/memory_integration/run_tests.py`
- Delete: obsolete files under `crates/codegen/nofy-shell/tests/memory_integration/` after equivalent scenarios are accounted for

- [ ] Build a fixture around `TestSandbox`, `MockInferenceServer`, and `NofyStdioClient::spawn_with_home`; require `NOFY_BINARY` and fail clearly when the release gate forgets it.
- [ ] Implement E1/E2: explicit remember, receipt ordering, immediate next-turn injection, process restart recall, and a quiet irrelevant turn.
- [ ] Implement E3/E4: project isolation/worktree sharing and correction precedence across restart.
- [ ] Implement E5: confirmed forget remains absent after restart and derived-index rebuild.
- [ ] Implement E6/E7: auto-learning gate, subagent tool isolation, failed write without success receipt, secret refusal, and promptware redaction.
- [ ] Delete the stale Grok Python harness only after migrated coverage is present.
- [ ] Run `cargo test -p nofy-shell --test memory_product_e2e -- --ignored --nocapture` with a freshly built `nofy` binary.
- [ ] Commit as `test(memory): close real binary product loop` after staged change detection.

## Task 8: Close release gates and documentation

**Files:**
- Modify: `docs/architecture/unified-memory-validation.md`
- Modify: `scripts/check-unified-memory.sh` if needed to reject reintroduced legacy harness names

- [ ] Document the single canonical product E2E command and the operational definition of “memory participated”.
- [ ] Add a guard against `xai-grok-*`, `.grok`, `GROK_MEMORY`, or a second memory E2E entry under active source paths.
- [ ] Run `cargo fmt --all -- --check`.
- [ ] Run `cargo check --workspace --all-targets`.
- [ ] Run `cargo test -p nofy-memory --no-fail-fast`.
- [ ] Run `cargo test -p nofy-shell memory --lib`.
- [ ] Run `cargo test -p nofy-tools memory --lib`.
- [ ] Run `cargo test -p nofy-test-support --lib`.
- [ ] Run `cargo test -p nofy-pager session_notification` and relevant render tests.
- [ ] Run `scripts/check-unified-memory.sh`.
- [ ] Run the ignored real-binary E2E suite with `NOFY_BINARY` set.
- [ ] Run `gitnexus_detect_changes(scope: all)` and inspect every affected process before the final commit.
- [ ] Commit as `docs(memory): define product memory release gate`, then push `二次开发分支` only when every gate is green.
