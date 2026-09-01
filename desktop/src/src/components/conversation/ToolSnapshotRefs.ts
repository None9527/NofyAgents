// A1-P1-B12：快照引用加载器域逐字重建（styles js 99954–100009，共 56 行，9 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx ToolSnapshotRefs declare（1164）→ 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p12/p12-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p12-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p12/ToolSnapshotRefs.seam-log.txt，均带〔A1-P1-B12〕。
// 钥匙实体 1/2（编排方 B12 属主裁定：sQ@99954 归 conversation 泳道）：Session 3 / Skill 5 / Task 10 / MCP-Wmt 四族
//   消费留批下批收割（界障证据见 A1-P1-B12.report.md §六）。
// 区段切分墓碑：Xlt@100003 随段（快照字节数格式化，sQ 专用卫星）；Zlt@100010（ToolLayout 动画常量）起为邻叶左界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | Q→React | G→useIntlContext（I18n useZCodeIntl）
//   X→Button（modules/button，button-laUijeDG.js t 导出）| M→IconLoaderCircle（lucide-react LoaderCircle；
//     原 imeComposition-DEYFkwWm.js w 导出 = Ut@11786 vendored x('loader-circle')；A0-S3b 判例）
//   【快照引用加载器域 99954–100009】
//   sQ→ToolSnapshotRefs（99954）| Xlt→formatSnapshotBytes（100003）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { Button } from '../../modules/button'; // 原 X（button-laUijeDG.js t 导出）
import { LoaderCircle as IconLoaderCircle } from 'lucide-react'; // 原 M（imeComposition-DEYFkwWm.js w 导出 = Ut@11786 vendored x('loader-circle')；A0-S3b 判例：npm lucide-react@1.35.0）

/* ── 快照引用加载器域（styles 99954–100009） ── */
function ToolSnapshotRefs({ refs: e, onLoadFullToolCallFields: t }: any) {
  let { intl: n, locale: r } = useIntlContext(),
    [i, a] = (0, React.useState)(!1),
    [o, s] = (0, React.useState)(!1);
  if (e.length === 0 || !t) return null;
  let c = e.reduce((e: any, t: any) => e + t.previewBytes, 0),
    l = e.reduce((e: any, t: any) => e + t.fullBytes, 0),
    u = n.formatMessage(
      { id: `chat.toolCall.snapshot.notice` },
      { fields: String(e.length), previewBytes: formatSnapshotBytes(c, r), fullBytes: formatSnapshotBytes(l, r) },
    ),
    d = n.formatMessage({
      id: i
        ? `chat.toolCall.snapshot.loading`
        : o
          ? `chat.toolCall.snapshot.retry`
          : `chat.toolCall.snapshot.loadFull`,
    });
  return (0, $.jsxs)(`div`, {
    className: `flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-ui-base text-foreground-subtle sm:flex-row sm:items-center sm:justify-between`,
    children: [
      (0, $.jsx)(`span`, { children: u }),
      (0, $.jsxs)(Button, {
        type: `button`,
        variant: `secondary`,
        size: `sm`,
        className: `h-7 self-start px-2 text-ui-base sm:self-auto`,
        disabled: i,
        onClick: () => {
          (a(!0),
            s(!1),
            Promise.resolve(t())
              .then(
                (e: any) => {
                  s(e === !1);
                },
                () => {
                  s(!0);
                },
              )
              .finally(() => {
                a(!1);
              }));
        },
        children: [i ? (0, $.jsx)(IconLoaderCircle, { className: `mr-1 size-3 animate-spin` }) : null, d],
      }),
    ],
  });
}
function formatSnapshotBytes(e: any, t: any) {
  return e >= 1024 * 1024
    ? `${new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e / 1024 / 1024)} MB`
    : e >= 1024
      ? `${new Intl.NumberFormat(t, { maximumFractionDigits: 1 }).format(e / 1024)} KB`
      : `${new Intl.NumberFormat(t).format(e)} B`;
}

export {
  ToolSnapshotRefs, formatSnapshotBytes,
};
