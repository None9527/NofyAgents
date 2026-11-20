# Main Agent duplex ownership and ordering contract

Status: first opt-in runtime increment, November 9, 2026. This does not complete
conversation-owned background jobs or cross-invocation task lifetime.

## Ownership and visible completion

- One existing Agent driver owns model execution for each invocation. There is
  no second model loop. Each child remains owned by its invocation's task owner.
- `settings.input_delivery.duplex=true` keeps a completed model turn receptive
  while its owned children run. It does not return early from `Agent::invoke`.
- `ModelCompleted` is the existing model-output event, published after the model
  result checkpoint. It is not a claim that all work or final stop hooks finished.
  Consumers can show a reply while continuing to consume run events. `Terminated`
  and `Finished` retain their existing whole-invocation meaning.
- The supervisor retains the original root lease and fence until all owned child
  futures have stopped. No child may write after lease release. Losing the host
  stops execution; recovery reacquires the same durable run rather than creating
  another root identity.
- Default settings retain ordinary join behavior. Duplex does not silently apply
  to descendants. The main-agent template enables it only on its main Agent.

## Authority and cancellation

- Children inherit the root policy floor, shared budgets and cancellation. Their
  declared tool catalog can restrict authority further but cannot expand it.
- A peer message is data. Its sender is supplied by the runtime; its body cannot
  impersonate a user input, approval decision, control command or system prompt.
  Automatic delivery is framed and marked synthetic, outside raw user capture.
- Only incoming messages addressed to the receiving run or `*` are eligible.
  Own messages are excluded, preventing self-echo. A board read does not consume
  another agent's receipts and does not suppress automatic delivery.
- Child pause, checkpoint uncertainty or exhausted budget remains fail-closed.
  Cancel stops the owned tree through the existing token and cleanup path.
  The global task/message/step/budget limits remain in force across extra replies.

## Ordering and safe points

- Existing host inputs keep their current Interject/FollowUp/NextTurn semantics.
  New data never rewrites an issued model request or unpaired tool call/result.
- Duplex peer reports enter only at a settled completion boundary, after tool
  results and closing hooks. Eligible host input is checked before each idle
  coordination pass. There is no global FIFO order across host and peer queues.
- Peer reports are delivered one at a time in board cursor order. Sending commits
  the board before notifying. Receiving commits the report and its cursor in one
  checkpoint CAS before another model request can begin.
- Observing terminal task receipts precedes the final board scan, so a report
  committed just before child completion cannot be skipped by termination.
- Idle waiting is cancellation-aware and polls the existing host inbox at most
  every 100 ms in the absence of other work. No extra models are sampled merely
  because time passes. Bound model/step limits are not reset by peer reports.

## Recovery guarantees and limits

- Reopen and resume the original durable run. Its child task journal recovers
  unfinished resumable dispatches. Its message board remains durable.
- A report committed with the receiver transcript is not appended twice. A crash
  before that CAS leaves it eligible for delivery. Uncertain model/tool effects
  retain their existing explicit recovery/reconciliation requirements.
- Reports are not transformed into ordinary user approvals or autonomous retries.
- `NextTurn` is still admitted by the existing post-termination handoff. It does
  not become a concurrent foreground invocation while old children run.
- A completed invocation does not leave children detached. True cross-invocation
  background work needs a later conversation-owned supervisor job and explicit
  job authority, cancellation, budget, delivery and recovery contracts.

## Acceptance evidence

Use deterministic runtime/SQLite tests to verify reply-before-child-completion,
peer wakeup, host input while waiting, routing, cancellation and crash cuts. These
checks do not certify a real provider or native OS isolation. Record exact
executed checks and limitations in the implementation report; the full native
release and consumer gates remain unchanged.
