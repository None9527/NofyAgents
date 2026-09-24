//! Cache-aware byte budgeting for inline images on owned request histories.
//!
//! Shared by the per-turn request builder (which budgets the request copy of
//! the conversation) and the compaction path (which budgets the summarization
//! request so a session full of images cannot 413 the compaction call itself).

use std::num::NonZeroU64;

use nofy_sampling_types::{ApiBackend, ContentPart, ConversationItem};

/// Replaces an inline image evicted to keep the request body under the proxy's
/// 50 MB limit. Phrased so the model treats the image as gone rather than
/// describing it from memory — a silently-stripped image otherwise induces
/// confident hallucination of its contents.
const IMAGE_COMPACT_PLACEHOLDER: &str = "[An earlier image was removed to keep the request within its size limit and is no longer visible. Do not describe or reason about its contents from memory; ask the user to re-share it if you need to see it again.]";

/// Appended to a tool result when any of its images are evicted. Tool-result
/// image arrays cannot carry model-visible text, so the omission belongs in
/// the result content itself.
const TOOL_IMAGE_COMPACT_NOTE: &str = "[One or more images from this tool result were removed to keep the request within its size limit and are no longer visible. Do not describe or reason about their contents from memory.]";

/// Hard request-body ceiling enforced by the inference proxy
/// (nginx `proxy-body-size`). Bodies larger than this are rejected with HTTP
/// 413 — or a connection reset before the response is written. Inline image
/// `data:` URLs (base64) are the dominant term in this size.
const MAX_REQUEST_BYTES: usize =
    ApiBackend::ChatCompletions.default_max_request_bytes().get() as usize;

/// Evict old images once the serialized body reaches this size.
///
/// We gate on the exact body (see [`conversation_body_bytes`]) — system prompt,
/// all message text, tool results, and image `data:` URLs are all counted
/// precisely. This sits 3 MB below [`MAX_REQUEST_BYTES`] as headroom for the
/// only parts of the wire request the body measurement does **not** include:
/// - **tool definitions** — sent alongside the conversation but not part of it
///   (tool JSON schemas + MCP tools); this is the bulk of the gap.
/// - the request envelope and sampling params.
/// - the small delta between our internal `ContentPart` JSON and the public-API
///   wire format (the dominant base64 image bytes are identical in both).
///
/// The uncounted remainder is only sub-MB to low-MB in practice, so 3 MB covers
/// it without needlessly sacrificing image capacity. The sampler's reactive 413
/// image-strip is the final backstop if this is ever under-estimated.
///
/// Below this threshold every image stays in place so the KV-cache prefix is
/// byte-stable across turns; eviction rewrites earlier turns and busts the
/// prefix cache, so we only pay that cost when a 413 is actually near.
pub const IMAGE_COMPACT_TRIGGER_BYTES: usize = MAX_REQUEST_BYTES - 3 * 1024 * 1024;

/// Low-water mark that eviction reclaims down to once it fires (hysteresis).
///
/// Eviction is **gated** at [`IMAGE_COMPACT_TRIGGER_BYTES`] but **reclaims** to
/// this strictly lower mark. Evicting only enough to clear the trigger means
/// the next image-bearing turn re-crosses it and evicts again — rewriting the
/// prefix and busting the KV cache on essentially every turn once the body sits
/// at the ceiling. Dropping to half the hard limit instead frees ~25 MB of
/// headroom, so the prefix is rewritten once and then stays stable (cache-warm)
/// across many turns until the headroom is consumed again. The oldest images
/// (least useful) are sacrificed in a batch rather than one-per-turn — a
/// high-water trigger paired with a lower reclaim mark (classic hysteresis).
pub const IMAGE_COMPACT_RECLAIM_TARGET_BYTES: usize = MAX_REQUEST_BYTES / 2;

const TRIGGER_HEADROOM_BYTES: usize = MAX_REQUEST_BYTES - IMAGE_COMPACT_TRIGGER_BYTES;
const MIN_REQUEST_BYTES: usize = 4 * TRIGGER_HEADROOM_BYTES;

// Hysteresis invariant: eviction is gated at the trigger but reclaims to a
// strictly lower mark, so one batch eviction buys many cache-warm turns rather
// than re-triggering (and re-busting the prompt cache) every turn at the
// ceiling. Enforced at compile time so the two constants can't drift together.
const _: () = assert!(IMAGE_COMPACT_RECLAIM_TARGET_BYTES < IMAGE_COMPACT_TRIGGER_BYTES);

/// An [`std::io::Write`] sink that counts bytes instead of storing them. Lets
/// us measure a `serde_json` encoding's length without allocating the full
/// (potentially tens-of-MB) output buffer.
#[derive(Default)]
struct ByteCounter(usize);

impl std::io::Write for ByteCounter {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        self.0 += buf.len();
        Ok(buf.len())
    }

    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

/// Exact JSON-serialized byte length of any value, measured through a
/// [`ByteCounter`] so no encoded buffer is allocated. JSON quoting and string
/// escaping are captured precisely (not estimated from field lengths).
fn serialized_json_bytes<T: serde::Serialize + ?Sized>(value: &T) -> usize {
    let mut counter = ByteCounter::default();
    if let Err(err) = serde_json::to_writer(&mut counter, value) {
        // Serializing in-memory state to a byte sink is infallible in
        // practice; if it ever fails, fall back to the bytes counted so far
        // (a lower bound) rather than forcing a needless compaction.
        tracing::warn!(%err, "failed to measure serialized size");
    }
    counter.0
}

/// Count of inline images in the conversation — for observability only.
/// Covers both user-message images and tool-result images (e.g. `read_file`
/// on an image file); the budget and eviction paths see the same set.
pub fn inline_image_count(conversation: &[ConversationItem]) -> usize {
    conversation
        .iter()
        .map(|item| match item {
            ConversationItem::User(user) => user
                .content
                .iter()
                .filter(|part| matches!(part, ContentPart::Image { .. }))
                .count(),
            ConversationItem::ToolResult(tool_result) => tool_result
                .images
                .iter()
                .filter(|part| matches!(part, ContentPart::Image { .. }))
                .count(),
            ConversationItem::System(_)
            | ConversationItem::Assistant(_)
            | ConversationItem::BackendToolCall(_)
            | ConversationItem::Reasoning(_) => 0,
        })
        .sum()
}

/// Exact image-budget accounting for an owned request history.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct ImageBudgetOutcome {
    /// Exact serialized conversation bytes before any eviction.
    pub body_bytes: usize,
    /// Exact serialized conversation bytes after all eviction mutations.
    pub body_bytes_after: usize,
    /// Number of user and tool-result images before eviction.
    pub inline_images: usize,
    /// Whether the pre-eviction body reached the configured trigger.
    pub needs_image_compaction: bool,
    /// Number of images evicted from the request history.
    pub evicted: usize,
}

/// Owned request history paired with its image-budget outcome.
#[derive(Clone, Debug)]
pub struct BudgetedConversation {
    /// Request history after any required image eviction.
    pub items: Vec<ConversationItem>,
    /// Byte and eviction accounting for the transformation.
    pub outcome: ImageBudgetOutcome,
}

/// Derive high- and low-water marks from a provider request cap.
pub fn image_budget_limits(max_request_bytes: Option<NonZeroU64>) -> (usize, usize) {
    let Some(max_request_bytes) = max_request_bytes else {
        return (
            IMAGE_COMPACT_TRIGGER_BYTES,
            IMAGE_COMPACT_RECLAIM_TARGET_BYTES,
        );
    };
    let cap = usize::try_from(max_request_bytes.get())
        .unwrap_or(usize::MAX)
        .max(MIN_REQUEST_BYTES);
    (cap - TRIGGER_HEADROOM_BYTES, cap / 2)
}

/// Applies limits derived from the model's request-body cap.
#[must_use]
pub fn apply_image_budget(
    items: Vec<ConversationItem>,
    max_request_bytes: Option<NonZeroU64>,
) -> BudgetedConversation {
    let (trigger_bytes, reclaim_target_bytes) = image_budget_limits(max_request_bytes);
    apply_image_budget_with_limits(items, trigger_bytes, reclaim_target_bytes)
}

/// Applies an explicit high-water trigger and low-water reclaim target.
///
/// Callers that add request fields outside the conversation can subtract those
/// serialized bytes from both limits before calling this function.
#[must_use]
pub fn apply_image_budget_with_limits(
    mut items: Vec<ConversationItem>,
    trigger_bytes: usize,
    reclaim_target_bytes: usize,
) -> BudgetedConversation {
    let body_bytes = conversation_body_bytes(&items);
    let inline_images = inline_image_count(&items);
    let needs_image_compaction = body_bytes >= trigger_bytes;
    let mut evicted = 0;
    if needs_image_compaction && body_bytes > reclaim_target_bytes {
        evicted = evict_images_to_budget(&mut items, body_bytes, reclaim_target_bytes);
    }
    let body_bytes_after = if evicted == 0 {
        body_bytes
    } else {
        conversation_body_bytes(&items)
    };
    BudgetedConversation {
        items,
        outcome: ImageBudgetOutcome {
            body_bytes,
            body_bytes_after,
            inline_images,
            needs_image_compaction,
            evicted,
        },
    }
}

/// Exact serialized contribution of one image URL. For a base64 `data:` URI
/// the tail cannot require JSON escaping, so only the header is escape-scanned
/// and the tail is counted raw; any other URL is escape-scanned in full.
fn encoded_url_bytes(url: &str) -> usize {
    let Some((header, base64_tail)) = url.split_once(",") else {
        return serialized_json_bytes(url).saturating_sub(2);
    };
    if header.starts_with("data:") && header.ends_with(";base64") {
        serialized_json_bytes(header).saturating_sub(2) + 1 + base64_tail.len()
    } else {
        serialized_json_bytes(url).saturating_sub(2)
    }
}

const IMAGE_PART_FRAME_BYTES: usize = r#"{"type":"image","url":""}"#.len();

fn image_part_bytes(part: &ContentPart) -> usize {
    match part {
        ContentPart::Image { url } => IMAGE_PART_FRAME_BYTES + encoded_url_bytes(url),
        ContentPart::Text { .. } => unreachable!("image discovery must return only images"),
    }
}

/// Exact serialized size of the conversation body without scanning base64
/// image tails.
///
/// The copy blanks image URLs before serialization, then adds back each URL's
/// exact escaped contribution. For a base64 data URI, only the caller-supplied
/// header is escape-scanned; the base64 tail cannot require JSON escaping.
pub fn conversation_body_bytes(conversation: &[ConversationItem]) -> usize {
    let mut blanked = conversation.to_vec();
    let mut image_url_bytes = 0usize;
    for item in &mut blanked {
        match item {
            ConversationItem::User(user) => {
                blank_image_urls(&mut user.content, &mut image_url_bytes);
            }
            ConversationItem::ToolResult(tool_result) => {
                blank_image_urls(&mut tool_result.images, &mut image_url_bytes);
            }
            ConversationItem::System(_)
            | ConversationItem::Assistant(_)
            | ConversationItem::BackendToolCall(_)
            | ConversationItem::Reasoning(_) => {}
        }
    }
    serialized_json_bytes(&blanked) + image_url_bytes
}

fn blank_image_urls(parts: &mut [ContentPart], image_url_bytes: &mut usize) {
    for part in parts {
        if let ContentPart::Image { url } = part {
            *image_url_bytes += encoded_url_bytes(url);
            *url = std::sync::Arc::<str>::from("");
        }
    }
}

/// Where an inline image lives — a user-message content part or a tool-result
/// image vec. Eviction replaces user parts with a text placeholder but removes
/// tool-result images outright (appending a note to the result content, since
/// the images live in a separate vec with no part slot to leave a marker in).
#[derive(Clone, Copy)]
enum ImageLocation {
    User { item: usize, part: usize },
    ToolResult { item: usize },
}

/// Replace the oldest inline images with [`IMAGE_COMPACT_PLACEHOLDER`] until
/// the serialized request body drops back to `target_bytes`, keeping the
/// newest images. Returns the number of evicted images; callers re-measure
/// the body for exact post-eviction accounting.
///
/// Operates on a mutable slice — intended for the request *copy* so the stored
/// conversation is never modified.
///
/// ## Cache behavior
///
/// Eviction is **oldest-first**, which is sticky by construction: because we
/// always retain the newest images, an image only transitions image →
/// placeholder as *newer/larger* payloads push the body past the limit, never
/// placeholder → image within a stable prefix. (Token compaction removes old
/// turns wholesale and can free room to restore a previously-evicted image,
/// but that already rewrites the prefix and invalidates the server-side prompt
/// cache, so the restore is free.)
///
/// The caller gates eviction at [`IMAGE_COMPACT_TRIGGER_BYTES`] but passes the
/// lower [`IMAGE_COMPACT_RECLAIM_TARGET_BYTES`] as `target_bytes`, so one
/// eviction reclaims a batch of the oldest images and frees headroom for many
/// later image turns. This turns "rewrite the prefix on essentially every turn
/// once at the ceiling" into one larger, rare rewrite followed by a long
/// cache-warm stretch — the prefix-cache cost of dropping the oldest (least
/// useful) image is paid infrequently instead of per turn.
fn evict_images_to_budget(
    conversation: &mut [ConversationItem],
    current_bytes: usize,
    target_bytes: usize,
) -> usize {
    let placeholder = ContentPart::Text {
        text: std::sync::Arc::<str>::from(IMAGE_COMPACT_PLACEHOLDER),
    };
    let placeholder_bytes = serialized_json_bytes(&placeholder);
    let tool_note_suffix = format!("\n\n{TOOL_IMAGE_COMPACT_NOTE}");
    let tool_note_bytes = serialized_json_bytes(&tool_note_suffix).saturating_sub(2);
    let mut images = Vec::new();
    for (item, conversation_item) in conversation.iter().enumerate() {
        match conversation_item {
            ConversationItem::User(user) => {
                for (part, content_part) in user.content.iter().enumerate() {
                    if let ContentPart::Image { .. } = content_part {
                        images.push((
                            ImageLocation::User { item, part },
                            image_part_bytes(content_part),
                        ));
                    }
                }
            }
            ConversationItem::ToolResult(tool_result) => {
                for content_part in &tool_result.images {
                    if let ContentPart::Image { .. } = content_part {
                        images.push((
                            ImageLocation::ToolResult { item },
                            image_part_bytes(content_part),
                        ));
                    }
                }
            }
            ConversationItem::System(_)
            | ConversationItem::Assistant(_)
            | ConversationItem::BackendToolCall(_)
            | ConversationItem::Reasoning(_) => {}
        }
    }

    let mut running = current_bytes;
    let mut evicted = 0;
    for (location, image_bytes) in images {
        if running <= target_bytes {
            break;
        }
        match location {
            ImageLocation::User { item, part } => {
                let ConversationItem::User(user) = &mut conversation[item] else {
                    unreachable!("image location must retain its item variant")
                };
                user.content[part] = placeholder.clone();
                running = running.saturating_sub(image_bytes.saturating_sub(placeholder_bytes));
            }
            ImageLocation::ToolResult { item } => {
                let ConversationItem::ToolResult(tool_result) = &mut conversation[item] else {
                    unreachable!("image location must retain its item variant")
                };
                let image_index = tool_result
                    .images
                    .iter()
                    .position(|part| matches!(part, ContentPart::Image { .. }))
                    .expect("discovered tool image must remain present");
                tool_result.images.remove(image_index);
                // The removed image takes its array comma with it unless it was
                // the last element (then no separator disappears).
                running = running
                    .saturating_sub(image_bytes + usize::from(!tool_result.images.is_empty()));
                if !tool_result.content.contains(TOOL_IMAGE_COMPACT_NOTE) {
                    tool_result.content =
                        format!("{}{tool_note_suffix}", tool_result.content).into();
                    running = running.saturating_add(tool_note_bytes);
                }
            }
        }
        evicted += 1;
    }
    evicted
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_sampling_types::ToolCall;

    fn image(url: impl Into<String>) -> ContentPart {
        ContentPart::Image {
            url: url.into().into(),
        }
    }

    fn data_image(byte: char, bytes: usize) -> ContentPart {
        let prefix = "data:image/png;base64,";
        image(format!(
            "{prefix}{}",
            byte.to_string().repeat(bytes - prefix.len())
        ))
    }

    fn mixed_history() -> Vec<ConversationItem> {
        vec![
            ConversationItem::user_with_parts(vec![
                ContentPart::Text {
                    text: "old user".into(),
                },
                data_image('U', 500),
            ]),
            ConversationItem::assistant_tool_calls(vec![ToolCall {
                id: "call-1".into(),
                name: "read_file".into(),
                arguments: r#"{"target_file":"image.png"}"#.into(),
            }]),
            ConversationItem::tool_result_with_images(
                "call-1",
                "tool text",
                vec![
                    ContentPart::Text {
                        text: "metadata".into(),
                    },
                    data_image('A', 500),
                    data_image('B', 500),
                    data_image('C', 500),
                ],
            ),
            ConversationItem::user_with_parts(vec![data_image('N', 500)]),
            ConversationItem::assistant_tool_calls(vec![ToolCall {
                id: "call-2".into(),
                name: "read_file".into(),
                arguments: r#"{"target_file":"new.png"}"#.into(),
            }]),
            ConversationItem::tool_result_with_images(
                "call-2",
                "new tool text",
                vec![data_image('Z', 500)],
            ),
        ]
    }

    fn expected_after_three_evictions() -> Vec<ConversationItem> {
        let mut expected = mixed_history();
        let ConversationItem::User(user) = &mut expected[0] else {
            unreachable!()
        };
        user.content[1] = ContentPart::Text {
            text: IMAGE_COMPACT_PLACEHOLDER.into(),
        };
        let ConversationItem::ToolResult(tool_result) = &mut expected[2] else {
            unreachable!()
        };
        tool_result.images.remove(1);
        tool_result.images.remove(1);
        tool_result.content = format!("tool text\n\n{TOOL_IMAGE_COMPACT_NOTE}").into();
        expected
    }

    #[test]
    fn mixed_escaped_urls_measure_exactly() {
        let history = vec![
            ConversationItem::user_with_parts(vec![image("https://example.com/a\"b\\c\n")]),
            ConversationItem::tool_result_with_images(
                "call-1",
                "tool",
                vec![
                    image("https://example.com/d\"e\\f\t"),
                    image("data:image/\"png\\escaped;base64,AAAA"),
                ],
            ),
        ];
        assert_eq!(
            conversation_body_bytes(&history),
            serde_json::to_vec(&history).unwrap().len()
        );
    }

    #[test]
    fn limits_follow_request_cap_and_backend_defaults() {
        assert_eq!(
            image_budget_limits(None),
            (
                IMAGE_COMPACT_TRIGGER_BYTES,
                IMAGE_COMPACT_RECLAIM_TARGET_BYTES
            )
        );
        assert_eq!(
            image_budget_limits(Some(ApiBackend::Messages.default_max_request_bytes())),
            (30_000_000 - TRIGGER_HEADROOM_BYTES, 15_000_000)
        );
        assert_eq!(
            image_budget_limits(NonZeroU64::new(1)),
            image_budget_limits(NonZeroU64::new(MIN_REQUEST_BYTES as u64))
        );
    }

    #[test]
    fn below_trigger_preserves_complete_history() {
        let history = mixed_history();
        let expected = serde_json::to_value(&history).unwrap();
        let budgeted = apply_image_budget(history, None);
        assert_eq!(
            budgeted.outcome,
            ImageBudgetOutcome {
                body_bytes: budgeted.outcome.body_bytes,
                body_bytes_after: budgeted.outcome.body_bytes,
                inline_images: 6,
                needs_image_compaction: false,
                evicted: 0,
            }
        );
        assert_eq!(serde_json::to_value(budgeted.items).unwrap(), expected);
        assert_eq!(IMAGE_COMPACT_TRIGGER_BYTES, 47 * 1024 * 1024);
        assert_eq!(IMAGE_COMPACT_RECLAIM_TARGET_BYTES, 25 * 1024 * 1024);
    }

    #[test]
    fn partial_tool_result_eviction_is_exact_and_ordered() {
        let expected = expected_after_three_evictions();
        let target = conversation_body_bytes(&expected);
        let budgeted = apply_image_budget_with_limits(mixed_history(), 1, target);
        assert_eq!(
            serde_json::to_value(&budgeted.items).unwrap(),
            serde_json::to_value(&expected).unwrap()
        );
        assert_eq!(
            budgeted.outcome,
            ImageBudgetOutcome {
                body_bytes: conversation_body_bytes(&mixed_history()),
                body_bytes_after: target,
                inline_images: 6,
                needs_image_compaction: true,
                evicted: 3,
            }
        );
        assert_eq!(
            budgeted.outcome.body_bytes_after,
            serde_json::to_vec(&budgeted.items).unwrap().len()
        );
        let ConversationItem::ToolResult(tool_result) = &budgeted.items[2] else {
            unreachable!()
        };
        assert_eq!(tool_result.tool_call_id, "call-1");
        assert_eq!(
            tool_result.content.as_ref(),
            format!("tool text\n\n{TOOL_IMAGE_COMPACT_NOTE}")
        );
        assert_eq!(
            tool_result.content.matches(TOOL_IMAGE_COMPACT_NOTE).count(),
            1
        );
        assert!(
            matches!(&tool_result.images[..], [ContentPart::Text { text }, ContentPart::Image { url }] if text.as_ref() == "metadata" && url.contains('C'))
        );
        assert!(
            matches!(&budgeted.items[3], ConversationItem::User(user) if matches!(user.content.first(), Some(ContentPart::Image { url }) if url.contains('N')))
        );
        assert!(
            matches!(&budgeted.items[5], ConversationItem::ToolResult(result) if matches!(result.images.first(), Some(ContentPart::Image { url }) if url.contains('Z')))
        );
    }

    #[test]
    fn final_tool_image_removal_reports_exact_omitted_field_size() {
        let history = vec![ConversationItem::tool_result_with_images(
            "call-1",
            "tool",
            vec![data_image('A', 500)],
        )];
        let expected = vec![ConversationItem::tool_result(
            "call-1",
            format!("tool\n\n{TOOL_IMAGE_COMPACT_NOTE}"),
        )];
        let target = conversation_body_bytes(&expected);
        let budgeted = apply_image_budget_with_limits(history, 1, target);
        assert_eq!(
            serde_json::to_value(&budgeted.items).unwrap(),
            serde_json::to_value(&expected).unwrap()
        );
        assert_eq!(budgeted.outcome.evicted, 1);
        assert_eq!(budgeted.outcome.body_bytes_after, target);
        assert_eq!(target, serde_json::to_vec(&budgeted.items).unwrap().len());
    }

    #[test]
    fn production_threshold_reclaims_a_batch_to_low_water_mark() {
        let image_bytes = 2 * 1024 * 1024;
        let image_count = IMAGE_COMPACT_TRIGGER_BYTES / image_bytes + 2;
        let history = (0..image_count)
            .map(|index| {
                ConversationItem::user_with_parts(vec![data_image(
                    char::from(b'A' + (index % 26) as u8),
                    image_bytes,
                )])
            })
            .collect();
        let budgeted = apply_image_budget(history, None);

        assert!(budgeted.outcome.body_bytes >= IMAGE_COMPACT_TRIGGER_BYTES);
        assert!(budgeted.outcome.body_bytes_after <= IMAGE_COMPACT_RECLAIM_TARGET_BYTES);
        assert!(budgeted.outcome.evicted > image_count / 4);
        assert!(matches!(
            budgeted.items.last(),
            Some(ConversationItem::User(user))
                if matches!(user.content.first(), Some(ContentPart::Image { .. }))
        ));
        assert_eq!(
            budgeted.outcome.body_bytes_after,
            serde_json::to_vec(&budgeted.items).unwrap().len()
        );
    }

    #[test]
    fn trigger_and_reclaim_boundaries_are_inclusive() {
        let history = vec![ConversationItem::user_with_parts(vec![data_image(
            'A', 500,
        )])];
        let bytes = conversation_body_bytes(&history);

        let at_trigger = apply_image_budget_with_limits(history.clone(), bytes, bytes);
        assert!(at_trigger.outcome.needs_image_compaction);
        assert_eq!(at_trigger.outcome.evicted, 0);
        assert_eq!(
            serde_json::to_value(at_trigger.items).unwrap(),
            serde_json::to_value(&history).unwrap()
        );

        let below_trigger = apply_image_budget_with_limits(history.clone(), bytes + 1, 0);
        assert!(!below_trigger.outcome.needs_image_compaction);
        assert_eq!(below_trigger.outcome.evicted, 0);
        assert_eq!(
            serde_json::to_value(below_trigger.items).unwrap(),
            serde_json::to_value(history).unwrap()
        );
    }

    // ── Migrated request-builder coverage ──────────────────────────────────

    fn user_with_image(text: &str) -> ConversationItem {
        let mut item = ConversationItem::user(text);
        item.add_image("data:image/png;base64,iVBORw0KGgo=");
        item
    }

    /// A user message carrying an inline image whose `data:` URL is exactly
    /// `url_bytes` long (must be >= the data-URL prefix length).
    fn user_with_image_of_bytes(text: &str, url_bytes: usize) -> ConversationItem {
        const PREFIX: &str = "data:image/png;base64,";
        let pad = url_bytes.saturating_sub(PREFIX.len());
        let mut item = ConversationItem::user(text);
        item.add_image(format!("{PREFIX}{}", "A".repeat(pad)));
        item
    }

    fn has_image(item: &ConversationItem) -> bool {
        matches!(
            item,
            ConversationItem::User(u)
                if u.content.iter().any(|p| matches!(p, ContentPart::Image { .. }))
        )
    }

    fn has_placeholder(item: &ConversationItem) -> bool {
        matches!(
            item,
            ConversationItem::User(u) if u.content.iter().any(|p| matches!(
                p,
                ContentPart::Text { text } if text.as_ref() == IMAGE_COMPACT_PLACEHOLDER
            ))
        )
    }

    // Images are sized ~100 KB so the ~235 B placeholder that replaces an
    // evicted image is negligible: each eviction frees ~one image's bytes.
    const TEST_IMG_BYTES: usize = 100_000;

    #[test]
    fn no_eviction_when_at_or_below_target() {
        // Multiple old image turns are *retained* when the body already fits —
        // the key behavior change from the old "strip everything but newest".
        let conv = vec![
            ConversationItem::system("sys"),
            user_with_image_of_bytes("first", TEST_IMG_BYTES),
            ConversationItem::assistant("a"),
            user_with_image_of_bytes("second", TEST_IMG_BYTES),
            user_with_image_of_bytes("third", TEST_IMG_BYTES),
        ];
        // ~300 KB body < 400 KB target: nothing to do.
        let budgeted = apply_image_budget_with_limits(conv, 1, 400_000);
        assert_eq!(budgeted.outcome.evicted, 0);
        assert_eq!(budgeted.items.iter().filter(|i| has_image(i)).count(), 3);
    }

    #[test]
    fn evicts_oldest_until_under_target() {
        let conv = vec![
            user_with_image_of_bytes("oldest", TEST_IMG_BYTES),
            user_with_image_of_bytes("middle", TEST_IMG_BYTES),
            user_with_image_of_bytes("newest", TEST_IMG_BYTES),
        ];
        // ~300 KB body, 250 KB target: evicting the oldest (~100 KB) fits.
        let budgeted = apply_image_budget_with_limits(conv, 1, 250_000);
        assert!(has_placeholder(&budgeted.items[0]), "oldest evicted");
        assert!(has_image(&budgeted.items[1]), "middle kept");
        assert!(has_image(&budgeted.items[2]), "newest kept");
    }

    #[test]
    fn evicts_more_oldest_for_lower_target() {
        let conv = vec![
            user_with_image_of_bytes("oldest", TEST_IMG_BYTES),
            user_with_image_of_bytes("middle", TEST_IMG_BYTES),
            user_with_image_of_bytes("newest", TEST_IMG_BYTES),
        ];
        // ~300 KB body, 150 KB target: must drop the two oldest to fit.
        let budgeted = apply_image_budget_with_limits(conv, 1, 150_000);
        assert!(has_placeholder(&budgeted.items[0]));
        assert!(has_placeholder(&budgeted.items[1]));
        assert!(has_image(&budgeted.items[2]), "newest kept");
    }

    #[test]
    fn eviction_reclaims_batch_to_low_water_mark() {
        // Mirror production: a body sitting just over the trigger, made of many
        // equal images, is reclaimed in one pass down to the low-water mark —
        // dropping a *batch* of the oldest, not just the one image needed to
        // clear the trigger. This is the hysteresis that keeps the prefix
        // cache-warm for the following turns.
        let img_bytes = 1_000_000usize; // ~1 MB url each
        let n = (IMAGE_COMPACT_TRIGGER_BYTES / img_bytes) + 2; // body just over trigger
        let conv: Vec<ConversationItem> = (0..n)
            .map(|i| user_with_image_of_bytes(&format!("i{i}"), img_bytes))
            .collect();

        let budgeted = apply_image_budget_with_limits(
            conv,
            IMAGE_COMPACT_TRIGGER_BYTES,
            IMAGE_COMPACT_RECLAIM_TARGET_BYTES,
        );
        let kept = budgeted.items.iter().filter(|i| has_image(i)).count();
        let evicted = budgeted
            .items
            .iter()
            .filter(|i| has_placeholder(i))
            .count();

        // Clearing only the trigger would evict ~3 images; reclaiming to the
        // low-water mark (~half the ceiling) must evict far more.
        assert!(
            evicted > n / 4,
            "expected batch eviction to the low-water mark, only {evicted}/{n} evicted"
        );
        // Oldest-first stops at the mark, so the most recent image survives.
        assert!(kept > 0);
        assert!(
            has_image(budgeted.items.last().unwrap()),
            "most recent image must be retained"
        );
    }

    #[test]
    fn evicts_all_when_target_below_one_image() {
        let conv = vec![
            user_with_image_of_bytes("a", TEST_IMG_BYTES),
            user_with_image_of_bytes("b", TEST_IMG_BYTES),
        ];
        let budgeted = apply_image_budget_with_limits(conv, 1, 50_000);
        assert!(has_placeholder(&budgeted.items[0]));
        assert!(has_placeholder(&budgeted.items[1]));
    }

    #[test]
    fn eviction_keeps_newest_and_is_idempotent() {
        let conv = vec![
            user_with_image_of_bytes("i0", TEST_IMG_BYTES),
            user_with_image_of_bytes("i1", TEST_IMG_BYTES),
            user_with_image_of_bytes("i2", TEST_IMG_BYTES),
            user_with_image_of_bytes("i3", TEST_IMG_BYTES),
        ];
        // ~400 KB body, 250 KB target: drop the two oldest, keep the newest two.
        let budgeted = apply_image_budget_with_limits(conv, 1, 250_000);
        assert!(has_placeholder(&budgeted.items[0]) && has_placeholder(&budgeted.items[1]));
        assert!(has_image(&budgeted.items[2]) && has_image(&budgeted.items[3]));

        // Re-running with the now-smaller body is a no-op (sticky): the two
        // surviving images already fit.
        let again = apply_image_budget_with_limits(budgeted.items, 1, 250_000);
        assert_eq!(again.outcome.evicted, 0);
        assert!(has_placeholder(&again.items[0]) && has_placeholder(&again.items[1]));
        assert!(has_image(&again.items[2]) && has_image(&again.items[3]));
    }

    #[test]
    fn evicted_image_uses_honest_placeholder() {
        let conv = vec![user_with_image_of_bytes("x", TEST_IMG_BYTES)];
        let budgeted = apply_image_budget_with_limits(conv, 1, 10);
        assert!(has_placeholder(&budgeted.items[0]));
    }

    // -- conversation_body_bytes tests --

    #[test]
    fn conversation_body_bytes_empty_is_json_array() {
        // serde encodes an empty slice as "[]" (2 bytes).
        assert_eq!(conversation_body_bytes(&[]), 2);
    }

    #[test]
    fn conversation_body_bytes_matches_serde_json_exactly() {
        // The blank-and-add-URLs measurement must equal a full serde_json
        // encode byte-for-byte — including non-image content and string
        // escaping. The `"` in the system text is escaped by serde; the
        // measurement must account for it.
        let conv = vec![
            ConversationItem::system("system \"quoted\" prompt"),
            user_with_image("look"),
            ConversationItem::assistant("a longer assistant reply with text"),
            ConversationItem::user("plain follow-up turn"),
        ];
        let expected = serde_json::to_vec(&conv).unwrap().len();
        assert_eq!(conversation_body_bytes(&conv), expected);
    }

    #[test]
    fn conversation_body_bytes_matches_serde_json_with_large_image() {
        // Exact even for a multi-KB base64 payload — the scan we deliberately
        // skip still lands on the same byte count.
        let conv = vec![user_with_image_of_bytes("big", 50_000)];
        let expected = serde_json::to_vec(&conv).unwrap().len();
        assert_eq!(conversation_body_bytes(&conv), expected);
    }

    #[test]
    fn conversation_body_bytes_small_image_is_below_trigger() {
        // A normal small inline image must not trip the 50 MB gate — the case
        // the cache-miss fix preserves.
        let conv = vec![
            user_with_image("old"),
            ConversationItem::assistant("reply"),
            ConversationItem::user("current"),
        ];
        assert!(conversation_body_bytes(&conv) < IMAGE_COMPACT_TRIGGER_BYTES);
    }

    #[test]
    fn conversation_body_bytes_large_image_reaches_trigger() {
        let conv = vec![user_with_image_of_bytes("big", IMAGE_COMPACT_TRIGGER_BYTES)];
        assert!(conversation_body_bytes(&conv) >= IMAGE_COMPACT_TRIGGER_BYTES);
    }

    // -- edge cases: exactness, boundaries, ordering --

    #[test]
    fn body_bytes_parity_multi_image_unicode_escaping() {
        // The gate is only as correct as this equality. Exercise multiple
        // images in one turn, multibyte unicode (passed through, not escaped),
        // and chars serde *does* escape (`"`, `\`, control).
        let mut turn = ConversationItem::user("two pics 🚀 with \"quotes\" and \\ slash");
        turn.add_image("data:image/png;base64,AAAA");
        turn.add_image("data:image/png;base64,BBBBBB");
        let conv = vec![
            ConversationItem::system("sys 日本語 \t control"),
            turn,
            ConversationItem::assistant("reply"),
            ConversationItem::user("plain follow-up"),
        ];
        assert_eq!(
            conversation_body_bytes(&conv),
            serde_json::to_vec(&conv).unwrap().len()
        );
    }

    #[test]
    fn no_eviction_when_at_or_below_measured_target() {
        // The eviction guard is `body <= target`; pin the inclusive boundary
        // against the exactly-measured body.
        let conv = vec![user_with_image_of_bytes("a", TEST_IMG_BYTES)];
        let bytes = conversation_body_bytes(&conv);
        let budgeted = apply_image_budget_with_limits(conv, 1, bytes);
        assert_eq!(budgeted.outcome.evicted, 0);
        assert!(has_image(&budgeted.items[0]), "exactly at target must not evict");
    }

    #[test]
    fn terminates_when_placeholder_exceeds_image() {
        // Tiny images: each "saving" saturates to 0, but the loop must still
        // terminate and replace every image when the target is unreachable.
        let conv = vec![
            user_with_image_of_bytes("a", 40),
            user_with_image_of_bytes("b", 40),
        ];
        let budgeted = apply_image_budget_with_limits(conv, 1, 10);
        assert!(has_placeholder(&budgeted.items[0]) && has_placeholder(&budgeted.items[1]));
    }

    #[test]
    fn evicts_oldest_image_parts_first() {
        // `has_image`/`has_placeholder` are per-item, so count actual image
        // parts to verify oldest-first ordering across parts within a turn.
        fn image_parts(conv: &[ConversationItem]) -> usize {
            conv.iter()
                .filter_map(|i| match i {
                    ConversationItem::User(u) => Some(u),
                    _ => None,
                })
                .flat_map(|u| u.content.iter())
                .filter(|p| matches!(p, ContentPart::Image { .. }))
                .count()
        }
        let mut newest = ConversationItem::user("newest turn");
        newest.add_image(format!(
            "data:image/png;base64,{}",
            "A".repeat(TEST_IMG_BYTES)
        ));
        newest.add_image(format!(
            "data:image/png;base64,{}",
            "B".repeat(TEST_IMG_BYTES)
        ));
        let conv = vec![user_with_image_of_bytes("oldest", TEST_IMG_BYTES), newest];
        assert_eq!(image_parts(&conv), 3);

        // ~300 KB body, reclaim to 150 KB: drop the two oldest, keep the newest.
        let budgeted = apply_image_budget_with_limits(conv, 1, 150_000);
        assert_eq!(image_parts(&budgeted.items), 1, "newest image survives");
        assert!(has_placeholder(&budgeted.items[0]), "oldest turn evicted");
        assert!(has_image(&budgeted.items[1]), "newest turn keeps an image");
    }

    // ── Tool-result image coverage ─────────────────────────────────────────
    // read_file on an image file embeds the picture in the tool result, not a
    // user message. Budget accounting and eviction must see those images too,
    // or a session that reads many pictures accumulates them without bound.

    /// A tool result carrying an inline image whose `data:` URL is exactly
    /// `url_bytes` long.
    fn tool_result_with_image_of_bytes(content: &str, url_bytes: usize) -> ConversationItem {
        const PREFIX: &str = "data:image/png;base64,";
        let pad = url_bytes.saturating_sub(PREFIX.len());
        ConversationItem::ToolResult(nofy_sampling_types::ToolResultItem {
            tool_call_id: "tc".to_string(),
            content: content.into(),
            images: vec![ContentPart::Image {
                url: format!("{PREFIX}{}", "A".repeat(pad)).into(),
            }],
        })
    }

    fn tool_images(item: &ConversationItem) -> usize {
        match item {
            ConversationItem::ToolResult(t) => t
                .images
                .iter()
                .filter(|p| matches!(p, ContentPart::Image { .. }))
                .count(),
            _ => 0,
        }
    }

    fn tool_content(item: &ConversationItem) -> String {
        match item {
            ConversationItem::ToolResult(t) => t.content.to_string(),
            _ => String::new(),
        }
    }

    #[test]
    fn inline_image_count_sees_tool_result_images() {
        let conv = vec![
            user_with_image_of_bytes("user image", TEST_IMG_BYTES),
            tool_result_with_image_of_bytes("tool image", TEST_IMG_BYTES),
            tool_result_with_image_of_bytes("another tool image", TEST_IMG_BYTES),
            ConversationItem::assistant("no images"),
        ];
        assert_eq!(inline_image_count(&conv), 3);
    }

    #[test]
    fn conversation_body_bytes_counts_tool_result_image_urls() {
        let without = vec![ConversationItem::ToolResult(
            nofy_sampling_types::ToolResultItem {
                tool_call_id: "tc".to_string(),
                content: "Read image file: sheet.png".into(),
                images: Vec::new(),
            },
        )];
        let url_bytes = TEST_IMG_BYTES;
        let with = vec![tool_result_with_image_of_bytes("Read image file: sheet.png", url_bytes)];
        let delta = conversation_body_bytes(&with) - conversation_body_bytes(&without);
        // The URL's raw bytes, the image-part frame around it, and the
        // `,"images":[...]` field wrapper (omitted entirely when empty by
        // `skip_serializing_if`).
        assert_eq!(
            delta,
            url_bytes + IMAGE_PART_FRAME_BYTES + r#","images":[]"#.len()
        );
    }

    #[test]
    fn evicts_tool_result_images_and_appends_note() {
        let conv = vec![
            tool_result_with_image_of_bytes("oldest tool image", TEST_IMG_BYTES),
            tool_result_with_image_of_bytes("newest tool image", TEST_IMG_BYTES),
        ];
        // ~200 KB body, reclaim to 150 KB: the oldest tool image goes.
        let budgeted = apply_image_budget_with_limits(conv, 1, 150_000);
        assert_eq!(budgeted.outcome.evicted, 1);
        assert_eq!(tool_images(&budgeted.items[0]), 0, "oldest tool image evicted");
        assert_eq!(tool_images(&budgeted.items[1]), 1, "newest tool image kept");
        assert!(
            tool_content(&budgeted.items[0]).contains(TOOL_IMAGE_COMPACT_NOTE),
            "evicted tool result carries the anti-hallucination note"
        );
        assert!(
            !tool_content(&budgeted.items[1]).contains(TOOL_IMAGE_COMPACT_NOTE),
            "kept tool result stays unannotated"
        );
    }

    #[test]
    fn tool_note_appended_once_when_all_images_of_one_result_go() {
        let mut item = tool_result_with_image_of_bytes("two images", TEST_IMG_BYTES);
        if let ConversationItem::ToolResult(t) = &mut item {
            t.images.push(ContentPart::Image {
                url: format!("data:image/png;base64,{}", "B".repeat(TEST_IMG_BYTES)).into(),
            });
        }
        let conv = vec![item];
        // Reclaim far below one image: both go.
        let budgeted = apply_image_budget_with_limits(conv, 1, 10);
        assert_eq!(budgeted.outcome.evicted, 2);
        assert_eq!(tool_images(&budgeted.items[0]), 0);
        let content = tool_content(&budgeted.items[0]);
        assert_eq!(
            content.matches(TOOL_IMAGE_COMPACT_NOTE).count(),
            1,
            "the note is appended once, not per evicted image"
        );
    }

    #[test]
    fn eviction_orders_user_and_tool_images_oldest_first() {
        // Interleaved variants: eviction must walk conversation order across
        // both variants, not evict one variant wholesale.
        let conv = vec![
            tool_result_with_image_of_bytes("oldest (tool)", TEST_IMG_BYTES),
            user_with_image_of_bytes("middle (user)", TEST_IMG_BYTES),
            tool_result_with_image_of_bytes("newest (tool)", TEST_IMG_BYTES),
        ];
        // ~300 KB body, reclaim to 150 KB: the two oldest go, whichever variant.
        let budgeted = apply_image_budget_with_limits(conv, 1, 150_000);
        assert_eq!(budgeted.outcome.evicted, 2);
        assert_eq!(tool_images(&budgeted.items[0]), 0, "oldest tool image evicted");
        assert!(has_placeholder(&budgeted.items[1]), "middle user image evicted");
        assert_eq!(tool_images(&budgeted.items[2]), 1, "newest tool image kept");
    }

    #[test]
    fn escaped_remote_url_measures_exactly() {
        // A remote URL with JSON-escaped chars is escape-scanned in full, so
        // the measurement matches serde byte-for-byte (not a lower bound).
        let mut item = ConversationItem::user("");
        item.add_image(r#"https://example.com/a"b"#);
        let conv = vec![item];
        assert_eq!(
            conversation_body_bytes(&conv),
            serde_json::to_vec(&conv).unwrap().len()
        );
    }
}
