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

### 批25|1.0.12 集群(小)
context 估算(含 reasoning)与 rewind/模式切换后的 token 计数校正、压缩进度即时更新、worktree 创建跳过 stale reflog、MCP 瞬断重试、interjection 后子代理等待修复、权限提示友好化。跳过:credit upsell。

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
