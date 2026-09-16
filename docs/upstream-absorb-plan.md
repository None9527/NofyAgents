# 上游吸收方案:1.0.11 尾差 → 1.0.24

制订日期:2026-09-13。本文是 `docs/upstream-sync.md` 台账的路线图附件:
台账记录"已同步到哪、哪些有意分歧",本文回答"剩余缺口怎么吃"。
批次完成后仍回填台账,本文只做进度勾选与决策登记。

## 1. 缺口结论(数据)

| 项 | 值 |
|---|---|
| 当前吸收前沿 | 上游 1.0.10(批1–批23,台账落点 77cd7eb;本地 0.2.159) |
| 剩余版本 | 1.0.11(尾差,需对账)→ 1.0.24 |
| 剩余上游提交 | 9684fa3c(08-27,无 changelog,仍标 1.0.10)、bc7f02ed(08-28,**1.0.11+1.0.12**)、bb7f39d5(08-31,1.0.12改+**1.0.13**)、72a61251(09-01,**1.0.14+1.0.15+1.0.16**)、75810042(09-08,**1.0.17–1.0.24 八版**)、37949780(09-09,无 changelog);批24 校正:原表偏移约一版,**对账单位是 changelog 条目而非提交**,批次边界跨提交边界 |
| 原始 churn | 约 +38.7 万 / −33 万行(含上游内部重构虚高,实际移植面远小于此);批24 复测:净 diff(77cd7eb..upstream/main)= **+323,720/−225,805**(2969 文件),逐提交求和 = +358K/−290K——原值接近求和口径,净 diff 更低,「虚高」判断成立 |
| blob 交集佐证 | HEAD∩上游 1.0.10 = 726 → ∩1.0.12 = 491(断崖即未吸收的 pager input 重构);批24 复测:HEAD∩77cd7eb=818、HEAD∩bc7f02ed=571(落差 247),绝对值因 HEAD 又走 336 提交且含 desktop/ 而偏高,**断崖定性成立** |
| 上游 changelog | `crates/codegen/xai-grok-shell/changelogs/1.0.x.md`,缺口内每版都有,批前必读 |

## 2. 总策略

1. **沿用批机制,不新造流程**:每批仍走台账标准流程第 1–6 步
   (`upstream_diff.sh` 摸底 → 归一移植 → cargo check/test → detect_changes → 中文提交 + 版本递增 → 冒烟)。
2. **版本 × 主题双维切批**:小版本合批,大集群独占一批;每批一个自包含主题。
3. **三个巨提交禁止整树吸收**:bc7f02ed(1258 文件,pager input 重写)、
   bb7f39d5(1426 文件,shell 重构)、75810042(1944 文件,登录/遥测/反馈接入)。
   一律按 changelog 条目外科手术,结构级重构只在成为前置依赖时单独决策。
4. **分歧表先行**:摸底时先查台账「有意分歧」,命中即跳过;新跳过项当批登记。
5. **云红线**:DELETED-CLOUD-LEDGER 已物理删除云联路(登录/计费/remote_sync/
   feedback 上传/hub_auth 等),吸收严禁回流;凡依赖 xAI 云端的条目直接跳过。

## 3. 批次路线图(自批24 起)

### 批24|预检对账(不动代码,半天)—— ✅ 已完成(2026-09-13)
- [x] `scripts/upstream_diff.sh --changed 77cd7eb6..upstream/main` 产出剩余改动面清单。**前置工具修复**:原 normalize sed 表仅 21 条 crate 枚举,缺口核心 crate(tool-runtime/tool-protocol/grok-compaction/computer-hub-*/grok-agent/mcp/models/auth/config/... 约 50 个)不在表内,跑出 80/80 全「缺失」假阴性;已改为 4 条统一规则(`xai-grok-`→`nofy-` 等),并修 `--changed` 范围解析(尾随 `..` 自动补 `upstream/main`,避免误解析到含 336 桌面提交的本仓库 HEAD)、扩到全文件类型、按 crate 汇总 + 全量落盘去 `head -80` 截断。详见台账「工具修复记录」。
- [x] 摸底结果:2969 文件(.rs 2738),存在 1877 / 缺失 1092;缺失大户 pty-harness +280、shell +280(即 bc7f02ed/bb7f39d5 两巨提交的新增面,印证红线)、pager +122、tool-protocol +58。完整清单 `/tmp/upstream_changed_20260913_060901.txt`。
- [x] 9684fa3c 对账:442 文件 +44K,无 changelog(仍标 1.0.10),经 `git merge-base --is-ancestor` 确认**非锚点 77cd7eb(实际 08-25)祖先、在缺口内**(台账基线表括号内 08-28 是本地完成日,非上游提交日)。其改动面已含在摸底 2969 文件总数内;有 changelog 覆盖的部分随 1.0.11/1.0.12 归批25,**无 changelog 覆盖的残余(若有)需批25 摸底时按文件单独 triage**,不默认吃净。
- [x] 1.0.11 changelog 逐条对账(17 条):已移植 4(headless picker/默认权限模式/mkdir·touch 安全清单/含批16·21·22 证据)、跳过 1(/voice)、渲染存在接线待核实 2(回合时长/脚注)、待核实或待移植 10(其中 monitor 10h 默认超时为**确认待移植**,`tools/config.rs` 仍有 `PRODUCTION_MAX_TIMEOUT_SECS=36_000`)。待核实项归入批25(1.0.11 与 1.0.12 同落 bc7f02ed,代码面交织)。详见台账「1.0.11 尾差对账」表。
- [x] 08-13 波 10 crate + 其他 11 个整 crate 缺失逐个定性:移植立项 1(session-search,批33)、跳过/登记分歧 9(diag-server/workspace-daemon/update/mixpanel/login/dashboard-store/feedback/voice/gboom)、降维评估 2(otel/compaction-transcript)、待评估 4(session-events/active-sessions/foreign-sessions/fuzzy-file-search,留对应批次按 changelog 触发)、维持计划原条目 2(image/message-delivery-core)。详见台账「缺失 crate 定性」表。
- [x] 验收:台账已新增「缺口清单(批24 对账)」小节,含摸底数据/映射校正/1.0.11 对账/crate 定性/工具修复/批25 前置六部分,本文路线图批号与之一一对应。
- [x] 分歧表补登 `xai-grok-update`(身份清理已删 `nofy update`,原无显式条目,免后续批重复评估)。

> **批25 前置(阻塞)**:当前工作树 47 文件未提交(+1909/−575),是在飞的 Desktop 第一方 MCP server 实现(批31 决策点 #6)+ D 系列收尾,正好覆盖批25 操作面(nofy-mcp/servers.rs、worktree、permission、config)。批25 起须先:① 提交或暂存在飞工作;② 固化桌面 seam 基线;③ 干净树上复测三路测试基线。详见台账「批25 前置条件」。

### 批25|1.0.12 集群 —— ⛔ 调查后定论:无法外科提取,触发红线「结构级重构单独决策」(2026-09-13)
原列:context 估算(含 reasoning)与 rewind/模式切换 token 校正、压缩进度即时更新、worktree 跳过 stale reflog、MCP 瞬断重试、interjection 后子代理等待、权限提示友好化;跳过 credit upsell。

**摸底/读上游完成,定论见台账「批25 调查定性」+「批25 结构决策点」。1.0.12 头条项三重障碍,无可干净移植的高价值项:**
1. **嵌红线巨提交结构重构**:token 计数实现在 `sampler_turn.rs`,bc7f02ed 改其 **786 行**(+turn.rs 395、新增 turn_task.rs 259),属"pager input 重写"巨提交的 turn 执行重构,红线禁整树吸收;4 行测试期望(102_000→101_750,reasoning base64 *3/4 校正)只是表层。
2. **依赖未吸收的 9684fa3c 基线**(1.0.10 第二落点 +442 文件):rewind 改动引用 `prepare_image_strips_for_rewind`/`cancel_active_sampling_requests` 等,我们树全缺(锚点停在 77cd7eb)。
3. **该基线核心是云表面**:`context_snapshot.rs`(+462,`#[path] mod` 接入 acp_session.rs)依赖 `POST {xai_api_base_url}/tokenize-text` 云 tokenizer,按云红线**应跳过**。

> 早期"批25a/25b 大移植"定级**作废**:context_snapshot+462/rewind219/compaction_context163 是 `77cd7eb..upstream/main` **缺口累积**数,非 1.0.12 单版(bc7f02ed 单版 rewind 仅 16 行、compaction_context 未改)。
> **版本逐批模型在 1.0.12 处失效**:bc7f02ed 结构重写 + 9684fa3c 含云未吸收基线。余条(MCP 重试/worktree reflog/interjection/截断措辞/monitor/credit)前已定性分歧纠缠或关闭。
> **方法论校准(2026-09-13 用户裁定,取代 A/B/C 照搬框架)**:吸收目标不是原样合并每项上游改进,而是**以上游为参照、提炼推进我们架构合理性的想法、用我们自己的(BYOK/无云/已分歧)架构原生实现**。上游 diff 缠在结构重构里无关紧要——原生实现想法即可。A(结构对齐立项)通常不必要;B(登记分歧)仅用于想法对我们无价值/与架构冲突;C 升级为"取离散**想法**原生实现"。
> **批25 原生实现已落地两条**(校准后方法:上游作参照、提炼想法、原生实现,非照搬 diff):
> - **①**(`0dfe1dac`)reasoning token 的 base64 校正(1.0.12「context 估算含 reasoning 更准」的架构无关洞察)——`nofy-token-estimation` 新增 `estimate_base64_tokens`,`estimate_item_tokens` 的 Reasoning 分支加密内容改用它;不碰上游缠在 sampler_turn 786 行重构 + 云 context_snapshot 的实现。
> - **②**(`25f53433`)rewind 保留 provider 开销、与压缩统一 ratio reseed(1.0.12「rewind 后 token 匹配 server 值」)——**消除我们树内部不一致**:压缩路径已用 ratio reseed 保留 provider 开销,rewind 路径却裸重估丢弃;提取共享助手 `reseed_tokens_after_shrink` 统一二者。验证:chat-state 376 / shell 5175(与基线一致)。
> **后续原生候选**(按架构合理性排序):③ 压缩起始即刷新 context bar(UX 润色非架构,中等 pager 手术,优先级低);④ MCP 瞬断重试 / 后台流式抑制 auto recap(韧性,需查与批15/批17 分歧相容性)。1.0.12 余条已定性非原生候选(worktree reflog 缠云面、interjection 缠结构分歧、截断措辞无对应、monitor 已对齐、credit 云跳过)。详见台账「批25 原生实现日志」。

### 批26|1.0.13 韧性集群(P0)
截断响应自动续传、瞬态推理失败(卡死/断连/5xx)自动重试 + 重试原因短提示、参数完整的截断工具调用照常执行、hook 可请求确认/延迟/后置上下文注入、会话保存断电加固、>2000px 大图防炸会话、MCP 启动不再卡固定 batch。决策点:重试策略落在我们 BYOK provider 层的哪一层(建议 sampler/模型客户端,与 1.0.14 的 per-model retry 一次设计)。

### 批27|1.0.14 模型管理集群(P0,与 D19/D20 直接交集)
**每模型 retry/rate-limit 配置**、**每 reasoning-effort 可声明不同模型 id**、PostToolUse hook 模型反馈、`nofy usage <session>` 持久化每回合 token/成本、prompt 建议跟随会话模型、压缩失败降级输入、Windows 下载压缩(跳过)。跳过:OIDC proactive refresh(分歧表:xAI 登录流)。mTLS per-model 证书列入决策点(企业需求再取)。

### 批28|1.0.15–1.0.17 启动与 MCP 集群
后台预开模型连接(首回复延迟)、新会话 MCP/启动钩子后台化、退出加速(memory consolidation 延后)、子代理/任务等待上限 10min→1h、MCP OAuth 死锁修复、ghost 建议保守化。决策点:MCP 2026-07-28 多轮 elicitation——我们协议版本钉在 V_2025_06_18,要么升协议要么降维适配,批11 适配点基础上评估。跳过:企业 requirements.toml(管控面)、bind-time MCP(视 workspace 集成需求)。

### 批29|1.0.18 大集群(条目制)
欢迎屏保持至首条消息 + 后台建会话(交互行为变化,决策)、block viewer 内引用、粘贴 Unicode 行分隔符防损、鼠标滚轮单行提示、resume picker 单次磁盘遍历、启动设置共享/后台 start hooks、auth 瞬态恢复(BYOK 适配)。决策点:Chart.js 图表渲染(TUI 内嵌图表价值 vs 依赖面)。跳过:managed policy 阻断、反馈模态(云)、图像生成参数(媒体已剔除)。

### 批30|1.0.19–1.0.21 集群
**/loop 任务常驻后台(breaking,决策)**、透明终端主题、resume 告知模型仍在运行的 loops/子代理/工作流、headless `--worktree`、mid-turn UI 冻结与退出崩溃修复、多行 bash 渲染、滚动 padding、权限模式在 plan mode 前后可见(1.0.21)、欢迎屏重复会话防抖。跳过:hub dashboard 表面措辞。

### 批31|1.0.22 大集群(P0)
**显式 `chat_completions` 设置不再被同 slug 兄弟模型覆盖**(对照我们 D20 的 configOf 接线,上游修法直接参考)、**内置工具名优先于用户 MCP 同名工具**、edit_file diff 显示真实行号、权限提示自动展开 diff、向已完成子代理续发消息、后台子代理完成消息带实际输出、`/compact instructions` 传给压缩后端、auto mode 拦截破坏性 `git checkout --`、前台命令 ~15s 转后台提示、MCP 连接器 re-auth 展示、会话打开不再因读 MCP 配置卡顿。决策点:**Desktop 第一方 MCP server**(与我们 nofy-desktop 集成是机会,可能正是桌面要的表面)、`grok-workspaced` daemon(Computer Hub 表面,倾向登记分歧)。

### 批32|1.0.23/1.0.24 收尾
表格内换行 URL/email 全链接、Esc 不再取消运行中的回合(改为提示用 Ctrl+C,行为变化,建议跟随上游)。收尾后:重跑全量测试基线(shell ~5242、pager ~8100、hooks 202+13 只增不减)、更新台账基线表落点为 37949780。

### 批33|可选新 crate(按需立项)
session-search(本地 SQLite FTS5 会话搜索,产品价值高,建议立项)、
message-delivery-core(1.0.14 interjection 原子交付依赖,批27 时评估)、
xai-dirs(上游后续若依赖再取)、otel 降维(只取 W3C trace-context 传播,OTLP 上报剔除)。

## 4. 缺口内新增 crate 处置表

| 上游 crate | 处置 | 理由 |
|---|---|---|
| xai-grok-gboom | 跳过 | 彩蛋射线追踪游戏 |
| common/xai-message-delivery-core | 批27 评估 | interjection 原子交付依赖 |
| xai-grok-otel | 降维 | 只取传播层,上报属云端 |
| xai-grok-login | 跳过 | 分歧表:xAI 登录流已剔除,BYOK |
| xai-grok-image | 评估 | 图像校验/转码;pager 粘贴图引用面变大再取 |
| xai-grok-feedback | 跳过 | 云上传(分歧表已有条目) |
| xai-grok-dashboard-store | 跳过 | hub dashboard 持久化,云表面 |

## 5. 风险与红线

- **pager input 重写冲突**:bc7f02ed 重写了 input 子系统(keyboard normalizer/line editor/mouse/macos_modifiers),而我们批18 已移植过 X10 鼠标重组等行为件。若确需结构级对齐,单独立项 + PTY e2e 全量回归,不夹带在其他批里。
- **桌面 seam 稳定**:内核改动不得破坏 `desktop/src/out/main/seam/*`(acp-agent-adapter、nofy-config-toml 等,PORTING-PLAN 阶段 A–E 的操作面);每批冒烟在 CLI 之外加桌面关键路径(发起会话/切换模型)。
- **命名归一漏网**:既有适配点已注明 sed 表易漏 `.grok/` 路径字面量与测试断言,apply 后全量 grep 复核;`_x.ai/`→`_nofy/`、`NOFY_*` env 同理。
- **测试断言方针**:批23 起按上游放宽(去措辞钉选),新批沿用该方针;仅上游"只放宽测试、实现未变"且我们有真实分歧的,保留严格断言并登记。
- **版本纪律**:`NOFY_VERSION=0.2.<n>` 注入(0.2.16x 递增),Cargo.toml 的 0.2.121 是永久占位;安装唯一位置 `~/.local/bin/nofy`。
- **上游移动目标**:开工前 `git fetch upstream` 复核 upstream/main 仍为 1.0.24(09-09);若出现新同步,先补台账再扩路线图,不在批中夹带。

## 6. 决策点登记(开工前拍板)

| # | 决策 | 建议 |
|---|---|---|
| 1 | Esc 不再取消回合(1.0.24) | 跟随上游 |
| 2 | /loop 常驻后台(1.0.19 breaking) | 跟随上游 |
| 3 | Chart.js 图表渲染(1.0.18) | 暂缓,登记分歧 |
| 4 | MCP 多轮 elicitation 协议升级 | 保持 V_2025_06_18,降维适配 |
| 5 | 欢迎屏后台建会话(1.0.18) | 跟随上游(与桌面首屏体验一致) |
| 6 | Desktop 第一方 MCP server(1.0.22) | 取——正是 nofy-desktop 想要的表面 |
| 7 | mTLS per-model(1.0.18) | 有企业需求再取 |
| 8 | session-search 本地搜索(08-13 波遗留) | 建议立项(批33) |

## 7. 节奏

历史速率:批13–批23 共 11 批 / 2 天(专注投入)。本缺口 9–10 批、含三个大集群,
预估 **2–3 周**;P0 链(批24→27)约 1 周,先拿到「自动重试韧性」与「模型管理面」
两大收益,其中批31 的 chat_completions 修复与 D20 收尾互为对照。

## 8. 重新评估（2026-09-17）：缺口已前移，方法必须改

### 8.1 缺口现状

`git fetch upstream` 后上游已从台账锚点 `37949780`（1.0.24）前进到 **`48271133`**，
中间只有 **1 个 squash 提交**（"Synced from monorepo"），覆盖 **1.0.25 → 1.0.32 共 8 个版本**。
规模：**1650 files changed, +122644 / −49180**。

按目录分布（决定可吸收比例）：

| 区域 | 文件数 | 处置 |
|---|---|---|
| `xai-grok-pager` + `pager-render` + `pager-minimal` + `pager-pty-harness` | 482 (29%) | **整体跳过**（A8，用户指示） |
| `xai-grok-telemetry` | 89 | 多为云/mixpanel，**红线跳过**，逐项甄别 |
| `xai-grok-shell` | 372 | 主战场 |
| `xai-grok-tools` | 129 | 逐项甄别 |
| `xai-grok-workspace` + `workspace-types` | 98 | 权限/沙箱，高价值 |
| `xai-grok-test-support` | 65 | 测试基建，按需 |
| `xai-fast-worktree` | 36 | 待评估（我们树是否有对应物） |
| `memory` / `agent` / `markdown` / `config` / `sampler` / `chat-state` / `sampling-types` | 123 | 内核，高价值 |

即：**约 29% 直接跳过（pager），约 5% 红线（telemetry），其余 ~66% 需逐项甄别。**

⚠ 上游索引 `/Users/mac/nofy-upstream` 目前停在 `37949780`，**已落后于 `48271133`**。
下次动手前需在该 worktree 里 `git checkout 48271133 && npx gitnexus analyze` 重建。

### 8.2 方法必须改：旧方法的假阳性率已被实测

批25 的「待合并项逐项决定」是**照 changelog 文本枚举再分类**产出的。本会话对它做了核实，结果：

- **A1 韧性 11 项里，"剩余 6 项"有 5 项是错的**：3 项其实是 pager UX（归类错）、
  1 项早已完整实现（1.0.14#12 压缩降级阶梯）、1 项钉版不可移植（rmcp 无 `resolve_metadata`）。
- 另有 3 项在动手前被核实为已对齐：批24 的 monitor 超时、1.0.13#7 瞬态重试主体、1.0.19#10 输出泵背压。
- **台账的 `1.0.xx#N` 编号与上游 changelog 行号不对应**（是早前自行枚举的序号），
  例：台账"1.0.13#18"指 MCP 启动加速，上游 1.0.13 第 18 行是截断错误提示。

结论：**照 changelog 列清单 → 分类 → 执行**这条路，假阳性/错归率约 80%，
照单执行会把已存在的东西重做一遍、把 UX 当内核做。

新方法（本会话已验证有效，⑫⑬⑭ 均按此产出）：

1. **按内容匹配，不按编号**。先从上游 changelog 取原文句子，再定位实现。
2. **双索引对账**。现在有 `/Users/mac/nofy-build` 与 `/Users/mac/nofy-upstream` 两份索引，
   可对上游符号查 `context`/`impact` 找到实现落点与调用图，再对我们树查同名/同职责符号，
   判断是「已对齐 / 真缺口 / 钉版不可移植 / 属 pager」。**定位必须传绝对路径**（两条注册项同名）。
3. **先核实再动手**，核实结论（含"已对齐"）一律写回台账，避免下次重查。
4. 在 `nofy-sandbox` / `nofy-mcp` 上**不得采信 gitnexus 结论**（入边解析缺陷，重建索引也没修好），
   改用 grep 枚举调用方 + 全量测试 + 红绿双验。

### 8.3 新批次（1.0.25–1.0.32）内核候选，按价值分层

**T0 — 与本会话已落地工作直接接续，且已核实为真缺口：**

| 项 | 上游原文 | 为什么是 T0 |
|---|---|---|
| **1.0.26 TPM 限流不再当上下文溢出** | "TPM rate-limit errors during compaction are now retried instead of treated as context overflow." | **已核实为真缺口，且是原生⑨ 留下的自相矛盾**，见 8.4 |
| **1.0.28 per-model `reasoning_summary`** | "Per-model `reasoning_summary` setting is now available in config.toml for Responses API endpoints." | 已核实：我们树 `reasoning_summary` 只出现在测试夹具与 SSE 事件类型里（能收 delta，无配置旋钮）；上游 `config.rs` 有 12 处。⑧⑩ 已铺好 per-model 配置管道，属顺路 |

**T1 — 内核韧性/正确性，未核实：**

- 1.0.25 **启动设置与模型目录在并发启动/同机多账号间被共享或互相覆盖**（与 ④ 模型目录解析同区）
- 1.0.29 **同 `GROK_HOME` 下多个并发 `agent stdio` 启动即崩**（与 ⑬ OAuth 去重、桌面 MCP 同区）
- 1.0.25 headless prompt 超时干净退出而非永久挂起
- 1.0.26 Memory v2 从 init 失败恢复、反复出错后不再卡住捕获
- 1.0.26 回合早期 Ctrl+C 正确 rewind 无竞态（与原生② rewind 同区）
- 1.0.26 失败的后台任务不再重复提醒
- 1.0.25 `grok -c` 挂错空会话
- 1.0.25 读含 PNG 缩略图前缀的 Adobe SVG 导致图像上传失败（与 ⑨ 图像分类同区）
- 1.0.25 慢文件系统上扫 skills 目录导致嵌入式启动超时
- 1.0.31 长 server 前缀的 MCP 工具被静默丢弃（能力静默丢失）
- 1.0.31 回合取消横幅正确写出原因而非一律"by user"

**T2 — 协议/表面，需先判定红线与钉版：**

- 1.0.29 MCP 连接对 `2026-07-28` 版服务器不再失败（与 D 类 elicitation 钉版同区，可能需升 rmcp）
- 1.0.26 legacy MCP server 正确声明 elicitation 支持（同上）
- 1.0.25 后台任务列表作为可持久快照下发（断线重连恢复）
- 1.0.25 workflow 工具支持 pause/stop source（**我们树已有 workflow 工具**）
- 1.0.25 重复用户 prompt 渲染（live echo 改为 opt-in）——协议行为变更，需决策
- 1.0.32 `x.ai/plugins/list`、`x.ai/skills/*` 反映最新 config.toml
- 1.0.26 subagent interject 打断长时后台等待（**D 类曾把 interjection 判为 defer，需重评**）

**跳过：** 1.0.27 全部（2 项皆 UX）、1.0.30 全部（5 项皆 UX）、
所有 pager/dock/dashboard/vim/theme/prompt-editor 项、`/feedback`（云红线）、
voice（已删）、auto-update（已删）、1.0.29/1.0.32 的 Windows 专项崩溃
（ProjFS、TLS ARM64——我们不发 Windows 构建则无收益）。

### 8.4 已核实的真缺口：compaction 把 TPM 限流误判为确定性上下文溢出

**这是原生⑨ 留下的自相矛盾，优先级最高。**

⑨ 给 `SamplingError::is_context_length_error()`（**方法**）加了 error_code 路径与
「429 带 Retry-After 且无结构化尺寸码时不判上下文超限」的例外。但同文件里还有一个
**自由函数** `is_context_length_error(message: &str)`（error.rs:799-807），纯文本匹配，
**没有**这两个能力。而 compaction 分类器用的正是自由函数：

- `session_compact.rs:58` `pub(crate) use nofy_sampling_types::is_context_length_error;`
- `session_compact.rs:77`（`classify_sampling_error` 的 `Api` 臂）
- `session_compact.rs:120`（`classify_response_event_error` 的收尾判定）

两处的状态码分支**都已排除 429**（`*status != TOO_MANY_REQUESTS` / `status_code != 429`），
但**文本判定那一支没有排除**，且它是 `||` 的第一项 / 收尾的独立 `if`。于是：

> 一个 429（TPM 限流），只要 message 里含 "too long for this model" / "prompt is too long" /
> "maximum context length" 之类措辞——而限流错误引用配额与尺寸措辞极常见——
> 就会被判 `CompactFailure::Deterministic`，**压缩直接放弃、不重试**。

后果与上游 1.0.26 描述一致：会话卡在上下文超限状态，而真正的病因是瞬时限流，
退避重试本可恢复。

**设计的修法**（尚未实施）：在 compaction 分类器里确立一条比 ⑨ 方法版更强的规则——
**429 永远不是确定性上下文溢出**。理由是二者回答的是不同问题：

- ⑨ 的方法版服务 `is_retry_vetoed`（"重试环该不该放弃"），上游以 `Retry-After` 存在与否
  作为"服务端明确要求等待"的信号，故例外带该前提；
- compaction 分类器回答"这是不是一次重发同样载荷也必然失败的溢出"，而 429 按定义是限流、
  是瞬态的，配额会恢复，故**无论有无 Retry-After、无论 message 怎么写，都不该判 Deterministic**。

具体：`classify_sampling_error` 的 `Api` 臂改为先判 `*status == TOO_MANY_REQUESTS → false`，
否则走 `error_code.is_size_overflow() || is_context_length_error(message) || (4xx 且非 408)`；
`classify_response_event_error` 的 line 120 文本判定同样加 429 守卫。
两处都应改为消费 ⑨ 的 `error_code`（目前 `Api { status, message, .. }` 把 `error_code` 丢在 `..` 里）。
并把方法版与自由函数版的关系在 doc 里写明，避免第三次出现同名不同义。

### 8.5 修订节奏

原估「9–10 批 / 2–3 周」是基于旧缺口（1.0.11尾差→1.0.24）与旧的照单执行法。
按 8.2 的新方法，**核实成本前置但执行量大幅下降**（A1 实测 6 项里只有 1 项真需做）。

建议顺序：

1. **先修 8.4**（已核实、小、且是自身一致性缺陷）
2. **1.0.28 per-model `reasoning_summary`**（已核实、⑧⑩ 管道现成）
3. T1 逐项核实（预计再淘汰一半），核实完再动手
4. T2 先判红线/钉版，再决定
5. 重建上游索引到 `48271133` 后再做需要查上游调用图的项

每轮结束把核实结论（含"已对齐"与"归类错误"）写回台账，这是本会话最有效的产出形式。
