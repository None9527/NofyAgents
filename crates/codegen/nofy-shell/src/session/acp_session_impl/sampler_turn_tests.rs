#[cfg(test)]
mod subagent_sampling_gate_tests {
    use super::super::super::support::create_test_actor;
    use super::super::acquire_subagent_sampling_permit;
    use std::sync::Arc;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::time::Duration;
    use tokio::sync::Semaphore;

    #[derive(Default)]
    struct ConcurrencyProbe {
        in_flight: AtomicUsize,
        max_in_flight: AtomicUsize,
    }

    impl ConcurrencyProbe {
        fn enter(&self) {
            let now = self.in_flight.fetch_add(1, Ordering::SeqCst) + 1;
            self.max_in_flight.fetch_max(now, Ordering::SeqCst);
        }
        fn leave(&self) {
            self.in_flight.fetch_sub(1, Ordering::SeqCst);
        }
    }

    #[tokio::test]
    async fn subagent_submits_never_exceed_cap_and_excess_queues() {
        const CAP: usize = 3;
        const TURNS: usize = 12;
        let semaphore = Arc::new(Semaphore::new(CAP));
        let probe = Arc::new(ConcurrencyProbe::default());
        let ran = Arc::new(AtomicUsize::new(0));

        let mut handles = Vec::new();
        for _ in 0..TURNS {
            let gate = Some(semaphore.clone());
            let probe = probe.clone();
            let ran = ran.clone();
            handles.push(tokio::spawn(async move {
                let permit = acquire_subagent_sampling_permit(&gate).await;
                assert!(permit.is_some(), "a subagent turn must receive a permit");
                probe.enter();
                tokio::time::sleep(Duration::from_millis(20)).await;
                probe.leave();
                ran.fetch_add(1, Ordering::SeqCst);
            }));
        }
        for h in handles {
            h.await.unwrap();
        }

        assert_eq!(
            ran.load(Ordering::SeqCst),
            TURNS,
            "every queued turn ran (queued, not errored)"
        );
        assert!(
            probe.max_in_flight.load(Ordering::SeqCst) <= CAP,
            "in-flight subagent submits exceeded the cap: {} > {CAP}",
            probe.max_in_flight.load(Ordering::SeqCst),
        );
    }

    #[tokio::test]
    async fn cancelled_waiter_releases_without_deadlock() {
        let semaphore = Arc::new(Semaphore::new(1));
        let gate = Some(semaphore.clone());
        let held = acquire_subagent_sampling_permit(&gate).await;
        assert!(held.is_some());

        let waiter = tokio::spawn({
            let gate = gate.clone();
            async move {
                let _permit = acquire_subagent_sampling_permit(&gate).await;
                std::future::pending::<()>().await;
            }
        });
        tokio::time::sleep(Duration::from_millis(30)).await;
        assert_eq!(
            semaphore.available_permits(),
            0,
            "slot stays held while the second turn queues"
        );
        waiter.abort();
        let _ = waiter.await;

        drop(held);
        let next = tokio::time::timeout(
            Duration::from_millis(200),
            acquire_subagent_sampling_permit(&gate),
        )
        .await
        .expect("a permit must be free once the held one is released");
        assert!(next.is_some(), "the cancelled waiter did not leak the slot");
    }

    #[tokio::test(flavor = "current_thread")]
    async fn submit_holds_permit_for_subagent_not_main() {
        let local = tokio::task::LocalSet::new();
        local
            .run_until(async {
                let saturated = Arc::new(Semaphore::new(1));
                let _held = saturated.clone().acquire_owned().await.unwrap();

                let (gw_tx, _gw_rx) = tokio::sync::mpsc::unbounded_channel();
                let (p_tx, _p_rx) = tokio::sync::mpsc::unbounded_channel();
                let mut subagent = create_test_actor(0, 200_000, 80, gw_tx, p_tx).await;
                subagent.sampling_gate = Some(saturated.clone());
                let subagent = Arc::new(subagent);

                let queued = tokio::time::timeout(
                    Duration::from_millis(150),
                    subagent.submit_turn_request(Default::default()),
                )
                .await;
                assert!(
                    queued.is_err(),
                    "a subagent submit must queue behind the drained gate, never reaching the sampler"
                );

                let (gw_tx, _gw_rx) = tokio::sync::mpsc::unbounded_channel();
                let (p_tx, _p_rx) = tokio::sync::mpsc::unbounded_channel();
                let main = create_test_actor(0, 200_000, 80, gw_tx, p_tx).await;
                assert!(main.sampling_gate.is_none());
                let main = Arc::new(main);

                let ran = tokio::time::timeout(
                    Duration::from_millis(150),
                    main.submit_turn_request(Default::default()),
                )
                .await;
                assert!(
                    ran.is_ok(),
                    "the main session must reach the sampler even while the gate is drained"
                );
            })
            .await;
    }
}
#[test]
fn main_turn_partial_length_policy_requires_explicit_opt_in() {
    use nofy_sampling_types::{ConversationRequest, LengthPolicy};
    for (opt_in, expected) in [
        (None, LengthPolicy::CompleteToolCalls),
        (Some(false), LengthPolicy::CompleteToolCalls),
        (Some(true), LengthPolicy::CompletePartial),
    ] {
        let mut request = ConversationRequest::default();
        request.length_policy = super::main_turn_length_policy(opt_in);
        assert_eq!(request.length_policy, expected);
    }
    // The environment-derived policy is applied only at main-turn submission.
    assert_eq!(
        ConversationRequest::default().length_policy,
        LengthPolicy::CompleteToolCalls
    );
}
