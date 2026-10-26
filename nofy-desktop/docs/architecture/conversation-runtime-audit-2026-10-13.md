# Conversation runtime audit — 2026-10-13

## Actual incident

The reported Topaz conversation was not simply frozen in the renderer. Kernel telemetry records a turn starting at 09:27:41 UTC, three tool calls (two rejected for missing `command`), then repeated empty model responses. Retry attempts 1–14 exhausted the configured budget of 15. The terminal failure and persisted `turn_completed(stop_reason: error)` arrived at 09:35:14 UTC. No endpoint or credentials are included in this report.

The persisted tool-call inputs themselves contained only `description` for the two failures; the successful call contained both `description` and `command`. Thus the renderer did not lose the command field. Raw HTTP/model-provider output was not captured here, so the exact source of that upstream argument defect is not established.

A sanitized extract preserves all 14 retry notifications, the failure notification and terminal turn event in `docs/fixtures/empty-response-retry-2026-10-13.jsonl`. IDs are replaced; usage details omitted. This is captured wire evidence, not invented retry payloads. GUI tool context surrounding it is explicitly synthetic.

Native cold-history inspection exposed a second, more fundamental defect: replay is not monotonic in event sequence. A hook at 4737 precedes user message 4736; retry records through 4804 precede the aggregated tool result 4789. The old `seq <= lastEventSeq` rule discarded these unseen messages. `docs/fixtures/nonmonotonic-replay-2026-10-13.jsonl` preserves the actual 46-frame order with text and paths sanitized. It contains three user messages, two assistant answers and six aggregated tool calls. The initial packaged UI showed only one turn with no failure footer. This was a failed acceptance, not a successful release check.

## Reference findings

- `ref-desktop/packages/ui/src/ToolCallBlocks/ToolLayout.tsx`: separates automatic opening, completion collapse and user choice; running feedback is label shimmer rather than spinning every tool icon. Expanded contents have a closing transition.
- `ref-desktop/packages/ui/src/ChatErrorBanner.tsx`: errors have a dedicated visible summary, details/copy and recovery actions, using shared controls. They are not raw events hidden in a process disclosure.
- `ref-desktop/packages/ui/src/v4/promptScrollFocusPolicy.ts`: immediate send focuses the latest timeline; enqueue must not hijack history reading.
- Kernel `crates/codegen/nofy-shell/src/session/acp_session_impl/tool_calls.rs`: `SamplingEvent::Retrying` emits `RetryState::Retrying` with attempt, max_retries and reason.
- Kernel `crates/codegen/nofy-shell/src/extensions/notification.rs`: retrying, exhausted and failed are separate protocol variants.

These are behavior references, not claims that our frontend shares ZCode's implementation.

## Findings and implementation

| Finding | Resolution |
| --- | --- |
| Cold replay drops unseen messages below a maximum sequence | Exact membership in immutable compressed sequence ranges; maximum retained for diagnostics only; reset clears membership |
| Aggregated replay `tool_call` loses output and error details | Preserve content, locations, tool kind, diff preview and raw output on the initial tool record as well as updates |
| `retry_state` missing from the normalizer whitelist and projection | Accept the actual persisted/live event, keep typed feedback on its turn, update one indicator rather than append 14 rows |
| RPC rejection idles session but leaves turn and thought open | Shared terminal transition closes turn and streaming blocks; unsettled tools become interrupted, never falsely successful |
| Model error disappears when process is collapsed | Dedicated turn feedback outside the disclosure, with original details, copy and edit-original-message action |
| Recovered response still appears to be retrying | First text/thought/tool/argument stream clears retry feedback; success/cancel clears it; terminal error retains it |
| Completion auto-expands every failed tool and failed history | Running command/edit can open, completion returns to summary; failures stay visible in the summary; manual choice wins |
| Waiting between tool completion and next model output has no useful current status | Continuous footer for model wait, tool work, confirmation, retry, stopping and terminal failure; reduced motion respected |
| Kernel starts queued work after previous turn becomes idle | Authoritative user-start notification restores running state |
| Immediate send from history does not focus latest | Explicit view focus token only for immediate send; busy submission keeps current reading position |
| Browser layout/disclosure scroll is mistaken for user scroll | Scroll owner distinguishes gestures from geometry updates; resize/stream preserves following or the reading anchor |
| Editing recovery action moves composer upward and leaves a blank pane | Screenshot review found outer `card__conversation.scrollTop = 520`; structural pane now clips rather than scrolls; transcript/dock remain the only scroll owners |
| Replayed turn elapsed time uses replay wall clock | Read captured agent timestamps for turn start/end |

No kernel retry budget, provider configuration or credentials were modified. No automatic retry button resends potentially executed commands: the explicit recovery action restores the original text for editing.

## Ownership

- Protocol lifecycle: `renderer/core/turnLifecycle.ts` and `core/project.ts`.
- Replay deduplication: `renderer/core/eventSequence.ts`; protocol metadata retains `isReplay` and does not rely on monotonic arrival.
- Presentation: `features/conversation/TurnFeedback.tsx`, existing activity cards and Spine.
- Shared controls: existing `Disclosure`, `Btn`, `CopyButton`; styles remain in the owned conversation stylesheet and theme tokens.
- Scroll intent/restoration: existing `ui/useTranscriptScroll.ts`; no second scroll owner added.

GitNexus upstream checks returned LOW for reduce, projectSessionUpdate, projectExtNotification, Spine, SegmentView, BlockView and App. project functions feed projectEvent; Spine/SegmentView affect App and main. New ActivityCard, ExploreActivity, useTranscriptScroll and ConnectedConversation were not found by the index (UNKNOWN); direct imports/callers were checked manually. No HIGH/CRITICAL result and no commit.

Additional replay-fix impacts were LOW: deduped has two direct projection callers; emptySession has three direct callers; readMeta has one normalizer caller. No affected indexed execution processes were reported.

## Validation and limits

The regression suite includes captured retry progression, duplicate replay, terminal event alone, RPC rejection without terminal event, queued rejection preserving the running turn, recovery streaming, cancellation and unfinished tool closure. Isolated Electron scenarios cover actual pointer/keyboard scrolling, failure expansion, feedback visibility, footer animation, editor recovery, fixed composer geometry and a 280px center pane. Existing activity, 10,000-block virtualization and homepage scenarios also run.

The first GUI pass was insufficient: screenshots caught the outer-pane scroll despite a passing inner-scroll assertion. The regression now asserts outer scroll offset zero and composer position. Homepage's old direct `scrollTop=200` setup was replaced with a real wheel gesture, since programmatic layout scroll must no longer change user intent. Waiting-status assertions use the new explicit model-wait wording.

These checks establish renderer behavior and protocol projection. They do not establish that the upstream Gemini endpoint now returns valid arguments or nonempty responses. That issue remains separately identified, not hidden behind green frontend tests.

### Final native acceptance

After repairing replay, the packaged application was reopened against the actual user profile and original incident session. No new prompt or model request was submitted. The DOM and screenshot now show all three user messages, both assistant answers, the final failed turn, and a ready composer. All three commands in the final turn are present; failed-command details can be expanded manually. A second real `session/load` preserves message counts and the single terminal error. No renderer exception was captured; the outer conversation scroll offset stays zero.

Evidence: `output/playwright/native-retry-2026-10-13/report.json`, `state.json`, `failed-history.png`.

Final static/unit checks: typecheck, UI ownership, architecture (217 source files, 1010 imports, 14 pre-existing exceptions), build, 447 unit tests (41 protocol + 406 desktop). Retry Electron acceptance passes six scenarios, including real captured retry notifications and a 280px center column: `output/playwright/retry-2026-10-13T10-46-02.619Z/report.json`. Earlier in the same change set, activity (10), virtualization (11) and homepage (16) passed. Both isolated packaged-app launches passed after the replay fix. Package SHA-256: `c208716fc0194f4f2220f414fbaa261b4f4a945921233cebbd365beefd006672`.

The 11 virtualization scenarios were rerun after the replay repair and passed again: `output/playwright/virtual-2026-10-13T10-49-05.803Z/report.json`. The 10,000-block corpus mounts 22 blocks; history anchors were unchanged during background append and route/session switching. Native acceptance did not attempt to rerun the original tool commands.
