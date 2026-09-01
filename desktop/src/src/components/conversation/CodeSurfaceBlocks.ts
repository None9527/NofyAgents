// A1-P1-B14：代码面族逐字重建（styles js 48572–48872 + 107112–107114 + 107180–107215，共 340 行，88 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；B13 留批第 2 项 CodeSurface 族真身收割）。
// 消费面 = AutomationViewBlocks.ts 6 declare + ConversationToolViews.tsx 6 declare → 真实 import 收敛；
//   CTV 手写 NodeReplToolView 三处 <CodeSurface cardSurface …> 改指 CodeSurfaceCard（原 w$，束真身卡面包装体）。
// 逐字证明：/tmp/a1r0-p1/p14/p14-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p14-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p14/CodeSurfaceBlocks.seam-log.txt，均带〔A1-P1-B14〕。
// 区段切分墓碑：左界 $ze@48572（markdown 组件域右界邻接）；yk@48873（context-menu 域）为右界。
//   卡面包装域：Dmt var 链@107112（NodeRepl 族域内，语句不可分，Dmt/kmt 随段携带，消费面留批）；w$@107180。
// 深域只消费披露：MO/BO/Qze（代码/mermaid 面板域 47549/47895/48269）未实体化 → 叶内 declare（跨域判例，留批）。
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
import { isMermaidLanguage, isMermaidBlock as shouldRenderMermaidPreview, documentVisibilityState as resolveDocumentVisibilityState, mermaidAutoRenderGate as evaluateMermaidPreviewRender } from '../../modules/MarkdownIntegration'; // 〔A1-P1-B15〕原 NO/Oze/Mze/Pze（mermaid 门控域 47709–47894 既录 canonical；declare 收敛）

/* ── tombstone〔A1-P1-B15〕：文件图标二 declare（FileIcon/resolveFileIconMeta，原 Vc/zc）删除——束真身
 * 5243/5198 已逐字实体化于 ./FileIconBlocks（文件图标域 5064–5267 收割，B14 留批第 3 项）。消费面逐字不变。 ── */
/* ── tombstone〔A1-P1-B15〕：mermaid 门控四 declare（原 NO/Oze/Mze/Pze）删除——束真身域 47709–47894 既录
 * modules/MarkdownIntegration（isMermaidLanguage/isMermaidBlock/documentVisibilityState/mermaidAutoRenderGate，
 * A0 期语义重建在案；型面兼容：shouldRender/reason/metrics 返回面逐字段吻合）。别名导入保持本叶逐字体不变。 ── */
declare const CodeSurfaceCodePane: React.FC<{ code: string; enableSyntaxHighlighting?: boolean; language?: string; showLineNumbers?: boolean; theme?: string; wrapLongLines?: boolean; className?: string; fontSizePx?: number; style?: Record<string, unknown> }>; // 原 MO（47549，代码面板域未实体化，留批）
declare const CodeSurfaceMermaidPane: React.FC<{ code: string; theme?: string; onOpenPreview?: () => void; onPreviewSvgChange?: (svg: string | null) => void }>; // 原 BO（47895）
declare const MermaidPreviewDialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; svg: string | null; title: string }>; // 原 Qze（48269）

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
