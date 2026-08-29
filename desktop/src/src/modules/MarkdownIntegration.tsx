/* eslint-disable */
/**
 * ============================================================================
 * MarkdownIntegration.tsx — ZCode 3.7.6 F19 MarkdownRenderer 集成层（解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号格式：融合chunk js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 定性：ZCode 自研的 markdown 集成层（MODULE-MAP F19 MarkdownFamily 的消费面）。
 *   本文件重建 `cj` MarkdownRenderer（displayName=MessageResponse，js 51688 / jsx 46461）
 *   以 <Streamdown>（chunk-BO2N2NFS 构建导出 r，已在 MarkdownRenderer.tsx 重建）装配的
 *   完整接线：shiki 高亮注入（wIe/TIe + vendored 100520–104621）、主题（EHe/[light,dark]）、
 *   插件表（$Ve: cjk/code/math/mermaid）、自定义块渲染器（components 映射）、
 *   文件链接/外链/图片/表格/代码块 UI，以及与 Conversation 行（hvt）的耦合点。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  集成层主体：
 *   cj  → MarkdownRenderer(MessageResponse)  会话消息流 markdown 渲染入口 (51688 / 46461)
 *   sj  → MarkdownHeading                 h1-h6 分级标题渲染器 (51673 / —)
 *   xHe → MarkdownRenderErrorBoundary     渲染失败降级纯文本 (51318 / 46198)
 *   lo  → DEFAULT_CODE_PREVIEW_SETTINGS   {github-light/github-dark/行号/折行/12px} (1040 / 93)
 *   EHe → resolveCodeBlockTheme           system→matchMedia；dark|zai-dark→darkTheme (51389 / 46236)
 *   DHe → codeBlockScopeKey               主题:字号:折行:工作区三元 → Pre 的 React key (51398)
 *   bHe → resolveStreamdownMode           streaming|static (51315)
 *   fHe → fnv1aLengthHash                 resetKey 用内容指纹 (51207)
 *   oj  → childrenToText                  React children → 纯文本 (51411)
 *   kHe → trimChildrenText (51420) | PHe → trimTrailingNewlines2 (51450)
 *   OHe → languageFromClass               `language-xxx` 提取 (51408)
 *   uVe → collapseSeparatedImageBlocks    孤立图片行间的空行折叠 (50511)
 *   yHe → escapeStrayMathDollars          行内 $ 转义（代码栅栏段豁免）(51289 / 46167)
 *   aj/vHe/gHe/_He/hHe/ij/mHe/pHe → 数学 $ 转义助手群 (51218–51288)
 *
 *  shiki 高亮注入链：
 *   wIe → createShikiCodeHighlighterPlugin  type=code-highlighter，highlight()→codeToTokens 双主题 (43695 / 39365)
 *   TIe → SHIKI_CODE_HIGHLIGHTER = wIe()    $Ve.code (43695)
 *   CIe → getOrCreateHighlighter            按 lang+themes 缓存 Id(...) (43679)
 *   SIe → highlightCacheKey                 前100+后100字符采样键 (43673)
 *   eE  → normalizeLanguageAlias            bIe 别名表归一 (43667)
 *   yIe → FORGIVING_ONIG_ENGINE = Ep({forgiving:true})  JS 正则引擎 (43632/15923)
 *   Id  → shiki createHighlighter 单例      langs=Td themes=Ed engine=wasm(wasm-B4ap0Fdc.js) (13191)
 *   wd  → 语言元数据表(别名) (10880 / 9007) | Td → bundledLanguages 映射 (12440)
 *   dQ  → bundledLanguages 懒加载登记表     ~200 条 import() 动态分包 (100542 / 86706)
 *   —   → bundledThemes 登记表              github-light 等 (102141–102544)
 *   —   → oniguruma wasm 绑定               fQ OnigError / hQ OnigString / mQ binding (102545–102800)
 *   —   → textmate Registry(_onigLib) + 主题归一尾段 (103150–104621)
 *
 *  插件 / 选项接线：
 *   $Ve → STREAMDOWN_PLUGINS {cjk:vIe, code:TIe, math:xE({singleDollarTextMath:!0}), mermaid:RRe} (51186 / 46054)
 *   eHe → LINK_SAFETY_DISABLED {enabled:false} (51187)
 *   hVe → STREAMDOWN_CONTROLS {table:{fullscreen:false}} (50712)
 *   THe → REHYPE_PLUGINS [wHe, ...Object.values(Mre)]  文件链接 href 重写 + 默认表 (51388)
 *   wHe → rehypeFileLinksPlugin  a[href]/img[src] 工作区相对路径 → SHe 规范 href (51373 / 46226)
 *   CHe → isWorkspaceLikeHref (51356) | SHe → buildFileHrefWithLine (51340)
 *   vIe → CJK_PLUGIN _Ie()  remark/micromark CJK 标点粘连修正 (43631)
 *   gIe → cjkTrailingPunctuationAutolinkSplit  visit link 尾标点切分 (43597)
 *   xE  → createMathPlugin(katex)  remarkPlugin=sLe rehypePlugin=XIe (44373 / 40012)
 *   rO  → createMermaidPlugin  包 mermaid(tO) initialize/render 门面 (45986)
 *   RRe → MERMAID_PLUGIN = rO() (45986) | Fze = rO()（BO 内嵌渲染用）(47763)
 *
 *  自定义块渲染器（components 映射消费）：
 *   gk  → ZCodeCodeBlock              代码块容器：fk ctx + mermaid 内嵌/全屏 + MO 高亮体 (48634 / 43873)
 *   pk  → ZCodeCodeBlockHeader        语言条：文件图标+语言名+折行/复制（mermaid→预览按钮）(48592)
 *   fk  → CodeBlockUiContext          {code,mermaidPreviewAvailable,openMermaidPreview,toggleWrapLongLines,wrapLongLines} (48576 / 43777)
 *   nBe → CodeBlockFrame              content-visibility 容器 (48583)
 *   _k  → WrapLongLinesButton (48720) | iBe → MermaidOpenPreviewButton (48745) | vk → CopyCodeButton (48775)
 *   MO  → HighlightedCodeBlock        ZCode 代码查看器高亮体（注释/行选择；本文件仅接口）(47501)
 *   BO  → MermaidInlinePreview        串行队列渲染 mermaid svg，失败降级 pre (47847)
 *   Qze → MermaidFullscreenDialog     (48221，本文件仅接口)
 *   Oze → isMermaidBlock (47677) | Pze → mermaidAutoRenderGate (47717)
 *   Nze/Mze/PO/jze → mermaid 复杂度度量助手 (47690–47716)
 *   NO  → isMermaidLanguage (47661) | eBe → codeHeaderDisplayKey (48553) | $ze → 语言显示名表 (48524)
 *   aBe/oBe/sBe/cBe → blockquote/ul/ol/li 渲染器 (48892/48903/48915/48927 / 44045…)
 *   MBe → MarkdownTableStickyScrollbar 表格+粘性横向滚动条+全屏预览 (49090，本文件仅接口+几何助手)
 *   NBe/PBe/FBe/IBe/LBe → thead/tbody/tr/th/td 渲染器 (49723–49744)
 *   Ik  → TableEdgeShadow (49699)
 *   vBe…Fk/jBe → 表格几何/序列化助手群（markdown/CSV 复制、粘性条几何）(48936–49089)
 *   dVe → MarkdownParagraphImageGallery  全图段落 → qk 画廊组 (50542)
 *   mVe → MarkdownImage  本地图片 readMediaPreview + 灯箱 Wk (50561 / 45449)
 *   Gk/Kk → 图片缩略类名 (50115) | qk → ImageGalleryGroup (50117，接口) | Wk → ImageLightbox (49834，接口)
 *
 *  文件链接层：
 *   gA  → resolveWorkspaceFileLink    href → 工作区相对/绝对路径判定 (50491 / 45368)
 *   hA  → parseFileHref               path[:line[:col]] / #L 解析 (50467 / 45323)
 *   QBe/$Be/eVe → 行号后缀正则 (50455–50457) | tVe/nVe/rVe → file:// / Win 盘 / 系统根目录集 (50458–50466)
 *   dA/iVe/aVe/oVe/sVe/cVe/fA/pA/mA → 路径归一助手群 (50405–50466)
 *   MHe → buildFileLinkModel          pathKind=directory 判定 + relativePath (51430)
 *   NHe → openFileLinkInEditor          stat → pathKind → openInEditor (51441)
 *   RHe → FileLinkWithContextMenu       打开/第三方编辑器菜单 (51537 / 46389)
 *   LHe → FileLinkButton                forwardRef 图标+label 按钮 (51508)
 *   IHe → ExternalLinkWithContextMenu   app-browser/external-browser 分流 (51461)
 *   FHe → isHttpUrl (51453) | nj/tHe → 链接类名 (51188–51189) | nHe → 标题类名表 (51190)
 *   kVe → isInAppBrowserUrl (50817)
 *   EA/DA/OA/kA → zcode-last-editor-id 记忆 (50846–50856 / 45668)
 *   zA  → relativePathFromWorkspace (50919) | JA → resolveAvailableEditors (51052) | QA → useWorkspaceFileServices (51093，接口)
 *   $A/QVe → useRemoteWorkspaceInfo     tabs store → isRemoteWorkspace/remoteTarget (51166–51174)
 *
 *  Conversation 耦合点：
 *   hvt → AssistantMessageRow (memo)  cj 的消费方：streaming=row.state==='streaming'，children=row.text (112357 / 95832)
 *   （Conversation.tsx 已重建该行；本文件导出其消费的 MarkdownRenderer 契约）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 横切层；本文件仅声明接口）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime                 react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. Streamdown (Pre) / DEFAULT_REHYPE_PLUGINS (Mre)
 *                                         chunk-BO2N2NFS（构建导出 r/o；MarkdownRenderer.tsx 已重建）
 *  3. visit (Ore)                         chunk-BO2N2NFS（构建导出 f；MarkdownVendored.tsx 已声明）
 *  4. cn (Z)                              utils-CEEH0K_K.js (t 导出)
 *  5. useIntlContext (G) → {intl, locale} IntlProvider-C321H7m8.js (n 导出)
 *  6. usePlatformService (l)              openExternal/getInstalledEditors/openInEditor
 *  7. useWorkspaceServices (ps)           fileService.readMediaPreview/stat
 *  8. logger (J)                          logger-PFDwl5Yq.js (t 导出)
 *  9. Button (X) / Tooltip (Ia)           button-laUijeDG.js / usageStatsUiParts-CiR7YEhh.js
 * 10. ContextMenu 原语 (yk/bk/xk/Sk/Ck)   本 chunk 48800 段（横切 X03）
 * 11. Dialog 原语 (zb/Hb/Ub/Gb/Kb/Bb)     横切原语
 * 12. 图标：M_ check / W_ copy / q_ external / mv mermaid / Tbe wrap /
 *     cv loader / zye image-off / f sparkle / wa chevron-right / Vc FileIcon / Fc folderIconSrc
 * 13. 文件元数据 zc（fileIconSrc/fileName）/ 编辑器目录 JA / 服务 QA / tabs store mc
 * 14. mermaid 本体 tO + 主题助手 Vze/Bze/zze/Hze（X10 库层）
 * 15. remark-math (sLe) / rehype-katex (XIe)（katex-fHRr5Rbn.js 懒加载分包）
 * 16. cjk micromark 扩展 (sIe/cIe)（@streamdown/cjk 宿主侧）
 * ============================================================================
 */

import * as React from "react";
import { ContextMenu, ContextMenuContent, ContextMenuSeparator, ContextMenuTrigger } from '../components/ui/context-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Check as IconCheck, Copy as IconCopy, ExternalLink as IconExternal, Loader as IconLoader, ImageOff as IconImageOff, LoaderCircle as IconSpinner } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Streamdown, DEFAULT_REHYPE_PLUGINS } from "./MarkdownRenderer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb）
import { visit, type UnistNode } from "./MarkdownVendored";
import type {
  StreamdownPlugins,
  CodeHighlighterPlugin,
  MermaidPlugin,
  MathPlugin,
  CjkPlugin,
  ControlsOptions,
  LinkSafetyOptions,
  StreamdownMode,
  HastNodeLike,
} from "./MarkdownContext";
import { readLastEditorId, rememberLastEditorId } from './CodeViewer'; // 原 OA / kA
import { resolveAvailableEditors } from './FileTreePanel';
import { HighlightedCodeBlock } from './HighlightedCodeBlock';
import { ImageGalleryGroup, ImageLightbox, MarkdownTableStickyScrollbar, MermaidFullscreenDialog } from './PreviewCards';
import { cn as Z } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js 导出 cn；SrcSharedB 单字母别名为跨块碰撞）
import { t as J } from './logger'; // 原 J（logger-PFDwl5Yq.js 导出 t）
import { useServicesOptional as ps } from './services'; // 原 ps（services.tsx 导出 useServicesOptional）
import { usePlatform as l } from './ImeComposition'; // 原 l（imeComposition chunk 导出 M=usePlatform）
import { FileIconImg as FileIcon, FOLDER_ICON_DATA_URI as FOLDER_ICON_SRC, resolveFileDisplayInfo as resolveFileMeta } from './ModalsLeaves'; // 原 Vc / Fc / zc

/* ============================================================================
 * 0. 外部依赖声明（横切层 / 跨 chunk；原混淆名见注释）
 * ==========================================================================*/

/** 原 Z：cn 类名合并（utils-CEEH0K_K.js t 导出） */

interface IntlLike {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
/** 原 G：useIntlContext */
declare function G(): { intl: IntlLike };

interface InstalledEditor {
  id: string;
  name: string;
  iconDataUrl?: string;
  [key: string]: unknown;
}
interface PlatformServiceLike {
  openExternal(url: string): void;
  getInstalledEditors(): Promise<InstalledEditor[]>;
  openInEditor(
    editorId: string,
    path: string,
    options: { pathKind?: string; remoteTarget?: unknown; workspaceIdentity?: string | null },
  ): Promise<{ success: boolean; error?: string }>;
}
/** 原 l：usePlatformService */

interface WorkspaceServicesLike {
  fileService: {
    readMediaPreview(args: { path: string }): Promise<{ mediaType: string; dataBase64: string }>;
    stat(args: { path: string }): Promise<{ type: string }>;
  };
}
/** 原 ps：useWorkspaceServices */
/** 原 QA：工作区文件服务钩子（RHe 内类型确认用） */
declare function QA(options?: Record<string, unknown>): WorkspaceServicesLike | null;

/** 原 J：logger */

/** 原 X：Button（size/variant） */
declare const X: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string; variant?: string }>;
/** 原 Ia：Tooltip */
declare const Ia: React.ComponentType<{ title: string; side?: string; children?: React.ReactNode }>;

/* 原 yk/bk/xk/Sk/Ck：ContextMenu 原语族（本 chunk 48800 段，横切 X03） */
/* ── tombstone（A0-S3c）：ContextMenu、ContextMenuContent、ContextMenuSeparator、ContextMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */


declare const ContextMenuItem: React.ComponentType<Record<string, unknown>>; // Sk


/* 原 zb/Hb/Ub/Gb/Kb/Bb：Dialog 原语族 */
/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'；调用面逐字不变。 ── */

/* 图标族（lucide 风格） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：IconCheck/IconCopy/IconExternal → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconMermaid: React.ComponentType<{ className?: string }>; // mv
declare const IconWrap: React.ComponentType<{ className?: string }>; // Tbe
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：IconLoader/IconImageOff/IconSpinner → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/** 原 Vc：文件图标 img 组件（js 5195） */
/** 原 Fc：Pc('folder') 目录图标 data-url */

/** 原 zc：文件元数据解析（fileIcon/fileName/normalizedPath；js 5150） */

/** 原 mc：useTabStore 选择器（$A 用） */
declare function mc<R>(selector: (state: { tabs: WorkspaceTabLike[] }) => R): R;
interface WorkspaceTabLike {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: unknown;
}
/** 原 oc：工作区 tab 形态判定 */
declare function isWorkspaceTabLike(tab: unknown): tab is WorkspaceTabLike;
/** 原 yne：remoteTarget 展示模型 */
declare function formatRemoteTarget(target: unknown): unknown;

/** 原 wA：in-app browser 主机名白名单判定 */
declare function isInAppBrowserHost(hostname: string): boolean;

/** 原 $ze：语言 id → 显示名（i18n key）表（js 48524） */
declare const LANGUAGE_DISPLAY_KEYS: Record<string, string>;

/* mermaid 本体与主题助手（X10 库层） */
declare const mermaidCore: {
  initialize(config: unknown): void;
  render(id: string, code: string): Promise<{ svg: string }>;
};
declare function resolveMermaidThemeVars(theme: string): unknown; // 原 Vze
declare function resolveMermaidConfigBase(theme: string): unknown; // 原 Bze
declare function buildMermaidConfig(base: unknown): unknown; // 原 zze
declare function describeMermaidError(error: unknown): string; // 原 Hze

/* remark-math / rehype-katex（katex 懒加载分包） */
declare const remarkMath: unknown; // 原 sLe
declare const rehypeKatex: unknown; // 原 XIe

/* cjk micromark 扩展（@streamdown/cjk 宿主侧） */
declare function cjkRemarkSpacingPlugin(): unknown; // 原 sIe
declare function cjkMicromarkExtension(options?: unknown): unknown; // 原 cIe

/** 原 MO：ZCode 代码查看器高亮体（行注释/行选择/标签；js 47501） */
/** 原 Qze：Mermaid 全屏对话框（js 48221） */
/** 原 qk：图片画廊组容器（data-markdown-image-gallery） */
interface LightboxItem {
  alt: string;
  filename: string;
  src: string;
}
/** 原 Wk：图片灯箱（js 49834） */

/** 原 JA：可用编辑器目录解析（js 51052） */
/** 原 OA：读取上次使用的编辑器 id */
/** 原 kA：记住本次使用的编辑器 id */

/* ============================================================================
 * 1. 代码预览设置默认值 + 主题解析（原 lo / EHe / DHe / bHe，js 1040 / 51389 / 51398 / 51315）
 * ==========================================================================*/

export interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}

/** 原 lo（js 1040 / jsx 93） */
export const DEFAULT_CODE_PREVIEW_SETTINGS: CodePreviewSettings = {
  lightTheme: `github-light`,
  darkTheme: `github-dark`,
  showLineNumbers: true,
  wrapLongLines: false,
  fontSizePx: 12,
};

/** 原 EHe：system → prefers-color-scheme；dark|zai-dark → darkTheme；其余 lightTheme */
export function resolveCodeBlockTheme(theme: string, settings: CodePreviewSettings): string {
  return theme === `system` && typeof window < `u`
    ? window.matchMedia(`(prefers-color-scheme: dark)`).matches
      ? settings.darkTheme
      : settings.lightTheme
    : theme === `dark` || theme === `zai-dark`
      ? settings.darkTheme
      : settings.lightTheme;
}

/** 原 DHe：作为 <Streamdown> 的 React key —— 任一因子变化即整树重建 */
export function codeBlockScopeKey(args: {
  codeBlockTheme: string;
  fontSizePx: number;
  wrapLongLines: boolean;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}): string {
  return [
    args.codeBlockTheme,
    args.fontSizePx,
    args.wrapLongLines ? `wrap` : `scroll`,
    args.workspacePath ?? ``,
    args.workspaceIdentity ?? ``,
    args.workspaceRemoteSessionId ?? ``,
  ].join(`:`);
}

/** 原 bHe */
export function resolveStreamdownMode(streaming: boolean): StreamdownMode {
  return streaming ? `streaming` : `static`;
}

/* ============================================================================
 * 2. 文本预处理管线（原 oj/kHe/PHe/OHe/fHe/uVe/yHe 及数学转义助手群）
 * ==========================================================================*/

/** 原 oj：children → 纯文本（递归 isValidElement） */
export function childrenToText(children: React.ReactNode): string {
  return typeof children === `string` || typeof children === `number`
    ? String(children)
    : Array.isArray(children)
      ? children.map(childrenToText).join(``)
      : React.isValidElement(children)
        ? childrenToText((children.props as { children?: React.ReactNode }).children)
        : ``;
}

/** 原 kHe */
export function trimChildrenText(children: React.ReactNode): string {
  return childrenToText(children).trim();
}

/** 原 PHe */
export function trimTrailingNewlines(code: string): string {
  return code.replace(/\n+$/, ``);
}

const LANGUAGE_CLASS_REGEX = /(?:^|\s)language-([^\s]+)/; // 原 rHe

/** 原 OHe：`language-xxx` 类名 → 语言 id，缺省 text */
export function languageFromClass(className?: string): string {
  return className?.match(LANGUAGE_CLASS_REGEX)?.[1] ?? `text`;
}

/** 原 fHe：FNV-1a + 长度前缀（resetKey 内容指纹） */
export function fnv1aLengthHash(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${text.length}:${hash >>> 0}`;
}

const SINGLE_IMAGE_LINE_REGEX = /^\s*!\[[^\]]*]\([^\n]+\)\s*$/; // 原 _A
const CODE_FENCE_LINE_REGEX = /^( {0,3})(`{3,}|~{3,})(.*)$/; // 原 lVe

/** 原 uVe：折叠「孤立图片行之间」的纯空行（防止画廊段落被拆），栅栏段原样保留 */
export function collapseSeparatedImageBlocks(markdown: string): string {
  const lines = markdown.split(`\n`);
  const out: string[] = [];
  let fenceChar: string | null = null;
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ``;
    const fence = line.match(CODE_FENCE_LINE_REGEX);
    const marker = fence?.[2];
    if (marker) {
      const ch = marker[0];
      const info = fence[3] ?? ``;
      if (fenceChar === ch && marker.length >= fenceLen && info.trim() === ``) {
        fenceChar = null;
        fenceLen = 0;
      } else if (!fenceChar && (ch === `~` || !info.includes("`"))) {
        fenceChar = ch;
        fenceLen = marker.length;
      }
      out.push(line);
      continue;
    }
    if (!fenceChar && SINGLE_IMAGE_LINE_REGEX.test(line)) {
      out.push(line);
      let next = i + 1;
      while (next < lines.length && !(lines[next] ?? ``).trim()) next += 1;
      if (next > i + 1 && next < lines.length && SINGLE_IMAGE_LINE_REGEX.test(lines[next] ?? ``)) {
        i = next - 1; // 跳过空行，把连续图片行合并为一段
      }
      continue;
    }
    out.push(line);
  }
  return out.join(`\n`);
}

/* --- 数学 $ 转义助手群（原 pHe…yHe，js 51218–51314） --- */

const FENCE_OPEN_REGEX = /^(?: {0,3})(`{3,}|~{3,})/; // 原 oHe
const MATH_COMMAND_REGEX = /\\[A-Za-z]+/; // 原 cHe
const MATH_SYMBOL_REGEX = /[\\{}^_=+\-*/<>|()[\]∇∂∫∑√∞≈≠≤≥±×÷πΠα-ωΑ-Ω]/u; // 原 sHe
const MATH_TOKEN_REGEX = /^(?:[A-Za-z]|[a-z][A-Za-z0-9]{1,2}|\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/; // 原 lHe
const ARITHMETIC_SUFFIX_REGEX = /^(?:\d[\d,]*(?:\.\d+)?|\.\d+)[+\-*/]$/; // 原 uHe
const ARITHMETIC_NEXT_REGEX = /^(?:\d|\.\d)/; // 原 dHe

/** 原 fHe 重名区分：栅栏开标记解析（原 pHe） */
function parseFenceOpen(line: string): { marker: string; length: number } | null {
  const m = FENCE_OPEN_REGEX.exec(line);
  if (!m) return null;
  const marker = m[1] ?? ``;
  return { marker: marker[0] ?? ``, length: marker.length };
}

/** 原 mHe：位置 t 前的反斜杠奇偶（奇 = 已转义） */
function isEscapedAt(text: string, index: number): boolean {
  let count = 0;
  for (let i = index - 1; i >= 0 && text[i] === `\\`; i--) count++;
  return count % 2 === 1;
}

/** 原 ij：单 $ 定界符判定（非 $$、未转义） */
function isSingleDollar(text: string, index: number): boolean {
  return text[index] === `$` && text[index - 1] !== `$` && text[index + 1] !== `$` && !isEscapedAt(text, index);
}

/** 原 hHe：向后找下一个单 $ */
function findClosingDollar(text: string, from: number): number {
  for (let i = from; i < text.length; i++) if (isSingleDollar(text, i)) return i;
  return -1;
}

/** 原 gHe：$…$ 内容是否「像数学」（命令/符号/单 token） */
function looksLikeMath(content: string): boolean {
  if (!content || content !== content.trim() || /[\r\n]/.test(content)) return false;
  return !!(MATH_COMMAND_REGEX.test(content) || MATH_SYMBOL_REGEX.test(content) || (!/\s/.test(content) && MATH_TOKEN_REGEX.test(content)));
}

/** 原 _He：`12+` 后接数字 ⇒ 算术表达式而非数学 ⇒ 转义 */
function isArithmeticExpression(text: string, closeIndex: number, content: string): boolean {
  return ARITHMETIC_SUFFIX_REGEX.test(content) ? ARITHMETIC_NEXT_REGEX.test(text.slice(closeIndex + 1)) : false;
}

/** 原 aj：行内 $ 扫描，非数学的 `$` → `\$` */
function escapeStrayDollarsInLine(line: string): string {
  if (!line.includes(`$`)) return line;
  let out = ``;
  for (let i = 0; i < line.length; i++) {
    if (!isSingleDollar(line, i)) {
      out += line[i];
      continue;
    }
    const close = findClosingDollar(line, i + 1);
    if (close === -1) {
      out += line[i];
      continue;
    }
    const content = line.slice(i + 1, close);
    if (isArithmeticExpression(line, close, content)) {
      out += `\\$`;
      continue;
    }
    if (looksLikeMath(content)) {
      out += line.slice(i, close + 1);
      i = close;
      continue;
    }
    out += `\\$`;
  }
  return out;
}

/** 原 vHe：行内代码段（`…`）豁免，其余走 aj */
function escapeStrayDollarsSkippingInlineCode(line: string): string {
  let out = ``;
  let i = 0;
  while (i < line.length) {
    const open = line.indexOf("`", i);
    if (open === -1) {
      out += escapeStrayDollarsInLine(line.slice(i));
      break;
    }
    out += escapeStrayDollarsInLine(line.slice(i, open));
    let runEnd = open + 1;
    while (line[runEnd] === "`") runEnd++;
    const run = line.slice(open, runEnd);
    const close = line.indexOf(run, runEnd);
    if (close === -1) {
      out += escapeStrayDollarsInLine(line.slice(open));
      break;
    }
    out += line.slice(open, close + run.length);
    i = close + run.length;
  }
  return out;
}

/** 原 yHe：全文数学 $ 转义；代码栅栏段（```/~~~）原样跳过 */
export function escapeStrayMathDollars(markdown: string): string {
  if (!markdown.includes(`$`)) return markdown;
  let out = ``;
  let i = 0;
  let fence: { marker: string; length: number } | null = null;
  while (i < markdown.length) {
    const nl = markdown.indexOf(`\n`, i);
    const lineEnd = nl === -1 ? markdown.length : nl;
    const line = markdown.slice(i, lineEnd);
    const sep = nl === -1 ? `` : `\n`;
    const open = parseFenceOpen(line);
    if (fence) {
      out += line + sep;
      if (open && open.marker === fence.marker && open.length >= fence.length) fence = null;
    } else {
      out += escapeStrayDollarsSkippingInlineCode(line) + sep;
      if (open) fence = open;
    }
    i = lineEnd + sep.length;
  }
  return out;
}

/* ============================================================================
 * 3. shiki 高亮注入链（原 wIe/TIe/CIe/yIe + vendored Id/Ep/wd/Td/dQ 区）
 * ----------------------------------------------------------------------------
 * 注入路径：$Ve.code = TIe → Streamdown plugins.code →
 *   streamdown useCodeHighlighter（MarkdownContext.tsx）→ CodeBlockBody
 *   （MarkdownCodeBlock.tsx，--shiki-dark* 双主题变量消费方）。
 * vendored 本体：
 *   - Id（js 13191）= Xue({langs: Td, themes: Ed, engine: () => Fd(import('./wasm-B4ap0Fdc.js'))})
 *     解构出 codeToTokens/getSingletonHighlighter 等（shiki 标准 API 面）；
 *   - Ep（js 15923）= JS 正则 oniguruma 引擎工厂；yIe = Ep({forgiving: true})；
 *   - wd（js 10880）语言元数据（别名表 bIe）；Td（js 12440）bundledLanguages 映射；
 *   - **100520–104621 = shiki 懒加载登记段**：dQ bundledLanguages（~200 条
 *     `import: () => Y(() => import('./<lang>-<hash>.js'), [], import.meta.url)`）+
 *     bundledThemes（github-light 等，102254 起）+ oniguruma wasm 绑定
 *     （fQ OnigError / hQ OnigString / mQ binding，`Must invoke loadWasm first.`，102545 起）+
 *     textmate Registry（_onigLib，103150）+ 主题归一尾段（默认回退 github-light，104494）。
 * ==========================================================================*/

/** 原 wd/bIe/$T/eE：语言别名归一（bundledLanguages 元数据在 vendored 段，此处声明消费面） */
declare const BUNDLED_LANGUAGE_ALIASES: Record<string, string>; // 原 bIe
declare const SUPPORTED_LANGUAGE_IDS: Set<string>; // 原 $T
export function normalizeLanguageAlias(language: string): string {
  const key = language.trim().toLowerCase();
  return BUNDLED_LANGUAGE_ALIASES[key] || ((SUPPORTED_LANGUAGE_IDS.has(key), key));
}

interface ShikiHighlighterLike {
  getLoadedLanguages(): string[];
  codeToTokens(
    code: string,
    options: { lang: string; themes: { light: string; dark: string } },
  ): unknown;
}
/** 原 Id：shiki createHighlighter 单例工厂（vendored，js 13191） */
declare function createShikiHighlighter(options: {
  themes: string[];
  langs: string[];
  engine: unknown;
}): Promise<ShikiHighlighterLike>;
/** 原 yIe：forgiving JS 正则引擎实例（Ep({forgiving:true})，js 15923/43632） */
declare const FORGIVING_ONIG_ENGINE: unknown;

const highlighterCache = new Map<string, Promise<ShikiHighlighterLike>>(); // 原 tE
const tokensCache = new Map<string, unknown>(); // 原 nE
const pendingCallbacks = new Map<string, Set<(tokens: unknown) => void>>(); // 原 rE

/** 原 iE */
function themeName(theme: unknown): string {
  return typeof theme === `string` ? theme : ((theme as { name?: string })?.name ?? `custom`);
}
/** 原 xIe */
function highlighterKey(lang: string, themes: unknown[]): string {
  return `${lang}-${themeName(themes[0])}-${themeName(themes[1])}`;
}
/** 原 SIe：内容采样键（前 100 + 后 100 字符） */
function tokensCacheKey(code: string, lang: string, themes: unknown[]): string {
  const head = code.slice(0, 100);
  const tail = code.length > 100 ? code.slice(-100) : ``;
  return `${lang}:${themes[0]}:${themes[1]}:${code.length}:${head}:${tail}`;
}
/** 原 CIe：按 lang+themes 复用 highlighter 实例 */
function getOrCreateHighlighter(lang: string, themes: string[]): Promise<ShikiHighlighterLike> {
  const key = highlighterKey(lang, themes);
  const cached = highlighterCache.get(key);
  if (cached) return cached;
  const created = createShikiHighlighter({ themes, langs: [lang], engine: FORGIVING_ONIG_ENGINE });
  highlighterCache.set(key, created);
  return created;
}

export interface ShikiHighlightRequest {
  code: string;
  language: string;
  themes: unknown[];
}

/** 原 wIe：createShikiCodeHighlighterPlugin —— 注入 Streamdown plugins.code 的本体 */
export function createShikiCodeHighlighterPlugin(options: { themes?: string[] } = {}): CodeHighlighterPlugin {
  const themes = options.themes ?? [`github-light`, `github-dark`];
  return {
    name: `shiki`,
    type: `code-highlighter`,
    supportsLanguage(language: string) {
      return SUPPORTED_LANGUAGE_IDS.has(normalizeLanguageAlias(language));
    },
    getSupportedLanguages() {
      return Array.from(SUPPORTED_LANGUAGE_IDS);
    },
    getThemes() {
      return themes;
    },
    highlight({ code, language, themes: requestThemes }: ShikiHighlightRequest, onReady?: (tokens: unknown) => void) {
      const lang = normalizeLanguageAlias(language);
      const themePair = [themeName(requestThemes[0]), themeName(requestThemes[1])];
      const key = tokensCacheKey(code, lang, themePair);
      if (tokensCache.has(key)) return tokensCache.get(key);
      if (onReady) {
        const waiters = pendingCallbacks.get(key);
        if (!waiters) pendingCallbacks.set(key, new Set());
        pendingCallbacks.get(key)!.add(onReady);
      }
      getOrCreateHighlighter(SUPPORTED_LANGUAGE_IDS.has(lang) ? lang : `text`, themePair)
        .then((highlighter) => {
          const resolved = highlighter.getLoadedLanguages().includes(lang) ? lang : `text`;
          const tokens = highlighter.codeToTokens(code, {
            lang: resolved,
            themes: { light: themePair[0], dark: themePair[1] },
          });
          tokensCache.set(key, tokens);
          const waiters = pendingCallbacks.get(key);
          if (waiters) {
            for (const cb of waiters) cb(tokens);
            pendingCallbacks.delete(key);
          }
        })
        .catch((error) => {
          console.error(`[Streamdown Code] Failed to highlight code:`, error);
          pendingCallbacks.delete(key);
        });
      return null; // 异步：首返 null，完成后经 onReady 回调（CodeBlockBody 订阅）
    },
  } as CodeHighlighterPlugin;
}

/** 原 TIe = wIe()（js 43695 / jsx 39365） */
export const SHIKI_CODE_HIGHLIGHTER = createShikiCodeHighlighterPlugin();

/* ============================================================================
 * 4. 其余插件：cjk / math / mermaid（原 vIe / xE / rO）
 * ==========================================================================*/

const CJK_TRAILING_PUNCTUATION = new Set([
  `。`, `．`, `，`, `、`, `？`, `！`, `：`, `；`,
  `（`, `）`, `【`, `】`, `「`, `」`, `『`, `』`, `〈`, `〉`, `《`, `》`,
]); // 原 uIe
const AUTOLINK_SCHEME_REGEX = /^(https?:\/\/|mailto:|www\.)/i; // 原 dIe

/** 原 fIe：link 节点子树 == 纯 url 文本 */
function autolinkTextEqualsUrl(node: UnistNode): boolean {
  const children = node.children ?? [];
  if (children.length !== 1) return false;
  const child = children[0];
  return child.type === `text` && child.value === (node as { url?: string }).url;
}
/** 原 pIe：url 尾随 CJK 标点切点 */
function cjkPunctuationSplitIndex(url: string): number | null {
  let offset = 0;
  for (const ch of url) {
    if (CJK_TRAILING_PUNCTUATION.has(ch)) return offset;
    offset += ch.length;
  }
  return null;
}

/** 原 gIe：autolink 尾随中文标点剥离（visit link） */
function cjkTrailingPunctuationAutolinkSplit() {
  return (tree: UnistNode) => {
    visit(tree, `link`, (node, index, parent) => {
      const link = node as UnistNode & { url: string };
      if (!parent || !parent.children || typeof index !== `number` || !autolinkTextEqualsUrl(link) || !AUTOLINK_SCHEME_REGEX.test(link.url)) return;
      const split = cjkPunctuationSplitIndex(link.url);
      if (split === null || split === 0) return;
      const cleanUrl = link.url.slice(0, split);
      const trailing = link.url.slice(split);
      const rebuilt: UnistNode = { ...link, url: cleanUrl, children: [{ type: `text`, value: cleanUrl }] };
      const tail: UnistNode = { type: `text`, value: trailing };
      parent.children.splice(index, 1, rebuilt, tail);
      return index + 1;
    });
  };
}

/** 原 lIe：micromark 扩展挂载 */
function cjkMicromarkPlugin(this: { data: () => Record<string, unknown> }, options?: unknown) {
  const data = this.data();
  const list = (data.micromarkExtensions as unknown[] | undefined) ?? [];
  (data.micromarkExtensions = list as unknown[]).push(cjkMicromarkExtension(options));
}

/** 原 _Ie：cjk 插件对象（remarkPluginsBefore/After + 合并表） */
export function createCjkPlugin(): CjkPlugin {
  const before = [cjkRemarkSpacingPlugin];
  const after = [cjkTrailingPunctuationAutolinkSplit, cjkMicromarkPlugin];
  return {
    name: `cjk`,
    type: `cjk`,
    remarkPluginsBefore: before,
    remarkPluginsAfter: after,
    remarkPlugins: [...before, ...after],
  } as unknown as CjkPlugin;
}

/** 原 vIe = _Ie()（js 43631） */
export const CJK_PLUGIN = createCjkPlugin();

/** 原 xE：katex 数学插件（remark-math + rehype-katex，errorColor 走主题变量） */
export function createMathPlugin(options: { singleDollarTextMath?: boolean; errorColor?: string } = {}): MathPlugin {
  return {
    name: `katex`,
    type: `math`,
    remarkPlugin: [remarkMath, { singleDollarTextMath: options.singleDollarTextMath ?? false }],
    rehypePlugin: [rehypeKatex, { errorColor: options.errorColor ?? `var(--color-muted-foreground)` }],
    getStyles() {
      return `katex/dist/katex.min.css`;
    },
  } as unknown as MathPlugin;
}

/** 原 nO：mermaid 默认配置尾段（js 45980 起） */
const MERMAID_DEFAULT_CONFIG = {
  startOnLoad: false,
  theme: `default`,
  securityLevel: `strict`,
  fontFamily: `monospace`,
  suppressErrorRendering: true,
};

/** 原 rO：mermaid 插件门面（initialize/render 懒初始化包装） */
export function createMermaidPlugin(options: { config?: Record<string, unknown> } = {}): MermaidPlugin {
  let initialized = false;
  let config: Record<string, unknown> = { ...MERMAID_DEFAULT_CONFIG, ...options.config };
  const facade = {
    initialize(init: Record<string, unknown>) {
      config = { ...MERMAID_DEFAULT_CONFIG, ...options.config, ...init };
      mermaidCore.initialize(config);
      initialized = true;
    },
    async render(id: string, code: string) {
      if (!initialized) {
        mermaidCore.initialize(config);
        initialized = true;
      }
      return await mermaidCore.render(id, code);
    },
  };
  return {
    name: `mermaid`,
    type: `diagram`,
    language: `mermaid`,
    getMermaid(themeConfig?: Record<string, unknown>) {
      if (themeConfig) facade.initialize(themeConfig);
      return facade;
    },
  } as unknown as MermaidPlugin;
}

/** 原 RRe = rO()（js 45986） */
export const MERMAID_PLUGIN = createMermaidPlugin();
/** 原 Fze = rO()（BO 内嵌渲染专用实例，js 47763） */
const MERMAID_INLINE_PLUGIN = createMermaidPlugin();

/* ============================================================================
 * 5. 插件表 / 选项 / rehype 文件链接重写（原 $Ve/eHe/hVe/THe/wHe/CHe/SHe）
 * ==========================================================================*/

/** 原 $Ve（js 51186 / jsx 46054）：注入 <Streamdown plugins> 的四插件表 */
export const STREAMDOWN_PLUGINS: StreamdownPlugins = {
  cjk: CJK_PLUGIN,
  code: SHIKI_CODE_HIGHLIGHTER,
  math: createMathPlugin({ singleDollarTextMath: true }),
  mermaid: MERMAID_PLUGIN,
} as StreamdownPlugins;

/** 原 eHe：ZCode 关闭 streamdown 外链安全弹窗（自有外链菜单替代） */
export const LINK_SAFETY_DISABLED: LinkSafetyOptions = { enabled: false };

/** 原 hVe：表格全屏控件关闭（MBe 自带全屏） */
export const STREAMDOWN_CONTROLS: ControlsOptions = { table: { fullscreen: false } };

const FILE_PROTOCOL_REGEX = /^file:\/\//i; // 原 iHe
const WINDOWS_DRIVE_REGEX = /^[a-zA-Z]:[\\/]/; // 原 aHe
const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

/** 原 AHe */
function hasFileExtension(name: string): boolean {
  return /\.[^./\\]+$/.test(name);
}

/** 原 Go：basename（js 1928，逐字） */
export function baseName(path: string): string {
  const parts = path.replace(/\\/g, `/`).replace(/\/+$/, ``).split(`/`).filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

/** 原 hA 依赖正则（js 50455–50466） */
const LINE_COLUMN_SUFFIX_REGEX = /^(?<path>.+):(?<line>\d+):(?<column>\d+)$/; // 原 QBe
const LINE_SUFFIX_REGEX = /^(?<path>.+):(?<line>\d+)$/; // 原 $Be
const HASH_LINE_SUFFIX_REGEX = /^(?<path>.+)#L(?<line>\d+)(?:-L?\d+)?$/i; // 原 eVe
const FILE_URL_REGEX = /^file:\/\//i; // 原 tVe
const WIN_ABS_SLASH_REGEX = /^\/[a-zA-Z]:\//; // 原 nVe
const SYSTEM_ROOT_DIRS = new Set([
  `Applications`, `Library`, `System`, `Users`, `Volumes`, `bin`, `boot`, `dev`, `etc`, `home`,
  `lib`, `lib64`, `media`, `mnt`, `opt`, `private`, `proc`, `root`, `run`, `sbin`, `srv`, `sys`,
  `tmp`, `usr`, `var`,
]); // 原 rVe

/** 原 qo：decodeURI 安全版 */
export function decodeUriSafe(value: string): string {
  if (!/%[0-9a-fA-F]{2}/.test(value)) return value;
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

/** 原 cVe：file:// URL → 本机路径（Win 盘符 / UNC 主机） */
function fileUrlToPath(url: string): string | null {
  if (!FILE_URL_REGEX.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `file:`) return null;
    const pathname = decodeUriSafe(parsed.pathname);
    return WIN_ABS_SLASH_REGEX.test(pathname)
      ? pathname.slice(1)
      : parsed.hostname && parsed.hostname !== `localhost`
        ? `//${parsed.hostname}${pathname}`
        : pathname;
  } catch {
    return null;
  }
}

/** 原 fA */
function normalizeHrefPath(href: string): string {
  return fileUrlToPath(href) ?? decodeUriSafe(href);
}

/** 原 pA：`..` 归一；越界返回 null */
export function normalizeRelativeSegments(path: string): string | null {
  const stack: string[] = [];
  for (const part of path.replace(/\\/g, `/`).split(`/`)) {
    if (!part || part === `.`) continue;
    if (part === `..`) {
      if (stack.length === 0) return null;
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join(`/`);
}

/** 原 mA：工作区根 + 相对段 → 绝对路径（反斜杠工作区保留） */
export function joinWorkspacePath(workspacePath: string, relative: string): string | null {
  const normalized = normalizeRelativeSegments(relative);
  if (normalized === null) return null;
  const sep = workspacePath.includes(`\\`) && !workspacePath.includes(`/`) ? `\\` : `/`;
  return `${workspacePath.replace(/\/+$/, ``)}${sep}${normalized.replaceAll(`/`, sep)}`;
}

export interface ParsedFileHref {
  path: string;
  lineNumber: number | null;
  columnNumber: number | null;
}

/** 原 hA（js 50467 / jsx 45323）：path#L12 / path:12:3 / path:12 三形态解析 */
export function parseFileHref(href: string): ParsedFileHref {
  const normalized = href.replace(/\\/g, `/`);
  const hashLine = normalized.match(HASH_LINE_SUFFIX_REGEX);
  if (hashLine?.groups) {
    const { path, line } = hashLine.groups;
    if (path && line) return { path: normalizeHrefPath(path), lineNumber: Number.parseInt(line, 10), columnNumber: null };
  }
  const lineColumn = normalized.match(LINE_COLUMN_SUFFIX_REGEX);
  if (lineColumn?.groups) {
    const { path, line, column } = lineColumn.groups;
    if (path && line && column) {
      return {
        path: normalizeHrefPath(path),
        lineNumber: Number.parseInt(line, 10),
        columnNumber: Number.parseInt(column, 10),
      };
    }
  }
  const lineOnly = normalized.match(LINE_SUFFIX_REGEX);
  if (lineOnly?.groups) {
    const { path, line } = lineOnly.groups;
    if (path && line) return { path: normalizeHrefPath(path), lineNumber: Number.parseInt(line, 10), columnNumber: null };
  }
  return { path: normalizeHrefPath(normalized), lineNumber: null, columnNumber: null };
}

/** 原 Ko 依赖：绝对路径判定（js 1941 区域） */
const ABS_UNIX_REGEX = /^[a-zA-Z]:[\\/]/; // 原 iae（styles 1925 逐字；名为 UNIX 实为盘符形，不做改名）
const ABS_WIN_REGEX = /^\\\\/; // 原 aae（styles 1926 逐字）
export function isAbsolutePath(path: string): boolean {
  return path.startsWith(`/`) || ABS_UNIX_REGEX.test(path) || ABS_WIN_REGEX.test(path);
}
/** 原 dA */
function isDotRelative(path: string): boolean {
  return path.startsWith(`./`);
}
/** 原 iVe：裸相对路径（含分隔符、无 scheme） */
function isBareRelativePath(path: string): boolean {
  return !(!path || path.startsWith(`/`) || path.startsWith(`#`) || path.startsWith(`../`) || SCHEME_REGEX.test(path)) &&
    (path.includes(`/`) || path.includes(`\\`));
}
/** 原 aVe：任一侧为绝对路径 ⇒ 不可归一 */
function hasAbsoluteSide(workspacePath: string, path: string): boolean {
  return isAbsolutePath(workspacePath) || isAbsolutePath(path) || path.startsWith(`//`);
}
/** 原 oVe：系统根目录绝对路径（/usr、/bin…） */
function isSystemRootPath(path: string): boolean {
  if (!path.startsWith(`/`) || path.startsWith(`//`)) return false;
  const root = path.slice(1).split(`/`)[0];
  return !!(root && SYSTEM_ROOT_DIRS.has(root));
}
/** 原 sVe：路径前缀包含 */
function isPathUnder(child: string, parent: string): boolean {
  const a = child.replace(/\\/g, `/`).replace(/\/$/, ``);
  const b = parent.replace(/\\/g, `/`).replace(/\/$/, ``);
  return a === b || a.startsWith(`${b}/`);
}

/** 原 gA（js 50491 / jsx 45368）：href → 工作区文件链接模型；不可归一返回 null */
export function resolveWorkspaceFileLink(
  workspacePath: string | undefined | null,
  href: string,
): (ParsedFileHref & { path: string }) | null {
  const parsed = parseFileHref(href);
  if (WIN_ABS_SLASH_REGEX.test(parsed.path)) {
    // /C:/… 形态：仅当工作区存在且 href 非绝对时剥前导 /
    return !workspacePath || workspacePath.startsWith(`/`) || !isAbsolutePath(workspacePath)
      ? null
      : { ...parsed, path: parsed.path.slice(1) };
  }
  if (isDotRelative(parsed.path) || isBareRelativePath(parsed.path)) {
    if (!workspacePath) return null;
    const stripped = isDotRelative(parsed.path) ? parsed.path.slice(2) : parsed.path;
    if (!stripped) return null;
    const joined = joinWorkspacePath(workspacePath, stripped);
    return joined ? { ...parsed, path: joined } : null;
  }
  if (workspacePath && parsed.path.startsWith(`/`) && !isSystemRootPath(parsed.path)) {
    if (isPathUnder(parsed.path, workspacePath)) return parsed;
    const joined = joinWorkspacePath(workspacePath, parsed.path.slice(1));
    return joined ? { ...parsed, path: joined } : null;
  }
  return hasAbsoluteSide(workspacePath ?? ``, parsed.path) ? null : parsed;
}

/** 原 SHe：工作区链接 → 规范 href（Win 反斜杠转正、补 ./、行号后缀） */
export function buildFileHrefWithLine(href: string): string {
  const parsed = parseFileHref(href);
  const path = WINDOWS_DRIVE_REGEX.test(parsed.path)
    ? `/${parsed.path.replaceAll(`\\`, `/`)}`
    : FILE_PROTOCOL_REGEX.test(href) ||
        parsed.path.startsWith(`./`) ||
        parsed.path.startsWith(`/`) ||
        parsed.path.startsWith(`#`) ||
        parsed.path.startsWith(`../`) ||
        SCHEME_REGEX.test(parsed.path)
      ? parsed.path
      : `./${parsed.path}`;
  return parsed.lineNumber === null
    ? path
    : parsed.columnNumber === null
      ? `${path}:${parsed.lineNumber}`
      : `${path}:${parsed.lineNumber}:${parsed.columnNumber}`;
}

/** 原 CHe：href 是否「像工作区文件」（gA 直判 + 裸相对启发式） */
export function isWorkspaceLikeHref(href: string): boolean {
  if (resolveWorkspaceFileLink(undefined, href)) return true;
  const parsed = parseFileHref(href);
  return (
    !!parsed.path &&
    !parsed.path.startsWith(`/`) &&
    !parsed.path.startsWith(`#`) &&
    !parsed.path.startsWith(`../`) &&
    !SCHEME_REGEX.test(parsed.path) &&
    normalizeRelativeSegments(parsed.path) !== null &&
    (parsed.path.includes(`/`) || parsed.path.includes(`\\`) || hasFileExtension(baseName(parsed.path)))
  );
}

/** 原 wHe（js 51373 / jsx 46226）：rehype 插件 —— a[href]/img[src] 工作区路径重写 */
export function rehypeFileLinksPlugin() {
  return (tree: UnistNode) => {
    const walk = (node: UnistNode) => {
      const element = node as HastNodeLike & {
        tagName?: string;
        properties?: Record<string, unknown>;
        children?: UnistNode[];
      };
      const attr = element.tagName === `a` ? `href` : element.tagName === `img` ? `src` : null;
      if (
        node.type === `element` &&
        attr &&
        typeof element.properties?.[attr] === `string` &&
        isWorkspaceLikeHref(element.properties[attr] as string)
      ) {
        element.properties[attr] = buildFileHrefWithLine(element.properties[attr] as string);
      }
      element.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** 原 THe（js 51388）：文件链接重写 + streamdown 默认 rehype 表（Mre = DEFAULT_REHYPE_PLUGINS） */
export const REHYPE_PLUGINS: unknown[] = [rehypeFileLinksPlugin, ...Object.values(DEFAULT_REHYPE_PLUGINS)];

/* ============================================================================
 * 6. 渲染失败降级边界（原 xHe，js 51318 / jsx 46198）
 * ==========================================================================*/

/** 原 rj */
function toRenderError(error: unknown): Error {
  return error instanceof Error ? error : Error(typeof error === `string` ? error : `Unknown markdown render error`);
}

export interface MarkdownErrorBoundaryProps {
  className: string;
  fallbackText: string;
  resetKey: string;
  scope: { markdownLength: number; mode: string; renderStreaming: boolean };
  children?: React.ReactNode;
}
interface MarkdownErrorBoundaryState {
  error: Error | null;
}

/** 原 xHe：markdown 渲染崩溃 ⇒ 纯文本降级；resetKey 变化自动复位 */
export class MarkdownRenderErrorBoundary extends React.Component<MarkdownErrorBoundaryProps, MarkdownErrorBoundaryState> {
  state: MarkdownErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: unknown): MarkdownErrorBoundaryState {
    return { error: toRenderError(error) };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const normalized = toRenderError(error);
    J.warn(`[MessageResponse] markdown 渲染失败，已降级为纯文本`, {
      errorName: normalized.name,
      errorMessage: normalized.message,
      componentStack: info.componentStack,
      markdownLength: this.props.scope.markdownLength,
      mode: this.props.scope.mode,
      renderStreaming: this.props.scope.renderStreaming,
    });
  }
  componentDidUpdate(prev: MarkdownErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }
  render() {
    return this.state.error
      ? React.createElement(`div`, { className: this.props.className }, this.props.fallbackText)
      : this.props.children;
  }
}

/* ============================================================================
 * 7. 文件链接 UI（原 MHe/NHe/RHe/LHe/IHe/FHe/kVe + 编辑器记忆）
 * ==========================================================================*/

export interface FileLinkModel {
  path: string;
  label: string;
  pathKind?: `directory`;
  relativePath: string;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}

/** 原 zA（js 50919） */
export function relativePathFromWorkspace(workspacePath: string, target: string): string {
  const root = workspacePath.replace(/\\/g, `/`).replace(/\/+$/, ``);
  const full = target.replace(/\\/g, `/`).replace(/\/+$/, ``);
  if (root === full) return `.`;
  const prefix = `${root}/`;
  return full.startsWith(prefix) ? full.slice(prefix.length) : baseName(target);
}

/** 原 jHe：href 尾斜杠 ⇒ 目录 */
function hrefEndsWithSeparator(path: string, href: string): boolean {
  const trimmed = href.trim();
  return /[\\/]$/.test(trimmed) || /[\\/]$/.test(path);
}

/** 原 MHe（js 51430） */
export function buildFileLinkModel(args: {
  href: string;
  path: string;
  label: string;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}): FileLinkModel {
  const kind = hrefEndsWithSeparator(args.path, args.href) ? (`directory` as const) : undefined;
  return {
    path: args.path,
    label: args.label,
    pathKind: kind,
    relativePath: args.workspacePath ? relativePathFromWorkspace(args.workspacePath, args.path) : args.label,
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    workspaceRemoteSessionId: args.workspaceRemoteSessionId,
  };
}

/** 原 NHe（js 51441）：stat 确认类型后经平台服务打开 */
export async function openFileLinkInEditor(args: {
  editorId: string;
  fileLink: FileLinkModel;
  openInEditor: (
    editorId: string,
    path: string,
    options: { pathKind?: string; remoteTarget?: unknown; workspaceIdentity?: string | null },
  ) => Promise<{ success: boolean; error?: string }>;
  remoteTarget: unknown;
  statFile: (args: { path: string }) => Promise<{ type: string }>;
}) {
  const stat = await args.statFile({ path: args.fileLink.path });
  return args.openInEditor(args.editorId, args.fileLink.path, {
    pathKind: stat.type,
    remoteTarget: args.remoteTarget,
    workspaceIdentity: args.fileLink.workspaceIdentity,
  });
}

/** 原 FHe */
export function isHttpUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === `http:` || protocol === `https:`;
  } catch {
    return false;
  }
}

/** 原 kVe（js 50817）：http(s) 且主机在 in-app 白名单 */
export function isInAppBrowserUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === `http:` || parsed.protocol === `https:` ? isInAppBrowserHost(parsed.hostname) : false;
  } catch {
    return false;
  }
}

const LAST_EDITOR_ID_KEY = `zcode-last-editor-id`; // 原 EA

/** 原 DA */
function safeLocalStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
/** 原 OA */
export function readLastUsedEditorId(storage: Storage | null = safeLocalStorage()): string | null {
  return readLastEditorId(storage) ?? (() => {
    const value = storage?.getItem(LAST_EDITOR_ID_KEY);
    return typeof value === `string` && value.length > 0 ? value : null;
  })();
}
/** 原 kA */
export function rememberUsedEditorId(editorId: string, storage: Storage | null = safeLocalStorage()): void {
  rememberLastEditorId(editorId, storage);
  storage?.setItem(LAST_EDITOR_ID_KEY, editorId);
}

/** 原 QVe（js 51150）：tabs store → 远程工作区信息 */
export function resolveRemoteWorkspaceInfo(
  tabs: WorkspaceTabLike[],
  scope: { workspacePath?: string | null; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): { isRemoteWorkspace: boolean; remoteTarget: unknown } {
  if (!scope.workspacePath) return { isRemoteWorkspace: false, remoteTarget: undefined };
  const identity = scope.workspaceIdentity?.trim() || undefined;
  const remoteSessionId = scope.workspaceRemoteSessionId?.trim() || undefined;
  const scopeKey = identity || scope.workspacePath;
  const matched = tabs.filter((tab) => {
    if (!isWorkspaceTabLike(tab) || tab.workspacePath !== scope.workspacePath) return false;
    const tabKey = tab.workspaceIdentity?.trim() || tab.workspacePath;
    const tabRemote = tab.remoteSessionId?.trim() || undefined;
    return (!identity || tabKey === scopeKey) && (!remoteSessionId || tabRemote === remoteSessionId);
  });
  const single = matched.length === 1 ? matched[0] : undefined;
  const isRemote = matched.some((tab) => !!(tab.workspaceIdentity || tab.remoteSessionId || tab.remoteTarget));
  const target = single?.remoteTarget;
  return { isRemoteWorkspace: isRemote, remoteTarget: target ? formatRemoteTarget(target) : undefined };
}

/** 原 $A（js 51166） */
export function useRemoteWorkspaceInfo(scope: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}): { isRemoteWorkspace: boolean; remoteTarget: unknown } {
  const tabs = mc((state) => state.tabs);
  return React.useMemo(
    () => resolveRemoteWorkspaceInfo(tabs, scope),
    [scope.workspaceIdentity, scope.workspacePath, scope.workspaceRemoteSessionId, tabs],
  );
}

const PLAIN_LINK_CLASS = `wrap-anywhere text-ui-base font-medium text-primary underline`; // 原 nj
const FILE_LINK_CLASS =
  `inline-flex max-w-full items-center gap-1.5 align-middle text-foreground text-ui-base underline decoration-dotted underline-offset-4 hover:no-underline`; // 原 tHe

interface ExternalLinkProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  onClick?: (event: React.MouseEvent) => void;
  onOpenExternalUrl?: (url: string) => void;
  [prop: string]: unknown;
}

/** 原 IHe（js 51461）：外链按钮 + 右键菜单（打开 / 外部浏览器打开） */
export function ExternalLinkWithContextMenu({ children, className, href, onClick, onOpenExternalUrl, ...rest }: ExternalLinkProps) {
  const { intl } = G();
  const platform = l() as unknown as PlatformServiceLike;
  const open = React.useCallback(
    (options: { forceExternal?: boolean } = {}) => {
      const inApp = !options.forceExternal && isInAppBrowserUrl(href);
      J.debug(`[MessageExternalLink] 打开 Markdown 外链`, {
        forceExternal: !!options.forceExternal,
        href,
        target: inApp ? `app-browser` : `external-browser`,
      });
      if (inApp) {
        onOpenExternalUrl?.(href);
        return;
      }
      platform.openExternal(href);
    },
    [href, onOpenExternalUrl, platform],
  );
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onClick?.(event);
      if (!event.defaultPrevented) open({ forceExternal: event.metaKey || event.ctrlKey });
    },
    [open, onClick],
  );
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          className={Z(PLAIN_LINK_CLASS, `cursor-pointer bg-transparent p-0 text-left`, className)}
          title={href}
          {...rest}
          onClick={handleClick}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className={`w-44`}>
        <ContextMenuItem onSelect={() => open()}>{intl.formatMessage({ id: `common.open` })}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => open({ forceExternal: true })}>
          <IconExternal className={`size-4`} />
          <span>{intl.formatMessage({ id: `chat.previewCards.openExternal` })}</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** 原 LHe props（原 ...a 透传的其余 DOM props 从简收敛，不再索引签名） */
interface FileLinkButtonProps {
  children?: React.ReactNode;
  className?: string;
  fileIconSrc: string;
  fileLink: FileLinkModel;
  onOpen?: () => void;
}

/** 原 LHe（js 51508）：文件链接按钮（forwardRef，图标 + 截断 label） */
export const FileLinkButton = React.forwardRef<HTMLButtonElement, FileLinkButtonProps>(
  function FileLinkButton({ children, className, fileIconSrc, fileLink, onOpen, ...rest }: FileLinkButtonProps, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={Z(FILE_LINK_CLASS, `cursor-pointer`, className)}
      title={fileLink.path}
      onClick={onOpen}
      {...rest}
    >
      <FileIcon src={fileIconSrc} size={16} className={`shrink-0`} />
      <span className={`min-w-0 truncate`}>{children}</span>
    </button>
  );
});

interface FileLinkWithMenuProps {
  className?: string;
  fileIconSrc: string;
  fileLink: FileLinkModel;
  onOpen: () => void;
}

/** 原 RHe（js 51537 / jsx 46389）：文件链接 + 右键「打开方式」编辑器菜单 */
export function FileLinkWithContextMenu({ className, fileIconSrc, fileLink, onOpen }: FileLinkWithMenuProps) {
  const { intl } = G();
  const platform = l() as unknown as PlatformServiceLike;
  const services = ps() as WorkspaceServicesLike | null;
  const remote = useRemoteWorkspaceInfo({
    workspacePath: fileLink.workspacePath,
    workspaceIdentity: fileLink.workspaceIdentity,
    workspaceRemoteSessionId: fileLink.workspaceRemoteSessionId,
  });
  const [installed, setInstalled] = React.useState<InstalledEditor[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const availableEditors = React.useMemo(
    () =>
      remote.isRemoteWorkspace && !remote.remoteTarget
        ? []
        : resolveAvailableEditors({ installedEditors: installed, selectedEditorId: null, remoteTarget: remote.remoteTarget as { kind?: string } | null })
            .availableEditors,
    [installed, remote],
  );
  const preferredEditor = React.useMemo(() => {
    const lastId = readLastUsedEditorId();
    return availableEditors.find((editor) => editor.id === lastId) ?? availableEditors[0] ?? null;
  }, [availableEditors]);
  const loadEditors = React.useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      setInstalled(await platform.getInstalledEditors());
      setLoaded(true);
    } catch (error) {
      J.warn(`[MessageResponse] 获取 markdown 链接打开方式失败`, {
        path: fileLink.path,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, [loaded, fileLink.path, loading, platform]);
  const openInThirdParty = (editor: InstalledEditor) => {
    if (!services) {
      J.warn(`[MessageResponse] 无法确认 markdown 链接文件类型`, {
        editorId: editor.id,
        path: fileLink.path,
        error: `workspace-file-service-unavailable`,
      });
      return;
    }
    rememberUsedEditorId(editor.id);
    openFileLinkInEditor({
      editorId: editor.id,
      fileLink,
      openInEditor: (id, path, options) => platform.openInEditor(id, path, options),
      remoteTarget: remote.remoteTarget,
      statFile: (args) => services.fileService.stat(args),
    })
      .then((result) => {
        if (!result.success) {
          J.warn(`[MessageResponse] 第三方 App 打开 markdown 文件链接失败`, {
            editorId: editor.id,
            path: fileLink.path,
            error: result.error ?? `unknown-error`,
          });
        }
      })
      .catch((error) => {
        J.warn(`[MessageResponse] 无法确认 markdown 链接文件类型`, {
          editorId: editor.id,
          path: fileLink.path,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  };
  return (
    <ContextMenu onOpenChange={(open: boolean) => open && void loadEditors()}>
      <ContextMenuTrigger asChild>
        <FileLinkButton className={className} fileIconSrc={fileIconSrc} fileLink={fileLink} onOpen={onOpen}>
          {fileLink.label}
        </FileLinkButton>
      </ContextMenuTrigger>
      <ContextMenuContent className={`w-52`}>
        <ContextMenuItem onSelect={onOpen}>{intl.formatMessage({ id: `common.open` })}</ContextMenuItem>
        <ContextMenuSeparator />
        {preferredEditor ? (
          availableEditors.map((editor) => (
            <ContextMenuItem key={editor.id} onSelect={() => openInThirdParty(editor)}>
              <img src={editor.iconDataUrl as string | undefined} alt={editor.name} className={`size-4 shrink-0`} />
              <span>{editor.name}</span>
            </ContextMenuItem>
          ))
        ) : (
          <ContextMenuItem disabled>
            {intl.formatMessage({ id: loading ? `common.loading` : `chat.previewCards.noOpenApps` })}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ============================================================================
 * 8. 自定义块渲染器：标题 / 列表 / 引用 / 表格元素族
 * ==========================================================================*/

const HEADING_CLASSES = {
  h1: `mt-6 mb-4 text-ui-xl font-semibold`,
  h2: `mt-6 mb-4 text-ui-lg font-semibold`,
  h3: `mt-6 mb-4 text-ui-base font-semibold`,
  h4: `mt-6 mb-4 text-ui-base font-semibold`,
  h5: `mt-6 mb-4 text-ui-base font-medium`,
  h6: `mt-6 mb-4 text-ui-base font-normal`,
} as const; // 原 nHe（js 51190）

export type HeadingLevel = keyof typeof HEADING_CLASSES;

export interface MarkdownElementBaseProps {
  children?: React.ReactNode;
  className?: string;
  node?: unknown;
  [prop: string]: unknown;
}

/** 原 sj（js 51673）：h1-h6 渲染器（data-streamdown=heading-N） */
export function MarkdownHeading({ className, headingLevel, node, ...rest }: MarkdownElementBaseProps & { headingLevel: HeadingLevel }) {
  const merged = Z(HEADING_CLASSES[headingLevel], className);
  const marker = `heading-${headingLevel.slice(1)}`;
  const Tag = headingLevel;
  return React.createElement(Tag, { className: merged, "data-streamdown": marker, ...rest });
}

/** 原 aBe（js 48892 / jsx 44045） */
export function MarkdownBlockquote({ className, node, ...rest }: MarkdownElementBaseProps) {
  return (
    <blockquote
      className={Z(`my-4 border-border border-l-2 pl-3 text-foreground-subtle`, `[&_p]:my-0 [&_p+p]:mt-2`, className)}
      data-markdown-blockquote=""
      {...rest}
    />
  );
}
/** 原 oBe（js 48903） */
export function MarkdownUl({ className, node, ...rest }: MarkdownElementBaseProps) {
  return (
    <ul
      className={Z(`my-3 list-outside list-disc space-y-1.5 pl-5 marker:text-foreground-subtlest`, `[&_ul]:my-1.5 [&_ol]:my-1.5`, className)}
      data-markdown-list={`unordered`}
      data-streamdown={`unordered-list`}
      {...rest}
    />
  );
}
/** 原 sBe（js 48915） */
export function MarkdownOl({ className, node, ...rest }: MarkdownElementBaseProps) {
  return (
    <ol
      className={Z(`my-3 list-inside list-decimal space-y-1.5 pl-0 marker:text-foreground-subtlest`, `[&_ul]:my-1.5 [&_ol]:my-1.5`, className)}
      data-markdown-list={`ordered`}
      data-streamdown={`ordered-list`}
      {...rest}
    />
  );
}
/** 原 cBe（js 48927） */
export function MarkdownLi({ className, node, ...rest }: MarkdownElementBaseProps) {
  return <li className={Z(`pl-1 [&>p]:my-0 [&>p]:inline`, className)} data-streamdown={`list-item`} {...rest} />;
}
/** 原 NBe（js 49723） */
export function MarkdownThead({ className, node, ...rest }: MarkdownElementBaseProps) {
  return <thead className={Z(``, className)} {...rest} />;
}
/** 原 PBe（js 49726） */
export function MarkdownTbody({ className, node, ...rest }: MarkdownElementBaseProps) {
  return <tbody className={Z(``, className)} {...rest} />;
}
/** 原 FBe（js 49729） */
export function MarkdownTr({ className, node, ...rest }: MarkdownElementBaseProps) {
  return <tr className={Z(`transition-colors last:[&>td]:border-b-0 hover:bg-hover/20`, className)} {...rest} />;
}
/** 原 IBe（js 49735） */
export function MarkdownTh({ className, node, ...rest }: MarkdownElementBaseProps) {
  return (
    <th
      className={Z(
        `border-border border-b px-3 py-2 text-left font-normal text-foreground-subtlest min-w-16 max-w-md whitespace-normal break-words`,
        className,
      )}
      {...rest}
    />
  );
}
/** 原 LBe（js 49744） */
export function MarkdownTd({ className, node, ...rest }: MarkdownElementBaseProps) {
  return (
    <td
      className={Z(`border-border border-b px-3 py-2 text-foreground align-top min-w-16 max-w-md whitespace-normal break-words`, className)}
      {...rest}
    />
  );
}

/* --- 表格几何 / 序列化助手群（原 vBe…jBe，js 48936–49089，MBe 消费） --- */

const TABLE_LAYOUT_ROOT_SELECTOR = `[data-markdown-table-layout-root="true"], [data-testid="chat-view"]`; // 原 lBe
const TABLE_STICKY_DISABLED_SELECTOR = `[data-markdown-table-sticky-scrollbar="disabled"]`; // 原 uBe
const COMPOSER_DOCK_SELECTOR = `[data-v4-composer-dock="true"]`; // 原 Dk
const BACK_TO_BOTTOM_BUTTON_SELECTOR = `[data-v4-back-to-bottom-anchor="composer-dock"] button`; // 原 dBe
const STICKY_GAP_PX = 8; // 原 fBe
const STICKY_INSET_DESKTOP_PX = 32; // 原 Ok
const STICKY_INSET_TABLET_PX = 16; // 原 pBe
const STICKY_INSET_MOBILE_PX = 8; // 原 mBe
const STICKY_TABLE_RATIO = 0.8; // 原 hBe
const LEFT_INSET_VAR = `--markdown-table-layout-left-inset`; // 原 gBe
const RIGHT_INSET_VAR = `--markdown-table-layout-right-inset`; // 原 _Be

/** 原 vBe */
export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ` `).trim();
}
/** 原 yBe：markdown 单元格转义 */
export function escapeMarkdownCell(text: string): string {
  return text.replace(/\\/g, `\\\\`).replace(/\|/g, `\\|`).replace(/\r?\n/g, `<br>`);
}
/** 原 bBe：CSV 单元格转义（公式注入前缀保护） */
export function escapeCsvCell(text: string): string {
  const prefixed = /^[\t\r\n]/u.test(text) || /^[\s]*[=+\-@]/u.test(text) ? `'${text}` : text;
  return /[",\r\n]/u.test(prefixed) ? `"${prefixed.replace(/"/g, `""`)}"` : prefixed;
}
/** 原 xBe：DOM 表格 → markdown 文本 */
export function tableRowsToMarkdown(rows: string[][]): string {
  if (rows.length === 0) return ``;
  const width = Math.max(...rows.map((row) => row.length), 1);
  const cells = rows.map((row) => Array.from({ length: width }, (_, i) => escapeMarkdownCell(row[i] ?? ``)));
  return [cells[0] ?? [], Array.from({ length: width }, () => `---`), ...cells.slice(1)]
    .map((row) => `| ${row.join(` | `)} |`)
    .join(`\n`);
}
/** 原 SBe：BOM + CRLF CSV */
export function tableRowsToCsv(rows: string[][]): string {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(`,`)).join(`\r\n`)}`;
}
/** 原 CBe：table 元素 → 行矩阵 */
export function extractTableRows(table: HTMLTableElement | null): string[][] {
  return table
    ? Array.from(table.querySelectorAll(`tr`))
        .map((tr) => Array.from(tr.querySelectorAll(`th,td`)).map((cell) => collapseWhitespace(cell.textContent ?? ``)))
        .filter((row) => row.length > 0)
    : [];
}
/** 原 kk */
export function tableLayoutRoot(element: Element | null, fallback: Element | null): Element | null {
  return element?.closest(TABLE_LAYOUT_ROOT_SELECTOR) ?? fallback;
}
/** 原 wBe：按视口宽度选粘性条内缩 */
function stickyInsetForViewport(): number {
  return typeof window > `u`
    ? STICKY_INSET_DESKTOP_PX
    : window.innerWidth < 768
      ? STICKY_INSET_MOBILE_PX
      : window.innerWidth < 1024
        ? STICKY_INSET_TABLET_PX
        : STICKY_INSET_DESKTOP_PX;
}
/** 原 TBe */
export function tableLayoutInsets(root: Element | null): { leftInset: number; rightInset: number } {
  if (typeof window < `u` && root?.matches(`[data-markdown-table-layout-root="true"]`)) {
    return { leftInset: cssVarPx(root, LEFT_INSET_VAR), rightInset: cssVarPx(root, RIGHT_INSET_VAR) };
  }
  const inset = stickyInsetForViewport();
  return { leftInset: inset, rightInset: inset };
}
interface RectMetrics {
  left: number;
  right: number;
  width: number;
}
/** 原 Ak */
export function measureRect(element: Element | null): RectMetrics | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
}
/** 原 jk */
export function sameRect(a: RectMetrics | null, b: RectMetrics | null): boolean {
  return a?.left === b?.left && a?.right === b?.right && a?.width === b?.width;
}
/** 原 Mk */
function cssVarPx(element: Element | null, name: string): number {
  if (!element || typeof window > `u`) return 0;
  const value = Number.parseFloat(window.getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
/** 原 Nk：聊天底部 dock 高度（--chat-bottom-dock-height 或 composer dock 实测） */
export function chatDockHeight(root: Element | null): number {
  const fromVar = cssVarPx(root, `--chat-bottom-dock-height`);
  return fromVar > 0 ? fromVar : (root?.querySelector(COMPOSER_DOCK_SELECTOR)?.getBoundingClientRect().height ?? 0);
}
/** 原 EBe：回底按钮高度 + 间隙 */
export function backToBottomInset(root: Element | null): number {
  const button = root?.querySelector(BACK_TO_BOTTOM_BUTTON_SELECTOR);
  return button ? button.getBoundingClientRect().height + STICKY_GAP_PX : 0;
}
/** 原 Pk：向上找可纵向滚动的祖先 */
export function findVerticalScroller(element: Element | null, fallback: Element | null): Element | null {
  if (typeof window > `u`) return fallback;
  let current = element?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    const scrollable = /auto|scroll|overlay/u.test(style.overflowY);
    const overflowing = current.scrollHeight > current.clientHeight + 1;
    if (scrollable && current.clientHeight > 0 && overflowing) return current;
    current = current.parentElement;
  }
  return fallback;
}
/** 原 DBe：表高超过可视 80% ⇒ 启用粘性横向条 */
export function shouldShowStickyScrollbar(args: {
  stickyScrollbarDisabled: boolean;
  viewportHeight: number;
  dockHeight: number;
  tableHeight: number;
}): boolean {
  if (args.stickyScrollbarDisabled) return false;
  const visible = Math.max(0, args.viewportHeight - args.dockHeight);
  return visible > 0 && args.tableHeight > visible * STICKY_TABLE_RATIO;
}
/** 原 OBe：粘性条相对表底的纵向偏移 */
export function stickyScrollbarOffset(args: {
  frameTop: number;
  frameBottom: number;
  scrollbarHeight: number;
  viewportBottom: number;
}): number {
  const clamped = Math.min(args.frameBottom, args.frameTop + Math.max(0, args.scrollbarHeight));
  return Math.min(0, Math.min(args.frameBottom, Math.max(clamped, args.viewportBottom)) - args.frameBottom);
}
/** 原 kBe（styles 49084：对象参数 { root, table }） */
export function tableNeedsStickyScrollbar({ root, table }: { root: Element | null; table: HTMLTableElement | null }): boolean {
  if (!table) return false;
  const scroller = findVerticalScroller(table, root);
  const viewportHeight =
    scroller?.clientHeight || scroller?.getBoundingClientRect().height || (typeof window > `u` ? 0 : window.innerHeight);
  const dockHeight = chatDockHeight(root);
  const tableHeight = table.getBoundingClientRect().height;
  return shouldShowStickyScrollbar({
    stickyScrollbarDisabled: table.closest(TABLE_STICKY_DISABLED_SELECTOR) !== null,
    viewportHeight,
    dockHeight,
    tableHeight,
  });
}
/** 原 ABe：粘性条轨道几何（左右距离/最大偏移/滚动条宽） */
export function stickyTrackGeometry(args: {
  frameWidth: number;
  frameLeft: number;
  frameRight: number;
  rootLeft: number;
  rootRight: number;
  leftInset?: number;
  rightInset?: number;
}) {
  const leftDistance = Math.max(0, args.frameLeft - args.rootLeft);
  const rightDistance = Math.max(0, args.rootRight - args.frameRight);
  const maxLeftOffset = Math.max(0, leftDistance - (args.leftInset ?? 0));
  const scrollbarWidth = Math.max(0, args.frameWidth + rightDistance - (args.rightInset ?? 0));
  return { leftDistance, maxLeftOffset, scrollbarWidth, rightDistance, maxViewportWidth: scrollbarWidth };
}
/** 原 Fk：scrollLeft → 拇指几何 */
export function stickyThumbGeometry(args: { scrollLeft: number; scrollMax: number; tableWidth: number; trackWidth: number }) {
  const tableWidth = Math.max(0, args.tableWidth);
  const trackWidth = Math.max(0, args.trackWidth);
  const scrollMax = Math.max(0, args.scrollMax);
  const contentWidth = Math.max(trackWidth, tableWidth);
  if (trackWidth <= 0 || scrollMax <= 1 || tableWidth <= trackWidth) {
    return { contentWidth: trackWidth, thumbLeft: 0, thumbWidth: trackWidth };
  }
  const thumb = Math.min(trackWidth, Math.max(0, (trackWidth / tableWidth) * trackWidth));
  const slack = Math.max(0, trackWidth - thumb);
  return {
    contentWidth,
    thumbLeft: Math.min(slack, Math.max(0, (trackWidth / tableWidth) * Math.max(0, args.scrollLeft))),
    thumbWidth: thumb,
  };
}
/** 原 jBe */
export function stickyScrollMax(args: { tableWidth: number; trackWidth: number }): number {
  return Math.max(0, args.tableWidth - args.trackWidth);
}

/**
 * 原 MBe（js 49090 / jsx ~44160）：MarkdownTableStickyScrollbar。
 * 结构（逐段对照）：
 *  - 外层 frame（group/markdown-table-frame，data-markdown-table-layout-root）+
 *    Ik 左右边缘阴影（scrollLeft 边界态 left/right/both/none）；
 *  - 横向滚动容器（table ref）+ 表头动作条（复制 markdown/CSV、下载、全屏 zb 预览，
 *    全屏内容 = DialogContent 内 sticky 表头 table，data-streamdown=table-preview）；
 *  - 粘性横向滚动条：kBe 判定启用 → 底部悬浮轨道（data-markdown-table-virtual-scroll-track），
 *    指针拖拽/滚轮 → he() 写回 table.scrollLeft，scroll/resize/RO 订阅 → ge() 同步拇指
 *    （Fk 几何），轨道显隐 = 悬停或拖拽中（S/b 态类名见 jsx 44676）；
 *  - 状态/引用：10×useState + 16×useRef + 10×useCallback（re…de 去抖 setter 群），
 *    交互handler群原 js 49180–49640（本文件保留几何模型，事件接线从简）。
 */

/** 原 Ik（js 49699）：表格左右边缘阴影 */
export function TableEdgeShadow({ side, state }: { side: `left` | `right`; state: string }) {
  return state === side || state === `both` ? (
    <div
      aria-hidden="true"
      className={Z(
        `pointer-events-none absolute inset-y-0 z-10 w-6`,
        side === `left`
          ? `left-0 rounded-l-xl shadow-[inset_12px_0_12px_-12px_color-mix(in_srgb,black_15%,transparent)]`
          : `right-0 rounded-r-xl shadow-[inset_-12px_0_12px_-12px_color-mix(in_srgb,black_15%,transparent)]`,
      )}
      data-markdown-table-edge-shadow={side}
    />
  ) : null;
}

/* ============================================================================
 * 9. 代码块 UI 族（原 fk/nBe/pk/gk/_k/iBe/vk + mermaid 门控 + BO）
 * ==========================================================================*/

/** 原 fk（js 48576 / jsx 43777） */
export interface CodeBlockUiContextValue {
  code: string;
  mermaidPreviewAvailable: boolean;
  openMermaidPreview: () => void;
  toggleWrapLongLines: () => void;
  wrapLongLines: boolean;
}
export const CodeBlockUiContext = React.createContext<CodeBlockUiContextValue>({
  code: ``,
  mermaidPreviewAvailable: false,
  openMermaidPreview: () => {},
  toggleWrapLongLines: () => {},
  wrapLongLines: false,
});

/** 原 nBe（js 48583）：content-visibility 容器 */
export function CodeBlockFrame({
  className,
  language,
  style,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { language?: string }) {
  return (
    <div
      className={Z(`group relative w-full overflow-hidden rounded-xl bg-background text-foreground`, className)}
      data-language={language}
      style={{ containIntrinsicSize: `auto 200px`, contentVisibility: `auto`, ...style }}
      {...rest}
    />
  );
}

/** 原 NO（js 47661） */
export function isMermaidLanguage(language: string): boolean {
  const key = language.trim().toLowerCase();
  return key === `mermaid` || key === `mmd`;
}

const PLAINTEXT_LANGUAGES = new Set([``, `text`, `txt`, `plain`]); // 原 wze
const FRONTMATTER_REGEX = /^---[\s\S]*?---\s*/; // 原 Tze
const MERMAID_DIAGRAM_REGEX =
  /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|sankey-beta|xychart-beta|block-beta|packet-beta|architecture-beta|c4(?:Context|Container|Component|Dynamic|Deployment))/i; // 原 Eze

/** 原 Dze：去 frontmatter 后命中图表关键字 */
function hasMermaidDiagramKeyword(code: string): boolean {
  const stripped = code.replace(FRONTMATTER_REGEX, ``);
  return MERMAID_DIAGRAM_REGEX.test(stripped.trim());
}

/** 原 Oze（js 47677）：语言=mermaid 或 （纯文本语言且内容像图） */
export function isMermaidBlock(language: string, code: string): boolean {
  const key = language.trim().toLowerCase();
  return isMermaidLanguage(key) ? true : PLAINTEXT_LANGUAGES.has(key) && hasMermaidDiagramKeyword(code);
}

const MERMAID_EDGE_TOKEN_REGEX = /(?:<-->|<--|-->|---|-\.->|==>|--x|--o|x--|o--)/gu; // 原 kze
const MERMAID_NODE_TOKEN_REGEX = /(?:^|\n)\s*[A-Za-z][\w-]*(?:\[[^\]\n]{0,200}\]|\([^)\n]{0,200}\)|\{[^}\n]{0,200}\})/gu; // 原 Aze

/** 原 PO */
function countMatches(text: string, regex: RegExp): number {
  regex.lastIndex = 0;
  let count = 0;
  while (regex.exec(text)) count += 1;
  return count;
}
/** 原 jze */
function countLines(text: string): number {
  if (!text) return 0;
  let lines = 1;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) lines += 1;
  return lines;
}
/** 原 Mze */
export function documentVisibilityState(): DocumentVisibilityState | `unknown` {
  if (typeof document > `u`) return `visible`;
  const state = document.visibilityState;
  return state === `visible` || state === `hidden` || state === `prerender` || state === `unloaded`
    ? state
    : document.hidden
      ? `hidden`
      : `visible`;
}
/** 原 Nze：mermaid 复杂度度量 */
export function mermaidComplexityMetrics(code: string) {
  const lineCount = countLines(code);
  const edgeLikeTokenCount = countMatches(code, MERMAID_EDGE_TOKEN_REGEX);
  const nodeLikeTokenCount = countMatches(code, MERMAID_NODE_TOKEN_REGEX);
  return {
    sourceChars: code.length,
    lineCount,
    edgeLikeTokenCount,
    nodeLikeTokenCount,
    complexityScore: lineCount + edgeLikeTokenCount + nodeLikeTokenCount,
  };
}
/** 原 Pze（js 47717）：自动渲染门控（文档隐藏/体量/复杂度超限 ⇒ 仅源码） */
export function mermaidAutoRenderGate(
  code: string,
  options: { documentVisibilityState?: DocumentVisibilityState | `unknown`; maxSourceChars?: number; maxLines?: number; maxComplexityScore?: number } = {},
): { shouldRender: boolean; reason?: string; metrics: ReturnType<typeof mermaidComplexityMetrics> } {
  const metrics = mermaidComplexityMetrics(code);
  const visibility = options.documentVisibilityState ?? `visible`;
  const maxSourceChars = options.maxSourceChars ?? 20000;
  const maxLines = options.maxLines ?? 600;
  const maxComplexityScore = options.maxComplexityScore ?? 1500;
  return visibility !== `visible` && visibility !== `unknown`
    ? { shouldRender: false, reason: `document-hidden`, metrics }
    : metrics.sourceChars > maxSourceChars
      ? { shouldRender: false, reason: `source-too-large`, metrics }
      : metrics.lineCount > maxLines
        ? { shouldRender: false, reason: `line-count-too-large`, metrics }
        : metrics.complexityScore > maxComplexityScore
          ? { shouldRender: false, reason: `complexity-too-large`, metrics }
          : { shouldRender: true, metrics };
}

/** 原 tBe（js 48553）：文档可见性变化计数（触发门控重估） */
export function useDocumentVisibilityTick(enabled: boolean): number {
  const [tick, bump] = React.useState(0);
  React.useEffect(() => {
    if (!enabled || typeof document > `u` || typeof document.addEventListener !== `function`) return;
    const onChange = () => bump((value) => value + 1);
    document.addEventListener(`visibilitychange`, onChange);
    return () => document.removeEventListener(`visibilitychange`, onChange);
  }, [enabled]);
  return tick;
}

/** 原 eBe（js 48553）：语言 → 显示名 key（$ze 表，缺省 code.<lang>） */
export function codeHeaderDisplayKey(language: string, displayFile?: string): string {
  const key = language.trim().toLowerCase();
  return displayFile ?? LANGUAGE_DISPLAY_KEYS[key] ?? `code.${key || `txt`}`;
}

/** 原 pk（js 48592 / jsx 43790）：代码块语言条 */
export function ZCodeCodeBlockHeader({
  children,
  className,
  displayFile,
  language,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { displayFile?: string; language?: string }) {
  const lang = language?.trim() || `text`;
  const meta = resolveFileMeta(codeHeaderDisplayKey(lang, displayFile));
  return (
    <div
      className={Z(`flex items-center justify-between gap-3 px-3 py-2 text-ui-base text-muted-foreground`, className)}
      {...rest}
    >
      {children ?? (
        <>
          <div className={Z(`flex items-center gap-2`, `min-w-0`)}>
            <FileIcon src={meta.fileIconSrc} size={16} className={`shrink-0`} />
            <span className={Z(`font-mono`, `truncate lowercase`)}>{lang}</span>
          </div>
          <div className={Z(`-my-1 -mr-1 flex items-center gap-1`)}>
            {isMermaidLanguage(lang) ? (
              <MermaidOpenPreviewButton />
            ) : (
              <WrapLongLinesButton aria-label={`Wrap lines`} title={`Wrap lines`} />
            )}
            <CopyCodeButton aria-label={`Copy code`} title={`Copy code`} />
          </div>
        </>
      )}
    </div>
  );
}

/** 原 _k（js 48720）：折行切换按钮（fk ctx） */
export function WrapLongLinesButton({
  "aria-label": ariaLabel,
  children,
  className,
  onClick,
  title = `Wrap lines`,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleWrapLongLines, wrapLongLines } = React.useContext(CodeBlockUiContext);
  return (
    <Ia title={title} side="top">
      <X
        aria-label={ariaLabel ?? title}
        aria-pressed={wrapLongLines}
        className={Z(`shrink-0`, wrapLongLines && `bg-muted`, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleWrapLongLines();
        }}
        size={`icon-md`}
        type="button"
        variant={`ghost`}
        {...rest}
      >
        {children ?? <IconWrap className={`size-3.5`} />}
      </X>
    </Ia>
  );
}

/** 原 iBe（js 48745）：mermaid 预览按钮（fk ctx） */
export function MermaidOpenPreviewButton({
  "aria-label": ariaLabel,
  children,
  className,
  onClick,
  title,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { intl } = G();
  const { mermaidPreviewAvailable, openMermaidPreview } = React.useContext(CodeBlockUiContext);
  const label = title ?? intl.formatMessage({ id: `codeBlock.mermaid.openPreview` });
  return (
    <Ia title={label} side="top">
      <X
        aria-label={ariaLabel ?? label}
        className={Z(`shrink-0`, className)}
        disabled={!mermaidPreviewAvailable}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) openMermaidPreview();
        }}
        size={`icon-md`}
        type="button"
        variant={`ghost`}
        {...rest}
      >
        {children ?? <IconMermaid className={`size-3.5`} />}
      </X>
    </Ia>
  );
}

/** 原 vk（js 48775）：复制按钮（fk ctx code，2s check 态） */
export function CopyCodeButton({
  "aria-label": ariaLabel,
  onCopy,
  onError,
  title = `Copy code`,
  timeout = 2000,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { onCopy?: () => void; onError?: (error: unknown) => void; timeout?: number }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef(0);
  const { code } = React.useContext(CodeBlockUiContext);
  const copy = React.useCallback(async () => {
    if (typeof window > `u` || !navigator?.clipboard?.writeText) {
      onError?.(Error(`Clipboard API not available`));
      return;
    }
    try {
      if (!copied) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        onCopy?.();
        timer.current = window.setTimeout(() => setCopied(false), timeout);
      }
    } catch (error) {
      onError?.(error);
    }
  }, [code, onCopy, onError, timeout, copied]);
  React.useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );
  const Icon = copied ? IconCheck : IconCopy;
  return (
    <Ia title={title} side="top">
      <X aria-label={ariaLabel ?? title} className={Z(`shrink-0`, className)} onClick={copy} size={`icon-md`} type="button" variant={`ghost`} {...rest}>
        {children ?? <Icon className={`size-3.5`} />}
      </X>
    </Ia>
  );
}

/** 原 RO：FNV-1a → base36（mermaid 缓存键） */
function fnv1aBase36(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** 原 Lze：mermaid 渲染串行队列（单链 Promise） */
let mermaidRenderQueue: Promise<unknown> = Promise.resolve(); // 原 FO
function enqueueMermaidRender<T>(task: () => Promise<T> | T): Promise<T> {
  const chained = mermaidRenderQueue.then(task, task);
  mermaidRenderQueue = chained.then(
    () => undefined,
    () => undefined,
  );
  return chained as Promise<T>;
}

/** 原 BO（js 47847）：mermaid 内嵌预览（loading → svg / 失败降级 pre） */
export function MermaidInlinePreview({
  code,
  className,
  theme = `system`,
  onOpenPreview,
  onPreviewSvgChange,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  code: string;
  theme?: string;
  onOpenPreview?: () => void;
  onPreviewSvgChange?: (svg: string | null) => void;
}) {
  const { intl } = G();
  const themeVars = resolveMermaidThemeVars(theme);
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, ``);
  const source = code.trim();
  const configBase = resolveMermaidConfigBase(theme);
  const configKey = `${theme}:${configBase as string}:${themeVars as string}`;
  const config = React.useMemo(() => buildMermaidConfig(configBase), [configBase, configKey]);
  const cacheKey = React.useMemo(() => `${configKey}:${fnv1aBase36(source)}`, [configKey, source]);
  const [state, setState] = React.useState<{ status: `loading` } | { status: `plaintext` } | { status: `ready`; svg: string }>({
    status: `loading`,
  });
  React.useEffect(() => {
    let cancelled = false;
    if (!source) {
      setState({ status: `plaintext` });
      onPreviewSvgChange?.(null);
      return;
    }
    setState({ status: `loading` });
    onPreviewSvgChange?.(null);
    const renderId = `zcode-mermaid-${uid}-${fnv1aBase36(cacheKey)}`;
    return (
      enqueueMermaidRender(async () => MERMAID_INLINE_PLUGIN.getMermaid(config as Record<string, unknown>).render(renderId, source))
        .then(({ svg }) => {
          if (!cancelled) {
            setState({ status: `ready`, svg });
            onPreviewSvgChange?.(svg);
          }
        })
        .catch((error) => {
          const described = describeMermaidError(error);
          J.debug(`[MermaidBlock] Mermaid 渲染失败`, { error: described, codeLength: source.length });
          if (!cancelled) {
            setState({ status: `plaintext` });
            onPreviewSvgChange?.(null);
          }
        }),
      () => {
        cancelled = true;
        onPreviewSvgChange?.(null);
      }
    );
  }, [intl, config, onPreviewSvgChange, uid, cacheKey, source]);
  return (
    <div className={Z(`group/mermaid relative min-h-32 w-full bg-card`, className)} data-mermaid-block="" {...rest}>
      <div className={`max-h-[420px] overflow-auto p-3 text-foreground`}>
        {state.status === `loading` ? (
          <div className={`flex min-h-28 items-center justify-center gap-2 text-foreground-subtle text-ui-base`}>
            <IconSpinner className={`size-4 animate-spin`} />
            <span>{intl.formatMessage({ id: `codeBlock.mermaid.loading` })}</span>
          </div>
        ) : null}
        {state.status === `plaintext` ? (
          <pre className={`m-0 min-h-28 min-w-max bg-transparent font-mono text-foreground text-ui-base leading-relaxed`}>{code}</pre>
        ) : null}
        {state.status === `ready` ? (
          <div
            aria-label={intl.formatMessage({ id: `codeBlock.mermaid.ariaLabel` })}
            className={`flex min-h-28 min-w-max items-center justify-center [&_svg]:h-auto [&_svg]:max-w-none`}
            dangerouslySetInnerHTML={{ __html: state.svg }}
            onDoubleClick={onOpenPreview}
            role="img"
          />
        ) : null}
      </div>
    </div>
  );
}

/** 原 gk（js 48634 / jsx 43873）：ZCode 代码块容器 ——
 *  fk ctx 注入 + mermaid 门控（Oze/Pze）+ BO 内嵌 / MO 高亮体二选一 + Qze 全屏 */
export function ZCodeCodeBlock({
  code,
  enableSyntaxHighlighting = true,
  language,
  showLineNumbers = false,
  theme,
  appTheme,
  wrapLongLines = false,
  fontSizePx = 14,
  renderMermaid = true,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  code: string;
  enableSyntaxHighlighting?: boolean;
  language: string;
  showLineNumbers?: boolean;
  theme: string;
  appTheme: string;
  wrapLongLines?: boolean;
  fontSizePx?: number;
  renderMermaid?: boolean;
}) {
  const { intl } = G();
  const [wrapped, setWrapped] = React.useState(wrapLongLines);
  const [previewSvg, setPreviewSvg] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const isMermaid = renderMermaid && isMermaidBlock(language, code);
  const gate = React.useMemo(
    () => (isMermaid ? mermaidAutoRenderGate(code, { documentVisibilityState: documentVisibilityState() }) : null),
    [isMermaid, code, useDocumentVisibilityTick(isMermaid)],
  );
  const renderInlineMermaid = isMermaid && gate?.shouldRender === true;
  React.useEffect(() => {
    setWrapped(wrapLongLines);
  }, [wrapLongLines]);
  const toggleWrap = React.useCallback(() => {
    setWrapped((value) => !value);
  }, []);
  const openPreview = React.useCallback(() => {
    setPreviewOpen(true);
  }, []);
  React.useEffect(() => {
    if (!renderInlineMermaid) {
      setPreviewSvg(null);
      setPreviewOpen(false);
    }
  }, [renderInlineMermaid]);
  React.useEffect(() => {
    if (!gate || gate.shouldRender) return;
    J.debug(`[CodeBlock] Mermaid 自动渲染跳过`, { reason: gate.reason, ...gate.metrics });
  }, [gate]);
  const contextValue = React.useMemo(
    () => ({
      code,
      mermaidPreviewAvailable: !!previewSvg,
      openMermaidPreview: openPreview,
      toggleWrapLongLines: toggleWrap,
      wrapLongLines: wrapped,
    }),
    [code, wrapped, previewSvg, openPreview, toggleWrap],
  );
  return (
    <CodeBlockUiContext.Provider value={contextValue}>
      <CodeBlockFrame className={className} language={language} {...rest}>
        {children}
        <div className={`p-2 pt-0 pb-3`}>
          {renderInlineMermaid ? (
            <MermaidInlinePreview code={code} theme={appTheme} onOpenPreview={openPreview} onPreviewSvgChange={setPreviewSvg} />
          ) : (
            <HighlightedCodeBlock
              code={code}
              enableSyntaxHighlighting={enableSyntaxHighlighting}
              language={language}
              showLineNumbers={showLineNumbers}
              theme={theme}
              wrapLongLines={wrapped}
              className={`bg-transparent`}
              fontSizePx={fontSizePx}
              style={{
                "--diffs-bg": `var(--color-card)`,
                "--diffs-light-bg": `var(--color-card)`,
                "--diffs-dark-bg": `var(--color-card)`,
                "--diffs-gap-block": `0px`,
              }}
            />
          )}
        </div>
        {renderInlineMermaid && previewSvg ? (
          <MermaidFullscreenDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            svg={previewSvg}
            title={intl.formatMessage({ id: `codeBlock.mermaid.ariaLabel` })}
          />
        ) : null}
      </CodeBlockFrame>
    </CodeBlockUiContext.Provider>
  );
}

/* ============================================================================
 * 10. 图片 / 段落渲染器（原 mVe / dVe + 画廊原语）
 * ==========================================================================*/

export const IMAGE_THUMBNAIL_CLASS =
  `my-4 block w-fit max-w-1/2 cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`; // 原 Gk
const IMAGE_INNER_CLASS = `h-auto max-h-90 max-w-full rounded-xl border border-border bg-background object-cover`; // 原 Kk

/** 原 fVe */
function mediaPreviewToDataUrl(preview: { mediaType: string; dataBase64: string }): string {
  return `data:${preview.mediaType};base64,${preview.dataBase64}`;
}

/** 原 pVe：灯箱条目收集（画廊组内全部 trigger，否则自身） */
function collectLightboxItems(trigger: HTMLElement): LightboxItem[] {
  const group = trigger.closest(`[data-markdown-image-gallery]`);
  const triggers = group ? Array.from(group.querySelectorAll(`[data-markdown-image-trigger]`)) : [trigger];
  return triggers.flatMap((element) => {
    const img = element.querySelector(`img[data-markdown-image]`) as HTMLImageElement | null;
    return img?.src ? [{ alt: img.alt, filename: img.alt, src: img.src }] : [];
  });
}

export interface MarkdownImageProps {
  alt?: string;
  className?: string;
  node?: unknown;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  src?: string;
  workspacePath?: string | null;
  [prop: string]: unknown;
}

/** 原 mVe（js 50561 / jsx 45449）：本地图片走 fileService.readMediaPreview，失败/远端降级；灯箱 Wk */
export function MarkdownImage({ alt, className, node, onError, onLoad, src, workspacePath, ...rest }: MarkdownImageProps) {
  const { intl } = G();
  const services = ps() as WorkspaceServicesLike | null;
  const rawSrc = typeof src === `string` ? src : ``;
  const local = React.useMemo(() => {
    const link = resolveWorkspaceFileLink(workspacePath, rawSrc);
    return link && isMediaPath(link.path) ? link : null;
  }, [rawSrc, workspacePath]);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [items, setItems] = React.useState<LightboxItem[]>([]);
  const [initialIndex, setInitialIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [loadState, setLoadState] = React.useState<{ source: string; status: `loading` | `error` } | { source: string; status: `loaded` }>({
    source: ``,
    status: `loading`,
  });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const focusTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    setPreview(null);
    setFailed(false);
    if (!local || !services) return;
    let cancelled = false;
    services.fileService
      .readMediaPreview({ path: local.path })
      .then((result) => {
        if (!cancelled) setPreview(mediaPreviewToDataUrl(result));
      })
      .catch((error) => {
        if (!cancelled) {
          setFailed(true);
          J.warn(`[MarkdownImage] markdown 本地图片预览失败`, {
            path: local.path,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [local, services]);

  React.useEffect(
    () => () => {
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    },
    [],
  );

  const effectiveSrc = local ? preview : rawSrc;
  if (!rawSrc) return null;
  const unavailableLabel = intl.formatMessage({ id: `codeViewer.imageUnavailable` });
  const placeholderClass =
    `flex min-h-32 w-full items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-center text-ui-base text-foreground-subtle md:h-44 md:w-56 md:shrink-0`;
  if (local && !effectiveSrc) {
    return (
      <div
        aria-label={failed ? unavailableLabel : undefined}
        className={Z(placeholderClass, className)}
        data-markdown-local-image={failed ? `error` : `loading`}
        role={failed ? `img` : `status`}
        title={local.path}
      >
        {failed ? <IconImageOff aria-hidden="true" className={`size-6`} /> : intl.formatMessage({ id: `common.loading` })}
      </div>
    );
  }
  const imageStatus = loadState.source === effectiveSrc ? loadState.status : `loading`;
  if (imageStatus === `error`) {
    return (
      <div aria-label={unavailableLabel} className={Z(placeholderClass, className)} data-markdown-image-state={`error`} role="img" title={local?.path}>
        <IconImageOff aria-hidden="true" className={`size-6`} />
      </div>
    );
  }
  const openLightbox = (event: React.MouseEvent<HTMLButtonElement>) => {
    const collected = collectLightboxItems(event.currentTarget);
    setItems(collected);
    setInitialIndex(Math.max(0, collected.findIndex((item) => item.src === effectiveSrc)));
    setLightboxOpen(true);
  };
  const previewTitle = alt || intl.formatMessage({ id: `chat.attachments.preview.title` });
  const handleLightboxChange = (open: boolean) => {
    setLightboxOpen(open);
    if (!open) {
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
      focusTimer.current = window.setTimeout(() => {
        triggerRef.current?.focus();
        focusTimer.current = null;
      }, 0);
    }
  };
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={intl.formatMessage({ id: `chat.attachments.preview.open` })}
        className={Z(IMAGE_THUMBNAIL_CLASS, imageStatus === `loading` && `relative !h-44 !w-44 !max-w-full cursor-default`)}
        data-image-thumbnail-trigger=""
        data-markdown-image-trigger=""
        onClick={openLightbox}
        title={local?.path}
      >
        {imageStatus === `loading` ? (
          <span
            aria-label={intl.formatMessage({ id: `common.loading` })}
            className={`markdown-image-loading-shimmer absolute inset-0 flex size-full items-center justify-center text-foreground-subtle`}
            data-markdown-image-state={`loading`}
            role="status"
          >
            <IconLoader aria-hidden="true" className={`size-6`} />
          </span>
        ) : null}
        <img
          alt={previewTitle}
          className={Z(IMAGE_INNER_CLASS, imageStatus === `loading` && `invisible`, className)}
          data-markdown-image=""
          data-streamdown={`image`}
          draggable={false}
          loading={`lazy`}
          onError={(event) => {
            setLoadState({ source: effectiveSrc ?? ``, status: `error` });
            J.warn(`[MarkdownImage] markdown 图片加载失败`, { source: summarizeSource(effectiveSrc ?? ``) });
            onError?.(event);
          }}
          onLoad={(event) => {
            setLoadState({ source: effectiveSrc ?? ``, status: `loaded` });
            onLoad?.(event);
          }}
          src={effectiveSrc ?? undefined}
          {...rest}
        />
      </button>
      <ImageLightbox initialIndex={initialIndex} items={items} onOpenChange={handleLightboxChange} open={lightboxOpen} />
    </>
  );
}

/** 原 aA：媒体扩展名判定（js 50241，声明消费） */
declare function isMediaPath(path: string): boolean;
/** 原 Uk：日志用 source 摘要 */
declare function summarizeSource(source: string): string;

/** 原 dVe（js 50542）：全图片段落 → 画廊组容器 */
export function MarkdownParagraphWithImageGallery({ children, node, ...rest }: MarkdownElementBaseProps) {
  const elements = React.Children.toArray(children).filter((child) => typeof child !== `string` || child.trim().length > 0);
  return elements.length >= 2 &&
    elements.every((child) => React.isValidElement(child) && (child.props as { node?: { tagName?: string } }).node?.tagName === `img`) ? (
    <ImageGalleryGroup data-markdown-image-gallery="">{elements}</ImageGalleryGroup>
  ) : (
    <p {...rest}>{children}</p>
  );
}

/* ============================================================================
 * 11. MarkdownRenderer 主体（原 cj，js 51688–51856 / jsx 46461，displayName=MessageResponse）
 * ----------------------------------------------------------------------------
 * 装配链：cj → xHe(错误边界) → Pre(Streamdown) →
 *   StreamdownContext/PluginsContext/…（MarkdownContext.tsx 五 Provider 树）→
 *   components 自定义块渲染器（本文件 §8/§9/§10）+ plugins.code=shiki（§3）。
 * ==========================================================================*/

export interface MarkdownRendererProps {
  className?: string;
  streaming?: boolean;
  onOpenCodeViewer?: (request: {
    type: `file`;
    title: string;
    path: string;
    workspacePath?: string | null;
    workspaceIdentity?: string | null;
    workspaceRemoteSessionId?: string | null;
  }) => void;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenExternalUrl?: (url: string) => void;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  streamingAnimationKey?: unknown;
  children?: React.ReactNode;
}

interface AnchorRendererProps {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  node?: unknown;
}

/** 原 cj（js 51688 / jsx 46461） */
export const MarkdownRenderer = React.memo(
  ({
    className,
    streaming = false,
    onOpenCodeViewer,
    onOpenFileLink,
    onOpenExternalUrl,
    workspacePath,
    workspaceIdentity,
    workspaceRemoteSessionId,
    theme = `system`,
    codePreviewSettings = DEFAULT_CODE_PREVIEW_SETTINGS,
    children,
  }: MarkdownRendererProps) => {
    const fallbackText = React.useMemo(() => childrenToText(children), [children]);
    const markdown = React.useMemo(() => escapeStrayMathDollars(collapseSeparatedImageBlocks(fallbackText)), [fallbackText]);
    const renderStreaming = streaming;
    const mode = resolveStreamdownMode(renderStreaming);
    const wrapperClass = Z(
      `size-full text-ui-base leading-[1.75] tracking-wide [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`,
      className,
    );
    const outerClass = Z(wrapperClass, `whitespace-pre-wrap break-words`);
    const resetKey = React.useMemo(
      () => (renderStreaming ? `streaming:${mode}` : `${mode}:${fnv1aLengthHash(markdown)}`),
      [renderStreaming, mode, markdown],
    );
    const scope = React.useMemo(
      () => ({ markdownLength: markdown.length, mode, renderStreaming }),
      [renderStreaming, mode, markdown.length],
    );
    const codeBlockTheme = React.useMemo(() => resolveCodeBlockTheme(theme, codePreviewSettings), [codePreviewSettings, theme]);
    const shikiThemePair = React.useMemo(
      () => [codePreviewSettings.lightTheme, codePreviewSettings.darkTheme],
      [codePreviewSettings.lightTheme, codePreviewSettings.darkTheme],
    );
    const streamdownKey = React.useMemo(
      () =>
        codeBlockScopeKey({
          codeBlockTheme,
          fontSizePx: codePreviewSettings.fontSizePx,
          workspacePath,
          workspaceIdentity,
          workspaceRemoteSessionId,
          wrapLongLines: codePreviewSettings.wrapLongLines,
        }),
      [codeBlockTheme, codePreviewSettings.fontSizePx, codePreviewSettings.wrapLongLines, workspacePath, workspaceIdentity, workspaceRemoteSessionId],
    );
    return (
      <MarkdownRenderErrorBoundary className={outerClass} fallbackText={fallbackText} resetKey={resetKey} scope={scope}>
        <Streamdown
          key={streamdownKey}
          className={wrapperClass}
          mode={mode}
          components={React.useMemo(
            () => ({
              a: ({ children: anchorChildren, className: anchorClass, href, node }: AnchorRendererProps) => {
                const rawHref = typeof href === `string` ? href : ``;
                const link = resolveWorkspaceFileLink(workspacePath, rawHref);
                if (link && (onOpenFileLink || onOpenCodeViewer)) {
                  const meta = resolveFileMeta(link.path);
                  const label = meta.fileName || baseName(link.path);
                  const text = trimChildrenText(anchorChildren) || label;
                  const model = buildFileLinkModel({
                    href: rawHref,
                    path: link.path,
                    label: text,
                    workspacePath,
                    workspaceIdentity,
                    workspaceRemoteSessionId,
                  });
                  return (
                    <FileLinkWithContextMenu
                      className={anchorClass}
                      fileIconSrc={model.pathKind === `directory` ? FOLDER_ICON_SRC : meta.fileIconSrc}
                      fileLink={model}
                      onOpen={() => {
                        if (onOpenFileLink) {
                          onOpenFileLink(model);
                          return;
                        }
                        onOpenCodeViewer?.({
                          type: `file`,
                          title: baseName(link.path),
                          path: link.path,
                          workspacePath,
                          workspaceIdentity,
                          workspaceRemoteSessionId,
                        });
                      }}
                    />
                  );
                }
                return isHttpUrl(rawHref) && onOpenExternalUrl ? (
                  <ExternalLinkWithContextMenu className={anchorClass} href={rawHref} onOpenExternalUrl={onOpenExternalUrl}>
                    {anchorChildren}
                  </ExternalLinkWithContextMenu>
                ) : (
                  <span className={Z(PLAIN_LINK_CLASS, anchorClass)} title={rawHref || undefined}>
                    {anchorChildren}
                  </span>
                );
              },
              img: (props: MarkdownImageProps) => <MarkdownImage {...props} workspacePath={workspacePath} />,
              p: MarkdownParagraphWithImageGallery,
              h1: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h1`} />,
              h2: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h2`} />,
              h3: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h3`} />,
              h4: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h4`} />,
              h5: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h5`} />,
              h6: (props: MarkdownElementBaseProps) => <MarkdownHeading {...props} headingLevel={`h6`} />,
              strong: ({ className: strongClass, node, ...strongRest }: MarkdownElementBaseProps) => (
                <strong className={Z(`font-medium`, strongClass)} {...strongRest} />
              ),
              code: ({ children: codeChildren, className: codeClass, node, ...codeRest }: MarkdownElementBaseProps) => {
                if (!(`data-block` in codeRest)) {
                  // 行内代码
                  return (
                    <code
                      className={Z(`rounded-md bg-markdown-inline-code/50 mx-0.5 px-1.5 py-0.5 font-mono text-ui-sm`, codeClass)}
                      {...codeRest}
                    >
                      {codeChildren}
                    </code>
                  );
                }
                // 块级代码：ZCode 代码块容器（mermaid 门控 + shiki 高亮体）
                const code = trimTrailingNewlines(childrenToText(codeChildren));
                const language = languageFromClass(codeClass);
                return (
                  <ZCodeCodeBlock
                    className={`my-4 border border-border bg-card`}
                    code={code}
                    enableSyntaxHighlighting={!renderStreaming}
                    fontSizePx={codePreviewSettings.fontSizePx}
                    language={language}
                    renderMermaid={!renderStreaming}
                    theme={codeBlockTheme}
                    appTheme={theme}
                    wrapLongLines={codePreviewSettings.wrapLongLines}
                  >
                    <ZCodeCodeBlockHeader className={`pl-3 pr-2 pt-2`} language={language} />
                  </ZCodeCodeBlock>
                );
              },
              blockquote: MarkdownBlockquote,
              li: MarkdownLi,
              ol: MarkdownOl,
              table: MarkdownTableStickyScrollbar as unknown as React.ComponentType<never>,
              tbody: MarkdownTbody,
              td: MarkdownTd,
              th: MarkdownTh,
              thead: MarkdownThead,
              tr: MarkdownTr,
              ul: MarkdownUl,
            }),
            [codeBlockTheme, codePreviewSettings.fontSizePx, codePreviewSettings.wrapLongLines, onOpenFileLink, onOpenCodeViewer, onOpenExternalUrl, renderStreaming, theme, workspacePath, workspaceIdentity, workspaceRemoteSessionId],
          )}
          parseIncompleteMarkdown={streaming}
          linkSafety={LINK_SAFETY_DISABLED}
          plugins={STREAMDOWN_PLUGINS}
          controls={STREAMDOWN_CONTROLS}
          rehypePlugins={REHYPE_PLUGINS}
          shikiTheme={shikiThemePair}
          animated={false}
          isAnimating={false}
        >
          {markdown}
        </Streamdown>
      </MarkdownRenderErrorBoundary>
    );
  },
  (prev, next) =>
    prev.children === next.children &&
    next.streaming === prev.streaming &&
    next.streamingAnimationKey === prev.streamingAnimationKey &&
    next.workspacePath === prev.workspacePath &&
    next.workspaceIdentity === prev.workspaceIdentity &&
    next.workspaceRemoteSessionId === prev.workspaceRemoteSessionId &&
    next.theme === prev.theme &&
    next.codePreviewSettings === prev.codePreviewSettings &&
    next.onOpenCodeViewer === prev.onOpenCodeViewer &&
    next.onOpenFileLink === prev.onOpenFileLink &&
    next.onOpenExternalUrl === prev.onOpenExternalUrl,
);
MarkdownRenderer.displayName = `MessageResponse`;

/* ============================================================================
 * 12. 与 Conversation 行的耦合点（原 hvt，js 112357 / jsx 95832）
 * ----------------------------------------------------------------------------
 * AssistantMessageRow（Conversation.tsx 已重建）以如下契约消费本组件：
 *   <MarkdownRenderer streaming={row.state === 'streaming'}
 *     workspacePath/workspaceIdentity/workspaceRemoteSessionId={context.*}
 *     theme={context.theme} codePreviewSettings={context.codePreviewSettings}
 *     onOpenCodeViewer={context.onOpenCodeViewer}
 *     onOpenFileLink={context.onOpenFileLink}
 *     onOpenExternalUrl={context.onOpenBrowserUrl}>{row.text}</MarkdownRenderer>
 * 其余消费面：zAt RepoWikiPane 分帧渲染（js 133196）、_j CodingPlan 信息弹窗
 * （js 52014）、diff/preview 卡群（99830/106077/107716/108521）、S6 帮助菜单等。
 * ==========================================================================*/

export interface AssistantRowRenderContext {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  onOpenCodeViewer?: MarkdownRendererProps["onOpenCodeViewer"];
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenBrowserUrl?: (url: string) => void;
  compactForRemoteControl?: boolean;
  sessionId?: string;
}

/** 原 hvt 的 markdown 装配段（仅文档化耦合契约；行组件本体见 Conversation.tsx） */
export function renderAssistantRowMarkdown(
  row: { rowId: number; state: string; text: string },
  context: AssistantRowRenderContext,
): React.ReactElement {
  return (
    <div data-conversation-selectable="true" className={`w-full text-ui-base`}>
      <MarkdownRenderer
        streaming={row.state === `streaming`}
        workspacePath={context.workspacePath}
        workspaceIdentity={context.workspaceIdentity}
        workspaceRemoteSessionId={context.workspaceRemoteSessionId}
        theme={context.theme}
        codePreviewSettings={context.codePreviewSettings}
        onOpenCodeViewer={context.onOpenCodeViewer}
        onOpenFileLink={context.onOpenFileLink}
        onOpenExternalUrl={context.onOpenBrowserUrl}
      >
        {row.text}
      </MarkdownRenderer>
    </div>
  );
}
