import { a as c, b as ke } from "./chunk-LQDBAECE.js";
var zr = "zh-CN";
var Zf = "3.7.6",
  jf = "cc3ba847",
  Bf = "2026-08-10T10:00:17.872Z";
function normalizeZCodeEnv(e) {
  return e?.trim().toLowerCase() === "production" ? "production" : "test";
}
c(normalizeZCodeEnv, "normalizeZCodeEnv");
var _u = normalizeZCodeEnv("production"),
  Lf = "ZCODE_APP_VERSION",
  Wf = "ZCODE_BUILD_COMMIT_ID",
  Ff = typeof process < "u" ? process.env.ZCODE_DEBUG : void 0,
  qf =
    "https://proj-xtrace-7e235817c9b9381c22d8b743908d469f-cn-beijing.cn-beijing.log.aliyuncs.com/rum/web/v2?workspace=default-cms-1936221977589032-cn-beijing&service_id=j2c03hoppk@7023210754a92ac5d1971";
function mapZCodeEnvToArmsRumEnv() {
  return _u === "production" ? "prod" : "local";
}
c(mapZCodeEnvToArmsRumEnv, "mapZCodeEnvToArmsRumEnv");
var Mr = "https://zcode.z.ai",
  Gf = "https://zcode.chatglm.site",
  Kf = "https://bigmodel.cn",
  Hf = "https://dev.bigmodel.cn",
  Jf = "https://chat.z.ai",
  Yf = "https://zai-test.chatglm.site",
  Xf = "https://api.z.ai",
  Qf = "https://api.chatglm.site",
  eh = "client_P8X5CMWmlaRO9gyO-KSqtg",
  th = "client_RzngVdSk8sYsG2_3HzOMdQ",
  nh = "wss://zcode.z.ai/ws",
  oh = "3.4.0";
function isWebRemoteControlV4AppVersion(e) {
  if (!e) return !1;
  let r = e
    .trim()
    .replace(/^v/i, "")
    .match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([^+]+))?(?:\+(.+))?$/);
  if (!r) return !1;
  let a = r[4]?.split("."),
    n =
      a === void 0 ||
      a.every((u) => /^[0-9A-Za-z-]+$/.test(u) && (!/^\d+$/.test(u) || /^(0|[1-9]\d*)$/.test(u))),
    i = r[5]?.split("."),
    s = i === void 0 || i.every((u) => /^[0-9A-Za-z-]+$/.test(u));
  if (!n || !s) return !1;
  let l = [Number(r[1]), Number(r[2]), Number(r[3])],
    p = oh.split(".").map(Number);
  for (let u = 0; u < p.length; u += 1) if (l[u] !== p[u]) return l[u] > p[u];
  return a === void 0;
}
c(isWebRemoteControlV4AppVersion, "isWebRemoteControlV4AppVersion");
function readRuntimeEnvValue(e, o) {
  let r = e[o]?.trim();
  return r || void 0;
}
c(readRuntimeEnvValue, "readRuntimeEnvValue");
function readRuntimeZCodeEnvScopedValue(e, o, r, a) {
  return readRuntimeEnvValue(e, o === "production" ? a : r);
}
c(readRuntimeZCodeEnvScopedValue, "readRuntimeZCodeEnvScopedValue");
function normalizeZCodeEndpointOrigin(e) {
  let o = e.trim();
  if (!o) throw new Error("ZCode endpoint origin is empty");
  let r = new URL(o);
  if (r.protocol !== "https:" && r.protocol !== "http:")
    throw new Error("ZCode endpoint origin must use http or https");
  return r.origin;
}
c(normalizeZCodeEndpointOrigin, "normalizeZCodeEndpointOrigin");
function resolveZCodeEndpointOrigin(e) {
  let o = e?.env ?? "test",
    r = e?.envBaseOrigin?.trim();
  if (o === "production") return r ? normalizeZCodeEndpointOrigin(r) : Mr;
  let a = e?.overrideOrigin?.trim();
  return a ? normalizeZCodeEndpointOrigin(a) : r ? normalizeZCodeEndpointOrigin(r) : Gf;
}
c(resolveZCodeEndpointOrigin, "resolveZCodeEndpointOrigin");
function resolveRuntimeZCodeEnv(e = {}) {
  return e.ZCODE_ENV?.trim().toLowerCase() === "test" ? "test" : "production";
}
c(resolveRuntimeZCodeEnv, "resolveRuntimeZCodeEnv");
function resolveRuntimeZCodeEndpointOrigin(e = {}, o) {
  let r = resolveRuntimeZCodeEnv(e),
    a = r === "production" ? readRuntimeEnvValue(e, "ZCODE_PRODUCTION_BASE_URL") : readRuntimeEnvValue(e, "ZCODE_TEST_BASE_URL");
  return resolveZCodeEndpointOrigin({
    env: r,
    envBaseOrigin: readRuntimeEnvValue(e, "ZCODE_BASE_URL") ?? readRuntimeEnvValue(e, "ZCODE_ENDPOINT_ORIGIN") ?? a,
    overrideOrigin: o?.overrideOrigin,
  });
}
c(resolveRuntimeZCodeEndpointOrigin, "resolveRuntimeZCodeEndpointOrigin");
function buildRuntimeZCodeEndpointUrls(e = {}) {
  return buildZCodeEndpointUrls(resolveRuntimeZCodeEndpointOrigin(e));
}
c(buildRuntimeZCodeEndpointUrls, "buildRuntimeZCodeEndpointUrls");
function buildRuntimeZCodeApiUrl(e = {}, o) {
  let r = o.startsWith("/") ? o : `/${o}`;
  return `${resolveRuntimeZCodeEndpointOrigin(e)}${r}`;
}
c(buildRuntimeZCodeApiUrl, "buildRuntimeZCodeApiUrl");
function resolveWebRemoteControlRelayWsUrl(e) {
  let o = e?.overrideUrl?.trim();
  return o || nh;
}
c(resolveWebRemoteControlRelayWsUrl, "resolveWebRemoteControlRelayWsUrl");
function resolveBigModelApiOrigin(e = {}) {
  let o = resolveRuntimeZCodeEnv(e),
    r =
      o === "production"
        ? readRuntimeEnvValue(e, "BIGMODEL_PRODUCTION_API_BASE_URL")
        : readRuntimeEnvValue(e, "BIGMODEL_TEST_API_BASE_URL"),
    a = o === "production" ? Kf : Hf;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "BIGMODEL_API_BASE_URL") ?? r ?? a);
}
c(resolveBigModelApiOrigin, "resolveBigModelApiOrigin");
function buildBigModelApiUrl(e = {}, o) {
  let r = o.startsWith("/") ? o : `/${o}`;
  return `${resolveBigModelApiOrigin(e)}${r}`;
}
c(buildBigModelApiUrl, "buildBigModelApiUrl");
function resolveZaiOAuthOrigin(e = {}) {
  let o = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, o, "ZAI_TEST_OAUTH_ORIGIN", "ZAI_PRODUCTION_OAUTH_ORIGIN"),
    a = o === "production" ? Jf : Yf;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "ZAI_OAUTH_ORIGIN") ?? r ?? a);
}
c(resolveZaiOAuthOrigin, "resolveZaiOAuthOrigin");
function resolveZaiBusinessBaseUrl(e = {}) {
  let o = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, o, "ZAI_TEST_BUSINESS_BASE_URL", "ZAI_PRODUCTION_BUSINESS_BASE_URL"),
    a = o === "production" ? Xf : Qf;
  return normalizeZCodeEndpointOrigin(readRuntimeEnvValue(e, "ZAI_BUSINESS_BASE_URL") ?? r ?? a);
}
c(resolveZaiBusinessBaseUrl, "resolveZaiBusinessBaseUrl");
function resolveZaiOAuthClientId(e = {}) {
  let o = resolveRuntimeZCodeEnv(e),
    r = readRuntimeZCodeEnvScopedValue(e, o, "ZAI_TEST_OAUTH_CLIENT_ID", "ZAI_PRODUCTION_OAUTH_CLIENT_ID"),
    a = o === "production" ? eh : th;
  return readRuntimeEnvValue(e, "ZAI_OAUTH_CLIENT_ID") ?? r ?? readRuntimeEnvValue(e, "ZAI_OAUTH_APP_ID") ?? a;
}
c(resolveZaiOAuthClientId, "resolveZaiOAuthClientId");
function buildZCodeEndpointUrls(e, o = {}) {
  let r = normalizeZCodeEndpointOrigin(e),
    a = new URL(r),
    i = `${a.protocol === "https:" ? "wss:" : "ws:"}//${a.host}`,
    s = isWebRemoteControlV4AppVersion(o.appVersion) ? "v4" : "v3";
  return {
    origin: r,
    apiBaseUrl: `${r}/api/v1`,
    remoteUrl: `${r}/remote/${s}`,
    webRemoteCallbackUrl: `${r}/web-remote/callback`,
    relayWsUrl: `${i}/ws`,
    zcodePlanOpenAiBaseUrl: `${r}/api/v1/zcode-plan`,
    zcodePlanAnthropicBaseUrl: `${r}/api/v1/zcode-plan/anthropic`,
    zcodePlanBillingCurrentUrl: `${r}/api/v1/zcode-plan/billing/current`,
    zcodePlanBillingBalanceUrl: `${r}/api/v1/zcode-plan/billing/balance`,
  };
}
c(buildZCodeEndpointUrls, "buildZCodeEndpointUrls");
function rewriteZCodeEndpointUrl(e, o) {
  let r = typeof e == "string" ? e : e.toString(),
    a;
  try {
    a = new URL(r);
  } catch {
    return e;
  }
  let n = Mr;
  if (a.origin !== n) return e;
  let i = normalizeZCodeEndpointOrigin(o);
  if (i === n) return e;
  let s = new URL(i);
  return ((s.pathname = a.pathname), (s.search = a.search), (s.hash = a.hash), s.toString());
}
c(rewriteZCodeEndpointUrl, "rewriteZCodeEndpointUrl");
var ch = "ZCODE_RUNTIME_ENV";
var ku = "ZCODE_TOOL_ENV_PASSTHROUGH_JSON",
  Iu = [
    "NODE_ENV",
    "ELECTRON_RUN_AS_NODE",
    "NODE_NO_WARNINGS",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "NO_PROXY",
    "NODE_EXTRA_CA_CERTS",
    "SSL_CERT_FILE",
    "SSL_CERT_DIR",
    "REQUESTS_CA_BUNDLE",
    "CURL_CA_BUNDLE",
    "GIT_SSL_CAINFO",
    "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
    "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
    "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT",
    "OTEL_EXPORTER_OTLP_HEADERS",
    "OTEL_EXPORTER_OTLP_TRACES_HEADERS",
    "OTEL_SERVICE_NAME",
    "OTEL_RESOURCE_ATTRIBUTES",
    "OTEL_EXPORTER_OTLP_COMPRESSION",
    "ZCODE_MODEL_TELEMETRY_ENABLED",
    "ZCODE_TELEMETRY_DEVICE_MID",
    "ZCODE_TELEMETRY_USER_ID",
    "ZCODE_TELEMETRY_USER_ID_HASH",
    "ZCODE_TELEMETRY_USER_SUBJECT_ID",
    "ZCODE_TELEMETRY_IDENTITY_STATE",
    "ZCODE_TELEMETRY_RUNTIME_SURFACE",
    "ZCODE_TELEMETRY_RUNTIME_DISTRIBUTION",
  ],
  lh = [
    "NODE_ENV",
    "ELECTRON_RUN_AS_NODE",
    "NODE_NO_WARNINGS",
    "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
    "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
  ],
  dh = /^(npm_config|yarn|pnpm)_(http_proxy|https_proxy|proxy|all_proxy|no_proxy|cafile|ca)$/i;
function normalizeZCodeRuntimeEnv(e) {
  let o = e?.trim().toLowerCase();
  if (o === "development" || o === "production" || o === "test") return o;
}
c(normalizeZCodeRuntimeEnv, "normalizeZCodeRuntimeEnv");
function resolveZCodeRuntimeEnv(e, o = "production") {
  return normalizeZCodeRuntimeEnv(e[ch]) ?? o;
}
c(resolveZCodeRuntimeEnv, "resolveZCodeRuntimeEnv");
var ph = "ZCODE_CUA_PERMISSION_BROKER_SOCKET",
  mh = "ZCODE_CUA_PERMISSION_BROKER_TOKEN",
  gh,
  fh,
  hh = {};
function captureZCodeCuaBrokerCredentials(e) {
  let o = e[ph]?.trim(),
    r = e[mh]?.trim();
  (o && (gh = o), r && (fh = r));
}
c(captureZCodeCuaBrokerCredentials, "captureZCodeCuaBrokerCredentials");
function captureZCodeAgentTelemetryEnv(e) {
  Object.assign(hh, readZCodeAgentTelemetryEnv(e));
}
c(captureZCodeAgentTelemetryEnv, "captureZCodeAgentTelemetryEnv");
function readZCodeAgentTelemetryEnv(e) {
  let o = {};
  for (let r of Iu) {
    if (!isZCodeAgentTelemetryEnvKey(r)) continue;
    let a = e[r]?.trim();
    a && (o[r] = a);
  }
  return o;
}
c(readZCodeAgentTelemetryEnv, "readZCodeAgentTelemetryEnv");
function sanitizeZCodeRuntimeEnv(e) {
  (captureZCodeCuaBrokerCredentials(e), captureZCodeAgentTelemetryEnv(e));
  let o = {};
  for (let [r, a] of Object.entries(e)) a === void 0 || shouldSanitizeZCodeRuntimeEnvKey(r) || (o[r] = a);
  return o;
}
c(sanitizeZCodeRuntimeEnv, "sanitizeZCodeRuntimeEnv");
function buildZCodeToolEnvPassthroughEnv(e) {
  let o = readZCodeToolEnvPassthroughEnv(e);
  for (let [r, a] of Object.entries(e)) a === void 0 || !shouldCaptureZCodeToolEnvPassthroughKey(r) || (o[r] = a);
  return stringifyZCodeToolEnvPassthroughEnv(o);
}
c(buildZCodeToolEnvPassthroughEnv, "buildZCodeToolEnvPassthroughEnv");
function readZCodeToolEnvPassthroughEnv(e) {
  let o = e[ku];
  if (!o) return {};
  try {
    let r = JSON.parse(o);
    if (!r || typeof r != "object" || Array.isArray(r)) return {};
    let a = {};
    for (let [n, i] of Object.entries(r))
      typeof i == "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(n) && shouldCaptureZCodeToolEnvPassthroughKey(n) && (a[n] = i);
    return a;
  } catch {
    return {};
  }
}
c(readZCodeToolEnvPassthroughEnv, "readZCodeToolEnvPassthroughEnv");
function isZCodeAgentTelemetryEnvKey(e) {
  return (
    e.startsWith("OTEL_") ||
    e.startsWith("ZCODE_TELEMETRY_") ||
    e === "ZCODE_MODEL_TELEMETRY_ENABLED"
  );
}
c(isZCodeAgentTelemetryEnvKey, "isZCodeAgentTelemetryEnvKey");
function shouldSanitizeZCodeRuntimeEnvKey(e) {
  let o = e.toUpperCase();
  return Iu.some((r) => r === o) || dh.test(e);
}
c(shouldSanitizeZCodeRuntimeEnvKey, "shouldSanitizeZCodeRuntimeEnvKey");
function shouldCaptureZCodeToolEnvPassthroughKey(e) {
  let o = e.toUpperCase();
  return isZCodeAgentTelemetryEnvKey(o) || lh.some((r) => r === o) ? !1 : shouldSanitizeZCodeRuntimeEnvKey(e);
}
c(shouldCaptureZCodeToolEnvPassthroughKey, "shouldCaptureZCodeToolEnvPassthroughKey");
function stringifyZCodeToolEnvPassthroughEnv(e) {
  let o = Object.entries(e).sort(([r], [a]) => r.localeCompare(a));
  return o.length === 0 ? {} : { [ku]: JSON.stringify(Object.fromEntries(o)) };
}
c(stringifyZCodeToolEnvPassthroughEnv, "stringifyZCodeToolEnvPassthroughEnv");
var mC = {
    File: "file",
    System: "system",
    Terminal: "terminal",
    Git: "git",
    GitCheckpoint: "git-checkpoint",
    Setting: "setting",
    Credential: "credential",
    Broadcast: "broadcast",
    ZCodeTask: "zcode-task",
    ZCodeAgent: "nofy-agent",
    ZCodeSession: "zcode-session",
    FileWatcher: "file-watcher",
    OAuth: "oauth",
    ModelProvider: "model-provider",
    UsageStats: "usage-stats",
    CodingPlanSubscription: "coding-plan-subscription",
    Skills: "skills",
    SkillSync: "skill-sync",
    McpSync: "mcp-sync",
    PluginSync: "plugin-sync",
    Plugins: "plugins",
    PluginManagement: "plugin-management",
    Subagents: "subagents",
    Commands: "commands",
    Hooks: "hooks",
    Memory: "memory",
    OutputStyle: "output-style",
    SettingsSync: "settings-sync",
    Bots: "bots",
    Feedback: "feedback",
    RepoWiki: "repo-wiki",
    PromptAttachmentTransfer: "prompt-attachment-transfer",
    OffPeakTask: "off-peak-task",
  },
  gC = {
    SelectDirectory: "zcode:select-directory",
    SelectFile: "zcode:select-file",
    SelectFiles: "zcode:select-files",
    CreateTempTextAttachment: "zcode:create-temp-text-attachment",
    SaveFile: "zcode:save-file",
    PrintToPdf: "zcode:print-to-pdf",
    RemoteConnectionLog: "zcode:remote-connection-log",
    RemoteSessionClosed: "zcode:remote-session-closed",
    BotRemoteWorkspaceReconnected: "zcode:bot-remote-workspace-reconnected",
    ActivateOrSetWorkspace: "zcode:activate-or-set-workspace",
    ConnectRemote: "zcode:connect-remote",
    CancelPendingRemoteConnection: "zcode:cancel-pending-remote-connection",
    BindRemoteWorkspaceSessionContext: "zcode:bind-remote-workspace-session-context",
    StartWebRemoteControl: "zcode:start-web-remote-control",
    ResetWebRemoteControlPairing: "zcode:reset-web-remote-control-pairing",
    StopWebRemoteControl: "zcode:stop-web-remote-control",
    GetWebRemoteControlStatus: "zcode:get-web-remote-control-status",
    WebRemoteControlStatusChanged: "zcode:web-remote-control-status-changed",
    DisposeRemoteSession: "zcode:dispose-remote-session",
    IsDockerAvailable: "zcode:is-docker-available",
    ListWSLDistros: "zcode:list-wsl-distros",
    ListDockerContainers: "zcode:list-docker-containers",
    ListSSHConfigAliases: "zcode:list-ssh-config-aliases",
    LoadMcpFromUserDirectory: "zcode:load-mcp-from-user-directory",
    SaveMcpToUserDirectory: "zcode:save-mcp-to-user-directory",
    Log: "zcode:log",
    SyncWindowTabs: "zcode:sync-window-tabs",
    SyncWebRemoteControlWorkspaces: "zcode:sync-web-remote-control-workspaces",
    SyncWebRemoteControlTasks: "zcode:sync-web-remote-control-tasks",
    WebRemoteControlReconnectWorkspace: "zcode:web-remote-control-reconnect-workspace",
    SyncWindowUnreadCount: "zcode:sync-window-unread-count",
    SyncAppSettings: "zcode:sync-app-settings",
    FocusTab: "zcode:focus-tab",
    NewTab: "zcode:new-tab",
    CloseActiveContextRequest: "zcode:close-active-context-request",
    OpenBrowserUrl: "zcode:open-browser-url",
    BrowserViewReady: "zcode:browser-view-ready",
    BrowserViewOperation: "zcode:browser-view-operation",
    BrowserViewVisibility: "zcode:browser-view-visibility",
    BrowserViewViewportChanged: "zcode:browser-view-viewport-changed",
    BrowserViewScreenshotSurfacePrepare: "zcode:browser-view-screenshot-surface-prepare",
    BrowserViewScreenshotSurfaceReady: "zcode:browser-view-screenshot-surface-ready",
    BrowserViewScreenshotSurfaceRelease: "zcode:browser-view-screenshot-surface-release",
    BrowserViewCloseTab: "zcode:browser-view-close-tab",
    BrowserViewSuspend: "zcode:browser-view-suspend",
    BrowserViewRestore: "zcode:browser-view-restore",
    NewTask: "zcode:new-task",
    OpenWorkspace: "zcode:open-workspace",
    OpenWorkspacePath: "zcode:open-workspace-path",
    OpenFeedbackDialog: "zcode:open-feedback-dialog",
    OpenTicketsPanel: "zcode:open-tickets-panel",
    WindowFullscreenChanged: "zcode:window-fullscreen-changed",
    GetDesktopWindowChromeState: "zcode:get-desktop-window-chrome-state",
    DesktopWindowChromeStateChanged: "zcode:desktop-window-chrome-state-changed",
    WindowControlsOverlayChanged: "zcode:window-controls-overlay-changed",
    WindowControlsOverlayReady: "zcode:window-controls-overlay-ready",
    GetProcessMetrics: "zcode:get-process-metrics",
    OpenProcessMonitor: "zcode:open-process-monitor",
    OpenExternal: "zcode:open-external",
    CanOpenCommunity: "zcode:can-open-community",
    OpenInFileManager: "zcode:open-in-file-manager",
    OpenCuaPermissionOnboarding: "zcode:open-cua-permission-onboarding",
    PrepareCuaHelperPermissionDrag: "zcode:prepare-cua-helper-permission-drag",
    StartCuaHelperPermissionDrag: "zcode:start-cua-helper-permission-drag",
    OpenCuaAccessibilitySettings: "zcode:open-cua-accessibility-settings",
    OAuthRegisterState: "zcode:oauth-register-state",
    OAuthCallback: "zcode:oauth-callback",
    PaymentCallback: "zcode:payment-callback",
    OAuthCallbackHandled: "zcode:oauth-callback-handled",
    RendererReady: "zcode:renderer-ready",
    SyncTelemetryContext: "zcode:sync-telemetry-context",
    ReportTelemetryEvent: "zcode:report-telemetry-event",
    ReportArmsCustomEvent: "zcode:report-arms-custom-event",
    ReadFinalArmsCustomEventsE2E: "zcode:e2e:read-final-arms-custom-events",
    ClearFinalArmsCustomEventsE2E: "zcode:e2e:clear-final-arms-custom-events",
    ConfigureFinalArmsCustomEventsE2E: "zcode:e2e:configure-final-arms-custom-events",
    ShowTaskNotification: "zcode:show-task-notification",
    TaskNotificationSound: "zcode:task-notification-sound",
    TaskNotificationClick: "zcode:task-notification-click",
    ExportLogs: "zcode:export-logs",
    CaptureWindowScreenshot: "zcode:capture-window-screenshot",
    BrowserViewAttachGuest: "zcode:browser-view-attach-guest",
    BrowserViewCloseTabFromRenderer: "zcode:browser-view-close-tab-from-renderer",
    BrowserViewReportResidency: "zcode:browser-view-report-residency",
    BrowserViewSuspendReady: "zcode:browser-view-suspend-ready",
    BrowserViewEnsureResident: "zcode:browser-view-ensure-resident",
    BrowserViewRestoreTabs: "zcode:browser-view-restore-tabs",
    BrowserViewUpdateViewport: "zcode:browser-view-update-viewport",
    EmbeddedBrowserJavaScriptDialog: "zcode:embedded-browser-javascript-dialog",
    ImportChromeBrowserData: "zcode:import-chrome-browser-data",
    ClearEmbeddedBrowserData: "zcode:clear-embedded-browser-data",
    StartPerformanceTrace: "zcode:perf:start",
    StopPerformanceTrace: "zcode:perf:stop",
    UpdateReady: "zcode:update-ready",
    UpdateCheckResult: "zcode:update-check-result",
    UpdateStateChanged: "zcode:update-state-changed",
    GetUpdateState: "zcode:get-update-state",
    DownloadUpdate: "zcode:download-update",
    CancelUpdateDownload: "zcode:cancel-update-download",
    OpenUpdateStatusWindow: "zcode:open-update-status-window",
    GetAutoUpdatePreferences: "zcode:get-auto-update-preferences",
    SetAutoDownloadAndInstallUpdates: "zcode:set-auto-download-and-install-updates",
    GetDesktopSessionActivity: "zcode:get-desktop-session-activity",
    GetDesktopZoomLevel: "zcode:get-desktop-zoom-level",
    DesktopZoomLevelChanged: "zcode:desktop-zoom-level-changed",
    GetZCodeStdioTapDevState: "zcode:get-zcode-stdio-tap-dev-state",
    SettingsChanged: "zcode:settings-changed",
    ApplicationLocaleChanged: "zcode:application-locale-changed",
    GetSystemLocale: "zcode:get-system-locale",
    PostUpdateReleaseNotes: "zcode:post-update-release-notes",
    AcknowledgePostUpdateReleaseNotes: "zcode:ack-post-update-release-notes",
    SkipUpdateVersion: "zcode:skip-update-version",
    QuitAndInstallUpdate: "zcode:quit-and-install-update",
    GetInstalledEditors: "zcode:get-installed-editors",
    OpenInEditor: "zcode:open-in-editor",
    ExecuteDesktopCommand: "zcode:execute-desktop-command",
    SetApplicationLocale: "zcode:set-application-locale",
    SetTitleBarTheme: "zcode:set-title-bar-theme",
    MigrateLegacyCommonMcp: "zcode:migrate-legacy-common-mcp",
    GetDeviceId: "zcode:get-device-id",
  };
var fC = {
  ServicePort: "zcode:service-port",
  RemoteServicePort: "zcode:remote-service-port",
  TaskNotificationSound: "zcode:task-notification-sound",
};
var hC = {
    InitLocal: "init-local",
    InitRemote: "init-remote",
    InitRemoteWorkspace: "init-remote-workspace",
    InitRemoteSshHost: "init-remote-ssh-host",
    InitRemoteWslHost: "init-remote-wsl-host",
    AttachServicePort: "attach-service-port",
    DetachServicePort: "detach-service-port",
    AcquireRemoteWorkspace: "acquire-remote-workspace",
    ReleaseRemoteWorkspace: "release-remote-workspace",
    Dispose: "dispose",
    Broadcast: "broadcast",
    TaskRealtimeDeliver: "task-realtime-deliver",
    TaskRunLeaseResult: "task-run-lease-result",
    TaskOwnerCommandDeliver: "task-owner-command-deliver",
    TaskOwnerCommandResult: "task-owner-command-result",
    BotRemoteWorkspaceReconnectResult: "bot-remote-workspace-reconnect-result",
    BotRemoteWorkspaceConnectionStatusResult: "bot-remote-workspace-connection-status-result",
    BotRemoteWorkspaceRuntimePort: "bot-remote-workspace-runtime-port",
    SessionMessageDeliver: "session-message-deliver",
    SessionMessageDeliveryResult: "session-message-delivery-result",
    FeedbackLogArchiveResult: "feedback-log-archive-result",
    CronRun: "cron-run",
    OffPeakRun: "off-peak-run",
    BrowserExecuteResult: "browser-execute-result",
  },
  yC = {
    Connected: "connected",
    Error: "error",
    Log: "log",
    AgentProcessSpawned: "agent-process-spawned",
    AgentProcessReady: "agent-process-ready",
    AgentProcessExited: "agent-process-exited",
    AgentProcessError: "agent-process-error",
    AgentResourceSample: "agent-resource-sample",
    AgentRunningTaskCountChanged: "agent-running-task-count-changed",
    WorkspaceRunningTaskCountChanged: "workspace-running-task-count-changed",
    RemoteWorkspaceAcquired: "remote-workspace-acquired",
    RepoWikiRunningTaskCountChanged: "repo-wiki-running-task-count-changed",
    Broadcast: "broadcast",
    TaskRealtimePublish: "task-realtime-publish",
    TaskStreamOpPublish: "task-stream-op-publish",
    TaskRunLeaseAcquire: "task-run-lease-acquire",
    TaskRunLeaseRelease: "task-run-lease-release",
    TaskOwnerCommandRequest: "task-owner-command-request",
    TaskOwnerCommandResult: "task-owner-command-result",
    BotRemoteWorkspaceReconnectRequest: "bot-remote-workspace-reconnect-request",
    BotRemoteWorkspaceConnectionStatusRequest: "bot-remote-workspace-connection-status-request",
    BotRemoteWorkspaceRuntimePortRequest: "bot-remote-workspace-runtime-port-request",
    SessionMessageSendRequested: "session-message-send-requested",
    SessionRouteAnnounce: "session-route-announce",
    SessionMessageDeliverResult: "session-message-deliver-result",
    FeedbackLogArchiveRequest: "feedback-log-archive-request",
    CronRunResult: "cron-run-result",
    OffPeakRunResult: "off-peak-run-result",
    CronSchedulerWakeRequest: "cron-scheduler-wake-request",
    OffPeakSchedulerWakeRequest: "off-peak-scheduler-wake-request",
    BrowserExecuteRequest: "browser-execute-request",
    NetworkTelemetryBatch: "network-telemetry-batch",
  };
var xC = {
    file: "titleBar.menu.file",
    edit: "titleBar.menu.edit",
    view: "titleBar.menu.view",
    window: "titleBar.menu.window",
    help: "titleBar.menu.help",
    fileNewTask: "titleBar.menu.file.newTask",
    fileOpenWorkspace: "titleBar.menu.file.openWorkspace",
    fileCloseWindow: "titleBar.menu.file.closeWindow",
    editUndo: "titleBar.menu.edit.undo",
    editRedo: "titleBar.menu.edit.redo",
    editCut: "titleBar.menu.edit.cut",
    editCopy: "titleBar.menu.edit.copy",
    editPaste: "titleBar.menu.edit.paste",
    editSelectAll: "titleBar.menu.edit.selectAll",
    viewToggleFullScreen: "titleBar.menu.view.toggleFullScreen",
    viewActualSize: "titleBar.menu.view.actualSize",
    viewZoomIn: "titleBar.menu.view.zoomIn",
    viewZoomOut: "titleBar.menu.view.zoomOut",
    windowMinimize: "titleBar.menu.window.minimize",
    windowZoom: "titleBar.menu.window.zoom",
    windowBringAllToFront: "titleBar.menu.window.bringAllToFront",
    appServices: "titleBar.menu.app.services",
    appHide: "titleBar.menu.app.hide",
    appHideOthers: "titleBar.menu.app.hideOthers",
    appShowAll: "titleBar.menu.app.showAll",
    appQuit: "titleBar.menu.app.quit",
    helpAbout: "titleBar.menu.help.about",
    helpWhatsNew: "titleBar.menu.help.whatsNew",
    helpCheckForUpdates: "titleBar.menu.help.checkForUpdates",
    helpToggleDevTools: "titleBar.menu.help.toggleDevTools",
    helpProcessMonitor: "titleBar.menu.help.processMonitor",
    helpToggleZCodeStdioTap: "titleBar.menu.help.toggleZCodeStdioTap",
    helpZCodeEndpoint: "titleBar.menu.help.zcodeEndpoint",
    helpZCodeEndpointProduction: "titleBar.menu.help.zcodeEndpoint.production",
    helpZCodeEndpointTest: "titleBar.menu.help.zcodeEndpoint.test",
    helpZCodeEndpointCustom: "titleBar.menu.help.zcodeEndpoint.custom",
    helpZCodeEndpointReset: "titleBar.menu.help.zcodeEndpoint.reset",
    helpStartPerformanceRecording: "titleBar.menu.help.startPerformanceRecording",
    helpStopPerformanceRecording: "titleBar.menu.help.stopPerformanceRecording",
    helpFeedback: "titleBar.menu.help.feedback",
    helpExportLogs: "titleBar.menu.help.exportLogs",
    helpClearAllData: "titleBar.menu.help.clearAllData",
    helpCheckingForUpdates: "desktopMenu.help.checkingForUpdates",
    helpUpdateAvailableVersion: "desktopMenu.help.updateAvailableVersion",
    helpDownloadingUpdateVersion: "desktopMenu.help.downloadingUpdateVersion",
    helpDownloadingUpdateProgress: "desktopMenu.help.downloadingUpdateProgress",
    helpRestartToUpdate: "desktopMenu.help.restartToUpdate",
    dockShowCurrentWindow: "dock.menu.showCurrentWindow",
    trayTooltip: "tray.tooltip",
    trayOpenZCode: "tray.menu.openZCode",
    trayQuit: "tray.menu.quit",
  },
  Tu = {
    "zh-CN": {
      "titleBar.menu.file": "\u6587\u4EF6",
      "titleBar.menu.edit": "\u7F16\u8F91",
      "titleBar.menu.view": "\u89C6\u56FE",
      "titleBar.menu.window": "\u7A97\u53E3",
      "titleBar.menu.help": "\u5E2E\u52A9",
      "titleBar.menu.file.newTask": "\u65B0\u5EFA\u4EFB\u52A1",
      "titleBar.menu.file.openWorkspace": "\u6253\u5F00\u5DE5\u4F5C\u533A",
      "titleBar.menu.file.closeWindow": "\u5173\u95ED\u7A97\u53E3",
      "titleBar.menu.edit.undo": "\u64A4\u9500",
      "titleBar.menu.edit.redo": "\u91CD\u505A",
      "titleBar.menu.edit.cut": "\u526A\u5207",
      "titleBar.menu.edit.copy": "\u590D\u5236",
      "titleBar.menu.edit.paste": "\u7C98\u8D34",
      "titleBar.menu.edit.selectAll": "\u5168\u9009",
      "titleBar.menu.view.toggleFullScreen": "\u5207\u6362\u5168\u5C4F",
      "titleBar.menu.view.actualSize": "\u5B9E\u9645\u5927\u5C0F",
      "titleBar.menu.view.zoomIn": "\u653E\u5927",
      "titleBar.menu.view.zoomOut": "\u7F29\u5C0F",
      "titleBar.menu.window.minimize": "\u6700\u5C0F\u5316",
      "titleBar.menu.window.zoom": "\u7F29\u653E",
      "titleBar.menu.window.bringAllToFront": "\u5168\u90E8\u7F6E\u4E8E\u524D\u53F0",
      "titleBar.menu.app.services": "\u670D\u52A1",
      "titleBar.menu.app.hide": "\u9690\u85CF {appName}",
      "titleBar.menu.app.hideOthers": "\u9690\u85CF\u5176\u4ED6",
      "titleBar.menu.app.showAll": "\u5168\u90E8\u663E\u793A",
      "titleBar.menu.app.quit": "\u9000\u51FA {appName}",
      "titleBar.menu.help.about": "\u5173\u4E8E nofy", // REBRAND-031+131
      "titleBar.menu.help.whatsNew": "\u66F4\u65B0\u65E5\u5FD7",
      "titleBar.menu.help.checkForUpdates": "\u68C0\u67E5\u66F4\u65B0",
      "titleBar.menu.help.toggleDevTools": "\u5207\u6362\u5F00\u53D1\u8005\u5DE5\u5177",
      "titleBar.menu.help.processMonitor": "\u8FDB\u7A0B\u76D1\u89C6\u5668",
      "titleBar.menu.help.toggleZCodeStdioTap": "\u6293\u53D6 Agent stdio \u901A\u4FE1",
      "titleBar.menu.help.zcodeEndpoint": "Nofy Endpoint", // REBRAND-031+131
      "titleBar.menu.help.zcodeEndpoint.production": "Production\uFF08\u9ED8\u8BA4\uFF09",
      "titleBar.menu.help.zcodeEndpoint.test": "Test",
      "titleBar.menu.help.zcodeEndpoint.custom": "\u81EA\u5B9A\u4E49...",
      "titleBar.menu.help.zcodeEndpoint.reset": "\u6062\u590D\u9ED8\u8BA4",
      "titleBar.menu.help.startPerformanceRecording": "\u5F00\u59CB\u6027\u80FD\u5F55\u5236",
      "titleBar.menu.help.stopPerformanceRecording": "\u505C\u6B62\u6027\u80FD\u5F55\u5236",
      "titleBar.menu.help.feedback": "\u95EE\u9898\u53CD\u9988",
      "titleBar.menu.help.exportLogs": "\u5BFC\u51FA\u65E5\u5FD7",
      "titleBar.menu.help.clearAllData": "\u6E05\u9664\u6240\u6709\u6570\u636E",
      "desktopMenu.help.checkingForUpdates": "\u6B63\u5728\u68C0\u67E5\u66F4\u65B0...",
      "desktopMenu.help.updateAvailableVersion": "\u53D1\u73B0\u65B0\u7248\u672C {version}",
      "desktopMenu.help.downloadingUpdateVersion":
        "\u6B63\u5728\u4E0B\u8F7D\u66F4\u65B0 {version}...",
      "desktopMenu.help.downloadingUpdateProgress":
        "\u6B63\u5728\u4E0B\u8F7D\u66F4\u65B0... {progress}",
      "desktopMenu.help.restartToUpdate": "\u91CD\u542F\u4EE5\u66F4\u65B0\uFF08{version}\uFF09",
      "dock.menu.showCurrentWindow": "\u663E\u793A\u5F53\u524D\u7A97\u53E3",
      "tray.tooltip": "nofy", // REBRAND-031+131
      "tray.menu.openZCode": "\u6253\u5F00 nofy", // REBRAND-031+131
      "tray.menu.quit": "\u9000\u51FA",
    },
    "en-US": {
      "titleBar.menu.file": "File",
      "titleBar.menu.edit": "Edit",
      "titleBar.menu.view": "View",
      "titleBar.menu.window": "Window",
      "titleBar.menu.help": "Help",
      "titleBar.menu.file.newTask": "New task",
      "titleBar.menu.file.openWorkspace": "Open workspace",
      "titleBar.menu.file.closeWindow": "Close window",
      "titleBar.menu.edit.undo": "Undo",
      "titleBar.menu.edit.redo": "Redo",
      "titleBar.menu.edit.cut": "Cut",
      "titleBar.menu.edit.copy": "Copy",
      "titleBar.menu.edit.paste": "Paste",
      "titleBar.menu.edit.selectAll": "Select all",
      "titleBar.menu.view.toggleFullScreen": "Toggle full screen",
      "titleBar.menu.view.actualSize": "Actual size",
      "titleBar.menu.view.zoomIn": "Zoom in",
      "titleBar.menu.view.zoomOut": "Zoom out",
      "titleBar.menu.window.minimize": "Minimize",
      "titleBar.menu.window.zoom": "Zoom",
      "titleBar.menu.window.bringAllToFront": "Bring all to front",
      "titleBar.menu.app.services": "Services",
      "titleBar.menu.app.hide": "Hide {appName}",
      "titleBar.menu.app.hideOthers": "Hide others",
      "titleBar.menu.app.showAll": "Show all",
      "titleBar.menu.app.quit": "Quit {appName}",
      "titleBar.menu.help.about": "About nofy", // REBRAND-032+132
      "titleBar.menu.help.whatsNew": "What's new",
      "titleBar.menu.help.checkForUpdates": "Check for updates",
      "titleBar.menu.help.toggleDevTools": "Toggle developer tools",
      "titleBar.menu.help.processMonitor": "Process monitor",
      "titleBar.menu.help.toggleZCodeStdioTap": "Capture agent stdio traffic",
      "titleBar.menu.help.zcodeEndpoint": "Nofy Endpoint", // REBRAND-032+132
      "titleBar.menu.help.zcodeEndpoint.production": "Production (default)",
      "titleBar.menu.help.zcodeEndpoint.test": "Test",
      "titleBar.menu.help.zcodeEndpoint.custom": "Custom...",
      "titleBar.menu.help.zcodeEndpoint.reset": "Reset to default",
      "titleBar.menu.help.startPerformanceRecording": "Start performance recording",
      "titleBar.menu.help.stopPerformanceRecording": "Stop performance recording",
      "titleBar.menu.help.feedback": "Feedback",
      "titleBar.menu.help.exportLogs": "Export logs",
      "titleBar.menu.help.clearAllData": "Clear all data",
      "desktopMenu.help.checkingForUpdates": "Checking for updates...",
      "desktopMenu.help.updateAvailableVersion": "Update available {version}",
      "desktopMenu.help.downloadingUpdateVersion": "Downloading update {version}...",
      "desktopMenu.help.downloadingUpdateProgress": "Downloading update... {progress}",
      "desktopMenu.help.restartToUpdate": "Restart to update ({version})",
      "dock.menu.showCurrentWindow": "Show current window",
      "tray.tooltip": "nofy", // REBRAND-032+132
      "tray.menu.openZCode": "Open nofy", // REBRAND-032+132
      "tray.menu.quit": "Quit",
    },
  };
function getDesktopMenuMessage(e, o) {
  return (Tu[e] ?? Tu[zr])[o];
}
c(getDesktopMenuMessage, "getDesktopMenuMessage");
function formatDesktopMenuMessage(e, o, r) {
  let a = getDesktopMenuMessage(e, o);
  if (!r) return a;
  for (let [n, i] of Object.entries(r)) a = a.replaceAll(`{${n}}`, String(i));
  return a;
}
c(formatDesktopMenuMessage, "formatDesktopMenuMessage");
function shouldEnableE2ETestBridge(e) {
  return e.VITE_ZCODE_E2E_STORE_BRIDGE === "1" && !!e.ZCODE_E2E_RUN_ID?.trim();
}
c(shouldEnableE2ETestBridge, "shouldEnableE2ETestBridge");
function stripRemoteTargetSecrets(e) {
  if (e.kind === "ssh") {
    let { password: o, privateKeyPassphrase: r, ...a } = e;
    return a;
  }
  if (e.kind === "server") {
    let { token: o, ...r } = e;
    return r;
  }
  return e;
}
c(stripRemoteTargetSecrets, "stripRemoteTargetSecrets");
function splitPrivateKeyPathRoot(e) {
  let o = e.match(/^([A-Z]:)\/(.*)$/);
  if (o) return { prefix: `${o[1]}/`, body: o[2] ?? "", blocksParentTraversal: !0 };
  if (e.startsWith("//")) {
    let a = e.slice(2).split("/").filter(Boolean);
    if (a.length >= 2) {
      let [n, i, ...s] = a;
      return { prefix: `//${n}/${i}/`, body: s.join("/"), blocksParentTraversal: !0 };
    }
    return { prefix: "//", body: a.join("/"), blocksParentTraversal: !0 };
  }
  if (e.startsWith("/"))
    return { prefix: "/", body: e.replace(/^\/+/, ""), blocksParentTraversal: !0 };
  if (e.startsWith("~/")) return { prefix: "~/", body: e.slice(2), blocksParentTraversal: !1 };
  let r = e.match(/^([A-Z]:)(.*)$/);
  return r
    ? { prefix: r[1] ?? "", body: r[2] ?? "", blocksParentTraversal: !1 }
    : { prefix: "", body: e, blocksParentTraversal: !1 };
}
c(splitPrivateKeyPathRoot, "splitPrivateKeyPathRoot");
function normalizePrivateKeyPath(e) {
  let o = e?.trim();
  if (!o) return "";
  let a = o.replace(/\\/g, "/").replace(/^([a-z]):/i, (s, l) => `${l.toUpperCase()}:`),
    n = splitPrivateKeyPathRoot(a),
    i = [];
  for (let s of n.body.split("/"))
    if (!(!s || s === ".")) {
      if (s === "..") {
        if (i.length > 0 && i.at(-1) !== "..") {
          i.pop();
          continue;
        }
        if (n.blocksParentTraversal) continue;
        i.push(s);
        continue;
      }
      i.push(s);
    }
  return `${n.prefix}${i.join("/")}` || n.prefix;
}
c(normalizePrivateKeyPath, "normalizePrivateKeyPath");
function resolveSshAuthKind(e) {
  return e.privateKeyPath?.trim()
    ? "private-key"
    : ("password" in e && typeof e.password == "string") ||
        ("passwordCredentialKey" in e && e.passwordCredentialKey?.trim())
      ? "password"
      : "agent";
}
c(resolveSshAuthKind, "resolveSshAuthKind");
function buildSshRemoteHostKey(e) {
  return JSON.stringify([
    "ssh:v1",
    e.host.trim().toLowerCase(),
    e.port ?? 22,
    e.username.trim(),
    resolveSshAuthKind(e),
    normalizePrivateKeyPath(e.privateKeyPath),
  ]);
}
c(buildSshRemoteHostKey, "buildSshRemoteHostKey");
function isRecord(e) {
  return typeof e == "object" && e !== null;
}
c(isRecord, "isRecord");
function normalizeErrorCode(e) {
  if (typeof e == "string" || typeof e == "number" || typeof e == "bigint") return String(e);
}
c(normalizeErrorCode, "normalizeErrorCode");
function getErrorCandidate(e) {
  return !isRecord(e) || !("error" in e) || !isRecord(e.error)
    ? e
    : "message" in e.error || "code" in e.error
      ? e.error
      : e;
}
c(getErrorCandidate, "getErrorCandidate");
var BC = "ZCODE_FILE_LOCK_TIMEOUT";
function stringifyUnknownValue(e) {
  if (typeof e == "string") return e;
  if (e === null) return "null";
  if (e === void 0) return "undefined";
  if (typeof e == "number" || typeof e == "boolean" || typeof e == "bigint") return String(e);
  try {
    let o = JSON.stringify(e);
    if (o !== void 0) return o;
  } catch {}
  return String(e);
}
c(stringifyUnknownValue, "stringifyUnknownValue");
function normalizeUnknownError(e) {
  let o = getErrorCandidate(e);
  if (o instanceof Error) {
    let r = o;
    return { message: o.message || o.name || String(o), code: normalizeErrorCode(r.code) };
  }
  if (isRecord(o)) {
    let r = "code" in o ? normalizeErrorCode(o.code) : void 0,
      a = "message" in o ? stringifyUnknownValue(o.message) : stringifyUnknownValue(o);
    return { message: a !== "undefined" && a.length > 0 ? a : stringifyUnknownValue(o), code: r };
  }
  return { message: stringifyUnknownValue(o) };
}
c(normalizeUnknownError, "normalizeUnknownError");
var t = {};
ke(t, {
  $brand: () => Dn,
  $input: () => Ks,
  $output: () => Gs,
  NEVER: () => Ur,
  TimePrecision: () => Xs,
  ZodAny: () => Bl,
  ZodArray: () => ql,
  ZodBase64: () => sr,
  ZodBase64URL: () => cr,
  ZodBigInt: () => At,
  ZodBigIntFormat: () => ur,
  ZodBoolean: () => Ot,
  ZodCIDRv4: () => ir,
  ZodCIDRv6: () => ar,
  ZodCUID: () => Xo,
  ZodCUID2: () => Qo,
  ZodCatch: () => md,
  ZodCodec: () => vr,
  ZodCustom: () => Cn,
  ZodCustomStringFormat: () => wt,
  ZodDate: () => Sn,
  ZodDefault: () => sd,
  ZodDiscriminatedUnion: () => Gl,
  ZodE164: () => lr,
  ZodEmail: () => Ho,
  ZodEmoji: () => Jo,
  ZodEnum: () => Pt,
  ZodError: () => ov,
  ZodExactOptional: () => rd,
  ZodFile: () => nd,
  ZodFirstPartyTypeKind: () => Cd,
  ZodFunction: () => xd,
  ZodGUID: () => fn,
  ZodIPv4: () => or,
  ZodIPv6: () => rr,
  ZodISODate: () => Wo,
  ZodISODateTime: () => Lo,
  ZodISODuration: () => qo,
  ZodISOTime: () => Fo,
  ZodIntersection: () => Kl,
  ZodIssueCode: () => iv,
  ZodJWT: () => dr,
  ZodKSUID: () => nr,
  ZodLazy: () => vd,
  ZodLiteral: () => td,
  ZodMAC: () => Ml,
  ZodMap: () => Ql,
  ZodNaN: () => fd,
  ZodNanoID: () => Yo,
  ZodNever: () => Wl,
  ZodNonOptional: () => yr,
  ZodNull: () => Zl,
  ZodNullable: () => ad,
  ZodNumber: () => Et,
  ZodNumberFormat: () => Ye,
  ZodObject: () => xn,
  ZodOptional: () => hr,
  ZodPipe: () => br,
  ZodPrefault: () => ld,
  ZodPromise: () => _d,
  ZodReadonly: () => hd,
  ZodRealError: () => ee,
  ZodRecord: () => In,
  ZodSet: () => ed,
  ZodString: () => Tt,
  ZodStringFormat: () => N,
  ZodSuccess: () => pd,
  ZodSymbol: () => Ul,
  ZodTemplateLiteral: () => bd,
  ZodTransform: () => od,
  ZodTuple: () => Jl,
  ZodType: () => E,
  ZodULID: () => er,
  ZodURL: () => vn,
  ZodUUID: () => Se,
  ZodUndefined: () => Nl,
  ZodUnion: () => kn,
  ZodUnknown: () => Ll,
  ZodVoid: () => Fl,
  ZodXID: () => tr,
  ZodXor: () => Vl,
  _ZodString: () => Ko,
  _default: () => cd,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => gd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  clone: () => clone,
  codec: () => codec,
  coerce: () => Rd,
  config: () => config,
  core: () => Re,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Jp,
  decode: () => Pl,
  decodeAsync: () => wl,
  describe: () => vm,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => vp,
  encode: () => Rl,
  encodeAsync: () => Tl,
  endsWith: () => _endsWith,
  enum: () => gr,
  exactOptional: () => exactOptional,
  file: () => file,
  flattenError: () => flattenError,
  float32: () => float32,
  float64: () => float64,
  formatError: () => formatError,
  fromJSONSchema: () => fromJSONSchema,
  function: () => _function,
  getErrorMap: () => getErrorMap,
  globalRegistry: () => q,
  gt: () => _gt,
  gte: () => _gte,
  guid: () => guid,
  hash: () => hash,
  hex: () => hex,
  hostname: () => hostname,
  httpUrl: () => httpUrl,
  includes: () => _includes,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  iso: () => Rt,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => un,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => Sm,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  negative: () => _negative,
  never: () => never,
  nonnegative: () => _nonnegative,
  nonoptional: () => nonoptional,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  null: () => jl,
  nullable: () => nullable,
  nullish: () => dm,
  number: () => number,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => xl,
  parseAsync: () => kl,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  positive: () => _positive,
  prefault: () => prefault,
  preprocess: () => preprocess,
  prettifyError: () => prettifyError,
  promise: () => promise,
  property: () => _property,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  regex: () => _regex,
  regexes: () => de,
  registry: () => registry,
  safeDecode: () => Ol,
  safeDecodeAsync: () => zl,
  safeEncode: () => El,
  safeEncodeAsync: () => Al,
  safeParse: () => Il,
  safeParseAsync: () => Cl,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => xm,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  toJSONSchema: () => toJSONSchema,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  transform: () => transform,
  treeifyError: () => treeifyError,
  trim: () => _trim,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => Gp,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => I,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Hp,
  xid: () => xid,
  xor: () => xor,
});
var Re = {};
ke(Re, {
  $ZodAny: () => ka,
  $ZodArray: () => Ta,
  $ZodAsyncError: () => pe,
  $ZodBase64: () => ma,
  $ZodBase64URL: () => ga,
  $ZodBigInt: () => io,
  $ZodBigIntFormat: () => va,
  $ZodBoolean: () => on,
  $ZodCIDRv4: () => da,
  $ZodCIDRv6: () => ua,
  $ZodCUID: () => Xi,
  $ZodCUID2: () => Qi,
  $ZodCatch: () => Va,
  $ZodCheck: () => Z,
  $ZodCheckBigIntFormat: () => Ti,
  $ZodCheckEndsWith: () => ji,
  $ZodCheckGreaterThan: () => Xn,
  $ZodCheckIncludes: () => Ni,
  $ZodCheckLengthEquals: () => Mi,
  $ZodCheckLessThan: () => Yn,
  $ZodCheckLowerCase: () => Di,
  $ZodCheckMaxLength: () => Ai,
  $ZodCheckMaxSize: () => wi,
  $ZodCheckMimeType: () => Li,
  $ZodCheckMinLength: () => zi,
  $ZodCheckMinSize: () => Ei,
  $ZodCheckMultipleOf: () => Ri,
  $ZodCheckNumberFormat: () => Pi,
  $ZodCheckOverwrite: () => Wi,
  $ZodCheckProperty: () => Bi,
  $ZodCheckRegex: () => $i,
  $ZodCheckSizeEquals: () => Oi,
  $ZodCheckStartsWith: () => Zi,
  $ZodCheckStringFormat: () => dt,
  $ZodCheckUpperCase: () => Ui,
  $ZodCodec: () => an,
  $ZodCustom: () => es,
  $ZodCustomStringFormat: () => ya,
  $ZodDate: () => Pa,
  $ZodDefault: () => La,
  $ZodDiscriminatedUnion: () => Oa,
  $ZodE164: () => fa,
  $ZodEmail: () => Ki,
  $ZodEmoji: () => Ji,
  $ZodEncodeError: () => Oe,
  $ZodEnum: () => Da,
  $ZodError: () => Yt,
  $ZodExactOptional: () => ja,
  $ZodFile: () => Na,
  $ZodFunction: () => Ya,
  $ZodGUID: () => Vi,
  $ZodIPv4: () => sa,
  $ZodIPv6: () => ca,
  $ZodISODate: () => ra,
  $ZodISODateTime: () => oa,
  $ZodISODuration: () => aa,
  $ZodISOTime: () => ia,
  $ZodIntersection: () => Aa,
  $ZodJWT: () => ha,
  $ZodKSUID: () => na,
  $ZodLazy: () => Qa,
  $ZodLiteral: () => Ua,
  $ZodMAC: () => la,
  $ZodMap: () => Ma,
  $ZodNaN: () => Ga,
  $ZodNanoID: () => Yi,
  $ZodNever: () => Ca,
  $ZodNonOptional: () => Fa,
  $ZodNull: () => xa,
  $ZodNullable: () => Ba,
  $ZodNumber: () => ro,
  $ZodNumberFormat: () => ba,
  $ZodObject: () => np,
  $ZodObjectJIT: () => wa,
  $ZodOptional: () => so,
  $ZodPipe: () => Ka,
  $ZodPrefault: () => Wa,
  $ZodPromise: () => Xa,
  $ZodReadonly: () => Ha,
  $ZodRealError: () => Q,
  $ZodRecord: () => za,
  $ZodRegistry: () => co,
  $ZodSet: () => $a,
  $ZodString: () => Ve,
  $ZodStringFormat: () => U,
  $ZodSuccess: () => qa,
  $ZodSymbol: () => Sa,
  $ZodTemplateLiteral: () => Ja,
  $ZodTransform: () => Za,
  $ZodTuple: () => ao,
  $ZodType: () => w,
  $ZodULID: () => ea,
  $ZodURL: () => Hi,
  $ZodUUID: () => Gi,
  $ZodUndefined: () => _a,
  $ZodUnion: () => rn,
  $ZodUnknown: () => Ia,
  $ZodVoid: () => Ra,
  $ZodXID: () => ta,
  $ZodXor: () => Ea,
  $brand: () => Dn,
  $constructor: () => $constructor,
  $input: () => Ks,
  $output: () => Gs,
  Doc: () => nn,
  JSONSchema: () => lp,
  JSONSchemaGenerator: () => jo,
  NEVER: () => Ur,
  TimePrecision: () => Xs,
  _any: () => _any,
  _array: () => _array,
  _base64: () => _base64,
  _base64url: () => _base64url,
  _bigint: () => _bigint,
  _boolean: () => _boolean,
  _catch: () => _catch,
  _check: () => _check,
  _cidrv4: () => _cidrv4,
  _cidrv6: () => _cidrv6,
  _coercedBigint: () => _coercedBigint,
  _coercedBoolean: () => _coercedBoolean,
  _coercedDate: () => _coercedDate,
  _coercedNumber: () => _coercedNumber,
  _coercedString: () => _coercedString,
  _cuid: () => _cuid,
  _cuid2: () => _cuid2,
  _custom: () => _custom,
  _date: () => _date,
  _decode: () => Ln,
  _decodeAsync: () => Fn,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji,
  _encode: () => Bn,
  _encodeAsync: () => Wn,
  _endsWith: () => _endsWith,
  _enum: () => _enum,
  _file: () => _file,
  _float32: () => _float32,
  _float64: () => _float64,
  _gt: () => _gt,
  _gte: () => _gte,
  _guid: () => _guid,
  _includes: () => _includes,
  _int: () => _int,
  _int32: () => _int32,
  _int64: () => _int64,
  _intersection: () => _intersection,
  _ipv4: () => _ipv4,
  _ipv6: () => _ipv6,
  _isoDate: () => _isoDate,
  _isoDateTime: () => _isoDateTime,
  _isoDuration: () => _isoDuration,
  _isoTime: () => _isoTime,
  _jwt: () => _jwt,
  _ksuid: () => _ksuid,
  _lazy: () => _lazy,
  _length: () => _length,
  _literal: () => _literal,
  _lowercase: () => _lowercase,
  _lt: () => _lt,
  _lte: () => _lte,
  _mac: () => _mac,
  _map: () => _map,
  _max: () => _lte,
  _maxLength: () => _maxLength,
  _maxSize: () => _maxSize,
  _mime: () => _mime,
  _min: () => _gte,
  _minLength: () => _minLength,
  _minSize: () => _minSize,
  _multipleOf: () => _multipleOf,
  _nan: () => _nan,
  _nanoid: () => _nanoid,
  _nativeEnum: () => _nativeEnum,
  _negative: () => _negative,
  _never: () => _never,
  _nonnegative: () => _nonnegative,
  _nonoptional: () => _nonoptional,
  _nonpositive: () => _nonpositive,
  _normalize: () => _normalize,
  _null: () => _null,
  _nullable: () => _nullable,
  _number: () => _number,
  _optional: () => _optional,
  _overwrite: () => _overwrite,
  _parse: () => at,
  _parseAsync: () => st,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => Vn,
  _safeDecodeAsync: () => Kn,
  _safeEncode: () => qn,
  _safeEncodeAsync: () => Gn,
  _safeParse: () => ct,
  _safeParseAsync: () => lt,
  _set: () => _set,
  _size: () => _size,
  _slugify: () => _slugify,
  _startsWith: () => _startsWith,
  _string: () => _string,
  _stringFormat: () => _stringFormat,
  _stringbool: () => _stringbool,
  _success: () => _success,
  _superRefine: () => _superRefine,
  _symbol: () => _symbol,
  _templateLiteral: () => _templateLiteral,
  _toLowerCase: () => _toLowerCase,
  _toUpperCase: () => _toUpperCase,
  _transform: () => _transform,
  _trim: () => _trim,
  _tuple: () => _tuple,
  _uint32: () => _uint32,
  _uint64: () => _uint64,
  _ulid: () => _ulid,
  _undefined: () => _undefined,
  _union: () => _union,
  _unknown: () => _unknown,
  _uppercase: () => _uppercase,
  _url: () => _url,
  _uuid: () => _uuid,
  _uuidv4: () => _uuidv4,
  _uuidv6: () => _uuidv6,
  _uuidv7: () => _uuidv7,
  _void: () => _void,
  _xid: () => _xid,
  _xor: () => _xor,
  clone: () => clone,
  config: () => config,
  createStandardJSONSchemaMethod: () => Ct,
  createToJSONSchemaMethod: () => Mc,
  decode: () => oy,
  decodeAsync: () => iy,
  describe: () => describe,
  encode: () => ny,
  encodeAsync: () => ry,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => Ft,
  globalRegistry: () => q,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => un,
  meta: () => meta,
  parse: () => Zn,
  parseAsync: () => jn,
  prettifyError: () => prettifyError,
  process: () => D,
  regexes: () => de,
  registry: () => registry,
  safeDecode: () => sy,
  safeDecodeAsync: () => ly,
  safeEncode: () => ay,
  safeEncodeAsync: () => cy,
  safeParse: () => Jr,
  safeParseAsync: () => Yr,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => I,
  version: () => Fi,
});
var Ur = Object.freeze({ status: "aborted" });
function $constructor(e, o, r) {
  function init(l, p) {
    if (
      (l._zod ||
        Object.defineProperty(l, "_zod", {
          value: { def: p, constr: _, traits: new Set() },
          enumerable: !1,
        }),
      l._zod.traits.has(e))
    )
      return;
    (l._zod.traits.add(e), o(l, p));
    let u = _.prototype,
      h = Object.keys(u);
    for (let b = 0; b < h.length; b++) {
      let S = h[b];
      S in l || (l[S] = u[S].bind(l));
    }
  }
  c(init, "init");
  let n = r?.Parent ?? Object;
  class i extends n {
    static {
      c(this, "Definition");
    }
  }
  Object.defineProperty(i, "name", { value: e });
  function _(l) {
    var p;
    let u = r?.Parent ? new i() : this;
    (init(u, l), (p = u._zod).deferred ?? (p.deferred = []));
    for (let h of u._zod.deferred) h();
    return u;
  }
  return (
    c(_, "_"),
    Object.defineProperty(_, "init", { value: init }),
    Object.defineProperty(_, Symbol.hasInstance, {
      value: c((l) => (r?.Parent && l instanceof r.Parent ? !0 : l?._zod?.traits?.has(e)), "value"),
    }),
    Object.defineProperty(_, "name", { value: e }),
    _
  );
}
c($constructor, "$constructor");
var Dn = Symbol("zod_brand"),
  pe = class extends Error {
    static {
      c(this, "$ZodAsyncError");
    }
    constructor() {
      super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
    }
  },
  Oe = class extends Error {
    static {
      c(this, "$ZodEncodeError");
    }
    constructor(o) {
      (super(`Encountered unidirectional transform during encode: ${o}`),
        (this.name = "ZodEncodeError"));
    }
  },
  Ft = {};
function config(e) {
  return (e && Object.assign(Ft, e), Ft);
}
c(config, "config");
var I = {};
ke(I, {
  BIGINT_FORMAT_RANGES: () => Gr,
  Class: () => Zr,
  NUMBER_FORMAT_RANGES: () => Vr,
  aborted: () => aborted,
  allowsEval: () => Lr,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => Nn,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => Bh,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => Fr,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => Kt,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage,
});
function assertEqual(e) {
  return e;
}
c(assertEqual, "assertEqual");
function assertNotEqual(e) {
  return e;
}
c(assertNotEqual, "assertNotEqual");
function assertIs(e) {}
c(assertIs, "assertIs");
function assertNever(e) {
  throw new Error("Unexpected value in exhaustive check");
}
c(assertNever, "assertNever");
function assert(e) {}
c(assert, "assert");
function getEnumValues(e) {
  let o = Object.values(e).filter((a) => typeof a == "number");
  return Object.entries(e)
    .filter(([a, n]) => o.indexOf(+a) === -1)
    .map(([a, n]) => n);
}
c(getEnumValues, "getEnumValues");
function joinValues(e, o = "|") {
  return e.map((r) => stringifyPrimitive(r)).join(o);
}
c(joinValues, "joinValues");
function jsonStringifyReplacer(e, o) {
  return typeof o == "bigint" ? o.toString() : o;
}
c(jsonStringifyReplacer, "jsonStringifyReplacer");
function cached(e) {
  return {
    get value() {
      {
        let r = e();
        return (Object.defineProperty(this, "value", { value: r }), r);
      }
      throw new Error("cached value already set");
    },
  };
}
c(cached, "cached");
function nullish(e) {
  return e == null;
}
c(nullish, "nullish");
function cleanRegex(e) {
  let o = e.startsWith("^") ? 1 : 0,
    r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(o, r);
}
c(cleanRegex, "cleanRegex");
function floatSafeRemainder(e, o) {
  let r = (e.toString().split(".")[1] || "").length,
    a = o.toString(),
    n = (a.split(".")[1] || "").length;
  if (n === 0 && /\d?e-\d?/.test(a)) {
    let p = a.match(/\d?e-(\d?)/);
    p?.[1] && (n = Number.parseInt(p[1]));
  }
  let i = r > n ? r : n,
    s = Number.parseInt(e.toFixed(i).replace(".", "")),
    l = Number.parseInt(o.toFixed(i).replace(".", ""));
  return (s % l) / 10 ** i;
}
c(floatSafeRemainder, "floatSafeRemainder");
var Eu = Symbol("evaluating");
function defineLazy(e, o, r) {
  let a;
  Object.defineProperty(e, o, {
    get() {
      if (a !== Eu) return (a === void 0 && ((a = Eu), (a = r())), a);
    },
    set(n) {
      Object.defineProperty(e, o, { value: n });
    },
    configurable: !0,
  });
}
c(defineLazy, "defineLazy");
function objectClone(e) {
  return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
c(objectClone, "objectClone");
function assignProp(e, o, r) {
  Object.defineProperty(e, o, { value: r, writable: !0, enumerable: !0, configurable: !0 });
}
c(assignProp, "assignProp");
function mergeDefs(...e) {
  let o = {};
  for (let r of e) {
    let a = Object.getOwnPropertyDescriptors(r);
    Object.assign(o, a);
  }
  return Object.defineProperties({}, o);
}
c(mergeDefs, "mergeDefs");
function cloneDef(e) {
  return mergeDefs(e._zod.def);
}
c(cloneDef, "cloneDef");
function getElementAtPath(e, o) {
  return o ? o.reduce((r, a) => r?.[a], e) : e;
}
c(getElementAtPath, "getElementAtPath");
function promiseAllObject(e) {
  let o = Object.keys(e),
    r = o.map((a) => e[a]);
  return Promise.all(r).then((a) => {
    let n = {};
    for (let i = 0; i < o.length; i++) n[o[i]] = a[i];
    return n;
  });
}
c(promiseAllObject, "promiseAllObject");
function randomString(e = 10) {
  let o = "abcdefghijklmnopqrstuvwxyz",
    r = "";
  for (let a = 0; a < e; a++) r += o[Math.floor(Math.random() * o.length)];
  return r;
}
c(randomString, "randomString");
function esc(e) {
  return JSON.stringify(e);
}
c(esc, "esc");
function slugify(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
c(slugify, "slugify");
var Nn = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function isObject(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
c(isObject, "isObject");
var Lr = cached(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
  try {
    let e = Function;
    return (new e(""), !0);
  } catch {
    return !1;
  }
});
function isPlainObject(e) {
  if (isObject(e) === !1) return !1;
  let o = e.constructor;
  if (o === void 0 || typeof o != "function") return !0;
  let r = o.prototype;
  return !(isObject(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
c(isPlainObject, "isPlainObject");
function shallowClone(e) {
  return isPlainObject(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
c(shallowClone, "shallowClone");
function numKeys(e) {
  let o = 0;
  for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && o++;
  return o;
}
c(numKeys, "numKeys");
var Bh = c((e) => {
    let o = typeof e;
    switch (o) {
      case "undefined":
        return "undefined";
      case "string":
        return "string";
      case "number":
        return Number.isNaN(e) ? "nan" : "number";
      case "boolean":
        return "boolean";
      case "function":
        return "function";
      case "bigint":
        return "bigint";
      case "symbol":
        return "symbol";
      case "object":
        return Array.isArray(e)
          ? "array"
          : e === null
            ? "null"
            : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function"
              ? "promise"
              : typeof Map < "u" && e instanceof Map
                ? "map"
                : typeof Set < "u" && e instanceof Set
                  ? "set"
                  : typeof Date < "u" && e instanceof Date
                    ? "date"
                    : typeof File < "u" && e instanceof File
                      ? "file"
                      : "object";
      default:
        throw new Error(`Unknown data type: ${o}`);
    }
  }, "getParsedType"),
  Kt = new Set(["string", "number", "symbol"]),
  Fr = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
c(escapeRegex, "escapeRegex");
function clone(e, o, r) {
  let a = new e._zod.constr(o ?? e._zod.def);
  return ((!o || r?.parent) && (a._zod.parent = e), a);
}
c(clone, "clone");
function normalizeParams(e) {
  let o = e;
  if (!o) return {};
  if (typeof o == "string") return { error: c(() => o, "error") };
  if (o?.message !== void 0) {
    if (o?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    o.error = o.message;
  }
  return (
    delete o.message,
    typeof o.error == "string" ? { ...o, error: c(() => o.error, "error") } : o
  );
}
c(normalizeParams, "normalizeParams");
function createTransparentProxy(e) {
  let o;
  return new Proxy(
    {},
    {
      get(r, a, n) {
        return (o ?? (o = e()), Reflect.get(o, a, n));
      },
      set(r, a, n, i) {
        return (o ?? (o = e()), Reflect.set(o, a, n, i));
      },
      has(r, a) {
        return (o ?? (o = e()), Reflect.has(o, a));
      },
      deleteProperty(r, a) {
        return (o ?? (o = e()), Reflect.deleteProperty(o, a));
      },
      ownKeys(r) {
        return (o ?? (o = e()), Reflect.ownKeys(o));
      },
      getOwnPropertyDescriptor(r, a) {
        return (o ?? (o = e()), Reflect.getOwnPropertyDescriptor(o, a));
      },
      defineProperty(r, a, n) {
        return (o ?? (o = e()), Reflect.defineProperty(o, a, n));
      },
    },
  );
}
c(createTransparentProxy, "createTransparentProxy");
function stringifyPrimitive(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
c(stringifyPrimitive, "stringifyPrimitive");
function optionalKeys(e) {
  return Object.keys(e).filter(
    (o) => e[o]._zod.optin === "optional" && e[o]._zod.optout === "optional",
  );
}
c(optionalKeys, "optionalKeys");
var Vr = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
  },
  Gr = {
    int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
    uint64: [BigInt(0), BigInt("18446744073709551615")],
  };
function pick(e, o) {
  let r = e._zod.def,
    a = r.checks;
  if (a && a.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let s = {};
      for (let l in o) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        o[l] && (s[l] = r.shape[l]);
      }
      return (assignProp(this, "shape", s), s);
    },
    checks: [],
  });
  return clone(e, i);
}
c(pick, "pick");
function omit(e, o) {
  let r = e._zod.def,
    a = r.checks;
  if (a && a.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  let i = mergeDefs(e._zod.def, {
    get shape() {
      let s = { ...e._zod.def.shape };
      for (let l in o) {
        if (!(l in r.shape)) throw new Error(`Unrecognized key: "${l}"`);
        o[l] && delete s[l];
      }
      return (assignProp(this, "shape", s), s);
    },
    checks: [],
  });
  return clone(e, i);
}
c(omit, "omit");
function extend(e, o) {
  if (!isPlainObject(o)) throw new Error("Invalid input to extend: expected a plain object");
  let r = e._zod.def.checks;
  if (r && r.length > 0) {
    let i = e._zod.def.shape;
    for (let s in o)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  let n = mergeDefs(e._zod.def, {
    get shape() {
      let i = { ...e._zod.def.shape, ...o };
      return (assignProp(this, "shape", i), i);
    },
  });
  return clone(e, n);
}
c(extend, "extend");
function safeExtend(e, o) {
  if (!isPlainObject(o)) throw new Error("Invalid input to safeExtend: expected a plain object");
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...o };
      return (assignProp(this, "shape", a), a);
    },
  });
  return clone(e, r);
}
c(safeExtend, "safeExtend");
function merge(e, o) {
  let r = mergeDefs(e._zod.def, {
    get shape() {
      let a = { ...e._zod.def.shape, ...o._zod.def.shape };
      return (assignProp(this, "shape", a), a);
    },
    get catchall() {
      return o._zod.def.catchall;
    },
    checks: [],
  });
  return clone(e, r);
}
c(merge, "merge");
function partial(e, o, r) {
  let n = o._zod.def.checks;
  if (n && n.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  let s = mergeDefs(o._zod.def, {
    get shape() {
      let l = o._zod.def.shape,
        p = { ...l };
      if (r)
        for (let u in r) {
          if (!(u in l)) throw new Error(`Unrecognized key: "${u}"`);
          r[u] && (p[u] = e ? new e({ type: "optional", innerType: l[u] }) : l[u]);
        }
      else for (let u in l) p[u] = e ? new e({ type: "optional", innerType: l[u] }) : l[u];
      return (assignProp(this, "shape", p), p);
    },
    checks: [],
  });
  return clone(o, s);
}
c(partial, "partial");
function required(e, o, r) {
  let a = mergeDefs(o._zod.def, {
    get shape() {
      let n = o._zod.def.shape,
        i = { ...n };
      if (r)
        for (let s in r) {
          if (!(s in i)) throw new Error(`Unrecognized key: "${s}"`);
          r[s] && (i[s] = new e({ type: "nonoptional", innerType: n[s] }));
        }
      else for (let s in n) i[s] = new e({ type: "nonoptional", innerType: n[s] });
      return (assignProp(this, "shape", i), i);
    },
  });
  return clone(o, a);
}
c(required, "required");
function aborted(e, o = 0) {
  if (e.aborted === !0) return !0;
  for (let r = o; r < e.issues.length; r++) if (e.issues[r]?.continue !== !0) return !0;
  return !1;
}
c(aborted, "aborted");
function prefixIssues(e, o) {
  return o.map((r) => {
    var a;
    return ((a = r).path ?? (a.path = []), r.path.unshift(e), r);
  });
}
c(prefixIssues, "prefixIssues");
function unwrapMessage(e) {
  return typeof e == "string" ? e : e?.message;
}
c(unwrapMessage, "unwrapMessage");
function finalizeIssue(e, o, r) {
  let a = { ...e, path: e.path ?? [] };
  if (!e.message) {
    let n =
      unwrapMessage(e.inst?._zod.def?.error?.(e)) ??
      unwrapMessage(o?.error?.(e)) ??
      unwrapMessage(r.customError?.(e)) ??
      unwrapMessage(r.localeError?.(e)) ??
      "Invalid input";
    a.message = n;
  }
  return (delete a.inst, delete a.continue, o?.reportInput || delete a.input, a);
}
c(finalizeIssue, "finalizeIssue");
function getSizableOrigin(e) {
  return e instanceof Set
    ? "set"
    : e instanceof Map
      ? "map"
      : e instanceof File
        ? "file"
        : "unknown";
}
c(getSizableOrigin, "getSizableOrigin");
function getLengthableOrigin(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
c(getLengthableOrigin, "getLengthableOrigin");
function parsedType(e) {
  let o = typeof e;
  switch (o) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null) return "null";
      if (Array.isArray(e)) return "array";
      let r = e;
      if (r && Object.getPrototypeOf(r) !== Object.prototype && "constructor" in r && r.constructor)
        return r.constructor.name;
    }
  }
  return o;
}
c(parsedType, "parsedType");
function issue(...e) {
  let [o, r, a] = e;
  return typeof o == "string" ? { message: o, code: "custom", input: r, inst: a } : { ...o };
}
c(issue, "issue");
function cleanEnum(e) {
  return Object.entries(e)
    .filter(([o, r]) => Number.isNaN(Number.parseInt(o, 10)))
    .map((o) => o[1]);
}
c(cleanEnum, "cleanEnum");
function base64ToUint8Array(e) {
  let o = atob(e),
    r = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) r[a] = o.charCodeAt(a);
  return r;
}
c(base64ToUint8Array, "base64ToUint8Array");
function uint8ArrayToBase64(e) {
  let o = "";
  for (let r = 0; r < e.length; r++) o += String.fromCharCode(e[r]);
  return btoa(o);
}
c(uint8ArrayToBase64, "uint8ArrayToBase64");
function base64urlToUint8Array(e) {
  let o = e.replace(/-/g, "+").replace(/_/g, "/"),
    r = "=".repeat((4 - (o.length % 4)) % 4);
  return base64ToUint8Array(o + r);
}
c(base64urlToUint8Array, "base64urlToUint8Array");
function uint8ArrayToBase64url(e) {
  return uint8ArrayToBase64(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
c(uint8ArrayToBase64url, "uint8ArrayToBase64url");
function hexToUint8Array(e) {
  let o = e.replace(/^0x/, "");
  if (o.length % 2 !== 0) throw new Error("Invalid hex string length");
  let r = new Uint8Array(o.length / 2);
  for (let a = 0; a < o.length; a += 2) r[a / 2] = Number.parseInt(o.slice(a, a + 2), 16);
  return r;
}
c(hexToUint8Array, "hexToUint8Array");
function uint8ArrayToHex(e) {
  return Array.from(e)
    .map((o) => o.toString(16).padStart(2, "0"))
    .join("");
}
c(uint8ArrayToHex, "uint8ArrayToHex");
var Zr = class {
  static {
    c(this, "Class");
  }
  constructor(...o) {}
};
var zu = c((e, o) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: o, enumerable: !1 }),
      (e.message = JSON.stringify(o, jsonStringifyReplacer, 2)),
      Object.defineProperty(e, "toString", { value: c(() => e.message, "value"), enumerable: !1 }));
  }, "initializer"),
  Yt = $constructor("$ZodError", zu),
  Q = $constructor("$ZodError", zu, { Parent: Error });
function flattenError(e, o = (r) => r.message) {
  let r = {},
    a = [];
  for (let n of e.issues)
    n.path.length > 0
      ? ((r[n.path[0]] = r[n.path[0]] || []), r[n.path[0]].push(o(n)))
      : a.push(o(n));
  return { formErrors: a, fieldErrors: r };
}
c(flattenError, "flattenError");
function formatError(e, o = (r) => r.message) {
  let r = { _errors: [] },
    a = c((n) => {
      for (let i of n.issues)
        if (i.code === "invalid_union" && i.errors.length) i.errors.map((s) => a({ issues: s }));
        else if (i.code === "invalid_key") a({ issues: i.issues });
        else if (i.code === "invalid_element") a({ issues: i.issues });
        else if (i.path.length === 0) r._errors.push(o(i));
        else {
          let s = r,
            l = 0;
          for (; l < i.path.length;) {
            let p = i.path[l];
            (l === i.path.length - 1
              ? ((s[p] = s[p] || { _errors: [] }), s[p]._errors.push(o(i)))
              : (s[p] = s[p] || { _errors: [] }),
              (s = s[p]),
              l++);
          }
        }
    }, "processError");
  return (a(e), r);
}
c(formatError, "formatError");
function treeifyError(e, o = (r) => r.message) {
  let r = { errors: [] },
    a = c((n, i = []) => {
      var s, l;
      for (let p of n.issues)
        if (p.code === "invalid_union" && p.errors.length)
          p.errors.map((u) => a({ issues: u }, p.path));
        else if (p.code === "invalid_key") a({ issues: p.issues }, p.path);
        else if (p.code === "invalid_element") a({ issues: p.issues }, p.path);
        else {
          let u = [...i, ...p.path];
          if (u.length === 0) {
            r.errors.push(o(p));
            continue;
          }
          let h = r,
            b = 0;
          for (; b < u.length;) {
            let S = u[b],
              _ = b === u.length - 1;
            (typeof S == "string"
              ? (h.properties ?? (h.properties = {}),
                (s = h.properties)[S] ?? (s[S] = { errors: [] }),
                (h = h.properties[S]))
              : (h.items ?? (h.items = []),
                (l = h.items)[S] ?? (l[S] = { errors: [] }),
                (h = h.items[S])),
              _ && h.errors.push(o(p)),
              b++);
          }
        }
    }, "processError");
  return (a(e), r);
}
c(treeifyError, "treeifyError");
function toDotPath(e) {
  let o = [],
    r = e.map((a) => (typeof a == "object" ? a.key : a));
  for (let a of r)
    typeof a == "number"
      ? o.push(`[${a}]`)
      : typeof a == "symbol"
        ? o.push(`[${JSON.stringify(String(a))}]`)
        : /[^\w$]/.test(a)
          ? o.push(`[${JSON.stringify(a)}]`)
          : (o.length && o.push("."), o.push(a));
  return o.join("");
}
c(toDotPath, "toDotPath");
function prettifyError(e) {
  let o = [],
    r = [...e.issues].sort((a, n) => (a.path ?? []).length - (n.path ?? []).length);
  for (let a of r)
    (o.push(`\u2716 ${a.message}`), a.path?.length && o.push(`  \u2192 at ${toDotPath(a.path)}`));
  return o.join(`
`);
}
c(prettifyError, "prettifyError");
var at = c(
    (e) => (o, r, a, n) => {
      let i = a ? Object.assign(a, { async: !1 }) : { async: !1 },
        s = o._zod.run({ value: r, issues: [] }, i);
      if (s instanceof Promise) throw new pe();
      if (s.issues.length) {
        let l = new (n?.Err ?? e)(s.issues.map((p) => finalizeIssue(p, i, config())));
        throw (Nn(l, n?.callee), l);
      }
      return s.value;
    },
    "_parse",
  ),
  Zn = at(Q),
  st = c(
    (e) => async (o, r, a, n) => {
      let i = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        s = o._zod.run({ value: r, issues: [] }, i);
      if ((s instanceof Promise && (s = await s), s.issues.length)) {
        let l = new (n?.Err ?? e)(s.issues.map((p) => finalizeIssue(p, i, config())));
        throw (Nn(l, n?.callee), l);
      }
      return s.value;
    },
    "_parseAsync",
  ),
  jn = st(Q),
  ct = c(
    (e) => (o, r, a) => {
      let n = a ? { ...a, async: !1 } : { async: !1 },
        i = o._zod.run({ value: r, issues: [] }, n);
      if (i instanceof Promise) throw new pe();
      return i.issues.length
        ? { success: !1, error: new (e ?? Yt)(i.issues.map((s) => finalizeIssue(s, n, config()))) }
        : { success: !0, data: i.value };
    },
    "_safeParse",
  ),
  Jr = ct(Q),
  lt = c(
    (e) => async (o, r, a) => {
      let n = a ? Object.assign(a, { async: !0 }) : { async: !0 },
        i = o._zod.run({ value: r, issues: [] }, n);
      return (
        i instanceof Promise && (i = await i),
        i.issues.length
          ? { success: !1, error: new e(i.issues.map((s) => finalizeIssue(s, n, config()))) }
          : { success: !0, data: i.value }
      );
    },
    "_safeParseAsync",
  ),
  Yr = lt(Q),
  Bn = c(
    (e) => (o, r, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return at(e)(o, r, n);
    },
    "_encode",
  ),
  ny = Bn(Q),
  Ln = c((e) => (o, r, a) => at(e)(o, r, a), "_decode"),
  oy = Ln(Q),
  Wn = c(
    (e) => async (o, r, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return st(e)(o, r, n);
    },
    "_encodeAsync",
  ),
  ry = Wn(Q),
  Fn = c((e) => async (o, r, a) => st(e)(o, r, a), "_decodeAsync"),
  iy = Fn(Q),
  qn = c(
    (e) => (o, r, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return ct(e)(o, r, n);
    },
    "_safeEncode",
  ),
  ay = qn(Q),
  Vn = c((e) => (o, r, a) => ct(e)(o, r, a), "_safeDecode"),
  sy = Vn(Q),
  Gn = c(
    (e) => async (o, r, a) => {
      let n = a ? Object.assign(a, { direction: "backward" }) : { direction: "backward" };
      return lt(e)(o, r, n);
    },
    "_safeEncodeAsync",
  ),
  cy = Gn(Q),
  Kn = c((e) => async (o, r, a) => lt(e)(o, r, a), "_safeDecodeAsync"),
  ly = Kn(Q);
var de = {};
ke(de, {
  base64: () => mi,
  base64url: () => Hn,
  bigint: () => vi,
  boolean: () => _i,
  browserEmail: () => yy,
  cidrv4: () => ui,
  cidrv6: () => pi,
  cuid: () => Xr,
  cuid2: () => Qr,
  date: () => fi,
  datetime: () => datetime,
  domain: () => Sy,
  duration: () => ri,
  e164: () => gi,
  email: () => ai,
  emoji: () => emoji,
  extendedDuration: () => dy,
  guid: () => ii,
  hex: () => _y,
  hostname: () => vy,
  html5Email: () => gy,
  idnEmail: () => hy,
  integer: () => Si,
  ipv4: () => ci,
  ipv6: () => li,
  ksuid: () => ni,
  lowercase: () => Ii,
  mac: () => di,
  md5_base64: () => ky,
  md5_base64url: () => Iy,
  md5_hex: () => xy,
  nanoid: () => oi,
  null: () => xi,
  number: () => Jn,
  rfc5322Email: () => fy,
  sha1_base64: () => Ry,
  sha1_base64url: () => Py,
  sha1_hex: () => Cy,
  sha256_base64: () => wy,
  sha256_base64url: () => Ey,
  sha256_hex: () => Ty,
  sha384_base64: () => Ay,
  sha384_base64url: () => zy,
  sha384_hex: () => Oy,
  sha512_base64: () => $y,
  sha512_base64url: () => Dy,
  sha512_hex: () => My,
  string: () => bi,
  time: () => time,
  ulid: () => ei,
  undefined: () => ki,
  unicodeEmail: () => $u,
  uppercase: () => Ci,
  uuid: () => qe,
  uuid4: () => uy,
  uuid6: () => py,
  uuid7: () => my,
  xid: () => ti,
});
var Xr = /^[cC][^\s-]{8,}$/,
  Qr = /^[0-9a-z]+$/,
  ei = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  ti = /^[0-9a-vA-V]{20}$/,
  ni = /^[A-Za-z0-9]{27}$/,
  oi = /^[a-zA-Z0-9_-]{21}$/,
  ri =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  dy =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  ii = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  qe = c(
    (e) =>
      e
        ? new RegExp(
            `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
          )
        : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
    "uuid",
  ),
  uy = qe(4),
  py = qe(6),
  my = qe(7),
  ai =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  gy =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  fy =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  $u = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u,
  hy = $u,
  yy =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  by = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(by, "u");
}
c(emoji, "emoji");
var ci =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  li =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  di = c((e) => {
    let o = escapeRegex(e ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${o}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${o}){5}[0-9a-f]{2}$`);
  }, "mac"),
  ui =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  pi =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  mi = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  Hn = /^[A-Za-z0-9_-]*$/,
  vy =
    /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,
  Sy = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  gi = /^\+[1-9]\d{6,14}$/,
  Du =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  fi = new RegExp(`^${Du}$`);
function timeSource(e) {
  let o = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${o}`
      : e.precision === 0
        ? `${o}:[0-5]\\d`
        : `${o}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${o}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
c(timeSource, "timeSource");
function time(e) {
  return new RegExp(`^${timeSource(e)}$`);
}
c(time, "time");
function datetime(e) {
  let o = timeSource({ precision: e.precision }),
    r = ["Z"];
  (e.local && r.push(""), e.offset && r.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  let a = `${o}(?:${r.join("|")})`;
  return new RegExp(`^${Du}T(?:${a})$`);
}
c(datetime, "datetime");
var bi = c((e) => {
    let o = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
    return new RegExp(`^${o}$`);
  }, "string"),
  vi = /^-?\d+n?$/,
  Si = /^-?\d+$/,
  Jn = /^-?\d+(?:\.\d+)?$/,
  _i = /^(?:true|false)$/i,
  xi = /^null$/i;
var ki = /^undefined$/i;
var Ii = /^[^A-Z]*$/,
  Ci = /^[^a-z]*$/,
  _y = /^[0-9a-fA-F]*$/;
function fixedBase64(e, o) {
  return new RegExp(`^[A-Za-z0-9+/]{${e}}${o}$`);
}
c(fixedBase64, "fixedBase64");
function fixedBase64url(e) {
  return new RegExp(`^[A-Za-z0-9_-]{${e}}$`);
}
c(fixedBase64url, "fixedBase64url");
var xy = /^[0-9a-fA-F]{32}$/,
  ky = fixedBase64(22, "=="),
  Iy = fixedBase64url(22),
  Cy = /^[0-9a-fA-F]{40}$/,
  Ry = fixedBase64(27, "="),
  Py = fixedBase64url(27),
  Ty = /^[0-9a-fA-F]{64}$/,
  wy = fixedBase64(43, "="),
  Ey = fixedBase64url(43),
  Oy = /^[0-9a-fA-F]{96}$/,
  Ay = fixedBase64(64, ""),
  zy = fixedBase64url(64),
  My = /^[0-9a-fA-F]{128}$/,
  $y = fixedBase64(86, "=="),
  Dy = fixedBase64url(86);
var Z = $constructor("$ZodCheck", (e, o) => {
    var r;
    (e._zod ?? (e._zod = {}), (e._zod.def = o), (r = e._zod).onattach ?? (r.onattach = []));
  }),
  Zu = { number: "number", bigint: "bigint", object: "date" },
  Yn = $constructor("$ZodCheckLessThan", (e, o) => {
    Z.init(e, o);
    let r = Zu[typeof o.value];
    (e._zod.onattach.push((a) => {
      let n = a._zod.bag,
        i = (o.inclusive ? n.maximum : n.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      o.value < i && (o.inclusive ? (n.maximum = o.value) : (n.exclusiveMaximum = o.value));
    }),
      (e._zod.check = (a) => {
        (o.inclusive ? a.value <= o.value : a.value < o.value) ||
          a.issues.push({
            origin: r,
            code: "too_big",
            maximum: typeof o.value == "object" ? o.value.getTime() : o.value,
            input: a.value,
            inclusive: o.inclusive,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Xn = $constructor("$ZodCheckGreaterThan", (e, o) => {
    Z.init(e, o);
    let r = Zu[typeof o.value];
    (e._zod.onattach.push((a) => {
      let n = a._zod.bag,
        i = (o.inclusive ? n.minimum : n.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      o.value > i && (o.inclusive ? (n.minimum = o.value) : (n.exclusiveMinimum = o.value));
    }),
      (e._zod.check = (a) => {
        (o.inclusive ? a.value >= o.value : a.value > o.value) ||
          a.issues.push({
            origin: r,
            code: "too_small",
            minimum: typeof o.value == "object" ? o.value.getTime() : o.value,
            input: a.value,
            inclusive: o.inclusive,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Ri = $constructor("$ZodCheckMultipleOf", (e, o) => {
    (Z.init(e, o),
      e._zod.onattach.push((r) => {
        var a;
        (a = r._zod.bag).multipleOf ?? (a.multipleOf = o.value);
      }),
      (e._zod.check = (r) => {
        if (typeof r.value != typeof o.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof r.value == "bigint"
          ? r.value % o.value === BigInt(0)
          : floatSafeRemainder(r.value, o.value) === 0) ||
          r.issues.push({
            origin: typeof r.value,
            code: "not_multiple_of",
            divisor: o.value,
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Pi = $constructor("$ZodCheckNumberFormat", (e, o) => {
    (Z.init(e, o), (o.format = o.format || "float64"));
    let r = o.format?.includes("int"),
      a = r ? "int" : "number",
      [n, i] = Vr[o.format];
    (e._zod.onattach.push((s) => {
      let l = s._zod.bag;
      ((l.format = o.format), (l.minimum = n), (l.maximum = i), r && (l.pattern = Si));
    }),
      (e._zod.check = (s) => {
        let l = s.value;
        if (r) {
          if (!Number.isInteger(l)) {
            s.issues.push({
              expected: a,
              format: o.format,
              code: "invalid_type",
              continue: !1,
              input: l,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(l)) {
            l > 0
              ? s.issues.push({
                  input: l,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: a,
                  inclusive: !0,
                  continue: !o.abort,
                })
              : s.issues.push({
                  input: l,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: a,
                  inclusive: !0,
                  continue: !o.abort,
                });
            return;
          }
        }
        (l < n &&
          s.issues.push({
            origin: "number",
            input: l,
            code: "too_small",
            minimum: n,
            inclusive: !0,
            inst: e,
            continue: !o.abort,
          }),
          l > i &&
            s.issues.push({
              origin: "number",
              input: l,
              code: "too_big",
              maximum: i,
              inclusive: !0,
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  Ti = $constructor("$ZodCheckBigIntFormat", (e, o) => {
    Z.init(e, o);
    let [r, a] = Gr[o.format];
    (e._zod.onattach.push((n) => {
      let i = n._zod.bag;
      ((i.format = o.format), (i.minimum = r), (i.maximum = a));
    }),
      (e._zod.check = (n) => {
        let i = n.value;
        (i < r &&
          n.issues.push({
            origin: "bigint",
            input: i,
            code: "too_small",
            minimum: r,
            inclusive: !0,
            inst: e,
            continue: !o.abort,
          }),
          i > a &&
            n.issues.push({
              origin: "bigint",
              input: i,
              code: "too_big",
              maximum: a,
              inclusive: !0,
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  wi = $constructor("$ZodCheckMaxSize", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        o.maximum < n && (a._zod.bag.maximum = o.maximum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        n.size <= o.maximum ||
          a.issues.push({
            origin: getSizableOrigin(n),
            code: "too_big",
            maximum: o.maximum,
            inclusive: !0,
            input: n,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Ei = $constructor("$ZodCheckMinSize", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        o.minimum > n && (a._zod.bag.minimum = o.minimum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        n.size >= o.minimum ||
          a.issues.push({
            origin: getSizableOrigin(n),
            code: "too_small",
            minimum: o.minimum,
            inclusive: !0,
            input: n,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Oi = $constructor("$ZodCheckSizeEquals", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.size !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        ((n.minimum = o.size), (n.maximum = o.size), (n.size = o.size));
      }),
      (e._zod.check = (a) => {
        let n = a.value,
          i = n.size;
        if (i === o.size) return;
        let s = i > o.size;
        a.issues.push({
          origin: getSizableOrigin(n),
          ...(s ? { code: "too_big", maximum: o.size } : { code: "too_small", minimum: o.size }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  Ai = $constructor("$ZodCheckMaxLength", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        o.maximum < n && (a._zod.bag.maximum = o.maximum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        if (n.length <= o.maximum) return;
        let s = getLengthableOrigin(n);
        a.issues.push({
          origin: s,
          code: "too_big",
          maximum: o.maximum,
          inclusive: !0,
          input: n,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  zi = $constructor("$ZodCheckMinLength", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        o.minimum > n && (a._zod.bag.minimum = o.minimum);
      }),
      (e._zod.check = (a) => {
        let n = a.value;
        if (n.length >= o.minimum) return;
        let s = getLengthableOrigin(n);
        a.issues.push({
          origin: s,
          code: "too_small",
          minimum: o.minimum,
          inclusive: !0,
          input: n,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  Mi = $constructor("$ZodCheckLengthEquals", (e, o) => {
    var r;
    (Z.init(e, o),
      (r = e._zod.def).when ??
        (r.when = (a) => {
          let n = a.value;
          return !nullish(n) && n.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        ((n.minimum = o.length), (n.maximum = o.length), (n.length = o.length));
      }),
      (e._zod.check = (a) => {
        let n = a.value,
          i = n.length;
        if (i === o.length) return;
        let s = getLengthableOrigin(n),
          l = i > o.length;
        a.issues.push({
          origin: s,
          ...(l
            ? { code: "too_big", maximum: o.length }
            : { code: "too_small", minimum: o.length }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !o.abort,
        });
      }));
  }),
  dt = $constructor("$ZodCheckStringFormat", (e, o) => {
    var r, a;
    (Z.init(e, o),
      e._zod.onattach.push((n) => {
        let i = n._zod.bag;
        ((i.format = o.format),
          o.pattern && (i.patterns ?? (i.patterns = new Set()), i.patterns.add(o.pattern)));
      }),
      o.pattern
        ? ((r = e._zod).check ??
          (r.check = (n) => {
            ((o.pattern.lastIndex = 0),
              !o.pattern.test(n.value) &&
                n.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: o.format,
                  input: n.value,
                  ...(o.pattern ? { pattern: o.pattern.toString() } : {}),
                  inst: e,
                  continue: !o.abort,
                }));
          }))
        : ((a = e._zod).check ?? (a.check = () => {})));
  }),
  $i = $constructor("$ZodCheckRegex", (e, o) => {
    (dt.init(e, o),
      (e._zod.check = (r) => {
        ((o.pattern.lastIndex = 0),
          !o.pattern.test(r.value) &&
            r.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: r.value,
              pattern: o.pattern.toString(),
              inst: e,
              continue: !o.abort,
            }));
      }));
  }),
  Di = $constructor("$ZodCheckLowerCase", (e, o) => {
    (o.pattern ?? (o.pattern = Ii), dt.init(e, o));
  }),
  Ui = $constructor("$ZodCheckUpperCase", (e, o) => {
    (o.pattern ?? (o.pattern = Ci), dt.init(e, o));
  }),
  Ni = $constructor("$ZodCheckIncludes", (e, o) => {
    Z.init(e, o);
    let r = escapeRegex(o.includes),
      a = new RegExp(typeof o.position == "number" ? `^.{${o.position}}${r}` : r);
    ((o.pattern = a),
      e._zod.onattach.push((n) => {
        let i = n._zod.bag;
        (i.patterns ?? (i.patterns = new Set()), i.patterns.add(a));
      }),
      (e._zod.check = (n) => {
        n.value.includes(o.includes, o.position) ||
          n.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: o.includes,
            input: n.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Zi = $constructor("$ZodCheckStartsWith", (e, o) => {
    Z.init(e, o);
    let r = new RegExp(`^${escapeRegex(o.prefix)}.*`);
    (o.pattern ?? (o.pattern = r),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        (n.patterns ?? (n.patterns = new Set()), n.patterns.add(r));
      }),
      (e._zod.check = (a) => {
        a.value.startsWith(o.prefix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: o.prefix,
            input: a.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  ji = $constructor("$ZodCheckEndsWith", (e, o) => {
    Z.init(e, o);
    let r = new RegExp(`.*${escapeRegex(o.suffix)}$`);
    (o.pattern ?? (o.pattern = r),
      e._zod.onattach.push((a) => {
        let n = a._zod.bag;
        (n.patterns ?? (n.patterns = new Set()), n.patterns.add(r));
      }),
      (e._zod.check = (a) => {
        a.value.endsWith(o.suffix) ||
          a.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: o.suffix,
            input: a.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  });
function handleCheckPropertyResult(e, o, r) {
  e.issues.length && o.issues.push(...prefixIssues(r, e.issues));
}
c(handleCheckPropertyResult, "handleCheckPropertyResult");
var Bi = $constructor("$ZodCheckProperty", (e, o) => {
    (Z.init(e, o),
      (e._zod.check = (r) => {
        let a = o.schema._zod.run({ value: r.value[o.property], issues: [] }, {});
        if (a instanceof Promise) return a.then((n) => handleCheckPropertyResult(n, r, o.property));
        handleCheckPropertyResult(a, r, o.property);
      }));
  }),
  Li = $constructor("$ZodCheckMimeType", (e, o) => {
    Z.init(e, o);
    let r = new Set(o.mime);
    (e._zod.onattach.push((a) => {
      a._zod.bag.mime = o.mime;
    }),
      (e._zod.check = (a) => {
        r.has(a.value.type) ||
          a.issues.push({
            code: "invalid_value",
            values: o.mime,
            input: a.value.type,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  Wi = $constructor("$ZodCheckOverwrite", (e, o) => {
    (Z.init(e, o),
      (e._zod.check = (r) => {
        r.value = o.tx(r.value);
      }));
  });
var nn = class {
  static {
    c(this, "Doc");
  }
  constructor(o = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = o));
  }
  indented(o) {
    ((this.indent += 1), o(this), (this.indent -= 1));
  }
  write(o) {
    if (typeof o == "function") {
      (o(this, { execution: "sync" }), o(this, { execution: "async" }));
      return;
    }
    let a = o
        .split(
          `
`,
        )
        .filter((s) => s),
      n = Math.min(...a.map((s) => s.length - s.trimStart().length)),
      i = a.map((s) => s.slice(n)).map((s) => " ".repeat(this.indent * 2) + s);
    for (let s of i) this.content.push(s);
  }
  compile() {
    let o = Function,
      r = this?.args,
      n = [...(this?.content ?? [""]).map((i) => `  ${i}`)];
    return new o(
      ...r,
      n.join(`
`),
    );
  }
};
var Fi = { major: 4, minor: 3, patch: 6 };
var w = $constructor("$ZodType", (e, o) => {
    var r;
    (e ?? (e = {}), (e._zod.def = o), (e._zod.bag = e._zod.bag || {}), (e._zod.version = Fi));
    let a = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && a.unshift(e);
    for (let n of a) for (let i of n._zod.onattach) i(e);
    if (a.length === 0)
      ((r = e._zod).deferred ?? (r.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      let n = c((s, l, p) => {
          let u = aborted(s),
            h;
          for (let b of l) {
            if (b._zod.def.when) {
              if (!b._zod.def.when(s)) continue;
            } else if (u) continue;
            let S = s.issues.length,
              _ = b._zod.check(s);
            if (_ instanceof Promise && p?.async === !1) throw new pe();
            if (h || _ instanceof Promise)
              h = (h ?? Promise.resolve()).then(async () => {
                (await _, s.issues.length !== S && (u || (u = aborted(s, S))));
              });
            else {
              if (s.issues.length === S) continue;
              u || (u = aborted(s, S));
            }
          }
          return h ? h.then(() => s) : s;
        }, "runChecks"),
        i = c((s, l, p) => {
          if (aborted(s)) return ((s.aborted = !0), s);
          let u = n(l, a, p);
          if (u instanceof Promise) {
            if (p.async === !1) throw new pe();
            return u.then((h) => e._zod.parse(h, p));
          }
          return e._zod.parse(u, p);
        }, "handleCanaryResult");
      e._zod.run = (s, l) => {
        if (l.skipChecks) return e._zod.parse(s, l);
        if (l.direction === "backward") {
          let u = e._zod.parse({ value: s.value, issues: [] }, { ...l, skipChecks: !0 });
          return u instanceof Promise ? u.then((h) => i(h, s, l)) : i(u, s, l);
        }
        let p = e._zod.parse(s, l);
        if (p instanceof Promise) {
          if (l.async === !1) throw new pe();
          return p.then((u) => n(u, a, l));
        }
        return n(p, a, l);
      };
    }
    defineLazy(e, "~standard", () => ({
      validate: c((n) => {
        try {
          let i = Jr(e, n);
          return i.success ? { value: i.data } : { issues: i.error?.issues };
        } catch {
          return Yr(e, n).then((s) =>
            s.success ? { value: s.data } : { issues: s.error?.issues },
          );
        }
      }, "validate"),
      vendor: "zod",
      version: 1,
    }));
  }),
  Ve = $constructor("$ZodString", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? bi(e._zod.bag)),
      (e._zod.parse = (r, a) => {
        if (o.coerce)
          try {
            r.value = String(r.value);
          } catch {}
        return (
          typeof r.value == "string" ||
            r.issues.push({ expected: "string", code: "invalid_type", input: r.value, inst: e }),
          r
        );
      }));
  }),
  U = $constructor("$ZodStringFormat", (e, o) => {
    (dt.init(e, o), Ve.init(e, o));
  }),
  Vi = $constructor("$ZodGUID", (e, o) => {
    (o.pattern ?? (o.pattern = ii), U.init(e, o));
  }),
  Gi = $constructor("$ZodUUID", (e, o) => {
    if (o.version) {
      let a = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[o.version];
      if (a === void 0) throw new Error(`Invalid UUID version: "${o.version}"`);
      o.pattern ?? (o.pattern = qe(a));
    } else o.pattern ?? (o.pattern = qe());
    U.init(e, o);
  }),
  Ki = $constructor("$ZodEmail", (e, o) => {
    (o.pattern ?? (o.pattern = ai), U.init(e, o));
  }),
  Hi = $constructor("$ZodURL", (e, o) => {
    (U.init(e, o),
      (e._zod.check = (r) => {
        try {
          let a = r.value.trim(),
            n = new URL(a);
          (o.hostname &&
            ((o.hostname.lastIndex = 0),
            o.hostname.test(n.hostname) ||
              r.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: o.hostname.source,
                input: r.value,
                inst: e,
                continue: !o.abort,
              })),
            o.protocol &&
              ((o.protocol.lastIndex = 0),
              o.protocol.test(n.protocol.endsWith(":") ? n.protocol.slice(0, -1) : n.protocol) ||
                r.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: o.protocol.source,
                  input: r.value,
                  inst: e,
                  continue: !o.abort,
                })),
            o.normalize ? (r.value = n.href) : (r.value = a));
          return;
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "url",
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
        }
      }));
  }),
  Ji = $constructor("$ZodEmoji", (e, o) => {
    (o.pattern ?? (o.pattern = emoji()), U.init(e, o));
  }),
  Yi = $constructor("$ZodNanoID", (e, o) => {
    (o.pattern ?? (o.pattern = oi), U.init(e, o));
  }),
  Xi = $constructor("$ZodCUID", (e, o) => {
    (o.pattern ?? (o.pattern = Xr), U.init(e, o));
  }),
  Qi = $constructor("$ZodCUID2", (e, o) => {
    (o.pattern ?? (o.pattern = Qr), U.init(e, o));
  }),
  ea = $constructor("$ZodULID", (e, o) => {
    (o.pattern ?? (o.pattern = ei), U.init(e, o));
  }),
  ta = $constructor("$ZodXID", (e, o) => {
    (o.pattern ?? (o.pattern = ti), U.init(e, o));
  }),
  na = $constructor("$ZodKSUID", (e, o) => {
    (o.pattern ?? (o.pattern = ni), U.init(e, o));
  }),
  oa = $constructor("$ZodISODateTime", (e, o) => {
    (o.pattern ?? (o.pattern = datetime(o)), U.init(e, o));
  }),
  ra = $constructor("$ZodISODate", (e, o) => {
    (o.pattern ?? (o.pattern = fi), U.init(e, o));
  }),
  ia = $constructor("$ZodISOTime", (e, o) => {
    (o.pattern ?? (o.pattern = time(o)), U.init(e, o));
  }),
  aa = $constructor("$ZodISODuration", (e, o) => {
    (o.pattern ?? (o.pattern = ri), U.init(e, o));
  }),
  sa = $constructor("$ZodIPv4", (e, o) => {
    (o.pattern ?? (o.pattern = ci), U.init(e, o), (e._zod.bag.format = "ipv4"));
  }),
  ca = $constructor("$ZodIPv6", (e, o) => {
    (o.pattern ?? (o.pattern = li),
      U.init(e, o),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (r) => {
        try {
          new URL(`http://[${r.value}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
        }
      }));
  }),
  la = $constructor("$ZodMAC", (e, o) => {
    (o.pattern ?? (o.pattern = di(o.delimiter)), U.init(e, o), (e._zod.bag.format = "mac"));
  }),
  da = $constructor("$ZodCIDRv4", (e, o) => {
    (o.pattern ?? (o.pattern = ui), U.init(e, o));
  }),
  ua = $constructor("$ZodCIDRv6", (e, o) => {
    (o.pattern ?? (o.pattern = pi),
      U.init(e, o),
      (e._zod.check = (r) => {
        let a = r.value.split("/");
        try {
          if (a.length !== 2) throw new Error();
          let [n, i] = a;
          if (!i) throw new Error();
          let s = Number(i);
          if (`${s}` !== i) throw new Error();
          if (s < 0 || s > 128) throw new Error();
          new URL(`http://[${n}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
        }
      }));
  });
function isValidBase64(e) {
  if (e === "") return !0;
  if (e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
c(isValidBase64, "isValidBase64");
var ma = $constructor("$ZodBase64", (e, o) => {
  (o.pattern ?? (o.pattern = mi),
    U.init(e, o),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (r) => {
      isValidBase64(r.value) ||
        r.issues.push({
          code: "invalid_format",
          format: "base64",
          input: r.value,
          inst: e,
          continue: !o.abort,
        });
    }));
});
function isValidBase64URL(e) {
  if (!Hn.test(e)) return !1;
  let o = e.replace(/[-_]/g, (a) => (a === "-" ? "+" : "/")),
    r = o.padEnd(Math.ceil(o.length / 4) * 4, "=");
  return isValidBase64(r);
}
c(isValidBase64URL, "isValidBase64URL");
var ga = $constructor("$ZodBase64URL", (e, o) => {
    (o.pattern ?? (o.pattern = Hn),
      U.init(e, o),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (r) => {
        isValidBase64URL(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  fa = $constructor("$ZodE164", (e, o) => {
    (o.pattern ?? (o.pattern = gi), U.init(e, o));
  });
function isValidJWT(e, o = null) {
  try {
    let r = e.split(".");
    if (r.length !== 3) return !1;
    let [a] = r;
    if (!a) return !1;
    let n = JSON.parse(atob(a));
    return !(("typ" in n && n?.typ !== "JWT") || !n.alg || (o && (!("alg" in n) || n.alg !== o)));
  } catch {
    return !1;
  }
}
c(isValidJWT, "isValidJWT");
var ha = $constructor("$ZodJWT", (e, o) => {
    (U.init(e, o),
      (e._zod.check = (r) => {
        isValidJWT(r.value, o.alg) ||
          r.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  ya = $constructor("$ZodCustomStringFormat", (e, o) => {
    (U.init(e, o),
      (e._zod.check = (r) => {
        o.fn(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: o.format,
            input: r.value,
            inst: e,
            continue: !o.abort,
          });
      }));
  }),
  ro = $constructor("$ZodNumber", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = e._zod.bag.pattern ?? Jn),
      (e._zod.parse = (r, a) => {
        if (o.coerce)
          try {
            r.value = Number(r.value);
          } catch {}
        let n = r.value;
        if (typeof n == "number" && !Number.isNaN(n) && Number.isFinite(n)) return r;
        let i =
          typeof n == "number"
            ? Number.isNaN(n)
              ? "NaN"
              : Number.isFinite(n)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          r.issues.push({
            expected: "number",
            code: "invalid_type",
            input: n,
            inst: e,
            ...(i ? { received: i } : {}),
          }),
          r
        );
      }));
  }),
  ba = $constructor("$ZodNumberFormat", (e, o) => {
    (Pi.init(e, o), ro.init(e, o));
  }),
  on = $constructor("$ZodBoolean", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = _i),
      (e._zod.parse = (r, a) => {
        if (o.coerce)
          try {
            r.value = !!r.value;
          } catch {}
        let n = r.value;
        return (
          typeof n == "boolean" ||
            r.issues.push({ expected: "boolean", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  io = $constructor("$ZodBigInt", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = vi),
      (e._zod.parse = (r, a) => {
        if (o.coerce)
          try {
            r.value = BigInt(r.value);
          } catch {}
        return (
          typeof r.value == "bigint" ||
            r.issues.push({ expected: "bigint", code: "invalid_type", input: r.value, inst: e }),
          r
        );
      }));
  }),
  va = $constructor("$ZodBigIntFormat", (e, o) => {
    (Ti.init(e, o), io.init(e, o));
  }),
  Sa = $constructor("$ZodSymbol", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        return (
          typeof n == "symbol" ||
            r.issues.push({ expected: "symbol", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  _a = $constructor("$ZodUndefined", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = ki),
      (e._zod.values = new Set([void 0])),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        return (
          typeof n > "u" ||
            r.issues.push({ expected: "undefined", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  xa = $constructor("$ZodNull", (e, o) => {
    (w.init(e, o),
      (e._zod.pattern = xi),
      (e._zod.values = new Set([null])),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        return (
          n === null ||
            r.issues.push({ expected: "null", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  ka = $constructor("$ZodAny", (e, o) => {
    (w.init(e, o), (e._zod.parse = (r) => r));
  }),
  Ia = $constructor("$ZodUnknown", (e, o) => {
    (w.init(e, o), (e._zod.parse = (r) => r));
  }),
  Ca = $constructor("$ZodNever", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => (
        r.issues.push({ expected: "never", code: "invalid_type", input: r.value, inst: e }),
        r
      )));
  }),
  Ra = $constructor("$ZodVoid", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        return (
          typeof n > "u" ||
            r.issues.push({ expected: "void", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  Pa = $constructor("$ZodDate", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        if (o.coerce)
          try {
            r.value = new Date(r.value);
          } catch {}
        let n = r.value,
          i = n instanceof Date;
        return (
          (i && !Number.isNaN(n.getTime())) ||
            r.issues.push({
              expected: "date",
              code: "invalid_type",
              input: n,
              ...(i ? { received: "Invalid Date" } : {}),
              inst: e,
            }),
          r
        );
      }));
  });
function handleArrayResult(e, o, r) {
  (e.issues.length && o.issues.push(...prefixIssues(r, e.issues)), (o.value[r] = e.value));
}
c(handleArrayResult, "handleArrayResult");
var Ta = $constructor("$ZodArray", (e, o) => {
  (w.init(e, o),
    (e._zod.parse = (r, a) => {
      let n = r.value;
      if (!Array.isArray(n))
        return (r.issues.push({ expected: "array", code: "invalid_type", input: n, inst: e }), r);
      r.value = Array(n.length);
      let i = [];
      for (let s = 0; s < n.length; s++) {
        let l = n[s],
          p = o.element._zod.run({ value: l, issues: [] }, a);
        p instanceof Promise ? i.push(p.then((u) => handleArrayResult(u, r, s))) : handleArrayResult(p, r, s);
      }
      return i.length ? Promise.all(i).then(() => r) : r;
    }));
});
function handlePropertyResult(e, o, r, a, n) {
  if (e.issues.length) {
    if (n && !(r in a)) return;
    o.issues.push(...prefixIssues(r, e.issues));
  }
  e.value === void 0 ? r in a && (o.value[r] = void 0) : (o.value[r] = e.value);
}
c(handlePropertyResult, "handlePropertyResult");
function normalizeDef(e) {
  let o = Object.keys(e.shape);
  for (let a of o)
    if (!e.shape?.[a]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  let r = optionalKeys(e.shape);
  return { ...e, keys: o, keySet: new Set(o), numKeys: o.length, optionalKeys: new Set(r) };
}
c(normalizeDef, "normalizeDef");
function handleCatchall(e, o, r, a, n, i) {
  let s = [],
    l = n.keySet,
    p = n.catchall._zod,
    u = p.def.type,
    h = p.optout === "optional";
  for (let b in o) {
    if (l.has(b)) continue;
    if (u === "never") {
      s.push(b);
      continue;
    }
    let S = p.run({ value: o[b], issues: [] }, a);
    S instanceof Promise ? e.push(S.then((_) => handlePropertyResult(_, r, b, o, h))) : handlePropertyResult(S, r, b, o, h);
  }
  return (
    s.length && r.issues.push({ code: "unrecognized_keys", keys: s, input: o, inst: i }),
    e.length ? Promise.all(e).then(() => r) : r
  );
}
c(handleCatchall, "handleCatchall");
var np = $constructor("$ZodObject", (e, o) => {
    if ((w.init(e, o), !Object.getOwnPropertyDescriptor(o, "shape")?.get)) {
      let l = o.shape;
      Object.defineProperty(o, "shape", {
        get: c(() => {
          let p = { ...l };
          return (Object.defineProperty(o, "shape", { value: p }), p);
        }, "get"),
      });
    }
    let a = cached(() => normalizeDef(o));
    defineLazy(e._zod, "propValues", () => {
      let l = o.shape,
        p = {};
      for (let u in l) {
        let h = l[u]._zod;
        if (h.values) {
          p[u] ?? (p[u] = new Set());
          for (let b of h.values) p[u].add(b);
        }
      }
      return p;
    });
    let n = isObject,
      i = o.catchall,
      s;
    e._zod.parse = (l, p) => {
      s ?? (s = a.value);
      let u = l.value;
      if (!n(u))
        return (l.issues.push({ expected: "object", code: "invalid_type", input: u, inst: e }), l);
      l.value = {};
      let h = [],
        b = s.shape;
      for (let S of s.keys) {
        let _ = b[S],
          z = _._zod.optout === "optional",
          $ = _._zod.run({ value: u[S], issues: [] }, p);
        $ instanceof Promise ? h.push($.then((xe) => handlePropertyResult(xe, l, S, u, z))) : handlePropertyResult($, l, S, u, z);
      }
      return i ? handleCatchall(h, u, l, p, a.value, e) : h.length ? Promise.all(h).then(() => l) : l;
    };
  }),
  wa = $constructor("$ZodObjectJIT", (e, o) => {
    np.init(e, o);
    let r = e._zod.parse,
      a = cached(() => normalizeDef(o)),
      n = c((S) => {
        let _ = new nn(["shape", "payload", "ctx"]),
          z = a.value,
          $ = c((fe) => {
            let Y = esc(fe);
            return `shape[${Y}]._zod.run({ value: input[${Y}], issues: [] }, ctx)`;
          }, "parseStr");
        _.write("const input = payload.value;");
        let xe = Object.create(null),
          Df = 0;
        for (let fe of z.keys) xe[fe] = `key_${Df++}`;
        _.write("const newResult = {};");
        for (let fe of z.keys) {
          let Y = xe[fe],
            ue = esc(fe),
            Nf = S[fe]?._zod?.optout === "optional";
          (_.write(`const ${Y} = ${$(fe)};`),
            Nf
              ? _.write(`
        if (${Y}.issues.length) {
          if (${ue} in input) {
            payload.issues = payload.issues.concat(${Y}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${ue}, ...iss.path] : [${ue}]
            })));
          }
        }
        
        if (${Y}.value === undefined) {
          if (${ue} in input) {
            newResult[${ue}] = undefined;
          }
        } else {
          newResult[${ue}] = ${Y}.value;
        }
        
      `)
              : _.write(`
        if (${Y}.issues.length) {
          payload.issues = payload.issues.concat(${Y}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${ue}, ...iss.path] : [${ue}]
          })));
        }
        
        if (${Y}.value === undefined) {
          if (${ue} in input) {
            newResult[${ue}] = undefined;
          }
        } else {
          newResult[${ue}] = ${Y}.value;
        }
        
      `));
        }
        (_.write("payload.value = newResult;"), _.write("return payload;"));
        let Uf = _.compile();
        return (fe, Y) => Uf(S, fe, Y);
      }, "generateFastpass"),
      i,
      s = isObject,
      l = !Ft.jitless,
      u = l && Lr.value,
      h = o.catchall,
      b;
    e._zod.parse = (S, _) => {
      b ?? (b = a.value);
      let z = S.value;
      return s(z)
        ? l && u && _?.async === !1 && _.jitless !== !0
          ? (i || (i = n(o.shape)), (S = i(S, _)), h ? handleCatchall([], z, S, _, b, e) : S)
          : r(S, _)
        : (S.issues.push({ expected: "object", code: "invalid_type", input: z, inst: e }), S);
    };
  });
function handleUnionResults(e, o, r, a) {
  for (let i of e) if (i.issues.length === 0) return ((o.value = i.value), o);
  let n = e.filter((i) => !aborted(i));
  return n.length === 1
    ? ((o.value = n[0].value), n[0])
    : (o.issues.push({
        code: "invalid_union",
        input: o.value,
        inst: r,
        errors: e.map((i) => i.issues.map((s) => finalizeIssue(s, a, config()))),
      }),
      o);
}
c(handleUnionResults, "handleUnionResults");
var rn = $constructor("$ZodUnion", (e, o) => {
  (w.init(e, o),
    defineLazy(e._zod, "optin", () =>
      o.options.some((n) => n._zod.optin === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "optout", () =>
      o.options.some((n) => n._zod.optout === "optional") ? "optional" : void 0,
    ),
    defineLazy(e._zod, "values", () => {
      if (o.options.every((n) => n._zod.values))
        return new Set(o.options.flatMap((n) => Array.from(n._zod.values)));
    }),
    defineLazy(e._zod, "pattern", () => {
      if (o.options.every((n) => n._zod.pattern)) {
        let n = o.options.map((i) => i._zod.pattern);
        return new RegExp(`^(${n.map((i) => cleanRegex(i.source)).join("|")})$`);
      }
    }));
  let r = o.options.length === 1,
    a = o.options[0]._zod.run;
  e._zod.parse = (n, i) => {
    if (r) return a(n, i);
    let s = !1,
      l = [];
    for (let p of o.options) {
      let u = p._zod.run({ value: n.value, issues: [] }, i);
      if (u instanceof Promise) (l.push(u), (s = !0));
      else {
        if (u.issues.length === 0) return u;
        l.push(u);
      }
    }
    return s ? Promise.all(l).then((p) => handleUnionResults(p, n, e, i)) : handleUnionResults(l, n, e, i);
  };
});
function handleExclusiveUnionResults(e, o, r, a) {
  let n = e.filter((i) => i.issues.length === 0);
  return n.length === 1
    ? ((o.value = n[0].value), o)
    : (n.length === 0
        ? o.issues.push({
            code: "invalid_union",
            input: o.value,
            inst: r,
            errors: e.map((i) => i.issues.map((s) => finalizeIssue(s, a, config()))),
          })
        : o.issues.push({
            code: "invalid_union",
            input: o.value,
            inst: r,
            errors: [],
            inclusive: !1,
          }),
      o);
}
c(handleExclusiveUnionResults, "handleExclusiveUnionResults");
var Ea = $constructor("$ZodXor", (e, o) => {
    (rn.init(e, o), (o.inclusive = !1));
    let r = o.options.length === 1,
      a = o.options[0]._zod.run;
    e._zod.parse = (n, i) => {
      if (r) return a(n, i);
      let s = !1,
        l = [];
      for (let p of o.options) {
        let u = p._zod.run({ value: n.value, issues: [] }, i);
        u instanceof Promise ? (l.push(u), (s = !0)) : l.push(u);
      }
      return s ? Promise.all(l).then((p) => handleExclusiveUnionResults(p, n, e, i)) : handleExclusiveUnionResults(l, n, e, i);
    };
  }),
  Oa = $constructor("$ZodDiscriminatedUnion", (e, o) => {
    ((o.inclusive = !1), rn.init(e, o));
    let r = e._zod.parse;
    defineLazy(e._zod, "propValues", () => {
      let n = {};
      for (let i of o.options) {
        let s = i._zod.propValues;
        if (!s || Object.keys(s).length === 0)
          throw new Error(`Invalid discriminated union option at index "${o.options.indexOf(i)}"`);
        for (let [l, p] of Object.entries(s)) {
          n[l] || (n[l] = new Set());
          for (let u of p) n[l].add(u);
        }
      }
      return n;
    });
    let a = cached(() => {
      let n = o.options,
        i = new Map();
      for (let s of n) {
        let l = s._zod.propValues?.[o.discriminator];
        if (!l || l.size === 0)
          throw new Error(`Invalid discriminated union option at index "${o.options.indexOf(s)}"`);
        for (let p of l) {
          if (i.has(p)) throw new Error(`Duplicate discriminator value "${String(p)}"`);
          i.set(p, s);
        }
      }
      return i;
    });
    e._zod.parse = (n, i) => {
      let s = n.value;
      if (!isObject(s))
        return (n.issues.push({ code: "invalid_type", expected: "object", input: s, inst: e }), n);
      let l = a.value.get(s?.[o.discriminator]);
      return l
        ? l._zod.run(n, i)
        : o.unionFallback
          ? r(n, i)
          : (n.issues.push({
              code: "invalid_union",
              errors: [],
              note: "No matching discriminator",
              discriminator: o.discriminator,
              input: s,
              path: [o.discriminator],
              inst: e,
            }),
            n);
    };
  }),
  Aa = $constructor("$ZodIntersection", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value,
          i = o.left._zod.run({ value: n, issues: [] }, a),
          s = o.right._zod.run({ value: n, issues: [] }, a);
        return i instanceof Promise || s instanceof Promise
          ? Promise.all([i, s]).then(([p, u]) => handleIntersectionResults(r, p, u))
          : handleIntersectionResults(r, i, s);
      }));
  });
function mergeValues(e, o) {
  if (e === o) return { valid: !0, data: e };
  if (e instanceof Date && o instanceof Date && +e == +o) return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(o)) {
    let r = Object.keys(o),
      a = Object.keys(e).filter((i) => r.indexOf(i) !== -1),
      n = { ...e, ...o };
    for (let i of a) {
      let s = mergeValues(e[i], o[i]);
      if (!s.valid) return { valid: !1, mergeErrorPath: [i, ...s.mergeErrorPath] };
      n[i] = s.data;
    }
    return { valid: !0, data: n };
  }
  if (Array.isArray(e) && Array.isArray(o)) {
    if (e.length !== o.length) return { valid: !1, mergeErrorPath: [] };
    let r = [];
    for (let a = 0; a < e.length; a++) {
      let n = e[a],
        i = o[a],
        s = mergeValues(n, i);
      if (!s.valid) return { valid: !1, mergeErrorPath: [a, ...s.mergeErrorPath] };
      r.push(s.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
c(mergeValues, "mergeValues");
function handleIntersectionResults(e, o, r) {
  let a = new Map(),
    n;
  for (let l of o.issues)
    if (l.code === "unrecognized_keys") {
      n ?? (n = l);
      for (let p of l.keys) (a.has(p) || a.set(p, {}), (a.get(p).l = !0));
    } else e.issues.push(l);
  for (let l of r.issues)
    if (l.code === "unrecognized_keys")
      for (let p of l.keys) (a.has(p) || a.set(p, {}), (a.get(p).r = !0));
    else e.issues.push(l);
  let i = [...a].filter(([, l]) => l.l && l.r).map(([l]) => l);
  if ((i.length && n && e.issues.push({ ...n, keys: i }), aborted(e))) return e;
  let s = mergeValues(o.value, r.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return ((e.value = s.data), e);
}
c(handleIntersectionResults, "handleIntersectionResults");
var ao = $constructor("$ZodTuple", (e, o) => {
  w.init(e, o);
  let r = o.items;
  e._zod.parse = (a, n) => {
    let i = a.value;
    if (!Array.isArray(i))
      return (a.issues.push({ input: i, inst: e, expected: "tuple", code: "invalid_type" }), a);
    a.value = [];
    let s = [],
      l = [...r].reverse().findIndex((h) => h._zod.optin !== "optional"),
      p = l === -1 ? 0 : r.length - l;
    if (!o.rest) {
      let h = i.length > r.length,
        b = i.length < p - 1;
      if (h || b)
        return (
          a.issues.push({
            ...(h
              ? { code: "too_big", maximum: r.length, inclusive: !0 }
              : { code: "too_small", minimum: r.length }),
            input: i,
            inst: e,
            origin: "array",
          }),
          a
        );
    }
    let u = -1;
    for (let h of r) {
      if ((u++, u >= i.length && u >= p)) continue;
      let b = h._zod.run({ value: i[u], issues: [] }, n);
      b instanceof Promise ? s.push(b.then((S) => handleTupleResult(S, a, u))) : handleTupleResult(b, a, u);
    }
    if (o.rest) {
      let h = i.slice(r.length);
      for (let b of h) {
        u++;
        let S = o.rest._zod.run({ value: b, issues: [] }, n);
        S instanceof Promise ? s.push(S.then((_) => handleTupleResult(_, a, u))) : handleTupleResult(S, a, u);
      }
    }
    return s.length ? Promise.all(s).then(() => a) : a;
  };
});
function handleTupleResult(e, o, r) {
  (e.issues.length && o.issues.push(...prefixIssues(r, e.issues)), (o.value[r] = e.value));
}
c(handleTupleResult, "handleTupleResult");
var za = $constructor("$ZodRecord", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        if (!isPlainObject(n))
          return (
            r.issues.push({ expected: "record", code: "invalid_type", input: n, inst: e }),
            r
          );
        let i = [],
          s = o.keyType._zod.values;
        if (s) {
          r.value = {};
          let l = new Set();
          for (let u of s)
            if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
              l.add(typeof u == "number" ? u.toString() : u);
              let h = o.valueType._zod.run({ value: n[u], issues: [] }, a);
              h instanceof Promise
                ? i.push(
                    h.then((b) => {
                      (b.issues.length && r.issues.push(...prefixIssues(u, b.issues)),
                        (r.value[u] = b.value));
                    }),
                  )
                : (h.issues.length && r.issues.push(...prefixIssues(u, h.issues)), (r.value[u] = h.value));
            }
          let p;
          for (let u in n) l.has(u) || ((p = p ?? []), p.push(u));
          p &&
            p.length > 0 &&
            r.issues.push({ code: "unrecognized_keys", input: n, inst: e, keys: p });
        } else {
          r.value = {};
          for (let l of Reflect.ownKeys(n)) {
            if (l === "__proto__") continue;
            let p = o.keyType._zod.run({ value: l, issues: [] }, a);
            if (p instanceof Promise)
              throw new Error("Async schemas not supported in object keys currently");
            if (typeof l == "string" && Jn.test(l) && p.issues.length) {
              let b = o.keyType._zod.run({ value: Number(l), issues: [] }, a);
              if (b instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              b.issues.length === 0 && (p = b);
            }
            if (p.issues.length) {
              o.mode === "loose"
                ? (r.value[l] = n[l])
                : r.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: p.issues.map((b) => finalizeIssue(b, a, config())),
                    input: l,
                    path: [l],
                    inst: e,
                  });
              continue;
            }
            let h = o.valueType._zod.run({ value: n[l], issues: [] }, a);
            h instanceof Promise
              ? i.push(
                  h.then((b) => {
                    (b.issues.length && r.issues.push(...prefixIssues(l, b.issues)),
                      (r.value[p.value] = b.value));
                  }),
                )
              : (h.issues.length && r.issues.push(...prefixIssues(l, h.issues)),
                (r.value[p.value] = h.value));
          }
        }
        return i.length ? Promise.all(i).then(() => r) : r;
      }));
  }),
  Ma = $constructor("$ZodMap", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        if (!(n instanceof Map))
          return (r.issues.push({ expected: "map", code: "invalid_type", input: n, inst: e }), r);
        let i = [];
        r.value = new Map();
        for (let [s, l] of n) {
          let p = o.keyType._zod.run({ value: s, issues: [] }, a),
            u = o.valueType._zod.run({ value: l, issues: [] }, a);
          p instanceof Promise || u instanceof Promise
            ? i.push(
                Promise.all([p, u]).then(([h, b]) => {
                  handleMapResult(h, b, r, s, n, e, a);
                }),
              )
            : handleMapResult(p, u, r, s, n, e, a);
        }
        return i.length ? Promise.all(i).then(() => r) : r;
      }));
  });
function handleMapResult(e, o, r, a, n, i, s) {
  (e.issues.length &&
    (Kt.has(typeof a)
      ? r.issues.push(...prefixIssues(a, e.issues))
      : r.issues.push({
          code: "invalid_key",
          origin: "map",
          input: n,
          inst: i,
          issues: e.issues.map((l) => finalizeIssue(l, s, config())),
        })),
    o.issues.length &&
      (Kt.has(typeof a)
        ? r.issues.push(...prefixIssues(a, o.issues))
        : r.issues.push({
            origin: "map",
            code: "invalid_element",
            input: n,
            inst: i,
            key: a,
            issues: o.issues.map((l) => finalizeIssue(l, s, config())),
          })),
    r.value.set(e.value, o.value));
}
c(handleMapResult, "handleMapResult");
var $a = $constructor("$ZodSet", (e, o) => {
  (w.init(e, o),
    (e._zod.parse = (r, a) => {
      let n = r.value;
      if (!(n instanceof Set))
        return (r.issues.push({ input: n, inst: e, expected: "set", code: "invalid_type" }), r);
      let i = [];
      r.value = new Set();
      for (let s of n) {
        let l = o.valueType._zod.run({ value: s, issues: [] }, a);
        l instanceof Promise ? i.push(l.then((p) => handleSetResult(p, r))) : handleSetResult(l, r);
      }
      return i.length ? Promise.all(i).then(() => r) : r;
    }));
});
function handleSetResult(e, o) {
  (e.issues.length && o.issues.push(...e.issues), o.value.add(e.value));
}
c(handleSetResult, "handleSetResult");
var Da = $constructor("$ZodEnum", (e, o) => {
    w.init(e, o);
    let r = getEnumValues(o.entries),
      a = new Set(r);
    ((e._zod.values = a),
      (e._zod.pattern = new RegExp(
        `^(${r
          .filter((n) => Kt.has(typeof n))
          .map((n) => (typeof n == "string" ? escapeRegex(n) : n.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (n, i) => {
        let s = n.value;
        return (
          a.has(s) || n.issues.push({ code: "invalid_value", values: r, input: s, inst: e }),
          n
        );
      }));
  }),
  Ua = $constructor("$ZodLiteral", (e, o) => {
    if ((w.init(e, o), o.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    let r = new Set(o.values);
    ((e._zod.values = r),
      (e._zod.pattern = new RegExp(
        `^(${o.values.map((a) => (typeof a == "string" ? escapeRegex(a) : a ? escapeRegex(a.toString()) : String(a))).join("|")})$`,
      )),
      (e._zod.parse = (a, n) => {
        let i = a.value;
        return (
          r.has(i) || a.issues.push({ code: "invalid_value", values: o.values, input: i, inst: e }),
          a
        );
      }));
  }),
  Na = $constructor("$ZodFile", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        let n = r.value;
        return (
          n instanceof File ||
            r.issues.push({ expected: "file", code: "invalid_type", input: n, inst: e }),
          r
        );
      }));
  }),
  Za = $constructor("$ZodTransform", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") throw new Oe(e.constructor.name);
        let n = o.transform(r.value, r);
        if (a.async)
          return (n instanceof Promise ? n : Promise.resolve(n)).then((s) => ((r.value = s), r));
        if (n instanceof Promise) throw new pe();
        return ((r.value = n), r);
      }));
  });
function handleOptionalResult(e, o) {
  return e.issues.length && o === void 0 ? { issues: [], value: void 0 } : e;
}
c(handleOptionalResult, "handleOptionalResult");
var so = $constructor("$ZodOptional", (e, o) => {
    (w.init(e, o),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      defineLazy(e._zod, "values", () =>
        o.innerType._zod.values ? new Set([...o.innerType._zod.values, void 0]) : void 0,
      ),
      defineLazy(e._zod, "pattern", () => {
        let r = o.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)})?$`) : void 0;
      }),
      (e._zod.parse = (r, a) => {
        if (o.innerType._zod.optin === "optional") {
          let n = o.innerType._zod.run(r, a);
          return n instanceof Promise ? n.then((i) => handleOptionalResult(i, r.value)) : handleOptionalResult(n, r.value);
        }
        return r.value === void 0 ? r : o.innerType._zod.run(r, a);
      }));
  }),
  ja = $constructor("$ZodExactOptional", (e, o) => {
    (so.init(e, o),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      defineLazy(e._zod, "pattern", () => o.innerType._zod.pattern),
      (e._zod.parse = (r, a) => o.innerType._zod.run(r, a)));
  }),
  Ba = $constructor("$ZodNullable", (e, o) => {
    (w.init(e, o),
      defineLazy(e._zod, "optin", () => o.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => o.innerType._zod.optout),
      defineLazy(e._zod, "pattern", () => {
        let r = o.innerType._zod.pattern;
        return r ? new RegExp(`^(${cleanRegex(r.source)}|null)$`) : void 0;
      }),
      defineLazy(e._zod, "values", () =>
        o.innerType._zod.values ? new Set([...o.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (r, a) => (r.value === null ? r : o.innerType._zod.run(r, a))));
  }),
  La = $constructor("$ZodDefault", (e, o) => {
    (w.init(e, o),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") return o.innerType._zod.run(r, a);
        if (r.value === void 0) return ((r.value = o.defaultValue), r);
        let n = o.innerType._zod.run(r, a);
        return n instanceof Promise ? n.then((i) => handleDefaultResult(i, o)) : handleDefaultResult(n, o);
      }));
  });
function handleDefaultResult(e, o) {
  return (e.value === void 0 && (e.value = o.defaultValue), e);
}
c(handleDefaultResult, "handleDefaultResult");
var Wa = $constructor("$ZodPrefault", (e, o) => {
    (w.init(e, o),
      (e._zod.optin = "optional"),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (r, a) => (
        a.direction === "backward" || (r.value === void 0 && (r.value = o.defaultValue)),
        o.innerType._zod.run(r, a)
      )));
  }),
  Fa = $constructor("$ZodNonOptional", (e, o) => {
    (w.init(e, o),
      defineLazy(e._zod, "values", () => {
        let r = o.innerType._zod.values;
        return r ? new Set([...r].filter((a) => a !== void 0)) : void 0;
      }),
      (e._zod.parse = (r, a) => {
        let n = o.innerType._zod.run(r, a);
        return n instanceof Promise ? n.then((i) => handleNonOptionalResult(i, e)) : handleNonOptionalResult(n, e);
      }));
  });
function handleNonOptionalResult(e, o) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: "invalid_type", expected: "nonoptional", input: e.value, inst: o }),
    e
  );
}
c(handleNonOptionalResult, "handleNonOptionalResult");
var qa = $constructor("$ZodSuccess", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") throw new Oe("ZodSuccess");
        let n = o.innerType._zod.run(r, a);
        return n instanceof Promise
          ? n.then((i) => ((r.value = i.issues.length === 0), r))
          : ((r.value = n.issues.length === 0), r);
      }));
  }),
  Va = $constructor("$ZodCatch", (e, o) => {
    (w.init(e, o),
      defineLazy(e._zod, "optin", () => o.innerType._zod.optin),
      defineLazy(e._zod, "optout", () => o.innerType._zod.optout),
      defineLazy(e._zod, "values", () => o.innerType._zod.values),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") return o.innerType._zod.run(r, a);
        let n = o.innerType._zod.run(r, a);
        return n instanceof Promise
          ? n.then(
              (i) => (
                (r.value = i.value),
                i.issues.length &&
                  ((r.value = o.catchValue({
                    ...r,
                    error: { issues: i.issues.map((s) => finalizeIssue(s, a, config())) },
                    input: r.value,
                  })),
                  (r.issues = [])),
                r
              ),
            )
          : ((r.value = n.value),
            n.issues.length &&
              ((r.value = o.catchValue({
                ...r,
                error: { issues: n.issues.map((i) => finalizeIssue(i, a, config())) },
                input: r.value,
              })),
              (r.issues = [])),
            r);
      }));
  }),
  Ga = $constructor("$ZodNaN", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) => (
        (typeof r.value != "number" || !Number.isNaN(r.value)) &&
          r.issues.push({ input: r.value, inst: e, expected: "nan", code: "invalid_type" }),
        r
      )));
  }),
  Ka = $constructor("$ZodPipe", (e, o) => {
    (w.init(e, o),
      defineLazy(e._zod, "values", () => o.in._zod.values),
      defineLazy(e._zod, "optin", () => o.in._zod.optin),
      defineLazy(e._zod, "optout", () => o.out._zod.optout),
      defineLazy(e._zod, "propValues", () => o.in._zod.propValues),
      (e._zod.parse = (r, a) => {
        if (a.direction === "backward") {
          let i = o.out._zod.run(r, a);
          return i instanceof Promise ? i.then((s) => handlePipeResult(s, o.in, a)) : handlePipeResult(i, o.in, a);
        }
        let n = o.in._zod.run(r, a);
        return n instanceof Promise ? n.then((i) => handlePipeResult(i, o.out, a)) : handlePipeResult(n, o.out, a);
      }));
  });
function handlePipeResult(e, o, r) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : o._zod.run({ value: e.value, issues: e.issues }, r);
}
c(handlePipeResult, "handlePipeResult");
var an = $constructor("$ZodCodec", (e, o) => {
  (w.init(e, o),
    defineLazy(e._zod, "values", () => o.in._zod.values),
    defineLazy(e._zod, "optin", () => o.in._zod.optin),
    defineLazy(e._zod, "optout", () => o.out._zod.optout),
    defineLazy(e._zod, "propValues", () => o.in._zod.propValues),
    (e._zod.parse = (r, a) => {
      if ((a.direction || "forward") === "forward") {
        let i = o.in._zod.run(r, a);
        return i instanceof Promise ? i.then((s) => handleCodecAResult(s, o, a)) : handleCodecAResult(i, o, a);
      } else {
        let i = o.out._zod.run(r, a);
        return i instanceof Promise ? i.then((s) => handleCodecAResult(s, o, a)) : handleCodecAResult(i, o, a);
      }
    }));
});
function handleCodecAResult(e, o, r) {
  if (e.issues.length) return ((e.aborted = !0), e);
  if ((r.direction || "forward") === "forward") {
    let n = o.transform(e.value, e);
    return n instanceof Promise ? n.then((i) => handleCodecTxResult(e, i, o.out, r)) : handleCodecTxResult(e, n, o.out, r);
  } else {
    let n = o.reverseTransform(e.value, e);
    return n instanceof Promise ? n.then((i) => handleCodecTxResult(e, i, o.in, r)) : handleCodecTxResult(e, n, o.in, r);
  }
}
c(handleCodecAResult, "handleCodecAResult");
function handleCodecTxResult(e, o, r, a) {
  return e.issues.length ? ((e.aborted = !0), e) : r._zod.run({ value: o, issues: e.issues }, a);
}
c(handleCodecTxResult, "handleCodecTxResult");
var Ha = $constructor("$ZodReadonly", (e, o) => {
  (w.init(e, o),
    defineLazy(e._zod, "propValues", () => o.innerType._zod.propValues),
    defineLazy(e._zod, "values", () => o.innerType._zod.values),
    defineLazy(e._zod, "optin", () => o.innerType?._zod?.optin),
    defineLazy(e._zod, "optout", () => o.innerType?._zod?.optout),
    (e._zod.parse = (r, a) => {
      if (a.direction === "backward") return o.innerType._zod.run(r, a);
      let n = o.innerType._zod.run(r, a);
      return n instanceof Promise ? n.then(handleReadonlyResult) : handleReadonlyResult(n);
    }));
});
function handleReadonlyResult(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
c(handleReadonlyResult, "handleReadonlyResult");
var Ja = $constructor("$ZodTemplateLiteral", (e, o) => {
    w.init(e, o);
    let r = [];
    for (let a of o.parts)
      if (typeof a == "object" && a !== null) {
        if (!a._zod.pattern)
          throw new Error(
            `Invalid template literal part, no pattern found: ${[...a._zod.traits].shift()}`,
          );
        let n = a._zod.pattern instanceof RegExp ? a._zod.pattern.source : a._zod.pattern;
        if (!n) throw new Error(`Invalid template literal part: ${a._zod.traits}`);
        let i = n.startsWith("^") ? 1 : 0,
          s = n.endsWith("$") ? n.length - 1 : n.length;
        r.push(n.slice(i, s));
      } else if (a === null || Fr.has(typeof a)) r.push(escapeRegex(`${a}`));
      else throw new Error(`Invalid template literal part: ${a}`);
    ((e._zod.pattern = new RegExp(`^${r.join("")}$`)),
      (e._zod.parse = (a, n) =>
        typeof a.value != "string"
          ? (a.issues.push({ input: a.value, inst: e, expected: "string", code: "invalid_type" }),
            a)
          : ((e._zod.pattern.lastIndex = 0),
            e._zod.pattern.test(a.value) ||
              a.issues.push({
                input: a.value,
                inst: e,
                code: "invalid_format",
                format: o.format ?? "template_literal",
                pattern: e._zod.pattern.source,
              }),
            a)));
  }),
  Ya = $constructor(
    "$ZodFunction",
    (e, o) => (
      w.init(e, o),
      (e._def = o),
      (e._zod.def = o),
      (e.implement = (r) => {
        if (typeof r != "function") throw new Error("implement() must be called with a function");
        return function (...a) {
          let n = e._def.input ? Zn(e._def.input, a) : a,
            i = Reflect.apply(r, this, n);
          return e._def.output ? Zn(e._def.output, i) : i;
        };
      }),
      (e.implementAsync = (r) => {
        if (typeof r != "function")
          throw new Error("implementAsync() must be called with a function");
        return async function (...a) {
          let n = e._def.input ? await jn(e._def.input, a) : a,
            i = await Reflect.apply(r, this, n);
          return e._def.output ? await jn(e._def.output, i) : i;
        };
      }),
      (e._zod.parse = (r, a) =>
        typeof r.value != "function"
          ? (r.issues.push({ code: "invalid_type", expected: "function", input: r.value, inst: e }),
            r)
          : (e._def.output && e._def.output._zod.def.type === "promise"
              ? (r.value = e.implementAsync(r.value))
              : (r.value = e.implement(r.value)),
            r)),
      (e.input = (...r) => {
        let a = e.constructor;
        return Array.isArray(r[0])
          ? new a({
              type: "function",
              input: new ao({ type: "tuple", items: r[0], rest: r[1] }),
              output: e._def.output,
            })
          : new a({ type: "function", input: r[0], output: e._def.output });
      }),
      (e.output = (r) => {
        let a = e.constructor;
        return new a({ type: "function", input: e._def.input, output: r });
      }),
      e
    ),
  ),
  Xa = $constructor("$ZodPromise", (e, o) => {
    (w.init(e, o),
      (e._zod.parse = (r, a) =>
        Promise.resolve(r.value).then((n) => o.innerType._zod.run({ value: n, issues: [] }, a))));
  }),
  Qa = $constructor("$ZodLazy", (e, o) => {
    (w.init(e, o),
      defineLazy(e._zod, "innerType", () => o.getter()),
      defineLazy(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern),
      defineLazy(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues),
      defineLazy(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0),
      defineLazy(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0),
      (e._zod.parse = (r, a) => e._zod.innerType._zod.run(r, a)));
  }),
  es = $constructor("$ZodCustom", (e, o) => {
    (Z.init(e, o),
      w.init(e, o),
      (e._zod.parse = (r, a) => r),
      (e._zod.check = (r) => {
        let a = r.value,
          n = o.fn(a);
        if (n instanceof Promise) return n.then((i) => handleRefineResult(i, r, a, e));
        handleRefineResult(n, r, a, e);
      }));
  });
function handleRefineResult(e, o, r, a) {
  if (!e) {
    let n = {
      code: "custom",
      input: r,
      inst: a,
      path: [...(a._zod.def.path ?? [])],
      continue: !a._zod.def.abort,
    };
    (a._zod.def.params && (n.params = a._zod.def.params), o.issues.push(issue(n)));
  }
}
c(handleRefineResult, "handleRefineResult");
var un = {};
ke(un, {
  ar: () => ts,
  az: () => ns,
  be: () => os,
  bg: () => rs,
  ca: () => is,
  cs: () => as,
  da: () => ss,
  de: () => cs,
  en: () => sn,
  eo: () => ls,
  es: () => ds,
  fa: () => us,
  fi: () => ps,
  fr: () => ms,
  frCA: () => gs,
  he: () => fs,
  hu: () => hs,
  hy: () => ys,
  id: () => bs,
  is: () => vs,
  it: () => Ss,
  ja: () => _s,
  ka: () => xs,
  kh: () => ks,
  km: () => cn,
  ko: () => Is,
  lt: () => Cs,
  mk: () => Rs,
  ms: () => Ps,
  nl: () => Ts,
  no: () => ws,
  ota: () => Es,
  pl: () => As,
  ps: () => Os,
  pt: () => zs,
  ru: () => Ms,
  sl: () => $s,
  sv: () => Ds,
  ta: () => Us,
  th: () => Ns,
  tr: () => Zs,
  ua: () => js,
  uk: () => dn,
  ur: () => Bs,
  uz: () => Ls,
  vi: () => Ws,
  yo: () => Vs,
  zhCN: () => Fs,
  zhTW: () => qs,
});
var Ny = c(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0645\u062F\u062E\u0644",
      email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
      url: "\u0631\u0627\u0628\u0637",
      emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
      ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
      cidrv4:
        "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
      cidrv6:
        "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
      base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
      base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
      json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
      e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
      jwt: "JWT",
      template_literal: "\u0645\u062F\u062E\u0644",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${n.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`
          : `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${i}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(n.values[0])}`
          : `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${n.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${i} ${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631"}`
          : `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${n.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${i} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${n.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${i} ${n.minimum.toString()} ${s.unit}`
          : `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${n.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${i} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${n.prefix}"`
          : i.format === "ends_with"
            ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${i.suffix}"`
            : i.format === "includes"
              ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${i.includes}"`
              : i.format === "regex"
                ? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${i.pattern}`
                : `${r[i.format] ?? n.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
      }
      case "not_multiple_of":
        return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${n.divisor}`;
      case "unrecognized_keys":
        return `\u0645\u0639\u0631\u0641${n.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${n.keys.length > 1 ? "\u0629" : ""}: ${joinValues(n.keys, "\u060C ")}`;
      case "invalid_key":
        return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${n.origin}`;
      case "invalid_union":
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      case "invalid_element":
        return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${n.origin}`;
      default:
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
    }
  };
}, "error");
function ts() {
  return { localeError: Ny() };
}
c(ts, "default");
var Zy = c(() => {
  let e = {
    string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "element", verb: "olmal\u0131d\u0131r" },
    set: { unit: "element", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${n.expected}, daxil olan ${l}`
          : `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${i}, daxil olan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(n.values[0])}`
          : `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${n.origin ?? "d\u0259y\u0259r"} ${i}${n.maximum.toString()} ${s.unit ?? "element"}`
          : `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${n.origin ?? "d\u0259y\u0259r"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${n.origin} ${i}${n.minimum.toString()} ${s.unit}`
          : `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Yanl\u0131\u015F m\u0259tn: "${i.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`
          : i.format === "ends_with"
            ? `Yanl\u0131\u015F m\u0259tn: "${i.suffix}" il\u0259 bitm\u0259lidir`
            : i.format === "includes"
              ? `Yanl\u0131\u015F m\u0259tn: "${i.includes}" daxil olmal\u0131d\u0131r`
              : i.format === "regex"
                ? `Yanl\u0131\u015F m\u0259tn: ${i.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`
                : `Yanl\u0131\u015F ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Yanl\u0131\u015F \u0259d\u0259d: ${n.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan a\xE7ar${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
      case "invalid_union":
        return "Yanl\u0131\u015F d\u0259y\u0259r";
      case "invalid_element":
        return `${n.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
      default:
        return "Yanl\u0131\u015F d\u0259y\u0259r";
    }
  };
}, "error");
function ns() {
  return { localeError: Zy() };
}
c(ns, "default");
function getBelarusianPlural(e, o, r, a) {
  let n = Math.abs(e),
    i = n % 10,
    s = n % 100;
  return s >= 11 && s <= 19 ? a : i === 1 ? o : i >= 2 && i <= 4 ? r : a;
}
c(getBelarusianPlural, "getBelarusianPlural");
var jy = c(() => {
  let e = {
    string: {
      unit: {
        one: "\u0441\u0456\u043C\u0432\u0430\u043B",
        few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
        many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u044B",
        many: "\u0431\u0430\u0439\u0442\u0430\u045E",
      },
      verb: "\u043C\u0435\u0446\u044C",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0443\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0430\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0447\u0430\u0441",
      duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
      cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      base64:
        "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
      base64url:
        "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
      json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
      e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0443\u0432\u043E\u0434",
    },
    a = { nan: "NaN", number: "\u043B\u0456\u043A", array: "\u043C\u0430\u0441\u0456\u045E" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${n.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${i}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            p = getBelarusianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${s.verb} ${i}${n.maximum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            p = getBelarusianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${s.verb} ${i}${n.minimum.toString()} ${p}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${n.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${n.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
      case "invalid_element":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${n.origin}`;
      default:
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
    }
  };
}, "error");
function os() {
  return { localeError: jy() };
}
c(os, "default");
var By = c(() => {
  let e = {
    string: {
      unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    file: {
      unit: "\u0431\u0430\u0439\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    array: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
    set: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
      verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0445\u043E\u0434",
      email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration:
        "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      json_string: "JSON \u043D\u0438\u0437",
      e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u043E\u0434",
    },
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${n.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${i}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${i}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${i}${n.minimum.toString()} ${s.unit}`
          : `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${n.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        if (i.format === "starts_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${i.prefix}"`;
        if (i.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${i.suffix}"`;
        if (i.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${i.includes}"`;
        if (i.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${i.pattern}`;
        let s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        return (
          i.format === "emoji" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "datetime" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "date" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          i.format === "time" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E"),
          i.format === "duration" && (s = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430"),
          `${s} ${r[i.format] ?? n.format}`
        );
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${n.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${n.origin}`;
      default:
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
    }
  };
}, "error");
function rs() {
  return { localeError: By() };
}
c(rs, "default");
var Ly = c(() => {
  let e = {
    string: { unit: "car\xE0cters", verb: "contenir" },
    file: { unit: "bytes", verb: "contenir" },
    array: { unit: "elements", verb: "contenir" },
    set: { unit: "elements", verb: "contenir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "entrada",
      email: "adre\xE7a electr\xF2nica",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "durada ISO",
      ipv4: "adre\xE7a IPv4",
      ipv6: "adre\xE7a IPv6",
      cidrv4: "rang IPv4",
      cidrv6: "rang IPv6",
      base64: "cadena codificada en base64",
      base64url: "cadena codificada en base64url",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Tipus inv\xE0lid: s'esperava instanceof ${n.expected}, s'ha rebut ${l}`
          : `Tipus inv\xE0lid: s'esperava ${i}, s'ha rebut ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(n.values[0])}`
          : `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(n.values, " o ")}`;
      case "too_big": {
        let i = n.inclusive ? "com a m\xE0xim" : "menys de",
          s = getSizing(n.origin);
        return s
          ? `Massa gran: s'esperava que ${n.origin ?? "el valor"} contingu\xE9s ${i} ${n.maximum.toString()} ${s.unit ?? "elements"}`
          : `Massa gran: s'esperava que ${n.origin ?? "el valor"} fos ${i} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? "com a m\xEDnim" : "m\xE9s de",
          s = getSizing(n.origin);
        return s
          ? `Massa petit: s'esperava que ${n.origin} contingu\xE9s ${i} ${n.minimum.toString()} ${s.unit}`
          : `Massa petit: s'esperava que ${n.origin} fos ${i} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Format inv\xE0lid: ha de comen\xE7ar amb "${i.prefix}"`
          : i.format === "ends_with"
            ? `Format inv\xE0lid: ha d'acabar amb "${i.suffix}"`
            : i.format === "includes"
              ? `Format inv\xE0lid: ha d'incloure "${i.includes}"`
              : i.format === "regex"
                ? `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${i.pattern}`
                : `Format inv\xE0lid per a ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Clau${n.keys.length > 1 ? "s" : ""} no reconeguda${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Clau inv\xE0lida a ${n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE0lida";
      case "invalid_element":
        return `Element inv\xE0lid a ${n.origin}`;
      default:
        return "Entrada inv\xE0lida";
    }
  };
}, "error");
function is() {
  return { localeError: Ly() };
}
c(is, "default");
var Wy = c(() => {
  let e = {
    string: { unit: "znak\u016F", verb: "m\xEDt" },
    file: { unit: "bajt\u016F", verb: "m\xEDt" },
    array: { unit: "prvk\u016F", verb: "m\xEDt" },
    set: { unit: "prvk\u016F", verb: "m\xEDt" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "regul\xE1rn\xED v\xFDraz",
      email: "e-mailov\xE1 adresa",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "datum a \u010Das ve form\xE1tu ISO",
      date: "datum ve form\xE1tu ISO",
      time: "\u010Das ve form\xE1tu ISO",
      duration: "doba trv\xE1n\xED ISO",
      ipv4: "IPv4 adresa",
      ipv6: "IPv6 adresa",
      cidrv4: "rozsah IPv4",
      cidrv6: "rozsah IPv6",
      base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
      base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
      json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
      e164: "\u010D\xEDslo E.164",
      jwt: "JWT",
      template_literal: "vstup",
    },
    a = {
      nan: "NaN",
      number: "\u010D\xEDslo",
      string: "\u0159et\u011Bzec",
      function: "funkce",
      array: "pole",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${n.expected}, obdr\u017Eeno ${l}`
          : `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${i}, obdr\u017Eeno ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(n.values[0])}`
          : `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${n.origin ?? "hodnota"} mus\xED m\xEDt ${i}${n.maximum.toString()} ${s.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${n.origin ?? "hodnota"} mus\xED b\xFDt ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${n.origin ?? "hodnota"} mus\xED m\xEDt ${i}${n.minimum.toString()} ${s.unit ?? "prvk\u016F"}`
          : `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${n.origin ?? "hodnota"} mus\xED b\xFDt ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${i.prefix}"`
          : i.format === "ends_with"
            ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${i.suffix}"`
            : i.format === "includes"
              ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${i.includes}"`
              : i.format === "regex"
                ? `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${i.pattern}`
                : `Neplatn\xFD form\xE1t ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${n.divisor}`;
      case "unrecognized_keys":
        return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Neplatn\xFD kl\xED\u010D v ${n.origin}`;
      case "invalid_union":
        return "Neplatn\xFD vstup";
      case "invalid_element":
        return `Neplatn\xE1 hodnota v ${n.origin}`;
      default:
        return "Neplatn\xFD vstup";
    }
  };
}, "error");
function as() {
  return { localeError: Wy() };
}
c(as, "default");
var Fy = c(() => {
  let e = {
    string: { unit: "tegn", verb: "havde" },
    file: { unit: "bytes", verb: "havde" },
    array: { unit: "elementer", verb: "indeholdt" },
    set: { unit: "elementer", verb: "indeholdt" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "e-mailadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkesl\xE6t",
      date: "ISO-dato",
      time: "ISO-klokkesl\xE6t",
      duration: "ISO-varighed",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodet streng",
      base64url: "base64url-kodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input",
    },
    a = {
      nan: "NaN",
      string: "streng",
      number: "tal",
      boolean: "boolean",
      array: "liste",
      object: "objekt",
      set: "s\xE6t",
      file: "fil",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ugyldigt input: forventede instanceof ${n.expected}, fik ${l}`
          : `Ugyldigt input: forventede ${i}, fik ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(n.values[0])}`
          : `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `For stor: forventede ${l ?? "value"} ${s.verb} ${i} ${n.maximum.toString()} ${s.unit ?? "elementer"}`
          : `For stor: forventede ${l ?? "value"} havde ${i} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `For lille: forventede ${l} ${s.verb} ${i} ${n.minimum.toString()} ${s.unit}`
          : `For lille: forventede ${l} havde ${i} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ugyldig streng: skal starte med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ugyldig streng: skal ende med "${i.suffix}"`
            : i.format === "includes"
              ? `Ugyldig streng: skal indeholde "${i.includes}"`
              : i.format === "regex"
                ? `Ugyldig streng: skal matche m\xF8nsteret ${i.pattern}`
                : `Ugyldig ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ugyldigt tal: skal v\xE6re deleligt med ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8gle i ${n.origin}`;
      case "invalid_union":
        return "Ugyldigt input: matcher ingen af de tilladte typer";
      case "invalid_element":
        return `Ugyldig v\xE6rdi i ${n.origin}`;
      default:
        return "Ugyldigt input";
    }
  };
}, "error");
function ss() {
  return { localeError: Fy() };
}
c(ss, "default");
var qy = c(() => {
  let e = {
    string: { unit: "Zeichen", verb: "zu haben" },
    file: { unit: "Bytes", verb: "zu haben" },
    array: { unit: "Elemente", verb: "zu haben" },
    set: { unit: "Elemente", verb: "zu haben" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "Eingabe",
      email: "E-Mail-Adresse",
      url: "URL",
      emoji: "Emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-Datum und -Uhrzeit",
      date: "ISO-Datum",
      time: "ISO-Uhrzeit",
      duration: "ISO-Dauer",
      ipv4: "IPv4-Adresse",
      ipv6: "IPv6-Adresse",
      cidrv4: "IPv4-Bereich",
      cidrv6: "IPv6-Bereich",
      base64: "Base64-codierter String",
      base64url: "Base64-URL-codierter String",
      json_string: "JSON-String",
      e164: "E.164-Nummer",
      jwt: "JWT",
      template_literal: "Eingabe",
    },
    a = { nan: "NaN", number: "Zahl", array: "Array" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ung\xFCltige Eingabe: erwartet instanceof ${n.expected}, erhalten ${l}`
          : `Ung\xFCltige Eingabe: erwartet ${i}, erhalten ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(n.values[0])}`
          : `Ung\xFCltige Option: erwartet eine von ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Zu gro\xDF: erwartet, dass ${n.origin ?? "Wert"} ${i}${n.maximum.toString()} ${s.unit ?? "Elemente"} hat`
          : `Zu gro\xDF: erwartet, dass ${n.origin ?? "Wert"} ${i}${n.maximum.toString()} ist`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Zu klein: erwartet, dass ${n.origin} ${i}${n.minimum.toString()} ${s.unit} hat`
          : `Zu klein: erwartet, dass ${n.origin} ${i}${n.minimum.toString()} ist`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ung\xFCltiger String: muss mit "${i.prefix}" beginnen`
          : i.format === "ends_with"
            ? `Ung\xFCltiger String: muss mit "${i.suffix}" enden`
            : i.format === "includes"
              ? `Ung\xFCltiger String: muss "${i.includes}" enthalten`
              : i.format === "regex"
                ? `Ung\xFCltiger String: muss dem Muster ${i.pattern} entsprechen`
                : `Ung\xFCltig: ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ung\xFCltige Zahl: muss ein Vielfaches von ${n.divisor} sein`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ung\xFCltiger Schl\xFCssel in ${n.origin}`;
      case "invalid_union":
        return "Ung\xFCltige Eingabe";
      case "invalid_element":
        return `Ung\xFCltiger Wert in ${n.origin}`;
      default:
        return "Ung\xFCltige Eingabe";
    }
  };
}, "error");
function cs() {
  return { localeError: qy() };
}
c(cs, "default");
var Vy = c(() => {
  let e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      mac: "MAC address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return `Invalid input: expected ${i}, received ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(n.values[0])}`
          : `Invalid option: expected one of ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Too big: expected ${n.origin ?? "value"} to have ${i}${n.maximum.toString()} ${s.unit ?? "elements"}`
          : `Too big: expected ${n.origin ?? "value"} to be ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Too small: expected ${n.origin} to have ${i}${n.minimum.toString()} ${s.unit}`
          : `Too small: expected ${n.origin} to be ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Invalid string: must start with "${i.prefix}"`
          : i.format === "ends_with"
            ? `Invalid string: must end with "${i.suffix}"`
            : i.format === "includes"
              ? `Invalid string: must include "${i.includes}"`
              : i.format === "regex"
                ? `Invalid string: must match pattern ${i.pattern}`
                : `Invalid ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${n.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${n.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${n.origin}`;
      default:
        return "Invalid input";
    }
  };
}, "error");
function sn() {
  return { localeError: Vy() };
}
c(sn, "default");
var Gy = c(() => {
  let e = {
    string: { unit: "karaktrojn", verb: "havi" },
    file: { unit: "bajtojn", verb: "havi" },
    array: { unit: "elementojn", verb: "havi" },
    set: { unit: "elementojn", verb: "havi" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "enigo",
      email: "retadreso",
      url: "URL",
      emoji: "emo\u011Dio",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datotempo",
      date: "ISO-dato",
      time: "ISO-tempo",
      duration: "ISO-da\u016Dro",
      ipv4: "IPv4-adreso",
      ipv6: "IPv6-adreso",
      cidrv4: "IPv4-rango",
      cidrv6: "IPv6-rango",
      base64: "64-ume kodita karaktraro",
      base64url: "URL-64-ume kodita karaktraro",
      json_string: "JSON-karaktraro",
      e164: "E.164-nombro",
      jwt: "JWT",
      template_literal: "enigo",
    },
    a = { nan: "NaN", number: "nombro", array: "tabelo", null: "senvalora" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Nevalida enigo: atendi\u011Dis instanceof ${n.expected}, ricevi\u011Dis ${l}`
          : `Nevalida enigo: atendi\u011Dis ${i}, ricevi\u011Dis ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(n.values[0])}`
          : `Nevalida opcio: atendi\u011Dis unu el ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Tro granda: atendi\u011Dis ke ${n.origin ?? "valoro"} havu ${i}${n.maximum.toString()} ${s.unit ?? "elementojn"}`
          : `Tro granda: atendi\u011Dis ke ${n.origin ?? "valoro"} havu ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Tro malgranda: atendi\u011Dis ke ${n.origin} havu ${i}${n.minimum.toString()} ${s.unit}`
          : `Tro malgranda: atendi\u011Dis ke ${n.origin} estu ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Nevalida karaktraro: devas komenci\u011Di per "${i.prefix}"`
          : i.format === "ends_with"
            ? `Nevalida karaktraro: devas fini\u011Di per "${i.suffix}"`
            : i.format === "includes"
              ? `Nevalida karaktraro: devas inkluzivi "${i.includes}"`
              : i.format === "regex"
                ? `Nevalida karaktraro: devas kongrui kun la modelo ${i.pattern}`
                : `Nevalida ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Nevalida nombro: devas esti oblo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Nekonata${n.keys.length > 1 ? "j" : ""} \u015Dlosilo${n.keys.length > 1 ? "j" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Nevalida \u015Dlosilo en ${n.origin}`;
      case "invalid_union":
        return "Nevalida enigo";
      case "invalid_element":
        return `Nevalida valoro en ${n.origin}`;
      default:
        return "Nevalida enigo";
    }
  };
}, "error");
function ls() {
  return { localeError: Gy() };
}
c(ls, "default");
var Ky = c(() => {
  let e = {
    string: { unit: "caracteres", verb: "tener" },
    file: { unit: "bytes", verb: "tener" },
    array: { unit: "elementos", verb: "tener" },
    set: { unit: "elementos", verb: "tener" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "entrada",
      email: "direcci\xF3n de correo electr\xF3nico",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "fecha y hora ISO",
      date: "fecha ISO",
      time: "hora ISO",
      duration: "duraci\xF3n ISO",
      ipv4: "direcci\xF3n IPv4",
      ipv6: "direcci\xF3n IPv6",
      cidrv4: "rango IPv4",
      cidrv6: "rango IPv6",
      base64: "cadena codificada en base64",
      base64url: "URL codificada en base64",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    a = {
      nan: "NaN",
      string: "texto",
      number: "n\xFAmero",
      boolean: "booleano",
      array: "arreglo",
      object: "objeto",
      set: "conjunto",
      file: "archivo",
      date: "fecha",
      bigint: "n\xFAmero grande",
      symbol: "s\xEDmbolo",
      undefined: "indefinido",
      null: "nulo",
      function: "funci\xF3n",
      map: "mapa",
      record: "registro",
      tuple: "tupla",
      enum: "enumeraci\xF3n",
      union: "uni\xF3n",
      literal: "literal",
      promise: "promesa",
      void: "vac\xEDo",
      never: "nunca",
      unknown: "desconocido",
      any: "cualquiera",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entrada inv\xE1lida: se esperaba instanceof ${n.expected}, recibido ${l}`
          : `Entrada inv\xE1lida: se esperaba ${i}, recibido ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(n.values[0])}`
          : `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `Demasiado grande: se esperaba que ${l ?? "valor"} tuviera ${i}${n.maximum.toString()} ${s.unit ?? "elementos"}`
          : `Demasiado grande: se esperaba que ${l ?? "valor"} fuera ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = a[n.origin] ?? n.origin;
        return s
          ? `Demasiado peque\xF1o: se esperaba que ${l} tuviera ${i}${n.minimum.toString()} ${s.unit}`
          : `Demasiado peque\xF1o: se esperaba que ${l} fuera ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Cadena inv\xE1lida: debe comenzar con "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cadena inv\xE1lida: debe terminar en "${i.suffix}"`
            : i.format === "includes"
              ? `Cadena inv\xE1lida: debe incluir "${i.includes}"`
              : i.format === "regex"
                ? `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${i.pattern}`
                : `Inv\xE1lido ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Llave${n.keys.length > 1 ? "s" : ""} desconocida${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${a[n.origin] ?? n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${a[n.origin] ?? n.origin}`;
      default:
        return "Entrada inv\xE1lida";
    }
  };
}, "error");
function ds() {
  return { localeError: Ky() };
}
c(ds, "default");
var Hy = c(() => {
  let e = {
    string: {
      unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    file: {
      unit: "\u0628\u0627\u06CC\u062A",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    array: {
      unit: "\u0622\u06CC\u062A\u0645",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
    set: {
      unit: "\u0622\u06CC\u062A\u0645",
      verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0648\u0631\u0648\u062F\u06CC",
      email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
      url: "URL",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
      time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      ipv4: "IPv4 \u0622\u062F\u0631\u0633",
      ipv6: "IPv6 \u0622\u062F\u0631\u0633",
      cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
      cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
      base64: "base64-encoded \u0631\u0634\u062A\u0647",
      base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
      json_string: "JSON \u0631\u0634\u062A\u0647",
      e164: "E.164 \u0639\u062F\u062F",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u06CC",
    },
    a = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0622\u0631\u0627\u06CC\u0647" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${n.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
          : `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${i} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${l} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(n.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`
          : `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(n.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${n.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${i}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${n.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${i}${n.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${n.origin} \u0628\u0627\u06CC\u062F ${i}${n.minimum.toString()} ${s.unit} \u0628\u0627\u0634\u062F`
          : `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${n.origin} \u0628\u0627\u06CC\u062F ${i}${n.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${i.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`
          : i.format === "ends_with"
            ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${i.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`
            : i.format === "includes"
              ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${i.includes}" \u0628\u0627\u0634\u062F`
              : i.format === "regex"
                ? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${i.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`
                : `${r[i.format] ?? n.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
      case "not_multiple_of":
        return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${n.divisor} \u0628\u0627\u0634\u062F`;
      case "unrecognized_keys":
        return `\u06A9\u0644\u06CC\u062F${n.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${n.origin}`;
      case "invalid_union":
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
      case "invalid_element":
        return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${n.origin}`;
      default:
        return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631";
    }
  };
}, "error");
function us() {
  return { localeError: Hy() };
}
c(us, "default");
var Jy = c(() => {
  let e = {
    string: { unit: "merkki\xE4", subject: "merkkijonon" },
    file: { unit: "tavua", subject: "tiedoston" },
    array: { unit: "alkiota", subject: "listan" },
    set: { unit: "alkiota", subject: "joukon" },
    number: { unit: "", subject: "luvun" },
    bigint: { unit: "", subject: "suuren kokonaisluvun" },
    int: { unit: "", subject: "kokonaisluvun" },
    date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "s\xE4\xE4nn\xF6llinen lauseke",
      email: "s\xE4hk\xF6postiosoite",
      url: "URL-osoite",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-aikaleima",
      date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
      time: "ISO-aika",
      duration: "ISO-kesto",
      ipv4: "IPv4-osoite",
      ipv6: "IPv6-osoite",
      cidrv4: "IPv4-alue",
      cidrv6: "IPv6-alue",
      base64: "base64-koodattu merkkijono",
      base64url: "base64url-koodattu merkkijono",
      json_string: "JSON-merkkijono",
      e164: "E.164-luku",
      jwt: "JWT",
      template_literal: "templaattimerkkijono",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Virheellinen tyyppi: odotettiin instanceof ${n.expected}, oli ${l}`
          : `Virheellinen tyyppi: odotettiin ${i}, oli ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(n.values[0])}`
          : `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Liian suuri: ${s.subject} t\xE4ytyy olla ${i}${n.maximum.toString()} ${s.unit}`.trim()
          : `Liian suuri: arvon t\xE4ytyy olla ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Liian pieni: ${s.subject} t\xE4ytyy olla ${i}${n.minimum.toString()} ${s.unit}`.trim()
          : `Liian pieni: arvon t\xE4ytyy olla ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${i.prefix}"`
          : i.format === "ends_with"
            ? `Virheellinen sy\xF6te: t\xE4ytyy loppua "${i.suffix}"`
            : i.format === "includes"
              ? `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${i.includes}"`
              : i.format === "regex"
                ? `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${i.pattern}`
                : `Virheellinen ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Virheellinen luku: t\xE4ytyy olla luvun ${n.divisor} monikerta`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return "Virheellinen avain tietueessa";
      case "invalid_union":
        return "Virheellinen unioni";
      case "invalid_element":
        return "Virheellinen arvo joukossa";
      default:
        return "Virheellinen sy\xF6te";
    }
  };
}, "error");
function ps() {
  return { localeError: Jy() };
}
c(ps, "default");
var Yy = c(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "entr\xE9e",
      email: "adresse e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date et heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e",
    },
    a = { nan: "NaN", number: "nombre", array: "tableau" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entr\xE9e invalide : instanceof ${n.expected} attendu, ${l} re\xE7u`
          : `Entr\xE9e invalide : ${i} attendu, ${l} re\xE7u`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entr\xE9e invalide : ${stringifyPrimitive(n.values[0])} attendu`
          : `Option invalide : une valeur parmi ${joinValues(n.values, "|")} attendue`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Trop grand : ${n.origin ?? "valeur"} doit ${s.verb} ${i}${n.maximum.toString()} ${s.unit ?? "\xE9l\xE9ment(s)"}`
          : `Trop grand : ${n.origin ?? "valeur"} doit \xEAtre ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Trop petit : ${n.origin} doit ${s.verb} ${i}${n.minimum.toString()} ${s.unit}`
          : `Trop petit : ${n.origin} doit \xEAtre ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${i.suffix}"`
            : i.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${i.includes}"`
              : i.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au mod\xE8le ${i.pattern}`
                : `${r[i.format] ?? n.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${n.keys.length > 1 ? "s" : ""} non reconnue${n.keys.length > 1 ? "s" : ""} : ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${n.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${n.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function ms() {
  return { localeError: Yy() };
}
c(ms, "default");
var Xy = c(() => {
  let e = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "entr\xE9e",
      email: "adresse courriel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date-heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Entr\xE9e invalide : attendu instanceof ${n.expected}, re\xE7u ${l}`
          : `Entr\xE9e invalide : attendu ${i}, re\xE7u ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entr\xE9e invalide : attendu ${stringifyPrimitive(n.values[0])}`
          : `Option invalide : attendu l'une des valeurs suivantes ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "\u2264" : "<",
          s = getSizing(n.origin);
        return s
          ? `Trop grand : attendu que ${n.origin ?? "la valeur"} ait ${i}${n.maximum.toString()} ${s.unit}`
          : `Trop grand : attendu que ${n.origin ?? "la valeur"} soit ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? "\u2265" : ">",
          s = getSizing(n.origin);
        return s
          ? `Trop petit : attendu que ${n.origin} ait ${i}${n.minimum.toString()} ${s.unit}`
          : `Trop petit : attendu que ${n.origin} soit ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Cha\xEEne invalide : doit commencer par "${i.prefix}"`
          : i.format === "ends_with"
            ? `Cha\xEEne invalide : doit se terminer par "${i.suffix}"`
            : i.format === "includes"
              ? `Cha\xEEne invalide : doit inclure "${i.includes}"`
              : i.format === "regex"
                ? `Cha\xEEne invalide : doit correspondre au motif ${i.pattern}`
                : `${r[i.format] ?? n.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${n.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${n.keys.length > 1 ? "s" : ""} non reconnue${n.keys.length > 1 ? "s" : ""} : ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${n.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${n.origin}`;
      default:
        return "Entr\xE9e invalide";
    }
  };
}, "error");
function gs() {
  return { localeError: Xy() };
}
c(gs, "default");
var Qy = c(() => {
  let e = {
      string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
      number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
      boolean: {
        label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9",
        gender: "m",
      },
      bigint: { label: "BigInt", gender: "m" },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
      array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
      object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
      null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
      undefined: {
        label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)",
        gender: "m",
      },
      symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
      function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
      map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
      set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
      file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
      promise: { label: "Promise", gender: "m" },
      NaN: { label: "NaN", gender: "m" },
      unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
      value: { label: "\u05E2\u05E8\u05DA", gender: "m" },
    },
    o = {
      string: {
        unit: "\u05EA\u05D5\u05D5\u05D9\u05DD",
        shortLabel: "\u05E7\u05E6\u05E8",
        longLabel: "\u05D0\u05E8\u05D5\u05DA",
      },
      file: {
        unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      array: {
        unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      set: {
        unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD",
        shortLabel: "\u05E7\u05D8\u05DF",
        longLabel: "\u05D2\u05D3\u05D5\u05DC",
      },
      number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    },
    r = c((u) => (u ? e[u] : void 0), "typeEntry"),
    a = c((u) => {
      let h = r(u);
      return h ? h.label : (u ?? e.unknown.label);
    }, "typeLabel"),
    n = c((u) => `\u05D4${a(u)}`, "withDefinite"),
    i = c(
      (u) =>
        (r(u)?.gender ?? "m") === "f"
          ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA"
          : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA",
      "verbFor",
    ),
    s = c((u) => (u ? (o[u] ?? null) : null), "getSizing"),
    l = {
      regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      email: {
        label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC",
        gender: "f",
      },
      url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
      emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
      uuid: { label: "UUID", gender: "m" },
      nanoid: { label: "nanoid", gender: "m" },
      guid: { label: "GUID", gender: "m" },
      cuid: { label: "cuid", gender: "m" },
      cuid2: { label: "cuid2", gender: "m" },
      ulid: { label: "ULID", gender: "m" },
      xid: { label: "XID", gender: "m" },
      ksuid: { label: "KSUID", gender: "m" },
      datetime: {
        label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO",
        gender: "m",
      },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
      time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
      duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
      ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
      ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
      cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
      cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
      base64: {
        label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64",
        gender: "f",
      },
      base64url: {
        label:
          "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA",
        gender: "f",
      },
      json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
      e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
      jwt: { label: "JWT", gender: "m" },
      ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    },
    p = { nan: "NaN" };
  return (u) => {
    switch (u.code) {
      case "invalid_type": {
        let h = u.expected,
          b = p[h ?? ""] ?? a(h),
          S = parsedType(u.input),
          _ = p[S] ?? e[S]?.label ?? S;
        return /^[A-Z]/.test(u.expected)
          ? `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${u.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${_}`
          : `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${b}, \u05D4\u05EA\u05E7\u05D1\u05DC ${_}`;
      }
      case "invalid_value": {
        if (u.values.length === 1)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(u.values[0])}`;
        let h = u.values.map((_) => stringifyPrimitive(_));
        if (u.values.length === 2)
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${h[0]} \u05D0\u05D5 ${h[1]}`;
        let b = h[h.length - 1];
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${h.slice(0, -1).join(", ")} \u05D0\u05D5 ${b}`;
      }
      case "too_big": {
        let h = s(u.origin),
          b = n(u.origin ?? "value");
        if (u.origin === "string")
          return `${h?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${b} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${u.maximum.toString()} ${h?.unit ?? ""} ${u.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        if (u.origin === "number") {
          let z = u.inclusive
            ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${u.maximum}`
            : `\u05E7\u05D8\u05DF \u05DE-${u.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${b} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${z}`;
        }
        if (u.origin === "array" || u.origin === "set") {
          let z =
              u.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA",
            $ = u.inclusive
              ? `${u.maximum} ${h?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA`
              : `\u05E4\u05D7\u05D5\u05EA \u05DE-${u.maximum} ${h?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${b} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${$}`.trim();
        }
        let S = u.inclusive ? "<=" : "<",
          _ = i(u.origin ?? "value");
        return h?.unit
          ? `${h.longLabel} \u05DE\u05D3\u05D9: ${b} ${_} ${S}${u.maximum.toString()} ${h.unit}`
          : `${h?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${b} ${_} ${S}${u.maximum.toString()}`;
      }
      case "too_small": {
        let h = s(u.origin),
          b = n(u.origin ?? "value");
        if (u.origin === "string")
          return `${h?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${b} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${u.minimum.toString()} ${h?.unit ?? ""} ${u.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        if (u.origin === "number") {
          let z = u.inclusive
            ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${u.minimum}`
            : `\u05D2\u05D3\u05D5\u05DC \u05DE-${u.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${b} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${z}`;
        }
        if (u.origin === "array" || u.origin === "set") {
          let z =
            u.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (u.minimum === 1 && u.inclusive) {
            let xe =
              (u.origin === "set",
              "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3");
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${b} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${xe}`;
          }
          let $ = u.inclusive
            ? `${u.minimum} ${h?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8`
            : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${u.minimum} ${h?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${b} ${z} \u05DC\u05D4\u05DB\u05D9\u05DC ${$}`.trim();
        }
        let S = u.inclusive ? ">=" : ">",
          _ = i(u.origin ?? "value");
        return h?.unit
          ? `${h.shortLabel} \u05DE\u05D3\u05D9: ${b} ${_} ${S}${u.minimum.toString()} ${h.unit}`
          : `${h?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${b} ${_} ${S}${u.minimum.toString()}`;
      }
      case "invalid_format": {
        let h = u;
        if (h.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${h.prefix}"`;
        if (h.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${h.suffix}"`;
        if (h.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${h.includes}"`;
        if (h.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${h.pattern}`;
        let b = l[h.format],
          S = b?.label ?? h.format,
          z =
            (b?.gender ?? "m") === "f"
              ? "\u05EA\u05E7\u05D9\u05E0\u05D4"
              : "\u05EA\u05E7\u05D9\u05DF";
        return `${S} \u05DC\u05D0 ${z}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${u.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${u.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${u.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(u.keys, ", ")}`;
      case "invalid_key":
        return "\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8";
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element":
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${n(u.origin ?? "array")}`;
      default:
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
    }
  };
}, "error");
function fs() {
  return { localeError: Qy() };
}
c(fs, "default");
var eb = c(() => {
  let e = {
    string: { unit: "karakter", verb: "legyen" },
    file: { unit: "byte", verb: "legyen" },
    array: { unit: "elem", verb: "legyen" },
    set: { unit: "elem", verb: "legyen" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "bemenet",
      email: "email c\xEDm",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO id\u0151b\xE9lyeg",
      date: "ISO d\xE1tum",
      time: "ISO id\u0151",
      duration: "ISO id\u0151intervallum",
      ipv4: "IPv4 c\xEDm",
      ipv6: "IPv6 c\xEDm",
      cidrv4: "IPv4 tartom\xE1ny",
      cidrv6: "IPv6 tartom\xE1ny",
      base64: "base64-k\xF3dolt string",
      base64url: "base64url-k\xF3dolt string",
      json_string: "JSON string",
      e164: "E.164 sz\xE1m",
      jwt: "JWT",
      template_literal: "bemenet",
    },
    a = { nan: "NaN", number: "sz\xE1m", array: "t\xF6mb" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${n.expected}, a kapott \xE9rt\xE9k ${l}`
          : `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${i}, a kapott \xE9rt\xE9k ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(n.values[0])}`
          : `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `T\xFAl nagy: ${n.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${i}${n.maximum.toString()} ${s.unit ?? "elem"}`
          : `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${n.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${n.origin} m\xE9rete t\xFAl kicsi ${i}${n.minimum.toString()} ${s.unit}`
          : `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${n.origin} t\xFAl kicsi ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\xC9rv\xE9nytelen string: "${i.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`
          : i.format === "ends_with"
            ? `\xC9rv\xE9nytelen string: "${i.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`
            : i.format === "includes"
              ? `\xC9rv\xE9nytelen string: "${i.includes}" \xE9rt\xE9ket kell tartalmaznia`
              : i.format === "regex"
                ? `\xC9rv\xE9nytelen string: ${i.pattern} mint\xE1nak kell megfelelnie`
                : `\xC9rv\xE9nytelen ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\xC9rv\xE9nytelen sz\xE1m: ${n.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
      case "unrecognized_keys":
        return `Ismeretlen kulcs${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\xC9rv\xE9nytelen kulcs ${n.origin}`;
      case "invalid_union":
        return "\xC9rv\xE9nytelen bemenet";
      case "invalid_element":
        return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${n.origin}`;
      default:
        return "\xC9rv\xE9nytelen bemenet";
    }
  };
}, "error");
function hs() {
  return { localeError: eb() };
}
c(hs, "default");
function getArmenianPlural(e, o, r) {
  return Math.abs(e) === 1 ? o : r;
}
c(getArmenianPlural, "getArmenianPlural");
function withDefiniteArticle(e) {
  if (!e) return "";
  let o = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"],
    r = e[e.length - 1];
  return e + (o.includes(r) ? "\u0576" : "\u0568");
}
c(withDefiniteArticle, "withDefiniteArticle");
var tb = c(() => {
  let e = {
    string: {
      unit: { one: "\u0576\u0577\u0561\u0576", many: "\u0576\u0577\u0561\u0576\u0576\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    file: {
      unit: { one: "\u0562\u0561\u0575\u0569", many: "\u0562\u0561\u0575\u0569\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    array: {
      unit: { one: "\u057F\u0561\u0580\u0580", many: "\u057F\u0561\u0580\u0580\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
    set: {
      unit: { one: "\u057F\u0561\u0580\u0580", many: "\u057F\u0561\u0580\u0580\u0565\u0580" },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0574\u0578\u0582\u057F\u0584",
      email: "\u0567\u056C. \u0570\u0561\u057D\u0581\u0565",
      url: "URL",
      emoji: "\u0567\u0574\u0578\u057B\u056B",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E \u0587 \u056A\u0561\u0574",
      date: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E",
      time: "ISO \u056A\u0561\u0574",
      duration: "ISO \u057F\u0587\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
      ipv4: "IPv4 \u0570\u0561\u057D\u0581\u0565",
      ipv6: "IPv6 \u0570\u0561\u057D\u0581\u0565",
      cidrv4: "IPv4 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
      cidrv6: "IPv6 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
      base64: "base64 \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
      base64url: "base64url \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
      json_string: "JSON \u057F\u0578\u0572",
      e164: "E.164 \u0570\u0561\u0574\u0561\u0580",
      jwt: "JWT",
      template_literal: "\u0574\u0578\u0582\u057F\u0584",
    },
    a = {
      nan: "NaN",
      number: "\u0569\u056B\u057E",
      array: "\u0566\u0561\u0576\u0563\u057E\u0561\u056E",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${n.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`
          : `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${i}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(n.values[1])}`
          : `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            p = getArmenianPlural(l, s.unit.one, s.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${i}${n.maximum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            p = getArmenianPlural(l, s.unit.one, s.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${i}${n.minimum.toString()} ${p}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(n.origin)} \u056C\u056B\u0576\u056B ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${i.prefix}"-\u0578\u057E`
          : i.format === "ends_with"
            ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${i.suffix}"-\u0578\u057E`
            : i.format === "includes"
              ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${i.includes}"`
              : i.format === "regex"
                ? `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${i.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`
                : `\u054D\u056D\u0561\u056C ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u054D\u056D\u0561\u056C \u0569\u056B\u057E\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0562\u0561\u0566\u0574\u0561\u057A\u0561\u057F\u056B\u056F \u056C\u056B\u0576\u056B ${n.divisor}-\u056B`;
      case "unrecognized_keys":
        return `\u0549\u0573\u0561\u0576\u0561\u0579\u057E\u0561\u056E \u0562\u0561\u0576\u0561\u056C\u056B${n.keys.length > 1 ? "\u0576\u0565\u0580" : ""}. ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u054D\u056D\u0561\u056C \u0562\u0561\u0576\u0561\u056C\u056B ${withDefiniteArticle(n.origin)}-\u0578\u0582\u0574`;
      case "invalid_union":
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
      case "invalid_element":
        return `\u054D\u056D\u0561\u056C \u0561\u0580\u056A\u0565\u0584 ${withDefiniteArticle(n.origin)}-\u0578\u0582\u0574`;
      default:
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
    }
  };
}, "error");
function ys() {
  return { localeError: tb() };
}
c(ys, "default");
var nb = c(() => {
  let e = {
    string: { unit: "karakter", verb: "memiliki" },
    file: { unit: "byte", verb: "memiliki" },
    array: { unit: "item", verb: "memiliki" },
    set: { unit: "item", verb: "memiliki" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "alamat email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tanggal dan waktu format ISO",
      date: "tanggal format ISO",
      time: "jam format ISO",
      duration: "durasi format ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "rentang alamat IPv4",
      cidrv6: "rentang alamat IPv6",
      base64: "string dengan enkode base64",
      base64url: "string dengan enkode base64url",
      json_string: "string JSON",
      e164: "angka E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input tidak valid: diharapkan instanceof ${n.expected}, diterima ${l}`
          : `Input tidak valid: diharapkan ${i}, diterima ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input tidak valid: diharapkan ${stringifyPrimitive(n.values[0])}`
          : `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Terlalu besar: diharapkan ${n.origin ?? "value"} memiliki ${i}${n.maximum.toString()} ${s.unit ?? "elemen"}`
          : `Terlalu besar: diharapkan ${n.origin ?? "value"} menjadi ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Terlalu kecil: diharapkan ${n.origin} memiliki ${i}${n.minimum.toString()} ${s.unit}`
          : `Terlalu kecil: diharapkan ${n.origin} menjadi ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `String tidak valid: harus dimulai dengan "${i.prefix}"`
          : i.format === "ends_with"
            ? `String tidak valid: harus berakhir dengan "${i.suffix}"`
            : i.format === "includes"
              ? `String tidak valid: harus menyertakan "${i.includes}"`
              : i.format === "regex"
                ? `String tidak valid: harus sesuai pola ${i.pattern}`
                : `${r[i.format] ?? n.format} tidak valid`;
      }
      case "not_multiple_of":
        return `Angka tidak valid: harus kelipatan dari ${n.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali ${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak valid di ${n.origin}`;
      case "invalid_union":
        return "Input tidak valid";
      case "invalid_element":
        return `Nilai tidak valid di ${n.origin}`;
      default:
        return "Input tidak valid";
    }
  };
}, "error");
function bs() {
  return { localeError: nb() };
}
c(bs, "default");
var ob = c(() => {
  let e = {
    string: { unit: "stafi", verb: "a\xF0 hafa" },
    file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
    array: { unit: "hluti", verb: "a\xF0 hafa" },
    set: { unit: "hluti", verb: "a\xF0 hafa" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "gildi",
      email: "netfang",
      url: "vefsl\xF3\xF0",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dagsetning og t\xEDmi",
      date: "ISO dagsetning",
      time: "ISO t\xEDmi",
      duration: "ISO t\xEDmalengd",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded strengur",
      base64url: "base64url-encoded strengur",
      json_string: "JSON strengur",
      e164: "E.164 t\xF6lugildi",
      jwt: "JWT",
      template_literal: "gildi",
    },
    a = { nan: "NaN", number: "n\xFAmer", array: "fylki" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera instanceof ${n.expected}`
          : `Rangt gildi: \xDE\xFA sl\xF3st inn ${l} \xFEar sem \xE1 a\xF0 vera ${i}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(n.values[0])}`
          : `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin ?? "gildi"} hafi ${i}${n.maximum.toString()} ${s.unit ?? "hluti"}`
          : `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin ?? "gildi"} s\xE9 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin} hafi ${i}${n.minimum.toString()} ${s.unit}`
          : `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${n.origin} s\xE9 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${i.suffix}"`
            : i.format === "includes"
              ? `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${i.includes}"`
              : i.format === "regex"
                ? `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${i.pattern}`
                : `Rangt ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${n.divisor}`;
      case "unrecognized_keys":
        return `\xD3\xFEekkt ${n.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Rangur lykill \xED ${n.origin}`;
      case "invalid_union":
        return "Rangt gildi";
      case "invalid_element":
        return `Rangt gildi \xED ${n.origin}`;
      default:
        return "Rangt gildi";
    }
  };
}, "error");
function vs() {
  return { localeError: ob() };
}
c(vs, "default");
var rb = c(() => {
  let e = {
    string: { unit: "caratteri", verb: "avere" },
    file: { unit: "byte", verb: "avere" },
    array: { unit: "elementi", verb: "avere" },
    set: { unit: "elementi", verb: "avere" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "indirizzo email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e ora ISO",
      date: "data ISO",
      time: "ora ISO",
      duration: "durata ISO",
      ipv4: "indirizzo IPv4",
      ipv6: "indirizzo IPv6",
      cidrv4: "intervallo IPv4",
      cidrv6: "intervallo IPv6",
      base64: "stringa codificata in base64",
      base64url: "URL codificata in base64",
      json_string: "stringa JSON",
      e164: "numero E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN", number: "numero", array: "vettore" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input non valido: atteso instanceof ${n.expected}, ricevuto ${l}`
          : `Input non valido: atteso ${i}, ricevuto ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input non valido: atteso ${stringifyPrimitive(n.values[0])}`
          : `Opzione non valida: atteso uno tra ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Troppo grande: ${n.origin ?? "valore"} deve avere ${i}${n.maximum.toString()} ${s.unit ?? "elementi"}`
          : `Troppo grande: ${n.origin ?? "valore"} deve essere ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Troppo piccolo: ${n.origin} deve avere ${i}${n.minimum.toString()} ${s.unit}`
          : `Troppo piccolo: ${n.origin} deve essere ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Stringa non valida: deve iniziare con "${i.prefix}"`
          : i.format === "ends_with"
            ? `Stringa non valida: deve terminare con "${i.suffix}"`
            : i.format === "includes"
              ? `Stringa non valida: deve includere "${i.includes}"`
              : i.format === "regex"
                ? `Stringa non valida: deve corrispondere al pattern ${i.pattern}`
                : `Invalid ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Numero non valido: deve essere un multiplo di ${n.divisor}`;
      case "unrecognized_keys":
        return `Chiav${n.keys.length > 1 ? "i" : "e"} non riconosciut${n.keys.length > 1 ? "e" : "a"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Chiave non valida in ${n.origin}`;
      case "invalid_union":
        return "Input non valido";
      case "invalid_element":
        return `Valore non valido in ${n.origin}`;
      default:
        return "Input non valido";
    }
  };
}, "error");
function Ss() {
  return { localeError: rb() };
}
c(Ss, "default");
var ib = c(() => {
  let e = {
    string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
    file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
    array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
    set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u5165\u529B\u5024",
      email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
      url: "URL",
      emoji: "\u7D75\u6587\u5B57",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u6642",
      date: "ISO\u65E5\u4ED8",
      time: "ISO\u6642\u523B",
      duration: "ISO\u671F\u9593",
      ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
      ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
      cidrv4: "IPv4\u7BC4\u56F2",
      cidrv6: "IPv6\u7BC4\u56F2",
      base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      json_string: "JSON\u6587\u5B57\u5217",
      e164: "E.164\u756A\u53F7",
      jwt: "JWT",
      template_literal: "\u5165\u529B\u5024",
    },
    a = { nan: "NaN", number: "\u6570\u5024", array: "\u914D\u5217" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u7121\u52B9\u306A\u5165\u529B: instanceof ${n.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u5165\u529B: ${i}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${l}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(n.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`
          : `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(n.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        let i = n.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044",
          s = getSizing(n.origin);
        return s
          ? `\u5927\u304D\u3059\u304E\u308B\u5024: ${n.origin ?? "\u5024"}\u306F${n.maximum.toString()}${s.unit ?? "\u8981\u7D20"}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5927\u304D\u3059\u304E\u308B\u5024: ${n.origin ?? "\u5024"}\u306F${n.maximum.toString()}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        let i = n.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044",
          s = getSizing(n.origin);
        return s
          ? `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${n.origin}\u306F${n.minimum.toString()}${s.unit}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${n.origin}\u306F${n.minimum.toString()}${i}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          : i.format === "ends_with"
            ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
            : i.format === "includes"
              ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${i.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
              : i.format === "regex"
                ? `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${i.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
                : `\u7121\u52B9\u306A${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u52B9\u306A\u6570\u5024: ${n.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "unrecognized_keys":
        return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${n.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(n.keys, "\u3001")}`;
      case "invalid_key":
        return `${n.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
      case "invalid_union":
        return "\u7121\u52B9\u306A\u5165\u529B";
      case "invalid_element":
        return `${n.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
      default:
        return "\u7121\u52B9\u306A\u5165\u529B";
    }
  };
}, "error");
function _s() {
  return { localeError: ib() };
}
c(_s, "default");
var ab = c(() => {
  let e = {
    string: {
      unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    file: {
      unit: "\u10D1\u10D0\u10D8\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    array: {
      unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
    set: {
      unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8",
      verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
      email:
        "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      url: "URL",
      emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
      date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
      time: "\u10D3\u10E0\u10DD",
      duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
      ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      base64:
        "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      base64url:
        "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      json_string: "JSON \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
      jwt: "JWT",
      template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
    },
    a = {
      nan: "NaN",
      number: "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8",
      string: "\u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
      function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0",
      array: "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${n.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${i}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(n.values[0])}`
          : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(n.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${s.verb} ${i}${n.maximum.toString()} ${s.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin} ${s.verb} ${i}${n.minimum.toString()} ${s.unit}`
          : `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${n.origin} \u10D8\u10E7\u10DD\u10E1 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${i.prefix}"-\u10D8\u10D7`
          : i.format === "ends_with"
            ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${i.suffix}"-\u10D8\u10D7`
            : i.format === "includes"
              ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${i.includes}"-\u10E1`
              : i.format === "regex"
                ? `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${i.pattern}`
                : `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${n.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
      case "unrecognized_keys":
        return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${n.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${n.origin}-\u10E8\u10D8`;
      case "invalid_union":
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
      case "invalid_element":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${n.origin}-\u10E8\u10D8`;
      default:
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
    }
  };
}, "error");
function xs() {
  return { localeError: ab() };
}
c(xs, "default");
var sb = c(() => {
  let e = {
    string: {
      unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A",
      verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793",
    },
    file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
      email:
        "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
      url: "URL",
      emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
      date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
      time: "\u1798\u17C9\u17C4\u1784 ISO",
      duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
      ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      base64:
        "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
      base64url:
        "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
      json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
      e164: "\u179B\u17C1\u1781 E.164",
      jwt: "JWT",
      template_literal:
        "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
    },
    a = {
      nan: "NaN",
      number: "\u179B\u17C1\u1781",
      array: "\u17A2\u17B6\u179A\u17C1 (Array)",
      null: "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${n.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`
          : `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${i} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(n.values[0])}`
          : `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${i} ${n.maximum.toString()} ${s.unit ?? "\u1792\u17B6\u178F\u17BB"}`
          : `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${i} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin} ${i} ${n.minimum.toString()} ${s.unit}`
          : `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${n.origin} ${i} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${i.suffix}"`
            : i.format === "includes"
              ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${i.includes}"`
              : i.format === "regex"
                ? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${i.pattern}`
                : `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${n.divisor}`;
      case "unrecognized_keys":
        return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${n.origin}`;
      case "invalid_union":
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
      case "invalid_element":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${n.origin}`;
      default:
        return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C";
    }
  };
}, "error");
function cn() {
  return { localeError: sb() };
}
c(cn, "default");
function ks() {
  return cn();
}
c(ks, "default");
var cb = c(() => {
  let e = {
    string: { unit: "\uBB38\uC790", verb: "to have" },
    file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
    array: { unit: "\uAC1C", verb: "to have" },
    set: { unit: "\uAC1C", verb: "to have" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\uC785\uB825",
      email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
      url: "URL",
      emoji: "\uC774\uBAA8\uC9C0",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
      date: "ISO \uB0A0\uC9DC",
      time: "ISO \uC2DC\uAC04",
      duration: "ISO \uAE30\uAC04",
      ipv4: "IPv4 \uC8FC\uC18C",
      ipv6: "IPv6 \uC8FC\uC18C",
      cidrv4: "IPv4 \uBC94\uC704",
      cidrv6: "IPv6 \uBC94\uC704",
      base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      json_string: "JSON \uBB38\uC790\uC5F4",
      e164: "E.164 \uBC88\uD638",
      jwt: "JWT",
      template_literal: "\uC785\uB825",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${n.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${i}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${l}\uC785\uB2C8\uB2E4`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(n.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`
          : `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(n.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        let i = n.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC",
          s =
            i === "\uBBF8\uB9CC"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(n.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${n.maximum.toString()}${p} ${i}${s}`
          : `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${n.maximum.toString()} ${i}${s}`;
      }
      case "too_small": {
        let i = n.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC",
          s =
            i === "\uC774\uC0C1"
              ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"
              : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
          l = getSizing(n.origin),
          p = l?.unit ?? "\uC694\uC18C";
        return l
          ? `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${n.minimum.toString()}${p} ${i}${s}`
          : `${n.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${n.minimum.toString()} ${i}${s}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`
          : i.format === "ends_with"
            ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`
            : i.format === "includes"
              ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${i.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`
              : i.format === "regex"
                ? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${i.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`
                : `\uC798\uBABB\uB41C ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\uC798\uBABB\uB41C \uC22B\uC790: ${n.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "unrecognized_keys":
        return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\uC798\uBABB\uB41C \uD0A4: ${n.origin}`;
      case "invalid_union":
        return "\uC798\uBABB\uB41C \uC785\uB825";
      case "invalid_element":
        return `\uC798\uBABB\uB41C \uAC12: ${n.origin}`;
      default:
        return "\uC798\uBABB\uB41C \uC785\uB825";
    }
  };
}, "error");
function Is() {
  return { localeError: cb() };
}
c(Is, "default");
var ln = c((e) => e.charAt(0).toUpperCase() + e.slice(1), "capitalizeFirstCharacter");
function getUnitTypeFromNumber(e) {
  let o = Math.abs(e),
    r = o % 10,
    a = o % 100;
  return (a >= 11 && a <= 19) || r === 0 ? "many" : r === 1 ? "one" : "few";
}
c(getUnitTypeFromNumber, "getUnitTypeFromNumber");
var lb = c(() => {
  let e = {
    string: {
      unit: { one: "simbolis", few: "simboliai", many: "simboli\u0173" },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
          notInclusive: "turi b\u016Bti trumpesn\u0117 kaip",
        },
        bigger: {
          inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
          notInclusive: "turi b\u016Bti ilgesn\u0117 kaip",
        },
      },
    },
    file: {
      unit: { one: "baitas", few: "baitai", many: "bait\u0173" },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne didesnis kaip",
          notInclusive: "turi b\u016Bti ma\u017Eesnis kaip",
        },
        bigger: {
          inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
          notInclusive: "turi b\u016Bti didesnis kaip",
        },
      },
    },
    array: {
      unit: { one: "element\u0105", few: "elementus", many: "element\u0173" },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip",
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip",
        },
      },
    },
    set: {
      unit: { one: "element\u0105", few: "elementus", many: "element\u0173" },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip",
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip",
        },
      },
    },
  };
  function getSizing(n, i, s, l) {
    let p = e[n] ?? null;
    return p === null ? p : { unit: p.unit[i], verb: p.verb[l][s ? "inclusive" : "notInclusive"] };
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u012Fvestis",
      email: "el. pa\u0161to adresas",
      url: "URL",
      emoji: "jaustukas",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO data ir laikas",
      date: "ISO data",
      time: "ISO laikas",
      duration: "ISO trukm\u0117",
      ipv4: "IPv4 adresas",
      ipv6: "IPv6 adresas",
      cidrv4: "IPv4 tinklo prefiksas (CIDR)",
      cidrv6: "IPv6 tinklo prefiksas (CIDR)",
      base64: "base64 u\u017Ekoduota eilut\u0117",
      base64url: "base64url u\u017Ekoduota eilut\u0117",
      json_string: "JSON eilut\u0117",
      e164: "E.164 numeris",
      jwt: "JWT",
      template_literal: "\u012Fvestis",
    },
    a = {
      nan: "NaN",
      number: "skai\u010Dius",
      bigint: "sveikasis skai\u010Dius",
      string: "eilut\u0117",
      boolean: "login\u0117 reik\u0161m\u0117",
      undefined: "neapibr\u0117\u017Eta reik\u0161m\u0117",
      function: "funkcija",
      symbol: "simbolis",
      array: "masyvas",
      object: "objektas",
      null: "nulin\u0117 reik\u0161m\u0117",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Gautas tipas ${l}, o tik\u0117tasi - instanceof ${n.expected}`
          : `Gautas tipas ${l}, o tik\u0117tasi - ${i}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Privalo b\u016Bti ${stringifyPrimitive(n.values[0])}`
          : `Privalo b\u016Bti vienas i\u0161 ${joinValues(n.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        let i = a[n.origin] ?? n.origin,
          s = getSizing(n.origin, getUnitTypeFromNumber(Number(n.maximum)), n.inclusive ?? !1, "smaller");
        if (s?.verb)
          return `${ln(i ?? n.origin ?? "reik\u0161m\u0117")} ${s.verb} ${n.maximum.toString()} ${s.unit ?? "element\u0173"}`;
        let l = n.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${ln(i ?? n.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${n.maximum.toString()} ${s?.unit}`;
      }
      case "too_small": {
        let i = a[n.origin] ?? n.origin,
          s = getSizing(n.origin, getUnitTypeFromNumber(Number(n.minimum)), n.inclusive ?? !1, "bigger");
        if (s?.verb)
          return `${ln(i ?? n.origin ?? "reik\u0161m\u0117")} ${s.verb} ${n.minimum.toString()} ${s.unit ?? "element\u0173"}`;
        let l = n.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${ln(i ?? n.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${l} ${n.minimum.toString()} ${s?.unit}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Eilut\u0117 privalo prasid\u0117ti "${i.prefix}"`
          : i.format === "ends_with"
            ? `Eilut\u0117 privalo pasibaigti "${i.suffix}"`
            : i.format === "includes"
              ? `Eilut\u0117 privalo \u012Ftraukti "${i.includes}"`
              : i.format === "regex"
                ? `Eilut\u0117 privalo atitikti ${i.pattern}`
                : `Neteisingas ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Skai\u010Dius privalo b\u016Bti ${n.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpa\u017Eint${n.keys.length > 1 ? "i" : "as"} rakt${n.keys.length > 1 ? "ai" : "as"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return "Rastas klaidingas raktas";
      case "invalid_union":
        return "Klaidinga \u012Fvestis";
      case "invalid_element": {
        let i = a[n.origin] ?? n.origin;
        return `${ln(i ?? n.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
}, "error");
function Cs() {
  return { localeError: lb() };
}
c(Cs, "default");
var db = c(() => {
  let e = {
    string: {
      unit: "\u0437\u043D\u0430\u0446\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    file: {
      unit: "\u0431\u0430\u0458\u0442\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    array: {
      unit: "\u0441\u0442\u0430\u0432\u043A\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
    set: {
      unit: "\u0441\u0442\u0430\u0432\u043A\u0438",
      verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u043D\u0435\u0441",
      email:
        "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u045F\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0443\u043C",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
      cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
      cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
      base64:
        "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      base64url:
        "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      json_string: "JSON \u043D\u0438\u0437\u0430",
      e164: "E.164 \u0431\u0440\u043E\u0458",
      jwt: "JWT",
      template_literal: "\u0432\u043D\u0435\u0441",
    },
    a = { nan: "NaN", number: "\u0431\u0440\u043E\u0458", array: "\u043D\u0438\u0437\u0430" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${n.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`
          : `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${i}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Invalid input: expected ${stringifyPrimitive(n.values[0])}`
          : `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${i}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin} \u0434\u0430 \u0438\u043C\u0430 ${i}${n.minimum.toString()} ${s.unit}`
          : `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${n.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${i.pattern}`
                : `Invalid ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${n.origin}`;
      case "invalid_union":
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
      case "invalid_element":
        return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${n.origin}`;
      default:
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
    }
  };
}, "error");
function Rs() {
  return { localeError: db() };
}
c(Rs, "default");
var ub = c(() => {
  let e = {
    string: { unit: "aksara", verb: "mempunyai" },
    file: { unit: "bait", verb: "mempunyai" },
    array: { unit: "elemen", verb: "mempunyai" },
    set: { unit: "elemen", verb: "mempunyai" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "alamat e-mel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tarikh masa ISO",
      date: "tarikh ISO",
      time: "masa ISO",
      duration: "tempoh ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "julat IPv4",
      cidrv6: "julat IPv6",
      base64: "string dikodkan base64",
      base64url: "string dikodkan base64url",
      json_string: "string JSON",
      e164: "nombor E.164",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN", number: "nombor" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Input tidak sah: dijangka instanceof ${n.expected}, diterima ${l}`
          : `Input tidak sah: dijangka ${i}, diterima ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Input tidak sah: dijangka ${stringifyPrimitive(n.values[0])}`
          : `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Terlalu besar: dijangka ${n.origin ?? "nilai"} ${s.verb} ${i}${n.maximum.toString()} ${s.unit ?? "elemen"}`
          : `Terlalu besar: dijangka ${n.origin ?? "nilai"} adalah ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Terlalu kecil: dijangka ${n.origin} ${s.verb} ${i}${n.minimum.toString()} ${s.unit}`
          : `Terlalu kecil: dijangka ${n.origin} adalah ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `String tidak sah: mesti bermula dengan "${i.prefix}"`
          : i.format === "ends_with"
            ? `String tidak sah: mesti berakhir dengan "${i.suffix}"`
            : i.format === "includes"
              ? `String tidak sah: mesti mengandungi "${i.includes}"`
              : i.format === "regex"
                ? `String tidak sah: mesti sepadan dengan corak ${i.pattern}`
                : `${r[i.format] ?? n.format} tidak sah`;
      }
      case "not_multiple_of":
        return `Nombor tidak sah: perlu gandaan ${n.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak sah dalam ${n.origin}`;
      case "invalid_union":
        return "Input tidak sah";
      case "invalid_element":
        return `Nilai tidak sah dalam ${n.origin}`;
      default:
        return "Input tidak sah";
    }
  };
}, "error");
function Ps() {
  return { localeError: ub() };
}
c(Ps, "default");
var pb = c(() => {
  let e = {
    string: { unit: "tekens", verb: "heeft" },
    file: { unit: "bytes", verb: "heeft" },
    array: { unit: "elementen", verb: "heeft" },
    set: { unit: "elementen", verb: "heeft" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "invoer",
      email: "emailadres",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum en tijd",
      date: "ISO datum",
      time: "ISO tijd",
      duration: "ISO duur",
      ipv4: "IPv4-adres",
      ipv6: "IPv6-adres",
      cidrv4: "IPv4-bereik",
      cidrv6: "IPv6-bereik",
      base64: "base64-gecodeerde tekst",
      base64url: "base64 URL-gecodeerde tekst",
      json_string: "JSON string",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "invoer",
    },
    a = { nan: "NaN", number: "getal" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ongeldige invoer: verwacht instanceof ${n.expected}, ontving ${l}`
          : `Ongeldige invoer: verwacht ${i}, ontving ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ongeldige invoer: verwacht ${stringifyPrimitive(n.values[0])}`
          : `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin),
          l = n.origin === "date" ? "laat" : n.origin === "string" ? "lang" : "groot";
        return s
          ? `Te ${l}: verwacht dat ${n.origin ?? "waarde"} ${i}${n.maximum.toString()} ${s.unit ?? "elementen"} ${s.verb}`
          : `Te ${l}: verwacht dat ${n.origin ?? "waarde"} ${i}${n.maximum.toString()} is`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin),
          l = n.origin === "date" ? "vroeg" : n.origin === "string" ? "kort" : "klein";
        return s
          ? `Te ${l}: verwacht dat ${n.origin} ${i}${n.minimum.toString()} ${s.unit} ${s.verb}`
          : `Te ${l}: verwacht dat ${n.origin} ${i}${n.minimum.toString()} is`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ongeldige tekst: moet met "${i.prefix}" beginnen`
          : i.format === "ends_with"
            ? `Ongeldige tekst: moet op "${i.suffix}" eindigen`
            : i.format === "includes"
              ? `Ongeldige tekst: moet "${i.includes}" bevatten`
              : i.format === "regex"
                ? `Ongeldige tekst: moet overeenkomen met patroon ${i.pattern}`
                : `Ongeldig: ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ongeldig getal: moet een veelvoud van ${n.divisor} zijn`;
      case "unrecognized_keys":
        return `Onbekende key${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ongeldige key in ${n.origin}`;
      case "invalid_union":
        return "Ongeldige invoer";
      case "invalid_element":
        return `Ongeldige waarde in ${n.origin}`;
      default:
        return "Ongeldige invoer";
    }
  };
}, "error");
function Ts() {
  return { localeError: pb() };
}
c(Ts, "default");
var mb = c(() => {
  let e = {
    string: { unit: "tegn", verb: "\xE5 ha" },
    file: { unit: "bytes", verb: "\xE5 ha" },
    array: { unit: "elementer", verb: "\xE5 inneholde" },
    set: { unit: "elementer", verb: "\xE5 inneholde" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "input",
      email: "e-postadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkeslett",
      date: "ISO-dato",
      time: "ISO-klokkeslett",
      duration: "ISO-varighet",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spekter",
      cidrv6: "IPv6-spekter",
      base64: "base64-enkodet streng",
      base64url: "base64url-enkodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input",
    },
    a = { nan: "NaN", number: "tall", array: "liste" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ugyldig input: forventet instanceof ${n.expected}, fikk ${l}`
          : `Ugyldig input: forventet ${i}, fikk ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ugyldig verdi: forventet ${stringifyPrimitive(n.values[0])}`
          : `Ugyldig valg: forventet en av ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `For stor(t): forventet ${n.origin ?? "value"} til \xE5 ha ${i}${n.maximum.toString()} ${s.unit ?? "elementer"}`
          : `For stor(t): forventet ${n.origin ?? "value"} til \xE5 ha ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `For lite(n): forventet ${n.origin} til \xE5 ha ${i}${n.minimum.toString()} ${s.unit}`
          : `For lite(n): forventet ${n.origin} til \xE5 ha ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ugyldig streng: m\xE5 starte med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ugyldig streng: m\xE5 ende med "${i.suffix}"`
            : i.format === "includes"
              ? `Ugyldig streng: m\xE5 inneholde "${i.includes}"`
              : i.format === "regex"
                ? `Ugyldig streng: m\xE5 matche m\xF8nsteret ${i.pattern}`
                : `Ugyldig ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8kkel i ${n.origin}`;
      case "invalid_union":
        return "Ugyldig input";
      case "invalid_element":
        return `Ugyldig verdi i ${n.origin}`;
      default:
        return "Ugyldig input";
    }
  };
}, "error");
function ws() {
  return { localeError: mb() };
}
c(ws, "default");
var gb = c(() => {
  let e = {
    string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
    set: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "giren",
      email: "epostag\xE2h",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO heng\xE2m\u0131",
      date: "ISO tarihi",
      time: "ISO zaman\u0131",
      duration: "ISO m\xFCddeti",
      ipv4: "IPv4 ni\u015F\xE2n\u0131",
      ipv6: "IPv6 ni\u015F\xE2n\u0131",
      cidrv4: "IPv4 menzili",
      cidrv6: "IPv6 menzili",
      base64: "base64-\u015Fifreli metin",
      base64url: "base64url-\u015Fifreli metin",
      json_string: "JSON metin",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "giren",
    },
    a = { nan: "NaN", number: "numara", array: "saf", null: "gayb" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `F\xE2sit giren: umulan instanceof ${n.expected}, al\u0131nan ${l}`
          : `F\xE2sit giren: umulan ${i}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `F\xE2sit giren: umulan ${stringifyPrimitive(n.values[0])}`
          : `F\xE2sit tercih: m\xFBteberler ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Fazla b\xFCy\xFCk: ${n.origin ?? "value"}, ${i}${n.maximum.toString()} ${s.unit ?? "elements"} sahip olmal\u0131yd\u0131.`
          : `Fazla b\xFCy\xFCk: ${n.origin ?? "value"}, ${i}${n.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Fazla k\xFC\xE7\xFCk: ${n.origin}, ${i}${n.minimum.toString()} ${s.unit} sahip olmal\u0131yd\u0131.`
          : `Fazla k\xFC\xE7\xFCk: ${n.origin}, ${i}${n.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `F\xE2sit metin: "${i.prefix}" ile ba\u015Flamal\u0131.`
          : i.format === "ends_with"
            ? `F\xE2sit metin: "${i.suffix}" ile bitmeli.`
            : i.format === "includes"
              ? `F\xE2sit metin: "${i.includes}" ihtiv\xE2 etmeli.`
              : i.format === "regex"
                ? `F\xE2sit metin: ${i.pattern} nak\u015F\u0131na uymal\u0131.`
                : `F\xE2sit ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `F\xE2sit say\u0131: ${n.divisor} kat\u0131 olmal\u0131yd\u0131.`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar ${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} i\xE7in tan\u0131nmayan anahtar var.`;
      case "invalid_union":
        return "Giren tan\u0131namad\u0131.";
      case "invalid_element":
        return `${n.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
      default:
        return "K\u0131ymet tan\u0131namad\u0131.";
    }
  };
}, "error");
function Es() {
  return { localeError: gb() };
}
c(Es, "default");
var fb = c(() => {
  let e = {
    string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
    array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0648\u0631\u0648\u062F\u064A",
      email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
      date: "\u0646\u06D0\u067C\u0647",
      time: "\u0648\u062E\u062A",
      duration: "\u0645\u0648\u062F\u0647",
      ipv4: "\u062F IPv4 \u067E\u062A\u0647",
      ipv6: "\u062F IPv6 \u067E\u062A\u0647",
      cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
      cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
      base64: "base64-encoded \u0645\u062A\u0646",
      base64url: "base64url-encoded \u0645\u062A\u0646",
      json_string: "JSON \u0645\u062A\u0646",
      e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u064A",
    },
    a = { nan: "NaN", number: "\u0639\u062F\u062F", array: "\u0627\u0631\u06D0" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${n.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`
          : `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${i} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${l} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(n.values[0])} \u0648\u0627\u06CC`
          : `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(n.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${n.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${i}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${n.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${i}${n.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${n.origin} \u0628\u0627\u06CC\u062F ${i}${n.minimum.toString()} ${s.unit} \u0648\u0644\u0631\u064A`
          : `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${n.origin} \u0628\u0627\u06CC\u062F ${i}${n.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${i.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`
          : i.format === "ends_with"
            ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${i.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`
            : i.format === "includes"
              ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${i.includes}" \u0648\u0644\u0631\u064A`
              : i.format === "regex"
                ? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${i.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`
                : `${r[i.format] ?? n.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
      }
      case "not_multiple_of":
        return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${n.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
      case "unrecognized_keys":
        return `\u0646\u0627\u0633\u0645 ${n.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${n.origin} \u06A9\u06D0`;
      case "invalid_union":
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
      case "invalid_element":
        return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${n.origin} \u06A9\u06D0`;
      default:
        return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A";
    }
  };
}, "error");
function Os() {
  return { localeError: fb() };
}
c(Os, "default");
var hb = c(() => {
  let e = {
    string: { unit: "znak\xF3w", verb: "mie\u0107" },
    file: { unit: "bajt\xF3w", verb: "mie\u0107" },
    array: { unit: "element\xF3w", verb: "mie\u0107" },
    set: { unit: "element\xF3w", verb: "mie\u0107" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "wyra\u017Cenie",
      email: "adres email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i godzina w formacie ISO",
      date: "data w formacie ISO",
      time: "godzina w formacie ISO",
      duration: "czas trwania ISO",
      ipv4: "adres IPv4",
      ipv6: "adres IPv6",
      cidrv4: "zakres IPv4",
      cidrv6: "zakres IPv6",
      base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
      base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
      json_string: "ci\u0105g znak\xF3w w formacie JSON",
      e164: "liczba E.164",
      jwt: "JWT",
      template_literal: "wej\u015Bcie",
    },
    a = { nan: "NaN", number: "liczba", array: "tablica" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${n.expected}, otrzymano ${l}`
          : `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${i}, otrzymano ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(n.values[0])}`
          : `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${i}${n.maximum.toString()} ${s.unit ?? "element\xF3w"}`
          : `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${i}${n.minimum.toString()} ${s.unit ?? "element\xF3w"}`
          : `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${n.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${i.prefix}"`
          : i.format === "ends_with"
            ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${i.suffix}"`
            : i.format === "includes"
              ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${i.includes}"`
              : i.format === "regex"
                ? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${i.pattern}`
                : `Nieprawid\u0142ow(y/a/e) ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${n.divisor}`;
      case "unrecognized_keys":
        return `Nierozpoznane klucze${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Nieprawid\u0142owy klucz w ${n.origin}`;
      case "invalid_union":
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
      case "invalid_element":
        return `Nieprawid\u0142owa warto\u015B\u0107 w ${n.origin}`;
      default:
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
    }
  };
}, "error");
function As() {
  return { localeError: hb() };
}
c(As, "default");
var yb = c(() => {
  let e = {
    string: { unit: "caracteres", verb: "ter" },
    file: { unit: "bytes", verb: "ter" },
    array: { unit: "itens", verb: "ter" },
    set: { unit: "itens", verb: "ter" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "padr\xE3o",
      email: "endere\xE7o de e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "dura\xE7\xE3o ISO",
      ipv4: "endere\xE7o IPv4",
      ipv6: "endere\xE7o IPv6",
      cidrv4: "faixa de IPv4",
      cidrv6: "faixa de IPv6",
      base64: "texto codificado em base64",
      base64url: "URL codificada em base64",
      json_string: "texto JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada",
    },
    a = { nan: "NaN", number: "n\xFAmero", null: "nulo" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Tipo inv\xE1lido: esperado instanceof ${n.expected}, recebido ${l}`
          : `Tipo inv\xE1lido: esperado ${i}, recebido ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Entrada inv\xE1lida: esperado ${stringifyPrimitive(n.values[0])}`
          : `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Muito grande: esperado que ${n.origin ?? "valor"} tivesse ${i}${n.maximum.toString()} ${s.unit ?? "elementos"}`
          : `Muito grande: esperado que ${n.origin ?? "valor"} fosse ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Muito pequeno: esperado que ${n.origin} tivesse ${i}${n.minimum.toString()} ${s.unit}`
          : `Muito pequeno: esperado que ${n.origin} fosse ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Texto inv\xE1lido: deve come\xE7ar com "${i.prefix}"`
          : i.format === "ends_with"
            ? `Texto inv\xE1lido: deve terminar com "${i.suffix}"`
            : i.format === "includes"
              ? `Texto inv\xE1lido: deve incluir "${i.includes}"`
              : i.format === "regex"
                ? `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${i.pattern}`
                : `${r[i.format] ?? n.format} inv\xE1lido`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${n.divisor}`;
      case "unrecognized_keys":
        return `Chave${n.keys.length > 1 ? "s" : ""} desconhecida${n.keys.length > 1 ? "s" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Chave inv\xE1lida em ${n.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido em ${n.origin}`;
      default:
        return "Campo inv\xE1lido";
    }
  };
}, "error");
function zs() {
  return { localeError: yb() };
}
c(zs, "default");
function getRussianPlural(e, o, r, a) {
  let n = Math.abs(e),
    i = n % 10,
    s = n % 100;
  return s >= 11 && s <= 19 ? a : i === 1 ? o : i >= 2 && i <= 4 ? r : a;
}
c(getRussianPlural, "getRussianPlural");
var bb = c(() => {
  let e = {
    string: {
      unit: {
        one: "\u0441\u0438\u043C\u0432\u043E\u043B",
        few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
        many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u0430",
        many: "\u0431\u0430\u0439\u0442",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
      },
      verb: "\u0438\u043C\u0435\u0442\u044C",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u044F",
      duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64:
        "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
      base64url:
        "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
      json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0432\u043E\u0434",
    },
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0441\u0438\u0432",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${n.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${i}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.maximum),
            p = getRussianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${i}${n.maximum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        if (s) {
          let l = Number(n.minimum),
            p = getRussianPlural(l, s.unit.one, s.unit.few, s.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${i}${n.minimum.toString()} ${p}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${n.origin} \u0431\u0443\u0434\u0435\u0442 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${n.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u0438" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${n.origin}`;
      default:
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
    }
  };
}, "error");
function Ms() {
  return { localeError: bb() };
}
c(Ms, "default");
var vb = c(() => {
  let e = {
    string: { unit: "znakov", verb: "imeti" },
    file: { unit: "bajtov", verb: "imeti" },
    array: { unit: "elementov", verb: "imeti" },
    set: { unit: "elementov", verb: "imeti" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "vnos",
      email: "e-po\u0161tni naslov",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum in \u010Das",
      date: "ISO datum",
      time: "ISO \u010Das",
      duration: "ISO trajanje",
      ipv4: "IPv4 naslov",
      ipv6: "IPv6 naslov",
      cidrv4: "obseg IPv4",
      cidrv6: "obseg IPv6",
      base64: "base64 kodiran niz",
      base64url: "base64url kodiran niz",
      json_string: "JSON niz",
      e164: "E.164 \u0161tevilka",
      jwt: "JWT",
      template_literal: "vnos",
    },
    a = { nan: "NaN", number: "\u0161tevilo", array: "tabela" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Neveljaven vnos: pri\u010Dakovano instanceof ${n.expected}, prejeto ${l}`
          : `Neveljaven vnos: pri\u010Dakovano ${i}, prejeto ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(n.values[0])}`
          : `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Preveliko: pri\u010Dakovano, da bo ${n.origin ?? "vrednost"} imelo ${i}${n.maximum.toString()} ${s.unit ?? "elementov"}`
          : `Preveliko: pri\u010Dakovano, da bo ${n.origin ?? "vrednost"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Premajhno: pri\u010Dakovano, da bo ${n.origin} imelo ${i}${n.minimum.toString()} ${s.unit}`
          : `Premajhno: pri\u010Dakovano, da bo ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Neveljaven niz: mora se za\u010Deti z "${i.prefix}"`
          : i.format === "ends_with"
            ? `Neveljaven niz: mora se kon\u010Dati z "${i.suffix}"`
            : i.format === "includes"
              ? `Neveljaven niz: mora vsebovati "${i.includes}"`
              : i.format === "regex"
                ? `Neveljaven niz: mora ustrezati vzorcu ${i.pattern}`
                : `Neveljaven ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${n.divisor}`;
      case "unrecognized_keys":
        return `Neprepoznan${n.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Neveljaven klju\u010D v ${n.origin}`;
      case "invalid_union":
        return "Neveljaven vnos";
      case "invalid_element":
        return `Neveljavna vrednost v ${n.origin}`;
      default:
        return "Neveljaven vnos";
    }
  };
}, "error");
function $s() {
  return { localeError: vb() };
}
c($s, "default");
var Sb = c(() => {
  let e = {
    string: { unit: "tecken", verb: "att ha" },
    file: { unit: "bytes", verb: "att ha" },
    array: { unit: "objekt", verb: "att inneh\xE5lla" },
    set: { unit: "objekt", verb: "att inneh\xE5lla" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "regulj\xE4rt uttryck",
      email: "e-postadress",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datum och tid",
      date: "ISO-datum",
      time: "ISO-tid",
      duration: "ISO-varaktighet",
      ipv4: "IPv4-intervall",
      ipv6: "IPv6-intervall",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodad str\xE4ng",
      base64url: "base64url-kodad str\xE4ng",
      json_string: "JSON-str\xE4ng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "mall-literal",
    },
    a = { nan: "NaN", number: "antal", array: "lista" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${n.expected}, fick ${l}`
          : `Ogiltig inmatning: f\xF6rv\xE4ntat ${i}, fick ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(n.values[0])}`
          : `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `F\xF6r stor(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${i}${n.maximum.toString()} ${s.unit ?? "element"}`
          : `F\xF6r stor(t): f\xF6rv\xE4ntat ${n.origin ?? "v\xE4rdet"} att ha ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `F\xF6r lite(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${i}${n.minimum.toString()} ${s.unit}`
          : `F\xF6r lite(t): f\xF6rv\xE4ntade ${n.origin ?? "v\xE4rdet"} att ha ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${i.prefix}"`
          : i.format === "ends_with"
            ? `Ogiltig str\xE4ng: m\xE5ste sluta med "${i.suffix}"`
            : i.format === "includes"
              ? `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${i.includes}"`
              : i.format === "regex"
                ? `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${i.pattern}"`
                : `Ogiltig(t) ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ogiltigt tal: m\xE5ste vara en multipel av ${n.divisor}`;
      case "unrecognized_keys":
        return `${n.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Ogiltig nyckel i ${n.origin ?? "v\xE4rdet"}`;
      case "invalid_union":
        return "Ogiltig input";
      case "invalid_element":
        return `Ogiltigt v\xE4rde i ${n.origin ?? "v\xE4rdet"}`;
      default:
        return "Ogiltig input";
    }
  };
}, "error");
function Ds() {
  return { localeError: Sb() };
}
c(Ds, "default");
var _b = c(() => {
  let e = {
    string: {
      unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    file: {
      unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    array: {
      unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
    set: {
      unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
      verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
      email:
        "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
      time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
      ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
      e164: "E.164 \u0B8E\u0BA3\u0BCD",
      jwt: "JWT",
      template_literal: "input",
    },
    a = {
      nan: "NaN",
      number: "\u0B8E\u0BA3\u0BCD",
      array: "\u0B85\u0BA3\u0BBF",
      null: "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${n.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${i}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(n.values[0])}`
          : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(n.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${i}${n.maximum.toString()} ${s.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${i}${n.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin} ${i}${n.minimum.toString()} ${s.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n.origin} ${i}${n.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
          : i.format === "ends_with"
            ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
            : i.format === "includes"
              ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${i.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
              : i.format === "regex"
                ? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${i.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
                : `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${n.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      case "unrecognized_keys":
        return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${n.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
      case "invalid_union":
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
      case "invalid_element":
        return `${n.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
      default:
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
    }
  };
}, "error");
function Us() {
  return { localeError: _b() };
}
c(Us, "default");
var xb = c(() => {
  let e = {
    string: {
      unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23",
      verb: "\u0E04\u0E27\u0E23\u0E21\u0E35",
    },
    file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
      email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
      url: "URL",
      emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime:
        "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
      time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
      ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
      cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
      cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
      base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
      base64url:
        "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
      json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
      e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
      jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
      template_literal:
        "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
    },
    a = {
      nan: "NaN",
      number: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02",
      array: "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)",
      null: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${n.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`
          : `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${i} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(n.values[0])}`
          : `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive
            ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19"
            : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32",
          s = getSizing(n.origin);
        return s
          ? `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${n.maximum.toString()} ${s.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`
          : `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive
            ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22"
            : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32",
          s = getSizing(n.origin);
        return s
          ? `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${n.minimum.toString()} ${s.unit}`
          : `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${n.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${i} ${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${i.suffix}"`
            : i.format === "includes"
              ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${i.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`
              : i.format === "regex"
                ? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${i.pattern}`
                : `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${n.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
      case "unrecognized_keys":
        return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${n.origin}`;
      case "invalid_union":
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
      case "invalid_element":
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${n.origin}`;
      default:
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07";
    }
  };
}, "error");
function Ns() {
  return { localeError: xb() };
}
c(Ns, "default");
var kb = c(() => {
  let e = {
    string: { unit: "karakter", verb: "olmal\u0131" },
    file: { unit: "bayt", verb: "olmal\u0131" },
    array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
    set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "girdi",
      email: "e-posta adresi",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO tarih ve saat",
      date: "ISO tarih",
      time: "ISO saat",
      duration: "ISO s\xFCre",
      ipv4: "IPv4 adresi",
      ipv6: "IPv6 adresi",
      cidrv4: "IPv4 aral\u0131\u011F\u0131",
      cidrv6: "IPv6 aral\u0131\u011F\u0131",
      base64: "base64 ile \u015Fifrelenmi\u015F metin",
      base64url: "base64url ile \u015Fifrelenmi\u015F metin",
      json_string: "JSON dizesi",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "\u015Eablon dizesi",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${n.expected}, al\u0131nan ${l}`
          : `Ge\xE7ersiz de\u011Fer: beklenen ${i}, al\u0131nan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(n.values[0])}`
          : `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\xC7ok b\xFCy\xFCk: beklenen ${n.origin ?? "de\u011Fer"} ${i}${n.maximum.toString()} ${s.unit ?? "\xF6\u011Fe"}`
          : `\xC7ok b\xFCy\xFCk: beklenen ${n.origin ?? "de\u011Fer"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\xC7ok k\xFC\xE7\xFCk: beklenen ${n.origin} ${i}${n.minimum.toString()} ${s.unit}`
          : `\xC7ok k\xFC\xE7\xFCk: beklenen ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Ge\xE7ersiz metin: "${i.prefix}" ile ba\u015Flamal\u0131`
          : i.format === "ends_with"
            ? `Ge\xE7ersiz metin: "${i.suffix}" ile bitmeli`
            : i.format === "includes"
              ? `Ge\xE7ersiz metin: "${i.includes}" i\xE7ermeli`
              : i.format === "regex"
                ? `Ge\xE7ersiz metin: ${i.pattern} desenine uymal\u0131`
                : `Ge\xE7ersiz ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Ge\xE7ersiz say\u0131: ${n.divisor} ile tam b\xF6l\xFCnebilmeli`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} i\xE7inde ge\xE7ersiz anahtar`;
      case "invalid_union":
        return "Ge\xE7ersiz de\u011Fer";
      case "invalid_element":
        return `${n.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
      default:
        return "Ge\xE7ersiz de\u011Fer";
    }
  };
}, "error");
function Zs() {
  return { localeError: kb() };
}
c(Zs, "default");
var Ib = c(() => {
  let e = {
    string: {
      unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    file: {
      unit: "\u0431\u0430\u0439\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    array: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
    set: {
      unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
      verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
    },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
      email:
        "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
      date: "\u0434\u0430\u0442\u0430 ISO",
      time: "\u0447\u0430\u0441 ISO",
      duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
      ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
      ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
      cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
      cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
      base64:
        "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
      base64url:
        "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
      json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
    },
    a = {
      nan: "NaN",
      number: "\u0447\u0438\u0441\u043B\u043E",
      array: "\u043C\u0430\u0441\u0438\u0432",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${n.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${i}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(n.values[0])}`
          : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${s.verb} ${i}${n.maximum.toString()} ${s.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin} ${s.verb} ${i}${n.minimum.toString()} ${s.unit}`
          : `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${n.origin} \u0431\u0443\u0434\u0435 ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${i.suffix}"`
            : i.format === "includes"
              ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${i.includes}"`
              : i.format === "regex"
                ? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${i.pattern}`
                : `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${n.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${n.keys.length > 1 ? "\u0456" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${n.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
      case "invalid_element":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${n.origin}`;
      default:
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
    }
  };
}, "error");
function dn() {
  return { localeError: Ib() };
}
c(dn, "default");
function js() {
  return dn();
}
c(js, "default");
var Cb = c(() => {
  let e = {
    string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
    file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
    array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
    set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0627\u0646 \u067E\u0679",
      email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
      uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
      nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
      ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
      xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
      ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      datetime:
        "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
      date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
      time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
      duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
      ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
      cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
      base64:
        "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      base64url:
        "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      json_string:
        "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
      e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
      jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
      template_literal: "\u0627\u0646 \u067E\u0679",
    },
    a = {
      nan: "NaN",
      number: "\u0646\u0645\u0628\u0631",
      array: "\u0622\u0631\u06D2",
      null: "\u0646\u0644",
    };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${n.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`
          : `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${i} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${l} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(n.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
          : `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(n.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u0628\u06C1\u062A \u0628\u0691\u0627: ${n.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${i}${n.maximum.toString()} ${s.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0628\u0691\u0627: ${n.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${i}${n.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${n.origin} \u06A9\u06D2 ${i}${n.minimum.toString()} ${s.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
          : `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${n.origin} \u06A9\u0627 ${i}${n.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
          : i.format === "ends_with"
            ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
            : i.format === "includes"
              ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${i.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
              : i.format === "regex"
                ? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${i.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
                : `\u063A\u0644\u0637 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${n.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
      case "unrecognized_keys":
        return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${n.keys.length > 1 ? "\u0632" : ""}: ${joinValues(n.keys, "\u060C ")}`;
      case "invalid_key":
        return `${n.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
      case "invalid_union":
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
      case "invalid_element":
        return `${n.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
      default:
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
    }
  };
}, "error");
function Bs() {
  return { localeError: Cb() };
}
c(Bs, "default");
var Rb = c(() => {
  let e = {
    string: { unit: "belgi", verb: "bo\u2018lishi kerak" },
    file: { unit: "bayt", verb: "bo\u2018lishi kerak" },
    array: { unit: "element", verb: "bo\u2018lishi kerak" },
    set: { unit: "element", verb: "bo\u2018lishi kerak" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "kirish",
      email: "elektron pochta manzili",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO sana va vaqti",
      date: "ISO sana",
      time: "ISO vaqt",
      duration: "ISO davomiylik",
      ipv4: "IPv4 manzil",
      ipv6: "IPv6 manzil",
      mac: "MAC manzil",
      cidrv4: "IPv4 diapazon",
      cidrv6: "IPv6 diapazon",
      base64: "base64 kodlangan satr",
      base64url: "base64url kodlangan satr",
      json_string: "JSON satr",
      e164: "E.164 raqam",
      jwt: "JWT",
      template_literal: "kirish",
    },
    a = { nan: "NaN", number: "raqam", array: "massiv" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${n.expected}, qabul qilingan ${l}`
          : `Noto\u2018g\u2018ri kirish: kutilgan ${i}, qabul qilingan ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(n.values[0])}`
          : `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Juda katta: kutilgan ${n.origin ?? "qiymat"} ${i}${n.maximum.toString()} ${s.unit} ${s.verb}`
          : `Juda katta: kutilgan ${n.origin ?? "qiymat"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Juda kichik: kutilgan ${n.origin} ${i}${n.minimum.toString()} ${s.unit} ${s.verb}`
          : `Juda kichik: kutilgan ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Noto\u2018g\u2018ri satr: "${i.prefix}" bilan boshlanishi kerak`
          : i.format === "ends_with"
            ? `Noto\u2018g\u2018ri satr: "${i.suffix}" bilan tugashi kerak`
            : i.format === "includes"
              ? `Noto\u2018g\u2018ri satr: "${i.includes}" ni o\u2018z ichiga olishi kerak`
              : i.format === "regex"
                ? `Noto\u2018g\u2018ri satr: ${i.pattern} shabloniga mos kelishi kerak`
                : `Noto\u2018g\u2018ri ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `Noto\u2018g\u2018ri raqam: ${n.divisor} ning karralisi bo\u2018lishi kerak`;
      case "unrecognized_keys":
        return `Noma\u2019lum kalit${n.keys.length > 1 ? "lar" : ""}: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} dagi kalit noto\u2018g\u2018ri`;
      case "invalid_union":
        return "Noto\u2018g\u2018ri kirish";
      case "invalid_element":
        return `${n.origin} da noto\u2018g\u2018ri qiymat`;
      default:
        return "Noto\u2018g\u2018ri kirish";
    }
  };
}, "error");
function Ls() {
  return { localeError: Rb() };
}
c(Ls, "default");
var Pb = c(() => {
  let e = {
    string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
    file: { unit: "byte", verb: "c\xF3" },
    array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
    set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u0111\u1EA7u v\xE0o",
      email: "\u0111\u1ECBa ch\u1EC9 email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ng\xE0y gi\u1EDD ISO",
      date: "ng\xE0y ISO",
      time: "gi\u1EDD ISO",
      duration: "kho\u1EA3ng th\u1EDDi gian ISO",
      ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
      ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
      cidrv4: "d\u1EA3i IPv4",
      cidrv6: "d\u1EA3i IPv6",
      base64: "chu\u1ED7i m\xE3 h\xF3a base64",
      base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
      json_string: "chu\u1ED7i JSON",
      e164: "s\u1ED1 E.164",
      jwt: "JWT",
      template_literal: "\u0111\u1EA7u v\xE0o",
    },
    a = { nan: "NaN", number: "s\u1ED1", array: "m\u1EA3ng" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${n.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`
          : `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${i}, nh\u1EADn \u0111\u01B0\u1EE3c ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(n.values[0])}`
          : `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${n.origin ?? "gi\xE1 tr\u1ECB"} ${s.verb} ${i}${n.maximum.toString()} ${s.unit ?? "ph\u1EA7n t\u1EED"}`
          : `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${n.origin ?? "gi\xE1 tr\u1ECB"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${n.origin} ${s.verb} ${i}${n.minimum.toString()} ${s.unit}`
          : `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${i.prefix}"`
          : i.format === "ends_with"
            ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${i.suffix}"`
            : i.format === "includes"
              ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${i.includes}"`
              : i.format === "regex"
                ? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${i.pattern}`
                : `${r[i.format] ?? n.format} kh\xF4ng h\u1EE3p l\u1EC7`;
      }
      case "not_multiple_of":
        return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${n.divisor}`;
      case "unrecognized_keys":
        return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${n.origin}`;
      case "invalid_union":
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
      case "invalid_element":
        return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${n.origin}`;
      default:
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
    }
  };
}, "error");
function Ws() {
  return { localeError: Pb() };
}
c(Ws, "default");
var Tb = c(() => {
  let e = {
    string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
    file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
    array: { unit: "\u9879", verb: "\u5305\u542B" },
    set: { unit: "\u9879", verb: "\u5305\u542B" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u8F93\u5165",
      email: "\u7535\u5B50\u90AE\u4EF6",
      url: "URL",
      emoji: "\u8868\u60C5\u7B26\u53F7",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u671F\u65F6\u95F4",
      date: "ISO\u65E5\u671F",
      time: "ISO\u65F6\u95F4",
      duration: "ISO\u65F6\u957F",
      ipv4: "IPv4\u5730\u5740",
      ipv6: "IPv6\u5730\u5740",
      cidrv4: "IPv4\u7F51\u6BB5",
      cidrv6: "IPv6\u7F51\u6BB5",
      base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
      base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
      json_string: "JSON\u5B57\u7B26\u4E32",
      e164: "E.164\u53F7\u7801",
      jwt: "JWT",
      template_literal: "\u8F93\u5165",
    },
    a = { nan: "NaN", number: "\u6570\u5B57", array: "\u6570\u7EC4", null: "\u7A7A\u503C(null)" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${n.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`
          : `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${i}\uFF0C\u5B9E\u9645\u63A5\u6536 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(n.values[0])}`
          : `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${n.origin ?? "\u503C"} ${i}${n.maximum.toString()} ${s.unit ?? "\u4E2A\u5143\u7D20"}`
          : `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${n.origin ?? "\u503C"} ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${n.origin} ${i}${n.minimum.toString()} ${s.unit}`
          : `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${n.origin} ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${i.prefix}" \u5F00\u5934`
          : i.format === "ends_with"
            ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${i.suffix}" \u7ED3\u5C3E`
            : i.format === "includes"
              ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${i.includes}"`
              : i.format === "regex"
                ? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${i.pattern}`
                : `\u65E0\u6548${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${n.divisor} \u7684\u500D\u6570`;
      case "unrecognized_keys":
        return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `${n.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
      case "invalid_union":
        return "\u65E0\u6548\u8F93\u5165";
      case "invalid_element":
        return `${n.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
      default:
        return "\u65E0\u6548\u8F93\u5165";
    }
  };
}, "error");
function Fs() {
  return { localeError: Tb() };
}
c(Fs, "default");
var wb = c(() => {
  let e = {
    string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
    file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
    array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
    set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u8F38\u5165",
      email: "\u90F5\u4EF6\u5730\u5740",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u65E5\u671F\u6642\u9593",
      date: "ISO \u65E5\u671F",
      time: "ISO \u6642\u9593",
      duration: "ISO \u671F\u9593",
      ipv4: "IPv4 \u4F4D\u5740",
      ipv6: "IPv6 \u4F4D\u5740",
      cidrv4: "IPv4 \u7BC4\u570D",
      cidrv6: "IPv6 \u7BC4\u570D",
      base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
      base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
      json_string: "JSON \u5B57\u4E32",
      e164: "E.164 \u6578\u503C",
      jwt: "JWT",
      template_literal: "\u8F38\u5165",
    },
    a = { nan: "NaN" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${n.expected}\uFF0C\u4F46\u6536\u5230 ${l}`
          : `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${i}\uFF0C\u4F46\u6536\u5230 ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(n.values[0])}`
          : `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${n.origin ?? "\u503C"} \u61C9\u70BA ${i}${n.maximum.toString()} ${s.unit ?? "\u500B\u5143\u7D20"}`
          : `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${n.origin ?? "\u503C"} \u61C9\u70BA ${i}${n.maximum.toString()}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${n.origin} \u61C9\u70BA ${i}${n.minimum.toString()} ${s.unit}`
          : `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${n.origin} \u61C9\u70BA ${i}${n.minimum.toString()}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${i.prefix}" \u958B\u982D`
          : i.format === "ends_with"
            ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${i.suffix}" \u7D50\u5C3E`
            : i.format === "includes"
              ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${i.includes}"`
              : i.format === "regex"
                ? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${i.pattern}`
                : `\u7121\u6548\u7684 ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${n.divisor} \u7684\u500D\u6578`;
      case "unrecognized_keys":
        return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${n.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(n.keys, "\u3001")}`;
      case "invalid_key":
        return `${n.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
      case "invalid_union":
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
      case "invalid_element":
        return `${n.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
      default:
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
    }
  };
}, "error");
function qs() {
  return { localeError: wb() };
}
c(qs, "default");
var Eb = c(() => {
  let e = {
    string: { unit: "\xE0mi", verb: "n\xED" },
    file: { unit: "bytes", verb: "n\xED" },
    array: { unit: "nkan", verb: "n\xED" },
    set: { unit: "nkan", verb: "n\xED" },
  };
  function getSizing(n) {
    return e[n] ?? null;
  }
  c(getSizing, "getSizing");
  let r = {
      regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
      email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\xE0k\xF3k\xF2 ISO",
      date: "\u1ECDj\u1ECD\u0301 ISO",
      time: "\xE0k\xF3k\xF2 ISO",
      duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
      ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
      ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
      cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
      cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
      base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
      base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
      json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
      e164: "n\u1ECD\u0301mb\xE0 E.164",
      jwt: "JWT",
      template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
    },
    a = { nan: "NaN", number: "n\u1ECD\u0301mb\xE0", array: "akop\u1ECD" };
  return (n) => {
    switch (n.code) {
      case "invalid_type": {
        let i = a[n.expected] ?? n.expected,
          s = parsedType(n.input),
          l = a[s] ?? s;
        return /^[A-Z]/.test(n.expected)
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${n.expected}, \xE0m\u1ECD\u0300 a r\xED ${l}`
          : `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${i}, \xE0m\u1ECD\u0300 a r\xED ${l}`;
      }
      case "invalid_value":
        return n.values.length === 1
          ? `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(n.values[0])}`
          : `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(n.values, "|")}`;
      case "too_big": {
        let i = n.inclusive ? "<=" : "<",
          s = getSizing(n.origin);
        return s
          ? `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${n.origin ?? "iye"} ${s.verb} ${i}${n.maximum} ${s.unit}`
          : `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${i}${n.maximum}`;
      }
      case "too_small": {
        let i = n.inclusive ? ">=" : ">",
          s = getSizing(n.origin);
        return s
          ? `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${n.origin} ${s.verb} ${i}${n.minimum} ${s.unit}`
          : `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${i}${n.minimum}`;
      }
      case "invalid_format": {
        let i = n;
        return i.format === "starts_with"
          ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${i.prefix}"`
          : i.format === "ends_with"
            ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${i.suffix}"`
            : i.format === "includes"
              ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${i.includes}"`
              : i.format === "regex"
                ? `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${i.pattern}`
                : `A\u1E63\xEC\u1E63e: ${r[i.format] ?? n.format}`;
      }
      case "not_multiple_of":
        return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${n.divisor}`;
      case "unrecognized_keys":
        return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(n.keys, ", ")}`;
      case "invalid_key":
        return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${n.origin}`;
      case "invalid_union":
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      case "invalid_element":
        return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${n.origin}`;
      default:
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
    }
  };
}, "error");
function Vs() {
  return { localeError: Eb() };
}
c(Vs, "default");
var sp,
  Gs = Symbol("ZodOutput"),
  Ks = Symbol("ZodInput"),
  co = class {
    static {
      c(this, "$ZodRegistry");
    }
    constructor() {
      ((this._map = new WeakMap()), (this._idmap = new Map()));
    }
    add(o, ...r) {
      let a = r[0];
      return (
        this._map.set(o, a),
        a && typeof a == "object" && "id" in a && this._idmap.set(a.id, o),
        this
      );
    }
    clear() {
      return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
    }
    remove(o) {
      let r = this._map.get(o);
      return (
        r && typeof r == "object" && "id" in r && this._idmap.delete(r.id),
        this._map.delete(o),
        this
      );
    }
    get(o) {
      let r = o._zod.parent;
      if (r) {
        let a = { ...(this.get(r) ?? {}) };
        delete a.id;
        let n = { ...a, ...this._map.get(o) };
        return Object.keys(n).length ? n : void 0;
      }
      return this._map.get(o);
    }
    has(o) {
      return this._map.has(o);
    }
  };
function registry() {
  return new co();
}
c(registry, "registry");
(sp = globalThis).__zod_globalRegistry ?? (sp.__zod_globalRegistry = registry());
var q = globalThis.__zod_globalRegistry;
function _string(e, o) {
  return new e({ type: "string", ...normalizeParams(o) });
}
c(_string, "_string");
function _coercedString(e, o) {
  return new e({ type: "string", coerce: !0, ...normalizeParams(o) });
}
c(_coercedString, "_coercedString");
function _email(e, o) {
  return new e({ type: "string", format: "email", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_email, "_email");
function _guid(e, o) {
  return new e({ type: "string", format: "guid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_guid, "_guid");
function _uuid(e, o) {
  return new e({ type: "string", format: "uuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_uuid, "_uuid");
function _uuidv4(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(o),
  });
}
c(_uuidv4, "_uuidv4");
function _uuidv6(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(o),
  });
}
c(_uuidv6, "_uuidv6");
function _uuidv7(e, o) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(o),
  });
}
c(_uuidv7, "_uuidv7");
function _url(e, o) {
  return new e({ type: "string", format: "url", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_url, "_url");
function _emoji(e, o) {
  return new e({ type: "string", format: "emoji", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_emoji, "_emoji");
function _nanoid(e, o) {
  return new e({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_nanoid, "_nanoid");
function _cuid(e, o) {
  return new e({ type: "string", format: "cuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cuid, "_cuid");
function _cuid2(e, o) {
  return new e({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cuid2, "_cuid2");
function _ulid(e, o) {
  return new e({ type: "string", format: "ulid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ulid, "_ulid");
function _xid(e, o) {
  return new e({ type: "string", format: "xid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_xid, "_xid");
function _ksuid(e, o) {
  return new e({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ksuid, "_ksuid");
function _ipv4(e, o) {
  return new e({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ipv4, "_ipv4");
function _ipv6(e, o) {
  return new e({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_ipv6, "_ipv6");
function _mac(e, o) {
  return new e({ type: "string", format: "mac", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_mac, "_mac");
function _cidrv4(e, o) {
  return new e({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cidrv4, "_cidrv4");
function _cidrv6(e, o) {
  return new e({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_cidrv6, "_cidrv6");
function _base64(e, o) {
  return new e({ type: "string", format: "base64", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_base64, "_base64");
function _base64url(e, o) {
  return new e({ type: "string", format: "base64url", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_base64url, "_base64url");
function _e164(e, o) {
  return new e({ type: "string", format: "e164", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_e164, "_e164");
function _jwt(e, o) {
  return new e({ type: "string", format: "jwt", check: "string_format", abort: !1, ...normalizeParams(o) });
}
c(_jwt, "_jwt");
var Xs = { Any: null, Minute: -1, Second: 0, Millisecond: 3, Microsecond: 6 };
function _isoDateTime(e, o) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(o),
  });
}
c(_isoDateTime, "_isoDateTime");
function _isoDate(e, o) {
  return new e({ type: "string", format: "date", check: "string_format", ...normalizeParams(o) });
}
c(_isoDate, "_isoDate");
function _isoTime(e, o) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(o),
  });
}
c(_isoTime, "_isoTime");
function _isoDuration(e, o) {
  return new e({ type: "string", format: "duration", check: "string_format", ...normalizeParams(o) });
}
c(_isoDuration, "_isoDuration");
function _number(e, o) {
  return new e({ type: "number", checks: [], ...normalizeParams(o) });
}
c(_number, "_number");
function _coercedNumber(e, o) {
  return new e({ type: "number", coerce: !0, checks: [], ...normalizeParams(o) });
}
c(_coercedNumber, "_coercedNumber");
function _int(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "safeint", ...normalizeParams(o) });
}
c(_int, "_int");
function _float32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float32", ...normalizeParams(o) });
}
c(_float32, "_float32");
function _float64(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "float64", ...normalizeParams(o) });
}
c(_float64, "_float64");
function _int32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "int32", ...normalizeParams(o) });
}
c(_int32, "_int32");
function _uint32(e, o) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "uint32", ...normalizeParams(o) });
}
c(_uint32, "_uint32");
function _boolean(e, o) {
  return new e({ type: "boolean", ...normalizeParams(o) });
}
c(_boolean, "_boolean");
function _coercedBoolean(e, o) {
  return new e({ type: "boolean", coerce: !0, ...normalizeParams(o) });
}
c(_coercedBoolean, "_coercedBoolean");
function _bigint(e, o) {
  return new e({ type: "bigint", ...normalizeParams(o) });
}
c(_bigint, "_bigint");
function _coercedBigint(e, o) {
  return new e({ type: "bigint", coerce: !0, ...normalizeParams(o) });
}
c(_coercedBigint, "_coercedBigint");
function _int64(e, o) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "int64", ...normalizeParams(o) });
}
c(_int64, "_int64");
function _uint64(e, o) {
  return new e({ type: "bigint", check: "bigint_format", abort: !1, format: "uint64", ...normalizeParams(o) });
}
c(_uint64, "_uint64");
function _symbol(e, o) {
  return new e({ type: "symbol", ...normalizeParams(o) });
}
c(_symbol, "_symbol");
function _undefined(e, o) {
  return new e({ type: "undefined", ...normalizeParams(o) });
}
c(_undefined, "_undefined");
function _null(e, o) {
  return new e({ type: "null", ...normalizeParams(o) });
}
c(_null, "_null");
function _any(e) {
  return new e({ type: "any" });
}
c(_any, "_any");
function _unknown(e) {
  return new e({ type: "unknown" });
}
c(_unknown, "_unknown");
function _never(e, o) {
  return new e({ type: "never", ...normalizeParams(o) });
}
c(_never, "_never");
function _void(e, o) {
  return new e({ type: "void", ...normalizeParams(o) });
}
c(_void, "_void");
function _date(e, o) {
  return new e({ type: "date", ...normalizeParams(o) });
}
c(_date, "_date");
function _coercedDate(e, o) {
  return new e({ type: "date", coerce: !0, ...normalizeParams(o) });
}
c(_coercedDate, "_coercedDate");
function _nan(e, o) {
  return new e({ type: "nan", ...normalizeParams(o) });
}
c(_nan, "_nan");
function _lt(e, o) {
  return new Yn({ check: "less_than", ...normalizeParams(o), value: e, inclusive: !1 });
}
c(_lt, "_lt");
function _lte(e, o) {
  return new Yn({ check: "less_than", ...normalizeParams(o), value: e, inclusive: !0 });
}
c(_lte, "_lte");
function _gt(e, o) {
  return new Xn({ check: "greater_than", ...normalizeParams(o), value: e, inclusive: !1 });
}
c(_gt, "_gt");
function _gte(e, o) {
  return new Xn({ check: "greater_than", ...normalizeParams(o), value: e, inclusive: !0 });
}
c(_gte, "_gte");
function _positive(e) {
  return _gt(0, e);
}
c(_positive, "_positive");
function _negative(e) {
  return _lt(0, e);
}
c(_negative, "_negative");
function _nonpositive(e) {
  return _lte(0, e);
}
c(_nonpositive, "_nonpositive");
function _nonnegative(e) {
  return _gte(0, e);
}
c(_nonnegative, "_nonnegative");
function _multipleOf(e, o) {
  return new Ri({ check: "multiple_of", ...normalizeParams(o), value: e });
}
c(_multipleOf, "_multipleOf");
function _maxSize(e, o) {
  return new wi({ check: "max_size", ...normalizeParams(o), maximum: e });
}
c(_maxSize, "_maxSize");
function _minSize(e, o) {
  return new Ei({ check: "min_size", ...normalizeParams(o), minimum: e });
}
c(_minSize, "_minSize");
function _size(e, o) {
  return new Oi({ check: "size_equals", ...normalizeParams(o), size: e });
}
c(_size, "_size");
function _maxLength(e, o) {
  return new Ai({ check: "max_length", ...normalizeParams(o), maximum: e });
}
c(_maxLength, "_maxLength");
function _minLength(e, o) {
  return new zi({ check: "min_length", ...normalizeParams(o), minimum: e });
}
c(_minLength, "_minLength");
function _length(e, o) {
  return new Mi({ check: "length_equals", ...normalizeParams(o), length: e });
}
c(_length, "_length");
function _regex(e, o) {
  return new $i({ check: "string_format", format: "regex", ...normalizeParams(o), pattern: e });
}
c(_regex, "_regex");
function _lowercase(e) {
  return new Di({ check: "string_format", format: "lowercase", ...normalizeParams(e) });
}
c(_lowercase, "_lowercase");
function _uppercase(e) {
  return new Ui({ check: "string_format", format: "uppercase", ...normalizeParams(e) });
}
c(_uppercase, "_uppercase");
function _includes(e, o) {
  return new Ni({ check: "string_format", format: "includes", ...normalizeParams(o), includes: e });
}
c(_includes, "_includes");
function _startsWith(e, o) {
  return new Zi({ check: "string_format", format: "starts_with", ...normalizeParams(o), prefix: e });
}
c(_startsWith, "_startsWith");
function _endsWith(e, o) {
  return new ji({ check: "string_format", format: "ends_with", ...normalizeParams(o), suffix: e });
}
c(_endsWith, "_endsWith");
function _property(e, o, r) {
  return new Bi({ check: "property", property: e, schema: o, ...normalizeParams(r) });
}
c(_property, "_property");
function _mime(e, o) {
  return new Li({ check: "mime_type", mime: e, ...normalizeParams(o) });
}
c(_mime, "_mime");
function _overwrite(e) {
  return new Wi({ check: "overwrite", tx: e });
}
c(_overwrite, "_overwrite");
function _normalize(e) {
  return _overwrite((o) => o.normalize(e));
}
c(_normalize, "_normalize");
function _trim() {
  return _overwrite((e) => e.trim());
}
c(_trim, "_trim");
function _toLowerCase() {
  return _overwrite((e) => e.toLowerCase());
}
c(_toLowerCase, "_toLowerCase");
function _toUpperCase() {
  return _overwrite((e) => e.toUpperCase());
}
c(_toUpperCase, "_toUpperCase");
function _slugify() {
  return _overwrite((e) => slugify(e));
}
c(_slugify, "_slugify");
function _array(e, o, r) {
  return new e({ type: "array", element: o, ...normalizeParams(r) });
}
c(_array, "_array");
function _union(e, o, r) {
  return new e({ type: "union", options: o, ...normalizeParams(r) });
}
c(_union, "_union");
function _xor(e, o, r) {
  return new e({ type: "union", options: o, inclusive: !1, ...normalizeParams(r) });
}
c(_xor, "_xor");
function _discriminatedUnion(e, o, r, a) {
  return new e({ type: "union", options: r, discriminator: o, ...normalizeParams(a) });
}
c(_discriminatedUnion, "_discriminatedUnion");
function _intersection(e, o, r) {
  return new e({ type: "intersection", left: o, right: r });
}
c(_intersection, "_intersection");
function _tuple(e, o, r, a) {
  let n = r instanceof w,
    i = n ? a : r,
    s = n ? r : null;
  return new e({ type: "tuple", items: o, rest: s, ...normalizeParams(i) });
}
c(_tuple, "_tuple");
function _record(e, o, r, a) {
  return new e({ type: "record", keyType: o, valueType: r, ...normalizeParams(a) });
}
c(_record, "_record");
function _map(e, o, r, a) {
  return new e({ type: "map", keyType: o, valueType: r, ...normalizeParams(a) });
}
c(_map, "_map");
function _set(e, o, r) {
  return new e({ type: "set", valueType: o, ...normalizeParams(r) });
}
c(_set, "_set");
function _enum(e, o, r) {
  let a = Array.isArray(o) ? Object.fromEntries(o.map((n) => [n, n])) : o;
  return new e({ type: "enum", entries: a, ...normalizeParams(r) });
}
c(_enum, "_enum");
function _nativeEnum(e, o, r) {
  return new e({ type: "enum", entries: o, ...normalizeParams(r) });
}
c(_nativeEnum, "_nativeEnum");
function _literal(e, o, r) {
  return new e({ type: "literal", values: Array.isArray(o) ? o : [o], ...normalizeParams(r) });
}
c(_literal, "_literal");
function _file(e, o) {
  return new e({ type: "file", ...normalizeParams(o) });
}
c(_file, "_file");
function _transform(e, o) {
  return new e({ type: "transform", transform: o });
}
c(_transform, "_transform");
function _optional(e, o) {
  return new e({ type: "optional", innerType: o });
}
c(_optional, "_optional");
function _nullable(e, o) {
  return new e({ type: "nullable", innerType: o });
}
c(_nullable, "_nullable");
function _default(e, o, r) {
  return new e({
    type: "default",
    innerType: o,
    get defaultValue() {
      return typeof r == "function" ? r() : shallowClone(r);
    },
  });
}
c(_default, "_default");
function _nonoptional(e, o, r) {
  return new e({ type: "nonoptional", innerType: o, ...normalizeParams(r) });
}
c(_nonoptional, "_nonoptional");
function _success(e, o) {
  return new e({ type: "success", innerType: o });
}
c(_success, "_success");
function _catch(e, o, r) {
  return new e({ type: "catch", innerType: o, catchValue: typeof r == "function" ? r : () => r });
}
c(_catch, "_catch");
function _pipe(e, o, r) {
  return new e({ type: "pipe", in: o, out: r });
}
c(_pipe, "_pipe");
function _readonly(e, o) {
  return new e({ type: "readonly", innerType: o });
}
c(_readonly, "_readonly");
function _templateLiteral(e, o, r) {
  return new e({ type: "template_literal", parts: o, ...normalizeParams(r) });
}
c(_templateLiteral, "_templateLiteral");
function _lazy(e, o) {
  return new e({ type: "lazy", getter: o });
}
c(_lazy, "_lazy");
function _promise(e, o) {
  return new e({ type: "promise", innerType: o });
}
c(_promise, "_promise");
function _custom(e, o, r) {
  let a = normalizeParams(r);
  return (a.abort ?? (a.abort = !0), new e({ type: "custom", check: "custom", fn: o, ...a }));
}
c(_custom, "_custom");
function _refine(e, o, r) {
  return new e({ type: "custom", check: "custom", fn: o, ...normalizeParams(r) });
}
c(_refine, "_refine");
function _superRefine(e) {
  let o = _check(
    (r) => (
      (r.addIssue = (a) => {
        if (typeof a == "string") r.issues.push(issue(a, r.value, o._zod.def));
        else {
          let n = a;
          (n.fatal && (n.continue = !1),
            n.code ?? (n.code = "custom"),
            n.input ?? (n.input = r.value),
            n.inst ?? (n.inst = o),
            n.continue ?? (n.continue = !o._zod.def.abort),
            r.issues.push(issue(n)));
        }
      }),
      e(r.value, r)
    ),
  );
  return o;
}
c(_superRefine, "_superRefine");
function _check(e, o) {
  let r = new Z({ check: "custom", ...normalizeParams(o) });
  return ((r._zod.check = e), r);
}
c(_check, "_check");
function describe(e) {
  let o = new Z({ check: "describe" });
  return (
    (o._zod.onattach = [
      (r) => {
        let a = q.get(r) ?? {};
        q.add(r, { ...a, description: e });
      },
    ]),
    (o._zod.check = () => {}),
    o
  );
}
c(describe, "describe");
function meta(e) {
  let o = new Z({ check: "meta" });
  return (
    (o._zod.onattach = [
      (r) => {
        let a = q.get(r) ?? {};
        q.add(r, { ...a, ...e });
      },
    ]),
    (o._zod.check = () => {}),
    o
  );
}
c(meta, "meta");
function _stringbool(e, o) {
  let r = normalizeParams(o),
    a = r.truthy ?? ["true", "1", "yes", "on", "y", "enabled"],
    n = r.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  r.case !== "sensitive" &&
    ((a = a.map((_) => (typeof _ == "string" ? _.toLowerCase() : _))),
    (n = n.map((_) => (typeof _ == "string" ? _.toLowerCase() : _))));
  let i = new Set(a),
    s = new Set(n),
    l = e.Codec ?? an,
    p = e.Boolean ?? on,
    u = e.String ?? Ve,
    h = new u({ type: "string", error: r.error }),
    b = new p({ type: "boolean", error: r.error }),
    S = new l({
      type: "pipe",
      in: h,
      out: b,
      transform: c((_, z) => {
        let $ = _;
        return (
          r.case !== "sensitive" && ($ = $.toLowerCase()),
          i.has($)
            ? !0
            : s.has($)
              ? !1
              : (z.issues.push({
                  code: "invalid_value",
                  expected: "stringbool",
                  values: [...i, ...s],
                  input: z.value,
                  inst: S,
                  continue: !1,
                }),
                {})
        );
      }, "transform"),
      reverseTransform: c(
        (_, z) => (_ === !0 ? a[0] || "true" : n[0] || "false"),
        "reverseTransform",
      ),
      error: r.error,
    });
  return S;
}
c(_stringbool, "_stringbool");
function _stringFormat(e, o, r, a = {}) {
  let n = normalizeParams(a),
    i = {
      ...normalizeParams(a),
      check: "string_format",
      type: "string",
      format: o,
      fn: typeof r == "function" ? r : (l) => r.test(l),
      ...n,
    };
  return (r instanceof RegExp && (i.pattern = r), new e(i));
}
c(_stringFormat, "_stringFormat");
function initializeContext(e) {
  let o = e?.target ?? "draft-2020-12";
  return (
    o === "draft-4" && (o = "draft-04"),
    o === "draft-7" && (o = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? q,
      target: o,
      unrepresentable: e?.unrepresentable ?? "throw",
      override: e?.override ?? (() => {}),
      io: e?.io ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: e?.cycles ?? "ref",
      reused: e?.reused ?? "inline",
      external: e?.external ?? void 0,
    }
  );
}
c(initializeContext, "initializeContext");
function D(e, o, r = { path: [], schemaPath: [] }) {
  var a;
  let n = e._zod.def,
    i = o.seen.get(e);
  if (i) return (i.count++, r.schemaPath.includes(e) && (i.cycle = r.path), i.schema);
  let s = { schema: {}, count: 1, cycle: void 0, path: r.path };
  o.seen.set(e, s);
  let l = e._zod.toJSONSchema?.();
  if (l) s.schema = l;
  else {
    let h = { ...r, schemaPath: [...r.schemaPath, e], path: r.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(o, s.schema, h);
    else {
      let S = s.schema,
        _ = o.processors[n.type];
      if (!_) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${n.type}`);
      _(e, o, S, h);
    }
    let b = e._zod.parent;
    b && (s.ref || (s.ref = b), D(b, o, h), (o.seen.get(b).isParent = !0));
  }
  let p = o.metadataRegistry.get(e);
  return (
    p && Object.assign(s.schema, p),
    o.io === "input" && isTransforming(e) && (delete s.schema.examples, delete s.schema.default),
    o.io === "input" &&
      s.schema._prefault &&
      ((a = s.schema).default ?? (a.default = s.schema._prefault)),
    delete s.schema._prefault,
    o.seen.get(e).schema
  );
}
c(D, "process");
function extractDefs(e, o) {
  let r = e.seen.get(o);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = new Map();
  for (let s of e.seen.entries()) {
    let l = e.metadataRegistry.get(s[0])?.id;
    if (l) {
      let p = a.get(l);
      if (p && p !== s[0])
        throw new Error(
          `Duplicate schema id "${l}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      a.set(l, s[0]);
    }
  }
  let n = c((s) => {
      let l = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        let b = e.external.registry.get(s[0])?.id,
          S = e.external.uri ?? ((z) => z);
        if (b) return { ref: S(b) };
        let _ = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
        return ((s[1].defId = _), { defId: _, ref: `${S("__shared")}#/${l}/${_}` });
      }
      if (s[1] === r) return { ref: "#" };
      let u = `#/${l}/`,
        h = s[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: h, ref: u + h };
    }, "makeURI"),
    i = c((s) => {
      if (s[1].schema.$ref) return;
      let l = s[1],
        { ref: p, defId: u } = n(s);
      ((l.def = { ...l.schema }), u && (l.defId = u));
      let h = l.schema;
      for (let b in h) delete h[b];
      h.$ref = p;
    }, "extractToDef");
  if (e.cycles === "throw")
    for (let s of e.seen.entries()) {
      let l = s[1];
      if (l.cycle)
        throw new Error(`Cycle detected: #/${l.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (let s of e.seen.entries()) {
    let l = s[1];
    if (o === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      let u = e.external.registry.get(s[0])?.id;
      if (o !== s[0] && u) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (l.cycle) {
      i(s);
      continue;
    }
    if (l.count > 1 && e.reused === "ref") {
      i(s);
      continue;
    }
  }
}
c(extractDefs, "extractDefs");
function finalize(e, o) {
  let r = e.seen.get(o);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  let a = c((s) => {
    let l = e.seen.get(s);
    if (l.ref === null) return;
    let p = l.def ?? l.schema,
      u = { ...p },
      h = l.ref;
    if (((l.ref = null), h)) {
      a(h);
      let S = e.seen.get(h),
        _ = S.schema;
      if (
        (_.$ref &&
        (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0")
          ? ((p.allOf = p.allOf ?? []), p.allOf.push(_))
          : Object.assign(p, _),
        Object.assign(p, u),
        s._zod.parent === h)
      )
        for (let $ in p) $ === "$ref" || $ === "allOf" || $ in u || delete p[$];
      if (_.$ref && S.def)
        for (let $ in p)
          $ === "$ref" ||
            $ === "allOf" ||
            ($ in S.def && JSON.stringify(p[$]) === JSON.stringify(S.def[$]) && delete p[$]);
    }
    let b = s._zod.parent;
    if (b && b !== h) {
      a(b);
      let S = e.seen.get(b);
      if (S?.schema.$ref && ((p.$ref = S.schema.$ref), S.def))
        for (let _ in p)
          _ === "$ref" ||
            _ === "allOf" ||
            (_ in S.def && JSON.stringify(p[_]) === JSON.stringify(S.def[_]) && delete p[_]);
    }
    e.override({ zodSchema: s, jsonSchema: p, path: l.path ?? [] });
  }, "flattenRef");
  for (let s of [...e.seen.entries()].reverse()) a(s[0]);
  let n = {};
  if (
    (e.target === "draft-2020-12"
      ? (n.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (n.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (n.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    e.external?.uri)
  ) {
    let s = e.external.registry.get(o)?.id;
    if (!s) throw new Error("Schema is missing an `id` property");
    n.$id = e.external.uri(s);
  }
  Object.assign(n, r.def ?? r.schema);
  let i = e.external?.defs ?? {};
  for (let s of e.seen.entries()) {
    let l = s[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  e.external ||
    (Object.keys(i).length > 0 &&
      (e.target === "draft-2020-12" ? (n.$defs = i) : (n.definitions = i)));
  try {
    let s = JSON.parse(JSON.stringify(n));
    return (
      Object.defineProperty(s, "~standard", {
        value: {
          ...o["~standard"],
          jsonSchema: {
            input: Ct(o, "input", e.processors),
            output: Ct(o, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      s
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
c(finalize, "finalize");
function isTransforming(e, o) {
  let r = o ?? { seen: new Set() };
  if (r.seen.has(e)) return !1;
  r.seen.add(e);
  let a = e._zod.def;
  if (a.type === "transform") return !0;
  if (a.type === "array") return isTransforming(a.element, r);
  if (a.type === "set") return isTransforming(a.valueType, r);
  if (a.type === "lazy") return isTransforming(a.getter(), r);
  if (
    a.type === "promise" ||
    a.type === "optional" ||
    a.type === "nonoptional" ||
    a.type === "nullable" ||
    a.type === "readonly" ||
    a.type === "default" ||
    a.type === "prefault"
  )
    return isTransforming(a.innerType, r);
  if (a.type === "intersection") return isTransforming(a.left, r) || isTransforming(a.right, r);
  if (a.type === "record" || a.type === "map") return isTransforming(a.keyType, r) || isTransforming(a.valueType, r);
  if (a.type === "pipe") return isTransforming(a.in, r) || isTransforming(a.out, r);
  if (a.type === "object") {
    for (let n in a.shape) if (isTransforming(a.shape[n], r)) return !0;
    return !1;
  }
  if (a.type === "union") {
    for (let n of a.options) if (isTransforming(n, r)) return !0;
    return !1;
  }
  if (a.type === "tuple") {
    for (let n of a.items) if (isTransforming(n, r)) return !0;
    return !!(a.rest && isTransforming(a.rest, r));
  }
  return !1;
}
c(isTransforming, "isTransforming");
var Mc = c(
    (e, o = {}) =>
      (r) => {
        let a = initializeContext({ ...r, processors: o });
        return (D(e, a), extractDefs(a, e), finalize(a, e));
      },
    "createToJSONSchemaMethod",
  ),
  Ct = c(
    (e, o, r = {}) =>
      (a) => {
        let { libraryOptions: n, target: i } = a ?? {},
          s = initializeContext({ ...(n ?? {}), target: i, io: o, processors: r });
        return (D(e, s), extractDefs(s, e), finalize(s, e));
      },
    "createStandardJSONSchemaMethod",
  );
var tv = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
  $c = c((e, o, r, a) => {
    let n = r;
    n.type = "string";
    let { minimum: i, maximum: s, format: l, patterns: p, contentEncoding: u } = e._zod.bag;
    if (
      (typeof i == "number" && (n.minLength = i),
      typeof s == "number" && (n.maxLength = s),
      l &&
        ((n.format = tv[l] ?? l),
        n.format === "" && delete n.format,
        l === "time" && delete n.format),
      u && (n.contentEncoding = u),
      p && p.size > 0)
    ) {
      let h = [...p];
      h.length === 1
        ? (n.pattern = h[0].source)
        : h.length > 1 &&
          (n.allOf = [
            ...h.map((b) => ({
              ...(o.target === "draft-07" || o.target === "draft-04" || o.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: b.source,
            })),
          ]);
    }
  }, "stringProcessor"),
  Dc = c((e, o, r, a) => {
    let n = r,
      {
        minimum: i,
        maximum: s,
        format: l,
        multipleOf: p,
        exclusiveMaximum: u,
        exclusiveMinimum: h,
      } = e._zod.bag;
    (typeof l == "string" && l.includes("int") ? (n.type = "integer") : (n.type = "number"),
      typeof h == "number" &&
        (o.target === "draft-04" || o.target === "openapi-3.0"
          ? ((n.minimum = h), (n.exclusiveMinimum = !0))
          : (n.exclusiveMinimum = h)),
      typeof i == "number" &&
        ((n.minimum = i),
        typeof h == "number" &&
          o.target !== "draft-04" &&
          (h >= i ? delete n.minimum : delete n.exclusiveMinimum)),
      typeof u == "number" &&
        (o.target === "draft-04" || o.target === "openapi-3.0"
          ? ((n.maximum = u), (n.exclusiveMaximum = !0))
          : (n.exclusiveMaximum = u)),
      typeof s == "number" &&
        ((n.maximum = s),
        typeof u == "number" &&
          o.target !== "draft-04" &&
          (u <= s ? delete n.maximum : delete n.exclusiveMaximum)),
      typeof p == "number" && (n.multipleOf = p));
  }, "numberProcessor"),
  Uc = c((e, o, r, a) => {
    r.type = "boolean";
  }, "booleanProcessor"),
  Nc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("BigInt cannot be represented in JSON Schema");
  }, "bigintProcessor"),
  Zc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Symbols cannot be represented in JSON Schema");
  }, "symbolProcessor"),
  jc = c((e, o, r, a) => {
    o.target === "openapi-3.0"
      ? ((r.type = "string"), (r.nullable = !0), (r.enum = [null]))
      : (r.type = "null");
  }, "nullProcessor"),
  Bc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Undefined cannot be represented in JSON Schema");
  }, "undefinedProcessor"),
  Lc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
  }, "voidProcessor"),
  Wc = c((e, o, r, a) => {
    r.not = {};
  }, "neverProcessor"),
  Fc = c((e, o, r, a) => {}, "anyProcessor"),
  qc = c((e, o, r, a) => {}, "unknownProcessor"),
  Vc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
  }, "dateProcessor"),
  Gc = c((e, o, r, a) => {
    let n = e._zod.def,
      i = getEnumValues(n.entries);
    (i.every((s) => typeof s == "number") && (r.type = "number"),
      i.every((s) => typeof s == "string") && (r.type = "string"),
      (r.enum = i));
  }, "enumProcessor"),
  Kc = c((e, o, r, a) => {
    let n = e._zod.def,
      i = [];
    for (let s of n.values)
      if (s === void 0) {
        if (o.unrepresentable === "throw")
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof s == "bigint") {
        if (o.unrepresentable === "throw")
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        i.push(Number(s));
      } else i.push(s);
    if (i.length !== 0)
      if (i.length === 1) {
        let s = i[0];
        ((r.type = s === null ? "null" : typeof s),
          o.target === "draft-04" || o.target === "openapi-3.0" ? (r.enum = [s]) : (r.const = s));
      } else
        (i.every((s) => typeof s == "number") && (r.type = "number"),
          i.every((s) => typeof s == "string") && (r.type = "string"),
          i.every((s) => typeof s == "boolean") && (r.type = "boolean"),
          i.every((s) => s === null) && (r.type = "null"),
          (r.enum = i));
  }, "literalProcessor"),
  Hc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
  }, "nanProcessor"),
  Jc = c((e, o, r, a) => {
    let n = r,
      i = e._zod.pattern;
    if (!i) throw new Error("Pattern not found in template literal");
    ((n.type = "string"), (n.pattern = i.source));
  }, "templateLiteralProcessor"),
  Yc = c((e, o, r, a) => {
    let n = r,
      i = { type: "string", format: "binary", contentEncoding: "binary" },
      { minimum: s, maximum: l, mime: p } = e._zod.bag;
    (s !== void 0 && (i.minLength = s),
      l !== void 0 && (i.maxLength = l),
      p
        ? p.length === 1
          ? ((i.contentMediaType = p[0]), Object.assign(n, i))
          : (Object.assign(n, i), (n.anyOf = p.map((u) => ({ contentMediaType: u }))))
        : Object.assign(n, i));
  }, "fileProcessor"),
  Xc = c((e, o, r, a) => {
    r.type = "boolean";
  }, "successProcessor"),
  Qc = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  }, "customProcessor"),
  el = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Function types cannot be represented in JSON Schema");
  }, "functionProcessor"),
  tl = c((e, o, r, a) => {
    if (o.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  }, "transformProcessor"),
  nl = c((e, o, r, a) => {
    if (o.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
  }, "mapProcessor"),
  ol = c((e, o, r, a) => {
    if (o.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
  }, "setProcessor"),
  rl = c((e, o, r, a) => {
    let n = r,
      i = e._zod.def,
      { minimum: s, maximum: l } = e._zod.bag;
    (typeof s == "number" && (n.minItems = s),
      typeof l == "number" && (n.maxItems = l),
      (n.type = "array"),
      (n.items = D(i.element, o, { ...a, path: [...a.path, "items"] })));
  }, "arrayProcessor"),
  il = c((e, o, r, a) => {
    let n = r,
      i = e._zod.def;
    ((n.type = "object"), (n.properties = {}));
    let s = i.shape;
    for (let u in s) n.properties[u] = D(s[u], o, { ...a, path: [...a.path, "properties", u] });
    let l = new Set(Object.keys(s)),
      p = new Set(
        [...l].filter((u) => {
          let h = i.shape[u]._zod;
          return o.io === "input" ? h.optin === void 0 : h.optout === void 0;
        }),
      );
    (p.size > 0 && (n.required = Array.from(p)),
      i.catchall?._zod.def.type === "never"
        ? (n.additionalProperties = !1)
        : i.catchall
          ? i.catchall &&
            (n.additionalProperties = D(i.catchall, o, {
              ...a,
              path: [...a.path, "additionalProperties"],
            }))
          : o.io === "output" && (n.additionalProperties = !1));
  }, "objectProcessor"),
  Uo = c((e, o, r, a) => {
    let n = e._zod.def,
      i = n.inclusive === !1,
      s = n.options.map((l, p) => D(l, o, { ...a, path: [...a.path, i ? "oneOf" : "anyOf", p] }));
    i ? (r.oneOf = s) : (r.anyOf = s);
  }, "unionProcessor"),
  al = c((e, o, r, a) => {
    let n = e._zod.def,
      i = D(n.left, o, { ...a, path: [...a.path, "allOf", 0] }),
      s = D(n.right, o, { ...a, path: [...a.path, "allOf", 1] }),
      l = c((u) => "allOf" in u && Object.keys(u).length === 1, "isSimpleIntersection"),
      p = [...(l(i) ? i.allOf : [i]), ...(l(s) ? s.allOf : [s])];
    r.allOf = p;
  }, "intersectionProcessor"),
  sl = c((e, o, r, a) => {
    let n = r,
      i = e._zod.def;
    n.type = "array";
    let s = o.target === "draft-2020-12" ? "prefixItems" : "items",
      l = o.target === "draft-2020-12" || o.target === "openapi-3.0" ? "items" : "additionalItems",
      p = i.items.map((S, _) => D(S, o, { ...a, path: [...a.path, s, _] })),
      u = i.rest
        ? D(i.rest, o, {
            ...a,
            path: [...a.path, l, ...(o.target === "openapi-3.0" ? [i.items.length] : [])],
          })
        : null;
    o.target === "draft-2020-12"
      ? ((n.prefixItems = p), u && (n.items = u))
      : o.target === "openapi-3.0"
        ? ((n.items = { anyOf: p }),
          u && n.items.anyOf.push(u),
          (n.minItems = p.length),
          u || (n.maxItems = p.length))
        : ((n.items = p), u && (n.additionalItems = u));
    let { minimum: h, maximum: b } = e._zod.bag;
    (typeof h == "number" && (n.minItems = h), typeof b == "number" && (n.maxItems = b));
  }, "tupleProcessor"),
  cl = c((e, o, r, a) => {
    let n = r,
      i = e._zod.def;
    n.type = "object";
    let s = i.keyType,
      p = s._zod.bag?.patterns;
    if (i.mode === "loose" && p && p.size > 0) {
      let h = D(i.valueType, o, { ...a, path: [...a.path, "patternProperties", "*"] });
      n.patternProperties = {};
      for (let b of p) n.patternProperties[b.source] = h;
    } else
      ((o.target === "draft-07" || o.target === "draft-2020-12") &&
        (n.propertyNames = D(i.keyType, o, { ...a, path: [...a.path, "propertyNames"] })),
        (n.additionalProperties = D(i.valueType, o, {
          ...a,
          path: [...a.path, "additionalProperties"],
        })));
    let u = s._zod.values;
    if (u) {
      let h = [...u].filter((b) => typeof b == "string" || typeof b == "number");
      h.length > 0 && (n.required = h);
    }
  }, "recordProcessor"),
  ll = c((e, o, r, a) => {
    let n = e._zod.def,
      i = D(n.innerType, o, a),
      s = o.seen.get(e);
    o.target === "openapi-3.0"
      ? ((s.ref = n.innerType), (r.nullable = !0))
      : (r.anyOf = [i, { type: "null" }]);
  }, "nullableProcessor"),
  dl = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    i.ref = n.innerType;
  }, "nonoptionalProcessor"),
  ul = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    ((i.ref = n.innerType), (r.default = JSON.parse(JSON.stringify(n.defaultValue))));
  }, "defaultProcessor"),
  pl = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    ((i.ref = n.innerType),
      o.io === "input" && (r._prefault = JSON.parse(JSON.stringify(n.defaultValue))));
  }, "prefaultProcessor"),
  ml = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    i.ref = n.innerType;
    let s;
    try {
      s = n.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    r.default = s;
  }, "catchProcessor"),
  gl = c((e, o, r, a) => {
    let n = e._zod.def,
      i = o.io === "input" ? (n.in._zod.def.type === "transform" ? n.out : n.in) : n.out;
    D(i, o, a);
    let s = o.seen.get(e);
    s.ref = i;
  }, "pipeProcessor"),
  fl = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    ((i.ref = n.innerType), (r.readOnly = !0));
  }, "readonlyProcessor"),
  hl = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    i.ref = n.innerType;
  }, "promiseProcessor"),
  No = c((e, o, r, a) => {
    let n = e._zod.def;
    D(n.innerType, o, a);
    let i = o.seen.get(e);
    i.ref = n.innerType;
  }, "optionalProcessor"),
  yl = c((e, o, r, a) => {
    let n = e._zod.innerType;
    D(n, o, a);
    let i = o.seen.get(e);
    i.ref = n;
  }, "lazyProcessor"),
  Do = {
    string: $c,
    number: Dc,
    boolean: Uc,
    bigint: Nc,
    symbol: Zc,
    null: jc,
    undefined: Bc,
    void: Lc,
    never: Wc,
    any: Fc,
    unknown: qc,
    date: Vc,
    enum: Gc,
    literal: Kc,
    nan: Hc,
    template_literal: Jc,
    file: Yc,
    success: Xc,
    custom: Qc,
    function: el,
    transform: tl,
    map: nl,
    set: ol,
    array: rl,
    object: il,
    union: Uo,
    intersection: al,
    tuple: sl,
    record: cl,
    nullable: ll,
    nonoptional: dl,
    default: ul,
    prefault: pl,
    catch: ml,
    pipe: gl,
    readonly: fl,
    promise: hl,
    optional: No,
    lazy: yl,
  };
function toJSONSchema(e, o) {
  if ("_idmap" in e) {
    let a = e,
      n = initializeContext({ ...o, processors: Do }),
      i = {};
    for (let p of a._idmap.entries()) {
      let [u, h] = p;
      D(h, n);
    }
    let s = {},
      l = { registry: a, uri: o?.uri, defs: i };
    n.external = l;
    for (let p of a._idmap.entries()) {
      let [u, h] = p;
      (extractDefs(n, h), (s[u] = finalize(n, h)));
    }
    if (Object.keys(i).length > 0) {
      let p = n.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = { [p]: i };
    }
    return { schemas: s };
  }
  let r = initializeContext({ ...o, processors: Do });
  return (D(e, r), extractDefs(r, e), finalize(r, e));
}
c(toJSONSchema, "toJSONSchema");
var jo = class {
  static {
    c(this, "JSONSchemaGenerator");
  }
  get metadataRegistry() {
    return this.ctx.metadataRegistry;
  }
  get target() {
    return this.ctx.target;
  }
  get unrepresentable() {
    return this.ctx.unrepresentable;
  }
  get override() {
    return this.ctx.override;
  }
  get io() {
    return this.ctx.io;
  }
  get counter() {
    return this.ctx.counter;
  }
  set counter(o) {
    this.ctx.counter = o;
  }
  get seen() {
    return this.ctx.seen;
  }
  constructor(o) {
    let r = o?.target ?? "draft-2020-12";
    (r === "draft-4" && (r = "draft-04"),
      r === "draft-7" && (r = "draft-07"),
      (this.ctx = initializeContext({
        processors: Do,
        target: r,
        ...(o?.metadata && { metadata: o.metadata }),
        ...(o?.unrepresentable && { unrepresentable: o.unrepresentable }),
        ...(o?.override && { override: o.override }),
        ...(o?.io && { io: o.io }),
      })));
  }
  process(o, r = { path: [], schemaPath: [] }) {
    return D(o, this.ctx, r);
  }
  emit(o, r) {
    (r &&
      (r.cycles && (this.ctx.cycles = r.cycles),
      r.reused && (this.ctx.reused = r.reused),
      r.external && (this.ctx.external = r.external)),
      extractDefs(this.ctx, o));
    let a = finalize(this.ctx, o),
      { "~standard": n, ...i } = a;
    return i;
  }
};
var lp = {};
var gn = {};
ke(gn, {
  ZodAny: () => Bl,
  ZodArray: () => ql,
  ZodBase64: () => sr,
  ZodBase64URL: () => cr,
  ZodBigInt: () => At,
  ZodBigIntFormat: () => ur,
  ZodBoolean: () => Ot,
  ZodCIDRv4: () => ir,
  ZodCIDRv6: () => ar,
  ZodCUID: () => Xo,
  ZodCUID2: () => Qo,
  ZodCatch: () => md,
  ZodCodec: () => vr,
  ZodCustom: () => Cn,
  ZodCustomStringFormat: () => wt,
  ZodDate: () => Sn,
  ZodDefault: () => sd,
  ZodDiscriminatedUnion: () => Gl,
  ZodE164: () => lr,
  ZodEmail: () => Ho,
  ZodEmoji: () => Jo,
  ZodEnum: () => Pt,
  ZodExactOptional: () => rd,
  ZodFile: () => nd,
  ZodFunction: () => xd,
  ZodGUID: () => fn,
  ZodIPv4: () => or,
  ZodIPv6: () => rr,
  ZodIntersection: () => Kl,
  ZodJWT: () => dr,
  ZodKSUID: () => nr,
  ZodLazy: () => vd,
  ZodLiteral: () => td,
  ZodMAC: () => Ml,
  ZodMap: () => Ql,
  ZodNaN: () => fd,
  ZodNanoID: () => Yo,
  ZodNever: () => Wl,
  ZodNonOptional: () => yr,
  ZodNull: () => Zl,
  ZodNullable: () => ad,
  ZodNumber: () => Et,
  ZodNumberFormat: () => Ye,
  ZodObject: () => xn,
  ZodOptional: () => hr,
  ZodPipe: () => br,
  ZodPrefault: () => ld,
  ZodPromise: () => _d,
  ZodReadonly: () => hd,
  ZodRecord: () => In,
  ZodSet: () => ed,
  ZodString: () => Tt,
  ZodStringFormat: () => N,
  ZodSuccess: () => pd,
  ZodSymbol: () => Ul,
  ZodTemplateLiteral: () => bd,
  ZodTransform: () => od,
  ZodTuple: () => Jl,
  ZodType: () => E,
  ZodULID: () => er,
  ZodURL: () => vn,
  ZodUUID: () => Se,
  ZodUndefined: () => Nl,
  ZodUnion: () => kn,
  ZodUnknown: () => Ll,
  ZodVoid: () => Fl,
  ZodXID: () => tr,
  ZodXor: () => Vl,
  _ZodString: () => Ko,
  _default: () => cd,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  catch: () => gd,
  check: () => check,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  codec: () => codec,
  cuid: () => cuid,
  cuid2: () => cuid2,
  custom: () => custom,
  date: () => Jp,
  describe: () => vm,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e164,
  email: () => email,
  emoji: () => vp,
  enum: () => gr,
  exactOptional: () => exactOptional,
  file: () => file,
  float32: () => float32,
  float64: () => float64,
  function: () => _function,
  guid: () => guid,
  hash: () => hash,
  hex: () => hex,
  hostname: () => hostname,
  httpUrl: () => httpUrl,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid,
  lazy: () => lazy,
  literal: () => literal,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  mac: () => mac,
  map: () => map,
  meta: () => Sm,
  nan: () => nan,
  nanoid: () => nanoid,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => jl,
  nullable: () => nullable,
  nullish: () => dm,
  number: () => number,
  object: () => object,
  optional: () => optional,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  prefault: () => prefault,
  preprocess: () => preprocess,
  promise: () => promise,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  set: () => set,
  strictObject: () => strictObject,
  string: () => string,
  stringFormat: () => stringFormat,
  stringbool: () => xm,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid,
  undefined: () => Gp,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => Hp,
  xid: () => xid,
  xor: () => xor,
});
var Bo = {};
ke(Bo, {
  endsWith: () => _endsWith,
  gt: () => _gt,
  gte: () => _gte,
  includes: () => _includes,
  length: () => _length,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  negative: () => _negative,
  nonnegative: () => _nonnegative,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  overwrite: () => _overwrite,
  positive: () => _positive,
  property: () => _property,
  regex: () => _regex,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  trim: () => _trim,
  uppercase: () => _uppercase,
});
var Rt = {};
ke(Rt, {
  ZodISODate: () => Wo,
  ZodISODateTime: () => Lo,
  ZodISODuration: () => qo,
  ZodISOTime: () => Fo,
  date: () => date,
  datetime: () => bl,
  duration: () => duration,
  time: () => Sl,
});
var Lo = $constructor("ZodISODateTime", (e, o) => {
  (oa.init(e, o), N.init(e, o));
});
function bl(e) {
  return _isoDateTime(Lo, e);
}
c(bl, "datetime");
var Wo = $constructor("ZodISODate", (e, o) => {
  (ra.init(e, o), N.init(e, o));
});
function date(e) {
  return _isoDate(Wo, e);
}
c(date, "date");
var Fo = $constructor("ZodISOTime", (e, o) => {
  (ia.init(e, o), N.init(e, o));
});
function Sl(e) {
  return _isoTime(Fo, e);
}
c(Sl, "time");
var qo = $constructor("ZodISODuration", (e, o) => {
  (aa.init(e, o), N.init(e, o));
});
function duration(e) {
  return _isoDuration(qo, e);
}
c(duration, "duration");
var dp = c((e, o) => {
    (Yt.init(e, o),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: c((r) => formatError(e, r), "value") },
        flatten: { value: c((r) => flattenError(e, r), "value") },
        addIssue: {
          value: c((r) => {
            (e.issues.push(r), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        addIssues: {
          value: c((r) => {
            (e.issues.push(...r), (e.message = JSON.stringify(e.issues, jsonStringifyReplacer, 2)));
          }, "value"),
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  }, "initializer"),
  ov = $constructor("ZodError", dp),
  ee = $constructor("ZodError", dp, { Parent: Error });
var xl = at(ee),
  kl = st(ee),
  Il = ct(ee),
  Cl = lt(ee),
  Rl = Bn(ee),
  Pl = Ln(ee),
  Tl = Wn(ee),
  wl = Fn(ee),
  El = qn(ee),
  Ol = Vn(ee),
  Al = Gn(ee),
  zl = Kn(ee);
var E = $constructor(
    "ZodType",
    (e, o) => (
      w.init(e, o),
      Object.assign(e["~standard"], {
        jsonSchema: { input: Ct(e, "input"), output: Ct(e, "output") },
      }),
      (e.toJSONSchema = Mc(e, {})),
      (e.def = o),
      (e.type = o.type),
      Object.defineProperty(e, "_def", { value: o }),
      (e.check = (...r) =>
        e.clone(
          I.mergeDefs(o, {
            checks: [
              ...(o.checks ?? []),
              ...r.map((a) =>
                typeof a == "function"
                  ? { _zod: { check: a, def: { check: "custom" }, onattach: [] } }
                  : a,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (r, a) => clone(e, r, a)),
      (e.brand = () => e),
      (e.register = (r, a) => (r.add(e, a), e)),
      (e.parse = (r, a) => xl(e, r, a, { callee: e.parse })),
      (e.safeParse = (r, a) => Il(e, r, a)),
      (e.parseAsync = async (r, a) => kl(e, r, a, { callee: e.parseAsync })),
      (e.safeParseAsync = async (r, a) => Cl(e, r, a)),
      (e.spa = e.safeParseAsync),
      (e.encode = (r, a) => Rl(e, r, a)),
      (e.decode = (r, a) => Pl(e, r, a)),
      (e.encodeAsync = async (r, a) => Tl(e, r, a)),
      (e.decodeAsync = async (r, a) => wl(e, r, a)),
      (e.safeEncode = (r, a) => El(e, r, a)),
      (e.safeDecode = (r, a) => Ol(e, r, a)),
      (e.safeEncodeAsync = async (r, a) => Al(e, r, a)),
      (e.safeDecodeAsync = async (r, a) => zl(e, r, a)),
      (e.refine = (r, a) => e.check(refine(r, a))),
      (e.superRefine = (r) => e.check(superRefine(r))),
      (e.overwrite = (r) => e.check(_overwrite(r))),
      (e.optional = () => optional(e)),
      (e.exactOptional = () => exactOptional(e)),
      (e.nullable = () => nullable(e)),
      (e.nullish = () => optional(nullable(e))),
      (e.nonoptional = (r) => nonoptional(e, r)),
      (e.array = () => array(e)),
      (e.or = (r) => union([e, r])),
      (e.and = (r) => intersection(e, r)),
      (e.transform = (r) => pipe(e, transform(r))),
      (e.default = (r) => cd(e, r)),
      (e.prefault = (r) => prefault(e, r)),
      (e.catch = (r) => gd(e, r)),
      (e.pipe = (r) => pipe(e, r)),
      (e.readonly = () => readonly(e)),
      (e.describe = (r) => {
        let a = e.clone();
        return (q.add(a, { description: r }), a);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return q.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...r) => {
        if (r.length === 0) return q.get(e);
        let a = e.clone();
        return (q.add(a, r[0]), a);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (r) => r(e)),
      e
    ),
  ),
  Ko = $constructor("_ZodString", (e, o) => {
    (Ve.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (a, n, i) => $c(e, a, n, i)));
    let r = e._zod.bag;
    ((e.format = r.format ?? null),
      (e.minLength = r.minimum ?? null),
      (e.maxLength = r.maximum ?? null),
      (e.regex = (...a) => e.check(_regex(...a))),
      (e.includes = (...a) => e.check(_includes(...a))),
      (e.startsWith = (...a) => e.check(_startsWith(...a))),
      (e.endsWith = (...a) => e.check(_endsWith(...a))),
      (e.min = (...a) => e.check(_minLength(...a))),
      (e.max = (...a) => e.check(_maxLength(...a))),
      (e.length = (...a) => e.check(_length(...a))),
      (e.nonempty = (...a) => e.check(_minLength(1, ...a))),
      (e.lowercase = (a) => e.check(_lowercase(a))),
      (e.uppercase = (a) => e.check(_uppercase(a))),
      (e.trim = () => e.check(_trim())),
      (e.normalize = (...a) => e.check(_normalize(...a))),
      (e.toLowerCase = () => e.check(_toLowerCase())),
      (e.toUpperCase = () => e.check(_toUpperCase())),
      (e.slugify = () => e.check(_slugify())));
  }),
  Tt = $constructor("ZodString", (e, o) => {
    (Ve.init(e, o),
      Ko.init(e, o),
      (e.email = (r) => e.check(_email(Ho, r))),
      (e.url = (r) => e.check(_url(vn, r))),
      (e.jwt = (r) => e.check(_jwt(dr, r))),
      (e.emoji = (r) => e.check(_emoji(Jo, r))),
      (e.guid = (r) => e.check(_guid(fn, r))),
      (e.uuid = (r) => e.check(_uuid(Se, r))),
      (e.uuidv4 = (r) => e.check(_uuidv4(Se, r))),
      (e.uuidv6 = (r) => e.check(_uuidv6(Se, r))),
      (e.uuidv7 = (r) => e.check(_uuidv7(Se, r))),
      (e.nanoid = (r) => e.check(_nanoid(Yo, r))),
      (e.guid = (r) => e.check(_guid(fn, r))),
      (e.cuid = (r) => e.check(_cuid(Xo, r))),
      (e.cuid2 = (r) => e.check(_cuid2(Qo, r))),
      (e.ulid = (r) => e.check(_ulid(er, r))),
      (e.base64 = (r) => e.check(_base64(sr, r))),
      (e.base64url = (r) => e.check(_base64url(cr, r))),
      (e.xid = (r) => e.check(_xid(tr, r))),
      (e.ksuid = (r) => e.check(_ksuid(nr, r))),
      (e.ipv4 = (r) => e.check(_ipv4(or, r))),
      (e.ipv6 = (r) => e.check(_ipv6(rr, r))),
      (e.cidrv4 = (r) => e.check(_cidrv4(ir, r))),
      (e.cidrv6 = (r) => e.check(_cidrv6(ar, r))),
      (e.e164 = (r) => e.check(_e164(lr, r))),
      (e.datetime = (r) => e.check(bl(r))),
      (e.date = (r) => e.check(date(r))),
      (e.time = (r) => e.check(Sl(r))),
      (e.duration = (r) => e.check(duration(r))));
  });
function string(e) {
  return _string(Tt, e);
}
c(string, "string");
var N = $constructor("ZodStringFormat", (e, o) => {
    (U.init(e, o), Ko.init(e, o));
  }),
  Ho = $constructor("ZodEmail", (e, o) => {
    (Ki.init(e, o), N.init(e, o));
  });
function email(e) {
  return _email(Ho, e);
}
c(email, "email");
var fn = $constructor("ZodGUID", (e, o) => {
  (Vi.init(e, o), N.init(e, o));
});
function guid(e) {
  return _guid(fn, e);
}
c(guid, "guid");
var Se = $constructor("ZodUUID", (e, o) => {
  (Gi.init(e, o), N.init(e, o));
});
function uuid(e) {
  return _uuid(Se, e);
}
c(uuid, "uuid");
function uuidv4(e) {
  return _uuidv4(Se, e);
}
c(uuidv4, "uuidv4");
function uuidv6(e) {
  return _uuidv6(Se, e);
}
c(uuidv6, "uuidv6");
function uuidv7(e) {
  return _uuidv7(Se, e);
}
c(uuidv7, "uuidv7");
var vn = $constructor("ZodURL", (e, o) => {
  (Hi.init(e, o), N.init(e, o));
});
function url(e) {
  return _url(vn, e);
}
c(url, "url");
function httpUrl(e) {
  return _url(vn, { protocol: /^https?$/, hostname: de.domain, ...I.normalizeParams(e) });
}
c(httpUrl, "httpUrl");
var Jo = $constructor("ZodEmoji", (e, o) => {
  (Ji.init(e, o), N.init(e, o));
});
function vp(e) {
  return _emoji(Jo, e);
}
c(vp, "emoji");
var Yo = $constructor("ZodNanoID", (e, o) => {
  (Yi.init(e, o), N.init(e, o));
});
function nanoid(e) {
  return _nanoid(Yo, e);
}
c(nanoid, "nanoid");
var Xo = $constructor("ZodCUID", (e, o) => {
  (Xi.init(e, o), N.init(e, o));
});
function cuid(e) {
  return _cuid(Xo, e);
}
c(cuid, "cuid");
var Qo = $constructor("ZodCUID2", (e, o) => {
  (Qi.init(e, o), N.init(e, o));
});
function cuid2(e) {
  return _cuid2(Qo, e);
}
c(cuid2, "cuid2");
var er = $constructor("ZodULID", (e, o) => {
  (ea.init(e, o), N.init(e, o));
});
function ulid(e) {
  return _ulid(er, e);
}
c(ulid, "ulid");
var tr = $constructor("ZodXID", (e, o) => {
  (ta.init(e, o), N.init(e, o));
});
function xid(e) {
  return _xid(tr, e);
}
c(xid, "xid");
var nr = $constructor("ZodKSUID", (e, o) => {
  (na.init(e, o), N.init(e, o));
});
function ksuid(e) {
  return _ksuid(nr, e);
}
c(ksuid, "ksuid");
var or = $constructor("ZodIPv4", (e, o) => {
  (sa.init(e, o), N.init(e, o));
});
function ipv4(e) {
  return _ipv4(or, e);
}
c(ipv4, "ipv4");
var Ml = $constructor("ZodMAC", (e, o) => {
  (la.init(e, o), N.init(e, o));
});
function mac(e) {
  return _mac(Ml, e);
}
c(mac, "mac");
var rr = $constructor("ZodIPv6", (e, o) => {
  (ca.init(e, o), N.init(e, o));
});
function ipv6(e) {
  return _ipv6(rr, e);
}
c(ipv6, "ipv6");
var ir = $constructor("ZodCIDRv4", (e, o) => {
  (da.init(e, o), N.init(e, o));
});
function cidrv4(e) {
  return _cidrv4(ir, e);
}
c(cidrv4, "cidrv4");
var ar = $constructor("ZodCIDRv6", (e, o) => {
  (ua.init(e, o), N.init(e, o));
});
function cidrv6(e) {
  return _cidrv6(ar, e);
}
c(cidrv6, "cidrv6");
var sr = $constructor("ZodBase64", (e, o) => {
  (ma.init(e, o), N.init(e, o));
});
function base64(e) {
  return _base64(sr, e);
}
c(base64, "base64");
var cr = $constructor("ZodBase64URL", (e, o) => {
  (ga.init(e, o), N.init(e, o));
});
function base64url(e) {
  return _base64url(cr, e);
}
c(base64url, "base64url");
var lr = $constructor("ZodE164", (e, o) => {
  (fa.init(e, o), N.init(e, o));
});
function e164(e) {
  return _e164(lr, e);
}
c(e164, "e164");
var dr = $constructor("ZodJWT", (e, o) => {
  (ha.init(e, o), N.init(e, o));
});
function jwt(e) {
  return _jwt(dr, e);
}
c(jwt, "jwt");
var wt = $constructor("ZodCustomStringFormat", (e, o) => {
  (ya.init(e, o), N.init(e, o));
});
function stringFormat(e, o, r = {}) {
  return _stringFormat(wt, e, o, r);
}
c(stringFormat, "stringFormat");
function hostname(e) {
  return _stringFormat(wt, "hostname", de.hostname, e);
}
c(hostname, "hostname");
function hex(e) {
  return _stringFormat(wt, "hex", de.hex, e);
}
c(hex, "hex");
function hash(e, o) {
  let r = o?.enc ?? "hex",
    a = `${e}_${r}`,
    n = de[a];
  if (!n) throw new Error(`Unrecognized hash format: ${a}`);
  return _stringFormat(wt, a, n, o);
}
c(hash, "hash");
var Et = $constructor("ZodNumber", (e, o) => {
  (ro.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (a, n, i) => Dc(e, a, n, i)),
    (e.gt = (a, n) => e.check(_gt(a, n))),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.lt = (a, n) => e.check(_lt(a, n))),
    (e.lte = (a, n) => e.check(_lte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))),
    (e.int = (a) => e.check(int(a))),
    (e.safe = (a) => e.check(int(a))),
    (e.positive = (a) => e.check(_gt(0, a))),
    (e.nonnegative = (a) => e.check(_gte(0, a))),
    (e.negative = (a) => e.check(_lt(0, a))),
    (e.nonpositive = (a) => e.check(_lte(0, a))),
    (e.multipleOf = (a, n) => e.check(_multipleOf(a, n))),
    (e.step = (a, n) => e.check(_multipleOf(a, n))),
    (e.finite = () => e));
  let r = e._zod.bag;
  ((e.minValue =
    Math.max(
      r.minimum ?? Number.NEGATIVE_INFINITY,
      r.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
    ) ?? null),
    (e.maxValue =
      Math.min(
        r.maximum ?? Number.POSITIVE_INFINITY,
        r.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
      ) ?? null),
    (e.isInt = (r.format ?? "").includes("int") || Number.isSafeInteger(r.multipleOf ?? 0.5)),
    (e.isFinite = !0),
    (e.format = r.format ?? null));
});
function number(e) {
  return _number(Et, e);
}
c(number, "number");
var Ye = $constructor("ZodNumberFormat", (e, o) => {
  (ba.init(e, o), Et.init(e, o));
});
function int(e) {
  return _int(Ye, e);
}
c(int, "int");
function float32(e) {
  return _float32(Ye, e);
}
c(float32, "float32");
function float64(e) {
  return _float64(Ye, e);
}
c(float64, "float64");
function int32(e) {
  return _int32(Ye, e);
}
c(int32, "int32");
function uint32(e) {
  return _uint32(Ye, e);
}
c(uint32, "uint32");
var Ot = $constructor("ZodBoolean", (e, o) => {
  (on.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Uc(e, r, a, n)));
});
function boolean(e) {
  return _boolean(Ot, e);
}
c(boolean, "boolean");
var At = $constructor("ZodBigInt", (e, o) => {
  (io.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (a, n, i) => Nc(e, a, n, i)),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.gt = (a, n) => e.check(_gt(a, n))),
    (e.gte = (a, n) => e.check(_gte(a, n))),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.lt = (a, n) => e.check(_lt(a, n))),
    (e.lte = (a, n) => e.check(_lte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))),
    (e.positive = (a) => e.check(_gt(BigInt(0), a))),
    (e.negative = (a) => e.check(_lt(BigInt(0), a))),
    (e.nonpositive = (a) => e.check(_lte(BigInt(0), a))),
    (e.nonnegative = (a) => e.check(_gte(BigInt(0), a))),
    (e.multipleOf = (a, n) => e.check(_multipleOf(a, n))));
  let r = e._zod.bag;
  ((e.minValue = r.minimum ?? null),
    (e.maxValue = r.maximum ?? null),
    (e.format = r.format ?? null));
});
function bigint(e) {
  return _bigint(At, e);
}
c(bigint, "bigint");
var ur = $constructor("ZodBigIntFormat", (e, o) => {
  (va.init(e, o), At.init(e, o));
});
function int64(e) {
  return _int64(ur, e);
}
c(int64, "int64");
function uint64(e) {
  return _uint64(ur, e);
}
c(uint64, "uint64");
var Ul = $constructor("ZodSymbol", (e, o) => {
  (Sa.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Zc(e, r, a, n)));
});
function symbol(e) {
  return _symbol(Ul, e);
}
c(symbol, "symbol");
var Nl = $constructor("ZodUndefined", (e, o) => {
  (_a.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Bc(e, r, a, n)));
});
function Gp(e) {
  return _undefined(Nl, e);
}
c(Gp, "_undefined");
var Zl = $constructor("ZodNull", (e, o) => {
  (xa.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => jc(e, r, a, n)));
});
function jl(e) {
  return _null(Zl, e);
}
c(jl, "_null");
var Bl = $constructor("ZodAny", (e, o) => {
  (ka.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Fc(e, r, a, n)));
});
function any() {
  return _any(Bl);
}
c(any, "any");
var Ll = $constructor("ZodUnknown", (e, o) => {
  (Ia.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => qc(e, r, a, n)));
});
function unknown() {
  return _unknown(Ll);
}
c(unknown, "unknown");
var Wl = $constructor("ZodNever", (e, o) => {
  (Ca.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Wc(e, r, a, n)));
});
function never(e) {
  return _never(Wl, e);
}
c(never, "never");
var Fl = $constructor("ZodVoid", (e, o) => {
  (Ra.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Lc(e, r, a, n)));
});
function Hp(e) {
  return _void(Fl, e);
}
c(Hp, "_void");
var Sn = $constructor("ZodDate", (e, o) => {
  (Pa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (a, n, i) => Vc(e, a, n, i)),
    (e.min = (a, n) => e.check(_gte(a, n))),
    (e.max = (a, n) => e.check(_lte(a, n))));
  let r = e._zod.bag;
  ((e.minDate = r.minimum ? new Date(r.minimum) : null),
    (e.maxDate = r.maximum ? new Date(r.maximum) : null));
});
function Jp(e) {
  return _date(Sn, e);
}
c(Jp, "date");
var ql = $constructor("ZodArray", (e, o) => {
  (Ta.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => rl(e, r, a, n)),
    (e.element = o.element),
    (e.min = (r, a) => e.check(_minLength(r, a))),
    (e.nonempty = (r) => e.check(_minLength(1, r))),
    (e.max = (r, a) => e.check(_maxLength(r, a))),
    (e.length = (r, a) => e.check(_length(r, a))),
    (e.unwrap = () => e.element));
});
function array(e, o) {
  return _array(ql, e, o);
}
c(array, "array");
function keyof(e) {
  let o = e._zod.def.shape;
  return gr(Object.keys(o));
}
c(keyof, "keyof");
var xn = $constructor("ZodObject", (e, o) => {
  (wa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => il(e, r, a, n)),
    I.defineLazy(e, "shape", () => o.shape),
    (e.keyof = () => gr(Object.keys(e._zod.def.shape))),
    (e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: never() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (r) => I.extend(e, r)),
    (e.safeExtend = (r) => I.safeExtend(e, r)),
    (e.merge = (r) => I.merge(e, r)),
    (e.pick = (r) => I.pick(e, r)),
    (e.omit = (r) => I.omit(e, r)),
    (e.partial = (...r) => I.partial(hr, e, r[0])),
    (e.required = (...r) => I.required(yr, e, r[0])));
});
function object(e, o) {
  let r = { type: "object", shape: e ?? {}, ...I.normalizeParams(o) };
  return new xn(r);
}
c(object, "object");
function strictObject(e, o) {
  return new xn({ type: "object", shape: e, catchall: never(), ...I.normalizeParams(o) });
}
c(strictObject, "strictObject");
function looseObject(e, o) {
  return new xn({ type: "object", shape: e, catchall: unknown(), ...I.normalizeParams(o) });
}
c(looseObject, "looseObject");
var kn = $constructor("ZodUnion", (e, o) => {
  (rn.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => Uo(e, r, a, n)),
    (e.options = o.options));
});
function union(e, o) {
  return new kn({ type: "union", options: e, ...I.normalizeParams(o) });
}
c(union, "union");
var Vl = $constructor("ZodXor", (e, o) => {
  (kn.init(e, o),
    Ea.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => Uo(e, r, a, n)),
    (e.options = o.options));
});
function xor(e, o) {
  return new Vl({ type: "union", options: e, inclusive: !1, ...I.normalizeParams(o) });
}
c(xor, "xor");
var Gl = $constructor("ZodDiscriminatedUnion", (e, o) => {
  (kn.init(e, o), Oa.init(e, o));
});
function discriminatedUnion(e, o, r) {
  return new Gl({ type: "union", options: o, discriminator: e, ...I.normalizeParams(r) });
}
c(discriminatedUnion, "discriminatedUnion");
var Kl = $constructor("ZodIntersection", (e, o) => {
  (Aa.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => al(e, r, a, n)));
});
function intersection(e, o) {
  return new Kl({ type: "intersection", left: e, right: o });
}
c(intersection, "intersection");
var Jl = $constructor("ZodTuple", (e, o) => {
  (ao.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => sl(e, r, a, n)),
    (e.rest = (r) => e.clone({ ...e._zod.def, rest: r })));
});
function tuple(e, o, r) {
  let a = o instanceof w,
    n = a ? r : o,
    i = a ? o : null;
  return new Jl({ type: "tuple", items: e, rest: i, ...I.normalizeParams(n) });
}
c(tuple, "tuple");
var In = $constructor("ZodRecord", (e, o) => {
  (za.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => cl(e, r, a, n)),
    (e.keyType = o.keyType),
    (e.valueType = o.valueType));
});
function record(e, o, r) {
  return new In({ type: "record", keyType: e, valueType: o, ...I.normalizeParams(r) });
}
c(record, "record");
function partialRecord(e, o, r) {
  let a = clone(e);
  return (
    (a._zod.values = void 0),
    new In({ type: "record", keyType: a, valueType: o, ...I.normalizeParams(r) })
  );
}
c(partialRecord, "partialRecord");
function looseRecord(e, o, r) {
  return new In({
    type: "record",
    keyType: e,
    valueType: o,
    mode: "loose",
    ...I.normalizeParams(r),
  });
}
c(looseRecord, "looseRecord");
var Ql = $constructor("ZodMap", (e, o) => {
  (Ma.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => nl(e, r, a, n)),
    (e.keyType = o.keyType),
    (e.valueType = o.valueType),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function map(e, o, r) {
  return new Ql({ type: "map", keyType: e, valueType: o, ...I.normalizeParams(r) });
}
c(map, "map");
var ed = $constructor("ZodSet", (e, o) => {
  ($a.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => ol(e, r, a, n)),
    (e.min = (...r) => e.check(_minSize(...r))),
    (e.nonempty = (r) => e.check(_minSize(1, r))),
    (e.max = (...r) => e.check(_maxSize(...r))),
    (e.size = (...r) => e.check(_size(...r))));
});
function set(e, o) {
  return new ed({ type: "set", valueType: e, ...I.normalizeParams(o) });
}
c(set, "set");
var Pt = $constructor("ZodEnum", (e, o) => {
  (Da.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (a, n, i) => Gc(e, a, n, i)),
    (e.enum = o.entries),
    (e.options = Object.values(o.entries)));
  let r = new Set(Object.keys(o.entries));
  ((e.extract = (a, n) => {
    let i = {};
    for (let s of a)
      if (r.has(s)) i[s] = o.entries[s];
      else throw new Error(`Key ${s} not found in enum`);
    return new Pt({ ...o, checks: [], ...I.normalizeParams(n), entries: i });
  }),
    (e.exclude = (a, n) => {
      let i = { ...o.entries };
      for (let s of a)
        if (r.has(s)) delete i[s];
        else throw new Error(`Key ${s} not found in enum`);
      return new Pt({ ...o, checks: [], ...I.normalizeParams(n), entries: i });
    }));
});
function gr(e, o) {
  let r = Array.isArray(e) ? Object.fromEntries(e.map((a) => [a, a])) : e;
  return new Pt({ type: "enum", entries: r, ...I.normalizeParams(o) });
}
c(gr, "_enum");
function nativeEnum(e, o) {
  return new Pt({ type: "enum", entries: e, ...I.normalizeParams(o) });
}
c(nativeEnum, "nativeEnum");
var td = $constructor("ZodLiteral", (e, o) => {
  (Ua.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => Kc(e, r, a, n)),
    (e.values = new Set(o.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (o.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return o.values[0];
      },
    }));
});
function literal(e, o) {
  return new td({ type: "literal", values: Array.isArray(e) ? e : [e], ...I.normalizeParams(o) });
}
c(literal, "literal");
var nd = $constructor("ZodFile", (e, o) => {
  (Na.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => Yc(e, r, a, n)),
    (e.min = (r, a) => e.check(_minSize(r, a))),
    (e.max = (r, a) => e.check(_maxSize(r, a))),
    (e.mime = (r, a) => e.check(_mime(Array.isArray(r) ? r : [r], a))));
});
function file(e) {
  return _file(nd, e);
}
c(file, "file");
var od = $constructor("ZodTransform", (e, o) => {
  (Za.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => tl(e, r, a, n)),
    (e._zod.parse = (r, a) => {
      if (a.direction === "backward") throw new Oe(e.constructor.name);
      r.addIssue = (i) => {
        if (typeof i == "string") r.issues.push(I.issue(i, r.value, o));
        else {
          let s = i;
          (s.fatal && (s.continue = !1),
            s.code ?? (s.code = "custom"),
            s.input ?? (s.input = r.value),
            s.inst ?? (s.inst = e),
            r.issues.push(I.issue(s)));
        }
      };
      let n = o.transform(r.value, r);
      return n instanceof Promise ? n.then((i) => ((r.value = i), r)) : ((r.value = n), r);
    }));
});
function transform(e) {
  return new od({ type: "transform", transform: e });
}
c(transform, "transform");
var hr = $constructor("ZodOptional", (e, o) => {
  (so.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => No(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function optional(e) {
  return new hr({ type: "optional", innerType: e });
}
c(optional, "optional");
var rd = $constructor("ZodExactOptional", (e, o) => {
  (ja.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => No(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function exactOptional(e) {
  return new rd({ type: "optional", innerType: e });
}
c(exactOptional, "exactOptional");
var ad = $constructor("ZodNullable", (e, o) => {
  (Ba.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => ll(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nullable(e) {
  return new ad({ type: "nullable", innerType: e });
}
c(nullable, "nullable");
function dm(e) {
  return optional(nullable(e));
}
c(dm, "nullish");
var sd = $constructor("ZodDefault", (e, o) => {
  (La.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => ul(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function cd(e, o) {
  return new sd({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof o == "function" ? o() : I.shallowClone(o);
    },
  });
}
c(cd, "_default");
var ld = $constructor("ZodPrefault", (e, o) => {
  (Wa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => pl(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function prefault(e, o) {
  return new ld({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof o == "function" ? o() : I.shallowClone(o);
    },
  });
}
c(prefault, "prefault");
var yr = $constructor("ZodNonOptional", (e, o) => {
  (Fa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => dl(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function nonoptional(e, o) {
  return new yr({ type: "nonoptional", innerType: e, ...I.normalizeParams(o) });
}
c(nonoptional, "nonoptional");
var pd = $constructor("ZodSuccess", (e, o) => {
  (qa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => Xc(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function success(e) {
  return new pd({ type: "success", innerType: e });
}
c(success, "success");
var md = $constructor("ZodCatch", (e, o) => {
  (Va.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => ml(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function gd(e, o) {
  return new md({ type: "catch", innerType: e, catchValue: typeof o == "function" ? o : () => o });
}
c(gd, "_catch");
var fd = $constructor("ZodNaN", (e, o) => {
  (Ga.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Hc(e, r, a, n)));
});
function nan(e) {
  return _nan(fd, e);
}
c(nan, "nan");
var br = $constructor("ZodPipe", (e, o) => {
  (Ka.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => gl(e, r, a, n)),
    (e.in = o.in),
    (e.out = o.out));
});
function pipe(e, o) {
  return new br({ type: "pipe", in: e, out: o });
}
c(pipe, "pipe");
var vr = $constructor("ZodCodec", (e, o) => {
  (br.init(e, o), an.init(e, o));
});
function codec(e, o, r) {
  return new vr({ type: "pipe", in: e, out: o, transform: r.decode, reverseTransform: r.encode });
}
c(codec, "codec");
var hd = $constructor("ZodReadonly", (e, o) => {
  (Ha.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => fl(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function readonly(e) {
  return new hd({ type: "readonly", innerType: e });
}
c(readonly, "readonly");
var bd = $constructor("ZodTemplateLiteral", (e, o) => {
  (Ja.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Jc(e, r, a, n)));
});
function templateLiteral(e, o) {
  return new bd({ type: "template_literal", parts: e, ...I.normalizeParams(o) });
}
c(templateLiteral, "templateLiteral");
var vd = $constructor("ZodLazy", (e, o) => {
  (Qa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => yl(e, r, a, n)),
    (e.unwrap = () => e._zod.def.getter()));
});
function lazy(e) {
  return new vd({ type: "lazy", getter: e });
}
c(lazy, "lazy");
var _d = $constructor("ZodPromise", (e, o) => {
  (Xa.init(e, o),
    E.init(e, o),
    (e._zod.processJSONSchema = (r, a, n) => hl(e, r, a, n)),
    (e.unwrap = () => e._zod.def.innerType));
});
function promise(e) {
  return new _d({ type: "promise", innerType: e });
}
c(promise, "promise");
var xd = $constructor("ZodFunction", (e, o) => {
  (Ya.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => el(e, r, a, n)));
});
function _function(e) {
  return new xd({
    type: "function",
    input: Array.isArray(e?.input) ? tuple(e?.input) : (e?.input ?? array(unknown())),
    output: e?.output ?? unknown(),
  });
}
c(_function, "_function");
var Cn = $constructor("ZodCustom", (e, o) => {
  (es.init(e, o), E.init(e, o), (e._zod.processJSONSchema = (r, a, n) => Qc(e, r, a, n)));
});
function check(e) {
  let o = new Z({ check: "custom" });
  return ((o._zod.check = e), o);
}
c(check, "check");
function custom(e, o) {
  return _custom(Cn, e ?? (() => !0), o);
}
c(custom, "custom");
function refine(e, o = {}) {
  return _refine(Cn, e, o);
}
c(refine, "refine");
function superRefine(e) {
  return _superRefine(e);
}
c(superRefine, "superRefine");
var vm = describe,
  Sm = meta;
function _instanceof(e, o = {}) {
  let r = new Cn({
    type: "custom",
    check: "custom",
    fn: c((a) => a instanceof e, "fn"),
    abort: !0,
    ...I.normalizeParams(o),
  });
  return (
    (r._zod.bag.Class = e),
    (r._zod.check = (a) => {
      a.value instanceof e ||
        a.issues.push({
          code: "invalid_type",
          expected: e.name,
          input: a.value,
          inst: r,
          path: [...(r._zod.def.path ?? [])],
        });
    }),
    r
  );
}
c(_instanceof, "_instanceof");
var xm = c((...e) => _stringbool({ Codec: vr, Boolean: Ot, String: Tt }, ...e), "stringbool");
function json(e) {
  let o = lazy(() => union([string(e), number(), boolean(), jl(), array(o), record(string(), o)]));
  return o;
}
c(json, "json");
function preprocess(e, o) {
  return pipe(transform(e), o);
}
c(preprocess, "preprocess");
var iv = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom",
};
function setErrorMap(e) {
  config({ customError: e });
}
c(setErrorMap, "setErrorMap");
function getErrorMap() {
  return config().customError;
}
c(getErrorMap, "getErrorMap");
var Cd;
Cd || (Cd = {});
var R = { ...gn, ...Bo, iso: Rt },
  cv = new Set([
    "$schema",
    "$ref",
    "$defs",
    "definitions",
    "$id",
    "id",
    "$comment",
    "$anchor",
    "$vocabulary",
    "$dynamicRef",
    "$dynamicAnchor",
    "type",
    "enum",
    "const",
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    "properties",
    "required",
    "additionalProperties",
    "patternProperties",
    "propertyNames",
    "minProperties",
    "maxProperties",
    "items",
    "prefixItems",
    "additionalItems",
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "description",
    "default",
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    "unevaluatedItems",
    "unevaluatedProperties",
    "if",
    "then",
    "else",
    "dependentSchemas",
    "dependentRequired",
    "nullable",
    "readOnly",
  ]);
function detectVersion(e, o) {
  let r = e.$schema;
  return r === "https://json-schema.org/draft/2020-12/schema"
    ? "draft-2020-12"
    : r === "http://json-schema.org/draft-07/schema#"
      ? "draft-7"
      : r === "http://json-schema.org/draft-04/schema#"
        ? "draft-4"
        : (o ?? "draft-2020-12");
}
c(detectVersion, "detectVersion");
function resolveRef(e, o) {
  if (!e.startsWith("#"))
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  let r = e.slice(1).split("/").filter(Boolean);
  if (r.length === 0) return o.rootSchema;
  let a = o.version === "draft-2020-12" ? "$defs" : "definitions";
  if (r[0] === a) {
    let n = r[1];
    if (!n || !o.defs[n]) throw new Error(`Reference not found: ${e}`);
    return o.defs[n];
  }
  throw new Error(`Reference not found: ${e}`);
}
c(resolveRef, "resolveRef");
function convertBaseSchema(e, o) {
  if (e.not !== void 0) {
    if (typeof e.not == "object" && Object.keys(e.not).length === 0) return R.never();
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (e.unevaluatedItems !== void 0) throw new Error("unevaluatedItems is not supported");
  if (e.unevaluatedProperties !== void 0) throw new Error("unevaluatedProperties is not supported");
  if (e.if !== void 0 || e.then !== void 0 || e.else !== void 0)
    throw new Error("Conditional schemas (if/then/else) are not supported");
  if (e.dependentSchemas !== void 0 || e.dependentRequired !== void 0)
    throw new Error("dependentSchemas and dependentRequired are not supported");
  if (e.$ref) {
    let n = e.$ref;
    if (o.refs.has(n)) return o.refs.get(n);
    if (o.processing.has(n))
      return R.lazy(() => {
        if (!o.refs.has(n)) throw new Error(`Circular reference not resolved: ${n}`);
        return o.refs.get(n);
      });
    o.processing.add(n);
    let i = resolveRef(n, o),
      s = convertSchema(i, o);
    return (o.refs.set(n, s), o.processing.delete(n), s);
  }
  if (e.enum !== void 0) {
    let n = e.enum;
    if (o.version === "openapi-3.0" && e.nullable === !0 && n.length === 1 && n[0] === null)
      return R.null();
    if (n.length === 0) return R.never();
    if (n.length === 1) return R.literal(n[0]);
    if (n.every((s) => typeof s == "string")) return R.enum(n);
    let i = n.map((s) => R.literal(s));
    return i.length < 2 ? i[0] : R.union([i[0], i[1], ...i.slice(2)]);
  }
  if (e.const !== void 0) return R.literal(e.const);
  let r = e.type;
  if (Array.isArray(r)) {
    let n = r.map((i) => {
      let s = { ...e, type: i };
      return convertBaseSchema(s, o);
    });
    return n.length === 0 ? R.never() : n.length === 1 ? n[0] : R.union(n);
  }
  if (!r) return R.any();
  let a;
  switch (r) {
    case "string": {
      let n = R.string();
      if (e.format) {
        let i = e.format;
        i === "email"
          ? (n = n.check(R.email()))
          : i === "uri" || i === "uri-reference"
            ? (n = n.check(R.url()))
            : i === "uuid" || i === "guid"
              ? (n = n.check(R.uuid()))
              : i === "date-time"
                ? (n = n.check(R.iso.datetime()))
                : i === "date"
                  ? (n = n.check(R.iso.date()))
                  : i === "time"
                    ? (n = n.check(R.iso.time()))
                    : i === "duration"
                      ? (n = n.check(R.iso.duration()))
                      : i === "ipv4"
                        ? (n = n.check(R.ipv4()))
                        : i === "ipv6"
                          ? (n = n.check(R.ipv6()))
                          : i === "mac"
                            ? (n = n.check(R.mac()))
                            : i === "cidr"
                              ? (n = n.check(R.cidrv4()))
                              : i === "cidr-v6"
                                ? (n = n.check(R.cidrv6()))
                                : i === "base64"
                                  ? (n = n.check(R.base64()))
                                  : i === "base64url"
                                    ? (n = n.check(R.base64url()))
                                    : i === "e164"
                                      ? (n = n.check(R.e164()))
                                      : i === "jwt"
                                        ? (n = n.check(R.jwt()))
                                        : i === "emoji"
                                          ? (n = n.check(R.emoji()))
                                          : i === "nanoid"
                                            ? (n = n.check(R.nanoid()))
                                            : i === "cuid"
                                              ? (n = n.check(R.cuid()))
                                              : i === "cuid2"
                                                ? (n = n.check(R.cuid2()))
                                                : i === "ulid"
                                                  ? (n = n.check(R.ulid()))
                                                  : i === "xid"
                                                    ? (n = n.check(R.xid()))
                                                    : i === "ksuid" && (n = n.check(R.ksuid()));
      }
      (typeof e.minLength == "number" && (n = n.min(e.minLength)),
        typeof e.maxLength == "number" && (n = n.max(e.maxLength)),
        e.pattern && (n = n.regex(new RegExp(e.pattern))),
        (a = n));
      break;
    }
    case "number":
    case "integer": {
      let n = r === "integer" ? R.number().int() : R.number();
      (typeof e.minimum == "number" && (n = n.min(e.minimum)),
        typeof e.maximum == "number" && (n = n.max(e.maximum)),
        typeof e.exclusiveMinimum == "number"
          ? (n = n.gt(e.exclusiveMinimum))
          : e.exclusiveMinimum === !0 && typeof e.minimum == "number" && (n = n.gt(e.minimum)),
        typeof e.exclusiveMaximum == "number"
          ? (n = n.lt(e.exclusiveMaximum))
          : e.exclusiveMaximum === !0 && typeof e.maximum == "number" && (n = n.lt(e.maximum)),
        typeof e.multipleOf == "number" && (n = n.multipleOf(e.multipleOf)),
        (a = n));
      break;
    }
    case "boolean": {
      a = R.boolean();
      break;
    }
    case "null": {
      a = R.null();
      break;
    }
    case "object": {
      let n = {},
        i = e.properties || {},
        s = new Set(e.required || []);
      for (let [p, u] of Object.entries(i)) {
        let h = convertSchema(u, o);
        n[p] = s.has(p) ? h : h.optional();
      }
      if (e.propertyNames) {
        let p = convertSchema(e.propertyNames, o),
          u =
            e.additionalProperties && typeof e.additionalProperties == "object"
              ? convertSchema(e.additionalProperties, o)
              : R.any();
        if (Object.keys(n).length === 0) {
          a = R.record(p, u);
          break;
        }
        let h = R.object(n).passthrough(),
          b = R.looseRecord(p, u);
        a = R.intersection(h, b);
        break;
      }
      if (e.patternProperties) {
        let p = e.patternProperties,
          u = Object.keys(p),
          h = [];
        for (let S of u) {
          let _ = convertSchema(p[S], o),
            z = R.string().regex(new RegExp(S));
          h.push(R.looseRecord(z, _));
        }
        let b = [];
        if (
          (Object.keys(n).length > 0 && b.push(R.object(n).passthrough()),
          b.push(...h),
          b.length === 0)
        )
          a = R.object({}).passthrough();
        else if (b.length === 1) a = b[0];
        else {
          let S = R.intersection(b[0], b[1]);
          for (let _ = 2; _ < b.length; _++) S = R.intersection(S, b[_]);
          a = S;
        }
        break;
      }
      let l = R.object(n);
      e.additionalProperties === !1
        ? (a = l.strict())
        : typeof e.additionalProperties == "object"
          ? (a = l.catchall(convertSchema(e.additionalProperties, o)))
          : (a = l.passthrough());
      break;
    }
    case "array": {
      let n = e.prefixItems,
        i = e.items;
      if (n && Array.isArray(n)) {
        let s = n.map((p) => convertSchema(p, o)),
          l = i && typeof i == "object" && !Array.isArray(i) ? convertSchema(i, o) : void 0;
        (l ? (a = R.tuple(s).rest(l)) : (a = R.tuple(s)),
          typeof e.minItems == "number" && (a = a.check(R.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(R.maxLength(e.maxItems))));
      } else if (Array.isArray(i)) {
        let s = i.map((p) => convertSchema(p, o)),
          l =
            e.additionalItems && typeof e.additionalItems == "object"
              ? convertSchema(e.additionalItems, o)
              : void 0;
        (l ? (a = R.tuple(s).rest(l)) : (a = R.tuple(s)),
          typeof e.minItems == "number" && (a = a.check(R.minLength(e.minItems))),
          typeof e.maxItems == "number" && (a = a.check(R.maxLength(e.maxItems))));
      } else if (i !== void 0) {
        let s = convertSchema(i, o),
          l = R.array(s);
        (typeof e.minItems == "number" && (l = l.min(e.minItems)),
          typeof e.maxItems == "number" && (l = l.max(e.maxItems)),
          (a = l));
      } else a = R.array(R.any());
      break;
    }
    default:
      throw new Error(`Unsupported type: ${r}`);
  }
  return (
    e.description && (a = a.describe(e.description)),
    e.default !== void 0 && (a = a.default(e.default)),
    a
  );
}
c(convertBaseSchema, "convertBaseSchema");
function convertSchema(e, o) {
  if (typeof e == "boolean") return e ? R.any() : R.never();
  let r = convertBaseSchema(e, o),
    a = e.type || e.enum !== void 0 || e.const !== void 0;
  if (e.anyOf && Array.isArray(e.anyOf)) {
    let l = e.anyOf.map((u) => convertSchema(u, o)),
      p = R.union(l);
    r = a ? R.intersection(r, p) : p;
  }
  if (e.oneOf && Array.isArray(e.oneOf)) {
    let l = e.oneOf.map((u) => convertSchema(u, o)),
      p = R.xor(l);
    r = a ? R.intersection(r, p) : p;
  }
  if (e.allOf && Array.isArray(e.allOf))
    if (e.allOf.length === 0) r = a ? r : R.any();
    else {
      let l = a ? r : convertSchema(e.allOf[0], o),
        p = a ? 0 : 1;
      for (let u = p; u < e.allOf.length; u++) l = R.intersection(l, convertSchema(e.allOf[u], o));
      r = l;
    }
  (e.nullable === !0 && o.version === "openapi-3.0" && (r = R.nullable(r)),
    e.readOnly === !0 && (r = R.readonly(r)));
  let n = {},
    i = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (let l of i) l in e && (n[l] = e[l]);
  let s = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (let l of s) l in e && (n[l] = e[l]);
  for (let l of Object.keys(e)) cv.has(l) || (n[l] = e[l]);
  return (Object.keys(n).length > 0 && o.registry.add(r, n), r);
}
c(convertSchema, "convertSchema");
function fromJSONSchema(e, o) {
  if (typeof e == "boolean") return e ? R.any() : R.never();
  let r = detectVersion(e, o?.defaultTarget),
    a = e.$defs || e.definitions || {},
    n = {
      version: r,
      defs: a,
      refs: new Map(),
      processing: new Set(),
      rootSchema: e,
      registry: o?.registry ?? q,
    };
  return convertSchema(e, n);
}
c(fromJSONSchema, "fromJSONSchema");
var Rd = {};
ke(Rd, { bigint: () => gv, boolean: () => mv, date: () => fv, number: () => pv, string: () => uv });
function uv(e) {
  return _coercedString(Tt, e);
}
c(uv, "string");
function pv(e) {
  return _coercedNumber(Et, e);
}
c(pv, "number");
function mv(e) {
  return _coercedBoolean(Ot, e);
}
c(mv, "boolean");
function gv(e) {
  return _coercedBigint(At, e);
}
c(gv, "bigint");
function fv(e) {
  return _coercedDate(Sn, e);
}
c(fv, "date");
config(sn());
var Sr = { minWidth: 320, maxWidth: 3840, minHeight: 320, maxHeight: 2160 },
  Pd = t
    .object({ width: t.number().int().positive(), height: t.number().int().positive() })
    .strict(),
  Pm = Pd.extend({
    width: t.number().int().min(Sr.minWidth).max(Sr.maxWidth),
    height: t.number().int().min(Sr.minHeight).max(Sr.maxHeight),
  }),
  hv = t.enum([
    "navigate",
    "back",
    "forward",
    "reload",
    "snapshot",
    "click",
    "fill",
    "type",
    "press",
    "cuaKeypress",
    "scroll",
    "cuaScroll",
    "domCuaScroll",
    "hover",
    "select",
    "check",
    "drag",
    "cuaDrag",
    "screenshot",
    "getState",
    "elementInfo",
    "evaluate",
    "getDialog",
    "handleDialog",
    "waitFor",
    "playwright",
    "playwrightWaitForTimeout",
    "capabilities",
    "browserVisibilityGet",
    "browserVisibilitySet",
    "browserViewportSet",
    "browserViewportReset",
    "activateTab",
    "newTab",
    "finalize",
    "finalizeTabs",
    "listUserTabs",
    "claimTab",
    "markDeliverable",
    "markHandoff",
    "nameSession",
    "turnEnded",
    "closeSession",
    "cancelRequest",
    "close",
    "list",
  ]),
  Xe = t.enum(["desktop-continuous", "web-remote-replayable"]),
  yv = t
    .object({
      workspaceKey: t.string().min(1),
      sessionId: t.string().min(1),
      tabId: t.string().min(1).optional(),
      requestId: t.string().min(1),
      clientMode: Xe,
    })
    .strict(),
  Td = t.enum([
    "backend_unavailable",
    "capability_unsupported",
    "duplicate_request_id",
    "ref_not_found",
    "navigation_blocked",
    "timeout",
    "renderer_unreachable",
    "cancelled",
    "execution_error",
  ]),
  wd = t
    .object({
      url: t.string(),
      title: t.string(),
      canGoBack: t.boolean(),
      canGoForward: t.boolean(),
      scrollX: t.number().optional(),
      scrollY: t.number().optional(),
      viewportWidth: t.number().optional(),
      viewportHeight: t.number().optional(),
    })
    .strict();
var Tm = t.enum(["left", "right", "middle"]),
  zt = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  Ed = t.object({ x: t.number(), y: t.number() }).strict(),
  bv = t.enum([
    "allTextContents",
    "click",
    "count",
    "dblclick",
    "downloadMedia",
    "evaluate",
    "fill",
    "getAttribute",
    "innerText",
    "isEnabled",
    "isVisible",
    "press",
    "selectOption",
    "setChecked",
    "textContent",
    "waitFor",
  ]),
  vv = t.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]),
  Qe = t.number().int().positive().optional(),
  Sv = t
    .object({
      value: t.string().optional(),
      label: t.string().optional(),
      index: t.number().int().nonnegative().optional(),
    })
    .strict()
    .refine(
      (e) => e.value !== void 0 || e.label !== void 0 || e.index !== void 0,
      "Select option requires value, label, or index",
    ),
  _v = t.discriminatedUnion("name", [
    t.object({ name: t.literal("domSnapshot") }).strict(),
    t
      .object({
        name: t.literal("elementInfo"),
        x: t.number(),
        y: t.number(),
        includeNonInteractable: t.boolean().optional(),
      })
      .strict(),
    t
      .object({
        name: t.literal("elementScreenshot"),
        x: t.number(),
        y: t.number(),
        includeNonInteractable: t.boolean().optional(),
      })
      .strict(),
    t
      .object({
        name: t.literal("evaluate"),
        expression: t.string().min(1),
        expressionKind: t.enum(["string", "function"]),
        arg: t.unknown().optional(),
        timeoutMs: Qe,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForLoadState"),
        state: t.enum(["load", "domcontentloaded", "networkidle"]).optional(),
        timeoutMs: Qe,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForURL"),
        url: t.string().min(1),
        waitUntil: t.enum(["load", "domcontentloaded", "networkidle", "commit"]).optional(),
        timeoutMs: Qe,
      })
      .strict(),
    t
      .object({
        name: t.literal("waitForEvent"),
        event: t.enum(["download", "filechooser"]),
        timeoutMs: Qe,
      })
      .strict(),
    t
      .object({ name: t.literal("downloadPath"), downloadId: t.string().min(1), timeoutMs: Qe })
      .strict(),
    t
      .object({
        name: t.literal("fileChooserSetFiles"),
        fileChooserId: t.string().min(1),
        files: t.array(t.string()).min(1),
        timeoutMs: Qe,
      })
      .strict(),
    t
      .object({
        name: t.literal("locator"),
        selector: t.string().min(1),
        operation: bv,
        value: t.unknown().optional(),
        arg: t.unknown().optional(),
        expression: t.string().min(1).optional(),
        expressionKind: t.enum(["string", "function"]).optional(),
        attribute: t.string().min(1).optional(),
        checked: t.boolean().optional(),
        replace: t.boolean().optional(),
        force: t.boolean().optional(),
        button: Tm.optional(),
        modifiers: t.array(vv).optional(),
        state: t.enum(["attached", "detached", "visible", "hidden"]).optional(),
        selections: t.array(Sv).min(1).optional(),
        timeoutMs: Qe,
      })
      .strict(),
  ]),
  Mt = t.discriminatedUnion("method", [
    t
      .object({
        method: t.literal("navigate"),
        url: t.string().min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("back"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("forward"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("reload"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("snapshot"),
        maxElements: t.number().int().positive().optional(),
        includeHidden: t.boolean().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("click"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        button: Tm.optional(),
        doubleClick: t.boolean().optional(),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("fill"),
        ref: t.string().min(1),
        value: t.string(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("type"),
        ref: t.string().min(1).optional(),
        text: t.string(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("press"),
        key: t.string().min(1),
        ref: t.string().min(1).optional(),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaKeypress"),
        keys: t.array(t.string().min(1)).min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("scroll"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaScroll"),
        x: t.number(),
        y: t.number(),
        scrollX: t.number(),
        scrollY: t.number(),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("domCuaScroll"),
        nodeId: t.string().min(1).optional(),
        scrollX: t.number(),
        scrollY: t.number(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("screenshot"),
        ref: t.string().min(1).optional(),
        fullPage: t.boolean().optional(),
        clip: t
          .object({
            x: t.number(),
            y: t.number(),
            width: t.number().positive(),
            height: t.number().positive(),
          })
          .strict()
          .optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("getState"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("hover"),
        ref: t.string().min(1).optional(),
        x: t.number().optional(),
        y: t.number().optional(),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("select"),
        ref: t.string().min(1),
        values: t.array(t.string()).min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("check"),
        ref: t.string().min(1),
        checked: t.boolean().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("drag"),
        fromRef: t.string().min(1).optional(),
        toRef: t.string().min(1).optional(),
        from: Ed.optional(),
        to: Ed.optional(),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("cuaDrag"),
        path: t.array(Ed).min(1),
        modifiers: t.array(zt).optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("elementInfo"),
        x: t.number(),
        y: t.number(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("evaluate"),
        expression: t.string().min(1),
        tabId: t.string().optional(),
      })
      .strict(),
    t.object({ method: t.literal("getDialog"), tabId: t.string().optional() }).strict(),
    t
      .object({
        method: t.literal("handleDialog"),
        accept: t.boolean(),
        promptText: t.string().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("waitFor"),
        selector: t.string().min(1).optional(),
        text: t.string().min(1).optional(),
        textGone: t.string().min(1).optional(),
        timeoutMs: t.number().int().positive().optional(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({
        method: t.literal("playwrightWaitForTimeout"),
        timeoutMs: t.number().int().nonnegative(),
        tabId: t.string().optional(),
      })
      .strict(),
    t
      .object({ method: t.literal("playwright"), action: _v, tabId: t.string().optional() })
      .strict(),
    t.object({ method: t.literal("capabilities"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("browserVisibilityGet") }).strict(),
    t.object({ method: t.literal("browserVisibilitySet"), visible: t.boolean() }).strict(),
    Pm.extend({ method: t.literal("browserViewportSet"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("browserViewportReset"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("activateTab"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("newTab") }).strict(),
    t.object({ method: t.literal("listUserTabs") }).strict(),
    t.object({ method: t.literal("claimTab"), tabId: t.string().min(1) }).strict(),
    t
      .object({
        method: t.literal("finalizeTabs"),
        keep: t.array(
          t
            .object({ tabId: t.string().min(1), status: t.enum(["handoff", "deliverable"]) })
            .strict(),
        ),
      })
      .strict(),
    t.object({ method: t.literal("markDeliverable"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("markHandoff"), tabId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("nameSession"), name: t.string().trim().min(1) }).strict(),
    t
      .object({
        method: t.literal("finalize"),
        tabId: t.string().optional(),
        deliverable: t.boolean().optional(),
      })
      .strict(),
    t.object({ method: t.literal("turnEnded"), turnId: t.string().min(1).optional() }).strict(),
    t.object({ method: t.literal("closeSession") }).strict(),
    t.object({ method: t.literal("cancelRequest"), requestId: t.string().min(1) }).strict(),
    t.object({ method: t.literal("close"), tabId: t.string().optional() }).strict(),
    t.object({ method: t.literal("list") }).strict(),
  ]);
var Od = t.enum(["iab", "extension", "cdp"]),
  wm = t.object({ id: t.string().trim().min(1), description: t.string().trim().min(1) }).strict(),
  Ad = t
    .object({
      id: t.string().trim().min(1),
      generation: t.number().int().nonnegative().default(0),
      type: Od,
      name: t.string().trim().min(1),
      capabilities: t
        .object({ browser: t.array(wm).optional(), tab: t.array(wm).optional() })
        .strict(),
      apiSupportOverrides: t.record(t.string(), t.boolean()).optional(),
      metadata: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  _r = t.enum(["live", "cached"]),
  xv = t
    .object({
      requestId: t.string().trim().min(1),
      workspaceKey: t.string().trim().min(1),
      workspacePath: t.string().trim().min(1),
      workspaceIdentity: t.string().trim().min(1).optional(),
      remoteSessionId: t.string().trim().min(1).optional(),
      sessionId: t.string().trim().min(1),
      turnId: t.string().trim().min(1).optional(),
      clientMode: Xe,
      sessionContext: _r,
    })
    .strict(),
  YA = xv
    .extend({
      browserId: t.string().trim().min(1),
      browserGeneration: t.number().int().nonnegative(),
    })
    .strict(),
  Em = t.object({ browsers: t.array(Ad) }).strict();
var kv = t.object({ x: t.number(), y: t.number(), width: t.number(), height: t.number() }).strict(),
  zd = t
    .object({
      ref: t.string().min(1),
      tag: t.string(),
      role: t.string().optional(),
      name: t.string().optional(),
      text: t.string().optional(),
      value: t.string().optional(),
      disabled: t.boolean().optional(),
      checked: t.boolean().optional(),
      selector: t.string(),
      xpath: t.string(),
      rect: kv,
      inViewport: t.boolean(),
      parentRef: t.string().optional(),
      framePath: t.string().optional(),
      attributes: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  Iv = t
    .object({
      tag: t.string(),
      depth: t.number().int().nonnegative(),
      inViewport: t.boolean(),
      ref: t.string().min(1).optional(),
      role: t.string().optional(),
      name: t.string().optional(),
      text: t.string().optional(),
      attributes: t.record(t.string(), t.string()).optional(),
    })
    .strict(),
  Om = t
    .object({
      url: t.string(),
      title: t.string(),
      dom: t.array(Iv).optional(),
      domTruncated: t.boolean().optional(),
      elements: t.array(zd),
      truncated: t.boolean(),
    })
    .strict();
var Am = t
    .object({
      tabId: t.string(),
      url: t.string(),
      title: t.string(),
      viewport: Pd,
      active: t.boolean().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff"]).optional(),
    })
    .strict(),
  Cv = t
    .object({
      id: t.string().min(1),
      lastOpened: t.string().optional(),
      tabGroup: t.string().optional(),
      title: t.string().optional(),
      url: t.string().optional(),
    })
    .strict(),
  Rv = t
    .object({
      type: t.enum(["alert", "confirm", "prompt", "beforeunload"]),
      message: t.string(),
      defaultPrompt: t.string().optional(),
    })
    .strict(),
  Pv = t
    .object({
      browserUse: t.literal(!0),
      backendType: Od,
      browserId: t.string().min(1),
      browserGeneration: t.number().int().nonnegative(),
      openTabIds: t.array(t.string()),
      tabId: t.string().optional(),
      currentUrl: t.string().optional(),
      lifecycle: t.enum(["active", "deliverable", "handoff", "closed"]).optional(),
    })
    .strict(),
  $t = t
    .object({
      ok: t.boolean(),
      state: wd.optional(),
      snapshot: Om.optional(),
      image: t
        .object({ base64: t.string(), mimeType: t.literal("image/png") })
        .strict()
        .optional(),
      tabs: t.array(Am).optional(),
      userTabs: t.array(Cv).optional(),
      tab: Am.optional(),
      value: t.unknown().optional(),
      element: zd.optional(),
      dialog: Rv.nullable().optional(),
      error: t
        .object({
          code: Td,
          message: t.string(),
          sideEffect: t.enum(["none", "uncertain"]).optional(),
        })
        .strict()
        .optional(),
      meta: Pv.optional(),
      elapsedMs: t.number().nonnegative(),
    })
    .strict();
var xr = ["local-download-upload", "remote-download"];
var Tv = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  Md = ["server-bundle", "node-runtime", "node-pty", "glm", "bfs", "ripgrep", "ugrep"],
  zm = ["server-bundle", "node-runtime"];
var yz = Md.filter((e) => !zm.includes(e)),
  wv = new Set(Tv),
  bz = new Set(Md),
  vz = new Set(zm);
function normalizeRemoteResourcePackageSelection(e) {
  return [...Md];
}
c(normalizeRemoteResourcePackageSelection, "normalizeRemoteResourcePackageSelection");
function isKnownRemoteResourcePackageId(e) {
  return wv.has(e);
}
c(isKnownRemoteResourcePackageId, "isKnownRemoteResourcePackageId");
var Ev = ["claude", "opencode", "gemini", "codex", "glm"],
  re = t.enum(Ev);
var $d = ["7d", "30d"],
  Ov = t.object({ modelId: t.string().nullable(), totalTokens: t.number(), share: t.number() }),
  Av = t.object({
    totalTokens: t.number(),
    inputTokens: t.number(),
    outputTokens: t.number(),
    reasoningTokens: t.number(),
    cacheCreationTokens: t.number(),
    cacheReadTokens: t.number(),
    cacheHitRate: t.number(),
    totalSessions: t.number(),
    totalTurns: t.number(),
    toolCallCount: t.number(),
    toolErrorRate: t.number(),
    modelErrorRate: t.number(),
    avgTimeToFirstTokenMs: t.number().nullable(),
    avgTurnDurationMs: t.number().nullable(),
    activeDays: t.number(),
    currentStreakDays: t.number(),
    favoriteModel: Ov.nullable(),
  }),
  zv = t.object({
    date: t.string(),
    level: t.union([t.literal(0), t.literal(1), t.literal(2), t.literal(3), t.literal(4)]),
    totalTokens: t.number(),
    turnCount: t.number(),
    toolCallCount: t.number(),
  }),
  Mv = t.object({ weekIndex: t.number(), days: t.array(zv.nullable()) }),
  $v = t.object({
    startDate: t.string().nullable(),
    endDate: t.string().nullable(),
    maxTokens: t.number(),
    weeks: t.array(Mv),
  }),
  Dv = t.object({ modelId: t.string().nullable(), totalTokens: t.number() }),
  Uv = t.object({ date: t.string(), models: t.array(Dv) }),
  Nv = t.object({
    modelId: t.string().nullable(),
    totalTokens: t.number(),
    inputTokens: t.number(),
    outputTokens: t.number(),
    requestCount: t.number(),
    share: t.number(),
  }),
  Zv = t.object({
    toolName: t.string(),
    callCount: t.number(),
    errorCount: t.number(),
    errorRate: t.number(),
    avgDurationMs: t.number().nullable(),
  }),
  jv = t.object({
    range: t.enum($d),
    generatedAt: t.number(),
    timeZone: t.string(),
    source: t.literal("agent-db"),
    summary: Av,
    heatmap: $v,
    dailyModelUsage: t.array(Uv),
    models: t.array(Nv),
    tools: t.array(Zv),
  });
var Ir = ["glm"];
var T = t.string().trim().min(1),
  J = t.record(t.string(), t.unknown()),
  W = t.number().int().nonnegative(),
  Rn = t.enum(["desktop-continuous", "web-remote-replayable"]),
  Dd = t.enum(["user-visible", "model-only"]),
  Ud = t.enum([
    "background_task",
    "fork",
    "goal_state_change",
    "goal-continuation",
    "plugin_reference",
    "rewind",
    "selection_side_chat",
    "subagent",
    "subagent_message",
    "todo_reminder",
  ]),
  M = t
    .object({
      workspacePath: T,
      workspaceIdentity: T.optional(),
      remoteSessionId: T.optional(),
      workspaceKey: T,
    })
    .strict(),
  Nd = t.enum(["allow", "deny", "escalate", "modify"]),
  Bv = t.enum(["allow", "deny", "ask"]),
  Lv = t.object({ toolName: T, ruleContent: t.string().optional() }).strict(),
  Zd = t.object({ type: t.literal("addRules"), behavior: Bv, rules: t.array(Lv).min(1) }).strict(),
  Dt = t
    .object({
      decision: Nd,
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      permissionUpdates: t.array(Zd).optional(),
    })
    .strict(),
  F = t.object({ providerId: T, modelId: T, variant: T.optional() }).strict(),
  Pe = t.enum(["plan", "build", "edit", "yolo", "auto"]),
  jd = t.enum(["idle", "running", "waiting", "paused", "completed", "error"]),
  Wv = t.enum([
    "interactive",
    "fork",
    "selection_side_chat",
    "workflow_parent",
    "workflow_child",
    "subagent_child",
    "nested_workflow_child",
  ]),
  Bd = t
    .object({
      sessionId: T,
      targetId: T,
      objective: T,
      summaryTitle: t.string().min(1).nullable().default(null),
      status: t.enum(["active", "paused", "budget_limited", "complete"]),
      tokenBudget: t.number().int().positive().nullable(),
      tokensUsed: t.number().int().nonnegative(),
      timeUsedSeconds: t.number().int().nonnegative(),
      activeInputId: T.nullable().optional(),
      activeRunStartedAtMs: W.nullable().optional(),
      activeRunLastSeenAtMs: W.nullable().optional(),
      createdAt: W,
      updatedAt: W,
    })
    .strict(),
  $m = t
    .object({
      nextAction: t.string().nullable().optional(),
      passed: t.boolean(),
      reason: t.string(),
    })
    .strict(),
  Fv = t
    .object({
      version: t.literal(1),
      kind: t.literal("synthetic"),
      type: t.literal("goal_verification"),
      display: t.literal("separator"),
      targetId: T,
      verificationId: T,
      status: t.enum(["started", "completed", "failed_closed", "cancelled"]),
      verification: $m.optional(),
      goalIteration: t.number().int().positive().optional(),
      anchorAssistantMessageId: T.optional(),
      anchorTurnId: T.optional(),
      startedAt: W.optional(),
      updatedAt: W,
    })
    .strict(),
  Ld = t
    .object({
      sessionId: T,
      workspace: M,
      parentSessionId: T.optional(),
      traceId: T.optional(),
      sessionKind: Wv,
      title: t.string(),
      titleSource: t.enum(["default", "first_input", "generated", "custom"]).optional(),
      mode: Pe,
      status: jd,
      model: F.optional(),
      target: Bd.nullable().optional(),
      createdAt: W,
      updatedAt: W,
      archivedAt: W.optional(),
    })
    .strict(),
  et = t
    .object({
      kind: t.literal("subagent"),
      agentId: T,
      agentType: T,
      childSessionId: T,
      childTurnId: T.optional(),
      description: t.string().optional(),
      parentSessionId: T,
      parentToolCallId: T.optional(),
      parentTurnId: T.optional(),
    })
    .strict(),
  Dm = t.object({ created: W, completed: W.optional() }).strict(),
  Um = t
    .object({
      total: t.number().int().nonnegative().optional(),
      input: t.number().int().nonnegative(),
      output: t.number().int().nonnegative(),
      reasoning: t.number().int().nonnegative(),
      cache: t
        .object({ read: t.number().int().nonnegative(), write: t.number().int().nonnegative() })
        .strict(),
    })
    .strict(),
  Nm = t
    .object({
      origin: t.enum(["real_user", "agent_runtime", "system", "migration"]),
      kind: t.enum([
        "user_prompt",
        "slash_command",
        "system_reminder",
        "background_notification",
        "subagent_notification",
        "todo_reminder",
        "rewind_notice",
        "fork_notice",
        "timeline_event",
        "compact_summary",
        "assistant_response",
      ]),
      source: t.string().optional(),
      commandName: t.string().optional(),
      uiVisibility: t.enum(["visible", "hidden", "debug"]),
      providerVisibility: t.enum(["visible", "hidden"]),
      transcriptVisibility: t.enum(["visible", "hidden"]),
    })
    .strict(),
  qv = t
    .object({
      messageId: T,
      sessionId: T,
      role: t.literal("user"),
      time: Dm,
      agent: T,
      model: F,
      system: t.string().optional(),
      tools: t.record(t.string(), t.boolean()).optional(),
      synthetic: t.boolean().optional(),
      source: Ud.optional(),
      visibility: Dd.optional(),
      semantics: Nm.optional(),
      metadata: J.optional(),
    })
    .strict(),
  Vv = t
    .object({
      messageId: T,
      sessionId: T,
      role: t.literal("assistant"),
      time: Dm,
      parentMessageId: T,
      agent: T,
      model: F,
      path: t.object({ cwd: T, root: T }).strict(),
      cost: t.number().nonnegative(),
      tokens: Um,
      finish: t.string().optional(),
      error: J.optional(),
      semantics: Nm.optional(),
      structured: t.unknown().optional(),
    })
    .strict(),
  Gv = t.discriminatedUnion("role", [qv, Vv]),
  ie = t.object({ partId: T, sessionId: T, messageId: T }),
  Kv = t.discriminatedUnion("status", [
    t.object({ status: t.literal("pending"), input: J, raw: t.string() }).strict(),
    t
      .object({
        status: t.literal("running"),
        input: J,
        title: t.string().optional(),
        metadata: J.optional(),
        startedAt: W,
      })
      .strict(),
    t
      .object({
        status: t.literal("completed"),
        input: J,
        output: t.string(),
        title: t.string(),
        metadata: J,
        startedAt: W,
        completedAt: W,
      })
      .strict(),
    t
      .object({
        status: t.literal("error"),
        input: J,
        error: t.string(),
        metadata: J.optional(),
        startedAt: W,
        completedAt: W,
      })
      .strict(),
  ]),
  Mm = F.extend({ label: t.string().optional() }),
  Hv = t.object({ start: W.optional(), end: W.optional() }).strict(),
  Jv = ie
    .extend({
      type: t.literal("timeline"),
      timelineType: t.enum([
        "context_compaction",
        "goal_verification",
        "session_fork",
        "model_change",
      ]),
      display: t.enum(["separator", "worklog"]),
      status: t.string().optional(),
      anchorMessageId: T.optional(),
      anchorTurnId: T.optional(),
      time: Hv.optional(),
      operationId: t.string().optional(),
      trigger: t.enum(["manual", "auto", "partial", "reactive", "session_memory"]).optional(),
      phase: t.enum(["standalone_turn", "pre_request", "mid_turn", "reactive"]).optional(),
      compactReason: t.string().optional(),
      boundaryId: t.string().optional(),
      summaryMessageId: T.optional(),
      preCompactTokenCount: t.number().int().nonnegative().optional(),
      postCompactTokenCount: t.number().int().nonnegative().optional(),
      truePostCompactTokenCount: t.number().int().nonnegative().optional(),
      attempt: t.number().int().nonnegative().optional(),
      maxAttempts: t.number().int().nonnegative().optional(),
      reason: t.string().optional(),
      targetId: t.string().optional(),
      verificationId: t.string().optional(),
      goalIteration: t.number().int().nonnegative().optional(),
      verification: t
        .object({
          passed: t.boolean(),
          reason: t.string(),
          nextAction: t.string().nullable().optional(),
        })
        .strict()
        .optional(),
      parentSessionId: T.optional(),
      targetMessageId: T.optional(),
      targetCheckpointId: t.string().optional(),
      restoredFileCount: t.number().int().nonnegative().optional(),
      fromModel: Mm.optional(),
      toModel: Mm.extend({ label: T }).optional(),
    })
    .strict(),
  Wd = t.discriminatedUnion("type", [
    ie
      .extend({
        type: t.literal("text"),
        text: t.string(),
        synthetic: t.boolean().optional(),
        ignored: t.boolean().optional(),
        metadata: J.optional(),
      })
      .strict(),
    ie.extend({ type: t.literal("reasoning"), text: t.string(), metadata: J.optional() }).strict(),
    ie
      .extend({
        type: t.literal("file"),
        mime: T,
        filename: t.string().optional(),
        url: T,
        metadata: J.optional(),
      })
      .strict(),
    ie
      .extend({ type: t.literal("tool"), callId: T, tool: T, state: Kv, metadata: J.optional() })
      .strict(),
    ie.extend({ type: t.literal("step-start"), snapshot: t.string().optional() }).strict(),
    ie
      .extend({
        type: t.literal("step-finish"),
        reason: t.string(),
        snapshot: t.string().optional(),
        cost: t.number().nonnegative(),
        tokens: Um,
      })
      .strict(),
    ie.extend({ type: t.literal("snapshot"), snapshot: t.string() }).strict(),
    ie.extend({ type: t.literal("patch"), hash: T, files: t.array(t.string()) }).strict(),
    ie
      .extend({
        type: t.literal("compaction"),
        auto: t.boolean(),
        reason: t.string().optional(),
        summaryMessageId: T.optional(),
        metadata: J.optional(),
      })
      .strict(),
    Jv,
    ie
      .extend({
        type: t.literal("subagent"),
        prompt: t.string(),
        description: t.string(),
        agent: T,
        model: F.optional(),
        command: t.string().optional(),
      })
      .strict(),
    ie.extend({ type: t.literal("agent"), name: T }).strict(),
    ie
      .extend({ type: t.literal("retry"), attempt: t.number().int().nonnegative(), error: J })
      .strict(),
  ]),
  Fd = t.object({ info: Gv, parts: t.array(Wd) }).strict(),
  Yv = t
    .object({
      kind: t.literal("api_retry"),
      attempt: t.number().int().positive(),
      maxRetries: t.number().int().nonnegative(),
      retryDelayMs: t.number().int().nonnegative(),
      errorStatus: t.number().int().nonnegative().nullable(),
      error: t.string(),
    })
    .strict(),
  Xv = t
    .object({
      inputTokens: t.number().int().nonnegative(),
      cacheReadTokens: t.number().int().nonnegative(),
      cacheWriteTokens: t.number().int().nonnegative(),
      latestHitRate: t.number().nonnegative().nullable().optional(),
      hitRateRequestCount: t.number().int().nonnegative().optional(),
      totalInputTokens: t.number().int().nonnegative().optional(),
      totalCacheReadTokens: t.number().int().nonnegative().optional(),
      totalCacheWriteTokens: t.number().int().nonnegative().optional(),
      hitRate: t.number().nonnegative().nullable(),
    })
    .strict(),
  Qv = t.enum([
    "system_prompt",
    "meta_user_context",
    "skills",
    "tool_prompt",
    "system_tool_schemas",
    "mcp_tool_schemas",
    "messages",
  ]),
  eS = t.object({ source: Qv, chars: t.number().int().nonnegative() }).strict(),
  tS = t.array(eS),
  nS = t
    .object({
      used: t.number().int().nonnegative(),
      size: t.number().int().positive(),
      cost: t
        .object({ amount: t.number().nonnegative(), currency: T })
        .strict()
        .nullable()
        .optional(),
      cache: Xv.optional(),
      breakdown: tS.optional(),
    })
    .strict(),
  Zm = t
    .object({
      eventSeq: t.number().int().nonnegative(),
      stateRevision: t.number().int().nonnegative(),
      deliveryKind: Rn.optional(),
      activeTurnId: T.optional(),
      activeTurnKind: t.enum(["regular", "compact", "rewind"]).optional(),
      pendingRequestIds: t.array(T),
      apiRetry: Yv.nullable().optional(),
      contextUsage: nS.optional(),
      goalVerifications: t.array($m).optional(),
      goalVerificationTimeline: t.array(Fv).optional(),
    })
    .strict();
var oS = ["telegram", "webhook", "feishu", "lark", "weixin", "discord", "wecom"],
  qd = t
    .object({
      provider: t.enum(["feishu", "lark", "weixin"]),
      botId: t.string().trim().min(1),
      providerUserId: t.string().trim().min(1),
      chatType: t.enum(["private", "group"]),
    })
    .strict();
var rS = t
  .object({
    status: t.boolean(),
    new: t.boolean(),
    workspace: t.boolean(),
    model: t.boolean(),
    mode: t.boolean().optional(),
    thoughtLevel: t.boolean(),
    sandboxMode: t.boolean().optional(),
    approvalPolicy: t.boolean().optional(),
    cli: t.boolean().optional(),
    reply: t.boolean(),
  })
  .strict();
var iS = t
    .object({
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
      sandboxMode: t.string().min(1).optional(),
      approvalPolicy: t.string().min(1).optional(),
      cli: t.enum(["codex", "claude", "opencode", "gemini", "glm"]).optional(),
    })
    .strict(),
  aS = t
    .object({
      provider: t.enum(["codex", "claude", "opencode", "gemini", "glm"]),
      model: t.string().min(1).optional(),
      mode: t.string().min(1).optional(),
      thoughtLevel: t.string().min(1).optional(),
    })
    .strict(),
  sS = t
    .object({ value: t.string(), label: t.string(), description: t.string().optional() })
    .strict(),
  cS = t
    .object({
      question: t.string(),
      header: t.string(),
      options: t.array(sS),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  lS = t
    .object({
      taskId: t.string().min(1),
      requestId: t.string().min(1),
      runId: t.string().min(1),
      origin: et.optional(),
      actorKey: t.string().min(1).optional(),
      currentQuestionIndex: t.number().int().min(0),
      questions: t.array(cS),
      answers: t.record(t.string(), t.array(t.string())),
      renderContext: t
        .object({ kind: t.literal("plan_approval"), plan: t.string().min(1) })
        .strict()
        .optional(),
      expandedCustomAnswerQuestionIndexes: t.array(t.number().int().min(0)).optional(),
      handledAt: t.number().optional(),
    })
    .strict(),
  dS = t
    .object({
      id: t.string().min(1),
      name: t.string(),
      provider: t.enum(oS),
      enabled: t.boolean(),
      credentialRef: t.string().min(1).optional(),
      webhookSecretRef: t.string().min(1).optional(),
      webhookUrl: t.string().url().optional(),
      webhookAuthHeaderName: t.string().min(1).optional(),
      feishuAppId: t.string().min(1).optional(),
      providerUserId: t.string().min(1).optional(),
      displayName: t.string().optional(),
      allowedWorkspaces: t.array(t.string().min(1)),
      allowedCommands: rS,
      currentOptions: iS,
      replyMode: t.enum([
        "assistant_changes",
        "assistant_toolcalls_changes",
        "summary_changes",
        "streaming_card",
      ]),
    })
    .strict(),
  Gz = t.object({ version: t.literal(2), bots: t.array(dS) }).strict(),
  Kz = t
    .object({
      version: t.literal(2),
      bots: t.record(
        t.string(),
        t.object({
          botId: t.string().min(1),
          workspacePath: t.string().min(1),
          workspaceIdentity: t.string().min(1).optional(),
          workspaceId: t.string().min(1).optional(),
          mode: t.enum(["draft", "task"]),
          activeTaskId: t.string().min(1).nullable(),
          draftOptions: aS.optional(),
          pendingPermissionOptions: t
            .array(
              t.object({
                requestId: t.string().min(1),
                optionId: t.string().min(1),
                command: t.enum(["approve", "deny"]),
                label: t.string().min(1),
                response: Dt,
                handledAt: t.number().optional(),
              }),
            )
            .optional(),
          pendingElicitation: lS.optional(),
          telegramOffset: t.number().optional(),
          weixinGetUpdatesBuf: t.string().optional(),
          weixinActivatedAt: t.number().optional(),
          updatedAt: t.number(),
        }),
      ),
    })
    .strict();
var Vd = 64;
function isValidWslUser(e) {
  let o = e.trim();
  return (
    o.length > 0 &&
    o.length <= Vd &&
    !containsControlCharacter(o) &&
    !o.includes(":") &&
    !o.includes("/") &&
    !o.includes("\\")
  );
}
c(isValidWslUser, "isValidWslUser");
function containsControlCharacter(e) {
  for (let o of e) {
    let r = o.codePointAt(0) ?? 0;
    if (r < 32 || r === 127) return !0;
  }
  return !1;
}
c(containsControlCharacter, "containsControlCharacter");
var Pn = t
  .string()
  .trim()
  .max(Vd)
  .refine((e) => e.length === 0 || isValidWslUser(e), { message: "Invalid WSL user" });
var A = t.string().trim().min(1),
  Tn = t.enum(["zh-CN", "en-US"]),
  Bm = t.enum(["system", "zh-CN", "en-US"]),
  Lm = t.enum(["queue", "guide"]),
  Wm = t.enum(["stable", "preview"]),
  Fm = t.number().int().min(-3).max(5),
  Cr = t.discriminatedUnion("mode", [
    t.object({ mode: t.literal("auto") }),
    t.object({
      mode: t.literal("shell"),
      dialect: t.enum(["cmd", "git-bash"]),
      id: A,
      label: A,
      path: A,
    }),
  ]),
  qm = t.array(re).transform(() => [...Ir]),
  Vm = t
    .object({
      zai: t.enum(["oauth", "apiKey"]).optional(),
      bigmodel: t.enum(["oauth", "apiKey"]).optional(),
    })
    .partial(),
  Gm = t.enum(["zai", "bigmodel"]),
  Km = t
    .object({
      zai: t.string().trim().min(1).optional(),
      bigmodel: t.string().trim().min(1).optional(),
    })
    .partial();
var Kd = t.object({
    version: A,
    title: A,
    markdown: A,
    releaseDate: A.optional(),
    releaseNotesByLocale: t.partialRecord(Tn, t.object({ title: A, markdown: A })).optional(),
  }),
  pS = t.partialRecord(Wm, A).default({}),
  Hm = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("ssh"),
      host: A,
      port: t.number().int().positive().max(65535).optional(),
      username: A,
      sshConfigAlias: A.optional(),
      privateKeyPath: t.string().optional(),
      assetInstallMode: t.enum(xr).optional(),
      resourcePackages: t
        .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
        .optional(),
      passwordCredentialKey: A.optional(),
      privateKeyPassphraseCredentialKey: A.optional(),
    }),
    t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: Pn.optional() }),
    t.object({ kind: t.literal("docker"), container: A }),
    t.object({
      kind: t.literal("server"),
      url: t.string().url(),
      name: A.optional(),
      workspacePath: t.string().optional(),
      serverId: A.optional(),
      tokenCredentialKey: A.optional(),
    }),
  ]),
  Jm = t.discriminatedUnion("kind", [
    t.object({
      kind: t.literal("local"),
      workspacePath: A,
      workspacePurpose: t.enum(["project", "conversation"]).default("project"),
    }),
    t.object({
      kind: t.literal("remote"),
      workspacePath: A,
      localWorkspacePath: A.optional(),
      workspaceIdentity: A.optional(),
      target: Hm,
      lastOpenedAt: t.number().int().nonnegative(),
      lastConnectionStatus: t.enum(["connected", "failed"]),
      lastConnectionError: t.string().optional(),
    }),
  ]),
  Ym = t.object({ deviceSid: A }),
  Xm = t.object({ workspacePath: A, workspaceIdentity: A.optional(), initialTaskId: A.optional() }),
  Hd = t.preprocess((e) => {
    if (typeof e != "string") return;
    let o = e.trim();
    if (o)
      try {
        return normalizeZCodeEndpointOrigin(o);
      } catch {
        return;
      }
  }, t.string().optional());
function sanitizeZCodeEndpointOrigin(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if (!("zcodeEndpointOrigin" in o)) return e;
  let r = Hd.safeParse(o.zcodeEndpointOrigin);
  if (r.success && typeof r.data == "string") return { ...o, zcodeEndpointOrigin: r.data };
  let { zcodeEndpointOrigin: a, ...n } = o;
  return n;
}
c(sanitizeZCodeEndpointOrigin, "sanitizeZCodeEndpointOrigin");
function migrateOptimizeAgentExperienceDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  return o.optimizeAgentExperienceMigrationInitialized === !0
    ? e
    : { ...o, optimizeAgentExperienceEnabled: !1, optimizeAgentExperienceMigrationInitialized: !0 };
}
c(migrateOptimizeAgentExperienceDefault, "migrateOptimizeAgentExperienceDefault");
function migrateCloseToTrayOnWindowsDefault(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  return o.closeToTrayOnWindowsMigrationInitialized === !0
    ? e
    : { ...o, closeToTrayOnWindows: !0, closeToTrayOnWindowsMigrationInitialized: !0 };
}
c(migrateCloseToTrayOnWindowsDefault, "migrateCloseToTrayOnWindowsDefault");
function migrateLegacyLocalePreference(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if ("localePreference" in o || !("locale" in o)) return e;
  let r = Tn.safeParse(o.locale);
  return r.success ? { ...o, localePreference: r.data } : e;
}
c(migrateLegacyLocalePreference, "migrateLegacyLocalePreference");
var yS = t.object({
  id: A,
  workspacePath: A,
  localWorkspacePath: A.optional(),
  workspaceIdentity: A.optional(),
  target: Hm,
  lastOpenedAt: t.number().int().nonnegative(),
  lastConnectionStatus: t.enum(["connected", "failed"]),
  lastConnectionError: t.string().optional(),
});
function migrateLegacyBuiltinAgentCliProviders(e) {
  return !e || typeof e != "object" || Array.isArray(e)
    ? e
    : { ...e, enabledBuiltinAgentCliProviders: [...Ir] };
}
c(migrateLegacyBuiltinAgentCliProviders, "migrateLegacyBuiltinAgentCliProviders");
function stripHistoricalRemoteResourcePackages(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e;
  if (o.kind !== "ssh" || !("resourcePackages" in o)) return e;
  let { resourcePackages: r, ...a } = o;
  return a;
}
c(stripHistoricalRemoteResourcePackages, "stripHistoricalRemoteResourcePackages");
function migrateLegacyWorkspaceSession(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return e;
  let o = e,
    r = { ...o },
    a = Array.isArray(o.lastWorkspaceSession) ? o.lastWorkspaceSession : [],
    n = a.some((b) => (!b || typeof b != "object" || Array.isArray(b) ? !1 : "historyId" in b)),
    i = Array.isArray(o.remoteWorkspaceHistory) ? o.remoteWorkspaceHistory : [],
    s = new Map(
      i.flatMap((b) => {
        let S = b && typeof b == "object" && !Array.isArray(b) ? { ...b, target: stripHistoricalRemoteResourcePackages(b.target) } : b,
          _ = yS.safeParse(S);
        return _.success ? [[_.data.id, _.data]] : [];
      }),
    ),
    l =
      a.length > 0
        ? a.flatMap((b) => {
            if (!b || typeof b != "object" || Array.isArray(b)) return [];
            let S = b;
            if (S.kind === "local" && typeof S.workspacePath == "string")
              return [
                {
                  kind: "local",
                  workspacePath: S.workspacePath,
                  workspacePurpose:
                    S.workspacePurpose === "conversation" ? "conversation" : "project",
                },
              ];
            if (S.kind === "remote") {
              if (typeof S.workspacePath == "string" && S.target)
                return [{ ...S, target: stripHistoricalRemoteResourcePackages(S.target) }];
              if (typeof S.historyId == "string") {
                let _ = s.get(S.historyId);
                return _
                  ? [
                      {
                        kind: "remote",
                        workspacePath: _.workspacePath,
                        ...(_.localWorkspacePath
                          ? { localWorkspacePath: _.localWorkspacePath }
                          : {}),
                        ...(_.workspaceIdentity ? { workspaceIdentity: _.workspaceIdentity } : {}),
                        target: stripHistoricalRemoteResourcePackages(_.target),
                        lastOpenedAt: _.lastOpenedAt,
                        lastConnectionStatus: _.lastConnectionStatus,
                        ...(_.lastConnectionError
                          ? { lastConnectionError: _.lastConnectionError }
                          : {}),
                      },
                    ]
                  : [];
              }
            }
            return [];
          })
        : [],
    p = Array.isArray(o.lastOpenTabs)
      ? o.lastOpenTabs.flatMap((b) =>
          typeof b == "string"
            ? [{ kind: "local", workspacePath: b, workspacePurpose: "project" }]
            : [],
        )
      : [],
    u = new Set(
      l.flatMap((b) =>
        b.kind === "local" && typeof b.workspacePath == "string" ? [b.workspacePath] : [],
      ),
    ),
    h = [...l, ...p.filter((b) => !u.has(b.workspacePath))];
  return (
    (h.length > 0 || n || Array.isArray(o.lastOpenTabs)) && (r.lastWorkspaceSession = h),
    delete r.lastOpenTabs,
    delete r.remoteWorkspaceHistory,
    r
  );
}
c(migrateLegacyWorkspaceSession, "migrateLegacyWorkspaceSession");
var SS = t.object({
    recentProjects: t.array(t.string()).default([]),
    locale: Tn.default("zh-CN"),
    localePreference: Bm.default("system"),
    terminalInheritSystemProfile: t.boolean().default(!0),
    terminalFontFamily: A.optional(),
    integratedTerminalShell: Cr.optional(),
    httpProxy: A.optional(),
    httpProxyNoProxy: A.optional(),
    httpProxyCaCertPath: A.optional(),
    taskAutoArchiveEnabled: t.boolean().default(!1),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).default(7),
    closeToTrayOnWindows: t.boolean().default(!0),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().default(!0),
    keepAwakeWhileRunning: t.boolean().default(!1),
    desktopZoomLevel: Fm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().default(!0),
    messageStreamShowReasoning: t.boolean().default(!1),
    messageStreamShowTodos: t.boolean().default(!1),
    zcodeInteractionBehavior: Lm.default("queue"),
    askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
    optimizeAgentExperienceEnabled: t.boolean().default(!1),
    optimizeAgentExperienceMigrationInitialized: t.boolean().default(!0),
    enabledBuiltinAgentCliProviders: qm.default([...Ir]),
    modelProviderFamilyModes: Vm.default({}),
    modelProviderFamilySelectedKeys: Km.default({}),
    providerFamilyDomain: Gm.optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().default(!1),
    repoSnapshotIndexingEnabled: t.boolean().default(!1),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().default(!1),
    nativeSearchEnhancementsEnabled: t.boolean().default(!0),
    memoryEnabled: t.boolean().default(!1),
    lastWorkspaceSession: t.array(Jm).default([]),
    lastActiveTabIndex: t.number().int().nonnegative().default(0),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Kd.optional(),
    receivePreviewUpdates: t.boolean().default(!1),
    autoDownloadAndInstallUpdates: t.boolean().default(!1),
    skippedElectronUpdateVersions: pS,
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Ym.optional(),
    webRemoteControlLastEnabledContext: Xm.optional(),
    zcodeEndpointOrigin: Hd.optional(),
  }),
  _S = t.preprocess((e) => migrateCloseToTrayOnWindowsDefault(migrateOptimizeAgentExperienceDefault(migrateLegacyLocalePreference(sanitizeZCodeEndpointOrigin(migrateLegacyWorkspaceSession(migrateLegacyBuiltinAgentCliProviders(e)))))), SS),
  xS = t.object({
    recentProjects: t.array(t.string()).optional(),
    locale: Tn.optional(),
    localePreference: Bm.optional(),
    terminalInheritSystemProfile: t.boolean().optional(),
    terminalFontFamily: A.optional(),
    integratedTerminalShell: Cr.optional(),
    httpProxy: A.optional(),
    httpProxyNoProxy: A.optional(),
    httpProxyCaCertPath: A.optional(),
    taskAutoArchiveEnabled: t.boolean().optional(),
    taskAutoArchiveOlderThanDays: t.number().int().positive().max(365).optional(),
    closeToTrayOnWindows: t.boolean().optional(),
    keepAwakeWhileRunning: t.boolean().optional(),
    closeToTrayOnWindowsMigrationInitialized: t.boolean().optional(),
    desktopZoomLevel: Fm.optional(),
    desktopChromiumHardwareAccelerationEnabled: t.boolean().optional(),
    messageStreamShowReasoning: t.boolean().optional(),
    messageStreamShowTodos: t.boolean().optional(),
    zcodeInteractionBehavior: Lm.optional(),
    askUserQuestionAutoResolutionEnabled: t.boolean().optional(),
    optimizeAgentExperienceEnabled: t.boolean().optional(),
    optimizeAgentExperienceMigrationInitialized: t.boolean().optional(),
    enabledBuiltinAgentCliProviders: qm.optional(),
    modelProviderFamilyModes: Vm.optional(),
    modelProviderFamilySelectedKeys: Km.optional(),
    providerFamilyDomain: t.union([Gm, t.literal("")]).optional(),
    providerFamilyDomainUpdatedAt: t.number().int().nonnegative().optional(),
    providerFamilyDomainMigrated: t.boolean().optional(),
    repoSnapshotIndexingEnabled: t.boolean().optional(),
    repoSnapshotIndexingUserConfigured: t.boolean().optional(),
    instantGrepIndexingEnabled: t.boolean().optional(),
    nativeSearchEnhancementsEnabled: t.boolean().optional(),
    memoryEnabled: t.boolean().optional(),
    lastWorkspaceSession: t.array(Jm).optional(),
    lastActiveTabIndex: t.number().int().nonnegative().optional(),
    lastActiveTaskByWorkspace: t.record(t.string(), t.string()).optional(),
    dataBaseDir: t.string().trim().min(1).optional(),
    pendingPostUpdateReleaseNotes: Kd.optional(),
    receivePreviewUpdates: t.boolean().optional(),
    autoDownloadAndInstallUpdates: t.boolean().optional(),
    skippedElectronUpdateVersions: t.partialRecord(Wm, A).optional(),
    settingsSyncFirstRunPromptHandled: t.boolean().optional(),
    webRemoteControlExternalRelayDevice: Ym.optional(),
    webRemoteControlLastEnabledContext: Xm.optional(),
    zcodeEndpointOrigin: Hd.optional(),
  });
var Ut = t.enum([
  "default",
  "yolo",
  "plan",
  "edit",
  "acceptEdits",
  "auto",
  "dontAsk",
  "bypassPermissions",
  "autoEdit",
  "build",
]);
var Be = "builtin:",
  _e = {
    zai: `${Be}zai`,
    zaiCodingPlan: `${Be}zai-coding-plan`,
    zaiStartPlan: `${Be}zai-start-plan`,
    bigmodel: `${Be}bigmodel`,
    bigmodelCodingPlan: `${Be}bigmodel-coding-plan`,
    bigmodelStartPlan: `${Be}bigmodel-start-plan`,
    zapi: `${Be}zapi`,
  };
var SM = ["GLM-5.2", "GLM-5-Turbo"];
var _M = {
  claude: { haiku: "GLM-5-Turbo", sonnet: "GLM-5-Turbo", opus: "GLM-5.2", reasoning: "GLM-5.2" },
};
var kS = t.object({
    haiku: t.string(),
    sonnet: t.string(),
    opus: t.string(),
    reasoning: t.string(),
  }),
  tg = t.object({ claude: kS.optional() }).catchall(t.unknown()),
  ng = t.enum(["anthropic", "openai", "responses", "gemini"]),
  og = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  tt = t.enum(["anthropic", "openai", "openai-compatible"]),
  IS = t.enum(["china-llm-zcode-dev"]),
  Qm = t.enum(["text", "image", "video", "audio", "pdf"]),
  eg = t.object({ path: t.array(t.string().min(1)).min(1) }),
  CS = t.object({
    set: t.array(eg.extend({ value: t.unknown() })).optional(),
    unset: t.array(eg).optional(),
  }),
  RS = t.object({
    defaultLevel: t.string().min(1).optional(),
    levels: t.record(t.string().min(1), t.partialRecord(tt, CS)),
  }),
  rg = t.partialRecord(tt, t.string()),
  PS = t.object({ baseURL: t.string(), paths: rg }),
  ig = t.object({
    id: t.string().min(1),
    name: t.string().optional(),
    kinds: t.array(tt),
    defaultKind: tt.optional(),
    modelIdByKind: t.partialRecord(tt, t.string().min(1)).optional(),
    modalities: t.object({ input: t.array(Qm), output: t.array(Qm) }),
    contextWindow: t.number().int().positive(),
    maxOutputTokens: t.number().int().positive().optional(),
    reasoning: RS.optional(),
    priority: t.number().finite().optional(),
  }),
  TS = t.object({
    id: t.string().min(1),
    name: t.string().min(1),
    endpoints: PS,
    defaultKind: tt.optional(),
    models: t.array(ig),
  }),
  wS = t.object({ schemaVersion: t.literal("zcode.model-providers.v1"), providers: t.array(TS) }),
  ES = ig.extend({
    disabledReason: t.string().optional(),
    supportsTools: t.boolean().optional(),
    supportsStructuredOutput: t.boolean().optional(),
    modified: t.boolean().optional(),
    deleted: t.boolean().optional(),
  }),
  ag = t.enum(["builtin", "models-dev", "custom", "workspace"]),
  sg = t.enum([
    "coding_plan_not_authenticated",
    "coding_plan_not_connected",
    "coding_plan_auth_failed",
    "coding_plan_not_entitled",
    "oauth_provider_inactive",
  ]),
  cg = t.object({
    anthropic: t.string().default(""),
    openai: t.string().default(""),
    gemini: t.string().default(""),
  }),
  OS = cg.extend({
    anthropic: t.string().optional(),
    openai: t.string().optional(),
    gemini: t.string().optional(),
    baseURL: t.string().optional(),
    paths: rg.optional(),
  }),
  AS = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: sg.optional(),
    endpoints: cg,
    apiFormat: og.optional(),
    source: ag.optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    models: t.array(t.string()).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(ng)).optional(),
    providerMappings: tg.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  xM = t.array(AS),
  zS = t.object({
    id: t.string(),
    name: t.string(),
    enabled: t.boolean().optional(),
    systemDisabledReason: sg.optional(),
    endpoints: OS,
    apiFormat: og.optional(),
    source: ag.optional(),
    catalogSourceId: IS.optional(),
    catalogProviderId: t.string().optional(),
    modelsDevProviderId: t.string().optional(),
    apiKeyRequired: t.boolean().optional(),
    headers: t.record(t.string(), t.string()).optional(),
    logoUrl: t.string().optional(),
    apiKey: t.string(),
    apiKeyUrl: t.string().optional(),
    defaultKind: tt.optional(),
    models: t.array(ES).default([]),
    modelDisplayNames: t.record(t.string(), t.string()).optional(),
    modelSupportedFormats: t.record(t.string(), t.array(ng)).optional(),
    providerMappings: tg.optional(),
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  MS = t.array(zS),
  $S = t.object({ schemaVersion: t.literal("zcode.model-providers.v2"), providers: MS }),
  kM = t.object({
    providerIds: t.array(t.string().min(1)),
    updatedAt: t.number().int().nonnegative(),
  });
var DS = "ZCode Protocol",
  US = 1;
var d = t.string().trim().min(1),
  L = t.record(t.string(), t.unknown()),
  te = t.number().int().nonnegative(),
  Rr = t.union([te, d, t.date()]),
  NS = t
    .object({
      kind: t.literal("node_repl_images"),
      images: t
        .array(
          t
            .object({
              base64: t
                .string()
                .min(1)
                .max(200 * 1024),
              mimeType: t.string().regex(/^image\/[a-z0-9.+-]+$/iu),
            })
            .strict(),
        )
        .min(1)
        .max(2),
      truncated: t.boolean().optional(),
      source: t.literal("browser_turn_end").optional(),
    })
    .strict(),
  ZS = L.superRefine((e, o) => {
    let r = e.display;
    if (typeof r != "object" || r === null || Array.isArray(r) || r.kind !== "node_repl_images")
      return;
    let a = NS.safeParse(r);
    if (!a.success)
      for (let n of a.error.issues) o.addIssue({ ...n, path: ["display", ...n.path] });
  }),
  Xd = t.union([t.string(), t.number().int()]),
  pg = t
    .object({
      traceId: d.optional(),
      parentId: d.optional(),
      spanId: d.optional(),
      traceparent: d.optional(),
    })
    .strict(),
  jS = t
    .object({ id: Xd, method: d, params: t.unknown().optional(), trace: pg.optional() })
    .strict(),
  BS = t.object({ method: d, params: t.unknown().optional(), trace: pg.optional() }).strict(),
  LS = t.object({ id: Xd, result: t.unknown() }).strict(),
  WS = t
    .object({
      id: Xd,
      error: t
        .object({ code: t.number().int(), message: d, data: t.unknown().optional() })
        .strict(),
    })
    .strict(),
  u$ = t.union([jS, BS, LS, WS]);
var mg = t
    .object({
      platform: t.enum([
        "aix",
        "android",
        "darwin",
        "freebsd",
        "haiku",
        "linux",
        "netbsd",
        "openbsd",
        "sunos",
        "win32",
        "cygwin",
      ]),
      arch: t.enum([
        "arm",
        "arm64",
        "ia32",
        "loong64",
        "mips",
        "mipsel",
        "ppc",
        "ppc64",
        "riscv64",
        "s390",
        "s390x",
        "x64",
      ]),
      logicalCpuCount: t.number().int().positive().max(4096),
      intervalMs: t
        .number()
        .int()
        .positive()
        .max(10080 * 60 * 1e3),
      cpuCores: t.number().finite().nonnegative().max(4096),
      cpuPercent: t.number().finite().nonnegative().max(1e5),
      rssKb: t.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER),
    })
    .strict(),
  FS = Ud,
  gg = t.enum(["immediate", "deferred"]),
  Qd = t
    .object({ optionId: d, kind: d, name: d, description: t.string().optional(), response: Dt })
    .strict(),
  lg = t.object({ name: d, value: t.string() }).strict(),
  qS = t.union([
    t
      .object({
        type: t.literal("client_credentials"),
        clientId: d,
        clientSecret: d,
        clientName: d.optional(),
        scope: t.string().optional(),
      })
      .strict(),
    t
      .object({
        type: t.literal("authorization_code"),
        clientId: d.optional(),
        clientSecret: d.optional(),
        clientName: d.optional(),
        redirectPath: d.optional(),
        scope: t.string().optional(),
      })
      .strict(),
  ]),
  eu = t.union([
    t
      .object({
        name: d,
        command: d,
        args: t.array(t.string()),
        env: t.array(lg),
        isolation: t.enum(["session", "workspace"]).optional(),
        protocolVersion: t.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: t.number().int().positive().optional(),
      })
      .strict(),
    t
      .object({
        name: d,
        type: t.enum(["http", "sse"]),
        url: d,
        headers: t.array(lg),
        oauth: qS.optional(),
        isolation: t.enum(["session", "workspace"]).optional(),
        protocolVersion: t.enum(["legacy", "auto", "2026-07-28"]).optional(),
        timeoutMs: t.number().int().positive().optional(),
      })
      .strict(),
  ]),
  VS = t.enum(["connecting", "connected", "disabled", "disconnected", "failed", "untrusted"]),
  GS = t
    .object({
      status: VS,
      transport: t.enum(["stdio", "http", "sse"]),
      toolCount: t.number().int().nonnegative(),
      updatedAt: d,
      error: t.string().optional(),
      protocolEra: t.enum(["legacy", "modern"]).optional(),
      authorization: t
        .object({ type: t.literal("oauth_authorization_code"), authorizationUrl: d, startedAt: d })
        .strict()
        .optional(),
    })
    .strict(),
  KS = t.enum(["connect", "status"]),
  HS = t
    .object({ workspace: M, mcpServers: t.array(eu).optional(), mode: KS.default("connect") })
    .strict(),
  JS = t.object({ statuses: t.record(t.string(), GS) }).strict(),
  YS = t
    .object({ role: t.enum(["user", "assistant"]), content: t.string(), timestamp: te.optional() })
    .strict(),
  XS = t
    .object({
      source: t.literal("claudeCode"),
      title: t.string().optional(),
      createdAt: te.optional(),
      updatedAt: te.optional(),
      messages: t.array(YS).min(1),
    })
    .strict(),
  fg = t.object({ value: d, label: d, description: t.string().optional() }).strict(),
  hg = t
    .object({
      enabled: t.boolean(),
      levels: t.array(fg),
      defaultLevel: d.optional(),
      providerOptionsByLevel: t.record(d, L).optional(),
    })
    .strict(),
  yg = t
    .object({
      ref: F,
      label: d,
      providerLabel: d.optional(),
      providerSource: t.string().optional(),
      providerLogoUrl: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: hg.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  bg = t.enum(["anthropic", "openai", "openai-compatible"]),
  vg = t.enum(["anthropic-messages", "openai-chat-completions", "openai-responses"]),
  Sg = t.enum(["builtin", "models-dev", "custom", "user", "workspace", "ephemeral"]),
  QS = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("session-secret"), key: d }).strict(),
  ]),
  e_ = t.discriminatedUnion("source", [
    t.object({ source: t.literal("credential"), key: d }).strict(),
    t.object({ source: t.literal("env"), name: d }).strict(),
    t.object({ source: t.literal("server-config"), key: d }).strict(),
    t.object({ source: t.literal("inline"), value: d }).strict(),
  ]),
  _g = t
    .object({
      modelId: d,
      label: d.optional(),
      description: t.string().optional(),
      contextWindow: t.number().int().positive().optional(),
      maxOutputTokens: t.number().int().positive().optional(),
      reasoning: hg.optional(),
      supportsImages: t.boolean().optional(),
      supportsPdf: t.boolean().optional(),
      supportsTools: t.boolean().optional(),
      supportsStructuredOutput: t.boolean().optional(),
      providerOptions: L.optional(),
      disabledReason: t.string().optional(),
    })
    .strict(),
  t_ = t
    .object({
      providerId: d,
      kind: bg,
      apiFormat: vg.optional(),
      label: d.optional(),
      source: Sg.default("workspace"),
      baseURL: d.optional(),
      apiKeyRef: QS.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: L.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(_g),
      disabledReason: t.string().optional(),
      updatedAt: te.optional(),
    })
    .strict(),
  tu = t
    .object({
      providerId: d,
      kind: bg,
      apiFormat: vg.optional(),
      label: d.optional(),
      source: Sg.default("workspace"),
      baseURL: d.optional(),
      apiKey: e_.optional(),
      apiKeyRequired: t.boolean().optional(),
      headers: t.record(t.string(), t.string()).optional(),
      providerOptions: L.optional(),
      logoUrl: d.optional(),
      modelsDevProviderId: d.optional(),
      models: t.array(_g).min(1),
    })
    .strict(),
  Te = t
    .object({ revision: d, generatedAt: te, model: F, provider: tu, thoughtLevel: d.optional() })
    .strict(),
  p$ = t.object({ sessionId: d, appliedModelRuntimeRevision: d, changed: t.boolean() }).strict();
var n_ = t
    .object({
      revision: t.number().int().nonnegative(),
      providerRevision: d.optional(),
      providers: t.array(t_),
      available: t.array(yg),
      defaultModel: F.optional(),
      lastUsed: F.optional(),
    })
    .strict(),
  xg = t
    .object({
      content: d,
      status: t.enum(["pending", "in_progress", "completed"]),
      priority: t.enum(["high", "medium", "low"]),
    })
    .strict(),
  o_ = t
    .object({
      timeUsedSeconds: t.number().int().nonnegative(),
      tokensUsed: t.number().int().nonnegative(),
      tokenBudget: t.number().int().positive().nullable(),
      contextUsed: t.number().int().nonnegative(),
      contextWindow: t.number().int().nonnegative(),
      toolCallCount: t.number().int().nonnegative(),
      iterationCount: t.number().int().nonnegative(),
    })
    .strict(),
  r_ = t
    .object({
      id: d,
      source: t.enum(["goal_iteration", "session"]),
      goalIteration: t.number().int().positive().optional(),
      targetId: d.optional(),
      startedAt: te.optional(),
      updatedAt: te.optional(),
      todos: t.array(xg),
    })
    .strict(),
  kg = t
    .object({
      appliedProviderRevision: d.optional(),
      model: t.object({ current: F, available: t.array(yg), lastUsed: F.optional() }).strict(),
      thoughtLevel: t
        .object({
          enabled: t.boolean(),
          current: d.optional(),
          defaultLevel: d.optional(),
          available: t.array(fg),
        })
        .strict(),
      mode: t.object({ current: Pe }).strict(),
      permission: t
        .object({ mode: Pe.optional(), rulesRevision: t.number().int().nonnegative().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  i_ = t
    .object({
      requestId: d,
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown().optional(),
      origin: et.optional(),
      options: t.array(Qd).min(1),
      requestedAt: te,
    })
    .strict(),
  a_ = t
    .object({
      toolCallId: d,
      toolName: d,
      status: t.enum(["pending", "running", "completed", "failed", "denied"]),
      startedAt: te.optional(),
    })
    .strict(),
  s_ = t
    .object({
      sessionId: d,
      status: jd,
      mode: Pe,
      turnCount: t.number().int().nonnegative(),
      totalTokenCount: t.number().int().nonnegative(),
      contextUsed: t.number().int().nonnegative(),
      contextWindow: t.number().int().nonnegative(),
      currentTurnId: d.optional(),
      pendingPermissions: t.array(i_),
      activeToolCalls: t.array(a_),
      backgroundJobs: t.array(L),
      target: Bd.nullable().optional(),
      lastError: t
        .object({ type: d, code: d.optional(), message: d, detail: t.string().optional() })
        .strict()
        .optional(),
    })
    .strict(),
  Ig = t
    .object({
      name: d,
      description: t.string(),
      inputHint: t.string().optional(),
      source: t.enum(["builtin", "custom"]).optional(),
    })
    .strict(),
  c_ = t.enum([
    "start",
    "finish",
    "error",
    "text_start",
    "text_delta",
    "text_end",
    "reasoning_start",
    "reasoning_delta",
    "reasoning_end",
    "tool_input_start",
    "tool_input_delta",
    "tool_input_end",
    "tool_call",
  ]),
  l_ = t
    .object({
      assistantMessageId: t.string().optional(),
      delta: t.string().optional(),
      done: t.boolean().optional(),
      input: t.unknown().optional(),
      kind: c_,
      partId: t.string().optional(),
      providerExecuted: t.boolean().optional(),
      toolCallId: t.string().optional(),
      toolName: t.string().optional(),
    })
    .strict(),
  Pr = t
    .object({
      protocol: t.object({ name: t.literal(DS), version: t.literal(US) }).strict(),
      session: Ld,
      settings: kg,
      projection: s_,
      runtime: Zm,
      messages: t.array(Fd),
      goalStats: o_.optional(),
      todos: t.array(xg).optional(),
      todoGroups: t.array(r_).optional(),
      slashCommands: t.array(Ig).optional(),
    })
    .strict(),
  d_ = t
    .object({
      eventId: d,
      sessionId: d,
      turnId: d.optional(),
      seq: t.number().int().nonnegative(),
      traceId: d.optional(),
      timestamp: te,
      deliveryKind: Rn.optional(),
    })
    .strict(),
  m$ = t.enum([
    "session.created",
    "session.resumed",
    "session.updated",
    "session.titleUpdated",
    "session.closed",
    "turn.started",
    "turn.steerQueued",
    "turn.steerDrained",
    "turn.completed",
    "turn.failed",
    "message.upserted",
    "message.removed",
    "part.started",
    "part.delta",
    "part.upserted",
    "part.removed",
    "model.streaming",
    "tool.updated",
    "permission.requested",
    "permission.resolved",
    "userInput.requested",
    "userInput.resolved",
    "checkpoint.created",
    "rewind.triggered",
    "streamRecovery.updated",
  ]),
  Cg = t
    .object({
      type: d,
      message: d,
      stack: t.string().optional(),
      code: t.string().optional(),
      detail: t.string().optional(),
      retryable: t.boolean().optional(),
      data: t.unknown().optional(),
    })
    .strict(),
  u_ = t.object({ mode: Pe, contextWindow: t.number().int().nonnegative() }).strict(),
  p_ = t
    .object({
      directory: d,
      interruptedToolCount: t.number().int().nonnegative(),
      messageCount: t.number().int().nonnegative(),
      partCount: t.number().int().nonnegative(),
      recoveredCompactTimelineCount: t.number().int().nonnegative().optional(),
      recoveredSteerInputCount: t.number().int().nonnegative().optional(),
      resumedTodoCount: t.number().int().nonnegative().optional(),
    })
    .strict(),
  m_ = t
    .object({
      messageID: d.optional(),
      modelRef: L.optional(),
      previousTitle: t.string(),
      source: t.enum(["default", "first_input", "generated", "custom"]),
      title: t.string(),
    })
    .strict(),
  g_ = t
    .object({
      turnNumber: t.number().int().nonnegative(),
      input: t.string(),
      inputId: d.optional(),
      queryId: d.optional(),
      inputSource: FS.optional(),
      inputVisibility: Dd.optional(),
      executionKind: t.enum(["agent", "controlOnly"]).optional(),
      targetId: d.optional(),
      messageId: d.optional(),
      foregroundExecutionId: d.optional(),
      intent: L.optional(),
      originMeta: L.optional(),
      attachments: t.array(L).optional(),
    })
    .strict(),
  f_ = t.literal("plan_approval_feedback"),
  h_ = t.enum(["sendText", "sendGoalCommand", "compact"]),
  Rg = t.enum(["queue", "guide"]),
  y_ = t
    .object({
      pendingInputId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      input: t.string(),
      inputPreview: t.string(),
      inputSize: t.number().int().nonnegative(),
      commandKind: h_.optional(),
      source: f_.optional(),
      toolDisallowlist: t.array(d).optional(),
      delivery: Rg.optional(),
      targetTurnId: d,
      queueLength: t.number().int().nonnegative(),
      intent: L.optional(),
    })
    .strict(),
  b_ = t
    .object({
      pendingInputIds: t.array(d),
      queryIds: t.array(d).optional(),
      targetTurnId: d,
      injectedMessageIds: t.array(d),
      drainedInputs: t
        .array(
          t
            .object({
              pendingInputId: d,
              messageId: d,
              text: t.string(),
              delivery: Rg.optional(),
              intent: L.optional(),
              toolDisallowlist: t.array(d).optional(),
            })
            .strict(),
        )
        .optional(),
    })
    .strict(),
  v_ = t
    .object({
      response: t.string(),
      tokenCount: t.number().int().nonnegative(),
      usage: t.unknown().optional(),
      toolCallCount: t.number().int().nonnegative(),
      historyRoundCount: t.number().int().nonnegative().optional(),
      duration: t.number().nonnegative(),
      cacheStats: t
        .object({
          totalMessages: t.number().int().nonnegative(),
          cachedMessages: t.number().int().nonnegative(),
          lastCacheHit: t.boolean(),
          cacheReadTokens: t.number().int().nonnegative().optional(),
        })
        .strict()
        .optional(),
      inputId: d.optional(),
      resultType: t.enum([
        "success",
        "cancelled",
        "error_max_turns",
        "error_max_budget",
        "error_during_execution",
        "error_max_tool_calls",
      ]),
    })
    .strict(),
  S_ = t.object({ error: Cg, turnPhase: t.string(), inputId: d.optional() }).strict(),
  __ = t
    .object({
      content: t.string(),
      attachments: t.array(t.unknown()).optional(),
      toolCalls: t.array(t.unknown()).optional(),
      type: t.string().optional(),
      compactBoundary: t.unknown().optional(),
    })
    .strict(),
  x_ = t.object({ messageId: d, reason: t.string().optional() }).strict(),
  k_ = t
    .object({
      messageId: d,
      partId: d,
      field: t.enum(["text", "reasoning", "input", "output"]).optional(),
      delta: t.string(),
    })
    .strict(),
  dg = t.object({ part: Wd }).strict(),
  I_ = t.object({ messageId: d, partId: d, reason: t.string().optional() }).strict(),
  Nt = t
    .object({
      toolCallId: d,
      toolName: t.string().optional(),
      parentToolCallId: d.optional(),
      source: t.enum(["subagent"]).optional(),
      agentId: d.optional(),
      agentType: d.optional(),
      childSessionId: d.optional(),
      childToolCallId: d.optional(),
      description: t.string().optional(),
    })
    .strict(),
  C_ = t.discriminatedUnion("kind", [
    Nt.extend({
      kind: t.literal("scheduled"),
      toolName: d,
      input: t.unknown().optional(),
      inputByteLength: t.number().int().nonnegative().optional(),
      inputOmitted: t.boolean().optional(),
      inputRef: t.literal("model_stream").optional(),
      dependencies: t.array(d).optional(),
      parallelGroupIndex: t.number().int().nonnegative().optional(),
      canRunParallel: t.boolean().optional(),
      schedule: L.optional(),
    }).strict(),
    Nt.extend({ kind: t.literal("started"), startedAt: Rr }).strict(),
    Nt.extend({
      kind: t.literal("progress"),
      elapsedMs: t.number().nonnegative().optional(),
      pid: t.number().int().optional(),
      stdoutBytes: t.number().int().nonnegative().optional(),
      stderrBytes: t.number().int().nonnegative().optional(),
      outputBytes: t.number().int().nonnegative().optional(),
      stdoutTail: t.string().optional(),
      stderrTail: t.string().optional(),
    }).strict(),
    Nt.extend({
      kind: t.literal("result"),
      result: ZS,
      duration: t.number().nonnegative(),
    }).strict(),
    Nt.extend({ kind: t.literal("error"), error: Cg }).strict(),
    t
      .object({
        kind: t.literal("batch"),
        toolCallIds: t.array(d),
        successCount: t.number().int().nonnegative(),
        errorCount: t.number().int().nonnegative(),
      })
      .strict(),
    Nt.extend({ kind: t.literal("raw"), payload: L }).strict(),
  ]),
  R_ = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d,
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      reason: t.string(),
      input: t.unknown(),
      suggestedPermissionUpdates: t.array(Zd).optional(),
      origin: et.optional(),
      options: t.array(Qd).min(1),
    })
    .strict(),
  P_ = t
    .object({
      requestId: d.optional(),
      toolCallId: d,
      toolName: d.optional(),
      decision: Nd.optional(),
      reason: t.string().optional(),
      modifiedInput: t.unknown().optional(),
      inputSummary: t.unknown().optional(),
    })
    .strict(),
  T_ = t
    .object({
      requestId: d,
      prompt: t.string(),
      inputType: t.enum(["text", "choice", "confirm"]).optional(),
      choices: t.array(t.string()).optional(),
    })
    .strict(),
  w_ = t
    .object({ requestId: d, value: t.unknown().optional(), cancelled: t.boolean().optional() })
    .strict(),
  E_ = t.object({ reason: t.string().optional() }).strict();
function zcodeSessionEventEnvelopeFor(e, o) {
  return d_.extend({ type: t.literal(e), payload: o.optional() });
}
c(zcodeSessionEventEnvelopeFor, "zcodeSessionEventEnvelopeFor");
var Pg = t.discriminatedUnion("type", [
    zcodeSessionEventEnvelopeFor("session.created", u_),
    zcodeSessionEventEnvelopeFor("session.resumed", p_),
    zcodeSessionEventEnvelopeFor("session.updated", L),
    zcodeSessionEventEnvelopeFor("session.titleUpdated", m_),
    zcodeSessionEventEnvelopeFor("session.closed", E_),
    zcodeSessionEventEnvelopeFor("turn.started", g_),
    zcodeSessionEventEnvelopeFor("turn.steerQueued", y_),
    zcodeSessionEventEnvelopeFor("turn.steerDrained", b_),
    zcodeSessionEventEnvelopeFor("turn.completed", v_),
    zcodeSessionEventEnvelopeFor("turn.failed", S_),
    zcodeSessionEventEnvelopeFor("message.upserted", __),
    zcodeSessionEventEnvelopeFor("message.removed", x_),
    zcodeSessionEventEnvelopeFor("part.started", dg),
    zcodeSessionEventEnvelopeFor("part.delta", k_),
    zcodeSessionEventEnvelopeFor("part.upserted", dg),
    zcodeSessionEventEnvelopeFor("part.removed", I_),
    zcodeSessionEventEnvelopeFor("model.streaming", l_),
    zcodeSessionEventEnvelopeFor("tool.updated", C_),
    zcodeSessionEventEnvelopeFor("permission.requested", R_),
    zcodeSessionEventEnvelopeFor("permission.resolved", P_),
    zcodeSessionEventEnvelopeFor("userInput.requested", T_),
    zcodeSessionEventEnvelopeFor("userInput.resolved", w_),
    zcodeSessionEventEnvelopeFor("checkpoint.created", L),
    zcodeSessionEventEnvelopeFor("rewind.triggered", L),
    zcodeSessionEventEnvelopeFor("streamRecovery.updated", L),
  ]),
  g$ = t.object({ events: t.array(Pg) }).strict(),
  f$ = t.object({ messages: t.array(Fd) }).strict(),
  h$ = t
    .object({
      type: t.literal("state.updated"),
      scope: t.enum(["server", "workspace", "session"]),
      workspace: M.optional(),
      sessionId: d.optional(),
      revision: t.number().int().nonnegative(),
      reason: t.string().optional(),
      patch: t.unknown(),
    })
    .strict(),
  y$ = t
    .object({
      sessionId: d,
      deliveryKind: Rn,
      afterSeq: t.number().int().nonnegative().optional(),
      includeSnapshot: t.boolean().default(!1),
    })
    .strict(),
  b$ = t
    .object({
      sessionId: d,
      eventSeq: t.number().int().nonnegative(),
      events: t.array(Pg),
      snapshot: Pr.optional(),
    })
    .strict(),
  v$ = t.object({ sessions: t.array(Ld) }).strict(),
  Tg = t
    .object({
      childSessionId: d,
      agentId: d.optional(),
      toolCallId: d.optional(),
      subagentType: d,
      title: d,
      summary: t.string().optional(),
      startedAt: t.number().int().nonnegative().optional(),
      endedAt: t.number().int().nonnegative().optional(),
    })
    .strict(),
  O_ = Tg.extend({ status: t.enum(["running", "waiting", "blocked"]) }),
  A_ = Tg.extend({ status: t.enum(["success", "failed", "cancelled", "lost"]) }),
  S$ = t
    .object({
      revision: t.number().int().nonnegative(),
      childSessionIds: t.array(d),
      running: t.array(O_),
      ended: t
        .object({
          total: t.number().int().nonnegative(),
          items: t.array(A_),
          nextCursor: d.optional(),
        })
        .strict(),
    })
    .strict(),
  z_ = t
    .object({
      workspace: M,
      settings: kg,
      modelCatalog: n_.optional(),
      slashCommands: t.array(Ig).optional(),
    })
    .strict(),
  _$ = t
    .object({
      sessionId: d.optional(),
      workspace: M,
      parentSessionId: d.optional(),
      mode: Pe.optional(),
      model: F.optional(),
      runtimeModel: Te.optional(),
      persistence: gg.optional(),
      thoughtLevel: d.optional(),
      titleGenerationEnabled: t.boolean().optional(),
      mcpServers: t.array(eu).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
      importedHistory: XS.optional(),
    })
    .strict(),
  x$ = t
    .object({
      sessionId: d,
      workspace: M.optional(),
      runtimeModel: Te.optional(),
      thoughtLevel: d.optional(),
      mcpServers: t.array(eu).optional(),
      toolAllowlist: t.array(d).optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict(),
  k$ = t
    .object({
      workspace: M.optional(),
      includeArchived: t.boolean().default(!1),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  I$ = t
    .object({
      sessionId: d,
      endedCursor: d.optional(),
      endedLimit: t.number().int().positive().max(100).default(20),
    })
    .strict(),
  C$ = t.object({ range: t.enum($d), timeZone: t.string().optional() }).strict();
var R$ = t.object({ sessionId: d }).strict(),
  P$ = t
    .object({
      sessionId: d,
      totalTokens: t.number().int().nonnegative(),
      inputTokens: t.number().int().nonnegative(),
      outputTokens: t.number().int().nonnegative(),
      reasoningTokens: t.number().int().nonnegative(),
      cacheCreationTokens: t.number().int().nonnegative(),
      cacheReadTokens: t.number().int().nonnegative(),
      modelRequestCount: t.number().int().nonnegative(),
      modelErrorCount: t.number().int().nonnegative(),
      inputBaselineBySource: t.record(t.string(), t.number().int().nonnegative()),
    })
    .strict(),
  T$ = t
    .object({
      sessionId: d,
      deliveryKind: Rn.optional(),
      messageLimit: t.number().int().positive().optional(),
      afterSeq: t.number().int().nonnegative().optional(),
    })
    .strict(),
  w$ = t
    .object({
      sessionId: d,
      afterMessageId: d.optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  E$ = t
    .object({
      sessionId: d,
      afterSeq: t.number().int().nonnegative().optional(),
      limit: t.number().int().positive().optional(),
    })
    .strict(),
  M_ = t.enum(["runtime-materialization", "user-execution"]);
var O$ = t.object({ sessionId: d, scope: M_ }).strict(),
  $_ = "preflight-v1",
  D_ = t.enum(["legacy", "preflight-v1"]),
  A$ = t
    .object({
      nativeSearchEnhancementsEnabled: t.boolean(),
      memoryEnabled: t.boolean().default(!1),
      askUserQuestionAutoResolutionEnabled: t.boolean().default(!0),
      integratedTerminalShell: Cr.optional(),
      modelContextBudgetStrategy: D_.default($_),
    })
    .strict(),
  U_ = t
    .object({
      tabCount: t.number().int().positive().max(100),
      currentUrl: t.string().trim().min(1).max(4096).optional(),
    })
    .strict(),
  z$ = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      queryId: d.optional(),
      content: t.string(),
      attachments: t.array(L).optional(),
      browserAmbientContext: U_.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      expectedProviderRevision: d.optional(),
      expectedModelRuntimeRevision: d.optional(),
      runtimeModel: Te.optional(),
      automationId: d.optional(),
      offPeakTaskId: d.optional(),
      offPeakRunType: t.enum(["init", "resume"]).optional(),
      botDeliveryTarget: qd.optional(),
      toolDenylist: t.array(d).optional(),
    })
    .strict()
    .superRefine((e, o) => {
      (e.automationId &&
        e.offPeakTaskId &&
        o.addIssue({
          code: t.ZodIssueCode.custom,
          message: "automationId and offPeakTaskId are mutually exclusive",
        }),
        e.offPeakRunType &&
          !e.offPeakTaskId &&
          o.addIssue({
            code: t.ZodIssueCode.custom,
            message: "offPeakRunType requires offPeakTaskId",
            path: ["offPeakRunType"],
          }));
    }),
  M$ = t
    .object({
      sessionId: d,
      accepted: t.literal(!0),
      stateRevision: t.number().int().nonnegative(),
      modelRuntimeRevision: d.optional(),
    })
    .strict(),
  N_ = t.discriminatedUnion("kind", [
    t.object({ kind: t.literal("turn"), turnIndex: t.number().int().nonnegative() }).strict(),
    t.object({ kind: t.literal("message"), messageId: d }).strict(),
    t.object({ kind: t.literal("checkpoint"), checkpointId: d }).strict(),
    t.object({ kind: t.literal("latestCheckpoint") }).strict(),
  ]),
  $$ = t
    .object({
      sessionId: d,
      target: N_.default({ kind: "latestCheckpoint" }),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  D$ = t
    .object({
      forkedSessionId: d,
      parentSessionId: d.optional(),
      targetMessageId: d.optional(),
      targetCheckpointId: d.optional(),
      response: t.string(),
      snapshot: Pr,
    })
    .strict(),
  U$ = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      instructions: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      runtimeModel: Te.optional(),
    })
    .strict(),
  N$ = t
    .object({
      response: t.string(),
      snapshot: Pr,
      compact: t
        .object({
          state: t.enum(["accepted", "already_running"]),
          inputId: d.optional(),
          operationId: d.optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  Z_ = t.enum(["show", "set", "replace", "pause", "resume", "clear"]),
  Z$ = t
    .object({
      sessionId: d,
      inputId: d.optional(),
      action: Z_,
      objective: t.string().optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  j$ = t
    .object({ response: t.string(), snapshot: Pr, startedTurn: t.boolean().optional() })
    .strict(),
  B$ = t.object({ sessionId: d }).strict(),
  wg = t.enum(["running", "completed", "failed", "timed_out", "cancelled", "spawn_error", "lost"]),
  j_ = t
    .object({
      taskId: d,
      toolCallId: d.optional(),
      toolName: d.optional(),
      taskKind: t.enum(["bash", "subagent"]).optional(),
      blocked: t.boolean().optional(),
      blockedReason: t.string().optional(),
      cancellable: t.boolean().optional(),
      cancelRequestedAt: Rr.optional(),
      command: t.string().optional(),
      description: t.string().optional(),
      status: wg,
      pid: t.number().int().positive().optional(),
      startedAt: Rr.optional(),
      completedAt: Rr.optional(),
      outputPath: t.string().optional(),
      stderrPersistedOutputPath: t.string().optional(),
      stdoutPersistedOutputPath: t.string().optional(),
      outputBytes: t.number().int().nonnegative().optional(),
      outputTruncated: t.boolean().optional(),
      outputTail: t.string().optional(),
      stderrBytes: t.number().int().nonnegative().optional(),
      stderrTail: t.string().optional(),
      stdoutBytes: t.number().int().nonnegative().optional(),
      stdoutTail: t.string().optional(),
      terminalId: d.optional(),
    })
    .strict(),
  L$ = t.object({ sessionId: d, taskId: d }).strict(),
  W$ = t
    .object({
      cancelled: t.boolean(),
      reason: t.string().optional(),
      snapshot: j_.optional(),
      status: wg,
      taskId: d,
    })
    .strict(),
  F$ = t
    .object({
      sessionId: d,
      model: F,
      runtimeModel: Te.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  q$ = t
    .object({
      sessionId: d,
      thoughtLevel: d.optional(),
      runtimeModel: Te.optional(),
      expectedRevision: t.number().int().nonnegative().optional(),
      persistAsWorkspaceLastUsed: t.boolean().default(!0),
    })
    .strict(),
  V$ = t
    .object({ sessionId: d, runtimeModel: Te, applyModelSelection: t.boolean().default(!0) })
    .strict(),
  G$ = t
    .object({ sessionId: d, mode: Pe, expectedRevision: t.number().int().nonnegative().optional() })
    .strict(),
  K$ = t.object({ sessionId: d, expectedPersistence: gg.optional() }).strict(),
  H$ = t.object({ closed: t.boolean().optional() }).strict(),
  J$ = t
    .object({
      workspace: M,
      runtimeModel: Te.optional(),
      preferWorkspaceDefaults: t.boolean().optional(),
    })
    .strict(),
  Y$ = t
    .object({
      workspace: M,
      modelRef: F,
      prompt: d,
      querySource: d,
      maxOutputTokens: t.number().int().positive().optional(),
      temperature: t.number().min(0).max(2).optional(),
    })
    .strict(),
  X$ = t.object({ text: t.string(), modelRef: F }).strict(),
  B_ = t.object({ revision: d, generatedAt: te, providers: t.array(tu) }).strict(),
  L_ = t.enum(["applied", "unchanged", "failed"]),
  Q$ = t
    .object({ workspace: M, registry: B_, includeWorkspaceState: t.boolean().optional() })
    .strict(),
  eD = t
    .object({
      workspace: M,
      appliedProviderRevision: d,
      status: L_,
      providerCount: t.number().int().nonnegative(),
      workspaceState: z_.optional(),
    })
    .strict(),
  W_ = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict(),
  tD = t.object({ workspace: M, preferences: W_ }).strict(),
  nD = t
    .object({
      workspace: M,
      askUserQuestionAutoResolutionEnabled: t.boolean(),
      snoozedInteractionCount: t.number().int().nonnegative(),
    })
    .strict(),
  oD = t
    .object({
      workspace: M,
      provider: tu,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  rD = t
    .object({
      workspace: M,
      providerId: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  iD = t
    .object({
      workspace: M,
      model: F,
      runtimeModel: Te.optional(),
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  aD = t
    .object({
      workspace: M,
      thoughtLevel: d,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  sD = t
    .object({
      workspace: M,
      mode: Pe,
      expectedWorkspaceRevision: t.number().int().nonnegative().optional(),
    })
    .strict(),
  cD = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d,
      toolName: d,
      reason: t.string(),
      riskLevel: t.enum(["low", "medium", "high", "critical"]),
      input: t.unknown(),
      origin: et.optional(),
      options: t.array(Qd).min(1),
    })
    .strict(),
  F_ = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspaceKey: d,
      workspacePath: d,
      workspaceIdentity: d.optional(),
      remoteSessionId: d.optional(),
      clientMode: Xe,
      sessionContext: _r,
    })
    .strict(),
  q_ = Em,
  V_ = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      browserId: d.optional(),
      browserGeneration: t.number().int().nonnegative().optional(),
      workspaceKey: d.optional(),
      workspacePath: d.optional(),
      workspaceIdentity: d.optional(),
      remoteSessionId: d.optional(),
      clientMode: Xe.optional(),
      sessionContext: _r.optional(),
      command: Mt,
    })
    .strict(),
  G_ = $t,
  K_ = t
    .object({
      value: d,
      label: d,
      description: t.string().optional(),
      preview: t.string().optional(),
    })
    .strict(),
  H_ = t
    .object({
      question: d,
      header: d,
      options: t.array(K_).min(1),
      multiSelect: t.boolean().optional(),
    })
    .strict(),
  lD = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      toolCallId: d.optional(),
      toolName: d.optional(),
      prompt: t.string().optional(),
      questions: t.array(H_).min(1).optional(),
      input: t.unknown().optional(),
      origin: et.optional(),
      schema: t.unknown().optional(),
    })
    .strict(),
  dD = t
    .object({
      action: t.enum(["accept", "decline", "cancel"]),
      content: L.optional(),
      reason: t.string().optional(),
    })
    .strict(),
  J_ = t.enum(["model-request", "captcha-retry"]),
  uD = t
    .object({
      requestId: d,
      sessionId: d,
      turnId: d.optional(),
      workspace: M,
      modelRef: F,
      providerId: d,
      reason: J_,
    })
    .strict(),
  pD = t
    .object({
      headersApplied: t.boolean(),
      errorMessage: d.optional(),
      providerRevision: d.optional(),
    })
    .strict(),
  Eg = t.union([t.string(), t.number(), t.boolean()]),
  Og = t
    .object({
      event: d,
      matcher: t.string().optional(),
      type: t.enum(["command", "process"]),
      command: d,
      args: t.array(t.string()).optional(),
      async: t.boolean().optional(),
      shell: t.union([t.literal(!0), t.string()]).optional(),
      timeout: t.number().positive().optional(),
      timeoutMs: t.number().int().positive().optional(),
      statusMessage: t.string().optional(),
      sourcePath: t.string(),
      runnable: t.boolean(),
    })
    .strict(),
  Y_ = t
    .object({
      default: Eg.optional(),
      description: t.string().optional(),
      required: t.boolean().optional(),
      sensitive: t.boolean().optional(),
      title: t.string().optional(),
      type: t.enum(["string", "number", "boolean", "directory", "file"]).optional(),
    })
    .strict(),
  X_ = t.enum(["agent", "command", "skill", "hook", "mcp"]),
  Q_ = t.object({ name: d, description: t.string().optional() }).strict(),
  Ag = t.object({ kind: X_, items: t.array(Q_) }).strict(),
  zg = t
    .object({
      id: d,
      name: d,
      description: t.string().optional(),
      version: t.string().optional(),
      enabled: t.boolean(),
      source: d,
      marketplace: d,
      author: t.string().optional(),
      authorUrl: t.string().optional(),
      homepage: t.string().optional(),
      skillCount: t.number().int().nonnegative().optional(),
      skillRootCount: t.number().int().nonnegative(),
      commandRootCount: t.number().int().nonnegative(),
      components: t.array(Ag).optional(),
      declaredMcpServerNames: t.array(t.string()).optional(),
      hostMcpServerNames: t.array(t.string()).optional(),
      mcpServerNames: t.array(t.string()),
      hookDetails: t.array(Og).optional(),
      rootPath: t.string(),
      userConfig: t.record(t.string(), Y_).optional(),
      configuredOptions: t.record(t.string(), Eg).optional(),
    })
    .strict(),
  we = t
    .object({
      code: t.string(),
      message: t.string(),
      severity: t.enum(["warning", "error"]).optional(),
      pluginId: t.string().optional(),
    })
    .strict(),
  mD = t.object({ workspace: M }).strict(),
  gD = t.object({ plugins: t.array(zg), diagnostics: t.array(we) }).strict(),
  ex = t
    .object({
      pluginId: d,
      name: d,
      marketplace: d,
      icon: t.string().optional(),
      enabled: t.boolean(),
      conflictingPluginIds: t.array(d),
      skillQualifiedNames: t.array(d),
      mcpServerNames: t.array(d),
      subagentNames: t.array(d).default([]),
    })
    .strict(),
  fD = t.object({ workspace: M, sessionId: d.optional() }).strict(),
  hD = t.object({ authority: t.enum(["session", "workspace"]), plugins: t.array(ex) }).strict(),
  yD = t.object({ workspace: M, pluginId: d, enabled: t.boolean() }).strict(),
  bD = t.object({ plugin: zg, enabled: t.boolean() }).strict(),
  Mg = t.enum(["user", "workspace"]),
  $g = t
    .object({
      displayName: t.string().optional(),
      displayNameI18n: t.record(t.string(), t.string()).optional(),
      descriptionI18n: t.record(t.string(), t.string()).optional(),
      icon: t.string().optional(),
      category: t.string().optional(),
      author: t.string().optional(),
      authorUrl: t.string().optional(),
      homepage: t.string().optional(),
      privacyPolicy: t.string().optional(),
      termsOfService: t.string().optional(),
      heroImage: t.string().optional(),
      examplePrompts: t.array(t.string()).optional(),
      examplePromptsI18n: t.record(t.string(), t.array(t.string())).optional(),
    })
    .strict(),
  Yd = t
    .object({
      id: d,
      name: d,
      source: L,
      description: t.string().optional(),
      lastUpdated: t.string().optional(),
      pluginCount: t.number().int().nonnegative(),
      isOfficial: t.boolean().optional(),
      featured: t.array(t.string()).optional(),
      refreshFailure: t
        .object({ code: t.string(), failedAt: t.string(), message: t.string() })
        .strict()
        .optional(),
    })
    .strict(),
  ug = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      installed: t.boolean(),
      componentTypes: t.array(t.string()).optional(),
      listing: $g.optional(),
    })
    .strict(),
  nu = t
    .object({
      id: d,
      name: d,
      marketplace: d,
      description: t.string().optional(),
      version: t.string().optional(),
      enabled: t.boolean(),
      scope: Mg,
      installPath: t.string().optional(),
      installedAt: t.string().optional(),
      componentTypes: t.array(t.string()).optional(),
      hookDetails: t.array(Og).optional(),
      updateStatus: t.enum(["none", "update-available", "version-changed"]).optional(),
      latestVersion: t.string().optional(),
      listing: $g.optional(),
    })
    .strict(),
  vD = t.object({ workspace: M }).strict(),
  SD = t
    .object({
      marketplaces: t.array(Yd),
      availablePlugins: t.array(ug),
      installedPlugins: t.array(nu),
      restorableBuiltins: t.array(ug),
      diagnostics: t.array(we),
      capability: t.object({ supported: t.boolean(), reason: t.string().optional() }).strict(),
    })
    .strict(),
  _D = t
    .object({ workspace: M, source: d, dryRun: t.boolean().optional(), operationId: d.optional() })
    .strict(),
  xD = t.object({ workspace: M, marketplace: d }).strict(),
  kD = t.object({ workspace: M, marketplace: d.optional() }).strict(),
  ID = t
    .object({
      marketplace: Yd.optional(),
      marketplaces: t.array(Yd).optional(),
      diagnostics: t.array(we).optional(),
    })
    .strict(),
  CD = t
    .object({
      workspace: M,
      pluginName: d,
      marketplace: d,
      scope: Mg.optional(),
      dryRun: t.boolean().optional(),
      operationId: d.optional(),
    })
    .strict(),
  RD = t.object({ operationId: d }).strict(),
  PD = t.object({ operationId: d, cancelled: t.boolean() }).strict(),
  TD = t
    .object({
      workspace: M,
      pluginId: d.optional(),
      pluginName: d.optional(),
      marketplace: d.optional(),
      removeCache: t.boolean().optional(),
    })
    .strict(),
  wD = t
    .object({
      installedPlugins: t.array(nu),
      dependencyClosure: t.array(t.string()),
      diagnostics: t.array(we),
    })
    .strict(),
  ED = t.object({ removedPlugin: nu.optional(), diagnostics: t.array(we) }).strict(),
  OD = t.object({ workspace: M, pluginId: d.optional(), marketplace: d.optional() }).strict(),
  AD = t.object({ workspace: M, pluginId: d }).strict(),
  zD = t.object({ pluginId: d, diagnostics: t.array(we) }).strict(),
  MD = t.object({ workspace: M, pluginId: d, options: L, dryRun: t.boolean().optional() }).strict(),
  $D = t.object({ pluginId: d, diagnostics: t.array(we) }).strict(),
  DD = t
    .object({
      workspace: M,
      pluginName: d.optional(),
      marketplace: d.optional(),
      source: d.optional(),
    })
    .strict(),
  UD = t
    .object({
      ok: t.boolean(),
      diagnostics: t.array(we),
      compatibility: t
        .object({
          runnable: t.array(t.string()),
          diagnosticOnly: t.array(t.string()),
          unsupported: t.array(t.string()),
        })
        .strict(),
    })
    .strict(),
  ND = t.object({ workspace: M, pluginName: d, marketplace: d }).strict(),
  ZD = t
    .object({
      components: t.array(Ag),
      diagnostics: t.array(we).optional(),
      metadata: t
        .object({
          author: t.string().optional(),
          authorUrl: t.string().optional(),
          homepage: t.string().optional(),
          version: t.string().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  tx = t
    .object({
      unit: t.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
      interval: t.number().int().positive(),
      hour: t.number().int().min(0).max(23),
      minute: t.number().int().min(0).max(59),
      anchorAt: t.number().int(),
      weekdays: t.array(t.number().int().min(0).max(6)).optional(),
      monthDays: t.array(t.number().int().min(1).max(31)).optional(),
      months: t.array(t.number().int().min(1).max(12)).optional(),
      monthlyMode: t.enum(["date", "weekday"]).optional(),
    })
    .strict(),
  Dg = t.enum(["minute", "hourly", "daily", "weekly", "monthly", "yearly"]),
  ou = t
    .object({
      automationId: d,
      title: t.string(),
      cronExpr: d,
      prompt: d,
      model: t.string().optional(),
      provider: re.optional(),
      mode: Ut.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      enabled: t.boolean(),
      lifecycleStatus: t.enum(["active", "completed", "failed", "paused"]),
      nextRunAt: te.optional(),
      lastRunAt: te.optional(),
      runCount: t.number().int().nonnegative(),
      recurring: t.boolean(),
      maxRuns: t.number().int().positive().optional(),
      scheduleRule: tx.optional(),
    })
    .strict(),
  jD = t
    .object({
      title: t.string().optional(),
      cronExpr: d,
      relativeDelayMinutes: t.number().int().positive().max(525600).optional(),
      prompt: d,
      model: t.string().optional(),
      provider: re.optional(),
      mode: Ut.optional(),
      thoughtLevel: d.optional(),
      targetTaskId: d.optional(),
      botDeliveryTarget: qd.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().optional(),
      intervalUnit: Dg.optional(),
      interval: t.number().int().min(1).max(200).optional(),
    })
    .strict()
    .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
      message: "intervalUnit and interval must be set together",
      path: ["interval"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.relativeDelayMinutes === void 0, {
      message: "intervalUnit cannot combine with a relative delayMinutes",
      path: ["intervalUnit"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
      message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
      path: ["recurring"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.maxRuns === void 0, {
      message: "intervalUnit is a recurring carrier and cannot combine with maxRuns",
      path: ["maxRuns"],
    }),
  BD = t.object({ automation: ou }).strict(),
  LD = t
    .object({
      automationId: d,
      title: d.optional(),
      cronExpr: d.optional(),
      prompt: d.optional(),
      recurring: t.boolean().optional(),
      maxRuns: t.number().int().positive().nullable().optional(),
      intervalUnit: Dg.optional(),
      interval: t.number().int().min(1).max(200).optional(),
    })
    .strict()
    .refine(
      (e) =>
        e.title !== void 0 ||
        e.cronExpr !== void 0 ||
        e.prompt !== void 0 ||
        e.recurring !== void 0 ||
        e.maxRuns !== void 0 ||
        e.intervalUnit !== void 0,
      { message: "automation update requires at least one field" },
    )
    .refine((e) => e.maxRuns !== null || e.recurring === !0, {
      message: "clearing maxRuns requires recurring=true",
      path: ["maxRuns"],
    })
    .refine((e) => e.recurring !== !0 || typeof e.maxRuns != "number", {
      message: "recurring=true cannot be combined with a numeric maxRuns",
      path: ["maxRuns"],
    })
    .refine((e) => (e.intervalUnit === void 0) == (e.interval === void 0), {
      message: "intervalUnit and interval must be set together",
      path: ["interval"],
    })
    .refine((e) => e.intervalUnit === void 0 || e.recurring !== !1, {
      message: "intervalUnit is a recurring carrier and cannot combine with recurring=false",
      path: ["recurring"],
    })
    .refine(
      (e) =>
        e.intervalUnit === void 0 ||
        e.maxRuns === void 0 ||
        (e.maxRuns === null && e.recurring === !0),
      {
        message:
          "intervalUnit is a recurring carrier and only allows maxRuns=null with recurring=true",
        path: ["maxRuns"],
      },
    ),
  WD = t.object({ automation: ou }).strict(),
  FD = t.object({}).strict(),
  qD = t.object({ automations: t.array(ou) }).strict(),
  VD = t.object({ targetTaskId: d }).strict(),
  GD = t.object({ bound: t.boolean() }).strict(),
  KD = t.object({ automationId: d }).strict(),
  HD = t.object({ deleted: t.boolean() }).strict(),
  Jd = {
    sessionCreate: "session/create",
    sessionResume: "session/resume",
    sessionList: "session/list",
    sessionSubagents: "session/subagents",
    sessionRequestRuntimePreferences: "session/requestRuntimePreferences",
    sessionRead: "session/read",
    sessionMessages: "session/messages",
    sessionEvents: "session/events",
    sessionSubscribe: "session/subscribe",
    sessionSend: "session/send",
    sessionStop: "session/stop",
    sessionCancelBackgroundTask: "session/cancelBackgroundTask",
    sessionFork: "session/fork",
    sessionCompact: "session/compact",
    sessionGoal: "session/goal",
    sessionClose: "session/close",
    sessionSetModel: "session/setModel",
    sessionSetThoughtLevel: "session/setThoughtLevel",
    sessionUpdateRuntimeModelConfig: "session/updateRuntimeModelConfig",
    sessionSetMode: "session/setMode",
    workspaceReadState: "workspace/readState",
    workspaceUpdateProviderRegistry: "workspace/updateProviderRegistry",
    workspaceUpdateInteractionPreferences: "workspace/updateInteractionPreferences",
    workspaceUpsertModelProvider: "workspace/upsertModelProvider",
    workspaceRemoveModelProvider: "workspace/removeModelProvider",
    workspaceSetDefaultModel: "workspace/setDefaultModel",
    workspaceSetDefaultThoughtLevel: "workspace/setDefaultThoughtLevel",
    workspaceSetDefaultMode: "workspace/setDefaultMode",
    workspaceGenerateText: "workspace/generateText",
    mcpList: "mcp/list",
    pluginsList: "plugins/list",
    pluginsReferenceCatalog: "plugins/referenceCatalog",
    pluginsSetEnabled: "plugins/setEnabled",
    pluginsOverview: "plugins/overview",
    pluginsMarketplaceAdd: "plugins/marketplace/add",
    pluginsMarketplaceRemove: "plugins/marketplace/remove",
    pluginsMarketplaceUpdate: "plugins/marketplace/update",
    pluginsInstall: "plugins/install",
    pluginsCancelOperation: "plugins/cancelOperation",
    pluginsUninstall: "plugins/uninstall",
    pluginsUpdate: "plugins/update",
    pluginsRestoreBuiltin: "plugins/restoreBuiltin",
    pluginsConfigure: "plugins/configure",
    pluginsValidate: "plugins/validate",
    pluginsDescribe: "plugins/describe",
    automationCreate: "automation/create",
    automationUpdate: "automation/update",
    automationCheckTaskBinding: "automation/checkTaskBinding",
    automationList: "automation/list",
    automationDelete: "automation/delete",
    usageStats: "usage/stats",
    sessionUsage: "session/usage",
    interactionRequestPermission: "interaction/requestPermission",
    interactionRequestUserInput: "interaction/requestUserInput",
    interactionRequestProviderRuntimeHeaders: "interaction/requestProviderRuntimeHeaders",
    interactionBrowserList: "interaction/browserList",
    interactionBrowserExecute: "interaction/browserExecute",
  },
  JD = t.object({}).strict(),
  YD = {
    [Jd.mcpList]: { params: HS, result: JS },
    [Jd.interactionBrowserList]: { params: F_, result: q_ },
    [Jd.interactionBrowserExecute]: { params: V_, result: G_ },
  };
var rU = 3,
  iU = t
    .object({ rowId: t.number().int().nonnegative(), entityId: t.string().trim().min(1) })
    .strict(),
  aU = t.number(),
  sU = t.enum(["text", "inputText", "output.text", "summaryText"]);
var wn = {
  maxFrameBytes: 1024 * 1024,
  logicalFrameAssemblyMaxBytes: 16 * 1024 * 1024,
  logicalFrameAssemblyMaxFragments: 1024,
  logicalFrameAssemblyMaxConcurrent: 32,
  logicalFrameAssemblyMaxStagedBytes: 32 * 1024 * 1024,
  logicalFrameAssemblyTimeoutMs: 3e4,
  transportEnvelopeIdMaxChars: 256,
  subscriberBufferMaxOps: 500,
  subscriberBufferMaxBytes: 1024 * 1024,
  eventRetentionPerSession: 2e3,
  snapshotTailWindowRows: 60,
  rowsRangeMaxLimit: 200,
  toolOutputFinalHeadBytes: 32 * 1024,
  toolOutputFinalTailBytes: 32 * 1024,
  goalVerificationsRetained: 20,
  pendingCommandsDisplayMax: 32,
  commandPendingTtlMs: 1440 * 60 * 1e3,
  idempotencyTablePerSession: 512,
  conversationQueryTimeoutMs: 1e4,
  attachmentMaxBytes: 20 * 1024 * 1024,
  attachmentChunkMaxBytes: 512 * 1024,
  attachmentReadCacheMaxBytes: 32 * 1024 * 1024,
  attachmentReadCacheTtlMs: 3e4,
  attachmentUploadMaxChunks: 64,
  attachmentUploadMaxConcurrent: 16,
  attachmentUploadMaxStagedBytes: 64 * 1024 * 1024,
  attachmentUploadTtlMs: 5 * 6e4,
  attachmentUnreferencedTtlMs: 1440 * 60 * 1e3,
};
var nx = t
  .string()
  .min(4)
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u);
function crc32WireBytes(e) {
  let o = 4294967295;
  for (let r of e) {
    o ^= r;
    for (let a = 0; a < 8; a += 1) o = (o >>> 1) ^ (o & 1 ? 3988292384 : 0);
  }
  return ((o ^ 4294967295) >>> 0).toString(16).padStart(8, "0");
}
c(crc32WireBytes, "crc32WireBytes");
var Le = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encodeWireBytesBase64(e) {
  let o = "",
    r = [];
  for (let a = 0; a < e.byteLength; a += 3) {
    let n = e[a] ?? 0,
      i = a + 1 < e.byteLength,
      s = a + 2 < e.byteLength,
      l = i ? (e[a + 1] ?? 0) : 0,
      p = s ? (e[a + 2] ?? 0) : 0;
    (r.push(
      Le[n >>> 2],
      Le[((n & 3) << 4) | (l >>> 4)],
      i ? Le[((l & 15) << 2) | (p >>> 6)] : "=",
      s ? Le[p & 63] : "=",
    ),
      r.length >= 16384 && ((o += r.join("")), (r = [])));
  }
  return o + r.join("");
}
c(encodeWireBytesBase64, "encodeWireBytesBase64");
function decodeWireBase64(e) {
  if (!nx.safeParse(e).success) return null;
  let o = e.endsWith("==") ? 2 : e.endsWith("=") ? 1 : 0,
    r = new Uint8Array((e.length / 4) * 3 - o),
    a = 0;
  for (let n = 0; n < e.length; n += 4) {
    let i = Le.indexOf(e[n]),
      s = Le.indexOf(e[n + 1]),
      l = e[n + 2] === "=" ? 0 : Le.indexOf(e[n + 2]),
      p = e[n + 3] === "=" ? 0 : Le.indexOf(e[n + 3]);
    if (i < 0 || s < 0 || l < 0 || p < 0) return null;
    let u = (i << 18) | (s << 12) | (l << 6) | p;
    (a < r.length && (r[a++] = u >>> 16),
      a < r.length && (r[a++] = (u >>> 8) & 255),
      a < r.length && (r[a++] = u & 255));
  }
  return r;
}
c(decodeWireBase64, "decodeWireBase64");
var ae = {
    maxPhysicalFrameBytes: wn.maxFrameBytes,
    maxMessageBytes: 16 * 1024 * 1024,
    maxFragments: 64,
    assemblyTimeoutMs: 3e4,
    transportIdMaxChars: wn.transportEnvelopeIdMaxChars,
  },
  au = t.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  En = t.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  Zt = t
    .string()
    .min(1)
    .max(ae.transportIdMaxChars)
    .regex(/^[A-Za-z0-9._~-]+$/u),
  ox = t
    .object({ bridgeSessionId: Zt, bridgeGeneration: En.optional(), recoveryId: Zt.optional() })
    .strict(),
  rx = t
    .object({ algorithm: t.literal("crc32"), value: t.string().regex(/^[0-9a-f]{8}$/u) })
    .strict();
function isCanonicalBase64(e) {
  if (e.length < 4 || e.length > ae.maxPhysicalFrameBytes) return !1;
  let o = decodeWireBase64(e);
  return o !== null && o.byteLength > 0 && encodeWireBytesBase64(o) === e;
}
c(isCanonicalBase64, "isCanonicalBase64");
var On = t
    .object({
      zcode_type: t.literal("rpc-frame"),
      bridgeSessionId: Zt,
      bridgeGeneration: En.optional(),
      recoveryId: Zt.optional(),
      seq: au,
      messageSeq: au,
      fragmentIndex: t
        .number()
        .int()
        .nonnegative()
        .max(ae.maxFragments - 1),
      fragmentCount: t.number().int().positive().max(ae.maxFragments),
      messageBytes: t.number().int().positive().max(ae.maxMessageBytes),
      checksum: rx,
      dataBase64: t.string().min(4).max(ae.maxPhysicalFrameBytes).refine(isCanonicalBase64),
    })
    .strict()
    .superRefine((e, o) => {
      (e.fragmentIndex >= e.fragmentCount &&
        o.addIssue({
          code: "custom",
          path: ["fragmentIndex"],
          message: "fragmentIndex must be smaller than fragmentCount",
        }),
        e.fragmentCount > e.messageBytes &&
          o.addIssue({
            code: "custom",
            path: ["fragmentCount"],
            message: "non-empty fragments cannot exceed message bytes",
          }));
    }),
  su = t
    .object({
      zcode_type: t.literal("rpc-frame-ack"),
      bridgeSessionId: Zt,
      bridgeGeneration: En.optional(),
      recoveryId: Zt.optional(),
      ackMessageSeq: au,
    })
    .strict(),
  jg = t.union([On, su]),
  vU = t
    .object({
      type: t.literal("data"),
      payload: jg,
      client_ts: En.optional(),
      server_ts: En.optional(),
    })
    .strict();
function utf8Bytes(e) {
  return new TextEncoder().encode(e).byteLength;
}
c(utf8Bytes, "utf8Bytes");
function relayEnvelopeFor(e, o = {}) {
  let r = o.clientTimestamp === void 0 ? Number.MAX_SAFE_INTEGER : o.clientTimestamp,
    a = o.serverTimestamp === void 0 ? Number.MAX_SAFE_INTEGER : o.serverTimestamp;
  return {
    type: "data",
    payload: e,
    ...(r === null ? {} : { client_ts: r }),
    ...(a === null ? {} : { server_ts: a }),
  };
}
c(relayEnvelopeFor, "relayEnvelopeFor");
function measureWebRemoteControlRpcRelayEnvelopeBytes(e, o) {
  return utf8Bytes(JSON.stringify(relayEnvelopeFor(e, o)));
}
c(measureWebRemoteControlRpcRelayEnvelopeBytes, "measureWebRemoteControlRpcRelayEnvelopeBytes");
function boundedPositive(e, o, r) {
  let a = e ?? o;
  if (!Number.isSafeInteger(a) || a <= 0) throw new ge(r);
  return Math.min(a, o);
}
c(boundedPositive, "boundedPositive");
function parseWebRemoteControlRpcTransportPayload(e) {
  let o = jg.safeParse(e);
  return o.success ? o.data : null;
}
c(parseWebRemoteControlRpcTransportPayload, "parseWebRemoteControlRpcTransportPayload");
var ge = class extends Error {
  constructor(r) {
    super(r);
    this.reasonCode = r;
    this.name = "WebRemoteControlRpcTransportEncodingError";
  }
  reasonCode;
  static {
    c(this, "WebRemoteControlRpcTransportEncodingError");
  }
};
function identityFrom(e) {
  let o = ox.safeParse({
    bridgeSessionId: e.bridgeSessionId,
    ...(e.bridgeGeneration === void 0 ? {} : { bridgeGeneration: e.bridgeGeneration }),
    ...(e.recoveryId === void 0 ? {} : { recoveryId: e.recoveryId }),
  });
  if (!o.success) throw new ge("remote.rpcFrame.invalidIdentity");
  return o.data;
}
c(identityFrom, "identityFrom");
function assertPositiveSafe(e, o) {
  if (!Number.isSafeInteger(e) || e <= 0) throw new ge(o);
}
c(assertPositiveSafe, "assertPositiveSafe");
function base64Length(e) {
  return 4 * Math.ceil(e / 3);
}
c(base64Length, "base64Length");
function frameShell(e) {
  return {
    zcode_type: "rpc-frame",
    ...e.identity,
    seq: e.seq,
    messageSeq: e.messageSeq,
    fragmentIndex: e.fragmentIndex,
    fragmentCount: e.fragmentCount,
    messageBytes: e.messageBytes,
    checksum: e.checksum,
    dataBase64: e.dataBase64,
  };
}
c(frameShell, "frameShell");
function findDecodedBudget(e) {
  let o = frameShell({
      identity: e.identity,
      seq: e.endSeq,
      messageSeq: e.messageSeq,
      fragmentIndex: e.fragmentCount - 1,
      fragmentCount: e.fragmentCount,
      messageBytes: e.messageBytes,
      checksum: e.checksum,
      dataBase64: "",
    }),
    r = measureWebRemoteControlRpcRelayEnvelopeBytes(o),
    a = 0,
    n = e.messageBytes;
  for (; a < n;) {
    let i = Math.ceil((a + n) / 2);
    r + base64Length(i) <= e.maxPhysicalFrameBytes ? (a = i) : (n = i - 1);
  }
  return a;
}
c(findDecodedBudget, "findDecodedBudget");
function encodeWebRemoteControlRpcTransportMessage(e, o) {
  let r = identityFrom(o);
  (assertPositiveSafe(o.firstPhysicalSeq, "remote.rpcFrame.invalidPhysicalSeq"),
    assertPositiveSafe(o.messageSeq, "remote.rpcFrame.invalidMessageSeq"));
  let a = boundedPositive(
      o.maxPhysicalFrameBytes,
      ae.maxPhysicalFrameBytes,
      "remote.rpcFrame.invalidPhysicalLimit",
    ),
    n = boundedPositive(o.maxMessageBytes, ae.maxMessageBytes, "remote.rpcFrame.invalidMessageLimit"),
    i = boundedPositive(o.maxFragments, ae.maxFragments, "remote.rpcFrame.invalidFragmentLimit");
  if (e.byteLength === 0) throw new ge("remote.rpcFrame.emptyMessage");
  if (e.byteLength > n) throw new ge("remote.rpcFrame.messageTooLarge");
  let s = Object.freeze({ algorithm: "crc32", value: crc32WireBytes(e) }),
    l = 1,
    p = 0;
  for (;;) {
    let h = o.firstPhysicalSeq + l - 1;
    if (!Number.isSafeInteger(h) || h > Number.MAX_SAFE_INTEGER)
      throw new ge("remote.rpcFrame.sequenceOverflow");
    if (
      ((p = findDecodedBudget({
        identity: r,
        endSeq: h,
        messageSeq: o.messageSeq,
        fragmentCount: l,
        messageBytes: e.byteLength,
        checksum: s,
        maxPhysicalFrameBytes: a,
      })),
      p < 1)
    )
      throw new ge("remote.rpcFrame.envelopeTooLarge");
    let b = Math.ceil(e.byteLength / p);
    if (b > i) throw new ge("remote.rpcFrame.fragmentLimitExceeded");
    if (b <= l) break;
    l = b;
  }
  let u = [];
  for (let h = 0; h < l; h += 1) {
    let b = h * p,
      S = Math.min(e.byteLength, b + p),
      _ = frameShell({
        identity: r,
        seq: o.firstPhysicalSeq + h,
        messageSeq: o.messageSeq,
        fragmentIndex: h,
        fragmentCount: l,
        messageBytes: e.byteLength,
        checksum: s,
        dataBase64: encodeWireBytesBase64(e.subarray(b, S)),
      });
    if (measureWebRemoteControlRpcRelayEnvelopeBytes(_) > a || !On.safeParse(_).success)
      throw new ge("remote.rpcFrame.internalEnvelopeError");
    u.push(Object.freeze(_));
  }
  return Object.freeze(u);
}
c(encodeWebRemoteControlRpcTransportMessage, "encodeWebRemoteControlRpcTransportMessage");
function sameIdentity(e, o) {
  return (
    o.bridgeSessionId === e.bridgeSessionId &&
    o.bridgeGeneration === e.bridgeGeneration &&
    o.recoveryId === e.recoveryId
  );
}
c(sameIdentity, "sameIdentity");
function hasRawIdentityMismatch(e, o) {
  if (typeof o != "object" || o === null) return !1;
  let r = o;
  return ["bridgeSessionId", "bridgeGeneration", "recoveryId"].some((n) => n in r)
    ? r.bridgeSessionId !== e.bridgeSessionId ||
        r.bridgeGeneration !== e.bridgeGeneration ||
        r.recoveryId !== e.recoveryId
    : !1;
}
c(hasRawIdentityMismatch, "hasRawIdentityMismatch");
function frameFingerprint(e, o) {
  return {
    messageSeq: e.messageSeq,
    value: JSON.stringify([
      e.bridgeSessionId,
      e.bridgeGeneration ?? null,
      e.recoveryId ?? null,
      e.seq,
      e.messageSeq,
      e.fragmentIndex,
      e.fragmentCount,
      e.messageBytes,
      e.checksum.algorithm,
      e.checksum.value,
      o.byteLength,
      crc32WireBytes(o),
    ]),
  };
}
c(frameFingerprint, "frameFingerprint");
function sameFingerprint(e, o) {
  return e.value === o.value;
}
c(sameFingerprint, "sameFingerprint");
var Ng = class {
  static {
    c(this, "WebRemoteControlRpcTransportAssembler");
  }
  identity;
  maxPhysicalFrameBytes;
  maxMessageBytes;
  maxFragments;
  timeoutMs;
  now;
  expectedPhysicalSeq;
  expectedMessageSeq;
  lastCompletedMessageSeq;
  physicalSequenceExhausted = !1;
  messageSequenceExhausted = !1;
  settledFrameFingerprintsBySeq = new Map();
  active = null;
  terminalReason = null;
  constructor(o) {
    ((this.identity = identityFrom(o.identity)),
      (this.expectedPhysicalSeq = o.initialPhysicalSeq ?? 1),
      (this.expectedMessageSeq = o.initialMessageSeq ?? 1),
      assertPositiveSafe(this.expectedPhysicalSeq, "remote.rpcFrame.invalidPhysicalSeq"),
      assertPositiveSafe(this.expectedMessageSeq, "remote.rpcFrame.invalidMessageSeq"),
      (this.lastCompletedMessageSeq = this.expectedMessageSeq - 1),
      (this.maxPhysicalFrameBytes = boundedPositive(
        o.maxPhysicalFrameBytes,
        ae.maxPhysicalFrameBytes,
        "remote.rpcFrame.invalidPhysicalLimit",
      )),
      (this.maxMessageBytes = boundedPositive(
        o.maxMessageBytes,
        ae.maxMessageBytes,
        "remote.rpcFrame.invalidMessageLimit",
      )),
      (this.maxFragments = boundedPositive(
        o.maxFragments,
        ae.maxFragments,
        "remote.rpcFrame.invalidFragmentLimit",
      )),
      (this.timeoutMs = boundedPositive(o.timeoutMs, ae.assemblyTimeoutMs, "remote.rpcFrame.invalidTimeout")),
      (this.now = o.now ?? Date.now));
  }
  get nextExpiryAt() {
    return this.active ? this.active.firstSeenAt + this.timeoutMs : null;
  }
  fault(o, r, a) {
    return (
      r && ((this.terminalReason = o), (this.active = null)),
      {
        kind: "fault",
        fault: {
          reasonCode: o,
          terminal: r,
          ...(typeof a?.seq == "number" ? { seq: a.seq } : {}),
          ...(typeof a?.messageSeq == "number" ? { messageSeq: a.messageSeq } : {}),
          expectedSeq: this.expectedPhysicalSeq,
          expectedMessageSeq: this.expectedMessageSeq,
        },
      }
    );
  }
  expire(o = this.now()) {
    return !this.active || o - this.active.firstSeenAt < this.timeoutMs
      ? null
      : this.fault("remote.rpcFrame.assemblyTimeout", !0, { messageSeq: this.active.messageSeq });
  }
  accept(o, r = this.now()) {
    if (hasRawIdentityMismatch(this.identity, o)) return this.fault("remote.rpcFrame.identityMismatch", !1);
    if (this.terminalReason) return this.fault(this.terminalReason, !0);
    let a = this.expire(r);
    if (a) return a;
    let n = typeof o == "object" && o !== null && "dataBase64" in o ? o.dataBase64 : void 0;
    if (typeof n == "string" && (n.length > this.maxPhysicalFrameBytes || !isCanonicalBase64(n)))
      return this.fault("remote.rpcFrame.invalidBase64", !0);
    let i = On.safeParse(o);
    if (!i.success) return this.fault("remote.rpcFrame.invalidMetadata", !0);
    let s = i.data;
    if (!sameIdentity(this.identity, s)) return this.fault("remote.rpcFrame.identityMismatch", !1, s);
    if (s.messageBytes > this.maxMessageBytes)
      return this.fault("remote.rpcFrame.messageTooLarge", !0, s);
    if (s.fragmentCount > this.maxFragments)
      return this.fault("remote.rpcFrame.fragmentLimitExceeded", !0, s);
    if (measureWebRemoteControlRpcRelayEnvelopeBytes(s) > this.maxPhysicalFrameBytes)
      return this.fault("remote.rpcFrame.envelopeTooLarge", !0, s);
    let l = decodeWireBase64(s.dataBase64);
    if (!l || l.byteLength === 0) return this.fault("remote.rpcFrame.invalidBase64", !0, s);
    let p = frameFingerprint(s, l),
      u = this.active?.frameFingerprintsBySeq.get(s.seq);
    if (u)
      return sameFingerprint(u, p)
        ? {
            kind: "duplicate",
            ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null,
          }
        : this.fault("remote.rpcFrame.conflictingDuplicate", !0, s);
    let h = this.settledFrameFingerprintsBySeq.get(s.seq);
    if (h)
      return sameFingerprint(h, p)
        ? {
            kind: "duplicate",
            ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null,
          }
        : this.physicalSequenceExhausted && s.messageSeq !== h.messageSeq
          ? this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, s)
          : this.fault("remote.rpcFrame.conflictingDuplicate", !0, s);
    if (s.seq < this.expectedPhysicalSeq)
      return {
        kind: "duplicate",
        ackMessageSeq: this.lastCompletedMessageSeq > 0 ? this.lastCompletedMessageSeq : null,
      };
    if (this.physicalSequenceExhausted)
      return this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, s);
    if (this.messageSequenceExhausted && !this.active)
      return this.fault("remote.rpcFrame.messageSequenceExhausted", !0, s);
    if (s.seq > this.expectedPhysicalSeq) return this.fault("remote.rpcFrame.physicalGap", !0, s);
    if (s.messageSeq !== this.expectedMessageSeq)
      return this.fault("remote.rpcFrame.messageGap", !0, s);
    if (s.seq === Number.MAX_SAFE_INTEGER && s.fragmentIndex + 1 < s.fragmentCount)
      return this.fault("remote.rpcFrame.physicalSequenceExhausted", !0, s);
    let b = this.active?.fragments.length ?? 0;
    if (s.fragmentIndex !== b) return this.fault("remote.rpcFrame.fragmentGap", !0, s);
    if (
      this.active &&
      (s.fragmentCount !== this.active.fragmentCount || s.messageBytes !== this.active.messageBytes)
    )
      return this.fault("remote.rpcFrame.metadataMismatch", !0, s);
    if (this.active && s.checksum.value !== this.active.checksum.value)
      return this.fault("remote.rpcFrame.checksumMismatch", !0, s);
    if (
      (this.active ||
        (this.active = {
          messageSeq: s.messageSeq,
          fragmentCount: s.fragmentCount,
          messageBytes: s.messageBytes,
          checksum: s.checksum,
          firstSeenAt: r,
          stagedBytes: 0,
          fragments: [],
          frameFingerprintsBySeq: new Map(),
        }),
      this.active.stagedBytes + l.byteLength > this.active.messageBytes)
    )
      return this.fault("remote.rpcFrame.lengthMismatch", !0, s);
    if (
      (this.active.fragments.push(l),
      this.active.frameFingerprintsBySeq.set(s.seq, p),
      (this.active.stagedBytes += l.byteLength),
      s.seq === Number.MAX_SAFE_INTEGER
        ? (this.physicalSequenceExhausted = !0)
        : (this.expectedPhysicalSeq += 1),
      this.active.fragments.length < this.active.fragmentCount)
    )
      return {
        kind: "incomplete",
        messageSeq: s.messageSeq,
        receivedFragments: this.active.fragments.length,
      };
    if (this.active.stagedBytes !== this.active.messageBytes)
      return this.fault("remote.rpcFrame.lengthMismatch", !0, s);
    let S = new Uint8Array(this.active.messageBytes),
      _ = 0;
    for (let xe of this.active.fragments) (S.set(xe, _), (_ += xe.byteLength));
    if (crc32WireBytes(S) !== this.active.checksum.value)
      return this.fault("remote.rpcFrame.checksumMismatch", !0, s);
    let z = this.active,
      $ = z.messageSeq;
    return (
      (this.settledFrameFingerprintsBySeq = new Map(z.frameFingerprintsBySeq)),
      (this.active = null),
      (this.lastCompletedMessageSeq = $),
      $ === Number.MAX_SAFE_INTEGER
        ? (this.messageSequenceExhausted = !0)
        : (this.expectedMessageSeq += 1),
      { kind: "complete", messageSeq: $, bytes: S }
    );
  }
};
var P = t.string().trim().min(1),
  px = [
    "default",
    "yolo",
    "plan",
    "edit",
    "acceptEdits",
    "auto",
    "dontAsk",
    "bypassPermissions",
    "autoEdit",
    "build",
  ],
  mx = ["claude", "opencode", "gemini", "codex", "glm"],
  gx = ["claudeCode"],
  fx = t
    .object({
      fileCount: t.number().int().nonnegative(),
      added: t.number().int().nonnegative(),
      removed: t.number().int().nonnegative(),
      files: t.array(
        t
          .object({
            path: t.string(),
            added: t.number().int().nonnegative(),
            removed: t.number().int().nonnegative(),
            writeCount: t.number().int().positive(),
            lastTurnIndex: t.number().int().nonnegative(),
          })
          .strict(),
      ),
    })
    .strict(),
  hx = t.object({
    taskId: P,
    traceId: P,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: P,
    workspaceIdentity: P.optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: t.enum(px),
    model: t.string().optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: t.enum(mx).optional(),
    migrationSource: t.enum(gx).optional(),
    forkedFromTaskId: P.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: t.enum(["running", "completed", "error"]).optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        message: t.string().min(1),
        traceId: P.optional(),
        taskId: P.optional(),
      })
      .optional(),
    changeSummary: fx.optional(),
  });
function resolveWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
c(resolveWorkspaceKey, "resolveWorkspaceKey");
var bx = t.enum([
    "task_created",
    "user_message_saved",
    "assistant_message_saved",
    "task_status_changed",
    "task_meta_changed",
    "task_model_changed",
    "task_title_changed",
    "task_pinned",
    "task_unpinned",
    "task_archived",
    "task_unarchived",
    "task_deleted",
    "stream_mirror_gap",
    "stream_mirror_owner_lost",
  ]),
  lu = t.enum(["observer", "relay_owner"]),
  An = t.enum(["desktop_window", "relay_bridge"]),
  Wg = t
    .object({
      eventId: P,
      workspacePath: P,
      workspaceIdentity: P.optional(),
      workspaceKey: P,
      traceId: P,
      createdAt: t.number().int().nonnegative(),
    })
    .strict(),
  vx = t.object({ runId: P, opSeq: t.number().int().nonnegative() }).strict(),
  Fg = Wg.extend({ reason: bx, streamWatermark: vx.optional() }).strict(),
  jt = c((e, o) => {
    let r = resolveWorkspaceKey(o);
    o.workspaceKey !== r &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["workspaceKey"],
        message: "workspaceKey must match workspaceIdentity fallback rule",
      });
  }, "addWorkspaceKeyIssue"),
  Er = c((e, o) => {
    o.runId !== o.traceId &&
      e.addIssue({
        code: t.ZodIssueCode.custom,
        path: ["runId"],
        message: "runId must match traceId",
      });
  }, "addRunIdTraceIdIssue"),
  qg = Fg.extend({ type: t.literal("task_snapshot_invalidated"), taskId: P }).strict(),
  Vg = Fg.extend({
    type: t.literal("workspace_task_list_invalidated"),
    taskId: P.optional(),
    taskMeta: hx.optional(),
  }).strict(),
  Gg = t.discriminatedUnion("kind", [
    t
      .object({
        kind: t.literal("image"),
        filename: t.string(),
        mimeType: t.string(),
        sizeBytes: t.number().int().nonnegative().optional(),
        dataBase64: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
    t
      .object({
        kind: t.literal("audio"),
        filename: t.string(),
        mimeType: t.string(),
        dataBase64: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
    t
      .object({
        kind: t.literal("file"),
        filename: t.string(),
        mimeType: t.string(),
        sizeBytes: t.number().int().nonnegative(),
        dataBase64: t.string().optional(),
        textContent: t.string().optional(),
        localPath: t.string().optional(),
      })
      .strict(),
  ]),
  Sx = t.object({ type: P, taskId: P, traceId: P }).passthrough(),
  Kg = t
    .object({
      kind: t.literal("user_message"),
      messageId: P,
      content: t.string(),
      attachments: t.array(Gg).optional(),
      timestamp: t.number().finite(),
    })
    .strict(),
  Hg = t.object({ kind: t.literal("stream_event"), event: Sx }).strict(),
  Jg = t.discriminatedUnion("kind", [Kg, Hg]),
  _x = t.discriminatedUnion("kind", [
    Kg.extend({ seq: t.number().int().positive() }).strict(),
    Hg.extend({ seq: t.number().int().positive() }).strict(),
  ]),
  Yg = t
    .object({
      workspacePath: P,
      workspaceIdentity: P.optional(),
      workspaceKey: P,
      taskId: P,
      runId: P,
      traceId: P,
      ownerClientId: P.optional(),
      ownerDeviceLabel: P.optional(),
    })
    .strict(),
  du = Yg.superRefine((e, o) => {
    (jt(o, e), Er(o, e));
  }),
  Xg = Wg.extend({
    type: t.literal("task_stream_mirror_batch"),
    taskId: P,
    runId: P,
    ownerClientId: P.optional(),
    ownerDeviceLabel: P.optional(),
    batchSeq: t.number().int().positive(),
    fromSeq: t.number().int().positive(),
    toSeq: t.number().int().positive(),
    ops: t.array(_x),
    terminal: t.boolean(),
  }).strict(),
  Qg = du,
  ef = Yg.extend({ leaseRequestId: P })
    .strict()
    .superRefine((e, o) => {
      (jt(o, e), Er(o, e));
    }),
  tf = t.discriminatedUnion("acquired", [
    t.object({ leaseRequestId: P, acquired: t.literal(!0), ownerHostId: P }).strict(),
    t
      .object({
        leaseRequestId: P,
        acquired: t.literal(!1),
        ownerHostId: P,
        reason: t.literal("owned_by_other_host"),
      })
      .strict(),
  ]),
  Bt = t
    .object({
      commandRequestId: P,
      workspacePath: P,
      workspaceIdentity: P.optional(),
      workspaceKey: P,
      taskId: P,
      runId: P,
    })
    .strict(),
  nf = Bt.extend({ type: t.literal("stop_generation") }).strict(),
  of = Bt.extend({
    type: t.literal("respond_permission"),
    permissionRequestId: P,
    optionId: P,
    response: Dt,
  }).strict(),
  rf = Bt.extend({
    type: t.literal("respond_elicitation"),
    elicitationRequestId: P,
    action: t.enum(["accept", "decline", "cancel"]),
    content: t.record(t.string(), t.unknown()).optional(),
  }).strict(),
  xx = t
    .object({
      commandId: P,
      taskId: P,
      traceId: P,
      workspacePath: P,
      workspaceIdentity: P.optional(),
      workspaceKey: P,
      status: t.enum(["accepted", "running", "failed"]),
      createdAt: t.number().int().nonnegative(),
      updatedAt: t.number().int().nonnegative(),
      clientId: P.optional(),
      clientLabel: P.optional(),
      error: t.string().optional(),
    })
    .strict(),
  af = t.discriminatedUnion("type", [
    xx
      .extend({
        type: t.literal("send_prompt"),
        content: t.string(),
        attachments: t.array(Gg).optional(),
        automationId: P.optional(),
      })
      .strict(),
  ]),
  sf = Bt.extend({ type: t.literal("enqueue_task_command"), taskCommand: af }).strict(),
  cf = Bt.extend({
    type: t.literal("promote_task_command"),
    commandId: P,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  lf = Bt.extend({
    type: t.literal("cancel_task_command"),
    commandId: P,
    clientMode: t.literal("web-remote-replayable"),
  }).strict(),
  df = t.discriminatedUnion("type", [nf, of, rf, sf, cf, lf]).superRefine((e, o) => {
    jt(o, e);
  }),
  uf = t
    .discriminatedUnion("type", [
      nf.extend({ requesterHostId: P }).strict(),
      of.extend({ requesterHostId: P }).strict(),
      rf.extend({ requesterHostId: P }).strict(),
      sf.extend({ requesterHostId: P }).strict(),
      cf.extend({ requesterHostId: P }).strict(),
      lf.extend({ requesterHostId: P }).strict(),
    ])
    .superRefine((e, o) => {
      jt(o, e);
    }),
  kx = t.enum(["NO_ACTIVE_TASK_OWNER", "STALE_TASK_OWNER_COMMAND", "OWNER_COMMAND_FAILED"]),
  uu = t.discriminatedUnion("success", [
    t.object({ commandRequestId: P, success: t.literal(!0), taskCommand: af.optional() }).strict(),
    t
      .object({
        commandRequestId: P,
        success: t.literal(!1),
        error: t.string(),
        code: kx.optional(),
      })
      .strict(),
  ]),
  pf = t.discriminatedUnion("type", [qg, Vg, Xg]).superRefine((e, o) => {
    (jt(o, e), e.type === "task_stream_mirror_batch" && Er(o, e));
  }),
  mf = t
    .discriminatedUnion("type", [
      qg.extend({ originHostId: P, deliveryPurpose: lu.optional() }).strict(),
      Vg.extend({ originHostId: P, deliveryPurpose: lu.optional() }).strict(),
      Xg.extend({ originHostId: P, deliveryPurpose: lu.optional() }).strict(),
    ])
    .superRefine((e, o) => {
      (jt(o, e), e.type === "task_stream_mirror_batch" && Er(o, e));
    });
function formatZodError(e) {
  return e.issues
    .map((o) => `${o.path.length > 0 ? o.path.join(".") : "<root>"}: ${o.message}`)
    .join("; ");
}
c(formatZodError, "formatZodError");
var y = t.string().trim().min(1),
  GU = t.array(t.string()),
  se = y.max(wn.transportEnvelopeIdMaxChars).regex(/^[A-Za-z0-9._~-]+$/u),
  Ix = t.object({
    workspacePath: y,
    workspaceIdentity: y.optional(),
    remoteSessionId: y.optional(),
    label: y,
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    kind: t.enum(["local", "remote"]),
    connectionState: t.enum(["connected", "disconnected", "reconnecting"]).optional(),
    lastConnectionError: t.string().optional(),
  }),
  ff = t.array(Ix),
  KU = t.object({ requestId: y, workspaceKey: y }),
  HU = t.union([
    t.object({ requestId: y, workspaceKey: y, success: t.literal(!0) }),
    t.object({ requestId: y, workspaceKey: y, success: t.literal(!1), error: t.string() }),
  ]),
  Cx = t.object({
    taskId: y,
    title: t.string(),
    workspacePath: y,
    workspaceIdentity: y.optional(),
    remoteSessionId: y.optional(),
    workspaceLabel: y,
    workspaceKind: t.enum(["local", "remote"]),
    createdAt: t.number().finite(),
    updatedAt: t.number().finite(),
    provider: re.optional(),
    unreadAt: t.number().finite().optional(),
    displayStatus: t.enum(["idle", "running", "completed", "error"]).optional(),
    pinned: t.boolean().optional(),
    archived: t.boolean().optional(),
  }),
  hf = t.array(Cx),
  pu = t.enum([
    "session-not-found",
    "session-expired",
    "session-conflict",
    "workspace-closed",
    "desktop-disconnected",
    "invalid-mobile-connection",
    "desktop-bootstrap-timeout",
    "connection-recovery-timeout",
    "relay-unavailable",
    "unsupported-action",
    "unexpected-error",
  ]),
  Rx = t.discriminatedUnion("kind", [
    t.object({
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      kind: t.literal("local"),
      workspaceKey: y,
      workspacePath: y,
      initialTaskId: y.optional(),
    }),
    t.object({
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      kind: t.literal("remote"),
      workspaceKey: y,
      workspacePath: y,
      workspaceIdentity: y,
      remoteSessionId: y,
      initialTaskId: y.optional(),
    }),
  ]),
  gu = t.object({
    activeWorkspaceKey: y.optional(),
    activeTaskId: y.optional(),
    updatedAt: t.number().finite(),
  }),
  Px = t.object({
    platform: y,
    version: y,
    name: y,
    userAgent: t.string().optional(),
    language: t.string().optional(),
    languages: t.array(t.string()).optional(),
    browserPlatform: t.string().optional(),
    viewport: t
      .object({
        width: t.number().finite(),
        height: t.number().finite(),
        devicePixelRatio: t.number().finite(),
      })
      .optional(),
    screen: t.object({ width: t.number().finite(), height: t.number().finite() }).optional(),
    timezone: t.string().optional(),
    online: t.boolean().optional(),
    updatedAt: t.number().finite(),
  }),
  Tx = t.object({
    windowControlSessionId: y,
    workspaces: ff,
    tasks: hf,
    initialViewState: gu.optional(),
    mobileViewState: gu.optional(),
  }),
  gf = t.object({
    workspaces: ff,
    tasks: hf.optional(),
    activeWorkspaceKey: y.optional(),
    activeTaskId: y.optional(),
  }),
  mu = t.enum([
    "isDockerAvailable",
    "listWSLDistros",
    "listDockerContainers",
    "listSSHConfigAliases",
    "loadMcpFromUserDirectory",
    "saveMcpToUserDirectory",
    "migrateLegacyCommonMcp",
  ]),
  wx = [
    t.object({ zcode_type: t.literal("bootstrap-request"), requestId: y }),
    t.object({
      zcode_type: t.literal("bootstrap-response"),
      requestId: y,
      success: t.literal(!0),
      result: Tx,
    }),
    t.object({ zcode_type: t.literal("workspace-list-request"), requestId: y }),
    t.object({
      zcode_type: t.literal("workspace-list-response"),
      requestId: y,
      success: t.literal(!0),
      result: gf,
    }),
    t.object({ zcode_type: t.literal("workspace-list-updated"), result: gf }),
    t.object({
      zcode_type: t.literal("workspace-bridge-open"),
      requestId: y,
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      workspaceKey: y,
      taskId: y.optional(),
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-ready"),
      requestId: y,
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      bridge: Rx,
    }),
    t.object({
      zcode_type: t.literal("workspace-bridge-error"),
      requestId: y,
      bridgeSessionId: se.optional(),
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      reason: pu,
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-request"),
      requestId: y,
      workspaceKey: y,
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: y,
      workspaceKey: y,
      success: t.literal(!0),
    }),
    t.object({
      zcode_type: t.literal("workspace-reconnect-response"),
      requestId: y,
      workspaceKey: y,
      success: t.literal(!1),
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("mobile-view-state-update"),
      viewState: gu,
      deviceInfo: Px.optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-request"),
      requestId: y,
      method: mu,
      args: t.unknown().optional(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: y,
      method: mu,
      success: t.literal(!0),
      result: t.unknown(),
    }),
    t.object({
      zcode_type: t.literal("platform-response"),
      requestId: y,
      method: mu,
      success: t.literal(!1),
      error: t.string(),
    }),
    On,
    su,
    t.object({
      zcode_type: t.literal("bridge-degraded"),
      bridgeSessionId: se,
      bridgeGeneration: t.number().int().nonnegative().optional(),
      recoveryId: se.optional(),
      reason: t.enum(["rpc-transport-fault", "rpc-frame-gap", "buffer-overflow", "buffer-timeout"]),
      seq: t.number().int().nonnegative().optional(),
      expectedSeq: t.number().int().nonnegative().optional(),
      droppedCount: t.number().int().nonnegative().optional(),
    }),
    t.object({
      zcode_type: t.literal("app-error"),
      requestId: y.optional(),
      bridgeSessionId: se.optional(),
      reason: pu,
      error: t.string(),
    }),
    t.object({
      zcode_type: t.literal("mobile-diagnostic"),
      event: t.enum([
        "state-transition",
        "socket-close",
        "socket-error",
        "recover-start",
        "recover-scheduled",
        "pair-status",
        "failure",
      ]),
      timestamp: t.number().int().nonnegative(),
      state: t.string().optional(),
      previousState: t.string().optional(),
      pairStatus: t.enum(["waiting", "matched"]).optional(),
      closeCode: t.number().int().optional(),
      closeReason: t.string().optional(),
      wasClean: t.boolean().optional(),
      wasPaired: t.boolean().optional(),
      failureReason: pu.optional(),
      failureMessage: t.string().optional(),
      visibilityState: t.string().optional(),
      online: t.boolean().optional(),
      hiddenDurationMs: t.number().int().nonnegative().optional(),
    }),
  ],
  Ex = t.union(wx);
function parseWebRemoteControlAppPayload(e) {
  let o = Ex.safeParse(e);
  return o.success ? o.data : null;
}
c(parseWebRemoteControlAppPayload, "parseWebRemoteControlAppPayload");
var YU = t.record(t.string(), t.string()),
  XU = y,
  QU = t.string(),
  yf = t.object({
    kind: t.literal("ssh"),
    host: y,
    port: t.number().int().positive().max(65535).optional(),
    username: y,
    sshConfigAlias: y.optional(),
    password: t.string().optional(),
    privateKeyPath: t.string().optional(),
    privateKeyPassphrase: t.string().optional(),
    assetInstallMode: t.enum(xr).optional(),
    resourcePackages: t
      .object({ selectedPackageIds: t.array(t.string().refine(isKnownRemoteResourcePackageId)).optional() })
      .optional(),
  }),
  bf = t.object({ kind: t.literal("wsl"), distro: t.string().optional(), user: Pn.optional() }),
  Ox = t.object({ kind: t.literal("docker"), container: y }),
  Ax = t.object({
    kind: t.literal("server"),
    url: t.string().url(),
    name: y.optional(),
    token: t.string().optional(),
    workspacePath: t.string().optional(),
    serverId: y.optional(),
  }),
  zn = t.discriminatedUnion("kind", [yf, bf, Ox, Ax]),
  eN = t.object({
    type: t.literal("zcode-hello"),
    version: t.string(),
    platform: t.string(),
    arch: t.string(),
    pid: t.number().int(),
  }),
  tN = t.object({ type: t.literal("zcode-hello-ack"), version: t.string(), clientId: y }),
  nN = t.object({ level: t.enum(["info", "warn", "error"]), args: t.array(t.unknown()) }),
  oN = t.object({
    taskId: y,
    status: t.enum([
      "completed",
      "failed",
      "permission_request",
      "elicitation_request",
      "feedback_update",
    ]),
    requestId: y.optional(),
    title: t.string(),
    body: t.string(),
  }),
  zx = t.object({ clientTimezone: y, clientLanguage: y, screenResolution: y }),
  rN = t.object({
    context: zx,
    elementName: y,
    eventRegion: y,
    eventType: y,
    eventText: t.string().optional(),
    eventExtraDetail: t.record(t.string(), t.string()),
    userId: t.string().optional(),
    talkId: t.string().optional(),
    messageId: t.string().optional(),
  }),
  iN = t.object({
    name: y,
    group: y,
    value: t.number().finite().optional(),
    properties: t
      .record(t.string(), t.union([t.string(), t.number().finite(), t.boolean(), t.undefined()]))
      .optional(),
  }),
  Mx = t.object({ channel: y, payload: t.unknown(), sourceWindowId: t.number().int().optional() }),
  Or = t.object({
    mockCdnDir: t.string().optional(),
    remoteCdnBaseUrl: t.string().optional(),
    remoteCdnBaseUrls: t.array(t.string()).optional(),
    remoteCacheDir: t.string().optional(),
  }),
  $x = t.object({ workspacePath: y, workspaceIdentity: y.optional() }),
  Dx = t.object({
    type: t.literal("init-local"),
    hostId: y.optional(),
    deliveryKind: An.optional(),
    deviceMid: t.string().optional(),
    feedbackApiBase: t.string().url().optional(),
    workspacePath: y.optional(),
    workspaceIdentity: y.optional(),
    agentWarmupTargets: t.array($x).max(3).optional(),
    agentSpawnFallbackCwd: y.optional(),
    runtimeProcessEnvPatch: t
      .record(t.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), t.string())
      .optional(),
  }),
  Ux = t.object({ type: t.literal("init-remote"), target: zn, remoteAssets: Or }),
  Nx = t.object({
    type: t.literal("init-remote-workspace"),
    target: zn,
    remoteAssets: Or,
    workspacePath: y.optional(),
    workspaceIdentity: y.optional(),
    hostId: y.optional(),
    deliveryKind: An.optional(),
  }),
  Zx = t.object({
    type: t.literal("init-remote-ssh-host"),
    target: yf,
    remoteAssets: Or,
    hostId: y.optional(),
    deliveryKind: An.optional(),
  }),
  jx = t.object({
    type: t.literal("init-remote-wsl-host"),
    target: bf,
    remoteAssets: Or,
    hostId: y.optional(),
    deliveryKind: An.optional(),
  }),
  Bx = t
    .object({
      type: t.literal("attach-service-port"),
      attachmentId: y,
      clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]),
    })
    .strict(),
  Lx = t.object({ type: t.literal("detach-service-port"), attachmentId: y }),
  Wx = t.object({
    type: t.literal("acquire-remote-workspace"),
    requestId: y,
    workspacePath: y,
    workspaceIdentity: y.optional(),
    generation: t.number().int().positive(),
  }),
  Fx = t.object({
    type: t.literal("release-remote-workspace"),
    workspacePath: y,
    workspaceIdentity: y.optional(),
    generation: t.number().int().positive(),
  }),
  qx = t.object({ type: t.literal("dispose") }),
  vf = t.object({ type: t.literal("broadcast"), message: Mx }),
  Vx = t.object({ type: t.literal("task-realtime-deliver"), event: mf }),
  Gx = t.object({ type: t.literal("task-run-lease-result"), result: tf }),
  Kx = t.object({ type: t.literal("task-owner-command-deliver"), command: uf }),
  Hx = t.object({ type: t.literal("task-owner-command-result"), result: uu }),
  Jx = t.object({
    type: t.literal("bot-remote-workspace-reconnect-result"),
    requestId: y,
    ok: t.boolean(),
    sessionId: y.optional(),
    error: t.string().optional(),
  }),
  Yx = t.object({
    type: t.literal("bot-remote-workspace-connection-status-result"),
    requestId: y,
    ok: t.boolean(),
    connected: t.boolean().optional(),
    error: t.string().optional(),
  }),
  Xx = t.object({
    type: t.literal("bot-remote-workspace-runtime-port"),
    requestId: y,
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  Sf = t.object({
    content: y,
    createdAt: y,
    fromSessionId: y,
    messageId: y,
    requestId: y,
    toSessionId: y,
  }),
  _f = t.object({
    error: t.string().optional(),
    messageId: y,
    requestId: y,
    sessionId: y,
    status: t.enum(["success", "failed"]),
  }),
  Qx = t.object({ sessionId: y }),
  ek = t.object({ type: t.literal("session-message-deliver"), request: Sf }),
  tk = t.object({ type: t.literal("session-message-delivery-result"), result: _f }),
  nk = t.object({
    type: t.literal("feedback-log-archive-result"),
    requestId: y,
    ok: t.boolean(),
    path: t.string().optional(),
    size: t.number().int().nonnegative().optional(),
    error: t.string().optional(),
  }),
  ok = t.object({
    type: t.literal("cron-run"),
    automationId: y,
    runId: y,
    workspacePath: y,
    workspaceIdentity: t.string().optional(),
    prompt: y,
    targetTaskId: y.optional(),
    model: t.string().optional(),
    provider: t.string().optional(),
    mode: t.string().optional(),
    thoughtLevel: t.string().optional(),
  }),
  rk = t.object({
    type: t.literal("off-peak-run"),
    offPeakTaskId: y,
    workspacePath: y,
    workspaceIdentity: t.string().optional(),
    prompt: y,
    permissionMode: y,
    model: t.string().optional(),
    thoughtLevel: t.string().optional(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    serverTicketId: t.string().optional(),
  }),
  ik = t.object({ type: t.literal("browser-execute-result"), requestId: y, result: $t }),
  aN = t.discriminatedUnion("type", [
    Dx,
    Ux,
    Nx,
    Zx,
    jx,
    Bx,
    Lx,
    Wx,
    Fx,
    qx,
    vf,
    Vx,
    Gx,
    Kx,
    Hx,
    Jx,
    Yx,
    Xx,
    ek,
    tk,
    nk,
    ok,
    rk,
    ik,
  ]),
  ak = t.object({ type: t.literal("connected") }),
  sk = t.object({
    type: t.literal("remote-workspace-acquired"),
    requestId: y,
    workspacePath: y,
    workspaceIdentity: y.optional(),
    generation: t.number().int().positive(),
    ok: t.boolean(),
    error: t.string().optional(),
  }),
  ck = t.object({ type: t.literal("error"), error: t.string() }),
  lk = t.object({
    type: t.literal("log"),
    level: t.enum(["info", "warn", "error"]),
    source: t.string(),
    message: t.string(),
  });
var dk = t.enum(["claudeCode"]),
  uk = t.object({
    type: t.literal("agent-process-spawned"),
    pid: t.number().int().positive(),
    provider: re,
    workspacePath: y,
    command: t.string(),
    args: t.array(t.string()),
    startedAt: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive().optional(),
    runtimeInstanceId: y.optional(),
  }),
  pk = t.object({
    type: t.literal("agent-process-ready"),
    pid: t.number().int().positive(),
    provider: re,
    workspacePath: y,
    readyAt: t.number().int().nonnegative(),
    startupDurationMs: t.number().int().nonnegative(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: y,
  }),
  mk = t.object({
    type: t.literal("agent-process-exited"),
    pid: t.number().int().positive(),
    provider: re,
    workspacePath: y,
    exitCode: t.number().int().nullable(),
    signal: t.string().nullable(),
    endedAt: t.number().int().nonnegative(),
    terminationKind: t.enum(["expected", "unexpected", "watchdog_recycle"]),
    terminationReason: t.string().optional(),
    runtimeReady: t.boolean().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: y.optional(),
    uptimeMs: t.number().int().nonnegative(),
    stderrLineCount: t.number().int().nonnegative(),
    stderrTail: t.array(t.string().max(1100)).max(20).optional(),
  }),
  gk = t.object({
    type: t.literal("agent-process-error"),
    pid: t.number().int().positive().nullable(),
    provider: re,
    workspacePath: y,
    command: t.string(),
    args: t.array(t.string()),
    errorName: y,
    errorCode: t.string().optional(),
    errorMessage: t.string(),
    errorStack: t.string().optional(),
    runtimeGeneration: t.number().int().positive(),
    runtimeInstanceId: y.optional(),
    occurredAt: t.number().int().nonnegative(),
  }),
  fk = t
    .object({
      type: t.literal("agent-resource-sample"),
      runtimeSurface: t.enum(["local", "remote"]),
      sample: mg,
    })
    .strict(),
  hk = t.object({
    type: t.literal("agent-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  yk = t.object({
    type: t.literal("workspace-running-task-count-changed"),
    workspacePath: y,
    workspaceIdentity: y.optional(),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  bk = t.object({
    type: t.literal("repo-wiki-running-task-count-changed"),
    runningTaskCount: t.number().int().nonnegative(),
  }),
  vk = t.object({ type: t.literal("task-realtime-publish"), event: pf }),
  Sk = t.object({ type: t.literal("task-stream-op-publish"), target: du, op: Jg }),
  _k = t.object({ type: t.literal("task-run-lease-acquire"), request: ef }),
  xk = t.object({ type: t.literal("task-run-lease-release"), target: Qg }),
  kk = t.object({ type: t.literal("task-owner-command-request"), command: df }),
  Ik = t.object({ type: t.literal("task-owner-command-result"), result: uu }),
  Ck = t.object({
    type: t.literal("bot-remote-workspace-reconnect-request"),
    requestId: y,
    workspacePath: y,
    workspaceIdentity: y,
    target: zn,
  }),
  Rk = t.object({
    type: t.literal("bot-remote-workspace-connection-status-request"),
    requestId: y,
    workspacePath: y,
    workspaceIdentity: y,
    target: zn,
  }),
  Pk = t.object({
    type: t.literal("bot-remote-workspace-runtime-port-request"),
    requestId: y,
    workspacePath: y,
    workspaceIdentity: y,
    target: zn,
  }),
  Tk = t.object({ type: t.literal("session-message-send-requested"), request: Sf }),
  wk = t.object({ type: t.literal("session-route-announce"), route: Qx }),
  Ek = t.object({ type: t.literal("session-message-deliver-result"), result: _f }),
  Ok = t.object({ type: t.literal("feedback-log-archive-request"), requestId: y, sourceDir: y }),
  Ak = t.object({
    type: t.literal("cron-run-result"),
    runId: y,
    ok: t.boolean(),
    taskId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  zk = t.object({
    type: t.literal("off-peak-run-result"),
    offPeakTaskId: y,
    ok: t.boolean(),
    conversationId: t.string().optional(),
    sessionId: t.string().optional(),
    error: t.string().optional(),
    failureKind: t.enum(["transient", "permanent"]).optional(),
  }),
  Mk = t.object({ type: t.literal("cron-scheduler-wake-request"), automationId: y }),
  $k = t.object({
    type: t.literal("off-peak-scheduler-wake-request"),
    offPeakTaskId: t.string().optional(),
  }),
  Dk = t.object({
    type: t.literal("browser-execute-request"),
    requestId: y,
    browserId: y.optional(),
    browserGeneration: t.number().int().nonnegative().optional(),
    sessionId: y,
    turnId: y.optional(),
    workspaceKey: y.optional(),
    workspacePath: y.optional(),
    workspaceIdentity: y.optional(),
    remoteSessionId: y.optional(),
    clientMode: t.enum(["desktop-continuous", "web-remote-replayable"]).optional(),
    sessionContext: t.enum(["live", "cached"]).optional(),
    command: Mt,
  }),
  Uk = t.object({
    transport: t.enum(["http", "websocket", "rpc"]),
    interface: t.string(),
    durationMs: t.number(),
    ok: t.boolean(),
    statusCode: t.number().optional(),
    errorKind: t.string().optional(),
    attempt: t.number().int().positive().optional(),
    dnsMs: t.number().optional(),
    tcpMs: t.number().optional(),
    tlsMs: t.number().optional(),
    ttfbMs: t.number().optional(),
    downloadMs: t.number().optional(),
  }),
  Nk = t.object({ type: t.literal("network-telemetry-batch"), observations: t.array(Uk).max(500) }),
  sN = t.discriminatedUnion("type", [
    ak,
    sk,
    ck,
    lk,
    uk,
    pk,
    mk,
    gk,
    fk,
    hk,
    yk,
    bk,
    vf,
    vk,
    Sk,
    _k,
    xk,
    kk,
    Ik,
    Ck,
    Rk,
    Pk,
    Tk,
    wk,
    Ek,
    Ok,
    Dk,
    Nk,
    Ak,
    zk,
    Mk,
    $k,
  ]),
  Zk = t.enum(["running", "completed", "error"]),
  jk = t.object({
    kind: t.literal("image"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative().optional(),
    dataBase64: t.string().optional(),
    localPath: t.string().optional(),
  }),
  Bk = t.object({
    kind: t.literal("file"),
    filename: t.string(),
    mimeType: t.string(),
    sizeBytes: t.number().int().nonnegative(),
    dataBase64: t.string().optional(),
    textContent: t.string().optional(),
    localPath: t.string().optional(),
  }),
  Lk = t.discriminatedUnion("kind", [jk, Bk]),
  Wk = t.object({
    toolName: t.string().optional(),
    title: t.string().optional(),
    kind: t.string().optional(),
    status: t.enum(["completed", "failed", "denied", "stopped"]).optional(),
    input: t.unknown(),
    output: t.unknown().optional(),
    error: t.string().optional(),
    raw: t.unknown().optional(),
    snapshotRefs: t
      .array(
        t.object({
          field: t.enum(["input", "output", "raw"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  Fk = t.discriminatedUnion("type", [
    t.object({ type: t.literal("content"), content: t.string() }),
    t.object({ type: t.literal("thought"), content: t.string() }),
    t.object({ type: t.literal("tool-call"), toolIndex: t.number().int().nonnegative() }),
  ]),
  qk = t.object({
    id: t.string().optional(),
    role: t.enum(["user", "assistant"]),
    content: t.string(),
    timestamp: t.number().int().nonnegative(),
    model: t.string().optional(),
    characterCount: t.number().int().nonnegative().optional(),
    durationMs: t.number().int().nonnegative().optional(),
    interrupted: t.boolean().optional(),
    feedback: t.enum(["like", "dislike"]).optional(),
    attachments: t.array(Lk).optional(),
    tools: t.array(Wk).optional(),
    thought: t.string().optional(),
    parts: t.array(Fk).optional(),
    checkpointState: t.enum(["partial"]).optional(),
    checkpointReason: t.enum(["tool_completed", "part_boundary", "periodic"]).optional(),
    checkpointUpdatedAt: t.number().int().nonnegative().optional(),
    turnIndex: t.number().int().nonnegative().optional(),
    bodyRefs: t
      .array(
        t.object({
          field: t.enum(["content", "thought"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
    toolSlice: t
      .object({
        persistedMessageIndex: t.number().int().nonnegative(),
        totalTools: t.number().int().nonnegative(),
        startToolIndex: t.number().int().nonnegative(),
        endToolIndexExclusive: t.number().int().nonnegative(),
      })
      .optional(),
  }),
  Vk = t.enum(["active", "paused", "budget_limited", "complete"]),
  Gk = t.enum([
    "set",
    "status_updated",
    "cleared",
    "usage_accounted",
    "run_started",
    "run_finished",
    "summary_updated",
  ]),
  Kk = t.enum(["command", "tool", "runtime"]),
  fu = t.object({
    sessionID: y,
    targetID: y,
    objective: y,
    summaryTitle: t.string().min(1).nullable().default(null),
    status: Vk,
    tokenBudget: t.number().int().positive().nullable(),
    tokensUsed: t.number().int().nonnegative(),
    timeUsedSeconds: t.number().int().nonnegative(),
    activeInputId: y.nullable().optional(),
    activeRunStartedAtMs: t.number().int().nonnegative().nullable().optional(),
    activeRunLastSeenAtMs: t.number().int().nonnegative().nullable().optional(),
    time: t.object({
      created: t.number().int().nonnegative(),
      updated: t.number().int().nonnegative(),
    }),
  }),
  cN = t.object({
    action: Gk,
    source: Kk,
    target: fu.nullable(),
    previousTarget: fu.nullable().optional(),
  });
var Hk = t.object({
    taskId: y,
    traceId: y,
    title: t.string(),
    titleOverridden: t.boolean().optional(),
    workspacePath: y,
    workspaceIdentity: y.optional(),
    workspacePurpose: t.enum(["project", "conversation"]).optional(),
    createdAt: t.number().int().nonnegative(),
    updatedAt: t.number().int().nonnegative(),
    mode: Ut,
    model: t.string().optional(),
    thoughtLevel: y.optional(),
    runtimeEpoch: t.number().int().nonnegative().optional(),
    provider: re.optional(),
    migrationSource: dk.optional(),
    forkedFromTaskId: y.optional(),
    cronAutomationId: y.optional(),
    offPeakTaskId: y.optional(),
    unreadAt: t.number().int().nonnegative().optional(),
    status: Zk.optional(),
    lastError: t
      .object({
        code: t.string().optional(),
        detail: t.string().optional(),
        message: t.string().min(1),
        traceId: y.optional(),
        taskId: y.optional(),
      })
      .optional(),
    repairState: t
      .object({
        claudeNativeSnapshotAssistantContentVersion: t.number().int().nonnegative().optional(),
        codexNativeSnapshotSubagentToolsVersion: t.number().int().nonnegative().optional(),
      })
      .optional(),
    changeSummary: t
      .object({
        fileCount: t.number().int().nonnegative(),
        added: t.number().int().nonnegative(),
        removed: t.number().int().nonnegative(),
        files: t.array(
          t.object({
            path: t.string(),
            added: t.number().int().nonnegative(),
            removed: t.number().int().nonnegative(),
            writeCount: t.number().int().positive(),
            lastTurnIndex: t.number().int().nonnegative(),
          }),
        ),
      })
      .optional(),
    target: fu.nullable().optional(),
  }),
  Jk = t.enum(["idle", "syncing", "ready", "stale", "failed"]),
  lN = t.object({ provider: re, sessionId: y, lastSyncedTurnIndex: t.number().int(), state: Jk }),
  Yk = t.object({ workspaceHash: y, taskId: y }),
  dN = t.object({ version: t.literal("1"), tasks: t.array(Yk) }),
  Xk = t.object({
    path: t.string(),
    beforeContent: t.string().nullable(),
    afterContent: t.string(),
    writeCount: t.number().int().positive(),
    contentRefs: t
      .array(
        t.object({
          field: t.enum(["beforeContent", "afterContent"]),
          refId: t.string(),
          hash: t.string(),
          fullBytes: t.number().int().nonnegative(),
          previewBytes: t.number().int().nonnegative(),
        }),
      )
      .optional(),
  }),
  Qk = t.object({
    turnIndex: t.number().int().nonnegative(),
    snapshots: t.array(Xk),
    fileState: t.enum(["applied", "reverted"]).optional(),
  }),
  eI = t.object({
    turnIndex: t.number().int().nonnegative(),
    baseFileCheckpointId: y,
    resultFileCheckpointId: y.optional(),
  }),
  uN = t.object({
    meta: Hk,
    messages: t.array(qk),
    fileChanges: t.array(Qk).optional(),
    turnCheckpoints: t.array(eI).optional(),
  });
var xf = "remote:",
  tI = { ssh: 3, wsl: 1, docker: 1, server: 1 };
function isRemoteWorkspaceIdentityKind(e) {
  return e === "ssh" || e === "wsl" || e === "docker" || e === "server";
}
c(isRemoteWorkspaceIdentityKind, "isRemoteWorkspaceIdentityKind");
function parseRemoteWorkspaceIdentity(e) {
  if (!e.startsWith(xf)) return null;
  let o = e.slice(xf.length),
    r = o.indexOf(":");
  if (r <= 0) return null;
  let a = o.slice(0, r);
  if (!isRemoteWorkspaceIdentityKind(a)) return null;
  let n = r + 1;
  for (let s = 0; s < tI[a]; s++) {
    let l = o.indexOf(":", n);
    if (l <= n) return null;
    n = l + 1;
  }
  if (a === "wsl" && o[n] !== "/") {
    let s = o.indexOf(":", n);
    if (s <= n) return null;
    n = s + 1;
  }
  let i = o.slice(n);
  return i.startsWith("/") ? { kind: a, workspacePath: i } : null;
}
c(parseRemoteWorkspaceIdentity, "parseRemoteWorkspaceIdentity");
function resolvePlatformBinaryName(e, o) {
  return o === "win32" ? `${e}.exe` : e;
}
c(resolvePlatformBinaryName, "resolvePlatformBinaryName");
var mZ = {
  binaryKind: "native-binary",
  binaryEnvVar: "GLM_BINARY_PATH",
  bundledResourceDir: "glm",
  version: "0.13.3",
  spawnArgs: ["app-server", "--stdio"],
  nativeConfigDir: ".nofy/cli",
  nativeConfigFileName: "config.json",
  missingBinaryMessage:
    "[ZCode Agent] glm binary \u672A\u627E\u5230\uFF0C\u8BF7\u8BBE\u7F6E ZCODE_AGENT_WORKDIR\u3001GLM_BINARY_PATH \u6216\u5148\u51C6\u5907 GLM \u8FD0\u884C\u65F6\u8D44\u6E90",
  resolveEntrySegments: c((e) => [resolvePlatformBinaryName("nofy-agent", e)], "resolveEntrySegments"),
  nodeBundleEntryFile: "nofy.cjs",
  resolveNodeBundleSegments() {
    return [this.nodeBundleEntryFile];
  },
};
var bZ = "ZCODE_SERVICE_AUTHORITY_MODE";
var iI = 1,
  aI = t.object({
    path: t.string().trim().min(1),
    label: t.string().trim().min(1).optional(),
    workspaceIdentity: t.string().trim().min(1).optional(),
  }),
  IZ = t.object({
    serverId: t.string().trim().min(1),
    name: t.string().trim().min(1).optional(),
    version: t.string(),
    protocolVersion: t.literal(iI),
    authRequired: t.boolean(),
    workspaces: t.array(aI),
    capabilities: t.object({ desktopContinuous: t.literal(!0), websocketRpc: t.literal(!0) }),
  }),
  CZ = t
    .object({ capability: t.string().trim().min(1), expiresAt: t.number().int().positive() })
    .strict();
var kf = "bigmodel";
var sI = "\u51ED\u636E\u89E3\u5BC6\u5931\u8D25\uFF1A",
  cI = "ZCODE_CREDENTIAL_DECRYPT_FAILED";
function isCredentialDecryptError(e) {
  let o = readCredentialErrorCode(e);
  return o ? o === cI : !!readCredentialErrorMessage(e).startsWith(sI);
}
c(isCredentialDecryptError, "isCredentialDecryptError");
function readCredentialErrorCode(e) {
  return typeof e == "object" && e !== null && "code" in e ? String(e.code ?? "") : "";
}
c(readCredentialErrorCode, "readCredentialErrorCode");
function readCredentialErrorMessage(e) {
  return e instanceof Error
    ? e.message
    : typeof e == "object" && e !== null && "message" in e
      ? String(e.message ?? "")
      : "";
}
c(readCredentialErrorMessage, "readCredentialErrorMessage");
var uI = "none";
var pI = [{ value: "nofy-agent", label: "Nofy Agent" }], // REBRAND-033+133
  NZ = [{ value: uI, label: "\u672A\u6307\u5B9A" }, ...pI];
var mI = "https://cdn.zcode-ai.com/zcode/config/default.json";
function buildVersionedRemoteAppConfigUrl(e, o = mI) {
  let r = new URL(o);
  return (r.searchParams.set("v", e.trim()), r.toString());
}
c(buildVersionedRemoteAppConfigUrl, "buildVersionedRemoteAppConfigUrl");
function Lt(e) {
  return typeof e == "object" && e != null;
}
c(Lt, "isRecord");
function sanitizeUrl(e) {
  return typeof e == "string" && e.trim() !== "" ? e : void 0;
}
c(sanitizeUrl, "sanitizeUrl");
function getFeedbackUrlFromConfig(e) {
  if (Lt(e)) return sanitizeUrl(e.feedback_url);
}
c(getFeedbackUrlFromConfig, "getFeedbackUrlFromConfig");
function getFeedbackUseExternalFormFromConfig(e) {
  if (!Lt(e)) return !1;
  let o = e.feedback_use_external_form;
  return o === !0 || o === "true";
}
c(getFeedbackUseExternalFormFromConfig, "getFeedbackUseExternalFormFromConfig");
function getCommunityUrlsFromConfig(e) {
  if (!Lt(e)) return {};
  let o = e.community_urls;
  return Lt(o) ? { "zh-CN": sanitizeUrl(o["zh-CN"]), "en-US": sanitizeUrl(o["en-US"]) } : {};
}
c(getCommunityUrlsFromConfig, "getCommunityUrlsFromConfig");
function getCommunityUrlFromConfigs(e, o, r) {
  let a = getCommunityUrlsFromConfig(e),
    n = getCommunityUrlsFromConfig(o);
  return a[r] ?? n[r];
}
c(getCommunityUrlFromConfigs, "getCommunityUrlFromConfigs");
function getForceUpdateMinimalVersionFromConfig(e) {
  if (!Lt(e)) return;
  let o = e.forceUpdate;
  if (!Lt(o)) return;
  let r = o.minimalVersion;
  return typeof r == "string" && r.trim() !== "" ? r.trim() : void 0;
}
c(getForceUpdateMinimalVersionFromConfig, "getForceUpdateMinimalVersionFromConfig");
var XZ = `team-plan:${_e.bigmodelCodingPlan}:`;
var gI = "zcode-browser-restore://pending";
var fI = {
  NewTask: "newTask",
  OpenWorkspace: "openWorkspace",
  CloseActiveContext: "closeActiveContext",
  CloseWindow: "closeWindow",
  MinimizeWindow: "minimizeWindow",
  ToggleMaximizeWindow: "toggleMaximizeWindow",
  ToggleFullScreen: "toggleFullScreen",
  ResetZoom: "resetZoom",
  ZoomIn: "zoomIn",
  ZoomOut: "zoomOut",
  ShowAbout: "showAbout",
  OpenChangelog: "openChangelog",
  CheckForUpdates: "checkForUpdates",
  RelaunchApp: "relaunchApp",
  OpenFeedback: "openFeedback",
  OpenCommunity: "openCommunity",
  ExportLogs: "exportLogs",
  ToggleDevTools: "toggleDevTools",
  OpenProcessMonitor: "openProcessMonitor",
  ToggleZCodeStdioTapDevProxy: "toggleZCodeStdioTapDevProxy",
  SetZCodeEndpointProduction: "setZCodeEndpointProduction",
  SetZCodeEndpointTest: "setZCodeEndpointTest",
  SetZCodeEndpointCustom: "setZCodeEndpointCustom",
  ResetZCodeEndpoint: "resetZCodeEndpoint",
  StartPerformanceRecording: "startPerformanceRecording",
  StopPerformanceRecording: "stopPerformanceRecording",
  ClearAllData: "clearAllData",
};
function buildResultDetail(e, o) {
  return { result: e, error_category: e === "success" ? "" : (o ?? "unknown") };
}
c(buildResultDetail, "buildResultDetail");
function buildWebRemoteControlEvent(e, o, r) {
  return { elementName: e, eventRegion: "web_remote_control", eventType: o, eventExtraDetail: r };
}
c(buildWebRemoteControlEvent, "buildWebRemoteControlEvent");
function buildRemoteWorkspaceConnectResultTelemetry(e) {
  return {
    elementName: "remote_workspace_connect_result",
    eventRegion: "remote_workspace",
    eventType: "result",
    eventExtraDetail: {
      result: e.result,
      remote_kind: e.remoteKind,
      connect_trigger: e.connectTrigger,
      error_category: e.result === "success" ? "" : (e.errorCategory ?? "unknown"),
    },
  };
}
c(buildRemoteWorkspaceConnectResultTelemetry, "buildRemoteWorkspaceConnectResultTelemetry");
function buildWebRemoteControlStartResultTelemetry(e) {
  return buildWebRemoteControlEvent("web_remote_control_start_result", "result", {
    ...buildResultDetail(e.result, e.errorCategory),
    workspace_kind: e.workspaceKind,
    remote_kind: e.remoteKind ?? "",
  });
}
c(buildWebRemoteControlStartResultTelemetry, "buildWebRemoteControlStartResultTelemetry");
function buildWebRemoteControlPairResultTelemetry(e) {
  return buildWebRemoteControlEvent("web_remote_control_pair_result", "result", {
    ...buildResultDetail(e.result, e.errorCategory),
    pair_kind: e.pairKind,
    workspace_kind: e.workspaceKind,
    remote_kind: e.remoteKind ?? "",
  });
}
c(buildWebRemoteControlPairResultTelemetry, "buildWebRemoteControlPairResultTelemetry");
function buildWebRemoteControlBridgeResultTelemetry(e) {
  return buildWebRemoteControlEvent("web_remote_control_bridge_result", "result", {
    ...buildResultDetail(e.result, e.errorCategory),
    workspace_kind: e.workspaceKind,
    remote_kind: e.remoteKind ?? "",
    entry_kind: e.entryKind,
  });
}
c(buildWebRemoteControlBridgeResultTelemetry, "buildWebRemoteControlBridgeResultTelemetry");
function readErrorSearchText(e) {
  if (typeof e == "string") return e.toLowerCase();
  if (typeof e != "object" || e === null) return "";
  let o = "code" in e ? String(e.code ?? "") : "",
    r = "message" in e ? String(e.message ?? "") : "";
  return `${o} ${r}`.toLowerCase();
}
c(readErrorSearchText, "readErrorSearchText");
function classifyRemoteUsageError(e) {
  let o = readErrorSearchText(e);
  return /(auth|password|credential|token|permission|denied|unauthor)/.test(o)
    ? "auth"
    : /(deploy|download|install|asset|checksum)/.test(o)
      ? "deploy"
      : /(host_start|host start|spawn|process.*(?:exit|start)|host.*(?:exit|start))/.test(o)
        ? "host_start"
        : /(attach|desktop_host_missing|workspace.*(?:identity|missing|mismatch)|remote_session)/.test(
              o,
            )
          ? "attach"
          : /(relay|websocket|web socket|pair|device.*(?:kicked|not.found))/.test(o)
            ? "relay"
            : /(connect|network|socket|ssh|wsl|docker|server|timeout|timedout|econn)/.test(o)
              ? "connect"
              : "unknown";
}
c(classifyRemoteUsageError, "classifyRemoteUsageError");
var yI = "zcodeLaunchMarks";
function serializeLaunchMarks(e) {
  return JSON.stringify(e);
}
c(serializeLaunchMarks, "serializeLaunchMarks");
function byteToHex(e) {
  return e.toString(16).padStart(2, "0");
}
c(byteToHex, "byteToHex");
function formatUuid(e) {
  let o = new Uint8Array(e);
  return (
    (o[6] = (o[6] & 15) | 64),
    (o[8] = (o[8] & 63) | 128),
    [o.slice(0, 4), o.slice(4, 6), o.slice(6, 8), o.slice(8, 10), o.slice(10, 16)]
      .map((a) => Array.from(a, byteToHex).join(""))
      .join("-")
  );
}
c(formatUuid, "formatUuid");
function createUuid() {
  let e = globalThis.crypto;
  if (e?.randomUUID) return e.randomUUID();
  if (e?.getRandomValues) {
    let r = new Uint8Array(16);
    return (e.getRandomValues(r), formatUuid(r));
  }
  let o = new Uint8Array(16);
  for (let r = 0; r < o.length; r += 1) o[r] = Math.floor(Math.random() * 256);
  return formatUuid(o);
}
c(createUuid, "createUuid");
var Uj = ["completed", "failed", "cancelled"];
var _I = [
    { id: "build", name: "Ask before changes", description: "Ask before each file changes." },
    {
      id: "edit",
      name: "Edit automatically",
      description: "Edit selected files or relevant workspace files automatically.",
    },
    {
      id: "plan",
      name: "Plan mode",
      description: "Inspect the code and present a plan before editing.",
    },
    {
      id: "yolo",
      name: "Full access",
      description: "Edit and run commands with fewer confirmations.",
    },
  ],
  dB = new Set(_I.map((e) => e.id));
function formatTimestamp(e = new Date()) {
  let o = e.getFullYear(),
    r = String(e.getMonth() + 1).padStart(2, "0"),
    a = String(e.getDate()).padStart(2, "0"),
    n = String(e.getHours()).padStart(2, "0"),
    i = String(e.getMinutes()).padStart(2, "0"),
    s = String(e.getSeconds()).padStart(2, "0"),
    l = String(e.getMilliseconds()).padStart(3, "0");
  return `${o}-${r}-${a} ${n}:${i}:${s}.${l}`;
}
c(formatTimestamp, "formatTimestamp");
function formatLogPrefix(e, o) {
  let r = formatTimestamp(),
    a = o != null ? ` [pid:${o}]` : "";
  return `[${r}]${a} [${e}]`;
}
c(formatLogPrefix, "formatLogPrefix");
var Pf = [
  {
    id: "zai",
    label: "Z.ai",
    oauthProviderId: "zai",
    apiKeyProviderId: _e.zai,
    startPlanProviderId: _e.zaiStartPlan,
    codingPlanProviderId: _e.zaiCodingPlan,
  },
  {
    id: "bigmodel",
    label: "BigModel",
    oauthProviderId: kf,
    apiKeyProviderId: _e.bigmodel,
    startPlanProviderId: _e.bigmodelStartPlan,
    codingPlanProviderId: _e.bigmodelCodingPlan,
  },
];
var OB = new Map(Pf.map((e) => [e.id, e])),
  AB = new Map(
    Pf.flatMap((e) =>
      [e.apiKeyProviderId, e.startPlanProviderId, e.codingPlanProviderId].map((o) => [o, e.id]),
    ),
  );
var gL = "DATA_BASE_DIR_FORBIDDEN_WINDOWS_INSTALL_DIR";
var SL = t.object({ askUserQuestionAutoResolutionEnabled: t.boolean() }).strict();
var II = "nofy"; // REBRAND-047+147
function sanitizeProcessNameSegment(e) {
  if (!e) return null;
  let o = e
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return o ? o.slice(0, 24) : null;
}
c(sanitizeProcessNameSegment, "sanitizeProcessNameSegment");
function joinZCodeProcessName(...e) {
  let o = e.map((r) => sanitizeProcessNameSegment(r)).filter((r) => !!r);
  return [II, ...o].join("-");
}
c(joinZCodeProcessName, "joinZCodeProcessName");
function pickWorkspaceTag(e) {
  let o = e?.trim();
  return o
    ? (o
        .split(/[\\/]+/)
        .filter(Boolean)
        .at(-1) ?? o)
    : void 0;
}
c(pickWorkspaceTag, "pickWorkspaceTag");
function formatZCodeMainProcessName() {
  return joinZCodeProcessName("main");
}
c(formatZCodeMainProcessName, "formatZCodeMainProcessName");
function formatZCodeGpuProcessName() {
  return joinZCodeProcessName("gpu");
}
c(formatZCodeGpuProcessName, "formatZCodeGpuProcessName");
function formatZCodeHostProcessName(e) {
  return joinZCodeProcessName("host", e);
}
c(formatZCodeHostProcessName, "formatZCodeHostProcessName");
function formatZCodeRendererProcessName(e) {
  let o = e?.trim();
  if (!o || o === "ZCode") return joinZCodeProcessName("renderer", "main");
  if (o === "Process Monitor") return joinZCodeProcessName("renderer", "process-monitor");
  let r = "ZCode - ";
  return o.startsWith(r) ? joinZCodeProcessName("renderer", "remote", o.slice(r.length)) : joinZCodeProcessName("renderer", o);
}
c(formatZCodeRendererProcessName, "formatZCodeRendererProcessName");
function formatZCodeAgentProcessName(e, o) {
  return joinZCodeProcessName("agent", e, pickWorkspaceTag(o));
}
c(formatZCodeAgentProcessName, "formatZCodeAgentProcessName");
function formatZCodeUtilityProcessName(e, o = "utility") {
  return joinZCodeProcessName(o, e);
}
c(formatZCodeUtilityProcessName, "formatZCodeUtilityProcessName");
function vu(e, o) {
  return o === "win32" ? `${e}.exe` : e;
}
c(vu, "resolvePlatformBinaryName");
var Ar = {
    bfs: {
      binaryEnvVar: "ZCODE_BFS_BINARY",
      bundledResourceDir: "bfs",
      resolveEntrySegments: c((e) => [vu("bfs", e)], "resolveEntrySegments"),
    },
    ripgrep: {
      binaryEnvVar: "ZCODE_RG_BINARY",
      bundledResourceDir: "ripgrep",
      resolveEntrySegments: c((e) => [vu("rg", e)], "resolveEntrySegments"),
    },
    ugrep: {
      binaryEnvVar: "ZCODE_UGREP_BINARY",
      bundledResourceDir: "ugrep",
      resolveEntrySegments: c((e) => [vu("ugrep", e)], "resolveEntrySegments"),
    },
  },
  PI = {
    bfs: { ...Ar.bfs, versions: { linux: "v4.1.1-2" } },
    ripgrep: { ...Ar.ripgrep, versions: { darwin: "v13.0.0-10", linux: "v14.1.1-1" } },
    ugrep: { ...Ar.ugrep, versions: { linux: "v7.5.0-2" } },
  };
function getRemoteRuntimeToolsForPlatform(e) {
  return Object.entries(PI).flatMap(([o, r]) => {
    let a = r.versions[e];
    return a ? [{ toolId: o, runtime: r, version: a }] : [];
  });
}
c(getRemoteRuntimeToolsForPlatform, "getRemoteRuntimeToolsForPlatform");
function getRuntimeToolRuntime(e) {
  return Ar[e];
}
c(getRuntimeToolRuntime, "getRuntimeToolRuntime");
var TI = [
  "Read",
  "Write",
  "Edit",
  "ApplyPatch",
  "Bash",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "web_search",
  "TodoRead",
  "TodoWrite",
  "GoalRead",
  "ReadSessionContext",
  "AskUserQuestion",
  "SendMessage",
  "RespondToCoordinator",
  "TaskOutput",
  "TaskStop",
  "js",
  "js_reset",
  "js_add_node_module_dir",
  "mcp__node_repl__js",
  "mcp__node_repl__js_reset",
  "mcp__node_repl__js_add_node_module_dir",
  "Agent",
  "Task",
  "Skill",
];
var xW = new Map(TI.map((e) => [e.toLowerCase(), e]));
function buildWebRemoteControlExternalQrUrl({
  baseUrl: e,
  deviceSid: o,
  passHash: r,
  timestamp: a,
  deviceMid: n,
  deviceName: i,
  appVersion: s,
  theme: l,
}) {
  let p = new URL(e);
  return (
    p.searchParams.set("sid", o),
    p.searchParams.set("hash", r),
    p.searchParams.set("t", String(a)),
    n?.trim() && p.searchParams.set("mid", n),
    i?.trim() && p.searchParams.set("name", i),
    s?.trim() && p.searchParams.set("app_version", s),
    p.toString()
  );
}
c(buildWebRemoteControlExternalQrUrl, "buildWebRemoteControlExternalQrUrl");
function resolveWebRemoteControlWorkspaceKey(e) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
c(resolveWebRemoteControlWorkspaceKey, "resolveWebRemoteControlWorkspaceKey");
function parseSemver(e) {
  let o = e.trim().replace(/^v/i, ""),
    r = o.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (r)
    return {
      major: Number(r[1]),
      minor: Number(r[2]),
      patch: Number(r[3]),
      prerelease: r[4]?.split(".") ?? [],
    };
  let a = o.match(/^(\d+)$/);
  if (a) return { major: Number(a[1]), minor: 0, patch: 0, prerelease: [] };
  let n = o.match(/^(\d+)\.(\d+)$/);
  return n ? { major: Number(n[1]), minor: Number(n[2]), patch: 0, prerelease: [] } : null;
}
c(parseSemver, "parseSemver");
function comparePrerelease(e, o) {
  if (e.length === 0 && o.length === 0) return 0;
  if (e.length === 0) return 1;
  if (o.length === 0) return -1;
  let r = Math.max(e.length, o.length);
  for (let a = 0; a < r; a += 1) {
    let n = e[a],
      i = o[a];
    if (n === void 0) return -1;
    if (i === void 0) return 1;
    let s = /^\d+$/.test(n),
      l = /^\d+$/.test(i);
    if (s && l) {
      let u = Number(n) - Number(i);
      if (u !== 0) return u > 0 ? 1 : -1;
      continue;
    }
    if (s !== l) return s ? -1 : 1;
    let p = n.localeCompare(i);
    if (p !== 0) return p > 0 ? 1 : -1;
  }
  return 0;
}
c(comparePrerelease, "comparePrerelease");
function compareSemverVersions(e, o) {
  let r = parseSemver(e),
    a = parseSemver(o);
  if (!r || !a) return null;
  for (let n of ["major", "minor", "patch"]) {
    let i = r[n] - a[n];
    if (i !== 0) return i > 0 ? 1 : -1;
  }
  return comparePrerelease(r.prerelease, a.prerelease);
}
c(compareSemverVersions, "compareSemverVersions");
function resolveForceUpdateRequirement(e) {
  let o = e.forceUpdate?.minimalVersion.trim();
  if (!o) return null;
  let r = compareSemverVersions(e.currentVersion, o);
  return r === null || r >= 0 ? null : { currentVersion: e.currentVersion, minimalVersion: o };
}
c(resolveForceUpdateRequirement, "resolveForceUpdateRequirement");
var OI = "studio.zcode-ai.com";
function readProcessEnv() {
  return globalThis.process?.env ?? {};
}
c(readProcessEnv, "readProcessEnv");
function resolveIntranetMachineHost(e = readProcessEnv()) {
  return e.INTRANET_MACHINE_HOST?.trim() || OI;
}
c(resolveIntranetMachineHost, "resolveIntranetMachineHost");
var Of = resolveIntranetMachineHost(),
  Af = 12345,
  AI = `http://${Of}:${Af}/zcode`,
  oF = `${AI}/deps`,
  zI = 3850,
  MI = "/api/intranet/probe",
  $I = `http://${Of}:${zI}${MI}`;
function resolveIntranetDepsBaseUrl(e = readProcessEnv()) {
  let o = e.ZCODE_DEPS_BASE_URL?.trim();
  return o ? o.replace(/\/+$/, "") : `http://${resolveIntranetMachineHost(e)}:${Af}/zcode/deps`;
}
c(resolveIntranetDepsBaseUrl, "resolveIntranetDepsBaseUrl");
var Mn = "desktop", // nofy：v2 目录废除
  DI = "v1",
  zf = "v1";
function repoSnapshotSchema(e, o) {
  return `repo_snapshot_${e}/${o}`;
}
c(repoSnapshotSchema, "repoSnapshotSchema");
var CF = repoSnapshotSchema("manifest", Mn),
  RF = repoSnapshotSchema("prompt", Mn),
  PF = repoSnapshotSchema("delta", Mn),
  TF = repoSnapshotSchema("encrypted_artifact", Mn),
  wF = repoSnapshotSchema("encryption_aad", Mn),
  EF = repoSnapshotSchema("manifest_hash", DI),
  OF = repoSnapshotSchema("upload_key", zf),
  AF = repoSnapshotSchema("upload_target", zf);
function findLocalWorkspaceSessionIndex(e, o, r) {
  for (let a = o; a < r; a += 1) if (e[a]?.kind === "local") return a;
  return null;
}
c(findLocalWorkspaceSessionIndex, "findLocalWorkspaceSessionIndex");
function resolveStartupLocalWorkspaceSessionIndex(e, o) {
  if (e.length === 0) return null;
  let r = Math.min(Math.max(o ?? 0, 0), e.length - 1),
    a = findLocalWorkspaceSessionIndex(e, r, e.length);
  return a ?? findLocalWorkspaceSessionIndex(e, 0, r);
}
c(resolveStartupLocalWorkspaceSessionIndex, "resolveStartupLocalWorkspaceSessionIndex");
var $f = t.object({
    id: t.string().uuid(),
    runtimeScope: t.enum(["main", "subagent"]),
    token: t.string().min(32),
    sessionId: t.string().trim().min(1),
    turnId: t.string().trim().min(1).optional(),
    trace: t
      .object({
        traceId: t.string().trim().min(1),
        spanId: t.string().trim().min(1).optional(),
        parentSpanId: t.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
  }),
  r4 = t.discriminatedUnion("op", [
    $f.extend({ op: t.literal("list") }).strict(),
    $f
      .extend({
        op: t.literal("execute"),
        browserId: t.string().trim().min(1),
        browserGeneration: t.number().int().nonnegative(),
        command: Mt,
      })
      .strict(),
  ]),
  i4 = t.discriminatedUnion("ok", [
    t
      .object({
        id: t.string().uuid(),
        ok: t.literal(!0),
        browsers: t.array(Ad).optional(),
        result: $t.optional(),
      })
      .strict(),
    t.object({ id: t.string().uuid(), ok: t.literal(!1), error: t.string().min(1) }).strict(),
  ]);
export {
  zr as a,
  Zf as b,
  jf as c,
  Bf as d,
  stripRemoteTargetSecrets as e,
  buildSshRemoteHostKey as f,
  _u as g,
  Lf as h,
  Wf as i,
  Ff as j,
  qf as k,
  mapZCodeEnvToArmsRumEnv as l,
  BC as m,
  normalizeUnknownError as n,
  t as o,
  Sr as p,
  Pm as q,
  zd as r,
  Om as s,
  normalizeRemoteResourcePackageSelection as t,
  $d as u,
  Dt as v,
  et as w,
  Xv as x,
  tS as y,
  qd as z,
  Mr as A,
  Gf as B,
  normalizeZCodeEndpointOrigin as C,
  resolveZCodeEndpointOrigin as D,
  resolveRuntimeZCodeEndpointOrigin as E,
  buildRuntimeZCodeEndpointUrls as F,
  buildRuntimeZCodeApiUrl as G,
  resolveWebRemoteControlRelayWsUrl as H,
  resolveBigModelApiOrigin as I,
  buildBigModelApiUrl as J,
  resolveZaiOAuthOrigin as K,
  resolveZaiBusinessBaseUrl as L,
  resolveZaiOAuthClientId as M,
  buildZCodeEndpointUrls as N,
  rewriteZCodeEndpointUrl as O,
  Tn as P,
  _S as Q,
  xS as R,
  Ut as S,
  _e as T,
  SM as U,
  _M as V,
  og as W,
  tt as X,
  IS as Y,
  RS as Z,
  ag as _,
  sg as $,
  OS as aa,
  MS as ba,
  eu as ca,
  Te as da,
  U_ as ea,
  rU as fa,
  iU as ga,
  aU as ha,
  sU as ia,
  wn as ja,
  nx as ka,
  ae as la,
  measureWebRemoteControlRpcRelayEnvelopeBytes as ma,
  parseWebRemoteControlRpcTransportPayload as na,
  ge as oa,
  encodeWebRemoteControlRpcTransportMessage as pa,
  Ng as qa,
  resolveWorkspaceKey as ra,
  formatZodError as sa,
  y as ta,
  GU as ua,
  ff as va,
  HU as wa,
  hf as xa,
  parseWebRemoteControlAppPayload as ya,
  YU as za,
  XU as Aa,
  QU as Ba,
  zn as Ca,
  eN as Da,
  nN as Ea,
  oN as Fa,
  rN as Ga,
  iN as Ha,
  Mx as Ia,
  sN as Ja,
  Hk as Ka,
  uN as La,
  parseRemoteWorkspaceIdentity as Ma,
  mZ as Na,
  ch as Oa,
  resolveZCodeRuntimeEnv as Pa,
  readZCodeAgentTelemetryEnv as Qa,
  sanitizeZCodeRuntimeEnv as Ra,
  buildZCodeToolEnvPassthroughEnv as Sa,
  bZ as Ta,
  mC as Ua,
  gC as Va,
  fC as Wa,
  hC as Xa,
  yC as Ya,
  kf as Za,
  sI as _a,
  cI as $a,
  isCredentialDecryptError as ab,
  xC as bb,
  getDesktopMenuMessage as cb,
  formatDesktopMenuMessage as db,
  shouldEnableE2ETestBridge as eb,
  mI as fb,
  buildVersionedRemoteAppConfigUrl as gb,
  getFeedbackUrlFromConfig as hb,
  getFeedbackUseExternalFormFromConfig as ib,
  getCommunityUrlFromConfigs as jb,
  getForceUpdateMinimalVersionFromConfig as kb,
  gI as lb,
  fI as mb,
  buildRemoteWorkspaceConnectResultTelemetry as nb,
  buildWebRemoteControlStartResultTelemetry as ob,
  buildWebRemoteControlPairResultTelemetry as pb,
  buildWebRemoteControlBridgeResultTelemetry as qb,
  classifyRemoteUsageError as rb,
  yI as sb,
  serializeLaunchMarks as tb,
  createUuid as ub,
  Uj as vb,
  formatTimestamp as wb,
  formatLogPrefix as xb,
  gL as yb,
  formatZCodeMainProcessName as zb,
  formatZCodeGpuProcessName as Ab,
  formatZCodeHostProcessName as Bb,
  formatZCodeRendererProcessName as Cb,
  formatZCodeAgentProcessName as Db,
  formatZCodeUtilityProcessName as Eb,
  getRemoteRuntimeToolsForPlatform as Fb,
  getRuntimeToolRuntime as Gb,
  buildWebRemoteControlExternalQrUrl as Hb,
  resolveWebRemoteControlWorkspaceKey as Ib,
  resolveForceUpdateRequirement as Jb,
  resolveIntranetDepsBaseUrl as Kb,
  resolveStartupLocalWorkspaceSessionIndex as Lb,
};
