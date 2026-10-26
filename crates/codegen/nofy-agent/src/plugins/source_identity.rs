//! Stable marketplace source comparisons without widening local-path identity.

/// Git schemes and authorities are case-insensitive; repository paths are not.
pub fn normalize_git_url(url: &str) -> String {
    let url = url.strip_suffix(".git").unwrap_or(url);
    canonical_remote(url).unwrap_or_else(|| url.to_owned())
}

/// Keep local paths exact, including case and a literal `.git` suffix.
pub fn is_same_source_identity(a: &str, b: &str) -> bool {
    a == b || (canonical_remote(a).is_some() && normalize_git_url(a) == normalize_git_url(b))
}

fn canonical_remote(url: &str) -> Option<String> {
    if let Some((scheme, rest)) = url.split_once("://") {
        let (authority, path) = rest.split_at(rest.find('/').unwrap_or(rest.len()));
        return Some(format!(
            "{}://{}{path}",
            scheme.to_ascii_lowercase(),
            authority.to_ascii_lowercase()
        ));
    }
    let (user_host, path) = url.split_once(':')?;
    (user_host.contains('@') && !user_host.contains('/'))
        .then(|| format!("{}:{path}", user_host.to_ascii_lowercase()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn remote_spelling_is_normalized_without_folding_repository_paths() {
        assert!(is_same_source_identity(
            "HTTPS://EXAMPLE.COM/Org/repo.git",
            "https://example.com/Org/repo"
        ));
        assert!(is_same_source_identity(
            "git@EXAMPLE.COM:Org/repo.git",
            "git@example.com:Org/repo"
        ));
        assert!(!is_same_source_identity(
            "https://example.com/Org/repo",
            "https://example.com/org/repo"
        ));
    }

    #[test]
    fn local_paths_remain_distinct() {
        for (a, b) in [
            ("/tmp/market.git", "/tmp/market"),
            ("/tmp/Market", "/tmp/market"),
            ("C:/market.git", "C:/market"),
            ("./git@host:market.git", "./git@host:market"),
        ] {
            assert!(!is_same_source_identity(a, b));
            assert!(is_same_source_identity(a, a));
        }
    }
}
