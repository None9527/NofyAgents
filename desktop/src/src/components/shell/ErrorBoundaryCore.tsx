/* eslint-disable */
/**
 * ============================================================================
 * ErrorBoundaryCore.tsx —— A1-P2-B1 新叶（B5 语义顶层名 + 头注映射表）
 * ----------------------------------------------------------------------------
 * 真身区段：styles-CdEGpc2x.js 129749–130008（单一连续原子区，260 行，四件）
 *   QOt → AppErrorFallback    应用级错误降级呈现层 (129749-129821)
 *   $Ot → ScopedErrorFallback 作用域错误降级呈现层 (129822-129936)
 *   ekt → AppErrorBoundary    应用级错误边界 (129937-129968)
 *   p4  → ScopedErrorBoundary 作用域错误边界 (129969-130008)
 * 〔ekt/p4 同处一条 var 语句（129937–130008），整区转录不拆分。〕
 *
 * 一、混淆名 → 语义名 映射表（自由符裁定；函数体内局部保留混淆名）
 *   Q  → React（react-BQLj9xdT.js）｜ $ → jsx-runtime（import * as $）
 *   J  → logger（SkillStore 转导出）｜ Z → cn（modules/UtilsCn）
 *   X  → Button（modules/button）
 *   N  → IconTriangleAlert（本叶具象；原 imeComposition Kt = x(`triangle-alert`, …) @11808，styles 804 区 `x as N` 导入链）
 *   Nv → IconRefreshCw（本叶具象；原 styles 27725 Sa(`refresh-cw`, …)，多域共享图标工厂，叶内副本）
 *   f4 → translateAppError ｜ l4 → WindowShell ｜ d4 → toError
 *   YOt → serializeErrorForLog ｜ ZOt → didResetKeysChange ｜ qOt → reportReactErrorToArms
 *   （六件真身均在 components/shell/WorkspaceShell.tsx 919–1016，本叶回环导入；
 *     环安全：二环 WorkspaceShell↔ErrorBoundaryCore，交叉消费全在渲染期/类方法内，
 *     模块求值期零交叉触碰，同 Home↔PaymentDeep 既有判例。）
 *
 * 二、型缝（〔A1-P2-B1〕标注，9 处，逐行登记 ws-seam-log.txt）
 *   W1 呈现层解构参对象 : any ×2（bundle 无型面；纯型层）
 *   W2 class extends React.Component<any, any> ×2（props 面按调用面归纳未铸型；纯型层）
 *   W3 生命周期方法参数 : any ×5（getDerivedStateFromError/componentDidCatch/componentDidUpdate；纯型层）
 *
 * 三、逐字证明
 *   ROUNDTRIP EXACT（260 行）：叶体逆改名（语义→混淆，含四声明头逆缝 + W1–W3 缝逆归一）
 *   与 bundle 129749–130008 逐字一致；SHORTHAND_RENAMED_SITES 0。
 * ============================================================================
 */

import * as React from "react";
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import { Button, createLucideIcon } from '../../modules/button'; // 原 X / Sa
import { cn } from '../../modules/UtilsCn'; // 原 Z
import { logger } from '../../modules/SkillStore'; // 原 J
import {
  WindowShell, translateAppError, toError, serializeErrorForLog,
  didResetKeysChange, reportReactErrorToArms,
} from './WorkspaceShell'; // 原 l4/f4/d4/YOt/ZOt/qOt

/** 原 N（imeComposition Kt @11808）：triangle-alert 图标 */
const IconTriangleAlert = createLucideIcon(`triangle-alert`, [
  [
    `path`,
    {
      d: `m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`,
      key: `wmoenq`,
    },
  ],
  [`path`, { d: `M12 9v4`, key: `juzpu7` }],
  [`path`, { d: `M12 17h.01`, key: `p32p05` }],
]);
/** 原 Nv（styles 27725）：refresh-cw 图标 */
const IconRefreshCw = createLucideIcon(`refresh-cw`, [
  [`path`, { d: `M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`, key: `v9h5vc` }],
  [`path`, { d: `M21 3v5h-5`, key: `1q7to0` }],
  [`path`, { d: `M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`, key: `3uifl3` }],
  [`path`, { d: `M8 16H3v5`, key: `1cv678` }],
]);

function AppErrorFallback({
  error: e,
  componentStack: t,
  onReset: n,
  onReload: r,
  isDesktop: i,
  isMacDesktop: a,
  isWindowsDesktop: o,
}: any) {
  let s = e.message.trim() || translateAppError(`appError.unknown`);
  return (0, $.jsx)(WindowShell, {
    title: translateAppError(`appError.title`),
    isDesktop: i,
    isMacDesktop: a,
    isWindowsDesktop: o,
    children: (0, $.jsx)(`div`, {
      className: `flex h-full min-h-0 justify-center overflow-y-auto p-6`,
      children: (0, $.jsxs)(`div`, {
        role: `alert`,
        className: `w-full max-w-xl self-start rounded-3xl border border-destructive/20 bg-surface-alt p-6 shadow-sm`,
        children: [
          (0, $.jsx)(`div`, {
            className: `flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive`,
            children: (0, $.jsx)(IconTriangleAlert, { className: `size-5` }),
          }),
          (0, $.jsx)(`h1`, {
            className: `mt-4 text-lg font-semibold text-foreground`,
            children: translateAppError(`appError.title`),
          }),
          (0, $.jsx)(`p`, {
            className: `mt-2 text-ui-base leading-6 text-on-surface-muted`,
            children: translateAppError(`appError.description`),
          }),
          (0, $.jsx)(`div`, {
            className: `mt-4 rounded-2xl border border-border bg-background px-3 py-2 font-mono text-ui-base leading-5 text-on-surface-muted`,
            children: s,
          }),
          (0, $.jsxs)(`div`, {
            className: `mt-5 flex flex-wrap gap-2`,
            children: [
              (0, $.jsx)(Button, { type: `button`, onClick: n, children: translateAppError(`appError.retry`) }),
              (0, $.jsxs)(Button, {
                type: `button`,
                variant: `outline`,
                onClick: r,
                children: [(0, $.jsx)(IconRefreshCw, {}), translateAppError(`appError.reload`)],
              }),
            ],
          }),
          (0, $.jsx)(`p`, {
            className: `mt-4 text-ui-base leading-5 text-on-surface-muted`,
            children: translateAppError(`appError.hint`),
          }),
          t
            ? (0, $.jsxs)(`details`, {
                className: `mt-4 rounded-2xl border border-border bg-background px-3 py-2`,
                children: [
                  (0, $.jsx)(`summary`, {
                    className: `cursor-pointer text-ui-base font-medium text-on-surface-muted`,
                    children: translateAppError(`appError.details`),
                  }),
                  (0, $.jsx)(`pre`, {
                    className: `mt-2 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words text-ui-base leading-5 text-on-surface-muted`,
                    children: t.trim(),
                  }),
                ],
              })
            : null,
        ],
      }),
    }),
  });
}
function ScopedErrorFallback({
  error: e,
  componentStack: t,
  onReset: n,
  onReload: r,
  variant: i = `panel`,
  className: a,
}: any) {
  if (i === `silent`) return null;
  let o = e.message.trim() || translateAppError(`appError.unknown`),
    s = i === `compact`,
    c = i !== `compact`;
  if (s)
    return (0, $.jsxs)(`div`, {
      role: `alert`,
      className: cn(`flex min-h-10 items-center gap-2 border-border bg-surface px-3 py-2`, a),
      children: [
        (0, $.jsx)(IconTriangleAlert, { className: `size-4 shrink-0 text-destructive` }),
        (0, $.jsxs)(`div`, {
          className: `min-w-0 flex-1`,
          children: [
            (0, $.jsx)(`p`, {
              className: `truncate text-ui-base font-medium text-foreground`,
              children: translateAppError(`appError.sectionTitle`),
            }),
            (0, $.jsx)(`p`, {
              className: `truncate font-mono text-ui-base text-foreground-subtle`,
              children: o,
            }),
          ],
        }),
        (0, $.jsx)(Button, {
          type: `button`,
          size: `sm`,
          variant: `outline`,
          onClick: n,
          children: translateAppError(`appError.sectionRetry`),
        }),
      ],
    });
  let l = (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(`div`, {
        className: `flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive`,
        children: (0, $.jsx)(IconTriangleAlert, { className: `size-4` }),
      }),
      (0, $.jsx)(`h2`, {
        className: `mt-3 text-ui-base font-medium text-foreground`,
        children: translateAppError(`appError.sectionTitle`),
      }),
      (0, $.jsx)(`p`, {
        className: `mt-1 text-ui-base leading-5 text-foreground-subtle`,
        children: translateAppError(`appError.sectionDescription`),
      }),
      (0, $.jsx)(`div`, {
        className: `mt-3 rounded-lg border border-border bg-background px-3 py-2 font-mono text-ui-base leading-5 text-foreground-subtle`,
        children: o,
      }),
      (0, $.jsxs)(`div`, {
        className: `mt-4 flex flex-wrap gap-2`,
        children: [
          (0, $.jsx)(Button, {
            type: `button`,
            size: `sm`,
            onClick: n,
            children: translateAppError(`appError.sectionRetry`),
          }),
          (0, $.jsxs)(Button, {
            type: `button`,
            size: `sm`,
            variant: `outline`,
            onClick: r,
            children: [(0, $.jsx)(IconRefreshCw, {}), translateAppError(`appError.reload`)],
          }),
        ],
      }),
      (0, $.jsx)(`p`, {
        className: `mt-3 text-ui-base leading-5 text-foreground-subtle`,
        children: translateAppError(`appError.sectionHint`),
      }),
      c && t
        ? (0, $.jsxs)(`details`, {
            className: `mt-3 rounded-lg border border-border bg-background px-3 py-2`,
            children: [
              (0, $.jsx)(`summary`, {
                className: `cursor-pointer text-ui-base font-medium text-foreground-subtle`,
                children: translateAppError(`appError.details`),
              }),
              (0, $.jsx)(`pre`, {
                className: `mt-2 max-h-[32vh] overflow-auto whitespace-pre-wrap break-words text-ui-base leading-5 text-foreground-subtle`,
                children: t.trim(),
              }),
            ],
          })
        : null,
    ],
  });
  return i === `inline`
    ? (0, $.jsx)(`div`, {
        role: `alert`,
        className: cn(`w-full rounded-xl border border-destructive/20 bg-surface p-4`, a),
        children: l,
      })
    : (0, $.jsx)(`div`, {
        role: `alert`,
        className: cn(
          `flex h-full min-h-0 items-center justify-center overflow-auto bg-background p-4`,
          a,
        ),
        children: (0, $.jsx)(`div`, {
          className: `w-full max-w-md rounded-xl border border-destructive/20 bg-surface p-4 shadow-sm`,
          children: l,
        }),
      });
}
var AppErrorBoundary = class extends React.Component<any, any> {
    state = { error: null, componentStack: `` };
    static getDerivedStateFromError(e: any) {
      return { error: toError(e), componentStack: `` };
    }
    componentDidCatch(e: any, t: any) {
      let n = toError(e);
      (logger.error(`[AppErrorBoundary] React subtree crashed:`, serializeErrorForLog(n), t.componentStack),
        this.props.onCaughtReactError?.(n, t),
        reportReactErrorToArms({ error: n, componentStack: t.componentStack ?? `` }),
        this.setState({ componentStack: t.componentStack ?? `` }));
    }
    handleReset = () => {
      this.setState({ error: null, componentStack: `` });
    };
    handleReload = () => {
      typeof window < `u` && window.location.reload();
    };
    render() {
      return this.state.error
        ? (0, $.jsx)(AppErrorFallback, {
            error: this.state.error,
            componentStack: this.state.componentStack,
            onReset: this.handleReset,
            onReload: this.handleReload,
            isDesktop: this.props.isDesktop,
            isMacDesktop: this.props.isMacDesktop,
            isWindowsDesktop: this.props.isWindowsDesktop,
          })
        : this.props.children;
    }
  },
  ScopedErrorBoundary = class extends React.Component<any, any> {
    state = { error: null, componentStack: `` };
    static getDerivedStateFromError(e: any) {
      return { error: toError(e), componentStack: `` };
    }
    componentDidCatch(e: any, t: any) {
      let n = toError(e);
      (logger.error(
        `[ScopedErrorBoundary:${this.props.scope}] React subtree crashed:`,
        serializeErrorForLog(n),
        t.componentStack,
      ),
        this.props.onCaughtReactError?.(n, t, this.props.scope),
        reportReactErrorToArms({ error: n, componentStack: t.componentStack ?? ``, scope: this.props.scope }),
        this.setState({ componentStack: t.componentStack ?? `` }));
    }
    componentDidUpdate(e: any) {
      this.state.error &&
        didResetKeysChange(e.resetKeys, this.props.resetKeys) &&
        this.setState({ error: null, componentStack: `` });
    }
    handleReset = () => {
      (this.setState({ error: null, componentStack: `` }), this.props.onReset?.());
    };
    handleReload = () => {
      typeof window < `u` && window.location.reload();
    };
    render() {
      return this.state.error
        ? (0, $.jsx)(ScopedErrorFallback, {
            error: this.state.error,
            componentStack: this.state.componentStack,
            onReset: this.handleReset,
            onReload: this.handleReload,
            variant: this.props.variant,
            className: this.props.className,
          })
        : this.props.children;
    }
  };

export { AppErrorFallback, ScopedErrorFallback, AppErrorBoundary, ScopedErrorBoundary };
