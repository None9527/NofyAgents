# Web and desktop client protocol

The browser and a future desktop shell share the same server-authoritative HTTP/SSE boundary. The first implementation is web-only. WebSocket and ACP transports are not implemented or advertised. A transport adapter may be added later without giving UI components ownership of runtime state or command execution.

## Discovery and authentication

Read `GET /api/v1/protocol` after authenticating. The version is `nofy.client/v1`; its source contract is `crates/common/nofy-agent-client/contracts/http-client.json`. `GET /api/v1/access` provides the current caller scopes. Discovery requires `read`, and each mutation retains its existing scope and runtime checks. A feature being advertised is not permission to invoke it.

Use a fetch-based SSE reader with `Authorization: Bearer …`, `Accept: text/event-stream`, and an AbortController. Do not place access tokens in URLs, log them, or forward them through redirects. Native EventSource cannot supply this authorization header. Deploy the web UI behind a same-origin reverse proxy (or use a local development proxy); this change adds no CORS relaxation and no cookie/token persistence.

## Exact event transport

Existing routes keep their native default encoding. Browser adapters opt in:

- `GET /api/v1/runs/{run_id}/events?encoding=exact&after=0&limit=100`
- `GET /api/v1/runs/{run_id}/stream?encoding=exact&after=0&limit=100`

An event page is `{protocol:"nofy.events/v1",events:[{protocol:"nofy.event/v1",cursor:"9007199254740993",event_json:"..."}],next_cursor:"9007199254740993"}`. An empty page returns the requested `after` as `next_cursor`, not null. Each SSE `runtime` event carries the same exact event object, with the same cursor in its `id` field. The `event_json` text contains the complete native EventEnvelope, including scope and runtime event.

Cursor strings must be canonical decimal integers. The wire representation is u64-safe, while this SQLite event log currently accepts 0 through 9223372036854775807. Never convert a cursor or revision to a JavaScript Number. Compare exact decimal strings with BigInt (or length then lexicographic order); gaps are normal because root-run filtering uses a global event sequence. The limit is 1 through 1000.

Preserve native JSON text unchanged for any future command/replay. Ordinary JSON.parse may be used only for display values that do not need exact integer semantics. Arbitrary business fields are never recursively rewritten to strings. Session native views, turn bindings and request_json already use this same text-carrier convention.

## Reconnect and authoritative snapshots

`Last-Event-ID` takes precedence over `after`. Both are exclusive resume positions. Persist/advance the cursor only after successfully processing a complete SSE frame. On reconnect, reuse the last processed cursor; deduplicate `(run_id,cursor)` because a client can observe an event more than once. Parse SSE framing across chunk boundaries, including multiline data, CRLF, comments and keepalives. Cancel obsolete readers on navigation, sign-out and replacement connections. Unknown future runtime event types should be preserved, not treated as a transport failure.

The stream remains open after a run finishes; an empty page or disconnect is not completion. Read `GET /api/v1/runs/{run_id}` for authoritative execution status, then refresh session snapshots and pending approvals. An `error` SSE event or 401/403 response needs explicit handling; never silently manufacture a successful state. Reconnect reads with bounded backoff, but never automatically retry writes. No HTTP connection owns a running agent.

Hosts advertising `workspace_changes` expose `GET /api/v1/workspace/changes` under the `read` scope. A `workspace` frame carries boolean `sessions` and `runs` invalidation topics. Each connection begins with both topics set, including after reconnect, so the browser can reconcile from authoritative reads. The workspace stream carries no replay cursor. The run stream continues to use its durable event cursor. Both streams wake on writes committed through the resident Host store and its clones.

## Commands and receipts

Generate a stable command/run/input ID once per user intent and keep the original request body. A lost response is **unconfirmed**, not failure and not permission to create another identity. Inspect the original receipt, turn binding or run, then explicitly replay an unchanged request when appropriate. For session commands/turns, managed actions and run submissions, reusing an identity with a changed payload is rejected by the existing kernel. Identity namespaces and lookup paths remain operation-specific; this is not a new universal command ledger.

- Session start: `POST /api/v1/sessions/start`, with `expected_session_revision:null` and a native ManagedRunRequest in `request_json`.
- Session changes: retain the exact observed `expected_session_revision` string. Read the receipt at `/api/v1/sessions/{session_id}/commands/{command_id}`.
- Session turns: `POST /api/v1/sessions/{session_id}/turns` carries `{session_id,expected_session_revision,request_json}`. The native SessionTurnCommand includes the stable command/run IDs and source/binding revisions. Inspect `/api/v1/sessions/{session_id}/turns/{run_id}` to resolve uncertain delivery.
- Mailbox inputs: `GET /api/v1/runs/{root_run_id}/inputs/{input_id}?run_id={recipient_run_id}&thread_id={thread_id}&agent={agent}` requires `read` and returns the native MailDelivery with `Cache-Control: no-store`. Encode every path/query value and use the exact original address. The URL root is authoritative; no root override or payload query is accepted. Receipt lookup has no request-body schema. A missing input, root without an execution record, or mismatched root/child/thread/agent returns the same 404. Historical receipts stay readable after newer turns. Reads do not submit, claim, acknowledge, wake or resend inputs. Compare the returned envelope with the saved request; 404 is not permission to auto-resend or change identity.
- Run starts: inspect `/api/v1/runs/{run_id}`. Managed actions: inspect `/api/v1/actions/{command_id}`.
- Approval decisions: present the exact server-issued request and post it unchanged with the user's decision. Start with scope `once`; never infer a broader grant. A decision does not itself resume a paused run: submit an explicit managed action `{command_id,run_id,command:{kind:"resume"}}` and inspect its separate receipt.

Session receipts have `prepared`, `applied` or `rejected` phases. An applied receipt proves admission, not model/tool completion. Preserve `session_revision`, `policy_revision`, source revision and binding revision as separate concepts. A stale revision or conflict requires reading the current state, not silently substituting a newer revision and resending the old intent.

## Verification

Focused regression: `cargo test -p nofy-agent-host --lib api::client_protocol --locked` and `cargo test -p nofy-agent-host --test http client_protocol --locked`. The HTTP fixture covers exact values above 2^53, unchanged native output, page boundaries, empty pages, SSE header precedence and reconnect, authentication, scope denial, stable session receipt replay and changed-payload rejection. It uses a temporary database and never changes production runtime state.

Receipt regression: `cargo test -p nofy-agent-host --test http input_receipt_http --locked`. This fixture uses a real localhost HTTP server and temporary database, covers root/child receipts, exact encoded identities, 401/403/404, changed-payload rejection, repeated reads without new mail/events, and historical lookup after thread ownership changes. It does not run a platform isolation probe.
