// A1-P1-B14：代码面族逐字重建（styles js 48572–48872 + 107112–107114 + 107180–107215，共 340 行，88 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B13 留批第 2 项 CodeSurface 族真身收割）。
// 消费面 = AutomationViewBlocks.ts 6 declare + ConversationToolViews.tsx 6 declare → 真实 import 收敛；
//   CTV 手写 NodeReplToolView 三处 <CodeSurface cardSurface …> 改指 CodeSurfaceCard（原 w$，束真身卡面包装体）。
// 逐字证明：/tmp/a1r0-p1/p14/p14-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p14-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p14/CodeSurfaceBlocks.seam-log.txt，均带〔A1-P1-B14〕。
// 区段切分墓碑：左界 $ze@48572（markdown 组件域右界邻接）；yk@48873（context-menu 域）为右界。
//   卡面包装域：Dmt var 链@107112（NodeRepl 族域内，语句不可分，Dmt/kmt 随段携带，消费面留批）；w$@107180。
// 深域只消费披露：MO/BO（代码/mermaid 面板域 47549/47895）未实体化 → 叶内 declare（跨域判例，留批；
//   MO 体依赖 vendored 高亮引擎原语族，BO 依赖 mermaid 渲染面，均需专批）。
//   〔A1-P1-B17〕Qze（48269）declare 收敛 → modules/PreviewCards MermaidFullscreenDialog（canonical 既录）。
// 〔A1-P1-B15〕收敛：Vc/zc → ./FileIconBlocks 真实 import；NO/Oze/Mze/Pze → modules/MarkdownIntegration 真实 import（别名）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）| Z→cn（UtilsCn）| J→logger（SkillStore）
//   X→Button（modules/button）| Ia→Tooltip（UsageStatsUiParts InfoTooltip；usageStatsUiParts chunk u 导出）
//   Tbe→IconTextWrap（styles 27904 Sa('text-wrap')）| mv→IconMaximize2（27394 Sa('maximize-2')）
//   M_→IconCheck（26849 Sa('check')）| W_→IconCopy（26974 Sa('copy')）| xbe→IconSquareMousePointer（27852 Sa('square-mouse-pointer')）（均 lucide-react；A0-S3b 判例）
//   【代码面族 48572–48872】
//   $ze→CODE_SURFACE_DISPLAY_FILE_TABLE（48572）| eBe→resolveDisplayFileName（48601）| tBe→useDocumentVisibilityVersion（48605）
//   fk→CODE_SURFACE_CONTEXT（48623）| nBe→CodeSurfaceRoot（48630）| pk→CodeSurfaceHeader（48640）
//   mk→CodeSurfaceTitle（48672）| rBe→CodeSurfaceLanguageTag（48674）| hk→CodeSurfaceActions（48676）
//   gk→CodeSurface（48682）| _k→CodeSurfaceWrapButton（48774）| iBe→CodeSurfaceMermaidPreviewButton（48801）| vk→CodeSurfaceCopyButton（48823）
//   【CodeSurface 卡面包装域 107112–107114 + 107180–107215】
//   Dmt→NODE_REPL_TOOL_ICON（107112，NodeRepl 族符号随语句携带）| Omt→EAGER_CONTENT_VISIBILITY_STYLE（107113）
//   kmt→PLAIN_TEXT_OUTPUT_MAX_LENGTH（107114，NodeRepl 族符号随语句携带）| w$→CodeSurfaceCard（107180）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { logger } from '../../modules/SkillStore'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { Button } from '../../modules/button'; // 原 X（button-laUijeDG.js t 导出）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（usageStatsUiParts-CiR7YEhh.js u 导出）
import { TextWrap as IconTextWrap, Maximize2 as IconMaximize2, Check as IconCheck, Copy as IconCopy, SquareMousePointer as IconSquareMousePointer } from 'lucide-react'; // 原 Tbe/mv/M_/W_/xbe（styles vendored Sa；A0-S3b 判例）
import { FileIcon, resolveFileIconMeta } from './FileIconBlocks'; // 〔A1-P1-B15〕原 Vc/zc（styles 5198/5198 逐字实体化；declare 收敛）
import { isMermaidLanguage, isMermaidBlock as shouldRenderMermaidPreview, documentVisibilityState as resolveDocumentVisibilityState, mermaidAutoRenderGate as evaluateMermaidPreviewRender, MERMAID_INLINE_PLUGIN, buildMermaidConfig, describeMermaidError, enqueueMermaidRender, fnv1aBase36, resolveMermaidConfigBase, resolveMermaidThemeVars } from '../../modules/MarkdownIntegration'; // 〔A1-P1-B15〕原 NO/Oze/Mze/Pze（mermaid 门控域 47709–47894 既录 canonical；declare 收敛）；〔A1-R99〕+mermaid 内嵌渲染七件（原 Fze/zze/Hze/Lze/RO/Bze/Vze，BO 深依赖补导出改指）
import { MermaidFullscreenDialog as MermaidPreviewDialog } from '../../modules/PreviewCards'; // 〔A1-P1-B17〕原 Qze（48269）canonical（components/preview/PreviewCards@469 逐字；SettingsCodeBlock 同符改指先例）；R1 判例别名保留调用名——下方 declare 删碑改指
import { SpinnerIcon } from '../../modules/ImeComposition'; // 〔A1-R99〕原 M（imeComposition-DEYFkwWm.js w 导出；LoaderCircle 域外消费别名，ImeComposition@285）

/* ── tombstone〔A1-P1-B15〕：文件图标二 declare（FileIcon/resolveFileIconMeta，原 Vc/zc）删除——束真身
 * 5243/5198 已逐字实体化于 ./FileIconBlocks（文件图标域 5064–5267 收割，B14 留批第 3 项）。消费面逐字不变。 ── */
/* ── tombstone〔A1-P1-B15〕：mermaid 门控四 declare（原 NO/Oze/Mze/Pze）删除——束真身域 47709–47894 既录
 * modules/MarkdownIntegration（isMermaidLanguage/isMermaidBlock/documentVisibilityState/mermaidAutoRenderGate，
 * A0 期语义重建在案；型面兼容：shouldRender/reason/metrics 返回面逐字段吻合）。别名导入保持本叶逐字体不变。 ── */
/* ── tombstone〔A1-R100〕：declare CodeSurfaceCodePane（原 MO 47549–47708）删除——逐字实体化于下方。
 *    vendor 裁定依据：VENDOR-MANIFEST-LIBS 148 号条目（R52 补登）——styles 46014–47548 + 47974–48571 =
 *    X09 code-view 引擎 vendored 区（vendor 体不转录），47549–47973 = app 包装带 first-party（MO/BO/Qze 三面板，
 *    BO 见 R99、Qze 见 P1-B17）。MO 消费的 15 枚 vendored 依赖按 KX@dnd-kit / R18 深依赖登记模式补边界 declare：
 *    $Re DiffViewer（FileRewindDialogDeep@139 同名先例）+ Sze/Cze 注解 UI + ize…jO 助手带 12 件。 ── */
/* ── X09 vendor 边界占位 declare（原 47063–47461 域，KX 模式；类型面 = MO 消费面） ── */
/** 原 $Re（47063，X09 vendor 边界）：DiffViewer 代码视图渲染器 */
declare const DiffViewer: React.FC<any>;
/** 原 Sze（47462，X09 vendor 边界）：草稿评论输入滑杆 */
declare const DraftCommentComposer: React.FC<any>;
/** 原 Cze（47518，X09 vendor 边界）：评论行（删除入口） */
declare const CodeCommentRow: React.FC<any>;
/** 原 uze（47372，X09 vendor 边界）：代码评论缺省文案组 */
declare const CODE_SURFACE_COMMENT_LABELS: Record<string, string>;
/** 原 dze（47382，X09 vendor 边界）：gutter 槽位补丁 CSS（右置按钮 + tooltip 伪元素） */
declare const CODE_SURFACE_GUTTER_CSS: string;
/** 原 yze（47422，X09 vendor 边界）：预览文件模型（name/contents/lang/cacheKey） */
declare function createPreviewFileModel(e: any): any;
/** 原 kO（47433，X09 vendor 边界）：行区间归一（start ≤ end） */
declare function normalizeLineRange(e: any): any;
/** 原 AO（47436，X09 vendor 边界）：行选择 → 绝对行区间（首行号偏移） */
declare function lineSelectionToRange(e: any, t: any): any;
/** 原 bze（47439，X09 vendor 边界）：绝对区间 → 相对选择面 */
declare function toSelectedLines(e: any, t: any): any;
/** 原 xze（47443，X09 vendor 边界）：区间选中文本抽取 */
declare function extractRangeText(e: any, t: any, n: any): string;
/** 原 DO（47415，X09 vendor 边界）：gutter 按钮 tooltip 批量施加 */
declare function applyGutterUtilityTooltips(e: any, t: any): void;
/** 原 OO（47419，X09 vendor 边界）：shadow root 递归遍历 */
declare function forEachShadowRoot(e: any, t: any): void;
/** 原 cze（47354，X09 vendor 边界）：主题 → colorScheme（documentElement.dark 兜底） */
declare function resolveCodeColorScheme(e: any): string;
/** 原 fze（47390，X09 vendor 边界）：CSS 变量值 JSON 转义 */
declare function jsonStringifyForCss(e: any): string;
/** 原 lze（47363，X09 vendor 边界）：scroll 容器 ref 转发（函数/对象双形） */
declare function forwardScrollContainer(e: any, t: any): void;
/* ── 原 MO（js 47549–47708）→ CodeSurfaceCodePane：代码面板（高亮/行号/换行/注释域）〔A1-R100 逐字实体化〕 ── */
function CodeSurfaceCodePane({
  code: e,
  enableSyntaxHighlighting: t = !0,
  language: n,
  showLineNumbers: r = !0,
  theme: i,
  wrapLongLines: a = !1,
  fontSizePx: o = 12,
  firstLineNumber: s = 1,
  comments: c = [],
  enableLineSelection: l = !1,
  enableGutterUtility: u = !1,
  labels: d,
  onSubmitCodeComment: f,
  onDeleteCodeComment: p,
  scrollContainerRef: m,
  className: h,
  style: g,
  ..._
}: any) {
  let v = (0, React.useRef)(null as any), // 〔A1-R100〕型缝：容器 ref 束原形 null 初始化
    [y, b] = (0, React.useState)(null),
    [x, S] = (0, React.useState)(``),
    C = !!f,
    w = C && l,
    T = C && u,
    E = (0, React.useMemo)(() => ({ ...CODE_SURFACE_COMMENT_LABELS, ...d }), [d]),
    D = (0, React.useMemo)(
      () => createPreviewFileModel({ code: e, enableSyntaxHighlighting: t, language: n, theme: i }),
      [e, t, n, i],
    ),
    O = (0, React.useMemo)(() => {
      let e = [];
      for (let t of c) {
        let n = normalizeLineRange(t).endLine - s + 1;
        n < 1 || e.push({ lineNumber: n, metadata: { kind: `comment`, comment: t } });
      }
      return (
        C &&
          y &&
          e.push({ lineNumber: normalizeLineRange(y).endLine - s + 1, metadata: { kind: `draft`, range: y } }),
        e
      );
    }, [y, C, c, s]),
    k = (0, React.useMemo)(() => (C && y ? toSelectedLines(y, s) : null), [y, C, s]),
    A = (0, React.useCallback)(
      (e: any) => {
        !C || !e || (b(lineSelectionToRange(e, s)), S(``));
      },
      [C, s],
    ),
    j = (0, React.useCallback)(
      (e: any) => {
        C && (b(lineSelectionToRange(e, s)), S(``));
      },
      [C, s],
    ),
    M = (0, React.useCallback)(() => {
      if (!y) return;
      let t = extractRangeText(e, s, y);
      t.trim() && (f?.({ range: normalizeLineRange(y), selectedText: t, comment: x.trim() }), b(null), S(``));
    }, [y, e, x, s, f]);
  (0, React.useEffect)(() => {
    if (!T || !v.current) return;
    let e = v.current,
      t: any[] = [], // 〔A1-R100〕型缝：MutationObserver 数组束原形无型空数组
      n = new WeakSet(),
      r = 0,
      i = (e: any) => {
        if (n.has(e)) return;
        n.add(e);
        let r = new MutationObserver(o);
        (r.observe(e, { childList: !0, subtree: !0 }), t.push(r));
      },
      a = () => {
        (applyGutterUtilityTooltips(e, E.addCommentTooltip),
          forEachShadowRoot(e, (e: any) => { // 〔A1-R100〕型缝：shadow root 回调参束原形隐式
            (i(e), applyGutterUtilityTooltips(e, E.addCommentTooltip));
          }));
      };
    function o() {
      r ||= window.requestAnimationFrame(() => {
        ((r = 0), a());
      });
    }
    return (
      i(e),
      a(),
      o(),
      () => {
        r && window.cancelAnimationFrame(r);
        for (let e of t) e.disconnect();
      }
    );
  }, [T, E.addCommentTooltip]);
  let N = (0, React.useMemo)(
      () => ({
        disableFileHeader: !0,
        disableLineNumbers: !r,
        overflow: a ? `wrap` : `scroll`,
        theme: i,
        enableLineSelection: w,
        enableGutterUtility: T,
        lineHoverHighlight: w || T ? `both` : `disabled`,
        onLineSelectionEnd: A,
        onGutterUtilityClick: T ? j : void 0,
        unsafeCSS: CODE_SURFACE_GUTTER_CSS,
      }),
      [T, w, j, A, r, i, a],
    ),
    P = (0, React.useMemo)(
      () => ({
        colorScheme: resolveCodeColorScheme(i),
        "--diffs-bg": `var(--color-background)`,
        "--diffs-light-bg": `var(--color-background)`,
        "--diffs-dark-bg": `var(--color-background)`,
        "--diffs-font-size": `${o}px`,
        "--code-comment-add-tooltip": jsonStringifyForCss(T ? E.addCommentTooltip : ``),
        ...g,
      }),
      [T, o, E.addCommentTooltip, g, i],
    );
  return (0, $.jsx)(`div`, {
    ref: (0, React.useCallback)(
      (e: any) => {
        ((v.current = e), forwardScrollContainer(m, e));
      },
      [m],
    ),
    className: cn(`h-full w-full overflow-auto`, h),
    "data-language": n,
    style: P,
    ..._,
    children: (0, $.jsx)(
      DiffViewer,
      {
        file: D,
        options: N,
        lineAnnotations: O,
        selectedLines: k,
        className: `min-h-full w-full`,
        style: P,
        renderAnnotation: (e: any) => // 〔A1-R100〕型缝：注解渲染回调参束原形隐式（DiffViewer 为 FC<any>，无上下文型推）
          e.metadata.kind === `draft`
            ? (0, $.jsx)(DraftCommentComposer, {
                range: e.metadata.range,
                labels: E,
                value: x,
                onValueChange: S,
                onSubmit: M,
                onCancel: () => {
                  (b(null), S(``));
                },
              })
            : (0, $.jsx)(CodeCommentRow, { comment: e.metadata.comment, labels: E, onDelete: p }),
      },
      D.cacheKey,
    ),
  });
}
/* ── tombstone〔A1-R99〕：declare CodeSurfaceMermaidPane（原 BO 47895–47973）删除——逐字实体化于下方。
 *    深依赖全改指树内 canonical：G→useIntlContext（文件头既有）| Vze→resolveMermaidThemeVars | Bze→resolveMermaidConfigBase
 *    | zze→buildMermaidConfig | RO→fnv1aBase36 | Lze→enqueueMermaidRender | Fze→MERMAID_INLINE_PLUGIN
 *    | Hze→describeMermaidError（以上七件 components/markdown/MarkdownIntegration，本批补导出）
 *    | M→SpinnerIcon（modules/imeComposition）| J→logger | Z→cn（文件头既有）。型缝二处见行内注。
 *    A0 版 MermaidInlinePreview（同 BO，SettingsCodeBlock 消费）双轨并存登记 W5 对账。 ── */
/* ── 原 BO（js 47895–47973）→ CodeSurfaceMermaidPane：mermaid 内嵌预览（loading → svg / 失败降级 pre）〔A1-R99 逐字实体化〕 ── */
function CodeSurfaceMermaidPane({
  code: e,
  className: t,
  theme: n = `system`,
  onOpenPreview: r,
  onPreviewSvgChange: i,
  ...a
}: any) {
  let { intl: o } = useIntlContext(),
    s = resolveMermaidThemeVars(n),
    c = (0, React.useId)().replace(/[^a-zA-Z0-9_-]/g, ``),
    l = e.trim(),
    u = resolveMermaidConfigBase(n),
    d = `${n}:${u}:${s}`,
    f = (0, React.useMemo)(() => buildMermaidConfig(u), [u, d]),
    p = (0, React.useMemo)(() => `${d}:${fnv1aBase36(l)}`, [d, l]),
    [m, h] = (0, React.useState)({ status: `loading` } as any); // 〔A1-R99〕型缝：三态联合（loading/plaintext/ready+svg）束原形单态初始化
  return (
    (0, React.useEffect)(() => {
      let e = !1;
      if (!l) {
        (h({ status: `plaintext` }), i?.(null));
        return;
      }
      (h({ status: `loading` }), i?.(null));
      let t = `zcode-mermaid-${c}-${fnv1aBase36(p)}`;
      return (
        enqueueMermaidRender(async () => MERMAID_INLINE_PLUGIN.getMermaid(f).render(t, l))
          .then(({ svg: t }) => {
            e || (h({ status: `ready`, svg: t }), i?.(t));
          })
          .catch((t) => {
            let n = describeMermaidError(t);
            (logger.debug(`[MermaidBlock] Mermaid 渲染失败`, { error: n, codeLength: l.length }),
              e || (h({ status: `plaintext` }), i?.(null)));
          }),
        () => {
          ((e = !0), i?.(null));
        }
      );
    }, [o, f, i, c, p, l]),
    (0, $.jsx)(`div`, {
      className: cn(`group/mermaid relative min-h-32 w-full bg-card`, t),
      "data-mermaid-block": ``,
      ...a,
      children: (0, $.jsxs)(`div`, {
        className: `max-h-[420px] overflow-auto p-3 text-foreground`,
        children: [
          m.status === `loading`
            ? (0, $.jsxs)(`div`, {
                className: `flex min-h-28 items-center justify-center gap-2 text-foreground-subtle text-ui-base`,
                children: [
                  (0, $.jsx)(SpinnerIcon, { className: `size-4 animate-spin` }),
                  (0, $.jsx)(`span`, {
                    children: o.formatMessage({ id: `codeBlock.mermaid.loading` }),
                  }),
                ],
              })
            : null,
          m.status === `plaintext`
            ? (0, $.jsx)(`pre`, {
                className: `m-0 min-h-28 min-w-max bg-transparent font-mono text-foreground text-ui-base leading-relaxed`,
                children: e,
              })
            : null,
          m.status === `ready`
            ? (0, $.jsx)(`div`, {
                "aria-label": o.formatMessage({ id: `codeBlock.mermaid.ariaLabel` }),
                className: `flex min-h-28 min-w-max items-center justify-center [&_svg]:h-auto [&_svg]:max-w-none`,
                dangerouslySetInnerHTML: { __html: m.svg },
                onDoubleClick: r,
                role: `img`,
              })
            : null,
        ],
      }),
    })
  );
}
/* ── tombstone〔A1-P1-B17〕：declare MermaidPreviewDialog（原 Qze，48269）删除 → 一符一家收敛改指
 * canonical components/preview/PreviewCards MermaidFullscreenDialog（48269 逐字，经 modules/PreviewCards
 * 转导出；SettingsCodeBlock 同符改指先例）。消费面实证（1 处，别名保调用名逐字不变）：本文件
 * CodeSurface 卡面 @246（x && h 守卫逐字保留；h 束型 never 投射 → canonical svg: string 相容）。 ── */

/* ── 代码面族（styles 48572–48872） ── */
var CODE_SURFACE_DISPLAY_FILE_TABLE: Record<string, string> = {
  bash: `script.sh`,
  cjs: `index.cjs`,
  css: `style.css`,
  go: `main.go`,
  html: `index.html`,
  javascript: `index.js`,
  js: `index.js`,
  jsx: `component.jsx`,
  json: `data.json`,
  markdown: `README.md`,
  md: `README.md`,
  mermaid: `diagram.mmd`,
  mmd: `diagram.mmd`,
  mjs: `index.mjs`,
  python: `main.py`,
  py: `main.py`,
  rs: `main.rs`,
  rust: `main.rs`,
  sh: `script.sh`,
  shell: `script.sh`,
  toml: `config.toml`,
  ts: `index.ts`,
  tsx: `component.tsx`,
  typescript: `index.ts`,
  yaml: `config.yaml`,
  yml: `config.yml`,
  zsh: `script.zsh`,
};
function resolveDisplayFileName(e: any, t: any) {
  let n = e.trim().toLowerCase();
  return t ?? CODE_SURFACE_DISPLAY_FILE_TABLE[n] ?? `code.${n || `txt`}`;
}
function useDocumentVisibilityVersion(e: any) {
  let [t, n] = (0, React.useState)(0);
  return (
    (0, React.useEffect)(() => {
      if (!e || typeof document > `u` || typeof document.addEventListener != `function`) return;
      let t = () => {
        n((e) => e + 1);
      };
      return (
        document.addEventListener(`visibilitychange`, t),
        () => {
          document.removeEventListener(`visibilitychange`, t);
        }
      );
    }, [e]),
    t
  );
}
var CODE_SURFACE_CONTEXT = (0, React.createContext)({
    code: ``,
    mermaidPreviewAvailable: !1,
    openMermaidPreview: () => {},
    toggleWrapLongLines: () => {},
    wrapLongLines: !1,
  }),
  CodeSurfaceRoot = ({ className: e, language: t, style: n, ...r }: any) =>
    (0, $.jsx)(`div`, {
      className: cn(
        `group relative w-full overflow-hidden rounded-xl bg-background text-foreground`,
        e,
      ),
      "data-language": t,
      style: { containIntrinsicSize: `auto 200px`, contentVisibility: `auto`, ...n },
      ...r,
    }),
  CodeSurfaceHeader = ({ children: e, className: t, displayFile: n, language: r, ...i }: any) => {
    let a = r?.trim() || `text`,
      o = resolveFileIconMeta(resolveDisplayFileName(a, n));
    return (0, $.jsx)(`div`, {
      className: cn(
        `flex items-center justify-between gap-3 px-3 py-2 text-ui-base text-muted-foreground`,
        t,
      ),
      ...i,
      children:
        e ??
        (0, $.jsxs)($.Fragment, {
          children: [
            (0, $.jsxs)(CodeSurfaceTitle, {
              className: `min-w-0`,
              children: [
                (0, $.jsx)(FileIcon, { src: o.fileIconSrc, size: 16, className: `shrink-0` }),
                (0, $.jsx)(CodeSurfaceLanguageTag, { className: `truncate lowercase`, children: a }),
              ],
            }),
            (0, $.jsxs)(CodeSurfaceActions, {
              children: [
                isMermaidLanguage(a)
                  ? (0, $.jsx)(CodeSurfaceMermaidPreviewButton, {})
                  : (0, $.jsx)(CodeSurfaceWrapButton, { "aria-label": `Wrap lines`, title: `Wrap lines` }),
                (0, $.jsx)(CodeSurfaceCopyButton, { "aria-label": `Copy code`, title: `Copy code` }),
              ],
            }),
          ],
        }),
    });
  },
  CodeSurfaceTitle = ({ children: e, className: t, ...n }: any) =>
    (0, $.jsx)(`div`, { className: cn(`flex items-center gap-2`, t), ...n, children: e }),
  CodeSurfaceLanguageTag = ({ children: e, className: t, ...n }: any) =>
    (0, $.jsx)(`span`, { className: cn(`font-mono`, t), ...n, children: e }),
  CodeSurfaceActions = ({ children: e, className: t, ...n }: any) =>
    (0, $.jsx)(`div`, {
      className: cn(`-my-1 -mr-1 flex items-center gap-1`, t),
      ...n,
      children: e,
    }),
  CodeSurface = ({
    code: e,
    enableSyntaxHighlighting: t = !0,
    language: n,
    showLineNumbers: r = !1,
    theme: i,
    appTheme: a,
    wrapLongLines: o = !1,
    fontSizePx: s = 14,
    renderMermaid: c = !0,
    className: l,
    children: u,
    ...d
  }: any) => {
    let { intl: f } = useIntlContext(),
      [p, m] = (0, React.useState)(o),
      [h, g] = (0, React.useState)(null),
      [_, v] = (0, React.useState)(!1),
      y = c && shouldRenderMermaidPreview(n, e),
      b = (0, React.useMemo)(
        () => (y ? evaluateMermaidPreviewRender(e, { documentVisibilityState: resolveDocumentVisibilityState() }) : null),
        [y, e, useDocumentVisibilityVersion(y)],
      ),
      x = y && b?.shouldRender === !0;
    (0, React.useEffect)(() => {
      m(o);
    }, [o]);
    let S = (0, React.useCallback)(() => {
        m((e: any) => !e);
      }, []),
      C = (0, React.useCallback)(() => {
        v(!0);
      }, []);
    ((0, React.useEffect)(() => {
      x || (g(null), v(!1));
    }, [x]),
      (0, React.useEffect)(() => {
        !b ||
          b.shouldRender ||
          logger.debug(`[CodeBlock] Mermaid 自动渲染跳过`, { reason: b.reason, ...b.metrics });
      }, [b]));
    let w = (0, React.useMemo)(
      () => ({
        code: e,
        mermaidPreviewAvailable: !!h,
        openMermaidPreview: C,
        toggleWrapLongLines: S,
        wrapLongLines: p,
      }),
      [e, p, h, C, S],
    );
    return (0, $.jsx)(CODE_SURFACE_CONTEXT.Provider, {
      value: w,
      children: (0, $.jsxs)(CodeSurfaceRoot, {
        className: l,
        language: n,
        ...d,
        children: [
          u,
          (0, $.jsx)(`div`, {
            className: `p-2 pt-0 pb-3`,
            children: x
              ? (0, $.jsx)(CodeSurfaceMermaidPane, { code: e, theme: a, onOpenPreview: C, onPreviewSvgChange: g })
              : (0, $.jsx)(CodeSurfaceCodePane, {
                  code: e,
                  enableSyntaxHighlighting: t,
                  language: n,
                  showLineNumbers: r,
                  theme: i,
                  wrapLongLines: p,
                  className: `bg-transparent`,
                  fontSizePx: s,
                  style: {
                    "--diffs-bg": `var(--color-card)`,
                    "--diffs-light-bg": `var(--color-card)`,
                    "--diffs-dark-bg": `var(--color-card)`,
                    "--diffs-gap-block": `0px`,
                  },
                }),
          }),
          x && h
            ? (0, $.jsx)(MermaidPreviewDialog, {
                open: _,
                onOpenChange: v,
                svg: h,
                title: f.formatMessage({ id: `codeBlock.mermaid.ariaLabel` }),
              })
            : null,
        ],
      }),
    });
  },
  CodeSurfaceWrapButton = ({
    "aria-label": e,
    children: t,
    className: n,
    onClick: r,
    title: i = `Wrap lines`,
    ...a
  }: any) => {
    let { toggleWrapLongLines: o, wrapLongLines: s } = (0, React.useContext)(CODE_SURFACE_CONTEXT);
    return (0, $.jsx)(Tooltip, {
      title: i,
      side: `top`,
      children: (0, $.jsx)(Button, {
        "aria-label": e ?? i,
        "aria-pressed": s,
        className: cn(`shrink-0`, s && `bg-muted`, n),
        onClick: (e: any) => {
          (r?.(e), e.defaultPrevented || o());
        },
        size: `icon-md`,
        type: `button`,
        variant: `ghost`,
        ...a,
        children: t ?? (0, $.jsx)(IconTextWrap, { className: `size-3.5` }),
      }),
    });
  },
  CodeSurfaceMermaidPreviewButton = ({ "aria-label": e, children: t, className: n, onClick: r, title: i, ...a }: any) => {
    let { intl: o } = useIntlContext(),
      { mermaidPreviewAvailable: s, openMermaidPreview: c } = (0, React.useContext)(CODE_SURFACE_CONTEXT),
      l = i ?? o.formatMessage({ id: `codeBlock.mermaid.openPreview` });
    return (0, $.jsx)(Tooltip, {
      title: l,
      side: `top`,
      children: (0, $.jsx)(Button, {
        "aria-label": e ?? l,
        className: cn(`shrink-0`, n),
        disabled: !s,
        onClick: (e: any) => {
          (r?.(e), e.defaultPrevented || c());
        },
        size: `icon-md`,
        type: `button`,
        variant: `ghost`,
        ...a,
        children: t ?? (0, $.jsx)(IconMaximize2, { className: `size-3.5` }),
      }),
    });
  },
  CodeSurfaceCopyButton = ({
    "aria-label": e,
    onCopy: t,
    onError: n,
    title: r = `Copy code`,
    timeout: i = 2e3,
    children: a,
    className: o,
    ...s
  }: any) => {
    let [c, l] = (0, React.useState)(!1),
      u = (0, React.useRef)(0),
      { code: d } = (0, React.useContext)(CODE_SURFACE_CONTEXT),
      f = (0, React.useCallback)(async () => {
        if (typeof window > `u` || !navigator?.clipboard?.writeText) {
          n?.(Error(`Clipboard API not available`));
          return;
        }
        try {
          c ||
            (await navigator.clipboard.writeText(d),
            l(!0),
            t?.(),
            (u.current = window.setTimeout(() => l(!1), i)));
        } catch (e) {
          n?.(e);
        }
      }, [d, t, n, i, c]);
    (0, React.useEffect)(
      () => () => {
        window.clearTimeout(u.current);
      },
      [],
    );
    let p = c ? IconCheck : IconCopy;
    return (0, $.jsx)(Tooltip, {
      title: r,
      side: `top`,
      children: (0, $.jsx)(Button, {
        "aria-label": e ?? r,
        className: cn(`shrink-0`, o),
        onClick: f,
        size: `icon-md`,
        type: `button`,
        variant: `ghost`,
        ...s,
        children: a ?? (0, $.jsx)(p, { className: `size-3.5` }),
      }),
    });
  };

/* ── CodeSurface 卡面包装域·var 链（styles 107112–107114） ── */
var NODE_REPL_TOOL_ICON = (0, $.jsx)(IconSquareMousePointer, { className: `size-4 shrink-0 text-foreground-subtle` }),
  EAGER_CONTENT_VISIBILITY_STYLE = { containIntrinsicSize: `none`, contentVisibility: `visible` },
  PLAIN_TEXT_OUTPUT_MAX_LENGTH = 160;

/* ── CodeSurface 卡面包装域·包装体（styles 107180–107215） ── */
function CodeSurfaceCard({
  cardSurface: e = !1,
  code: t,
  copyLabel: n,
  eagerLayout: r = !1,
  label: i,
  language: a,
  wrapLabel: o,
}: any) {
  return (0, $.jsx)(CodeSurface, {
    className: e ? `bg-card` : void 0,
    code: t,
    enableSyntaxHighlighting: a !== `log`,
    language: a,
    renderMermaid: !1,
    style: r ? EAGER_CONTENT_VISIBILITY_STYLE : void 0,
    wrapLongLines: !0,
    children: (0, $.jsxs)(CodeSurfaceHeader, {
      className: `pl-3 pr-2 pt-2`,
      children: [
        (0, $.jsx)(CodeSurfaceTitle, {
          children: (0, $.jsx)(`span`, {
            className: `text-ui-base font-medium text-foreground-subtle`,
            children: i,
          }),
        }),
        (0, $.jsxs)(CodeSurfaceActions, {
          children: [
            (0, $.jsx)(CodeSurfaceWrapButton, { "aria-label": o, title: o }),
            (0, $.jsx)(CodeSurfaceCopyButton, { "aria-label": n, title: n }),
          ],
        }),
      ],
    }),
  });
}

export { CODE_SURFACE_DISPLAY_FILE_TABLE, resolveDisplayFileName, useDocumentVisibilityVersion, CODE_SURFACE_CONTEXT, CodeSurfaceRoot, CodeSurfaceHeader, CodeSurfaceTitle, CodeSurfaceLanguageTag, CodeSurfaceActions, CodeSurface, CodeSurfaceWrapButton, CodeSurfaceMermaidPreviewButton, CodeSurfaceCopyButton, NODE_REPL_TOOL_ICON, EAGER_CONTENT_VISIBILITY_STYLE, PLAIN_TEXT_OUTPUT_MAX_LENGTH, CodeSurfaceCard };
