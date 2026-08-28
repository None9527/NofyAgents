const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./e2eStoreBridgeBootstrap-DOKuAE2h.js",
      "./skillStore-BmeKHDBI.js",
      "./chunk-Cq_f4orQ.js",
      "./react-BQLj9xdT.js",
      "./src-HCld2afU.js",
      "./logger-PFDwl5Yq.js",
    ]),
) => i.map((i) => d[i]);
import { s as e } from "./chunk-Cq_f4orQ.js";
import {
  A as t,
  B as n,
  C as r,
  D as ee,
  E as i,
  F as a,
  G as o,
  H as te,
  I as ne,
  L as re,
  M as ie,
  N as ae,
  O as oe,
  P as se,
  R as ce,
  S as le,
  T as ue,
  U as s,
  V as de,
  W as fe,
  _ as pe,
  a as me,
  b as he,
  c as ge,
  d as _e,
  f as ve,
  g as ye,
  h as be,
  i as xe,
  j as Se,
  k as Ce,
  l as we,
  m as Te,
  n as Ee,
  o as c,
  p as l,
  r as u,
  s as d,
  t as f,
  u as p,
  v as m,
  w as h,
  x as g,
  y as _,
  z as v,
} from "./styles-CdEGpc2x.js";
import { P as y } from "./imeComposition-DEYFkwWm.js";
import { t as b } from "./react-BQLj9xdT.js";
import { t as x } from "./IntlProvider-C321H7m8.js";
import { t as S } from "./jsx-runtime-B5yMD3-t.js";
import { Ps as C, St as w, ct as T, ft as E, no as D, st as De, ut as O } from "./src-HCld2afU.js";
import { t as Oe } from "./preload-helper-BHSF1fZ9.js";
var k = document.querySelector(`.startup-logo-shell`),
  A = document.getElementById(`loading`),
  j = new URLSearchParams(window.location.search).get(`windowKind`) === `update-status`,
  ke = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,
  M = !1,
  N = !1,
  P = !1,
  F = () => {
    M ||
      !N ||
      !P ||
      ((M = !0),
      document.body.classList.add(`zcode-startup-ready`),
      window.setTimeout(() => A?.remove(), 500));
  },
  I = () => {
    ((N = !0), F());
  },
  L = () => {
    ((P = !0), F());
  };
(j
  ? ((M = !0), document.body.classList.add(`zcode-startup-ready`), A?.remove())
  : window.addEventListener(`zcode-react-startup-ready`, L, { once: !0 }),
  j || ke || !k
    ? I()
    : (k.addEventListener(`animationend`, I, { once: !0 }), window.setTimeout(I, 1e3)),
  j || window.setTimeout(L, 3e3));
var Ae = e(b(), 1),
  R = y(),
  je = class {
    fileService;
    gitService;
    gitCheckpointService;
    systemService;
    terminalService;
    settingService;
    credentialService;
    broadcastService;
    zcodeTaskService;
    zcodeAgentService;
    zcodeSessionService;
    botsService;
    fileWatcherService;
    oauthService;
    modelProviderService;
    usageStatsService;
    codingPlanSubscriptionService;
    offPeakTaskService;
    skillsService;
    skillSyncService;
    mcpSyncService;
    pluginSyncService;
    pluginsService;
    pluginManagementService;
    subagentsService;
    commandsService;
    hooksService;
    memoryService;
    outputStyleService;
    settingsSyncService;
    feedbackService;
    repoWikiService;
    promptAttachmentTransferService;
    constructor(e) {
      ((this.fileService = s.toService(e.getChannel(n.channelName))),
        (this.gitService = s.toService(e.getChannel(v.channelName))),
        (this.gitCheckpointService = s.toService(e.getChannel(ce.channelName))),
        (this.systemService = s.toService(e.getChannel(re.channelName))),
        (this.terminalService = s.toService(e.getChannel(ne.channelName))),
        (this.settingService = s.toService(e.getChannel(a.channelName))),
        (this.credentialService = s.toService(e.getChannel(se.channelName))),
        (this.broadcastService = s.toService(e.getChannel(ae.channelName))),
        (this.zcodeTaskService = s.toService(e.getChannel(ie.channelName))),
        (this.zcodeAgentService = s.toService(e.getChannel(Se.channelName))),
        (this.zcodeSessionService = s.toService(e.getChannel(t.channelName))),
        (this.botsService = s.toService(e.getChannel(Ce.channelName))),
        (this.fileWatcherService = s.toService(e.getChannel(ue.channelName))),
        (this.oauthService = s.toService(e.getChannel(h.channelName))),
        (this.modelProviderService = s.toService(e.getChannel(r.channelName))),
        (this.usageStatsService = s.toService(e.getChannel(le.channelName))),
        (this.codingPlanSubscriptionService = s.toService(e.getChannel(g.channelName))),
        (this.offPeakTaskService = s.toService(e.getChannel(he.channelName))),
        (this.skillsService = s.toService(e.getChannel(_.channelName))),
        (this.skillSyncService = s.toService(e.getChannel(m.channelName))),
        (this.mcpSyncService = s.toService(e.getChannel(pe.channelName))),
        (this.pluginSyncService = s.toService(e.getChannel(ye.channelName))),
        (this.pluginsService = s.toService(e.getChannel(be.channelName))),
        (this.pluginManagementService = s.toService(e.getChannel(Te.channelName))),
        (this.subagentsService = s.toService(e.getChannel(l.channelName))),
        (this.commandsService = s.toService(e.getChannel(ve.channelName))),
        (this.hooksService = s.toService(e.getChannel(oe.channelName))),
        (this.memoryService = s.toService(e.getChannel(ee.channelName))),
        (this.outputStyleService = s.toService(e.getChannel(i.channelName))),
        (this.settingsSyncService = s.toService(e.getChannel(_e.channelName))),
        (this.feedbackService = s.toService(e.getChannel(p.channelName))),
        (this.repoWikiService = s.toService(e.getChannel(we.channelName))),
        (this.promptAttachmentTransferService = s.toService(e.getChannel(ge.channelName))));
    }
  };
function Me() {
  return (
    globalThis.__ZCODE_RENDERER_DISABLE_LOGGING__ === !0 ||
    {
      BASE_URL: `./`,
      DEV: !1,
      MODE: `production`,
      PROD: !0,
      SSR: !1,
      VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
      VITE_ZCODE_E2E_STORE_BRIDGE: ``,
      VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
    }.PROD === !0
  );
}
function z(e) {
  Me() || console.log(e);
}
function B(e) {
  z(`[connectViaMessagePort] creating protocol and client...`);
  let t = new fe(new o(e));
  return (
    t.onDidInitialize(() => {
      z(`[connectViaMessagePort] ChannelClient received Initialize from server`);
    }),
    z(`[connectViaMessagePort] client created, waiting for Initialize...`),
    new je(t)
  );
}
D.assemblyTimeoutMs;
function Ne({ bridge: e, createRendererContext: t }) {
  e.syncTelemetryContext(t());
}
var Pe = {
  getPathForFile: (e) => window.zcode.getPathForFile?.(e) ?? null,
  saveFile: (e) =>
    window.zcode.saveFile?.(e) ?? Promise.resolve({ success: !1, error: `not_supported` }),
  printPageToPdf: window.zcode.printPageToPdf ? () => window.zcode.printPageToPdf() : void 0,
  onBrowserViewReady: (e) => window.zcode.onBrowserViewReady?.(e) ?? (() => {}),
  onBrowserViewOperation: (e) => window.zcode.onBrowserViewOperation?.(e) ?? (() => {}),
  onBrowserViewViewportChanged: (e) => window.zcode.onBrowserViewViewportChanged?.(e) ?? (() => {}),
  onBrowserViewVisibility: (e) => window.zcode.onBrowserViewVisibility?.(e) ?? (() => {}),
  onBrowserViewCloseTab: (e) => window.zcode.onBrowserViewCloseTab?.(e) ?? (() => {}),
  onBrowserViewSuspend: (e) => window.zcode.onBrowserViewSuspend?.(e) ?? (() => {}),
  onBrowserViewRestore: (e) => window.zcode.onBrowserViewRestore?.(e) ?? (() => {}),
  browserViewAttachGuest: (e) => window.zcode.browserViewAttachGuest?.(e) ?? Promise.resolve(),
  browserViewCloseTab: (e) => window.zcode.browserViewCloseTab?.(e) ?? Promise.resolve(),
  browserViewReportResidency: (e) =>
    window.zcode.browserViewReportResidency?.(e) ?? Promise.resolve(),
  browserViewSuspendReady: (e) => window.zcode.browserViewSuspendReady?.(e) ?? Promise.resolve(),
  browserViewEnsureResident: (e) =>
    window.zcode.browserViewEnsureResident?.(e) ?? Promise.resolve(),
  browserViewRestoreTabs: (e) => window.zcode.browserViewRestoreTabs?.(e) ?? Promise.resolve([]),
  browserViewUpdateViewport: (e) =>
    window.zcode.browserViewUpdateViewport?.(e) ?? Promise.resolve(),
  importChromeBrowserData: (e) =>
    window.zcode.importChromeBrowserData?.(e) ??
    Promise.resolve({
      success: !1,
      cookies: { imported: 0, skipped: 0, failed: 0 },
      localStorage: { originsImported: 0, entriesImported: 0, originsSkipped: 0, originsFailed: 0 },
      error: `unsupported`,
    }),
  clearEmbeddedBrowserData: (e) =>
    window.zcode.clearEmbeddedBrowserData?.(e) ??
    Promise.resolve({ success: !1, error: `unsupported` }),
};
function Fe(e, t) {
  return {
    ...e,
    fileService: t.fileService,
    gitService: t.gitService,
    gitCheckpointService: t.gitCheckpointService,
    systemService: t.systemService,
    terminalService: t.terminalService,
    promptAttachmentTransferService: t.promptAttachmentTransferService,
    zcodeAgentService: t.zcodeAgentService,
    zcodeTaskService: t.zcodeTaskService,
    zcodeSessionService: t.zcodeSessionService,
    fileWatcherService: t.fileWatcherService,
    skillsService: t.skillsService,
    skillSyncService: t.skillSyncService,
    mcpSyncService: t.mcpSyncService,
    pluginSyncService: t.pluginSyncService,
    pluginsService: t.pluginsService,
    pluginManagementService: t.pluginManagementService,
    commandsService: t.commandsService,
    repoWikiService: t.repoWikiService,
  };
}
function Ie(e, t) {
  return t;
}
var V = S(),
  Le = Date.now(),
  Re = T(new URLSearchParams(window.location.search).get(De));
((window.__ZCODE_RENDERER_START__ = Le), (window.__ZCODE_LAUNCH_MARKS__ = Re), ze());
function ze() {
  ({
    BASE_URL: `./`,
    DEV: !1,
    MODE: `production`,
    PROD: !0,
    SSR: !1,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  }).VITE_ZCODE_E2E_STORE_BRIDGE === `1` &&
    Oe(
      async () => {
        let { registerE2EStoreBridges: e } = await import(`./e2eStoreBridgeBootstrap-DOKuAE2h.js`);
        return { registerE2EStoreBridges: e };
      },
      __vite__mapDeps([0, 1, 2, 3, 4, 5]),
      import.meta.url,
    ).then(({ registerE2EStoreBridges: e }) => {
      e();
    });
}
{
  let e = localStorage.getItem(`zcode-theme`) || `zai-dark`,
    t =
      e === `system`
        ? window.matchMedia(`(prefers-color-scheme: dark)`).matches
          ? `dark`
          : `light`
        : e === `dark` || e === `zai-dark`
          ? `dark`
          : `light`,
    n =
      e === `system`
        ? t === `dark`
          ? `zai-dark`
          : `zai-light`
        : e === `dark`
          ? `zai-dark`
          : e === `light`
            ? `zai-light`
            : e;
  (t === `dark` && document.documentElement.classList.add(`dark`),
    document.documentElement.classList.toggle(`theme-zai-light`, n === `zai-light`),
    document.documentElement.classList.toggle(`theme-zai-dark`, n === `zai-dark`));
}
var H = navigator.userAgent.includes(`Mac`),
  U = navigator.userAgent.includes(`Windows`),
  Be = !H && !U;
(document.documentElement.classList.toggle(`platform-mac-desktop`, H),
  document.documentElement.classList.toggle(`platform-windows-desktop`, U),
  document.documentElement.classList.toggle(`platform-linux-desktop`, Be));
var Ve = globalThis.__ZCODE_LOCAL_DEVELOPMENT_RUNTIME__ === !0;
function W(e, t) {
  let n = new URLSearchParams(window.location.search).get(e);
  return n == null ? t : n !== `false` && n !== `0`;
}
function G(e) {
  let t = new URLSearchParams(window.location.search).get(e);
  return t == null || t.trim() === `` ? void 0 : t;
}
var He = W(`restoreSession`, !0),
  K = W(`supportsSettings`, !0),
  Ue = G(`initialWorkspacePath`),
  We = G(`initialWorkspacePurpose`),
  Ge = G(`unavailableWorkspacePath`),
  Ke = G(`windowKind`),
  q = G(`locale`),
  qe = q === `zh-CN` || q === `en-US` ? q : C,
  J = null,
  Y = [],
  X = {
    canSelectFilePath: !0,
    isLocalDevelopmentRuntime: Ve,
    selectDirectory: () => window.zcode.selectDirectory(),
    selectFile: () => window.zcode.selectFile(),
    selectFiles: () => window.zcode.selectFiles?.() ?? Promise.resolve([]),
    createTempTextAttachment: (e) => window.zcode.createTempTextAttachment(e),
    onRemoteConnectionLog: (e) => window.zcode.onRemoteConnectionLog(e),
    onRemoteSessionClosed: (e) => window.zcode.onRemoteSessionClosed(e),
    onBotRemoteWorkspaceReconnected: (e) => window.zcode.onBotRemoteWorkspaceReconnected(e),
    activateOrSetWorkspace: (e) =>
      window.zcode.activateOrSetWorkspace?.(e) ?? Promise.resolve({ activated: !1 }),
    connectRemote: (e, t, n) => window.zcode.connectRemote(e, t, n),
    cancelPendingRemoteConnection: (e) =>
      window.zcode.cancelPendingRemoteConnection?.(e) ?? Promise.resolve(),
    bindRemoteWorkspaceSessionContext: (e) =>
      window.zcode.bindRemoteWorkspaceSessionContext?.(e) ?? Promise.resolve(),
    startWebRemoteControl: (e) => window.zcode.startWebRemoteControl(e),
    refreshWebRemoteControlPairing: (e) => window.zcode.refreshWebRemoteControlPairing(e),
    stopWebRemoteControl: () => window.zcode.stopWebRemoteControl(),
    getWebRemoteControlStatus: () => window.zcode.getWebRemoteControlStatus(),
    onWebRemoteControlStatusChanged: (e) =>
      window.zcode.onWebRemoteControlStatusChanged?.(e) ?? (() => {}),
    disposeRemoteSession: (e) => window.zcode.disposeRemoteSession(e),
    isDockerAvailable: () => window.zcode.isDockerAvailable(),
    listWSLDistros: () => window.zcode.listWSLDistros(),
    listDockerContainers: () => window.zcode.listDockerContainers(),
    listSSHConfigAliases: () => window.zcode.listSSHConfigAliases(),
    loadMcpFromUserDirectory: (e) => window.zcode.loadMcpFromUserDirectory(e),
    saveMcpToUserDirectory: (e) => window.zcode.saveMcpToUserDirectory(e),
    migrateLegacyCommonMcp: (e) => window.zcode.migrateLegacyCommonMcp(e),
    openExternal: (e) => window.zcode.openExternal(e),
    openFeedback: () => window.zcode.executeDesktopCommand(E.OpenFeedback),
    openCommunity: () => window.zcode.executeDesktopCommand(E.OpenCommunity),
    canOpenCommunity: (e) => window.zcode.canOpenCommunity(e),
    openInFileManager: (e) => window.zcode.openInFileManager(e),
    openCuaPermissionOnboarding: window.zcode.openCuaPermissionOnboarding
      ? (e) =>
          window.zcode.openCuaPermissionOnboarding?.(e) ??
          Promise.resolve({ success: !1, error: `not_supported` })
      : void 0,
    prepareCuaHelperPermissionDrag: window.zcode.prepareCuaHelperPermissionDrag
      ? () =>
          window.zcode.prepareCuaHelperPermissionDrag?.() ??
          Promise.resolve({ success: !1, error: `not_supported` })
      : void 0,
    startCuaHelperPermissionDrag: window.zcode.startCuaHelperPermissionDrag
      ? () => window.zcode.startCuaHelperPermissionDrag?.()
      : void 0,
    openCuaAccessibilitySettings: () =>
      window.zcode.openCuaAccessibilitySettings?.() ??
      Promise.resolve({ success: !1, error: `not_supported` }),
    registerOAuthState: (e) => window.zcode.registerOAuthState(e),
    onOAuthCallback: (e) => window.zcode.onOAuthCallback(e),
    onPaymentCallback: (e) => window.zcode.onPaymentCallback(e),
    notifyRendererReady: () => window.zcode.notifyRendererReady(),
    reportTelemetryEvent: (e) => window.zcode.reportTelemetryEvent(e),
    reportArmsCustomEvent: (e) => (Ee(e), window.zcode.reportArmsCustomEvent(e)),
    showTaskNotification: (e) => window.zcode.showTaskNotification(e),
    syncWindowTabs: (e) => window.zcode.syncWindowTabs(e),
    syncWebRemoteControlWorkspaces: (e) => window.zcode.syncWebRemoteControlWorkspaces?.(e),
    syncWebRemoteControlTasks: (e) => window.zcode.syncWebRemoteControlTasks?.(e),
    onWebRemoteControlReconnectWorkspace: (e) =>
      window.zcode.onWebRemoteControlReconnectWorkspace?.(e) ?? (() => {}),
    syncWindowUnreadCount: (e) => window.zcode.syncWindowUnreadCount(e),
    syncAppSettings: (e) => window.zcode.syncAppSettings?.(e),
    onFocusTab: (e) => window.zcode.onFocusTab(e),
    onNewTab: (e) => window.zcode.onNewTab(e),
    onCloseActiveContextRequest: (e) => window.zcode.onCloseActiveContextRequest?.(e) ?? (() => {}),
    onOpenBrowserUrl: (e) => window.zcode.onOpenBrowserUrl?.(e) ?? (() => {}),
    onBrowserViewScreenshotSurfacePrepare: (e) =>
      window.zcode.onBrowserViewScreenshotSurfacePrepare?.(e) ?? (() => {}),
    onBrowserViewScreenshotSurfaceRelease: (e) =>
      window.zcode.onBrowserViewScreenshotSurfaceRelease?.(e) ?? (() => {}),
    browserViewScreenshotSurfaceReady: (e) => window.zcode.browserViewScreenshotSurfaceReady?.(e),
    ...Pe,
    onNewTask: (e) => window.zcode.onNewTask(e),
    onOpenWorkspace: (e) => window.zcode.onOpenWorkspace?.(e) ?? (() => {}),
    onOpenWorkspacePath: (e) => window.zcode.onOpenWorkspacePath?.(e) ?? (() => {}),
    onOpenFeedbackDialog: (e) => window.zcode.onOpenFeedbackDialog?.(e) ?? (() => {}),
    onOpenTicketsPanel: (e) => window.zcode.onOpenTicketsPanel?.(e) ?? (() => {}),
    onWindowFullscreenChanged: (e) => window.zcode.onWindowFullscreenChanged(e),
    getDesktopWindowChromeState: window.zcode.getDesktopWindowChromeState
      ? () => window.zcode.getDesktopWindowChromeState()
      : void 0,
    onDesktopWindowChromeStateChanged: window.zcode.onDesktopWindowChromeStateChanged
      ? (e) => window.zcode.onDesktopWindowChromeStateChanged(e)
      : void 0,
    getWindowControlsOverlayMetrics: () => window.zcode.getWindowControlsOverlayMetrics?.() ?? null,
    onWindowControlsOverlayChanged: (e) =>
      window.zcode.onWindowControlsOverlayChanged?.(e) ?? (() => {}),
    getDesktopZoomLevel: () =>
      window.zcode.getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
    onDesktopZoomLevelChanged: (e) => window.zcode.onDesktopZoomLevelChanged?.(e) ?? (() => {}),
    onTaskNotificationClick: (e) => window.zcode.onTaskNotificationClick(e),
    exportLogs: () => window.zcode.exportLogs(),
    captureWindowScreenshot: () =>
      window.zcode.captureWindowScreenshot?.() ?? Promise.resolve(null),
    startPerformanceTrace: () => window.zcode.startPerformanceTrace(),
    stopPerformanceTrace: () => window.zcode.stopPerformanceTrace(),
    onUpdateReady: (e) => window.zcode.onUpdateReady(e),
    onUpdateCheckResult: (e) => window.zcode.onUpdateCheckResult(e),
    onUpdateStateChanged: (e) => window.zcode.onUpdateStateChanged?.(e) ?? (() => {}),
    getUpdateState: () =>
      window.zcode.getUpdateState?.() ?? Promise.resolve({ kind: `idle`, enabled: !0 }),
    downloadUpdate: () => window.zcode.downloadUpdate?.() ?? Promise.resolve(),
    cancelUpdateDownload: () => window.zcode.cancelUpdateDownload?.() ?? Promise.resolve(),
    openUpdateStatusWindow: () => window.zcode.openUpdateStatusWindow?.() ?? Promise.resolve(),
    getAutoUpdatePreferences: () =>
      window.zcode.getAutoUpdatePreferences?.() ??
      Promise.resolve({ autoDownloadAndInstallUpdates: !1 }),
    setAutoDownloadAndInstallUpdates: (e) =>
      window.zcode.setAutoDownloadAndInstallUpdates?.(e) ?? Promise.resolve(),
    getDesktopSessionActivity: () =>
      window.zcode.getDesktopSessionActivity?.() ??
      Promise.resolve({ runningAgentSessionCount: 0, runningRepoWikiTaskCount: 0 }),
    getZCodeStdioTapDevState: () =>
      window.zcode.getZCodeStdioTapDevState?.() ??
      Promise.resolve({ enabled: !1, visible: !1, logDir: ``, statePath: `` }),
    onSettingsChanged: (e) => window.zcode.onSettingsChanged?.(e) ?? (() => {}),
    onApplicationLocaleChanged: (e) => window.zcode.onApplicationLocaleChanged?.(e) ?? (() => {}),
    onPostUpdateReleaseNotes: (e) => window.zcode.onPostUpdateReleaseNotes(e),
    acknowledgePostUpdateReleaseNotes: (e) => window.zcode.acknowledgePostUpdateReleaseNotes(e),
    skipUpdateVersion: (e) => window.zcode.skipUpdateVersion?.(e) ?? Promise.resolve(),
    quitAndInstallUpdate: () => window.zcode.quitAndInstallUpdate(),
    getInstalledEditors: () => window.zcode.getInstalledEditors(),
    openInEditor: (e, t, n) => window.zcode.openInEditor(e, t, n),
    executeDesktopCommand: (e) => window.zcode.executeDesktopCommand(e),
    setApplicationLocale: (e) => window.zcode.setApplicationLocale(e),
    getSystemLocale: () =>
      window.zcode.getSystemLocale?.() ??
      Promise.resolve(navigator.language.toLowerCase().startsWith(`zh`) ? `zh-CN` : `en-US`),
    setTitleBarTheme: (e) => window.zcode.setTitleBarTheme(e),
    getDeviceId: () => window.__ZCODE_DEVICE_ID__ ?? ``,
  },
  Z = !1;
function Q(e) {
  if (!J) return;
  let t = B(e.port),
    n = e.target.kind === `server` ? Ie(J, t) : Fe(J, t);
  te({ sessionId: e.sessionId, target: e.target, services: n });
}
function Je() {
  if (!J || Y.length === 0) return;
  let e = Y.splice(0);
  for (let t of e) Q(t);
}
function $() {
  return (
    (0, Ae.useEffect)(() => {
      ((window.__ZCODE_REACT_COMMIT_AT__ = Date.now()),
        window.dispatchEvent(new Event(`zcode-react-startup-ready`)));
    }, []),
    null
  );
}
function Ye(e) {
  if (e.data === w.TaskNotificationSound) {
    u();
    return;
  }
  if (
    typeof e.data == `object` &&
    e.data !== null &&
    `type` in e.data &&
    e.data.type === w.RemoteServicePort
  ) {
    let t = e.ports[0],
      n = typeof e.data.sessionId == `string` ? e.data.sessionId : null,
      r = `target` in e.data ? e.data.target : null;
    if (!t || !n || !r) return;
    if (!J) {
      Y.push({ port: t, sessionId: n, target: r });
      return;
    }
    Q({ port: t, sessionId: n, target: r });
    return;
  }
  if (e.data !== w.ServicePort || Z) return;
  Z = !0;
  let t = e.ports[0];
  if (!t) return;
  let n = B(t);
  ((J = n), de(n), Je());
  let r = K ? n.settingService : void 0;
  (Ne({
    bridge: { syncTelemetryContext: (e) => window.zcode.syncTelemetryContext(e) },
    createRendererContext: O,
  }),
    f(X.getDeviceId()),
    d(X),
    (0, R.createRoot)(document.getElementById(`root`)).render(
      (0, V.jsx)(c, {
        isDesktop: !0,
        isMacDesktop: H,
        isWindowsDesktop: U,
        children: (0, V.jsxs)(x, {
          settingService: r,
          broadcastService: n.broadcastService,
          resolveSystemLocale: X.getSystemLocale,
          children: [
            (0, V.jsx)($, {}),
            (0, V.jsx)(me, {
              services: n,
              platform: X,
              isDesktop: !0,
              isMacDesktop: H,
              isWindowsDesktop: U,
              restoreSession: He,
              supportsSettings: K,
              initialWorkspaceAbsPath: Ue,
              initialWorkspacePurpose: We === `conversation` ? `conversation` : `project`,
              unavailableWorkspacePath: Ge,
            }),
          ],
        }),
      }),
    ));
}
(window.addEventListener(`message`, Ye),
  Ke === `update-status` &&
    (0, R.createRoot)(document.getElementById(`root`)).render(
      (0, V.jsxs)(c, {
        isDesktop: !0,
        isMacDesktop: H,
        isWindowsDesktop: U,
        children: [
          (0, V.jsx)($, {}),
          (0, V.jsx)(xe, { platform: X, initialLocale: qe, onRequestClose: () => window.close() }),
        ],
      }),
    ));
