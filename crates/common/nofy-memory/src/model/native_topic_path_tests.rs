use super::TopicPath;
use std::path::{Path, PathBuf};

#[test]
fn native_nested_path_converts_only_host_separators() {
    let native = PathBuf::from("preferences").join("色彩").join("editor.md");
    assert_eq!(
        TopicPath::from_native_path(&native).unwrap().as_str(),
        "preferences/色彩/editor.md"
    );
}

#[test]
fn logical_text_parser_still_rejects_backslashes() {
    assert!(TopicPath::parse(r"preferences\editor.md").is_err());
    assert!(serde_json::from_str::<TopicPath>(r#""preferences\\editor.md""#).is_err());
}

#[test]
fn native_adapter_preserves_raw_invalid_segments_for_rejection() {
    for raw in [
        "",
        "/editor.md",
        "../editor.md",
        "./editor.md",
        "preferences//editor.md",
        "preferences/./editor.md",
        "preferences/../editor.md",
        "preferences/editor.md/",
        "preferences/editor.txt",
    ] {
        assert!(
            TopicPath::from_native_path(Path::new(raw)).is_err(),
            "{raw:?}"
        );
    }
}

#[cfg(windows)]
#[test]
fn windows_native_adapter_rejects_prefixes_roots_and_raw_invalid_segments() {
    for raw in [
        r"C:editor.md",
        r"C:\preferences\editor.md",
        r"\preferences\editor.md",
        r"\\server\share\editor.md",
        r"\\?\C:\preferences\editor.md",
        r"\\?\UNC\server\share\editor.md",
        r"\\.\C:\preferences\editor.md",
        r"preferences\\editor.md",
        r"preferences\.\editor.md",
        r"preferences\..\editor.md",
        r"preferences\/editor.md",
        r"preferences\editor.md\",
    ] {
        assert!(
            TopicPath::from_native_path(Path::new(raw)).is_err(),
            "{raw:?}"
        );
    }
}

#[cfg(windows)]
#[test]
fn windows_native_adapter_accepts_each_real_separator_spelling() {
    for raw in [
        r"preferences\colors\editor.md",
        "preferences/colors/editor.md",
        r"preferences\colors/editor.md",
    ] {
        assert_eq!(
            TopicPath::from_native_path(Path::new(raw))
                .unwrap()
                .as_str(),
            "preferences/colors/editor.md"
        );
    }
}

#[cfg(unix)]
#[test]
fn unix_native_adapter_retains_literal_backslash_rejection() {
    assert!(TopicPath::from_native_path(Path::new(r"preferences\editor.md")).is_err());
}

#[cfg(unix)]
#[test]
fn native_adapter_preserves_existing_lossy_validation_only() {
    use std::ffi::OsString;
    use std::os::unix::ffi::OsStringExt;
    let path = PathBuf::from(OsString::from_vec(b"editor-\xff.md".to_vec()));
    assert_eq!(
        TopicPath::from_native_path(&path).unwrap().as_str(),
        "editor-\u{fffd}.md"
    );
}
