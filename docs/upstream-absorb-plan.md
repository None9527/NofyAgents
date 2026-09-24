# 上游吸收方案与审计记录

制订日期:2026-09-13。本文是 `docs/upstream-sync.md` 台账的路线图附件:
台账记录"已同步到哪、哪些有意分歧",本文回答"剩余缺口怎么吃"。
批次完成后仍回填台账,本文只做进度勾选与决策登记。

## 1. 缺口结论(数据)

| 项 | 值 |
|---|---|
| 当前吸收前沿 | **上游 1.0.41@f0e3be11（2026-09-24 重新审计收口）**。1.0.11 起采用逐条原生实现，不以提交拓扑 ahead/behind 代替功能审计；最新结果见 §17。 |
| 剩余版本 | **截至 1.0.41 无未分类条目、无待核实项**。有意分歧仅保留 Nofy 产品边界（xAI 云/登录/GCS、上游遥测等）；统一记忆已走 Nofy 单系统重构，不存在第二套 Memory v2。 |
| 剩余上游提交 | 9684fa3c(08-27,无 changelog,仍标 1.0.10)、bc7f02ed(08-28,**1.0.11+1.0.12**)、bb7f39d5(08-31,1.0.12改+**1.0.13**)、72a61251(09-01,**1.0.14+1.0.15+1.0.16**)、75810042(09-08,**1.0.17–1.0.24 八版**)、37949780(09-09,无 changelog)、**48271133(09-13,1.0.25–1.0.32 八版,1650 文件)**、**a28ee2b2(09-17,1.0.33+1.0.34+1.0.35,356 文件)**;批24 校正:原表偏移约一版,**对账单位是 changelog 条目而非提交**,批次边界跨提交边界 |
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
| 7 | mTLS per-model(1.0.18) | ~~有企业需求再取~~ → ~~归属已核实:BYOK/自建网关需求,可排期(§8.8)~~ → **已实施,原生㉓ `19f62862`,规格与两处更正见 §11** |
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

⚠ 上游索引 `/Users/mac/nofy-upstream`：**2026-09-18 更正**——该 worktree 实际已 checkout 到
`48271133`（§9 的快照就是在这个点重测的，本节早先写的「停在 37949780」已过期），
但上游又前进到 **`a28ee2b2`**（1.0.35），故索引当时**落后一轮**。
✅ **已处置（2026-09-18 16:31）**：worktree 已 detached 到 `a28ee2b2`，两个索引都已重建，
`gitnexus status` 双侧均 ✅ up-to-date；数字与查询纪律见 **§14.0**。

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

> **⚠ 上面这段「要决定钉到哪一版」的二选一是错的，已作废（2026-09-17 第一性原理复查）。**
> 常量存在 ≠ 可以在 `initialize` 里自称该版本。**2026-07-28 删掉了 `initialize` 握手本身**
> （SEP-2575 无会话发现），版本严格的服务端会**拒绝**一个自称 2026-07-28 的 `initialize`；
> 上游 `servers.rs:4027` 的注释写得很直白：「Never pin 2026-07-28 here」。
> 上游的 `with_protocol_version` 钉的是 **`V_2025_11_25`**；`2026-07-28` 只出现在
> `probe_modern` 的 `ClientLifecycleMode::Discover { preferred_versions }` 里，走的是
> `server/discover` 探测 + 两阶段 probe_modern/serve_legacy 回退，需要 **rmcp 3.x**
> （上游在 3.2，我们在 2.1；rmcp 2.1.0 全树无 `ClientLifecycleMode`/`serve_with_lifecycle`/
> `server/discover`，我们 4 个连接点调的都是裸 `handler.serve(transport)`）。
>
> 正确的拆分：**(a) 钉版改 `2025-11-25` —— 已做，原生⑱**；**(b) SEP-2575 无会话发现 ——
> 前置是 rmcp 2.1→3.2 大版本升级 + 一套握手状态机，登记 defer**。
>
> (a) 最硬的理由与上游无关，是我们树内部的自相矛盾：`make_client_info` 早就声明了 URL 模式
> elicitation 能力（`with_form(schema_validation=true)` + `with_url(...)`），而 URL elicitation
> 晚于 2025-06-18。声明旧版意味着版本严格的服务端根本不会发它，**我们声明的能力有一半在空转**。
>
> **教训**：把「上游出现了某个版本号」当成「上游钉了某个版本号」，就会造出一个不存在的选择题，
> 还会把决定权推给用户。定版本类结论必须读到**赋值那一行和它的注释**，不能停在常量表。
> 同理，「rmcp 有这个常量」也不是可移植性证据——要读到**消费该常量的代码路径**。

### 8.9 E5 可执行规格：requirements 层的 `allowed_models` pin — **已实施，原生⑰ `9fbf1910`**

> 实施结果：规格里的 10 个站点全部落地，无一遗漏，也未发现规格之外的第 11 个站点（与 §8.7 相反——那次「单一消费端」的判断漏了两个闸口）。差别在于本规格的站点清单是逐个读上游真实实现枚举出来的，不是推断的。
> 两处规格未预见、实施中补上的：① `Constrained<T>` 的 `Default` 必须从 derive 改手写，否则 `AllowlistPin` 被迫实现 `Default`，而「未钉」与「钉成空列表」语义不同，给它一个 Default 是错的（编译器逼出来的，E0277）；② 运行时消息（`acp_agent` 两处、`session_setup` 一处）也要按 provenance 拆分，规格里只写了 `validate_selectable` 的文案，漏了这三处——上游同样拆了（`remote_config/resolution.rs:306-326`），是对照上游才发现的。
> 另修掉一个**既有缺口**（不属于本项，但同一条路径上）：`resolve_model_override_to_config` 此前完全没有 `user_selectable` 检查，子代理可被指向 catalog 里任何模型。

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


## 9. 两棵树的整体差异快照（2026-09-17 重测）

上一轮的重测点是上游 `37949780`；本轮 `git fetch upstream` 后上游仍在 **`48271133`**
（无新提交），上游 worktree 已 checkout 到该点，两个 gitnexus 索引都已重刷：

> **2026-09-18 更新（索引已重建，下表数字属上一轮）**：上游此后又前进一个 squash 提交到
> **`a28ee2b2`**（1.0.33–1.0.35，356 文件 +27,478/−6,217）。两个索引都已在新落点重刷：
> **我们 `79002da` = 203,385 nodes / 430,338 edges / 9,359 clusters / 300 flows（141.5s，增量 changed=71 added=2）**；
> **上游 `a28ee2b2` = 134,329 nodes / 327,031 edges / 7,544 clusters / 300 flows（265.4s，增量 changed=309 added=40 deleted=1）**。
> 对照下表：我们 +191 nodes（批25 尾部提交），上游 +1,398 nodes / +3,692 edges / +82 clusters。
> §9.1/§9.2 的结构性结论（crate 清单差异、体量差的方向）不受单个提交影响，仍可引用；
> **§9.2 的具体行数仍是 `48271133` 那一轮的口径，引用时须标注**。
> 本轮增量的摸底见台账「增量摸底(1.0.33–1.0.35@a28ee2b2)」，候选分层见 §13，**执行方案见 §14**。

| 索引 | 位置 | commit | nodes | edges | clusters | flows | 耗时/退出码 |
|---|---|---|---|---|---|---|---|
| 我们 | `/Users/mac/nofy-build` | `b586b7a5` | 203,194 | 429,919 | 9,359 | 300 | 419.6s / 0 |
| 上游 | `/Users/mac/nofy-upstream` | `48271133` | 132,931 | 323,339 | 7,462 | 300 | 0（增量 changed=1371 added=233 deleted=38） |

健康检查：两个 `lbug` 主库都在（1.2GB / 891MB），**无孤儿 sidecar**（`lbug.shadow`、
`lbug.wal.checkpoint` 是上次管道截断损坏的特征），两次都打印了 "Repository indexed
successfully"。命令形式严格为「重定向到文件 + `echo ANALYZE_EXIT=$?`，管道里不放 `tail`」。

⚠ **两个索引仍注册在同一个名字 `nofy-build` 下**（名字取自 git remote，worktree 共享），
`resolveRepoFromCache` 的顺序是 id → name（**首个命中即返回**）→ 绝对路径精确匹配 → 名字子串，
cwd 不参与。**故每次调用都必须传绝对路径**，否则拿到的是哪一个不确定。

刷新后立刻做了一次功能性验证，顺带又拿到一个调用图缺陷的实例：
`impact({target: "stop_dream", repo: "/Users/mac/nofy-build"})` 能查到该符号（⑲ 新增，
证明索引确实是最新的），报 2 个直接调用者——但**只有两个测试**
（`aborts_a_live_task_without_waiting_for_it`、`no_op_when_absent_or_finished`），
两个生产调用点（`run_loop.rs:611` channel-closed 臂、`:2168` shutdown 臂）**一个都没报**。
原因大概是它们嵌在巨大的 `tokio::select!` 宏体里。这再次印证既有结论：
**gitnexus 的调用图结果只是下界，空 ≠ 不存在**，任何提交的正确性都不能只靠它兜底。

### 9.1 crate 清单差异

我们 90 个 crate，上游 95 个。**这不是「我们是上游的子集」**——两边各有对方没有的。

**上游有、我们没有（21 个）**，按红线归类：

| 归类 | crate |
|---|---|
| 云/账号/遥测（红线，永久跳过） | `login`、`mixpanel`、`otel`、`feedback`、`update`、`dashboard-store`、`voice`、`image`、`gboom`、`diag-server` |
| 云/桌面表面（跳云） | `workspace-daemon`（Computer Hub 的文件夹暴露面） |
| pager UX / 会话浏览（A8 同类，用户指示跳过） | `pager-diff`、`fuzzy-file-search`、`session-search`、`session-events`、`active-sessions`、`foreign-sessions` |
| 平台/分发 | `dirs`（157 行，我们有 `nofy-paths`）、`bundle`（1538 行，打包分发） |
| **真内核缺口，值得单独立项** | ~~**`message-delivery-core`**（8 文件 1067 行，我们全树 `message_delivery`/`MessageDelivery` **零命中**）~~ **2026-09-18 实读后撤销此定性：不移植。**「零命中」是真的，但结论错了——我们已有同域设计 `agent/subagent/attempt_store`（4525 行，两阶段提交 + 事件溯源 + 可 rewind，形状严格强于上游的内存态 typestate），只是七个模块全标着 `#[allow(dead_code, reason = "consumed by the next storage slice")]` 即尚未接线。移植会造出同一域的两套竞争模型。**这是 §9.1 那条纪律自己被抓到的一次违反：「零命中」正是符号名 grep，而 §9.1 明写它只是下界。**详见台账「message-delivery-core 定性更正与结论」专条、**`compaction-transcript`**（1 文件 824 行，纯函数把压缩段渲染成自包含 markdown，对齐一份 Python 参考实现；我们 compaction 路径无任何 markdown 渲染） |

**我们有、上游没有（16 个）**——这一栏是本轮最重要的认知修正：
`agility`、`channel`、`control-schema`、`convergence`、`daemon`、`governance`、`marketplace`、
`memorycore`、`orchestra`、`packcore`、`runtimecore`、`scheduler`、`session-journal`、
`session-registry`、`stewardcore`、`surfaces`。

即我们已经长出了上游没有的持久 daemon / 调度 / 治理 / 市场 / 会话日志与注册表 / 一组 `*core`
子系统。**「吸收上游」不等于「向上游收敛」**：E2（`/loop` 后台化）核实为「按构造已对齐且强于
上游」正是这个原因——上游那是 pager 侧功能，我们是 daemon 侧持久子系统。后续判断每一项时，
应先问「我们的对应子系统是不是已经用另一种形状解决了同一问题」，而不是直接找上游符号。

### 9.2 内核 crate 的体量差（含测试，行数）

| crate | 我们 | 上游 | 差 |
|---|---|---|---|
| `nofy-shell` | 308,309 | 409,107 | **+100,798** |
| `nofy-pager` | 444,894 | 527,173 | +82,279（UX，按指示跳过） |
| `nofy-tools` | 131,831 | 152,969 | +21,138 |
| `nofy-workspace` | 99,541 | 115,928 | +16,387 |
| `nofy-sampler` | 11,089 | 15,390 | +4,301 |
| `nofy-hooks` | 8,482 | 12,153 | +3,671 |
| `nofy-mcp` | 11,690 | 14,881 | +3,191 |
| `nofy-tool-types` | 4,124 | 4,414 | +290 |
| `nofy-sampling-types` | 14,428 | 14,384 | **−44（我们略大，实质持平）** |

**读这张表必须带的三个折扣**，否则会高估可吸收量：
1. 行数含测试。上游测试密度更高，差值里有相当部分是测试而非行为。
2. 上游 `nofy-shell` 含我们**已物理删除**的云特性（登录、遥测上传、remote sync、dashboard），
   这部分差值永远不该吸收（DELETED-CLOUD-LEDGER）。
3. 我们有 16 个上游没有的 crate，其代码量不在这张表里——表只覆盖两边同名的 9 个。

`nofy-sampling-types` 实质持平是个有用的信号：**采样/错误模型这一层我们已经跟住了**
（⑨ 的 OpenAI 兼容错误码地基、⑩ 的每模型 429 上限、⑮ 的 TPM 误分类修正都落在这一层）。
差值集中在 `nofy-shell`（会话/agent 主体）与 `nofy-tools`，这与「A5 性能、A6 治理、A7 resume
尚未逐项核实」的判断一致——缺口主要在会话生命周期与工具面，不在采样面。

### 9.3 本轮（⑯–⑲）关闭了什么

| 项 | 类别 | 提交 |
|---|---|---|
| `mkdir`/`touch` 免提示 + 四个 `protected_edit` 闸口 | A4 权限 | `84c1819d` |
| requirements 层 `allowed_models` pin（企业限制可选模型） | A6 治理 | `9fbf1910` |
| MCP 协议钉版 2025-06-18 → 2025-11-25 | A3/协议面 | `99d54359` |
| 记忆整合移出会话退出路径（退出不再被 30 分钟模型调用阻塞） | A5 性能 | `154b3281` |

E 类七项全部定性完毕（4 跳过/跳云、1 已对齐、2 已做）。A5 核了 5 项（1 真缺口已修、
1 部分未复现、1 已对齐、2 按内容匹配失败未定位）。

### 9.3bis 全树内容 diff 不是可用的吸收发现工具（2026-09-18 实测）

㉔ 那轮是**逐文件比对一个目录**发现上游已加固而我们没跟的，于是顺手把同样的比对跑遍全树，
想把它变成一条常规的发现渠道。**结论是不行**，实测数据：

| 指标 | 值 |
|---|---|
| 我们的 `.rs` 文件（`crates/codegen`） | 2412 |
| 与上游 HEAD 逐字相同（改名归一后） | **55** |
| 与上游对应文件不同 | 1525 |
| 上游无对应文件（我们新增/改名/拆分） | 832 |
| 差异行合计 | **576192** |

57 万行差异里绝大多数是**有意分歧**（剔云、改名、①–㉔ 的原生实现、上游三个红线巨提交带来的结构重写），
信噪比低到无法用作发现工具。改用「每个差异文件的平均差异行数」排序后，
`attempt_store` 确实排到第一（7.2 行/文件）——**但那是因为它已经被 ㉔ 修好了**；
修之前它是 0 same / 15 diff / 190 行，平均 12.7，排在 `nofy-status-line/src`(21.7)、
`nofy-pager-pty-harness/tests`(22.4)、`nofy-auth/src`(24.6) 之前，也不算显眼。
而且**低平均差异 ≠ 漏了上游进展**：它同样可能是我们自己的改名/品牌化残留，这个指标区分不了两者。

**可用的做法**（㉔ 之后确立）：
1. **主渠道仍是 changelog**，按内容正则扫 `changelogs/1.0.*.json`（编号不可靠，见 A7 的方法论更正）。
2. **逐目录比对只对「台账记录为逐字移植」的目录有效**——那种目录里「与上游 HEAD 不同」
   才无歧义地等于「上游动了我们没跟」。批10 的 `attempt_store` 正是这一类，
   这也是它能被一眼认出来的原因。
3. 全树扫描**只用来回答一个具体问题**：「哪些目录现在与上游最对齐」，
   即上面那张 `same` 排序表——它是**接线/对账成本**的指标，不是缺口的指标。
   顺带一个有用副产物：`nofy-config/src/managed_text` 的 `format.rs` 有 83 行差异而
   同目录 `tests.rs`/`source.rs`/`transaction.rs` **逐字相同**，这个形状（测试没动、实现动了）
   正是「上游做了行为保持的加固」的特征。
   > **追下去的结果是「不吸收」，而理由比这条发现本身更有价值**：上游那轮把
   > `Line::content()` 从 `&str` 改成 `Option<&str>`，三个调用点随之变成
   > `else { continue }`——在 `parse_block` 的 marker 校验循环与
   > `reject_owned_markers_outside` 里，「跳过一行」就等于**该拒绝的 marker 没被拒绝**，
   > 即 **fail-open**；我们的形式越界即 panic，是 fail-closed。而 ⑰/⑳ 已经把 fail-closed
   > 立为这个子系统的原则。详见台账「有意分歧」表该条。
   >
   > **由此确立一条判据**：一次系统性的 panic-安全加固**不能整体吸收**。
   > `x[i]` → `x.get(i) else { fallback }` 只有在 **fallback 的方向**适合该站点职责时才是改进：
   > ㉔ 的 `attempt_store/decoder.rs` 解析不可信字节，fallback 是「拒绝输入」= fail-closed → **吸收**；
   > `managed_text/format.rs` 校验企业策略文件，fallback 是「跳过检查」= fail-open → **不吸收**。
   > **判据是 fallback 的方向，不是「有没有消除 panic」。**
   > 这也说明上面那个「测试没动、实现动了」的特征只能用来**找到候选**，
   > 不能用来判定该不该吸收——找到之后仍要逐站点读 fallback 的语义。

### 9.4 剩余待办的形状

> **2026-09-18 更新**：本节写于 ⑯–⑲ 之后，其中三条已在 ⑳–㉓ 关闭，逐条标注如下。

- ~~**A6 治理 4 项完全未核**~~ — **已全部核实并关闭（⑳ `21416546` + ㉑ `9b7c1e2f`，
  结论见 §10）**：两项真缺口同源同修（MCP 策略闸口前移到配置写入之前），
  一项是 `inspect` 把 Claude bypass 锁报成 enforced（诊断面在说谎，已修），
  第四项（`inspect`/`mcp doctor` 显示托管策略详情）经核实是**粒度差异不是缺功能**，
  属 UX，按「UX 先跳过」defer。
- ~~**A5 余 4 项**~~ — **已全部核实并关闭（2026-09-18，结论见 §12.0 表）**：
  1.0.13#18 **已对齐**（我们的存量凭证快速路径已跳过 OAuth 发现）；
  1.0.15#5 **真缺口**，原注「部分对齐」是错的——我们那两个 warm 机制**都不拨号**，
  规格已写入 **§12**；1.0.18#22 与 1.0.22#27 **都是真缺口且都不属 A8 豁免**
  （前者内核面是 `session/persistence.rs` 的批量解析 API，后者是把阻塞磁盘读移出
  pager 的 async 执行器，两者都不是渲染改动）。
  **A5 全节 9 项至此收口**：2 项真缺口已修（⑲/⑭）、1 项已对齐、1 项部分未复现、
  2 项按内容匹配未定位、3 项本轮新定性（1 已对齐 + 2 真缺口待实施 + 1 真缺口已出规格）。
- **A5 三个真缺口的实施顺序（按规模递增）**：1.0.22#27（4 处 `spawn_blocking`，最小）→
  1.0.18#22（内核批量 API + pager 逐行谓词改批量，中）→ 1.0.15#5（§12 规格，最大）。
- ~~**A7 余 3 项** + 1.0.19#4 需另找上游实现名~~ — **4 项已全部核实并关闭（㉒ `461fbc82`）**：
  1.0.19 idx4 是真缺口→原生㉒；1.0.19 idx10（headless `--worktree`）是我们**明确拒绝**的行为，
  登记 defer 且前置阻塞；1.0.22 idx8（interjection 精确文本）真缺口但属 UX，机制与规格已记；
  1.0.14 idx14 三个关键词角度仍未定位，暂疑属 A8 pager 渲染（**明确标注为推测**）。
  另记一条方法论更正：**台账里的 `1.0.X#N` 编号与 changelog JSON 的下标不是固定偏移**
  （实测 0 到 +4），定位必须按内容正则扫 `changelogs/1.0.*.json`，不能按编号。
- **两个真内核缺口新立项候选**：~~`message-delivery-core`~~（**2026-09-18 实读后撤销：不移植，改为把我们的 `attempt_store` 接上线，并吸收上游四点想法**）、`compaction-transcript`。
  > 撤销 `message-delivery-core` 的理由本身是一次 **§9.1 违规的自我更正**：当初把它列进
  > 「真内核缺口」的唯一证据是「全树零命中」，而那正是 §9.1 禁止的判据（吸收上游 ≠ 向上游收敛，
  > 应先问我们自己的子系统是否已用不同形状解决了它）。实读后发现我们的 `attempt_store`
  > （4525 行，未接线）是同域且更强的实现。
- ~~**per-model mTLS**~~ — **已实施（㉓ `19f62862`，规格见 §11）**。规模实测**大于** ⑩：
  两个不同的配置类型都要加字段、72 处字面量、6 处真实传播点（规格估 3 处）。
- **1.0.13#1 length salvage**（需先定原生预算分层设计）。
- **`attempt_store` 七个模块接上线**（吸收上游 `message-delivery-core` 的四点想法）——
  由上面那条撤销产生，是当前最大的已探明未实施项。


## 10. A6 治理核实结论 + MCP 策略裁决层规格（2026-09-17）

### 10.1 核实结论：4 项里 2 项是真缺口，且同源

| 项 | 结论 |
|---|---|
| 1.0.18#1 托管策略在**写入前**阻止不允许的 MCP server/marketplace 安装 | **真缺口（MCP 侧）**。marketplace 侧我们已有（`plugin_cmd.rs:880`、`extensions/marketplace.rs:831` 都是 `strictKnownMarketplaces` fail-closed）；MCP 侧完全没有 |
| 1.0.19#3 被组织策略阻止的 MCP server 显示清晰信息、**配置变更前**拒绝 | **真缺口**，与上同源 |
| 1.0.14#9 `inspect` 把 Claude bypass 锁显示为 advisory 而非 enforced | 未核（本轮预算用尽） |
| 1.0.18#8 `inspect`/`mcp doctor` 显示托管策略详情 | 未核；我们 `inspect/mod.rs:551,915` 与 `mcp_doctor.rs:478` 都已在读 `managed_settings()`，可能只是详情粒度差 |

**缺口的具体形状**（不是「没有拦截」，而是「拦截点太晚」）：

我们的 `nofy-pager/src/mcp_cmd.rs` 里 `managed_settings` / `allowlist` / `blocked` / `denied`
**零命中**——`run_add`（:223）直接写配置并报成功，`mcp list` 也不显示 blocked 原因。
运行时确实还会拦（`session/managed_mcp.rs:288` "MCP server blocked by managed settings
policy"），所以**不是权限绕过**；但用户拿到的是**假成功**，而且配置文件里落下了一条
策略禁止的条目。上游 `mcp_cmd.rs:639` 的注释把这件事说得很直白：

> "Policy check BEFORE the config write, or a blocked server is written under a success [message]"

上游有三个闸口，我们一个都没有：

| 上游符号 | 位置 | 作用 | 我们 |
|---|---|---|---|
| `policy_blocked_servers(&cwd)` | `mcp_cmd.rs:167` | `mcp list` 的裁决表（名字 → 原因） | **0 命中** |
| `policy_add_refusal(&cwd, name, &config, scope)` | `mcp_cmd.rs:284`，在 `run_add` 写之前 | 新增定义的闸口 | **0 命中** |
| `policy_enable_refusal(&cwd, name)` | `mcp_cmd.rs:641`，在 enable 写之前 | 启用的闸口 | **0 命中** |

### 10.2 为什么我们没有：缺一整层「策略裁决」抽象

> **⚠ 本节结论已被实施时的实读推翻，保留原文以记录错误模式，正确结论见下方「更正」。**

管道我们全有，裁决层全无：

| 符号 | 我们 | 上游 |
|---|---|---|
| `project_scoped_mcp_names` | 11 | 19 |
| `to_acp_mcp_server` | 10 | 13 |
| `materialize_mcp_config` | 9→4 | 6 |
| `load_mcp_server_configs_with_project` | 9 | 11 |
| `MCP_SCOPE_PROJECT` / `McpEnabledFilter` / `load_mcp_preferences` | 8 / 6 / 18 | 11 / 8 / 20 |
| **`McpSubject`** | **0** | **44** |
| **`McpBlockReason`** | **0** | **37** |
| **`mcp_blocked_reasons`** | **0** | 5 |
| **`mcp_subject` / `mcp_subject_for_tier`** | **0** | 19 / 8 |
| **`policy_enable_error`** | **0** | 10 |

即：我们只在**会话加载时**用一句临时字符串拦一下，没有可复用的裁决类型，所以 CLI 侧
无从复用。上游把裁决抽成了 `McpSubject`（这个 server 属于哪一层）+ `McpBlockReason`
（为什么被拦，**每个变体都带 `source: PathBuf` 指明是哪份策略文件拦的**），
放在独立模块 `xai-grok-workspace/src/permission/managed_policy/verdict.rs`。

`McpBlockReason` 四个变体（已读到定义）：

| 变体 | 含义 |
|---|---|
| `Deny { source }` | 命中 `deniedMcpServers` 条目 |
| `NotGranted { source }` | 不在 `allowedMcpServers`（或 managed-only lockdown 的授权表）里 |
| `Lockdown { source }` | 该来源封锁它绑定的一切（`McpServerAllowlist::is_lockdown`），故任何 allow 条目都不可能授权它 |
| `ProjectPin { source }` | 项目声明的 server，且 `enableAllProjectMcpServers = false` 被钉住 |

⚠ `ProjectPin` 依赖 `enableAllProjectMcpServers`，对应上游 `ManagedSettings.project_mcp:
PolicyPin` 字段——**我们没有**（`enable_all_project_mcp_servers` 全树 0 命中 vs 上游 6）。
上游 `ManagedSettings` 还多两个字段：`plugin_auto_update: PolicyPin`、
`extra_marketplaces: Vec<ManagedMarketplace>`；且它已把整个托管策略抽成独立模块
`permission/managed_policy/`，我们的还在 `permission/resolution.rs` 里。

### 10.2bis 更正：我们**已经有**裁决层，只是名字不同（2026-09-17 实施时实读发现）

§10.2 那张「0 vs 37 / 0 vs 44」的表是**对的但误导**。它按上游符号名统计，于是得出
「缺一整层裁决抽象」的结论；实施时读了我们 `session/managed_mcp.rs:222-256` 才发现，
**同一层我们已经有了，叫别的名字**：

| 上游 | 我们（早已存在） |
|---|---|
| `McpBlockReason::Deny { source }` | `McpDisabledReason::Denylist { source }` |
| `McpBlockReason::NotGranted { source }` | `McpDisabledReason::Allowlist { source }` |
| `McpBlockReason::rule()` + `Display` | `impl Display for McpDisabledReason`，文案逐字相同：`"not in allowedMcpServers ({path})"` / `"matches deniedMcpServers ({path})"` |
| `McpBlockReason::source()` | 变体自带的 `source: PathBuf` |
| `mcp_blocked_reasons(...)` | `McpDisabledReason::for_blocked_server(policy, server)` |
| `McpServerPolicy::is_server_allowed` | `McpServerAllowlist::is_server_allowed`（**已是 pub**） |
| `McpServerPolicy::is_server_denied` | `McpServerAllowlist::is_server_denied`（**已是 pub**） |
| `policy_add_refusal_with`（OnceLock seam） | `apply_mcp_server_policy` 早就为了同一理由被拆出来（其 doc 原话：「so the deny/allow enforcement chokepoint can be tested with an injected allowlist — the runtime path reads the process-wide managed-settings `OnceLock`, which a test can't populate」） |

**连「为了可测而把 enforcement 拆成可注入 allowlist 的纯函数」这个设计我们都已经独立做过了。**

真正缺的只有两样，且都不是抽象层：
1. `McpBlockReason::Lockdown`（某来源封锁它绑定的一切，故任何 allow 条目都不可能授权）
   与 `ProjectPin`（`enableAllProjectMcpServers = false`）——我们的 managed-settings
   模型里没有这两个概念（`enable_all_project_mcp_servers` 全树 0 命中 vs 上游 6）。
2. **CLI 侧的调用点**——裁决层存在，但 `mcp_cmd.rs` 从来没调它。这才是 1.0.18#1 /
   1.0.19#3 的实际缺口，也是本轮真正修的东西。

所以本轮的正确工作量是「加两个薄闸口 + 接线」，不是 §10.3 估计的「6 个新符号 + 数据模型
重构」。**§10.3 的规模估计（「与 ⑩ 相当或略大」）因此是错的，实际远小于 ⑩。**

**错误模式，记进方法论**：这正是 §9.1 自己写下的纪律——「先问我们的对应子系统是不是
已经用另一种形状解决了同一问题，而不是直接去搜上游符号名」——而 §10.2 恰恰违反了它。
按上游符号名 grep 得到 0 命中，就断言「整层缺失」，是**用符号名代替语义比对**。
正确做法是：grep 到 0 之后，再去读我们树里**同一职责**的代码（这里是「运行时已经在拦，
那它用什么拦的」），而不是直接下结论。`McpDisabledReason` 就写在
`managed_mcp.rs` 里、就在我已经读过的那句 `"MCP server blocked by managed settings
policy"` 旁边 30 行——我引用了那句话，却没读它上下文。

### 10.3 实施规格 — **已实施，原生⑳ `21416546`；本节步骤 1–4 全部作废，只做了 5–7 的瘦身版**

> **实施结果（2026-09-17）：本规格是按 §10.2 的错误前提写的，§10.2bis 已更正前提，这里更正由它推出的步骤。**
>
> - **步骤 1–4 不需要做**。`McpSubject` / `McpBlockReason` / `mcp_blocked_reasons` /
>   `policy_enable_error` 我们**都已经有**，只是名字不同：`McpDisabledReason::{Denylist,
>   Allowlist}`（带 `source: PathBuf`，Display 文案与上游逐字相同）、`for_blocked_server`
>   ≈ `mcp_blocked_reasons`、`is_server_allowed`/`is_server_denied` 已是 `pub`。
>   实际落地只有 4 个薄函数（`find_configured_server`、`policy_refusal`、
>   `policy_add_refusal`(+`_with`)、`policy_enable_refusal`(+`_with`)）+ 1 处可见性提升
>   （`load_cli_plugin_registry` → `pub(crate)`）+ `nofy-pager` 两个调用点。
> - **末尾「规模：约 6 个新符号…比 ⑰ 大，与 ⑩ 相当或略大」的估算作废**——它是 §10.2
>   那次误判的直接产物。真实规模小于 ⑰。
> - **步骤 2 的 `ProjectPin` 与 `Lockdown` 两个变体刻意未实现**（本规格自己的告诫「不要
>   为了凑齐而猜语义」在此生效）：我们 managed-settings 模型里没有
>   `enable_all_project_mcp_servers`（全树 0 命中 vs 上游 6）。
> - **因此步骤 7 那条「非显然语义」对我们是空的**：新定义何时按 project 身份判，上游用它
>   走 `ProjectPin` 那条腿；我们没有那条腿，`policy_add_refusal` 也就**不收 `scope` 参数**
>   ——加一个用不上的参数只会暗示一个不存在的保证。
> - **步骤 5 的 `ConfigSource::ConfigToml` 要 `continue` 那条告诫不适用**：那是「逐条目判
>   裁决表」才有的重复判定问题；我们的 `find_configured_server` 是**按名字定位单个定义**，
>   不做全表判定。
> - **步骤 6 的 `mcp list` 显示 `blocked_reason` 未做**：我们 `mcp_doctor.rs:478` 已在渲染
>   allowlist 并带策略文件路径，list 侧补注记属 UX，按指示 defer。
> - **测试要点里「四变体各一个单测」与「`Lockdown` 要覆盖…」两条随之作废**；实际 4 个新测试
>   全走可注入 seam，覆盖 deny 命中（带策略路径）、restricted allowlist 未授权、已授权放行、
>   无策略不挡路、未知名字保持沉默。**「断言配置文件内容未变，不能只断言退出码」这条采纳了**，
>   但因 `run_add`/`run_set_enabled` 以 `std::process::exit(1)` 结束、单测够不着，接线本身
>   **无测试覆盖**，已如实登记在台账 ⑳ 行（上游是用 `pager-pty-harness` 的 PTY 级测试覆盖的，
>   我们的 pty harness 里没有 MCP 用例）。
>
> **A6 本节 4 项至此全部收口**：1.0.18#1 + 1.0.19#3 → 原生⑳；1.0.14#9 → 原生㉑
> （`inspect` 曾把 Claude bypass 锁报成 enforced，而配置层刻意不 clamp——诊断面在说谎，
> 修法见台账 ㉑ 行）；1.0.18#8 → **粒度差非缺失**，其中唯一会产生错误陈述的一处已随 ㉑ 修掉，
> 余下的 `PolicySourceAuthority`/`ManagedOnlyScope`/`YoloPolicyLock` 那层按来源标注权威度的
> 展示粒度属 UX，defer。


**分层，自下而上，每层可独立编译与测试：**

1. **`McpSubject`**（层级判定：user / project / managed / plugin-registry）。上游定义在
   `managed_policy/verdict.rs`，本轮**未读到**，实施前必须先读——它是 `mcp_subject` 与
   `mcp_subject_for_tier` 的返回类型，形状错了上面全错。
2. **`McpBlockReason`** 四变体 + `source()` 访问器。`ProjectPin` 需要
   `ManagedSettings.project_mcp: PolicyPin` 与 `enable_all_project_mcp_servers` 的解析；
   若本轮不做该字段，就**只实现前三个变体**并把 `ProjectPin` 留成显式 `todo` 缺口记进台账
   ——不要为了凑齐而猜语义。
3. **`mcp_blocked_reasons(iter, &ManagedSettings) -> HashMap<name, McpBlockReason>`**：
   纯函数，输入 (name, server, subject) 三元组迭代器 + 策略，输出裁决表。这是唯一需要
   单测穷举四变体 × 各来源优先级的地方。
4. **`extensions::mcp::policy_enable_error(&ManagedSettings, &McpServer, McpSubject)
   -> Option<String>`**：把裁决翻成人话。我们 `extensions/mcp.rs:1744` 已有一句
   `"blocked by organization policy"` 的临时文案，应改为从这里出。
5. **`mcp_doctor.rs` 的三个闸口**：`policy_subjects`（私有，走 TOML +
   `merge_managed_mcp_servers_sourced`，注意上游那句注释「merge 会把已启用的 TOML server
   加回来，上面的遍历已经判过每一个 TOML 条目」——即 `ConfigSource::ConfigToml` 要 `continue`，
   否则同一 server 被判两次）、`policy_blocked_servers`、`policy_enable_refusal`、
   `policy_add_refusal` + `McpWriteScope { User, Project }` + 可注入的
   `policy_add_refusal_with`（上游用 OnceLock seam 做测试注入）。
6. **接线 `nofy-pager/src/mcp_cmd.rs`**：`run_add` 写之前调 `policy_add_refusal`；
   enable 路径写之前调 `policy_enable_refusal`；list 显示 `blocked_reason` 与
   `"blocked by organization policy"` 注记。
7. **`policy_add_refusal` 的一个非显然语义**（上游 doc 原话）：新定义默认按 grok-native
   判，**除非写入目标是 project 作用域或该名字已被 project 认领**——因为定义落进 project
   源之后它就成了 project 声明的 server，必须在写之前就按那个身份判，否则先写成 user 级、
   再被 project 认领，就绕过了 `ProjectPin`。实现里对应
   `if scope == Project { project_names.insert(name) }` 这一句。

**测试要点（红绿靶子）**：
- `mcp add` 一个被 `deniedMcpServers` 命中的 server → 必须**非零退出且不写配置文件**
  （断言配置文件内容未变，不能只断言退出码——假成功正是这个 bug 的形状）。
- `mcp enable` 同上。
- `mcp list` 对被拦的 server 显示原因，且原因里**带策略文件路径**（`source`）。
- 四变体各一个单测；`Lockdown` 要覆盖「allow 条目存在但来源是 lockdown」的情形。
- 红绿：把 `run_add` 里的 `policy_add_refusal` 调用删掉 → 第一条测试必须红。

**规模**：约 6 个新符号 + 3 个闸口 + 1 处 CLI 接线，跨 `nofy-workspace`（裁决类型）与
`nofy-shell`（闸口）与 `nofy-pager`（接线）三个 crate。比 ⑰ 大，与 ⑩ 相当或略大。

---

## 11. per-model mTLS 可执行规格（2026-09-18，上游 1.0.18#11）— **已实施，原生㉓ `19f62862`**

> **状态：已按本节规格实施完毕（原生㉓ `19f62862`），七步全部落地。** 本节的存在意义正是
> §8.9 的成功经验：**站点清单逐个读上游真实实现枚举出来，而不是推断**——§8.7 那次「单一消费端」
> 的推断漏了两个闸口，直接导致 `touch /etc/hosts` 零提示自动放行。
>
> **这个方法这次奏效了，但规格仍然低估了两件事**，实施记录如下（细节在台账 ㉓ 行）：
>
> 1. **§11.4 步骤 7 说的「三处转换」其实是六处。** `provider_task_sampling_config` 与
>    `resolve_sampling` 都**委托给** `sampling_config_for_model`，所以真正的传播点是那个共享
>    构建器；而链条另有三个规格没提到的环节——`spawn.rs` 的 chat_state 初始写入（**整条链的
>    源头**，漏了它则全会话静默失效）、`model_switch.rs` 的整体替换（全新字面量而非 `..` 展开）、
>    `subagent/mod.rs` 的 `read_parent_sampling_config`（子代理继承）。第六处是**反向**的：
>    `session_setup.rs` 必须**不**点名字段。**这与 §8.7 是同一类错误**，只是这次靠编译器逐个点名
>    兜住了——所以教训不是「枚举没用」，而是「枚举能兜住构造点，兜不住**委托关系**与
>    **`..` 展开的覆盖语义**」。
> 2. **§11.4 步骤 2/4 估的 80 处字面量，实测 72 处**；而脚本化插入本身引入了两个 bug：
>    一个跳过启发式漏洞（只判断前缀是否以 `->`/`impl`/`struct` 结尾，漏了路径限定的返回类型
>    与多行签名）把字段插进 4 个函数体，由编译器兜住；另一个把 `mtls_cert_dir: None,` 插进了
>    `session_setup.rs` 那处以 `..current_config` 结尾的字面量——**显式字段会覆盖展开值**，
>    于是一次例行的 context-window 更新就会静默丢掉模型的客户端身份。
>    **发现方式不是读 diff，而是专门写了一个「`None` 后面跟着 `..` 展开」的扫描器**（扫出 31 处，
>    30 处在测试里冗余无害、1 处在生产代码）。这是本节最该被记住的一条：
>    **批量机械改动的正确性不能靠抽样阅读，要靠针对该改动**特有失效模式**写的扫描器。**
>
> §11.3 预判的三处结构差异全部命中（不引入 `extra_ca::build_reqwest_client`、
> `configure_http1/2` 需纯移动抽出、reqwest features 逐字相同故 `Identity::from_pem` 可用），
> 其中「若 `Identity::from_pem` 失败再单独评估装 CryptoProvider」的分支**未触发**。
> §11.6 的红绿靶子从 5 项扩到 **11 项**，其中 P3 第一轮**没变红**——那是真测试漏洞
> （原测试只变动 cert，覆盖了证书轮转却没覆盖私钥轮转），已补独立断言。

### 11.1 为什么这一项属于我们而不是上游云面

`mtls_cert_dir` 是 `[models.<id>]` 的**逐模型**字段，要求同一 table 里有 HTTPS 的 `base_url`，
并拒绝与 `api_base_url` 共存（上游错误文案原话：「an mTLS identity must have one
destination」）。这是**自建网关 / 企业内网 / BYOK 供应商**的形状——客户端证书向自己的入口
证明身份——与 xAI 登录、计费、远端同步、Grok 模型都无关。**已确认零云依赖**
（上游 `resume_status.rs` 同轮核对时一并 grep 过 `mtls.rs`：无 login/billing/dashboard/
remote_sync/mixpanel/otel/feedback/hub_auth 命中）。

⚠ **不要与 telemetry 那套混淆**：`nofy-telemetry/src/otlp_http.rs` 的
`OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` 是标准 OTLP 环境变量契约（遥测面），
上游 `xai-grok-telemetry/src/external/mod.rs` 的 `mtls_identity_configured` 也是那条线。
本项是**模型采样面**，两者无关。

### 11.2 上游实现的完整形状（已逐行读过）

| 位置 | 内容 |
|---|---|
| `xai-grok-sampler/src/shared_http/mtls.rs`（200 行） | 核心：`client(cert_dir, force_http1)`、`identity_paths`、`read_identity_file`、`client_cache_key`、`cached_client`、`error_detail` |
| `xai-grok-sampler/src/shared_http/mtls_tests.rs`（1.1KB） | 上游测试**极薄**——我们要自己补 |
| `xai-grok-sampler/src/client.rs:624` | 消费点，三分支 |
| `xai-grok-sampling-types/src/types.rs:1079` | `SamplingConfig.mtls_cert_dir` |
| `xai-grok-sampling-types`（`SamplingError`） | 新变体 `MtlsConfiguration(String)` |
| `xai-grok-shell/src/agent/config.rs:3849 / 4254` | 两个结构体上的字段 |
| `xai-grok-shell/src/agent/config.rs:1880-1909` | 5 条校验规则 |
| `xai-grok-shell/src/agent/config.rs:3917-3918` | 向 entry 传播 |
| `xai-grok-shell/src/agent/config_model_override_parse.rs:721` | TOML 解析 |
| `xai-grok-shell/src/tools/config.rs:200` | 一个构造点 |

核心语义（都要保留）：
- **证书文件名约定**：先找 `client.crt`/`client.key`，**任一存在**就用这一对；否则退到
  `tls.crt`/`tls.key`（**Kubernetes Secret 的约定**，这是本项的真实受众信号）。
- **缓存键含证书与私钥内容**（`blake3` 摘要，且摘要前各写入长度前缀以防拼接歧义），
  故**凭据轮转会自然产生新 client**，不需要失效逻辑；LRU 上限 **16**（`tick` 计数，
  非时间戳）。
- **单文件上限 1MB**（`MAX_MTLS_IDENTITY_FILE_BYTES`），用 `take(LIMIT+1)` 读后再判长度，
  避免把超大文件读进内存。
- **强制 `https_only(true)` + `redirect::Policy::none()`**：身份只对它配置的那个 origin 有效，
  重定向会把客户端证书泄露给别的 host。这是安全不变量，不是优化。
- **cert 与 key 拼成一个 PEM**（cert 末尾补 `\n` 再拼 key）交给 `reqwest::Identity::from_pem`。
- `sharing_disabled()` 为真时**绕过缓存**直接 build（与既有 kill switch 语义一致）。
- `error_detail` 沿 `std::error::Error::source()` 链拼全部原因——rustls 的顶层错误
  常常毫无信息量，真正的原因在 source 里。

### 11.3 我们这侧的适配点（已逐个核实，非推断）

**已具备**：
- `crates/codegen/nofy-extra-ca` **存在**，有 `with_extra_root_certificates(builder)`。
- reqwest features 与上游**逐字相同**：`["rustls-tls","stream","json","multipart","http2",
  "blocking","socks"]` + `default-features = false`，故 `reqwest::Identity::from_pem` 可用。
- `nofy-sampler/src/shared_http.rs` 已有 `sharing_disabled()`（私有）、`shared()`、
  `client()`、`client_http1()`。
- `blake3` 是 workspace 依赖（`nofy-shell`/`nofy-pager`/`nofy-governance`/`nofy-memorycore`
  已用），但 **`nofy-sampler/Cargo.toml` 未引入**，需加一行。

**需注意的三处结构差异**：

1. **不要引入上游的 `extra_ca::build_reqwest_client(configure)`。** 上游那个函数会
   `.use_rustls_tls().tls_built_in_native_certs(false).tls_built_in_webpki_certs(true)`，
   即**把整个 sampler 的 TLS 根证书来源从系统原生换成 webpki 内置**，并显式
   `ensure_default_crypto_provider()`。我们的 `build_http_client` 走的是
   `with_extra_root_certificates(builder).build()`（原生根 + `NOFY_EXTRA_CA_BUNDLE`），
   我们全树**没有任何** `ensure_default_crypto_provider`/`CryptoProvider` 调用
   （唯一命中是 `auth/manager_tests.rs:3187` 的一句注释，讲 `jsonwebtoken`）。
   **照搬会顺手改掉既有 TLS 信任链，属未经评估的行为变更。** 原生做法：mtls 路径沿用
   `nofy_extra_ca::with_extra_root_certificates(...).build()`，与既有两个 builder 一致。
   若 `Identity::from_pem` 在无默认 crypto provider 时失败，**那时**再单独评估安装 provider，
   并作为独立提交，不与 mTLS 混在一起。

2. **`configure_http1`/`configure_http2` 我们没有，需要从既有两个 builder 里抽。**
   现状：`build_http_client()`（HTTP/2 + 池 + keepalive）与 `build_http_client_http1()`
   （`pool_max_idle_per_host(0)` + `http1_only()`）各自读环境变量并整体 build。
   抽成 `configure_http2(builder) -> builder` / `configure_http1(builder) -> builder`
   后，三个调用方（两个既有 builder + mtls）共用同一份超时/池/keepalive 参数——
   **否则 mtls client 会悄悄用上一套不同的池参数**，这正是 ⑯/⑰/㉑/㉒ 一路在消除的
   「同一事实多处推导」。抽取必须是**纯移动**：既有两个 builder 的行为一字不改，
   由 `shared_http_wire` / `shared_http_kill_switch` 两个集成二进制钉住
   （它们各自拥有进程环境，见 `shared_http.rs:11-14` 的模块 doc）。

3. **两个 config 类型都要加字段，且转换不集中。**
   - `SamplingConfig`（`nofy-sampling-types/src/types.rs:979`，`base_url` 是第一个字段，
     与上游同位置）——上游把 `mtls_cert_dir` 放在 `base_url` 之后。
   - `SamplerConfig`（`nofy-sampler/src/config.rs`，`force_http1` 在 :74）——
     **client.rs 的 `config` 是这个类型，不是 `SamplingConfig`**。
   - 转换点**至少三处且不集中**：`agent/config.rs:4532 provider_task_sampling_config`、
     `agent/config.rs:7382 resolve_sampling`、`session/acp_session_impl/sampler_turn.rs:329
     reconstruct_full_config`。**⑩ 的教训在此直接适用：主回合路径是
     `reconstruct_full_config`，不是 `sampling_config_for_model`**——只改后者会让 mTLS
     在子代理/工具路径生效而在主回合静默失效，且不报错。

**工作量实测（这是本轮不做的直接原因）**：
- `SamplingConfig { … }` 字面量构造点 **37 处**（生产 27）
- `SamplerConfig { … }` 字面量构造点 **43 处**（生产 29）
- **全树 0 处使用 `..Default::default()`**，故加一个字段会打断全部 **80 处**
- 合计 56 个生产构造点 + 新错误变体及其分类（`is_retryable` / `is_context_length_error` /
  错误码映射）+ 200 行新模块 + 5 条校验规则 + 3 处转换传播

### 11.4 实施顺序（每步可独立编译）

1. `nofy-sampling-types`：`SamplingError::MtlsConfiguration(String)` + 分类。
   **必须先决定分类**：证书读不到/解析失败是**确定性配置错误**，绝不能进
   `is_retryable`（否则每次采样都白等一轮退避）；也不是 context overflow。
   参照 ⑮ 的教训——`is_context_length_error` 与 `classify_sampling_error` 曾自相矛盾。
2. `nofy-sampling-types`：`SamplingConfig.mtls_cert_dir`（`#[serde(default,
   skip_serializing_if = "Option::is_none")]`）+ 修 37 处构造点（脚本化，编译器逐个点名）。
3. `nofy-sampler`：`Cargo.toml` 加 `blake3 = { workspace = true }`；
   `shared_http.rs` 抽 `configure_http1`/`configure_http2`（纯移动）；
   新增 `shared_http/mtls.rs` + `shared_http/mtls_tests.rs`，`shared_http.rs` 里
   `pub(crate) use` 出 `mtls_client`。
4. `nofy-sampler`：`SamplerConfig.mtls_cert_dir` + 修 43 处构造点 + `client.rs:605` 改三分支。
5. `nofy-shell/agent/config.rs`：模型覆盖结构加字段 + **5 条校验规则**（插在
   `new_from_toml_cfg` 的 `parse_model_providers` 之后、`for (id, provider) in
   &model_providers` 之前，即我们 :1709/:1710 之间；注意我们的 `parse_model_providers`
   返回**三元组**含 `nested_models`，上游是二元组）+ 向 entry 传播。
6. `nofy-shell/agent/config_model_override_parse.rs`：TOML 解析。
7. **三处转换全部传播**（`provider_task_sampling_config`、`resolve_sampling`、
   `reconstruct_full_config`），并为「主回合路径确实带上了 cert_dir」写一个专门测试
   ——这是 ⑩ 那个 bug 的形状，必须有靶子。
   > **实施更正：这一步的「三处」是错的，真实是六处**，且前两处其实都委托给
   > `sampling_config_for_model`。见本节开头状态块的第 1 条。

### 11.5 校验规则（5 条，上游文案已逐字读过，建议原样保留）

1. `mtls_cert_dir` 非空路径，否则 `model.{id}.mtls_cert_dir must not be empty`
2. 同一 model table 必须有 `base_url`，否则 `… requires base_url in the same model table`
3. `base_url` 必须能解析，否则 `model.{id}.base_url is invalid: {error}`
4. `base_url` 必须是 **https 且有 host**，否则 `… must be an HTTPS URL with a host when
   mtls_cert_dir is set`
5. **两条互斥**：不得同时设 `api_base_url`（模型级），也不得用带 `api_base_url` 的
   `model_providers.{pid}`；文案均为 `… an mTLS identity must have one destination`

规则 4/5 是**安全不变量**而非风格偏好：客户端证书是身份凭据，
明文 HTTP 或第二个目的地都意味着它可能被送到别处。

### 11.6 测试与红绿靶子

上游 `mtls_tests.rs` 只有 1.1KB，**覆盖极薄，不能照抄**。我们要补：
- `identity_paths`：只有 `client.crt` 时也选 client 对（**任一存在**即选，不是都存在）；
  两者都无时退到 `tls.*`；`try_exists` 出错时返回 `MtlsConfiguration` 而非静默退化。
- 1MB 上限：恰好等于上限通过、超一字节拒绝，且**不把超大文件读进内存**。
- 缓存：同内容命中同一 client（`ptr_eq` 或计数 build 次数）；**改一个字节即换 client**
  （轮转语义）；第 17 个身份淘汰最久未用；`sharing_disabled()` 时不缓存。
- `https_only` + 无重定向：断言 builder 配置（或对 http:// URL 请求失败）。
- `error_detail` 走 source 链。
- 5 条校验规则各一个测试，**含两条互斥的不同文案**。
- **`reconstruct_full_config` 带上 cert_dir** 的专门测试（⑩ 的坑）。
- 红绿：① 摘掉 `https_only` → 安全测试红；② 缓存键不含 key 内容 → 轮转测试红；
  ③ `identity_paths` 改成「都存在才选 client 对」→ 单文件测试红；
  ④ 摘掉某条校验 → 对应测试红；⑤ 让 `reconstruct_full_config` 不传播 → ⑩ 靶子红。
  > **实施结果：最终 11 项全 ok，但 ① 与 ② 各自暴露了一件事。**
  > **① `https_only` 没能变成靶子**——`reqwest::Client` 不暴露 builder 配置，无法断言，
  > 起一个要求客户端证书的重定向服务器又超出范围，故这条**最重要的安全不变量目前只靠 review**
  > （面向用户的另一半，即配置层要求 `base_url` 必须 HTTPS 且有 host，**有测试**）。
  > **② 第一轮没变红，是真测试漏洞**：变异是「缓存键忽略 key 内容」，而
  > `cache_key_tracks_credential_content_so_rotation_takes_effect` 当时只变动了 **cert**，
  > 所以照样通过——它覆盖了证书轮转，**没覆盖私钥轮转**。已补一条独立断言，
  > 并在测试注释里记下这个洞是红绿暴露的。**这正是红绿双验存在的理由：
  > 绿色的红跑意味着靶子本身是空的，而不是变异没生效。**

### 11.7 文档

`crates/codegen/nofy-pager/docs/user-guide/11-custom-models.md`（⑰ 已在此加过
requirements 层 pin 一节）新增 per-model mTLS 小节：证书文件名两种约定、
必须 HTTPS、与 `api_base_url` 互斥的理由、轮转即生效（缓存键含内容）。


## 12. sampler 传输预热可执行规格（2026-09-18，上游 1.0.15#5；已完整枚举，未实施）

> **状态：规格已按实读枚举完毕，本轮未实施。** 本轮预算用于 ㉓ 的收尾、㉔ 的吸收与
> ㉕ 的定性；A5 四项核实（下方 12.0）产出了三个真缺口，本项是其中最大的一个，
> 故先交付规格。§11 的经验是**规格能把站点清单钉住**（㉓ 因此没有重演 §8.7 的漏闸口），
> 但也**会低估传播点数量**（3 → 6），所以本节把「委托关系」一并写出。

### 12.0 A5 余 4 项的核实结论（本规格的来源）

| 台账编号 | 上游原文 | 结论 |
|---|---|---|
| 1.0.13#18 | Session startup with MCP servers is now much faster when auth is already configured | **已对齐**。我们 `nofy-mcp/src/servers.rs:1832-1848` 的存量凭证快速路径做的就是这件事：`initialize_from_store()` 成功 → 非交互模式下探一次 `get_access_token()` → 直接 `return HttpOauthPrep::ManagerReady(..)`，**不跑 `discover_metadata()`**。上游后来把 `HttpOauthPrep` 重构成 `HttpAuthDecision::ManagerReady { manager, observed }` 并加了 `OauthProbeOutcome`，那是**探测结果的可观测性细化**，不是本条特性 |
| 1.0.15#5 | First reply latency is reduced by opening the model connection in the background when a session starts | **真缺口，本节规格**。台账原注「部分对齐」是**错的**：我们的 `warm_async_http_client()` 预热的是**进程级共享 client 的构建**（不碰任何端点），`chat_modes.warm_in_background()` 预热的是聊天模式，**两者都不拨号**。上游有 `xai-grok-sampler/src/prewarm.rs`(328 行) + `prewarm_tests.rs`(235 行) + `xai-grok-shell/src/agent/mvp_agent/sampler_prewarm.rs`(256 行)，我们全树 `prewarm` 只命中剪贴板预热（`prewarm_image_probe`/`clipboard_prewarm`，完全无关的子系统） |
| 1.0.18#22 | Resume picker now labels local sessions with a single disk walk instead of per-row lookups | **真缺口，有内核面**。上游 `session/persistence.rs:535` 有批量 API `resolve_local_session_ids_any_cwd<S: AsRef<str>>(ids, ..)` → `resolve_local_session_ids_any_cwd_in_root`，**一次磁盘遍历解析一批 id**；我们只有逐个的 `resolve_local_session_any_cwd(id)`，而 pager 侧 `effects/helpers.rs:805` 正是在**逐行谓词**里调它（`&& resolve_local_session_any_cwd(&e.id)`），即 changelog 说的 per-row lookups。**不属 A8 豁免**：标签是 UX，但「一次遍历 vs 每行一次」是性能，且内核面（批量 API）在 `nofy-shell` |
| 1.0.22#27 | Opening or resuming sessions no longer pauses the interface while reading MCP config files | **真缺口，最小**。上游 `pager/src/app/effects/mod.rs:67` 把 `load_mcp_servers` 包进 `tokio::task::spawn_blocking`；我们 **4 处全是同步直调**：`effects/mod.rs:92`、`:430`、`:480` 与 `event_loop.rs:2455`。`load_mcp_servers` 会读并解析全局配置 + 项目配置再合并，在 pager 的 async 执行器上同步做就是**卡住事件循环**。**不属 A8 豁免**：没有任何视觉变化，是把阻塞磁盘读移出执行器 |

**建议实施顺序：1.0.22#27（最小）→ 1.0.18#22（中）→ 1.0.15#5（本节，最大）。**

### 12.1 为什么这一项属于我们

预热拨的是**模型自己的 `base_url`**，对 BYOK 就是用户自己的供应商端点。
零云依赖：上游 `prewarm.rs` 全文无 login/billing/dashboard/remote_sync/mixpanel/otel-exporter/
feedback/hub_auth 命中，唯一的遥测是 `tracing` span（我们已有同一套）。
属 A5 性能（内核延迟），不属 UX。**且它正好落在 ㉓ 刚动过的 `shared_http` 上**，
两轮的上下文是连续的。

### 12.2 上游实现的完整形状（已逐行读过）

**`xai-grok-sampler/src/prewarm.rs`（328 行）**

- `prewarm_transport(base_url: &str) -> PrewarmReport`：模块 doc 原话——
  「dial an origin **once per pool-idle window** through the shared client,
  bounded by `PREWARM_TIMEOUT`, **carrying no credentials**.
  Every non-warmed outcome **releases the origin's claim** so a later dial can retry.」
- 常量：`PREWARM_TIMEOUT = 15s`、`DRAIN_CAP_BYTES = 64 KiB`、`MAX_TRACKED_ORIGINS = 32`。
- `PrewarmOutcome`（`#[non_exhaustive]`，`strum` snake_case）九种：
  `SharingDisabled` / `NoOrigin` / `ClientUnavailable` / `AlreadyClaimed` / `TrackerFull` /
  `Warmed` / `Truncated` / `Failed` / `TimedOut`。
- `PrewarmReport { outcome, duration_ms: i64, origin: Option<String> }`；
  **`duration_ms` 是 `i64` 不是 `u64`**，上游注释原话「the OTel exporter allowlist keeps
  i64 fields and drops u64」——我们若不走 OTel 导出可自行决定，但**保持 i64 更省事**。
- `WARM_STATE: LazyLock<Mutex<HashMap<String, WarmState>>>`，`WarmState = InFlight | Warmed(Instant)`；
  锁中毒用 `PoisonError::into_inner` 恢复（预热是尽力而为，不该因中毒而失效）。
- `OriginClaim`（`#[must_use]`）+ `Drop`：`commit()` 才写 `Warmed(now)`，
  **否则 Drop 时把 origin 从表里移除**——这是「每个非 warmed 结果都释放占位」的实现方式。
- `claim_origin`：`should_dial` 判 `InFlight → false`、`Warmed(at) → now - at >= idle_window`、
  `None → true`；表满 32 时先 `has_room_after_sweep`（按 idle_window 清掉过期的 `Warmed`，
  `InFlight` 一律保留）再判。
- `dial_and_drain`：**本模块最微妙的一段**，注释原话——
  「h1 pools a connection only once its body reaches EOF; h2 pools at the handshake.」
  所以它 `client.get(origin).send()` 后**必须把 body 抽干**才会真正入池；
  抽到超过 64 KiB 就停，此时 `pools_at_handshake = response.version() >= HTTP_2`
  决定结果是 `Pooled`（h2，握手即入池，截断无害）还是 `CappedUnpooled`（h1，**没入池，预热白做**）。
  另注：「Redirects may be followed, but hyper pools the origin's connection before following,
  so the dial still warms it.」
- `endpoint_origin`：`Url::parse` → 要求 scheme 是 http/https 且有 host →
  `url.origin().ascii_serialization()`。**注意它拨的是 origin（`https://host:port`）
  而不是完整 base_url**，即一个不带路径的 GET。
- `first_use` 子模块：`note_first_sampling_use(base_url)` 在**真正第一次采样**时打一个
  `sampler.transport_prewarm_first_use` span，字段 `freshness` ∈
  `warm_fresh`/`warm_stale`/`warm_pending`/`warm_absent`（按 `Warmed` 的年龄 vs idle_window 分类），
  每 origin 只记一次（`FIRST_USE_NOTED: HashSet`，上限 32，满了任取一个逐出）。
  注释原话解释了为什么只能这样测：「Warm freshness at first use, **not observed pool reuse**
  — reqwest exposes no pool-hit signal.」

**`shared_http.rs` 需要新增的两个助手**（我们没有）

- `pub(crate) enum PooledClient { SharingDisabled, Unavailable(reqwest::Error), Ready(reqwest::Client) }`
  与 `pooled_client()`：kill switch 打开时返回 `SharingDisabled`（**此时预热无意义**，
  因为每个 `SamplingClient` 各建各的 client，没有共享池可暖）。
- `pub(crate) fn pool_idle_timeout() -> Duration`：`OnceLock` 闩住
  `GROK_POOL_IDLE_TIMEOUT_SECS`（我们对应 `NOFY_POOL_IDLE_TIMEOUT_SECS`），默认 90s。
  **上游的 `configure_http2` 也改用了它**（`.pool_idle_timeout(pool_idle_timeout())`），
  注释原话「read once so prewarm's re-warm window stays in step」——
  **我们必须同样把 `configure_http2` 里那次 per-call 读取换成这个函数**，
  否则「多久之后该重暖」与「池多久之后驱逐」会各读一次环境变量、可能不一致。
  注意这会**同时影响 ㉓ 的 mTLS client**（它也调 `configure_http2`），方向是一致化，可接受。

**`xai-grok-shell/src/agent/mvp_agent/sampler_prewarm.rs`（256 行，含 ~165 行测试）**

- `MvpAgent::prewarm_final_model_base_url(session_id, provisional_base_url, origin_client)`：
  取 `resident_handle(session_id).model_id` → `resolve_sampling_config_for_model(..).base_url`，
  **只有当最终 base_url 与 spawn 时已拨过的不同才再拨一次**
  （`prewarm_base_url_if_changed` = `(already != resolved).then(..)`）。
  这是为了覆盖「spawn 时用的是临时模型，最终解析到另一个端点」的情形。
- `spawn_sampler_transport_prewarm(base_url)` = `tokio::spawn(prewarm_and_record(..))`；
  注释原话「**Detached by design**: the warm state is process-global, not session state,
  and the dial is PREWARM_TIMEOUT-bounded.」——即**不持有句柄、不随会话取消**。
- `PrewarmCancelGuard` + `Drop`：任务被取消时在 span 上补记 `outcome = "cancelled"` 与
  `duration_ms`（否则 span 会留两个 Empty 字段）。
- span 是 `parent: None` 的 **detached** `session.sampler_transport_prewarm`，
  字段 `outcome`/`duration_ms`/`endpoint` 全部先 `Empty` 后 `record`。

**四个调用点（`session_setup.rs`）**

| 上游行 | 路径 | 调用 |
|---|---|---|
| :501 | 新建会话，`session_sampling` 解析完、`build_summary_client` 之前 | `spawn_sampler_transport_prewarm(&session_sampling.base_url)` |
| :687 | 新建会话，最终模型解析后 | `self.prewarm_final_model_base_url(&session_id, &session_sampling.base_url, origin_client.clone())` |
| :952 | 恢复会话，`persisted_base_url` 解析后 | `spawn_sampler_transport_prewarm(&persisted_base_url)` |
| :1142 | 恢复会话，`load_is_current` 检查通过后 | `self.prewarm_final_model_base_url(&session_id, &persisted_base_url, origin_client.clone())` |

**我们这侧的对应点已定位**（按机制而非行号，见 A7 的方法论更正）：
`nofy-shell/src/agent/mvp_agent/session_setup.rs`（1478 行）
- **:377** `self.resolve_sampling_config_for_model(..)` → **:393** `build_summary_client(&session_sampling)`
  ＝上游 :501 的位置（新建路径）；:687 的对应点在同一函数内最终模型解析之后。
- **:691** `let load_session_sampling = self.resolve_sampling_config_for_model(..)` →
  **:695** `build_summary_client(&load_session_sampling)` ＝上游 :952 的位置（恢复路径）；
  :1142 的对应点在 `load_is_current` 检查之后。

**第五个调用点（`client.rs`）**：上游 `xai-grok-sampler/src/client.rs:695` 在 `post` 里调
`crate::prewarm::note_first_sampling_use(&self.base_url)`。我们的对应位置需按机制定位
（`SamplingClient::post` 的入口）。

### 12.3 我们这侧的适配点 —— 含一个上游没有的设计问题

**① `nofy_extra_ca` 的 API 不同（㉓ 已踩过）**：上游 `build_http_client()` 是
`xai_grok_extra_ca::build_reqwest_client(configure_http2)`，我们是
`nofy_extra_ca::with_extra_root_certificates(configure_http2(builder)).build()`。
**`pooled_client()` 只是包一层我们既有的 `client()`，不碰这条**，故无影响。

**② `strum` 依赖**：上游 `PrewarmOutcome`/`Freshness` 都用 `strum::AsRefStr` +
`#[strum(serialize_all = "snake_case")]`。`nofy-sampler` **未依赖 strum**
（它只是 workspace 依赖）。两个选择：加依赖，或手写 `as_str()` 穷尽 match。
**建议手写**——与 ㉕ 对 `Newline` 的判断同理（为几个变体引入 derive 依赖不值，
且穷尽 match 在加变体时是编译错）。**注意 `#[non_exhaustive]` 要保留**，
它是这个枚举的公共 API 承诺。

**③ 环境变量名**：`GROK_POOL_IDLE_TIMEOUT_SECS` → `NOFY_POOL_IDLE_TIMEOUT_SECS`
（我们 `configure_http2` 里已经在读这个名字，所以是**复用**而非新增）。

**④ ★ 上游没有的设计问题：mTLS 模型预热的是错的池。**
`pooled_client()` 返回的是**共享的无凭据 client**。而 ㉓ 之后，配了 `mtls_cert_dir`
的模型走的是 `shared_http::mtls::mtls_client(cert_dir, force_http1)` 缓存出来的
**另一个 `reqwest::Client`，有自己独立的连接池**。后果有两层：
- **预热无收益**：暖的是永远不会被这个模型使用的池。
- **拨号会被拒**：预热「carrying no credentials」，即**不出示客户端证书**；
  一个真正要求 mTLS 的网关会在 TLS 握手处拒绝。结果是 `Failed`，
  并且在运营方的网关日志里留下一次认证失败——无害但是噪声，且遥测会误导。

上游同样有这个盲点（它的 `pooled_client()` 不接受任何参数），
但**我们的受众恰恰是自建网关/企业内网**（㉓ 的立项理由原话），所以这里比上游更需要处理。

三个选项：
- **(a) 跳过**：模型有 `mtls_cert_dir` 时不拨号，并**新增一个 `PrewarmOutcome::SkippedMtls`
  变体**让它可见，而不是静默什么都不发生。约 5 行。
- **(b) 走凭据 client 预热**：`prewarm_transport` 接受可选的 cert_dir，
  用 `mtls_client(..)` 拨号。**收益最大**——mTLS 握手是双向认证，
  正是最该被移出首响应路径的那一段。代价：签名变宽、`WARM_STATE` 的键要从
  「origin」变成「(origin, identity)」（**同一 origin 上两个不同身份是两个独立的池**，
  只按 origin 记会让 A 身份的预热挡住 B 身份）、以及 `mtls_client` 的失败要映射成
  outcome 而不是 error。约 40 行 + 键类型改动 + 测试。
- **(c) 什么都不做**（＝上游行为）：不可接受，因为它是**静默失效**。

**建议：slice 1 做 (a)，但键类型现在就按 (b) 设计。**
具体：`WARM_STATE` 的键从一开始就用
`WarmKey { origin: String, identity: Option<[u8; 32]> }`（非 mTLS 时 `identity: None`，
行为与上游逐字等价），这样 slice 2 实现 (b) 时**不需要改数据结构、不需要动上限与清扫逻辑**。
理由：(a) 让常见情形（bearer token 端点，即绝大多数 BYOK 供应商）立刻拿到全部收益，
且失败是**遥测可见**的而非静默的；(b) 的键类型改动会牵动 tracker 的上限/清扫与其测试，
为一个较少见的配置扩大爆炸半径不值得——但**不现在定键类型就会把 slice 2 堵死**。

**⑤ `note_first_sampling_use` 的落点**：上游在 `SamplingClient::post` 里调。
我们 `post` 有 mTLS 三分支（㉓），**三条分支都要记**，否则 mTLS 模型的首次使用
不会出现在 freshness 遥测里——而那正是 ④ 里最需要观测的情形。

### 12.4 实施顺序（每步可独立编译）

1. `nofy-sampler/src/shared_http.rs`：加 `PooledClient` + `pooled_client()` +
   `pool_idle_timeout()`，并把 `configure_http2` 里那次 per-call 读取换成 `pool_idle_timeout()`。
   **这一步单独可验**：既有 `shared_http` 测试（㉓ 后 18 个）必须全绿。
2. `nofy-sampler/src/prewarm.rs` + `prewarm_tests.rs`；`lib.rs` 加 `mod prewarm;` 与
   `pub use prewarm::{PrewarmOutcome, PrewarmReport, prewarm_transport};`。
   键类型按 12.3④ 用 `WarmKey`。
3. `nofy-sampler/src/client.rs`：`post` 的**三条分支**都调 `note_first_sampling_use`。
4. `nofy-shell/src/agent/mvp_agent/sampler_prewarm.rs`（新文件）+ `mvp_agent/mod.rs` 加 `mod`。
5. `session_setup.rs` 四个调用点（:377/:393 之间、新建路径最终解析后、
   :691/:695 之间、恢复路径 `load_is_current` 之后）。
6. mTLS 跳过分支（12.3④ 的 (a)）+ `SkippedMtls` 变体。

### 12.5 测试与红绿靶子

**上游 `prewarm_tests.rs` 只有 3 个测试**（`warm_state_machine`、`status_strings_are_stable`、
`first_use_span_records_freshness_once_per_origin`），235 行——**与 `mtls_tests.rs` 同样的薄覆盖，
不能照抄**（§11.6 的教训）。我们要补：

- `dial_and_drain` 的 **h1/h2 分岔**：这是本模块最容易写错的地方。
  需要一个能控制 `response.version()` 与 body 长度的测试替身，断言
  「h2 + 超 64 KiB → `Pooled`（`Truncated` outcome）」与
  「h1 + 超 64 KiB → `CappedUnpooled`（`Truncated` outcome）」**两者 outcome 相同但语义不同**，
  以及「h1 + 抽干 → `Warmed`」。
- `OriginClaim` 的 **Drop 释放**：`Failed`/`TimedOut`/`Truncated` 之后**同一个 origin 立刻可以再拨**；
  `Warmed` 之后在 idle_window 内**不能再拨**（`AlreadyClaimed`），过了 window 可以。
- **并发占位**：两个任务同时 claim 同一 origin，一个 `InFlight` 另一个必须 `AlreadyClaimed`。
- `MAX_TRACKED_ORIGINS` 的**清扫优先于拒绝**：塞满 32 个**过期**的 `Warmed` 后仍能 claim
  （`has_room_after_sweep` 生效）；塞满 32 个 `InFlight` 后返回 `TrackerFull`
  （`InFlight` 一律保留，不被清扫）。
- `endpoint_origin` 的拒绝面：非 http/https scheme、无 host、不可解析 → `NoOrigin`。
  **注意 origin 序列化会丢掉路径**，要有一个测试钉住「拨的是 origin 不是 base_url」。
- `note_first_sampling_use` 的**每 origin 只记一次**与 32 上限逐出。
- **mTLS 跳过**（12.3④）：配了 `mtls_cert_dir` 的模型 → `SkippedMtls`，且**没有发生拨号**。
- `prewarm_base_url_if_changed`：相同 base_url 不重复拨。
- `PrewarmCancelGuard`：任务被 abort 时 span 上 `outcome == "cancelled"` 且 `duration_ms` 非 Empty。

**红绿靶子（至少 6 项）**：
① `OriginClaim::commit` 改成不写 `Warmed` → 重暖窗口测试红；
② `Drop` 改成不移除 → 「失败后可立刻重试」测试红；
③ `should_dial` 的 `Warmed` 臂去掉 idle_window 比较（永远 false）→ 过期后可重暖的测试红；
④ `has_room_after_sweep` 改成不清扫 → 「塞满过期项仍能 claim」测试红；
⑤ `dial_and_drain` 去掉抽干循环 → h1 的 `Warmed` 测试红（**这是最该有靶子的一处**：
   不抽干则 h1 连接根本不入池，预热静默无效）；
⑥ `pools_at_handshake` 恒判 true → h1 截断的 `CappedUnpooled` 测试红；
⑦ mTLS 跳过分支去掉 → `SkippedMtls` 测试红。

### 12.6 如实登记为难以覆盖的

- **真实入池无法直接断言**：`reqwest` 不暴露 pool-hit 信号（上游注释已明说），
  所以「预热真的让下一次请求复用了连接」只能靠 `note_first_sampling_use` 的
  freshness 遥测**间接**观测，无法在单测里断言。可考虑用 `shared_http_wire`
  集成二进制（它 owns 自己的进程环境）加一个真服务器用例，但那超出 slice 1。
- **`PREWARM_TIMEOUT` 与 `pool_idle_timeout` 都是进程级闩住的**，
  并行测试无法各自设定；需要像 ㉓ 那样把逻辑抽到可注入的私有实例上
  （`claim_origin` 已经接受 `idle_window` 参数，这条路是通的）。
- **detached spawn 不随会话取消**是上游的明确设计，但 `PrewarmCancelGuard` 的存在
  说明它仍可能被 runtime 关闭时取消；这个交互难以在单测里稳定复现。
+
## 13. 1.0.33–1.0.35 增量（`a28ee2b2`）候选分层（2026-09-18 摸底）

摸底数据、区域互斥分布、缺失明细与 changelog 23 条初判都在台账
「增量摸底(1.0.33–1.0.35@a28ee2b2,2026-09-18)」专节；本节只回答**怎么吃**。
规模一句话：`48271133..a28ee2b2` 一个 squash 提交，**356 文件 +27,478/−6,217**，
其中 **44.1% 是 pager 家族（A8 整体跳过）**、7.6% 云/hub/clone/feedback 红线、5.1% 测试基建、
2.0% telemetry、1.1% 仓库元数据，**真正要逐项甄别的内核面 143 文件（40.2%）**。
命名归一后 **存在 226 / 缺失 124**（`crates/` 350 文件口径）。

### 13.1 T0 — 已核实为真缺口、外科可落地、与已落地工作直接接续

| 项 | 上游实体 | 为什么是 T0 |
|---|---|---|
| **C2 goal × 压缩交接** | `prepare_goal_continuation` 加 `GoalContinuationPurpose::{Compaction,TurnEnd}`、token 预算加 `apply_turn_end` 门、新 `reseed_active_goal_after_compaction` + `GOAL_CONTINUATION_SENTINEL`（+383 行新测试 `goal_compaction_reseed_tests.rs`） | 改的是我们**已有函数的签名与调用点**（我们 `goal.rs:1097` 是 `prepare_goal_continuation(current_tokens)` 单参定义，调用点在 `:1357` 与 `:1380`），与原生② 的 `reseed_tokens_after_shrink` 同域。上游把「压缩后重新播种 goal 的 token 基准」与「回合结束才 enforce 预算」分开——**正是②只做了 chat-state 侧、没做 goal 侧的那一半**。零云依赖、零新子系统 |
| **C3① 构建期 dump 语法集** | 新 `nofy-markdown/build.rs`：`two_face::syntax::extra_newlines()` + Swift 语法 → `OUT_DIR/syntaxes.bin`（上游注释原话：运行时 `SyntaxSet::build` 拖住首次 Read 上色，GB-5513 PTY fold） | 我们 `syntax.rs:41` 正是运行时构建，**属 A5 性能且零新依赖**；顺带把 1.0.35#3 的 `Swift.sublime-syntax`（+417）带进来。与 §12 的 sampler 预热同属「首次使用前的准备」思路 |

### 13.2 T1 — 内核韧性/正确性，形状差已核实、需读实现后动手

- **C1 配置写入原子性/并发隔离**（本轮最大集群：12 文件 +4,369/−328）。三个**可分离**的想法：
  ① `fs_atomic` 的符号链接感知发布（我们 43 行 vs 上游 1,284 行，`resolve_atomic_destination`/
  `LeafSymlink`/`SYMLINK_FOLLOW_LIMIT` 全树零命中）；② `ConfigWriteGuard` + `run_blocking` 的**取消安全**
  （被取消的 await 不能在 async frame 里放锁，`SAVE_LOCK` 要移进阻塞任务；我们已有 `SAVE_LOCK` +
  `save_config_locked`，但 `acquire_init_lock` 只用在 `extensions/marketplace.rs`，配置保存路径没上 flock）；
  ③ watcher 对 `$NOFY_HOME/config.toml` **外链 referent** 的归类与 A→B retarget 跟随。
  这正是 §8.3 T1 里「1.0.25 启动设置/模型目录在并发启动间被共享或互相覆盖」与
  「1.0.29 同 `GROK_HOME` 并发 `agent stdio` 启动即崩」两条的上游落地面。
  ⚠ **前置冲突**：与在飞的配置 TOML→JSON 迁移（`9383df3a`）同在配置写入路径，**先定次序再动手**。
- **C6 `folder_trust` 的 `GrantResolution::resolution()`/`dismisses_gate()`**：授权结果分类 + 是否解除闸口，
  与 ⑰⑳ 立下的闸口语义直接相关（我们零命中）。同集群的 `fs_notify` 事件帧 root 限制/分批要单独核——
  我们的 `confine_to_root` 在 `handle.rs:1904`（API 层），上游这轮加在**事件帧**层，不是同一层。
- **1.0.33#7 + #9（/rewind 与 30 天清扫）**：压缩检查点的保留与清扫策略，与原生② 同域；
  两条同源（清扫掉了 rewind 需要的检查点），应一起核实、一起改。
- **1.0.33#4（父会话关闭时后台子代理正确显示 cancelled）**：`spawn.rs` +49/−67、`session_setup.rs` +117、
  新 `isolated_spawn_e2e.rs` +284；与 ㉒（resume 告知在跑的 loops/subagents）同域。
- **1.0.33#6 + #2（MCP 取消/超时通知 server、结果带 structuredContent）**：协议正确性，架构无关。
  #2 需先确认我们 vendored rmcp 是否暴露 structuredContent——⑬ 已有「钉版差异需先升 rmcp」的教训。
- **1.0.33#10（在跑的计划任务/monitor/workflow 期间不出 auto recap）**：按 §9.1 纪律
  **先问我们自己的 daemon/scheduler/orchestra 是否已用另一种形状解决**，再决定移植/原生/登记分歧。
- **1.0.33#8（skill 文件也受同一 token 上限）**：想法可取，但我们 read_file 的截断层不同源
  （走 `extract_file_content_lines` + `max_delta_bytes`，全树无 `READ_FILE_MAX_TOKENS`），
  属**原生实现**而非移植，别照搬上游的 `max_output_bytes` 形状。

### 13.3 T2 — 需先判定红线/钉版/结构，或需用户拍板

- **C3② 高亮后端 fancy→onig**（`syntect` `default-fancy`→`default-onig`、`two-face` `syntect-fancy`→`syntect-onig`）：
  内存与速度收益是上游 1.0.35#4 的主体，代价是引入 **oniguruma 原生 C 依赖**（构建/体积/交叉编译）。
  **需用户拍板**；C3① 可以先单独做，两者在上游是同一个提交里但技术上可分离。
- **C5 的 1.0.35#1（headless MCP 状态与 connecting 提示对齐真实握手）**：缠批15 托管连接器分歧
  （`mcp_connecting_reminder_tests.rs` 我们缺失，上游本轮又 +327）；`util/config/mcp.rs` +469/−163 需逐段读。
- **C4 的 `tool-types` 抽包**（新 `glob.rs`/`grep.rs`/`read.rs`/`web_search.rs`）：结构搬迁，
  其中 `web_search` 是红线（网页搜索已剔除）；只在 C4 的想法落地时顺带评估，不单独立项。
- **Memory v2 整层**（6 个 `nofy-memory/src/v2*.rs` + shell 6 个 memory 文件〔5 实现 + 1 测试〕，本轮 +2,417/−385，
  含新 `v2_carryover.rs` +529/+439、新 `memory_control.rs` +650）：**「缺失」不等于「该移植」**。
  我们同域是 `nofy-memorycore` + v1 `memory_dream.rs`（⑲ 刚动过，本轮上游也改了它 +40/−21 与
  `v2_memory_dream.rs` +141/−103）。按 §9.1 纪律先回答「memorycore 是否已用另一种形状解决
  carryover/maintenance/control」，再决定立项、只取想法、还是登记分歧。**这是本轮最大的未决项**，
  形状与 `message-delivery-core` 那次撤销定性高度相似（当时正是靠「零命中」误判过一次）。
- **`permission/managed_policy/tests.rs` +696/−1,006（实现未动，净删 310 行）**：先判性质——
  「放宽脆弱文本断言」按批16/17/20 方针**不跟**，「改成结构对比」按批23 方针**跟**。
- **`ptyctl/src/term.rs` +130、`ratatui-inline` `terminal.rs` +199/`tests.rs` +375、`shared/stderr.rs` +20/−3**：
  三个文件我们都有（存在），需按「是否只影响渲染」判 A8 边界，别默认归 UX。

### 13.4 跳过（红线 / 已物理剔除 / A8）

pager 家族 157 文件（A8，用户指示）、telemetry 7、shell `feedback*` 6 + `prod/mc` `feedback_types.rs`、
`computer-hub-*` 3 + `tool-protocol` 的 BotRelay 生成物（swift/kotlin，批23 已定不移植）、
`fast-worktree` grove/nfs 6 + `e2e_grove_worktree.rs`、`tool-types/web_search.rs`、
1.0.33#15（Windows `grok clone`：无 clone 表面且不发 Windows 构建）、1.0.33#5/#11/#12/#14（dock/minimal/footer UX）、
1.0.34#1（主题色渲染）、1.0.35#5/#6（minimal 复制粘贴、`/memory` 模态 UX）、
1.0.35#2（ACP `tool_call` 映射，**已落地**：`MCPTool`/`SearchTool` 带 query/results/args/output）。
> `tool-protocol` 的 `frames.rs`/`lib.rs` 被上面的路径关键词一起算进了云面（27 个里的 2 个），
> 它们是协议管线不是 BotRelay 生成物，**归云面这一步是关键词判的，需单独看**。

### 13.5 一条不在任何 changelog 里、但建议吸收的

主提示词模板 `templates/prompt.md` 新增：「Never fabricate a person’s name or infer it from a username,
handle, email address, or initials…」——架构无关、纯正确性，是「取想法原生实现」的典型（同 ㉔ 那类
非 changelog 项，只能靠逐文件比对看见）。同轮上游**删掉**了整个 `<tool_calling>` 段与
「These are the only memory locations…」一句（我们 `prompt.md:18–20` 仍有该段）：这是**行为指导的减法**，
**不跟**，除非我们独立判断该段已无价值。⚠ 改模板后必须重跑
`crates/codegen/nofy-agent/scripts/encrypt_templates.py`（台账既有约束）。

### 13.6 节奏

T0 两项都是小手术（C2 改一个函数签名 + 加一个 reseed 方法；C3① 加一个 `build.rs`），
可以合成一批先落地，顺带把 1.0.33–1.0.35 的台账**初判升级成核实结论**（按 §8.2 的新方法：
按内容匹配、双索引对账、核实结论一律回写）。**C1 与 Memory v2 各自需要一次单独决策**
（C1 撞在飞的配置迁移，Memory v2 撞 §9.1 纪律），不要塞进同一批。
动手前必须先做台账「前置动作」三条（重建上游 worktree/索引到 `a28ee2b2`、确认 `crates/` 干净、定 C1 次序）。

## 14. 1.0.33–1.0.35 吸收执行方案（2026-09-18，索引重建后）

### 14.0 索引状态（本轮已重建，双索引对账法可用）

| 索引 | 位置 | commit | nodes | edges | clusters | flows | 耗时/退出码 |
|---|---|---|---|---|---|---|---|
| 我们 | `/Users/mac/nofy-build` | `79002da` | 203,385 | 430,338 | 9,359 | 300 | 141.5s / 0（增量 changed=71 added=2） |
| 上游 | `/Users/mac/nofy-upstream` | `a28ee2b2` | 134,329 | 327,031 | 7,544 | 300 | 265.4s / 0（增量 changed=309 added=40 deleted=1） |

两边都打印了 "Repository indexed successfully"，`gitnexus status` 均 ✅ up-to-date；
日志 `/tmp/gn_up.log`、`/tmp/gn_build.log`（命令形式仍守台账纪律：重定向到文件 + `echo *_EXIT=$?`，管道里不放 tail）。

- ⚠ 两个索引**仍注册在同一个名字 `nofy-build` 下**（名字取自 git remote，worktree 共享），
  故每次 CLI 调用都必须传 `-r <绝对路径>`（§9 的既有结论，本轮全程照做）。
- ⚠ **调用图又两次被实测为下界**：`impact(prepare_goal_continuation)` 与 `impact(cleanup_stale_sessions)`
  （消歧到 `session/persistence.rs` 那个 uid）都报 `impactedCount: 0 / risk LOW`，而 grep 实测前者有
  `goal.rs:1357`、`:1380` 两个调用点。**空 ≠ 不存在，一律以 grep 枚举为准。**
- ⚠ 本会话**没有 GitNexus 的 MCP 工具**，全部查询走 CLI（`query`/`context`/`impact`/`detect-changes`）。
  `detect-changes` 可用，但 `nofy-sandbox`/`nofy-mcp` 仍是索引盲区（⑫⑬ 已记），其 "No changes" 不采信。
- 一次成功的定位示例（14.2 靠它才找到实现）：`gitnexus query 'compaction checkpoint retention cleanup sweep' -r /Users/mac/nofy-upstream`
  直接返回 `persistence_cleanup_stale_sessions_tests.rs` 的两个靶子——**关键词扫 diff 失败时，索引 query 是第二条腿**。

### 14.1 批26（T0，两项小手术，可合一批）

> ✅ **批26 已落地（2026-09-18）**：A = 原生㉖ `74bf0a3d`、B = 原生㉗ `a9dcd5d2`。
> 验证、红绿双验、基线（markdown 477 / pager-render 1,053）与如实登记的局限全部写在
> 台账「批26 原生实现日志」。下面两小节保留为**当时的核实记录**，其中 B 的一处判断已被
> 依赖图证据推翻（见本节末与 §14.4 之后的更正）。A 的实际规模也比这里估的大：不止
> 「改一个函数签名 + 加一个 reseed 方法」，而是横跨 chat-state 与 shell 的四个协作部件
> （objective pin 的通道在 chat-state 的 `CompactionInputs`）。

**A. goal × 压缩交接（C2）— 已核实真缺口，落点精确到行**

- 上游形状（已逐行读）：`goal.rs:1169–1178` 的 `reseed_active_goal_after_compaction`（仅 10 行）=
  `get_total_tokens()` → `prepare_goal_continuation(tokens, GoalContinuationPurpose::Compaction)` →
  `inject_goal_continuation_message(plan.directive)`；**生产调用点只有一个：`session/compaction.rs:1912`**
  （另 3 个调用者是本轮新增的测试）。purpose 参数带来的行为差是：token 预算强制被 `apply_turn_end` 门控，
  **Compaction 用途不触发「预算到了就停 goal」**。
- 我们这侧（已核实）：`goal.rs:1097` 是单参 `prepare_goal_continuation(current_tokens)`，调用点 `:1357`
  （goal round 决策）与 `:1380`（`maybe_queue_goal_continuation`）；`enforce_goal_token_budget` 另有
  `goal.rs:1302` 与 `turn.rs:1494` 两处；**`goal.rs` 全文零 "compact"**，即压缩路径完全不通知 goal。
  可复用的件已在：`prune_prior_goal_continuation_directives`(:1052)、`inject_goal_continuation_message`(:1372)。
  ⚠ 我们已有的 `DrainPurpose::{TurnEnd,MidTurn}`（`types.rs:215`）是**另一条轴**（drain goal updates 的时机），
  别与新的 `GoalContinuationPurpose` 混用，也别误当成已实现。
- 落点：`compaction.rs` 的 `replace_conversation_for_compaction`(:1706) 之后（对应上游 `:1912`）。
- 做法（原生）：加 purpose 参数 + `apply_turn_end` 门 + reseed 方法 + 一个调用点。上游 sentinel 语义
  （"Do not restart this goal or revive a prior unrelated task"）值得保留，但要与我们
  `is_goal_continuation_directive`(:1055) 的识别方式对齐——上游用 `SyntheticReason::GoalSummary` +
  `GOAL_CONTINUATION_SENTINEL` 双条件，需核我们是否同形。
- 验证：`cargo check -p nofy-shell --all-targets`；nofy-shell 全量对基线（5,245 passed / 2 macOS 伪失败）；
  照上游三个靶子改写测试（`post_compact_history_keeps_objective_and_goal_summary_continuation`、
  `paused_goal_does_not_override_later_human_query`、`compact_reseed_skips_turn_end_drain_and_round_count`）；
  **红绿双验**：去掉 reseed 调用 → 靶子 1 必须红；去掉 `apply_turn_end` 门 → 靶子 3 必须红。

**B. 语法集构建期 dump + 跨主题共享（C3①）— 已核实，且我们的收益大于上游**

- 上游形状：新 `build.rs`（`extra_newlines()` + Swift 补丁语法 → `dump_to_uncompressed_file(OUT_DIR/syntaxes.bin)`，
  注释原话：运行时 `SyntaxSet::build` 拖住首次 Read 上色，GB-5513 PTY fold）；`syntax.rs` 改为 `syntax_set()` =
  `OnceLock<SyntaxSet>` + `from_uncompressed_data(include_bytes!(concat!(env!("OUT_DIR"), "/syntaxes.bin")))`；
  Swift 走 `is_swift_token`/`patched_swift`（「最后一个 `.swift` 胜出」，补丁语法追加在 two-face 之后）。
- 我们这侧（已核实）：`nofy-markdown/src/syntax.rs:41` 运行时 `two_face::syntax::extra_newlines()`；
  **`nofy-pager-render/src/syntax.rs:152/154/156` 为三个主题各建一个 `Syntect::new` 单例**
  （nofy-night / tokyo-night / nofy-day）→ 最坏情况**三份 250+ 语言语法集**；另有 `open_code_highlighter.rs`、
  `benches/bench.rs`、`bin/playground_common.rs` 用同一构造。
- ⚠ **上游没解决、我们要顺手解决的一点**：syntect 5.3.0 的 `SyntaxReference` 是 `#[derive(Clone)]` 且含
  `serialized_lazy_contexts: Vec<u8>`（`syntax_set.rs:51–63`），所以上游那句 `SYNTAX_SET.get_or_init(load_syntax_set).clone()`
  **是深拷贝序列化字节**，每个 `Syntect` 一份；我们的三主题单例照抄上游仍是 3 份。**原生做法：
  `OnceLock<Arc<SyntaxSet>>` + 字段改 `Arc<SyntaxSet>`**（调用点都写 `&syn.syntax_set`，`Arc` 自动 deref，改动面小），
  一次拿到「不再运行时构建」+「跨主题只留一份」。
- 代价：`include_bytes!` 把 dump 嵌进二进制，**体积增量需实测并记进台账**；Swift 资产(+417)与 `patched_swift`
  是 1.0.35#3 的实体，随本项进来。**fancy→onig（C3②）不在本批**，见 14.4。
- 验证：`cargo build -p nofy-markdown` 确认 build.rs 生效 + 记录二进制体积前后差；markdown/pager-render 测试；
  **性能靶子**：首次高亮耗时与三主题并存时的 RSS（用 `benches/bench.rs` 或临时二进制量化后写回台账）；
 `impact(Syntect)` 需先消歧（`Impl:` 与结构体两个同名 uid）。

### 14.2 批27（T1-a，会话清扫的活跃标记 — 1.0.33#7 + #9）

> ✅ **批27 已落地（2026-09-19）**：原生㉘。台账「批27 原生实现日志」。下面保留为当时的核实记录。

**已核实真缺口；且上游的实现不在本轮 delta 里——这条最容易找错地方。**

- 定位经过：按 `checkpoint`/`offload`/`sweep`/`retention` 扫本轮 diff **只命中 changelog 文本**；
  改用上游索引 query 才找到实体：`session/persistence.rs:3264 mark_session_live(session_dir)` + 测试文件
  `session/persistence_cleanup_stale_sessions_tests.rs`（靶子 `live_session_dir_is_never_removed_but_its_stale_blobs_are_pruned`、
  `mark_session_live_keeps_an_idle_session_out_of_a_foreign_sweep`），生产调用点在 `agent/mvp_agent/session_setup.rs`。
  **该测试文件本轮未改** → 机制早于 `a28ee2b2`，属 1.0.25–1.0.32 那段缺口；1.0.33#9 是把它扩到压缩检查点与
  prompt offload，1.0.33#7 是 rewind 侧的容错（只需目标的 base checkpoint 在）。
- 我们这侧（已核实）：`session/persistence.rs:2749 DEFAULT_CLEANUP_TTL_DAYS = 30`、`:2758 cleanup_stale_sessions(skip_session_dir)`
  按 **mtime** 删 `~/.nofy/sessions/` 下的文件、**只跳过当前会话目录**，TTL 可由 `[storage] cleanup_ttl_days` 配置；
  全树 `mark_session_live` **零命中**，也没有那个测试文件。⚠ 另有**同名不同物**的第二个清扫面：
  `nofy-workspace/src/recovery.rs:388 cleanup_stale_sessions`（7 天、删整个会话目录），改的时候别混
  （`impact` 也因此报 ambiguous，必须用 uid 消歧）。
- 结论：**bug 形状我们大概率同样有**（长驻会话的旧 checkpoint/offload 因 mtime 老化被别的进程扫掉）。
  做法：移植活跃标记 + 清扫先判活跃 + 活跃会话只 prune blob 不删目录；rewind 侧改为只要求 base checkpoint。
- 验证：照上游两个靶子写我们的版本（**必须含「外来进程发起的清扫」这一情形**）；nofy-shell 全量对基线；
  `impact` 报 0 不可采信（它经 `spawn_blocking` 调用，宏体内的调用点图看不见），以 grep 枚举为准。

### 14.3 批28（T1-b，配置写入的跨进程与取消安全 — C1）

> ✅ **前置决策已拍板（2026-09-19）**：用户配置**走 JSON、舍弃 TOML 写回**（TOML 无法结构化供应商嵌套 `models`）。
> 已落地：新建默认 `config.json`；写 `config.toml` 的入口一律改写到旁路 JSON 并把遗留 toml 改名为 `.bak-json-*`；
> `ConfigWriteGuard` = SAVE_LOCK ⊃ `.config-init.lock` flock，写回在 `run_blocking` 里持锁（取消安全）。
> **未做**：上游 `resolve_atomic_destination` 整段符号链接跟随（仍可后补）；watcher retarget（步骤③）。

- 已核实：我们的 `SAVE_LOCK` 是**进程内** `tokio::sync::Mutex`（`persist.rs:11`），`save_config_locked` 在锁内做
  read-modify-write，但发布走 `nofy_config::save_user_config_value`，**既无跨进程 flock、也不做符号链接解析**；
  `acquire_init_lock` 只用在 `extensions/marketplace.rs:1208`（配置保存路径没用）；`nofy-config/src/fs_atomic.rs` 仅 43 行。
  即**两个并发 `nofy` 进程写同一 config 无任何互斥**（这正是 §8.3 T1 里「并发启动互相覆盖」与
  「同 `GROK_HOME` 并发 `agent stdio` 启动即崩」两条的机制面）。
- 上游 `impact(resolve_atomic_destination)` = **CRITICAL**（27 直接 / 50 受影响 / 8 模块）——它是所有原子写的公共入口。
  **按 AGENTS.md 要求在此明确提示 CRITICAL 风险。**
- 因此必须**三步走、每步可独立编译**：① `nofy-config/fs_atomic.rs` 加解析器 + 全量单测（从上游 `fs_atomic_tests.rs`
  的 1,584 行里挑靶子，尤其符号链接跳数上限与 `..` 穿越的 ENOTDIR/ENOENT）；② 只把配置保存这一处发布换成
  解析后的目标 + 加跨进程 flock；③ 最后才做 watcher 的外链 referent 归类（`resolve_global_config_dest`/
  `classify_watched_path`）与 retarget 跟随。每步 `cargo check --workspace --all-targets` + `detect-changes`。
- ⚠ **阻塞项**：与在飞的配置 TOML→JSON 迁移（`9383df3a`、`desktop/scripts/migrate-config-to-json.mjs`、
  `save_user_config_value` 的格式感知写回）改的是同一段发布逻辑。**需用户先定次序**（建议迁移先落地）。
- 取消安全那半（`ConfigWriteGuard` + `run_blocking`：被取消的 await 不能在 async frame 里放锁）可独立于
 符号链接那半先做，风险面小得多，**若要拆批，先做这半**。

### 14.4 需用户拍板的两项（不排进批次）

| 项 | 取舍（均已核实） | 建议 |
|---|---|---|
| **C3② fancy→onig** | 收益是 1.0.35#4 的内存/速度主体；代价是引入 oniguruma 原生 C 依赖（构建链、体积、交叉编译），且 `syntect` 与 `two-face` 两处 feature 要一起改（上游是 `default-fancy`→`default-onig`、`syntect-fancy`→`syntect-onig`；我们根 `Cargo.toml` 现为 `syntect = "5.3"` 默认即 fancy） | **先做 14.1B**（零依赖即可拿到「不再运行时构建 + 三主题共享一份」），实测后再决定是否值得上 onig；若上，需单独一次构建面验证（macOS/Linux、release 体积、构建耗时） |
| **Memory v2 整层** | 上游 v2 是**独立磁盘地基**（`v2.rs` 模块 doc 原话：「V2 never reads from or writes to the legacy `memory/` tree」；rusqlite 状态库 + topics/observations/archive/manifest/lexical index，本轮新增 `v2_carryover.rs` +529 与 +439 测试）。我们这侧：`nofy-memory`（v1，markdown + rusqlite 索引/embedding，15 文件）**是在用的**；`nofy-memorycore`（12 文件约 2,025 行：auditstore/compact/compleases/curator/dreaming/forkrev/injection/modelops/projstore/seal/snapshot）**除 `nofy-daemon/tests/ratchet.rs` 外无任何消费者＝未接线** | **不移植 v2**。理由与撤销 `message-delivery-core` 同构：移植会在同一域造出第三套模型（v1 + memorycore + v2）。改为两个独立决定：① 1.0.35#7 的实质（删除慢、开关不接线 agent）按内容在我们 v1 路径上核实后原生修；② `memorycore` 接线是**我们自己的绿地项目**（与 `attempt_store` 同类），不属吸收上游 |

> ⚠ **更正（2026-09-18，㉗ 实施时以依赖图核实）：上表的 C3② 一行作废——我们本来就在 onig。**
> `cargo tree -p nofy-markdown` 实测 `syntect v5.3.0 → onig v6.5.1 → onig_sys v69.9.1`；
> 根 `Cargo.toml` 的 `syntect = "5.3"` 未关默认 feature，而 syntect 5.3 的 `default = ["default-onig"]`，
> `two-face` 那侧的 `features = ["syntect-fancy"]` 不改变 syntect 自身后端。故「引入 oniguruma 原生 C
> 依赖」这个代价我们**早已付过**，无需拍板；1.0.35#4 剩下的全部收益就是 ㉗（构建期 dump + 全进程共享
> 一份），已落地。§13.3 的 T2「C3② fancy→onig」条目同样作废。
> **方法论教训（比这条本身重要）**：「上游把 X 改成 Y」不能推出「我们是 X」——feature 的默认值与
> 统一规则会让实际形态与 Cargo.toml 字面不一致，判后端/特性开关一律查 `cargo tree` 或编译产物。

### 14.5 批26/27 之后的待核实队列（逐项核实后写回台账，含「已对齐」与「假阳性纠正」）

1. **C5 MCP 三项**：#6 取消/超时通知 server + #2 structuredContent **已落地（㉙，2026-09-19）**。
   落点不在 `util/config/mcp.rs`，在 `xai-grok-mcp/src/servers.rs` 的 `call_tool_cancel_aware` + `CancelOnDrop`。
   我们原先 `tokio::time::timeout(mcp_service.call_tool)` 超时/Esc drop **不**发 `notifications/cancelled`。
   #1 headless 状态/connecting 提示——**跳过**：缠批15 托管连接器分歧，本队列关闭，不在 14.5 再排后。
2. **C6 两项**：`folder_trust` **已落地（㉛）**——`grant_folder_trust` 返回 `GrantOutcome`，
   `dismisses_gate()` 才关闸；hooks Trust 失败会报错而不是假装成功；`--trust` 失败打 stderr。
   `fs_notify` 事件帧 root 限制 **已落地（㉞，`dcb9a807`）**：`confine_to_root` 加在 workspace `fs_notify`（绝对路径保留，因 wire `FsChanged.path` 仍是单 path），会话 live 路径 `fs_watch::on_files_changed` 经 `confine_fs_event_to_root` 调用。跨 root rename → `Removed`/`Created`。**分批跳过**：上游 `FS_CHANGED_PATHS_PER_FRAME` + `FsChanged { paths, kind }` 要改 wire；我们仍逐 path 发 `{path, kind}`。
3. **1.0.33#10 recap 门控** **已落地（㉜，`dcb9a807`）**：`cli_is_idle_for_recap` 在 monitor/后台任务、`scheduled_tasks`、active workflow、running wake turn、Active goal 时抑制 auto recap（㉒ 只是 resume 告知）。
4. **1.0.33#4 子代理 cancelled 状态** **已对齐**：`cancelled_orphan_finish` / `finalize_orphaned_subagent` 写 `status: "cancelled"`；pager `SubagentFinished` 的 `"cancelled"` 走 `SubagentBlock::cancelled`；`acp_handler/tests/subagents.rs` 已钉。不跟 `isolated_spawn_e2e.rs`（上游新 e2e，想法已在我们树）。
5. **1.0.33#8 skill token 上限** **已落地（㉝，`dcb9a807`）**：`cap_skill_body` 用 `read_file::MAX_NUM_TOKENS=25_000`，行界截断 + 单行 char 回退，load / opencode skill / slash 加载路径都走。不照搬 `max_output_bytes`。
6. **提示词姓名规则** **已落地（㉟，`dcb9a807`）**（见 14.6）。
7. `managed_policy/tests.rs`(+696/−1,006，实现未动) **跳过 不跟**：测试重写、实现零改动，按批16/17/20「保留严格断言」方针。

### 14.6 一条独立小项（可与批26 合并）

主提示词模板新增「不得凭 username/handle/email/首字母臆造人名」规则（**非 changelog 项**，只能靠逐文件比对看见）。
**已落地（㉟，`dcb9a807`）**：`prompt.md` 在 `</action_safety>` 后加姓名规则；`<tool_calling>` **不跟删**。已重跑 `crates/codegen/nofy-agent/scripts/encrypt_templates.py`。

### 14.7 执行顺序与每批固定动作

**批26（14.1 A+B，可含 14.6）→ 批27（14.2）→ 批28（14.3，先解前置决策）→ 14.5 队列逐项核实。**

每批固定动作（台账「标准流程」+ §8.2 新方法）：读上游实现 → 原生落地 → `cargo check --workspace --all-targets` →
相关 crate 全量测试对基线（shell 5,245 passed / 2 macOS 伪失败、workspace 1,761、mcp 180、config 188；
markdown/pager-render **需先建基线**）→ 红绿双验（含「还原后必须回绿」这道检查，㉔ 的教训）→
`gitnexus detect-changes -r <绝对路径>` → 提交（中文信息）→ **核实结论一律回写台账**。

> **本方案里「已核实」与「待核实」的分界（如实登记）**：14.1A/14.1B/14.2/14.3 的上游形状与我们落点都做过
> grep 或逐行读；**14.5–14.6 队列已全部写回结论**（已落地 ㉙–㉟ / 已对齐 / 跳过+理由），不再留「待核实」。
> 1.0.33#1（macOS 粘贴错图）与 1.0.35#2（daemon 路径渲染）**不在 14.5–14.6 队列**，仍停在台账初判。
> **14.8（2026-09-19，`b56c48be`）**：除 Memory v2 外，对照 `a28ee2b2` 的剩余内核缺口一次落地（㊱–㊸）。

### 14.8 除 Memory 外一次吸收完全（2026-09-19，对照 a28ee2b2 实码，不信旧台账）

用户裁定：跳过 Memory v2，其余内核一次吸收。方法仍是原生实现，禁止 git-merge / 整树拷贝。JSON 写回不变，不恢复 TOML 写。

| # | 上游想法 | 落点 | 有意不做 |
|---|---|---|---|
| ㊱ | 截断文本 `stop_reason=Length` 自动续传（批26 头条） | `length_salvage.rs`；`NOFY_LENGTH_SALVAGE` 默认开、预算 2；sampler `salvage_partial_length` 把部分文本当完成 | ConversationRequest 不加 LengthPolicy 字段（避免 ~40 处字面量） |
| ㊲ | 会话开始后台预开模型连接 | `nofy-sampler/src/prewarm.rs` + `PooledClient` idle 90s；`session_setup` new/load `tokio::spawn` | 不带凭证、15s 超时、每 origin 去重 |
| ㊳ | `resolve_atomic_destination` 跟随符号链接再 tmp+rename | unix 跟随（linux 40 / 其它 32 hop）；windows 原路径；`write_atomically` 先 resolve | 不搬上游 Windows walker / bound dest inode 整段 |
| ㊴ | resume picker 一次磁盘遍历 | `resolve_local_session_ids_any_cwd`；pager 一次 walk 再 remote→local 贴标 | — |
| ㊵ | Adobe SVG 带 PNG 缩略图前缀不当图片嵌入 | `should_embed_as_conversation_image` + `extract_svg_text`；PNG 前缀剥掉后走文本 | — |
| ㊶ | 每模型 `reasoning_summary`（Responses `reasoning.summary`） | 目录/覆盖/远程 JSON/`SamplerConfig`/`apply_response_defaults`；默认 Concise；`none` 省略字段 | — |
| ㊷ | `Swift.sublime-syntax` last-wins | `build.rs` 在 two-face 后再 `add`；`patched_swift` 按 `.swift` 倒序找 | dump 比 runtime two-face **+1** |
| ㊸ | 用户配置外链 referent 监视 + A→B retarget | `FollowDestWatch` 盯 `config.json`（无 json 时遗留 toml）的 live dest parent | 不搬 bound dest TOCTOU / inode 整段 |

**本轮仍跳过（有意分歧，不是漏项）**：Memory v2 / v2_carryover；xAI 云/登录/GCS/`x.ai/*`；TOML 写回；MCP pin `V_2025_11_25`（拒绝 `V_2026_07_28`）；headless `--worktree`（`has_worktree: false`）；`grok-workspaced`；pager UX（A8）；1.0.33#1 粘贴错图、1.0.35#2 daemon MCP 渲染。

## 15. 1.0.36–1.0.38 吸收计划（2026-09-20，目标 `4247f661`）

### 15.0 基线、口径与边界

- 本地基线：`054e5131`（`二次开发分支`）；上游基线：`4247f661`（`upstream/main`，1.0.38）。
- 增量窗口：`a28ee2b2..4247f661`，共 **403 文件、+24,000/−6,610**；三个 changelog 共 **22 项**。
- 两侧 GitNexus 索引均已重建并钉到上述提交。两棵历史没有可用 merge-base，
  `git rev-list --left-right --count HEAD...upstream/main = 599/2` 只描述两条快照历史，**不能解释为“还差 2 个提交”**。
- 本轮按功能行为对账，不按文件名、crate 名或符号存在与否判断。禁止整树 merge/拷贝；仍采用“读上游实现 →
  在 Nofy 架构内原生落地 → 红绿测试 → 全量回归 → GitNexus 变更检测”的方式。
- **Memory v2 继续排除**；xAI 云/登录/GCS、TOML 写回、协议钉版等既有有意分歧继续有效。
- §14.8 的“A8/pager UX 跳过”对本节列出的 8 个已发布正确性/状态问题**不再适用**：用户要求把最新差距做成完整吸收计划，
  因而本节 17 项全部进入执行范围。视觉重设计、云 Dashboard 能力仍不借题扩张。

### 15.1 22 项审计结论：5 项已对齐，17 项进入执行

**已对齐，不再改代码（5）**：

| 上游项 | 本地证据/结论 |
|---|---|
| 后台 shell 命令显示实时任务行与流式输出 | 已有 `BgTaskState`、任务行与集中输出通道；行为等价 |
| Swift 三引号高亮 | `Swift.sublime-syntax` 已含 multiline string 规则，且 §14.8 的 last-wins 已落地 |
| MCP 插件 manifest client-id 认证 | 托管 MCP/OAuth 路径已有 client-id 解析与认证测试 |
| 后台子代理 shell 权限请求可见 | `handle_permission_request` 能找到拥有者会话并排队，不再静默拒绝 |
| 队列行按 `y` 复制完整 prompt | `queue_pane.rs` 已有 GB-4151 行为与回归测试 |

**待吸收（17）**分为：内核/行为 9 项，UI/会话 8 项。执行时每项先用上游回归用例或等价最小测试证明红；
若测试直接为绿，则把该项更正为“已对齐”，不得为了追上游符号而制造重复实现。

### 15.2 批29：协议、配置与工具契约（P0，5 项）

> ✅ **批29 已落地（2026-09-20）**：提交 `d22a69eb`。mixed-case effort、prompt-suggest
> 预算与 `read_file` 整读策略原生实现；默认 agent 与 inline-only `use_tool` schema 由新增/加强回归证明
> 本地已对齐，未为追上游符号制造重复实现。Memory v2 未引入。

目标：先关闭不依赖复杂 pager 状态机的确定性缺口，为后续批次提供稳定配置和 schema。

| 项 | 原生落点 | 必须钉住的验收 |
|---|---|---|
| mixed-case `reasoning_effort` | `nofy-sampling-types::ReasoningEffort` 改为经现有 `FromStr` 的手写 `Deserialize`；序列化仍保持小写 | `xHigh`/`XHIGH`/`Medium` 可读，非法值仍报错，小写输出不变 |
| 默认 TUI agent 尊重 `[agent]` | TUI 启动解析链；仅在无 `--plan`/`--ask-user`/`--agent-profile` 时采用配置 | 优先级固定为 `definition > name > NOFY_AGENT > builtin`；所有 CLI 显式选择仍覆盖配置 |
| prompt-suggest 长回复不截半句 | `session/helpers/prompt_suggest.rs` 的 transcript 预算器 | 较旧消息仍受单条上限；最新 agent 回复使用剩余总预算；优先在单词/换行边界截断并带标记 |
| `read_file` 整读策略可部署配置 | `WholeReadPolicy { skill_markdown, instruction_files }` 进入 truncation 配置与 tools API 传播；识别 `AGENTS.md`/`CLAUDE.md`/local 变体 | 两个开关独立；默认保持当前整读；关闭后 offset/limit 生效；token 总上限不可绕过 |
| Messages 模型只收到 inline `use_tool` schema | 在 schema 导出处按宿主能力投影，不改变运行时对合法输入的校验 | 发给 Messages 的 schema 无 root union/文件分支；Responses/支持文件输入的宿主不被意外降级 |

`read_file` 的上游实现穿过 Memory v2 的 read policy；本地实现**不得因此引入 Memory v2**，只复用现有
gitignore、路径规范化和当前 memory v1 检查。`use_tool` 先做导出 schema 快照测试：若本地当前简单结构天然已是
inline-only，则登记“已对齐”并关闭该项，不搬上游的文件输入整层。

验证：`cargo test -p nofy-sampling-types`、`-p nofy-tools`、`-p nofy-tools-api`、
`-p nofy-shell --lib prompt_suggest`，再跑相关 crate 全量与 `cargo check --workspace --all-targets`。

### 15.3 批30：Hooks、信任与权限安全（P0，4 项）

> ✅ **批30 已落地（2026-09-20）**：提交 `749de458`。managed-only 在 dispatcher 执行边界强制，
> 托管 hook 不受用户 disabled 文件反向关闭；sandbox folder trust 的既有同进程续跑路径由回归钉住；
> 引号 filename 变量以保守 AST 恢复接入旧版 permission manager；权限卡长引号参数改为 quote-aware、显示宽度换行。
> GitNexus 提交前检查为 medium，唯一受影响流程是 `Spawn_session_actor → Managed_settings`，无意外高风险流程。

| 项 | 原生落点 | 必须钉住的验收 |
|---|---|---|
| `allow_managed_hooks_only` | requirements/托管策略解析 → hooks trust snapshot → discovery/dispatcher；非托管 hook 统一跳过 | pin 开启时 file/SDK 非托管 hook 均不执行，托管 hook 仍执行；disabled-hooks 文件不能反向放行 |
| `nofy --sandbox` 接受 folder trust 后不退出 | 在 ㉛ `GrantOutcome` 之上修正启动闸/命令完成信号生命周期 | 接受信任后同一进程继续创建会话；拒绝/失败仍按原语义停住；不得把失败当成功 |
| 引号包裹的 filename 变量遵守 bash 权限规则 | workspace bash parser/permission policy；按上游 filename-argument 测试移植思想 | `cmd "$file"`、空格路径、多个变量按配置规则放行/拒绝；不能退化成字符串拼接白名单 |
| 权限提示长引号参数可换行 | `nofy-pager::permission_view` 的参数分段/换行渲染 | 窄终端不裁切、不越界；引号与转义内容保持可读；选择行和 diff 展开不回归 |

本批涉及安全策略。实施前必须对实际编辑符号逐一跑 GitNexus upstream impact；任何 HIGH/CRITICAL 结果先在会话中
报告直接调用者、受影响流程和风险，再动代码。尤其禁止把“managed-only”降格为仅 UI 隐藏，它必须在执行边界强制。

验证：hooks、workspace permission、shell trust、pager-render/PTY 定向测试；再跑 `nofy-hooks`、`nofy-workspace`、
`nofy-shell`、`nofy-pager` 全量和 workspace check。

### 15.4 批31：模型、上下文与子代理收口（P1，3 项）

> ✅ **批31 已落地（2026-09-20）**：提交 `615c6019`。`/context` 先把 system/messages/overhead/free
> 归一为同一窗口分区，超量估算被封顶且 free 由余量派生；`/model` 只在进入 effort 阶段且用户尚未输入过滤词时
> 选中 live/catalog/default 推荐档，已有菜单选择继续优先；子会话 durable/legacy terminal 共用唯一收口函数，
> cancel、error、正常完成和重复通知均幂等退出 `Cancelling`，replay 不会误杀活跃轮次。
> 未修改 blast radius 为 CRITICAL 的 `SlashCommand` trait，而在 `SlashController` 内做 model-only 预选。

| 项 | 原生落点 | 必须钉住的验收 |
|---|---|---|
| `/context` 百分比合计 100% | token 分类引入/复用 `window_tokens`，显示层按同一分母与余量核算 | 常规、压缩后、工具占比高三组 golden 的各项之和恒为 100%；“已计入上项”不重复入账 |
| `/model` effort 菜单默认推荐档 | `ModelState::preselected_effort_option_for` + slash 参数预选；只在刚进入 effort 阶段生效 | 模型推荐档优先；当前模型已显式 effort 时保留当前选择；用户已输入过滤词时不抢焦点 |
| 子代理 overlay 不再卡 `Cancelling` | child turn terminal signal统一走 `turn_completion` 唯一出口，清理 overlay/agent state | cancel→child completed、cancel→child errored、重复 terminal 通知三条路径均最终关闭；幂等且不提前显示成功 |

验证：`nofy-pager` 单元/渲染测试、subagent ACP handler 测试、对应 PTY scenario；再跑 pager 全量。

实测：context 38/38、model state 16/16、slash 78/78、turn completion 64/64；pager 全量
8,065 passed / 8 failed / 6 ignored，失败清单与批前基线完全一致。pager-render 全量唯一一次近截止时间
tmux probe 超时，单测重跑通过；workspace all-targets exit 0。当前 PTY harness 没有可注入 child-session
durable terminal 的 fixture，因此这一条由 ACP handler 真实通知入口测试覆盖，没有伪造一个只测 UI 文案的 PTY 场景。

### 15.5 批32：Dashboard 与图片编辑状态（P1，4 项）

> ✅ **批32 已落地（2026-09-20）**：提交 `d9670002`。`ui.dashboard_preview` 已接入共享配置、
> 设置写入与即时 UI 状态；关闭时释放预览面板、下拉目标与视口占位。Pinned 行使用手工 rank → session id → row id
> 的稳定顺序，不再被活动时间或目录/状态分组扰动；未 pinned 行保持原有动态排序。Dashboard 发送后的 1 秒回声窗口
> 只吞掉紧随其后的空 Enter，不影响换行或后续真实输入。图片占位符与受控图片记录可在 kill/yank、stash/restore、
> history recall 间重新绑定；不可绑定占位符与不可读图片会给出 notice，且不会重复发送。

| 项 | 原生落点 | 必须钉住的验收 |
|---|---|---|
| `ui.dashboard_preview` | shared `UiConfig`、设置注册/写入、dashboard state/render；默认 `true` | 开/关即时反映；重启持久；关闭后布局不保留幽灵宽度 |
| pinned agents 活动变化不跳位 | dashboard 排序拆成稳定 pin rank 与动态 activity 展示 | 同一批刷新、跨批刷新、并列时间戳均保持 pin 顺序；非 pinned 排序不回归 |
| Dashboard 发送后立刻 Enter 不建空会话 | prompt origin/ack 与 dashboard dispatch 加发送代际或消费闸 | 快速双 Enter 只产生一个有内容会话；失败重试不吞掉用户输入；正常新建仍可用 |
| 图片跨 yank/undo/history 存活并报告丢失 | `prompt_widget::image_state` 将文本历史与图片引用一起做快照；notice 汇总不可发送项 | kill/yank、undo/redo、history recall 保留图片；失效/超限图片给用户 notice；成功图片不重复发送 |

这批只做上游已发布的状态正确性，不做 Dashboard 视觉重设计。图片状态是数据完整性问题，不能只补 notice；
同时必须防止撤销栈长期持有大图字节，优先保存受控引用/ID并复用既有生命周期。

验证：dashboard state/dispatch、prompt widget、image render 单元测试 + 两个 PTY 场景；`nofy-pager` 与
`nofy-pager-render` 全量。

### 15.6 批33：Mermaid 复杂标签与大图（P1，1 项）

> ✅ **批33 已落地（2026-09-20）**：提交 `b79e6cad`。仅提取上游 parser、layout、dagre bridge、
> SVG renderer 的最小行为差：支持 `:::class`、`classDef` 文本颜色、引号感知 shape 分隔符、`A & B --> C`
> 笛卡尔展开与可忽略 directive；没有整目录覆盖，也没有引入无行为意义的 Cargo 注释差异。新增复杂 class/ampersand
> 大图端到端 PNG/SVG 回归。GitNexus 不索引 `third_party/mermaid-to-svg`，该盲区由原生库 85 个测试、
> `nofy-mermaid` 66 个测试和 pager worker 36 个测试覆盖。

先从 `third_party/mermaid-to-svg` 的 parser、dagre layout、SVG renderer 三层提取上游最小行为差，不整目录覆盖。

- 复杂 label：HTML/引号/转义/多行文本必须被正确解析并转义到 SVG，不能出现双重转义或注入。
- 大尺寸：布局与 viewBox 使用同一边界；pager 打开路径不能因整数截断、固定画布或临时文件尺寸假设失败。
- 验证：移植/改写上游 `pure_engine` fixtures，增加复杂 label 与大图 golden；跑 mermaid crate、pager Mermaid worker、
  pager-render 全量。对生成 SVG 做结构断言，不用脆弱的整文件空白对比。

### 15.7 一次完成的执行顺序与提交边界

> ✅ **执行完成（2026-09-20）**：批29–33 均按独立提交完成，22 项中 5 项由回归证明原本已对齐，
> 17 项全部完成原生落地或等价行为闭环；没有“待核实”残项。Memory v2、xAI 云/登录/GCS、TOML 写回、
> MCP 协议钉版等既有有意分歧保持不变。最新一次 `git fetch upstream` 确认目标仍为 `4247f661`。

执行顺序固定为：**批29 → 批30 → 批31 → 批32 → 批33 → 总回归 → 台账回填**。

每批独立提交，允许在同一轮连续完成，但不得把五批 squash 成一个不可定位的提交。每批固定动作：

1. 读上游对应实现与测试，先写/移植最小红测试；若直接为绿，登记“已对齐”而不是改代码。
2. 编辑任何函数/类/方法前，对精确符号执行 `gitnexus impact --direction upstream` 并在会话报告 blast radius；
   HIGH/CRITICAL 必须先告警。
3. 原生实现，不恢复 Grok/xAI 品牌、云登录、Memory v2 或 TOML 写回。
4. 相关 crate 全量测试 + `cargo check --workspace --all-targets`；对关键行为做红绿变异验证并恢复绿。
5. 提交前执行 `gitnexus detect-changes`，确认只有预期符号/流程；只暂存本批文件，保护当前 desktop 未提交工作。
6. 中文提交信息；提交后把提交号、测试数字、已对齐/有意分歧写回 `docs/upstream-sync.md` 与本节。

完成定义：22 项中 5 项已有证据保持对齐，17 项全部达到“原生落地”或“回归测试证明已对齐”；不得留下
“待核实”。总回归至少覆盖 `nofy-sampling-types`、`nofy-tools(-api)`、`nofy-hooks`、`nofy-workspace`、
`nofy-shell`、`nofy-pager`、`nofy-pager-render`、Mermaid 与 workspace all-targets。

最终回归：`cargo check --workspace --all-targets` exit 0；批32 下 `nofy-pager` 为 8,080 passed / 8 failed /
6 ignored，8 个失败与批前基线完全相同；`nofy-pager-render` 为 1,053 passed / 1 failed / 2 ignored，唯一失败是
既有近 deadline 竞态且空载单测重跑通过。批33 下 `mermaid-to-svg` 85/85、`nofy-mermaid` 66/66、
pager Mermaid worker 36/36。批32 GitNexus 检测为 27 文件 / 127 符号 / 1 条预期 dispatch 流 / medium；
批33 为 6 文件 / 1 个索引内测试符号 / 0 流 / low（第三方目录为明确索引盲区）。

## 16. Unified Memory 完全整合（2026-09-21）

### 16.1 结果

原先排除的 Memory v2 已按后续用户决策完成能力级整合，但没有保留第二套记忆：运行时只有
`Arc<dyn MemoryService>`，主助手独占服务与写工具，子代理没有检索、捕获或修改入口。规范对象只有 Personal/Project
两种用户区域；SQLite 索引是可删除衍生物；未来知识来源只保留独立的 `KnowledgeBaseProvider` 接口边界，当前 composition
root 不实例化它。

Tasks 1–16 的落地提交依次为 `7a649055`、`430d4004`、`5ec36649`、`31768caa`、`71dea936`、
`a196da15`、`e2e2a2a8`、`ec37d93a`。Task 17 的架构、用户体验和验收证据位于：

- `crates/codegen/nofy-pager/docs/user-guide/13-memory.md`
- `docs/architecture/unified-memory.md`
- `docs/architecture/unified-memory-validation.md`

### 16.2 最终验证

- migration、公开服务体验、capture、consolidation、restart、forget/backup destruction、index rebuild 均由
  `nofy-memory` 全量集成套件在一次运行中覆盖；新增 SQLite busy 与 embedding provider failure 注入。
- 10k/100k observation-shaped index 的 release baseline 已执行并固化宽松阈值：startup <2 s、top-K <1 s、
  capture enqueue <250 ms、64-plan consolidation scheduling <5 s；本机实测全部显著低于阈值。
- `cargo check --workspace`、`nofy-memory`、`nofy-tools memory`、`nofy-shell memory`、`nofy-agent`、
  `nofy-pager --lib memory`、`nofy-telemetry memory`、`scripts/check-unified-memory.sh` 全部通过。
- `cargo fmt --all -- --check` 仍命中仓库既有的大量历史格式差异；不以本批名义机械重排全树。新增测试文件已
  rustfmt，`git diff --check` 作为改动集的空白校验。
- 最终 GitNexus 索引刷新成功（204,285 nodes / 432,873 edges / 300 flows）；staged 变更检测为 61 个索引符号、
  0 个受影响执行流、risk low。

## 17. 1.0.39–1.0.41 重新审计与吸收（2026-09-24）

### 17.1 审计基线

重新拉取并逐项比对 `upstream/main=f0e3be1100ef5252488e3be8bb0e91cf68d8c305`（2026-09-23）。
目标区间相对 1.0.38 只有 `07e35a3d`、`f0e3be11` 两个上游提交；不能以无共同祖先的 ahead/behind
数字代替功能审计。审计覆盖 changelog、实现、测试及 Nofy 等价路径，继续保持两项边界：不引入上游遥测，
不恢复已经明确淘汰的第二套记忆体系。

### 17.2 已完成批次

| 批次 | 结果 | 提交 |
|---|---|---|
| 34 | 压缩保留最后提示图片，并在停止回合时捕获一致状态 | `5a6bd968` |
| 35 | 收口子代理默认类型、配置与交互行为 | `934f9b6f` |
| 36 | 修复草稿撤销，兼容 MCP 参数形状 | `2bd2f17a` |
| 37 | 对齐模型 effort 命名/别名与每模型请求体上限 | `cc167122` |
| 38 | 阻塞子代理在取消父回合时转后台并写入真实工具结果；插话先回应用户，再继续未完成工作 | `879aac3e` |
| 39 | inline agent 完整定义随会话恢复与 fork 持久化 | `9afe69a0` |
| 40 | `agent.md` MCP 覆盖层统一接入创建、恢复、热重载、席位切换与子代理继承 | `284918da` |
| 41 | 子代理模型继承设置进入配置分层、设置 UI、会话快照、工具 schema 与执行边界 | `27565d17` |
| 42 | 冷恢复闭合崩溃中断回合，持久化终态并注入一次性模型提醒 | `830a1f57` |

批38 不增加遥测。取消路径在修复悬空工具调用前快照原状态，避免 actor 队列先完成修复后误武装重复的
`[Request interrupted]` 提醒。验证覆盖 coordinator handoff、cancel 21 项、chat-state 382 项、interjection 14 项。

### 17.3 批39：inline agent 完整持久化

> ✅ **批39 已落地（2026-09-24）**：Nofy 为内建定义补充 typed provenance；会话摘要继续兼容旧
> `agent_name`，仅对无内建、插件或磁盘来源的 client inline profile 同时持久化完整 `agent_profile`。
> 冷恢复优先使用该定义，模型/effort 的同名刷新不会把它退化成名称，fork 原样继承。损坏、孤立或名称不匹配的
> profile 安全降级为 named selection。验证覆盖 JSON 兼容、完整 prompt round-trip、同名刷新和真实 fork copy。

### 17.4 重新审计发现的剩余实质差距

> ✅ **批40 已落地（2026-09-24）**：disk/client/plugin/managed 合并仍是基础层，当前 agent 的
> `mcpServers` 最后按名称覆盖；named ref 从基础层解析，inline 同时兼容 ACP 与 Nofy map-keyed 配置。
> `McpState` 向 handle 发布当前 admitted 快照，显式 client 更新同步刷新 actor seed，因而热重载、A→B 席位切换和
> 后续子代理 fork 不再读 spawn-time 陈旧列表。插件 agent、未信任项目 agent、`enabled = false` 与 managed
> allow/deny 继续在统一物化边界阻断。未引入上游遥测，也未移除 Nofy 的 managed connector 注入。
> 定向验证为 overlay 6/6、MCP config update 15/15、插件继承 2/2、managed sync 1/1、`nofy-mcp`
> 全库 188/188；`cargo check --workspace --all-targets` 通过。全量检查同时反查并补齐批37 的 4 个
> `SamplerConfig::max_request_bytes` 测试构造器，以及批39 benchmark 对扁平 `agent_name` JSON 合约的兼容。

| 批次 | 差距 | 完成定义 |
|---|---|---|
| 40 | `agent.md` 的 `mcpServers` 尚未覆盖 session MCP 配置 | **已完成**：初始创建、恢复、重载、切换、fork 均使用当前 overlay；移除/替换无残留；失败有明确诊断 |
| 41 | 缺少 `subagent_model_inheritance` 用户设置 | **已完成**：开启时子代理锁定父模型并拒绝显式分叉；关闭时保留显式 model；requirements、环境变量、用户配置与设置 UI 使用同一分层，策略在会话创建时锁定 |
| 42 | 冷启动未为未闭合 turn 写入 crash-interrupted 标记 | **已完成**：只扫描 `events.jsonl` 尾部；仅 unmatched turn 生成一次 durable `TurnCompleted(interrupted)` 并补 `turn_ended`；正常完成、重复加载、缺字段和旧日志均不误报 |

### 17.5 changelog 最终逐项反查

| 版本 | 上游条目 | 结论 | Nofy 证据 |
|---|---|---|---|
| 1.0.39 | 子代理始终可用父模型并在会话开始时锁定 | 原生落地 | 批41 `27565d17`：配置分层、设置 UI、会话策略锁定、schema 隐藏与 shell 防御 |
| 1.0.39 | 早期图片跨多次压缩仍保留 | 原生落地 | 批34 `5a6bd968`：持久化图片路径与压缩重播种 |
| 1.0.39 | Task 省略类型时默认 general-purpose | 原生落地 | 批35 `934f9b6f`：工具 schema、提示词与执行端统一默认 |
| 1.0.39 | 辅助脚本、日志、PR 草稿放系统临时目录 | 原生落地 | 批35：系统提示词注入平台正确、带尾分隔符的 scratch 目录 |
| 1.0.39 | `read_file` 描述说明 SKILL/指令文件忽略 offset/limit | 原生落地 | 批35：`WholeReadPolicy` 驱动描述，避免文案与执行策略漂移 |
| 1.0.39 | effort 菜单来自模型 API，alias 继承 | 原生落地 | 批37 `cc167122`：API effort id/label/alias 统一解析与传播 |
| 1.0.39 | MCP 明确可判定的错误 JSON 形状自动修复 | 原生落地 | 批36 `2bd2f17a`：受约束的参数 coercion，不猜测歧义形状 |
| 1.0.39 | worktree capture 接受未初始化 submodule | 既有等价实现 | `nofy-fast-worktree` 对 porcelain submodule 条目显式跳过并有测试；workspace git 状态也默认 `--ignore-submodules` |
| 1.0.39 | Memory capture 不含 opaque reasoning | 既有等价实现 | 统一记忆 capture 只序列化真实 User/Assistant 项，reasoning/tool/system 均过滤；回归钉住该边界 |
| 1.0.39 | idle timeout 显示清晰错误 | 既有等价实现 | sampler 将 `IdleTimeout { elapsed_secs }` 格式化为用户可读持续时间，并有格式回归 |
| 1.0.39 | 最后用户提示的图片压缩后保留 | 原生落地 | 批34：最后提示图片 pin 与压缩资产回归 |
| 1.0.39 | custom/inline agent profile 跨恢复持久化 | 原生落地 | 批39 `9afe69a0`：完整 typed profile round-trip、异常降级、fork 继承 |
| 1.0.39 | general-purpose 子代理标签显示为 Subagent | 原生落地 | 批35：pager label 映射与测试 |
| 1.0.40 | miscellaneous fixes and updates | 既有等价实现 | 该 changelog 无独立可验收条目；其实现差异已按 1.0.39/1.0.41 的具体行为项及全区间代码反查覆盖，不建立不可验证任务 |
| 1.0.41 | 子代理模型继承设置 | 原生落地 | 批41 `27565d17` |
| 1.0.41 | 每模型请求体上限 | 原生落地 | 批37 `cc167122`：模型目录到 sampler/chat-state/image eviction 全链路 |
| 1.0.41 | 子代理 fullscreen 不显示多余 Dashboard 按钮 | 既有等价实现 | Nofy header/overlay 已按宿主视图决定 dashboard chrome，无该多余入口 |
| 1.0.41 | agent frontmatter MCP 覆盖配置并跨重载/切换保留 | 原生落地 | 批40 `284918da` |
| 1.0.41 | 欢迎页 Ctrl+P 立即打开命令面板 | 既有等价实现 | welcome `AppView` 直接路由 `CommandPalette`，已有输入回归 |
| 1.0.41 | Dashboard 聚焦 + New Agent | 既有等价实现 | dashboard 打开路径强制 new-session 模式并锚定 `+ New Agent` |
| 1.0.41 | crash-interrupted turn 显示明确终态 | 原生落地 | 批42 `830a1f57` |
| 1.0.41 | stash 后立即 Ctrl+Z 恢复 | 原生落地 | 批36 `2bd2f17a` |
| 1.0.41 | collapsed edit 覆盖 pinned expanded 默认 | 原生落地 | 批35 `934f9b6f` |
| 1.0.41 | 插话先获得可见回复再恢复旧任务 | 原生落地 | 批38 `879aac3e` |
| 1.0.41 | 取消阻塞 spawn_subagent 时子任务转后台 | 原生落地 | 批38：真实 handoff 状态回填原工具结果，不谎报未执行 |
| 1.0.41 | 保存 queued-prompt 编辑后焦点回 composer | 原生落地 | 批35 `934f9b6f` |
| 1.0.41 | TUI/stdio 的子代理启用判定一致 | 原生落地 | 批35：默认启用与显式 CLI/config/env 分层，只有 limits/models 的表不再误禁用 |
| 1.0.41 | effort 选择接受 label 与 id | 原生落地 | 批37 `cc167122` |

### 17.6 收口结论与有意分歧

批34–42 已完成，1.0.39–1.0.41 **28 个 changelog 行项目全部分类**：原生落地 21、既有等价实现 7、
待核实 0。批41 定向测试覆盖 schema、提示词、配置分层、执行防御和设置持久化；批42 中断检测 4/4，
`nofy-file-utils` + `nofy-shell --all-targets` 编译通过。批42 GitNexus 变更检测为 8 个已知符号、0 条受影响
执行流、risk low。

明确不吸收的仅是与本地体验无关的上游附属面：xAI 统一遥测/GCS turn-result 上传、xAI 登录/云服务。
崩溃恢复的本地用户语义（durable 终态、事件闭合、下一提示提醒）已完整保留；统一记忆继续只有 Nofy
`MemoryService` 一套，不重建并行 Memory v2。2026-09-24 最后一次 `git fetch upstream` 后头仍为
`f0e3be11`，无 1.0.42 changelog，也没有新增待吸收批次。
