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
| 7 | mTLS per-model(1.0.18) | ~~有企业需求再取~~ → **归属已核实:BYOK/自建网关需求,非 xAI 云非 Grok 模型;与我们受众直接相关,可排期**(§8.8) |
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

### 8.4 已核实的真缺口：compaction 把 TPM 限流误判为确定性上下文溢出 — **已修，原生⑮ `5b37d12d`**

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

**实施记录**（原设计如下，已按此落地并额外闭合了第三个消费点 `sampler_turn.rs:1003` 的遥测标签）：在 compaction 分类器里确立一条比 ⑨ 方法版更强的规则——
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

### 8.6 T0 第二项已核实：Responses API 的 `reasoning.summary` 在我们树里是硬编码

上游 1.0.28 原文："Per-model `reasoning_summary` setting is now available in
config.toml for Responses API endpoints."

**核实结论：真缺口，且比"少个配置旋钮"更严重。** 我们树全域只有**一处**
`ReasoningSummary` 引用——`nofy-sampling-types/src/conversation/responses.rs:133`：

```rust
reasoning: Some(rs::Reasoning {
    effort: req.reasoning_effort.map(|e| e.to_responses_api()),
    summary: Some(rs::ReasoningSummary::Concise),   // ← 硬编码字面量
}),
```

注意**紧邻两行的不对称**：`effort` 由 `req.reasoning_effort` 驱动（可配、有完整
per-model 管道），`summary` 却是写死的 `Concise`。后果有三层，第三层最要紧：

1. 不想要 reasoning summary 的用户关不掉——它吃输出 token 预算，也会推迟首 token。
2. 想要 `Detailed` 的用户拿不到。
3. **兼容性风险**：`summary` 被无条件塞进每一个 Responses API 请求。对不认识
   `reasoning.summary` 字段的严格网关，这可能直接 400。BYOK 场景下我们无法预知
   对端实现，硬编码一个可选字段是把自己的假设强加给所有端点。

**风险评级：低。** 上游枚举 `ReasoningSummary { None, Auto, #[default] Concise,
Detailed }` 的默认值就是 `Concise`，与我们当前硬编码值一致，所以这是纯增量
（新增 opt-out / opt-in），**默认行为不变**。

**实施路径（三层管道，已探明，可直接执行）：**

1. `nofy-sampling-types/src/types.rs`：新增
   `pub enum ReasoningSummary { None, Auto, #[default] Concise, Detailed }`，
   derive 与 `ReasoningEffort` 同套（`#[serde(rename_all = "lowercase")]` +
   `strum` 的 `IntoStaticStr`/`EnumString`，`#[strum(serialize_all = "snake_case")]`），
   加 `pub fn to_responses_api(self) -> Option<crate::rs::ReasoningSummary>`
   （`None → None`，其余一一映射）。上游对应 `types.rs:845-860`。
2. `ConversationRequest` 加字段，`responses.rs:133` 改为
   `summary: req.reasoning_summary.map(|s| s.to_responses_api()).flatten()`
   ——即 `None` 时**不发**该字段，而不是发 `null`。
   ⚠ `ConversationRequest` 有 43 处结构体字面量，但**derive 了 `Default`**，
   其中 24 处用 `..Default::default()`，故约 19 处需手改（与 ⑤ 评估时同一数字）。
3. `SamplerConfig` 加 `Option<ReasoningSummary>`（`#[serde(default)]`）→
   `sampling_config_for_model` 填 `info.reasoning_summary` →
   配置面四层 `ModelInfo` / `ModelEntryConfig` / `ConfigModelOverride` /
   `ModelsConfig` 各加字段 + `apply` 的"仅 Some 才覆盖" + `from_config` +
   `apply_global_scalar_defaults` 的 `get_or_insert`。
   **⑧（variants）与 ⑩（rate_limit_retry_threshold）已把这条管道走过两遍**，
   站点清单可直接复用：`ModelInfo` 约 12 处字面量、`SamplerConfig` 约 4 处完整
   字面量（config.rs:147 的 `Default` impl、actor/state.rs:83、client.rs:2107、
   tests/test_actor.rs:72），其余走 `..Default::default()` 不受影响。
4. 文档：`docs/user-guide/11-custom-models.md` 的 `[models]` 全局默认示例与
   per-model 示例各加一行，并说明"仅对 Responses API 端点生效，
   Chat Completions / Messages 后端忽略"。

**为什么本轮未实施**：这是跨 3 个 crate、3 层管道的改动（sampling-types 新类型 +
ConversationRequest 约 19 处字面量 + SamplerConfig + 配置面四层），量级大于 ⑩。
在上下文预算耗尽时开工有留半截的风险，故只做到"核实 + 探明路径 + 记档"。

### 8.7 已探明但未实施：`mkdir`/`touch` 在 auto 模式免提示（上游 1.0.11 批次）

上游原文："**mkdir and touch** no longer prompt in auto mode or safe-command lists."

**核实结论：真缺口，且不是"往白名单加两个词"那么简单。**

先排除一个错误猜测：上游的 `ROUTINE_PREFIXES`（auto_mode/mod.rs:482-511）里
**同样没有** `mkdir`/`touch`，我们树也没有（auto_mode/mod.rs:494-534）。两边一致，
所以改动不在 auto 模式白名单。真正落点是 `permission/shell_access.rs`。

**机制**（我们树现状）：`manager/mod.rs:709-723` 里
`command_write_paths_split` 取出写路径，任一非 `is_safe_write_sink` 就
`assessment.insert(Finding::FileWrite)`，而 `FileWrite` 正是 auto 模式弹提示的原因。
`mkdir`/`touch` 的操作数目前在 `shell_access.rs:1182` 与 `rm`/`rmdir`
**同组**、一律标 `ShellFileMode::Write`，于是落进 `word_paths` → 触发 `FileWrite` → 弹提示。

**上游的做法**：新增第三个模式 `ShellFileMode::Create`
（doc："Empty dir/file creation (`mkdir`/`touch`): `Edit` for the inline-shell gate,
not a content write"），把 `mkdir`/`touch` 的操作数从 `Write` 改判 `Create`；
`command_words_write_paths` 只收 `Write`，`Create` 由新的
`command_words_creation_paths` 单独收进 `WritePathsSplit.creation_paths`。
于是创建类操作不再触发 `FileWrite`，但**仍被单独追踪**——上游
`grants.rs:582` 用 `let mut protected_paths = writes.creation_paths;`
把它作为编辑目标保护的种子。

**⚠ 陷阱（这是不在预算耗尽时开工的理由）**：`creation_paths` 不是可以丢掉的余量。
`touch` 对**已存在**文件只改 mtime、不写内容，所以判 `Create` 是对的；但它仍然
**触碰了一个可能受保护的路径**。若只做前 5 步（加 `Create` 模式、拆分操作数、
新增提取函数、加 `creation_paths` 字段）而不做第 6 步（把 `creation_paths`
接进我们树的 `edit_target_protection`，该函数已在 `manager/mod.rs:28` 导入），
结果就是 **`touch <受保护文件>` 被静默自动放行**——把一个"少弹一次提示"的
便利性改动做成了权限绕过。这两半必须同批落地，不能分两次提交。

**可执行规格（6 步，已探明站点）：**

1. `shell_access.rs:599-602` `ShellFileMode` 加 `Create` 变体（带上游那句 doc）。
   全树 `ShellFileMode::` 共 23 处引用，需逐一甄别哪些是穷举 match（编译器会报）。
2. `shell_access.rs:1182` 把 `"rm" | "rmdir" | "mkdir" | "touch"` **拆开**：
   `rm`/`rmdir` 保持 `Write`（破坏性，绝不能跟着变成 Create），
   `mkdir`/`touch` 改 `Create`。同步改 1161 行那句 doc 注释。
3. 新增 `pub(crate) fn is_creation_program(program: &str) -> bool`
   （`matches!(program, "mkdir" | "touch")`），doc 注明"由写路径分类器与自动放行
   共用，二者不能各自漂移"——这是上游把它抽成共享谓词的理由。
4. 新增 `pub(crate) fn command_words_creation_paths(words: &[String]) -> Vec<String>`，
   与 `command_words_write_paths`（:259）同构，只过滤 `ShellFileMode::Create`。
5. `WritePathsSplit`（:311）加 `pub(crate) creation_paths: Vec<String>`，
   在 `command_write_paths_split`（:319-343）的 invocation 循环里
   `creation_paths.extend(command_words_creation_paths(&words))` 并返回。
   我们树已有该结构体与 `unextracted_write_redirect`，脚手架是平行的。
6. **消费端（不可省）**：`manager/mod.rs:709-723` 确认 `creation_paths`
   **不参与** `Finding::FileWrite` 判定，同时把它接进 `edit_target_protection`
   的保护集，对齐上游 `grants.rs:582` 的 `protected_paths` 种子用法。

**必测（安全侧优先）：**
- `rm -rf x` / `rmdir x` **仍然**触发 `FileWrite`、仍然弹提示（第 2 步拆分的回归防线）
- `mkdir x` / `mkdir -p a/b` / `touch new.txt` 不触发 `FileWrite`
- `touch <受 edit_target_protection 保护的路径>` **仍然**被拦（第 6 步的回归防线，
  这是最容易漏的一条）
- `is_creation_program` 与操作数分类器不漂移（共享谓词的意义所在）
- 重定向仍按原样处理：`mkdir x > /etc/passwd` 之类的 `redirect_paths` 判定不受影响

**规模评估**：6 处改动 + 约 5 个测试，单一消费端，脚手架已存在。
量级小于 ⑩（rate_limit_retry_threshold 那次跨 4 层配置面），但**安全敏感度更高**
——⑩ 错了是多重试几次，这里错了是权限绕过。故需要完整预算的一轮，不适合收尾时开工。

---

**已实施（原生实现 ⑯）。规格有两处必须更正，都是"照规格做会漏"的类型：**

1. **crate 写错了**：落点是 `nofy-workspace`（`crates/codegen/nofy-workspace/src/permission/`），
   不是 `nofy-shell`。规格里只写了模块相对路径，没写 crate。
2. **"单一消费端"是错的，而且错在危险的方向**。`protected_edit` 在
   `manager/mod.rs` 有 **4 个**放行闸口，不是 1 个：
   | 闸口 | 改前靠什么兜住创建类命令 | 是否需要新守卫 |
   |---|---|---|
   | 会话 grant 预决策（`session_grant_pre_decision`） | 已有 `protected_edit.is_none()` | 否 |
   | 策略 Allow 快路径（auto 模式分类器前） | 已有 `protected_edit.is_none()` | 否 |
   | **分类器后的 `pre_decision` Bash 臂** | **只靠 `FileWrite` floor** | **是** |
   | **sandbox 自动放行** | **只靠 `FileWrite` floor**（经 `sandbox_may_auto_allow_bash`） | **是** |
   后两个闸口原本完全依赖"创建 ⇒ `FileWrite` ⇒ floor ⇒ 不放行"这条链。
   一旦第 1–5 步把创建从写集合里摘出去，这条链断了，而规格的第 6 步只说
   "接进 `edit_target_protection`"——**接进去也没用，因为这两个闸口根本不读
   `protected_edit`**。上游在这两处各加了一个 `protected_edit` 守卫
   （`manager/mod.rs:2093` 与 `:1992`），规格漏掉了。
   实测证据：只按规格做前 6 步时，端到端测试 `touch /etc/hosts` 报
   `left: 0, right: 1`（**零次提示、直接放行**）。

**方法论教训**：规格里的"消费端数量"必须靠**枚举闸口**得出，不能靠
"谁调用了这个函数"。`creation_paths` 的调用方确实只有一个，但它要补偿的
是 `FileWrite` floor 的缺席，而**读那个 floor 的生产点有 7 处**：
`bash_request_floor_requires_prompt` 的 6 个调用点（1353 sandbox、1398 grant
预决策、2063 策略 Allow 快路径、2374 策略 Allow 延迟臂、2483 分类器后 Bash 臂，
以上 5 个是闸口；2634 只用于挑提示原因标签），再加 `narrow_allow_clears_write_floor`
读 `is_file_write_only`/`redirect_write`。
**补偿性控制的覆盖面 = 被补偿机制的覆盖面，不是新数据的调用面。**
下次写这类规格，先 grep 被削弱的那个谓词，而不是 grep 新增的那个字段。


### 8.8 E 类决策点逐项定性（2026-09-17，用户已放行「e类可以做」）

#### 先回答一个归属问题：per-model mTLS 是谁的需求？

**结论：是 BYOK / 自建网关的需求，不是 xAI 云或 Grok 模型的需求——恰好就是我们这个 fork 的受众。**

证据（全部来自上游源码，不是推测）：

- `mtls_cert_dir` 是 `[models.<id>]` 的**每模型**字段：`ConfigModelOverride.mtls_cert_dir:
  Option<PathBuf>`（`agent/config.rs:3790`），doc 写「Directory containing this model's mTLS
  client certificate and private key. Requires one HTTPS `base_url`; an alternate
  `api_base_url` is rejected.」
- 四条校验把用途钉死了（`agent/config.rs:1879-1906`）：
  1. `mtls_cert_dir requires base_url in the same model table`
  2. `base_url must be an HTTPS URL with a host when mtls_cert_dir is set`
  3. `cannot set both mtls_cert_dir and api_base_url; an mTLS identity must have one destination`
  4. `cannot use model_providers.{provider_id}.api_base_url with mtls_cert_dir`
  → **只有把模型指向你自己的 HTTPS 端点时才用得上**。xAI 自家端点用 bearer token 认证，
  永远不会走这条路。
- 消费点：`sampler/src/client.rs:618` → `shared_http::mtls_client(cert_dir, force_http1)`。
  `shared_http/mtls.rs`（202 行）先找 `client.crt`/`client.key`，回退 `tls.crt`/`tls.key`
  ——**这是 Kubernetes Secret 的命名约定**，指向 service mesh / 零信任 ingress 挂载的证书。
  然后 `reqwest::Identity::from_pem`，按「证书+私钥内容摘要」缓存客户端（轮转即换新、
  不无界增长，上限 16），并强制 `https_only(true)` + `redirect::Policy::none()`
  （身份不得跟随重定向外泄到别的 origin）。
- 台账原注「BYOK 安全相关」猜对了。计划 §6#7「有企业需求再取」的定性应升级为
  「**与我们受众直接相关、零云依赖**」。规模约等于 ⑩ 一轮：`shared_http`（我们是单文件，
  上游是目录模块）+ `SamplingError::MtlsConfiguration` 变体 + 四层配置字段
  （`SamplerConfig`/`SamplingConfig`/`ConfigModelOverride`/`ModelEntryConfig`）+ 上述校验 +
  `sampling_config_for_model` **和 `reconstruct_full_config`**（⑩ 踩过的坑：主回合路径走后者，
  只接前者会让功能空转）+ 子代理 spawn + 文档。地基已在：我们有 `nofy-extra-ca`
  （上游正是用 `xai_grok_extra_ca::build_reqwest_client` 建的客户端）。
- ⚠ **别和同名的另一个东西混**：`otel/src/otlp.rs` 的
  `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`/`_KEY` 是 OpenTelemetry OTLP 的标准环境变量契约，
  属遥测面（我们已降维/跳过），与每模型 mTLS 无关。

#### E 类七项定性

| # | 项 | 面 | 定性 | 依据 |
|---|---|---|---|---|
| 1 | 1.0.24#1 Esc 不再取消运行中回合、改提示 Ctrl+C | pager 输入 | **跳过**（A8 同类） | 纯 pager 键位行为，用户已指示 UX 先跳过 |
| 2 | 1.0.19#1 计划 /loop 任务始终后台运行、不再注入回合 | 内核（scheduler） | **待核，很可能已对齐或更完整** | 我们 `nofy-scheduler` 是持久义务账本（arm/fire/drop、fork 安全、离线只补放最新一次），`ScheduleEntry` 已带 `goal`/`cwd`/`once`；需核的只是 fired payload 的投递方式 |
| 3 | 1.0.18#3 welcome 屏停留到真正发送、后台预备会话 | pager UX | **跳过**（A8 同类） | |
| 4 | 1.0.17#1 MCP elicitation 升级到 2026-07-28 多轮 | 协议面 | **可做，但要先定版本策略** | 见下 |
| 5 | 1.0.16#1 企业策略经签名 requirements.toml 限制可选模型 | 内核（配置/治理） | **真缺口，做**（§8.9） | 我们只有用户级 `allowed_models`，没有 requirements 层的 pin |
| 6 | 1.0.22#9 workspaced daemon 暴露文件夹给 Computer Hub | 云/桌面 | **跳云，登记分歧** | Computer Hub 是云表面 |
| 7 | 1.0.13#6 iTerm2 粘贴图实时像素预览 | pager/媒体 | **跳过**（A8 同类） | |

**#4 的更正**：上一轮台账记「rmcp 缺 API，版本钉死不可移植」——**对这一项是错的**。
rmcp 2.1.0 里 `ProtocolVersion::V_2026_07_28` 存在（`model.rs:162`，也在 `KNOWN_VERSIONS` 里），
elicitation 面也齐（`create_elicitation`、`UrlElicitationParam`、`elicitation_id`、
`on_url_elicitation_notification_complete`）。真正的约束是：rmcp 自己的 `LATEST` 是
`V_2025_11_25`，2026-07-28 比 LATEST 还新，目前 SDK 内只用于 SEP-2164 的错误码映射
（`handler/server.rs:140`：≥2026-07-28 的对端把 resource-not-found 报成标准 `INVALID_PARAMS`）。
我们钉在 `V_2025_06_18`（`servers.rs:3622`，注释说明「rmcp 默认跟随 LATEST，故显式钉住」）。
所以这一项不是「不能做」，而是「**要决定钉到哪一版**」：跳到 2026-07-28 是超出 SDK 自身
LATEST 的前瞻钉版，跳到 2025-11-25 是与 SDK 对齐。MCP 的版本协商是客户端提议、服务端回应，
抬高客户端声明版本本身低风险，但多轮 elicitation 的行为变更需要单独验。

### 8.9 E5 可执行规格：requirements 层的 `allowed_models` pin

**与 §8.7 的关键区别**：§8.7 的规格是推断出来的，结果错在危险的方向；本规格每一处都
读自上游真实实现（`37949780`），站点清单是枚举出来的，不是猜的。

**上游语义（必须照搬的是语义，不是代码）**：`EffectiveAllowlist` 四态
（`remote_config/resolution.rs:205-250`）——

| 态 | 触发 | 匹配方式 |
|---|---|---|
| `Unrestricted` | 无 pin 且用户列表为空/缺省 | 全放行 |
| `Invalid` | pin 存在但值不可读（`AllowlistPin::FailClosed`） | **全不放行**（fail closed） |
| `Fleet(patterns)` | pin 是合法非空列表 | **只匹配 model id** |
| `User(patterns)` | 无 pin、用户列表非空 | 匹配 **catalog key 或 model id** |

两个安全要点，漏一个就是绕过：

1. **Fleet 替换 User，不是并集**——用户列表不能在 pin 存在时放宽集合。
2. **Fleet 只匹配 model id，不匹配用户自定义的 catalog key**。用户能改自己的
   `[models.<key>]` 键名；若键名也能满足 fleet 限制，改个键名就逃出去了。
   上游专门有测试 `apply_requirements_allowed_models_ignores_user_catalog_key` 钉这一点。
3. **fail-closed 的报错文案不得叫用户去改 `allowed_models`**——那是 fleet 钉的，用户改了也没用。
   上游测试 `apply_requirements_malformed_allowed_models_fail_closes` 断言
   `!err.contains("allowed_models")`。

**我们树的站点清单（已逐个读过）**：

| 站点 | 现状 | 要做的 |
|---|---|---|
| `agent/config.rs:447` `Constrained<T>` | 只有 `pin`/`pinned`/`source` | 加 `pin_ref()`、`is_pinned()`（放独立 `impl<T>` 块，二者不需要 `Clone`） |
| `agent/config.rs:465` `Requirements` | 8 个字段，无模型相关 | 加 `allowed_models: Constrained<AllowlistPin>` |
| `agent/config.rs`（新） | 无 | 加 `pub enum AllowlistPin { List(Vec<String>), FailClosed }`（`Debug, Clone, PartialEq, Eq`） |
| `config/mod.rs:948` `apply_requirements_inner` | 有 `enforce_str!`，无数组变体 | 加 `ReqStrArray`（`Present(Vec<String>)`/`Malformed`）+ `pin_str_array!` 宏 + 一行调用 |
| `agent/models/resolution.rs:203-218` | 主 catalog 循环直接读 `cfg.models.allowed_models` | 改读 `effective_allowlist(cfg)`，`is_selected(key, model)` 按态分流 |
| `agent/models/resolution.rs:89` | fallback 条目同样直接读 | 同上 |
| `agent/models/resolution.rs:267-277` | 「allowlist 导致无可选项」判定 | 同上，且 `Invalid` 态必须判为「无可选项」 |
| `agent/models/resolution.rs:279-310` | 两处报错文案让用户「Broaden the patterns or remove allowed_models」 | fleet/Invalid 态换成不指向用户配置的文案 |
| `agent/subagent/mod.rs` | 无对应门 | 上游 `subagent/mod.rs:898` 有 `!c.requirements.allowed_models.is_pinned()` 门，需核对我们的子代理模型选择路径 |
| `11-custom-models.md` | 只讲用户级 `allowed_models` | 补 requirements 层 pin 的说明与「替换非并集」语义 |

**测试（对齐上游 5 个 + 我们自己的红绿）**：
`clamps_catalog_and_names_source`、`ignores_user_catalog_key`、`malformed_fail_closes`（含
文案不含 `allowed_models` 的断言）、`empty_array_is_unrestricted`、`["*"]` 通配。
红绿双验至少三项：把 Fleet 改成并集 → `ignores_user_catalog_key` 必须红；
把 Fleet 的匹配从 `matches_model` 改成 `matches` → 同上；
去掉 `FailClosed` 态 → `malformed_fail_closes` 必须红。

**基线**：nofy-shell lib 5194 passed / 2 failed（那 2 个是 macOS 环境产物，已记录在案）。
