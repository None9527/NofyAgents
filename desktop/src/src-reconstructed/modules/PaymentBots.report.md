# B5-04 批次报告 —— 支付深部 F12 第二符号组 + Bots 族 F11 逐字重建

- 输入（只读）：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`
  - 本机口径 213,979 行；md5 `48d71d4874b0868d61fd35a328bf6ad5`（批前/批后抽验一致，未改动）
  - 旧账（213,695 行）偏移：A 段 +48、B 段 +46（MODULE-MAP/COVERAGE-LEDGER 旧行号 → 本机行号）
- 对照：`desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty 版，仅对照）
- 产物（仅写入 `desktop/src/src-reconstructed/modules/`）：
  - `PaymentDeep.tsx` — **12,066 行**（A 段：本机 js 76612–90179 逐字重建 + 头映射表/尾符号表）
  - `Bots.tsx` — **2,209 行**（B 段：本机 js 147772–149599 逐字重建 + 头映射表/尾符号表）
- 登记来源：`B5-FULL-DECODE-PLAN.md` §0/§1/§3、`COVERAGE-LEDGER.md` §a F12/F11 行、§c 第 2/5 项（行 121/124）、行 76/80、`MODULE-MAP.md` §F12/§F11
- 前序：`UsageDeep.tsx`（第一符号组 76101–76563 等，本批不重复）；`VENDOR-MANIFEST-LIBS.md`（qrcode 登记）
- 约定范本：`ConversationLeaves.tsx`（文件头映射表 + 文件尾符号表）、`SYMBOL-INDEX.md` §0

---

## 1. 覆盖清单（符号 → 本机 js 行）

### 1.1 A 段 — PaymentDeep.tsx（本机 76612–90179）

| 分区 | 本机 js 行 | 核心符号（混淆 → 语义） | 把握度 |
|---|---|---|---|
| §1 上下文用量弹层 | 76612–76843 | `j3e`→ContextUsagePopover (76678)、`y3e/Aq/b3e/x3e/S3e/C3e/w3e/T3e/E3e/D3e/O3e/k3e/A3e` 分解/缓存命中/色板助手 | 高 |
| §2 工具条配置选择 | 76844–77061 | `Mq`→ConfigSelect (76912 / jsx 67907)、`M3e…H3e` 标签/图标/测试 id 助手 | 高 |
| §3 思考级别机制 | 77127–77451 | `Pq`→ThoughtLevelControl (77164)、`Y3e/X3e/Z3e/Q3e/$3e` 循环与快捷键 | 高 |
| §4 供应商/模型菜单机制 | 77452–78455 | `Iq/Lq/Hq/T6e/k6e/N6e` 等 ~70 函数（指纹族/团队计划选项/菜单分组/调和），终于 `$6e` reconcileConfigOptionsModel | 高 |
| §5 支付/产品域 | 79693–80954 | `e5e`→CodingPlanPaymentQrDialog (80027 / jsx 70564)、`$8e` QrHost、`s5e` useCodingPlanProducts (80369)、`wJ` productErrorMessageOf (80672)、`iJ/rJ/nJ/aJ/tJ/z8e/cJ/U8e` 金额与产品助手、`CJ` InfoNoticeCard、企业目录/估算族 `TJ…B5e` | 高 |
| §6 Stripe/验证码/PayPal/订单 | 81732–84459 | `Y7e` StripeCardDialog (81807)、`J7e` StripeCardDialogEntry (81798)、`t9e` AddStripeCardForm、`H9e` useCodingPlanPurchase (83232 区)、`TY` useEnterpriseCodingPlanProducts (83745)、`MY` useStartPlanPreview (84302)、`aet` 企业面板购买 (83841)、`EY` codingPlanProviderOfStart (83815)、TCaptcha 块（appId `196026326`）、`W7e` Stripe live key (81742)、`NY` ZH_CHECKOUT_POLICY_COPY（84392 区逐字）、`bet…jet` URL 表 | 高 |
| §7 zet 对话框族 | 84460–85995 | `zet`→CodingPlanPurchasePanel (84460 / jsx 74125)、`Bet` PendingOrderDialog (85328)、`Vet` PlanSelectSections、`Wet/Get/Ket` 团队/起始/个人计划卡、`qet` UnavailableProductButton、`Jet` FromPriceLabel、`Yet/Xet` 计费周期选择 | 高 |
| §8 Zet 结账+政策 | 85996–88046 | `Zet`→EnterpriseCheckoutPanel (85996)、`FY` CheckoutSection、`$et/ett/ttt/ntt` 席位/时长/购买方式、`rtt/itt` 余额、`att/ott` 估算条、`dtt/ftt/ptt` 支付确认、`htt/gtt/btt/xtt/Stt/zY/BY` 政策块（中文文案逐字）、`Ott` PaymentStage、`ktt` PurchaseSuccessView、`HY/Ltt/Rtt/UY/Wtt` 团队产品推导、`snt/YY/unt/dnt/QY/gnt` 行动态解析、`eX` EquityItemLabel、`ynt/bnt` 卡片文案 | 高 |
| §9 权益/条目/工具条 | 88047–89988 | `xnt`→startPlanEntitlementRowsOf (88047 / jsx 76242)、`Snt/Cnt/wnt/Tnt` 权益文案、`Ent/tX/Dnt/Ont/knt/Ant` 计划组、`Mnt…nX` 漏斗 slug、`Hnt` panelTitleOf、`Unt/Wnt/Gnt` env 快照/域、`iX/aX/oX/Xnt` 供应商条目表、`sX` useCodingPlanEntitlements、`lrt` codingPlanEntryStatusOf、`urt/drt/frt` 团队菜单注入、`Ort` CodingPlanUpgradeDialog、`dX/krt/fX/Art` 上下文/Provider、`pX/jrt/Mrt/mX/Nrt` 计划源、`Prt…Lrt` 侧栏偏好、`Rrt…Urt` 工具条配置解析、`qrt` ModePickerTrigger、`Xrt`→SessionModePicker (89343 / jsx 77471)、`Zrt` memo、`eit/tit/nit/rit` 选择解析、`iit`→SessionModelToolbar (89503)、`ait` memo、`oit/sit/cit` | 高 |
| §10 上下文芯片 | 89989–90179 | `lit`→WebElementsChip (89989 / jsx 78047)、`uit`→SelectionsChip (90097 / jsx 78080)（F08 双归属注记） | 高 |

A 段 first-party 余量：全部随上述分区转录（含 §8 的 `Itt/Jtt/qY/ztt/Btt/Vtt/GY/Htt/Ktt/qtt/Ytt/Xtt/Ztt/Qtt/$tt/ent/tnt/nnt/rnt/int/ant/ont/cnt/lnt/XY/fnt/ZY/pnt/mnt/hnt/$Y/_nt/vnt`，§9 的 `trt/cX/nrt/rrt/lX/irt/art/ort/srt/crt/Jrt/Yrt/Qrt/$rt/Wrt/Grt/Krt` 等），无遗漏段。

### 1.2 B 段 — Bots.tsx（本机 147772–149599）

| 分区 | 本机 js 行 | 核心符号（混淆 → 语义） | 把握度 |
|---|---|---|---|
| 域数据 | 147772–147812 | `vLt`→BOT_PROVIDERS (147772 / jsx 122849)、`yLt/bLt/xLt/SLt` 通道元数据 | 高 |
| 区域/入口 | 147813–147837 | `CLt`→regionTagKeyOfProvider (147813 / jsx 122908)、`wLt/TLt` 入口、`ELt…NLt` 图标/常量 | 高 |
| 助手 | 147838–147889 | `PLt/g8/_8/FLt/ILt/LLt/RLt`（绑定码/命令/工作区校验） | 高 |
| 视图 | 147890–148603 | `zLt` (147890 / jsx 122972)、`BLt` (148005 / jsx 123029)、`VLt/v8`、`HLt` (148049 / jsx 123082)、`ULt` (148125 / jsx 123116)、`WLt` (148500 / jsx 123254) — 飞书/Telegram/微信/Webhook 绑定表单 | 高 |
| 根 | 148604–149472 | `GLt/KLt` 状态、`qLt`→BotsDialog (148619 / jsx 123319)；`bots.*` i18n 73 处（147875–149415，键名原样保留） | 高 |
| 尾段（F17 双归属） | 149473–149599 | `JLt/YLt/XLt/ZLt/QLt/$Lt/eRt/tRt/nRt`（remoteControl 文案解析，消费方 `rRt` 属 B5-05） | 高 |

---

## 2. 边界裁决（只记录，不改既有件）

1. **76101–76563（第一符号组）**：已入 `UsageDeep.tsx`（s3e/v3e 配额标签 76294/76540 本机口径等），本批排除，仅在 PaymentDeep §0 declare 接口（s3e…g3e）。
2. **76034–76156 `yq/J4e/X4e/Z4e/Q4e`**（popover 原语）：F08 已认领段，本件仅 declare 使用。
3. **77062–77126 `U3e/W3e/G3e`**（思考级别表）：F08 Composer 认领（旧账 77014–77079），唯一消费者在本段；双归属注记，本件仅 declare（THOUGHT 表）。
4. **78456–79690（旧账 78408–79978）qrcode 生成库**：vendored，`VENDOR-MANIFEST-LIBS.md` 登记，不转录；PaymentDeep 仅 declare `Qq` 包装接口。
5. **80955–81731 Stripe vendored**（@stripe/react-stripe-js 6.4.0 + @stripe/stripe-js 9.6.0，`V5e…F7e`）：版本登记，不转录；§6 以 declare 接口（ElementsProvider/useStripe/useElements/Card*Element/stripeLoader）。
6. **90180–90227 `dit/fit/pit/mit`**：已随 Home.tsx 抽取，只注记，未转录。
7. **89989–90179 `lit/uit`**：任务范围含 89989–90179 余量，予以转录（§10），标注 F08 Home 族双归属。
8. **B 段外扩**：任务口径 147767–149553；实际转录 147772–149599（含 `vLt` 数据表起点 147772 与尾段 `nRt` 149571–149599）。`hLt/gLt/_Lt`（Avatar 原语，他族）排除；`YLt…nRt` 尾段按双归属转录（消费方 `rRt` 归 B5-05）。
9. **`aM/tM/nM/iM/AUe`**（52604–52661 区）：UsageDeep/F08 已抽取（shouldProbeStartPlanEntitlement 等），本件 declare 双归属；`nM` 命名 `providerFingerprintKeyOf` 以别于 §4 `z6e`→providerFingerprintOf（指纹对象），避免同名冲突。
10. **`tr`（isZaiCodingPlanProvider）**：跨 chunk 导入，本件 declare；`Lq` 已在 §4 转录（teamOrganizationLabelOf），§9 `prt` 委托之。
11. **`ko` 单一 store**：原 chunk 中 `ko` 同时提供 `theme`（82520/140676）与 OAuth/user 字段（88897–88901），裁决为同一 store（`useAppStore`），两处用法保留。
12. **`unt` 前向引用**：§7a handleSelectPlan 按源引用 `unt`，其定义在 §8（`subscriptionGateActionOf`，本机 87932）；已在 §7a 调用点改用语义名。
13. **`tX`（hasProductPreview）**：定义在 §9（88098），被 §6/§7 消费——函数声明提升保证顺序无关，按源位置转录。

---

## 3. 验证记录（四项门禁）

### 3.1 门禁 1 — esbuild（两件各跑）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/PaymentDeep.tsx --loader:.tsx=tsx --jsx=preserve  → exit 0（0 错）
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/Bots.tsx        --loader:.tsx=tsx --jsx=preserve  → exit 0（0 错）
```

### 3.2 门禁 2 — tsc strict（/tmp/tsconfig.<name>.json）

配置：`strict`、`target ES2022`、`lib [ES2022, DOM, DOM.Iterable]`、`jsx preserve`、`module ESNext`、`moduleResolution Bundler`、`typeRoots → web/node_modules/@types`、`include` 仅该产物。

```
web/node_modules/.bin/tsc -p /tmp/tsconfig.PaymentDeep.json → 0 error
web/node_modules/.bin/tsc -p /tmp/tsconfig.Bots.json        → 0 error
```

（修复历程：PaymentDeep 首轮 60 条 → 逐条修复：`unt` 语义名回代、`ko` 统一 useAppStore、`nM` 改名避让 `z6e`、AmountSummaryCard 可选 props、`{force}` refresh 参数、Map 泛型、隐式 any 21 处等；终轮 0。）

### 3.3 门禁 3 — 锚点回代（≥8；下表 16 项全中，原始 chunk 逐字）

| # | 符号 | 原始行 | 锚点内容 | 结果 |
|---|---|---|---|---|
| 1 | `Mq` | 76912 | `function Mq({` | ✅ 逐字 |
| 2 | `e5e` | 80027 | `function e5e({` | ✅ 逐字 |
| 3 | `s5e` | 80369 | `function s5e(e, t) {` | ✅ 逐字 |
| 4 | `wJ` | 80672 | `function wJ(e, t) {` | ✅ 逐字 |
| 5 | `W7e` | 81742 | `pk_live_51Rh0IhRp8…`（107 字符全量比对） | ✅ 逐字 |
| 6 | `MY` | 84302 | `function MY(e) {` | ✅ 逐字 |
| 7 | `NY` 文案 | 84392 | `accountPolicyDescription: \`仅限订阅人…或以任何形式…\`` 全串比对 | ✅ 逐字 |
| 8 | `zet` | 84460 | `function zet({` | ✅ 逐字 |
| 9 | `Bet` | 85328 | `function Bet({` | ✅ 逐字 |
| 10 | `Zet` | 85996 | `function Zet({` | ✅ 逐字 |
| 11 | `xnt` | 88047 | `function xnt(e, t) {` | ✅ 逐字 |
| 12 | `Xrt` | 89343 | `function Xrt({` | ✅ 逐字 |
| 13 | `iit` | 89503 | `function iit({` | ✅ 逐字 |
| 14 | `vLt` | 147772 | `var vLt = [` | ✅ 逐字 |
| 15 | `CLt` | 147813 | `function CLt(e) {` | ✅ 逐字 |
| 16 | `qLt` | 148619 | `function qLt({` | ✅ 逐字 |

附加逐字抽验：`sticky bottom-0 z-10 -mx-6 -mb-6 …` 类名串、`…enterprise.autoRenewAuthorization` 等 i18n 键、`196026326` 验证码 appId、`bots.*` 键多重集（73 处，`uniq -c` diff 与原始完全一致）。jsx 对照行（67907/70564/74125/76242/77471/122908/123319 等）按 MODULE-MAP 登记，锚点收集步已对照 pretty 件。

### 3.4 门禁 4 — 报告完整性

本报告含覆盖清单（§1）、边界裁决（§2）、验证记录（§3）、符号表（§4，详表见两件产物文件尾）。

### 3.5 只读纪律抽验

```
md5 desktop/src/out/renderer/assets/styles-CdEGpc2x.js
→ 48d71d4874b0868d61fd35a328bf6ad5   （批前/批后一致）
```

---

## 4. 符号表（摘要）

完整「混淆名 → 语义名 → 行号」表见产物文件尾注释：

- `PaymentDeep.tsx` 尾符号表：§1–§10 全量（A 段 ~350 符号，含排除注记）。
- `Bots.tsx` 尾符号表：F11 全族（域数据/区域入口/图标常量/助手/视图/根/尾段 7 组）。

核心对照（与 MODULE-MAP §F12/§F11 登记一致，行号为本机口径）：

| 混淆名 | 语义名 | 本机 js 行 |
|---|---|---|
| `j3e` | ContextUsagePopover | 76678 |
| `Mq` | ConfigSelect | 76912 |
| `e5e` | CodingPlanPaymentQrDialog | 80027 |
| `zet` | CodingPlanPurchasePanel | 84460 |
| `Zet` | EnterpriseCheckoutPanel | 85996 |
| `xnt` | startPlanEntitlementRowsOf | 88047 |
| `Xrt`/`Zrt` | SessionModePicker / memo | 89343 / 89415 |
| `iit`/`ait` | SessionModelToolbar / memo | 89503 / 89958 |
| `CLt` | regionTagKeyOfProvider | 147813 |
| `qLt` | BotsDialog | 148619 |

---

## 5. 遗留问题

1. `sX`（useCodingPlanEntitlements）依赖的 `$j/aM/tM/nM/Bj` 为 UsageDeep/F08 双归属接口，接口语义按 52604–52694 区原文 declare；若 F08 件最终命名调整，需同步本件 §0 declare。
2. `Hq/L/N6e/r6e/T6e/k6e`（模型分组机制）在原始 chunk 中属 77452–78455 与跨 chunk 混合体；本件按接口级 declare + §9 调用点逐字，未展开其内部实现（归属 §4 已转录部分之外者为他批次）。
3. `ko` store 的 theme 与 OAuth 字段同源裁决基于原始调用点证据（82520/88897–88901/140676）；如后续发现 store 分裂证据，需回改 §0 declare 注释。
4. B 段尾 `YLt…nRt`（149473–149599）消费方 `rRt` 属 B5-05；本件仅转录供给侧。
5. 旧账/本机行号偏移（A+48/B+46）已在两件产物头注与本报告中双口径标注；SYMBOL-INDEX 汇总时请以本机口径为准。
