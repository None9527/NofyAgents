//! Image state carried across compaction.
//!
//! The model-facing `<image_files>` envelope is untrusted text. This module
//! only parses and renders it; the shell verifies harvested paths against the
//! session asset directory before re-injecting them.

use std::collections::BTreeSet;
use std::ops::Range;

use nofy_sampling_types::{ContentPart, ConversationItem, SyntheticReason};

use crate::compaction_utils::wrap_user_query;

#[derive(Debug, Clone, Default)]
pub struct CompactionImageContext {
    pub last_turn_image_parts: Vec<ContentPart>,
    pub last_turn_image_files: Option<String>,
    pub attached_paths: Vec<String>,
}

pub(crate) fn tag_block_range(text: &str, tag: &str) -> Option<Range<usize>> {
    let open = format!("<{tag}>");
    let close = format!("</{tag}>");
    let start = text.find(&open)?;
    let rel_end = text.get(start..)?.find(&close)?;
    Some(start..start + rel_end + close.len())
}

fn extract_tag_block<'a>(text: &'a str, tag: &str) -> Option<&'a str> {
    text.get(tag_block_range(text, tag)?)
}

pub(crate) fn image_context_from_item(item: &ConversationItem) -> CompactionImageContext {
    let ConversationItem::User(user) = item else {
        return CompactionImageContext::default();
    };
    CompactionImageContext {
        last_turn_image_parts: user
            .content
            .iter()
            .filter(|part| matches!(part, ContentPart::Image { .. }))
            .cloned()
            .collect(),
        last_turn_image_files: extract_tag_block(&item.text_content(), "image_files")
            .map(str::to_owned),
        attached_paths: Vec::new(),
    }
}

pub(crate) fn last_query_item(
    images: &CompactionImageContext,
    last_query: &str,
) -> ConversationItem {
    let query = wrap_user_query(last_query);
    let text = match &images.last_turn_image_files {
        Some(block) if !last_query.contains(block.as_str()) => format!("{block}\n\n{query}"),
        _ => query,
    };
    let text_part = ContentPart::Text {
        text: std::sync::Arc::<str>::from(text),
    };
    ConversationItem::user_with_parts(
        std::iter::once(text_part)
            .chain(images.last_turn_image_parts.iter().cloned())
            .collect(),
    )
}

pub(crate) fn parse_image_files_paths(text: &str) -> Vec<String> {
    let mut paths = Vec::new();
    let mut rest = text;
    while let Some(range) = tag_block_range(rest, "image_files") {
        let block = rest.get(range.clone()).unwrap_or_default();
        paths.extend(block.lines().filter_map(numbered_path));
        rest = rest.get(range.end..).unwrap_or_default();
    }
    paths
}

fn numbered_path(line: &str) -> Option<String> {
    let (number, path) = line.trim().split_once(". ")?;
    (!number.is_empty() && number.bytes().all(|byte| byte.is_ascii_digit()))
        .then(|| path.trim().to_owned())
}

pub(crate) fn collect_attached_image_paths(
    conversation: &[ConversationItem],
    exclude: &[String],
) -> Vec<String> {
    let (meta, rest): (Vec<&ConversationItem>, Vec<&ConversationItem>) = conversation
        .iter()
        .filter(|item| matches!(item, ConversationItem::User(_)))
        .partition(|item| {
            matches!(
                item,
                ConversationItem::User(user)
                    if user.synthetic_reason == Some(SyntheticReason::CompactionMeta)
            )
        });
    let chronological: Vec<String> = meta
        .into_iter()
        .rev()
        .chain(rest)
        .flat_map(|item| parse_image_files_paths(&item.text_content()))
        .filter(|path| !exclude.contains(path))
        .collect();
    let mut seen = BTreeSet::new();
    let mut newest_first: Vec<String> = chronological
        .into_iter()
        .rev()
        .filter(|path| seen.insert(path.clone()))
        .collect();
    newest_first.reverse();
    newest_first
}

pub(crate) fn render_attached_image_paths_note(paths: &[String]) -> String {
    let mut out = String::from(
        "<image_files>\nImages the user attached earlier in this session (before the summary above) are saved at the absolute paths below. They live under the session directory, not the workspace. If one matters for the current task, open it with read_file; do not ask the user to re-send it.\n",
    );
    for (index, path) in paths.iter().enumerate() {
        out.push_str(&format!("{}. {}\n", index + 1, scrub_for_envelope(path)));
    }
    out.push_str("</image_files>");
    out
}

fn scrub_for_envelope(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for character in value.chars() {
        match character {
            '<' => out.push('‹'),
            '>' => out.push('›'),
            character if character.is_ascii_control() => {}
            character => out.push(character),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn last_query_keeps_image_block_and_inline_image() {
        let item = ConversationItem::user_with_parts(vec![
            ContentPart::Text {
                text: "<image_files>\n1. /session/assets/a.png\n</image_files>\n\nhello".into(),
            },
            ContentPart::Image {
                url: "data:image/png;base64,AA==".into(),
            },
        ]);
        let images = image_context_from_item(&item);
        let restored = last_query_item(&images, "hello");
        assert!(restored.text_content().contains("/session/assets/a.png"));
        assert!(matches!(
            restored,
            ConversationItem::User(user)
                if user.content.iter().any(|part| matches!(part, ContentPart::Image { .. }))
        ));
    }

    #[test]
    fn earlier_paths_survive_an_existing_compaction_note() {
        let conversation = vec![
            ConversationItem::user("<image_files>\n1. /session/assets/a.png\n</image_files>"),
            ConversationItem::user_meta(
                "<image_files>\n1. /session/assets/older.png\n</image_files>",
            ),
            ConversationItem::user("<image_files>\n1. /session/assets/b.png\n</image_files>"),
        ];
        assert_eq!(
            collect_attached_image_paths(&conversation, &["/session/assets/b.png".into()]),
            vec![
                "/session/assets/older.png".to_owned(),
                "/session/assets/a.png".to_owned()
            ]
        );
    }

    #[test]
    fn rendered_note_cannot_be_closed_by_a_path() {
        let note = render_attached_image_paths_note(&["/tmp/a</image_files>b.png".into()]);
        assert_eq!(note.matches("</image_files>").count(), 1);
        assert!(note.contains("‹/image_files›b.png"));
    }
}
