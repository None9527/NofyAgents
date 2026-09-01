// A1-P1-B12：ToolLayout 折叠壳族逐字重建（styles js 100010–100465，共 456 行，91 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx §4.1 手写 ToolLayout 全族（约 430 行）
//   → 墓碑 + 真实 import 收敛（ToolCallBlock 尾导出块 re-export 保留，modules/Conversation §4 转导出链不动）。
// 逐字证明：/tmp/a1r0-p1/p12/p12-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p12-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p12/ToolLayoutBlocks.seam-log.txt，均带〔A1-P1-B12〕。
// 钥匙实体 2/2（编排方 B12 属主裁定：lQ@100464 归 conversation 泳道）：Session 3 / Skill 5 / Task 10 / MCP-Wmt 四族
//   消费留批下批收割（界障证据见 A1-P1-B12.report.md §六）。
// 束真身更正（手写体差异披露）：① testid 构造 qr= Nb@src:8464 `${e}-${t}`（连字符），手写体误用冒号；
//   ② Bi= Zg@src:8266 = `tool-summary-trigger`，三态分支同前缀（手写体 canToggle/纯展示分支误作 tool-summary-toggle）；
//   ③ aut 真身含 framer-motion 队列动画（$K/gq，vendored 69354–75494 区；手写体为简化淡入）。
// 区段切分墓碑：sQ/Xlt@99954–100009 为邻叶（ToolSnapshotRefs）；mut@100466（diff 行解析，gut@100507 卫星）为本区右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）| Z→cn（UtilsCn）
//   X→Button | wa→IconChevronRight（modules/button，button-laUijeDG.js t/o 导出）
//   M_→IconCheck（styles 26849 vendored Sa('check')）| W_→IconCopy（styles 26974 vendored Sa('copy')）；A0-S3b 判例
//   Na→Popover | Oa→PopoverAnchor | Ma→PopoverTrigger | ka→PopoverContent（modules/ImeComposition canonical；
//     束经 button-laUijeDG.js p/d/m/f 导出转手）
//   kZ→Collapsible（styles 94973）| AZ→CollapsibleTrigger（94976）| jZ→CollapsibleContent（94979）；
//     canonical = modules/Conversation §1 留守原语（A0-S4-4b）
//   【declare 面（vendored，消费位只读）】
//   $K→AnimatePresence（styles 74135 vendored framer-motion）| gq→framerMotion（styles 75493 同区）；
//     ModelSelector §13b 判例：vendored 只 declare 不转录
//   【跨 chunk 真实 import（src 域 canonical 在案）】
//   qr→buildToolTestId（= SrcSharedB joinTestidParts，Nb@src-HCld2afU.js 8464，经 src chunk 9836 `Nb as Xa` → styles 601 `Xa as qr`）
//   Bi→TOOL_SUMMARY_TRIGGER_TESTID（= SrcSharedB toolSummaryTriggerTestid，Zg@src-HCld2afU.js 8266，经 src chunk 10064 `Zg as zi` → styles 822 `zi as Bi`）
//   【ToolLayout 折叠壳族 100010–100465】
//   Zlt→STATUS_TEXT_DISPLAY_MS（100010 链）| Qlt→STATUS_TEXT_QUEUE_LATE_MS（链）| $lt→STATUS_TEXT_QUEUE_LIMIT（链）
//   eut→STATUS_TEXT_TRANSITION（链）| tut→nowTimestamp（100014）| nut→trimQueuedStatusText（100017）
//   rut→shouldAnimateStatusText（100020）| iut→useReducedMotionPreference（100023）
//   aut→ToolLayoutAnimatedText（100048）| out→activateOnEnterOrSpace（100140）
//   sut→ToolLayoutSummaryPrefix（100143）| cut→ToolLayoutSummaryContent（100170）| lut→ToolLayoutHeader（100199）
//   cQ→toolLayoutOpenStateStore（100258 链）| uut→TOOL_LAYOUT_COLLAPSE_DELAY_MS（链）
//   dut→TOOL_LAYOUT_CONTENT_TEXT_CLASS（链）| fut→TOOL_LAYOUT_CONTENT_PAD_CLASS（链）
//   put→ToolLayoutImpl（100262）| lQ→ToolLayoutMemo（100464，displayName=`ToolLayout` 100465）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 X/wa（button-laUijeDG.js t/o 导出）
import { Check as IconCheck, Copy as IconCopy } from 'lucide-react'; // 原 M_/W_（styles 26849/26974 vendored Sa('check'/'copy')；A0-S3b 判例）
import { Popover, PopoverAnchor, PopoverTrigger, PopoverContent } from '../../modules/ImeComposition'; // 原 Na/Oa/Ma/ka（canonical 判例：ToolCallBlock 文件头同源接线）
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../modules/Conversation'; // 原 kZ/AZ/jZ（§1 共享原语留守面，A0-S4-4b；函数声明提升，渲染期访问，环安全）
// declare 面（vendored，只消费不转录）+ 跨 chunk 真实 import（src 域 canonical 在案）：
declare const AnimatePresence: React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>; // 原 $K（styles 74135，vendored framer-motion 69354–75494；ModelSelector §13b 判例）
declare const framerMotion: { span: React.ComponentType<Record<string, unknown> & { className?: string; children?: React.ReactNode }> }; // 原 gq（styles 75493 同区；ModelSelector §13b 判例）
import { joinTestidParts as buildToolTestId, toolSummaryTriggerTestid as TOOL_SUMMARY_TRIGGER_TESTID } from '../../modules/SrcSharedB'; // 原 qr/Bi（Nb/Zg@src-HCld2afU.js 8464/8266；canonical：SrcSharedB §19b/§19（跨 chunk：src 9836/10064 → styles 601/822））

/* ── ToolLayout 折叠壳族（styles 100010–100465） ── */
var STATUS_TEXT_DISPLAY_MS = 800,
  STATUS_TEXT_QUEUE_LATE_MS = 250,
  STATUS_TEXT_QUEUE_LIMIT = 2,
  STATUS_TEXT_TRANSITION = { duration: 300 / 1e3, ease: [0.4, 0, 0.2, 1] };
function nowTimestamp() {
  return typeof performance < `u` ? performance.now() : Date.now();
}
function trimQueuedStatusText(e: any, t: any) {
  return t > STATUS_TEXT_QUEUE_LATE_MS && e.length > 1 ? e.slice(-1) : [...e];
}
function shouldAnimateStatusText({ enabled: e, disableAnimation: t, reducedMotion: n }: any) {
  return e && t !== !0 && !n;
}
function useReducedMotionPreference() {
  let [e, t] = (0, React.useState)(!1);
  return (
    (0, React.useEffect)(() => {
      if (typeof window > `u` || typeof window.matchMedia != `function`) return;
      let e = window.matchMedia(`(prefers-reduced-motion: reduce)`),
        n = () => {
          t(e.matches);
        };
      return (
        n(),
        typeof e.addEventListener == `function`
          ? (e.addEventListener(`change`, n),
            () => {
              e.removeEventListener(`change`, n);
            })
          : (e.addListener(n),
            () => {
              e.removeListener(n);
            })
      );
    }, []),
    e
  );
}
function ToolLayoutAnimatedText({
  contentKey: e,
  primaryText: t,
  secondaryText: n,
  enabled: r,
  disableAnimation: i = !1,
}: any) {
  let a = shouldAnimateStatusText({ enabled: r, disableAnimation: i, reducedMotion: useReducedMotionPreference() }),
    o = () => ({ key: e, primaryText: t, secondaryText: n }),
    [s, c] = (0, React.useState)(o),
    l = (0, React.useRef)(s),
    u = (0, React.useRef)<any[]>([]),
    d = (0, React.useRef)<number | null>(null),
    f = (0, React.useRef)(!1);
  return (
    (0, React.useEffect)(() => {
      l.current = s;
    }, [s]),
    (0, React.useEffect)(() => {
      let e = () => {
          d.current !== null && (window.clearTimeout(d.current), (d.current = null));
        },
        t = (e: any) => {
          let t = u.current;
          if (!t.some((t: any) => t.key === e.key)) {
            if (t.length === 0) {
              u.current = [e];
              return;
            }
            u.current = [t[0], e].slice(0, STATUS_TEXT_QUEUE_LIMIT);
          }
        },
        n = (t: any) => {
          ((l.current = t), c(t), (f.current = !0), e());
          let r = nowTimestamp() + STATUS_TEXT_DISPLAY_MS;
          d.current = window.setTimeout(() => {
            ((f.current = !1), (d.current = null));
            let e = u.current,
              [t, ...i] = trimQueuedStatusText(e, nowTimestamp() - r);
            if (!t) {
              u.current = [];
              return;
            }
            ((u.current = i), n(t));
          }, STATUS_TEXT_DISPLAY_MS);
        },
        r = o();
      if (!a) {
        (e(), (f.current = !1), (u.current = []), (l.current = r), c(r));
        return;
      }
      if (l.current.key !== r.key) {
        if (f.current) {
          t(r);
          return;
        }
        if (u.current.length > 0) {
          t(r);
          return;
        }
        n(r);
      }
    }, [e, a]),
    (0, React.useEffect)(
      () => () => {
        d.current !== null && window.clearTimeout(d.current);
      },
      [],
    ),
    a
      ? (0, $.jsx)(`span`, {
          className: `relative inline-flex min-w-0 items-center overflow-hidden align-middle`,
          children: (0, $.jsx)(AnimatePresence, {
            initial: !1,
            mode: `popLayout`,
            children: (0, $.jsxs)(
              framerMotion.span,
              {
                className: `inline-flex min-w-0 items-center gap-2`,
                initial: { y: `0.8em`, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                exit: { y: `-0.8em`, opacity: 0 },
                transition: STATUS_TEXT_TRANSITION,
                children: [s.primaryText, s.secondaryText],
              },
              s.key,
            ),
          }),
        })
      : (0, $.jsxs)($.Fragment, { children: [t, n] })
  );
}
function activateOnEnterOrSpace(e: any, t: any) {
  return e.key !== `Enter` && e.key !== ` ` ? !1 : (e.preventDefault(), t(), !0);
}
function ToolLayoutSummaryPrefix({
  icon: e,
  kindDetail: t,
  kindLabel: n,
  kindLabelClassName: r,
  showIcon: i,
  sourceLabel: a,
}: any) {
  return (0, $.jsxs)($.Fragment, {
    children: [
      i
        ? (0, $.jsx)(`span`, {
            className: `shrink-0 text-foreground-subtlest [&_svg]:text-foreground-subtlest`,
            children: e,
          })
        : null,
      n != null && n !== !1 && n !== `` ? (0, $.jsx)(`span`, { className: r, children: n }) : null,
      t ? (0, $.jsx)(`span`, { className: `min-w-0 shrink-0`, children: t }) : null,
      a
        ? (0, $.jsx)(`span`, {
            className: `shrink-0 rounded border border-border bg-background-alt px-1.5 py-0.5 text-ui-xs leading-none text-foreground-subtlest`,
            children: a,
          })
        : null,
    ],
  });
}
function ToolLayoutSummaryContent({
  animateContent: e,
  contentKey: t,
  diffCount: n,
  disableContentAnimation: r,
  isExpanded: i,
  primaryText: a,
  secondaryText: o,
  separator: s,
  statusNode: c,
}: any) {
  return (0, $.jsxs)(`div`, {
    className: `min-w-0 flex max-w-full items-center gap-2 text-foreground-subtlest`,
    children: [
      s == null
        ? null
        : (0, $.jsx)(`span`, { className: `shrink-0 text-foreground-subtlest`, children: s }),
      (0, $.jsx)(ToolLayoutAnimatedText, {
        contentKey: t,
        primaryText: a,
        secondaryText: o,
        enabled: e && !i,
        disableAnimation: r,
      }),
      n,
      c,
    ],
  });
}
function ToolLayoutHeader(e: any) {
  let {
      action: t,
      canToggle: n,
      forceOpen: r,
      isExpanded: i,
      title: a,
      toggleAriaLabel: o,
      toolId: s,
    } = e,
    c = (0, $.jsxs)($.Fragment, {
      children: [(0, $.jsx)(ToolLayoutSummaryPrefix, { ...e }), (0, $.jsx)(ToolLayoutSummaryContent, { ...e })],
    });
  return t
    ? (0, $.jsx)(`div`, {
        "data-testid": t.testId ?? buildToolTestId(`tool-summary-trigger`, s),
        role: `button`,
        tabIndex: 0,
        "aria-label": t.ariaLabel,
        onClick: t.onActivate,
        onKeyDown: (e: any) => activateOnEnterOrSpace(e, t.onActivate),
        className: `group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
        title: a,
        children: c,
      })
    : n
      ? (0, $.jsx)(CollapsibleTrigger, {
          asChild: !0,
          children: (0, $.jsxs)(`div`, {
            "data-testid": buildToolTestId(TOOL_SUMMARY_TRIGGER_TESTID, s),
            role: `button`,
            tabIndex: 0,
            "aria-expanded": i,
            "aria-label": o,
            onKeyDown: (e: any) => {
              (e.key !== `Enter` && e.key !== ` `) || (e.preventDefault(), e.currentTarget.click());
            },
            className: `group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
            title: a,
            children: [
              c,
              (0, $.jsx)(IconChevronRight, {
                "aria-hidden": !0,
                className: cn(
                  `size-4 text-foreground-subtlest opacity-0 transition-transform transition-opacity duration-200 ease-out will-change-transform group-hover/tool-summary:opacity-100 shrink-0`,
                  i ? `rotate-90 opacity-100` : `rotate-0`,
                  r && `opacity-100`,
                ),
              }),
            ],
          }),
        })
      : (0, $.jsx)(`div`, {
          "data-testid": buildToolTestId(TOOL_SUMMARY_TRIGGER_TESTID, s),
          className: `group/tool-summary cursor-default flex w-full items-center gap-2 text-left text-ui-base transition-colors focus-visible:outline-none`,
          title: a,
          children: c,
        });
}
var toolLayoutOpenStateStore = new Map(),
  TOOL_LAYOUT_COLLAPSE_DELAY_MS = 300,
  TOOL_LAYOUT_CONTENT_TEXT_CLASS = `text-popover-foreground outline-none`,
  TOOL_LAYOUT_CONTENT_PAD_CLASS = `pt-2`;
function ToolLayoutImpl({
  toolId: e,
  persistOpenKey: t,
  icon: n,
  showIcon: r = !0,
  canToggle: i = !0,
  forceOpen: a = !1,
  autoOpen: o = !1,
  autoCollapseOnComplete: s = !1,
  kindLabel: c,
  expandedKindLabel: l,
  kindDetail: u,
  expandedKindDetail: d,
  sourceLabel: f,
  primaryText: p,
  expandedPrimaryText: m,
  secondaryText: h,
  expandedSecondaryText: g,
  summaryContentSeparator: _,
  animateSummaryContent: v = !1,
  disableSummaryContentAnimation: y = !1,
  summaryContentKey: b,
  hideSecondaryTextWhenOpen: x = !1,
  diffCount: S,
  hideDiffCountWhenOpen: C = !1,
  statusLabel: w,
  statusTooltip: T,
  showFailureStatus: E = !1,
  isRunning: D = !1,
  title: O,
  expandedTitle: k,
  content: A,
  renderContent: j,
  summaryAction: M,
}: any) {
  let { intl: N } = useIntlContext(),
    P = t ?? e,
    [F, I] = (0, React.useState)(() => toolLayoutOpenStateStore.get(P) ?? !1),
    L = M !== void 0,
    R = !L && (a || (i && F)),
    [z, B] = (0, React.useState)(R),
    [V, H] = (0, React.useState)(!1),
    ee = (0, React.useRef)<number | null>(null),
    U = (0, React.useRef)<number | null>(null),
    te = (0, React.useRef)(!1),
    ne = (0, React.useRef)(D),
    re = E && w != null,
    ie = !L && (R || z) ? (j?.() ?? A ?? null) : null,
    ae = R && m != null ? m : p,
    oe = R && l != null ? l : c,
    se = R && d !== void 0 ? d : u,
    ce = R && g !== void 0 ? g : R && x ? null : h,
    le = R && k !== void 0 ? k : O,
    ue = b ?? `${String(le ?? ``)}:${String(w ?? ``)}`,
    de = S != null && !(R && C),
    fe = n,
    W = cn(
      `font-medium whitespace-nowrap shrink-0`,
      D ? `animated-gradient-text` : `text-foreground-subtlest`,
    );
  ((0, React.useEffect)(() => {
    I(toolLayoutOpenStateStore.get(P) ?? !1);
  }, [P]),
    (0, React.useEffect)(() => {
      !o || te.current || (toolLayoutOpenStateStore.set(P, !0), B(!0), I(!0), (te.current = !0));
    }, [o, P]),
    (0, React.useEffect)(() => {
      let e = ne.current;
      ((ne.current = D), s && !D && e && (toolLayoutOpenStateStore.set(P, !1), I(!1)));
    }, [s, D, P]),
    (0, React.useEffect)(() => {
      if (R) {
        (U.current !== null && (window.clearTimeout(U.current), (U.current = null)), B(!0));
        return;
      }
      if (z)
        return (
          (U.current = window.setTimeout(() => {
            (B(!1), (U.current = null));
          }, TOOL_LAYOUT_COLLAPSE_DELAY_MS)),
          () => {
            U.current !== null && (window.clearTimeout(U.current), (U.current = null));
          }
        );
    }, [R, z]),
    (0, React.useEffect)(
      () => () => {
        (ee.current !== null && window.clearTimeout(ee.current),
          U.current !== null && window.clearTimeout(U.current));
      },
      [],
    ));
  let pe = () => {
      typeof T != `string` ||
        T.trim().length === 0 ||
        navigator.clipboard.writeText(T).then(() => {
          (H(!0),
            ee.current !== null && window.clearTimeout(ee.current),
            (ee.current = window.setTimeout(() => {
              (H(!1), (ee.current = null));
            }, 1500)));
        });
    },
    me =
      re && w != null
        ? T
          ? (0, $.jsx)(Popover, {
              children: (0, $.jsxs)(PopoverAnchor, {
                children: [
                  (0, $.jsx)(PopoverTrigger, {
                    asChild: !0,
                    children: (0, $.jsx)(`span`, {
                      className: `whitespace-nowrap underline decoration-dotted underline-offset-2 cursor-help`,
                      children: w,
                    }),
                  }),
                  (0, $.jsx)(PopoverContent, {
                    side: `top`,
                    align: `start`,
                    className: `max-w-96`,
                    children: (0, $.jsxs)(`div`, {
                      className: `flex max-w-96 items-center gap-2`,
                      children: [
                        (0, $.jsx)(`span`, {
                          className: `line-clamp-3 min-w-0 flex-1 whitespace-pre-wrap break-words`,
                          children: T,
                        }),
                        typeof T == `string` && T.trim().length > 0
                          ? (0, $.jsx)(Button, {
                              type: `button`,
                              variant: `ghost`,
                              size: `icon-md`,
                              className: `shrink-0`,
                              onClick: (e: any) => {
                                (e.preventDefault(), e.stopPropagation(), pe());
                              },
                              title: N.formatMessage({
                                id: V
                                  ? `chat.toolCall.copyError.copied`
                                  : `chat.toolCall.copyError`,
                              }),
                              "aria-label": N.formatMessage({
                                id: V
                                  ? `chat.toolCall.copyError.copied`
                                  : `chat.toolCall.copyError`,
                              }),
                              children: V
                                ? (0, $.jsx)(IconCheck, { className: `size-3` })
                                : (0, $.jsx)(IconCopy, { className: `size-3` }),
                            })
                          : null,
                      ],
                    }),
                  }),
                ],
              }),
            })
          : (0, $.jsx)(`span`, { className: `whitespace-nowrap`, children: w })
        : null;
  return (0, $.jsxs)(Collapsible, {
    open: !L && (a || (i && F)),
    onOpenChange: (e: any) => {
      L || a || (toolLayoutOpenStateStore.set(P, e), e && B(!0), I(e));
    },
    className: `w-full flex flex-col`,
    children: [
      (0, $.jsx)(ToolLayoutHeader, {
        action: M,
        animateContent: v,
        canToggle: i,
        contentKey: ue,
        diffCount: de ? S : void 0,
        disableContentAnimation: y,
        forceOpen: a,
        icon: fe,
        isExpanded: R,
        kindDetail: se,
        kindLabel: oe,
        kindLabelClassName: W,
        primaryText: ae,
        secondaryText: ce,
        separator: _,
        showIcon: r,
        sourceLabel: f,
        statusNode: me,
        title: le,
        toggleAriaLabel: N.formatMessage({
          id: R ? `chat.toolCall.collapseDetails` : `chat.toolCall.expandDetails`,
        }),
        toolId: e,
      }),
      !L && i
        ? (0, $.jsx)(CollapsibleContent, {
            className: TOOL_LAYOUT_CONTENT_TEXT_CLASS,
            children: (0, $.jsx)(`div`, { className: TOOL_LAYOUT_CONTENT_PAD_CLASS, children: ie }),
          })
        : !L && a
          ? (0, $.jsx)(`div`, { className: cn(TOOL_LAYOUT_CONTENT_TEXT_CLASS, TOOL_LAYOUT_CONTENT_PAD_CLASS), children: ie })
          : null,
    ],
  });
}
var ToolLayoutMemo = (0, React.memo)(ToolLayoutImpl);
ToolLayoutMemo.displayName = `ToolLayout`;

export {
  STATUS_TEXT_DISPLAY_MS, STATUS_TEXT_QUEUE_LATE_MS, STATUS_TEXT_QUEUE_LIMIT, STATUS_TEXT_TRANSITION, nowTimestamp, trimQueuedStatusText,
  shouldAnimateStatusText, useReducedMotionPreference, ToolLayoutAnimatedText, activateOnEnterOrSpace, ToolLayoutSummaryPrefix, ToolLayoutSummaryContent,
  ToolLayoutHeader, toolLayoutOpenStateStore, TOOL_LAYOUT_COLLAPSE_DELAY_MS, TOOL_LAYOUT_CONTENT_TEXT_CLASS, TOOL_LAYOUT_CONTENT_PAD_CLASS, ToolLayoutImpl,
  ToolLayoutMemo,
};
