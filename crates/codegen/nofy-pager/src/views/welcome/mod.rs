//! Welcome screen — the first thing users see.
//!
//! Layout (top to bottom):
//! - Top margin row (always preserved)
//! - Top bar: repo_root:branch (left), version (right)
//! - Vertically centered content: logo → gap → menu → gap → prompt
//! - Bottom margin

use ratatui::buffer::Buffer;
use ratatui::layout::{Alignment, Constraint, Flex, Layout, Rect};
use ratatui::style::{Modifier, Style};
use ratatui::text::{Line, Span};
use ratatui::widgets::{Paragraph, Widget};

use crate::app::app_view::{AuthState, SessionPickerEntry, TrustState};
use crate::startup::StartupWarning;
use crate::theme::Theme;
use crate::views::prompt_widget::{PromptFlag, PromptInfo, PromptWidget};
mod hero_box;
pub(crate) mod logo;
mod menu;
mod prompt;
mod toast;
mod top_bar;
#[cfg(feature = "local-workspace")]
pub(crate) mod workspace_mode;

pub(crate) use logo::shimmer_frame;
use logo::{logo_line_count, render_logo};
use menu::render_menu;
pub(crate) use toast::paint_welcome_toast;
pub(crate) use top_bar::location_line_at;
use top_bar::render_top_bar;
#[cfg(feature = "local-workspace")]
pub use workspace_mode::{
    WelcomeWorkspaceMode, WorkspaceModeHitRects, hit_test_workspace_mode,
    render_workspace_mode_picker,
};

/// True for VS Code and xterm.js embeds (VS Code-family IDEs and Zed) where
/// quit is `Ctrl+D` (canonical: [`TerminalName::is_vscode_family`]).
fn welcome_in_vscode_family() -> bool {
    crate::terminal::terminal_context().brand.is_vscode_family()
}

/// Style for a clickable welcome block: bright primary while `hovered`, else
/// `base`. Shared by the announcement renderer.
pub(super) fn hover_style(theme: &Theme, hovered: bool, base: Style) -> Style {
    if hovered {
        Style::default().fg(theme.text_primary)
    } else {
        base
    }
}

/// Horizontal margin (left and right) in normal mode.
const H_MARGIN: u16 = 2;
/// Horizontal margin in compact mode.
const H_MARGIN_COMPACT: u16 = 1;

/// Minimum width for menu sections so they don't resize when the import row toggles.
/// Derivation: "[ " (2) + import-claude label (22) + gap (4) + "ctrl+i  [x]" (11) + " ]" (2) = 41.
/// Bumped to 51 for comfortable breathing room.
const MENU_MIN_WIDTH: u16 = 51;

/// Whether the welcome prompt is currently focused (accepting text input).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum WelcomePromptFocus {
    #[default]
    Unfocused,
    Focused,
}

/// Result of rendering the welcome screen.
#[derive(Default)]
pub struct WelcomeRenderResult {
    /// Cursor position (if the prompt wants a visible cursor).
    pub cursor_pos: Option<(u16, u16)>,
    /// Terminal image/cursor escapes paired with their ownership transition.
    pub post_flush_escapes: Option<crate::terminal::overlay::PostFlush>,
    /// Hit-test rects for each menu item (for click/hover).
    pub menu_rects: Vec<Rect>,
    /// Hit-test rect for the prompt input area (for click to start session).
    pub prompt_rect: Option<Rect>,
    /// Hit-test rect for the import-claude banner (for click to open import modal).
    pub import_banner_rect: Option<Rect>,
    /// Hit areas from the session picker (for mouse hit-testing).
    pub session_picker_hit_areas: Option<crate::views::picker::PickerHitAreas>,
    /// Whether the announcement overflowed (the "expandable" signal).
    pub announcement_truncated: bool,
    /// Hit-test rect for the full announcement block (click anywhere to toggle).
    pub announcement_rect: Option<Rect>,
    /// Hit-test rect for the promo upgrade CTA `[label]` button (click → open).
    pub upgrade_cta_rect: Option<Rect>,
    /// Hit-test rects for the chat workspace-mode segmented control.
    #[cfg(feature = "local-workspace")]
    pub workspace_mode_rects: WorkspaceModeHitRects,
}

use hero_box::HERO_BOX_MIN_WIDTH;

/// Prompt input height (shared across hero and stacked layout paths).
const PROMPT_HEIGHT: u16 = 3;
/// Gap between prompt and version line.
const VERSION_GAP: u16 = 1;

/// Computed areas for the welcome screen vertical layout.
pub(super) struct WelcomeLayout {
    pub(super) logo: Rect,
    pub(super) error: Rect,
    pub(super) menu: Rect,
    /// Stacked info slot below the menu (narrow layout only) — shows the
    /// announcement. Zero in the hero box layout, which uses `hero_info` instead.
    pub(super) info: Rect,
    pub(super) tip: Rect,
    pub(super) prompt: Rect,
    pub(super) version: Rect,
    // Hero box sub-rects (all zero when hero box is inactive).
    pub(super) hero_box: Rect,
    pub(super) hero_logo: Rect,
    pub(super) hero_version: Rect,
    pub(super) hero_subtitle: Rect,
    /// In-box info slot — shows the announcement when present.
    pub(super) hero_info: Rect,
    pub(super) hero_menu: Rect,
}

/// Inputs to [`WelcomeLayout::compute`] / [`WelcomeLayout::compute_stacked`].
///
/// Bundled (and `Default`-able) so call sites name each field — in particular
/// the two distinct compaction flags can't be silently transposed.
#[derive(Default)]
struct WelcomeLayoutInput<'a> {
    content_area: Rect,
    /// Error/warning row height; 0 when there's nothing to show.
    error_height: u16,
    menu_height: u16,
    tip_height: u16,
    /// Vertical compaction (session picker visible): skip the logo + info slot.
    compact: bool,
    /// Horizontal-inset compaction (appearance setting) for the stacked slot.
    prompt_compact: bool,
    announcement: Option<&'a nofy_announcements::RemoteAnnouncement>,
    /// Whether a long announcement is expanded inline (vs. collapsed to 2 lines).
    expanded: bool,
    /// Whether the info slot reserves a promo upgrade CTA (spacer + button).
    has_upgrade_cta: bool,
}

impl WelcomeLayout {
    /// Whether the hero box (side-by-side logo + menu inside a border) is active.
    pub(super) fn has_hero_box(&self) -> bool {
        self.hero_box.width > 0 && self.hero_box.height > 0
    }

    pub(super) fn fixed_below(tip_height: u16) -> u16 {
        let tip_gap = if tip_height > 0 { 1u16 } else { 0 };
        tip_height + tip_gap + PROMPT_HEIGHT + VERSION_GAP + 1
    }

    pub(super) fn effective_info_slot(
        content_height: u16,
        fixed_above: u16,
        content_slot: u16,
        fixed_below: u16,
        requested: u16,
    ) -> (u16, u16) {
        let gap = if requested > 0 { 1u16 } else { 0 };
        let min_without = fixed_above + content_slot + 1 + fixed_below;
        if requested > 0 && content_height >= min_without + gap + requested {
            (requested, 1)
        } else {
            (0, 0)
        }
    }

    /// Compute the welcome screen layout, allowing the wide hero-box variant.
    fn compute(input: WelcomeLayoutInput<'_>) -> Self {
        Self::compute_inner(input, true)
    }

    /// Compute the welcome screen layout, forced to the stacked variant.
    ///
    /// The blocked screen (no-credentials API-key guidance) renders through
    /// `render_welcome_blocked`, which only paints the stacked `logo`/`menu`
    /// rects (and never an announcement). The hero-box layout zeroes those, so
    /// the blocked path must stay stacked regardless of terminal size.
    fn compute_stacked(input: WelcomeLayoutInput<'_>) -> Self {
        Self::compute_inner(input, false)
    }

    /// Compute the welcome screen layout.
    ///
    /// Picks hero vs stacked, then measures the info slot (announcement) at
    /// that layout's slot width before placing rects — width is
    /// content-size-only, so it's a clean two-phase computation. `allow_hero_box`
    /// gates the wide variant; stacked-only callers pass `false`.
    fn compute_inner(input: WelcomeLayoutInput<'_>, allow_hero_box: bool) -> Self {
        let WelcomeLayoutInput {
            content_area,
            error_height,
            menu_height,
            tip_height,
            compact,
            prompt_compact,
            announcement,
            expanded,
            has_upgrade_cta,
        } = input;
        let zero = Rect::default();
        // Pick hero vs stacked first, independent of the announcement's height:
        // the announcement clamps to fit, so with one present the box only
        // needs to fit empty.
        let use_hero_box = allow_hero_box
            && !compact
            && content_area.width >= HERO_BOX_MIN_WIDTH
            && menu_height > 0
            && content_area.height
                >= hero_box::min_content_height(error_height, menu_height, tip_height, 0);

        if use_hero_box {
            // The hero box measures + clamps the announcement itself.
            return hero_box::compute_hero_box(
                content_area,
                error_height,
                menu_height,
                tip_height,
                announcement,
                expanded,
                has_upgrade_cta,
            );
        }

        // Stacked info slot: the announcement clamped to the column budget.
        // Measure at the centered menu width inside the inset.
        let info_height = match announcement {
            Some(ann) => {
                let avail = content_area
                    .width
                    .saturating_sub(prompt::prompt_inset(prompt_compact) * 2);
                let width = stacked_info_width(avail, content_area.height, MENU_MIN_WIDTH);
                hero_box::announcement_desired_rows(ann, width, expanded, has_upgrade_cta).min(
                    stacked_info_budget(
                        content_area,
                        error_height,
                        menu_height,
                        tip_height,
                        compact,
                    ),
                )
            }
            None => 0,
        };

        // Stacked layout: skip the logo in compact mode (the session picker
        // needs the space); otherwise pick small/full/none by height.
        let logo_rows = if compact {
            0
        } else {
            logo_line_count(content_area.height)
        };

        let gap_after_logo = if error_height > 0 { 1 } else { 0 };
        let tip_gap = if tip_height > 0 { 1u16 } else { 0 };
        let fixed_below = Self::fixed_below(tip_height);
        let fixed_above = logo_rows + 1 + gap_after_logo + error_height; // +1 for gap after logo
        // The stacked info slot below the menu holds the announcement,
        // matching the hero box's single-slot rule.
        let (eff_info_height, _) = if !compact {
            Self::effective_info_slot(
                content_area.height,
                fixed_above,
                menu_height,
                fixed_below,
                info_height,
            )
        } else {
            (0, 0)
        };
        let eff_info_gap = if eff_info_height > 0 { 1u16 } else { 0 };
        // Compute top_pad using the *default* menu height (3 items) so
        // the logo position stays constant regardless of picker/focus state.
        let top_pad = if compact {
            0
        } else {
            let default_menu_height = 3u16;
            let remaining = content_area.height.saturating_sub(fixed_above);
            remaining
                .saturating_sub(default_menu_height)
                .saturating_sub(eff_info_gap + eff_info_height)
                .saturating_sub(fixed_below)
                / 3
        };
        let logo_gap = 1u16;
        let flex_gap = 1u16;
        let [
            _,
            logo,
            _,
            _,
            error,
            menu,
            _,
            info,
            _,
            tip,
            _,
            prompt,
            _,
            version,
        ] = Layout::vertical([
            Constraint::Length(top_pad),
            Constraint::Length(logo_rows),
            Constraint::Length(logo_gap), // gap after logo
            Constraint::Length(gap_after_logo),
            Constraint::Length(error_height),
            Constraint::Length(menu_height),
            Constraint::Length(eff_info_gap),
            Constraint::Length(eff_info_height),
            Constraint::Min(flex_gap),
            Constraint::Length(tip_height),
            Constraint::Length(tip_gap),
            Constraint::Length(PROMPT_HEIGHT),
            Constraint::Length(VERSION_GAP),
            Constraint::Length(1), // version
        ])
        .areas(content_area);
        Self {
            logo,
            error,
            menu,
            info,
            tip,
            prompt,
            version,
            hero_box: zero,
            hero_logo: zero,
            hero_version: zero,
            hero_subtitle: zero,
            hero_info: zero,
            hero_menu: zero,
        }
    }
}

/// Controls what the version badge renders.
pub(super) enum VersionBadgeMode {
    /// Full badge: team | api_key | **Nofy Build** VERSION (right-aligned).
    Full,
    /// Hero footer: team | api_key (right-aligned, gray).
    HeroFooter,
    /// Hero inline: **Nofy Build**  VERSION (left-aligned).
    HeroInline,
}

pub(super) fn render_version_badge(
    version_rect: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    team_name: Option<&str>,
    h_margin: u16,
    is_api_key_auth: bool,
    mode: VersionBadgeMode,
) {
    let version_area = Rect {
        width: version_rect.width.saturating_sub(h_margin),
        ..version_rect
    };
    const SEP: &str = "  \u{2502}  ";
    let sep = Span::styled(
        SEP,
        Style::default().fg(theme.gray).add_modifier(Modifier::DIM),
    );
    let mut spans = Vec::new();

    let (show_team, show_api_key, align) = match &mode {
        VersionBadgeMode::Full => (true, true, Alignment::Right),
        VersionBadgeMode::HeroFooter => (true, true, Alignment::Right),
        VersionBadgeMode::HeroInline => (false, false, Alignment::Left),
    };

    if show_team && let Some(team) = team_name {
        spans.push(Span::styled(team, Style::default().fg(theme.gray)));
        spans.push(sep.clone());
    }
    if show_api_key && is_api_key_auth {
        spans.push(Span::styled(
            "Logged in with API key",
            Style::default().fg(theme.gray),
        ));
        spans.push(sep);
    }

    match &mode {
        VersionBadgeMode::Full => {
            spans.push(Span::styled(
                "Nofy Build  ",
                Style::default()
                    .fg(theme.text_primary)
                    .add_modifier(Modifier::BOLD),
            ));
            spans.push(Span::styled(
                nofy_version::VERSION,
                Style::default().fg(theme.gray),
            ));
        }
        VersionBadgeMode::HeroFooter => {}
        VersionBadgeMode::HeroInline => {
            spans.push(Span::styled(
                "Nofy Build  ",
                Style::default()
                    .fg(theme.text_primary)
                    .add_modifier(Modifier::BOLD),
            ));
            spans.push(Span::styled(
                nofy_version::VERSION,
                Style::default().fg(theme.gray),
            ));
        }
    }

    // The spans can end on a separator when the trailing fields are absent.
    if spans.last().is_some_and(|s| s.content == SEP) {
        spans.pop();
    }

    let version_line = Line::from(spans).alignment(align);
    Paragraph::new(version_line).render(version_area, buf);
}

/// Render the prompt box and version line (shared across welcome states).
///
/// When `skip_version` is true the version badge is not rendered (it was
/// already drawn inside the hero box).
#[allow(clippy::too_many_arguments)]
fn render_prompt_and_version(
    layout: &WelcomeLayout,
    content_width: u16,
    buf: &mut Buffer,
    theme: &Theme,
    focus: WelcomePromptFocus,
    prompt: &mut PromptWidget,
    info: &PromptInfo<'_>,
    tip: Option<&str>,
    team_name: Option<&str>,
    h_margin: u16,
    compact: bool,
    pending_hint: Option<crate::views::shortcuts_bar::PendingHint>,
    is_api_key_auth: bool,
    skip_version: bool,
) -> (
    Option<(u16, u16)>,
    Option<crate::terminal::overlay::PostFlush>,
) {
    let [_, prompt_centered, _] = Layout::horizontal([
        Constraint::Min(0),
        Constraint::Length(content_width),
        Constraint::Min(0),
    ])
    .flex(Flex::Center)
    .areas(layout.prompt);

    if let Some(tip_text) = tip
        && layout.tip.height > 0
    {
        let [_, tip_centered, _] = Layout::horizontal([
            Constraint::Min(0),
            Constraint::Length(content_width),
            Constraint::Min(0),
        ])
        .flex(Flex::Center)
        .areas(layout.tip);
        let inset = prompt::prompt_inset(compact);
        let tip_inset = Rect {
            x: tip_centered.x + inset,
            y: tip_centered.y,
            width: tip_centered.width.saturating_sub(inset * 2),
            height: tip_centered.height,
        };
        crate::tips::render::render_tip(tip_inset, buf, tip_text);
    }
    let prompt_result =
        prompt::render_prompt(prompt_centered, buf, focus, prompt, info, 2, 2, compact);

    if let Some(pending) = &pending_hint {
        let key_style = Style::default()
            .fg(theme.text_primary)
            .add_modifier(Modifier::BOLD);
        let action_style = Style::default().fg(theme.gray);
        let key_text = pending.shortcut.display();
        let label = format!("press again to {}", pending.label);
        let line = Line::from(vec![
            Span::styled(format!("  {key_text}"), key_style),
            Span::styled(":", action_style),
            Span::styled(label, action_style),
        ]);
        buf.set_line(
            layout.version.x,
            layout.version.y,
            &line,
            layout.version.width,
        );
    } else if !skip_version {
        render_version_badge(
            layout.version,
            buf,
            theme,
            team_name,
            h_margin,
            is_api_key_auth,
            VersionBadgeMode::Full,
        );
    } else {
        render_version_badge(
            layout.version,
            buf,
            theme,
            team_name,
            h_margin,
            is_api_key_auth,
            VersionBadgeMode::HeroFooter,
        );
    }

    prompt_result
}

/// All display state for rendering the welcome screen.
pub struct WelcomeRenderParams<'a> {
    pub prompt_focus: WelcomePromptFocus,
    pub auth_state: &'a AuthState,
    /// Folder-trust state. When `Pending` (auth done, access granted), the
    /// welcome screen renders the trust question instead of the normal prompt.
    pub trust_state: &'a TrustState,
    pub announcement: Option<&'a nofy_announcements::RemoteAnnouncement>,
    pub tip: Option<&'a str>,
    pub model_name: &'a str,
    pub flags: &'a [PromptFlag<'a>],
    pub selected: Option<usize>,
    pub team_name: Option<&'a str>,
    pub has_claude_import: bool,
    pub mouse_pos: Option<(u16, u16)>,
    pub session_picker: Option<&'a [SessionPickerEntry]>,
    pub session_picker_loading: bool,
    pub compact: bool,
    pub pending_hint: Option<crate::views::shortcuts_bar::PendingHint>,
    pub startup_warnings: &'a [StartupWarning],
    /// Recent foreign session offered on ctrl+u.
    pub foreign_resume_hint: Option<&'a nofy_workspace::foreign_sessions::RecentForeignSession>,
    pub is_api_key_auth: bool,
    pub session_picker_content_results:
        Option<&'a [nofy_shell::extensions::session_search::SearchSessionHit]>,
    pub session_picker_content_loading: bool,
    /// The query the picker entries were server-fetched with (see
    /// [`crate::views::session_picker::effective_filter_query`]).
    pub session_picker_entries_query: Option<&'a str>,
    pub welcome_tick: u64,
    pub session_picker_grouped: bool,
    /// Source filter for the session picker.
    pub session_picker_source_filter: crate::views::session_picker::SourceFilter,
    pub session_picker_pending_delete: bool,
    /// Process-wide `--chat`: the picker lists backend conversations only, so
    /// the source filter and local deep search are hidden.
    pub chat_mode: bool,
    /// Live working directory (tracks `Effect::SetWorkingDir`), used to pin
    /// the current repo's session group to the top of the picker.
    pub cwd: &'a std::path::Path,
    /// Whether a long managed-config announcement is expanded inline (vs the
    /// default 2-line collapsed view with a trailing `…`).
    pub welcome_announcement_expanded: bool,
    /// Promo upgrade CTA `[label]` to paint below the hero announcement: `Some`
    /// drives both the reserved row height and the `[label]` button. `None` = no
    /// CTA on the welcome screen.
    pub upgrade_cta: Option<&'a str>,
    /// Chat-mode workspace picker selection (`local-workspace` feature).
    #[cfg(feature = "local-workspace")]
    pub workspace_mode: WelcomeWorkspaceMode,
    /// CLI/env already stamped local workspace — picker is display-only.
    #[cfg(feature = "local-workspace")]
    pub workspace_mode_startup_locked: bool,
    /// In-TUI ACK confirm pending for Local.
    #[cfg(feature = "local-workspace")]
    pub workspace_mode_ack_pending: bool,
}

/// Render the welcome screen.
pub fn render_welcome(
    area: Rect,
    buf: &mut Buffer,
    params: &WelcomeRenderParams<'_>,
    prompt: &mut PromptWidget,
    session_picker_state: &mut crate::views::picker::PickerState,
) -> WelcomeRenderResult {
    let theme = Theme::current();
    let h_margin = if params.compact {
        H_MARGIN_COMPACT
    } else {
        H_MARGIN
    };
    let v_margin = 1u16;

    buf.set_style(area, Style::default().bg(theme.bg_base));

    // Announcements only render inside the hero box. Top bar is always 1 row.
    let [_, top_bar_area, content_area, _] = Layout::vertical([
        Constraint::Length(v_margin),
        Constraint::Length(1),
        Constraint::Min(10),
        Constraint::Length(v_margin),
    ])
    .areas(area);

    let top_bar_inner = Rect {
        x: top_bar_area.x + h_margin,
        y: top_bar_area.y,
        width: top_bar_area.width.saturating_sub(h_margin * 2),
        height: 1,
    };
    render_top_bar(top_bar_inner, buf, &theme, None);

    let mut result = match params.auth_state {
        AuthState::Pending { error } => {
            // No usable credentials: guide the user to configure an API key.
            let menu = [("q", "Quit")];
            let msg = match error.as_deref() {
                Some(e) => (e, theme.accent_error),
                None => (
                    "No API key configured. Set NOFY_API_KEY or add api_key/env_key to ~/.nofy/config.toml.",
                    theme.gray_bright,
                ),
            };
            let (menu_rects, post_flush_escapes) = render_welcome_blocked(
                content_area,
                buf,
                Some(msg),
                &menu,
                params.selected,
                None,
                h_margin,
                params.compact,
            );
            WelcomeRenderResult {
                cursor_pos: None,
                post_flush_escapes,
                menu_rects,
                ..Default::default()
            }
        }
        // Folder-trust question: shown after auth, before any session is
        // created, when the cwd has untrusted repo-local config. Mirrors the
        // Pending screen. The `if let` destructure
        // makes the `Pending`-only render structurally exhaustive (no
        // `unreachable!`).
        AuthState::Done => {
            if let TrustState::Pending { workspace } = params.trust_state {
                render_welcome_trust(
                    content_area,
                    buf,
                    &theme,
                    workspace,
                    params.selected,
                    h_margin,
                    params.compact,
                )
            } else {
                render_welcome_done(
                    content_area,
                    buf,
                    &theme,
                    params,
                    prompt,
                    session_picker_state,
                    h_margin,
                )
            }
        }
    };
    if result.post_flush_escapes.is_none() {
        result.post_flush_escapes = crate::terminal::overlay::clear().map(Into::into);
    }
    result
}

/// Render a blocked welcome screen: logo + optional message + menu + version.
///
/// Used for the no-credentials screen (Pending). The layout is:
///   Logo
///   {message}
///   Menu items
///   {prompt}      (optional)
///   Version badge
#[allow(clippy::too_many_arguments)]
fn render_welcome_blocked(
    content_area: Rect,
    buf: &mut Buffer,
    message: Option<(&str, ratatui::style::Color)>,
    menu_items: &[(&str, &str)],
    selected: Option<usize>,
    prompt: Option<(&mut PromptWidget, &PromptInfo<'_>)>,
    h_margin: u16,
    compact: bool,
) -> (Vec<Rect>, Option<crate::terminal::overlay::PostFlush>) {
    let theme = Theme::current();

    let msg_height = if message.is_some() { 2u16 } else { 0u16 };
    let menu_height = menu_items.len() as u16;
    // Force the stacked layout: this renderer only paints the stacked
    // logo/menu rects, which the hero-box layout would leave empty.
    let layout = WelcomeLayout::compute_stacked(WelcomeLayoutInput {
        content_area,
        error_height: msg_height,
        menu_height,
        compact,
        prompt_compact: compact,
        ..Default::default()
    });

    render_logo(layout.logo, buf, &theme, content_area.height);

    if let Some((text, color)) = message {
        let line =
            Line::from(Span::styled(text, Style::default().fg(color))).alignment(Alignment::Center);
        Paragraph::new(line).render(layout.error, buf);
    }

    // Inset the menu the same as the input bar / post-auth menu so the actions
    // keep side spacing instead of touching the window edge on narrow terminals.
    let menu_area = inset_horizontal(layout.menu, prompt::prompt_inset(compact));
    let menu_rects = render_menu(menu_area, buf, &theme, menu_items, selected, None, 0);

    let post_flush_escapes = if let Some((prompt_widget, info)) = prompt {
        let [_, prompt_centered, _] = Layout::horizontal([
            Constraint::Min(0),
            Constraint::Length(content_area.width),
            Constraint::Min(0),
        ])
        .flex(Flex::Center)
        .areas(layout.prompt);
        prompt::render_prompt(
            prompt_centered,
            buf,
            WelcomePromptFocus::Unfocused,
            prompt_widget,
            info,
            2,
            2,
            compact,
        )
        .1
    } else {
        None
    };

    render_version_badge(
        layout.version,
        buf,
        &theme,
        None,
        h_margin,
        false,
        VersionBadgeMode::Full,
    );
    (menu_rects, post_flush_escapes)
}

/// Render the folder-trust question. Mirrors [`render_welcome_blocked`]'s
/// stacked layout (logo + message + menu + version badge), but the message is a
/// multi-line block showing the workspace path and the warning that Nofy Build
/// may run or modify contents in this directory (a security risk). The y/N
/// answer is handled by the welcome input interceptor, so this only paints;
/// `menu_rects` are returned for parity with the other welcome arms.
fn render_welcome_trust(
    content_area: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    workspace: &std::path::Path,
    selected: Option<usize>,
    h_margin: u16,
    compact: bool,
) -> WelcomeRenderResult {
    let menu_items = [("y", "Yes, proceed"), ("n", "No, quit")];
    let lines = vec![
        Line::from(Span::styled(
            "Do you trust the contents of this directory?",
            Style::default().fg(theme.gray_bright),
        ))
        .alignment(Alignment::Center),
        Line::from(Span::styled(
            workspace.display().to_string(),
            Style::default().fg(theme.accent_user),
        ))
        .alignment(Alignment::Center),
        Line::default(),
        // Two lines so the warning never clips at narrow / compact widths
        // (a single ~78-char line would truncate "...posing security risks").
        Line::from(Span::styled(
            "Nofy Build may run or modify contents in this directory,",
            Style::default().fg(theme.gray),
        ))
        .alignment(Alignment::Center),
        Line::from(Span::styled(
            "posing security risks.",
            Style::default().fg(theme.gray),
        ))
        .alignment(Alignment::Center),
        // Spacer between the warning and the y/n menu.
        Line::default(),
    ];

    let msg_height = lines.len() as u16;
    let menu_height = menu_items.len() as u16;
    let layout = WelcomeLayout::compute_stacked(WelcomeLayoutInput {
        content_area,
        error_height: msg_height,
        menu_height,
        compact,
        prompt_compact: compact,
        ..Default::default()
    });

    render_logo(layout.logo, buf, theme, content_area.height);
    Paragraph::new(lines).render(layout.error, buf);

    let menu_area = inset_horizontal(layout.menu, prompt::prompt_inset(compact));
    let menu_rects = render_menu(menu_area, buf, theme, &menu_items, selected, None, 0);

    render_version_badge(
        layout.version,
        buf,
        theme,
        None,
        h_margin,
        false,
        VersionBadgeMode::Full,
    );

    // Only `menu_rects` are meaningful here; the rest are absent (no prompt,
    // picker) -- `Default` keeps this honest without a 13-field
    // all-`None` literal.
    WelcomeRenderResult {
        menu_rects,
        ..Default::default()
    }
}

/// Shrink a rect by `inset` columns on the left and right (clamped at 0).
fn inset_horizontal(rect: Rect, inset: u16) -> Rect {
    Rect {
        x: rect.x + inset,
        width: rect.width.saturating_sub(inset * 2),
        ..rect
    }
}

/// Wrap width of the stacked info slot, centered at the menu width inside the
/// inset. Both `compute`'s height measurement and `render_announcement_section`
/// go through here — same width, no drift. `logo_height` selects the min menu
/// width.
fn stacked_info_width(avail_width: u16, logo_height: u16, min_width_hint: u16) -> u16 {
    logo::logo_visual_width(logo_height)
        .max(30)
        .max(min_width_hint)
        .min(avail_width)
}

/// Largest info-slot height the stacked column can allocate, mirroring
/// [`WelcomeLayout::effective_info_slot`]. Compact never shows the slot.
fn stacked_info_budget(
    content_area: Rect,
    error_height: u16,
    menu_height: u16,
    tip_height: u16,
    compact: bool,
) -> u16 {
    if compact {
        return 0;
    }
    let logo_rows = logo_line_count(content_area.height);
    let gap_after_logo = if error_height > 0 { 1u16 } else { 0 };
    let fixed_above = logo_rows + 1 + gap_after_logo + error_height;
    let fixed_below = WelcomeLayout::fixed_below(tip_height);
    // +1 info-slot gap, +1 min flex gap above the tip.
    content_area
        .height
        .saturating_sub(fixed_above + menu_height + 1 + fixed_below + 1)
}

/// Render the announcement in the stacked info slot, centered to the menu width.
/// Returns `(block_rect, truncated)`: the clickable block and the overflow flag.
#[allow(clippy::too_many_arguments)]
fn render_announcement_section(
    area: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    announcement: &nofy_announcements::RemoteAnnouncement,
    min_width_hint: u16,
    content_height: u16,
    expanded: bool,
    mouse_pos: Option<(u16, u16)>,
    upgrade_cta: Option<&str>,
) -> (Option<Rect>, bool, Option<Rect>) {
    // Same width the height pre-pass reserved for (see `stacked_info_width`).
    let menu_width = stacked_info_width(area.width, content_height, min_width_hint);
    let [_, centered, _] = Layout::horizontal([
        Constraint::Min(0),
        Constraint::Length(menu_width),
        Constraint::Min(0),
    ])
    .flex(Flex::Center)
    .areas(area);

    if centered.width < 20 || centered.height == 0 {
        return (None, false, None);
    }

    // Mirror the hero: reserve the CTA rows at the bottom, draw the text into
    // what's left, then place the `[label]` button right after the drawn text.
    let (text_area, truncated, cta_rect) = hero_box::render_announcement_with_upgrade_cta(
        buf,
        theme,
        centered,
        announcement,
        expanded,
        mouse_pos,
        upgrade_cta,
    );
    (Some(text_area), truncated, cta_rect)
}

/// Render the normal welcome screen (Done state -- already authenticated).
fn render_welcome_done(
    content_area: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    p: &WelcomeRenderParams<'_>,
    prompt: &mut PromptWidget,
    session_picker_state: &mut crate::views::picker::PickerState,
    h_margin: u16,
) -> WelcomeRenderResult {
    let show_picker = p.session_picker.is_some() || p.session_picker_loading;
    // Only use compact layout when the session picker is visible — it needs
    // the logo/centering space for its list. Plain compact mode keeps the
    // normal welcome layout.
    let welcome_compact = show_picker;

    let in_vscode_family = welcome_in_vscode_family();

    // Heights that don't depend on the menu — computed first so the menu
    // builder can probe the layout.
    // Startup-warning hint height (multi-line aware). Must pick the same
    // entry `render_startup_warnings` draws — see `startup::banner_warning`.
    let hint_height = crate::startup::banner_warning(p.startup_warnings).map_or(0u16, |w| {
        let msg_lines = w.message.lines().count() as u16;
        let action_line = if w.action.is_some() { 1 } else { 0 };
        msg_lines + action_line + 1 // +1 for buffer spacing
    });
    let has_resume_tip = p.foreign_resume_hint.is_some();
    // Tip slot precedence: resume hint > random tip.
    let tip_height = if !show_picker {
        if has_resume_tip {
            1u16
        } else if let Some(tip_text) = p.tip {
            let inset = prompt::prompt_inset(welcome_compact);
            let tip_width = content_area.width.saturating_sub(inset * 2);
            crate::tips::render::tip_height(tip_width, tip_text)
        } else {
            0
        }
    } else {
        0
    };

    let owned_menu;
    let menu_items: &[(&str, &str)] = {
        let (key_w, key_s, key_q, key_i_with_x) = (
            "ctrl+w",
            "ctrl+s",
            if in_vscode_family { "ctrl+d" } else { "ctrl+q" },
            "ctrl+i  [x]",
        );
        // Insert the import row at the top when there are pending `.claude/`
        // settings to import — it's the most actionable item right now.
        let mut items: Vec<(&str, &str)> = Vec::with_capacity(5);
        if p.has_claude_import {
            // The trailing "[x]" is a clickable dismiss affordance — the
            // welcome screen mouse handler treats clicks on the rightmost
            // 3 cells of this row as dismiss instead of open. Keyboard:
            // ctrl-shift-i. The key string is right-aligned by render_menu,
            // so [x] sits at the very end of the row.
            items.push((key_i_with_x, "Import Claude settings"));
        }
        items.push((key_w, "New worktree"));
        items.push((key_s, "Resume session"));
        items.push((key_q, "Quit"));
        owned_menu = items;
        owned_menu.as_slice()
    };

    #[cfg(feature = "local-workspace")]
    // Keep the segmented control (and ACK y/N) visible when history is open
    // if first-run Local ACK is pending — otherwise the confirm is unpainted
    // while the ACK handler still swallows keys.
    let show_workspace_picker = p.chat_mode && (!show_picker || p.workspace_mode_ack_pending);
    #[cfg(feature = "local-workspace")]
    let workspace_picker_rows = if show_workspace_picker {
        workspace_mode::WORKSPACE_MODE_MENU_ROWS
    } else {
        0
    };
    #[cfg(not(feature = "local-workspace"))]
    let workspace_picker_rows = 0u16;

    let menu_height = if show_picker {
        0
    } else {
        menu_items.len() as u16 + workspace_picker_rows
    };

    // Session picker height: 1 row per entry (no dividers), scrollable.
    let picker_count = p.session_picker.map_or(0, |s| s.len());
    let picker_height = if show_picker {
        if p.session_picker_loading {
            1
        } else {
            // Reserve a row for the pinned hidden-external hint when shown.
            let hint_row = u16::from(
                !p.chat_mode
                    && crate::views::session_picker::hidden_external_hint(
                        p.session_picker,
                        p.session_picker_source_filter,
                    )
                    .is_some(),
            );
            (picker_count as u16).min(15) + 3 + hint_row // +3 for title + search + gap
        }
    } else {
        0
    };
    let content_height = menu_height + picker_height;
    // The layout measures the announcement slot itself (collapsed: title + up to
    // 2 wrapped lines; expanded: the full message, clamped so the box fits).
    let layout = WelcomeLayout::compute(WelcomeLayoutInput {
        content_area,
        error_height: hint_height,
        menu_height: content_height,
        tip_height,
        compact: welcome_compact,
        prompt_compact: p.compact,
        announcement: p.announcement,
        expanded: p.welcome_announcement_expanded,
        has_upgrade_cta: p.upgrade_cta.is_some(),
    });

    // Render startup warning in the error area (same slot as auth errors).
    let import_banner_rect = render_startup_warnings(layout.error, buf, theme, p.startup_warnings);

    // Hit-rects / truncation flag, set by whichever layout draws each block.
    let mut announcement_truncated = false;
    let mut announcement_rect: Option<Rect> = None;
    let mut upgrade_cta_rect: Option<Rect> = None;

    #[cfg(feature = "local-workspace")]
    let mut workspace_mode_rects = WorkspaceModeHitRects::default();
    let (menu_rects, picker_close_button) = if show_picker {
        // Use the full area since logo/menu are hidden and shortcuts
        // are now rendered inside the picker content area.
        let picker_area = Rect {
            x: content_area.x,
            y: content_area.y,
            width: content_area.width,
            height: content_area.height,
        };
        let hit_areas = render_session_picker(
            picker_area,
            buf,
            theme,
            &mut SessionPickerRenderCtx {
                state: session_picker_state,
                sessions: p.session_picker,
                loading: p.session_picker_loading,
                pending_hint: p.pending_hint,
                shortcuts_area: None,
                content_results: p.session_picker_content_results,
                content_loading: p.session_picker_content_loading,
                entries_query: p.session_picker_entries_query,
                tick: p.welcome_tick,
                grouped: p.session_picker_grouped,
                source_filter: p.session_picker_source_filter,
                pending_delete: p.session_picker_pending_delete,
                chat_mode: p.chat_mode,
                cwd: p.cwd,
            },
        );
        (vec![], Some(hit_areas))
    } else if layout.has_hero_box() {
        // Wide layout: render bordered hero box with logo left, version + menu right.
        let rects = hero_box::render_hero_box(
            &layout,
            buf,
            theme,
            menu_items,
            p.selected,
            p.mouse_pos,
            p.announcement,
            p.welcome_announcement_expanded,
            p.upgrade_cta,
            #[cfg(feature = "local-workspace")]
            show_workspace_picker.then_some((
                p.workspace_mode,
                p.workspace_mode_startup_locked,
                p.workspace_mode_ack_pending,
            )),
        );
        announcement_truncated = rects.announcement_truncated;
        announcement_rect = rects.announcement_rect;
        upgrade_cta_rect = rects.upgrade_cta_rect;
        #[cfg(feature = "local-workspace")]
        {
            workspace_mode_rects = rects.workspace_mode_rects;
        }
        (rects.menu_rects, None)
    } else {
        // Narrow layout: stacked logo above, menu below. Inset the menu the
        // same as the input bar (`prompt_inset`) so it keeps side spacing
        // instead of touching the window edge on narrow terminals.
        render_logo(layout.logo, buf, theme, content_area.height);
        let menu_area = inset_horizontal(layout.menu, prompt::prompt_inset(p.compact));
        #[cfg(feature = "local-workspace")]
        let menu_area = if show_workspace_picker {
            let picker_rect = workspace_mode::picker_area(menu_area);
            workspace_mode_rects = render_workspace_mode_picker(
                picker_rect,
                buf,
                theme,
                p.workspace_mode,
                p.mouse_pos,
                p.workspace_mode_startup_locked,
                p.workspace_mode_ack_pending,
            );
            Rect {
                y: menu_area.y + workspace_mode::WORKSPACE_MODE_MENU_ROWS,
                height: menu_area
                    .height
                    .saturating_sub(workspace_mode::WORKSPACE_MODE_MENU_ROWS),
                ..menu_area
            }
        } else {
            menu_area
        };
        (
            render_menu(
                menu_area,
                buf,
                theme,
                menu_items,
                p.selected,
                p.mouse_pos,
                MENU_MIN_WIDTH,
            ),
            None,
        )
    };

    // Stacked info slot below the menu (narrow layout): show the announcement,
    // mirroring the hero box. Inset to match the input bar so it lines up with
    // the menu above.
    if layout.info.height > 0
        && let Some(ann) = p.announcement
    {
        let info_area = inset_horizontal(layout.info, prompt::prompt_inset(p.compact));
        let (block, truncated, cta_rect) = render_announcement_section(
            info_area,
            buf,
            theme,
            ann,
            MENU_MIN_WIDTH,
            content_area.height,
            p.welcome_announcement_expanded,
            p.mouse_pos,
            p.upgrade_cta,
        );
        announcement_rect = block;
        announcement_truncated = truncated;
        upgrade_cta_rect = cta_rect;
    }

    // Skip the prompt input when picker is visible to save space;
    // shortcuts are rendered inside the picker content area.
    let (cursor_pos, post_flush_escapes) = if show_picker {
        (None, None)
    } else {
        // Recent foreign session: offer a one-click resume in the tip area.
        if let Some(hint) = p.foreign_resume_hint
            && layout.tip.height > 0
        {
            let [_, tip_centered, _] = Layout::horizontal([
                Constraint::Min(0),
                Constraint::Length(content_area.width),
                Constraint::Min(0),
            ])
            .flex(Flex::Center)
            .areas(layout.tip);
            let inset = prompt::prompt_inset(p.compact);
            let tip_inset = Rect {
                x: tip_centered.x + inset,
                y: tip_centered.y,
                width: tip_centered.width.saturating_sub(inset * 2),
                height: tip_centered.height,
            };
            let mins = hint.age.as_secs() / 60;
            let when = if mins == 0 {
                "moments ago".to_string()
            } else {
                format!("{mins}m ago")
            };
            let accent = Style::default().fg(theme.accent_user);
            let accent_bold = accent.add_modifier(Modifier::BOLD);
            let tool = crate::app::foreign_tool_display_label(hint.tool);
            let line = Line::from(vec![
                Span::styled("Coming from ", accent),
                Span::styled(tool, accent_bold),
                Span::styled(format!("? Resume your session from {when} using "), accent),
                Span::styled("ctrl+u", accent_bold),
            ]);
            Paragraph::new(line)
                .style(Style::default().bg(theme.bg_base))
                .render(tip_inset, buf);
        }

        let usage_info = PromptInfo {
            model_name: p.model_name,
            flags: p.flags,
            multiline: false,
        };

        render_prompt_and_version(
            &layout,
            content_area.width,
            buf,
            theme,
            p.prompt_focus,
            prompt,
            &usage_info,
            if p.foreign_resume_hint.is_some() {
                // Resume tip already rendered above with custom styling.
                None
            } else {
                p.tip
            },
            p.team_name,
            h_margin,
            p.compact,
            p.pending_hint,
            p.is_api_key_auth,
            layout.has_hero_box(),
        )
    };

    WelcomeRenderResult {
        cursor_pos,
        post_flush_escapes,
        menu_rects,
        prompt_rect: if show_picker {
            None
        } else {
            Some(layout.prompt)
        },
        session_picker_hit_areas: picker_close_button,
        import_banner_rect,
        announcement_truncated,
        announcement_rect,
        upgrade_cta_rect,
        #[cfg(feature = "local-workspace")]
        workspace_mode_rects,
    }
}

/// Context for session picker rendering.
pub(crate) struct SessionPickerRenderCtx<'a> {
    pub(crate) state: &'a mut crate::views::picker::PickerState,
    pub(crate) sessions: Option<&'a [SessionPickerEntry]>,
    /// Live working directory (tracks `Effect::SetWorkingDir`), used to pin
    /// the current repo's group to the top.
    pub(crate) cwd: &'a std::path::Path,
    pub(crate) loading: bool,
    pub(crate) pending_hint: Option<crate::views::shortcuts_bar::PendingHint>,
    pub(crate) shortcuts_area: Option<Rect>,
    pub(crate) content_results:
        Option<&'a [nofy_shell::extensions::session_search::SearchSessionHit]>,
    pub(crate) content_loading: bool,
    /// The query `sessions` were server-fetched with (see
    /// [`crate::views::session_picker::effective_filter_query`]).
    pub(crate) entries_query: Option<&'a str>,
    pub(crate) tick: u64,
    /// When true, entries are grouped by `repo_name` with non-selectable headers.
    pub(crate) grouped: bool,
    /// Source filter for filtering session entries.
    pub(crate) source_filter: crate::views::session_picker::SourceFilter,
    pub(crate) pending_delete: bool,
    /// Process-wide `--chat`: hides the source-filter chip and the
    /// deep-search/filter footer hints (see `WelcomeRenderParams::chat_mode`).
    pub(crate) chat_mode: bool,
}

/// Render the session picker list on the welcome screen.
///
/// Builds `PickerEntry` items from `SessionPickerEntry` data and delegates to
/// `render_picker`. Returns `PickerHitAreas` for mouse hit-testing.
pub(crate) fn render_session_picker(
    area: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    ctx: &mut SessionPickerRenderCtx<'_>,
) -> crate::views::picker::PickerHitAreas {
    use crate::views::picker::{self, PickerConfig, PickerEntry, PickerField, PickerRow};
    use crate::views::session_picker::{
        SessionEntryData, build_grouped_picker_entries, build_session_entry_data,
    };

    let entries_data = match ctx.sessions {
        Some(s) => s,
        None => &[],
    };

    // Filter entries by query and source (shared helper). The same effective
    // query must drive filtering AND the content header/rows gates below, or
    // this render disagrees with `handle_welcome_input`'s `build_entry_map`
    // (which receives the effective query) on row indices.
    let filter_query =
        crate::views::session_picker::effective_filter_query(ctx.state.query(), ctx.entries_query);
    let filtered_indices =
        crate::app::app_view::filter_session_entries(ctx.sessions, filter_query, ctx.source_filter);

    let content_width = area.width; // approximate for truncation
    let built = build_session_entry_data(entries_data, &filtered_indices, ctx.state, content_width);

    // Build PickerEntry refs that borrow from `built`.
    let fields_vecs: Vec<Vec<PickerField>> = built
        .iter()
        .map(|b| {
            b.field_data
                .iter()
                .map(|(l, v)| PickerField { label: l, value: v })
                .collect()
        })
        .collect();

    // Build picker entries, optionally grouped by repo_name.
    let (mut picker_entries, non_selectable_indices) = if ctx.grouped {
        let current_repo =
            crate::views::session_picker::repo_name_from_cwd(&ctx.cwd.to_string_lossy());
        build_grouped_picker_entries(
            entries_data,
            &filtered_indices,
            &built,
            &fields_vecs,
            ctx.state,
            Some(current_repo.as_str()),
        )
    } else {
        let entries: Vec<PickerEntry> = built
            .iter()
            .zip(fields_vecs.iter())
            .map(|(b, fields)| {
                PickerEntry::Row(PickerRow {
                    label: &b.summary,
                    right_label: &b.right_text,
                    selected: b.is_selected,
                    expanded: b.is_expanded,
                    fields,
                    description_lines: &[],
                    summary_lines: &[],
                    dimmed: false,
                    indent: 0,
                    badge: b.badge,
                    badge_color: None,
                    collapsible: b.collapsible,
                    underline_last_desc: false,
                })
            })
            .collect();
        (entries, Vec::new())
    };

    // Append content search result rows (shared helper handles dedup).
    use crate::views::session_picker::{build_content_entry_data, build_content_header_label};
    // Content rows will start after fuzzy rows + 1 header row.
    let content_start = picker_entries.len() + 1;
    let content_entry_data: Vec<SessionEntryData> = if let Some(hits) = ctx.content_results
        && !ctx.source_filter.is_content_search_disabled()
        && !filter_query.is_empty()
    {
        build_content_entry_data(
            hits,
            entries_data,
            &filtered_indices,
            ctx.state,
            content_start,
        )
    } else {
        Vec::new()
    };

    // Show header only if there are actual deduped content rows to display.
    let has_content_rows = !content_entry_data.is_empty();
    let content_loading = ctx.content_loading && !ctx.source_filter.is_content_search_disabled();
    let spinner_label = build_content_header_label(content_loading, has_content_rows, ctx.tick);
    // Only show the header when content results exist or when content
    // search is in progress with a non-empty query.  This must match the
    // header condition inside `build_entry_map` as called from
    // `handle_welcome_input` (app_view.rs) so the input handler's
    // `entry_count` agrees with the rendered entry list — a mismatch causes
    // arrow-key selection to target the wrong row. Both sides therefore gate
    // on the same EFFECTIVE query (`filter_query`), not the live one.
    let show_content_header =
        has_content_rows || (content_loading && !filter_query.trim().is_empty());
    if show_content_header {
        picker_entries.push(PickerEntry::Header {
            label: &spinner_label,
        });
    }

    let content_fields: Vec<Vec<PickerField>> = content_entry_data
        .iter()
        .map(|b| {
            b.field_data
                .iter()
                .map(|(l, v)| PickerField { label: l, value: v })
                .collect()
        })
        .collect();

    let content_snippets: Vec<[&str; 1]> = content_entry_data
        .iter()
        .map(|b| [b.snippet_preview.as_deref().unwrap_or("")])
        .collect();

    for (i, (b, fields)) in content_entry_data
        .iter()
        .zip(content_fields.iter())
        .enumerate()
    {
        let has_snippet = b.snippet_preview.is_some();
        picker_entries.push(PickerEntry::Row(PickerRow {
            label: &b.summary,
            right_label: &b.right_text,
            selected: b.is_selected,
            expanded: b.is_expanded,
            fields,
            description_lines: if has_snippet {
                &content_snippets[i]
            } else {
                &[]
            },
            summary_lines: &[],
            dimmed: false,
            indent: 1,
            badge: if has_snippet { "match" } else { "" },
            badge_color: Some(theme.accent_user),
            collapsible: true,
            underline_last_desc: false,
        }));
    }

    let hidden_hint = if ctx.chat_mode {
        None
    } else {
        crate::views::session_picker::hidden_external_hint(ctx.sessions, ctx.source_filter)
    };

    // Build shortcuts for fullscreen mode. Chat mode drops the worktree /
    // deep-search / filter hints (local-Build-row actions).
    let worktree_shortcut: &'static str = "ctrl+w";
    use crate::views::shortcuts_bar::HintItem;
    let mut default_shortcuts: Vec<HintItem> = vec![
        HintItem::new(crate::key!(Esc), "back"),
        HintItem::new(crate::key!(Enter), "select"),
    ];
    if !ctx.chat_mode {
        default_shortcuts.push(HintItem {
            keys: vec![],
            label: "worktree".into(),
            custom_display: Some(worktree_shortcut),
            description: None,
            pinned: false,
        });
    }
    default_shortcuts.push(HintItem {
        keys: vec![],
        label: "navigate".into(),
        custom_display: Some("\u{2191}\u{2193}"),
        description: None,
        pinned: false,
    });
    if ctx.pending_delete {
        default_shortcuts.clear();
        default_shortcuts.push(HintItem {
            keys: vec![],
            label: "confirm delete".into(),
            custom_display: Some("y"),
            description: None,
            pinned: false,
        });
        default_shortcuts.push(HintItem {
            keys: vec![],
            label: "cancel".into(),
            custom_display: Some("n"),
            description: None,
            pinned: false,
        });
    } else if !ctx.chat_mode {
        default_shortcuts.push(HintItem {
            keys: vec![],
            label: "filter".into(),
            custom_display: Some("f"),
            description: None,
            pinned: false,
        });
        default_shortcuts.push(HintItem {
            keys: vec![],
            label: "delete".into(),
            custom_display: Some("d"),
            description: None,
            pinned: false,
        });
    }

    let config = PickerConfig {
        title: Some("Resume session"),
        show_search_hint: true,
        expandable: true,
        esc_clears_query: true,
        shortcuts: Some(&default_shortcuts),
        pending_hint: ctx.pending_hint,
        non_selectable: &non_selectable_indices,
        non_selectable_clickable: &[],
        shortcuts_area: ctx.shortcuts_area,
        tabs: None,
        active_tab: 0,
        filter_label: (!ctx.chat_mode).then(|| ctx.source_filter.label()),
        filter_key_hint: (!ctx.chat_mode).then_some("f"),
        filter_active: !ctx.chat_mode && ctx.source_filter.is_active(),
        header_note: hidden_hint.as_deref(),
        action_keys: if ctx.chat_mode || ctx.pending_delete {
            &[]
        } else {
            &[('d', "delete")]
        },
        disable_search: false,
        compact_bottom_bar: false,
        search_only_on_slash: false,
        vim_normal_first: crate::appearance::cache::load_vim_mode(),
    };

    picker::render_picker(
        buf,
        area,
        theme,
        ctx.state,
        &picker_entries,
        &config,
        ctx.loading,
        ctx.tick,
    )
}

/// Render one startup warning centered in the given area.
///
/// `startup_warnings` can hold more than one entry (the WezTerm
/// kitty-keyboard banner is prepended ahead of `summarize_warnings()`
/// output — see `diagnostics::assemble_startup_warnings`), but only one is
/// rendered — the severity-aware pick from `startup::banner_warning`, so a
/// runtime-pushed Warning displaces an earlier Info entry. One message line,
/// one optional action line, plus a buffer row for spacing.
/// Severity controls color (yellow for `Warning`, dim for `Info`).
fn render_startup_warnings(
    area: Rect,
    buf: &mut Buffer,
    theme: &Theme,
    warnings: &[StartupWarning],
) -> Option<Rect> {
    let w = crate::startup::banner_warning(warnings)?;

    // Skip the import-claude startup warning entirely — the import row in the
    // menu now carries the call-to-action with the same visual weight as
    // every other welcome menu item. Showing the warning text in addition to
    // the menu row would be redundant noise.
    if w.message.starts_with("Import Claude settings")
        || w.message.starts_with("Claude settings detected")
    {
        return None;
    }
    let color = match w.severity {
        crate::startup::WarningSeverity::Warning => theme.warning,
        crate::startup::WarningSeverity::Info => theme.gray_dim,
    };
    let style = Style::default().fg(color);

    let mut lines: Vec<Line<'_>> = w
        .message
        .lines()
        .map(|l| Line::from(Span::styled(l, style)).alignment(Alignment::Center))
        .collect();
    if let Some(ref action) = w.action {
        lines.push(Line::from(Span::styled(action.as_str(), style)).alignment(Alignment::Center));
    }

    Paragraph::new(lines).render(area, buf);
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::app::app_view::SessionPickerEntry;
    use crate::views::picker::PickerState;
    use crate::views::session_picker::{build_grouped_picker_entries, build_session_entry_data};

    fn badge_text(mode: VersionBadgeMode, team: Option<&str>) -> String {
        let area = Rect::new(0, 0, 80, 1);
        let mut buf = Buffer::empty(area);
        render_version_badge(area, &mut buf, &Theme::current(), team, 0, false, mode);
        (0..area.width)
            .map(|x| buf.cell((x, 0)).map_or(" ", |c| c.symbol()).to_string())
            .collect::<String>()
            .trim()
            .to_string()
    }

    /// The badge carries the product name and the version, and never a release label.
    #[test]
    fn version_badge_carries_no_release_label() {
        let full = badge_text(VersionBadgeMode::Full, Some("acme"));
        let inline = badge_text(VersionBadgeMode::HeroInline, None);
        let footer = badge_text(VersionBadgeMode::HeroFooter, Some("acme"));

        for rendered in [&full, &inline, &footer] {
            assert!(
                !rendered.contains("Beta"),
                "badge must not label the product: {rendered:?}"
            );
        }
        assert!(full.contains("Nofy Build"), "full badge: {full:?}");
        assert!(inline.contains("Nofy Build"), "inline badge: {inline:?}");
        assert!(footer.contains("acme"), "footer keeps the team: {footer:?}");
        assert!(
            !footer.ends_with('\u{2502}'),
            "footer must not end on a separator: {footer:?}"
        );
    }

    fn make_entry(id: &str, summary: &str, repo_name: &str) -> SessionPickerEntry {
        SessionPickerEntry {
            id: id.into(),
            summary: summary.into(),
            updated_at: chrono::Utc::now(),
            created_at: chrono::Utc::now(),
            cwd: format!("/home/user/{repo_name}"),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 1,
            last_active_at: None,
            branch: None,
            repo_name: repo_name.into(),
            worktree_label: None,
            last_turn_summary: None,
            session_kind: None,
            card_detail: None,
        }
    }

    fn render_params<'a>(
        auth_state: &'a AuthState,
        trust_state: &'a TrustState,
        session_picker: Option<&'a [SessionPickerEntry]>,
    ) -> WelcomeRenderParams<'a> {
        WelcomeRenderParams {
            prompt_focus: WelcomePromptFocus::Unfocused,
            auth_state,
            trust_state,
            announcement: None,
            tip: None,
            model_name: "test",
            flags: &[],
            selected: None,
            team_name: None,
            has_claude_import: false,
            mouse_pos: None,
            session_picker,
            session_picker_loading: false,
            compact: false,
            pending_hint: None,
            startup_warnings: &[],
            foreign_resume_hint: None,
            is_api_key_auth: false,
            session_picker_content_results: None,
            session_picker_content_loading: false,
            session_picker_entries_query: None,
            welcome_tick: 0,
            session_picker_grouped: false,
            session_picker_source_filter: crate::views::session_picker::SourceFilter::default(),
            session_picker_pending_delete: false,
            chat_mode: false,
            cwd: std::path::Path::new("/repo"),
            welcome_announcement_expanded: false,
            upgrade_cta: None,
            #[cfg(feature = "local-workspace")]
            workspace_mode: WelcomeWorkspaceMode::Sandbox,
            #[cfg(feature = "local-workspace")]
            workspace_mode_startup_locked: false,
            #[cfg(feature = "local-workspace")]
            workspace_mode_ack_pending: false,
        }
    }

    fn render_done_text(params: &WelcomeRenderParams<'_>) -> String {
        let area = Rect::new(0, 0, 100, 40);
        let mut buf = Buffer::empty(area);
        let mut prompt = PromptWidget::new();
        let mut picker = PickerState::default();
        render_welcome(area, &mut buf, params, &mut prompt, &mut picker);
        buffer_text(&buf)
    }

    #[test]
    fn foreign_resume_tip_names_each_tool_and_age() {
        use nofy_workspace::foreign_sessions::ForeignSessionTool;

        let auth = AuthState::Done;
        let trust = TrustState::Done;
        for (tool, label) in [
            (ForeignSessionTool::Claude, "Claude Code"),
            (ForeignSessionTool::Codex, "Codex"),
            (ForeignSessionTool::Cursor, "Cursor"),
        ] {
            let hint = nofy_workspace::foreign_sessions::RecentForeignSession {
                tool,
                native_id: "native-id".into(),
                age: std::time::Duration::from_secs(125),
            };
            let mut params = render_params(&auth, &trust, None);
            params.foreign_resume_hint = Some(&hint);
            let text = render_done_text(&params);
            assert!(text.contains(&format!("Coming from {label}?")), "{text}");
            assert!(text.contains("2m ago"), "{text}");
            assert!(text.contains("ctrl+u"), "{text}");
        }
    }

    fn png() -> [u8; 8] {
        [0x89, b'P', b'N', b'G', b'\r', b'\n', 0x1a, b'\n']
    }

    fn seed_static_owner(owner_id: u64) {
        let _ = crate::terminal::overlay::static_image(&png(), 20, 10, 0, 0, owner_id)
            .unwrap()
            .commit();
    }

    fn assert_promptless_clear(result: WelcomeRenderResult, owner_id: u64) {
        let post_flush = result
            .post_flush_escapes
            .expect("promptless welcome must clear ID 1");
        assert!(post_flush.as_str().contains("a=d"));
        let before_write =
            crate::terminal::overlay::static_image(&png(), 20, 10, 0, 0, owner_id).unwrap();
        assert!(
            !before_write.as_str().contains("a=t"),
            "constructing the clear must not commit ownership"
        );
        post_flush.write_to(&mut Vec::new()).unwrap();
        let after_write =
            crate::terminal::overlay::static_image(&png(), 20, 10, 0, 0, owner_id).unwrap();
        assert!(
            after_write.as_str().contains("a=t"),
            "writing the clear must commit ownership"
        );
    }

    #[test]
    fn picker_welcome_returns_paired_overlay_clear() {
        let _guard = crate::terminal::image::set_protocol_for_test(
            crate::terminal::image::GraphicsProtocol::Kitty,
        );
        crate::terminal::overlay::reset_owner();
        seed_static_owner(82);
        let auth_state = AuthState::Done;
        let trust_state = TrustState::Done;
        let sessions = [make_entry("session-1", "summary", "repo")];
        let params = render_params(&auth_state, &trust_state, Some(&sessions));
        let area = Rect::new(0, 0, 100, 40);
        let mut buf = Buffer::empty(area);
        let mut prompt = PromptWidget::new();
        let mut picker = PickerState::default();

        let result = render_welcome(area, &mut buf, &params, &mut prompt, &mut picker);
        assert_promptless_clear(result, 82);
    }

    /// RENDER half of the header-gate invariant (input half:
    /// `session_picker::tests::grouped_entry_map_empty_query_with_loading_has_no_header`):
    /// with stamp==live and a re-search in flight, the "Searching…" header
    /// must NOT render — a render-only header row shifts arrow-key row
    /// indices. Control leg: the same search WITHOUT the stamp keeps it.
    #[test]
    fn render_header_gate_uses_effective_query() {
        use ratatui::buffer::Buffer;
        use ratatui::layout::Rect;

        let theme = crate::theme::Theme::default();
        let area = Rect::new(0, 0, 80, 20);
        // Content-only hit: title shares nothing with the query "hit".
        let entries = vec![make_entry("conv-1", "Quarterly roadmap notes", "repo")];

        let render = |entries_query: Option<&str>| -> String {
            let mut buf = Buffer::empty(area);
            let mut state = PickerState::default();
            state.set_query("hit");
            render_session_picker(
                area,
                &mut buf,
                &theme,
                &mut SessionPickerRenderCtx {
                    state: &mut state,
                    sessions: Some(&entries),
                    cwd: std::path::Path::new("/repo"),
                    loading: false,
                    pending_hint: None,
                    shortcuts_area: None,
                    content_results: None,
                    content_loading: true,
                    entries_query,
                    tick: 0,
                    grouped: false,
                    source_filter: crate::views::session_picker::SourceFilter::default(),
                    pending_delete: false,
                    chat_mode: true,
                },
            );
            (0..area.height)
                .map(|y| {
                    (0..area.width)
                        .map(|x| {
                            buf.cell((x, y))
                                .map_or(' ', |c| c.symbol().chars().next().unwrap_or(' '))
                        })
                        .collect::<String>()
                })
                .collect::<Vec<_>>()
                .join("\n")
        };

        let stamped = render(Some("hit"));
        assert!(
            !stamped.contains("Searching session content"),
            "stamp==live must not render the search header:\n{stamped}"
        );
        assert!(
            stamped.contains("Quarterly roadmap notes"),
            "stamped server hit must render:\n{stamped}"
        );

        // Control: unstamped in-flight search keeps the header, proving the
        // negative assertion above exercises the gate.
        let unstamped = render(None);
        assert!(
            unstamped.contains("Searching session content"),
            "in-flight search without the stamp must render the header:\n{unstamped}"
        );
    }

    #[test]
    fn headless_hidden_external_hint_pins_above_list() {
        use ratatui::buffer::Buffer;
        use ratatui::layout::Rect;

        let theme = crate::theme::Theme::default();
        let area = Rect::new(0, 0, 80, 24);
        let mut entries: Vec<SessionPickerEntry> = (0..20)
            .map(|i| {
                let mut entry =
                    make_entry(&format!("s{i}"), &format!("native session {i}"), "repo");
                entry.session_kind = Some("headless".into());
                entry
            })
            .collect();
        let mut foreign = make_entry("f1", "Claude work", "repo");
        foreign.source = "claude".into();
        entries.push(foreign);

        let mut buf = Buffer::empty(area);
        let mut state = PickerState::default();
        render_session_picker(
            area,
            &mut buf,
            &theme,
            &mut SessionPickerRenderCtx {
                state: &mut state,
                sessions: Some(&entries),
                cwd: std::path::Path::new("/repo"),
                loading: false,
                pending_hint: None,
                shortcuts_area: None,
                content_results: None,
                content_loading: false,
                entries_query: None,
                tick: 0,
                grouped: false,
                source_filter: crate::views::session_picker::SourceFilter::Headless,
                pending_delete: false,
                chat_mode: false,
            },
        );
        let screen = (0..area.height)
            .map(|y| {
                (0..area.width)
                    .map(|x| {
                        buf.cell((x, y))
                            .map_or(' ', |c| c.symbol().chars().next().unwrap_or(' '))
                    })
                    .collect::<String>()
            })
            .collect::<Vec<_>>()
            .join("\n");
        let hint = screen.find("external session");
        let first_row = screen.find("native session 0");
        assert!(
            hint.is_some(),
            "Headless page must show the hidden-external hint:\n{screen}"
        );
        assert!(
            first_row.is_none() || hint.unwrap() < first_row.unwrap(),
            "hint must stay pinned above the first list row:\n{screen}"
        );
    }

    #[test]
    fn grouped_entries_insert_headers() {
        let entries = vec![
            make_entry("s1", "Fix auth", "nofy"),
            make_entry("s2", "Add streaming", "nofy"),
            make_entry("s3", "Nuke tables", "fw-1"),
        ];
        let indices: Vec<usize> = (0..entries.len()).collect();
        let state = PickerState::default();
        let built = build_session_entry_data(&entries, &indices, &state, 80);
        let fields_vecs: Vec<Vec<crate::views::picker::PickerField>> =
            built.iter().map(|_| Vec::new()).collect();

        let (result, non_sel) =
            build_grouped_picker_entries(&entries, &indices, &built, &fields_vecs, &state, None);

        // 2 headers + 3 rows = 5 entries
        assert_eq!(result.len(), 5);
        // Groups are sorted alphabetically: fw-1 before nofy.
        // Header positions: 0 (fw-1), 2 (nofy)
        assert_eq!(non_sel.len(), 5);
        assert!(non_sel[0], "first entry should be header (non-selectable)");
        assert!(!non_sel[1], "second entry should be selectable row");
        assert!(non_sel[2], "third entry should be header (non-selectable)");
        assert!(!non_sel[3], "fourth entry should be selectable row");
        assert!(!non_sel[4], "fifth entry should be selectable row");

        // Verify headers
        assert!(
            matches!(&result[0], crate::views::picker::PickerEntry::Header { label } if label == &"fw-1")
        );
        assert!(
            matches!(&result[2], crate::views::picker::PickerEntry::Header { label } if label == &"nofy")
        );
    }

    #[test]
    fn grouped_entries_pin_current_repo_first() {
        // Render path (build_grouped_picker_entries) must pin the current
        // working directory's repo group ahead of the alphabetical rest,
        // matching build_entry_map's index ordering.
        let entries = vec![
            make_entry("s1", "Fix auth", "aaa"),
            make_entry("s2", "Add streaming", "zzz"),
        ];
        let indices: Vec<usize> = (0..entries.len()).collect();
        let state = PickerState::default();
        let built = build_session_entry_data(&entries, &indices, &state, 80);
        let fields_vecs: Vec<Vec<crate::views::picker::PickerField>> =
            built.iter().map(|_| Vec::new()).collect();

        // Pin "zzz": it leads despite sorting last alphabetically.
        let (result, _) = build_grouped_picker_entries(
            &entries,
            &indices,
            &built,
            &fields_vecs,
            &state,
            Some("zzz"),
        );
        assert!(
            matches!(&result[0], crate::views::picker::PickerEntry::Header { label } if label == &"zzz"),
            "current repo group pinned first"
        );
        assert!(
            matches!(&result[2], crate::views::picker::PickerEntry::Header { label } if label == &"aaa"),
            "remaining group follows alphabetically"
        );
    }

    #[test]
    fn grouped_entries_single_group_has_one_header() {
        let entries = vec![
            make_entry("s1", "Fix auth", "nofy"),
            make_entry("s2", "Add streaming", "nofy"),
        ];
        let indices: Vec<usize> = (0..entries.len()).collect();
        let state = PickerState::default();
        let built = build_session_entry_data(&entries, &indices, &state, 80);
        let fields_vecs: Vec<Vec<crate::views::picker::PickerField>> =
            built.iter().map(|_| Vec::new()).collect();

        let (result, non_sel) =
            build_grouped_picker_entries(&entries, &indices, &built, &fields_vecs, &state, None);

        assert_eq!(result.len(), 3); // 1 header + 2 rows
        assert!(non_sel[0]);
        assert!(!non_sel[1]);
        assert!(!non_sel[2]);
    }

    #[test]
    fn grouped_entries_empty_input() {
        let entries: Vec<SessionPickerEntry> = vec![];
        let indices: Vec<usize> = vec![];
        let state = PickerState::default();
        let built = build_session_entry_data(&entries, &indices, &state, 80);
        let fields_vecs: Vec<Vec<crate::views::picker::PickerField>> = vec![];

        let (result, non_sel) =
            build_grouped_picker_entries(&entries, &indices, &built, &fields_vecs, &state, None);

        assert!(result.is_empty());
        assert!(non_sel.is_empty());
    }

    #[test]
    fn grouped_entries_rows_are_indented() {
        let entries = vec![make_entry("s1", "Fix auth", "nofy")];
        let indices: Vec<usize> = vec![0];
        let state = PickerState::default();
        let built = build_session_entry_data(&entries, &indices, &state, 80);
        let fields_vecs: Vec<Vec<crate::views::picker::PickerField>> =
            built.iter().map(|_| Vec::new()).collect();

        let (result, _) =
            build_grouped_picker_entries(&entries, &indices, &built, &fields_vecs, &state, None);

        // The row (second entry) should have indent=1
        if let crate::views::picker::PickerEntry::Row(row) = &result[1] {
            assert_eq!(row.indent, 1);
        } else {
            panic!("expected Row, got Header");
        }
    }

    fn resume_picker_config() -> crate::views::picker::PickerConfig<'static> {
        crate::views::picker::PickerConfig {
            title: Some("Resume session"),
            show_search_hint: true,
            expandable: true,
            esc_clears_query: true,
            shortcuts: None,
            pending_hint: None,
            non_selectable: &[],
            non_selectable_clickable: &[],
            shortcuts_area: None,
            tabs: None,
            active_tab: 0,
            filter_label: None,
            filter_key_hint: None,
            filter_active: false,
            header_note: None,
            action_keys: &[],
            disable_search: false,
            compact_bottom_bar: false,
            search_only_on_slash: false,
            vim_normal_first: false,
        }
    }

    #[test]
    fn e_key_expands_selected_entry_in_resume_picker() {
        use crate::views::picker::{PickerOutcome, handle_picker_input};
        use crossterm::event::{Event, KeyCode, KeyEvent, KeyModifiers};

        let mut state = PickerState::default();
        let config = resume_picker_config();
        let ev = Event::Key(KeyEvent::new(KeyCode::Char('e'), KeyModifiers::NONE));
        let outcome = handle_picker_input(&ev, &mut state, 3, &config);
        assert!(matches!(outcome, PickerOutcome::Expand(0)));
    }

    #[test]
    fn e_key_routes_to_search_when_active() {
        use crate::views::picker::{PickerOutcome, handle_picker_input};
        use crossterm::event::{Event, KeyCode, KeyEvent, KeyModifiers};

        let mut state = PickerState::input_active();
        let config = resume_picker_config();
        let ev = Event::Key(KeyEvent::new(KeyCode::Char('e'), KeyModifiers::NONE));
        let outcome = handle_picker_input(&ev, &mut state, 3, &config);
        assert!(matches!(outcome, PickerOutcome::QueryChanged));
        assert_eq!(state.query(), "e");
    }

    #[test]
    fn stacked_slot_sized_for_announcement() {
        // Narrow terminal (80 cols < 90 → no hero box). The stacked info slot
        // is sized for the announcement.
        let area = Rect::new(0, 0, 80, 50);
        let a = long_ann();
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            ..Default::default()
        });
        assert!(!layout.has_hero_box());
        assert_eq!(layout.info.height, 3);
    }

    #[test]
    fn info_slot_hidden_when_compact() {
        let area = Rect::new(0, 0, 80, 60);
        let a = long_ann();
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            compact: true,
            prompt_compact: true,
            ..Default::default()
        });
        assert_eq!(layout.info.height, 0);
    }

    #[test]
    fn info_slot_hidden_when_no_announcement() {
        let area = Rect::new(0, 0, 80, 60);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        assert_eq!(layout.info.height, 0);
    }

    #[test]
    fn hero_box_active_on_wide_tall_terminal() {
        // 90 cols, 50 rows: meets the minimum for the hero box.
        let area = Rect::new(0, 0, 90, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        assert!(layout.has_hero_box(), "hero box should be active at 90x50");
        assert!(layout.hero_box.width > 0);
        assert!(layout.hero_box.height > 0);
        // Logo and menu slots are zero in hero box mode (content is inside the box).
        assert_eq!(layout.logo.width, 0);
        assert_eq!(layout.menu.width, 0);
        // Sub-rects inside the hero box are valid.
        assert!(layout.hero_logo.height > 0);
        assert!(layout.hero_menu.height > 0);
        assert_eq!(layout.hero_version.height, 1);
    }

    #[test]
    fn hero_box_inactive_on_narrow_terminal() {
        // 80 cols is below the 90-col threshold.
        let area = Rect::new(0, 0, 80, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        assert!(
            !layout.has_hero_box(),
            "hero box should be inactive at 80x50"
        );
        assert_eq!(layout.hero_box.width, 0);
    }

    #[test]
    fn hero_box_boundary_at_min_width() {
        let just_below = Rect::new(0, 0, 89, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: just_below,
            menu_height: 4,
            ..Default::default()
        });
        assert!(
            !layout.has_hero_box(),
            "hero box should be inactive at 89 cols"
        );

        let at_threshold = Rect::new(0, 0, 90, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: at_threshold,
            menu_height: 4,
            ..Default::default()
        });
        assert!(
            layout.has_hero_box(),
            "hero box should be active at 90 cols"
        );
    }

    #[test]
    fn hero_box_inactive_when_compact() {
        // Compact mode (session picker visible) never uses the hero box.
        let area = Rect::new(0, 0, 120, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            compact: true,
            prompt_compact: true,
            ..Default::default()
        });
        assert!(
            !layout.has_hero_box(),
            "hero box should be inactive in compact mode"
        );
        assert_eq!(layout.hero_box.width, 0);
    }

    #[test]
    fn hero_box_inactive_on_short_terminal() {
        // 16 rows is one short of the 17 the box needs (11 box + 1 flex gap +
        // 5 fixed-below), so it falls back to the stacked layout.
        let area = Rect::new(0, 0, 90, 16);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        assert!(
            !layout.has_hero_box(),
            "hero box should be inactive at 90x16 (needs 17 rows)"
        );
    }

    #[test]
    fn hero_box_inactive_when_warning_would_overflow() {
        // Regression: the box is forced to the full 7-row logo, so even a
        // 3-item menu needs 11 box rows. A startup warning (error_height = 2)
        // pushes the total past height 19, so the gate must fall back to the
        // stacked layout instead of overflowing by a row.
        let area = Rect::new(0, 0, 90, 19);
        let with_warning = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            error_height: 2,
            menu_height: 3,
            ..Default::default()
        });
        assert!(!with_warning.has_hero_box());
        // The same terminal fits the box once the warning is gone.
        let no_warning = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            ..Default::default()
        });
        assert!(no_warning.has_hero_box());
    }

    #[test]
    fn blocked_layout_stays_stacked_on_wide_terminal() {
        // The blocked screen renders through render_welcome_blocked, which
        // only paints the stacked logo/menu rects. compute_stacked must never
        // hand them a hero-box layout (which zeroes those rects), even on a
        // wide, tall terminal where the normal path picks the hero box.
        let area = Rect::new(0, 0, 120, 40);
        assert!(
            WelcomeLayout::compute(WelcomeLayoutInput {
                content_area: area,
                menu_height: 2,
                ..Default::default()
            })
            .has_hero_box(),
            "sanity: the normal path should pick the hero box at 120x40"
        );
        let blocked = WelcomeLayout::compute_stacked(WelcomeLayoutInput {
            content_area: area,
            menu_height: 2,
            ..Default::default()
        });
        assert!(!blocked.has_hero_box());
        assert!(
            blocked.logo.height > 0,
            "logo must be painted on the blocked screen"
        );
        assert!(
            blocked.menu.height > 0,
            "menu must be painted on the blocked screen"
        );
    }

    #[test]
    fn hero_box_does_not_overflow_with_tall_menu() {
        // A 6-item menu makes the box 2 rows taller than the default-4 box, so
        // the centering pad (derived from the default box) must be clamped or
        // the box gets pushed down and the version row clips at exactly
        // min_content_height. 19 == min_content_height(0, 6, 0, 0): a 13-row box
        // + 1 flex gap + 5 fixed-below.
        let area = Rect::new(0, 0, 100, 19);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 6,
            ..Default::default()
        });
        assert!(
            layout.has_hero_box(),
            "hero box should be active at the boundary"
        );
        // top_pad must clamp to 0, so the box sits at the top, not pushed down.
        assert_eq!(
            layout.hero_box.y, area.y,
            "box pushed down by unclamped pad"
        );
        assert!(
            layout.version.y + layout.version.height <= area.y + area.height,
            "version row (y={}, h={}) overflows content height {}",
            layout.version.y,
            layout.version.height,
            area.height,
        );
    }

    #[test]
    fn hero_box_height_accounts_for_borders_and_padding() {
        // At h >= 26, logo07 is used (7 lines). With menu_height=3:
        // right_col = 2 + 0 + 0 + 1 + 3 = 6, inner = max(7, 6) = 7.
        // hero_box_height = 2 (borders) + 2 (v_pad) + 7 = 11.
        let area = Rect::new(0, 0, 100, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            ..Default::default()
        });
        assert!(layout.has_hero_box());
        assert_eq!(layout.hero_box.height, 11);
    }

    #[test]
    fn hero_box_logo_top_aligned() {
        let area = Rect::new(0, 0, 100, 50);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            ..Default::default()
        });
        // Logo y should be at hero_box.y + 1 (border) + 1 (v_pad).
        assert_eq!(layout.hero_logo.y, layout.hero_box.y + 2);
    }

    #[test]
    fn hero_box_with_announcement() {
        let area = Rect::new(0, 0, 100, 50);
        let a = long_ann();
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            announcement: Some(&a),
            ..Default::default()
        });
        assert!(layout.has_hero_box());
        // Collapsed: title (1) + 2 wrapped message lines.
        assert_eq!(layout.hero_info.height, 3);
        // The subtitle is hidden when the info slot is shown.
        assert_eq!(layout.hero_subtitle.height, 0);
        assert!(layout.hero_info.y > layout.hero_version.y);
        // The menu sits one blank row below the info block — no divider line.
        assert_eq!(
            layout.hero_menu.y,
            layout.hero_info.y + layout.hero_info.height + 1
        );
    }

    #[test]
    fn hero_box_announcement_clamped_when_tight() {
        // A real announcement can't disable the hero box: the slot is clamped to
        // whatever still fits (the renderer trails a `…`), so the box stays
        // active rather than falling back to the stacked layout.
        let area = Rect::new(0, 0, 100, 17);
        let a = long_ann();
        let without = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            ..Default::default()
        });
        assert!(without.has_hero_box());
        let with_ann = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 3,
            announcement: Some(&a),
            ..Default::default()
        });
        assert!(
            with_ann.has_hero_box(),
            "announcement clamps to fit instead of disabling the box"
        );
        assert!(with_ann.hero_info.height > 0);
        assert!(
            hero_box::min_content_height(0, 3, 0, with_ann.hero_info.height) <= area.height,
            "clamped slot must keep the box within the area"
        );
    }

    #[test]
    fn hero_box_keeps_one_bottom_pad_below_actions() {
        // With an announcement the subtitle is hidden, but there's
        // still exactly one padding row between the actions and the bottom
        // border. (menu=4 + info=3 fills the inner, so the menu reaches the pad.)
        let area = Rect::new(0, 0, 100, 50);
        let a = long_ann();
        let no_info = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        let with_info = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            ..Default::default()
        });
        assert_eq!(no_info.hero_subtitle.height, 1);
        assert_eq!(with_info.hero_subtitle.height, 0);
        let menu_bottom = with_info.hero_menu.y + with_info.hero_menu.height;
        let border_bottom = with_info.hero_box.y + with_info.hero_box.height - 1;
        assert_eq!(
            border_bottom - menu_bottom,
            1,
            "one pad row below the actions"
        );
    }

    /// Flatten a rendered buffer into one string for substring assertions.
    fn buffer_text(buf: &Buffer) -> String {
        let area = *buf.area();
        let mut out = String::new();
        for y in area.y..area.y + area.height {
            for x in area.x..area.x + area.width {
                out.push_str(buf[(x, y)].symbol());
            }
            out.push('\n');
        }
        out
    }

    fn long_ann() -> nofy_announcements::RemoteAnnouncement {
        nofy_announcements::RemoteAnnouncement {
            title: Some("Security policy".into()),
            message: Some(
                "Report security incidents to the security team promptly through \
the usual channels. "
                    .repeat(60),
            ),
            ..Default::default()
        }
    }

    #[test]
    fn announcement_expands_for_long_message() {
        // Wide + tall → hero box; the measured info slot grows when expanded.
        let area = Rect::new(0, 0, 120, 60);
        let a = long_ann();
        let collapsed = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            ..Default::default()
        });
        let expanded = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            expanded: true,
            ..Default::default()
        });
        assert!(collapsed.has_hero_box() && expanded.has_hero_box());
        // Collapsed is title (1) + 2 wrapped lines; expanded shows much more.
        assert_eq!(collapsed.hero_info.height, 3);
        assert!(
            expanded.hero_info.height > collapsed.hero_info.height,
            "expanded {} should exceed collapsed {}",
            expanded.hero_info.height,
            collapsed.hero_info.height
        );
    }

    #[test]
    fn announcement_equal_for_short_message() {
        let area = Rect::new(0, 0, 120, 60);
        let a = nofy_announcements::RemoteAnnouncement {
            title: Some("FYI".into()),
            message: Some("All good.".into()),
            ..Default::default()
        };
        let collapsed = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            ..Default::default()
        });
        let expanded = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            announcement: Some(&a),
            expanded: true,
            ..Default::default()
        });
        // Title (1) + a single wrapped line, identical whether expanded or not.
        assert_eq!(collapsed.hero_info.height, 2);
        assert_eq!(collapsed.hero_info.height, expanded.hero_info.height);
    }

    #[test]
    fn announcement_clamped_in_short_box() {
        let tall = Rect::new(0, 0, 120, 60);
        let short = Rect::new(0, 0, 120, 30);
        let a = long_ann();
        let tall_expanded = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: tall,
            menu_height: 4,
            announcement: Some(&a),
            expanded: true,
            ..Default::default()
        });
        let short_expanded = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: short,
            menu_height: 4,
            announcement: Some(&a),
            expanded: true,
            ..Default::default()
        });
        assert!(tall_expanded.has_hero_box() && short_expanded.has_hero_box());
        // The short box clamps the expansion below the tall-box height...
        assert!(
            short_expanded.hero_info.height < tall_expanded.hero_info.height,
            "short {} should be clamped below tall {}",
            short_expanded.hero_info.height,
            tall_expanded.hero_info.height
        );
        // ...and the clamped height still keeps the hero box within the area.
        assert!(
            hero_box::min_content_height(0, 4, 0, short_expanded.hero_info.height) <= short.height
        );
    }

    #[test]
    fn no_announcement_leaves_info_slot_empty() {
        // Without an announcement the info slot is empty.
        let area = Rect::new(0, 0, 120, 60);
        let layout = WelcomeLayout::compute(WelcomeLayoutInput {
            content_area: area,
            menu_height: 4,
            ..Default::default()
        });
        assert_eq!(layout.hero_info.height, 0);
    }

    #[test]
    fn stacked_info_width_clamps_to_available() {
        // Min menu width is MENU_MIN_WIDTH, capped at the available (inset) slot.
        let unclamped = logo::logo_visual_width(50).max(30).max(MENU_MIN_WIDTH);
        assert_eq!(stacked_info_width(200, 50, MENU_MIN_WIDTH), unclamped);
        assert_eq!(stacked_info_width(40, 50, MENU_MIN_WIDTH), 40);
    }

    #[test]
    fn stacked_expanded_announcement_allocates_slot() {
        // Narrow terminal → stacked layout. A long expanded announcement must
        // still get a nonzero info slot wherever the column has room (regression:
        // over-reserving once collapsed the whole slot to zero, hiding it).
        let a = long_ann();
        for height in 20u16..=60 {
            let area = Rect::new(0, 0, 80, height);
            assert!(area.width < hero_box::HERO_BOX_MIN_WIDTH);
            let layout = WelcomeLayout::compute(WelcomeLayoutInput {
                content_area: area,
                menu_height: 4,
                announcement: Some(&a),
                expanded: true,
                ..Default::default()
            });
            assert!(!layout.has_hero_box());
            let budget = stacked_info_budget(area, 0, 4, 0, false);
            if budget > 0 {
                assert!(
                    layout.info.height > 0,
                    "height {height}: stacked slot dropped to 0 with budget {budget}"
                );
            }
        }
    }
}
