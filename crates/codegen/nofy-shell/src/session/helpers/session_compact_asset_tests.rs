use super::{MAX_COMPACTION_IMAGE_PATHS, retain_session_asset_files};

#[tokio::test]
async fn retains_only_direct_regular_session_assets() {
    let session = tempfile::tempdir().unwrap();
    let assets = session.path().join("assets");
    std::fs::create_dir_all(&assets).unwrap();
    let kept = assets.join("kept.png");
    std::fs::write(&kept, b"png").unwrap();
    let outside = session.path().join("outside.png");
    std::fs::write(&outside, b"png").unwrap();
    let nested = assets.join("nested");
    std::fs::create_dir_all(&nested).unwrap();
    let nested_file = nested.join("nested.png");
    std::fs::write(&nested_file, b"png").unwrap();

    let (paths, dropped) = retain_session_asset_files(
        vec![
            outside.display().to_string(),
            nested_file.display().to_string(),
            kept.display().to_string(),
        ],
        &assets,
    )
    .await;

    assert_eq!(paths, vec![kept.display().to_string()]);
    assert_eq!(dropped, 2);
}

#[tokio::test]
async fn keeps_only_the_newest_bounded_paths_in_chronological_order() {
    let assets = tempfile::tempdir().unwrap();
    let mut input = Vec::new();
    for index in 0..(MAX_COMPACTION_IMAGE_PATHS + 3) {
        let path = assets.path().join(format!("{index}.png"));
        std::fs::write(&path, b"png").unwrap();
        input.push(path.display().to_string());
    }

    let (paths, dropped) = retain_session_asset_files(input.clone(), assets.path()).await;
    assert_eq!(paths, input[3..]);
    assert_eq!(dropped, 3);
}
