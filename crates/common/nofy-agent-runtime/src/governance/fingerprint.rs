use super::{BudgetActivity, BudgetCost, BudgetRequest};
use sha2::{Digest, Sha256};

pub(crate) fn child_fingerprint(composition: &str, input: &str) -> String {
    let value = serde_json::to_vec(&(composition, input)).expect("child fingerprint serializes");
    format!("child-group/v1:{:x}", Sha256::digest(value))
}

/// A new representation may identify an original reservation, never replace
/// it. Callers must continue claim/settle with the original stored handle.
pub(super) fn same_child_request(original: &BudgetRequest, request: &BudgetRequest) -> bool {
    if original == request {
        return true;
    }
    if original.activity != BudgetActivity::Child
        || original.reserve
            != (BudgetCost {
                child_calls: 1,
                ..Default::default()
            })
        || original.unbounded_tokens
    {
        return false;
    }
    let Ok((composition, input)) = serde_json::from_str::<(String, String)>(&original.fingerprint)
    else {
        return false;
    };
    if request.fingerprint != child_fingerprint(&composition, &input) {
        return false;
    }
    let mut expected = original.clone();
    expected.fingerprint = request.fingerprint.clone();
    expected == *request
}

#[cfg(test)]
mod tests;
