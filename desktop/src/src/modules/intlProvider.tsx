// DUPLICATE-OF: I18n.tsx —— 本文件与 I18n.tsx 同源（out/renderer/assets/IntlProvider-C321H7m8.js，
// 词典均自来源行 49–4563 / 4566–9084 逐字节抽取，两侧各 4,503 key 一致）。
// canonical = I18n.tsx（D8 Stage B2 标样版：语义命名+类型重建+77 前缀对照表；见 I18n.report.md §7）。
// 本文件保留作行级直排抽取版与 14/14 运行时等价 harness 记录（intlProvider.report.md §7）；
// 词典与 API 引用一律以 I18n.tsx 为准。
// 〔A0-S4-2：两词典实体已逐字节迁 lib/i18n/zh-CN.zcode.ts、en-US.zcode.ts（保留原 chunk 值）；本文件薄 re-export〕
/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/IntlProvider-C321H7m8.js（9253 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原（provider 渲染段）
 *    · 结构：行 1-47 为 localStorage 工具与 navigator 语言探测；
 *      行 48-4564 为 **zh-CN 文案目录**（约 4500 条）；
 *      行 4565-9085 为 **en-US 文案目录**（约 4500 条）；
 *      行 9086-9253 为目录映射表、语言偏好/广播协议与 Provider/hook。
 *    · 两个目录是纯数据（i18n key -> 文案），本身无混淆；恢复版
 *      **逐字节**保留目录内容（脚本自原 chunk 抽取拼装），仅把宿主
 *      变量名 p/m 改为 ZH_CN_MESSAGES/EN_US_MESSAGES。
 *    · 唯一导入 `Ps`（src-HCld2afU.js，内部名 e = 'zh-CN'）为缺省语言常量，
 *      在 navigator 语言不可用时兜底（见 resolveLocaleFromNavigator）。
 *    · 消费者交叉验证：入口 index-ABImDspU.js 以 `x`（导出别名 t）渲染
 *      ZCodeIntlProvider 并传入 settingService/broadcastService/
 *      resolveSystemLocale；三个用量图组件与 styles 主 chunk 经
 *      `n()`（导出别名 n = useZCodeIntl）取 intl/locale。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为等价——
 *    1) 目录数据逐字节一致（脚本抽取，见 .report.md 验证节）；
 *    2) formatMessage 的 `{placeholder}` 全量替换语义逐字保留
 *       （replaceAll 逐个 values 键替换，缺失键保留原样）；
 *    3) 语言偏好的存储键 'zcode-locale-preference'、广播信道 'state:locale'、
 *       代际计数（generation）防竞态、远端回环抑制（isApplyingRemoteChange +
 *       pendingLocalBroadcast 比对）逻辑逐字保留；
 *    4) settingService.update 仅在代际未过期时调用、错误静默吞掉的
 *       `.catch(() => {})` 语义保留。
 *  唯一文本级差异：逗号表达式展开为语句块（无可观察差异）。
 * ════════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { DEFAULT_LOCALE } from './SrcSharedA'; // 原 src-HCld2afU Ps（内部名 e = 'zh-CN'）

/* A0-S4-2 shim：消息表与 MessageCatalog 类型已迁 lib/i18n/（zh-CN.zcode.ts / en-US.zcode.ts / types.ts；
 * 本文件为 DUPLICATE-OF 行级直排版，其词典保留原 chunk 值、不含 REBRAND-035+135）；
 * import 形式保留本地绑定（§3 MESSAGE_CATALOGS 消费），export 保持原导出面。 */
import type { MessageCatalog } from '../lib/i18n/types';
import { ZH_CN_MESSAGES } from '../lib/i18n/zh-CN.zcode';
import { EN_US_MESSAGES } from '../lib/i18n/en-US.zcode';

export type { MessageCatalog };
export { ZH_CN_MESSAGES, EN_US_MESSAGES };

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/** 应用支持的语言。把握度高：isSupportedLocale 逐字给出。 */
export type SupportedLocale = 'zh-CN' | 'en-US';

/** 语言偏好：跟随系统或锁定某一语言。 */
export type LocalePreference = 'system' | SupportedLocale;

/* A0-S4-2: MessageCatalog 声明已迁 lib/i18n/types.ts（顶部 import type 后 re-export，
 * 本地绑定供 §3 MESSAGE_CATALOGS 注解使用）。 */

/** 精简 intl 对象（ZCode 自研，非 react-intl；仅实现 formatMessage）。 */
export interface ZCodeIntl {
  formatMessage: (descriptor: { id: string }, values?: Record<string, unknown>) => string;
}

/** Provider 上下文值。 */
export interface ZCodeIntlContextValue {
  intl: ZCodeIntl;
  /** 生效语言（偏好为 system 时为解析出的系统语言）。 */
  locale: SupportedLocale;
  localePreference: LocalePreference;
  /** 对外简化入口：等价于 setLocalePreference。 */
  setLocale: (preference: LocalePreference) => void;
  setLocalePreference: (preference: LocalePreference) => void;
}

/**
 * 设置服务（主进程 IPC 代理）。
 * // TODO(infer): 完整接口定义在 @zcode/services，此处按本模块用法建模。
 */
export interface SettingServiceLike {
  get: () => Promise<{ locale?: string; localePreference?: string }>;
  update: (patch: { locale: SupportedLocale; localePreference: LocalePreference }) => Promise<unknown>;
}

/**
 * 跨窗口广播服务（语言偏好经它在多窗口间同步）。
 * // TODO(infer): 同上，按本模块用法建模。
 */
export interface BroadcastServiceLike {
  send: (message: { channel: string; payload: unknown }) => Promise<unknown>;
  onMessage: (
    handler: (message: { channel: string; payload: unknown; sourceWindowId?: number }) => void,
  ) => { dispose: () => void };
}

export interface ZCodeIntlProviderProps {
  children?: React.ReactNode;
  settingService?: SettingServiceLike;
  broadcastService?: BroadcastServiceLike;
  /** 首帧语言偏好初值（优先于本地存储）。 */
  initialLocale?: LocalePreference;
  /** true 时以设置服务的语言为准（并回写本地存储）。 */
  preferSettingServiceLocale?: boolean;
  /** 异步解析操作系统语言（主进程提供）。 */
  resolveSystemLocale?: () => Promise<string | undefined>;
}

/* ─────────────────────────── 1. localStorage 工具 ─────────────────────────── */

/** 安全取 localStorage（SSR/隐私模式等抛错场景返回 undefined）。 */
function getStorage(): Storage | undefined {
  try {
    return typeof window !== `undefined` ? window.localStorage : typeof localStorage !== `undefined` ? localStorage : undefined;
  } catch {
    return;
  }
}

/** 可读存储判定（有 getItem）。 */
function isReadableStorage(storage: unknown): storage is Storage {
  return !!storage && typeof (storage as Storage).getItem === `function`;
}

/** 可写存储判定（可读且有 setItem）。 */
function isWritableStorage(storage: unknown): storage is Storage {
  return isReadableStorage(storage) && typeof storage.setItem === `function`;
}

/** 取可读存储（否则 null）。 */
function getReadableStorage(): Storage | null {
  const storage = getStorage();
  return isReadableStorage(storage) ? storage : null;
}

/** 取可写存储（否则 null）。原导出别名 a。 */
export function getWritableStorage(): Storage | null {
  const storage = getStorage();
  return isWritableStorage(storage) ? storage : null;
}

/** 读 localStorage 项（任何异常返回 null）。原导出别名 o。 */
export function readLocalStorageItem(key: string): string | null {
  try {
    return getReadableStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** 写 localStorage 项（任何异常静默）。原导出别名 s。 */
export function writeLocalStorageItem(key: string, value: string): void {
  try {
    getWritableStorage()?.setItem(key, value);
  } catch {}
}

/** navigator.language 探测（不可用返回 null）。 */
function getNavigatorLanguage(): string | null {
  return typeof navigator === `undefined` || typeof navigator.language !== `string` ? null : navigator.language;
}

/* ─────────────────────────── 2. 文案目录（逐字节保留） ─────────────────────────── */

/* 〔A0-S4-2：两词典实体已逐字节迁出——ZH_CN_MESSAGES（本文件原行 158–4681）→ lib/i18n/zh-CN.zcode.ts，
 *   EN_US_MESSAGES（本文件原行 4683–9210）→ lib/i18n/en-US.zcode.ts；保留原 chunk 值（不含 REBRAND-035+135）。
 *   re-export shim 见文件顶部 import/export 块（§3 的 MESSAGE_CATALOGS 仍用本地绑定）。〕 */

/* ─────────────────────────── 3. 目录映射与协议常量 ─────────────────────────── */

/** 语言 -> 目录映射（原内部名 g；未导出，仅经 createIntlShim 消费）。 */
const MESSAGE_CATALOGS: Record<SupportedLocale, MessageCatalog> = { 'zh-CN': ZH_CN_MESSAGES, 'en-US': EN_US_MESSAGES };

/** 语言偏好的 localStorage 键（原内部名 _）。 */
const LOCALE_PREFERENCE_STORAGE_KEY = `zcode-locale-preference`;

/** 跨窗口语言同步广播信道（原内部名 v）。 */
const LOCALE_BROADCAST_CHANNEL = `state:locale`;

/** 是否受支持语言。 */
function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === `zh-CN` || value === `en-US`;
}

/** 是否合法语言偏好（system 或受支持语言）。 */
function isLocalePreference(value: unknown): value is LocalePreference {
  return value === `system` || isSupportedLocale(value);
}

/**
 * 解析广播载荷：既接受裸语言字符串（旧协议），也接受
 * {preference, resolvedLocale} 对象；非法返回 null。
 */
function parseLocaleBroadcastPayload(payload: unknown): { preference: LocalePreference; resolvedLocale: SupportedLocale } | null {
  if (isSupportedLocale(payload)) return { preference: payload, resolvedLocale: payload };
  if (!payload || typeof payload !== `object`) return null;
  const candidate = payload as { preference?: unknown; resolvedLocale?: unknown };
  return isLocalePreference(candidate.preference) && isSupportedLocale(candidate.resolvedLocale)
    ? { preference: candidate.preference, resolvedLocale: candidate.resolvedLocale }
    : null;
}

/**
 * 初始偏好裁决：优先设置服务语言（当 preferSettingServiceLocale 开启），
 * 其次本地存储偏好，再次设置服务偏好，最后设置服务语言；均无则 null。
 */
function resolveInitialLocalePreference({
  storedPreference,
  settingsLocale,
  settingsLocalePreference,
  preferSettingServiceLocale,
}: {
  storedPreference: LocalePreference | null;
  settingsLocale?: string;
  settingsLocalePreference?: string;
  preferSettingServiceLocale: boolean;
}): LocalePreference | null {
  if (preferSettingServiceLocale && settingsLocale) return settingsLocale as LocalePreference;
  return storedPreference ?? (settingsLocalePreference as LocalePreference | undefined) ?? (settingsLocale as LocalePreference | undefined) ?? null;
}

/**
 * 是否相关语言广播：信道匹配、载荷可解析，且过滤掉「自己刚发出、
 * 尚未收到回执」的本地回环（与 ignoredLocalPayload 完全一致则忽略）。
 */
function isRelevantLocaleBroadcast(
  message: { channel: string; payload: unknown; sourceWindowId?: number },
  options: { ignoredLocalPayload?: { preference: LocalePreference; resolvedLocale: SupportedLocale } | null } = {},
): boolean {
  const parsed = parseLocaleBroadcastPayload(message.payload);
  return !(
    message.channel !== LOCALE_BROADCAST_CHANNEL ||
    !parsed ||
    (message.sourceWindowId === undefined &&
      options.ignoredLocalPayload?.preference === parsed.preference &&
      options.ignoredLocalPayload.resolvedLocale === parsed.resolvedLocale)
  );
}

/**
 * 创建精简 intl：按语言取目录，formatMessage 做
 * `{placeholder}` 全量替换（缺失键保留原样，值经 String() 化）。
 */
function createIntlShim(locale: SupportedLocale): ZCodeIntl {
  const catalog = MESSAGE_CATALOGS[locale] ?? MESSAGE_CATALOGS[`zh-CN`];
  return {
    formatMessage({ id }, values) {
      let text = catalog[id] ?? id;
      if (values) for (const [key, value] of Object.entries(values)) text = text.replaceAll(`{${key}}`, String(value));
      return text;
    },
  };
}

/* ─────────────────────────── 4. 上下文 / Provider / hook ─────────────────────────── */

/** ZCode 国际化上下文（原内部名 T）。 */
const ZCodeIntlContext = React.createContext<ZCodeIntlContextValue | null>(null);

/**
 * ZCode 国际化 Provider（原内部名 E，导出别名 t）。
 *
 * 职责：
 *  1) 语言偏好三源裁决：本地存储 / 设置服务 / navigator（系统语言）；
 *  2) 偏好变更时：本地存储 + 设置服务（代际防竞态）+ 跨窗口广播；
 *  3) 收到他窗广播时应用变更，并抑制自身回执造成的回环；
 *  4) 经上下文下发 intl/locale/preference/setter。
 */
export function ZCodeIntlProvider({
  children,
  settingService,
  broadcastService,
  initialLocale,
  preferSettingServiceLocale = false,
  resolveSystemLocale,
}: ZCodeIntlProviderProps) {
  /** 正在应用远端（他窗广播）变更——期间不再向外广播。 */
  const isApplyingRemoteChangeRef = React.useRef(false);
  /** 本地已发出、等待回执的广播载荷（用于回环过滤）。 */
  const pendingLocalBroadcastRef = React.useRef<{ preference: LocalePreference; resolvedLocale: SupportedLocale } | null>(null);
  /** 语言变更代际：异步竞态护栏（只有最新一代可写设置服务）。 */
  const localeChangeGenerationRef = React.useRef(0);

  /** navigator 语言 -> 支持语言；不可用时回退缺省语言（'zh-CN'）。 */
  const resolveLocaleFromNavigator = React.useCallback((): SupportedLocale => {
    const language = getNavigatorLanguage();
    return language ? (language.toLowerCase().startsWith(`zh`) ? `zh-CN` : `en-US`) : (DEFAULT_LOCALE as SupportedLocale);
  }, []);

  /** 异步解析系统语言（主进程），失败/非法时退回 navigator。 */
  const resolveSystemLocaleAsync = React.useCallback(async (): Promise<SupportedLocale> => {
    const resolved = await resolveSystemLocale?.();
    return isSupportedLocale(resolved) ? resolved : resolveLocaleFromNavigator();
  }, [resolveSystemLocale, resolveLocaleFromNavigator]);

  /** 读本地存储中的偏好。 */
  const readStoredPreference = React.useCallback((): LocalePreference | null => {
    const stored = readLocalStorageItem(LOCALE_PREFERENCE_STORAGE_KEY);
    return isLocalePreference(stored) ? stored : null;
  }, []);

  /** 偏好持久化到本地存储。 */
  const persistPreference = React.useCallback((preference: LocalePreference) => {
    writeLocalStorageItem(LOCALE_PREFERENCE_STORAGE_KEY, preference);
  }, []);

  /** 语言偏好（'system' 或具体语言）。 */
  const [localePreference, setLocalePreferenceState] = React.useState<LocalePreference>(
    () => initialLocale ?? readStoredPreference() ?? `system`,
  );
  /** 偏好为 system 时解析出的实际语言。 */
  const [resolvedSystemLocale, setResolvedSystemLocale] = React.useState<SupportedLocale>(() => resolveLocaleFromNavigator());

  /** 代际未过期时把（解析后语言, 偏好）写入设置服务；错误静默。 */
  const pushLocaleToSettings = React.useCallback(
    (generation: number, locale: SupportedLocale, preference: LocalePreference) => {
      if (localeChangeGenerationRef.current === generation) {
        settingService?.update({ locale, localePreference: preference }).catch(() => {});
      }
    },
    [settingService],
  );

  // 挂载时与设置服务对账：设置服务优先（按 preferSettingServiceLocale），
  // 偏好为 system 时异步解析系统语言，并在设置值过期时回写设置服务。
  React.useEffect(() => {
    if (!settingService) return;
    let disposed = false;
    const generation = localeChangeGenerationRef.current;
    settingService.get().then(async (settings) => {
      if (disposed || localeChangeGenerationRef.current !== generation) return;
      const preference = resolveInitialLocalePreference({
        storedPreference: readStoredPreference(),
        settingsLocale: settings.locale,
        settingsLocalePreference: settings.localePreference,
        preferSettingServiceLocale,
      });
      if (!disposed && preference) {
        setLocalePreferenceState(preference);
        if (preferSettingServiceLocale) persistPreference(preference);
        if (preference === `system`) {
          const resolved = await resolveSystemLocaleAsync();
          if (disposed || localeChangeGenerationRef.current !== generation) return;
          setResolvedSystemLocale(resolved);
          if (settings.locale !== resolved) pushLocaleToSettings(generation, resolved, `system`);
        }
      }
    });
    return () => {
      disposed = true;
    };
  }, [persistPreference, preferSettingServiceLocale, readStoredPreference, pushLocaleToSettings, resolveSystemLocaleAsync, settingService]);

  /** 生效语言。 */
  const effectiveLocale = React.useMemo<SupportedLocale>(
    () => (localePreference === `system` ? resolvedSystemLocale : localePreference),
    [localePreference, resolvedSystemLocale],
  );

  /** 切换语言偏好：代际推进 -> 状态/存储更新 -> 异步解析 -> 广播 -> 写设置服务。 */
  const setLocalePreference = React.useCallback(
    (preference: LocalePreference) => {
      const generation = localeChangeGenerationRef.current + 1;
      localeChangeGenerationRef.current = generation;
      setLocalePreferenceState(preference);
      persistPreference(preference);
      (async () => {
        const resolved = preference === `system` ? await resolveSystemLocaleAsync() : preference;
        if (localeChangeGenerationRef.current !== generation) return;
        if (preference === `system`) setResolvedSystemLocale(resolved);
        const payload = { preference, resolvedLocale: resolved };
        if (!isApplyingRemoteChangeRef.current && broadcastService) {
          pendingLocalBroadcastRef.current = payload;
          broadcastService.send({ channel: LOCALE_BROADCAST_CHANNEL, payload }).finally(() => {
            if (
              pendingLocalBroadcastRef.current?.preference === payload.preference &&
              pendingLocalBroadcastRef.current.resolvedLocale === payload.resolvedLocale
            ) {
              pendingLocalBroadcastRef.current = null;
            }
          });
        }
        pushLocaleToSettings(generation, resolved, preference);
      })();
    },
    [broadcastService, pushLocaleToSettings, persistPreference, resolveSystemLocaleAsync],
  );

  // 订阅他窗语言广播：过滤回环后代际 +1 并应用。
  React.useEffect(() => {
    if (!broadcastService) return;
    const subscription = broadcastService.onMessage((message) => {
      if (!isRelevantLocaleBroadcast(message, { ignoredLocalPayload: pendingLocalBroadcastRef.current })) return;
      pendingLocalBroadcastRef.current = null;
      const parsed = parseLocaleBroadcastPayload(message.payload);
      if (parsed) {
        isApplyingRemoteChangeRef.current = true;
        try {
          localeChangeGenerationRef.current += 1;
          setLocalePreferenceState(parsed.preference);
          persistPreference(parsed.preference);
          setResolvedSystemLocale(parsed.resolvedLocale);
        } finally {
          isApplyingRemoteChangeRef.current = false;
        }
      }
    });
    return () => subscription.dispose();
  }, [broadcastService, persistPreference]);

  /** 对外简化入口（与 setLocalePreference 等价）。 */
  const setLocale = React.useCallback(
    (preference: LocalePreference) => {
      setLocalePreference(preference);
    },
    [setLocalePreference],
  );

  const intl = React.useMemo(() => createIntlShim(effectiveLocale), [effectiveLocale]);

  return (
    <ZCodeIntlContext.Provider
      value={React.useMemo(
        () => ({ intl, locale: effectiveLocale, localePreference, setLocale, setLocalePreference }),
        [intl, effectiveLocale, localePreference, setLocale, setLocalePreference],
      )}
    >
      {children}
    </ZCodeIntlContext.Provider>
  );
}

/**
 * 读取 ZCode 国际化上下文（原内部名 D，导出别名 n）。
 * 脱离 Provider 使用直接抛错（错误文案逐字保留）。
 */
export function useZCodeIntl(): ZCodeIntlContextValue {
  const value = React.useContext(ZCodeIntlContext);
  if (!value) throw Error(`useZCodeIntl 必须在 ZCodeIntlProvider 内使用`);
  return value;
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（7 个，exportName 为原 chunk 的导出别名）：
 *   a -> l -> getWritableStorage      取可写 localStorage
 *   i -> p -> ZH_CN_MESSAGES          zh-CN 文案目录（约 4500 条）
 *   n -> D -> useZCodeIntl            国际化上下文 hook
 *   o -> u -> readLocalStorageItem    读 localStorage 项
 *   r -> m -> EN_US_MESSAGES          en-US 文案目录（约 4500 条）
 *   s -> d -> writeLocalStorageItem   写 localStorage 项
 *   t -> E -> ZCodeIntlProvider       国际化 Provider
 * 模块内局部符号（13 个，未导出）：
 *   - -> a -> getStorage              安全取 localStorage
 *   - -> o -> isReadableStorage       可读判定
 *   - -> s -> isWritableStorage       可写判定
 *   - -> c -> getReadableStorage      取可读存储
 *   - -> f -> getNavigatorLanguage    navigator.language 探测
 *   - -> h -> jsxRuntime              （n()，jsx-runtime 命名空间）
 *   - -> g -> MESSAGE_CATALOGS        语言 -> 目录映射
 *   - -> _ -> LOCALE_PREFERENCE_STORAGE_KEY  'zcode-locale-preference'
 *   - -> v -> LOCALE_BROADCAST_CHANNEL       'state:locale'
 *   - -> y -> isSupportedLocale       'zh-CN' | 'en-US' 判定
 *   - -> b -> isLocalePreference      system/语言 判定
 *   - -> x -> parseLocaleBroadcastPayload    广播载荷解析
 *   - -> S -> resolveInitialLocalePreference 初始偏好裁决
 *   - -> C -> isRelevantLocaleBroadcast       广播相关性/回环过滤
 *   - -> w -> createIntlShim          formatMessage 精简实现
 *   - -> T -> ZCodeIntlContext        上下文对象
 * 导入符号（1 个，来自 ./src-HCld2afU.js，格式：导出别名 -> 内部名 -> 语义名）：
 *   Ps -> e -> DEFAULT_LOCALE         缺省语言常量 'zh-CN'
 * 〔A0-S4-2：i/r（ZH_CN_MESSAGES/EN_US_MESSAGES）实体已迁 lib/i18n/zh-CN.zcode.ts、
 *   en-US.zcode.ts；本文件薄 re-export，导出面不变〕
 * ════════════════════════════════════════════════════════════════════════ */
