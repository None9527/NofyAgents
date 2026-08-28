/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer 入口 chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/index-ABImDspU.js（567 行；
 *                 pretty 版 src-reconstructed/renderer/assets/index-ABImDspU.jsx 438 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原
 *    · 本 chunk 为渲染进程入口（Vite 的 index），全部 first-party，
 *      无 vendor 段；bootstrap 顺序逐语句保留。
 *    · 34 个 IPC 服务通道描述符（styles chunk 的 `PS(vt.<Service>)`）经
 *      styles-CdEGpc2x.jsx 行 32084-32135 与 src-HCld2afU.jsx 行 8574 的
 *      ServiceId 枚举（`Pb`）逐一对照命名；
 *    · src chunk 导入（RendererMessage/DesktopCommand/parseLaunchMarks/
 *      createRendererTelemetryContext 等）经 src-HCld2afU.jsx 行 6932/8612/
 *      8745/8774/8803 逐行确认。
 *
 *  行为等价声明：
 *    1) 启动闸门三段式（logo 动画结束 || 1s 超时；React 就绪事件 || 3s 超时；
 *       两者齐备后加 `zcode-startup-ready` 并于 500ms 后移除 #loading）、
 *       update-status 窗口直通逻辑逐字保留；
 *    2) message 端口握手：主端口一次性（Z 闭锁）、会话端口在基础服务
 *       未就绪时入队（Y）待 flush，target.kind==='server' 时直接使用
 *       服务端代理（Ie），否则合并会话服务（Fe）；
 *    3) 主题引导（zcode-theme: system/dark/light/zai-*）、平台类名
 *       （Mac/Windows/Linux）、查询参数裁决（restoreSession/supportsSettings/
 *       initialWorkspacePath/...）逐字保留；
 *    4) E2E store 桥仅在 VITE_ZCODE_E2E_STORE_BRIDGE==='1' 时动态加载。
 *  唯一文本级差异：逗号表达式展开为语句，无可观察差异。
 * ════════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
// @ts-expect-error 原始构建产物为 minified JS、无类型声明
import { P as reactDomClient } from '../../out/renderer/assets/imeComposition-DEYFkwWm.js';
// @ts-expect-error IntlProvider chunk 导出 t = ZCodeIntlProvider
import { t as ZCodeIntlProvider } from '../../out/renderer/assets/IntlProvider-C321H7m8.js';
// @ts-expect-error preload-helper 导出 t = 动态 import 预加载器
import { t as preloadModule } from '../../out/renderer/assets/preload-helper-BHSF1fZ9.js';
// @ts-expect-error src chunk：Ps=缺省语言, St=渲染进程消息枚举, ct=解析启动标记, ft=桌面命令枚举, no=传输分帧限制, st=启动标记查询参数名, ut=创建遥测上下文
import {
  Ps as DEFAULT_LOCALE,
  St as RendererMessage,
  ct as parseLaunchMarks,
  ft as DesktopCommand,
  no as transportFrameLimits,
  st as LAUNCH_MARKS_QUERY_PARAM,
  ut as createRendererTelemetryContext,
} from '../../out/renderer/assets/src-HCld2afU.js';
// @ts-expect-error styles 主 chunk：应用外壳/服务通道/协议客户端等（别名映射见尾符号表）
import {
  A as zcodeSessionChannel,
  B as fileChannel,
  C as modelProviderChannel,
  D as memoryChannel,
  E as outputStyleChannel,
  F as settingChannel,
  G as MessagePortChannelClient,
  H as registerRemoteSession,
  I as terminalChannel,
  L as systemChannel,
  M as zcodeTaskChannel,
  N as broadcastChannel,
  O as hooksChannel,
  P as credentialChannel,
  R as gitCheckpointChannel,
  S as usageStatsChannel,
  T as fileWatcherChannel,
  U as ServiceProxy,
  V as registerBaseServices,
  W as ProtocolClient,
  _ as mcpSyncChannel,
  a as ZCodeApp,
  b as offPeakTaskChannel,
  c as promptAttachmentTransferChannel,
  d as settingsSyncChannel,
  f as commandsChannel,
  g as pluginSyncChannel,
  h as pluginsChannel,
  i as UpdateStatusWindow,
  j as zcodeAgentChannel,
  k as botsChannel,
  l as repoWikiChannel,
  m as pluginManagementChannel,
  n as recordArmsCustomEvent,
  o as AppProviders,
  p as subagentsChannel,
  r as playTaskNotificationSound,
  s as setPlatformBridge,
  t as setRendererDeviceId,
  u as feedbackChannel,
  v as skillSyncChannel,
  w as oauthChannel,
  x as codingPlanSubscriptionChannel,
  y as skillsChannel,
  z as gitChannel,
} from '../../out/renderer/assets/styles-CdEGpc2x.js';

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/** 服务通道描述符（仅含通道名）。 */
interface ServiceChannelDescriptor {
  channelName: string;
}
/** MessagePort 上的协议客户端（由 ProtocolClient 包装）。 */
type ServiceClient = any;
/** 主进程暴露的桌面桥。 // TODO(infer): 完整接口在 preload 脚本，按用法建模。 */
type DesktopBridge = any;

declare global {
  interface Window {
    zcode: DesktopBridge;
    __ZCODE_RENDERER_START__?: number;
    __ZCODE_LAUNCH_MARKS__?: Record<string, number> | null;
    __ZCODE_REACT_COMMIT_AT__?: number;
    __ZCODE_DEVICE_ID__?: string;
    __ZCODE_LOCAL_DEVELOPMENT_RUNTIME__?: boolean;
    __zcodeArmsCustomEventsE2E?: unknown[];
  }
}

/* ════════════════════════ 1. 启动闸门（splash 与 React 就绪的汇合） ════════════════════════ */

const startupLogoShell = document.querySelector('.startup-logo-shell');
const loadingOverlay = document.getElementById('loading');
const isUpdateStatusWindow = new URLSearchParams(window.location.search).get('windowKind') === 'update-status';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let startupClassApplied = false;
let logoAnimationDone = false;
let reactStartupDone = false;

/** 两路信号齐备后标记启动完成：加类名，500ms 后移除 #loading 遮罩。 */
const markStartupReadyIfComplete = () => {
  if (startupClassApplied || !logoAnimationDone || !reactStartupDone) return;
  startupClassApplied = true;
  document.body.classList.add('zcode-startup-ready');
  window.setTimeout(() => loadingOverlay?.remove(), 500);
};
/** logo 动画结束（或超时/不需要动画）信号。 */
const markLogoAnimationDone = () => {
  logoAnimationDone = true;
  markStartupReadyIfComplete();
};
/** React 首帧提交信号。 */
const markReactStartupDone = () => {
  reactStartupDone = true;
  markStartupReadyIfComplete();
};

if (isUpdateStatusWindow) {
  // 更新状态小窗：跳过 splash，直接就绪
  startupClassApplied = true;
  document.body.classList.add('zcode-startup-ready');
  loadingOverlay?.remove();
} else {
  window.addEventListener('zcode-react-startup-ready', markReactStartupDone, { once: true });
}
if (isUpdateStatusWindow || prefersReducedMotion || !startupLogoShell) {
  markLogoAnimationDone();
} else {
  startupLogoShell.addEventListener('animationend', markLogoAnimationDone, { once: true });
  window.setTimeout(markLogoAnimationDone, 1000);
}
if (!isUpdateStatusWindow) window.setTimeout(markReactStartupDone, 3000);

/* ════════════════════════ 2. 服务注册表（34 个 IPC 服务） ════════════════════════ */

/**
 * 渲染进程服务注册表：把 MessagePort 上的协议客户端按通道名映射为
 * 34 个类型化服务代理（经 ServiceProxy.toService 的 Proxy 化调用）。
 */
class RendererServiceRegistry {
  fileService: ServiceClient;
  gitService: ServiceClient;
  gitCheckpointService: ServiceClient;
  systemService: ServiceClient;
  terminalService: ServiceClient;
  settingService: ServiceClient;
  credentialService: ServiceClient;
  broadcastService: ServiceClient;
  zcodeTaskService: ServiceClient;
  zcodeAgentService: ServiceClient;
  zcodeSessionService: ServiceClient;
  botsService: ServiceClient;
  fileWatcherService: ServiceClient;
  oauthService: ServiceClient;
  modelProviderService: ServiceClient;
  usageStatsService: ServiceClient;
  codingPlanSubscriptionService: ServiceClient;
  offPeakTaskService: ServiceClient;
  skillsService: ServiceClient;
  skillSyncService: ServiceClient;
  mcpSyncService: ServiceClient;
  pluginSyncService: ServiceClient;
  pluginsService: ServiceClient;
  pluginManagementService: ServiceClient;
  subagentsService: ServiceClient;
  commandsService: ServiceClient;
  hooksService: ServiceClient;
  memoryService: ServiceClient;
  outputStyleService: ServiceClient;
  settingsSyncService: ServiceClient;
  feedbackService: ServiceClient;
  repoWikiService: ServiceClient;
  promptAttachmentTransferService: ServiceClient;
  constructor(client: any) {
    this.fileService = ServiceProxy.toService(client.getChannel(fileChannel.channelName));
    this.gitService = ServiceProxy.toService(client.getChannel(gitChannel.channelName));
    this.gitCheckpointService = ServiceProxy.toService(client.getChannel(gitCheckpointChannel.channelName));
    this.systemService = ServiceProxy.toService(client.getChannel(systemChannel.channelName));
    this.terminalService = ServiceProxy.toService(client.getChannel(terminalChannel.channelName));
    this.settingService = ServiceProxy.toService(client.getChannel(settingChannel.channelName));
    this.credentialService = ServiceProxy.toService(client.getChannel(credentialChannel.channelName));
    this.broadcastService = ServiceProxy.toService(client.getChannel(broadcastChannel.channelName));
    this.zcodeTaskService = ServiceProxy.toService(client.getChannel(zcodeTaskChannel.channelName));
    this.zcodeAgentService = ServiceProxy.toService(client.getChannel(zcodeAgentChannel.channelName));
    this.zcodeSessionService = ServiceProxy.toService(client.getChannel(zcodeSessionChannel.channelName));
    this.botsService = ServiceProxy.toService(client.getChannel(botsChannel.channelName));
    this.fileWatcherService = ServiceProxy.toService(client.getChannel(fileWatcherChannel.channelName));
    this.oauthService = ServiceProxy.toService(client.getChannel(oauthChannel.channelName));
    this.modelProviderService = ServiceProxy.toService(client.getChannel(modelProviderChannel.channelName));
    this.usageStatsService = ServiceProxy.toService(client.getChannel(usageStatsChannel.channelName));
    this.codingPlanSubscriptionService = ServiceProxy.toService(client.getChannel(codingPlanSubscriptionChannel.channelName));
    this.offPeakTaskService = ServiceProxy.toService(client.getChannel(offPeakTaskChannel.channelName));
    this.skillsService = ServiceProxy.toService(client.getChannel(skillsChannel.channelName));
    this.skillSyncService = ServiceProxy.toService(client.getChannel(skillSyncChannel.channelName));
    this.mcpSyncService = ServiceProxy.toService(client.getChannel(mcpSyncChannel.channelName));
    this.pluginSyncService = ServiceProxy.toService(client.getChannel(pluginSyncChannel.channelName));
    this.pluginsService = ServiceProxy.toService(client.getChannel(pluginsChannel.channelName));
    this.pluginManagementService = ServiceProxy.toService(client.getChannel(pluginManagementChannel.channelName));
    this.subagentsService = ServiceProxy.toService(client.getChannel(subagentsChannel.channelName));
    this.commandsService = ServiceProxy.toService(client.getChannel(commandsChannel.channelName));
    this.hooksService = ServiceProxy.toService(client.getChannel(hooksChannel.channelName));
    this.memoryService = ServiceProxy.toService(client.getChannel(memoryChannel.channelName));
    this.outputStyleService = ServiceProxy.toService(client.getChannel(outputStyleChannel.channelName));
    this.settingsSyncService = ServiceProxy.toService(client.getChannel(settingsSyncChannel.channelName));
    this.feedbackService = ServiceProxy.toService(client.getChannel(feedbackChannel.channelName));
    this.repoWikiService = ServiceProxy.toService(client.getChannel(repoWikiChannel.channelName));
    this.promptAttachmentTransferService = ServiceProxy.toService(client.getChannel(promptAttachmentTransferChannel.channelName));
  }
}

/* ─────────────────────────── 3. 启动日志与端口连接 ─────────────────────────── */

/** 构建期 env 快照（与 logger 模块同一对象）。 */
const RENDERER_ENV = {
  BASE_URL: `./`,
  DEV: !1,
  MODE: `production`,
  PROD: !0,
  SSR: !1,
  VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
  VITE_ZCODE_E2E_STORE_BRIDGE: ``,
  VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
};

/** 启动期日志禁用判定（生产构建恒禁用；与 logger 模块同逻辑的本地副本）。 */
function isStartupLoggingDisabled(): boolean {
  return globalThis.__ZCODE_RENDERER_DISABLE_LOGGING__ === true || RENDERER_ENV.PROD === true;
}
/** 启动期日志（直接 console，不走 logger 模块——避免循环依赖）。 */
function startupLog(message: string): void {
  if (!isStartupLoggingDisabled()) console.log(message);
}

/** 经 MessagePort 建立协议客户端与服务注册表。 */
function connectViaMessagePort(port: MessagePort): RendererServiceRegistry {
  startupLog(`[connectViaMessagePort] creating protocol and client...`);
  const client = new ProtocolClient(new MessagePortChannelClient(port));
  client.onDidInitialize(() => {
    startupLog(`[connectViaMessagePort] ChannelClient received Initialize from server`);
  });
  startupLog(`[connectViaMessagePort] client created, wait for Initialize...`);
  return new RendererServiceRegistry(client);
}

// 传输分帧限制（本入口仅引用 assemblyTimeoutMs 作存在性断言，保留原语句）。
void transportFrameLimits.assemblyTimeoutMs;

/** 把遥测上下文同步给主进程桥。 */
function syncTelemetryContext({ bridge, createRendererContext }: { bridge: { syncTelemetryContext: (ctx: unknown) => void }; createRendererContext: () => unknown }) {
  bridge.syncTelemetryContext(createRendererContext());
}

/* ════════════════════════ 4. 平台桥（window.zcode 门面） ════════════════════════ */

/**
 * 内嵌浏览器子桥：全部方法走 window.zcode 可选链，
 * 缺失能力时返回安全缺省（不支持/空结果）。
 */
const embeddedBrowserPlatformBridge = {
  getPathForFile: (file: unknown) => window.zcode.getPathForFile?.(file) ?? null,
  saveFile: (payload: unknown) =>
    window.zcode.saveFile?.(payload) ?? Promise.resolve({ success: false, error: 'not_supported' }),
  printPageToPdf: window.zcode.printPageToPdf ? () => window.zcode.printPageToPdf() : undefined,
  onBrowserViewReady: (handler: unknown) => window.zcode.onBrowserViewReady?.(handler) ?? (() => {}),
  onBrowserViewOperation: (handler: unknown) => window.zcode.onBrowserViewOperation?.(handler) ?? (() => {}),
  onBrowserViewViewportChanged: (handler: unknown) => window.zcode.onBrowserViewViewportChanged?.(handler) ?? (() => {}),
  onBrowserViewVisibility: (handler: unknown) => window.zcode.onBrowserViewVisibility?.(handler) ?? (() => {}),
  onBrowserViewCloseTab: (handler: unknown) => window.zcode.onBrowserViewCloseTab?.(handler) ?? (() => {}),
  onBrowserViewSuspend: (handler: unknown) => window.zcode.onBrowserViewSuspend?.(handler) ?? (() => {}),
  onBrowserViewRestore: (handler: unknown) => window.zcode.onBrowserViewRestore?.(handler) ?? (() => {}),
  browserViewAttachGuest: (payload: unknown) => window.zcode.browserViewAttachGuest?.(payload) ?? Promise.resolve(),
  browserViewCloseTab: (payload: unknown) => window.zcode.browserViewCloseTab?.(payload) ?? Promise.resolve(),
  browserViewReportResidency: (payload: unknown) => window.zcode.browserViewReportResidency?.(payload) ?? Promise.resolve(),
  browserViewSuspendReady: (payload: unknown) => window.zcode.browserViewSuspendReady?.(payload) ?? Promise.resolve(),
  browserViewEnsureResident: (payload: unknown) => window.zcode.browserViewEnsureResident?.(payload) ?? Promise.resolve(),
  browserViewRestoreTabs: (payload: unknown) => window.zcode.browserViewRestoreTabs?.(payload) ?? Promise.resolve([]),
  browserViewUpdateViewport: (payload: unknown) => window.zcode.browserViewUpdateViewport?.(payload) ?? Promise.resolve(),
  importChromeBrowserData: (payload: unknown) =>
    window.zcode.importChromeBrowserData?.(payload) ??
    Promise.resolve({
      success: false,
      cookies: { imported: 0, skipped: 0, failed: 0 },
      localStorage: { originsImported: 0, entriesImported: 0, originsSkipped: 0, originsFailed: 0 },
      error: 'unsupported',
    }),
  clearEmbeddedBrowserData: (payload: unknown) =>
    window.zcode.clearEmbeddedBrowserData?.(payload) ?? Promise.resolve({ success: false, error: 'unsupported' }),
};

/** 会话建立时把会话级服务并入基础服务（远端会话用）。 */
function createSessionServices(baseServices: unknown, registry: RendererServiceRegistry) {
  return {
    ...baseServices,
    fileService: registry.fileService,
    gitService: registry.gitService,
    gitCheckpointService: registry.gitCheckpointService,
    systemService: registry.systemService,
    terminalService: registry.terminalService,
    promptAttachmentTransferService: registry.promptAttachmentTransferService,
    zcodeAgentService: registry.zcodeAgentService,
    zcodeTaskService: registry.zcodeTaskService,
    zcodeSessionService: registry.zcodeSessionService,
    fileWatcherService: registry.fileWatcherService,
    skillsService: registry.skillsService,
    skillSyncService: registry.skillSyncService,
    mcpSyncService: registry.mcpSyncService,
    pluginSyncService: registry.pluginSyncService,
    pluginsService: registry.pluginsService,
    pluginManagementService: registry.pluginManagementService,
    commandsService: registry.commandsService,
    repoWikiService: registry.repoWikiService,
  };
}

/** server 目标：直接使用基础服务（不合并会话服务）。 */
function useServerServicesDirectly(baseServices: unknown, _registry: RendererServiceRegistry) {
  return baseServices;
}

/* ════════════════════════ 5. 启动标记 / E2E 桥 / 主题 / 平台类名 ════════════════════════ */

const RENDERER_START_TIMESTAMP = Date.now();
const launchMarks = parseLaunchMarks(new URLSearchParams(window.location.search).get(LAUNCH_MARKS_QUERY_PARAM));

window.__ZCODE_RENDERER_START__ = RENDERER_START_TIMESTAMP;
window.__ZCODE_LAUNCH_MARKS__ = launchMarks;
registerE2EStoreBridgesIfEnabled();

/** 仅当 VITE_ZCODE_E2E_STORE_BRIDGE==='1' 时动态加载并注册 E2E store 桥。 */
function registerE2EStoreBridgesIfEnabled() {
  if (RENDERER_ENV.VITE_ZCODE_E2E_STORE_BRIDGE !== '1') return;
  preloadModule(
    async () => {
      const { registerE2EStoreBridges } = await import('../../out/renderer/assets/e2eStoreBridgeBootstrap-DOKuAE2h.js');
      return { registerE2EStoreBridges };
    },
    [
      './e2eStoreBridgeBootstrap-DOKuAE2h.js',
      './skillStore-BmeKHDBI.js',
      './chunk-Cq_f4orQ.js',
      './react-BQLj9xdT.js',
      './src-HCld2afU.js',
      './logger-PFDwl5Yq.js',
    ],
    import.meta.url,
  ).then(({ registerE2EStoreBridges }) => {
    registerE2EStoreBridges();
  });
}

{
  // 主题引导：在任何 React 渲染前按 localStorage 的 zcode-theme 落类名，避免闪烁
  const storedTheme = localStorage.getItem('zcode-theme') || 'zai-dark';
  const resolvedScheme =
    storedTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : storedTheme === 'dark' || storedTheme === 'zai-dark'
        ? 'dark'
        : 'light';
  const resolvedTheme =
    storedTheme === 'system'
      ? resolvedScheme === 'dark'
        ? 'zai-dark'
        : 'zai-light'
      : storedTheme === 'dark'
        ? 'zai-dark'
        : storedTheme === 'light'
          ? 'zai-light'
          : storedTheme;
  if (resolvedScheme === 'dark') document.documentElement.classList.add('dark');
  document.documentElement.classList.toggle('theme-zai-light', resolvedTheme === 'zai-light');
  document.documentElement.classList.toggle('theme-zai-dark', resolvedTheme === 'zai-dark');
}

const isMacDesktop = navigator.userAgent.includes('Mac');
const isWindowsDesktop = navigator.userAgent.includes('Windows');
const isLinuxDesktop = !isMacDesktop && !isWindowsDesktop;
document.documentElement.classList.toggle('platform-mac-desktop', isMacDesktop);
document.documentElement.classList.toggle('platform-windows-desktop', isWindowsDesktop);
document.documentElement.classList.toggle('platform-linux-desktop', isLinuxDesktop);

/* ════════════════════════ 6. 查询参数裁决 ════════════════════════ */

const isLocalDevelopmentRuntime = globalThis.__ZCODE_LOCAL_DEVELOPMENT_RUNTIME__ === true;

/** 布尔查询参数：缺省取 fallback；'false'/'0' 为假，其余非空为真。 */
function getBooleanQueryParam(name: string, fallback: boolean): boolean {
  const raw = new URLSearchParams(window.location.search).get(name);
  if (raw == null) return fallback;
  return raw !== 'false' && raw !== '0';
}
/** 字符串查询参数：空串视为未提供。 */
function getStringQueryParam(name: string): string | undefined {
  const raw = new URLSearchParams(window.location.search).get(name);
  if (raw == null || raw.trim() === '') return undefined;
  return raw;
}

const restoreSession = getBooleanQueryParam('restoreSession', true);
const supportsSettings = getBooleanQueryParam('supportsSettings', true);
const initialWorkspacePath = getStringQueryParam('initialWorkspacePath');
const initialWorkspacePurpose = getStringQueryParam('initialWorkspacePurpose');
const unavailableWorkspacePath = getStringQueryParam('unavailableWorkspacePath');
const windowKind = getStringQueryParam('windowKind');
const localeParam = getStringQueryParam('locale');
const initialLocale = localeParam === 'zh-CN' || localeParam === 'en-US' ? localeParam : DEFAULT_LOCALE;

/* ════════════════════════ 7. 桌面平台桥（完整门面） ════════════════════════ */

/**
 * 桌面平台桥：渲染进程访问 Electron 主进程能力的唯一门面。
 * 逐方法透传 window.zcode（preload 注入），方法清单与原码一一对应。
 * // TODO(infer): 各方法参数/返回类型未建模（接口在 preload 脚本）。
 */
const desktopPlatformBridge = {
  canSelectFilePath: true,
  isLocalDevelopmentRuntime,
  selectDirectory: () => window.zcode.selectDirectory(),
  selectFile: () => window.zcode.selectFile(),
  selectFiles: () => window.zcode.selectFiles?.() ?? Promise.resolve([]),
  createTempTextAttachment: (payload: unknown) => window.zcode.createTempTextAttachment(payload),
  onRemoteConnectionLog: (handler: unknown) => window.zcode.onRemoteConnectionLog(handler),
  onRemoteSessionClosed: (handler: unknown) => window.zcode.onRemoteSessionClosed(handler),
  onBotRemoteWorkspaceReconnected: (handler: unknown) => window.zcode.onBotRemoteWorkspaceReconnected(handler),
  activateOrSetWorkspace: (payload: unknown) => window.zcode.activateOrSetWorkspace?.(payload) ?? Promise.resolve({ activated: false }),
  connectRemote: (a: unknown, b: unknown, c: unknown) => window.zcode.connectRemote(a, b, c),
  cancelPendingRemoteConnection: (payload: unknown) => window.zcode.cancelPendingRemoteConnection?.(payload) ?? Promise.resolve(),
  bindRemoteWorkspaceSessionContext: (payload: unknown) => window.zcode.bindRemoteWorkspaceSessionContext?.(payload) ?? Promise.resolve(),
  startWebRemoteControl: (payload: unknown) => window.zcode.startWebRemoteControl(payload),
  refreshWebRemoteControlPairing: (payload: unknown) => window.zcode.refreshWebRemoteControlPairing(payload),
  stopWebRemoteControl: () => window.zcode.stopWebRemoteControl(),
  getWebRemoteControlStatus: () => window.zcode.getWebRemoteControlStatus(),
  onWebRemoteControlStatusChanged: (handler: unknown) => window.zcode.onWebRemoteControlStatusChanged?.(handler) ?? (() => {}),
  disposeRemoteSession: (payload: unknown) => window.zcode.disposeRemoteSession(payload),
  isDockerAvailable: () => window.zcode.isDockerAvailable(),
  listWSLDistros: () => window.zcode.listWSLDistros(),
  listDockerContainers: () => window.zcode.listDockerContainers(),
  listSSHConfigAliases: () => window.zcode.listSSHConfigAliases(),
  loadMcpFromUserDirectory: (payload: unknown) => window.zcode.loadMcpFromUserDirectory(payload),
  saveMcpToUserDirectory: (payload: unknown) => window.zcode.saveMcpToUserDirectory(payload),
  migrateLegacyCommonMcp: (payload: unknown) => window.zcode.migrateLegacyCommonMcp(payload),
  openExternal: (payload: unknown) => window.zcode.openExternal(payload),
  openFeedback: () => window.zcode.executeDesktopCommand(DesktopCommand.OpenFeedback),
  openCommunity: () => window.zcode.executeDesktopCommand(DesktopCommand.OpenCommunity),
  canOpenCommunity: (payload: unknown) => window.zcode.canOpenCommunity(payload),
  openInFileManager: (payload: unknown) => window.zcode.openInFileManager(payload),
  openCuaPermissionOnboarding: window.zcode.openCuaPermissionOnboarding
    ? (payload: unknown) => window.zcode.openCuaPermissionOnboarding?.(payload) ?? Promise.resolve({ success: false, error: 'not_supported' })
    : undefined,
  prepareCuaHelperPermissionDrag: window.zcode.prepareCuaHelperPermissionDrag
    ? () => window.zcode.prepareCuaHelperPermissionDrag?.() ?? Promise.resolve({ success: false, error: 'not_supported' })
    : undefined,
  startCuaHelperPermissionDrag: window.zcode.startCuaHelperPermissionDrag ? () => window.zcode.startCuaHelperPermissionDrag?.() : undefined,
  openCuaAccessibilitySettings: () => window.zcode.openCuaAccessibilitySettings?.() ?? Promise.resolve({ success: false, error: 'not_supported' }),
  registerOAuthState: (payload: unknown) => window.zcode.registerOAuthState(payload),
  onOAuthCallback: (handler: unknown) => window.zcode.onOAuthCallback(handler),
  onPaymentCallback: (handler: unknown) => window.zcode.onPaymentCallback(handler),
  notifyRendererReady: () => window.zcode.notifyRendererReady(),
  reportTelemetryEvent: (payload: unknown) => window.zcode.reportTelemetryEvent(payload),
  reportArmsCustomEvent: (payload: unknown) => {
    recordArmsCustomEvent(payload);
    return window.zcode.reportArmsCustomEvent(payload);
  },
  showTaskNotification: (payload: unknown) => window.zcode.showTaskNotification(payload),
  syncWindowTabs: (payload: unknown) => window.zcode.syncWindowTabs(payload),
  syncWebRemoteControlWorkspaces: (payload: unknown) => window.zcode.syncWebRemoteControlWorkspaces?.(payload),
  syncWebRemoteControlTasks: (payload: unknown) => window.zcode.syncWebRemoteControlTasks?.(payload),
  onWebRemoteControlReconnectWorkspace: (handler: unknown) => window.zcode.onWebRemoteControlReconnectWorkspace?.(handler) ?? (() => {}),
  syncWindowUnreadCount: (payload: unknown) => window.zcode.syncWindowUnreadCount(payload),
  syncAppSettings: (payload: unknown) => window.zcode.syncAppSettings?.(payload),
  onFocusTab: (handler: unknown) => window.zcode.onFocusTab(handler),
  onNewTab: (handler: unknown) => window.zcode.onNewTab(handler),
  onCloseActiveContextRequest: (handler: unknown) => window.zcode.onCloseActiveContextRequest?.(handler) ?? (() => {}),
  onOpenBrowserUrl: (handler: unknown) => window.zcode.onOpenBrowserUrl?.(handler) ?? (() => {}),
  onBrowserViewScreenshotSurfacePrepare: (handler: unknown) => window.zcode.onBrowserViewScreenshotSurfacePrepare?.(handler) ?? (() => {}),
  onBrowserViewScreenshotSurfaceRelease: (handler: unknown) => window.zcode.onBrowserViewScreenshotSurfaceRelease?.(handler) ?? (() => {}),
  browserViewScreenshotSurfaceReady: (payload: unknown) => window.zcode.browserViewScreenshotSurfaceReady?.(payload),
  ...embeddedBrowserPlatformBridge,
  onNewTask: (handler: unknown) => window.zcode.onNewTask(handler),
  onOpenWorkspace: (handler: unknown) => window.zcode.onOpenWorkspace?.(handler) ?? (() => {}),
  onOpenWorkspacePath: (handler: unknown) => window.zcode.onOpenWorkspacePath?.(handler) ?? (() => {}),
  onOpenFeedbackDialog: (handler: unknown) => window.zcode.onOpenFeedbackDialog?.(handler) ?? (() => {}),
  onOpenTicketsPanel: (handler: unknown) => window.zcode.onOpenTicketsPanel?.(handler) ?? (() => {}),
  onWindowFullscreenChanged: (handler: unknown) => window.zcode.onWindowFullscreenChanged(handler),
  getDesktopWindowChromeState: window.zcode.getDesktopWindowChromeState ? () => window.zcode.getDesktopWindowChromeState() : undefined,
  onDesktopWindowChromeStateChanged: window.zcode.onDesktopWindowChromeStateChanged
    ? (handler: unknown) => window.zcode.onDesktopWindowChromeStateChanged(handler)
    : undefined,
  getWindowControlsOverlayMetrics: () => window.zcode.getWindowControlsOverlayMetrics?.() ?? null,
  onWindowControlsOverlayChanged: (handler: unknown) => window.zcode.onWindowControlsOverlayChanged?.(handler) ?? (() => {}),
  getDesktopZoomLevel: () => window.zcode.getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
  onDesktopZoomLevelChanged: (handler: unknown) => window.zcode.onDesktopZoomLevelChanged?.(handler) ?? (() => {}),
  onTaskNotificationClick: (handler: unknown) => window.zcode.onTaskNotificationClick(handler),
  exportLogs: () => window.zcode.exportLogs(),
  captureWindowScreenshot: () => window.zcode.captureWindowScreenshot?.() ?? Promise.resolve(null),
  startPerformanceTrace: () => window.zcode.startPerformanceTrace(),
  stopPerformanceTrace: () => window.zcode.stopPerformanceTrace(),
  onUpdateReady: (handler: unknown) => window.zcode.onUpdateReady(handler),
  onUpdateCheckResult: (handler: unknown) => window.zcode.onUpdateCheckResult(handler),
  onUpdateStateChanged: (handler: unknown) => window.zcode.onUpdateStateChanged?.(handler) ?? (() => {}),
  getUpdateState: () => window.zcode.getUpdateState?.() ?? Promise.resolve({ kind: 'idle', enabled: true }),
  downloadUpdate: () => window.zcode.downloadUpdate?.() ?? Promise.resolve(),
  cancelUpdateDownload: () => window.zcode.cancelUpdateDownload?.() ?? Promise.resolve(),
  openUpdateStatusWindow: () => window.zcode.openUpdateStatusWindow?.() ?? Promise.resolve(),
  getAutoUpdatePreferences: () => window.zcode.getAutoUpdatePreferences?.() ?? Promise.resolve({ autoDownloadAndInstallUpdates: false }),
  setAutoDownloadAndInstallUpdates: (payload: unknown) => window.zcode.setAutoDownloadAndInstallUpdates?.(payload) ?? Promise.resolve(),
  getDesktopSessionActivity: () =>
    window.zcode.getDesktopSessionActivity?.() ?? Promise.resolve({ runningAgentSessionCount: 0, runningRepoWikiTaskCount: 0 }),
  getZCodeStdioTapDevState: () =>
    window.zcode.getZCodeStdioTapDevState?.() ?? Promise.resolve({ enabled: false, visible: false, logDir: '', statePath: '' }),
  onSettingsChanged: (handler: unknown) => window.zcode.onSettingsChanged?.(handler) ?? (() => {}),
  onApplicationLocaleChanged: (handler: unknown) => window.zcode.onApplicationLocaleChanged?.(handler) ?? (() => {}),
  onPostUpdateReleaseNotes: (handler: unknown) => window.zcode.onPostUpdateReleaseNotes(handler),
  acknowledgePostUpdateReleaseNotes: (payload: unknown) => window.zcode.acknowledgePostUpdateReleaseNotes(payload),
  skipUpdateVersion: (payload: unknown) => window.zcode.skipUpdateVersion?.(payload) ?? Promise.resolve(),
  quitAndInstallUpdate: () => window.zcode.quitAndInstallUpdate(),
  getInstalledEditors: () => window.zcode.getInstalledEditors(),
  openInEditor: (a: unknown, b: unknown, c: unknown) => window.zcode.openInEditor(a, b, c),
  executeDesktopCommand: (command: unknown) => window.zcode.executeDesktopCommand(command),
  setApplicationLocale: (payload: unknown) => window.zcode.setApplicationLocale(payload),
  getSystemLocale: () =>
    window.zcode.getSystemLocale?.() ?? Promise.resolve(navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'),
  setTitleBarTheme: (payload: unknown) => window.zcode.setTitleBarTheme(payload),
  getDeviceId: () => window.__ZCODE_DEVICE_ID__ ?? '',
};

/* ════════════════════════ 8. 端口握手与根渲染 ════════════════════════ */

/** 基础服务注册表（主端口建立后赋值）。 */
let baseServices: RendererServiceRegistry | null = null;
/** 基础服务未就绪期间到达的会话端口队列。 */
const pendingSessionPortQueue: Array<{ port: MessagePort; sessionId: string; target: { kind: string } }> = [];
/** 主端口是否已处理（一次性闭锁）。 */
let mainPortHandled = false;

/** 处理单个会话服务端口：按 target 合并服务后注册会话。 */
function handleSessionServicePort(message: { port: MessagePort; sessionId: string; target: { kind: string } }) {
  if (!baseServices) return;
  const registry = connectViaMessagePort(message.port);
  const services = message.target.kind === 'server' ? useServerServicesDirectly(baseServices, registry) : createSessionServices(baseServices, registry);
  registerRemoteSession({ sessionId: message.sessionId, target: message.target, services });
}

/** 基础服务就绪后清空会话端口队列。 */
function flushPendingSessionPorts() {
  if (!baseServices || pendingSessionPortQueue.length === 0) return;
  const pending = pendingSessionPortQueue.splice(0);
  for (const item of pending) handleSessionServicePort(item);
}

/** React 首帧提交标记组件：记录提交时刻并派发启动就绪事件。 */
function ReactStartupReadyMarker() {
  React.useEffect(() => {
    window.__ZCODE_REACT_COMMIT_AT__ = Date.now();
    window.dispatchEvent(new Event('zcode-react-startup-ready'));
  }, []);
  return null;
}

/** window message 总分发：任务提示音 / 会话端口 / 主端口。 */
function handleWindowMessage(event: MessageEvent) {
  if (event.data === RendererMessage.TaskNotificationSound) {
    playTaskNotificationSound();
    return;
  }
  if (typeof event.data === 'object' && event.data !== null && 'type' in event.data && event.data.type === RendererMessage.RemoteServicePort) {
    const port = event.ports[0];
    const sessionId = typeof event.data.sessionId === 'string' ? event.data.sessionId : null;
    const target = 'target' in event.data ? event.data.target : null;
    if (!port || !sessionId || !target) return;
    if (!baseServices) {
      pendingSessionPortQueue.push({ port, sessionId, target });
      return;
    }
    handleSessionServicePort({ port, sessionId, target });
    return;
  }
  if (event.data !== RendererMessage.ServicePort || mainPortHandled) return;
  mainPortHandled = true;
  const port = event.ports[0];
  if (!port) return;
  const registry = connectViaMessagePort(port);
  baseServices = registry;
  registerBaseServices(registry);
  flushPendingSessionPorts();
  const settingServiceForIntl = supportsSettings ? registry.settingService : undefined;
  syncTelemetryContext({
    bridge: { syncTelemetryContext: (ctx: unknown) => window.zcode.syncTelemetryContext(ctx) },
    createRendererContext: createRendererTelemetryContext,
  });
  setRendererDeviceId(desktopPlatformBridge.getDeviceId());
  setPlatformBridge(desktopPlatformBridge);
  reactDomClient.createRoot(document.getElementById('root')).render(
    <AppProviders isDesktop isMacDesktop={isMacDesktop} isWindowsDesktop={isWindowsDesktop}>
      <ZCodeIntlProvider
        settingService={settingServiceForIntl}
        broadcastService={registry.broadcastService}
        resolveSystemLocale={desktopPlatformBridge.getSystemLocale}
      >
        <ReactStartupReadyMarker />
        <ZCodeApp
          services={registry}
          platform={desktopPlatformBridge}
          isDesktop
          isMacDesktop={isMacDesktop}
          isWindowsDesktop={isWindowsDesktop}
          restoreSession={restoreSession}
          supportsSettings={supportsSettings}
          initialWorkspaceAbsPath={initialWorkspacePath}
          initialWorkspacePurpose={initialWorkspacePurpose === 'conversation' ? 'conversation' : 'project'}
          unavailableWorkspacePath={unavailableWorkspacePath}
        />
      </ZCodeIntlProvider>
    </AppProviders>,
  );
}

window.addEventListener('message', handleWindowMessage);

// update-status 小窗：独立渲染更新状态视图（不等待服务端口）
if (windowKind === 'update-status') {
  reactDomClient.createRoot(document.getElementById('root')).render(
    <AppProviders isDesktop isMacDesktop={isMacDesktop} isWindowsDesktop={isWindowsDesktop}>
      <ReactStartupReadyMarker />
      <UpdateStatusWindow platform={desktopPlatformBridge} initialLocale={initialLocale} onRequestClose={() => window.close()} />
    </AppProviders>,
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 入口 chunk 无导出（副作用模块）。模块内局部符号（按功能段）：
 *
 * 启动闸门：
 *   k -> startupLogoShell          splash logo 容器
 *   A -> loadingOverlay            #loading 遮罩
 *   j -> isUpdateStatusWindow      windowKind==='update-status'
 *   ke -> prefersReducedMotion     系统减弱动效
 *   M/N/P -> startupClassApplied / logoAnimationDone / reactStartupDone
 *   F/I/L -> markStartupReadyIfComplete / markLogoAnimationDone / markReactStartupDone
 *
 * 服务与协议：
 *   je -> RendererServiceRegistry  34 服务注册表
 *   Me -> isStartupLoggingDisabled 启动期日志禁用
 *   z  -> startupLog               启动期日志
 *   B  -> connectViaMessagePort    端口 -> 协议客户端 -> 注册表
 *   Ne -> syncTelemetryContext     遥测上下文同步
 *   J  -> baseServices             主端口注册表（可空）
 *   Y  -> pendingSessionPortQueue  会话端口等待队列
 *   Z  -> mainPortHandled          主端口一次性闭锁
 *   Q  -> handleSessionServicePort 会话端口处理
 *   Je -> flushPendingSessionPorts 队列清空
 *   $  -> ReactStartupReadyMarker  首帧提交标记组件
 *   Ye -> handleWindowMessage      message 总分发
 *
 * 平台桥：
 *   Pe -> embeddedBrowserPlatformBridge  内嵌浏览器子桥
 *   Fe -> createSessionServices          会话服务合并
 *   Ie -> useServerServicesDirectly      server 目标直通
 *   X  -> desktopPlatformBridge          window.zcode 完整门面
 *   H/U/Be -> isMacDesktop / isWindowsDesktop / isLinuxDesktop
 *
 * 查询参数：
 *   W -> getBooleanQueryParam      He -> restoreSession
 *   G -> getStringQueryParam       K  -> supportsSettings
 *   Ue -> initialWorkspacePath     We -> initialWorkspacePurpose
 *   Ge -> unavailableWorkspacePath Ke -> windowKind
 *   q  -> localeParam              qe -> initialLocale
 *
 * 其它：
 *   V -> jsxRuntime                Le -> RENDERER_START_TIMESTAMP
 *   Re -> launchMarks              ze -> registerE2EStoreBridgesIfEnabled
 *   Ve -> isLocalDevelopmentRuntime
 *
 * 导入符号（跨 chunk 别名 -> 内部名 -> 语义名）：
 *   styles-CdEGpc2x.js（34 个通道描述符 + 应用外壳）：
 *     A->bAe->zcodeSessionChannel, B->cAe->fileChannel, C->DAe->modelProviderChannel,
 *     D->CAe->memoryChannel, E->wAe->outputStyleChannel, F->pAe->settingChannel,
 *     G->ise->MessagePortChannelClient, H->xse->registerRemoteSession,
 *     I->fAe->terminalChannel, L->dAe->systemChannel, M->gAe->zcodeTaskChannel,
 *     N->hAe->broadcastChannel, O->SAe->hooksChannel, P->mAe->credentialChannel,
 *     R->uAe->gitCheckpointChannel, S->OAe->usageStatsChannel, T->TAe->fileWatcherChannel,
 *     U->Us->ServiceProxy, V->Sse->registerBaseServices, W->ase->ProtocolClient,
 *     _->NAe->mcpSyncChannel, a->g8t->ZCodeApp, b->AAe->offPeakTaskChannel,
 *     c->HAe->promptAttachmentTransferChannel, d->zAe->settingsSyncChannel,
 *     f->RAe->commandsChannel, g->PAe->pluginSyncChannel, h->FAe->pluginsChannel,
 *     i->v8t->UpdateStatusWindow, j->_Ae->zcodeAgentChannel, k->xAe->botsChannel,
 *     l->VAe->repoWikiChannel, m->IAe->pluginManagementChannel, n->C8t->recordArmsCustomEvent,
 *     o->ekt->AppProviders, p->LAe->subagentsChannel, r->x8t->playTaskNotificationSound,
 *     s->WOt->setPlatformBridge, t->T8t->setRendererDeviceId, u->BAe->feedbackChannel,
 *     v->MAe->skillSyncChannel, w->EAe->oauthChannel, x->kAe->codingPlanSubscriptionChannel,
 *     y->jAe->skillsChannel, z->lAe->gitChannel
 *   imeComposition-DEYFkwWm.js：P->ae->reactDomClient（createRoot）
 *   IntlProvider-C321H7m8.js：t->E->ZCodeIntlProvider
 *   src-HCld2afU.js：Ps->e->DEFAULT_LOCALE('zh-CN'), St->Ib->RendererMessage,
 *     ct->ax->parseLaunchMarks, ft->ex->DesktopCommand, no->Wf->transportFrameLimits,
 *     st->ix->LAUNCH_MARKS_QUERY_PARAM('zcodeLaunchMarks'), ut->tx->createRendererTelemetryContext
 *   preload-helper-BHSF1fZ9.js：t->（动态 import 预加载器）
 * ════════════════════════════════════════════════════════════════════════ */
