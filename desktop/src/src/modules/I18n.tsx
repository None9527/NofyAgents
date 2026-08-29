/* eslint-disable */
/**
 * ============================================================================
 * I18n.tsx — ZCode 3.7.6 自研 i18n 层（解混淆重建 · D8 Stage B2）
 * ----------------------------------------------------------------------------
 * ★ CANONICAL（D9 去重裁决）：本文件为 IntlProvider-C321H7m8.js 的规范重建版；
 *   同目录 intlProvider.tsx 为同源行级直排版（已标注 DUPLICATE-OF: I18n.tsx）。
 *   词典（zh-CN/en-US 各 4,503 key）与 API 引用以本文件为准。
 * ============================================================================
 *
 * 来源文件（独立 chunk，9,253 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/IntlProvider-C321H7m8.js
 *
 * 负面结论（已登记于 VENDOR-MANIFEST-LIBS.md）：本 chunk 为 **自研 i18n** ——
 * 无 react-intl、无 ICU MessageFormat、无 Intl.PluralRules；formatMessage 仅做
 * `{placeholder}` 全量替换插值；词典内联于本 chunk（非懒加载资源）。词典里
 * 23 个带 `.one/.other/.many` 后缀的 key 是"伪复数"：复数分支由调用方自行选
 * key，i18n 层本身不做复数裁决。
 *
 * ----------------------------------------------------------------------------
 * chunk 结构总览（行号以来源 js 为准）
 * ----------------------------------------------------------------------------
 *   1–4        import 块（interop 助手 / React / jsx-runtime / 缺省语言常量）
 *   5          `i = __toESM(React)` 命名空间包装
 *   6–47       localStorage 安全读写工具组 + navigator.language 探测
 *   48–4564    zh-CN 文案词典 `p`（4,503 key）
 *   4565–9085  en-US 文案词典 `m`（4,503 key）
 *   9086–9089  `h`=jsx 运行时、`g`=词典映射、`_`=存储键、`v`=广播信道
 *              （与 `p`/`m` 同属一条 var 声明链）
 *   9090–9131  locale 守卫 / 广播载荷解析 / 初始偏好解析 / 广播相关性判定 /
 *              createIntl（formatMessage 实现）
 *   9132       `T = createContext(null)`
 *   9133–9247  `E` = ZCodeIntlProvider（settingService 水合 + 代际计数 +
 *              跨窗口广播回环抑制）
 *   9248–9252  `D` = useZCodeIntl
 *   9253       export { l as a, p as i, D as n, u as o, m as r, d as s, E as t }
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = 来源 js 行）
 * ----------------------------------------------------------------------------
 *  存储工具（6–47）：
 *   a → getStorage                        (6)   try 取 window.localStorage / localStorage
 *   o → isReadableStorage                 (17)  有 getItem
 *   s → isWritableStorage                 (20)  可读且有 setItem
 *   c → getReadableStorage                (23)  否则 null
 *   l → getWritableStorage                (27)  否则 null        [导出别名 a]
 *   u → readLocalStorageItem              (31)  异常 → null      [导出别名 o]
 *   d → writeLocalStorageItem             (38)  异常静默         [导出别名 s]
 *   f → getNavigatorLanguage              (43)  不可用 → null
 *  词典（48–9089）：
 *   p → ZH_CN_MESSAGES                    (48–4564)              [导出别名 i]
 *   m → EN_US_MESSAGES                    (4565–9085)            [导出别名 r]
 *   〔A0-S4-2：两词典实体已迁 lib/i18n/zh-CN.ts、en-US.ts；本文件保留薄 re-export，映射保留〕
 *   h → jsx 运行时（n()）                  (9086)  重建版直接写 JSX，无对应符号
 *   g → MESSAGES_BY_LOCALE                (9087)  { "zh-CN": p, "en-US": m }
 *   _ → LOCALE_PREFERENCE_STORAGE_KEY     (9088)  = 'zcode-locale-preference'
 *   v → LOCALE_BROADCAST_CHANNEL          (9089)  = 'state:locale'
 *  locale 运行时（9090–9252）：
 *   y → isSupportedLocale                 (9090)  'zh-CN' | 'en-US'
 *   b → isValidLocalePreference           (9093)  'system' | 支持语言
 *   x → parseLocaleBroadcastPayload       (9096)  字符串或 {preference, resolvedLocale}
 *   S → resolveInitialLocalePreference    (9104)  水合初值裁决
 *   C → isRelevantLocaleBroadcast         (9112)  信道+载荷+回环判定
 *   w → createIntl                        (9122)  formatMessage 工厂
 *   T → ZCodeIntlContext                  (9132)  createContext(null)
 *   E → ZCodeIntlProvider                 (9133–9247)            [导出别名 t]
 *   D → useZCodeIntl                      (9248–9252)            [导出别名 n]
 *
 *  Provider `E` 内部闭包符号（括号内为定义行）：
 *   props: children:e / settingService:t / broadcastService:n / initialLocale:a /
 *          preferSettingServiceLocale:o=false / resolveSystemLocale:s   (9133–9140)
 *   c → isApplyingRemoteChangeRef   (9141)  应用远端广播期间的回环抑制旗标
 *   l → pendingLocalBroadcastRef    (9142)  本窗口已发出、待回环比对的载荷
 *   p → generationRef               (9143)  代际计数（防异步竞态）
 *   m → resolveNavigatorLocale      (9144)  navigator.language → zh-CN/en-US/缺省
 *   g → resolveSystemLocaleSafe     (9148)  主进程系统语言 → 支持语言兜底
 *   E → readStoredPreference        (9152)  读 'zcode-locale-preference'
 *   D → writeStoredPreference       (9156)  写 'zcode-locale-preference'
 *   O/k → localePreference 状态      (9159)  初值 initialLocale ?? 存储 ?? 'system'
 *   A/j → systemLocale 状态          (9160)  初值 resolveNavigatorLocale()
 *   M → persistToSettingService     (9161)  代际未过期才 update，错误吞掉
 *   （hydrate effect）               (9166–9190)  get() → 初值裁决 → system 解析回写
 *   N → effectiveLocale             (9191)  preference==='system' ? systemLocale : preference
 *   P → setLocalePreference         (9192–9214)  本地切换：代际+1、存储、广播、持久化
 *   （广播订阅 effect）              (9215–9232)  onMessage → 回环判定 → 应用远端偏好
 *   F → setLocale                   (9233)  对外简化入口（= setLocalePreference）
 *   I → intl                        (9239)  useMemo(createIntl(effectiveLocale))
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. chunk-Cq_f4orQ.js      导出 s（内部名 d）= __toESM（CJS→ESM 互操作包装）
 *  2. react-BQLj9xdT.js      导出 t = React CommonJS 模块（__commonJS 工厂产物）
 *  3. jsx-runtime-B5yMD3-t.js 导出 t = React jsx 运行时（jsx/jsxs）
 *  4. src-HCld2afU.js        导出 Ps（内部名 e，该 chunk 第 1 行）= 'zh-CN'
 *                            缺省语言常量（navigator 语言不可用时的兜底）
 *
 *  消费方（7 个 chunk 导入本 chunk；别名以各 chunk import 块为准）：
 *   · index-ABImDspU.js（入口）  import { t as x } —— 应用根（createRoot 后第一层
 *     业务 provider）挂载 ZCodeIntlProvider，props：settingService /
 *     broadcastService（= n.broadcastService）/ resolveSystemLocale（= 平台服务
 *     X.getSystemLocale）；未传 initialLocale / preferSettingServiceLocale。
 *   · styles-CdEGpc2x.js（融合主 chunk，429 行）import { a as Be, i as Ve, n as G,
 *     o as He, r as Ue, s as We, t as Ge }：
 *       G()=useZCodeIntl 全 chunk 出现 408 次（formatMessage 调用 ~3,167 处）；
 *       He/We 供 SettingsStore（Mie 工厂，1140–1286：zcode-theme|zcode-locale|
 *       uiFontSizePx|performanceMode 持久化）；Be 供侧栏任务偏好持久化
 *       （q6/KFt，144780/144798：zcode-sidebar-task-preferences）；
 *       Ve/Ue/Ge 被 import 但未发现顶层直接使用（打包器互操作残留）。
 *   · AppUsageDailyModelBarChart-037NXfkz.js / AppUsageModelUsagePieChart-_KCE1AAL.js /
 *     CodingPlanUsageLineChart-BpNLwqMV.js  import { n } —— 用量图表文案
 *     （settings.usage.*，如 tokenUnit/dailyChartTitle/emptyTitle）。
 *   · previewPaneOfficeXlsxContent-XeHwYdMn.js  import { n as r }。
 *   · usageStatsUiParts-CiR7YEhh.js  副作用导入（无具名绑定）。
 *
 * ----------------------------------------------------------------------------
 * 三、key 组织（词典一级前缀，共 77 个；数量与融合 chunk 对照见 I18n.report.md）
 * ----------------------------------------------------------------------------
 *  两词典 key 集完全一致（各 4,503 key，无重复、无单侧孤儿），一级前缀的
 *  首次出现顺序逐一相同（按功能域编排，而非字母序）。按首次出现顺序：
 *   common → settings → carousel → quickPick → commandCenter → confirmDialog →
 *   bots → welcome → login → app → logout → sidebar → browser → diff → sidePane →
 *   subagentDirectory → chat → whiteboard → treemapping → modelTrajectory →
 *   repoWiki → git → gitGraph → codeViewer → codeBlock → markdownTable →
 *   appHeader → fileActions → workspaceHeader → titleBar → directoryBrowser →
 *   updateReady → updateAvailable → updateDialog → update → forceUpdate →
 *   desktopMenu → postUpdateReleaseNotes → projectSelector → appError →
 *   workspace → taskList → workspaceSidebar → workspaceFileTree → ssh → remote →
 *   remoteConnection → webRemoteControl → server → wsl → docker → locale →
 *   fileTree → terminal → v4Pane → taskGroup → taskSearch → taskTimeline →
 *   taskNav → notification → usage → settingsSync → onboarding → tokenDebug →
 *   developerTools → markdownImage → mode → todo → planTool → zcode → debugInfo →
 *   processMonitor → feedback → forms → automations → offPeak → scheduledPreview。
 *  数量前五：settings(1522)、chat(656)、feedback(288)、bots(257)、automations(195)。
 *  493 个 key 含 {placeholder} 插值（147 个不同占位符名，最多为 {count}×123）。
 *
 * ----------------------------------------------------------------------------
 * 四、行为等价声明
 * ----------------------------------------------------------------------------
 *  1) 词典内容自来源 chunk 行 49–4563 / 4566–9084 **逐字节**抽取（脚本拼装，
 *     仅更换宿主变量名 p/m → ZH_CN_MESSAGES/EN_US_MESSAGES；见 I18n.report.md
 *     验证节的 diff 方法）。
 *  2) formatMessage 语义逐字保留：缺失 key 返回 key 本身；values 逐键
 *     `replaceAll("{name}", String(value))`；values 缺某占位符时原文保留。
 *  3) 存储键 'zcode-locale-preference'、广播信道 'state:locale'、代际计数
 *     （generationRef）、isApplyingRemoteChange + pendingLocalBroadcast 回环
 *     抑制逻辑逐字保留。
 *  4) settingService.update 仅在代际未过期时调用，错误 `.catch(() => {})` 吞掉。
 *  5) 唯一文本级差异：var 声明链拆分、逗号表达式展开为语句块、jsx() 调用改写
 *     为 JSX 语法（均无可观察差异）。
 * ============================================================================
 */

import * as React from "react";

/* A0-S4-2 shim：消息表与 MessageCatalog 类型已迁 lib/i18n/（zh-CN.ts / en-US.ts / types.ts）；
 * import 形式保留本地绑定（§3 MESSAGES_BY_LOCALE 消费），export 保持原导出面。 */
import type { MessageCatalog } from "../lib/i18n/types";
import { ZH_CN_MESSAGES } from "../lib/i18n/zh-CN";
import { EN_US_MESSAGES } from "../lib/i18n/en-US";

export type { MessageCatalog };
export { ZH_CN_MESSAGES, EN_US_MESSAGES };

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/**
 * 缺省语言常量（原 `Ps`，src-HCld2afU.js 第 1 行 `var e = 'zh-CN'` 的 Ps 导出）。
 * 仅在 navigator 语言不可用时作为 resolveNavigatorLocale 的兜底。
 */
const DEFAULT_LOCALE: SupportedLocale = "zh-CN";

/** 应用支持的语言。把握度高：isSupportedLocale（原 y）逐字给出两个成员。 */
export type SupportedLocale = "zh-CN" | "en-US";

/** 语言偏好：跟随系统或锁定某一语言（原 b 的判定域）。 */
export type LocalePreference = "system" | SupportedLocale;

/* A0-S4-2: MessageCatalog 声明已迁 lib/i18n/types.ts（顶部 import type 后 re-export，
 * 本地绑定供 §3 MESSAGES_BY_LOCALE 注解使用）。 */

/** 跨窗口广播载荷（原 x 的解析目标；'system' 偏好时附带解析后的实际语言）。 */
export interface LocaleBroadcastPayload {
  preference: LocalePreference;
  resolvedLocale: SupportedLocale;
}

/**
 * 广播消息（与 src-HCld2afU.js 行 7400 的 zod schema `$p` 一致：
 * channel: string、payload: unknown、sourceWindowId?: int）。
 */
export interface BroadcastMessage {
  channel: string;
  payload: unknown;
  sourceWindowId?: number;
}

/** 精简 intl 对象（ZCode 自研，非 react-intl；仅实现 formatMessage）。 */
export interface ZCodeIntl {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/** Provider 上下文值（原 E 返回的 useMemo 对象）。 */
export interface ZCodeIntlContextValue {
  intl: ZCodeIntl;
  /** 生效语言（偏好为 'system' 时为解析出的系统语言）。 */
  locale: SupportedLocale;
  localePreference: LocalePreference;
  /** 对外简化入口：等价于 setLocalePreference（原 F）。 */
  setLocale: (preference: LocalePreference) => void;
  setLocalePreference: (preference: LocalePreference) => void;
}

/**
 * 设置服务（主进程 IPC 代理；入口经 settingService 传入）。
 * // TODO(infer): 完整接口在 @zcode/services，此处按本模块用法（get/update 两面）建模。
 * 水合时读取 {locale, localePreference}；切换时以 {locale, localePreference} 回写。
 */
export interface SettingServiceLike {
  get(): Promise<{ locale?: SupportedLocale; localePreference?: LocalePreference }>;
  update(patch: { locale: SupportedLocale; localePreference: LocalePreference }): Promise<unknown>;
}

/**
 * 跨窗口广播服务（语言偏好经它在多窗口间同步）。
 * // TODO(infer): 同上，按本模块用法建模；send 返回 Promise（原代码挂 .finally），
 * onMessage 返回 {dispose}（原 effect 清理调用 e.dispose()）。
 */
export interface BroadcastServiceLike {
  send(message: BroadcastMessage): Promise<unknown>;
  onMessage(handler: (message: BroadcastMessage) => void): { dispose(): void };
}

export interface ZCodeIntlProviderProps {
  children?: React.ReactNode;
  settingService?: SettingServiceLike;
  broadcastService?: BroadcastServiceLike;
  /** 首帧语言偏好初值（优先于本地存储；入口未传）。 */
  initialLocale?: LocalePreference;
  /** true 时以设置服务的语言为准（并回写本地存储）；缺省 false。 */
  preferSettingServiceLocale?: boolean;
  /** 异步解析操作系统语言（主进程提供；入口传平台服务 X.getSystemLocale）。 */
  resolveSystemLocale?: () => Promise<string | undefined>;
}

/* ============================================================================
 * 1. localStorage 工具（原行 6–47）
 * ----------------------------------------------------------------------------
 * 全部异常安全：读取失败 → null/undefined，写入失败静默。供本模块持久化
 * 'zcode-locale-preference'；导出后也被融合主 chunk 的 SettingsStore 与
 * 侧栏任务偏好复用（He/We/Be，见头部注释"消费方"）。
 * ==========================================================================*/

/** 原 a：安全取 localStorage（SSR/隐私模式等抛错场景返回 undefined）。 */
function getStorage(): Storage | undefined {
  try {
    return typeof window !== "undefined"
      ? window.localStorage
      : typeof localStorage !== "undefined"
        ? localStorage
        : undefined;
  } catch {
    return;
  }
}

/** 原 o：可读存储判定（有 getItem）。 */
function isReadableStorage(storage: unknown): storage is Storage {
  return !!storage && typeof (storage as Storage).getItem === "function";
}

/** 原 s：可写存储判定（可读且有 setItem）。 */
function isWritableStorage(storage: unknown): storage is Storage {
  return isReadableStorage(storage) && typeof (storage as Storage).setItem === "function";
}

/** 原 c：取可读存储（否则 null）。 */
function getReadableStorage(): Storage | null {
  const storage = getStorage();
  return isReadableStorage(storage) ? storage : null;
}

/** 原 l（导出别名 a）：取可写存储（否则 null）。 */
export function getWritableStorage(): Storage | null {
  const storage = getStorage();
  return isWritableStorage(storage) ? storage : null;
}

/** 原 u（导出别名 o）：读 localStorage 项（任何异常返回 null）。 */
export function readLocalStorageItem(key: string): string | null {
  try {
    return getReadableStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** 原 d（导出别名 s）：写 localStorage 项（任何异常静默）。 */
export function writeLocalStorageItem(key: string, value: string): void {
  try {
    getWritableStorage()?.setItem(key, value);
  } catch {
    /* 静默：与原实现一致 */
  }
}

/** 原 f：navigator.language 探测（不可用返回 null）。 */
function getNavigatorLanguage(): string | null {
  // 原实现为压缩惯用法 `typeof navigator > 'u'`（即 === 'undefined'），此处直写。
  return typeof navigator === "undefined" || typeof navigator.language !== "string" ? null : navigator.language;
}

/* ============================================================================
 * 2. 文案词典（原行 48–9085，逐字节保留）
 * ----------------------------------------------------------------------------
 * 结构要点：
 *  · 两个一级扁平目录（无嵌套、无命名空间对象），key 为点分路径字符串；
 *  · 两目录 key 集完全一致（各 4,503 key），值分别为简中/英文；
 *  · 493 个 key 含 {placeholder}；23 个带 .one/.other/.many 伪复数后缀
 *    （复数分支由调用方选 key，本层不做复数裁决——无 Intl.PluralRules）；
 *  · key 按功能域聚簇编排（见头部注释第三节的前缀顺序），两目录顺序一致。
 * 〔A0-S4-2：两词典实体已逐字节迁出——ZH_CN_MESSAGES（本文件原行 316–4836）→ lib/i18n/zh-CN.ts，
 *   EN_US_MESSAGES（本文件原行 4838–9362）→ lib/i18n/en-US.ts（canonical，含 REBRAND-035+135）；下为薄 re-export shim。〕
 * ==========================================================================*/


/* ZH_CN_MESSAGES（原内部名 p，导出别名 i）→ lib/i18n/zh-CN.ts；
 * EN_US_MESSAGES（原内部名 m，导出别名 r）→ lib/i18n/en-US.ts。
 * re-export shim 见文件顶部 import/export 块（§3 的 MESSAGES_BY_LOCALE 仍用本地绑定）。 */

/* ============================================================================
 * 3. locale 运行时（原行 9086–9253）
 * ==========================================================================*/

/** 原 g（行 9087）：locale → 词典 映射。 */
export const MESSAGES_BY_LOCALE: Record<SupportedLocale, MessageCatalog> = {
  "zh-CN": ZH_CN_MESSAGES,
  "en-US": EN_US_MESSAGES,
};

/** 原 _（行 9088）：语言偏好的 localStorage 持久化键。 */
export const LOCALE_PREFERENCE_STORAGE_KEY = "zcode-locale-preference";

/** 原 v（行 9089）：跨窗口语言同步的广播信道名。 */
export const LOCALE_BROADCAST_CHANNEL = "state:locale";

/** 原 y（行 9090）：支持语言守卫。 */
export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === "zh-CN" || value === "en-US";
}

/** 原 b（行 9093）：合法语言偏好守卫（'system' 或支持语言）。 */
export function isValidLocalePreference(value: unknown): value is LocalePreference {
  return value === "system" || isSupportedLocale(value);
}

/**
 * 原 x（行 9096）：解析广播载荷。
 * 兼容两种形态：
 *  · 裸字符串（支持语言）→ 视为 {preference: 该语言, resolvedLocale: 该语言}；
 *  · 对象 {preference, resolvedLocale} → 双字段分别守卫；
 * 其余一律 null（丢弃该广播）。
 */
export function parseLocaleBroadcastPayload(payload: unknown): LocaleBroadcastPayload | null {
  if (isSupportedLocale(payload)) return { preference: payload, resolvedLocale: payload };
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as Partial<LocaleBroadcastPayload>;
  return isValidLocalePreference(candidate.preference) && isSupportedLocale(candidate.resolvedLocale)
    ? { preference: candidate.preference, resolvedLocale: candidate.resolvedLocale }
    : null;
}

/**
 * 原 S（行 9104）：水合初值裁决（settingService.get() 返回后）。
 *  · preferSettingServiceLocale 且设置有语言 → 以设置为准；
 *  · 否则优先级：本地存储偏好 > 设置里的偏好 > 设置里的语言 > null。
 */
function resolveInitialLocalePreference({
  storedPreference,
  settingsLocale,
  settingsLocalePreference,
  preferSettingServiceLocale,
}: {
  storedPreference: LocalePreference | null;
  settingsLocale?: SupportedLocale;
  settingsLocalePreference?: LocalePreference;
  preferSettingServiceLocale: boolean;
}): LocalePreference | null {
  if (preferSettingServiceLocale && settingsLocale) return settingsLocale;
  return storedPreference ?? settingsLocalePreference ?? settingsLocale ?? null;
}

/**
 * 原 C（行 9112）：判定一条广播消息是否应当应用。
 * 三个条件全部满足才应用：
 *  1. 信道 === 'state:locale'；
 *  2. 载荷可解析（parseLocaleBroadcastPayload 非 null）；
 *  3. 不是本窗口自己发出的回环消息——判据：sourceWindowId 为 undefined
 *     且载荷与本窗口待确认的 pendingLocalBroadcast 完全一致。
 * （原实现用德摩根展开的否定式书写，此处等价直写。）
 */
function isRelevantLocaleBroadcast(
  message: BroadcastMessage,
  options: { ignoredLocalPayload?: LocaleBroadcastPayload | null } = {},
): boolean {
  const payload = parseLocaleBroadcastPayload(message.payload);
  return !(
    (
      message.channel !== LOCALE_BROADCAST_CHANNEL ||
      !payload ||
      (message.sourceWindowId === undefined &&
        options.ignoredLocalPayload?.preference === payload.preference &&
        options.ignoredLocalPayload?.resolvedLocale === payload.resolvedLocale)
    )
  );
}

/**
 * 原 w（行 9122）：按 locale 创建精简 intl 对象。
 * formatMessage 语义（逐字保留）：
 *  · 词典缺 key → 原样返回 key（开发期可见性兜底）；
 *  · values 逐键 `replaceAll("{键}", String(值))`；文案里多余的占位符
 *    （values 未提供）保持原样；values 里多余的键无副作用。
 *  · 无复数/性别等 ICU 能力（自研层，非 react-intl）。
 */
export function createIntl(locale: SupportedLocale): ZCodeIntl {
  const catalog = MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE["zh-CN"];
  return {
    formatMessage({ id }, values) {
      let message = catalog[id] ?? id;
      if (values) {
        for (const [name, value] of Object.entries(values)) {
          message = message.replaceAll(`{${name}}`, String(value));
        }
      }
      return message;
    },
  };
}

/** 原 T（行 9132）：i18n 上下文（未挂载 Provider 时为 null）。 */
export const ZCodeIntlContext = React.createContext<ZCodeIntlContextValue | null>(null);

/* ============================================================================
 * 3.1 ZCodeIntlProvider（原 E，行 9133–9247）
 * ----------------------------------------------------------------------------
 * 状态机要点：
 *  · 双状态：localePreference（'system'|语言）+ systemLocale（系统语言解析值）；
 *    生效语言 effectiveLocale = preference==='system' ? systemLocale : preference。
 *  · 三路初值来源：props.initialLocale > localStorage > 'system'（首帧同步），
 *    随后 settingService.get() 异步水合覆盖（resolveInitialLocalePreference）。
 *  · generationRef 代际计数：每次"本地切换/远端应用"都 +1；所有异步落点
 *    （设置服务回写、系统语言解析）先比对代际，过期即放弃，防竞态。
 *  · 跨窗口回环抑制：本地切换发出广播时把载荷记入 pendingLocalBroadcastRef；
 *    收到广播若 sourceWindowId===undefined 且载荷与待确认一致 → 视为自己的
 *    回环，丢弃；应用远端广播期间 isApplyingRemoteChangeRef 置位，阻止
 *    setLocalePreference 再次发广播。
 * ==========================================================================*/

export function ZCodeIntlProvider({
  children,
  settingService,
  broadcastService,
  initialLocale,
  preferSettingServiceLocale = false,
  resolveSystemLocale,
}: ZCodeIntlProviderProps) {
  /** 原 c：应用远端广播期间的回环抑制旗标。 */
  const isApplyingRemoteChangeRef = React.useRef(false);
  /** 原 l：本窗口已发出、待回环比对的载荷。 */
  const pendingLocalBroadcastRef = React.useRef<LocaleBroadcastPayload | null>(null);
  /** 原 p：代际计数（防异步竞态）。 */
  const generationRef = React.useRef(0);

  /** 原 m：navigator.language → zh-CN/en-US；不可用 → 缺省语言常量。 */
  const resolveNavigatorLocale = React.useCallback((): SupportedLocale => {
    const language = getNavigatorLanguage();
    return language ? (language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US") : DEFAULT_LOCALE;
  }, []);

  /** 原 g：主进程系统语言解析（失败/不支持时兜底 navigator）。 */
  const resolveSystemLocaleSafe = React.useCallback(async (): Promise<SupportedLocale> => {
    const resolved = await resolveSystemLocale?.();
    return isSupportedLocale(resolved) ? resolved : resolveNavigatorLocale();
  }, [resolveSystemLocale, resolveNavigatorLocale]);

  /** 原 E：读本地存储的语言偏好（非法值 → null）。 */
  const readStoredPreference = React.useCallback((): LocalePreference | null => {
    const stored = readLocalStorageItem(LOCALE_PREFERENCE_STORAGE_KEY);
    return isValidLocalePreference(stored) ? stored : null;
  }, []);

  /** 原 D：写本地存储的语言偏好。 */
  const writeStoredPreference = React.useCallback((preference: LocalePreference): void => {
    writeLocalStorageItem(LOCALE_PREFERENCE_STORAGE_KEY, preference);
  }, []);

  /** 原 O/k：语言偏好状态（首帧初值：props > 本地存储 > 'system'）。 */
  const [localePreference, setLocalePreferenceState] = React.useState<LocalePreference>(
    () => initialLocale ?? readStoredPreference() ?? "system",
  );
  /** 原 A/j：系统语言解析值状态（首帧以 navigator 为准）。 */
  const [systemLocale, setSystemLocale] = React.useState<SupportedLocale>(() => resolveNavigatorLocale());

  /** 原 M：设置服务回写——仅当代际未过期；错误静默吞掉。 */
  const persistToSettingService = React.useCallback(
    (generation: number, locale: SupportedLocale, preference: LocalePreference) => {
      if (generationRef.current === generation) {
        settingService?.update({ locale, localePreference: preference }).catch(() => {});
      }
    },
    [settingService],
  );

  /** 原行 9166–9190：settingService 水合 effect。 */
  React.useEffect(() => {
    if (!settingService) return;
    let cancelled = false;
    const generation = generationRef.current;
    settingService.get().then(async (settings) => {
      if (cancelled || generationRef.current !== generation) return;
      const initialPreference = resolveInitialLocalePreference({
        storedPreference: readStoredPreference(),
        settingsLocale: settings.locale,
        settingsLocalePreference: settings.localePreference,
        preferSettingServiceLocale,
      });
      if (!cancelled && initialPreference) {
        setLocalePreferenceState(initialPreference);
        if (preferSettingServiceLocale) writeStoredPreference(initialPreference);
        if (initialPreference === "system") {
          const resolved = await resolveSystemLocaleSafe();
          if (cancelled || generationRef.current !== generation) return;
          setSystemLocale(resolved);
          // 设置服务里记录的系统语言与本机解析不一致 → 以本机为准回写
          if (settings.locale !== resolved) persistToSettingService(generation, resolved, "system");
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [writeStoredPreference, preferSettingServiceLocale, readStoredPreference, persistToSettingService, resolveSystemLocaleSafe, settingService]);

  /** 原 N：生效语言。 */
  const effectiveLocale = React.useMemo<SupportedLocale>(
    () => (localePreference === "system" ? systemLocale : localePreference),
    [localePreference, systemLocale],
  );

  /** 原 P（行 9192–9214）：本地切换语言偏好。 */
  const setLocalePreference = React.useCallback(
    (preference: LocalePreference) => {
      // 代际 +1：使所有在途异步（水合/上一次切换）过期
      const generation = generationRef.current + 1;
      generationRef.current = generation;
      setLocalePreferenceState(preference);
      writeStoredPreference(preference);
      void (async () => {
        const resolved = preference === "system" ? await resolveSystemLocaleSafe() : preference;
        if (generationRef.current !== generation) return; // 已被更新的切换取代
        if (preference === "system") setSystemLocale(resolved);
        const payload: LocaleBroadcastPayload = { preference, resolvedLocale: resolved };
        // 应用远端广播期间不再外发（回环抑制）
        if (!isApplyingRemoteChangeRef.current && broadcastService) {
          pendingLocalBroadcastRef.current = payload;
          broadcastService.send({ channel: LOCALE_BROADCAST_CHANNEL, payload }).finally(() => {
            // 仅当待确认载荷仍是本次载荷时清空（避免误清更新的广播）
            if (
              pendingLocalBroadcastRef.current?.preference === payload.preference &&
              pendingLocalBroadcastRef.current?.resolvedLocale === payload.resolvedLocale
            ) {
              pendingLocalBroadcastRef.current = null;
            }
          });
        }
        persistToSettingService(generation, resolved, preference);
      })();
    },
    [broadcastService, persistToSettingService, writeStoredPreference, resolveSystemLocaleSafe],
  );

  /** 原行 9215–9232：跨窗口广播订阅 effect。 */
  React.useEffect(() => {
    if (!broadcastService) return;
    const subscription = broadcastService.onMessage((message) => {
      if (!isRelevantLocaleBroadcast(message, { ignoredLocalPayload: pendingLocalBroadcastRef.current })) return;
      pendingLocalBroadcastRef.current = null;
      const payload = parseLocaleBroadcastPayload(message.payload);
      if (payload) {
        isApplyingRemoteChangeRef.current = true;
        try {
          generationRef.current += 1; // 使本窗口在途异步过期
          setLocalePreferenceState(payload.preference);
          writeStoredPreference(payload.preference);
          setSystemLocale(payload.resolvedLocale);
        } finally {
          isApplyingRemoteChangeRef.current = false;
        }
      }
    });
    return () => subscription.dispose();
  }, [broadcastService, writeStoredPreference]);

  /** 原 F：对外简化入口（与 setLocalePreference 等价）。 */
  const setLocale = React.useCallback(
    (preference: LocalePreference) => {
      setLocalePreference(preference);
    },
    [setLocalePreference],
  );

  /** 原 I：intl 对象（随生效语言记忆化）。 */
  const intl = React.useMemo(() => createIntl(effectiveLocale), [effectiveLocale]);

  // 原实现把 value 的 useMemo 直接写在 jsx() 的 props 位置（无条件调用，合法）；
  // 此处保持同样的调用时机。
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

/* ============================================================================
 * 3.2 useZCodeIntl（原 D，行 9248–9252；导出别名 n）
 *     消费方入口：融合主 chunk 以 G() 调用 408 次，取 {intl, locale} 等。
 * ==========================================================================*/

export function useZCodeIntl(): ZCodeIntlContextValue {
  const context = React.useContext(ZCodeIntlContext);
  if (!context) throw new Error("useZCodeIntl 必须在 ZCodeIntlProvider 内使用");
  return context;
}

/* ============================================================================
 * 4. 原 chunk 导出表（行 9253）→ 重建符号对照
 * ----------------------------------------------------------------------------
 *   export { l as a, p as i, D as n, u as o, m as r, d as s, E as t };
 *     a → getWritableStorage        i → ZH_CN_MESSAGES      n → useZCodeIntl
 *     o → readLocalStorageItem      r → EN_US_MESSAGES      s → writeLocalStorageItem
 *     t → ZCodeIntlProvider
 *   （未导出：getStorage/isReadableStorage/isWritableStorage/getReadableStorage/
 *     getNavigatorLanguage/isSupportedLocale/isValidLocalePreference/
 *     parseLocaleBroadcastPayload/resolveInitialLocalePreference/
 *     isRelevantLocaleBroadcast/createIntl/ZCodeIntlContext——模块私有；
 *     重建版把其中纯函数守卫一并 export 以便测试，不改变运行时行为。）
 *   〔A0-S4-2：i/r（ZH_CN_MESSAGES/EN_US_MESSAGES）实体已迁 lib/i18n/zh-CN.ts、en-US.ts；
 *     本文件薄 re-export，导出面不变〕
 * ==========================================================================*/
