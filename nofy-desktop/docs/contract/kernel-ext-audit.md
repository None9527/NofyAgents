# 内核源码复核账（以内核代码为准，不依赖旧文档）

复核日期 2026-09-09。触发：PLAN.md 与 docs/contract/ 的多数引证来自逆向文档
（PORTING-PLAN / KERNEL-ACP-SURFACE / FRONTEND-FIRST-PRINCIPLES / nofy-tui-full-spec），
那些是**二手**。本轮把每条吃重的断言拿 `crates/` 源码重验一遍，按三类记账。

## 0. 方法：让「以源码为准」可重复，而不是一次性人工核

手工核一遍会过时，所以把证据做成**生成链 + 门禁**：

```
crates/codegen/**/*.rs  (2,424 个文件)
   │  scripts/extract-kernel-ext.ts
   ▼
packages/acp/schema/kernel-ext-usage.json     ← 证据件（入库，带 sitesSha256）
   │  scripts/gen-ext-names.ts
   ▼
packages/acp/src/generated/ext-names.ts       ← 生成物（带证据 sha256）
   │  src/methods.ts 的 satisfies 约束
   ▼
test/ext-classification.test.ts               ← 门禁（13 例）
```

stdlib 层同构，证据来自 ACP 官方 schema（Apache-2.0）：

```
agent-client-protocol-schema 0.11.4 的 generate.rs
   → schema/{schema,meta}.unstable.json → gen-wire-names.ts
   → src/generated/wire-names.ts → test/wire-names-drift.test.ts（10 例）
```

两级 npm script 分开：`gen` 用**已入库证据**离线重跑（CI 不需要内核树）；
`gen:refresh-evidence` 才需要 `crates/`。

### 提取判据（全部可在源码里指出）

| 维度 | 判据 | 出处 |
|---|---|---|
| 种类 | `ExtRequest::new(name,…)` = 请求（等响应）／`ExtNotification::new(name,…)` = 通知（fire-and-forget） | pager `effects/mod.rs:3332` 请求 vs `:1208` 通知，对照可读 |
| 方向 | 构造点在 `nofy-pager`（ACP 客户端＝TUI）还是其余 crate（agent 侧） | `nofy-pager` 经 `acp_channels()` 进程内嵌 `MvpAgent`，它就是客户端 |
| 冲突 | **内核侧优先**；两侧都构造 ⇒ 记入 `EXT_SIDE_SUPPRESSED` 供人工复核 | 见 §2.3 |
| 排除 | 同文件内 `#[cfg(test)]` 块（花括号配对剥离、等量换行填充以保行号） | 见 §3.2 |
| 兜底 | 分派侧证据：match 臂精确名 + `starts_with` 前缀族 + 枚举访问器 + 常量定义 | 见 §2.4 |

### 证据普查（本轮数字）

| 类 | 数量 |
|---|---|
| 客户端 → 内核 请求 | **42** |
| 客户端 → 内核 通知 | **9** |
| 内核 → 客户端 请求（必须应答） | **3** |
| 内核 → 客户端 事件 | **22** |
| 仅间接构造（枚举访问器/常量） | **28** |
| 仅分派侧有证据 | **82** |
| distinct 构造点名 | **76** |
| 分派侧精确名 / 前缀族 | **142 / 21** |

对照：ACP stdlib 权威表 agent **24** / client **11** / protocol **1**。

---

## 1. 源码确认（旧文档说对了，且现在有 file:line）

| 断言 | 源码出处 | 备注 |
|---|---|---|
| `session/cancel` 是 notification，不是 request（陷阱 T1） | `nofy-acp-lib/src/message.rs:387-391`：`acp_define_request_response!(acp::CancelNotification, (), session_cancel)`；枚举臂 `:407 Cancel(AcpArgsGeneric<acp::CancelNotification, S>)` | 响应类型是 `()`。旧文档结论对，但**理由**（-32601）只是实测；源码给的是类型级证据 |
| `turn_completed` 优于 `prompt_complete`（陷阱 T5） | `nofy-shell/src/session/acp_session_impl/turn_end.rs:324-334` | 理由比「legacy」硬：turn_completed 是 prompt_complete 的 **durable twin**，发在 persisted+replayed 轨上，让中途重附着的 viewer 从 replay 收尾而不卡在「Waiting…」。prompt_complete 是 fire-and-forget，**重连即丢** |
| turn_completed 不会对同一 prompt_id 重复发 | 同上 `:330-334` | 「emitting there would double-emit a terminal for the same prompt_id」，有 owned_completion 守卫 |
| 线上名带 `_` 前缀、内核分派时剥掉 | `acp_agent.rs:1087` 起的 match 全部匹配 `"nofy/…"`（无下划线） | 我们 `extMethodName()` 补前缀的做法正确 |
| 标准 `session/fork` 未实现、走扩展 | `acp_agent.rs:1120` 有 `"nofy/session/fork"`；`session/fork` 无分派 | 与我们 `AGENT_METHOD_UNIMPLEMENTED` + `EXT_REQUEST.sessionFork` 的双登记一致 |
| `agent stdio` 是内核为桌面指定的形态 | `nofy-shell/src/agent/app.rs:177`「set by **nofy-desktop** when spawning nofy agent stdio」 | headless(`:273`) 与 leader(`:288`) 均 bail 并指向 agent stdio |
| `$NOFY_HOME` 可用于隔离 | `nofy-config/src/paths.rs:35-41` | smoke 与恢复门已用 |
| 配置真源 config.json 优先、toml 遗留 | `nofy-config/src/loader.rs:41-52`；`nofy-shell/src/util/config/persist.rs:41,64-70` 格式感知写回 | 已回写 PLAN 裁定 C #5 |
| `WaitForTerminalExit` 第一方是拒绝 + 轮询 | `nofy-pager/src/acp/mod.rs` 的 `wait_for_exit_not_supported` | 我们照做（回 -32601） |
| `_nofy/mcp/upsert|delete|list` 是真客户端请求（裁定 C #5「优先走 RPC 写配置」的依据） | `extensions/mcp.rs:44-45` 常量 + pager `effects/mod.rs:2651,2688` 以 `ExtRequest::new` 发 | 旧文档说对了，本轮**升级为源码级证据** |

---

## 2. 源码矛盾（旧文档或我们的初版错了，已改）

### 2.1 `toggle_plan_mode` 与 `queue/*` 是**通知**，不是请求

旧 PORTING-PLAN §2.2 把 `nofy/queue/{remove,reorder,clear,edit,interject,hold_edit,release_edit}`
标为「通知形式」但归在「内核扩展方法（客户端→内核）」的请求族里，措辞含混；
我们初版把 `toggle_plan_mode` 明确归成请求。

源码判决：pager 用 `ExtNotification::new` 发它们——
`effects/mod.rs:1127`（toggle_plan_mode）、`:1209`（queue/edit），
失败只 `tracing::warn!("Failed to send … notification")`，**不解析响应**。

⇒ 已建 `EXT_NOTIFY` 独立表（9 条），drift 门钉死「toggle_plan_mode 与 queue/* 不得出现在 EXT_REQUEST」。
**后果若不改**：用 `rpc()` 发会等一个永不到来的响应——正是旧路 D13「sendText 恰好卡 30.0 秒」的失效形态。

### 2.2 `_nofy/replayed` 根本不是方法名，是 `_meta` 键

旧 seam（`acp-client.js` 与 `nofy-kernel-client.js`）都把它当通知方法并 emit `'replayed'` 事件，
我们照搬了。

源码判决：全树**无** `ExtNotification::new("nofy/replayed")`。它只以 `_meta["nofy/replayed"]`
存在于 pager **客户端侧**：
`app/acp_handler/follow_ups.rs:67`「reserved `_meta["nofy/replayed"] == true` marker
suppresses rendering」、`:80` `.and_then(|m| m.get("nofy/replayed"))`、
`app/agent_view/mod.rs:3081`「upstream by the `_meta["nofy/replayed"]` gate」。

⇒ 连接层的 `replayed` 事件与分派分支已删除；改为 `EXT_META_KEY.replayed`，
回放抑制由投影层读 `_meta` 键实现。`EXT_REMOVED` 表记录了移除理由，防止被加回来。
（PORTING-PLAN §2.1 在这一点上其实说对了——「TUI 客户端自己的约定，内核不打此标记」——
但旧 seam 的代码与它自相矛盾，我们继承了代码而不是结论。）

### 2.3 `_nofy/session/update` 的方向：内核侧优先规则

`nofy/session/update` 在**两侧**都有 `ExtNotification::new` 构造点：

- 内核侧 `nofy-shell/src/agent/mvp_agent/replay.rs:80,114` —— 这才是它上线的地方
  （`turn_end.rs:326` 称之为 persisted + replayed 轨）
- 客户端侧 `nofy-pager/src/app/acp_handler/subagent_lifecycle.rs:212` 与
  `subagent_activity.rs:112` —— pager **本地重建**同一形状以复用处理路径，不是线路方向

⇒ 逐点归桶会让它同时出现在 `EXT_CLIENT_NOTIFICATION` 与 `EXT_KERNEL_EVENT`，
消费者读前者会以为该由我们发出去。已实现「内核侧优先」去重，
被移出的名记入 `EXT_SIDE_SUPPRESSED`（当前 1 条）供人工复核。

### 2.4 「查无构造点」≠「不存在」——补分派侧证据

初版提取器只认字面量构造点，把 8 个我们实际在用的名字判成 UNSUPPORTED。
逐个复核后补了三类兜底证据：

| 名 | 真实身份 | 出处 |
|---|---|---|
| `session_summaries/{workspace_list, workspace_list_recent, session_list}` | 分派侧精确名 | `agent/handlers/session.rs:204,216`；且 smoke 实测 rpc() 拿到真响应（5 工作区 / 82 会话） |
| `session/state`、`session/load_history`、`session/updates` | 分派侧精确名 | `acp_agent.rs:1098,1104,1095` |
| `internal/reload_models` 等 8 个 `internal/*` | 枚举访问器（字面量在 `=>` **右侧**） | `extensions/session_admin.rs:58-59` |
| `mcp/elicit`、`mcp/sdk_call`、`sessions_changed`、`queue_changed` 等 28 个 | 常量定义 | `extensions/mcp.rs` 等 |

⇒ 生成表新增 `EXT_DISPATCH_ONLY`（82 名）与 `EXT_INDIRECT`（28 名）两类。
`git/*`、`fs/*`、`terminal/*`、`search/*`、`skills/*`、`subagent/*` 全族都在 DISPATCH_ONLY 里
——这才是真实能力面，比旧文档的 266 字面量计数可用得多。

### 2.5 `terminal/kill_command` → `terminal/kill`

上一轮 codegen 已抓到（把 Rust 变体名 `KillTerminalCommand` 反推成线路名）。
本轮由 `wire-names-drift.test.ts` 钉为回归门。

---

## 3. 复核方法论上踩的两个坑（记下来避免重犯）

### 3.1 `rg -r` 不是 recursive

`rg` 默认递归；`-r` 是 `--replace`。`rg -rn 'pattern' path` 会把匹配**替换成 "n"**，
输出看起来像正常结果但全是假的（本轮中招三次，一度把 `config.json` 读成 `n`、
把 `prompt_complete` 读成 `n`）。要限定文件类型用 `-g`，不要写 `-r`。

### 3.2 `#[cfg(test)]` 不能按「首次出现」截断

初版按首个 `#[cfg(test)]` 截断文件以排除测试。但
`nofy-pager/src/app/effects/mod.rs` 在**第 33、35 行**就有 `#[cfg(test)]`
（挂在小的 use/fn 上），截断把 1127（toggle_plan_mode）、1209（queue/edit）、
3333（rewind/points）这些真发送点全砍了——distinct 名从 78 掉到 23。
已改为**按条目花括号配对剥离**，并用等量换行填充以保住行号（证据件里的 file:line 才可信）。

同类假阳性：`nofy/session/updates` 的三个构造点全在 `session_updates.rs` 同文件的
`#[cfg(test)]` 块里，曾被误判为 kernelRequest。

---

## 4. 源码沉默（只有实测或只有旧文档支撑，登记备查）

| 断言 | 现状 | 处置 |
|---|---|---|
| `session/set_mode` 对非活跃会话**挂起**（陷阱 T4） | 仅 PORTING-PLAN 实测记载，本轮未在内核源码定位到该阻塞点 | 保留为陷阱；连接层对 set_mode 加超时后再采信 |
| 权限请求收到 cancel 时须全部应答 cancelled | 源码未找到内核侧的强制要求；旧文档记为客户端义务 | 我们照做（`cancel()` 已实现），但**视为客户端自律**而非协议要求 |
| `_nofy/follow_ups` 会不会发出 | 分派侧有名、**无任何发射点**；旧账称「净化内核从不发出」 | 已移入 `EXT_REMOVED`。要接必须先活体实测 |
| `authMethods` / `availableModels` 随配置动态 | 仅实测（真库 1 项 vs 空 home 0 项；模型 4 vs 1） | 已写入 initialize-measured.md §6.3，**不得当常量断言** |
| `promptCapabilities.image/audio = false` 是否随模型变 | 仅一次实测 | 录含 session/new 的夹具时复核（PLAN §11 #3 待办） |

---

## 5. 本轮对 PLAN 的影响

1. §2.2 的权威来源从 `KERNEL-ACP-SURFACE.md`（字面量计数）改为**生成表 + 本审计**。
2. 新增陷阱 **T13**：把 ext 通知当请求发（`toggle_plan_mode` / `queue/*`）。
3. 新增能力门登记：**`nofy/folderTrust.interactive`**——
   `folder_trust_prompt.rs:75` 的 `parse_interactive_trust_capability` 读
   `initialize.clientCapabilities._meta["nofy/folderTrust"].interactive`；
   我们未声明 ⇒ 内核不会发 `folder_trust/request`。
   应答形状 `{outcome:"trust"}`，且 `#[serde(other)]`（`:61`）使任何其它值解码为 Reject
   ⇒ **fail-closed，只有显式 trust 解锁**。要支持 GUI 信任提示必须先声明该能力。
   连接层已加防御性应答（回 `{outcome:"reject"}` 并告警），不再回 METHOD_NOT_FOUND。
4. 与 §4.1 的 `nofy/mcp/sdk` 并列，成为**第二个待裁定的能力门**。

