# Preload bridge API (window contracts exposed to the renderer)

Recovered from `out/preload/*.cjs`: every `contextBridge.exposeInMainWorld`
object with its method names and the IPC channel each method invokes
(channel strings resolved from the enum objects shipped in the same file).

## out/preload/index.cjs

### `window.__ZCODE_DEVICE_ID__`

(value: CallExpression)

### `window.__zcodeFinalArmsCustomEventsE2E`

| Method | IPC | Channel |
|---|---|---|
| `read` | invoke | `zcode:e2e:read-final-arms-custom-events` |
| `clear` | invoke | `zcode:e2e:clear-final-arms-custom-events` |
| `configure` | invoke | `zcode:e2e:configure-final-arms-custom-events` |

### `window.zcode`

| Method | IPC | Channel |
|---|---|---|
| `connectRemote` | invoke | `zcode:connect-remote` |
| `cancelPendingRemoteConnection` | invoke | `zcode:cancel-pending-remote-connection` |
| `bindRemoteWorkspaceSessionContext` | invoke | `zcode:bind-remote-workspace-session-context` |
| `startWebRemoteControl` | invoke | `zcode:start-web-remote-control` |
| `refreshWebRemoteControlPairing` | invoke | `zcode:reset-web-remote-control-pairing` |
| `stopWebRemoteControl` | invoke | `zcode:stop-web-remote-control` |
| `getWebRemoteControlStatus` | invoke | `zcode:get-web-remote-control-status` |
| `onWebRemoteControlStatusChanged` | on | `zcode:web-remote-control-status-changed` |
| `disposeRemoteSession` | invoke | `zcode:dispose-remote-session` |
| `isDockerAvailable` | invoke | `zcode:is-docker-available` |
| `listWSLDistros` | invoke | `zcode:list-wsl-distros` |
| `listDockerContainers` | invoke | `zcode:list-docker-containers` |
| `listSSHConfigAliases` | invoke | `zcode:list-ssh-config-aliases` |
| `loadMcpFromUserDirectory` | invoke | `zcode:load-mcp-from-user-directory` |
| `saveMcpToUserDirectory` | invoke | `zcode:save-mcp-to-user-directory` |
| `migrateLegacyCommonMcp` | invoke | `zcode:migrate-legacy-common-mcp` |
| `log` | send | `zcode:log` |
| `selectDirectory` | invoke | `zcode:select-directory` |
| `selectFile` | invoke | `zcode:select-file` |
| `selectFiles` | invoke | `zcode:select-files` |
| `saveFile` | invoke | `zcode:save-file` |
| `printPageToPdf` | invoke | `zcode:print-to-pdf` |
| `getPathForFile` | — | (no direct IPC call) |
| `createTempTextAttachment` | invoke | `zcode:create-temp-text-attachment` |
| `onRemoteConnectionLog` | on | `zcode:remote-connection-log` |
| `onRemoteSessionClosed` | on | `zcode:remote-session-closed` |
| `onBotRemoteWorkspaceReconnected` | on | `zcode:bot-remote-workspace-reconnected` |
| `activateOrSetWorkspace` | invoke | `zcode:activate-or-set-workspace` |
| `syncWindowTabs` | send | `zcode:sync-window-tabs` |
| `syncWebRemoteControlWorkspaces` | send | `zcode:sync-web-remote-control-workspaces` |
| `syncWebRemoteControlTasks` | send | `zcode:sync-web-remote-control-tasks` |
| `onWebRemoteControlReconnectWorkspace` | on | `zcode:web-remote-control-reconnect-workspace` |
| `syncWindowUnreadCount` | send | `zcode:sync-window-unread-count` |
| `syncAppSettings` | send | `zcode:sync-app-settings` |
| `onFocusTab` | on | `zcode:focus-tab` |
| `onNewTab` | on | `zcode:new-tab` |
| `onCloseActiveContextRequest` | on | `zcode:close-active-context-request` |
| `onOpenBrowserUrl` | on | `zcode:open-browser-url` |
| `onBrowserViewReady` | on | `zcode:browser-view-ready` |
| `onBrowserViewOperation` | on | `zcode:browser-view-operation` |
| `onBrowserViewViewportChanged` | on | `zcode:browser-view-viewport-changed` |
| `onBrowserViewScreenshotSurfacePrepare` | on | `zcode:browser-view-screenshot-surface-prepare` |
| `onBrowserViewScreenshotSurfaceRelease` | on | `zcode:browser-view-screenshot-surface-release` |
| `browserViewScreenshotSurfaceReady` | send | `zcode:browser-view-screenshot-surface-ready` |
| `onBrowserViewVisibility` | on | `zcode:browser-view-visibility` |
| `onBrowserViewCloseTab` | on | `zcode:browser-view-close-tab` |
| `onBrowserViewSuspend` | on | `zcode:browser-view-suspend` |
| `onBrowserViewRestore` | on | `zcode:browser-view-restore` |
| `onNewTask` | on | `zcode:new-task` |
| `onOpenWorkspace` | on | `zcode:open-workspace` |
| `onOpenWorkspacePath` | — | (no direct IPC call) |
| `onOpenFeedbackDialog` | on | `zcode:open-feedback-dialog` |
| `onOpenTicketsPanel` | on | `zcode:open-tickets-panel` |
| `onWindowFullscreenChanged` | on | `zcode:window-fullscreen-changed` |
| `getDesktopWindowChromeState` | invoke | `zcode:get-desktop-window-chrome-state` |
| `onDesktopWindowChromeStateChanged` | on | `zcode:desktop-window-chrome-state-changed` |
| `getWindowControlsOverlayMetrics` | — | (no direct IPC call) |
| `onWindowControlsOverlayChanged` | on | `zcode:window-controls-overlay-changed` |
| `getDesktopZoomLevel` | invoke | `zcode:get-desktop-zoom-level` |
| `onDesktopZoomLevelChanged` | on | `zcode:desktop-zoom-level-changed` |
| `onTaskNotificationClick` | on | `zcode:task-notification-click` |
| `openExternal` | send | `zcode:open-external` |
| `canOpenCommunity` | invoke | `zcode:can-open-community` |
| `openInFileManager` | invoke | `zcode:open-in-file-manager` |
| `openCuaPermissionOnboarding` | invoke | `zcode:open-cua-permission-onboarding` |
| `prepareCuaHelperPermissionDrag` | invoke | `zcode:prepare-cua-helper-permission-drag` |
| `startCuaHelperPermissionDrag` | send | `zcode:start-cua-helper-permission-drag` |
| `openCuaAccessibilitySettings` | invoke | `zcode:open-cua-accessibility-settings` |
| `registerOAuthState` | send | `zcode:oauth-register-state` |
| `onOAuthCallback` | send | `zcode:oauth-callback-handled` |
| `onPaymentCallback` | on | `zcode:payment-callback` |
| `notifyRendererReady` | send | `zcode:renderer-ready` |
| `syncTelemetryContext` | send | `zcode:sync-telemetry-context` |
| `reportTelemetryEvent` | invoke | `zcode:report-telemetry-event` |
| `reportArmsCustomEvent` | invoke | `zcode:report-arms-custom-event` |
| `showTaskNotification` | send | `zcode:show-task-notification` |
| `exportLogs` | invoke | `zcode:export-logs` |
| `captureWindowScreenshot` | invoke | `zcode:capture-window-screenshot` |
| `browserViewAttachGuest` | invoke | `zcode:browser-view-attach-guest` |
| `browserViewCloseTab` | invoke | `zcode:browser-view-close-tab-from-renderer` |
| `browserViewReportResidency` | invoke | `zcode:browser-view-report-residency` |
| `browserViewSuspendReady` | invoke | `zcode:browser-view-suspend-ready` |
| `browserViewEnsureResident` | invoke | `zcode:browser-view-ensure-resident` |
| `browserViewRestoreTabs` | invoke | `zcode:browser-view-restore-tabs` |
| `browserViewUpdateViewport` | invoke | `zcode:browser-view-update-viewport` |
| `importChromeBrowserData` | invoke | `zcode:import-chrome-browser-data` |
| `clearEmbeddedBrowserData` | invoke | `zcode:clear-embedded-browser-data` |
| `startPerformanceTrace` | invoke | `zcode:perf:start` |
| `stopPerformanceTrace` | invoke | `zcode:perf:stop` |
| `getZCodeStdioTapDevState` | invoke | `zcode:get-zcode-stdio-tap-dev-state` |
| `onSettingsChanged` | on | `zcode:settings-changed` |
| `onApplicationLocaleChanged` | on | `zcode:application-locale-changed` |
| `onUpdateCheckResult` | on | `zcode:update-check-result` |
| `getUpdateState` | invoke | `zcode:get-update-state` |
| `downloadUpdate` | invoke | `zcode:download-update` |
| `cancelUpdateDownload` | invoke | `zcode:cancel-update-download` |
| `openUpdateStatusWindow` | invoke | `zcode:open-update-status-window` |
| `getAutoUpdatePreferences` | invoke | `zcode:get-auto-update-preferences` |
| `setAutoDownloadAndInstallUpdates` | invoke | `zcode:set-auto-download-and-install-updates` |
| `getDesktopSessionActivity` | invoke | `zcode:get-desktop-session-activity` |
| `onUpdateStateChanged` | — | (no direct IPC call) |
| `onUpdateReady` | — | (no direct IPC call) |
| `onPostUpdateReleaseNotes` | — | (no direct IPC call) |
| `acknowledgePostUpdateReleaseNotes` | invoke | `zcode:ack-post-update-release-notes` |
| `skipUpdateVersion` | invoke | `zcode:skip-update-version` |
| `quitAndInstallUpdate` | invoke | `zcode:quit-and-install-update` |
| `getInstalledEditors` | invoke | `zcode:get-installed-editors` |
| `openInEditor` | invoke | `zcode:open-in-editor` |
| `executeDesktopCommand` | invoke | `zcode:execute-desktop-command` |
| `setApplicationLocale` | invoke | `zcode:set-application-locale` |
| `getSystemLocale` | invoke | `zcode:get-system-locale` |
| `setTitleBarTheme` | invoke | `zcode:set-title-bar-theme` |
| `getDeviceId` | invoke | `zcode:get-device-id` |

## out/preload/embeddedBrowserJavaScriptDialog.cjs

### `window.?`

| Method | IPC | Channel |
|---|---|---|

## out/preload/processMonitor.cjs

### `window.processMonitor`

| Method | IPC | Channel |
|---|---|---|
| `getProcessMetrics` | invoke | `zcode:get-process-metrics` |
