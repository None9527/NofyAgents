# ZCode 3.7.6 — recovered architecture map

Everything below was **extracted mechanically from the shipped bundles**
(see `scripts` in the restoration toolchain): no names were invented. The
minifier erased local variable names and types, but the runtime contract —
IPC channels, SQL schema, endpoints, and (via esbuild `keep_names`) original
function/class names — survives verbatim in the code.

## 1. Original symbol names (esbuild keep_names recovery)

The main-process bundles were built with esbuild `keep_names`: every function/class
carries its original name in a `__name(binding, "originalName")` call.
Recovered: **19396 unique original names** at 22274 call sites in 20 files.
The renamer applied every collision-free name back to the code in `out/`.

Files with recovered symbols:

- `out/host/chunk-GTLFVMZF.js` — 15 names
- `out/host/chunk-LMFUAIJT.js` — 5 names
- `out/host/chunk-LVLFJXEE.js` — 27 names
- `out/host/chunk-O5YHTQBW.js` — 707 names
- `out/host/chunk-VHQLK5BG.js` — 16 names
- `out/host/chunk-W4X6UZHY.js` — 203 names
- `out/host/index.js` — 3196 names
- `out/main/chunk-3T43IFYQ.js` — 16 names
- `out/main/chunk-4NAG5RJU.js` — 15 names
- `out/main/chunk-4S3ZB62S.js` — 203 names
- `out/main/chunk-BQIUJ3GU.js` — 5 names
- `out/main/chunk-FEYUN5KX.js` — 11 names
- `out/main/chunk-FQMTTDFW.js` — 506 names
- `out/main/chunk-LQDBAECE.js` — 28 names
- `out/main/index.js` — 1788 names
- `out/preload/embeddedBrowserJavaScriptDialog.cjs` — 404 names
- `out/preload/index.cjs` — 417 names
- `out/preload/processMonitor.cjs` — 400 names
- `out/scheduler/index.js` — 923 names
- `resources/glm/zcode.cjs` — 10511 names

Sample (first 40 from `out/main/index.js`):

```
setDataBaseDir  ->  setDataBaseDir
getDataBaseDir  ->  getDataBaseDir
getZCodeDataRootDir  ->  getZCodeDataRootDir
getConversationWorkspaceDir  ->  getConversationWorkspaceDir
getAppConfigDir  ->  getAppConfigDir
readEnvValue  ->  readEnvValue
normalizeWindowsComparablePath  ->  normalizeWindowsComparablePath
isWindowsPathEqualOrInside  ->  isWindowsPathEqualOrInside
collectWindowsForbiddenAppInstallDirs  ->  collectWindowsForbiddenAppInstallDirs
validateDataBaseDirTarget  ->  validateDataBaseDirTarget
getExportLogStageDir  ->  getExportLogStageDir
getExportLogDir  ->  getExportLogDir
getFeedbackRootDir  ->  getFeedbackRootDir
getFeedbackLogArchiveDir  ->  getFeedbackLogArchiveDir
getWorkspaceKey  ->  getWorkspaceKey
getWorkspaceHash  ->  getWorkspaceHash
getProviderWorkspaceConfigDir  ->  getProviderWorkspaceConfigDir
getProviderWorkspaceZCodeConfigIsolationDir  ->  getProviderWorkspaceZCodeConfigIsolationDir
copyDataDirectory  ->  copyDataDirectory
normalizePathForFaultMatch  ->  normalizePathForFaultMatch
normalizePathPattern  ->  normalizePathPattern
assertNonEmptyString  ->  assertNonEmptyString
parseOperations  ->  parseOperations
parseMaxMatches  ->  parseMaxMatches
parseOptionalString  ->  parseOptionalString
normalizeRule  ->  normalizeRule
operationMatches  ->  operationMatches
pathMatches  ->  pathMatches
hasRemainingMatches  ->  hasRemainingMatches
createInjectedFsFaultError  ->  createInjectedFsFaultError
isInjectedFsFaultError  ->  isInjectedFsFaultError
createFsFaultInjector  ->  createFsFaultInjector
parseFsFaultRulesFromEnvValue  ->  parseFsFaultRulesFromEnvValue
createFsFaultInjectorFromEnv  ->  createFsFaultInjectorFromEnv
getProcessFsFaultInjector  ->  getProcessFsFaultInjector
maybeThrowInjectedFsFault  ->  maybeThrowInjectedFsFault
resolveEffectiveNodeEnv  ->  resolveEffectiveNodeEnv
isEffectiveDevelopmentNodeEnv  ->  isEffectiveDevelopmentNodeEnv
write  ->  write
createServiceLogger  ->  createServiceLogger
```

## 2. IPC channel contract (main ↔ renderer/host)

**506 channel definitions** recovered from enum-like objects, each with its
semantic label and wire string:

### `out/host/index.js` (2 channels)

| Label | Channel |
|---|---|
| `id` | `env:bigmodel-usage` |
| `callback_data` | `zc:cancel` |

### `out/main/chunk-FQMTTDFW.js` (123 channels)

| Label | Channel |
|---|---|
| `AcknowledgePostUpdateReleaseNotes` | `zcode:ack-post-update-release-notes` |
| `ActivateOrSetWorkspace` | `zcode:activate-or-set-workspace` |
| `ApplicationLocaleChanged` | `zcode:application-locale-changed` |
| `BindRemoteWorkspaceSessionContext` | `zcode:bind-remote-workspace-session-context` |
| `BotRemoteWorkspaceReconnected` | `zcode:bot-remote-workspace-reconnected` |
| `BrowserViewAttachGuest` | `zcode:browser-view-attach-guest` |
| `BrowserViewCloseTab` | `zcode:browser-view-close-tab` |
| `BrowserViewCloseTabFromRenderer` | `zcode:browser-view-close-tab-from-renderer` |
| `BrowserViewEnsureResident` | `zcode:browser-view-ensure-resident` |
| `BrowserViewOperation` | `zcode:browser-view-operation` |
| `BrowserViewReady` | `zcode:browser-view-ready` |
| `BrowserViewReportResidency` | `zcode:browser-view-report-residency` |
| `BrowserViewRestore` | `zcode:browser-view-restore` |
| `BrowserViewRestoreTabs` | `zcode:browser-view-restore-tabs` |
| `BrowserViewScreenshotSurfacePrepare` | `zcode:browser-view-screenshot-surface-prepare` |
| `BrowserViewScreenshotSurfaceReady` | `zcode:browser-view-screenshot-surface-ready` |
| `BrowserViewScreenshotSurfaceRelease` | `zcode:browser-view-screenshot-surface-release` |
| `BrowserViewSuspend` | `zcode:browser-view-suspend` |
| `BrowserViewSuspendReady` | `zcode:browser-view-suspend-ready` |
| `BrowserViewUpdateViewport` | `zcode:browser-view-update-viewport` |
| `BrowserViewViewportChanged` | `zcode:browser-view-viewport-changed` |
| `BrowserViewVisibility` | `zcode:browser-view-visibility` |
| `CanOpenCommunity` | `zcode:can-open-community` |
| `CancelPendingRemoteConnection` | `zcode:cancel-pending-remote-connection` |
| `CancelUpdateDownload` | `zcode:cancel-update-download` |
| `CaptureWindowScreenshot` | `zcode:capture-window-screenshot` |
| `ClearEmbeddedBrowserData` | `zcode:clear-embedded-browser-data` |
| `CloseActiveContextRequest` | `zcode:close-active-context-request` |
| `ConnectRemote` | `zcode:connect-remote` |
| `CreateTempTextAttachment` | `zcode:create-temp-text-attachment` |
| `DesktopWindowChromeStateChanged` | `zcode:desktop-window-chrome-state-changed` |
| `DesktopZoomLevelChanged` | `zcode:desktop-zoom-level-changed` |
| `DisposeRemoteSession` | `zcode:dispose-remote-session` |
| `DownloadUpdate` | `zcode:download-update` |
| `ClearFinalArmsCustomEventsE2E` | `zcode:e2e:clear-final-arms-custom-events` |
| `ConfigureFinalArmsCustomEventsE2E` | `zcode:e2e:configure-final-arms-custom-events` |
| `ReadFinalArmsCustomEventsE2E` | `zcode:e2e:read-final-arms-custom-events` |
| `EmbeddedBrowserJavaScriptDialog` | `zcode:embedded-browser-javascript-dialog` |
| `ExecuteDesktopCommand` | `zcode:execute-desktop-command` |
| `ExportLogs` | `zcode:export-logs` |
| `FocusTab` | `zcode:focus-tab` |
| `GetAutoUpdatePreferences` | `zcode:get-auto-update-preferences` |
| `GetDesktopSessionActivity` | `zcode:get-desktop-session-activity` |
| `GetDesktopWindowChromeState` | `zcode:get-desktop-window-chrome-state` |
| `GetDesktopZoomLevel` | `zcode:get-desktop-zoom-level` |
| `GetDeviceId` | `zcode:get-device-id` |
| `GetInstalledEditors` | `zcode:get-installed-editors` |
| `GetProcessMetrics` | `zcode:get-process-metrics` |
| `GetSystemLocale` | `zcode:get-system-locale` |
| `GetUpdateState` | `zcode:get-update-state` |
| `GetWebRemoteControlStatus` | `zcode:get-web-remote-control-status` |
| `GetZCodeStdioTapDevState` | `zcode:get-zcode-stdio-tap-dev-state` |
| `ImportChromeBrowserData` | `zcode:import-chrome-browser-data` |
| `IsDockerAvailable` | `zcode:is-docker-available` |
| `ListDockerContainers` | `zcode:list-docker-containers` |
| `ListSSHConfigAliases` | `zcode:list-ssh-config-aliases` |
| `ListWSLDistros` | `zcode:list-wsl-distros` |
| `LoadMcpFromUserDirectory` | `zcode:load-mcp-from-user-directory` |
| `Log` | `zcode:log` |
| `MigrateLegacyCommonMcp` | `zcode:migrate-legacy-common-mcp` |
| `NewTab` | `zcode:new-tab` |
| `NewTask` | `zcode:new-task` |
| `OAuthCallback` | `zcode:oauth-callback` |
| `OAuthCallbackHandled` | `zcode:oauth-callback-handled` |
| `OAuthRegisterState` | `zcode:oauth-register-state` |
| `OpenBrowserUrl` | `zcode:open-browser-url` |
| `OpenCuaAccessibilitySettings` | `zcode:open-cua-accessibility-settings` |
| `OpenCuaPermissionOnboarding` | `zcode:open-cua-permission-onboarding` |
| `OpenExternal` | `zcode:open-external` |
| `OpenFeedbackDialog` | `zcode:open-feedback-dialog` |
| `OpenInEditor` | `zcode:open-in-editor` |
| `OpenInFileManager` | `zcode:open-in-file-manager` |
| `OpenProcessMonitor` | `zcode:open-process-monitor` |
| `OpenTicketsPanel` | `zcode:open-tickets-panel` |
| `OpenUpdateStatusWindow` | `zcode:open-update-status-window` |
| `OpenWorkspace` | `zcode:open-workspace` |
| `OpenWorkspacePath` | `zcode:open-workspace-path` |
| `PaymentCallback` | `zcode:payment-callback` |
| `StartPerformanceTrace` | `zcode:perf:start` |
| `StopPerformanceTrace` | `zcode:perf:stop` |
| `PostUpdateReleaseNotes` | `zcode:post-update-release-notes` |
| `PrepareCuaHelperPermissionDrag` | `zcode:prepare-cua-helper-permission-drag` |
| `PrintToPdf` | `zcode:print-to-pdf` |
| `QuitAndInstallUpdate` | `zcode:quit-and-install-update` |
| `RemoteConnectionLog` | `zcode:remote-connection-log` |
| `RemoteServicePort` | `zcode:remote-service-port` |
| `RemoteSessionClosed` | `zcode:remote-session-closed` |
| `RendererReady` | `zcode:renderer-ready` |
| `ReportArmsCustomEvent` | `zcode:report-arms-custom-event` |
| `ReportTelemetryEvent` | `zcode:report-telemetry-event` |
| `ResetWebRemoteControlPairing` | `zcode:reset-web-remote-control-pairing` |
| `SaveFile` | `zcode:save-file` |
| `SaveMcpToUserDirectory` | `zcode:save-mcp-to-user-directory` |
| `SelectDirectory` | `zcode:select-directory` |
| `SelectFile` | `zcode:select-file` |
| `SelectFiles` | `zcode:select-files` |
| `ServicePort` | `zcode:service-port` |
| `SetApplicationLocale` | `zcode:set-application-locale` |
| `SetAutoDownloadAndInstallUpdates` | `zcode:set-auto-download-and-install-updates` |
| `SetTitleBarTheme` | `zcode:set-title-bar-theme` |
| `SettingsChanged` | `zcode:settings-changed` |
| `ShowTaskNotification` | `zcode:show-task-notification` |
| `SkipUpdateVersion` | `zcode:skip-update-version` |
| `StartCuaHelperPermissionDrag` | `zcode:start-cua-helper-permission-drag` |
| `StartWebRemoteControl` | `zcode:start-web-remote-control` |
| `StopWebRemoteControl` | `zcode:stop-web-remote-control` |
| `SyncAppSettings` | `zcode:sync-app-settings` |
| `SyncTelemetryContext` | `zcode:sync-telemetry-context` |
| `SyncWebRemoteControlTasks` | `zcode:sync-web-remote-control-tasks` |
| `SyncWebRemoteControlWorkspaces` | `zcode:sync-web-remote-control-workspaces` |
| `SyncWindowTabs` | `zcode:sync-window-tabs` |
| `SyncWindowUnreadCount` | `zcode:sync-window-unread-count` |
| `TaskNotificationClick` | `zcode:task-notification-click` |
| `TaskNotificationSound` | `zcode:task-notification-sound` |
| `UpdateCheckResult` | `zcode:update-check-result` |
| `UpdateReady` | `zcode:update-ready` |
| `UpdateStateChanged` | `zcode:update-state-changed` |
| `WebRemoteControlReconnectWorkspace` | `zcode:web-remote-control-reconnect-workspace` |
| `WebRemoteControlStatusChanged` | `zcode:web-remote-control-status-changed` |
| `WindowControlsOverlayChanged` | `zcode:window-controls-overlay-changed` |
| `WindowControlsOverlayReady` | `zcode:window-controls-overlay-ready` |
| `WindowFullscreenChanged` | `zcode:window-fullscreen-changed` |

### `out/preload/embeddedBrowserJavaScriptDialog.cjs` (121 channels)

| Label | Channel |
|---|---|
| `AcknowledgePostUpdateReleaseNotes` | `zcode:ack-post-update-release-notes` |
| `ActivateOrSetWorkspace` | `zcode:activate-or-set-workspace` |
| `ApplicationLocaleChanged` | `zcode:application-locale-changed` |
| `BindRemoteWorkspaceSessionContext` | `zcode:bind-remote-workspace-session-context` |
| `BotRemoteWorkspaceReconnected` | `zcode:bot-remote-workspace-reconnected` |
| `BrowserViewAttachGuest` | `zcode:browser-view-attach-guest` |
| `BrowserViewCloseTab` | `zcode:browser-view-close-tab` |
| `BrowserViewCloseTabFromRenderer` | `zcode:browser-view-close-tab-from-renderer` |
| `BrowserViewEnsureResident` | `zcode:browser-view-ensure-resident` |
| `BrowserViewOperation` | `zcode:browser-view-operation` |
| `BrowserViewReady` | `zcode:browser-view-ready` |
| `BrowserViewReportResidency` | `zcode:browser-view-report-residency` |
| `BrowserViewRestore` | `zcode:browser-view-restore` |
| `BrowserViewRestoreTabs` | `zcode:browser-view-restore-tabs` |
| `BrowserViewScreenshotSurfacePrepare` | `zcode:browser-view-screenshot-surface-prepare` |
| `BrowserViewScreenshotSurfaceReady` | `zcode:browser-view-screenshot-surface-ready` |
| `BrowserViewScreenshotSurfaceRelease` | `zcode:browser-view-screenshot-surface-release` |
| `BrowserViewSuspend` | `zcode:browser-view-suspend` |
| `BrowserViewSuspendReady` | `zcode:browser-view-suspend-ready` |
| `BrowserViewUpdateViewport` | `zcode:browser-view-update-viewport` |
| `BrowserViewViewportChanged` | `zcode:browser-view-viewport-changed` |
| `BrowserViewVisibility` | `zcode:browser-view-visibility` |
| `CanOpenCommunity` | `zcode:can-open-community` |
| `CancelPendingRemoteConnection` | `zcode:cancel-pending-remote-connection` |
| `CancelUpdateDownload` | `zcode:cancel-update-download` |
| `CaptureWindowScreenshot` | `zcode:capture-window-screenshot` |
| `ClearEmbeddedBrowserData` | `zcode:clear-embedded-browser-data` |
| `CloseActiveContextRequest` | `zcode:close-active-context-request` |
| `ConnectRemote` | `zcode:connect-remote` |
| `CreateTempTextAttachment` | `zcode:create-temp-text-attachment` |
| `DesktopWindowChromeStateChanged` | `zcode:desktop-window-chrome-state-changed` |
| `DesktopZoomLevelChanged` | `zcode:desktop-zoom-level-changed` |
| `DisposeRemoteSession` | `zcode:dispose-remote-session` |
| `DownloadUpdate` | `zcode:download-update` |
| `ClearFinalArmsCustomEventsE2E` | `zcode:e2e:clear-final-arms-custom-events` |
| `ConfigureFinalArmsCustomEventsE2E` | `zcode:e2e:configure-final-arms-custom-events` |
| `ReadFinalArmsCustomEventsE2E` | `zcode:e2e:read-final-arms-custom-events` |
| `EmbeddedBrowserJavaScriptDialog` | `zcode:embedded-browser-javascript-dialog` |
| `WheelBoundary` | `zcode:embedded-browser-wheel-boundary` |
| `ExecuteDesktopCommand` | `zcode:execute-desktop-command` |
| `ExportLogs` | `zcode:export-logs` |
| `FocusTab` | `zcode:focus-tab` |
| `GetAutoUpdatePreferences` | `zcode:get-auto-update-preferences` |
| `GetDesktopSessionActivity` | `zcode:get-desktop-session-activity` |
| `GetDesktopWindowChromeState` | `zcode:get-desktop-window-chrome-state` |
| `GetDesktopZoomLevel` | `zcode:get-desktop-zoom-level` |
| `GetDeviceId` | `zcode:get-device-id` |
| `GetInstalledEditors` | `zcode:get-installed-editors` |
| `GetProcessMetrics` | `zcode:get-process-metrics` |
| `GetSystemLocale` | `zcode:get-system-locale` |
| `GetUpdateState` | `zcode:get-update-state` |
| `GetWebRemoteControlStatus` | `zcode:get-web-remote-control-status` |
| `GetZCodeStdioTapDevState` | `zcode:get-zcode-stdio-tap-dev-state` |
| `ImportChromeBrowserData` | `zcode:import-chrome-browser-data` |
| `IsDockerAvailable` | `zcode:is-docker-available` |
| `ListDockerContainers` | `zcode:list-docker-containers` |
| `ListSSHConfigAliases` | `zcode:list-ssh-config-aliases` |
| `ListWSLDistros` | `zcode:list-wsl-distros` |
| `LoadMcpFromUserDirectory` | `zcode:load-mcp-from-user-directory` |
| `Log` | `zcode:log` |
| `MigrateLegacyCommonMcp` | `zcode:migrate-legacy-common-mcp` |
| `NewTab` | `zcode:new-tab` |
| `NewTask` | `zcode:new-task` |
| `OAuthCallback` | `zcode:oauth-callback` |
| `OAuthCallbackHandled` | `zcode:oauth-callback-handled` |
| `OAuthRegisterState` | `zcode:oauth-register-state` |
| `OpenBrowserUrl` | `zcode:open-browser-url` |
| `OpenCuaAccessibilitySettings` | `zcode:open-cua-accessibility-settings` |
| `OpenCuaPermissionOnboarding` | `zcode:open-cua-permission-onboarding` |
| `OpenExternal` | `zcode:open-external` |
| `OpenFeedbackDialog` | `zcode:open-feedback-dialog` |
| `OpenInEditor` | `zcode:open-in-editor` |
| `OpenInFileManager` | `zcode:open-in-file-manager` |
| `OpenProcessMonitor` | `zcode:open-process-monitor` |
| `OpenTicketsPanel` | `zcode:open-tickets-panel` |
| `OpenUpdateStatusWindow` | `zcode:open-update-status-window` |
| `OpenWorkspace` | `zcode:open-workspace` |
| `OpenWorkspacePath` | `zcode:open-workspace-path` |
| `PaymentCallback` | `zcode:payment-callback` |
| `StartPerformanceTrace` | `zcode:perf:start` |
| `StopPerformanceTrace` | `zcode:perf:stop` |
| `PostUpdateReleaseNotes` | `zcode:post-update-release-notes` |
| `PrepareCuaHelperPermissionDrag` | `zcode:prepare-cua-helper-permission-drag` |
| `PrintToPdf` | `zcode:print-to-pdf` |
| `QuitAndInstallUpdate` | `zcode:quit-and-install-update` |
| `RemoteConnectionLog` | `zcode:remote-connection-log` |
| `RemoteSessionClosed` | `zcode:remote-session-closed` |
| `RendererReady` | `zcode:renderer-ready` |
| `ReportArmsCustomEvent` | `zcode:report-arms-custom-event` |
| `ReportTelemetryEvent` | `zcode:report-telemetry-event` |
| `ResetWebRemoteControlPairing` | `zcode:reset-web-remote-control-pairing` |
| `SaveFile` | `zcode:save-file` |
| `SaveMcpToUserDirectory` | `zcode:save-mcp-to-user-directory` |
| `SelectDirectory` | `zcode:select-directory` |
| `SelectFile` | `zcode:select-file` |
| `SelectFiles` | `zcode:select-files` |
| `SetApplicationLocale` | `zcode:set-application-locale` |
| `SetAutoDownloadAndInstallUpdates` | `zcode:set-auto-download-and-install-updates` |
| `SetTitleBarTheme` | `zcode:set-title-bar-theme` |
| `SettingsChanged` | `zcode:settings-changed` |
| `ShowTaskNotification` | `zcode:show-task-notification` |
| `SkipUpdateVersion` | `zcode:skip-update-version` |
| `StartCuaHelperPermissionDrag` | `zcode:start-cua-helper-permission-drag` |
| `StartWebRemoteControl` | `zcode:start-web-remote-control` |
| `StopWebRemoteControl` | `zcode:stop-web-remote-control` |
| `SyncAppSettings` | `zcode:sync-app-settings` |
| `SyncTelemetryContext` | `zcode:sync-telemetry-context` |
| `SyncWebRemoteControlTasks` | `zcode:sync-web-remote-control-tasks` |
| `SyncWebRemoteControlWorkspaces` | `zcode:sync-web-remote-control-workspaces` |
| `SyncWindowTabs` | `zcode:sync-window-tabs` |
| `SyncWindowUnreadCount` | `zcode:sync-window-unread-count` |
| `TaskNotificationClick` | `zcode:task-notification-click` |
| `TaskNotificationSound` | `zcode:task-notification-sound` |
| `UpdateCheckResult` | `zcode:update-check-result` |
| `UpdateReady` | `zcode:update-ready` |
| `UpdateStateChanged` | `zcode:update-state-changed` |
| `WebRemoteControlReconnectWorkspace` | `zcode:web-remote-control-reconnect-workspace` |
| `WebRemoteControlStatusChanged` | `zcode:web-remote-control-status-changed` |
| `WindowControlsOverlayChanged` | `zcode:window-controls-overlay-changed` |
| `WindowControlsOverlayReady` | `zcode:window-controls-overlay-ready` |
| `WindowFullscreenChanged` | `zcode:window-fullscreen-changed` |

### `out/preload/index.cjs` (123 channels)

| Label | Channel |
|---|---|
| `AcknowledgePostUpdateReleaseNotes` | `zcode:ack-post-update-release-notes` |
| `ActivateOrSetWorkspace` | `zcode:activate-or-set-workspace` |
| `ApplicationLocaleChanged` | `zcode:application-locale-changed` |
| `BindRemoteWorkspaceSessionContext` | `zcode:bind-remote-workspace-session-context` |
| `BotRemoteWorkspaceReconnected` | `zcode:bot-remote-workspace-reconnected` |
| `BrowserViewAttachGuest` | `zcode:browser-view-attach-guest` |
| `BrowserViewCloseTab` | `zcode:browser-view-close-tab` |
| `BrowserViewCloseTabFromRenderer` | `zcode:browser-view-close-tab-from-renderer` |
| `BrowserViewEnsureResident` | `zcode:browser-view-ensure-resident` |
| `BrowserViewOperation` | `zcode:browser-view-operation` |
| `BrowserViewReady` | `zcode:browser-view-ready` |
| `BrowserViewReportResidency` | `zcode:browser-view-report-residency` |
| `BrowserViewRestore` | `zcode:browser-view-restore` |
| `BrowserViewRestoreTabs` | `zcode:browser-view-restore-tabs` |
| `BrowserViewScreenshotSurfacePrepare` | `zcode:browser-view-screenshot-surface-prepare` |
| `BrowserViewScreenshotSurfaceReady` | `zcode:browser-view-screenshot-surface-ready` |
| `BrowserViewScreenshotSurfaceRelease` | `zcode:browser-view-screenshot-surface-release` |
| `BrowserViewSuspend` | `zcode:browser-view-suspend` |
| `BrowserViewSuspendReady` | `zcode:browser-view-suspend-ready` |
| `BrowserViewUpdateViewport` | `zcode:browser-view-update-viewport` |
| `BrowserViewViewportChanged` | `zcode:browser-view-viewport-changed` |
| `BrowserViewVisibility` | `zcode:browser-view-visibility` |
| `CanOpenCommunity` | `zcode:can-open-community` |
| `CancelPendingRemoteConnection` | `zcode:cancel-pending-remote-connection` |
| `CancelUpdateDownload` | `zcode:cancel-update-download` |
| `CaptureWindowScreenshot` | `zcode:capture-window-screenshot` |
| `ClearEmbeddedBrowserData` | `zcode:clear-embedded-browser-data` |
| `CloseActiveContextRequest` | `zcode:close-active-context-request` |
| `ConnectRemote` | `zcode:connect-remote` |
| `CreateTempTextAttachment` | `zcode:create-temp-text-attachment` |
| `DesktopWindowChromeStateChanged` | `zcode:desktop-window-chrome-state-changed` |
| `DesktopZoomLevelChanged` | `zcode:desktop-zoom-level-changed` |
| `DisposeRemoteSession` | `zcode:dispose-remote-session` |
| `DownloadUpdate` | `zcode:download-update` |
| `ClearFinalArmsCustomEventsE2E` | `zcode:e2e:clear-final-arms-custom-events` |
| `ConfigureFinalArmsCustomEventsE2E` | `zcode:e2e:configure-final-arms-custom-events` |
| `ReadFinalArmsCustomEventsE2E` | `zcode:e2e:read-final-arms-custom-events` |
| `EmbeddedBrowserJavaScriptDialog` | `zcode:embedded-browser-javascript-dialog` |
| `ExecuteDesktopCommand` | `zcode:execute-desktop-command` |
| `ExportLogs` | `zcode:export-logs` |
| `FocusTab` | `zcode:focus-tab` |
| `GetAutoUpdatePreferences` | `zcode:get-auto-update-preferences` |
| `GetDesktopSessionActivity` | `zcode:get-desktop-session-activity` |
| `GetDesktopWindowChromeState` | `zcode:get-desktop-window-chrome-state` |
| `GetDesktopZoomLevel` | `zcode:get-desktop-zoom-level` |
| `GetDeviceId` | `zcode:get-device-id` |
| `GetInstalledEditors` | `zcode:get-installed-editors` |
| `GetProcessMetrics` | `zcode:get-process-metrics` |
| `GetSystemLocale` | `zcode:get-system-locale` |
| `GetUpdateState` | `zcode:get-update-state` |
| `GetWebRemoteControlStatus` | `zcode:get-web-remote-control-status` |
| `GetZCodeStdioTapDevState` | `zcode:get-zcode-stdio-tap-dev-state` |
| `ImportChromeBrowserData` | `zcode:import-chrome-browser-data` |
| `IsDockerAvailable` | `zcode:is-docker-available` |
| `ListDockerContainers` | `zcode:list-docker-containers` |
| `ListSSHConfigAliases` | `zcode:list-ssh-config-aliases` |
| `ListWSLDistros` | `zcode:list-wsl-distros` |
| `LoadMcpFromUserDirectory` | `zcode:load-mcp-from-user-directory` |
| `Log` | `zcode:log` |
| `MigrateLegacyCommonMcp` | `zcode:migrate-legacy-common-mcp` |
| `NewTab` | `zcode:new-tab` |
| `NewTask` | `zcode:new-task` |
| `OAuthCallback` | `zcode:oauth-callback` |
| `OAuthCallbackHandled` | `zcode:oauth-callback-handled` |
| `OAuthRegisterState` | `zcode:oauth-register-state` |
| `OpenBrowserUrl` | `zcode:open-browser-url` |
| `OpenCuaAccessibilitySettings` | `zcode:open-cua-accessibility-settings` |
| `OpenCuaPermissionOnboarding` | `zcode:open-cua-permission-onboarding` |
| `OpenExternal` | `zcode:open-external` |
| `OpenFeedbackDialog` | `zcode:open-feedback-dialog` |
| `OpenInEditor` | `zcode:open-in-editor` |
| `OpenInFileManager` | `zcode:open-in-file-manager` |
| `OpenProcessMonitor` | `zcode:open-process-monitor` |
| `OpenTicketsPanel` | `zcode:open-tickets-panel` |
| `OpenUpdateStatusWindow` | `zcode:open-update-status-window` |
| `OpenWorkspace` | `zcode:open-workspace` |
| `OpenWorkspacePath` | `zcode:open-workspace-path` |
| `PaymentCallback` | `zcode:payment-callback` |
| `StartPerformanceTrace` | `zcode:perf:start` |
| `StopPerformanceTrace` | `zcode:perf:stop` |
| `PostUpdateReleaseNotes` | `zcode:post-update-release-notes` |
| `PrepareCuaHelperPermissionDrag` | `zcode:prepare-cua-helper-permission-drag` |
| `PrintToPdf` | `zcode:print-to-pdf` |
| `QuitAndInstallUpdate` | `zcode:quit-and-install-update` |
| `RemoteConnectionLog` | `zcode:remote-connection-log` |
| `RemoteServicePort` | `zcode:remote-service-port` |
| `RemoteSessionClosed` | `zcode:remote-session-closed` |
| `RendererReady` | `zcode:renderer-ready` |
| `ReportArmsCustomEvent` | `zcode:report-arms-custom-event` |
| `ReportTelemetryEvent` | `zcode:report-telemetry-event` |
| `ResetWebRemoteControlPairing` | `zcode:reset-web-remote-control-pairing` |
| `SaveFile` | `zcode:save-file` |
| `SaveMcpToUserDirectory` | `zcode:save-mcp-to-user-directory` |
| `SelectDirectory` | `zcode:select-directory` |
| `SelectFile` | `zcode:select-file` |
| `SelectFiles` | `zcode:select-files` |
| `ServicePort` | `zcode:service-port` |
| `SetApplicationLocale` | `zcode:set-application-locale` |
| `SetAutoDownloadAndInstallUpdates` | `zcode:set-auto-download-and-install-updates` |
| `SetTitleBarTheme` | `zcode:set-title-bar-theme` |
| `SettingsChanged` | `zcode:settings-changed` |
| `ShowTaskNotification` | `zcode:show-task-notification` |
| `SkipUpdateVersion` | `zcode:skip-update-version` |
| `StartCuaHelperPermissionDrag` | `zcode:start-cua-helper-permission-drag` |
| `StartWebRemoteControl` | `zcode:start-web-remote-control` |
| `StopWebRemoteControl` | `zcode:stop-web-remote-control` |
| `SyncAppSettings` | `zcode:sync-app-settings` |
| `SyncTelemetryContext` | `zcode:sync-telemetry-context` |
| `SyncWebRemoteControlTasks` | `zcode:sync-web-remote-control-tasks` |
| `SyncWebRemoteControlWorkspaces` | `zcode:sync-web-remote-control-workspaces` |
| `SyncWindowTabs` | `zcode:sync-window-tabs` |
| `SyncWindowUnreadCount` | `zcode:sync-window-unread-count` |
| `TaskNotificationClick` | `zcode:task-notification-click` |
| `TaskNotificationSound` | `zcode:task-notification-sound` |
| `UpdateCheckResult` | `zcode:update-check-result` |
| `UpdateReady` | `zcode:update-ready` |
| `UpdateStateChanged` | `zcode:update-state-changed` |
| `WebRemoteControlReconnectWorkspace` | `zcode:web-remote-control-reconnect-workspace` |
| `WebRemoteControlStatusChanged` | `zcode:web-remote-control-status-changed` |
| `WindowControlsOverlayChanged` | `zcode:window-controls-overlay-changed` |
| `WindowControlsOverlayReady` | `zcode:window-controls-overlay-ready` |
| `WindowFullscreenChanged` | `zcode:window-fullscreen-changed` |

### `out/preload/processMonitor.cjs` (120 channels)

| Label | Channel |
|---|---|
| `AcknowledgePostUpdateReleaseNotes` | `zcode:ack-post-update-release-notes` |
| `ActivateOrSetWorkspace` | `zcode:activate-or-set-workspace` |
| `ApplicationLocaleChanged` | `zcode:application-locale-changed` |
| `BindRemoteWorkspaceSessionContext` | `zcode:bind-remote-workspace-session-context` |
| `BotRemoteWorkspaceReconnected` | `zcode:bot-remote-workspace-reconnected` |
| `BrowserViewAttachGuest` | `zcode:browser-view-attach-guest` |
| `BrowserViewCloseTab` | `zcode:browser-view-close-tab` |
| `BrowserViewCloseTabFromRenderer` | `zcode:browser-view-close-tab-from-renderer` |
| `BrowserViewEnsureResident` | `zcode:browser-view-ensure-resident` |
| `BrowserViewOperation` | `zcode:browser-view-operation` |
| `BrowserViewReady` | `zcode:browser-view-ready` |
| `BrowserViewReportResidency` | `zcode:browser-view-report-residency` |
| `BrowserViewRestore` | `zcode:browser-view-restore` |
| `BrowserViewRestoreTabs` | `zcode:browser-view-restore-tabs` |
| `BrowserViewScreenshotSurfacePrepare` | `zcode:browser-view-screenshot-surface-prepare` |
| `BrowserViewScreenshotSurfaceReady` | `zcode:browser-view-screenshot-surface-ready` |
| `BrowserViewScreenshotSurfaceRelease` | `zcode:browser-view-screenshot-surface-release` |
| `BrowserViewSuspend` | `zcode:browser-view-suspend` |
| `BrowserViewSuspendReady` | `zcode:browser-view-suspend-ready` |
| `BrowserViewUpdateViewport` | `zcode:browser-view-update-viewport` |
| `BrowserViewViewportChanged` | `zcode:browser-view-viewport-changed` |
| `BrowserViewVisibility` | `zcode:browser-view-visibility` |
| `CanOpenCommunity` | `zcode:can-open-community` |
| `CancelPendingRemoteConnection` | `zcode:cancel-pending-remote-connection` |
| `CancelUpdateDownload` | `zcode:cancel-update-download` |
| `CaptureWindowScreenshot` | `zcode:capture-window-screenshot` |
| `ClearEmbeddedBrowserData` | `zcode:clear-embedded-browser-data` |
| `CloseActiveContextRequest` | `zcode:close-active-context-request` |
| `ConnectRemote` | `zcode:connect-remote` |
| `CreateTempTextAttachment` | `zcode:create-temp-text-attachment` |
| `DesktopWindowChromeStateChanged` | `zcode:desktop-window-chrome-state-changed` |
| `DesktopZoomLevelChanged` | `zcode:desktop-zoom-level-changed` |
| `DisposeRemoteSession` | `zcode:dispose-remote-session` |
| `DownloadUpdate` | `zcode:download-update` |
| `ClearFinalArmsCustomEventsE2E` | `zcode:e2e:clear-final-arms-custom-events` |
| `ConfigureFinalArmsCustomEventsE2E` | `zcode:e2e:configure-final-arms-custom-events` |
| `ReadFinalArmsCustomEventsE2E` | `zcode:e2e:read-final-arms-custom-events` |
| `EmbeddedBrowserJavaScriptDialog` | `zcode:embedded-browser-javascript-dialog` |
| `ExecuteDesktopCommand` | `zcode:execute-desktop-command` |
| `ExportLogs` | `zcode:export-logs` |
| `FocusTab` | `zcode:focus-tab` |
| `GetAutoUpdatePreferences` | `zcode:get-auto-update-preferences` |
| `GetDesktopSessionActivity` | `zcode:get-desktop-session-activity` |
| `GetDesktopWindowChromeState` | `zcode:get-desktop-window-chrome-state` |
| `GetDesktopZoomLevel` | `zcode:get-desktop-zoom-level` |
| `GetDeviceId` | `zcode:get-device-id` |
| `GetInstalledEditors` | `zcode:get-installed-editors` |
| `GetProcessMetrics` | `zcode:get-process-metrics` |
| `GetSystemLocale` | `zcode:get-system-locale` |
| `GetUpdateState` | `zcode:get-update-state` |
| `GetWebRemoteControlStatus` | `zcode:get-web-remote-control-status` |
| `GetZCodeStdioTapDevState` | `zcode:get-zcode-stdio-tap-dev-state` |
| `ImportChromeBrowserData` | `zcode:import-chrome-browser-data` |
| `IsDockerAvailable` | `zcode:is-docker-available` |
| `ListDockerContainers` | `zcode:list-docker-containers` |
| `ListSSHConfigAliases` | `zcode:list-ssh-config-aliases` |
| `ListWSLDistros` | `zcode:list-wsl-distros` |
| `LoadMcpFromUserDirectory` | `zcode:load-mcp-from-user-directory` |
| `Log` | `zcode:log` |
| `MigrateLegacyCommonMcp` | `zcode:migrate-legacy-common-mcp` |
| `NewTab` | `zcode:new-tab` |
| `NewTask` | `zcode:new-task` |
| `OAuthCallback` | `zcode:oauth-callback` |
| `OAuthCallbackHandled` | `zcode:oauth-callback-handled` |
| `OAuthRegisterState` | `zcode:oauth-register-state` |
| `OpenBrowserUrl` | `zcode:open-browser-url` |
| `OpenCuaAccessibilitySettings` | `zcode:open-cua-accessibility-settings` |
| `OpenCuaPermissionOnboarding` | `zcode:open-cua-permission-onboarding` |
| `OpenExternal` | `zcode:open-external` |
| `OpenFeedbackDialog` | `zcode:open-feedback-dialog` |
| `OpenInEditor` | `zcode:open-in-editor` |
| `OpenInFileManager` | `zcode:open-in-file-manager` |
| `OpenProcessMonitor` | `zcode:open-process-monitor` |
| `OpenTicketsPanel` | `zcode:open-tickets-panel` |
| `OpenUpdateStatusWindow` | `zcode:open-update-status-window` |
| `OpenWorkspace` | `zcode:open-workspace` |
| `OpenWorkspacePath` | `zcode:open-workspace-path` |
| `PaymentCallback` | `zcode:payment-callback` |
| `StartPerformanceTrace` | `zcode:perf:start` |
| `StopPerformanceTrace` | `zcode:perf:stop` |
| `PostUpdateReleaseNotes` | `zcode:post-update-release-notes` |
| `PrepareCuaHelperPermissionDrag` | `zcode:prepare-cua-helper-permission-drag` |
| `PrintToPdf` | `zcode:print-to-pdf` |
| `QuitAndInstallUpdate` | `zcode:quit-and-install-update` |
| `RemoteConnectionLog` | `zcode:remote-connection-log` |
| `RemoteSessionClosed` | `zcode:remote-session-closed` |
| `RendererReady` | `zcode:renderer-ready` |
| `ReportArmsCustomEvent` | `zcode:report-arms-custom-event` |
| `ReportTelemetryEvent` | `zcode:report-telemetry-event` |
| `ResetWebRemoteControlPairing` | `zcode:reset-web-remote-control-pairing` |
| `SaveFile` | `zcode:save-file` |
| `SaveMcpToUserDirectory` | `zcode:save-mcp-to-user-directory` |
| `SelectDirectory` | `zcode:select-directory` |
| `SelectFile` | `zcode:select-file` |
| `SelectFiles` | `zcode:select-files` |
| `SetApplicationLocale` | `zcode:set-application-locale` |
| `SetAutoDownloadAndInstallUpdates` | `zcode:set-auto-download-and-install-updates` |
| `SetTitleBarTheme` | `zcode:set-title-bar-theme` |
| `SettingsChanged` | `zcode:settings-changed` |
| `ShowTaskNotification` | `zcode:show-task-notification` |
| `SkipUpdateVersion` | `zcode:skip-update-version` |
| `StartCuaHelperPermissionDrag` | `zcode:start-cua-helper-permission-drag` |
| `StartWebRemoteControl` | `zcode:start-web-remote-control` |
| `StopWebRemoteControl` | `zcode:stop-web-remote-control` |
| `SyncAppSettings` | `zcode:sync-app-settings` |
| `SyncTelemetryContext` | `zcode:sync-telemetry-context` |
| `SyncWebRemoteControlTasks` | `zcode:sync-web-remote-control-tasks` |
| `SyncWebRemoteControlWorkspaces` | `zcode:sync-web-remote-control-workspaces` |
| `SyncWindowTabs` | `zcode:sync-window-tabs` |
| `SyncWindowUnreadCount` | `zcode:sync-window-unread-count` |
| `TaskNotificationClick` | `zcode:task-notification-click` |
| `TaskNotificationSound` | `zcode:task-notification-sound` |
| `UpdateCheckResult` | `zcode:update-check-result` |
| `UpdateReady` | `zcode:update-ready` |
| `UpdateStateChanged` | `zcode:update-state-changed` |
| `WebRemoteControlReconnectWorkspace` | `zcode:web-remote-control-reconnect-workspace` |
| `WebRemoteControlStatusChanged` | `zcode:web-remote-control-status-changed` |
| `WindowControlsOverlayChanged` | `zcode:window-controls-overlay-changed` |
| `WindowControlsOverlayReady` | `zcode:window-controls-overlay-ready` |
| `WindowFullscreenChanged` | `zcode:window-fullscreen-changed` |

### `resources/glm/packages/android-emulator-plugin/dist/mcp/server.js` (1 channels)

| Label | Channel |
|---|---|
| `scheme` | `urn:uuid` |

### `resources/glm/packages/browser-use-plugin/dist/mcp/server.js` (3 channels)

| Label | Channel |
|---|---|
| `dateStrategy` | `format:date-time` |
| `emailStrategy` | `format:email` |
| `scheme` | `urn:uuid` |

### `resources/glm/packages/ios-simulator-plugin/dist/mcp/server.js` (1 channels)

| Label | Channel |
|---|---|
| `scheme` | `urn:uuid` |

### `resources/glm/zcode.cjs` (12 channels)

| Label | Channel |
|---|---|
| `id` | `auto:git-bash` |
| `dateStrategy` | `format:date-time` |
| `emailStrategy` | `format:email` |
| `activeProvider` | `oauth:active_provider` |
| `zaiAccessToken` | `oauth:zai:access_token` |
| `zaiRefreshToken` | `oauth:zai:refresh_token` |
| `zaiUserInfo` | `oauth:zai:user_info` |
| `scheme` | `urn:uuid` |

## 3. SQLite schema (host process database)

The host bundle ships its full schema as string literals:

From `out/host/index.js`:

```sql
CREATE TABLE IF NOT EXISTS automations (
        automation_id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        cron_expr TEXT NOT NULL,
        prompt TEXT NOT NULL,
        model TEXT,
        provider TEXT,
        mode TEXT,
        thought_level TEXT,
        workspace_key TEXT NOT NULL,
        workspace_path TEXT NOT NULL,
        workspace_identity TEXT,
        target_task_id TEXT,
        bot_delivery_target TEXT,
        location_kind TEXT NOT NULL DEFAULT 'local',
        recurring INTEGER NOT NULL DEFAULT 1,
        max_runs INTEGER,
        end_at INTEGER,
        schedule_rule TEXT,
        schedule_edited_by_user INTEGER NOT NULL DEFAULT 0,
        run_count INTEGER NOT NULL DEFAULT 0,
        scheduled_run_count INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        lifecycle_status TEXT NOT NULL DEFAULT 'active',
        next_run_at INTEGER,
        last_run_at INTEGER,
        running INTEGER NOT NULL DEFAULT 0,
        claimed_at INTEGER,
        dispatch_status TEXT NOT NULL DEFAULT 'idle',
        dispatch_attempts INTEGER NOT NULL DEFAULT 0,
        retry_at INTEGER,
        last_error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_automations_due
      ON automations (enabled, next_run_at);

      CREATE INDEX IF NOT EXISTS idx_automations_retry
      ON automations (enabled, retry_at);

      CREATE INDEX IF NOT EXISTS idx_automations_workspace
      ON automations (workspace_key);

      CREATE TABLE IF NOT EXISTS automation_runs (
        run_id TEXT PRIMARY KEY,
        automation_id TEXT NOT NULL,
        workspace_key TEXT NOT NULL,
        scheduled_at INTEGER,
        trigger TEXT NOT NULL DEFAULT 'schedule',
        dispatch_status TEXT NOT NULL DEFAULT 'claimed',
        outcome TEXT,
        session_id TEXT,
        error TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_automation_runs_by_automation
      ON automation_runs (automation_id, created_at DESC);
```

From `out/host/index.js`:

```sql
CREATE INDEX IF NOT EXISTS idx_automations_target_task
      ON automations (target_task_id)
      WHERE target_task_id IS NOT NULL;
```

From `out/host/index.js`:

```sql
ALTER TABLE ${t} ADD COLUMN ${n} ${o}
```

From `out/host/index.js`:

```sql
CREATE TABLE IF NOT EXISTS tasks (
        workspace_key TEXT NOT NULL,
        workspace_path TEXT NOT NULL,
        workspace_identity TEXT,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        task_status TEXT,
        provider TEXT,
        mode TEXT NOT NULL DEFAULT 'build',
        model TEXT,
        migration_source TEXT,
        forked_from_task_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        unread_at INTEGER,
        last_unread_at INTEGER NOT NULL DEFAULT 0,
        pinned INTEGER NOT NULL DEFAULT 0,
        archived INTEGER NOT NULL DEFAULT 0,
        deleted INTEGER NOT NULL DEFAULT 0,
        title_overridden INTEGER NOT NULL DEFAULT 0,
        meta_json TEXT NOT NULL DEFAULT '{}',
        PRIMARY KEY (workspace_key, task_id)
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_workspace_archived_updated
      ON tasks (workspace_key, archived, updated_at DESC)
      WHERE deleted = 0;

      CREATE INDEX IF NOT EXISTS idx_tasks_workspace_pinned_updated
      ON tasks (workspace_key, pinned, updated_at DESC)
      WHERE deleted = 0;

      CREATE TABLE IF NOT EXISTS task_groups (
        group_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'gray',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_group_members (
        group_id TEXT NOT NULL,
        workspace_key TEXT NOT NULL,
        workspace_path TEXT NOT NULL,
        workspace_identity TEXT,
        task_id TEXT NOT NULL,
        sort_order INTEGER,
        added_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (workspace_key, task_id),
        FOREIGN KEY (group_id) REFERENCES task_groups(group_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS task_group_view_node_orders (
        node_type TEXT NOT NULL,
        node_key TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (node_type, node_key)
      );

      CREATE TABLE IF NOT EXISTS task_group_workspace_bootstraps (
        workspace_key TEXT PRIMARY KEY,
        group_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_task_group_members_group_order
      ON task_group_members (group_id, sort_order, added_at);

      CREATE INDEX IF NOT EXISTS idx_task_group_view_node_orders_order
      ON task_group_view_node_orders (sort_order, created_at);
```

From `out/host/index.js`:

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_cron_automation
      ON tasks (cron_automation_id, updated_at DESC)
      WHERE cron_automation_id IS NOT NULL AND deleted = 0;
```

From `out/host/index.js`:

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_off_peak_task
      ON tasks (off_peak_task_id, updated_at DESC)
      WHERE off_peak_task_id IS NOT NULL AND deleted = 0;
```

From `out/host/index.js`:

```sql
CREATE TABLE IF NOT EXISTS off_peak_tasks (
        off_peak_task_id   TEXT PRIMARY KEY,
        server_ticket_id   TEXT,
        title              TEXT NOT NULL DEFAULT '',
        conversation_id    TEXT,
        session_id         TEXT,
        prompt             TEXT NOT NULL,
        permission_mode    TEXT NOT NULL,
        model              TEXT,
        thought_level      TEXT,
        workspace_key      TEXT NOT NULL,
        workspace_path     TEXT NOT NULL,
        workspace_identity TEXT,
        status             TEXT NOT NULL,
        queued_at          INTEGER NOT NULL,
        started_at         INTEGER,
        ended_at           INTEGER,
        failure_reason     TEXT,
        files_changed      INTEGER,
        settled_at         INTEGER,
        history_deleted_at INTEGER,
        registered_at      INTEGER,
        schedulable        INTEGER NOT NULL DEFAULT 0,
        queue_position     INTEGER,
        next_poll_at       INTEGER,
        claim_running      INTEGER NOT NULL DEFAULT 0,
        claimed_at         INTEGER,
        attempt_count      INTEGER NOT NULL DEFAULT 0,
        last_error         TEXT,
        created_at         INTEGER NOT NULL,
        updated_at         INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_off_peak_pick
      ON off_peak_tasks (status, queued_at);

      CREATE INDEX IF NOT EXISTS idx_off_peak_ws
      ON off_peak_tasks (workspace_key, status);
```

From `out/scheduler/index.js`:

```sql
ALTER TABLE ${n} ADD COLUMN ${o} ${s}
```

## 4. Endpoints and URLs found in bundles

355 unique URL strings (API endpoints, OAuth, telemetry, docs links):

```
http://127.0.0.1:1234/v1
http://127.0.0.1:1337/v1
http://192.168.6.166:8080
http://github.com/Constellation
http://github.com/estools/escodegen
http://github.com/estools/escodegen.git
http://json-schema.org/draft-04/schema#
http://json-schema.org/draft-06/schema
http://json-schema.org/draft-07/schema
http://json-schema.org/draft-07/schema#
http://json-schema.org/draft/2019-09/schema
http://json-schema.org/draft/2020-12/schema
http://json-schema.org/schema
http://localhost:4318/
http://localhost:8080/v1
http://ns.adobe.com/xdp/
http://ns.adobe.com/xdp/pdf/
http://ns.adobe.com/xfdf/
http://ns.adobe.com/xmpmeta/
http://schemas.android.com/apk/res/android
http://schemas.openxmlformats.org/drawingml/2006/main
http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument
http://schemas.openxmlformats.org/package/2006/content-types
http://schemas.openxmlformats.org/package/2006/relationships
http://schemas.openxmlformats.org/wordprocessingml/2006/main
http://studio.zcode-ai.com:12345/ssh-remote-assets
http://www.apple.com/DTDs/PropertyList-1.0.dtd
http://www.w3.org/1999/XSL/Transform
http://www.w3.org/1999/xhtml
http://www.w3.org/1999/xlink
http://www.w3.org/2000/09/xmldsig#
http://www.w3.org/2000/svg
http://www.w3.org/2000/xmlns/
http://www.w3.org/XML/1998/namespace
http://www.xfa.org/schema/xci/
http://www.xfa.org/schema/xdc/
http://www.xfa.org/schema/xfa-connection-set/
http://www.xfa.org/schema/xfa-data/
http://www.xfa.org/schema/xfa-data/1.0/
http://www.xfa.org/schema/xfa-form/
http://www.xfa.org/schema/xfa-locale-set/
http://www.xfa.org/schema/xfa-source-set/
http://www.xfa.org/schema/xfa-template/
https://${AZURE_COGNITIVE_SERVICES_RESOURCE_NAME}.services.ai.azure.com/anthropic/v1
https://${AZURE_RESOURCE_NAME}.services.ai.azure.com/anthropic/v1
https://${AZURE_RESOURCE_NAME}.services.ai.azure.com/models
https://${DATABRICKS_HOST}/ai-gateway/mlflow/v1
https://${GOOGLE_VERTEX_ENDPOINT}/v1/projects/${GOOGLE_VERTEX_PROJECT}/locations/${GOOGLE_VERTEX_LOCATION}/endpoints/openapi
https://abacus.ai/help/api
https://accounts.feishu.cn
https://accounts.larksuite.com
https://ai-gateway.helicone.ai/v1
https://ai-gateway.vercel.sh/v3/ai
https://ai-sdk.dev/unauthenticated-ai-gateway
https://ai.google.dev/gemini-api/docs/models
https://alipaytbox.yuque.com/sxs0ba/ling/intro
https://ambient.xyz
https://api-docs.deepseek.com/quick_start/pricing
https://api-inference.modelscope.cn/v1
https://api-sherlock.cloudferro.com/openai/v1/
https://api.302.ai/v1
https://api.abliteration.ai/v1
https://api.ambient.xyz/v1
https://api.anthropic.com/v1
https://api.auriko.ai/v1
https://api.berget.ai
https://api.berget.ai/v1
https://api.chatglm.site
https://api.clarifai.com/v2/ext/openai/v1
https://api.claudin.io/v1
https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1
https://api.code.umans.ai/v1
https://api.cortecs.ai/v1
https://api.cortecs.ai/v1/models
https://api.deepseek.com
https://api.dinference.com/v1
https://api.fireworks.ai/inference/v1/
https://api.friendli.ai/serverless/v1
https://api.getlilac.com/v1
https://api.githubcopilot.com
https://api.gmi-serving.com/v1
https://api.hpc-ai.com/inference/v1
https://api.inceptionlabs.ai/v1/
https://api.inceptron.io/v1
https://api.inference.wandb.ai/v1
https://api.intelligence.io.solutions/api/v1
https://api.jiekou.ai/openai
https://api.kilo.ai/api/gateway
https://api.kimi.com/coding/v1
https://api.lkeap.cloud.tencent.com/coding/v3
https://api.llama.com/compat/v1/
https://api.llmgateway.io/v1
https://api.meganova.ai/v1
https://api.minimax.io/anthropic/v1
https://api.minimaxi.com/anthropic/v1
https://api.moonshot.ai/v1
https://api.moonshot.cn/v1
https://api.morphllm.com/v1
https://api.neuralwatt.com/v1
https://api.nova.amazon.com/v1
https://api.novita.ai/openai
https://api.openai-compat.model-serving.eu01.onstackit.cloud/v1
https://api.openai.com/v1
https://api.orcarouter.ai/v1
https://api.perplexity.ai/v1
https://api.poe.com/v1
https://api.qhaigc.net/v1
https://api.qnaigc.com/v1
https://api.regolo.ai/v1
https://api.routing.run/v1
https://api.sarvam.ai/v1
https://api.scaleway.ai/v1
https://api.siliconflow.cn/v1
https://api.siliconflow.com/v1
https://api.stepfun.ai/step_plan/v1
https://api.stepfun.com/v1
https://api.synthetic.new/openai/v1
https://api.tbox.cn/api/llm/v1/chat/completions
https://api.thegrid.ai/v1
https://api.tokenfactory.nebius.com/v1
https://api.upstage.ai/v1/solar
https://api.vivgrid.com/v1
https://api.vultrinference.com/
https://api.vultrinference.com/v1
https://api.xiaomimimo.com/v1
https://api.z.ai
https://api.z.ai/api/anthropic
https://api.z.ai/api/auth/z/login
https://api.z.ai/api/coding/paas/v4
https://api.z.ai/api/paas/v4
https://apis.iflow.cn/v1
https://app.frogbot.ai/api/v1
https://app.umans.ai/offers/code/docs
https://atomic.chat
https://bigmodel.cn
https://bigmodel.cn/login
https://cdn-zcode.z.ai/zcode/electron/releases
https://cdn-zcode.z.ai/zcode/official-plugin/assets
https://cdn-zcode.z.ai/zcode/official-plugin/assets/
https://cdn-zcode.z.ai/zcode/official-plugin/marketplace.json
https://cdn.codegeex.cn/zcode/electron/releases
https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js
https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css
https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js
https://cdn.zcode-ai.com/zcode/config/default.json
https://cdn.zcode-ai.com/zcode/electron/releases
https://chat.d.run/v1
https://chat.z.ai
https://chat.z.ai/api/oauth/authorize
https://chat.z.ai/api/oauth/userinfo
https://claudin.io
https://cloud-api.near.ai/v1
https://cloud.google.com/vertex-ai/generative-ai/docs/models
https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/claude
https://cloud.siliconflow.com/models
https://cloud.tencent.com/document/product/1772/128947
https://cloud.tencent.com/document/product/1823/130050
https://coding-intl.dashscope.aliyuncs.com/v1
https://coding-plan-endpoint.kuaecloud.net/v1
https://coding.dashscope.aliyuncs.com/v1
https://console.groq.com/docs/models
https://creator.poe.com/docs/external-applications/openai-compatible-api
https://crof.ai/docs
https://crof.ai/v1
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
https://dashscope.aliyuncs.com/compatible-mode/v1
https://deepinfra.com/models
https://dev.bigmodel.cn
https://developer.qiniu.com/aitokenapi
https://developers.cloudflare.com/ai-gateway/
https://developers.cloudflare.com/workers-ai/models/
https://developers.upstage.ai/docs/apis/chat
https://dinference.com
https://doc.302.ai
https://docs.abliteration.ai/models
https://docs.aihubmix.com
https://docs.anthropic.com/en/docs/about-claude/models
https://docs.api.nvidia.com/nim/
https://docs.auriko.ai
https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
https://docs.baseten.co/development/model-apis/overview
https://docs.bigmodel.cn/cn/coding-plan/overview
https://docs.clarifai.com/compute/inference/
https://docs.cohere.com/docs/models
https://docs.databricks.com/aws/en/machine-learning/foundation-models/
https://docs.digitalocean.com/products/gradient-ai-platform/details/models/
https://docs.evroc.com/products/think/overview.html
https://docs.fireworks.ai/firepass
https://docs.frogbot.ai
https://docs.getlilac.com/inference/models
https://docs.github.com/en/copilot
https://docs.github.com/en/github-models
https://docs.gitlab.com/user/duo_agent_platform/
https://docs.gmicloud.ai/inference-engine/api-reference/llm-api-reference
https://docs.inceptron.io
https://docs.jiekou.ai/docs/support/quickstart?utm_source=github_models.dev
https://docs.meganova.ai
https://docs.mistral.ai/getting-started/models/
https://docs.mixlayer.com
https://docs.morphllm.com/api-reference/introduction
https://docs.mthreads.com/kuaecloud/kuaecloud-doc-online/coding_plan/
https://docs.nano-gpt.com
https://docs.near.ai/
https://docs.ollama.com/cloud
https://docs.orcarouter.ai
https://docs.perplexity.ai
https://docs.perplexity.ai/docs/agent-api/models
https://docs.privatemode.ai/api/overview
https://docs.regolo.ai/
https://docs.routing.run/api-reference/models
https://docs.sarvam.ai/api-reference-docs/getting-started/models
https://docs.sherlock.cloudferro.com/
https://docs.stackit.cloud/products/data-and-ai/ai-model-serving/basics/available-shared-models
https://docs.together.ai/docs/serverless-models
https://docs.tokenfactory.nebius.com/
https://docs.venice.ai
https://docs.vivgrid.com/models
https://docs.wafer.ai/wafer-pass
https://docs.wandb.ai/guides/integrations/inference/
https://docs.x.ai/docs/models
https://docs.z.ai/devpack/overview
https://docs.z.ai/guides/overview/pricing
https://docs.zenmux.ai
https://example.com/mcp
https://fastrouter.ai/models
https://fireworks.ai/docs/
https://friendli.ai/docs/guides/serverless_endpoints/introduction
https://github.com/vercel/ai/tree/5eb85cc45a259553501f535b8ac79a77d0e79223/packages/gateway
https://go.fastrouter.ai/api/v1
https://helicone.ai/models
https://help.aliyun.com/zh/model-studio/coding-plan
https://help.sap.com/docs/sap-ai-core
https://huggingface.co/docs/inference-providers
https://ilinkai.weixin.qq.com
https://inference-docs.cerebras.ai/models/overview
https://inference.baseten.co/v1
https://inference.do-ai.run/v1
https://inference.net/models
https://inference.net/v1
https://inference.poolside.ai/v1
https://integrate.api.nvidia.com/v1
https://io.net/docs/guides/intelligence/io-intelligence
https://json-schema.org/draft-06/schema
https://json-schema.org/draft-07/schema
https://json-schema.org/draft/2019-09/meta/applicator
https://json-schema.org/draft/2019-09/meta/content
https://json-schema.org/draft/2019-09/meta/core
https://json-schema.org/draft/2019-09/meta/format
https://json-schema.org/draft/2019-09/meta/meta-data
https://json-schema.org/draft/2019-09/meta/validation
https://json-schema.org/draft/2019-09/schema
https://json-schema.org/draft/2019-09/schema#
https://json-schema.org/draft/2019-09/vocab/applicator
https://json-schema.org/draft/2019-09/vocab/content
https://json-schema.org/draft/2019-09/vocab/core
https://json-schema.org/draft/2019-09/vocab/format
https://json-schema.org/draft/2019-09/vocab/meta-data
https://json-schema.org/draft/2019-09/vocab/validation
https://json-schema.org/draft/2020-12/meta/applicator
https://json-schema.org/draft/2020-12/meta/content
https://json-schema.org/draft/2020-12/meta/core
https://json-schema.org/draft/2020-12/meta/format-annotation
https://json-schema.org/draft/2020-12/meta/meta-data
https://json-schema.org/draft/2020-12/meta/unevaluated
https://json-schema.org/draft/2020-12/meta/validation
https://json-schema.org/draft/2020-12/schema
https://json-schema.org/draft/2020-12/vocab/applicator
https://json-schema.org/draft/2020-12/vocab/content
https://json-schema.org/draft/2020-12/vocab/core
https://json-schema.org/draft/2020-12/vocab/format-annotation
https://json-schema.org/draft/2020-12/vocab/meta-data
https://json-schema.org/draft/2020-12/vocab/unevaluated
https://json-schema.org/draft/2020-12/vocab/validation
https://kilo.ai
https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
https://llama.developer.meta.com/docs/models
https://llm.chutes.ai/v1
https://llm.chutes.ai/v1/models
https://llm.submodel.ai/v1
https://llmgateway.io/docs
https://lmstudio.ai/models
https://lucidquery.com/api/docs
https://lucidquery.com/api/v1
https://moark.com/docs/openapi/v1#tag/%E6%96%87%E6%9C%AC%E7%94%9F%E6%88%90
https://moark.com/v1
https://models.github.ai/inference
https://models.mixlayer.ai/v1
https://models.think.evroc.com/v1
https://modelscope.cn/docs/model-service/API-Inference/intro
https://nano-gpt.com/api/v1
https://nova.amazon.com/dev/documentation
https://novita.ai/docs/guides/introduction
https://oai.endpoints.kepler.ai.cloud.ovh.net/v1
https://ollama.com/v1
https://open.bigmodel.cn/api/anthropic
https://open.bigmodel.cn/api/coding/paas/v4
https://open.bigmodel.cn/api/paas/v4
https://open.feishu.cn
https://open.larksuite.com
https://opencode.ai/docs/zen
https://opencode.ai/zen/go/v1
https://opencode.ai/zen/v1
https://openrouter.ai/api/v1
https://openrouter.ai/models
https://pass.wafer.ai/v1
https://platform.iflow.cn/en/docs
https://platform.inceptionlabs.ai/docs
https://platform.minimax.io/docs/guides/quickstart
https://platform.minimax.io/docs/token-plan/intro
https://platform.minimaxi.com/docs/guides/quickstart
https://platform.minimaxi.com/docs/token-plan/intro
https://platform.moonshot.ai/docs/api/chat
https://platform.moonshot.cn/docs/api/chat
https://platform.openai.com/docs/models
https://platform.poolside.ai
https://platform.stepfun.ai/docs/en/step-plan/integrations/open-code
https://platform.stepfun.com/docs/zh/overview/concept
https://platform.xiaomimimo.com/#/docs
https://portal.neuralwatt.com/docs
https://proj-xtrace-7e235817c9b9381c22d8b743908d469f-cn-beijing.cn-beijing.log.aliyuncs.com/apm/trace/opentelemetry
https://proj-xtrace-7e235817c9b9381c22d8b743908d469f-cn-beijing.cn-beijing.log.aliyuncs.com/rum/web/v2?workspace=default-cms-1936221977589032-cn-beijing&service_id=j2c03hoppk@7023210754a92ac5d1971
https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#
https://requesty.ai/solution/llm-routing/models
https://routellm.abacus.ai/v1
https://router.huggingface.co/v1
https://router.requesty.ai/v1
https://sdk.vercel.ai/providers/ai-sdk-providers/vercel
https://submodel.gitbook.io
https://synthetic.new/pricing
https://thegrid.ai/docs
https://token-plan-ams.xiaomimimo.com/v1
https://token-plan-cn.xiaomimimo.com/v1
https://token-plan-sgp.xiaomimimo.com/v1
https://tokenhub.tencentmaas.com/v1
https://vercel.com
https://www.alibabacloud.com/help/en/model-studio/coding-plan
https://www.alibabacloud.com/help/en/model-studio/models
https://www.d.run
https://www.hpc-ai.com/doc/docs/quickstart/
https://www.kimi.com/coding/docs/en/third-party-agents.html
https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog//
https://www.qhaigc.net/docs
https://www.scaleway.com/en/docs/generative-apis/
https://www.xpersona.co/docs
https://www.xpersona.co/v1
https://z.ai
https://zai-test.chatglm.site
https://zcode.chatglm.site
https://zcode.invalid/local-crash-only
https://zcode.z.ai
https://zcode.z.ai/api/v1
https://zcode.z.ai/api/v1/event/report
https://zcode.z.ai/api/v1/oauth/token
https://zenmux.ai/api/anthropic/v1
https://zenmux.ai/api/v1
```

## 5. Chunk dependency graph

See `CHUNK-GRAPH.md`.

## What remains unrecoverable

- Renderer-side function names: the renderer was built **without** keep_names,
  so its identifiers stay minified (module names still visible via chunk file names).
- TypeScript types, comments, original file boundaries inside fused chunks.
