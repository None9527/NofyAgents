/* eslint-disable */
/**
 * ============================================================================
 * stores-core.tsx — ZCode 3.7.6 横切层 zustand stores · 核心域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：全部为融合 chunk js 行（闭区间）；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件是 stores 域拆分的第一部分（核心域），共 6 个 store：
 *
 *  # | 混淆名        | 语义名                    | js 行        | 归属族
 *  --|---------------|---------------------------|--------------|------------------
 *  1 | Mie 工厂/ko 钩子 | SettingsStore            | 1140–1286    | 横切（F06 消费）
 *  4 | Zs            | SessionRegistryStore      | 4309–4352    | 横切（F07 消费）
 *  6 | yC            | FeedbackStore             | 36992–37066  | F09
 *  8 | yH            | SelectionScopesStore      | 67554–67560  | F03
 * 13 | H2            | ConfirmDialogStore        | 123480–123492| F09
 * 20 | N9            | AlertDialogStore          | 206514–206560| F09
 *
 * ----------------------------------------------------------------------------
 * 外部依赖（跨 chunk 导入；与 TopBar.tsx 清单一致）
 * ----------------------------------------------------------------------------
 *  - `Ae` = zustand create（skillStore-BmeKHDBI.js 的 q 导出）
 *  - `ne` = useStoreWithSelector（skillStore-BmeKHDBI.js 的 J 导出）
 *  - `J`  = logger（logger-PFDwl5Yq.js 的 t 导出）
 *  - `He/We` = localStorage 读/写助手（本 chunk 内，IntlProvider 侧工具）
 *
 * ----------------------------------------------------------------------------
 * 持久化键（本文件 6 个 store 涉及）
 * ----------------------------------------------------------------------------
 *  SettingsStore:
 *    zcode-theme / zcode-locale / zcode-code-preview-settings /
 *    zcode-ui-font-size-px / zcode-performance-mode /
 *    zcode-notification-enabled / zcode-notification-sound-enabled
 *    跨窗口广播通道前缀 `state:`（theme/locale/uiFontSizePx 三字段，经
 *    broadcastService.send({channel:'state:<key>', payload}) 同步）
 *  FeedbackStore: zcode.feedback.contact（联系方式草稿，37091 的 xC）
 *  SessionRegistryStore: 无（纯内存注册表）
 *  Confirm/Alert/SelectionScopes: 无
 * ============================================================================
 */

import * as React from "react";
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { create as createStore } from './SkillStore'; // 原 Ae（skillStore chunk q 导出）
import { readLocalStorageItem as readLocalStorage, writeLocalStorageItem as writeLocalStorage } from './intlProvider'; // 原 He/We
import type { UserInfo } from './OnboardingLoginLeaves';

/* ============================================================================
 * 0. zustand 接口（原 `Ae` = skillStore chunk 导出的 create；`ne` = 选择器钩子）
 * ==========================================================================*/

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
type GetState<T> = () => T;

interface StoreApi<T> {
  getState: GetState<T>;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

/** zustand 绑定钩子：`useStore(selector)` + 静态 getState/setState/subscribe */
export type UseBoundStore<T> = StoreApi<T> & (<R>(selector: (state: T) => R) => R);

/** localStorage 读/写（原 He/We；失败静默）— 已接线 intlProvider readLocalStorageItem/writeLocalStorageItem */

/* ============================================================================
 * 1. SettingsStore（原 Mie 工厂 + Oo context + Nie provider + ko 钩子）
 *    js 1140–1296 / jsx 185
 * ----------------------------------------------------------------------------
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | theme | string | 主题（`zai-dark`/`zai-light`/`system`），持久化 zcode-theme |
 *  | locale | string | 语言（缺省 zh-CN），持久化 zcode-locale |
 *  | codePreviewSettings | CodePreviewSettings | 代码预览（主题/行号/换行/字号 12–20），持久化 zcode-code-preview-settings |
 *  | uiFontSizePx | number | UI 字号（12–20，缺省 14），持久化 zcode-ui-font-size-px，写 CSS 变量 --ui-font-size |
 *  | performanceMode | boolean | 性能模式，持久化 zcode-performance-mode |
 *  | notificationEnabled | boolean | 通知开关，持久化 zcode-notification-enabled |
 *  | notificationSoundEnabled | boolean | 通知音开关，持久化 zcode-notification-sound-enabled |
 *  | user | User \| null | 当前登录用户 |
 *  | isRestoringOAuthSession | boolean | OAuth 会话恢复中（初始值由 provider 注入） |
 *  | oauthError | OAuthError \| null | 最近 OAuth 错误 |
 *  | oauthSuccessSeq / lastOAuthSuccessProvider | number / string\|null | OAuth 成功事件序号与供应商 |
 *  | apiKeyLoginSuccessSeq / lastApiKeyLoginModel | number / string\|null | API key 登录成功序号与模型 |
 *  | modelProviderFamilyConnectionTransitionSeq / last…Transition | number / object\|null | 供应商族连接迁移事件 |
 *  | loginEntryRequest / loginEntryAttempt | LoginEntryRequest\|null / LoginEntryAttempt\|null | 登录入口请求/尝试状态机（id 配对） |
 *  | onboardingDialogRequested | boolean | onboarding 对话框请求标记 |
 *
 * actions 表：setTheme/setLocale/setCodePreviewSettings/setUiFontSizePx/
 *   setPerformanceMode/setNotificationEnabled/setNotificationSoundEnabled/
 *   setUser/setIsRestoringOAuthSession/setOAuthError/markOAuthSuccess/
 *   markApiKeyLoginSuccess/markModelProviderFamilyConnectionTransition/
 *   requestLoginEntry/clearLoginEntryRequest/markLoginEntryAttemptStatus/
 *   requestOnboardingDialog/clearOnboardingDialogRequest（18 个）
 *
 * selectors 使用方（抽样，融合 chunk 行号）：`ko(...)` 共 55 处调用点，如
 *   129516 附近 TopBar 族、204878 设置视图壳 j9、205826 登录 b4t 等。
 * ==========================================================================*/

export type ThemeId = "zai-dark" | "zai-light" | "system";

export interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}

export interface LoginEntryRequest { id: number; providerId: string; purpose: string }
export interface LoginEntryAttempt extends LoginEntryRequest { status: "requested" | "pending" | "settled" | string }

export interface SettingsState {
  theme: string;
  locale: string;
  codePreviewSettings: CodePreviewSettings;
  uiFontSizePx: number;
  performanceMode: boolean;
  notificationEnabled: boolean;
  notificationSoundEnabled: boolean;
  user: UserInfo | null;
  isRestoringOAuthSession: boolean;
  oauthError: unknown | null;
  oauthSuccessSeq: number;
  lastOAuthSuccessProvider: string | null;
  apiKeyLoginSuccessSeq: number;
  lastApiKeyLoginModel: string | null;
  modelProviderFamilyConnectionTransitionSeq: number;
  lastModelProviderFamilyConnectionTransition: unknown | null;
  loginEntryRequest: LoginEntryRequest | null;
  loginEntryAttempt: LoginEntryAttempt | null;
  onboardingDialogRequested: boolean;
  /* actions */
  setTheme(theme: string): void;
  setLocale(locale: string): void;
  setCodePreviewSettings(patch: Partial<CodePreviewSettings>): void;
  setUiFontSizePx(px: number): void;
  setPerformanceMode(enabled: boolean): void;
  setNotificationEnabled(enabled: boolean): void;
  setNotificationSoundEnabled(enabled: boolean): void;
  setUser(user: UserInfo | null): void;
  setIsRestoringOAuthSession(v: boolean): void;
  setOAuthError(error: unknown | null): void;
  markOAuthSuccess(provider?: string | null): void;
  markApiKeyLoginSuccess(model?: string | null): void;
  markModelProviderFamilyConnectionTransition(transition: unknown): void;
  requestLoginEntry(providerId: string, purpose: string): number;
  clearLoginEntryRequest(id?: number): void;
  markLoginEntryAttemptStatus(id: number, status: string): void;
  requestOnboardingDialog(): void;
  clearOnboardingDialogRequest(): void;
}

/** 跨窗口广播服务（原参数 e：send/onMessage；由 App 根 provider 注入） */
export interface BroadcastService {
  send(message: { channel: string; payload: unknown }): void;
  onMessage(handler: (message: { channel: string; payload: unknown }) => void): () => void;
}

/* --- 主题/字号/通知 助手（原 So/xo/Co/fo/mo/po/lo/Aie/jie/yo/bo/Die/Oie，js 1040–1139） --- */

const CODE_PREVIEW_STORAGE_KEY = "zcode-code-preview-settings"; // 原 wo
const PERFORMANCE_MODE_STORAGE_KEY = "zcode-performance-mode"; // 原 To
const UI_FONT_SIZE_STORAGE_KEY = "zcode-ui-font-size-px"; // 原 uo
const NOTIFICATION_ENABLED_KEY = "zcode-notification-enabled"; // 原 ho
const NOTIFICATION_SOUND_ENABLED_KEY = "zcode-notification-sound-enabled"; // 原 go

/** 同步字段集（原 Eo）与广播通道前缀（原 Do） */
const BROADCAST_SYNCED_FIELDS = new Set(["theme", "locale", "uiFontSizePx"]);
const BROADCAST_CHANNEL_PREFIX = "state:";

const DEFAULT_CODE_PREVIEW_SETTINGS: CodePreviewSettings = {
  lightTheme: "github-light",
  darkTheme: "github-dark",
  showLineNumbers: true,
  wrapLongLines: false,
  fontSizePx: 12,
};

/** 原 So：dark/light 归一到 zai-* */
function normalizeThemeId(theme: string): string {
  return theme === "dark" ? "zai-dark" : theme === "light" ? "zai-light" : theme;
}

function prefersDarkColorScheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** 原 xo：system → 跟随系统解析为 dark/light */
function resolveEffectiveTheme(theme: string): "dark" | "light" {
  return theme === "system" ? (prefersDarkColorScheme() ? "dark" : "light") : theme === "dark" || theme === "zai-dark" ? "dark" : "light";
}

/** 原 Co：把主题落到 <html> 类名（dark / theme-zai-light / theme-zai-dark） */
function applyThemeClasses(theme: string): void {
  const effective = resolveEffectiveTheme(theme);
  const concrete = theme === "system" ? (effective === "dark" ? "zai-dark" : "zai-light") : normalizeThemeId(theme);
  document.documentElement.classList.toggle("dark", effective === "dark");
  document.documentElement.classList.toggle("theme-zai-light", concrete === "zai-light");
  document.documentElement.classList.toggle("theme-zai-dark", concrete === "zai-dark");
}

/** 原 fo：UI 字号钳制 12–20，缺省 14 */
function clampUiFontSizePx(px: number | undefined): number {
  return typeof px === "number" && Number.isFinite(px) ? Math.min(20, Math.max(12, Math.round(px))) : 14;
}

/** 原 mo：写 CSS 变量 --ui-font-size */
function applyUiFontSizePx(px: number): void {
  const target = document.documentElement.style;
  target?.setProperty?.("--ui-font-size", `${clampUiFontSizePx(px)}px`);
}

function loadUiFontSizePx(): number {
  const raw = readLocalStorage(UI_FONT_SIZE_STORAGE_KEY);
  const parsed = raw === null ? NaN : Number(raw);
  return clampUiFontSizePx(Number.isFinite(parsed) ? parsed : undefined);
}

function loadCodePreviewSettings(): CodePreviewSettings {
  try {
    const raw = readLocalStorage(CODE_PREVIEW_STORAGE_KEY);
    if (!raw) return DEFAULT_CODE_PREVIEW_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<CodePreviewSettings>;
    return {
      ...DEFAULT_CODE_PREVIEW_SETTINGS,
      ...parsed,
      fontSizePx:
        typeof parsed.fontSizePx === "number"
          ? Math.min(20, Math.max(12, Math.round(parsed.fontSizePx)))
          : DEFAULT_CODE_PREVIEW_SETTINGS.fontSizePx,
    };
  } catch {
    return DEFAULT_CODE_PREVIEW_SETTINGS;
  }
}

function readBooleanSetting(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : raw !== "false";
  } catch {
    return fallback;
  }
}

function writeBooleanSetting(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* 静默 */
  }
}

/**
 * 原 Mie（js 1140–1286）：SettingsStore 工厂。
 * 接收广播服务，返回 zustand store；工厂副作用：
 *  1. theme/locale/uiFontSizePx 三字段变更 → `state:<field>` 广播（重入守卫）；
 *  2. 收到远端 `state:*` 消息 → 本地静默应用（setTheme/setLocale/setUiFontSizePx）；
 *  3. system 主题时监听 prefers-color-scheme 变化；
 *  4. 初始应用主题类名与 UI 字号。
 */
export function createSettingsStore(broadcast: BroadcastService, options: { initialIsRestoringOAuthSession?: boolean } = {}): UseBoundStore<SettingsState> {
  let applyingRemoteChange = false;
  let loginEntrySeq = 0;
  let disposeSystemThemeListener: (() => void) | null = null;

  const store = createStore<SettingsState>((set) => ({
    theme: normalizeThemeId(readLocalStorage("zcode-theme") || "zai-dark"),
    setTheme: (theme) => {
      const normalized = normalizeThemeId(theme);
      writeLocalStorage("zcode-theme", normalized);
      broadcastThemeChange(normalized);
      applyThemeClasses(normalized);
      set({ theme: normalized });
    },
    locale: readLocalStorage("zcode-locale") || "zh-CN",
    setLocale: (locale) => {
      writeLocalStorage("zcode-locale", locale);
      set({ locale });
    },
    codePreviewSettings: loadCodePreviewSettings(),
    setCodePreviewSettings: (patch) =>
      set((state) => {
        const next: CodePreviewSettings = {
          ...state.codePreviewSettings,
          ...patch,
          fontSizePx:
            typeof patch.fontSizePx === "number"
              ? Math.min(20, Math.max(12, Math.round(patch.fontSizePx)))
              : state.codePreviewSettings.fontSizePx,
        };
        writeLocalStorage(CODE_PREVIEW_STORAGE_KEY, JSON.stringify(next));
        return { codePreviewSettings: next };
      }),
    uiFontSizePx: loadUiFontSizePx(),
    setUiFontSizePx: (px) => {
      const clamped = clampUiFontSizePx(px);
      writeLocalStorage(UI_FONT_SIZE_STORAGE_KEY, String(clamped));
      applyUiFontSizePx(clamped);
      set({ uiFontSizePx: clamped });
    },
    performanceMode: readLocalStorage(PERFORMANCE_MODE_STORAGE_KEY) === "true",
    setPerformanceMode: (enabled) => {
      writeLocalStorage(PERFORMANCE_MODE_STORAGE_KEY, enabled ? "true" : "false");
      set({ performanceMode: enabled });
    },
    notificationEnabled: readBooleanSetting(NOTIFICATION_ENABLED_KEY, true),
    setNotificationEnabled: (enabled) => {
      writeBooleanSetting(NOTIFICATION_ENABLED_KEY, enabled);
      set({ notificationEnabled: enabled });
    },
    notificationSoundEnabled: readBooleanSetting(NOTIFICATION_SOUND_ENABLED_KEY, true),
    setNotificationSoundEnabled: (enabled) => {
      writeBooleanSetting(NOTIFICATION_SOUND_ENABLED_KEY, enabled);
      set({ notificationSoundEnabled: enabled });
    },
    user: null,
    setUser: (user) => set({ user }),
    isRestoringOAuthSession: options.initialIsRestoringOAuthSession ?? false,
    setIsRestoringOAuthSession: (v) => set({ isRestoringOAuthSession: v }),
    oauthError: null,
    setOAuthError: (error) => set({ oauthError: error }),
    oauthSuccessSeq: 0,
    lastOAuthSuccessProvider: null,
    markOAuthSuccess: (provider) =>
      set((state) => ({
        oauthSuccessSeq: state.oauthSuccessSeq + 1,
        lastOAuthSuccessProvider: provider ?? state.lastOAuthSuccessProvider,
      })),
    apiKeyLoginSuccessSeq: 0,
    lastApiKeyLoginModel: null,
    markApiKeyLoginSuccess: (model) =>
      set((state) => ({
        apiKeyLoginSuccessSeq: state.apiKeyLoginSuccessSeq + 1,
        lastApiKeyLoginModel: model?.trim() || null,
      })),
    modelProviderFamilyConnectionTransitionSeq: 0,
    lastModelProviderFamilyConnectionTransition: null,
    markModelProviderFamilyConnectionTransition: (transition) =>
      set((state) => ({
        modelProviderFamilyConnectionTransitionSeq: state.modelProviderFamilyConnectionTransitionSeq + 1,
        lastModelProviderFamilyConnectionTransition: transition,
      })),
    loginEntryRequest: null,
    loginEntryAttempt: null,
    requestLoginEntry: (providerId, purpose) => {
      const id = ++loginEntrySeq;
      set({
        loginEntryRequest: { id, providerId, purpose },
        loginEntryAttempt: { id, providerId, purpose, status: "requested" },
      });
      return id;
    },
    clearLoginEntryRequest: (id) =>
      set((state) => (id !== undefined && state.loginEntryRequest?.id !== id ? {} : { loginEntryRequest: null })),
    markLoginEntryAttemptStatus: (id, status) =>
      set((state) => (state.loginEntryAttempt?.id === id ? { loginEntryAttempt: { ...state.loginEntryAttempt, status } } : {})),
    onboardingDialogRequested: false,
    requestOnboardingDialog: () => set({ onboardingDialogRequested: true }),
    clearOnboardingDialogRequest: () => set({ onboardingDialogRequested: false }),
  }));

  /* 原 a：system 主题监听器装配（含旧版addListener 回退） */
  let broadcastThemeChange = (theme: string) => {
    disposeSystemThemeListener?.();
    disposeSystemThemeListener = null;
    if (theme !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (store.getState().theme === "system") applyThemeClasses("system");
    };
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      disposeSystemThemeListener = () => mql.removeEventListener("change", onChange);
      return;
    }
    (mql as unknown as { addListener(cb: () => void): void; removeListener(cb: () => void): void }).addListener(onChange);
    disposeSystemThemeListener = () =>
      (mql as unknown as { removeListener(cb: () => void): void }).removeListener(onChange);
  };

  /* 本地变更 → 广播（重入守卫：远端应用时不再回播） */
  store.subscribe((next, prev) => {
    if (applyingRemoteChange) return;
    for (const field of BROADCAST_SYNCED_FIELDS) {
      const key = field as keyof SettingsState;
      if (next[key] !== prev[key]) broadcast.send({ channel: `${BROADCAST_CHANNEL_PREFIX}${field}`, payload: next[key] });
    }
  });

  /* 远端广播 → 本地应用 */
  broadcast.onMessage((message) => {
    if (!message.channel.startsWith(BROADCAST_CHANNEL_PREFIX)) return;
    const field = message.channel.slice(BROADCAST_CHANNEL_PREFIX.length);
    if (!BROADCAST_SYNCED_FIELDS.has(field)) return;
    applyingRemoteChange = true;
    try {
      const state = store.getState();
      if (field === "theme" && typeof message.payload === "string") state.setTheme(message.payload);
      else if (field === "locale" && typeof message.payload === "string") state.setLocale(message.payload);
      else if (field === "uiFontSizePx" && typeof message.payload === "number") state.setUiFontSizePx(message.payload);
    } finally {
      applyingRemoteChange = false;
    }
  });

  broadcastThemeChange(store.getState().theme);
  applyThemeClasses(store.getState().theme);
  applyUiFontSizePx(store.getState().uiFontSizePx);
  document.documentElement.classList.toggle("dark", resolveEffectiveTheme(store.getState().theme) === "dark");
  return store;
}

/* --- StoreProvider / useZCodeStore（原 Oo/Nie/ko，js 1287–1296） --- */

const SettingsStoreContext = React.createContext<UseBoundStore<SettingsState> | null>(null);

export function SettingsStoreProvider({
  broadcastService,
  initialIsRestoringOAuthSession = false,
  children,
}: {
  broadcastService: BroadcastService;
  initialIsRestoringOAuthSession?: boolean;
  children: React.ReactNode;
}) {
  const storeRef = React.useRef<UseBoundStore<SettingsState> | null>(null);
  storeRef.current ||= createSettingsStore(broadcastService, { initialIsRestoringOAuthSession });
  return <SettingsStoreContext.Provider value={storeRef.current}>{children}</SettingsStoreContext.Provider>;
}

/** 原 ko：useZCodeStore —— 必须在 SettingsStoreProvider 内使用 */
export function useSettingsStore<R>(selector: (state: SettingsState) => R): R {
  const store = React.useContext(SettingsStoreContext);
  if (!store) throw new Error("useZCodeStore 必须在 StoreProvider 内使用");
  return store(selector);
}

/* ============================================================================
 * 2. SessionRegistryStore（原 Zs，js 4309–4352 / jsx 3184）
 * ----------------------------------------------------------------------------
 * 全局会话注册表：基础服务 + 按 sessionId/工作区路径/工作区身份 三索引。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | baseServices | BaseServices \| null | 本地（基础）服务集，由 registerBaseServices 注入 |
 *  | sessionsById | Record<sessionId, RegisteredSession> | 远端会话注册表 |
 *  | sessionIdByWorkspacePath | Record<path, sessionId> | 工作区路径 → 会话反查 |
 *  | sessionIdByWorkspaceIdentity | Record<identity, sessionId> | 工作区身份 → 会话反查 |
 * actions：registerBaseServices/registerSession/unregisterSession/
 *   bindWorkspacePath/unbindWorkspacePath/bindWorkspaceIdentity/unbindWorkspaceIdentity（7 个）
 * selectors 使用方（抽样）：共 30 处调用点 —— 4834/4900/4905/4924（服务解析）、
 *   24245（useWorkspaceProviderConfigFile）、35729–35731（任务列表域）等。
 * 持久化：无（纯内存）。
 * ==========================================================================*/

export interface BaseServices {
  zcodeAgentService?: unknown;
  zcodeTaskService?: unknown;
  zcodeSessionService?: unknown;
  mcpSyncService?: unknown;
  fileWatcherService?: unknown;
  localModelProviderService?: unknown;
  [serviceName: string]: unknown;
}

export interface RegisteredSession {
  sessionId: string;
  services: BaseServices;
  [key: string]: unknown;
}

export interface SessionRegistryState {
  baseServices: BaseServices | null;
  sessionsById: Record<string, RegisteredSession>;
  sessionIdByWorkspacePath: Record<string, string>;
  sessionIdByWorkspaceIdentity: Record<string, string>;
  registerBaseServices(services: BaseServices): void;
  registerSession(session: RegisteredSession): void;
  unregisterSession(sessionId: string): void;
  bindWorkspacePath(path: string, sessionId: string): void;
  unbindWorkspacePath(path: string): void;
  bindWorkspaceIdentity(identity: string, sessionId: string): void;
  unbindWorkspaceIdentity(identity: string): void;
}

export const useSessionRegistryStore: UseBoundStore<SessionRegistryState> = createStore<SessionRegistryState>((set) => ({
  baseServices: null,
  sessionsById: {},
  sessionIdByWorkspacePath: {},
  sessionIdByWorkspaceIdentity: {},
  registerBaseServices: (services) => set({ baseServices: services }),
  registerSession: (session) => set((state) => ({ sessionsById: { ...state.sessionsById, [session.sessionId]: session } })),
  unregisterSession: (sessionId) =>
    set((state) => {
      const sessionsById = { ...state.sessionsById };
      delete sessionsById[sessionId];
      return {
        sessionsById,
        sessionIdByWorkspacePath: Object.fromEntries(Object.entries(state.sessionIdByWorkspacePath).filter(([, id]) => id !== sessionId)),
        sessionIdByWorkspaceIdentity: Object.fromEntries(Object.entries(state.sessionIdByWorkspaceIdentity).filter(([, id]) => id !== sessionId)),
      };
    }),
  bindWorkspacePath: (path, sessionId) =>
    set((state) => ({ sessionIdByWorkspacePath: { ...state.sessionIdByWorkspacePath, [path]: sessionId } })),
  unbindWorkspacePath: (path) =>
    set((state) => {
      if (!(path in state.sessionIdByWorkspacePath)) return state;
      const next = { ...state.sessionIdByWorkspacePath };
      delete next[path];
      return { ...state, sessionIdByWorkspacePath: next };
    }),
  bindWorkspaceIdentity: (identity, sessionId) =>
    set((state) => ({ sessionIdByWorkspaceIdentity: { ...state.sessionIdByWorkspaceIdentity, [identity]: sessionId } })),
  unbindWorkspaceIdentity: (identity) =>
    set((state) => {
      if (!(identity in state.sessionIdByWorkspaceIdentity)) return state;
      const next = { ...state.sessionIdByWorkspaceIdentity };
      delete next[identity];
      return { ...state, sessionIdByWorkspaceIdentity: next };
    }),
}));

/* --- 模块级助手（原 xse/Sse/Qs/$s/Cse/ec/wse/tc/Tse + Xs 服务代号，js 4303–4378） --- */

/** 服务实例代号（原 Xs：WeakMap 递增编号，用于跨代比较服务实例） */
const serviceGenerations = new WeakMap<object, number>();
let nextServiceGeneration = 1;
export function serviceGeneration(service: object): number {
  const known = serviceGenerations.get(service);
  if (known !== undefined) return known;
  const generation = nextServiceGeneration++;
  serviceGenerations.set(service, generation);
  return generation;
}

/** 原 Sse：注入基础服务（应用引导期调用一次） */
export function registerBaseServices(services: BaseServices): void {
  useSessionRegistryStore.getState().registerBaseServices(services);
}

/** 原 xse：注册远端会话（给 zcodeAgentService 打代号后入表） */
export function registerRemoteSession(entry: RegisteredSession): void {
  if (entry.services.zcodeAgentService) serviceGeneration(entry.services.zcodeAgentService as object);
  useSessionRegistryStore.getState().registerSession(entry);
}

/** 原 Qs：注销会话（同时清除该工作区的 provider registry 同步状态，见 services.tsx） */
export declare function unregisterSessionAndPurgeSyncState(sessionId: string): void;

export function bindWorkspacePath(path: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspacePath(path, sessionId);
}
export function unbindWorkspacePath(path: string): void {
  useSessionRegistryStore.getState().unbindWorkspacePath(path);
}
export function bindWorkspaceIdentity(identity: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspaceIdentity(identity, sessionId);
}
export function unbindWorkspaceIdentity(identity: string): void {
  useSessionRegistryStore.getState().unbindWorkspaceIdentity(identity);
}

/** 原 tc：按 sessionId 取会话 */
export function getSessionById(sessionId: string): RegisteredSession | null {
  return useSessionRegistryStore.getState().sessionsById[sessionId] ?? null;
}

/** 原 Tse：按工作区身份取其会话服务集 */
export function getServicesByWorkspaceIdentity(identity: string): BaseServices | null {
  const state = useSessionRegistryStore.getState();
  const sessionId = state.sessionIdByWorkspaceIdentity[identity];
  return sessionId ? (state.sessionsById[sessionId]?.services ?? null) : null;
}

/* ============================================================================
 * 3. FeedbackStore（原 yC，js 36992–37066 / jsx 33835）
 * ----------------------------------------------------------------------------
 * 反馈中心（提交/我的工单/功能请求）开关与草稿态。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | open | boolean | 反馈中心对话框是否打开 |
 *  | featureRequestOpen | boolean | 功能请求对话框是否打开（与 open 互斥） |
 *  | tab | 'submit' \| 'tickets' | 反馈中心当前标签 |
 *  | submitDraft | FeedbackSubmitPayload \| null | 预填提交草稿（由帮助菜单注入） |
 *  | submissionJobId | string \| null | 正在查看的提交作业 id |
 *  | selectedTicketId | string \| null | 工单列表选中项 |
 * actions：openSubmit/openSubmissionJob/openFeatureRequest/openTickets/
 *   setTab/setSelectedTicketId/close（7 个）
 * selectors 使用方（抽样）：共 25 处 —— 38355–38357（反馈中心壳）、38670（工单详情）、
 *   38915–38916（提交作业视图）、39108–39109（RMe memo 根）、141806 帮助动作等。
 * 持久化：联系方式草稿 `zcode.feedback.contact`（xC，37091；CC/Wje/wC/TC 助手）。
 * ==========================================================================*/

export interface FeedbackSubmitPayload {
  title?: string;
  type: "bug" | "feature";
  module: string;
  severity: string;
  includeLogs: boolean;
  description?: string;
  screenshots?: Blob[];
}

export interface FeedbackState {
  open: boolean;
  featureRequestOpen: boolean;
  tab: "submit" | "tickets";
  submitDraft: FeedbackSubmitPayload | null;
  submissionJobId: string | null;
  selectedTicketId: string | null;
  openSubmit(draft?: FeedbackSubmitPayload | null): void;
  openSubmissionJob(jobId: string): void;
  openFeatureRequest(): void;
  openTickets(ticketId?: string | null): void;
  setTab(tab: "submit" | "tickets"): void;
  setSelectedTicketId(ticketId: string | null): void;
  close(): void;
}

export const useFeedbackStore: UseBoundStore<FeedbackState> = createStore<FeedbackState>((set) => ({
  open: false,
  featureRequestOpen: false,
  tab: "submit",
  submitDraft: null,
  submissionJobId: null,
  selectedTicketId: null,
  openSubmit: (draft) =>
    set({ open: true, featureRequestOpen: false, tab: "submit", submitDraft: draft ?? null, submissionJobId: null, selectedTicketId: null }),
  openSubmissionJob: (jobId) =>
    set({ open: true, featureRequestOpen: false, tab: "submit", submitDraft: null, submissionJobId: jobId, selectedTicketId: null }),
  openFeatureRequest: () =>
    set({ open: false, featureRequestOpen: true, submitDraft: null, submissionJobId: null, selectedTicketId: null }),
  openTickets: (ticketId) =>
    set({ open: true, featureRequestOpen: false, tab: "tickets", submitDraft: null, submissionJobId: null, selectedTicketId: ticketId ?? null }),
  setTab: (tab) => set({ tab, ...(tab === "submit" ? { submissionJobId: null } : {}) }),
  setSelectedTicketId: (ticketId) => set({ selectedTicketId: ticketId }),
  close: () => set({ open: false, featureRequestOpen: false, submitDraft: null, submissionJobId: null, selectedTicketId: null }),
}));

/* --- 反馈联系方式持久化（原 xC/SC/CC/Wje/wC/TC，js 37091–37125） --- */

const FEEDBACK_CONTACT_KEY = "zcode.feedback.contact"; // 原 xC

function feedbackStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readFeedbackContact(storage: Storage | null = feedbackStorage()): string {
  if (!storage) return "";
  try {
    return storage.getItem(FEEDBACK_CONTACT_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function clearFeedbackContact(storage: Storage | null = feedbackStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(FEEDBACK_CONTACT_KEY);
  } catch {
    /* 静默 */
  }
}

export function writeFeedbackContact(contact: string, storage: Storage | null = feedbackStorage()): void {
  const trimmed = contact.trim();
  if (!trimmed) {
    clearFeedbackContact(storage);
    return;
  }
  if (storage) {
    try {
      storage.setItem(FEEDBACK_CONTACT_KEY, trimmed);
    } catch {
      /* 静默 */
    }
  }
}

/* ============================================================================
 * 4. SelectionScopesStore（原 yH，js 67554–67560 / jsx 59934）
 * ----------------------------------------------------------------------------
 * 会话引用选择域：按作用域键存放已选引用列表（引用选择面板的选中态）。
 * state 字段表：scopes: Record<scopeKey, SelectionScopeItem[]>（1 个）
 * actions：无内置 action —— 消费方直接用 getState/setState（原 bH/aXe 助手）。
 * selectors 使用方：`yH(` 仅 1 处（定义）；消费走 bH/aXe（F03 会话族引用选择）。
 * 持久化：无。
 * ==========================================================================*/

export interface SelectionScopeItem {
  [key: string]: unknown;
}

export interface SelectionScopesState {
  scopes: Record<string, SelectionScopeItem[]>;
}

export const useSelectionScopesStore: UseBoundStore<SelectionScopesState> = createStore<SelectionScopesState>(() => ({ scopes: {} }));

/** 原 bH：取某作用域的选中项（缺省空数组） */
export function getSelectionScope(scopeKey: string): SelectionScopeItem[] {
  return useSelectionScopesStore.getState().scopes[scopeKey] ?? [];
}

/** 原 aXe：以更新函数改写某作用域；结果为空时删除该键 */
export function updateSelectionScope(scopeKey: string, updater: (items: SelectionScopeItem[]) => SelectionScopeItem[]): void {
  useSelectionScopesStore.setState((state) => {
    const next = updater(state.scopes[scopeKey] ?? []);
    if (next.length === 0) {
      const { [scopeKey]: _removed, ...rest } = state.scopes;
      return { scopes: rest };
    }
    return { scopes: { ...state.scopes, [scopeKey]: next } };
  });
}

/* ============================================================================
 * 5. ConfirmDialogStore（原 H2，js 123480–123492 / jsx 105205）
 * ----------------------------------------------------------------------------
 * 全局确认对话框：单请求槽位 + Promise 结算。
 * state 字段表：pendingRequest: ConfirmRequest \| undefined（1 个）
 * actions：requestConfirmation/settleConfirmation（2 个）
 * selectors 使用方：123494（U2 useConfirmDialog）、206574–206575（对话框呈现层）。
 * 持久化：无。
 * ==========================================================================*/

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve?: (confirmed: boolean) => void;
  [key: string]: unknown;
}

/** requestConfirmation 的入参（不含 resolve，由 store 注入） */
export interface ConfirmRequestInput {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  [key: string]: unknown;
}

export interface ConfirmDialogState {
  pendingRequest: ConfirmRequest | undefined;
  requestConfirmation(request: ConfirmRequestInput): Promise<boolean>;
  settleConfirmation(confirmed: boolean): void;
}

export const useConfirmDialogStore: UseBoundStore<ConfirmDialogState> = createStore<ConfirmDialogState>((set, get) => ({
  pendingRequest: undefined,
  requestConfirmation: (request) =>
    get().pendingRequest
      ? (logger.warn("[ConfirmDialogStore] confirmation already in progress"), Promise.resolve(false))
      : new Promise<boolean>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleConfirmation: (confirmed) => {
    const pending = get().pendingRequest;
    if (!pending) return;
    set({ pendingRequest: undefined });
    pending.resolve?.(confirmed);
  },
}));

/** 原 U2：useConfirmDialog —— 返回 requestConfirmation 动作 */
export function useConfirmDialog(): ConfirmDialogState["requestConfirmation"] {
  return useConfirmDialogStore((state) => state.requestConfirmation);
}

/* ============================================================================
 * 6. AlertDialogStore（原 N9，js 206514–206560 / jsx 164300）
 * ----------------------------------------------------------------------------
 * 全局警告对话框：单请求槽位 + 无参结算（原 G4t 呈现层：标题/描述/确认按钮 ⏎）。
 * state 字段表：pendingRequest: AlertRequest \| undefined（1 个）
 * actions：requestAlert/settleAlert（2 个）
 * selectors 使用方：206529–206530（G4t 呈现层）、209651（useAlert 钩子）。
 * 持久化：无。
 * ==========================================================================*/

export interface AlertRequest {
  title: string;
  description?: string;
  actionLabel?: string;
  resolve?: () => void;
  [key: string]: unknown;
}

/** requestAlert 的入参（不含 resolve，由 store 注入） */
export interface AlertRequestInput {
  title: string;
  description?: string;
  actionLabel?: string;
  [key: string]: unknown;
}

export interface AlertDialogState {
  pendingRequest: AlertRequest | undefined;
  requestAlert(request: AlertRequestInput): Promise<void>;
  settleAlert(): void;
}

export const useAlertDialogStore: UseBoundStore<AlertDialogState> = createStore<AlertDialogState>((set, get) => ({
  pendingRequest: undefined,
  requestAlert: (request) =>
    get().pendingRequest
      ? (logger.warn("[AlertDialogStore] alert already in progress"), Promise.resolve())
      : new Promise<void>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleAlert: () => {
    const pending = get().pendingRequest;
    if (!pending) return;
    set({ pendingRequest: undefined });
    pending.resolve?.();
  },
}));

/** 原 209651 无名钩子：useAlert —— 返回 requestAlert 动作 */
export function useAlert(): AlertDialogState["requestAlert"] {
  return useAlertDialogStore((state) => state.requestAlert);
}
