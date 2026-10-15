use super::*;
use crate::actions::ActionRegistry;
use crate::app::agent::{QueueEntryKind, QueuedPrompt, ScheduledTaskInfo};
use crate::app::agent_view::test_fixtures::{
    add_running_bg_task, make_agent, running_subagent_info,
};
use crate::app::agent_view::{AppRenderParams, BannerSlotParams};
use crate::app::bundle::BundleState;
use crate::scrollback::render::ScratchBuffer;
use crate::views::dock::{DockItem, Section};
use crossterm::event::{Event, KeyCode, MouseButton, MouseEvent, MouseEventKind};
use ratatui::buffer::Buffer;

#[test]
fn waiting_control_band_matches_upstream_in_normal_and_compact_modes() {
    for compact in [false, true] {
        let mut agent = make_agent();
        add_running_bg_task(&mut agent);
        agent.session.state = crate::app::agent::AgentState::TurnRunning;
        let mut appearance = agent.scrollback.appearance().clone();
        appearance.prompt.compact = compact;
        // Status alignment must not depend on custom conversation padding.
        appearance.scrollback.layout.block_pad_left = 7;
        agent.scrollback.set_appearance(appearance);
        let buf = draw(&mut agent, 100, 40);
        let rows: Vec<String> = (0..40)
            .map(|y| (0..100).map(|x| buf[(x, y)].symbol()).collect())
            .collect();
        let wait_y = rows
            .iter()
            .position(|line| line.contains("Waiting"))
            .expect("live Waiting feedback");
        let dock = agent.pane_areas.tasks;
        assert_eq!(dock.y as usize, wait_y + 2, "one blank row before Dock");
        assert!(rows[wait_y + 1].trim().is_empty());
        let wait_x = rows[wait_y]
            .chars()
            .position(|c| !c.is_whitespace())
            .unwrap();
        let dock_x = rows[dock.y as usize]
            .chars()
            .position(|c| !c.is_whitespace())
            .unwrap();
        assert_eq!(
            wait_x, dock_x,
            "status and Dock use the same upstream gutter"
        );
        assert_eq!(wait_x as u16, dock.x + crate::views::agent::CONTROL_GUTTER);
        assert_eq!(agent.pane_areas.prompt.x, dock.x);
        let prompt_gap = u16::from(!compact && agent.scrollback.appearance().turn_status.gap);
        assert_eq!(agent.pane_areas.prompt.y, dock.bottom() + prompt_gap);
        let stop = agent.hit_cancel_button.rect.expect("live stop hit target");
        assert_eq!(stop.y as usize, wait_y);
        assert!(!dock.contains(stop.as_position()));
    }
}

#[test]
fn parked_wait_uses_live_status_with_dock_and_restores_idle_cue_when_hidden() {
    let mut agent = make_agent();
    add_running_bg_task(&mut agent);
    agent.session.state = crate::app::agent::AgentState::TurnRunning;
    crate::app::agent_view::test_fixtures::simulate_task_output_wait(&mut agent, "task-1");
    queue(&mut agent);
    let buf = draw(&mut agent, 100, 40);
    let screen: String = buf.content.iter().map(|cell| cell.symbol()).collect();
    // Known task waits use the command subject, not the model's Waiting label.
    let status_y = agent.hit_cancel_button.rect.expect("live wait status").y;
    let status: String = (0..100).map(|x| buf[(x, status_y)].symbol()).collect();
    assert!(status.contains("sleep 5…"), "live task wait: {status}");
    assert!(!screen.contains("queued — Enter to send now"));
    assert!(agent.hit_watching_cue.rect.is_none());
    agent.toggle_dock();
    draw(&mut agent, 100, 40);
    assert!(
        agent.hit_watching_cue.rect.is_some(),
        "hidden Dock restores the idle cue"
    );
}

fn draw(agent: &mut AgentView, width: u16, height: u16) -> Buffer {
    let area = Rect::new(0, 0, width, height);
    let mut buf = Buffer::empty(area);
    agent.draw(
        area,
        &mut buf,
        &ActionRegistry::defaults(),
        &mut ScratchBuffer::new(),
        None,
        false,
        BannerSlotParams::none(),
        &BundleState::default(),
        false,
        false,
        &mut Vec::new(),
        AppRenderParams::default(),
    );
    buf
}

fn key(code: KeyCode) -> KeyEvent {
    KeyEvent::new(code, KeyModifiers::NONE)
}

fn task_agent() -> AgentView {
    let mut agent = make_agent();
    add_running_bg_task(&mut agent);
    agent.session.bg_tasks.get_mut("task-1").unwrap().command = "dock-command".into();
    draw(&mut agent, 100, 40);
    agent.set_active_pane(AgentPane::Tasks, true);
    agent
}

fn select(agent: &mut AgentView, item: DockItem) {
    agent.dock.cursor = agent.dock_items().iter().position(|i| *i == item).unwrap();
    agent.remember_dock_selection();
}

fn queue(agent: &mut AgentView) {
    agent.session.pending_prompts.push_back(QueuedPrompt::plain(
        71,
        "dock queued prompt",
        QueueEntryKind::Prompt,
    ));
    agent.sync_queue_pane();
}

fn workflow() -> crate::views::workflows::WorkflowRunSnapshot {
    crate::views::workflows::WorkflowRunSnapshot {
        run_id: "wf-run".into(),
        name: "research".into(),
        objective: "obj".into(),
        status: "active".into(),
        management_available: true,
        builtin: false,
        phases: Vec::new(),
        current_phase: Some("inspect".into()),
        agents: Vec::new(),
        agent_budget: None,
        agents_used: 0,
        agents_reserved: 0,
        agents_remaining: None,
        agent_usage_incomplete: false,
        active_agents: 0,
        elapsed_ms: 1000,
        received_at: std::time::Instant::now(),
        pause_message: None,
        result_summary: None,
    }
}

fn loop_task() -> ScheduledTaskInfo {
    ScheduledTaskInfo {
        task_id: "loop-1".into(),
        prompt: "check build".into(),
        human_schedule: "every 5m".into(),
        created_at: std::time::Instant::now(),
        next_fire_at: None,
        tag: "loop".into(),
        last_subagent_id: None,
    }
}

#[test]
fn dock_is_below_conversation_and_above_prompt_without_top_duplicate() {
    let mut agent = task_agent();
    let buf = draw(&mut agent, 100, 40);
    let dock = agent.pane_areas.tasks;
    assert!(dock.y >= agent.pane_areas.scrollback.bottom());
    assert!(dock.bottom() <= agent.pane_areas.prompt.y);
    let rows: Vec<String> = (0..40)
        .map(|y| (0..100).map(|x| buf[(x, y)].symbol()).collect::<String>())
        .collect();
    assert_eq!(
        rows.iter().filter(|s| s.contains("dock-command")).count(),
        1
    );
    assert!(
        rows.iter()
            .position(|s| s.contains("dock-command"))
            .unwrap()
            >= dock.y as usize
    );
}

#[test]
fn five_sections_share_budget_and_workflow_child_is_not_duplicated() {
    let mut agent = task_agent();
    agent.workflow_runs.push(workflow());
    agent
        .subagent_sessions
        .insert("child".into(), running_subagent_info("child"));
    let mut wf_child = running_subagent_info("wf-child");
    wf_child.workflow_run_id = Some("wf-run".into());
    agent.subagent_sessions.insert("wf-child".into(), wf_child);
    agent
        .session
        .scheduled_tasks
        .insert("loop-1".into(), loop_task());
    queue(&mut agent);
    draw(&mut agent, 100, 40);
    let items = agent.dock_items();
    for section in [
        Section::Workflows,
        Section::Subagents,
        Section::Tasks,
        Section::Watchers,
        Section::Queued,
    ] {
        assert!(items.contains(&DockItem::Header(section)), "{section:?}");
    }
    assert_eq!(agent.dock_subagent_rows().len(), 1);
    // Upstream's section/queue floors outrank the resting eight-row budget.
    assert!(agent.pane_areas.tasks.height <= 10);
    assert!(agent.pane_areas.queue.area() > 0);
    assert!(
        agent
            .pane_areas
            .tasks
            .contains(agent.pane_areas.queue.as_position())
    );
    assert_eq!(
        agent
            .pane_areas
            .hit_test(agent.pane_areas.queue.x, agent.pane_areas.queue.y),
        Some(ActivePane::Queue)
    );
}

#[test]
fn keyboard_stop_dispatches_original_task_id_and_pending_stop_is_disabled() {
    let mut agent = task_agent();
    select(&mut agent, DockItem::Row(Section::Tasks, 0));
    assert!(matches!(agent.handle_dock_key(&key(KeyCode::Char('x'))),
        InputOutcome::Action(Action::KillBgTask(id)) if id == "task-1"));
    agent
        .session
        .bg_tasks
        .get_mut("task-1")
        .unwrap()
        .pending_kill = true;
    assert!(matches!(
        agent.handle_dock_key(&key(KeyCode::Char('x'))),
        InputOutcome::Unchanged
    ));
}

#[test]
fn selected_task_follows_id_through_insert_and_does_not_kill_replacement() {
    let mut agent = task_agent();
    select(&mut agent, DockItem::Row(Section::Tasks, 0));
    let mut earlier = agent.session.bg_tasks["task-1"].clone();
    earlier.task_id = "earlier".into();
    earlier.start_time -= std::time::Duration::from_secs(60);
    agent.session.bg_tasks.insert("earlier".into(), earlier);
    draw(&mut agent, 100, 40);
    assert!(matches!(agent.handle_dock_key(&key(KeyCode::Char('x'))),
        InputOutcome::Action(Action::KillBgTask(id)) if id == "task-1"));
    agent.session.bg_tasks.remove("task-1");
    assert!(matches!(
        agent.handle_dock_key(&key(KeyCode::Char('x'))),
        InputOutcome::Unchanged
    ));
}

#[test]
fn stop_routes_monitors_loops_subagents_and_workflows_without_new_backend() {
    let mut agent = task_agent();
    agent.session.bg_tasks.get_mut("task-1").unwrap().is_monitor = true;
    agent
        .session
        .scheduled_tasks
        .insert("loop-1".into(), loop_task());
    agent
        .subagent_sessions
        .insert("child".into(), running_subagent_info("child"));
    agent.workflow_runs.push(workflow());
    assert!(
        matches!(agent.dock_stop_action(DockItem::Row(Section::Watchers, 0)),
        Some(Action::KillBgTask(id)) if id == "task-1")
    );
    assert!(
        matches!(agent.dock_stop_action(DockItem::Row(Section::Watchers, 1)),
        Some(Action::CancelScheduledTask(id)) if id == "loop-1")
    );
    assert!(
        matches!(agent.dock_stop_action(DockItem::Row(Section::Subagents, 0)),
        Some(Action::KillSubagent(id)) if id == "sa-child")
    );
    assert!(
        matches!(agent.dock_stop_action(DockItem::Row(Section::Workflows, 0)),
        Some(Action::SendSlashCommandPreservingDraft(cmd)) if cmd == "/workflow stop wf-run")
    );
    agent.workflow_runs[0].management_available = false;
    assert!(
        agent
            .dock_stop_action(DockItem::Row(Section::Workflows, 0))
            .is_none()
    );
}

#[test]
fn enter_opens_task_output_viewer_and_viewer_suppresses_dock() {
    let mut agent = task_agent();
    select(&mut agent, DockItem::Row(Section::Tasks, 0));
    assert!(matches!(
        agent.handle_dock_key(&key(KeyCode::Enter)),
        InputOutcome::Changed
    ));
    assert!(agent.block_viewer.is_some());
    draw(&mut agent, 100, 40);
    assert_eq!(agent.pane_areas.tasks.area(), 0);
    assert!(!agent.dock.shown);
}

#[test]
fn ctrl_g_hide_is_sticky_and_does_not_erase_draft() {
    let mut agent = task_agent();
    agent.prompt.set_text("keep draft");
    agent.handle_input(
        &Event::Key(KeyEvent::new(KeyCode::Char('g'), KeyModifiers::CONTROL)),
        &ActionRegistry::defaults(),
    );
    draw(&mut agent, 100, 40);
    assert!(agent.dock.hidden);
    assert_eq!(agent.pane_areas.tasks.area(), 0);
    assert_ne!(agent.active_pane, AgentPane::Tasks);
    agent
        .session
        .bg_tasks
        .get_mut("task-1")
        .unwrap()
        .description = Some("updated".into());
    draw(&mut agent, 100, 40);
    assert_eq!(agent.pane_areas.tasks.area(), 0);
    agent.toggle_dock();
    draw(&mut agent, 100, 40);
    assert!(agent.dock.shown);
    assert_eq!(agent.prompt.text(), "keep draft");
}

#[test]
fn mouse_uses_painted_identity_and_never_stops_a_shifted_row() {
    let mut agent = task_agent();
    select(&mut agent, DockItem::Row(Section::Tasks, 0));
    draw(&mut agent, 100, 40);
    let row = agent.pane_areas.tasks.y + 1;
    let mouse = |kind, col| MouseEvent {
        kind,
        column: col,
        row,
        modifiers: KeyModifiers::NONE,
    };
    agent.handle_dock_mouse(&mouse(
        MouseEventKind::Moved,
        agent.pane_areas.tasks.right() - 2,
    ));
    let hit = agent.dock.stop_button.clone().unwrap();
    assert!(
        matches!(agent.handle_dock_mouse(&mouse(MouseEventKind::Down(MouseButton::Left), hit.rect.x)),
        Some(InputOutcome::Action(Action::KillBgTask(id))) if id == "task-1")
    );
    let mut replacement = agent.session.bg_tasks.remove("task-1").unwrap();
    replacement.task_id = "replacement".into();
    agent
        .session
        .bg_tasks
        .insert("replacement".into(), replacement);
    assert!(!matches!(
        agent.handle_dock_mouse(&mouse(MouseEventKind::Down(MouseButton::Left), hit.rect.x)),
        Some(InputOutcome::Action(_))
    ));
    assert!(agent.block_viewer.is_none());
}

#[test]
fn header_collapse_and_more_keep_hit_geometry_and_scroll_inside_section() {
    let mut agent = task_agent();
    for n in 0..20 {
        let mut t = agent.session.bg_tasks["task-1"].clone();
        t.task_id = format!("extra-{n}");
        agent.session.bg_tasks.insert(t.task_id.clone(), t);
    }
    draw(&mut agent, 100, 40);
    assert!(
        agent
            .dock_items()
            .contains(&DockItem::RevealRemaining(Section::Tasks))
    );
    assert!(agent.scroll_dock_section(Section::Tasks, 3));
    draw(&mut agent, 100, 40);
    assert_eq!(agent.dock_layout().row_offset(Section::Tasks), 3);
    assert_eq!(
        agent.dock_item_at(agent.pane_areas.tasks, agent.pane_areas.tasks.y),
        Some(DockItem::Header(Section::Tasks))
    );
    agent.activate_dock_item(DockItem::Header(Section::Tasks));
    draw(&mut agent, 100, 40);
    assert_eq!(agent.pane_areas.tasks.height, 1);
}

#[test]
fn queue_collapse_is_sticky_and_delete_still_reaches_original_queue() {
    let mut agent = task_agent();
    queue(&mut agent);
    draw(&mut agent, 100, 40);
    agent.activate_dock_item(DockItem::Header(Section::Queued));
    draw(&mut agent, 100, 40);
    assert_eq!(agent.pane_areas.queue.area(), 0);
    agent.activate_dock_item(DockItem::Header(Section::Queued));
    draw(&mut agent, 100, 40);
    assert!(agent.pane_areas.queue.area() > 0);
    agent.queue.list_state.select_by_id(71);
    agent.handle_queue_key(&key(KeyCode::Char('x')), &ActionRegistry::defaults());
    assert!(agent.session.pending_prompts.is_empty());
}

#[test]
fn resize_preserves_prompt_and_bounds_dock_even_with_many_tasks() {
    let mut agent = task_agent();
    queue(&mut agent);
    for height in [40, 20, 16, 12, 10, 8, 6, 40] {
        for width in [100, 30, 10] {
            draw(&mut agent, width, height);
            assert!(agent.pane_areas.prompt.height > 0, "{width}x{height}");
            assert!(agent.pane_areas.tasks.bottom() <= height);
            if agent.pane_areas.tasks.area() > 0 {
                assert!(agent.pane_areas.tasks.bottom() <= agent.pane_areas.prompt.y);
            }
        }
    }
}

#[test]
fn workflow_viewer_takeover_and_new_session_do_not_retain_parent_dock() {
    let mut agent = task_agent();
    agent.workflow_runs.push(workflow());
    agent.activate_dock_item(DockItem::Row(Section::Workflows, 0));
    draw(&mut agent, 100, 40);
    assert!(agent.show_workflows);
    assert_eq!(agent.pane_areas.tasks.area(), 0);
    agent.show_workflows = false;
    draw(&mut agent, 100, 40);
    assert!(agent.dock.shown);
    let mut fresh = make_agent();
    draw(&mut fresh, 100, 40);
    assert_eq!(fresh.pane_areas.tasks.area(), 0);
    assert!(!fresh.dock.hidden);
}

#[test]
fn keyboard_can_reach_tasks_beyond_the_expanded_terminal_budget() {
    let mut agent = task_agent();
    for n in 0..100 {
        let mut t = agent.session.bg_tasks["task-1"].clone();
        t.task_id = format!("extra-{n:03}");
        agent.session.bg_tasks.insert(t.task_id.clone(), t);
    }
    draw(&mut agent, 100, 30);
    agent.activate_dock_item(DockItem::RevealRemaining(Section::Tasks));
    draw(&mut agent, 100, 30);
    select(&mut agent, DockItem::Header(Section::Tasks));
    assert!(matches!(
        agent.handle_dock_key(&key(KeyCode::PageDown)),
        InputOutcome::Changed
    ));
    draw(&mut agent, 100, 30);
    assert!(agent.dock_layout().row_offset(Section::Tasks) > 0);
    assert!(matches!(
        agent.dock_items().get(agent.dock.cursor),
        Some(DockItem::Row(Section::Tasks, _))
    ));
}
