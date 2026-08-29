# A0-S3a 报告 — vendored→npm 迁移（小库 + zod + xterm 裁决）

日期：2026-08-29 · 工作目录：`desktop/src/src`（该 package.json）· 基线 tsc：2 errors（/tmp/tsc-now12.txt，均为 TopBar S4 stub，保留）

## 一、逐库状态

### 1. zod — ✅ LANDED `zod@4.3.6`（exact）
- `modules/SrcSharedA.tsx`：删除 vendored zod v4.3.6 核心（原 §2–§8，文件原行 480–4059），替换为 `import * as zod from 'zod'` + 语义名 shim 包装（zString/zNumber/zBoolean/zUndefined/zUnknown/zNever/zDate/zArray/zObject/zUnion/zDiscriminatedUnion/zRecord/looseRecord/zEnum/zLiteral/transformPipe），全部返回 `any`，保持原 `ZodInst=any` 类型面 → 零新增类型错误。
- 导出面不变：原已导出名保持导出（含经 §15 export 块的 zUndefined/zDate/looseRecord），transformPipe 保持模块内私有。§0 脚手架类型未动。
- diff：SrcSharedA.tsx **+60 / −3,562**（vendored 主体净删除 ~3,502 行）。
- 期间修复：zUnion/zDiscriminatedUnion 参数 `options: any[]` → `options: any`（TS2345，非空元组约束；参数注解，非 `as any`）。

### 2. qrcode — ✅ LANDED `qrcode@1.5.4`（exact）+ devDep `@types/qrcode@1.5.6`
- Bots.tsx、PaymentDeep.tsx：各移除 1 条 `declare const qrcode`（bundle 符号 Qq），改 `import * as qrcode from 'qrcode'`；调用点 `qrcode.toDataURL(text, {margin,width})` 未动。
- diff：Bots.tsx +4/−4；PaymentDeep.tsx 含在下方合并数内。

### 3. useVirtualizer — ✅ LANDED `@tanstack/react-virtual@3.14.10`（exact）
- 5 处 declare → `import { useVirtualizer } from '@tanstack/react-virtual'`：Composer.tsx、Conversation.tsx、FileTreePanel.tsx、GitReview.tsx、Home.tsx。
- Conversation.tsx：`useMessageListVirtualizer` 确认仅为 `useVirtualizer` 的直接别名（bundle 锚点核对），以 `const useMessageListVirtualizer = useVirtualizer;` 保留语义名。
- FileTreePanel.tsx：移除孤儿 `Virtualizer` 接口；保留 `VirtualItem`（props 消费，行 1319/1358/1844）。GitReview.tsx：移除 2 个本地接口。
- LegacyDocEngineC3 的 useVirtualizerContract/useWindowVirtualVirtualizerContract（L389/391）为 first-party 契约 —— 未动（按指令）。
- 期间修复（均为最小调用面适配，语义不变）：
  - Conversation：`measurementsCache.find((entry: {key: string|number})…)` 去注解（`Key = number|string|bigint`，TS2769）。
  - FileTreePanel：`scrollDirection: virtualizer.scrollDirection ?? undefined`（`ScrollDirection | null` → `string | undefined`，TS2322）。
- diff：Composer +4/−11 · Conversation +11/−33 · FileTreePanel +6/−15 · GitReview +5/−16 · Home +4/−11。

### 4. react-resizable-panels — ⏸ DEFERRED（整库回退，未安装）
- 现状：ExtendedViews.tsx L946 起的 PanelGroup/Panel/PanelResizeHandle 均为 declare；vendored 引擎本体从未转录。
- 裁决理由：bundle 真值（jsx 111263–111292）显示消费面是 X4/Z4/Q4 三个 first-party 封装（useDefaultLayout+Group、=Panel、Separator 包装），react-resizable-panels v4.x 的 API（字符串尺寸 "320px"/"100%"、getSize().asPercentage/inPixels）与 4 处消费面的 declare 形状各异；迁移需新写封装层代码（含 Q4 的大段精确 className），且布局/拖拽行为属运行时/视觉面，本批 gate（tsc/esbuild）无法验证。按「partial broken state 不可接受」原则整库暂缓。
- 处置：已卸载该包（package.json 无残留）；ExtendedViews.tsx 零改动（git diff 为空）。

### 5. Stripe — ✅ LANDED `@stripe/stripe-js@9.6.0` + `@stripe/react-stripe-js@6.4.0`（均 exact）
- 版本裁决：bundle 内版本标记实测 `react-stripe-js version: 6.4.0` / `stripe-js version: 9.6.0`（styles jsx 双版本并存，与 A0-PROGRESS S3 表一致）；调用面（Elements/useStripe/useElements/CardNumberElement/CardExpiryElement/CardCvcElement/loadStripe）与 6.4.0/9.6.0 API 完全吻合 → 按 bundle 原版本钉死。
- PaymentDeep.tsx：移除 7 条 declare（StripeElementsProvider/useStripe/useElements/CardNumberElement/CardExpiryElement/CardCvcElement/stripeLoader），改 npm import；`Elements as StripeElementsProvider` 保留语义名。
- 期间修复：handleSubmit 的逗号表达式 null 守卫拆为独立语句（TS18047 ×3；TS 不穿透逗号表达式收窄；语句顺序与调用次序不变，语义保持）。
- diff：PaymentDeep.tsx（含 qrcode）**+19 / −11**。

### 6. xterm — ✅ LANDED（裁决后迁移）`@xterm/xterm@5.5.0` + `@xterm/addon-fit@0.10.0`（均 exact）
- **消费方式判定**：declare-only（XtermModule/XtermFitAddonModule + 11 个本地接口）；vendored 本体从未转录（X14「登记不还原」），消费限于 TerminalPane.tsx 单文件。
- **版本误归纠正**：旧注「`nHt='3.7.8'` 起始」系误归 —— 该版本号实属 **js-base64@3.7.8**（jsx 134112，base64 字母表/atob/btoa/toBase64URI 上下文确证）。xterm 真实版本经 bundle 指纹裁决 = **5.5.0**：
  - `documentOverride` 存在 → 排除 5.3.0；
  - 5.5 专有标识 `rescaleOverlappingGlyphs`/`allowRescaling`/`isEmoji`/`blink_block_$` 全部存在；5.4 专有 `blink_box_shadow_` 缺失 → 排除 5.4.0；
  - FitAddon UMD 与 @xterm/addon-fit 0.9.0/0.10.0 dist 标识符全同（两版 dist 逐字节相同）。
- **路由选择**：xterm 5.5.0 仅以 @xterm/xterm@5.5.0 发布（旧 `xterm` 包末版 5.3.0）→ 采用 @xterm/xterm，即 bundle 内同一代码的改名后包，非「不兼容迁移」。
- **API 兼容性核对（5.5.0 d.ts 逐项）**：`parser.registerOscHandler(52, cb)`、`input(data, wasUserInput?)`、`textarea`（公开）、`registerLinkProvider`/`ILink{range: IBufferRange{start/end:{x,y}}, text, decorations?, activate}`、`ILinkHandler{activate(event,text,range), allowNonHttpProtocols?}`、`IWindowsPty{backend?: 'conpty'|'winpty'}`、`ITerminalAddon{activate(terminal)}` —— 全部与调用面结构兼容。
- **declare 转换**：移除 `declare const XtermModule`、`declare const XtermFitAddonModule` 及 31 行 `XtermTerminalInstance` 接口 → `type XtermTerminalInstance = Terminal`（语义名保留，3 处用型点零改动）。三个内部句柄改走 5.5 公开 API：`registerOscHandlerCompat?.(52,…) ?? null` → `parser.registerOscHandler(52,…)`；`inputCompat?.(data,false)` → `input(data,false)`；`term._core?.textarea` → `term.textarea`。
- 类型契约最小适配：`XtermWindowsPty.backend: string` → `"conpty" | "winpty"`（xterm IWindowsPty 契约；该字段无其他消费点）。
- diff：TerminalPane.tsx **+24 / −54**。bundle 模式解析验证：459kb 输出含 xterm/FitAddon 实体。

## 二、汇总数字
- vendored 代码删除：**3,562 行**（SrcSharedA.tsx，zod 核心；净 −3,502）。
- declare 转换：**16 条**（qrcode 2 + useVirtualizer 5 + Stripe 7 + xterm 2）+ XtermTerminalInstance 接口→别名 1 + 辅助本地接口移除 3（FileTreePanel Virtualizer、GitReview ×2）。
- 新增 npm 依赖：7（全部 exact 钉版）；devDep 1（@types/qrcode）。
- 新增 @ts-expect-error/@ts-ignore/as any：**0**（git diff 全量审计）。

## 三、tsc 增量（gate b）
| 时点 | errors | 说明 |
|---|---|---|
| 基线 /tmp/tsc-now12.txt | 2 | TopBar S4 stub ×2 |
| zod 落地后 | 2 | 回基线 |
| qrcode 落地后 | 2 | 回基线 |
| react-virtual 落地后 | 2 | 回基线 |
| Stripe 落地后 | 2 | 回基线 |
| xterm 落地后（终态） | 2 | 与基线逐条 diff 完全一致（同文件同行） |

无任何文件 error 数增加。

## 四、Gate 结果（全部通过）
- **a. esbuild 逐文件**：SrcSharedA / Bots / PaymentDeep / Composer / Conversation / FileTreePanel / GitReview / Home / TerminalPane 共 9 文件，均 **0 errors**；TerminalPane 另做 bundle 模式解析验证（@xterm/xterm、@xterm/addon-fit 正常内联，459kb）。
- **b. tsc 总量**：2 = 基线 2，逐条一致（见上表）。
- **c. ground truth md5**：`src-HCld2afU.js` = `f5edd6a1207c6d20008204829dad3923` ✓ · `styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5` ✓。
- **d. git 作用域**：改动全部位于 `desktop/src/src/`（9 个 modules/*.tsx + package.json + package-lock.json）；ExtendedViews.tsx 零改动（panels 回退干净）；`web/` untracked 与 A0-PROGRESS.md modified 均为批前既有状态。

## 五、版本登记表（供 A0-PROGRESS.md S3 台账录入）

| 库 | 钉版 | 状态 | 落点 |
|---|---|---|---|
| zod | 4.3.6 | ✅ landed | SrcSharedA.tsx（shim 再导出，−3,562 行） |
| qrcode | 1.5.4（@types/qrcode 1.5.6 dev） | ✅ landed | Bots.tsx、PaymentDeep.tsx（2 declares） |
| @tanstack/react-virtual | 3.14.10 | ✅ landed | Composer/Conversation/FileTreePanel/GitReview/Home（5 declares） |
| @stripe/stripe-js | 9.6.0 | ✅ landed | PaymentDeep.tsx（bundle 版本标记吻合） |
| @stripe/react-stripe-js | 6.4.0 | ✅ landed | PaymentDeep.tsx（bundle 版本标记吻合） |
| @xterm/xterm | 5.5.0 | ✅ landed | TerminalPane.tsx（bundle 指纹裁决；旧注 3.7.8 系 js-base64 误归） |
| @xterm/addon-fit | 0.10.0 | ✅ landed | TerminalPane.tsx（0.9.0/0.10.0 dist 逐字节相同，取 5.5.0 配对版） |
| react-resizable-panels | — | ⏸ deferred | ExtendedViews.tsx declares 保留；需封装层重建（X4/Z4/Q4）+ 运行时验证，本批 gate 不覆盖 |

## 六、遗留事项（移交后续批次）
1. **react-resizable-panels**（S3 后续）：需按 jsx 111263–111292 重建 X4/Z4/Q4 封装（useDefaultLayout+Group / Panel / Separator+精确 className），并安排布局/拖拽运行时验证。
2. **xterm 样式**：xterm.css 未在本批引入（现样式面源自 bundle 派生的全局样式）；若后续独立构建需 `@xterm/xterm/css/xterm.css` 接线，随构建批次处理。
3. A0-PROGRESS.md L49「xterm 3.7.8 ⚠ 需裁决」条目可按上表更新为已裁决（本批未改该文件）。
