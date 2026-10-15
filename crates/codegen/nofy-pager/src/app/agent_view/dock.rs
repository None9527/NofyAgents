//! Fullscreen Dock adapter, ported from public upstream 2bdd1d6a.
//! Lifecycle actions remain on Nofy's existing task/session dispatch paths.
#[cfg(test)]
#[path = "dock_tests.rs"]
mod tests;
use super::{ActivePane, AgentPane, AgentView};
use crate::app::actions::Action;
use crate::app::app_view::InputOutcome;
use crossterm::event::{KeyEvent, KeyModifiers};
use ratatui::layout::Rect;
#[derive(Clone, Debug)]
pub(crate) enum DockWatcherId {
    Monitor(String),
    Loop(String),
}
/// Painted kill hit. A click is ignored unless this identity still occupies the cell.
#[derive(Clone, Debug)]
pub struct CachedDockStop {
    pub rect: Rect,
    pub(crate) id: DockKillId,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub(crate) enum DockKillId {
    Subagent(String),
    Task(String),
    Loop(String),
    Workflow(String),
}
impl DockKillId {
    pub(crate) fn from_action(action: &Action) -> Option<Self> {
        match action {
            Action::KillSubagent(id) => Some(Self::Subagent(id.clone())),
            Action::KillBgTask(id) => Some(Self::Task(id.clone())),
            Action::CancelScheduledTask(id) => Some(Self::Loop(id.clone())),
            Action::SendSlashCommandPreservingDraft(cmd) => cmd
                .strip_prefix("/workflow stop ")
                .filter(|name| !name.is_empty())
                .map(|name| Self::Workflow(name.to_owned())),
            _ => None,
        }
    }
}

#[derive(Default)]
pub(crate) struct DockState {
    selected: Option<String>,
    painted: Vec<(crate::views::dock::DockItem, String)>,
    pending_stops: std::collections::HashMap<String, std::time::Instant>,
    pub cursor: usize,
    pub workflows_expanded: bool,
    pub subagents_expanded: bool,
    pub tasks_expanded: bool,
    pub watchers_expanded: bool,
    pub workflows_show_all: bool,
    pub subagents_show_all: bool,
    pub tasks_show_all: bool,
    pub watchers_show_all: bool,
    pub offsets: crate::views::dock::SectionSlots<usize>,
    pub reveal_pending: bool,
    pub hovered: Option<crate::views::dock::DockItem>,
    pub stop_button: Option<CachedDockStop>,
    pub queued_expanded: bool,
    pub on: bool,
    pub shown: bool,
    pub hidden: bool,
}
impl DockState {
    pub fn new() -> Self {
        Self {
            workflows_expanded: true,
            subagents_expanded: true,
            tasks_expanded: true,
            watchers_expanded: true,
            queued_expanded: true,
            ..Self::default()
        }
    }
}

impl AgentView {
    fn dock_stop_pending(&self, id: &str) -> bool {
        self.dock
            .pending_stops
            .get(id)
            .is_some_and(|at| at.elapsed().as_secs() < crate::app::agent::PENDING_KILL_TIMEOUT_SECS)
    }

    fn request_dock_stop(&mut self, item: crate::views::dock::DockItem) -> InputOutcome {
        let Some(action) = self.dock_stop_action(item) else {
            return InputOutcome::Unchanged;
        };
        if let Some(id) = self.dock_identity(item) {
            self.dock
                .pending_stops
                .insert(id, std::time::Instant::now());
        }
        InputOutcome::Action(action)
    }

    fn dock_identity(&self, item: crate::views::dock::DockItem) -> Option<String> {
        use crate::views::dock::{DockItem, Section};
        Some(match item {
            DockItem::Header(s) => format!("header:{s:?}"),
            DockItem::RevealRemaining(s) => format!("more:{s:?}"),
            DockItem::Row(Section::Workflows, i) => {
                format!("workflow:{}", self.dock_workflow_rows().get(i)?.0)
            }
            DockItem::Row(Section::Subagents, i) => {
                format!("agent:{}", self.dock_subagent_rows().get(i)?.0)
            }
            DockItem::Row(Section::Tasks, i) => format!("task:{}", self.dock_task_rows().get(i)?.0),
            DockItem::Row(Section::Watchers, i) => {
                format!("watch:{:?}", self.dock_watcher_rows().get(i)?.0)
            }
            DockItem::Row(Section::Queued, _) => return None,
        })
    }

    fn remember_dock_selection(&mut self) {
        self.dock.selected = self
            .dock_items()
            .get(self.dock.cursor)
            .copied()
            .and_then(|item| self.dock_identity(item));
    }

    pub(crate) fn cache_dock_frame(&mut self, height: u16) {
        let items = self.dock_layout_for(height).rows().to_vec();
        self.dock.painted = items
            .into_iter()
            .filter_map(|item| self.dock_identity(item).map(|id| (item, id)))
            .collect();
        self.dock.selected = self
            .dock
            .painted
            .get(self.dock.cursor)
            .map(|(_, id)| id.clone());
    }

    pub(crate) fn handle_dock_key(&mut self, key: &KeyEvent) -> InputOutcome {
        let outcome = self.handle_dock_key_inner(key);
        self.remember_dock_selection();
        outcome
    }

    pub(crate) fn toggle_dock(&mut self) -> InputOutcome {
        if !self.dock.hidden
            && matches!(self.active_pane, ActivePane::Tasks | ActivePane::Queue)
            && !self.set_active_pane(AgentPane::Scrollback, false)
        {
            return InputOutcome::Changed;
        }
        self.dock.hidden = !self.dock.hidden;
        if self.dock.hidden {
            self.tasks.overlay.focused = false;
            if matches!(self.active_pane, ActivePane::Tasks | ActivePane::Queue) {
                self.set_active_pane(AgentPane::Scrollback, false);
            }
        }
        InputOutcome::Changed
    }

    pub(crate) fn handle_dock_mouse(
        &mut self,
        mouse: &crossterm::event::MouseEvent,
    ) -> Option<InputOutcome> {
        use crossterm::event::{MouseButton, MouseEventKind};
        let area = self.pane_areas.tasks;
        if !self.dock.shown
            || self.dock.hidden
            || self.is_minimal_mode()
            || self.modal_owns_input()
            || self.block_viewer.is_some()
            || self.pos_occluded(mouse.column, mouse.row)
            || !area.contains((mouse.column, mouse.row).into())
            || self
                .pane_areas
                .queue
                .contains((mouse.column, mouse.row).into())
        {
            return None;
        }
        // Resolve the identity actually painted, never a newly shifted row.
        let Some((_, painted_id)) = self
            .dock
            .painted
            .get(mouse.row.saturating_sub(area.y) as usize)
        else {
            return Some(InputOutcome::Unchanged);
        };
        let Some(item) = self
            .dock_items()
            .into_iter()
            .find(|item| self.dock_identity(*item).as_ref() == Some(painted_id))
        else {
            return Some(InputOutcome::Unchanged);
        };
        match mouse.kind {
            MouseEventKind::Moved => {
                self.dock.hovered = Some(item);
                self.last_mouse_pos = (mouse.column, mouse.row);
                self.cache_dock_stop_button();
                Some(InputOutcome::Changed)
            }
            MouseEventKind::Down(MouseButton::Left) => {
                if !self.set_active_pane(AgentPane::Tasks, false) {
                    return Some(InputOutcome::Changed);
                }
                if let Some(hit) = &self.dock.stop_button
                    && hit.rect.contains((mouse.column, mouse.row).into())
                {
                    let action = self.dock_stop_action(item);
                    let matches = action
                        .as_ref()
                        .is_some_and(|a| DockKillId::from_action(a).as_ref() == Some(&hit.id));
                    return Some(if matches {
                        self.request_dock_stop(item)
                    } else {
                        InputOutcome::Changed
                    });
                }
                self.dock.cursor = self
                    .dock_items()
                    .iter()
                    .position(|i| *i == item)
                    .unwrap_or(0);
                self.remember_dock_selection();
                Some(self.activate_dock_item(item))
            }
            _ => None,
        }
    }
    pub(crate) fn dock_workflow_rows(&self) -> Vec<(String, crate::views::dock::DockRow)> {
        self.workflow_runs_newest_first()
            .into_iter()
            .filter(|run| !run.is_terminal())
            .map(|run| {
                let activity = run
                    .current_phase
                    .clone()
                    .unwrap_or_else(|| run.status.replace('_', " "));
                (
                    run.run_id.clone(),
                    crate::views::dock::DockRow {
                        kind: "Workflow".into(),
                        description: run.name.clone(),
                        activity: (!activity.is_empty()).then_some(activity),
                        meta: crate::views::dock::fmt_elapsed(run.live_elapsed_ms() / 1000),
                        killable: run.can_stop()
                            && !self.dock_stop_pending(&format!("workflow:{}", run.run_id)),
                        openable: true,
                        spinning: run.is_active(),
                    },
                )
            })
            .collect()
    }
    /// Non-workflow subagents in dock display order: `(child_session_id, subagent_id, row)`.
    pub(crate) fn dock_subagent_rows(&self) -> Vec<(String, String, crate::views::dock::DockRow)> {
        let show_done = self.tasks.show_done();
        let mut infos: Vec<&crate::app::subagent::SubagentInfo> = self
            .subagent_sessions
            .values()
            .filter(|info| info.workflow_run_id.is_none())
            .filter(|info| show_done || info.is_running())
            .collect();
        infos.sort_by_key(|info| {
            (
                !info.is_running(),
                info.started_at,
                info.child_session_id.clone(),
            )
        });
        infos
            .into_iter()
            .map(|info| {
                let running = info.is_running();
                let (kind, description) = crate::app::subagent::format_subagent_label(info);
                let mut meta = String::new();
                if let Some(model) = info.model.as_deref().filter(|s| !s.is_empty()) {
                    meta.push_str(model);
                    meta.push(' ');
                }
                meta.push_str(&crate::views::dock::fmt_elapsed(
                    info.display_elapsed().as_secs(),
                ));
                (
                    info.child_session_id.to_string(),
                    info.subagent_id.to_string(),
                    crate::views::dock::DockRow {
                        kind,
                        description,
                        activity: if info.pending_kill {
                            Some("stopping…".into())
                        } else if running {
                            info.activity_label.clone()
                        } else {
                            info.status.as_deref().map(str::to_owned)
                        },
                        meta,
                        killable: running && !info.pending_kill,
                        openable: self
                            .subagent_views
                            .contains_key(info.child_session_id.as_ref()),
                        spinning: running,
                    },
                )
            })
            .collect()
    }
    /// Running background commands (non-monitor): `(task_id, row)`.
    pub(crate) fn dock_task_rows(&self) -> Vec<(String, crate::views::dock::DockRow)> {
        let mut tasks: Vec<&crate::app::agent::BgTaskState> = self
            .session
            .bg_tasks
            .values()
            .filter(|t| t.status == crate::app::agent::BgTaskStatus::Running && !t.is_monitor)
            .collect();
        tasks.sort_by_key(|t| (t.start_time, t.task_id.clone()));
        tasks
            .into_iter()
            .map(|t| {
                let description = t
                    .description
                    .clone()
                    .filter(|d| !d.is_empty())
                    .unwrap_or_else(|| t.command.clone());
                let elapsed = t.start_time.elapsed().unwrap_or_default().as_secs();
                (
                    t.task_id.clone(),
                    crate::views::dock::DockRow {
                        kind: "Run".into(),
                        description,
                        activity: t.pending_kill.then(|| "stopping…".into()),
                        meta: crate::views::dock::fmt_elapsed(elapsed),
                        killable: !t.pending_kill,
                        openable: true,
                        spinning: true,
                    },
                )
            })
            .collect()
    }
    /// Running monitors, then scheduled loops, in dock display order.
    pub(crate) fn dock_watcher_rows(&self) -> Vec<(DockWatcherId, crate::views::dock::DockRow)> {
        let mut monitors: Vec<&crate::app::agent::BgTaskState> = self
            .session
            .bg_tasks
            .values()
            .filter(|t| t.status == crate::app::agent::BgTaskStatus::Running && t.is_monitor)
            .collect();
        monitors.sort_by_key(|t| (t.start_time, t.task_id.clone()));
        let mut rows: Vec<(DockWatcherId, crate::views::dock::DockRow)> = monitors
            .into_iter()
            .map(|t| {
                let description = t
                    .description
                    .clone()
                    .filter(|d| !d.is_empty())
                    .unwrap_or_else(|| t.command.clone());
                let elapsed = t.start_time.elapsed().unwrap_or_default().as_secs();
                (
                    DockWatcherId::Monitor(t.task_id.clone()),
                    crate::views::dock::DockRow {
                        kind: "Monitor".into(),
                        description,
                        activity: t.pending_kill.then(|| "stopping…".into()),
                        meta: crate::views::dock::fmt_elapsed(elapsed),
                        killable: !t.pending_kill,
                        openable: true,
                        spinning: true,
                    },
                )
            })
            .collect();
        let mut loops: Vec<&crate::app::agent::ScheduledTaskInfo> =
            self.session.scheduled_tasks.values().collect();
        loops.sort_by_key(|s| (s.created_at, s.task_id.clone()));
        let now = chrono::Utc::now();
        rows.extend(loops.into_iter().map(|s| {
            (
                DockWatcherId::Loop(s.task_id.clone()),
                crate::views::dock::DockRow {
                    kind: "Loop".into(),
                    description: s.prompt.clone(),
                    activity: None,
                    meta: format!(
                        "{}{}",
                        s.human_schedule,
                        crate::views::scheduled_next::next_suffix(s, now)
                    ),
                    killable: !self.dock_stop_pending(&format!(
                        "watch:{:?}",
                        DockWatcherId::Loop(s.task_id.clone())
                    )),
                    openable: s.last_subagent_id.as_deref().is_some_and(|sid| {
                        self.subagent_sessions.iter().any(|(child, info)| {
                            info.subagent_id.as_ref() == sid
                                && self.subagent_views.contains_key(child)
                        })
                    }),
                    spinning: false,
                },
            )
        }));
        rows
    }
    /// The counts the dock lays out from, carrying the ceiling every consumer obeys.
    pub(crate) fn dock_counts(&self) -> crate::views::dock::DockCounts {
        crate::views::dock::DockCounts {
            workflows: self.dock_workflow_rows().len(),
            subagents: self.dock_subagent_rows().len(),
            tasks: self.dock_task_rows().len(),
            watchers: self.dock_watcher_rows().len(),
            queued: self.visible_held_queue_len(),
            workflows_expanded: self.dock.workflows_expanded,
            subagents_expanded: self.dock.subagents_expanded,
            tasks_expanded: self.dock.tasks_expanded,
            watchers_expanded: self.dock.watchers_expanded,
            workflows_show_all: self.dock.workflows_show_all,
            subagents_show_all: self.dock.subagents_show_all,
            tasks_show_all: self.dock.tasks_show_all,
            watchers_show_all: self.dock.watchers_show_all,
            queue_body_rows: self.queue.desired_height(),
            offsets: self.dock.offsets,
            max_rows: self.dock_max_rows(),
        }
    }
    /// Rows the dock may take: its resting height, raised for a revealed section
    /// to half the space above the prompt. `paint_cap` stretches this when the
    /// floors need more, and the frame's layout has the last word.
    fn dock_max_rows(&self) -> crate::views::dock::MaxRows {
        use crate::views::dock::{MAX_DOCK_ROWS, MaxRows};
        let above_prompt = self
            .pane_areas
            .scrollback
            .height
            .saturating_add(self.pane_areas.tasks.height);
        let ceiling = above_prompt.saturating_sub(5).max(MAX_DOCK_ROWS);
        let revealed = self.dock.workflows_show_all
            || self.dock.subagents_show_all
            || self.dock.tasks_show_all
            || self.dock.watchers_show_all;
        if revealed {
            MaxRows::new(ceiling)
        } else {
            MaxRows::default()
        }
    }
    /// Item painted at `row` on screen, or `None` for the queue body and rows past the content.
    pub(crate) fn dock_item_at(
        &self,
        dock: ratatui::layout::Rect,
        row: u16,
    ) -> Option<crate::views::dock::DockItem> {
        self.dock_layout_for(dock.height)
            .item_at(row.checked_sub(dock.y)?)
    }
    /// Spends the pending reveal. Every path that ends a frame calls this, so a takeover that never paints the dock cannot leave it budgeting rows nothing put on screen.
    /// takeover that never paints the dock cannot leave it budgeting rows nothing
    /// put on screen.
    pub(crate) fn take_dock_row_request(&mut self) -> bool {
        std::mem::take(&mut self.dock.reveal_pending)
    }
    /// Keyboard, wheel, and clamp budget the same rows paint used. A reveal
    /// budgets against the rows it asked for until the frame assigns them, so the
    /// cursor can reach a row it just uncovered.
    pub(crate) fn dock_layout(&self) -> crate::views::dock::DockLayout {
        let assigned = self.pane_areas.tasks.height;
        if self.dock.reveal_pending || assigned == 0 {
            crate::views::dock::DockLayout::new(&self.dock_counts())
        } else {
            self.dock_layout_for(assigned)
        }
    }
    /// Budget rows against `height`, not `dock_max_rows` / a prior frame's
    /// `pane_areas.tasks`. Paint, hover, and the wheel all pass this frame's
    /// assigned rect so they cannot drift from what is on screen.
    fn dock_layout_for(&self, height: u16) -> crate::views::dock::DockLayout {
        let counts = self.dock_counts();
        match height {
            0 => crate::views::dock::DockLayout::new(&counts),
            assigned => crate::views::dock::DockLayout::with_cap(&counts, assigned as usize),
        }
    }
    pub(crate) fn is_dock_section_expanded(&self, section: crate::views::dock::Section) -> bool {
        match section {
            crate::views::dock::Section::Workflows => self.dock.workflows_expanded,
            crate::views::dock::Section::Subagents => self.dock.subagents_expanded,
            crate::views::dock::Section::Tasks => self.dock.tasks_expanded,
            crate::views::dock::Section::Watchers => self.dock.watchers_expanded,
            crate::views::dock::Section::Queued => self.dock.queued_expanded,
        }
    }
    fn set_dock_section_expanded(
        &mut self,
        section: crate::views::dock::Section,
        expanded: bool,
    ) -> InputOutcome {
        let slot = match section {
            crate::views::dock::Section::Workflows => &mut self.dock.workflows_expanded,
            crate::views::dock::Section::Subagents => &mut self.dock.subagents_expanded,
            crate::views::dock::Section::Tasks => &mut self.dock.tasks_expanded,
            crate::views::dock::Section::Watchers => &mut self.dock.watchers_expanded,
            crate::views::dock::Section::Queued => &mut self.dock.queued_expanded,
        };
        if *slot == expanded {
            return InputOutcome::Unchanged;
        }
        *slot = expanded;
        if !expanded {
            match section {
                crate::views::dock::Section::Workflows => {
                    self.dock.workflows_show_all = false;
                }
                crate::views::dock::Section::Subagents => {
                    self.dock.subagents_show_all = false;
                }
                crate::views::dock::Section::Tasks => self.dock.tasks_show_all = false,
                crate::views::dock::Section::Watchers => {
                    self.dock.watchers_show_all = false;
                }
                crate::views::dock::Section::Queued => {}
            }
        }
        InputOutcome::Changed
    }
    /// Extra rows belong to one section. Revealing Watchers must drop Tasks'
    /// raise so the two do not share the lift and shrink each other.
    fn set_dock_section_show_all(&mut self, section: crate::views::dock::Section) {
        match section {
            crate::views::dock::Section::Workflows => self.dock.workflows_show_all = true,
            crate::views::dock::Section::Subagents => self.dock.subagents_show_all = true,
            crate::views::dock::Section::Tasks => self.dock.tasks_show_all = true,
            crate::views::dock::Section::Watchers => self.dock.watchers_show_all = true,
            crate::views::dock::Section::Queued => return,
        }
        self.dock.reveal_pending = true;
    }
    pub(super) fn clamp_dock_overflow(&mut self) {
        use crate::views::dock::{Section, is_show_all_needed};
        let counts = self.dock_counts();
        if !is_show_all_needed(&counts, Section::Workflows) {
            self.dock.workflows_show_all = false;
        }
        if !is_show_all_needed(&counts, Section::Subagents) {
            self.dock.subagents_show_all = false;
        }
        if !is_show_all_needed(&counts, Section::Tasks) {
            self.dock.tasks_show_all = false;
        }
        if !is_show_all_needed(&counts, Section::Watchers) {
            self.dock.watchers_show_all = false;
        }
        let layout = self.dock_layout();
        for section in [
            Section::Workflows,
            Section::Subagents,
            Section::Tasks,
            Section::Watchers,
        ] {
            self.dock.offsets.set(section, layout.row_offset(section));
        }
        let n = self.dock_items().len();
        self.dock.cursor = if n == 0 {
            0
        } else {
            self.dock.cursor.min(n - 1)
        };
        if let Some(id) = &self.dock.selected {
            let items = self.dock_items();
            self.dock.cursor = items
                .iter()
                .position(|item| self.dock_identity(*item).as_ref() == Some(id))
                .unwrap_or(0);
        }
    }
    /// Pre-paint dock reconciliation, run from the draw state-update step rather than the paint pass. Section counts change from background events (task and subagent completion, queue refills), so a section that shrank back to the preview must drop its `show-all` and the cursor must stay in bounds even when no dock key was pressed since the change. Gated on the prior frame's `dock_on` so it does no work while the dock is off.
    pub(crate) fn reconcile_dock_before_paint(&mut self) {
        self.dock
            .pending_stops
            .retain(|_, at| at.elapsed().as_secs() < crate::app::agent::PENDING_KILL_TIMEOUT_SECS);
        // Counts may have grown since the last assigned frame. Reconcile against
        // the new ask first, then clamp again to the actual painted geometry.
        self.dock.reveal_pending = true;
        if self.dock.on {
            self.clamp_dock_overflow();
        }
    }
    pub(crate) fn dock_enter_label(&self) -> Option<&'static str> {
        use crate::views::dock::{DockItem, Section};
        match self.dock_items().get(self.dock.cursor) {
            Some(DockItem::Header(sec)) => Some(if self.is_dock_section_expanded(*sec) {
                "collapse"
            } else {
                "expand"
            }),
            Some(DockItem::RevealRemaining(_)) => Some("show all"),
            Some(DockItem::Row(section, i)) => {
                let openable = match section {
                    Section::Workflows => self
                        .dock_workflow_rows()
                        .get(*i)
                        .is_some_and(|(_, row)| row.openable),
                    Section::Subagents => self
                        .dock_subagent_rows()
                        .get(*i)
                        .is_some_and(|(_, _, row)| row.openable),
                    Section::Tasks => self
                        .dock_task_rows()
                        .get(*i)
                        .is_some_and(|(_, row)| row.openable),
                    Section::Watchers => self
                        .dock_watcher_rows()
                        .get(*i)
                        .is_some_and(|(_, row)| row.openable),
                    Section::Queued => true,
                };
                openable.then_some("open")
            }
            _ => None,
        }
    }
    pub(crate) fn dock_snapshot(&self) -> crate::views::dock::DockData {
        crate::views::dock::DockData {
            workflows: self
                .dock_workflow_rows()
                .into_iter()
                .map(|(_, row)| row)
                .collect(),
            subagents: self
                .dock_subagent_rows()
                .into_iter()
                .map(|(_, _, row)| row)
                .collect(),
            tasks: self
                .dock_task_rows()
                .into_iter()
                .map(|(_, row)| row)
                .collect(),
            watchers: self
                .dock_watcher_rows()
                .into_iter()
                .map(|(_, row)| row)
                .collect(),
            queued: self.visible_held_queue_len(),
            workflows_expanded: self.dock.workflows_expanded,
            subagents_expanded: self.dock.subagents_expanded,
            tasks_expanded: self.dock.tasks_expanded,
            watchers_expanded: self.dock.watchers_expanded,
            workflows_show_all: self.dock.workflows_show_all,
            subagents_show_all: self.dock.subagents_show_all,
            tasks_show_all: self.dock.tasks_show_all,
            watchers_show_all: self.dock.watchers_show_all,
            focused: self.active_pane == ActivePane::Tasks,
            cursor: self.dock.cursor,
            queue_body_rows: self.queue.desired_height(),
            offsets: self.dock.offsets,
            max_rows: self.dock_max_rows(),
            hovered: self.dock.hovered,
            stop_hovered: false,
            spinner_tick: self.tasks.tick_count(),
        }
    }
    pub(crate) fn cache_dock_stop_at(
        &mut self,
        area: ratatui::layout::Rect,
        data: &crate::views::dock::DockData,
    ) {
        self.dock.stop_button =
            crate::views::dock::hovered_stop_button_rect(area, data).and_then(|hit| {
                self.dock_stop_action(hit.item)
                    .and_then(|action| DockKillId::from_action(&action))
                    .map(|id| CachedDockStop { rect: hit.rect, id })
            });
    }
    pub(crate) fn cache_dock_stop_button(&mut self) {
        let snapshot = self.dock_snapshot();
        self.cache_dock_stop_at(self.pane_areas.tasks, &snapshot);
    }
    /// Re-derive `dock_hovered` from the last pointer position against `dock`
    /// (this frame's dock rect) and the current viewport. Pass the live
    /// `layout.dock` rather than reading `pane_areas.tasks`, which still holds the previous frame's rect during paint.
    pub(crate) fn sync_dock_hover_from_pointer(&mut self, dock: ratatui::layout::Rect) {
        let (col, row) = self.last_mouse_pos;
        self.dock.hovered = dock
            .contains((col, row).into())
            .then(|| self.dock_item_at(dock, row))
            .flatten();
    }
    /// Headers stay put, so scrolling a section can never push another off the dock.
    pub(crate) fn scroll_dock_section(
        &mut self,
        section: crate::views::dock::Section,
        delta: isize,
    ) -> bool {
        let layout = self.dock_layout();
        if layout.visible_rows(section) == 0 {
            return false;
        }
        let current = layout.row_offset(section);
        let next = if delta < 0 {
            current.saturating_sub(delta.unsigned_abs())
        } else {
            current + (delta as usize).min(layout.rows_below(section))
        };
        if next == current && next == self.dock.offsets.get(section) {
            return false;
        }
        self.dock.offsets.set(section, next);
        true
    }
    pub(crate) fn dock_section_at(
        &self,
        dock: ratatui::layout::Rect,
        row: u16,
    ) -> Option<crate::views::dock::Section> {
        match self.dock_item_at(dock, row)? {
            crate::views::dock::DockItem::Header(section)
            | crate::views::dock::DockItem::Row(section, _)
            | crate::views::dock::DockItem::RevealRemaining(section) => Some(section),
        }
    }
    pub(crate) fn dock_items(&self) -> Vec<crate::views::dock::DockItem> {
        self.dock_layout().rows().to_vec()
    }
    pub(crate) fn dock_stop_action(&self, item: crate::views::dock::DockItem) -> Option<Action> {
        use crate::views::dock::{DockItem, Section};
        if self
            .dock_identity(item)
            .is_some_and(|id| self.dock_stop_pending(&id))
        {
            return None;
        }
        match item {
            DockItem::Row(Section::Workflows, i) => {
                self.dock_workflow_rows().get(i).and_then(|(run_id, row)| {
                    row.killable.then(|| {
                        Action::SendSlashCommandPreservingDraft(format!(
                            "/workflow stop {}",
                            run_id
                        ))
                    })
                })
            }
            DockItem::Row(Section::Subagents, i) => self
                .dock_subagent_rows()
                .get(i)
                .filter(|(_, _, row)| row.killable)
                .map(|(_, subagent_id, _)| Action::KillSubagent(subagent_id.clone())),
            DockItem::Row(Section::Tasks, i) => self
                .dock_task_rows()
                .get(i)
                .filter(|(_, row)| row.killable)
                .map(|(task_id, _)| Action::KillBgTask(task_id.clone())),
            DockItem::Row(Section::Watchers, i) => {
                self.dock_watcher_rows().get(i).and_then(|(id, row)| {
                    row.killable.then(|| match id {
                        DockWatcherId::Monitor(task_id) => Action::KillBgTask(task_id.clone()),
                        DockWatcherId::Loop(task_id) => {
                            Action::CancelScheduledTask(task_id.clone())
                        }
                    })
                })
            }
            DockItem::Row(Section::Queued, _)
            | DockItem::Header(_)
            | DockItem::RevealRemaining(_) => None,
        }
    }
    pub(crate) fn activate_dock_item(
        &mut self,
        item: crate::views::dock::DockItem,
    ) -> InputOutcome {
        use crate::views::dock::{DockItem, Section};
        match item {
            DockItem::Header(sec) => {
                let next = !self.is_dock_section_expanded(sec);
                self.set_dock_section_expanded(sec, next)
            }
            DockItem::Row(Section::Workflows, i) => {
                if let Some((run_id, _)) = self.dock_workflow_rows().get(i) {
                    let run_id = run_id.clone();
                    self.open_workflow_detail_by_run_id(&run_id);
                    InputOutcome::Changed
                } else {
                    InputOutcome::Unchanged
                }
            }
            DockItem::Row(Section::Subagents, i) => {
                if let Some((child_sid, _, row)) = self.dock_subagent_rows().get(i) {
                    if !row.openable || child_sid.is_empty() {
                        return InputOutcome::Unchanged;
                    }
                    let sid = child_sid.clone();
                    self.open_subagent_fullscreen(sid);
                    InputOutcome::Changed
                } else {
                    InputOutcome::Unchanged
                }
            }
            DockItem::Row(Section::Tasks, i) => self
                .dock_task_rows()
                .get(i)
                .map(|(id, _)| id.clone())
                .map_or(InputOutcome::Unchanged, |id| self.open_bg_task_viewer(&id)),
            DockItem::Row(Section::Watchers, i) => match self.dock_watcher_rows().get(i) {
                Some((DockWatcherId::Monitor(id), _)) => {
                    let id = id.clone();
                    self.open_bg_task_viewer(&id)
                }
                Some((DockWatcherId::Loop(id), _)) => {
                    let id = id.clone();
                    self.open_linked_scheduled_subagent(&id)
                }
                None => InputOutcome::Unchanged,
            },
            DockItem::RevealRemaining(section) => {
                let layout = self.dock_layout();
                let first_hidden = layout.row_offset(section) + layout.visible_rows(section);
                if section == Section::Queued {
                    return InputOutcome::Unchanged;
                }
                self.set_dock_section_show_all(section);
                if !self
                    .dock_items()
                    .contains(&DockItem::Row(section, first_hidden))
                {
                    self.dock.offsets.set(section, first_hidden);
                }
                if let Some(next) = self
                    .dock_items()
                    .iter()
                    .position(|item| *item == DockItem::Row(section, first_hidden))
                {
                    self.dock.cursor = next;
                }
                InputOutcome::Changed
            }
            DockItem::Row(Section::Queued, _) => InputOutcome::Unchanged,
        }
    }
    fn open_bg_task_viewer(&mut self, task_id: &str) -> InputOutcome {
        let Some(task) = self.session.bg_tasks.get(task_id) else {
            return InputOutcome::Unchanged;
        };
        let entry_id = task
            .scrollback_entry_id
            .unwrap_or_else(|| crate::scrollback::entry::EntryId::new(0));
        self.block_viewer = Some(crate::views::block_viewer::BlockViewerPane::for_bg_task(
            entry_id,
            task_id,
            &task.stdout,
            task.status == crate::app::agent::BgTaskStatus::Running,
        ));
        self.set_active_pane(AgentPane::Scrollback, true);
        InputOutcome::Changed
    }
    fn open_linked_scheduled_subagent(&mut self, task_id: &str) -> InputOutcome {
        let Some(child_sid) = self
            .session
            .scheduled_tasks
            .get(task_id)
            .and_then(|info| info.last_subagent_id.as_deref())
            .and_then(|sid| {
                self.subagent_sessions.iter().find_map(|(child, info)| {
                    (info.subagent_id.as_ref() == sid).then_some(child.clone())
                })
            })
            .filter(|child| self.subagent_views.contains_key(child))
        else {
            return InputOutcome::Unchanged;
        };
        self.open_subagent_fullscreen(child_sid);
        InputOutcome::Changed
    }
    /// Dock-focused key handling (fullscreen Dock).
    fn handle_dock_key_inner(&mut self, key: &KeyEvent) -> InputOutcome {
        use crate::views::dock::{DockItem, Section};
        use crossterm::event::KeyCode;
        if !self.dock.shown || self.dock.hidden {
            return InputOutcome::Unchanged;
        }
        let shift_tab = matches!(key.code, KeyCode::Tab | KeyCode::BackTab)
            && key.modifiers == KeyModifiers::SHIFT;
        if !key.modifiers.is_empty() && !shift_tab {
            return InputOutcome::Unchanged;
        }
        self.clamp_dock_overflow();
        let items = self.dock_items();
        if items.is_empty() {
            self.set_active_pane(AgentPane::Scrollback, false);
            return InputOutcome::Changed;
        }
        match key.code {
            KeyCode::PageUp | KeyCode::PageDown => {
                let section = match items.get(self.dock.cursor) {
                    Some(
                        DockItem::Header(section)
                        | DockItem::Row(section, _)
                        | DockItem::RevealRemaining(section),
                    ) => *section,
                    None => return InputOutcome::Unchanged,
                };
                let page = self.dock_layout().visible_rows(section).max(1) as isize;
                if self.scroll_dock_section(
                    section,
                    if key.code == KeyCode::PageUp {
                        -page
                    } else {
                        page
                    },
                ) {
                    self.dock.cursor = self
                        .dock_items()
                        .iter()
                        .position(|item| matches!(item, DockItem::Row(s, _) if *s == section))
                        .unwrap_or(self.dock.cursor);
                    InputOutcome::Changed
                } else {
                    InputOutcome::Unchanged
                }
            }
            KeyCode::Up | KeyCode::Char('k') => {
                self.dock.cursor = self.dock.cursor.saturating_sub(1);
                InputOutcome::Changed
            }
            KeyCode::Down | KeyCode::Char('j') => {
                self.dock.cursor = (self.dock.cursor + 1).min(items.len() - 1);
                InputOutcome::Changed
            }
            KeyCode::Right | KeyCode::Char('l') => match items.get(self.dock.cursor) {
                Some(DockItem::Header(sec)) => self.set_dock_section_expanded(*sec, true),
                Some(DockItem::Row(..) | DockItem::RevealRemaining(_)) | None => {
                    InputOutcome::Unchanged
                }
            },
            KeyCode::Left => match items.get(self.dock.cursor) {
                Some(DockItem::Header(sec)) => self.set_dock_section_expanded(*sec, false),
                Some(DockItem::Row(..) | DockItem::RevealRemaining(_)) | None => {
                    InputOutcome::Unchanged
                }
            },
            KeyCode::Char('h') => {
                self.tasks.handle_key(key);
                if self.tasks.show_done() {
                    self.dock.subagents_expanded = true;
                }
                self.clamp_dock_overflow();
                InputOutcome::Changed
            }
            KeyCode::Tab if !shift_tab => InputOutcome::Action(Action::FocusPrompt),
            KeyCode::BackTab | KeyCode::Tab => {
                self.set_active_pane(AgentPane::Scrollback, false);
                InputOutcome::Changed
            }
            KeyCode::Enter | KeyCode::Char(' ') => items
                .get(self.dock.cursor)
                .copied()
                .map_or(InputOutcome::Unchanged, |item| {
                    self.activate_dock_item(item)
                }),
            KeyCode::Char('x') => items
                .get(self.dock.cursor)
                .copied()
                .map_or(InputOutcome::Unchanged, |item| self.request_dock_stop(item)),
            KeyCode::Char('y') => {
                let task_id = match items.get(self.dock.cursor) {
                    Some(DockItem::Row(Section::Tasks, i)) => {
                        self.dock_task_rows().get(*i).map(|(id, _)| id.clone())
                    }
                    Some(DockItem::Row(Section::Watchers, i)) => self
                        .dock_watcher_rows()
                        .get(*i)
                        .and_then(|(id, _)| match id {
                            DockWatcherId::Monitor(id) => Some(id.clone()),
                            DockWatcherId::Loop(_) => None,
                        }),
                    _ => None,
                };
                if let Some(text) = task_id
                    .and_then(|id| self.session.bg_tasks.get(&id))
                    .filter(|task| !task.stdout.is_empty())
                    .map(|task| task.stdout.clone())
                {
                    self.copy_to_clipboard(&text);
                    return InputOutcome::Changed;
                }
                let (col, row) = self.last_mouse_pos;
                if self.pane_areas.queue.area() > 0
                    && self.pane_areas.queue.contains((col, row).into())
                    && let Some(text) = self.queue.selected_text().map(str::to_owned)
                {
                    self.copy_to_clipboard(&text);
                    InputOutcome::Changed
                } else {
                    InputOutcome::Unchanged
                }
            }
            KeyCode::Esc | KeyCode::Char('q') => {
                self.set_active_pane(AgentPane::Scrollback, false);
                InputOutcome::Changed
            }
            _ => InputOutcome::Unchanged,
        }
    }
}
