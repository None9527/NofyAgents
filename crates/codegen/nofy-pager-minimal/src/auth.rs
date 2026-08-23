//! Minimal-mode auth / folder-trust rendering for the live region.
//!
//! Before any agent session exists (unauthenticated / folder-trust pending) the
//! minimal live region shows an auth error (with API-key setup guidance), the
//! folder-trust question, or a brief "starting" transient once both gates are
//! open — since minimal has no welcome screen.
//! [`draw_live`](super::live::draw_live) computes a [`MinimalAuthHint`] from the
//! app's [`AuthState`] + [`TrustState`] and renders it via [`render_auth`].

use std::path::PathBuf;

use ratatui::buffer::Buffer;
use ratatui::layout::Rect;
use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};

use nofy_pager::app::app_view::{AuthState, TrustState};
use nofy_pager::theme::Theme;

/// What the minimal live region shows when there is no active agent yet:
/// an auth error, the folder-trust question, or a brief "starting" transient
/// once authenticated (and trusted). Computed before the draw closure so the
/// closure can own it.
pub(super) enum MinimalAuthHint {
    /// No usable credential; show the error (API-key setup guidance).
    Failed(String),
    /// Authenticated, but the cwd has untrusted repo-local config — ask before
    /// creating a session. Input (y/Enter trust, n/Esc quit) is handled by the
    /// welcome interceptor in `AppView::handle_input`; this is render-only.
    TrustFolder { workspace: PathBuf },
    /// Authenticated (+ trusted) — the session is being created (brief transient).
    Starting,
}

/// Map the app's auth + trust state to what the no-agent live region should show.
///
/// Mirrors the welcome screen's gate order: trust is only offered after auth is
/// `Done`, when the user has access and is not ZDR-blocked (those gates already
/// block sessions, and the input interceptor only answers trust under the same
/// conditions).
pub(super) fn minimal_auth_hint(
    auth: &AuthState,
    trust: &TrustState,
    has_access: bool,
    is_zdr_blocked: bool,
) -> MinimalAuthHint {
    match auth {
        AuthState::Pending { error: Some(err) } => MinimalAuthHint::Failed(err.clone()),
        // Auth is still resolving — brief transient.
        AuthState::Pending { error: None } => MinimalAuthHint::Starting,
        AuthState::Done if has_access && !is_zdr_blocked => {
            if let TrustState::Pending { workspace } = trust {
                MinimalAuthHint::TrustFolder {
                    workspace: workspace.clone(),
                }
            } else {
                MinimalAuthHint::Starting
            }
        }
        AuthState::Done => MinimalAuthHint::Starting,
    }
}

/// Rows the no-agent live region needs for `hint` (before path wrap). Used by
/// the overlay host so the viewport grows enough to show the trust question
/// instead of clipping to the idle prompt height.
pub(super) fn auth_hint_rows(hint: &MinimalAuthHint, width: u16) -> u16 {
    match hint {
        // "Sign-in failed" + blank + error
        MinimalAuthHint::Failed(_) => 3,
        // question + path rows + blank + 2 warning + blank + 2 menu + blank + hint
        MinimalAuthHint::TrustFolder { workspace } => {
            let path = workspace.display().to_string();
            let path_rows = wrapped_char_rows(&path, width);
            1 + path_rows + 1 + 2 + 1 + 2 + 1 + 1
        }
        MinimalAuthHint::Starting => 1,
    }
}

/// How many rows `text` needs when painted char-by-char at `width` (no
/// wrap-inserted spaces) — same layout as [`render_url`].
fn wrapped_char_rows(text: &str, width: u16) -> u16 {
    let width = width.max(1) as usize;
    let chars = text.chars().filter(|c| !c.is_control()).count();
    if chars == 0 {
        return 1;
    }
    chars.div_ceil(width) as u16
}

/// Write `line` at row `y` (when it fits) and return the next row.
fn put_line(buf: &mut Buffer, area: Rect, y: u16, bottom: u16, line: Line<'_>) -> u16 {
    if y < bottom {
        buf.set_line(area.x, y, &line, area.width);
        y + 1
    } else {
        y
    }
}

/// Write `url` character-by-character across as many rows as it needs (no
/// wrap-inserted spaces), so the terminal's native selection copies it verbatim
/// — minimal has no mouse capture, so copy is the terminal's job. Returns the
/// next free row.
fn render_url(
    buf: &mut Buffer,
    area: Rect,
    start_y: u16,
    bottom: u16,
    url: &str,
    style: Style,
) -> u16 {
    let width = area.width.max(1);
    // Snapshot the buffer bounds as values so the `&Rect` borrow doesn't outlive
    // the mutable cell writes below.
    let (max_x, max_y) = {
        let a = buf.area();
        (a.right(), a.bottom())
    };
    let mut col = 0u16;
    let mut y = start_y;
    for ch in url.chars() {
        // Skip control chars to prevent terminal escape injection.
        if ch.is_control() {
            continue;
        }
        if col >= width {
            col = 0;
            y = y.saturating_add(1);
        }
        if y >= bottom {
            return bottom;
        }
        let x = area.x + col;
        if x < max_x && y < max_y {
            buf[(x, y)].set_char(ch).set_style(style);
        }
        col += 1;
    }
    y.saturating_add(1)
}

/// Render the sign-in / trust flow (or transient status) in the live region when
/// no agent exists yet. Top-aligned in `area`; clips to its height.
pub(super) fn render_auth(buf: &mut Buffer, area: Rect, theme: &Theme, hint: &MinimalAuthHint) {
    if area.width == 0 || area.height == 0 {
        return;
    }
    let bottom = area.y + area.height;
    let mut y = area.y;
    let gray = theme.muted().bg(Color::Reset);
    let bold = Style::default()
        .fg(theme.text_primary)
        .add_modifier(Modifier::BOLD)
        .bg(Color::Reset);

    match hint {
        MinimalAuthHint::Failed(err) => {
            let warn = Style::default()
                .fg(theme.warning)
                .add_modifier(Modifier::BOLD)
                .bg(Color::Reset);
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled("Sign-in failed", warn)),
            );
            y = put_line(buf, area, y, bottom, Line::default());
            let _ = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled(err.clone(), gray)),
            );
        }
        MinimalAuthHint::TrustFolder { workspace } => {
            // Mirrors `render_welcome_trust` copy, flush-left for minimal.
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled(
                    "Do you trust the contents of this directory?",
                    bold,
                )),
            );
            y = render_url(
                buf,
                area,
                y,
                bottom,
                &workspace.display().to_string(),
                Style::default().fg(theme.accent_user).bg(Color::Reset),
            );
            y = put_line(buf, area, y, bottom, Line::default());
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled(
                    "Nofy Build may run or modify contents in this directory,",
                    gray,
                )),
            );
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled("posing security risks.", gray)),
            );
            y = put_line(buf, area, y, bottom, Line::default());
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(vec![
                    Span::styled("y", bold),
                    Span::styled("  Yes, proceed", gray),
                ]),
            );
            y = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(vec![
                    Span::styled("n", bold),
                    Span::styled("  No, quit", gray),
                ]),
            );
            y = put_line(buf, area, y, bottom, Line::default());
            let _ = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled(
                    "Enter or y to trust \u{00b7} n or Esc to quit",
                    gray,
                )),
            );
        }
        MinimalAuthHint::Starting => {
            let _ = put_line(
                buf,
                area,
                y,
                bottom,
                Line::from(Span::styled("Starting your session.", gray)),
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn auth_hint_maps_auth_state() {
        let trust_done = TrustState::Done;

        assert!(matches!(
            minimal_auth_hint(&AuthState::Done, &trust_done, true, false),
            MinimalAuthHint::Starting
        ));
        assert!(matches!(
            minimal_auth_hint(
                &AuthState::Pending {
                    error: Some("nope".into())
                },
                &trust_done,
                true,
                false
            ),
            MinimalAuthHint::Failed(_)
        ));
    }

    #[test]
    fn auth_hint_maps_pending_trust_after_auth() {
        let trust = TrustState::Pending {
            workspace: PathBuf::from("/tmp/untrusted-repo"),
        };
        match minimal_auth_hint(&AuthState::Done, &trust, true, false) {
            MinimalAuthHint::TrustFolder { workspace } => {
                assert_eq!(workspace, PathBuf::from("/tmp/untrusted-repo"));
            }
            _ => panic!("expected TrustFolder"),
        }

        // Access / ZDR gates suppress the trust question (matches welcome +
        // the input interceptor).
        assert!(matches!(
            minimal_auth_hint(&AuthState::Done, &trust, false, false),
            MinimalAuthHint::Starting
        ));
        assert!(matches!(
            minimal_auth_hint(&AuthState::Done, &trust, true, true),
            MinimalAuthHint::Starting
        ));

        // Trust is not offered while auth is still resolving.
        assert!(matches!(
            minimal_auth_hint(&AuthState::Pending { error: None }, &trust, true, false),
            MinimalAuthHint::Starting
        ));
    }

    #[test]
    fn render_auth_shows_trust_question() {
        let theme = Theme::current();
        let area = Rect::new(0, 0, 80, 14);
        let mut buf = Buffer::empty(area);
        let hint = MinimalAuthHint::TrustFolder {
            workspace: PathBuf::from("/home/agent/project"),
        };
        render_auth(&mut buf, area, &theme, &hint);
        let text = buffer_text(&buf, area);
        assert!(
            text.contains("Do you trust the contents of this directory?"),
            "question: {text:?}"
        );
        assert!(
            text.contains("/home/agent/project"),
            "workspace path: {text:?}"
        );
        assert!(text.contains("Yes, proceed"), "yes option: {text:?}");
        assert!(text.contains("No, quit"), "no option: {text:?}");
        assert!(text.contains("Enter or y to trust"), "hint line: {text:?}");
        assert!(text.contains("posing security risks"), "warning: {text:?}");
    }

    #[test]
    fn auth_hint_rows_covers_trust_path_wrap() {
        let long = "x".repeat(200);
        let hint = MinimalAuthHint::TrustFolder {
            workspace: PathBuf::from(long),
        };
        let rows = auth_hint_rows(&hint, 40);
        // path alone needs 5 rows at width 40 (200/40); total well above base.
        assert!(rows >= 12, "expected room for wrapped path, got {rows}");
    }

    fn buffer_text(buf: &Buffer, area: Rect) -> String {
        let mut text = String::new();
        for y in 0..area.height {
            for x in 0..area.width {
                if let Some(c) = buf.cell((x, y)) {
                    text.push_str(c.symbol());
                }
            }
            text.push('\n');
        }
        text
    }
}
