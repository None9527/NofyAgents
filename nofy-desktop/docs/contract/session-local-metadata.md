# Local session organisation

Archive, pin, explicit unread markers and manual group names belong to the renderer. The kernel remains the owner of session history, running tasks and permanent deletion. No organisation action sends an ACP request or changes workspace files.

The single-window application persists version 1 metadata under `nofy-desktop:session-metadata` in the existing UI preference storage. Metadata uses canonical kernel session IDs, so loading a roster entry keeps the same flags. Data is device-local to the desktop profile: there is no cloud synchronisation or live cross-window coordination. Clearing the desktop profile removes these preferences; uninstall behaviour follows the application's user-data retention policy. No credentials, messages or paths are stored here.

Archive hides idle sessions from the ordinary list. A currently selected archived session remains visible with an archive badge until the user switches away; its conversation stays open. The dedicated archive filter lists only archived sessions, and selecting one opens its history without silently unarchiving it. Running sessions cannot be newly archived; both the menu and pure mutation model enforce this rule. Archiving never cancels a turn or deletes history.

Pinned rows precede unpinned rows within each project/group and in the flat list, then use the selected recent/title sort. Unread is an explicit local marker; successful activation marks the selected session read. Marking the current session unread remains effective until a later navigation activation. This feature does not claim to track cloud/device unread state or automatically infer background responses.

Manual groups are case-sensitive names limited to 80 code units. Setting a blank group removes membership. Renaming updates all members; renaming into an existing name merges those local groups. Dissolving removes membership and leaves sessions and other flags intact. Empty groups disappear because group membership is the source of truth. Project grouping by cwd is separate.

Unversioned maps and version 0 maps migrate known boolean/group fields. Malformed entries are ignored and future schema versions fail closed to an empty local view. Metadata is not pruned merely because a roster response omits a session. A confirmed kernel delete calls `forgetSessionMetadata` for that session only.

Integration APIs: `loadSessionMetadata`, `saveSessionMetadata`, `metadataFor`, `updateSessionMetadata`, `markSessionRead`, `renameSessionGroup`, `forgetSessionMetadata`. `buildSidebarModel` accepts optional `metadata` and `archiveView`; `Sidebar` accepts archive filter and group management callbacks; `SessionActionsMenu` accepts target metadata and a patch callback.

Validation: `test/session-metadata.test.ts` covers migration, invalid data, unsafe key handling, running-archive rejection, active/archive filter semantics, pinned ordering, group changes, read marking and deletion isolation. Integrated GUI verification is recorded separately.
