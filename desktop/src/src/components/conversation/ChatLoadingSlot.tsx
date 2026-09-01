// A1-P1-B16：chat 加载槽域逐字重建（styles js 99534–99552 + 112803–112826，共 43 行，7 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（B15 留批 7：I3e 消费位 112823 束体——kvt/Llt/x1 实体化；ApiRetryStatusChip 已在 shell/Home §T.3）。
// 逐字证明：/tmp/a1r0-p1/p16/p16-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p16-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p16/seams-ChatLoadingSlot.json，均带〔A1-P1-B16〕。
// 区段切分墓碑：Llt 左界 = Ilt@99533 memo 闭包右界邻接；Llt@99552 右界 = Rlt@99553 状态映射 var 邻接（留批）；
//   kvt 左界 112803 = Avt 闭包右界邻接；x1@112826 右界 = S1@112827 时长单位拼接邻接（留批）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   Llt→LoadingSkeleton（99534）| kvt→toApiRetryViewModel（112803）| x1→ApiRetryLoadingSlot（112814）
// 跨域真实 import：G→useIntlContext（modules/I18n）| Z→cn（modules/UtilsCn）| fv→IconLoader（lucide-react 'loader'，
//   styles 27363 Sa；A0-S3b 判例）| jn→chatLoadingTestid（modules/SrcSharedB，原 R_ src-HCld2afU 8307）|
//   I3e→ApiRetryStatusChip（components/shell/Home §T.3，〔A1-P1-B15〕76860）| Q→React | $→jsx-runtime。
// 消费面收敛〔A1-P1-B16〕：modules/Conversation 手写 toApiRetryViewModel/ApiRetryLoadingSlot 双实例 +
//   declare LoadingSkeleton 删除，改指本叶（R25 判例）；留批消费位：x1@113079/113124/113200。
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G
import { cn } from '../../modules/UtilsCn'; // 原 Z
import { Loader as IconLoader } from 'lucide-react'; // 原 fv（styles 27363 Sa('loader')；A0-S3b 判例 npm lucide-react@1.35.0）
import { chatLoadingTestid } from '../../modules/SrcSharedB'; // 原 jn（src-HCld2afU.js R_@8307）
import { ApiRetryStatusChip } from '../shell/Home'; // 原 I3e（〔A1-P1-B15〕76860）

/* ── chat 加载槽域（styles 99534–99552 + 112803–112826） ── */
function LoadingSkeleton({ loading: e, size: t = `default`, className: n, ...r }: any) {
  let { intl: i } = useIntlContext();
  if (!e) return null;
  let a = t === `sm` ? `size-4 text-ui-base` : `size-6`;
  return (0, $.jsx)(`div`, {
    "aria-label": i.formatMessage({ id: `common.loading` }),
    ...r,
    "data-zcode-chat-loading-animate": `true`,
    role: `status`,
    className: cn(`flex items-center`, n),
    children: (0, $.jsx)(`div`, {
      className: `flex size-4 items-center justify-center`,
      children: (0, $.jsx)(IconLoader, {
        "aria-hidden": `true`,
        className: cn(`animate-spin text-foreground-subtle`, a),
      }),
    }),
  });
}
function toApiRetryViewModel(e: any) {
  let t = Math.max(1, Math.floor(e.attempt));
  return {
    kind: `api_retry`,
    attempt: t,
    maxRetries: Math.max(Math.floor(e.maxAttempts) - 1, t),
    retryDelayMs: 0,
    errorStatus: null,
    error: e.reasonCode,
  };
}
function ApiRetryLoadingSlot({ apiRetry: e, eligible: t }: any) {
  let { intl: n, locale: r } = useIntlContext(),
    i = (0, React.useMemo)(() => (e ? toApiRetryViewModel(e) : null), [e]);
  return !i && !t
    ? null
    : (0, $.jsx)(`div`, {
        "data-zcode-chat-loading-slot": `true`,
        className: `min-h-5`,
        children: i
          ? (0, $.jsx)(ApiRetryStatusChip, { apiRetry: i, intl: n, locale: r })
          : (0, $.jsx)(LoadingSkeleton, { loading: !0, "data-testid": chatLoadingTestid, size: `sm` }),
      });
}

export { LoadingSkeleton, toApiRetryViewModel, ApiRetryLoadingSlot };
