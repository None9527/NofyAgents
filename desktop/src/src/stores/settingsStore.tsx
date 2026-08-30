// A0-S4-3: 自 modules/stores-core.tsx §1 原样迁入（SettingsStore 工厂 + Provider + 钩子；原文件现为薄 re-export shim）。
import * as React from "react";
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import { readLocalStorageItem as readLocalStorage, writeLocalStorageItem as writeLocalStorage } from '../modules/intlProvider'; // 原 He/We
import type { ThemeMode } from '../modules/Settings'; // A0-CLEANUP B-22：theme 收敛到 ThemeMode（type-only，无运行时环）
import type { UserInfo } from '../modules/OnboardingLoginLeaves';
import type { UseBoundStore } from './storeTypes';

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
 *  | oauthError | string \| null | 最近 OAuth 错误（文案字符串；A1-R10 2a 精化） |
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

export interface LoginEntryRequest { id: number; providerId: string; purpose?: string } // A1-R10 2a 精化：purpose 可选——bundle 1215 实现 (t,n) 无缺省、88869 调用点仅传 providerId；OnboardingLoginLeaves 本地面 490 同形
export interface LoginEntryAttempt extends LoginEntryRequest { status: "requested" | "pending" | "settled" | string }

export interface SettingsState {
  theme: ThemeMode;
  locale: string;
  codePreviewSettings: CodePreviewSettings;
  uiFontSizePx: number;
  performanceMode: boolean;
  notificationEnabled: boolean;
  notificationSoundEnabled: boolean;
  user: UserInfo | null;
  isRestoringOAuthSession: boolean;
  oauthError: string | null; // A1-R10 2a 精化：全树写点仅 string|null（OnboardingLoginLeaves 3778 LOGIN_FAILED_MESSAGE/各 null 清零），读面按文案字符串渲染（1531）或 string|null 面消费（ModelProviderSettingsSection 1070）；原 unknown 面迫使 1358 断言
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
  setTheme(theme: ThemeMode): void;
  setLocale(locale: string): void;
  setCodePreviewSettings(patch: Partial<CodePreviewSettings>): void;
  setUiFontSizePx(px: number): void;
  setPerformanceMode(enabled: boolean): void;
  setNotificationEnabled(enabled: boolean): void;
  setNotificationSoundEnabled(enabled: boolean): void;
  setUser(user: UserInfo | null): void;
  setIsRestoringOAuthSession(v: boolean): void;
  setOAuthError(error: string | null): void;
  markOAuthSuccess(provider?: string | null): void;
  markApiKeyLoginSuccess(model?: string | null): void;
  markModelProviderFamilyConnectionTransition(transition: unknown): void;
  requestLoginEntry(providerId: string, purpose?: string): number; // A1-R10 2a 精化：purpose 可选（bundle 1215 实现 (t,n) 无缺省、88869 仅传单参；树内三调用点均单参）
  clearLoginEntryRequest(id?: number): void;
  markLoginEntryAttemptStatus(id: number, status: string): void;
  requestOnboardingDialog(): void;
  clearOnboardingDialogRequest(): void;
}

/** 跨窗口广播服务（原参数 e：send/onMessage；由 App 根 provider 注入） */
export interface BroadcastService {
  send(message: { channel: string; payload: unknown }): void;
  /** A1-R10 2a 精化：真形返回可 dispose 句柄——根装配同一真实服务在 AppRootLeaves 2014/2040 以 subscription.dispose() 释放；Mie（bundle 1261）丢弃返回值。旧 () => void 面为 A0 误判 */
  onMessage(handler: (message: { channel: string; payload: unknown }) => void): { dispose(): void };
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
export function applyUiFontSizePx(px: number): void {
  const target = document.documentElement.style;
  target?.setProperty?.("--ui-font-size", `${clampUiFontSizePx(px)}px`);
}

export function loadUiFontSizePx(): number {
  const raw = readLocalStorage(UI_FONT_SIZE_STORAGE_KEY);
  const parsed = raw === null ? NaN : Number(raw);
  return clampUiFontSizePx(Number.isFinite(parsed) ? parsed : undefined);
}

/** 原 Tie：监听 storage 事件 zcode-ui-font-size-px → 写 --ui-font-size；返回卸载函数 */
export function watchUiFontSizeStorageChanges(): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== UI_FONT_SIZE_STORAGE_KEY) return;
    const parsed = event.newValue === null ? NaN : Number(event.newValue);
    applyUiFontSizePx(Number.isFinite(parsed) ? parsed : 14);
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
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

/** 原 yo（js 1085）：读 zcode-notification-enabled（缺省 true） */
function readNotificationEnabled(): boolean {
  return readBooleanSetting(NOTIFICATION_ENABLED_KEY, true);
}

/** 原 bo（js 1088）：读 zcode-notification-sound-enabled（缺省 true） */
function readNotificationSoundEnabled(): boolean {
  return readBooleanSetting(NOTIFICATION_SOUND_ENABLED_KEY, true);
}

/** 原 Eie（js 1091）：启动提示音开关 = 通知开 && 提示音开（AppRootLeaves 2604 消费） */
export function isStartupSoundEnabled(): boolean {
  return readNotificationEnabled() && readNotificationSoundEnabled();
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
    theme: normalizeThemeId(readLocalStorage("zcode-theme") || "zai-dark") as ThemeMode,
    setTheme: (theme) => {
      const normalized = normalizeThemeId(theme) as ThemeMode;
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
      if (field === "theme" && typeof message.payload === "string") state.setTheme(message.payload as ThemeMode);
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

/** 原 Ao：带缺省值的设置 store 选择器（SettingsStoreProvider 外返回 fallback） */
export function useSettingsStoreValue<R>(selector: (state: SettingsState) => R, fallback: R): R {
  const store = React.useContext(SettingsStoreContext);
  return store ? store(selector) : fallback;
}
