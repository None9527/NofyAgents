use super::*;
/// Identity is the logical credential authority, not a credential value or a
/// machine-specific environment variable. Resolve only during actual calls.
#[async_trait::async_trait]
pub trait CredentialProvider: Send + Sync {
    fn identity(&self) -> &str;
    async fn resolve(&self, reference: &str) -> Result<Option<String>, Error>;
}
pub struct EnvironmentCredentials {
    identity: String,
    prefix: String,
}
impl EnvironmentCredentials {
    pub fn new(authority: &str, prefix: &str) -> Result<Self, Error> {
        if authority.trim().is_empty()
            || authority.len() > 1024
            || prefix.is_empty()
            || prefix.len() > 128
            || !prefix
                .bytes()
                .all(|c| c.is_ascii_alphanumeric() || c == b'_')
        {
            return Err(Error::Composition(
                "environment credential authority/prefix is invalid".into(),
            ));
        }
        Ok(Self {
            identity: format!("credentials-v1:{authority}"),
            prefix: prefix.into(),
        })
    }
}
#[async_trait::async_trait]
impl CredentialProvider for EnvironmentCredentials {
    fn identity(&self) -> &str {
        &self.identity
    }
    async fn resolve(&self, reference: &str) -> Result<Option<String>, Error> {
        if reference.is_empty()
            || reference.len() > 128
            || !reference
                .bytes()
                .all(|c| c.is_ascii_alphanumeric() || c == b'_')
        {
            return Err(Error::Composition(
                "invalid environment credential reference".into(),
            ));
        }
        Ok(std::env::var(format!("{}{reference}", self.prefix))
            .ok()
            .filter(|value| !value.trim().is_empty()))
    }
}
