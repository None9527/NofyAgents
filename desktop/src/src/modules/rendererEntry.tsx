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
import * as reactDomClient from 'react-dom/client'; // 原 imeComposition-DEYFkwWm P（= react-dom/client 入口包装）
import { ZCodeIntlProvider } from './I18n'; // 原 IntlProvider-C321H7m8 t
import { preloadModule } from '../lib/preloadHelper'; // 原 preload-helper-BHSF1fZ9 t（vite 三参预载包装器）
// src chunk：Ps=缺省语言, St=渲染进程消息枚举, ct=解析启动标记, ft=桌面命令枚举,
// no=传输分帧限制, st=启动标记查询参数名, ut=创建遥测上下文
import { DEFAULT_LOCALE } from './SrcSharedA'; // 原 src-HCld2afU Ps
import {
  ServicePortIpcTopics as RendererMessage, // 原 src-HCld2afU St
  parseLaunchMarks, // 原 src-HCld2afU ct
  DesktopMenuActionIds as DesktopCommand, // 原 src-HCld2afU ft
  RPC_FRAME_LIMITS as transportFrameLimits, // 原 src-HCld2afU no
  LAUNCH_MARKS_STORAGE_KEY as LAUNCH_MARKS_QUERY_PARAM, // 原 src-HCld2afU st
  resolveClientTelemetryContext as createRendererTelemetryContext, // 原 src-HCld2afU ut
} from './SrcSharedB';
// styles 主 chunk：应用外壳/服务通道/协议客户端等（别名映射见尾符号表）——未重建，遗留导入
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
  // @ts-expect-error 未重建 mega-chunk：无类型声明（TS7016），遗留至 styles chunk 源码化
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

// window.zcode / __ZCODE_LAUNCH_MARKS__ / __zcodeArmsCustomEventsE2E 的 Window 声明
// 已由 Sidebar / OnboardingLoginLeaves / AppRootLeaves 提供（避免重复声明冲突）；
// 本文件经 zcodeBridge() 访问器按 DesktopBridge 形状读取。
declare global {
  interface Window {
    __ZCODE_RENDERER_START__?: number;
    __ZCODE_REACT_COMMIT_AT__?: number;
    __ZCODE_DEVICE_ID__?: string;
    __ZCODE_LOCAL_DEVELOPMENT_RUNTIME__?: boolean;
  }
  var __ZCODE_RENDERER_DISABLE_LOGGING__: boolean | undefined;
  var __ZCODE_LOCAL_DEVELOPMENT_RUNTIME__: boolean | undefined;
}

/** 桌面桥访问器：Sidebar 的 Window.zcode 声明为窄类型，这里按 DesktopBridge（any）读取。 */
const zcodeBridge = (): DesktopBridge | undefined => window.zcode as DesktopBridge | undefined;

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
  getPathForFile: (file: unknown) => zcodeBridge().getPathForFile?.(file) ?? null,
  saveFile: (payload: unknown) =>
    zcodeBridge().saveFile?.(payload) ?? Promise.resolve({ success: false, error: 'not_supported' }),
  printPageToPdf: zcodeBridge().printPageToPdf ? () => zcodeBridge().printPageToPdf() : undefined,
  onBrowserViewReady: (handler: unknown) => zcodeBridge().onBrowserViewReady?.(handler) ?? (() => {}),
  onBrowserViewOperation: (handler: unknown) => zcodeBridge().onBrowserViewOperation?.(handler) ?? (() => {}),
  onBrowserViewViewportChanged: (handler: unknown) => zcodeBridge().onBrowserViewViewportChanged?.(handler) ?? (() => {}),
  onBrowserViewVisibility: (handler: unknown) => zcodeBridge().onBrowserViewVisibility?.(handler) ?? (() => {}),
  onBrowserViewCloseTab: (handler: unknown) => zcodeBridge().onBrowserViewCloseTab?.(handler) ?? (() => {}),
  onBrowserViewSuspend: (handler: unknown) => zcodeBridge().onBrowserViewSuspend?.(handler) ?? (() => {}),
  onBrowserViewRestore: (handler: unknown) => zcodeBridge().onBrowserViewRestore?.(handler) ?? (() => {}),
  browserViewAttachGuest: (payload: unknown) => zcodeBridge().browserViewAttachGuest?.(payload) ?? Promise.resolve(),
  browserViewCloseTab: (payload: unknown) => zcodeBridge().browserViewCloseTab?.(payload) ?? Promise.resolve(),
  browserViewReportResidency: (payload: unknown) => zcodeBridge().browserViewReportResidency?.(payload) ?? Promise.resolve(),
  browserViewSuspendReady: (payload: unknown) => zcodeBridge().browserViewSuspendReady?.(payload) ?? Promise.resolve(),
  browserViewEnsureResident: (payload: unknown) => zcodeBridge().browserViewEnsureResident?.(payload) ?? Promise.resolve(),
  browserViewRestoreTabs: (payload: unknown) => zcodeBridge().browserViewRestoreTabs?.(payload) ?? Promise.resolve([]),
  browserViewUpdateViewport: (payload: unknown) => zcodeBridge().browserViewUpdateViewport?.(payload) ?? Promise.resolve(),
  importChromeBrowserData: (payload: unknown) =>
    zcodeBridge().importChromeBrowserData?.(payload) ??
    Promise.resolve({
      success: false,
      cookies: { imported: 0, skipped: 0, failed: 0 },
      localStorage: { originsImported: 0, entriesImported: 0, originsSkipped: 0, originsFailed: 0 },
      error: 'unsupported',
    }),
  clearEmbeddedBrowserData: (payload: unknown) =>
    zcodeBridge().clearEmbeddedBrowserData?.(payload) ?? Promise.resolve({ success: false, error: 'unsupported' }),
};

/** 会话建立时把会话级服务并入基础服务（远端会话用）。 */
function createSessionServices(baseServices: object, registry: RendererServiceRegistry) {
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
      const { registerE2EStoreBridges } = await import('./e2eStoreBridgeBootstrap'); // 原 e2eStoreBridgeBootstrap-DOKuAE2h t
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
  selectDirectory: () => zcodeBridge().selectDirectory(),
  selectFile: () => zcodeBridge().selectFile(),
  selectFiles: () => zcodeBridge().selectFiles?.() ?? Promise.resolve([]),
  createTempTextAttachment: (payload: unknown) => zcodeBridge().createTempTextAttachment(payload),
  onRemoteConnectionLog: (handler: unknown) => zcodeBridge().onRemoteConnectionLog(handler),
  onRemoteSessionClosed: (handler: unknown) => zcodeBridge().onRemoteSessionClosed(handler),
  onBotRemoteWorkspaceReconnected: (handler: unknown) => zcodeBridge().onBotRemoteWorkspaceReconnected(handler),
  activateOrSetWorkspace: (payload: unknown) => zcodeBridge().activateOrSetWorkspace?.(payload) ?? Promise.resolve({ activated: false }),
  connectRemote: (a: unknown, b: unknown, c: unknown) => zcodeBridge().connectRemote(a, b, c),
  cancelPendingRemoteConnection: (payload: unknown) => zcodeBridge().cancelPendingRemoteConnection?.(payload) ?? Promise.resolve(),
  bindRemoteWorkspaceSessionContext: (payload: unknown) => zcodeBridge().bindRemoteWorkspaceSessionContext?.(payload) ?? Promise.resolve(),
  startWebRemoteControl: (payload: unknown) => zcodeBridge().startWebRemoteControl(payload),
  refreshWebRemoteControlPairing: (payload: unknown) => zcodeBridge().refreshWebRemoteControlPairing(payload),
  stopWebRemoteControl: () => zcodeBridge().stopWebRemoteControl(),
  getWebRemoteControlStatus: () => zcodeBridge().getWebRemoteControlStatus(),
  onWebRemoteControlStatusChanged: (handler: unknown) => zcodeBridge().onWebRemoteControlStatusChanged?.(handler) ?? (() => {}),
  disposeRemoteSession: (payload: unknown) => zcodeBridge().disposeRemoteSession(payload),
  isDockerAvailable: () => zcodeBridge().isDockerAvailable(),
  listWSLDistros: () => zcodeBridge().listWSLDistros(),
  listDockerContainers: () => zcodeBridge().listDockerContainers(),
  listSSHConfigAliases: () => zcodeBridge().listSSHConfigAliases(),
  loadMcpFromUserDirectory: (payload: unknown) => zcodeBridge().loadMcpFromUserDirectory(payload),
  saveMcpToUserDirectory: (payload: unknown) => zcodeBridge().saveMcpToUserDirectory(payload),
  migrateLegacyCommonMcp: (payload: unknown) => zcodeBridge().migrateLegacyCommonMcp(payload),
  openExternal: (payload: unknown) => zcodeBridge().openExternal(payload),
  openFeedback: () => zcodeBridge().executeDesktopCommand(DesktopCommand.OpenFeedback),
  openCommunity: () => zcodeBridge().executeDesktopCommand(DesktopCommand.OpenCommunity),
  canOpenCommunity: (payload: unknown) => zcodeBridge().canOpenCommunity(payload),
  openInFileManager: (payload: unknown) => zcodeBridge().openInFileManager(payload),
  openCuaPermissionOnboarding: zcodeBridge().openCuaPermissionOnboarding
    ? (payload: unknown) => zcodeBridge().openCuaPermissionOnboarding?.(payload) ?? Promise.resolve({ success: false, error: 'not_supported' })
    : undefined,
  prepareCuaHelperPermissionDrag: zcodeBridge().prepareCuaHelperPermissionDrag
    ? () => zcodeBridge().prepareCuaHelperPermissionDrag?.() ?? Promise.resolve({ success: false, error: 'not_supported' })
    : undefined,
  startCuaHelperPermissionDrag: zcodeBridge().startCuaHelperPermissionDrag ? () => zcodeBridge().startCuaHelperPermissionDrag?.() : undefined,
  openCuaAccessibilitySettings: () => zcodeBridge().openCuaAccessibilitySettings?.() ?? Promise.resolve({ success: false, error: 'not_supported' }),
  registerOAuthState: (payload: unknown) => zcodeBridge().registerOAuthState(payload),
  onOAuthCallback: (handler: unknown) => zcodeBridge().onOAuthCallback(handler),
  onPaymentCallback: (handler: unknown) => zcodeBridge().onPaymentCallback(handler),
  notifyRendererReady: () => zcodeBridge().notifyRendererReady(),
  reportTelemetryEvent: (payload: unknown) => zcodeBridge().reportTelemetryEvent(payload),
  reportArmsCustomEvent: (payload: unknown) => {
    recordArmsCustomEvent(payload);
    return zcodeBridge().reportArmsCustomEvent(payload);
  },
  showTaskNotification: (payload: unknown) => zcodeBridge().showTaskNotification(payload),
  syncWindowTabs: (payload: unknown) => zcodeBridge().syncWindowTabs(payload),
  syncWebRemoteControlWorkspaces: (payload: unknown) => zcodeBridge().syncWebRemoteControlWorkspaces?.(payload),
  syncWebRemoteControlTasks: (payload: unknown) => zcodeBridge().syncWebRemoteControlTasks?.(payload),
  onWebRemoteControlReconnectWorkspace: (handler: unknown) => zcodeBridge().onWebRemoteControlReconnectWorkspace?.(handler) ?? (() => {}),
  syncWindowUnreadCount: (payload: unknown) => zcodeBridge().syncWindowUnreadCount(payload),
  syncAppSettings: (payload: unknown) => zcodeBridge().syncAppSettings?.(payload),
  onFocusTab: (handler: unknown) => zcodeBridge().onFocusTab(handler),
  onNewTab: (handler: unknown) => zcodeBridge().onNewTab(handler),
  onCloseActiveContextRequest: (handler: unknown) => zcodeBridge().onCloseActiveContextRequest?.(handler) ?? (() => {}),
  onOpenBrowserUrl: (handler: unknown) => zcodeBridge().onOpenBrowserUrl?.(handler) ?? (() => {}),
  onBrowserViewScreenshotSurfacePrepare: (handler: unknown) => zcodeBridge().onBrowserViewScreenshotSurfacePrepare?.(handler) ?? (() => {}),
  onBrowserViewScreenshotSurfaceRelease: (handler: unknown) => zcodeBridge().onBrowserViewScreenshotSurfaceRelease?.(handler) ?? (() => {}),
  browserViewScreenshotSurfaceReady: (payload: unknown) => zcodeBridge().browserViewScreenshotSurfaceReady?.(payload),
  ...embeddedBrowserPlatformBridge,
  onNewTask: (handler: unknown) => zcodeBridge().onNewTask(handler),
  onOpenWorkspace: (handler: unknown) => zcodeBridge().onOpenWorkspace?.(handler) ?? (() => {}),
  onOpenWorkspacePath: (handler: unknown) => zcodeBridge().onOpenWorkspacePath?.(handler) ?? (() => {}),
  onOpenFeedbackDialog: (handler: unknown) => zcodeBridge().onOpenFeedbackDialog?.(handler) ?? (() => {}),
  onOpenTicketsPanel: (handler: unknown) => zcodeBridge().onOpenTicketsPanel?.(handler) ?? (() => {}),
  onWindowFullscreenChanged: (handler: unknown) => zcodeBridge().onWindowFullscreenChanged(handler),
  getDesktopWindowChromeState: zcodeBridge().getDesktopWindowChromeState ? () => zcodeBridge().getDesktopWindowChromeState() : undefined,
  onDesktopWindowChromeStateChanged: zcodeBridge().onDesktopWindowChromeStateChanged
    ? (handler: unknown) => zcodeBridge().onDesktopWindowChromeStateChanged(handler)
    : undefined,
  getWindowControlsOverlayMetrics: () => zcodeBridge().getWindowControlsOverlayMetrics?.() ?? null,
  onWindowControlsOverlayChanged: (handler: unknown) => zcodeBridge().onWindowControlsOverlayChanged?.(handler) ?? (() => {}),
  getDesktopZoomLevel: () => zcodeBridge().getDesktopZoomLevel?.() ?? Promise.resolve({ zoomLevel: 0 }),
  onDesktopZoomLevelChanged: (handler: unknown) => zcodeBridge().onDesktopZoomLevelChanged?.(handler) ?? (() => {}),
  onTaskNotificationClick: (handler: unknown) => zcodeBridge().onTaskNotificationClick(handler),
  exportLogs: () => zcodeBridge().exportLogs(),
  captureWindowScreenshot: () => zcodeBridge().captureWindowScreenshot?.() ?? Promise.resolve(null),
  startPerformanceTrace: () => zcodeBridge().startPerformanceTrace(),
  stopPerformanceTrace: () => zcodeBridge().stopPerformanceTrace(),
  onUpdateReady: (handler: unknown) => zcodeBridge().onUpdateReady(handler),
  onUpdateCheckResult: (handler: unknown) => zcodeBridge().onUpdateCheckResult(handler),
  onUpdateStateChanged: (handler: unknown) => zcodeBridge().onUpdateStateChanged?.(handler) ?? (() => {}),
  getUpdateState: () => zcodeBridge().getUpdateState?.() ?? Promise.resolve({ kind: 'idle', enabled: true }),
  downloadUpdate: () => zcodeBridge().downloadUpdate?.() ?? Promise.resolve(),
  cancelUpdateDownload: () => zcodeBridge().cancelUpdateDownload?.() ?? Promise.resolve(),
  openUpdateStatusWindow: () => zcodeBridge().openUpdateStatusWindow?.() ?? Promise.resolve(),
  getAutoUpdatePreferences: () => zcodeBridge().getAutoUpdatePreferences?.() ?? Promise.resolve({ autoDownloadAndInstallUpdates: false }),
  setAutoDownloadAndInstallUpdates: (payload: unknown) => zcodeBridge().setAutoDownloadAndInstallUpdates?.(payload) ?? Promise.resolve(),
  getDesktopSessionActivity: () =>
    zcodeBridge().getDesktopSessionActivity?.() ?? Promise.resolve({ runningAgentSessionCount: 0, runningRepoWikiTaskCount: 0 }),
  getZCodeStdioTapDevState: () =>
    zcodeBridge().getZCodeStdioTapDevState?.() ?? Promise.resolve({ enabled: false, visible: false, logDir: '', statePath: '' }),
  onSettingsChanged: (handler: unknown) => zcodeBridge().onSettingsChanged?.(handler) ?? (() => {}),
  onApplicationLocaleChanged: (handler: unknown) => zcodeBridge().onApplicationLocaleChanged?.(handler) ?? (() => {}),
  onPostUpdateReleaseNotes: (handler: unknown) => zcodeBridge().onPostUpdateReleaseNotes(handler),
  acknowledgePostUpdateReleaseNotes: (payload: unknown) => zcodeBridge().acknowledgePostUpdateReleaseNotes(payload),
  skipUpdateVersion: (payload: unknown) => zcodeBridge().skipUpdateVersion?.(payload) ?? Promise.resolve(),
  quitAndInstallUpdate: () => zcodeBridge().quitAndInstallUpdate(),
  getInstalledEditors: () => zcodeBridge().getInstalledEditors(),
  openInEditor: (a: unknown, b: unknown, c: unknown) => zcodeBridge().openInEditor(a, b, c),
  executeDesktopCommand: (command: unknown) => zcodeBridge().executeDesktopCommand(command),
  setApplicationLocale: (payload: unknown) => zcodeBridge().setApplicationLocale(payload),
  getSystemLocale: () =>
    zcodeBridge().getSystemLocale?.() ?? Promise.resolve(navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'),
  setTitleBarTheme: (payload: unknown) => zcodeBridge().setTitleBarTheme(payload),
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
    bridge: { syncTelemetryContext: (ctx: unknown) => zcodeBridge().syncTelemetryContext(ctx) },
    createRendererContext: () => createRendererTelemetryContext(undefined), // 原 ut 无参调用
  });
  setRendererDeviceId(desktopPlatformBridge.getDeviceId());
  setPlatformBridge(desktopPlatformBridge);
  reactDomClient.createRoot(document.getElementById('root')!).render(
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
  reactDomClient.createRoot(document.getElementById('root')!).render(
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
