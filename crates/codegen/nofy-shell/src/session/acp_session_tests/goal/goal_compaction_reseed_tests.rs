//! Compaction must not drop a live goal (upstream 1.0.33, goal × compaction).
//!
//! Two properties, both native implementations of the same upstream idea:
//! 1. the compacted state context seeds `last_user_query` from the live
//!    objective, so a stale pre-goal prompt cannot be revived as "the task";
//! 2. re-injecting the continuation directive after the history replacement is
//!    *not* a turn end, so it must not drain classifier completions, enforce the
//!    token budget, or count a verify round.

use super::support::*;
use super::*;
use crate::session::helpers::CompactionStateContext;
use crate::session::helpers::compaction_context::CompactionInputs;
use nofy_sampling_types::ConversationItem;
use nofy_sampling_types::conversation::SyntheticReason;
use std::sync::Arc as StdArc;
use tempfile::TempDir;

const DEVICE_TEST_OBJECTIVE: &str =
    "ssh to root@example.test and confirm the meter profile emits no aggregate data";
const STALE_CODE_REVIEW: &str = "please review the PR for config-json-go";

async fn make_goal_actor() -> (StdArc<SessionActor>, TempDir) {
    let tmp = TempDir::new().expect("tempdir");
    let (gateway_tx, _gateway_rx) =
        tokio::sync::mpsc::unbounded_channel::<nofy_acp_lib::AcpClientMessage>();
    let (persistence_tx, _persistence_rx) =
        tokio::sync::mpsc::unbounded_channel::<PersistenceMsg>();
    let mut actor = create_test_actor(0, 256_000, 85, gateway_tx, persistence_tx).await;
    actor.events = crate::session::events::EventTracker::new(tmp.path());
    actor.goal_enabled = true;
    set_goal_harness_for_tests(&actor);
    actor.goal_tracker = Arc::new(parking_lot::Mutex::new(
        crate::session::goal_tracker::GoalTracker::new(tmp.path().to_path_buf()),
    ));
    (StdArc::new(actor), tmp)
}

fn start_device_test_goal(actor: &SessionActor) {
    actor.goal_tracker.lock().create_goal(
        "g-device-test".into(),
        DEVICE_TEST_OBJECTIVE.into(),
        None,
        0,
        "2026-09-18T00:00:00Z".into(),
        None,
    );
}

/// A conversation whose only human prompt predates the goal, i.e. exactly the
/// stale query a compaction must not resurrect as the current task.
fn stale_pre_goal_conversation() -> Vec<ConversationItem> {
    vec![
        ConversationItem::user(format!(
            "<user_info>OS: macos</user_info>\n\n<user_query>\n{STALE_CODE_REVIEW}\n</user_query>"
        )),
        ConversationItem::assistant("Starting the branch code review."),
        ConversationItem::system_reminder(format!(
            "A goal has been set: {DEVICE_TEST_OBJECTIVE}\nStart now."
        )),
    ]
}

fn goal_summary_count(items: &[ConversationItem]) -> usize {
    items
        .iter()
        .filter(|item| {
            matches!(
                item,
                ConversationItem::User(u)
                    if u.synthetic_reason == Some(SyntheticReason::GoalSummary)
            )
        })
        .count()
}

#[tokio::test(flavor = "current_thread")]
async fn compact_seeds_last_user_query_from_active_goal() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let (actor, _tmp) = make_goal_actor().await;
            start_device_test_goal(&actor);
            let conversation = stale_pre_goal_conversation();

            let without_goal =
                CompactionStateContext::build(&conversation, CompactionInputs::default()).await;
            assert_eq!(
                without_goal.last_user_query.as_deref(),
                Some(STALE_CODE_REVIEW),
                "without the objective pin, compact would revive the pre-goal code review"
            );

            let with_goal = CompactionStateContext::build(
                &conversation,
                CompactionInputs {
                    goal_objective: actor.goal_objective_for_compaction(),
                    ..Default::default()
                },
            )
            .await;
            assert_eq!(
                with_goal.last_user_query.as_deref(),
                Some(DEVICE_TEST_OBJECTIVE),
                "a live goal must seed last_user_query from the tracker objective"
            );
        })
        .await;
}

#[tokio::test(flavor = "current_thread")]
async fn compact_seeding_leaves_human_prompt_when_no_goal_is_active() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let (actor, _tmp) = make_goal_actor().await;
            let conversation = stale_pre_goal_conversation();
            assert_eq!(
                actor.goal_objective_for_compaction(),
                None,
                "no live goal means no objective pin"
            );
            let ctx = CompactionStateContext::build(
                &conversation,
                CompactionInputs {
                    goal_objective: actor.goal_objective_for_compaction(),
                    ..Default::default()
                },
            )
            .await;
            assert_eq!(
                ctx.last_user_query.as_deref(),
                Some(STALE_CODE_REVIEW),
                "the human prompt stays the query when no goal is running"
            );
        })
        .await;
}

#[tokio::test(flavor = "current_thread")]
async fn compact_reseed_skips_turn_end_drain_and_round_count() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let (actor, _tmp) = make_goal_actor().await;
            start_device_test_goal(&actor);
            {
                let mut tracker = actor.goal_tracker.lock();
                tracker.snapshot_mut().expect("goal").rounds_since_verify = 4;
            }
            actor.pending_classifier_completions.lock().push_back(
                nofy_tools::implementations::nofy_build::update_goal::UpdateGoalInput {
                    completed: None,
                    message: Some("progress".into()),
                    blocked_reason: None,
                },
            );

            actor.reseed_active_goal_after_compaction().await;

            assert_eq!(
                actor
                    .goal_tracker
                    .lock()
                    .snapshot()
                    .expect("goal")
                    .rounds_since_verify,
                4,
                "a compaction reseed must not count as a worker round"
            );
            assert_eq!(
                actor.pending_classifier_completions.lock().len(),
                1,
                "a compaction reseed must not TurnEnd-drain pending classifier completions"
            );
            let after = actor.chat_state_handle.get_conversation().await;
            assert_eq!(
                goal_summary_count(&after),
                1,
                "compaction injects a continuation directive: {after:?}"
            );

            // A second compaction replaces the directive instead of stacking it:
            // the sentinel-based prune must recognise what the reseed injected.
            actor.reseed_active_goal_after_compaction().await;
            let twice = actor.chat_state_handle.get_conversation().await;
            assert_eq!(
                goal_summary_count(&twice),
                1,
                "the reseeded directive must be prunable by the next one"
            );
        })
        .await;
}
