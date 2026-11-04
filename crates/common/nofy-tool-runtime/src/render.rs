//! Model-facing output extraction.
//!
//! Tool outputs carry both structured data (for agent/client logic) and
//! a model-facing representation as MCP content blocks. [`ToolOutput`]
//! is the trait that the runtime uses to extract the model-facing part.
//!
//! The default [`ToolOutput`] implementation serialises the output
//! to JSON, then walks the structure looking for embedded
//! [`ContentBlock`]-shaped values (images, resources). These are
//! promoted to proper content block types; everything else becomes
//! [`ContentBlock::Text`].
//!
//! Use [`extract_content_blocks`] directly when you need the same
//! conversion on an arbitrary [`serde_json::Value`].
//!
//! # Example — custom model output
//!
//! ```rust
//! use serde::Serialize;
//! use nofy_tool_runtime::render::ToolOutput;
//! use nofy_tool_runtime::ContentBlock;
//!
//! #[derive(Serialize)]
//! struct BashOutput {
//!     stdout: String,
//!     exit_code: i32,
//!     model_output: Vec<ContentBlock>,
//! }
//!
//! impl ToolOutput for BashOutput {
//!     fn model_output(&self) -> Vec<ContentBlock> {
//!         self.model_output.clone()
//!     }
//! }
//! ```
//!
//! # Example — default (automatic MCP extraction)
//!
//! Types that don't override `model_output()` get automatic extraction.
//! Embedded images and resources are promoted; the rest is JSON text:
//!
//! ```rust
//! use serde::Serialize;
//! use nofy_tool_runtime::render::ToolOutput;
//!
//! #[derive(Serialize)]
//! struct SimpleOutput { answer: String }
//! impl ToolOutput for SimpleOutput {}
//! // model sees: ContentBlock::Text { text: r#"{"answer":"..."}"# }
//! ```

use serde::Serialize;
use serde_json::Value;

use crate::tool::ContentBlock;

/// Unified trait for typed tool outputs.
///
/// Extracts model-facing content independently of client presentation.
pub trait ToolOutput: Serialize {
    /// Returns the model-facing content blocks for this output.
    ///
    /// Return an empty `Vec` to signal "use automatic extraction" — the
    /// runtime will call [`extract_content_blocks`] on the serialised
    /// JSON value instead.
    fn model_output(&self) -> Vec<ContentBlock> {
        Vec::new()
    }
}

/// Blanket impl so `serde_json::Value` can be used directly as a
/// `Tool::Output` (handy for stub/test tools and pass-through proxies).
impl ToolOutput for Value {}

/// `String` is a common output type for simple tools.
impl ToolOutput for String {}

/// Delegate through `Box<T>` so boxed outputs (e.g. large response
/// structs) work without a manual impl.
impl<T: ToolOutput + Serialize + ?Sized> ToolOutput for Box<T> {
    fn model_output(&self) -> Vec<ContentBlock> {
        (**self).model_output()
    }
}

/// Extract MCP-compatible [`ContentBlock`]s from a serialised JSON value.
///
/// Strategies are tried in order — first match wins:
///
/// | # | Shape | Result |
/// |---|-------|--------|
/// | 1 | Value is itself a `ContentBlock` (`{"type":"text",…}`) | `vec![block]` |
/// | 2 | Array containing ≥ 1 `ContentBlock` | each element: block or text |
/// | 3 | Object with `"content": [...]` (MCP `CallToolResult`) | `structuredContent` (if any) as JSON text, followed by the content array |
/// | 4 | Object with mixed fields | block-shaped fields extracted, rest as JSON text |
/// | 5 | Anything else | `ContentBlock::Text` with the stringified value |
pub fn extract_content_blocks(value: &Value) -> Vec<ContentBlock> {
    // 1. Value IS a single ContentBlock.
    if let Some(block) = try_parse_block(value) {
        return vec![block];
    }

    // 2. Array: convert each element (block-shaped -> block, else -> text).
    //    Only enter this path when at least one element looks like a
    //    ContentBlock so plain arrays like [1,2,3] fall through to text.
    if let Some(arr) = value.as_array()
        && !arr.is_empty()
        && arr.iter().any(looks_like_content_block)
    {
        return arr.iter().map(value_to_block).collect();
    }

    if let Some(obj) = value.as_object() {
        // 3. Object with a `"content"` array -> the standard MCP
        //    CallToolResult shape.
        if let Some(Value::Array(arr)) = obj.get("content")
            && !arr.is_empty()
            && arr.iter().any(looks_like_content_block)
        {
            // Surface `structuredContent` so IDs/handles the server
            // expects the model to round-trip aren't dropped.
            let structured = obj
                .get("structuredContent")
                .filter(|v| !v.is_null())
                .map(|v| ContentBlock::Text {
                    text: v.to_string(),
                });
            let mut blocks = Vec::with_capacity(arr.len() + structured.is_some() as usize);
            blocks.extend(structured);
            blocks.extend(arr.iter().map(value_to_block));
            return blocks;
        }

        // 4. Mixed object -> pull block-shaped field values out; collect
        //    the remaining fields into a single JSON text block.
        let mut extracted = Vec::new();
        let mut remainder = serde_json::Map::new();

        for (key, val) in obj {
            match classify_field(val) {
                FieldShape::Block(block) => extracted.push(block),
                FieldShape::Blocks(blocks) => extracted.extend(blocks),
                FieldShape::Other => {
                    remainder.insert(key.clone(), val.clone());
                }
            }
        }

        if !extracted.is_empty() {
            let mut result = Vec::new();
            if !remainder.is_empty() {
                result.push(ContentBlock::Text {
                    text: Value::Object(remainder).to_string(),
                });
            }
            result.extend(extracted);
            return result;
        }
    }

    // 5. Fallback -> render the whole value as text.
    vec![value_to_block(value)]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/// The `ContentBlock` enum is `#[serde(tag = "type", rename_all =
/// "snake_case")]`, so a JSON object can only be a content block when
/// it has `"type"` set to one of these three values.
const CONTENT_BLOCK_TYPES: &[&str] = &["text", "image", "resource"];

/// Cheap check: could `value` plausibly deserialise as a
/// [`ContentBlock`]?  Only objects with a `"type"` field whose value
/// is one of the known discriminators pass.  This avoids a full
/// `from_value(clone())` on the vast majority of values.
fn looks_like_content_block(value: &Value) -> bool {
    value
        .as_object()
        .and_then(|obj| obj.get("type"))
        .and_then(Value::as_str)
        .is_some_and(|t| CONTENT_BLOCK_TYPES.contains(&t))
}

/// Try to parse `value` as a [`ContentBlock`].  Returns `None`
/// immediately when the value doesn't pass the cheap
/// [`looks_like_content_block`] check, avoiding clone + full
/// deserialisation for non-matching shapes.
fn try_parse_block(value: &Value) -> Option<ContentBlock> {
    if !looks_like_content_block(value) {
        return None;
    }
    serde_json::from_value::<ContentBlock>(value.clone()).ok()
}

/// Result of inspecting a single object field value.
enum FieldShape {
    /// The field value IS a single `ContentBlock`.
    Block(ContentBlock),
    /// The field value is an array where *every* element is a `ContentBlock`.
    Blocks(Vec<ContentBlock>),
    /// The field value does not look like block content.
    Other,
}

/// Classify a field value as block content.
///
/// Conservative for arrays: all elements must deserialise as
/// `ContentBlock`; mixed arrays go to `Other` so ambiguous data
/// (e.g. `"scores": [0.9, 0.8]`) is not silently dropped.
fn classify_field(value: &Value) -> FieldShape {
    // Single block.
    if let Some(block) = try_parse_block(value) {
        return FieldShape::Block(block);
    }
    // Array of blocks — strict: every element must parse.
    if let Some(arr) = value.as_array()
        && !arr.is_empty()
        && arr.iter().all(looks_like_content_block)
    {
        let blocks: Result<Vec<ContentBlock>, _> = arr
            .iter()
            .map(|v| serde_json::from_value::<ContentBlock>(v.clone()))
            .collect();
        if let Ok(blocks) = blocks {
            return FieldShape::Blocks(blocks);
        }
    }
    FieldShape::Other
}

/// Convert a single `Value` to a `ContentBlock`.
///
/// Uses the cheap [`try_parse_block`] check first; on failure wraps
/// the value as `ContentBlock::Text`.  Strings are used verbatim (no
/// extra JSON quoting); all other types go through `Value::to_string`.
fn value_to_block(value: &Value) -> ContentBlock {
    try_parse_block(value).unwrap_or_else(|| ContentBlock::Text {
        text: match value {
            Value::String(s) => s.clone(),
            other => other.to_string(),
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    // ── ToolOutput with custom override ─────────────────────────────

    #[derive(Serialize)]
    struct FakeOutput {
        blocks: Vec<ContentBlock>,
    }

    impl ToolOutput for FakeOutput {
        fn model_output(&self) -> Vec<ContentBlock> {
            self.blocks.clone()
        }
    }

    #[test]
    fn custom_text_block() {
        let o = FakeOutput {
            blocks: vec![ContentBlock::Text {
                text: "hello".into(),
            }],
        };
        assert_eq!(o.model_output().len(), 1);
        assert_eq!(
            o.model_output()[0],
            ContentBlock::Text {
                text: "hello".into()
            }
        );
    }

    #[test]
    fn custom_multimodal() {
        let o = FakeOutput {
            blocks: vec![
                ContentBlock::Text {
                    text: "result:".into(),
                },
                ContentBlock::Image {
                    mime_type: "image/png".into(),
                    data: "iVBOR...".into(),
                    media_id: None,
                    filename: None,
                    path: None,
                    metadata: Default::default(),
                },
            ],
        };
        assert_eq!(o.model_output().len(), 2);
    }

    // ── ToolOutput default → empty (runtime fills via extract) ──────

    #[test]
    fn default_model_output_returns_empty() {
        #[derive(Serialize)]
        struct Plain {
            value: u32,
        }
        impl ToolOutput for Plain {}

        // Default signals "use automatic extraction" by returning empty.
        assert!(Plain { value: 42 }.model_output().is_empty());
    }

    #[test]
    fn runtime_fills_empty_model_output_via_extract() {
        // Simulates what the ToolDyn blanket does: serialise once,
        // then extract_content_blocks on the Value.
        #[derive(Serialize)]
        struct Plain {
            value: u32,
        }
        impl ToolOutput for Plain {}

        let p = Plain { value: 42 };
        let value = serde_json::to_value(&p).unwrap();
        let custom = p.model_output();
        let blocks = if custom.is_empty() {
            extract_content_blocks(&value)
        } else {
            custom
        };
        assert_eq!(blocks.len(), 1);
        assert_eq!(
            blocks[0],
            ContentBlock::Text {
                text: r#"{"value":42}"#.into(),
            }
        );
    }

    // ── extract_content_blocks unit tests ──────────────────────────

    // Strategy 1: single ContentBlock
    #[test]
    fn extract_single_text_block() {
        let v = json!({"type": "text", "text": "hi"});
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks, vec![ContentBlock::Text { text: "hi".into() }]);
    }

    #[test]
    fn extract_single_image_block() {
        let v = json!({"type": "image", "mime_type": "image/png", "data": "abc"});
        let blocks = extract_content_blocks(&v);
        assert_eq!(
            blocks,
            vec![ContentBlock::Image {
                mime_type: "image/png".into(),
                data: "abc".into(),
                media_id: None,
                filename: None,
                path: None,
                metadata: Default::default(),
            }]
        );
    }

    #[test]
    fn extract_single_resource_block() {
        let v = json!({"type": "resource", "uri": "file:///x"});
        let blocks = extract_content_blocks(&v);
        assert_eq!(
            blocks,
            vec![ContentBlock::Resource {
                uri: "file:///x".into(),
                mime_type: None,
                text: None,
            }]
        );
    }

    #[test]
    fn extract_mcp_image_with_camel_case() {
        let v = json!({"type": "image", "mimeType": "image/png", "data": "abc"});
        let blocks = extract_content_blocks(&v);
        assert_eq!(
            blocks,
            vec![ContentBlock::Image {
                mime_type: "image/png".into(),
                data: "abc".into(),
                media_id: None,
                filename: None,
                path: None,
                metadata: Default::default(),
            }]
        );
    }

    // Strategy 2: array of blocks
    #[test]
    fn extract_array_of_blocks() {
        let v = json!([
            {"type": "text", "text": "a"},
            {"type": "image", "mime_type": "image/png", "data": "b"},
        ]);
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 2);
        assert!(matches!(&blocks[0], ContentBlock::Text { text } if text == "a"));
        assert!(matches!(&blocks[1], ContentBlock::Image { .. }));
    }

    #[test]
    fn extract_mixed_array_promotes_non_blocks_to_text() {
        let v = json!([
            {"type": "text", "text": "a"},
            42,
            "raw string",
        ]);
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 3);
        assert_eq!(blocks[0], ContentBlock::Text { text: "a".into() });
        assert_eq!(blocks[1], ContentBlock::Text { text: "42".into() });
        assert_eq!(
            blocks[2],
            ContentBlock::Text {
                text: "raw string".into()
            }
        );
    }

    #[test]
    fn plain_array_falls_through_to_text() {
        // No block-shaped elements → single text fallback.
        let v = json!([1, 2, 3]);
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 1);
        assert_eq!(
            blocks[0],
            ContentBlock::Text {
                text: "[1,2,3]".into()
            }
        );
    }

    // Strategy 3: object with "content" key
    #[test]
    fn extract_content_field() {
        let v = json!({
            "is_error": false,
            "content": [
                {"type": "text", "text": "summary"},
                {"type": "image", "mime_type": "image/png", "data": "b64"},
            ],
        });
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 2);
        assert_eq!(
            blocks[0],
            ContentBlock::Text {
                text: "summary".into()
            }
        );
        assert!(matches!(blocks[1], ContentBlock::Image { .. }));
    }

    // Strategy 3 + structuredContent (MCP CallToolResult)
    #[test]
    fn extract_content_with_structured_content_surfaces_id() {
        let v = json!({
            "content": [
                {"type": "resource", "uri": "ui://tldraw/canvas",
                 "mimeType": "text/html", "text": "<html>…</html>"},
            ],
            "structuredContent": {"drawing_id": "abc123", "title": "sketch"},
            "isError": false,
            "_meta": {"ui": {"resourceUri": "ui://tldraw/canvas"}},
        });
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 2, "expected structured + resource");
        // structuredContent rendered as JSON text, ahead of content.
        let ContentBlock::Text { text } = &blocks[0] else {
            panic!("expected first block to be Text, got {:?}", blocks[0]);
        };
        assert!(
            text.contains("abc123"),
            "structuredContent must surface drawing_id, got: {text}"
        );
        assert!(matches!(&blocks[1], ContentBlock::Resource { .. }));
    }

    #[test]
    fn extract_content_with_null_structured_content_omits_it() {
        let v = json!({
            "content": [{"type": "text", "text": "ok"}],
            "structuredContent": null,
        });
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0], ContentBlock::Text { text: "ok".into() });
    }

    #[test]
    fn extract_content_without_structured_content_unchanged() {
        let v = json!({
            "content": [{"type": "text", "text": "ok"}],
            "isError": false,
        });
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0], ContentBlock::Text { text: "ok".into() });
    }

    // Strategy 4: mixed object with block-shaped field values
    #[test]
    fn extract_mixed_object_separates_blocks_and_remainder() {
        let v = json!({
            "summary": "found 3 results",
            "count": 3,
            "screenshot": {"type": "image", "mime_type": "image/png", "data": "b64"},
        });
        let blocks = extract_content_blocks(&v);
        // Remainder (summary + count) as JSON text, then the image.
        assert_eq!(blocks.len(), 2);
        // First block is the remainder text (field order in JSON objects
        // is not guaranteed, so just check it's Text and non-empty).
        assert!(matches!(&blocks[0], ContentBlock::Text { text } if text.contains("summary")));
        assert!(matches!(&blocks[1], ContentBlock::Image { .. }));
    }

    #[test]
    fn extract_object_with_block_array_field() {
        let v = json!({
            "metadata": "info",
            "results": [
                {"type": "text", "text": "a"},
                {"type": "text", "text": "b"},
            ],
        });
        let blocks = extract_content_blocks(&v);
        // results field → 2 blocks extracted, metadata → remainder text.
        assert_eq!(blocks.len(), 3);
        assert!(matches!(&blocks[0], ContentBlock::Text { text } if text.contains("metadata")));
        assert_eq!(blocks[1], ContentBlock::Text { text: "a".into() });
        assert_eq!(blocks[2], ContentBlock::Text { text: "b".into() });
    }

    // Strategy 5: fallback
    #[test]
    fn extract_plain_string() {
        let blocks = extract_content_blocks(&json!("hello world"));
        assert_eq!(
            blocks,
            vec![ContentBlock::Text {
                text: "hello world".into()
            }]
        );
    }

    #[test]
    fn extract_number() {
        let blocks = extract_content_blocks(&json!(42));
        assert_eq!(blocks, vec![ContentBlock::Text { text: "42".into() }]);
    }

    #[test]
    fn extract_null() {
        let blocks = extract_content_blocks(&json!(null));
        assert_eq!(
            blocks,
            vec![ContentBlock::Text {
                text: "null".into()
            }]
        );
    }

    #[test]
    fn extract_plain_object_no_blocks() {
        let v = json!({"a": 1, "b": "two"});
        let blocks = extract_content_blocks(&v);
        assert_eq!(blocks.len(), 1);
        assert!(matches!(&blocks[0], ContentBlock::Text { .. }));
    }

    #[test]
    fn business_field_names_do_not_hide_structured_siblings() {
        let v = json!({
            "output": {"rows": [1, 2]},
            "prompt_text": "an ordinary business field",
            "effective_tool_name": null,
        });
        assert_eq!(
            extract_content_blocks(&v),
            vec![ContentBlock::Text {
                text: v.to_string()
            }]
        );
    }
}
