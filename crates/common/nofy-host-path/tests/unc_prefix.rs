//! Windows path syntax is a pure adapter and is exercised on every host.
use nofy_host_path::Syntax;

fn ordinary_roots() -> Vec<String> {
    let mut roots = Vec::new();
    for first in ['\\', '/'] {
        for second in ['\\', '/'] {
            for between in ['\\', '/'] {
                roots.push(format!("{first}{second}Server{between}Share"));
            }
        }
    }
    roots
}

#[test]
fn ordinary_unc_prefix_separators_are_equivalent_in_both_directions() {
    let syntax = Syntax::Windows;
    for path_root in ordinary_roots() {
        for base_root in ordinary_roots() {
            assert!(
                syntax.starts_with(&path_root, &base_root),
                "{path_root:?}, {base_root:?}"
            );
            for separator in ['\\', '/'] {
                let path = format!("{path_root}{separator}Dir{separator}file");
                let base = format!("{base_root}\\dir");
                assert!(syntax.starts_with(&path, &base), "{path:?}, {base:?}");
                assert!(
                    syntax.starts_with(&path, &base_root),
                    "{path:?}, {base_root:?}"
                );
                assert!(
                    !syntax.starts_with(&base_root, &path),
                    "{base_root:?}, {path:?}"
                );
            }
        }
    }
}

#[test]
fn ordinary_and_verbatim_unc_prefixes_match_in_both_directions() {
    let syntax = Syntax::Windows;
    for root in ordinary_roots() {
        let ordinary = format!("{root}/Dir/file");
        assert!(
            syntax.starts_with(&ordinary, r"\\?\UNC\server\SHARE\dir"),
            "{ordinary:?}"
        );
        assert!(
            syntax.starts_with(r"\\?\UNC\server\SHARE\Dir\file", &format!("{root}/dir")),
            "{root:?}"
        );
        assert!(
            syntax.starts_with(&root, r"\\?\UNC\server\SHARE"),
            "{root:?}"
        );
        assert!(
            syntax.starts_with(r"\\?\UNC\server\SHARE", &root),
            "{root:?}"
        );
    }
}

#[test]
fn unc_matching_preserves_server_share_and_component_boundaries() {
    let syntax = Syntax::Windows;
    for root in ordinary_roots() {
        for other in [
            r"\\other\share",
            r"\\server2\share",
            r"\\server\other",
            r"\\server\share2",
            r"\\?\UNC\other\share",
            r"\\?\UNC\server\share2",
        ] {
            assert!(
                !syntax.starts_with(&format!("{root}/dir"), other),
                "{root:?}, {other:?}"
            );
            assert!(
                !syntax.starts_with(&format!("{other}\\dir"), &root),
                "{other:?}, {root:?}"
            );
        }
        assert!(!syntax.starts_with(&format!("{root}/directory/file"), &format!("{root}/dir")));
        assert!(!syntax.starts_with(&format!("{root}/dir"), &format!("{root}/dir/file")));
    }
}

#[test]
fn verbatim_slashes_do_not_become_unc_separators() {
    let syntax = Syntax::Windows;
    for (verbatim, ordinary) in [
        (r"\\?\UNC\server/share\dir\file", r"\\server\share\dir"),
        (r"\\?\UNC\server\share/dir\file", r"\\server\share\dir"),
        (r"\\?\UNC\server\share\dir/file", r"\\server\share\dir"),
    ] {
        assert!(
            !syntax.starts_with(verbatim, ordinary),
            "{verbatim:?}, {ordinary:?}"
        );
        assert!(
            !syntax.starts_with(ordinary, verbatim),
            "{ordinary:?}, {verbatim:?}"
        );
    }
    assert!(syntax.starts_with(
        r"\\?\UNC\server\share\dir/file\child",
        r"\\?\UNC\server\share\dir/file"
    ));
}

#[test]
fn incomplete_and_device_prefixes_do_not_alias_a_share() {
    let syntax = Syntax::Windows;
    for malformed in ["", r"\", r"\\", r"\\server", r"\\server\", "//server/"] {
        for root in ordinary_roots() {
            assert!(
                !syntax.starts_with(malformed, &root),
                "{malformed:?}, {root:?}"
            );
            assert!(
                !syntax.starts_with(&root, malformed),
                "{root:?}, {malformed:?}"
            );
        }
    }
    for (device, ordinary) in [
        (r"\\.\pipe\private", "//./pipe/private"),
        (r"\\?\Volume{1234}\private", "//?/Volume{1234}/private"),
    ] {
        assert!(!syntax.starts_with(device, ordinary));
        assert!(!syntax.starts_with(ordinary, device));
    }
}

#[test]
fn unc_unicode_case_folding_keeps_existing_normalization_boundaries() {
    let syntax = Syntax::Windows;
    assert!(syntax.starts_with(
        "//SÉRVER/Données/子目录/file",
        "\\\\sérver\\données\\子目录"
    ));
    assert!(syntax.starts_with(
        "\\\\?\\UNC\\sérver\\données\\子目录\\file",
        "//SÉRVER/Données/子目录"
    ));
    assert!(!syntax.starts_with("//server/café/file", "\\\\server\\cafe\u{301}"));
    assert!(!syntax.starts_with("//server/share/子目录二/file", "\\\\server\\share\\子目录"));
}
