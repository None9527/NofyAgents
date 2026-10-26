# Approval and queue contracts (2026-10-08)

Implementation evidence is current kernel source plus client model tests. Live model-driven approval E2E remains separate acceptance work; these tests do not claim to run actual model tools.

## Plan approval

`nofy-tools/src/implementations/nofy_build/exit_plan_mode/types.rs` defines request `sessionId`, `toolCallId`, `planContent`. The kernel reads the plan file before sending the content. No client `planPath` fallback exists. Missing/blank contents disable approval.

Responses: `{outcome:"approved"}`, `{outcome:"cancelled",feedback?:string}`, `{outcome:"abandoned"}`. Feedback is overall feedback, not invented line comments. Cancelled retains planning for revision; abandoned exits planning. Cards use synchronous submission refs to prevent duplicate clicks.

## MCP elicitation

`nofy-tools/src/mcp_elicitation/types.rs` defines the extension's `mode:"form"` / `"url"`, `serverName`, `message`, `requestedSchema`, `url`, `elicitationId`. Its response is **flat**: `{outcome:"accept",content:{...}}`, `{outcome:"decline"}`, `{outcome:"cancel"}`. Legacy ACP `session/elicitation` has a separate action-wrapped cancellation shape and is not offered an invented accept payload.

Forms support string, number, safe integer, boolean, string enums including `oneOf` titles, enum arrays, defaults, required, min/max length/items/range, email/URI/date/date-time. Unsupported fields block acceptance rather than disappear. Unsafe integers are rejected because JavaScript numbers cannot preserve them. URL mode stays pending for kernel completion; accepting a URL request prematurely is not offered. Values are local component state only, never diagnostics or preferences.

## Permission variations

`nofy-pager/src/app/dispatch/permissions.rs` defines response `_meta.followup_message` for reject-once. MCP `allow-always-mcp` reads supplied option `_meta.tool_name` and `_meta.server_prefix`; response `_meta` is `{kind:"tool",tool_name}` or `{kind:"server",server}`. Bash custom allow pattern uses `_meta:{command_parts:[pattern],is_glob:boolean}` per `nofy-workspace/src/permission/prompter.rs`. Glob semantics require explicit selection; otherwise pattern is literal. Standard response remains `{outcome:{outcome:"selected",optionId}}`. YOLO still goes through the existing parent handler.

## Stop and queue

`nofy-pager/src/app/effects/mod.rs:1118` sends `session/cancel` with `_meta.cancelSubagents`. Kernel defaults to `true`. The one-shot Stop card exposes both choices without inventing a persistent preference.

Queue snapshots contain `id`, `version`, `text`, `kind`, `position`. UI actions use existing queue edit/remove/clear notifications and wait for authoritative `queue_changed`; local removal never counts as success. While editing, a changed version/text or disappeared entry blocks submission and explains the conflict. Parent keys QueueStrip by session identity and captures that identity in callbacks.

## Verification

`node --test test/approval-completion.test.ts` passes four tests covering plan outcomes, unsupported fields, required fields, unsafe integers, enum validation, date validation, flat MCP outcomes, trusted scope metadata, and rejection payloads. GUI approval, URL completion, disconnect cleanup, and multi-client queue races require integrated acceptance evidence.
