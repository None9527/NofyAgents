//! MCP elicitation card (`nofy/mcp/elicit`): key/mouse/paste routing,
//! accept/decline/cancel resolution, the pending-request promotion chain,
//! and the composer stash handoff.

#[cfg(test)]
mod outcome_tests {
    use super::*;
    use crate::views::elicitation_view::ElicitationViewState;
    use nofy_tools::mcp_elicitation::{
        McpElicitExtRequest, McpElicitExtResponse, McpElicitModeFields,
    };

    fn request() -> McpElicitExtRequest {
        McpElicitExtRequest {
            session_id: "s".into(),
            tool_call_id: "input-1".into(),
            server_name: "demo".into(),
            message: "Enter input".into(),
            mode: McpElicitModeFields::Form {
                requested_schema: None,
            },
        }
    }

    fn notices(agent: &mut AgentView) -> Vec<String> {
        agent
            .scrollback
            .entries_mut()
            .filter_map(|entry| match &entry.block {
                crate::scrollback::block::RenderBlock::System(block) => Some(block.text.clone()),
                _ => None,
            })
            .collect()
    }

    #[test]
    fn unanswered_outcomes_restore_draft_and_explain_why() {
        for (response, expected, closed) in [
            (McpElicitExtResponse::Decline, "was declined", false),
            (McpElicitExtResponse::Cancel, "without answering", false),
            (
                McpElicitExtResponse::Accept { content: None },
                "before this answer was delivered",
                true,
            ),
        ] {
            let mut agent = super::super::test_fixtures::make_agent();
            agent.prompt.set_text("keep my draft");
            let stash = agent.stash_prompt_for_elicitation();
            let (tx, mut rx) = tokio::sync::oneshot::channel();
            if closed {
                rx.close();
            }
            agent.elicitation_view = Some(ElicitationViewState::from_request(
                request(),
                stash,
                Some(tx),
            ));
            agent.finish_elicitation(response);
            assert_eq!(agent.prompt.text(), "keep my draft");
            assert!(agent.elicitation_view.is_none());
            assert!(
                notices(&mut agent)
                    .iter()
                    .any(|text| text.contains(expected))
            );
        }
    }

    #[test]
    fn resolved_pending_request_has_one_notice_and_preserves_draft() {
        let mut agent = super::super::test_fixtures::make_agent();
        agent.prompt.set_text("unchanged");
        let (tx, _rx) = tokio::sync::oneshot::channel();
        agent.pending_elicitation = Some((request(), tx));
        assert!(agent.dismiss_resolved_interaction("input-1"));
        assert!(!agent.dismiss_resolved_interaction("input-1"));
        assert_eq!(agent.prompt.text(), "unchanged");
        assert_eq!(
            notices(&mut agent)
                .iter()
                .filter(|text| text.contains("closed before"))
                .count(),
            1
        );
    }
}

use super::AgentView;
use crate::app::app_view::InputOutcome;
use crate::input::key::RowWalk;
use crate::key;
use crossterm::event::{KeyCode, KeyEvent, KeyModifiers, MouseButton, MouseEvent, MouseEventKind};

impl AgentView {
    pub(super) fn handle_elicitation_key(&mut self, key: &KeyEvent) -> InputOutcome {
        use crate::views::elicitation_view::{ElicitationActionFocus, ElicitationFocus};

        if key.code == KeyCode::Esc {
            return self.handle_card_esc();
        }
        if key!('c', CONTROL).matches(key) {
            return self.resolve_elicitation_cancel();
        }

        let Some(ev) = self.elicitation_view.as_mut() else {
            return InputOutcome::Unchanged;
        };

        // URL stages have no fields: the walk keys scroll the URL body
        // viewport instead (actions stay reachable via Tab / Left / Right),
        // so keyboard-only users can inspect a long URL's tail.
        if ev.url().is_some() {
            let scrolled = match key.code {
                KeyCode::Up | KeyCode::Char('k') => {
                    ev.scroll = ev.scroll.saturating_sub(1);
                    true
                }
                KeyCode::Down | KeyCode::Char('j') => {
                    ev.scroll = ev.scroll.saturating_add(1);
                    true
                }
                KeyCode::PageUp => {
                    ev.scroll = ev.scroll.saturating_sub(4);
                    true
                }
                KeyCode::PageDown => {
                    ev.scroll = ev.scroll.saturating_add(4);
                    true
                }
                _ => false,
            };
            if scrolled {
                return InputOutcome::Changed;
            }
        }

        // URL waiting: the response is already sent; only dismiss ("Done",
        // also via d) and reopen remain.
        if ev.is_url_waiting() {
            match key.code {
                KeyCode::Enter
                | KeyCode::Char('y')
                | KeyCode::Char('Y')
                | KeyCode::Char('d')
                | KeyCode::Char('D') => {
                    return self.dismiss_elicitation_view();
                }
                KeyCode::Char('o') | KeyCode::Char('O') => {
                    if let Some(url) = ev.url().map(str::to_string) {
                        self.open_untrusted_url_or_show(&url);
                    }
                    return InputOutcome::Changed;
                }
                _ => return InputOutcome::Changed,
            }
        }

        if ev.focus == ElicitationFocus::Editing {
            let multi = ev.current_field().is_some_and(|f| f.is_multi_select());
            if multi {
                match key.code {
                    KeyCode::Enter | KeyCode::Tab | KeyCode::BackTab => {
                        ev.focus = ElicitationFocus::Fields;
                    }
                    KeyCode::Up | KeyCode::Char('k') => {
                        ev.move_option_cursor(-1);
                    }
                    KeyCode::Down | KeyCode::Char('j') => {
                        ev.move_option_cursor(1);
                    }
                    KeyCode::Char(' ') | KeyCode::Left | KeyCode::Right => {
                        ev.toggle_current_option();
                    }
                    _ => {}
                }
                return InputOutcome::Changed;
            }
            match key.code {
                KeyCode::Enter | KeyCode::Tab | KeyCode::BackTab => {
                    ev.focus = ElicitationFocus::Fields;
                    return InputOutcome::Changed;
                }
                KeyCode::Backspace => {
                    ev.backspace();
                    return InputOutcome::Changed;
                }
                KeyCode::Char(c) if !key.modifiers.contains(KeyModifiers::CONTROL) => {
                    ev.append_char(c);
                    return InputOutcome::Changed;
                }
                _ => return InputOutcome::Changed,
            }
        }

        if ev.focus == ElicitationFocus::Fields
            && !key.modifiers.contains(KeyModifiers::CONTROL)
            && let KeyCode::Char(c) = key.code
            && !c.is_control()
            && ev.enter_edit_if_text()
        {
            ev.append_char(c);
            return InputOutcome::Changed;
        }

        if ev.focus == ElicitationFocus::Actions
            && !key.modifiers.contains(KeyModifiers::CONTROL)
            && matches!(
                key.code,
                KeyCode::Char('d') | KeyCode::Char('D') | KeyCode::Char('n') | KeyCode::Char('N')
            )
        {
            return self.resolve_elicitation_decline();
        }

        if let Some(walk) = RowWalk::from_key(key) {
            ev.move_focus(
                /*forward*/ matches!(walk, RowWalk::Forward),
                /*wrap*/ true,
            );
            return InputOutcome::Changed;
        }

        match key.code {
            KeyCode::Up | KeyCode::Char('k') => {
                ev.move_focus(/*forward*/ false, /*wrap*/ false);
                InputOutcome::Changed
            }
            KeyCode::Down | KeyCode::Char('j') => {
                ev.move_focus(/*forward*/ true, /*wrap*/ false);
                InputOutcome::Changed
            }
            KeyCode::Left | KeyCode::Right => {
                if ev.focus == ElicitationFocus::Actions {
                    ev.action_focus = match ev.action_focus {
                        ElicitationActionFocus::Accept => ElicitationActionFocus::Decline,
                        ElicitationActionFocus::Decline => ElicitationActionFocus::Accept,
                    };
                } else {
                    ev.toggle_bool_or_enum();
                }
                InputOutcome::Changed
            }
            KeyCode::Char(' ') => {
                if ev.focus == ElicitationFocus::Fields && !ev.enter_edit_or_options() {
                    ev.toggle_bool_or_enum();
                }
                InputOutcome::Changed
            }
            KeyCode::Enter => {
                if ev.focus == ElicitationFocus::Fields {
                    if !ev.enter_edit_or_options() {
                        ev.toggle_bool_or_enum();
                    }
                    return InputOutcome::Changed;
                }
                match ev.action_focus {
                    ElicitationActionFocus::Decline => self.resolve_elicitation_decline(),
                    ElicitationActionFocus::Accept => self.resolve_elicitation_accept(),
                }
            }
            KeyCode::Char('y') | KeyCode::Char('Y') if ev.focus == ElicitationFocus::Actions => {
                self.resolve_elicitation_accept()
            }
            KeyCode::Char(c)
                if c.is_ascii_digit()
                    && !key.modifiers.contains(KeyModifiers::CONTROL)
                    && ev.focus != ElicitationFocus::Editing =>
            {
                if let Some(idx) = crate::views::question_view::option_index_for_key(c)
                    && idx < ev.field_count()
                {
                    ev.focus = ElicitationFocus::Fields;
                    if let Some(form) = ev.form_mut() {
                        form.field_cursor = idx;
                    }
                }
                InputOutcome::Changed
            }
            _ => InputOutcome::Changed,
        }
    }

    pub(super) fn handle_elicitation_mouse(&mut self, mouse: &MouseEvent) -> InputOutcome {
        use crate::views::elicitation_view::{ElicitHit, ElicitationFocus};
        match mouse.kind {
            // The body is a viewport: wheel scrolls it (render clamps).
            MouseEventKind::ScrollUp => {
                if let Some(ev) = self.elicitation_view.as_mut() {
                    ev.scroll = ev.scroll.saturating_sub(1);
                }
                return InputOutcome::Changed;
            }
            MouseEventKind::ScrollDown => {
                if let Some(ev) = self.elicitation_view.as_mut() {
                    ev.scroll = ev.scroll.saturating_add(1);
                }
                return InputOutcome::Changed;
            }
            MouseEventKind::Down(MouseButton::Left) => {}
            _ => return InputOutcome::Changed,
        }
        let hit = self.elicit_hits.iter().find_map(|(hit, rect)| {
            rect.contains((mouse.column, mouse.row).into())
                .then_some(*hit)
        });
        let Some(hit) = hit else {
            return InputOutcome::Changed;
        };
        match hit {
            ElicitHit::Field(i) => {
                let Some(ev) = self.elicitation_view.as_mut() else {
                    return InputOutcome::Changed;
                };
                if let Some(form) = ev.form_mut() {
                    form.field_cursor = i;
                }
                ev.focus = ElicitationFocus::Fields;
                let _ = ev.enter_edit_or_options();
                InputOutcome::Changed
            }
            ElicitHit::Option { field, option } => {
                let Some(ev) = self.elicitation_view.as_mut() else {
                    return InputOutcome::Changed;
                };
                if let Some(form) = ev.form_mut() {
                    form.field_cursor = field;
                }
                if let Some(field_ui) = ev.current_field_mut() {
                    field_ui.toggle_option(option);
                }
                InputOutcome::Changed
            }
            ElicitHit::Accept => {
                if let Some(ev) = self.elicitation_view.as_mut() {
                    ev.focus = ElicitationFocus::Actions;
                    ev.action_focus =
                        crate::views::elicitation_view::ElicitationActionFocus::Accept;
                }
                self.resolve_elicitation_accept()
            }
            ElicitHit::Decline => {
                if let Some(ev) = self.elicitation_view.as_mut() {
                    ev.focus = ElicitationFocus::Actions;
                    ev.action_focus =
                        crate::views::elicitation_view::ElicitationActionFocus::Decline;
                }
                self.resolve_elicitation_decline()
            }
        }
    }

    /// A `Some` `server_name` must additionally equal the card's verbatim
    /// wire server name, so one server cannot dismiss another's waiting card
    /// by guessing its elicitation id. `None` (older shells) matches by id
    /// alone.
    pub(crate) fn dismiss_waiting_elicitation(
        &mut self,
        elicitation_id: &str,
        server_name: Option<&str>,
    ) -> bool {
        let matches = self.elicitation_view.as_ref().is_some_and(|ev| {
            ev.is_url_waiting()
                && ev.elicitation_id().is_some_and(|id| id == elicitation_id)
                && server_name.is_none_or(|name| name == ev.server_name_wire)
        });
        if !matches {
            return false;
        }
        let _ = self.dismiss_elicitation_view();
        true
    }

    /// Remove the card without answering (URL waiting already answered;
    /// there is nothing left to send). Restores the stashed draft and
    /// promotes any parked request.
    fn dismiss_elicitation_view(&mut self) -> InputOutcome {
        let Some(ev) = self.elicitation_view.take() else {
            return InputOutcome::Unchanged;
        };
        self.restore_elicitation_prompt(ev.stashed_prompt);
        self.promote_pending_elicitation();
        InputOutcome::Changed
    }

    pub(crate) fn promote_pending_elicitation(&mut self) {
        use crate::views::elicitation_view::ElicitationViewState;
        let Some((req, tx)) = self.pending_elicitation.take() else {
            return;
        };
        let stashed = self.stash_prompt_for_elicitation();
        self.elicitation_view = Some(ElicitationViewState::from_request(req, stashed, Some(tx)));
    }

    pub(super) fn handle_elicitation_paste(&mut self, text: &str) -> InputOutcome {
        use crate::views::elicitation_view::ElicitationFocus;
        let Some(ev) = self.elicitation_view.as_mut() else {
            return InputOutcome::Changed;
        };
        let editing_text = ev.focus == ElicitationFocus::Editing
            && ev.current_field().is_some_and(|f| f.is_text());
        if !editing_text && !ev.enter_edit_if_text() {
            return InputOutcome::Changed;
        }
        for c in text.chars() {
            if c == '\n' || c == '\r' {
                continue;
            }
            ev.append_char(c);
        }
        InputOutcome::Changed
    }

    fn resolve_elicitation_accept(&mut self) -> InputOutcome {
        let (is_waiting, is_url_consent, accept_result) = {
            let Some(ev) = self.elicitation_view.as_mut() else {
                return InputOutcome::Unchanged;
            };
            if ev.is_url_waiting() {
                (true, false, None)
            } else {
                (false, ev.url().is_some(), ev.try_accept())
            }
        };

        // Waiting: the ACP response went out on consent; "Done" only
        // dismisses the local chrome.
        if is_waiting {
            return self.dismiss_elicitation_view();
        }

        let Some(resp) = accept_result else {
            return InputOutcome::Changed;
        };

        if is_url_consent {
            // The URL was validated at ingress (http(s), parseable, no
            // credentials) or Accept would have been disabled.
            let (delivered, url) = {
                let Some(ev) = self.elicitation_view.as_mut() else {
                    return InputOutcome::Changed;
                };
                if ev.send_response(resp) {
                    // Capture the URL from the consent stage (where it
                    // exists by construction) before the transition takes
                    // the stage apart.
                    let url = ev.url().map(str::to_string);
                    ev.begin_url_waiting();
                    (true, url)
                } else {
                    // The MCP side already abandoned the request (server
                    // cancel / teardown): nothing heard the accept, so do
                    // not navigate and do not enter the waiting stage.
                    (false, None)
                }
            };
            if !delivered {
                return self.dismiss_elicitation_view();
            }
            if let Some(url) = url {
                self.open_untrusted_url_or_show(&url);
            }
            return InputOutcome::Changed;
        }

        self.finish_elicitation(resp)
    }

    fn resolve_elicitation_decline(&mut self) -> InputOutcome {
        use crate::views::elicitation_view::ElicitationViewState;
        if self
            .elicitation_view
            .as_ref()
            .is_some_and(|ev| ev.is_url_waiting())
        {
            return self.dismiss_elicitation_view();
        }
        self.finish_elicitation(ElicitationViewState::decline_response())
    }

    pub(super) fn resolve_elicitation_cancel(&mut self) -> InputOutcome {
        use crate::views::elicitation_view::ElicitationViewState;
        if self
            .elicitation_view
            .as_ref()
            .is_some_and(|ev| ev.is_url_waiting())
        {
            return self.dismiss_elicitation_view();
        }
        self.finish_elicitation(ElicitationViewState::cancel_response())
    }

    fn finish_elicitation(
        &mut self,
        response: nofy_tools::mcp_elicitation::McpElicitExtResponse,
    ) -> InputOutcome {
        let Some(mut ev) = self.elicitation_view.take() else {
            return InputOutcome::Unchanged;
        };
        use nofy_tools::mcp_elicitation::McpElicitExtResponse;
        let refusal = match &response {
            McpElicitExtResponse::Accept { .. } => None,
            McpElicitExtResponse::Decline => Some("was declined"),
            McpElicitExtResponse::Cancel => Some("was dismissed without answering"),
        };
        let notice = if ev.send_response(response) {
            refusal
        } else {
            Some("closed before this answer was delivered (timed out or answered elsewhere)")
        };
        if let Some(reason) = notice {
            self.push_unanswered_elicitation_notice(&ev.server_name, reason);
        }
        self.restore_elicitation_prompt(ev.stashed_prompt);
        self.promote_pending_elicitation();
        InputOutcome::Changed
    }

    /// Preserve a visible outcome when an input request receives no answer here.
    pub(crate) fn push_unanswered_elicitation_notice(&mut self, server: &str, reason: &str) {
        let server: String = server
            .chars()
            .filter(|c| !c.is_control())
            .take(100)
            .collect();
        crate::app::mode_switch::push_block_behind_live_stream(
            &mut self.scrollback,
            crate::scrollback::block::RenderBlock::system(format!(
                "MCP “{server}” request for input {reason}."
            )),
        );
    }

    /// Take composer ownership for an opening elicitation card.
    ///
    /// Returns `None` — leaving the composer untouched — when an earlier card
    /// (permission / question / plan approval) already displaced the session
    /// draft: the live composer then holds that card's followup/freeform text
    /// (or nothing), and stashing it would make the elicitation restore an
    /// empty draft over the one the earlier card puts back.
    pub(crate) fn stash_prompt_for_elicitation(
        &mut self,
    ) -> Option<crate::views::prompt_widget::StashedPrompt> {
        let draft_held_elsewhere = !self.permission_queue.is_empty()
            || self.permission_stashed_prompt.is_some()
            || self.question_view.is_some()
            || self.plan_approval_view.is_some();
        if draft_held_elsewhere {
            return None;
        }
        let stashed = self.prompt.stash();
        self.prompt.set_text("");
        Some(stashed)
    }

    /// Give back the draft an elicitation card displaced, if it owned one.
    pub(crate) fn restore_elicitation_prompt(
        &mut self,
        stashed: Option<crate::views::prompt_widget::StashedPrompt>,
    ) {
        if let Some(stashed) = stashed {
            self.restore_card_prompt(stashed);
        }
    }
}
