use std::cmp::{Ordering, Reverse};

use base64::Engine as _;
use serde::{Deserialize, Serialize};

use super::envelope::SessionKind;
use super::row::UnifiedRow;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub(super) struct CompositeCursor {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub boundary: Option<BoundaryKey>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(super) struct BoundaryKey {
    pub updated_at: String,
    pub kind: SessionKind,
    pub session_id: String,
}

impl CompositeCursor {
    pub(super) fn decode(raw: Option<&str>) -> Self {
        raw.filter(|s| !s.is_empty())
            .and_then(|s| {
                base64::engine::general_purpose::URL_SAFE_NO_PAD
                    .decode(s)
                    .ok()
            })
            .and_then(|bytes| serde_json::from_slice(&bytes).ok())
            .unwrap_or_default()
    }

    pub(super) fn encode(&self) -> String {
        let json = serde_json::to_vec(self).unwrap_or_default();
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(json)
    }
}

pub(super) struct Paginated {
    pub candidates: Vec<UnifiedRow>,
    pub emit_count: usize,
    pub next_cursor: Option<CompositeCursor>,
}

pub(super) fn merge_and_paginate(
    local: Vec<UnifiedRow>,
    cursor: &CompositeCursor,
    limit: usize,
) -> Paginated {
    let mut keyed: Vec<(SortKey, UnifiedRow)> = local
        .into_iter()
        .map(|row| (row_sort_key(&row), row))
        .collect();

    if let Some(boundary) = &cursor.boundary {
        let bkey = boundary_sort_key(boundary);
        keyed.retain(|(k, _)| k.cmp(&bkey) == Ordering::Greater);
    }

    keyed.sort_by(|(a, _), (b, _)| a.cmp(b));

    let emit_count = keyed.len().min(limit);
    let new_boundary = (emit_count > 0).then(|| boundary_of(&keyed[emit_count - 1].1));

    let has_more = keyed.len() > emit_count;
    let next_cursor = has_more.then(|| CompositeCursor {
        boundary: new_boundary.or_else(|| cursor.boundary.clone()),
    });

    let candidates: Vec<UnifiedRow> = keyed.into_iter().map(|(_, row)| row).collect();

    Paginated {
        candidates,
        emit_count,
        next_cursor,
    }
}

type SortKey = (
    Reverse<Option<chrono::DateTime<chrono::FixedOffset>>>,
    SessionKind,
    String,
);

fn row_sort_key(row: &UnifiedRow) -> SortKey {
    (
        Reverse(row.sort_timestamp()),
        row.kind,
        row.legacy.session_id.clone(),
    )
}

fn boundary_sort_key(boundary: &BoundaryKey) -> SortKey {
    (
        Reverse(parse_ts(&boundary.updated_at)),
        boundary.kind,
        boundary.session_id.clone(),
    )
}

fn boundary_of(row: &UnifiedRow) -> BoundaryKey {
    BoundaryKey {
        updated_at: row.updated_at.clone().unwrap_or_default(),
        kind: row.kind,
        session_id: row.legacy.session_id.clone(),
    }
}

fn parse_ts(s: &str) -> Option<chrono::DateTime<chrono::FixedOffset>> {
    chrono::DateTime::parse_from_rfc3339(s).ok()
}

pub(super) fn timestamp_desc(
    a: Option<chrono::DateTime<chrono::FixedOffset>>,
    b: Option<chrono::DateTime<chrono::FixedOffset>>,
) -> Ordering {
    match (a, b) {
        (Some(x), Some(y)) => y.cmp(&x),
        (Some(_), None) => Ordering::Less,
        (None, Some(_)) => Ordering::Greater,
        (None, None) => Ordering::Equal,
    }
}

pub(super) fn cmp_total_order(a: &UnifiedRow, b: &UnifiedRow) -> Ordering {
    timestamp_desc(a.sort_timestamp(), b.sort_timestamp())
        .then_with(|| a.kind.cmp(&b.kind))
        .then_with(|| a.legacy.session_id.cmp(&b.legacy.session_id))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::merge::MergedSession;
    use crate::session::unified_list::{facet_registry, merged_session_to_row};
    use std::collections::BTreeSet;

    fn local(id: &str, ts: &str) -> UnifiedRow {
        let m = MergedSession {
            session_id: id.into(),
            summary: "s".into(),
            first_prompt: None,
            updated_at: ts.into(),
            created_at: "2026-01-01T00:00:00Z".into(),
            cwd: "/x".into(),
            hostname: None,
            source: "local".into(),
            model_id: None,
            num_messages: 1,
            last_active_at: Some(ts.into()),
            branch: None,
            repo_name: None,
            worktree_label: None,
            git_root_dir: None,
            git_remotes: Vec::new(),
            source_workspace_dir: None,
            last_turn_summary: None,
            session_kind: None,
        };
        merged_session_to_row(m, facet_registry())
    }

    fn walk_all(local_window: &[UnifiedRow], limit: usize) -> Vec<String> {
        let mut cursor = CompositeCursor::default();
        let mut emitted: Vec<String> = Vec::new();
        for _ in 0..1000 {
            let result = merge_and_paginate(local_window.to_vec(), &cursor, limit);
            emitted.extend(
                result.candidates[..result.emit_count]
                    .iter()
                    .map(|r| r.legacy.session_id.clone()),
            );
            match result.next_cursor {
                Some(c) => cursor = c,
                None => return emitted,
            }
        }
        panic!("pagination did not terminate");
    }

    fn ids(rows: &[UnifiedRow]) -> Vec<String> {
        rows.iter().map(|r| r.legacy.session_id.clone()).collect()
    }

    #[test]
    fn cursor_round_trips() {
        let cur = CompositeCursor {
            boundary: Some(BoundaryKey {
                updated_at: "2026-06-01T00:00:00Z".into(),
                kind: SessionKind::Build,
                session_id: "sess_1".into(),
            }),
        };
        let decoded = CompositeCursor::decode(Some(&cur.encode()));
        let b = decoded.boundary.unwrap();
        assert_eq!(b.session_id, "sess_1");
        assert_eq!(b.kind, SessionKind::Build);
    }

    #[test]
    fn malformed_cursor_decodes_to_fresh_first_page() {
        for bad in [Some("not base64 !!!"), Some(""), None] {
            let c = CompositeCursor::decode(bad);
            assert!(c.boundary.is_none());
        }
    }

    #[test]
    fn multi_page_walk_equals_single_fetch_window() {
        let local_window = vec![
            local("l1", "2026-06-10T00:00:00Z"),
            local("l2", "2026-06-08T00:00:00Z"),
            local("l3", "2026-06-04T00:00:00Z"),
            local("l4", "2026-05-30T00:00:00Z"),
            local("l5", "2026-05-29T00:00:00Z"),
        ];

        let mut expected_all = local_window.clone();
        expected_all.sort_by(cmp_total_order);
        let expected_ids = ids(&expected_all);

        for &limit in &[1usize, 2, 3, 5, 7, 100] {
            let got = walk_all(&local_window, limit);
            let unique: BTreeSet<&String> = got.iter().collect();
            assert_eq!(
                unique.len(),
                got.len(),
                "duplicate emitted (limit={limit}): {got:?}"
            );
            assert_eq!(got, expected_ids, "walk != single fetch (limit={limit})");
        }
    }

    #[test]
    fn equal_updated_at_tie_break_no_drop_or_dup() {
        let ts = "2026-06-01T00:00:00Z";
        let local_window = vec![
            local("l_same_a", ts),
            local("l_same_b", ts),
            local("l_old", "2026-05-01T00:00:00Z"),
        ];

        let mut expected_all = local_window.clone();
        expected_all.sort_by(cmp_total_order);
        let expected_ids = ids(&expected_all);

        for &limit in &[1usize, 2, 3] {
            let got = walk_all(&local_window, limit);
            let unique: BTreeSet<&String> = got.iter().collect();
            assert_eq!(unique.len(), got.len(), "dup at limit={limit}: {got:?}");
            assert_eq!(
                got, expected_ids,
                "tie-break walk mismatch at limit={limit}"
            );
        }
    }

    #[test]
    fn local_rows_emit_and_terminate() {
        let local_window = vec![
            local("l1", "2026-06-10T00:00:00Z"),
            local("l2", "2026-06-08T00:00:00Z"),
        ];
        let result = merge_and_paginate(local_window.clone(), &CompositeCursor::default(), 10);
        assert_eq!(result.emit_count, 2);
        assert!(result.next_cursor.is_none());
    }
}
