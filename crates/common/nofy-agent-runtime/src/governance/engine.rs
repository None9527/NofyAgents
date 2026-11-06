use super::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub(super) struct Operation {
    pub request: BudgetRequest,
    pub receipt: Option<BudgetReceipt>,
    /// Older records predate the explicit claim protocol, so pending old
    /// reservations must conservatively be treated as already dispatched.
    #[serde(default = "legacy_dispatched")]
    pub dispatched: bool,
}
fn legacy_dispatched() -> bool {
    true
}
pub(super) struct Transition {
    pub summary: BudgetSummary,
    pub operation: Option<Operation>,
    pub decision: Option<BudgetDecision>,
    pub event: Option<BudgetEvent>,
}
impl BudgetCost {
    fn fields(self) -> [u64; 6] {
        [
            self.steps,
            self.model_calls,
            self.tool_calls,
            self.child_calls,
            self.input_tokens,
            self.output_tokens,
        ]
    }
    fn from_fields(fields: [u64; 6]) -> Self {
        Self {
            steps: fields[0],
            model_calls: fields[1],
            tool_calls: fields[2],
            child_calls: fields[3],
            input_tokens: fields[4],
            output_tokens: fields[5],
        }
    }
    fn add(self, other: Self) -> Result<Self, Error> {
        let mut values = [0; 6];
        for (i, (left, right)) in self.fields().into_iter().zip(other.fields()).enumerate() {
            values[i] = left
                .checked_add(right)
                .ok_or_else(|| invalid("budget arithmetic overflow"))?;
        }
        Ok(Self::from_fields(values))
    }
    fn sub(self, other: Self) -> Result<Self, Error> {
        let mut values = [0; 6];
        for (i, (left, right)) in self.fields().into_iter().zip(other.fields()).enumerate() {
            values[i] = left
                .checked_sub(right)
                .ok_or_else(|| invalid("budget reservation underflow"))?;
        }
        Ok(Self::from_fields(values))
    }
    fn within(self, other: Self) -> bool {
        self.fields()
            .into_iter()
            .zip(other.fields())
            .all(|(left, right)| left <= right)
    }
    fn saturating_add(self, other: Self) -> Self {
        let mut values = [0; 6];
        for (i, (left, right)) in self.fields().into_iter().zip(other.fields()).enumerate() {
            values[i] = left.saturating_add(right);
        }
        Self::from_fields(values)
    }
}
fn denial(reason: &str, dimension: &str) -> BudgetDenial {
    BudgetDenial {
        reason: reason.into(),
        dimension: dimension.into(),
    }
}
fn exceeds(limits: &BudgetLimits, cost: BudgetCost) -> Result<Option<BudgetDenial>, Error> {
    for ((used, maximum), name) in cost
        .fields()
        .into_iter()
        .zip([
            limits.max_steps,
            limits.max_model_calls,
            limits.max_tool_calls,
            limits.max_child_calls,
            limits.max_input_tokens,
            limits.max_output_tokens,
        ])
        .zip([
            "steps",
            "model_calls",
            "tool_calls",
            "child_calls",
            "input_tokens",
            "output_tokens",
        ])
    {
        if maximum.is_some_and(|maximum| used > maximum) {
            return Ok(Some(denial("limit_exceeded", name)));
        }
    }
    if limits.max_total_tokens.is_none() {
        return Ok(None);
    }
    let total = cost
        .input_tokens
        .checked_add(cost.output_tokens)
        .ok_or_else(|| invalid("token total overflow"))?;
    Ok(limits
        .max_total_tokens
        .filter(|limit| total > *limit)
        .map(|_| denial("limit_exceeded", "total_tokens")))
}
pub(super) fn enroll(
    spec: &BudgetSpec,
    old: Option<BudgetSummary>,
    now: u64,
) -> Result<BudgetSummary, Error> {
    if spec.scope.root_run_id.trim().is_empty()
        || spec.scope.identity.trim().is_empty()
        || spec.scope.root_run_id.len() > 16384
        || spec.scope.identity.len() > 65536
    {
        return Err(invalid("budget scope is required and must be bounded"));
    }
    let mut summary = match old {
        Some(summary) if summary.version != 1 || summary.spec != *spec => {
            return Err(invalid("budget identity/limits changed during recovery"));
        }
        Some(summary) => summary,
        None => BudgetSummary {
            version: 1,
            spec: spec.clone(),
            used: BudgetCost::default(),
            reserved: BudgetCost::default(),
            active_operations: 0,
            active_children: 0,
            operation_count: 0,
            created_at_ms: now,
            deadline_ms: spec
                .limits
                .max_duration_ms
                .map(|duration| {
                    now.checked_add(duration)
                        .ok_or_else(|| invalid("budget deadline overflow"))
                })
                .transpose()?,
            last_seen_ms: now,
            blocked: None,
        },
    };
    summary.last_seen_ms = now.max(summary.last_seen_ms);
    Ok(summary)
}
pub(super) fn reserve(
    spec: &BudgetSpec,
    old: Option<BudgetSummary>,
    operation: Option<Operation>,
    request: &BudgetRequest,
    now: u64,
) -> Result<Transition, Error> {
    if request.unbounded_tokens
        && (spec.limits.max_input_tokens.is_some()
            || spec.limits.max_output_tokens.is_some()
            || spec.limits.max_total_tokens.is_some())
    {
        return Err(invalid(
            "unbounded model usage cannot enter a token-limited scope",
        ));
    }
    if spec.scope.root_run_id.trim().is_empty()
        || spec.scope.identity.trim().is_empty()
        || spec.scope.root_run_id.len() > 16384
        || spec.scope.identity.len() > 65536
        || request.operation_id.trim().is_empty()
        || request.operation_id.len() > 16384
        || request.fingerprint.trim().is_empty()
        || request.fingerprint.len() > 65536
        || request.reserve == BudgetCost::default()
    {
        return Err(invalid(
            "budget scopes, operation identity and a positive reservation are required",
        ));
    }
    let mut summary = enroll(spec, old, now)?;
    if let Some(operation) = operation {
        if !super::fingerprint::same_child_request(&operation.request, request) {
            return Err(invalid(
                "budget operation identity reused with changed request",
            ));
        }
        let decision = operation.receipt.clone().map_or_else(
            || {
                BudgetDecision::Uncertain(BudgetReservation {
                    scope: spec.scope.clone(),
                    request: operation.request.clone(),
                })
            },
            BudgetDecision::Replay,
        );
        return Ok(Transition {
            summary,
            operation: None,
            decision: Some(decision),
            event: None,
        });
    }
    let now = now.max(summary.last_seen_ms);
    summary.last_seen_ms = now;
    // Projection arithmetic runs only after every cheap denial, so an already
    // blocked scope reports its recorded denial instead of an overflow error.
    let denied = if let Some(blocked) = &summary.blocked {
        Some(blocked.clone())
    } else if summary.deadline_ms.is_some_and(|deadline| now >= deadline) {
        Some(denial("deadline_exceeded", "duration"))
    } else if spec
        .limits
        .max_depth
        .is_some_and(|maximum| request.depth > maximum)
    {
        Some(denial("limit_exceeded", "depth"))
    } else if summary.operation_count >= 8192 {
        Some(denial("ledger_capacity", "operations"))
    } else if request.activity == BudgetActivity::Operation
        && spec
            .limits
            .max_concurrent_operations
            .is_some_and(|maximum| summary.active_operations >= maximum)
    {
        Some(denial("limit_exceeded", "concurrent_operations"))
    } else if request.activity == BudgetActivity::Child
        && spec
            .limits
            .max_active_children
            .is_some_and(|maximum| summary.active_children >= maximum)
    {
        Some(denial("limit_exceeded", "active_children"))
    } else {
        let projected = summary.used.add(summary.reserved)?.add(request.reserve)?;
        exceeds(&spec.limits, projected)?
    };
    if let Some(denied) = denied {
        return Ok(Transition {
            summary,
            operation: None,
            decision: Some(BudgetDecision::Denied(denied.clone())),
            event: Some(BudgetEvent {
                cursor: 0,
                time_ms: now,
                operation_id: request.operation_id.clone(),
                kind: "denied".into(),
                cost: request.reserve,
                denial: Some(denied),
            }),
        });
    }
    summary.reserved = summary.reserved.add(request.reserve)?;
    summary.operation_count += 1;
    match request.activity {
        BudgetActivity::Operation => {
            summary.active_operations = summary
                .active_operations
                .checked_add(1)
                .ok_or_else(|| invalid("active operation overflow"))?
        }
        BudgetActivity::Child => {
            summary.active_children = summary
                .active_children
                .checked_add(1)
                .ok_or_else(|| invalid("active child overflow"))?
        }
        BudgetActivity::None => {}
    }
    Ok(Transition {
        summary,
        operation: Some(Operation {
            request: request.clone(),
            receipt: None,
            dispatched: false,
        }),
        decision: Some(BudgetDecision::Granted(BudgetReservation {
            scope: spec.scope.clone(),
            request: request.clone(),
        })),
        event: Some(BudgetEvent {
            cursor: 0,
            time_ms: now,
            operation_id: request.operation_id.clone(),
            kind: "reserved".into(),
            cost: request.reserve,
            denial: None,
        }),
    })
}
pub(super) fn claim(
    mut summary: BudgetSummary,
    mut operation: Operation,
    reservation: &BudgetReservation,
    now: u64,
) -> Result<(Transition, BudgetClaim), Error> {
    if summary.version != 1
        || summary.spec.scope != reservation.scope
        || operation.request != reservation.request
    {
        return Err(invalid(
            "budget dispatch claim does not match its reservation",
        ));
    }
    let mut event = None;
    let decision = if let Some(receipt) = operation.receipt.clone() {
        BudgetClaim::Replay(receipt)
    } else if operation.dispatched {
        BudgetClaim::Uncertain
    } else {
        let now = now.max(summary.last_seen_ms);
        summary.last_seen_ms = now;
        if let Some(blocked) = &summary.blocked {
            BudgetClaim::Denied(blocked.clone())
        } else if summary.deadline_ms.is_some_and(|deadline| now >= deadline) {
            BudgetClaim::Denied(denial("deadline_exceeded", "duration"))
        } else if let Some(denied) =
            exceeds(&summary.spec.limits, summary.used.add(summary.reserved)?)?
        {
            BudgetClaim::Denied(denied)
        } else if summary
            .spec
            .limits
            .max_depth
            .is_some_and(|limit| operation.request.depth > limit)
        {
            BudgetClaim::Denied(denial("limit_exceeded", "depth"))
        } else if operation.request.activity == BudgetActivity::Operation
            && summary
                .spec
                .limits
                .max_concurrent_operations
                .is_some_and(|limit| summary.active_operations > limit)
        {
            BudgetClaim::Denied(denial("limit_exceeded", "concurrent_operations"))
        } else if operation.request.activity == BudgetActivity::Child
            && summary
                .spec
                .limits
                .max_active_children
                .is_some_and(|limit| summary.active_children > limit)
        {
            BudgetClaim::Denied(denial("limit_exceeded", "active_children"))
        } else {
            operation.dispatched = true;
            event = Some(BudgetEvent {
                cursor: 0,
                time_ms: now,
                operation_id: reservation.request.operation_id.clone(),
                kind: "dispatch_claimed".into(),
                cost: BudgetCost::default(),
                denial: None,
            });
            BudgetClaim::Dispatch
        }
    };
    Ok((
        Transition {
            summary,
            operation: Some(operation),
            decision: None,
            event,
        },
        decision,
    ))
}
#[cfg(feature = "sqlite")]
pub(super) fn amend(
    mut summary: BudgetSummary,
    before: &BudgetSpec,
    limits: &BudgetLimits,
    command_id: &str,
    now: u64,
) -> Result<Transition, Error> {
    if summary.version != 1 || summary.spec != *before {
        return Err(invalid("live budget specification changed"));
    }
    summary.deadline_ms = limits
        .max_duration_ms
        .map(|duration| {
            summary
                .created_at_ms
                .checked_add(duration)
                .ok_or_else(|| invalid("budget deadline overflow"))
        })
        .transpose()?;
    summary.spec.limits = limits.clone();
    // A new cap may resolve a quota denial, while a violated usage bound is
    // an integrity fact that increasing the allowance must never clear.
    if summary
        .blocked
        .as_ref()
        .is_some_and(|denied| denied.reason == "limit_exceeded")
    {
        summary.blocked = exceeds(limits, summary.used.add(summary.reserved)?)?;
    }
    summary.last_seen_ms = now.max(summary.last_seen_ms);
    let time_ms = summary.last_seen_ms;
    Ok(Transition {
        summary,
        operation: None,
        decision: None,
        event: Some(BudgetEvent {
            cursor: 0,
            time_ms,
            operation_id: command_id.into(),
            kind: "limits_amended".into(),
            cost: BudgetCost::default(),
            denial: None,
        }),
    })
}
pub(super) fn settle(
    mut summary: BudgetSummary,
    mut operation: Operation,
    reservation: &BudgetReservation,
    receipt: BudgetReceipt,
    now: u64,
) -> Result<Transition, Error> {
    if summary.version != 1
        || summary.spec.scope != reservation.scope
        || operation.request != reservation.request
    {
        return Err(invalid("budget settlement does not match its reservation"));
    }
    if let Some(existing) = &operation.receipt {
        if existing != &receipt {
            return Err(invalid("budget receipt cannot be changed after settlement"));
        }
        return Ok(Transition {
            summary,
            operation: None,
            decision: None,
            event: None,
        });
    }
    if !operation.dispatched && receipt.used != BudgetCost::default() {
        return Err(invalid("nonzero usage requires a dispatch claim"));
    }
    if serde_json::to_vec(&receipt.value)
        .map_err(|e| invalid(e.to_string()))?
        .len()
        > 16 * 1024 * 1024
    {
        return Err(invalid("budget receipt exceeds 16 MiB"));
    }
    summary.reserved = summary.reserved.sub(reservation.request.reserve)?;
    summary.used = summary.used.saturating_add(receipt.used);
    let now = now.max(summary.last_seen_ms);
    summary.last_seen_ms = now;
    match reservation.request.activity {
        BudgetActivity::Operation => {
            summary.active_operations = summary
                .active_operations
                .checked_sub(1)
                .ok_or_else(|| invalid("active operation underflow"))?
        }
        BudgetActivity::Child => {
            summary.active_children = summary
                .active_children
                .checked_sub(1)
                .ok_or_else(|| invalid("active child underflow"))?
        }
        BudgetActivity::None => {}
    }
    let mut bounded_usage = receipt.used;
    if reservation.request.unbounded_tokens {
        bounded_usage.input_tokens = 0;
        bounded_usage.output_tokens = 0;
    }
    if !bounded_usage.within(reservation.request.reserve) {
        summary.blocked = Some(denial("actual_usage_exceeded_reservation", "usage_bound"));
    } else if summary.blocked.is_none()
        && let Some(exceeded) = exceeds(&summary.spec.limits, summary.used.add(summary.reserved)?)?
    {
        summary.blocked = Some(exceeded);
    }
    let cost = receipt.used;
    operation.receipt = Some(receipt);
    let denied = summary.blocked.clone();
    Ok(Transition {
        summary,
        operation: Some(operation),
        decision: None,
        event: Some(BudgetEvent {
            cursor: 0,
            time_ms: now,
            operation_id: reservation.request.operation_id.clone(),
            kind: "settled".into(),
            cost,
            denial: denied,
        }),
    })
}
pub(super) fn invalid(message: impl Into<String>) -> Error {
    Error::Checkpoint(message.into())
}
pub(super) fn page_limit(limit: usize) -> Result<(), Error> {
    if (1..=1000).contains(&limit) {
        Ok(())
    } else {
        Err(invalid("budget event limit must be 1..=1000"))
    }
}

#[cfg(test)]
mod reserve_order_tests {
    use super::*;

    fn spec() -> BudgetSpec {
        BudgetSpec {
            scope: BudgetScope {
                root_run_id: "root".into(),
                identity: "scope".into(),
            },
            limits: BudgetLimits {
                max_tool_calls: Some(10),
                ..Default::default()
            },
        }
    }
    fn request() -> BudgetRequest {
        BudgetRequest {
            operation_id: "op".into(),
            fingerprint: "fp".into(),
            reserve: BudgetCost {
                tool_calls: 1,
                ..Default::default()
            },
            depth: 0,
            activity: BudgetActivity::Operation,
            unbounded_tokens: false,
        }
    }

    #[test]
    fn blocked_scope_with_saturated_usage_denies_instead_of_overflowing() {
        let spec = spec();
        let mut summary = enroll(&spec, None, 0).unwrap();
        summary.used.tool_calls = u64::MAX;
        summary.reserved.tool_calls = 1;
        summary.blocked = Some(denial("actual_usage_exceeded_reservation", "usage_bound"));
        let transition = reserve(&spec, Some(summary), None, &request(), 1).unwrap();
        match transition.decision {
            Some(BudgetDecision::Denied(denied)) => {
                assert_eq!(denied.reason, "actual_usage_exceeded_reservation")
            }
            other => panic!("expected recorded denial, got {other:?}"),
        }
    }

    #[test]
    fn unblocked_projection_overflow_is_still_an_error() {
        let spec = spec();
        let mut summary = enroll(&spec, None, 0).unwrap();
        summary.used.tool_calls = u64::MAX;
        summary.reserved.tool_calls = 1;
        assert!(reserve(&spec, Some(summary), None, &request(), 1).is_err());
    }
}
