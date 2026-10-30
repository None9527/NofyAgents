use nofy_agent_runtime::Error;
pub(crate) fn base(value: &str) -> Result<reqwest::Url, Error> {
    let base = reqwest::Url::parse(value)
        .map_err(|_| crate::composition("invalid HTTP connection base"))?;
    if !matches!(base.scheme(), "http" | "https")
        || base.host_str().is_none()
        || !base.username().is_empty()
        || base.password().is_some()
        || base.query().is_some()
        || base.fragment().is_some()
        || !base.path().ends_with('/')
    {
        return Err(crate::composition(
            "HTTP base requires an http(s) directory URL without credentials, query or fragment",
        ));
    }
    Ok(base)
}
pub(crate) fn endpoint(base: &reqwest::Url, path: &str) -> Result<reqwest::Url, Error> {
    if path.starts_with('/') || path.contains(['?', '#', '\\', '%']) {
        return Err(crate::composition(
            "HTTP path must be relative without query or fragment",
        ));
    }
    let url = base
        .join(path)
        .map_err(|_| crate::composition("invalid HTTP tool path"))?;
    if url.origin() != base.origin()
        || !url.path().starts_with(base.path())
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err(crate::composition(
            "HTTP tool path escapes admitted connection",
        ));
    }
    Ok(url)
}
