//! Magic-byte metadata inspection shared by read tools.

/// Metadata extracted from file bytes via magic-byte inspection.
#[derive(Debug, Clone)]
pub struct FileMetadata {
    pub size: usize,
    pub mime_type: String,
}

impl FileMetadata {
    pub fn is_image(&self) -> bool {
        self.mime_type.starts_with("image/")
    }

    pub fn is_pdf(&self) -> bool {
        self.mime_type == "application/pdf"
    }
}

const PDF_MAGIC: &[u8; 5] = b"%PDF-";

pub(crate) fn is_pdf_magic(bytes: &[u8]) -> bool {
    bytes.len() >= 5 && bytes[..5] == *PDF_MAGIC
}

/// Whether `read_file` may embed `bytes` as a conversation image.
///
/// Adobe SVG often starts with a PNG thumbnail. `infer` sniffs that prefix as
/// `image/png`, and a structurally incomplete thumbnail (no `IEND`) later
/// fails as `invalid_image`. `.svg` / `image/svg+xml`, and an incomplete PNG
/// prefix followed by SVG markup, stay on the text path.
pub fn should_embed_as_conversation_image(
    path: &std::path::Path,
    bytes: &[u8],
    mime: &str,
) -> bool {
    if !mime.starts_with("image/") {
        return false;
    }
    if is_svg_path_or_mime(path, mime) || looks_like_truncated_png_with_svg_suffix(bytes) {
        return false;
    }
    true
}

fn is_svg_path_or_mime(path: &std::path::Path, mime: &str) -> bool {
    mime.eq_ignore_ascii_case("image/svg+xml")
        || path
            .extension()
            .and_then(|e| e.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("svg"))
}

fn looks_like_truncated_png_with_svg_suffix(bytes: &[u8]) -> bool {
    if !bytes.starts_with(PNG_SIGNATURE) {
        return false;
    }
    let suffix = skip_complete_png_chunks(bytes);
    !suffix.is_empty() && extract_svg_text(bytes).is_some()
}

const PNG_SIGNATURE: &[u8] = b"\x89PNG\r\n\x1a\n";

fn skip_complete_png_chunks(bytes: &[u8]) -> &[u8] {
    if !bytes.starts_with(PNG_SIGNATURE) {
        return bytes;
    }
    let mut i = PNG_SIGNATURE.len();
    loop {
        let Some(header_end) = i.checked_add(8) else {
            break;
        };
        let Some(&[l0, l1, l2, l3, t0, t1, t2, t3]) = bytes.get(i..header_end) else {
            break;
        };
        let len = u32::from_be_bytes([l0, l1, l2, l3]) as usize;
        let is_iend = [t0, t1, t2, t3] == *b"IEND";
        let Some(chunk_end) = header_end.checked_add(4).and_then(|n| n.checked_add(len)) else {
            break;
        };
        if chunk_end > bytes.len() {
            break;
        }
        i = chunk_end;
        if is_iend {
            break;
        }
    }
    bytes.get(i..).unwrap_or(&[])
}

/// SVG markup, including after a leading PNG thumbnail.
pub fn extract_svg_text(bytes: &[u8]) -> Option<String> {
    let suffix = skip_complete_png_chunks(bytes);
    if let Some(xml) = find_ignore_ascii_case(suffix, b"<?xml") {
        let text = std::str::from_utf8(suffix.get(xml..)?).ok()?;
        if text.contains("<svg") || text.contains("<SVG") {
            return Some(text.to_owned());
        }
    }
    let svg = find_ignore_ascii_case(suffix, b"<svg")?;
    std::str::from_utf8(suffix.get(svg..)?)
        .ok()
        .map(str::to_owned)
}

fn find_ignore_ascii_case(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack
        .windows(needle.len())
        .position(|window| window.eq_ignore_ascii_case(needle))
}

#[cfg(test)]
fn truncated_png_prefix() -> Vec<u8> {
    // Minimal PNG signature + IHDR, no IEND.
    let mut png = b"\x89PNG\r\n\x1a\n".to_vec();
    png.extend_from_slice(&[
        0x00, 0x00, 0x00, 0x0d, b'I', b'H', b'D', b'R', 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
    ]);
    png
}

/// Infer file metadata (MIME type, extension) from raw bytes using magic-byte inspection.
pub fn bytes_to_metadata(file_bytes: &[u8]) -> Result<FileMetadata, nofy_tool_runtime::ToolError> {
    let size = file_bytes.len();
    let data = infer::get(file_bytes).ok_or_else(|| {
        nofy_tool_runtime::ToolError::invalid_arguments(
            "failed to infer file type from magic bytes",
        )
    })?;

    Ok(FileMetadata {
        size,
        mime_type: data.mime_type().to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_pdf_magic_valid() {
        assert!(is_pdf_magic(b"%PDF-1.7 rest of file"));
        assert!(is_pdf_magic(b"%PDF-2.0"));
    }

    #[test]
    fn is_pdf_magic_invalid() {
        assert!(!is_pdf_magic(b"not a pdf"));
        assert!(!is_pdf_magic(b"%PD"));
        assert!(!is_pdf_magic(b""));
    }

    #[test]
    fn file_metadata_is_pdf() {
        let meta = FileMetadata {
            size: 100,
            mime_type: "application/pdf".to_string(),
        };
        assert!(meta.is_pdf());
        assert!(!meta.is_image());
    }

    #[test]
    fn file_metadata_image_is_not_pdf() {
        let meta = FileMetadata {
            size: 100,
            mime_type: "image/png".to_string(),
        };
        assert!(!meta.is_pdf());
        assert!(meta.is_image());
    }

    #[test]
    fn metadata_is_image_and_is_pdf_are_exclusive() {
        let pdf_meta = FileMetadata {
            size: 0,
            mime_type: "application/pdf".to_string(),
        };
        assert!(pdf_meta.is_pdf());
        assert!(!pdf_meta.is_image());

        let img_meta = FileMetadata {
            size: 0,
            mime_type: "image/jpeg".to_string(),
        };
        assert!(img_meta.is_image());
        assert!(!img_meta.is_pdf());
    }

    #[test]
    fn adobe_svg_with_png_thumbnail_is_not_embedded() {
        let mut bytes = truncated_png_prefix();
        bytes.extend_from_slice(
            br#"<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"></svg>
"#,
        );
        assert!(
            !should_embed_as_conversation_image(
                std::path::Path::new("logo.ai.svg"),
                &bytes,
                "image/png"
            ),
            "truncated PNG + SVG markup must stay on the text path"
        );
        assert!(extract_svg_text(&bytes).is_some());
    }

    #[test]
    fn svg_extension_is_not_embedded() {
        assert!(!should_embed_as_conversation_image(
            std::path::Path::new("icon.svg"),
            b"<svg></svg>",
            "image/svg+xml"
        ));
    }

    #[test]
    fn real_png_still_embeds() {
        assert!(should_embed_as_conversation_image(
            std::path::Path::new("pic.png"),
            PNG_SIGNATURE,
            "image/png"
        ));
    }
}
